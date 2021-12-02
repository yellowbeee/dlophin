import WebpackChainConfig from 'webpack-chain'
import {TWebpackConfigMode} from './types'
import webpackBase from './config/base'
import webpackDev from './config/dev'
import webpackBuild from './config/build'

export default (mode: TWebpackConfigMode = 'development'): WebpackChainConfig => {
  const config = webpackBase(mode)
  if (mode === 'development') {
    webpackDev(config)
  } else {
    webpackBuild(config)
  }
  return config
}
