const { readFileSync } = require('fs');
const { processConfig } = require('./processConfig');

function parseConfigFileSync(file, result, options) {
  const data = readFileSync(file, { encoding: 'utf8' });

  return processConfig(file, result, options, data, (err, result) => {
    if (err) {
      throw err;
    }

    return result;
  });
}

/*
 * Exports.
 */
exports.parseConfigFileSync = parseConfigFileSync;
