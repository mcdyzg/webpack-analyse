const { resolve } = require('path');
const webpack = require('webpack');

const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production';
const isDev = !isProd;

const config = {
    // devtool: isDev ? 'eval-source-map':'source-map', //开发环境使用;线上环境请禁用
    entry: {
        app:[
            __dirname + '/src/app/app.js',
            // the entry point of our app
        ],
        // app2:[                               // 多个入口文件打开本选项。
        //     'react-hot-loader/patch',
        //     // activate HMR for React

        //     'webpack-dev-server/client?http://localhost:8081',
        //     // bundle the client for webpack-dev-server
        //     // and connect to the provided endpoint

        //     'webpack/hot/only-dev-server',
        //     // bundle the client for hot reloading
        //     // only- means to only hot reload for successful updates

        //     __dirname + '/src/app/app2.js',
        //     // the entry point of our app
        // ],
    },
    output: {
        path: resolve(__dirname, 'dist'),
        filename: '[name].js',
        library : 'app',
        libraryTarget:'umd'
    },
    context: resolve(__dirname, 'src'),

    module: {
        rules: [
            {
                test: /\.js[x]?$/,
                use:[
                    {
                        loader:'babel-loader'
                    }
                ],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'postcss-loader'
                ]
            },
            {
                test: /\.scss$/,
                use:[
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                    'postcss-loader'
                ]
            },
            {
                test: /\.(png|jpg)$/,
                use: [
                    {
                        loader:'url-loader',
                        options:{
                            limit:8192
                        }
                    }
                ]
            }
        ]
    },
    // 是否监听文件变化，默认false,如果开启web-dev-server,则默认true
    // watch: true,
    // 运行环境
    target:'web',
    plugins: [
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //       warnings: false
        //     },
        //     output: {
        //       comments: false
        //     },
        //     sourceMap: true
        // }),
        new webpack.DefinePlugin({
          __LOCAL__: isDev,                                  // 本地环境
          __PRO__:   isProd                                  // 生产环境
        }),
    ]
};

module.exports = config;
