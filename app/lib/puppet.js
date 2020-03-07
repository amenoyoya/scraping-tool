/**
 * Docker環境でのPuppeteer
 * 参考: https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md
 *
 * Puppeteer を永続化して api 駆動させる
 * 参考: https://qiita.com/go_sagawa/items/4a368040fac6f7264e2c
 */
const fs = require('fs');
const puppeteer = require('puppeteer');

// 一つのブラウザをグローバルで利用する
let browser = null;

// Puppeteer再起動用カウンタ
let puppeteerReLaunchCounter = 0;

// Puppeteer起動オプション（Docker対応）
const puppeteerLaunchOption = process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD?
  {
    executablePath: '/usr/bin/chromium-browser',
    args: ['--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox'],
    ignoreHTTPSErrors: true
  }
  : {
    args: ['--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox'],
    ignoreHTTPSErrors: true
  };

// Puppeteer追加オプション
let puppeteerAdditionalOption = {};

/**
 * Puppeteer終了
 */
const terminate = async () => {
  if (browser !== null) {
    await browser.close();
    browser = null;
  }
};

/**
 * Puppeteer起動
 * @param {*} option: Puppeteer追加オプション
 * @return {boolean} result
 */
const launch = async (option = null) => {
  terminate(); // 起動中のPuppeteerは終了
  if (typeof option === 'object') {
    puppeteerAdditionalOption = option;
  }
  browser = await puppeteer.launch({
    ...puppeteerLaunchOption,
    ...puppeteerAdditionalOption
  });
  return null !== browser;
};

/**
 * Puppeteerブラウザページ取得
 * @return {array} puppeteer.pages
 */
const getPages = async () => {
  // Puppeteerが起動していない場合は起動
  if (null === browser && ! await launch()) {
    return null;
  }
  return await browser.pages();
};

/**
 * Puppeteerブラウザ新規ページ取得
 * @return {object} puppeteer.page
 */
const getNewPage = async () => {
  // Puppeteerが起動していない場合は起動
  if (null === browser && ! await launch()) {
    return null;
  }
  // Puppeteer再起動が3回を超えたら失敗
  if (puppeteerReLaunchCounter > 3) {
    return null;
  }
  // ページ取得
  let page;
  try {
    // 開いているページが5ページを超えたらPuppeteer再起動
    const pages = await browser.pages();
    if (pages.length >= 5) {
      throw new Error('Too many pages');
    }
    page = await browser.newPage();
    page.setDefaultNavigationTimeout(5000); // タイムアウト: 5秒
    puppeteerReLaunchCounter = 0; // 再起動カウンタをリセット
  } catch (err) {
    puppeteerReLaunchCounter++;
    // Puppeteer再起動してページ取得
    await launch();
    page = await getPage();
  }
  return page;
};

// export
module.exports = {
  launch,
  terminate,
  getPages,
  getNewPage,
  async page() {
    const pages = await getPages();
    return pages !== null && pages.length > 0? pages[0]: await getNewPage();
  }
};
