const { sshConfig } = require('./sshConfig');
const { sshConfigSync } = require('./sshConfigSync');

sshConfig.sync = sshConfigSync;

module.exports = sshConfig;
