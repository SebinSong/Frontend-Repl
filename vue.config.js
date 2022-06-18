const path = require('path')
const { defineConfig } = require('@vue/cli-service')

const appSrc = path.resolve('src')


module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config => {
    config.resolve.alias.set('~', appSrc),
    config.resolve.alias.set('@components', path.join(appSrc, 'views/components'))
    config.resolve.alias.set('@view-utils', path.join(appSrc, 'views/utils'))
    config.resolve.alias.set('@assets', path.join(appSrc, 'assets'))
    config.resolve.alias.set('@model', path.join(appSrc, 'model'))
  }
})
