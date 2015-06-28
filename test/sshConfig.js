var test = require('tape');
var sshConfig = require('..');

test('test sshConfig', function (t) {
  sshConfig({ host: 'test' }, function(err, result) {
    t.end(err);
  });
});
