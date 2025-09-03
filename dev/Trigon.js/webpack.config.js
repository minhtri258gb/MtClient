var HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require('path');
const webpack=require("webpack");
module.exports = {
  entry: {
    index: "./src/index.js",
    // "bundle": './src/index.js',
    firstborn: './src/songs/firstborn.js'
  },
  output: {
    path: path.join(__dirname, "./dist"),
    filename: 'js/[name].js'
  },
  plugins:[
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./src/template/index.html",
      chunks: ["index"],
      minify:{
        removeComment:true,
        collapseWhitespace:true
      }
    }),
    new HtmlWebpackPlugin({
      filename: "firstborn.html",
      template: "./src/template/firstborn.html",
      chunks: ["firstborn"],
      minify:{
        removeComment:true,
        collapseWhitespace:true
      }
    }),
  ],
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist'
  }
};