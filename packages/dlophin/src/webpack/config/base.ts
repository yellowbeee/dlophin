import WebpackChainConfig from 'webpack-chain'
import {TCliCommomOptions} from '../../cli'
import webpackLoaders from '../loader'
import webpackPlugins from '../plugins'

export default (mode: TCliCommomOptions['mode'] = 'development') => {
  const config = new WebpackChainConfig()

  config.mode(mode)
  config.resolve.extensions.merge(['.js', '.json', '.jsx', '.ts', '.tsx'])
  // webpack loaders
  webpackLoaders(config)
  // webpack plugins
  webpackPlugins(config)

  return config
}
