from webd import *
from niconico import *
from pprint import pprint
import json, os

def load_json(filepath):
    with open(filepath, 'rb') as f:
        return json.load(f)
    return {}

@selenium('../chromedriver')
def main(driver):
    account = load_json('./account.json')
    # ログイン
    login_niconico(driver, account['email'], account['password'])
    # お気に入り作品列挙
    pprint(get_nicomanga_favorites(driver))
    # 漫画ID: 41341 の情報取得
    comic_id = '41341'
    info = get_nicomanga_info(driver, comic_id)
    # 漫画保存ディレクトリ作成
    dir = f'【{comic_id}】{info["title"]}'
    if not os.path.exists(dir):
        os.makedirs(dir)
    # 全エピソード保存
    for episode_id in info['episodes']:
        episode = NicoMangaEpisode(driver, episode_id)
        episode.save_source(dir + '/【{0[id]}】{0[title]}/source.html')
        episode.save_comments(dir + '/【{0[id]}】{0[title]}/comments.html')
        episode.save_images(driver, dir + '/【{0[id]}】{0[title]}/{0[image_id]}.png', 0)
        episode.make_archiver(dir + '/【{0[id]}】{0[title]}')
    '''
    # 要素解析作業用
    try:
        while True:
            pass
    except KeyboardInterrupt:
        print('close selenium')
    '''

if __name__ == "__main__":
    main()
