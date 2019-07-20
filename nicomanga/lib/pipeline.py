'''
Pythonでパイプライン演算子

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
from typing import Callable, Any, Iterable

# 中置演算子でコールバック関数を渡すためのクラス
class pipe(object):
    def __init__(self, any: Any) -> None:
        # パイプラインの右側の関数に渡すための値を保持
        self.value: Any = any
    
    # パイプライン演算子の代わりに OR演算子 を使う
    ## パイプラインの右側には (Any -> Any)関数を要求
    ## コールバック関数の戻り値を pipeオブジェクトに変換して返す（連続処理のため）
    ## `|`関数: Any -> (Any -> Any) -> (Any -> pipe) -> pipe
    def __or__(self, callback: Callable[[Any], Any]):
        # pipe: Any -> pipe
        ## (Any -> pipe) -> pipe
        return pipe(callback(self.value))

# パイプライン演算子の動作イメージ
## pipe(x) | callback
## => パイプラインの左側の値を引数として、右側の関数に渡す
##      callback(pipe(x))
## == 部分適用: pipe(x) は、xを処理するための関数を引数とする関数を返す
##      pipe(x): x -> (x -> pipe)
##      pipe(x)(callback)

# Iterableコンテナ型の各要素に対して、関数を適用する関数
## map関数: (Any -> Any) -> (Iterable[Any] -> Iterable[Any])
def map(applier: Callable[[Any], Any]) -> Callable[[Iterable[Any]], Iterable[Any]]:
    return lambda it: [applier(e) for e in it]
