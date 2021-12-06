import chalk from 'chalk'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import openBrowser from 'react-dev-utils/openBrowser'
import serverUrl from '../../utils/serverUrl'
import BuildCore, {TBuildModule} from '@dlophin/build-core'

export = async (core: BuildCore, options: any) => {
  const {command, commandArgs, webpackConfig, applyHook, buildConfig} = core
  // devServerConfig
  const devServerConfig: any = {
    port: commandArgs.port || 3333,
    host: commandArgs.host || '0.0.0.0',
    https: commandArgs.https || false,
    historyApiFallback: true,
    allowedHosts: 'all',
    compress: true,
    webSocketServer: 'ws',
    devMiddleware: {
      publicPath: '/',
    },
    static: [
      {
        publicPath: '/',
        watch: {
          // ignored: watchIgnoredRegexp,
        },
      },
      {
        directory: buildConfig.output,
        publicPath: '/',
        staticOptions: {
          // setHeaders: function (res, path) {
          //   if (path.toString().endsWith('.d.ts')) res.set('Content-Type', 'application/javascript; charset=utf-8')
          // },
        },
      },
    ],
    client: {
      overlay: false,
      logging: 'info',
    },
  }

  let compiler
  try {
    // do optimize
    console.log(webpackConfig.toConfig())
    compiler = webpack(webpackConfig.toConfig())
  } catch (err) {
    console.error(chalk.red('WEBPACK', 'Failed to init webpack'))
    console.error(chalk.red('WEBPACK', err.stack || err.toString()))
    await applyHook('initError', {err})
    // eslint-disable-next-line no-process-exit
    process.exit(1)
  }

  compiler.hooks.done.tap('compileHook', async stats => {
    const statsJson = stats.toJson({
      all: false,
      errors: true,
      warnings: true,
      timings: true,
    })

    setTimeout(() => {
      console.log(
        // eslint-disable-next-line node/no-extraneous-require
        chalk.cyan(`\n  dlophin v${require('../../../package.json').version}`) +
          chalk.green(' Starting the server at:'),
      )
      console.log('   - Local  : ', chalk.underline.yellow(localUrl))
      console.log('   - Network: ', chalk.underline.yellow(localUrl))
      console.log(chalk.cyan(`\n  Webpack ready in ${statsJson.time || 0}ms.\n`))
      console.log()
    }, 1)
  })

  // protocol
  const protocol = devServerConfig.https ? 'https' : 'http'
  const localUrl = serverUrl(protocol, devServerConfig.host, devServerConfig.port)

  // dev-server
  const startDevServerTime = Date.now()
  const server = new WebpackDevServer(devServerConfig, compiler as any) as any

  server.startCallback((error?: Error) => {
    if (error) {
      console.log('WEBPACK', chalk.red('[ERR]: Failed to start webpack-dev-server \n'))
      console.error('WEBPACK', error.stack || error.toString())
    }

    console.log(chalk.cyan(`\n  Server ready in ${Date.now() - startDevServerTime}ms.\n`))

    // open browser
    if (commandArgs.open) {
      openBrowser(localUrl)
    }
  })

  return server
}
