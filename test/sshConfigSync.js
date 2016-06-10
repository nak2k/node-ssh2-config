import test from 'tape';
import sshConfig from '../src';

test('test sshConfig.sync', t => {
  t.plan(2);

  const result = sshConfig.sync({ host: 'test' });

  t.equal(typeof result, 'object', 'result must be a object');

  const result2 = sshConfig.sync({
    host: 'test',
    preferSsh2: true,
  });

  t.equal(typeof result2, 'object', 'result2 must be a object');
});
