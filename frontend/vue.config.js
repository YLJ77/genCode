const path = require('path');

module.exports = {
    configureWebpack: {
        devServer: {
            disableHostCheck: true
        },
        // output: {
        //     path: path.resolve(__dirname, '../server/public')
        // },
    },
    outputDir: path.resolve(__dirname, '../server/public')
}