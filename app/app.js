const express = require('express');
const app     = express();
const swaggerUI    = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

// ※ Express 4.16 以降、Body-Parser機能は標準搭載されている
// ※ 4.16 未満のバージョンを使っている場合は、別途 body-parser パッケージのインストールが必要
app.use(express.json()); // クライアントデータを JSON 形式で取得可能にする
app.use(express.urlencoded({ extended: true })); // 配列型のフォームデータを取得可能にする

// Swagger UI ルーティング: /spec/
app.use('/spec/', swaggerUI.serve, swaggerUI.setup(swaggerJSDoc({
  swaggerDefinition: {
    info: {
      title: 'puppeteer API',
      version: '1.0.0',
    },
  },
  apis: [`${__dirname}/api/*`]
})));

// API ルーティング: /api/* => ./api/index.js
app.use('/api/', require('./api/index'));

// CORS対応
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, access_token'
  );
  // intercept OPTIONS method
  if ('OPTIONS' === req.method) {
    res.send(200);
  } else {
    next();
  }
});

// 静的ファイルホスティング: /* => ./public/*
app.use('/', express.static(`${__dirname}/public`));

// ポート番号: $EXPRESS_PORT 環境変数 or 3333
const port = process.env.EXPRESS_PORT || 3333;

// サーバ実行
console.log(`Serving on http://localhost:${port}`);
app.listen(port);
