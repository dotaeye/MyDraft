const path = require("path");
const config = require("./config");
const webpack = require("webpack");
const express = require("express");
const autoprefixer = require("autoprefixer");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackHarddiskPlugin = require("html-webpack-harddisk-plugin");
const webpackDevServer = require("webpack-dev-server");

const port = 4002;

const loaders = [
  {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    loader: "babel",
    query: {
      presets: ["react", "es2015", "stage-0", "react-hmre"]
    }
  },
  {
    test: /\.json$/,
    exclude: /node_modules/,
    loader: "json"
  },
  {
    test: /\.(png|jpg|gif)$/,
    loader: "url?name=[path][name].[ext]&limit=2048"
  },
  {
    test: /(plugin|Draft)\.css$/,
    loaders: ["style", "css"]
  },
  {
    test: /\.css$/,
    loader: "style!css?modules&importLoaders=1&localIdentName=[path]_[name]__[local]___[hash:base64:8]!postcss",
    exclude: /node_modules/
  },
  {
    test: /\.less$/,
    loader: "style!css?modules&importLoaders=1&localIdentName=[path]_[name]__[local]___[hash:base64:8]!postcss!less",
    exclude: /node_modules/
  }
];

const webpackConfig = {
  resolve: {
    extensions: ["", ".js", ".jsx", "plugin.css"]
  },

  entry: [
    "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000",
    "./src/client.js"
  ],

  output: {
    path: "/public/",
    filename: "[name].js",
    chunkFilename: "[name].js",
    publicPath: "/"
  },

  devtool: "cheap-module-eval-source-map",

  // What information should be printed to the console
  stats: {
    colors: true
  },

  // Options affecting the normal modules
  module: {
    loaders
  },

  // The list of plugins for PostCSS
  // https://github.com/postcss/postcss
  postcss: [autoprefixer()],

  // The list of plugins for Webpack compiler
  plugins: [
    new HtmlWebpackPlugin({
      title: config.dev.pageTitle,
      template: "./webpack/template.html",
      alwaysWriteToDisk: true
    }),
    new HtmlWebpackHarddiskPlugin({
      outputPath: path.join(__dirname, "../public/")
    }),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("development")
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]
};

var app = express();
var compiler = webpack(webpackConfig);

var devMiddleware = require("webpack-dev-middleware")(compiler, {
  publicPath: webpackConfig.output.publicPath,
  contentBase: "http://localhost:" + port,
  quiet: true,
  noInfo: true,
  hot: true,
  inline: true,
  lazy: false,
  stats: {
    colors: true,
    chunks: false
  }
});

var hotMiddleware = require("webpack-hot-middleware")(compiler, {
  log: console.log,
  path: "/__webpack_hmr",
  heartbeat: 10 * 1000
});

app.use(devMiddleware);

app.use(hotMiddleware);

app.use(express.static("./public"));
app.use(function response(req, res) {
  res.sendFile(path.resolve("./public/index.html"));
});

module.exports = app.listen(port, function(err) {
  if (err) {
    console.log(err);
    return;
  }
  var uri = "http://localhost:" + port;
  console.log("Listening at " + uri + "\n");
});
