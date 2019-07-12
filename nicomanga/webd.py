'''
SeleniumWebDriver wrapper library

MIT License

Copyright (c) 2019 amenoyoya https://github.com/amenoyoya

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
'''
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

# Selenium(ChromeDriver)使用デコレータ
def selenium(driver_path='./chromedriver', opt={}):
    def deco(callback):
        def wrapper():
            options = Options()
            options.binary_location = '/usr/bin/google-chrome' if opt.get('bin') is None else opt['bin']
            if opt.get('headless') == True:
                options.add_argument('--headless')
            if isinstance(opt.get('size'), tuple):
                size = opt['size']
                options.add_argument(f'--window-size={size[0]},{size[1]}')
            try:
                driver = webdriver.Chrome(driver_path, chrome_options=options)
            except WebDriverException:
                print(f'ChromeDriver not found: {driver_path}')
                return False
            callback(driver)
            driver.quit()
            return True
        return wrapper
    return deco

# URLを開き、要素が読み込まれるまで待つ関数
def load_url(driver, url, element={}, timeout=15):
    ''' 指定urlを読み込んだ後 指定elementが読み込まれるまで待機
    params:
        driver: selenium.webdriver
        url: str = 読み込むURL
        element: dict = 対象要素 {('id'|'class'): 'target_name'} / if {} => 全要素
        timeout: int = タイムアウト時間（秒）
    return:
        - True: if load complete
        - False: if timed out
    '''
    driver.get(url)
    try:
        id = element.get('id')
        if isinstance(id, str):
            WebDriverWait(driver, timeout).until(EC.presence_of_element_located((By.ID, id)))
            return True
        classname = element.get('class')
        if isinstance(classname, str):
            WebDriverWait(driver, timeout).until(EC.presence_of_element_located((By.CLASS_NAME, classname)))
            return True
        WebDriverWait(driver, timeout).until(EC.presence_of_all_elements_located)
        return True
    except TimeoutException:
        return False

# seleniumデコレータ使用方法
@selenium('../chromedriver', {'size': (1248, 1024)})
def test_selenium(driver):
    ''' Googleで「chrome」と検索してスクリーンショットを撮る
    params:
        driver: selenium.webdriver
    '''
    # https://www.google.co.jp/search?q=chrome をロードし、全要素が読み込まれるまで15秒待機
    load_url(driver, 'https://www.google.co.jp/search?q=chrome', {}, 15)
    driver.save_screenshot('screenshot.png')
    # => Then, driver will close
