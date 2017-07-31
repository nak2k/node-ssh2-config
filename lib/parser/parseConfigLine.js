const {
  optWhiteSpace,
  keyword,
  separatorAfterKeyword,
} = require('./parsers');

exports.parseConfigLine = parseConfigLine;

function parseConfigLine(line, context) {
  /*
   * Skip white spaces at beginning of line.
   */
  const result1 = optWhiteSpace(line, 0);

  if (result1[2] === line.length || line[result1[2]] === '#') {
    return;
  }

  /*
   * Parse each keywords.
   */
  const result2 = keyword(line, result1[2]);

  if (!result2[0]) {
    setError(context, result2);
    return;
  }

  const keywordInfo = result2[1];

  /*
   * Skip a separator after the keyword.
   */
  const result3 = separatorAfterKeyword(line, result2[2]);

  if (!result3[0]) {
    setError(context, result3);
    return;
  }

  /*
   * Parse arguments.
   */
  const result4 = keywordInfo.argParser(line, result3[2]);

  if (!result4[0]) {
    setError(context, result4);
    return;
  }

  const args = result4[1];

  if (keywordInfo.handler) {
    keywordInfo.handler(context, args);
  } else {
    if (!context.ignore && context.result[keywordInfo.keyword] === undefined) {
      context.result[keywordInfo.keyword] = args;
    }
  }

  /*
   * Skip white spaces at end of line.
   */
  const result5 = optWhiteSpace(line, result4[2]);

  /*
   * If rest tokens exist, it means unnecessary arguments exist for the keyword.
   */
  if (result5[2] !== line.length) {
    setError(context, [false, "Extra arguments exist", result5[2]]);
    return;
  }
}

function setError(context, result) {
  const msg = `${result[1]} (file: ${context.file} line: ${context.lineno} column: ${result[2] + 1})`;
  context.error = new Error(msg);
}
