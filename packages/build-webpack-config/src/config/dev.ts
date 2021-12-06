import WebpackChainConfig from 'webpack-chain'

export default (config: WebpackChainConfig) => {
  config.stats('errors-only')
}
