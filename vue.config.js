const path = require('path')

module.exports = {

  //   module:{
  //     rules:[
  //         {
  //             test: /\.vue$/,
  //             loader: 'vue-loader'
  //         },
  //         {
  //           test: /\.css$/,
  //           use: [
  //             'style-loader',
  //             'css-loader'
  //           ]
  //         }
  //     ]
  // },
  // 配置 webpack-dev-server 行为。
  productionSourceMap: false,

  devServer: {
    hot: true,
    disableHostCheck: true,
    open: false,
    host: '0.0.0.0',
    port: 9200,
    https: true,
    hotOnly: false,
    // 查阅 https://github.com/vuejs/vue-doc-zh-cn/vue-cli/cli-service.md#配置代理
    //proxy: null, // string | Object
    proxy: {
      '/gaode': {
        target: 'https://restapi.amap.com/v3/place/text', //要跨域的域名
        secure: true,//接受对方是https的接口
        ws: true, // 是否启用websockets
        changeOrigin: true, //是否允许跨越
        pathRewrite: {
          '^/gaode': ''  //将你的地址代理位这个 /api 接下来请求时就使用这个/api来代替你的地址
        },
      },
      '/route': {
        target: 'https://restapi.amap.com/v3/direction/driving', //要跨域的域名
        secure: true,//接受对方是https的接口
        ws: true, // 是否启用websockets
        changeOrigin: true, //是否允许跨越
        pathRewrite: {
          '^/route': ''  //将你的地址代理位这个 /api 接下来请求时就使用这个/api来代替你的地址
        },
      },
      '/mapapi': {
        //         target: 'http://10.82.28.169:15000/api/', //要跨域的域名
        // target: 'http://1.12.236.55:15000/api/',
        // target: 'http://localhost:23698/api/',
        target: 'http://111.22.48.162:15000/api/',
        secure: true,//接受对方是https的接口 
        ws: true, // 是否启用websockets
        changeOrigin: true, //是否允许跨越
        pathRewrite: {
          '^/mapapi': ''  //将你的地址代理位这个 /api 接下来请求时就使用这个/api来代替你的地址
        },
      },
      '/pyapi': {

        target: 'http://127.0.0.1:5000/',
        secure: true,//接受对方是https的接口
        ws: true, // 是否启用websockets
        changeOrigin: true, //是否允许跨越
        pathRewrite: {
          '^/pyapi': ''  //将你的地址代理位这个 /api 接下来请求时就使用这个/api来代替你的地址
        },
      },

      '/zrzyj': {
        target: 'http://222.240.228.72:8060', //要跨域的域名
        //target: 'http://localhost:23698/api/',
        secure: true,//接受对方是https的接口
        ws: true, // 是否启用websockets
        changeOrigin: true, //是否允许跨越
        pathRewrite: {
          '^/zrzyj': ''  //将你的地址代理位这个 /api 接下来请求时就使用这个/api来代替你的地址
        },
      },

      '/geoserver': {
        target: 'http://localhost:8080/geoserver/', //要跨域的域名
        //target: 'http://localhost:23698/api/',
        secure: true,//接受对方是https的接口
        ws: true, // 是否启用websockets
        changeOrigin: true, //是否允许跨越
        pathRewrite: {
          '^/geoserver': ''  //将你的地址代理位这个 /api 接下来请求时就使用这个/api来代替你的地址
        },
      },

    },

    before: app => {
    }
  },
  configureWebpack: {
    externals: {
      'MathLive': 'MathLive'
    }
  }
}
