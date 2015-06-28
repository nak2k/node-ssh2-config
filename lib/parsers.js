var util = require('./util');

var token = util.token;
var quotableToken = util.quotableToken;
var regex = util.regex;
var quotable = util.quotable;
var option = util.option;
var choice = util.choice;
var seq = util.seq;
var many = util.many;
var map = util.map;
var mapFailure = util.mapFailure;

var whiteSpace = exports.whiteSpace = regex(/\s+/);
var optWhiteSpace = exports.optWhiteSpace = option(whiteSpace);
var notWhiteSpace = exports.notWhiteSpace = regex(/\S+/);
var optEqual = exports.optEqual = option(token('='));

var argYesNo = exports.argYesNo = mapFailure(
  choice(
    map(quotableToken('yes'), true),
    map(quotableToken('no'), false)
  ),
  "'yes' or 'no' must be specified");

var argYesNoAsk = exports.argYesNo = mapFailure(
  choice(
    map(quotableToken('yes'), true),
    map(quotableToken('no'), false),
    quotableToken('ask')
  ),
  "'yes', 'no', or 'ask' must be specified");

var argInt = exports.argInt = map(
  quotable(regex(/(0|0x)?\d+/)),
  function(value) {
    return parseInt(value, 0);
  });

var argAny = exports.argAny = quotable(regex(/[^\s"]+/));

var argOneHost = exports.argOneHost = argAny;

var argHosts = exports.argHosts = many(
  map(
    seq(optWhiteSpace, argOneHost),
    function(values) {
      return values[1];
    }
  ));

var keywordTable = [
  {
    keyword: 'Host',
    argParser: argHosts,
    handler: function(context, args) {
      var host = context.options.host || '';
      var matched;

      for(var i = 0; i < args.length; ++i) {
        var arg = args[i];
        var negate;

        if (arg[0] === '!') {
          negate = true;
          arg = arg.substr(1);
        }

        if (util.matchPattern(host, arg)) {
          matched = true;
          if (negate) {
            context.ignore = true;
            return;            
          } else {
            context.ignore = false;
          }
        }
      }

      if (!matched) {
        context.ignore = true;
      }
    },
  },
  {
    keyword: 'AddressFamily',
    argParser: argAny,
  },
  {
    keyword: 'AskPassGUI',
    argParser: argAny,
  },
  {
    keyword: 'BatchMode',
    argParser: argYesNo,
  },
  {
    keyword: 'BindAddress',
    argParser: argAny,
  },
  {
    keyword: 'ChallengeResponseAuthentication',
    argParser: argYesNo,
  },
  {
    keyword: 'CheckHostIP',
    argParser: argYesNo,
  },
  {
    keyword: 'Cipher',
    argParser: argAny,
  },
  {
    keyword: 'Ciphers',
    argParser: argAny,
  },
  {
    keyword: 'ClearAllForwardings',
    argParser: argYesNo,
  },
  {
    keyword: 'Compression',
    argParser: argYesNo,
  },
  {
    keyword: 'CompressionLevel',
    argParser: argAny,
  },
  {
    keyword: 'ConnectionAttempts',
    argParser: argAny,
  },
  {
    keyword: 'ConnectTimeout',
    argParser: argAny,
  },
  {
    keyword: 'ControlMaster',
    argParser: argAny,
  },
  {
    keyword: 'ControlPath',
    argParser: argAny,
  },
  {
    keyword: 'ControlPersist',
    argParser: argAny,
  },
  {
    keyword: 'DynamicForward',
    argParser: argAny,
  },
  {
    keyword: 'EnableSSHKeysign',
    argParser: argYesNo,
  },
  {
    keyword: 'EscapeChar',
    argParser: argAny,
  },
  {
    keyword: 'ExitOnForwardFailure',
    argParser: argYesNo,
  },
  {
    keyword: 'ForwardAgent',
    argParser: argYesNo,
  },
  {
    keyword: 'ForwardX11',
    argParser: argYesNo,
  },
  {
    keyword: 'ForwardX11Timeout',
    argParser: argAny,
  },
  {
    keyword: 'ForwardX11Trusted',
    argParser: argYesNo,
  },
  {
    keyword: 'GatewayPorts',
    argParser: argAny,
  },
  {
    keyword: 'GlobalKnownHostsFile',
    argParser: argAny,
  },
  {
    keyword: 'GSSAPIAuthentication',
    argParser: argAny,
  },
  {
    keyword: 'GSSAPIKeyExchange',
    argParser: argAny,
  },
  {
    keyword: 'GSSAPIClientIdentity',
    argParser: argAny,
  },
  {
    keyword: 'GSSAPIServerIdentity',
    argParser: argAny,
  },
  {
    keyword: 'GSSAPIDelegateCredentials',
    argParser: argYesNo,
  },
  {
    keyword: 'GSSAPIRenewalForcesRekey',
    argParser: argYesNo,
  },
  {
    keyword: 'GSSAPITrustDns',
    argParser: argYesNo,
  },
  {
    keyword: 'HashKnownHosts',
    argParser: argAny,
  },
  {
    keyword: 'HostbasedAuthentication',
    argParser: argAny,
  },
  {
    keyword: 'HostKeyAlgorithms',
    argParser: argAny,
  },
  {
    keyword: 'HostKeyAlias',
    argParser: argAny,
  },
  {
    keyword: 'HostName',
    argParser: argAny,
  },
  {
    keyword: 'IdentitiesOnly',
    argParser: argYesNo,
  },
  {
    keyword: 'IdentityFile',
    argParser: argAny,
  },
  {
    keyword: 'IPQoS',
    argParser: argAny,
  },
  {
    keyword: 'KbdInteractiveAuthentication',
    argParser: argYesNo,
  },
  {
    keyword: 'KbdInteractiveDevices',
    argParser: argAny,
  },
  {
    keyword: 'KeychainIntegration',
    argParser: argYesNo,
  },
  {
    keyword: 'KexAlgorithms',
    argParser: argAny,
  },
  {
    keyword: 'LocalCommand',
    argParser: argAny,
  },
  {
    keyword: 'LocalForward',
    argParser: argAny,
  },
  {
    keyword: 'LogLevel',
    argParser: argAny,
  },
  {
    keyword: 'MACs',
    argParser: argAny,
  },
  {
    keyword: 'NoHostAuthenticationForLocalhost',
    argParser: argYesNo,
  },
  {
    keyword: 'NumberOfPasswordPrompts',
    argParser: argAny,
  },
  {
    keyword: 'PasswordAuthentication',
    argParser: argYesNo,
  },
  {
    keyword: 'PermitLocalCommand',
    argParser: argYesNo,
  },
  {
    keyword: 'PKCS11Provider',
    argParser: argAny,
  },
  {
    keyword: 'Port',
    argParser: argInt,
  },
  {
    keyword: 'PreferredAuthentications',
    argParser: argAny,
  },
  {
    keyword: 'Protocol',
    argParser: argAny,
  },
  {
    keyword: 'ProxyCommand',
    argParser: argAny,
  },
  {
    keyword: 'PubkeyAuthentication',
    argParser: argAny,
  },
  {
    keyword: 'RekeyLimit',
    argParser: argAny,
  },
  {
    keyword: 'RemoteForward',
    argParser: argAny,
  },
  {
    keyword: 'RequestTTY',
    argParser: argAny,
  },
  {
    keyword: 'RhostsRSAAuthentication',
    argParser: argAny,
  },
  {
    keyword: 'RSAAuthentication',
    argParser: argAny,
  },
  {
    keyword: 'SendEnv',
    argParser: argAny,
  },
  {
    keyword: 'ServerAliveCountMax',
    argParser: argAny,
  },
  {
    keyword: 'ServerAliveInterval',
    argParser: argAny,
  },
  {
    keyword: 'StrictHostKeyChecking',
    argParser: argYesNoAsk,
  },
  {
    keyword: 'TCPKeepAlive',
    argParser: argYesNo,
  },
  {
    keyword: 'Tunnel',
    argParser: argYesNo,
  },
  {
    keyword: 'TunnelDevice',
    argParser: argAny,
  },
  {
    keyword: 'UsePrivilegedPort',
    argParser: argYesNo,
  },
  {
    keyword: 'User',
    argParser: argAny,
  },
  {
    keyword: 'UserKnownHostsFile',
    argParser: argAny,
  },
  {
    keyword: 'VerifyHostKeyDNS',
    argParser: argYesNoAsk,
  },
  {
    keyword: 'VisualHostKey',
    argParser: argYesNo,
  },
  {
    keyword: 'XAuthLocation',
    argParser: argAny,
  },
];

exports.keyword = (function (keywordTable) {
  return function(src, pos) {
    var result = notWhiteSpace(src, pos);

    if (!result[0]) {
      return [false, "Keyword not found", pos];
    }

    var word = result[1];

    for(var i = 0; i < keywordTable.length; ++i) {
      var keywordInfo = keywordTable[i];

      if (word.toLowerCase() === keywordInfo.keyword.toLowerCase()) {
        result[1] = keywordInfo;
        return result;
      }
    }

    return [false, "Unknown keyword '" + word + "'", pos];
  };
})(keywordTable);

exports.separatorAfterKeyword = (function() {
  var parser = seq(optWhiteSpace, optEqual, optWhiteSpace);
  
  return function(src, pos) {
    var result = parser(src, pos);
    var values = result[1];

    if (!values[0] && !values[1] && !values[2]) {
      return [false, "Either white spaces or an equal not exist after a keyword", pos];
    }

    return result;
  };
})();
