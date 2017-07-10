const { readFile } = require('fs');
const { processConfig } = require('./processConfig');

function parseConfigFile(file, result, options, callback) {
  readFile(file, { encoding: 'utf8' }, (err, data) => {
    if (err) {
      return callback(err);
    }

    processConfig(file, result, options, data, callback);
  });
}

/*
 * Exports.
 */
exports.parseConfigFile = parseConfigFile;
