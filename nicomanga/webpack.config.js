const path = require('path');
// vue-loader plugin
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  // 実行モード: develop => 開発, production => 本番
  // webpack4系以降はmodeを指定しないと警告が出る
  mode: 'development',
  // エントリーポイント
  entry: "./src/index.js",
  // 出力設定
  output: {
    // バンドル後のファイル名
    filename: 'bundle.js',
    // 出力先のパス（※絶対パスで指定すること）
    path: path.join(__dirname, 'public')
  },
  // ビルドしたJavaScriptにsource-mapを書き出す
  devtool: 'inline-soruce-map',
  // モジュール設定
  module: {
    rules: [
      {
        // 拡張子 .js の場合
        test: /\\.js$/,
        // babel-loaderを使って ES6 をコンパイル
        loader: "babel-loader",
        // Babel のオプションを指定
        options: {
          // preset_env の構文拡張を有効に
          presets: [
            ["@babel/preset-env"]
          ]
        },
        // node_modules/ 内のファイルは除外
        exclude: /node_modules/
      },
      {
        // 拡張子 .vue の場合
        test: /\.vue$/,
        // vue-loaderを使って vue をコンパイル
        use: "vue-loader"
      },
      {
        // .css ファイル: css-loader => style-loader の順に適用
        // - css-loader: cssをJSにトランスコンパイル
        // - style-loader: <link>タグにスタイル展開
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      /* アイコンloader設定 */
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader?mimetype=image/svg+xml'
        }],
      },
      {
        test: /\.woff(\d+)?(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader?mimetype=application/font-woff'
        }],
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader?mimetype=application/font-woff'
        }],
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader?mimetype=application/font-woff'
        }],
      },
    ]
  },
  // import文で読み込むモジュールの設定
  resolve: {
    extensions: [".js", ".vue"], // .js, .vue をimport可能に
    modules: ["node_modules"], // node_modulesディレクトリからimport可能に
    alias: {
      // vue-template-compilerに読ませてコンパイルするために必要
      vue$: 'vue/dist/vue.esm.js',
    },
  },
  // VueLoaderPluginロード
  plugins: [new VueLoaderPlugin()],
  // 開発サーバー設定
  devServer: {
    // 起点ディレクトリを public/ に設定
    contentBase: path.join(__dirname, 'public'),
    // ポートを3000に設定
    port: 3000,
    // ブラウザを自動的に開く
    open: true
  }
};