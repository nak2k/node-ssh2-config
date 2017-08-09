const test = require('tape');
const { parseConfigLine } = require('../lib/parser');

test('test LocalForward', t => {
  t.plan(3);

  const line = 'LocalForward  80 localhost:80';
  const context = { result: {} };

  parseConfigLine(line, context);

  t.error(context.error);
  t.notEqual(context.result.LocalForward, undefined);
  t.equal(context.result.LocalForward.length, 3);
});

test('test ProxyCommand', t => {
  t.plan(3);

  const line = 'ProxyCommand ssh -W %h:%p host';
  const context = { result: {} };

  parseConfigLine(line, context);

  t.error(context.error);
  t.notEqual(context.result.ProxyCommand, undefined);
  t.equal(context.result.ProxyCommand.length, 4);
});

test('test RemoteForward', t => {
  t.plan(3);

  const line = 'RemoteForward  80 localhost:80';
  const context = { result: {} };

  parseConfigLine(line, context);

  t.error(context.error);
  t.notEqual(context.result.RemoteForward, undefined);
  t.equal(context.result.RemoteForward.length, 3);
});
