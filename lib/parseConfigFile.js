const fs = require('fs');
const { parseConfigLine } = require('./parseConfigLine');

exports = module.exports = parseConfigFile;
exports.sync = parseConfigFileSync;

function parseConfigFile(file, result, options, callback) {
  fs.readFile(file, { encoding: 'utf8' }, (err, data) => {
    if (err) {
      return callback(err);
    }

    processConfig(file, result, options, data, callback);
  });
}

function parseConfigFileSync(file, result, options) {
  const data = fs.readFileSync(file, { encoding: 'utf8' });

  return processConfig(file, result, options, data, (err, result) => {
    if (err) {
      throw err;
    }

    return result;
  });
}

function processConfig(file, result, options, data, callback) {
  const lines = data.split('\n');
  let line;

  const parseContext = {
    result: result,
    options: options,
    file: file,
    lineno: 0,
    ignore: false,
    error: null,
  };

  while((line = lines.shift()), typeof line !== 'undefined') {
    parseContext.lineno++;

    parseConfigLine(line, parseContext);

    if (parseContext.error) {
      return callback(parseContext.error);
    }
  }

  return callback(null, result);
}
