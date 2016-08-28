/**
 * Created by YIHONG on 8/28/16.
 */
var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ROOT_PATH = path.resolve(__dirname);
var SRC_PATH = path.resolve(ROOT_PATH, 'src');
var DIST_PATH = path.resolve(ROOT_PATH, 'dist');

module.exports = {
    entry: SRC_PATH,
    output: {
        path: DIST_PATH,
        filename: 'bundle.js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'demo page',
            template: SRC_PATH + '/index.html',
        }),
    ],
    module: {
        loaders: [
            {
                test: /\.less$/, loader: 'style!css!less',
                include: SRC_PATH,
            },
            {
                test: /\.jsx?$/,
                loader: 'babel',
                include: SRC_PATH,
                query: {
                    presets: ['es2015']
                }
            }
        ]
    },
    devServer: {
        historyApiFallback: true,
        hot: true,
        inline: true,
        progress: true,
    },
}