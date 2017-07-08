const { parseConfigLine } = require('./parseConfigLine');
const parseConfigFile = require('./parseConfigFile');
const { homedir } = require('os');
const path = require('path');
const fs = require('fs');
const waterfall = require('run-waterfall');

exports.sshConfig = sshConfig;

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
    waterfall([
      /*
       * Read ~/.ssh/config
       */
      callback => {
        const p = path.join(homedir(), '.ssh/config');

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

function translateToSsh2(result, options, callback) {
  const ssh2Config = {
    host: result.HostName || options.host,
    port: result.Port,
    username: result.User,
  };

  if (!result.IdentityFile) {
    return callback(null, ssh2Config);
  }

  waterfall([
    callback => {
      if (result.IdentityFile[0] !== '~') {
        return callback(null, result.IdentityFile);
      }

      if (result.IdentityFile[1] !== '/') {
        return callback(new Error('Not supported ~username'));
      }

      callback(null, path.join(homedir(), result.IdentityFile.substr(2)));
    },

    fs.readFile,
  ], (err, data) => {
    if (err) {
      return callback(err);
    }

    ssh2Config.privateKey = data;

    callback(null, ssh2Config);
  });
}
