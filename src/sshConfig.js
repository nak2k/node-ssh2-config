import { parseConfigLine } from './parseConfigLine';
import parseConfigFile from './parseConfigFile';
import passwd from 'etc-passwd';
import async from 'async';
import path from 'path';
import fs from 'fs';

exports = module.exports = sshConfig;
exports.sync = sshConfigSync;

function sshConfig(options, callback) {
  const result = options.result || {};

  if (options.commandLineOptions) {
    const err = processCommandLineOptions(options, result);

    if (err) {
      return callback(err);
    }
  }

  processConfigFiles(result, options, (err, result) => {
    if (err) {
      return callback(err);
    }

    if (options.preferSsh2) {
      return translateToSsh2(result, options, callback);
    }

    return callback(null, result);
  });
}

function sshConfigSync(options) {
  let result = options.result || {};

  if (options.commandLineOptions) {
    const err = processCommandLineOptions(options, result);

    if (err) {
      throw err;
    }
  }

  result = processConfigFilesSync(result, options);

  if (options.preferSsh2) {
    result = translateToSsh2Sync(result, options);
  }

  return result;
}

function processCommandLineOptions(options, result) {
  const commandLineOptions = options.commandLineOptions;

  const parseContext = {
    result: result,
    options: options,
    file: null,
    lineno: 0,
    ignore: false,
    error: null,
  };

  if (Array.isArray(commandLineOptions)) {
    let line;

    const commandLineOptions2 = commandLineOptions.slice();
    while((line = commandLineOptions2.shift())) {
      parseConfigLine(line, parseContext);
      if (parseContext.error) {
        break;
      }
    };
  } else {
    parseConfigLine(commandLineOptions, parseContext);
  }

  return parseContext.error;
}

function processConfigFiles(result, options, callback) {
  if (options.userSpecificFile) {
    /*
     * Read a user-specific file only.
     */
    parseConfigFile(options.userSpecificFile, result, options, callback);
  } else {
    async.waterfall([
      getHomeDirectory,

      /*
       * Read ~/.ssh/config
       */
      (homeDir, callback) => {
        const p = path.join(homeDir, '.ssh/config');

        if (fs.existsSync(p)) {
          parseConfigFile(p, result, options, callback);
        } else {
          callback(null, result);
        }
      },

      /*
       * Read /etc/ssh/ssh_config
       */
      (result, callback) => {
        const p = '/etc/ssh/ssh_config';

        if (fs.existsSync(p)) {
          parseConfigFile(p, result, options, callback);
        } else {
          callback(null, result);
        }
      },
    ], callback);
  }
}

function processConfigFilesSync(result, options) {
  if (options.userSpecificFile) {
    /*
     * Read a user-specific file only.
     */
    return parseConfigFile.sync(options.userSpecificFile, result, options);
  } else {
    let p;

    /*
     * Read ~/.ssh/config
     */
    p = path.join(process.env.HOME, '.ssh/config');

    if (fs.existsSync(p)) {
      parseConfigFile.sync(p, result, options);
    }

    /*
     * Read /etc/ssh/ssh_config
     */
    p = '/etc/ssh/ssh_config';

    if (fs.existsSync(p)) {
      parseConfigFile.sync(p, result, options);
    }

    return result;
  }
}

function getHomeDirectory(callback) {
  passwd.getUsers((err, users) => {
    if (err) {
      return callback(err);
    }

    const uid = process.getuid();
    let u;

    while((u = users.shift())) {
      if (u.uid === uid) {
        return callback(null, u.home);
      }
    }

    if (process.env.HOME) {
      return callback(null, process.env.HOME);
    }

    callback(new Error('$HOME is not set'));
  });
}

function translateToSsh2(result, options, callback) {
  const ssh2Config = {
    host: result.HostName || options.host,
    port: result.Port,
    username: result.User,
  };

  if (!result.IdentityFile) {
    return callback(null, ssh2Config);
  }

  async.waterfall([
    callback => {
      if (result.IdentityFile[0] !== '~') {
        return callback(null, result.IdentityFile);
      }

      if (result.IdentityFile[1] !== '/') {
        return callback(new Error('Not supported ~username'));
      }

      getHomeDirectory((err, homeDir) => {
        if (err) {
          return callback(err);
        }

        callback(null, path.join(homeDir, result.IdentityFile.substr(2)));
      });
    },

    async.apply(fs.readFile),
  ], (err, data) => {
    if (err) {
      return callback(err);
    }

    ssh2Config.privateKey = data;

    callback(null, ssh2Config);
  });
}

function translateToSsh2Sync(result, options) {
  const ssh2Config = {
    host: result.HostName || options.host,
    port: result.Port,
    username: result.User,
  };

  if (!result.IdentityFile) {
    return ssh2Config;
  }

  let identityFilePath = result.IdentityFile;

  if (identityFilePath[0] === '~') {
    if (identityFilePath[1] !== '/') {
      throw new Error('Not supported ~username');
    }

    identityFilePath = path.join(process.env.HOME, identityFilePath.substr(2));
  }

  ssh2Config.privateKey = fs.readFileSync(identityFilePath);

  return ssh2Config;
}
