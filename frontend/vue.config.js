const path = require('path');

module.exports = {
    configureWebpack: {
        devServer: {
            disableHostCheck: true,
            // proxy: 'http://119.129.96.242:3000'
        },
        // output: {
        //     path: path.resolve(__dirname, '../server/public')
        // },
    },
    outputDir: path.resolve(__dirname, '../server/public')
}