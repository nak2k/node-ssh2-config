var parseConfigFile = require('./parseConfigFile');
var parseConfigLine = require('./parseConfigLine');
var passwd = require('etc-passwd');
var async = require('async');
var path = require('path');
var fs = require('fs');

exports = module.exports = sshConfig;
exports.sync = sshConfigSync;

function sshConfig(options, callback) {
  var result = options.result || {};

  if (options.commandLineOptions) {
    var err = processCommandLineOptions(options, result, callback);

    if (err) {
      return callback(err);
    }
  }

  processConfigFiles(result, options, function(err, result) {
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
  var result = options.result || {};

  if (options.commandLineOptions) {
    var err = processCommandLineOptions(options, result, callback);

    if (err) {
      throw err;
    }
  }

  var result = processConfigFilesSync(result, options);

  if (options.preferSsh2) {
    result = translateToSsh2(result, options, callback);
  }

  return result;
}

function processCommandLineOptions(options, result) {
  var commandLineOptions = options.commandLineOptions;
  var line;
  var parseContext = {
    result: result,
    options: options,
    file: null,
    lineno: 0,
    ignore: false,
    error: null,
  };

  if (Array.isArray(commandLineOptions)) {
    commandLineOptions = commandLineOptions.slice();
    while((line = commandLineOptions.shift())) {
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
      function(homeDir, callback) {
        var p = path.join(homeDir, '.ssh/config');

        if (fs.existsSync(p)) {
          parseConfigFile(p, result, options, callback);
        } else {
          callback(null, result);
        }
      },
      
      /*
       * Read /etc/ssh/ssh_config
       */
      function(result, callback) {
        var p = '/etc/ssh/ssh_config';

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
    var p;

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
  passwd.getUsers(function(err, users) {
    if (err) {
      return callback(err);
    }

    var uid = process.getuid();
    var u;

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
  var ssh2Config = {
    host: result.HostName || options.host,
    port: result.Port,
    username: result.User,
  };

  if (!result.IdentityFile) {
    return callback(null, ssh2Config);
  }

  async.waterfall([
    function(callback) {
      if (result.IdentityFile[0] !== '~') {
        return callback(null, result.IdentityFile);
      }

      if (result.IdentityFile[1] !== '/') {
        return callback(new Error('Not supported ~username'));
      }

      getHomeDirectory(function(err, homeDir) {
        if (err) {
          return callback(err);
        }

        callback(null, path.join(homeDir, result.IdentityFile.substr(2)));
      });
    },

    async.apply(fs.readFile),
  ], function(err, data) {
    if (err) {
      return callback(err);
    }

    ssh2Config.privateKey = data;

    callback(null, ssh2Config);
  });
}

function translateToSsh2Sync(result, options) {
  var ssh2Config = {
    host: result.HostName || options.host,
    port: result.Port,
    username: result.User,
  };

  if (!result.IdentityFile) {
    return ssh2Config;
  }

  var identityFilePath = result.IdentityFile;

  if (identityFilePath[0] === '~') {
    if (identityFilePath[1] !== '/') {
      throw new Error('Not supported ~username');
    }

    identityFilePath = path.join(process.env.HOME, identityFilePath.substr(2));
  }

  ssh2Config.privateKey = fs.readFileSync(identityFilePath);

  return ssh2Config;
}
