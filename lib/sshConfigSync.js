const path = require('path');
const fs = require('fs');
const { homedir } = require('os');

const { parseConfigFileSync } = require('./parser');

exports.sshConfigSync = sshConfigSync;

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

function processConfigFilesSync(result, options) {
  if (options.userSpecificFile) {
    /*
     * Read a user-specific file only.
     */
    return parseConfigFileSync(options.userSpecificFile, result, options);
  } else {
    let p;

    /*
     * Read ~/.ssh/config
     */
    p = path.join(homedir(), '.ssh/config');

    if (fs.existsSync(p)) {
      parseConfigFileSync(p, result, options);
    }

    /*
     * Read /etc/ssh/ssh_config
     */
    p = '/etc/ssh/ssh_config';

    if (fs.existsSync(p)) {
      parseConfigFileSync(p, result, options);
    }

    return result;
  }
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
