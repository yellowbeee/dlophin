import WebpackChainConfig from 'webpack-chain'
import webpackLoaders from '../loaders'
import webpackPlugins from '../plugins'
import {TWebpackConfigMode} from '../types'

export default (mode: TWebpackConfigMode) => {
  const config = new WebpackChainConfig()
  // set webpack mode
  config.mode(mode)
  // extensions
  config.resolve.extensions.merge(['.js', '.jsx', '.json', '.ts', '.tsx'])
  // set webpackLoaders
  webpackLoaders(config)
  // set webpackPlugins
  webpackPlugins(config)

  return config
}
