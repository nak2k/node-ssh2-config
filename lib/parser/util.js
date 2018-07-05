const token = str => (src, pos) =>
  (src.substr(pos, str.length) === str
    ? [true, str, pos + str.length]
    : [false, null, pos]);

const itoken = str => {
  str = str.toLowerCase();

  return (src, pos) =>
    (src.substr(pos, str.length).toLowerCase() === str
      ? [true, str, pos + str.length]
      : [false, null, pos]);
};

const quotableToken = str => quotable(token(str))

const quotableIToken = str => quotable(itoken(str))

const regex = regexp => {
  const compiledRegexp = new RegExp('^' + regexp.source, regexp.ignoreCase ? 'i' : '');

  return (src, pos) => {
    const matches = src.substr(pos).match(compiledRegexp);

    return matches
      ? [true, matches[0], pos + matches[0].length]
      : [false, null, pos];
  };
}

const quotable = parser => (src, pos) => {
  if (src[pos] !== '"') {
    return parser(src, pos);
  }

  const result = parser(src, pos + 1);
  if (!result[0]) {
    return result;
  }

  if (src[result[2]] !== '"') {
    return [false, 'Quoted string not terminated', pos];
  }

  result[2]++;
  return result;
};

const option = parser => (src, pos) => {
  const result = parser(src, pos);
  if (result[0]) {
    return result;
  } else {
    return [true, null, pos];
  }
};

const choice = (...parsers) => (src, pos) => {
  for(let i = 0; i < parsers.length; ++i) {
    const result = parsers[i](src, pos);
    if (result[0]) {
      return result;
    }
  }

  return [false, null, pos];
};

const seq = (...parsers) => (src, pos) => {
  const values = [];

  for(let i = 0; i < parsers.length; ++i) {
    const result = parsers[i](src, pos);

    if (!result[0]) {
      return result;
    }

    values.push(result[1]);
    pos = result[2];
  }

  return [true, values, pos];
};

const many = parser => (src, pos) => {
  const values = [];

  while(true) {
    const result = parser(src, pos);

    if (!result[0]) {
      return [true, values, pos];
    }

    values.push(result[1]);
    pos = result[2];
  }
};

const map = (parser, mapper) => {
  if (typeof mapper !== 'function') {
    const value = mapper;
    mapper = () => value;
  }

  return (src, pos) => {
    const result = parser(src, pos);

    if (result[0]) {
      result[1] = mapper(result[1]);
    }

    return result;
  };
}

const mapFailure = (parser, mapper) => {
  if (typeof mapper !== 'function') {
    const value = mapper;
    mapper = () => value;
  }

  return (src, pos) => {
    const result = parser(src, pos);

    if (!result[0]) {
      result[1] = mapper(result[1]);
    }

    return result;
  };
}

const matchPattern = (str, pattern) => {
  let i = 0, j = 0;

  while(i < str.length && j < pattern.length) {
    let p = pattern[j];

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

/*
 * Exports.
 */
exports.token = token;
exports.itoken = itoken;
exports.quotableToken = quotableToken;
exports.quotableIToken = quotableIToken;
exports.regex = regex;
exports.quotable = quotable;
exports.option = option;
exports.choice = choice;
exports.seq = seq;
exports.many = many;
exports.map = map;
exports.mapFailure = mapFailure;
exports.matchPattern = matchPattern;
