import BuildService from './buildService'
import detect from 'detect-port'
import chalk from 'chalk'
import chokidar from 'chokidar'
import type {TCliStartOptions} from './cli'
import getBuildConfig from './utils/getBuildConfig'
import {ChildProcess, fork} from 'child_process'

const child: ChildProcess | null = null

export = async (cliOptions: TCliStartOptions) => {
  const run = async () => {
    // port
    const port = cliOptions.port || 3000
    // port is alive
    const newPort = await detect(port)
    if (newPort != port) {
      console.log(chalk.green(` ${port} 端口已被占用，使用${newPort} 端口启动`))
    }

    // set NODE_ENV
    process.env.NODE_ENV = 'development'

    const server = new BuildService({
      command: 'start',
      args: {...cliOptions, port: newPort},
    })

    server.run({})
  }

  run()

  const watcher = chokidar.watch(getBuildConfig(cliOptions.config || '', cliOptions.root || process.cwd()), {
    ignoreInitial: true,
  })

  watcher.on('change', function () {
    console.log('\n')
    console.info(chalk.green(`build config has been changed`))
    console.info(chalk.green('restart dev server'))
    // add process env for mark restart dev process
    // process.env.RESTART_DEV = true
    child && (child as any).kill()
    run()
  })

  watcher.on('error', error => {
    // log.error('fail to watch file', error)
    // process.exit(1)
  })
}
