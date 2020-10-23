module.exports = {
    css: {
        extract: false,
    },
    configureWebpack: {
        devServer: {
            disableHostCheck: true
        },
        output: {
            filename: 'main.user.js'
        },
        optimization: {
            splitChunks: false
        },
    },
    productionSourceMap: false,
    filenameHashing: false
  }