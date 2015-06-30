# ssh2-config

SSH config reader.

## Example

```
var sshConfig = require('ssh2-config');
var Client = require('ssh2').Client;

sshConfig({ host: 'example.com', preferSsh2: true }, function(err, result) {
  var c = new Clinet();
  c.connect(result);
});
```

## API

### sshConfig(options, callback)

* `options.host` - 
* `options.commandLineOptions` - 
* `options.userSpecificFile` -
* `options.result` -
* `options.preferSsh2` -
* `callback(err, result)` -

### sshConfig.sync(options)

Synchronous version of `sshConfig`.

## TODO

## License

MIT
