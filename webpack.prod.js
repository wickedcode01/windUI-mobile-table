const path = require('path');
const paths = require('./paths');

module.exports = {
    entry: './src/index.jsx',
    output: {
        path: paths.appBuild,
        libraryTarget: 'commonjs2',
    },
    // 模块配置
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                include: paths.appSrc,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.less$/,
                use: [{
                    loader: "style-loader" // creates style nodes from JS strings
                }, {
                    loader: "css-loader" // translates CSS into CommonJS
                }, {
                    loader: "less-loader" // compiles Less to CSS
                }]
            },
            {
                test:'/\.svg/',
                use:['file-loader']
                
              },

        ]
    },
    plugins: [

    ]
};