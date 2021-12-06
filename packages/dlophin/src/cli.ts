import {cac} from 'cac'
// import * as pkg from '../package.json'

export type TCliCommomOptions = {
  config?: string
  root?: string
  base?: string
  logLevel?: 'info' | 'warn' | 'error'
  debug?: boolean
  mode?: 'development' | 'production'
}

export type TCliStartOptions = {
  host?: string
  port?: number
  https?: boolean
  open?: boolean
} & TCliCommomOptions

const cli = cac('dlophin')

// cli.option
cli
  .option('-c, --config <file>', `[string] use specified config file`)
  .option('-r, --root <path>', `[string] use specified root directory`)
  .option('--base <path>', `[string] public base path (default: /)`)
  .option('-l, --logLevel <level>', `[string] info | warn | error`)
  .option('-d, --debug [feat]', `[string | boolean] show debug logs`)
  .option('-m, --mode <mode>', `[string] set env mode`)
  .option('-w, --watch <watch>', `[boolean] watch file`)

// dev
cli
  .command('start [root]') // default command
  .alias('start') // alias to align with the script name
  .option('--host [host]', `[string] specify hostname`)
  .option('--port <port>', `[number] specify port`)
  .option('--https', `[boolean] use TLS + HTTP/2`)
  .option('--open [path]', `[boolean | string] open browser on startup`)
  .action(async (root: string, options: TCliStartOptions) => {
    const start = (await import('./start')).default
    start(options)
  })

cli.help()

// cli.version(pkg.version)
cli.parse()
