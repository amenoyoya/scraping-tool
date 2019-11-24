# ScrapingTool

## What's this?

スクレイピングを簡単に行うためのツール

***

## Setup

### Environment
- 環境
    - OS: Ubuntu 18.04 LTS
    - Browser: Google Chrome 75.0
    - Engine: Miniconda 4.5.11
        - Python 3.7.3
- Pythonライブラリ
    - ブラウザ自動操作ライブラリ `selenium`
        ```bash
        $ pip install selenium
        ```
    - HTMLタグ解析ライブラリ `BeautifulSoup4`
        ```bash
        $ pip install beautifulsoup4
        ```
    - 画像ライブラリ `pillow`
        ```bash
        $ pip install pillow
        ```
    - ElectronライクなGUIライブラリ `Eel`
        ```bash
        $ pip install eel
        ```

---

### Setup
- Chromeブラウザのバージョンに合ったChromeDriverをダウンロードする
    ```bash
    $ curl -L https://chromedriver.storage.googleapis.com/75.0.3770.90/chromedriver_linux64.zip -o chromedriver.zip
    $ unzip chromedriver.zip
    $ rm chromedriver.zip
    ```
- Test run: ヘッドレスモードでChromeブラウザを起動しスクリーンショットを撮る
    - **test.py**
        ```python
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        # Chromeブラウザの起動オプション
        options = Options()
        options.binary_location = '/usr/bin/google-chrome' # <(which google-chrome)
        options.add_argument('--headless') # ヘッドレスモードで起動
        options.add_argument('--window-size=1280,1024') # ウィンドウサイズを1280x1024に
        # ChromeDriverを使ってSeleniumドライバ生成
        driver = webdriver.Chrome('./chromedriver', chrome_options=options)
        # Googleで「chrome」と検索したときの画面を取得
        driver.get('https://www.google.co.jp/search?q=chrome')
        driver.save_screenshot('screenshot.png')
        driver.quit()
        ```
    - Run `python test.py`
        - Googleで「chrome」と検索したときの画面のスクリーンショットが`screenshot.png`に保存される
