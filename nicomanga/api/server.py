import sys
sys.path += ['../lib/']

from nicomanga import login_niconico
from flask import Flask
from flask_cors import CORS
from typing import Callable, Tuple

# Flaskアプリケーションdecorator: str -> ((Flask -> None) -> None)
def use_flask(import_name: str) -> Callable[[Callable[[Flask], None]], None]:
    def wrapper(callback: Callable[[Flask], None]) -> None:
        app = Flask(import_name)
        app.config.from_object(import_name)
        # jsonifyでの日本語の文字化けを防ぐ
        app.config['JSON_AS_ASCII'] = False
        # Cross Origin Resource Sharing 有効化
        CORS(app)
        # アプリケーション実行コールバック
        callback(app)
    return wrapper

@use_flask(__name__)
def main(app: Flask) -> None:
    # お気に入り一覧取得: None -> Tuple[str, int]
    @app.get('/api/favorites', methods=['GET'])
    def api_favorites() -> Tuple[str, int]:
        return 'list', 200
    
    # サーバー起動
    app.run(port=8000, debug=True)
