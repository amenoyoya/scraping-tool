# Google画像検索｜スクレイピングツール

## Environment

- Node.js: `12.18.2`
    - Yarn: `1.22.4`
- Browser: `Google Chrome`

### Setup
```bash
# install node_packages from ./package.json
## => install axios, commander, puppeteer
$ yarn install
```

***

## Usage

Google画像検索を行い、画像をダウンロードする

### CLI help
```bash
$ node app.js --help

Usage: app [options]

Options:
  -d, --directory <string>  保存先ディレクトリ (default: ".")
  -l, --headless <boolean>  ヘッドレスモード (default: false)
  -s, --slowmode <number>   動作遅延[ms] (default: 500)
  -n --numbers <number>     ダウンロード数 (default: 100)
  -r --rename <boolean>     同名ファイルを自動リネーム (default: false)
  -k, --keyword <string>    検索キーワード
  -h, --help                display help for command
```

### Search keyword & Download Images
```bash
# Normal usage: Search 'apple' & download images
# - headless mode: false
# - slow mode: 500 ms
# - download image numbers: 100
# - download directory: ./
# - auto rename the same file names: false
$ node app.js -k 'apple'

# Advanced usage: Search 'apple fruits' & download images
# - headless mode: true
# - slow mode: 100 ms
# - download image numbers: 300
# - download directory: ./saved/apple/
# - auto rename the same file names: true
$ node app.js -k 'apple fruits' -l true -s 100 -n 300 -d './saved/apple/' -r true
```
