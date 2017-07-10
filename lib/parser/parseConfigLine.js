const parsers = require('./parsers');

exports.parseConfigLine = parseConfigLine;

function parseConfigLine(line, context) {
  const result1 = parsers.optWhiteSpace(line, 0);

  if (result1[2] === line.length || line[result1[2]] === '#') {
    return;
  }

  const result2 = parsers.keyword(line, result1[2]);
  if (!result2[0]) {
    setError(context, result2);
    return;
  }

  const keywordInfo = result2[1];

  let result;

  result = parsers.separatorAfterKeyword(line, result2[2]);
  if (!result[0]) {
    setError(context, result);
    return;
  }

  result = keywordInfo.argParser(line, result[2]);
  if (!result[0]) {
    setError(context, result);
    return;
  }

  const args = result[1];

  if (keywordInfo.handler) {
    keywordInfo.handler(context, args);
  } else {
    if (!context.ignore && typeof(context.result[keywordInfo.keyword]) === 'undefined') {
      context.result[keywordInfo.keyword] = args;
    }
  }

  result = parsers.optWhiteSpace(line, result[2]);

  if (result[2] !== line.length) {
    setError(context, [false, "Extra arguments exist", result[2]]);
    return;
  }
}

function setError(context, result) {
  const msg = `${result[1]} (file: ${context.file} line: ${context.lineno} column: ${result[2] + 1})`;
  context.error = new Error(msg);
}
