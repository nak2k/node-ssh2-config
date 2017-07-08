# ssh2-config

ssh config ファイルの読み込みパッケージ。

## Installation

```
npm i ssh2-config -S
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
    - 設定を読み込む対象となるホスト名の文字列。
- `options.commandLineOptions`
    - `ssh` コマンドの `-o` 相当のオプションの配列。
- `options.userSpecificFile`
    - 読み込み対象となる設定ファイルのパス。
- `options.result`
    - 以前に読み込んだ結果を指定する。
- `options.preferSsh2`
    - `ssh2` パッケージの形式で結果を返すかどうかの真偽値。
- `callback(err, result)`
    - 設定の読み込みが完了した時、あるいはエラーが起きた時に呼ばれるコールバック。

### Result

`callback` の `result` 引数は、`options.preferSsh2` によって返すオブジェクトのプロパティが変わる。

`options.preferSsh2` が `true` の時は、`result` は以下のプロパティを持つ。

- `host`
- `port`
- `username`
- `privateKey`

## sshConfig.sync(options)

`sshConfig` の同期バージョン。

## License

MIT
