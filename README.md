# ScrapingTool

スクレイピングを簡単に行うためのツール


## Environment

- OS:
    - Ubuntu 18.04 LTS
    - Windows 10
- Node.js: 12.14.1
    - Yarn package manager: 1.21.1
    - Express web framework: 4.17.1
    - Nodemon: 2.0.2
        - ソースコード変更時に Express を毎回再起動するのは面倒なため導入
        - `node app/app.js` の代わりに `nodemon app/app.js` とするだけでソースコード変更時に Node プロセスを再起動するようになる

### Structure
```bash
./
|_ app/ # 作業ディレクトリ => docker://express:/home/node/app/
|   |_ api/     # API定義スクリプト格納ディレクトリ
|   |   |_ index.js   # /api/*
|   |
|   |_ lib/
|   |   |_ puppet.js  # puppeteerラッパーライブラリ
|   |
|   |_ public/  # 静的ホスティングディレクトリ
|   |   |_ js/
|   |   |   |_ (index.js) # Webpackバンドル後のJavaScriptファイル
|   |   |
|   |   |_ index.html # ドキュメントルート
|   |
|   |_ app.js   # Expressサーバ | http://localhost:3333
|
|_ src/    # Webpackソーススクリプト格納ディレクトリ
|   |_ App.vue  # Appコンポーネント
|   |_ index.js # Webpackソーススクリプト（エントリーポイント）
|
|_ package.json       # 必要な node_modules 設定
|_ webpack.config.js  # Webpackバンドル設定
```

### Setup
```bash
# install node_modules
$ yarn install

# npm scripts: start
## => concurrently で以下のコマンドを並列実行
##      $ webpack --watch --watch-poll: Webpackソース監視＆自動バンドル
##      $ nodemon app/app.js: app.js 実行＆ソース変更時、プロセス自動再起動
$ yarn start

## => http://localhost:3333
```

***

## API

### Open API
- node_modules:
    - swagger-ui-express
    - swagger-jsdoc
- reference: http://localhost:3333/spec/
