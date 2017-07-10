const test = require('tape');
const {
  quotableToken,
} = require('../lib/parser/util');

test('test quotableToken', t => {
  t.plan(7);

  const parser = quotableToken('token');
  let success, token, pos;

  /*
   * Parse a unquoted token.
   */
  [success, token, pos] = parser('token', 0);

  t.ok(success);
  t.equal(token, 'token');
  t.equal(pos, 5);

  /*
   * Parse a quoted token.
   */
  [success, token, pos] = parser('"token"', 0);

  t.ok(success);
  t.equal(token, 'token');
  t.equal(pos, 7);

  /*
   * Parse a unclosed quoatation.
   */
  [success, token, pos] = parser('"token', 0);

  t.equal(success, false);
});
