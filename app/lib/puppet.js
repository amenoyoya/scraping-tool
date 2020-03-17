/**
 * Docker環境でのPuppeteer
 * 参考: https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md
 *
 * Puppeteer を永続化して api 駆動させる
 * 参考: https://qiita.com/go_sagawa/items/4a368040fac6f7264e2c
 */
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const {parseHtmlToJson} = require('./html2json');

// 対応デバイス追加
devices['Macintosh'] = {
  'name': 'Macintosh',
  'userAgent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3864.0 Safari/537.36',
  'viewport': {
    'width': 1024,
    'height': 820,
    'deviceScaleFactor': 1,
    'isMobile': false,
    'hasTouch': false,
    'isLandscape': false
  }
};
devices['Windows'] = {
  'name': 'Windows',
  'userAgent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3864.0',
  'viewport': {
    'width': 1024,
    'height': 820,
    'deviceScaleFactor': 1,
    'isMobile': false,
    'hasTouch': false,
    'isLandscape': false
  }
};

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
 * @return {array} [puppeteer.Page]
 */
const getPages = async () => {
  // Puppeteerが起動していない場合は起動
  if (null === browser && ! await launch({headless: false})) {
    return null;
  }
  return await browser.pages();
};

/**
 * Puppeteerブラウザ新規ページ取得
 * @return {Page} puppeteer.Page
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

/**
 * デバイスエミュレーション変更
 * @param {Page} page: puppeteer.Page
 * @param {string} deviceName: デバイス名（puppeteer/DeviceDescriptors, 'Windows', 'Macintosh'）
 * @return {boolean} 
 */
const emulate = async (page, deviceName) => {
  try {
    const device = devices[deviceName];
    if (device === undefined) {
      console.log('Emulation error: Unknown device', deviceName);
      return false;
    }
    await page.emulate(device);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

/**
 * ページ内の指定要素を取得
 * @param {Page} page: puppeteer.Page
 * @param {string} selector: セレクタ
 * @param {boolean} toJson: 再帰的にJSON化するか
 * @return {*}
 *   toJson = false: {text: string, innerHTML: string, outerHTML: string, attributes: object} | null
 *   toJson = true:  {<tag>: {<attr>: <value>, '$text': string, '$children': [...]}}
 */
const element = async (page, selector, toJson = false) => {
  try {
    if (toJson) {
      // JSON化
      const element = await page.$(selector);
      const html = await page.evaluate(e => e === null? '': e.outerHTML, element);
      return parseHtmlToJson(html);
    }
    return await page.$eval(selector, el => {
      // 以下の処理は共通化したいが、$eval, $$eval では外部関数を呼び出せないため断念
      const attributes = {};
      for (const attr of el.attributes) {
        attributes[attr.name] = attr.value;
      }
      return {
        text: el.innerText,
        innerHTML: el.innerHTML,
        outerHTML: el.outerHTML,
        attributes: attributes,
      }
    });
  } catch (err) {
    console.log(err);
    return null;
  }
};

/**
 * ページ内の指定要素のリスト取得
 * @param {Page} page: puppeteer.Page
 * @param {string} selector: セレクタ
 * @param {boolean} toJson: 再帰的にJSON化するか
 * @return {array}
 *   toJson = false: [{text: string, innerHTML: string, outerHTML: string, attributes: object}]
 *   toJson = true:  [{<tag>: {<attr>: <value>, '$text': string, '$children': [...]}}]
 */
const elements = async (page, selector, toJson = false) => {
  try {
    if (toJson) {
      // JSON化
      const elements = await page.$$(selector);
      const result = [];
      for (const element of elements) {
        const html = await page.evaluate(e => e === null? '': e.outerHTML, element);
        result.push(parseHtmlToJson(html));
      }
      return result;
    }
    return await page.$$eval(selector, elements => {
      const result = [];
      for (const el of elements) {
        // 以下の処理は共通化したいが、$eval, $$eval では外部関数を呼び出せないため断念
        const attributes = {};
        for (const attr of el.attributes) {
          attributes[attr.name] = attr.value;
        }
        result.push({
          text: el.innerText,
          innerHTML: el.innerHTML,
          outerHTML: el.outerHTML,
          attributes: attributes,
        });
      }
      return result;
    });
  } catch (err) {
    console.log(err);
    return [];
  }
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
  },
  emulate,
  element,
  elements,
};
