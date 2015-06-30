var test = require('tape');
var sshConfig = require('..').sync;

test('test sshConfig.sync', function (t) {
  t.plan(1);

  var result = sshConfig({ host: 'test' });

  t.equal(typeof result, 'object', 'result must be a object');
});
