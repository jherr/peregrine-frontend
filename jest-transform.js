const config = require('./.babelrc')
config.plugins.push('@babel/plugin-transform-modules-commonjs')
module.exports = require('babel-jest').createTransformer(config)
