const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const { merge } = require("webpack-merge");
const webpack = require("webpack");

const commonConfig = {
  context: path.resolve(__dirname, "web"),
  plugins: [
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({
      template: "public/index.ejs"
    })
  ],
  resolve: {
    extensions: [".js", ".jsx"]
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  }
};

const prodConfig = {
  mode: "production",
  output: {
    path: path.resolve(__dirname, "dida", "web")
  },
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
    antd: "antd",
    moment: "moment"
  }
};

const devConfig = {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    proxy: {
      "/api": "http://localhost:8888"
    }
  }
};

module.exports = (function() {
  switch (process.env.npm_lifecycle_event) {
    case "build":
    default:
      return merge(commonConfig, prodConfig);
    case "dev":
      return merge(commonConfig, devConfig);
    case "analyze":
      const config = merge(commonConfig, prodConfig);
      config.plugins.push(new BundleAnalyzerPlugin());
      return config;
  }
})();
