'''
実行OSのアーキテクチャ取得ライブラリ

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
from typing import Callable
import os, sys

# OSがWindowsかどうか判定: None -> bool
## if true: Windows OS
## else: Linux or Mac OS
is_windows: Callable[[], bool] = \
    lambda: os.name == 'nt'

# アーキテクチャが64bitかどうか判定: None -> bool
## if true: 64bit
## else: 32bit
is_64bit: Callable[[], bool] = \
    lambda: sys.maxsize > 2 ** 32

# アーキテクチャごとのProgramFilesパスを取得: None -> str
get_windows_program_path: Callable[[], str] = \
    lambda: os.environ['ProgramFiles(x86)'] if is_64bit() \
        else os.environ['ProgramW6432']
