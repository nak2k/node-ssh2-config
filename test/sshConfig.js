import test from 'tape';
import sshConfig from '../src';

test('test sshConfig', t => {
  sshConfig({ host: 'test' }, (err, result) => {
    t.end(err);
  });
});
