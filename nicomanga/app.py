'''
Node.js (Vuetify) + Python (Eel) アプリケーション
開発中は `yarn webpack --watch` でVueファイルの自動ビルドを有効化しておく
'''
import eel, sys, os
from lib.arch import is_windows
from lib.webd import ChromeDriver, use_chrome_driver
from lib.niconico import login_niconico, get_nicomanga_favorites, get_nicomanga_info, NicoMangaEpisode

# 指定IDのエピソードを保存する
def download_nicomanga_episode(driver: ChromeDriver, id: str, path: str) -> None:
    '''
    params:
        id: str = エピソードID
        path: str = 保存先ディレクトリ
    '''
    ep: NicoMangaEpisode = NicoMangaEpisode(driver, id)
    ep.save_comments(os.path.join(path, '【{0[id]}】{0[title]}', 'comments.html'), False)
    ep.save_images(driver, os.path.join(path, '【{0[id]}】{0[title]}', '{0[image_id]}.png'), 0, False)
    ep.make_archiver(os.path.join(path, '【{0[id]}】{0[title]}'))

@use_chrome_driver({'driver': './chromedriver77.exe' if is_windows() else './chromedriver78'})
def main(driver: ChromeDriver) -> None:
    # Eel公開関数

    ## システム終了: None -> None
    @eel.expose
    def exit_system() -> None:
        sys.exit()
    
    ## ニコニコログイン: (str, str) -> None
    @eel.expose
    def nico_login(email: str, password: str) -> None:
        login_niconico(driver, email, password)
    
    ## ニコニコ漫画お気に入り列挙: None -> dict
    @eel.expose
    def nico_get_favorites() -> dict:
        return get_nicomanga_favorites(driver)

    ## ニコニコ漫画情報取得: str -> dict
    @eel.expose
    def nico_get_manga_info(id: str) -> dict:
        return get_nicomanga_info(driver, id)

    ## ニコニコ漫画エピソード保存: (str, str) -> None
    @eel.expose
    def nico_download_episode(id: str, path: str) -> None:
        download_nicomanga_episode(driver, id, path)

    # Eelアプリケーション実行
    eel.init('public')
    eel.start('index.html', options={
        'mode': 'chrome-app', # 'chrome'
        'port': 8000,
        "chromeFlags": [
            # '--start-fullscreen',  # フルスクリーンで起動 他のChromeが起動していると機能しない？
            # '--window-position=0,0',
            '--window-size=800,600',
        ]
    })
