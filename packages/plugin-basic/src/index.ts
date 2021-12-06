import path from 'path'
import type {TPluginAPI} from '@dlophin/build-core'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'

export default (api: TPluginAPI, options: any) => {
  const {commandArgs, setWebpackConfig, root, buildConfig} = api
  const {entry, output, publicPath, project} = buildConfig
  setWebpackConfig(config => {
    // watch
    config.watch(commandArgs.watch)
    // entry
    if (entry) {
      if (entry === 'string') {
        config.entry('index').add(entry).end()
      } else if (Array.isArray(entry)) {
        entry.forEach(item => {
          config.entry(item).add(item).end()
        })
      } else if (entry instanceof Object) {
        Object.keys(entry).forEach(item => {
          config.entry(item).add(entry[item]).end()
        })
      }
    }
    // output
    config.output.path(output).filename('static/js/[name].[contenthash:8].js').publicPath(publicPath).end()
    // module search
    config.resolve.modules.add('node_modules').add(path.resolve(root, 'node_modules')).add(project).end()
    // alias
    const projectSplit = project.split('/')
    config.resolve.alias.set(projectSplit[projectSplit.length - 1], project).end()
    // html
    config
      .plugin('HtmlWebpackPlugin')
      .use(HtmlWebpackPlugin, [
        {
          inject: true,
          template: path.resolve(root, 'public/index.html'),
          minify: false,
        },
      ])
      .end()
    // copy
    config.plugin('CopyWebpackPlugin').use(CopyWebpackPlugin, [
      {
        patterns: [
          {
            from: path.resolve(root, 'public'),
            to: path.resolve(root, '/'),
            globOptions: {
              // 加入 paths.template 避免被重置
              ignore: ['*.DS_Store', '**/public/index.html'],
            },
            noErrorOnMissing: true,
          },
        ],
      },
    ])
    // define
    config.plugin('EnvironmentPlugin').use(webpack.EnvironmentPlugin, [{}])
    return config
  })
}
