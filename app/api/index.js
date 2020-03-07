/**
 * /api/
 */
const express = require('express');
const router = express.Router();
const puppet = require('../lib/puppet');

/**
 * @swagger
 * /api/puppet/:
 *   post:
 *     description: Puppeteer起動
 *     parameters:
 *       - name: option
 *         in: body
 *         description: Puppeteer起動オプション
 *         required: false
 *         type: object
 *     responses:
 *       201:
 *         description: 起動に成功
 *       500:
 *         description: 起動に失敗
 */
router.post('/puppet/', async (req, res) => {
  if (await puppet.launch(req.body)) {
    return res.status(201).send();
  }
  res.status(500).send();
});

/**
 * @swagger
 * /api/puppet/:
 *   delete:
 *     description: Puppeteer終了
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Puppeteer終了
 */
router.delete('/puppet/', async (req, res) => {
  await puppet.terminate();
  res.status(200).send();
});

/**
 * @swagger
 * /api/puppet/:
 *   put:
 *     description: URL移動
 *     parameters:
 *       - name: url
 *         in: formData
 *         description: 移動先URL
 *         required: true
 *         type: string
 *       - name: username
 *         in: formData
 *         description: Basic認証する場合のユーザ名
 *         required: false
 *         type: string
 *       - name: password
 *         in: formData
 *         description: Basic認証する場合のパスワード
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: 移動完了
 *         examples:
 *           response: "{レスポンスヘッダ}"
 *       400:
 *         description: urlが指定されていない
 *       500:
 *         description: エラー発生
 */
router.put('/puppet/', async (req, res) => {
  try {
    const page = await puppet.page();
    if (typeof req.body !== 'object' || typeof req.body.url !== 'string') {
      return res.status(400).send();
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
  } catch (err) {
    res.status(500).json({
      error: err
    });
  }
});

/**
 * @swagger
 * /api/puppet/screenshot/:
 *   get:
 *     description: 現在のページのスクリーンショットをとる
 *     responses:
 *       200:
 *         description: スクリーンショット取得
 *         schema:
 *           type: object
 *           properties:
 *             base64:
 *               example: base64エンコードされた画像データ
 *               type: string
 */
router.get('/puppet/screenshot/', async (req, res) => {
  const page = await puppet.page();
  res.status(200).json({
    base64: await page.screenshot({encoding: 'base64'})
  });
});

// export
module.exports = router;
