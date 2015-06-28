var fs = require('fs');
var parseConfigLine = require('./parseConfigLine');

module.exports = parseConfigFile;

function parseConfigFile(file, result, options, callback) {
  fs.readFile(file, { encoding: 'utf8' }, function(err, data) {
    if (err) {
      return callback(err);
    }

    var lines = data.split('\n');
    var line;
    var parseContext = {
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

    callback(null, result);
  });
}
