/*
 * Usage: node ssh [options] [user@]hostname
 */

var parseArgs = require('minimist');
var Client = require('ssh2').Client;
var sshConfig = require('..');

var opts = parseArgs(process.argv.slice(2));

if (opts._.length === 0) {
  console.log("node ssh [options] [user@]hostname");
  return;
}

var sshOptions = {
  preferSsh2: true,
  result: {},
};

if (opts.F) {
  sshOptions.userSpecificFile = opts.F;
}

if (opts.i) {
  sshOptions.result.IdentityFile = opts.i;
}

if (opts.l) {
  sshOptions.result.User = opts.l;
}

if (opts.p) {
  sshOptions.result.Port = parseInt(opts.p);
}

var host = opts._[0];
if (host.indexOf('@') >= 0) {
  var ss = host.split('@');
  sshOptions.result.User = ss[0];
  sshOptions.host = ss[1];
} else {
  sshOptions.host = host;
}

sshConfig(sshOptions, function(err, result) {
  if (err) {
    throw err;
  }

  console.log('SSH Config :', result);

  var c = new Client();

  c.on('ready', function() {
    console.log('ready');

    c.end();
  });

  c.on('error', function(err) {
    console.log('err:', err);
  });

  console.log('Connecting...');
  c.connect(result);
});
