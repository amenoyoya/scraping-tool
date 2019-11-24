import sys
# import対象ディレクトリ追加
sys.path += ['../lib/']

from arch import is_windows
from webd import MaybeChromeDriver, ChromeDriver, create_chrome_driver

driver: MaybeChromeDriver = create_chrome_driver({
    'driver': '../chromedriver75.exe' if is_windows() else '../chromedriver'
})
if driver is not None:
    try:
        while True:
            pass
    except KeyboardInterrupt:
        print('close selenium')
    ChromeDriver(driver).quit()
