var sshConfig = require('..');

sshConfig({ host: process.argv[2] }, function(err, result) {
  if (err) {
    throw err;
  }

  console.log(result);
});
