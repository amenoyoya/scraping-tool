import sys
# import対象ディレクトリ追加
sys.path += ['../lib/']

from webd import ChromeDriver, use_chrome_driver, load_url

@use_chrome_driver({
    'driver': '../chromedriver75.exe',
    'size': (1920, 1020)
})
def main(driver: ChromeDriver) -> None:
    ''' Googleで「chrome」と検索してスクリーンショットを撮る '''
    # https://www.google.co.jp/search?q=chrome をロードし、全要素が読み込まれるまで15秒待機
    load_url(driver, 'https://www.google.co.jp/search?q=chrome', {}, 15)
    driver.save_screenshot('screenshot.png')
    # => Then, driver will close
