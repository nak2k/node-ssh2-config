const test = require('tape');
const sshConfig = require('../lib');

test('test sshConfig', t => {
  sshConfig({ host: 'test' }, (err, result) => {
    t.end(err);
  });
});
