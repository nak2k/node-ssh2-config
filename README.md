# ssh2-config

SSH config reader.

## Installation

```
npm i ssh2-config
```

## Usage

```
const sshConfig = require('ssh2-config');
const { Client } = require('ssh2');

sshConfig({ host: 'example.com', preferSsh2: true }, (err, result) => {
  const c = new Client();
  c.connect(result);
});
```

## sshConfig(options, callback)

### Parameters

- `options.host`
    - A string of the host name to read the setting.
- `options.commandLineOptions`
    - An array of options equivalent to `-o` of `ssh` command.
- `options.userSpecificFile`
    - A path of the configuration file to be read.
- `options.result`
    - The result that was read previously.
- `options.preferSsh2`
    - A boolean value as to whether to return the result corresponding to `ssh2` package.
- `callback(err, result)`
    - A callback called when setting loading is completed, or when an error occurs.

### Result

The `result` argument of `callback` changes properties of the object by `options.preferSsh2`.

If `options.preferSsh2` is truthy, the `result` has the following properties:

- `host`
- `port`
- `username`
- `privateKey`

## sshConfig.sync(options)

Synchronous version of `sshConfig`.

## License

MIT
