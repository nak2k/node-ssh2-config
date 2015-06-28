var parsers = require('./parsers');

module.exports = parseConfigLine;

function parseConfigLine(line, context) {
  var result;

  result = parsers.optWhiteSpace(line, 0);

  if (result[2] === line.length || line[result[2]] === '#') {
    return;
  }

  result = parsers.keyword(line, result[2]);
  if (!result[0]) {
    setError(context, result);
    return;
  }

  var keywordInfo = result[1];

  result = parsers.separatorAfterKeyword(line, result[2]);
  if (!result[0]) {
    setError(context, result);
    return;
  }

  result = keywordInfo.argParser(line, result[2]);
  if (!result[0]) {
    setError(context, result);
    return;
  }

  var args = result[1];

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
  var msg = result[1] + ' (file: ' + context.file + ' line: ' + context.lineno + ' column: ' + (result[2] + 1) + ')';
  context.error = new Error(msg);
}
