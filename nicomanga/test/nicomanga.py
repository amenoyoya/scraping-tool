import sys
# import対象ディレクトリ追加
sys.path += ['../lib/']

from arch import is_windows
from webd import ChromeDriver, use_chrome_driver
from niconico import login_niconico, get_nicomanga_favorites, get_nicomanga_info
from pprint import pprint
import json

def load_json(filepath: str) -> dict:
    with open(filepath, 'rb') as f:
        return json.load(f)

@use_chrome_driver({
    'driver': '../chromedriver75.exe' if is_windows() else '../chromedriver'
})
def main(driver: ChromeDriver) -> None:
    account: dict = load_json('./account.json')
    # ログイン
    login_niconico(driver, account['email'], account['password'])
    # お気に入り作品列挙
    pprint(get_nicomanga_favorites(driver))
    # 漫画ID: 41341 の情報取得
    comic_id: str = '41341'
    info: dict = get_nicomanga_info(driver, comic_id)
    pprint(info)
