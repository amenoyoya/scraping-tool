'''
Niconico crawler library

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
import os, re, time, shutil, urllib.request, io
from PIL import Image
from bs4 import BeautifulSoup
from webd import load_url

# ニコニコログイン
def login_niconico(driver, email, password):
    '''
    params:
        driver: selenium.webdriver
        email: str = ログインメールアドレス
        password: str = ログインパスワード
    '''
    load_url(driver, "https://account.nicovideo.jp/login")
    driver.find_element_by_id("input__mailtel").send_keys(email)
    driver.find_element_by_id("input__password").send_keys(password)
    driver.find_element_by_id("login__submit").submit()

# お気に入り作品を列挙
def get_nicomanga_favorites(driver):
    '''
    params:
        driver: selenium.webdriver
    return:
        result: dict = {
            user: ログインユーザー名,
            list: [
                {id: 作品ID, title: 作品タイトル}
            ]
        }
    '''
    load_url(driver, 'http://seiga.nicovideo.jp/my/manga/favorite')
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    obj = {
        'user': soup.select('#siteHeaderUserNickNameContainer')[0].attrs['data-nickname'],
        'list': []
    }
    for e in soup.select('li.favorite'):
        id = re.search(r'\d+', e.attrs['id']).group()
        title = ''
        for a in e.select('a'):
            if re.match(r'^\/comic\/', a.attrs.get('href', '')) and a.attrs.get('class') is None:
                title = a.text
        obj['list'].append({'id': id, 'title': title})
    return obj

# 指定IDの漫画の情報を取得
def get_nicomanga_info(driver, id):
    '''
    params:
        driver: selenium.webdriver
        id: str = 漫画ID ([0-9]+)
    return:
        result: dict = {
            title: 漫画タイトル,
            episodes: [エピソードID配列]
        }
    '''
    driver.get(f'http://seiga.nicovideo.jp/comic/{id}')
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    result = {
        'title': soup.select('li.active span[itemprop="title"]')[0].text,
        'episodes': []
    }
    for li in soup.select('li.episode_item'):
        href = li.select('a')[0].attrs['href']
        episode = re.search(r'\/(mg\d+)', href).group(1)
        result['episodes'].append(episode)
    return result

# ファイル書き出し（存在しないディレクトリを自動作成）
def writefile(filename, text):
    dirpath = os.path.dirname(filename)
    if not os.path.exists(dirpath):
        os.makedirs(dirpath)
    with open(filename, 'wb') as f:
        f.write(text)

# ニコニコ静画の画像を保存
def save_nicomanga_image(driver, image_id, save_path, auto_extension=False):
    '''
    params:
        driver: selenium.webdriver
        image_id: str = 画像ID ([0-9]+)
        save_path: str = 保存先パス (/path/to/image.jpg)
        auto_extension: bool = Trueなら拡張子を自動的に付与
    '''
    load_url(driver, f'http://seiga.nicovideo.jp/image/source/{image_id}')
    img_url = driver.find_element_by_tag_name('img').get_attribute('src')
    f = io.BytesIO(urllib.request.urlopen(img_url).read())
    img = Image.open(f)
    dirpath = os.path.dirname(save_path)
    if not os.path.exists(dirpath):
        os.makedirs(dirpath)
    img.save(save_path + ('.' + img.format if auto_extension else ''))

# エピソードページ解析クラス
class NicoMangaEpisode(object):
    def __init__(self, driver, id):
        ''' 指定IDのエピソード（漫画1話分）を解析する
        params:
            driver: selenium.webdriver
            id: str = エピソードID (mg[0-9]+)
        '''
        load_url(driver, f'http://seiga.nicovideo.jp/watch/{id}')
        self.id = id
        self.title = driver.find_element_by_class_name("episode_title").text
        self.source = driver.page_source
        self.args = driver.execute_script("return args;")
    
    # HTMLソース保存
    def save_source(self, save_path_format='【{0[id]}】{0[title]}/source.html'):
        writefile(
            save_path_format.format({
                'id': self.id, 'title': self.title
            }), self.source.encode()
        )
    
    # コメント保存
    def save_comments(self, save_path_format='【{0[id]}】{0[title]}/comments.html'):
        '''
        r = urllib.request.urlopen("http://msg01.seiga.nicovideo.jp/api/thread?version=20090904&res_from=-1000&thread=" + self.args['threads'][0]['id'])
        writefile(f"【{self.id}】{self.title}\threads.xml", r.read())
        '''
        soup = BeautifulSoup(self.source, 'html.parser')
        ul = soup.select('ul.comment_list')
        if len(ul) == 0:
            return False
        writefile(
            save_path_format.format({
                'id': self.id, 'title': self.title
            }), str(ul[0]).encode()
        )
    
    # 各ページの画像IDの配列を取得
    def get_image_ids(self):
        return [page['image_id'] for page in self.args['pages']]
    
    # エピソードの全ページ画像を保存
    def save_images(self, driver, save_path_format='【{0[id]}】{0[title]}/{0[image_id]}.png', interval=3):
        for img_id in self.get_image_ids():
            save_nicomanga_image(driver, img_id, save_path_format.format({
                'id': self.id, 'title': self.title, 'image_id': img_id
            }))
            if interval > 0:
                time.sleep(interval)
    
    # エピソード保存ディレクトリのアーカイブ化
    def make_archiver(self, target_path_format='【{0[id]}】{0[title]}', archive_type='zip'):
        path = target_path_format.format({
            'id': self.id, 'title': self.title
        })
        shutil.make_archive(path, archive_type, root_dir=path)
