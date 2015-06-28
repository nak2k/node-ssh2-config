var parseConfigFile = require('./parseConfigFile');
var parseConfigLine = require('./parseConfigLine');
var passwd = require('etc-passwd');
var async = require('async');
var path = require('path');
var fs = require('fs');

module.exports = sshConfig;

function sshConfig(options, callback) {
  var result = options.result || {};
  var commandLineOptions = options.commandLineOptions;
  var line;
  var parseContext;

  if (commandLineOptions) {
    parseContext = {
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

    if (parseContext.error) {
      return callback(parseContext.error);
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
