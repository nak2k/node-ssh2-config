const { parseConfigLine } = require('./parseConfigLine');

function processConfig(file, result, options, data, callback) {
  const lines = data.split('\n');
  let line;

  const parseContext = {
    result,
    options,
    file,
    lineno: 0,
    ignore: false,
    error: null,
  };

  while((line = lines.shift()), line !== undefined) {
    parseContext.lineno++;

    parseConfigLine(line, parseContext);

    if (parseContext.error) {
      return callback(parseContext.error);
    }
  }

  return callback(null, result);
}

/*
 * Exports.
 */
exports.processConfig = processConfig;
