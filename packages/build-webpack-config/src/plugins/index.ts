import type WebpackChainConfig from 'webpack-chain'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import SimpleProgressPlugin from 'webpack-simple-progress-plugin'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin'

export default (config: WebpackChainConfig) => {
  //css
  config
    .plugin('MiniCssExtractPlugin')
    .use(MiniCssExtractPlugin, [
      {
        ignoreOrder: true,
        filename: '[name].[contenthash:8].css',
        chunkFilename: '[name].[contenthash:8].chunk.css',
      },
    ])
    .end()
  // fix different systems causes path errors
  config.plugin('CaseSensitivePathsPlugin').use(CaseSensitivePathsPlugin).end()
  // progress
  config.plugin('SimpleProgressPlugin').use(SimpleProgressPlugin).end()
  // clean console
  config.plugin('FriendlyErrorsWebpackPlugin').use(FriendlyErrorsWebpackPlugin, [
    {
      clearConsole: true,
    },
  ]).end
}
