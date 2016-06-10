import test from 'tape';
import sshConfig from '../src';

test('test sshConfig.sync', t => {
  t.plan(1);

  const result = sshConfig.sync({ host: 'test' });

  t.equal(typeof result, 'object', 'result must be a object');
});
