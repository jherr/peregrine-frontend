import { css } from 'docz-plugin-css'
import babelrc from './.babelrc'

export default {
  plugins: [
    css({
      preprocessor: 'postcss',
      cssmodules: true,
    }),
  ],
  modifyBundlerConfig(config) {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          preact: 'react-dom',
        },
        extensions: [...config.resolve.extensions, '.ts', '.tsx'],
      },
    }
  },
  modifyBabelRc(config) {
    const newConfig = {
      ...config,
      presets: [...babelrc.presets, ...config.presets],
      plugins: [
        ...babelrc.plugins.filter(p => p[0] !== '@babel/transform-react-jsx'),
        ...config.plugins,
      ],
    }
    console.log(newConfig)
    return newConfig
  },
}
