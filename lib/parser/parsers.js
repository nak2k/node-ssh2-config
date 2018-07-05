const {
  token, quotableToken, regex, quotable, option, choice,
  seq, many, map, mapFailure, matchPattern,
  itoken, quotableIToken,
} = require('./util');

const whiteSpace = regex(/\s+/);
const optWhiteSpace = option(whiteSpace);
const notWhiteSpace = regex(/\S+/);
const optEqual = option(token('='));

const argYesNo = mapFailure(
  choice(
    map(quotableIToken('yes'), true),
    map(quotableIToken('no'), false)
  ),
  "'yes' or 'no' must be specified");

const argYesNoAsk = mapFailure(
  choice(
    map(quotableIToken('yes'), true),
    map(quotableIToken('no'), false),
    quotableIToken('ask')
  ),
  "'yes', 'no', or 'ask' must be specified");

const argYesNoAskConfirm = mapFailure(
  choice(
    map(quotableIToken('yes'), true),
    map(quotableIToken('no'), false),
    quotableIToken('ask'),
    quotableIToken('confirm')
  ),
  "'yes', 'no', 'ask', or 'confirm' must be specified");

const argYesNoAlways = mapFailure(
  choice(
    map(quotableIToken('yes'), true),
    map(quotableIToken('no'), false),
    quotableIToken('always')
  ),
  "'yes', 'no', or 'always' must be specified");

const argInt = map(
  quotable(regex(/(0|0x)?\d+/)),
  value => parseInt(value, 0)
);

const argAny = quotable(regex(/[^\s"]+/));

const argOneHost = argAny;

const argHosts = many(
  map(
    seq(optWhiteSpace, argOneHost),
    values => values[1]
  ));

const keywordTable = [
  {
    keyword: 'Host',
    argParser: argHosts,
    handler: function(context, args) {
      const host = context.options.host || '';
      let matched;

      for(let i = 0; i < args.length; ++i) {
        let arg = args[i];
        let negate;

        if (arg[0] === '!') {
          negate = true;
          arg = arg.substr(1);
        }

        if (matchPattern(host, arg)) {
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
    keyword: 'AddKeysToAgent',
    argParser: argYesNoAskConfirm,
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
    keyword: 'CanonicalDomains',
    argParser: many(seq(optWhiteSpace, argAny)),
  },
  {
    keyword: 'CanonicalizeFallbackLocal',
    argParser: argYesNo,
  },
  {
    keyword: 'CanonicalizeHostname',
    argParser: argYesNoAlways,
  },
  {
    keyword: 'CanonicalizeMaxDots',
    argParser: argInt,
  },
  {
    keyword: 'CanonicalizePermittedCNAMEs',
    argParser: many(seq(optWhiteSpace, argAny)),
  },
  {
    keyword: 'CertificateFile',
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
    keyword: 'FingerprintHash',
    argParser: argAny,
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
    keyword: 'GSSAPIClientIdentity',
    argParser: argAny,
  },
  {
    keyword: 'GSSAPIDelegateCredentials',
    argParser: argYesNo,
  },
  {
    keyword: 'GSSAPIKeyExchange',
    argParser: argAny,
  },
  {
    keyword: 'GSSAPIRenewalForcesRekey',
    argParser: argYesNo,
  },
  {
    keyword: 'GSSAPIServerIdentity',
    argParser: argAny,
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
    keyword: 'HostbasedKeyTypes',
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
    keyword: 'IdentityAgent',
    argParser: argAny,
  },
  {
    keyword: 'IdentityFile',
    argParser: argAny,
  },
  {
    keyword: 'IgnoreUnknown',
    argParser: argAny,
  },
  {
    keyword: 'Include',
    argParser: many(seq(optWhiteSpace, argAny)),
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
    keyword: 'KexAlgorithms',
    argParser: argAny,
  },
  {
    keyword: 'KeychainIntegration',
    argParser: argYesNo,
  },
  {
    keyword: 'LocalCommand',
    argParser: argAny,
  },
  {
    keyword: 'LocalForward',
    argParser: seq(argAny, optWhiteSpace, argAny),
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
    argParser: many(seq(optWhiteSpace, argAny)),
  },
  {
    keyword: 'ProxyJump',
    argParser: argAny,
  },
  {
    keyword: 'ProxyUseFdpass',
    argParser: argYesNo,
  },
  {
    keyword: 'PubkeyAcceptedKeyTypes',
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
    argParser: seq(argAny, optWhiteSpace, argAny),
  },
  {
    keyword: 'RequestTTY',
    argParser: argAny,
  },
  {
    keyword: 'RevokedHostKeys',
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
    argParser: many(seq(optWhiteSpace, argAny)),
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
    keyword: 'StreamLocalBindUnlink',
    argParser: argYesNo,
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
    keyword: 'UpdateHostKeys',
    argParser: argYesNoAsk,
  },
  {
    keyword: 'UseKeychain',
    argParser: argYesNo,
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

const keyword = (keywordTable => (src, pos) => {
  const result = notWhiteSpace(src, pos);

  if (!result[0]) {
    return [false, "Keyword not found", pos];
  }

  const word = result[1];

  for(let i = 0; i < keywordTable.length; ++i) {
    const keywordInfo = keywordTable[i];

    if (word.toLowerCase() === keywordInfo.keyword.toLowerCase()) {
      result[1] = keywordInfo;
      return result;
    }
  }

  return [false, `Unknown keyword '${word}'`, pos];
})(keywordTable);

const separatorAfterKeyword = (parser => (src, pos) => {
  const result = parser(src, pos);
  const values = result[1];

  if (!values[0] && !values[1] && !values[2]) {
    return [false, "Either white spaces or an equal not exist after a keyword", pos];
  }

  return result;
})(seq(optWhiteSpace, optEqual, optWhiteSpace));

/*
 * Exports
 */
exports.whiteSpace = whiteSpace;
exports.optWhiteSpace = optWhiteSpace;
exports.notWhiteSpace = notWhiteSpace;
exports.optEqual = optEqual;
exports.argYesNo = argYesNo;
exports.argYesNoAsk = argYesNoAsk;
exports.argInt = argInt;
exports.argAny = argAny;
exports.argOneHost = argOneHost;
exports.argHosts = argHosts;
exports.keyword = keyword;
exports.separatorAfterKeyword = separatorAfterKeyword;
