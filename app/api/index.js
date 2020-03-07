/**
 * /api/
 */
const express = require('express');
const router = express.Router();
const puppet = require('../lib/puppet');

/**
 * POST /api/puppet/ => Puppeteer起動
 * @request {option}: Puppeteer起動オプション
 * @response {result: boolean}
 */
router.post('/puppet/', async (req, res) => {
  res.status(201).json({
    result: await puppet.launch(req.body)
  });
});

/**
 * DELETE /api/puppet/ => Puppeteer終了
 */
router.delete('/puppet/', async (req, res) => {
  await puppet.terminate();
  res.json({
    message: 'Puppeteer terminated'
  });
});

/**
 * PUT /api/puppet/ => Puppeteer URL移動
 * @request {url: string}
 * @request {username: string}: Basic認証が必要な場合に指定
 * @request {password: string}: Basic認証が必要な場合に指定
 * @response {response: object}
 */
router.put('/puppet/', async (req, res) => {
  const page = await puppet.page();
  if (typeof req.body !== 'object' || typeof req.body.url !== 'string') {
    return res.status(400).json({
      message: 'request must contain `url` param'
    });
  }
  if (typeof req.body.username === 'string' && typeof req.body.password === 'string') {
    await page.setExtraHTTPHeaders({
      Authorization: `Basic ${new Buffer(`${req.body.username}:${req.body.password}`).toString('base64')}`
    });
  }
  const resp = await page.goto(req.body.url, {waitUntil: 'domcontentloaded'});
  res.status(200).json({
    response: resp.headers()
  });
});

/**
 * GET /api/puppet/screenshot/ => Puppeteerスクリーンショット撮影
 * @response {base64: string}: 画像データをbase64エンコードした値
 */
router.get('/puppet/screenshot/', async (req, res) => {
  const page = await puppet.page();
  res.status(200).json({
    base64: await page.screenshot({encoding: 'base64'})
  });
});

// export
module.exports = router;
