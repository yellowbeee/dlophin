import BuildService from './buildService'
import detect from 'detect-port'
import chalk from 'chalk'
import chokidar from 'chokidar'
import type {TCliStartOptions} from './cli'
import getBuildConfig from './utils/getBuildConfig'

export = async (cliOptions: TCliStartOptions) => {
  // port
  const port = cliOptions.port || 3000
  // port is alive
  const newPort = await detect(port)
  if (newPort != port) {
    console.log(chalk.green(` ${port} 端口已被占用，使用${newPort} 端口启动`))
  }
  // set NODE_ENV
  process.env.NODE_ENV = 'development'

  const service = new BuildService({
    command: 'start',
    args: {...cliOptions, port: newPort},
  })

  let server = await service.run({})

  const configPath = getBuildConfig(cliOptions.config || '', cliOptions.root || process.cwd())
  const watcher = chokidar.watch(configPath, {
    ignoreInitial: true,
  })

  watcher.on('change', async function () {
    const configFiles = configPath.split('/')
    console.log('\n')
    console.log(chalk.green(`\n  dlophin:hmr [config change]`), chalk.cyan(configPath))
    console.info(
      chalk.yellow(`\n  ${configFiles[configFiles.length - 1]}`),
      chalk.green(`changed, restarting server... \n`),
    )
    await server.close()
    server = await service.run({})
  })

  watcher.on('error', error => {
    console.error('fail to watch file', error)
    // eslint-disable-next-line no-process-exit
    process.exit(1)
  })
}
