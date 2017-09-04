// webpack.config.js
const webpack = require('webpack');
const path = require('path');

const isProd = process.argv.indexOf('-p') !== -1;

const config = {
    entry: [ './src/index.ts' ],
    output: {
        path: path.resolve(__dirname, 'build'),
        publicPath: 'http://localhost:8080/build/',
        filename: 'bundle.js'
    },
    module: {
        rules: [{
            include: [
                path.resolve(__dirname, 'src')
            ],
            test: /\.ts$/,
            loader: isProd ?
                'babel-loader?presets[]=es2015!ts-loader' :
                'ts-loader',
        }]
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    },
}

module.exports = config;


// // webpack.config.js
// const webpack = require('webpack');
// const path = require('path');

// const ExtractTextPlugin = require('extract-text-webpack-plugin');

// const isProd = process.argv.indexOf('-p') !== -1;

// const config = {
//     context: path.resolve(__dirname, 'src'),
//     entry: ['./index.tsx', './index.scss'],
//     output: {
//         path: path.resolve(__dirname, isProd ? 'build' : 'public'),
//         filename: 'js/bundle.js',
//         publicPath: './public'
//     },
//     plugins: [
//         new ExtractTextPlugin('css/style.css'),
//     ],
//     resolve: {
//         extensions: ['.tsx', '.ts', '.js'],
//     },
//     module: {
//         rules: [
//             {
//                 include: [
//                     path.resolve(__dirname, "src")
//                 ],
//                 test: /\.tsx?$/,
//                 // loader: 'ts-loader',
//                 loader: isProd ?
//                     'babel-loader?presets[]=es2015&plugins[]=transform-runtime!ts-loader' :
//                     'ts-loader',
//                 // options: {
//                 //     baseUrl: './src'
//                 // }
//             },
//             // {
//             //     include: [
//             //         path.resolve(__dirname, "src")
//             //     ],
//             //     test: /\.tsx?$/,
//             //     loaders: ['babel-loader']
//             // },
//             {
//                 include: [
//                     path.resolve(__dirname, "src")
//                 ],
//                 test: /\.scss$/,
//                 loader: ExtractTextPlugin.extract({
//                     use: [{
//                         loader: 'css-loader'
//                     }, {
//                         loader: 'sass-loader'
//                     }]
//                 })
//             },
//         ]
//     },
//     resolve: {
//         modules: [
//             path.resolve(__dirname, 'src'),
//             path.resolve(__dirname, 'node_modules')
//         ],
//         extensions: ['.js', '.ts', '.tsx', '.css']
//     }
// }

// module.exports = config;
