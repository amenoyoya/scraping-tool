import sys
sys.path += ['../lib/']

from webd import ChromeDriver, MaybeChromeDriver, create_chrome_driver
from niconico import login_niconico, get_nicomanga_favorites
from flask import Flask, g, jsonify
from flask_cors import CORS
from typing import Callable, Tuple, TypeVar
import json

MaybeError = TypeVar('MaybeError', Exception, None)

def load_json(filepath: str) -> dict:
    with open(filepath, 'rb') as f:
        return json.load(f)

# Flaskアプリケーションdecorator: str -> ((Flask -> None) -> None)
def use_flask(import_name: str) -> Callable[[Callable[[Flask], None]], None]:
    def wrapper(callback: Callable[[Flask], None]) -> None:
        app: Flask = Flask(import_name)
        app.config.from_object(import_name)
        # jsonifyでの日本語の文字化けを防ぐ
        app.config['JSON_AS_ASCII'] = False
        # Cross Origin Resource Sharing 有効化
        CORS(app)
        # アプリケーション実行コールバック
        callback(app)
    return wrapper

# ニコニコログイン済みChromeDriver取得: None -> ChromeDriver
def get_niconico_driver() -> ChromeDriver:
    if hasattr(g, 'driver'):
        return g.driver
    driver: MaybeChromeDriver = create_chrome_driver({
        'driver': '../chromedriver75.exe',
        # 'headless': True
    })
    if driver is None:
        raise Exception('ChromeDriver作成失敗')
    # ニコニコログイン
    account: dict = load_json('../account.json')
    login_niconico(driver, account['email'], account['password'])
    g.driver = driver
    return g.driver

# json形式のレスポンスを作成: (dict, int) -> Tuple[str, int]
def json_res(data: dict, status: int=200) -> Tuple[str,  int]:
    res = jsonify(data)
    res.status_code = status
    return res

@use_flask(__name__)
def main(app: Flask) -> None:
    # Webアプリケーションデストラクタ
    # ニコニコChromeDriverをclose
    @app.teardown_appcontext
    def close_niconico_driver(err: MaybeError):
        if hasattr(g, 'driver'):
            g.driver.close()

    # お気に入り一覧取得: None -> Tuple[str, int]
    @app.route('/api/favorites', methods=['GET'])
    def api_favorites() -> Tuple[str, int]:
        driver: ChromeDriver = get_niconico_driver()
        favorites: dict = get_nicomanga_favorites(driver)
        return json_res(favorites)
    
    # サーバー起動
    app.run(port=8000, debug=True)
