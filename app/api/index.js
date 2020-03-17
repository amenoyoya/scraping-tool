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
 * /api/puppet/emulate/:
 *   put:
 *     description: "デバイスエミュレーションを変更する (例) \"Windows\", \"Macintosh\", \"Galaxy Note 3\", \"iPhone X\", ..."
 *     parameters:
 *       - name: device
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: 成功
 *       400:
 *         description: deviceが指定されていない
 *       500:
 *         description: エラー発生
 */
router.put('/puppet/emulate/', async (req, res) => {
  const page = await puppet.page();
  if (typeof req.body !== 'object' || typeof req.body.device !== 'string') {
    return res.status(400).send();
  }
  if (! await puppet.emulate(page, req.body.device)) {
    return res.status(500).send();
  }
  res.status(200).send();
});

/**
 * @swagger
 * /api/puppet/element/:
 *   get:
 *     description: 現在のページ内の指定要素を取得する
 *     parameters:
 *       - name: selector
 *         in: query
 *         description: 要素セレクタ
 *         required: true
 *         type: string
 *       - name: json
 *         in: query
 *         description: "JSON化するかどうか（デフォルト: false）"
 *         type: boolean
 *     responses:
 *       200:
 *         description: 要素取得
 *         schema:
 *           type: object
 *           example: "{text: innerText, innerHTML, outerHTML, attributes: [attr: value]} or [{tag: {$text: innerText, [attr: value], $children: []}}]"
 *       400:
 *         description: 要素セレクタが指定されていない
 *       404:
 *         description: 指定した要素が存在しない
 */
router.get('/puppet/element/', async (req, res) => {
  if (typeof req.query !== 'object' || typeof req.query.selector !== 'string') {
    return res.status(400).send();
  }
  const page = await puppet.page();
  const element = await puppet.element(page, req.query.selector, req.query.json === 'true');
  if (!element) {
    return res.status(404).send();
  }
  res.status(200).json(element);
});

/**
 * @swagger
 * /api/puppet/elements/:
 *   get:
 *     description: 現在のページ内の指定要素のリストを取得する
 *     parameters:
 *       - name: selector
 *         in: query
 *         description: 要素セレクタ
 *         required: true
 *         type: string
 *       - name: json
 *         in: query
 *         description: "JSON化するかどうか（デフォルト: false）"
 *         type: boolean
 *     responses:
 *       200:
 *         description: 要素リスト取得
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             example: "{text: innerText, innerHTML, outerHTML, attributes: [attr: value]}] or [{tag: {$text: innerText, [attr: value], $children: []}}]"
 *       400:
 *         description: 要素セレクタが指定されていない
 */
router.get('/puppet/elements/', async (req, res) => {
  if (typeof req.query !== 'object' || typeof req.query.selector !== 'string') {
    return res.status(400).send();
  }
  const page = await puppet.page();
  res.status(200).json(await puppet.elements(page, req.query.selector, req.query.json === 'true'));
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
 *           example: フルスクリーン画像バイナリデータ
 *           type: string
 */
router.get('/puppet/screenshot/', async (req, res) => {
  const page = await puppet.page();
  res.status(200).send(await page.screenshot({fullPage: true}));
});

// export
module.exports = router;
