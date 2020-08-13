const puppeteer = require('puppeteer')
const scrollPageToBottom = require('puppeteer-autoscroll-down')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const {program} = require('commander')

/**
 * 指定パスがディレクトリか判定
 * @param {string} target 
 * @return {boolean}
 */
const isDirectory = target => {
  try {
    return fs.statSync(target).isDirectory()
  } catch (error) {
    return false
  }
}

/**
 * 指定パスがファイルか判定
 * @param {string} target 
 * @return {boolean}
 */
const isFile = target => {
  try {
    return fs.statSync(target).isFile()
  } catch (error) {
    return false
  }
}

/**
 * 指定URLのリソースをファイルにダウンロード
 * @param {string} url 
 * @param {string} filename 
 * @param {boolean} rename 同名ファイルを自動リネームするかどうか
 */
const download = async (url, filename, rename = false) => {
  const res = await axios.get(url, {responseType: 'arraybuffer'})
  const dir = path.dirname(filename)
  const ext = path.extname(filename)
  // 同名ファイルを自動リネームする場合: filename + '_' + ext
  const basename = (rename && isFile(filename))? path.basename(filename, ext) + '_' + ext: path.basename(filename)
  fs.writeFileSync(path.join(dir, basename), new Buffer.from(res.data), 'binary')
}

/**
 * puppeteer 実行メイン関数
 * @param {function(puppeteer.Page) => void} callback
 * @param {*} opt 
 */
const puppet = async (callback, opt = {}) => {
  const browser = await puppeteer.launch(opt)
  const page = await browser.newPage()
  await page.emulate({
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
  })
  await callback(page)
  await browser.close()
}

/**
 * Google画像検索実行
 * @param {puppeteer.Page} page
 * @param {string} keyword
 */
const searchGoogleImage = async (page, keyword) => {
  await page.goto('https://www.google.co.jp/imghp?hl=ja&tab=wi&authuser=0&ogbl', {waitUntil: 'domcontentloaded'})
  await page.type('input[name="q"]', keyword)
  // フォーム送信してページ遷移を待つ
  await page.click('button[type="submit"]')
  await page.waitFor('img.rg_i', {timeout: 60000})
}

/**
 * Google画像検索結果ページから画像URL取得
 * @param {puppeteer.Page} page
 * @param {number} index
 * @return {string|boolean} url
 */
const getGoogleImage = async (page, index) => {
  try {
    // サムネイルをクリック => 自動でスクロールされるため、次のサムネイル画像もLazyLoadされる
    const thumbs = await page.$$('img.rg_i')
    if (thumbs.length <= index) {
      return false
    }
    await thumbs[index].click()
  } catch {
    return false
  }
  // サムネイルをクリックして出てくるスライド画像のURLを取得
  try {
    await page.waitFor(
      'img[jsname="HiaYvf"]:not([src^="data:image"]):not([src^="https://encrypted-tbn0.gstatic.com"])',
      {timeout: 15000}
    )
    return await page.$eval(
      'img[jsname="HiaYvf"]:not([src^="data:image"]):not([src^="https://encrypted-tbn0.gstatic.com"])',
      el => el.src
    )
  } catch {
    // スライド画像がサムネイル画像と同じ場合: [前の画像, 今の画像, 次の画像]
    const imgs = await page.$$('img[jsname="HiaYvf"')
    if (imgs.length === 0) {
      return false
    }
    const img = imgs.length > 2? imgs[1]: imgs[0]
    return await img.evaluate(el => el.src)
  }
}

/**
 * 画像URLからファイル名取得
 * @param {string} url
 * @return {string}
 */
const getFilename = url => {
  const filename = path.basename(url.match(/[^\?]+/)[0]) // クエリ文字列は削除
  let ext = path.extname(filename)
  let stem = path.basename(filename, ext) // 拡張子抜きのファイル名
  // 拡張子がない場合は .jpg とする
  ext = ext === ''? '.jpg': ext
  // ファイル名の長さは64文字までとする
  stem = stem.length > 64? stem.slice(0, 64): stem
  return stem + ext
}

/**
 * CLIオプションパース
 */
program
  .option('-d, --directory <string>', '保存先ディレクトリ', '.')
  .option('-l, --headless <boolean>', 'ヘッドレスモード', false)
  .option('-s, --slowmode <number>', '動作遅延[ms]', 500)
  .option('-n --numbers <number>', 'ダウンロード数', 100)
  .option('-r --rename <boolean>', '同名ファイルを自動リネーム', false)
  .requiredOption('-k, --keyword <string>', '検索キーワード')
  .parse(process.argv)

/**
 * メインプログラム
 */
puppet(async page => {
  // 保存先ディレクトリ作成
  if (!isDirectory(program.directory)) {
    if (!fs.mkdirSync(program.directory, {recursive: true})) {
      console.log(`failed to create directory: ${program.directory}`)
      return false
    }
  }
  // 画像検索実行
  await searchGoogleImage(page, program.keyword)
  for (let i = 0; i < program.numbers; ++i) {
    const url = await getGoogleImage(page, i)
    // 画像が取得できない => 終了
    if (!url) {
      break;
    }
    // ダウンロード
    const filename = path.join(program.directory, getFilename(url))
    await download(url, filename, program.rename)
    console.log(`downloaded: ${filename}`)
  }
}, {
  headless: program.headless,
  slowMode: program.slowmode,
})
