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
 * GET /api/puppet/screenshot/ => Puppeteerスクリーンショット撮影
 * @request {url: string}
 * @response '<img src="data:image/png;base64,...">'
 */
router.get('/puppet/screenshot/', async (req, res) => {
  if (typeof req.body === 'object' && typeof req.body.url === 'string') {
    const pages = await puppet.getPages();
    const page = pages.length > 0? pages[0]: await puppet.getNewPage();
    await page.goto(req.body.url, {waitUntil: 'domcontentloaded'});
    return res.status(200).json({
      base64: await page.screenshot({encoding: 'base64'})
    });
  }
  res.status(400).json({
    message: 'request must contain `url` param'
  });
});

// export
module.exports = router;
