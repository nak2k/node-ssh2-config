var sshConfig = require('..').sync;

var result = sshConfig({ host: process.argv[2] });
console.log(result);
