import eel, sys

@eel.expose
def exit_system():
  sys.exit()

eel.init('view')
eel.start('main.html', options={
  'mode': 'chrome-app', # 'chrome'
  'port': 1234,
  "chromeFlags": [
    # '--start-fullscreen',  # フルスクリーンで起動 他のChromeが起動していると機能しない？
    # '--window-position=0,0',
    '--window-size=800,600',
  ]
})