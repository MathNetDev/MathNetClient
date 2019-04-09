const path = require('path');
const webpack = require('webpack');
module.exports = {
    entry: {
        student: "./src/Student.js",
        admin: "./src/Admin.js"
    },
    devtool: "source-map",
    devServer: {
        contentBase: path.join(__dirname),
        compress: true,
        port: 9000,
        publicPath: '/dist/'
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].entry.js"
    },
    plugins: [
        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            $: 'jquery',
            jquery: 'jquery',
            'window.jQuery': 'jquery',
            'window.$': 'jquery'
        })]
};