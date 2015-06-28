exports.token = token;
exports.quotableToken = quotableToken;
exports.regex = regex;
exports.quotable = quotable;
exports.option = option;
exports.choice = choice;
exports.seq = seq;
exports.many = many;
exports.map = map;
exports.mapFailure = mapFailure;

exports.matchPattern = matchPattern;

function token(str) {
  return function(src, pos) {
    if (src.substr(pos, str.length) === str) {
      return [true, str, pos + str.length];
    } else {
      return [false, null, pos];
    }
  };
}

function quotableToken(str) {
  return quotable(token(str));
}

function regex(regexp) {
  regexp = new RegExp('^' + regexp.source, regexp.ignoreCase ? 'i' : '');

  return function(src, pos) {
    var matches = src.substr(pos).match(regexp);
    if (matches) {
      return [true, matches[0], pos + matches[0].length];
    } else {
      return [false, null, pos];
    }
  };
}

function quotable(parser) {
  return function(src, pos) {
    if (src[pos] === '"') {
      var result = parser(src, pos + 1);
      if (!result[0]) {
        if (src[result[2]] === '"') {
          result[2]++;
          return result;
        } else {
          return [false, 'Quoted string not terminated', pos];
        }
      } else {
        return result;
      }
    } else {
      return parser(src, pos);
    }
  };
}

function option(parser) {
  return function(src, pos) {
    var result = parser(src, pos);
    if (result[0]) {
      return result;
    } else {
      return [true, null, pos];
    }
  };
}

function choice() {
  var parsers = arguments;

  return function(src, pos) {
    for(var i = 0; i < parsers.length; ++i) {
      var result = parsers[i](src, pos);
      if (result[0]) {
        return result;
      }
    }

    return [false, null, pos];
  };
}

function seq() {
  var parsers = arguments;

  return function(src, pos) {
    var values = [];

    for(var i = 0; i < parsers.length; ++i) {
      var result = parsers[i](src, pos);

      if (!result[0]) {
        return result;
      }

      values.push(result[1]);
      pos = result[2];
    }

    return [true, values, pos];
  };
}

function many(parser) {
  return function(src, pos) {
    var values = [];

    while(true) {
      var result = parser(src, pos);
      if (result[0]) {
        values.push(result[1]);
        pos = result[2];
      } else {
        return [true, values, pos];
      }
    }
  };
}

function map(parser, mapper) {
  if (typeof mapper !== 'function') {
    var value = mapper;
    mapper = function() { return value; }
  }

  return function(src, pos) {
    var result = parser(src, pos);
    
    if (result[0]) {
      result[1] = mapper(result[1]);
    }

    return result;
  };
}

function mapFailure(parser, mapper) {
  if (typeof mapper !== 'function') {
    var value = mapper;
    mapper = function() { return value; }
  }

  return function(src, pos) {
    var result = parser(src, pos);
    
    if (!result[0]) {
      result[1] = mapper(result[1]);
    }

    return result;
  };
}


function matchPattern(str, pattern) {
  var i = 0, j = 0;

  while(i < str.length && j < pattern.length) {
    var p = pattern[j];

    if (p === '?') {
      ++i, ++j;
      continue;
    } else if (p === '*') {
      ++i, ++j;

      if (j === pattern.length) {
        return true;
      }

      p = pattern[j];
      if (p === '?' || p === '*') {
        continue;
      }

      while(i < str.length && str[i] !== p) {
        ++i;
      }

      if (i === str.length) {
        return false;
      }

      continue;
    } else {
      if (str[i] !== p) {
        return false;
      }

      ++i, ++j;
      continue;
    }
  }

  return i > 0 && i === str.length && j === pattern.length;
}
