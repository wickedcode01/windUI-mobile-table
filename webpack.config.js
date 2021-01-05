const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const paths = require('./paths');
const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;
module.exports = {
    entry: './test/index.js',
    output: {
        path: paths.appBuild,
    },
    // 模块配置
    module: {
        rules: [
            {
                test: /\.(js|mjs|jsx|ts|tsx)$/,
                include: paths.appSrc,
                use: "babel-loader",
                exclude: /node_modules/
            },
            {
                test: /\.(js|mjs|jsx|ts|tsx)$/,
                include: paths.appTest,
                use: "babel-loader",
                exclude: /node_modules/
            },
            {
                test: lessRegex,
                exclude: lessModuleRegex,
                use: [{
                    loader: "style-loader" // creates style nodes from JS strings
                }, {
                    loader: "css-loader" // translates CSS into CommonJS
                }, {
                    loader: "less-loader" // compiles Less to CSS
                }],
                sideEffects: true,
            },
            { test: /\.svg/, loader: 'svg-url-loader' }
        ],
        
    },
    resolve: {
        extensions: paths.moduleFileExtensions
        .map(ext => `.${ext}`)
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: 'body',
            filename: 'index.html',
            template: paths.indexHtmlPath
        })
    ],
    
};