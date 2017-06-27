const config = require("./config");
const path = require("path");
const webpack = require("webpack");
const autoprefixer = require("autoprefixer");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CSSSplitWebpackPlugin = require("css-split-webpack-plugin").default;
const WebpackShellPlugin = require("./shell");
const CleanWebpackPlugin = require("clean-webpack-plugin");

const _config = config.prod;

const loaders = [
  {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    loader: "babel",
    query: {
      presets: ["react", "es2015", "stage-0"]
    }
  },
  {
    test: /\.json$/,
    exclude: /node_modules/,
    loaders: ["json-loader"]
  },
  {
    test: /\.(png|jpg|gif)$/,
    loader: `url?name=[path][name]-[hash:8].[ext]&limit=2048`
  },
  {
    test: /(plugin|Draft)\.css$/,
    loader: ExtractTextPlugin.extract(["style", "css"])
  },
  {
    test: /\.css$/,
    loader: ExtractTextPlugin.extract([
      "css?modules&importLoaders=1&localIdentName=[local]___[hash:base64:8]",
      "postcss"
    ]),
    exclude: /node_modules/
  },
  {
    test: /\.less/,
    loader: ExtractTextPlugin.extract([
      "css?modules&importLoaders=1&localIdentName=[local]___[hash:base64:8]",
      "postcss",
      "less"
    ]),
    exclude: /node_modules/
  }
];

const webpackConfig = {
  resolve: {
    extensions: ["", ".js", ".jsx"]
  },
  entry: "./src/client.js",

  output: {
    path: "./public/",
    publicPath: "",
    filename: `/assets/[name].js`,
    chunkFilename: `/assets/[name].js`
  },

  module: {
    loaders
  },

  postcss: [autoprefixer()],
  plugins: [
    new CleanWebpackPlugin(["index.html", "assets"], {
      root: path.join(__dirname, "../public/"),
      verbose: true,
      dry: false
    }),
    new HtmlWebpackPlugin({
      title: _config.pageTitle,
      template: "./webpack/template.html"
    }),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      },
      FFAN_CONFIG: JSON.stringify(_config.FFAN_CONFIG)
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new ExtractTextPlugin(`/assets/[name].css`)
    // new CSSSplitWebpackPlugin({
    //   size: 2500,
    //   filename: `${virtualPath}/css/[name]-[part].css`
    // }),
    // new webpack.optimize.UglifyJsPlugin({
    //   compressor: {
    //     warnings: false,
    //     screw_ie8: true
    //   }
    // })
  ]
};
webpack(webpackConfig, function(err, stats) {
  console.log("打包完成！");
});
