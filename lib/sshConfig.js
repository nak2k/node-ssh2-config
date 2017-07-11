const { parseConfigLine, parseConfigFile } = require('./parser');
const { homedir } = require('os');
const { join } = require('path');
const { readFile } = require('fs');

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
  const { commandLineOptions } = options;

  const parseContext = {
    result,
    options,
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
  /*
   * Read a user-specific file only.
   */
  if (options.userSpecificFile) {
    parseConfigFile(options.userSpecificFile, result, options, callback);
    return;
  }

  /*
   * Read ~/.ssh/config
   */
  const p = join(homedir(), '.ssh/config');

  parseConfigFile(p, result, options, (err, result) => {
    if (err && err.code !== 'ENOENT') {
      return callback(err);
    }

    /*
     * Read /etc/ssh/ssh_config
     */
    const p = '/etc/ssh/ssh_config';

    parseConfigFile(p, result, options, (err, result) => {
      if (err && err.code !== 'ENOENT') {
        return callback(err);
      }

      callback(null, result);
    });
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

  if (result.IdentityFile[0] !== '~') {
    return callback(null, result.IdentityFile);
  }

  if (result.IdentityFile[1] !== '/') {
    return callback(new Error('Not supported ~username'));
  }

  readFile(join(homedir(), result.IdentityFile.substr(2)), (err, data) => {
    if (err) {
      return callback(err);
    }

    ssh2Config.privateKey = data;

    callback(null, ssh2Config);
  });
}
