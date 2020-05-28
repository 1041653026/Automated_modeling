const path = require('path');
function resolve(dir) {
    return path.join(__dirname, dir);
}
module.exports = {
    //...
    publicPath: './',
    //...
    chainWebpack: (config) => {
        config.resolve.alias
        .set('@', resolve('src'));
    },
    // devServer: {
    //     proxy: {
    //         '/api' : {
    //             target: 'http://121.199.65.205:9020',
    //             ws: true,
    //             changeOrigin: true,
    //             pathRewrite: {
    //                 '^/api': ''
    //             }
    //         }
    //     }
    // }
}