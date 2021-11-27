import {cac} from 'cac'
import * as pkg from '../package.json'

const cli = cac('dlophin')

// cli.option

cli
  .command('[root]') // default command
  .alias('start') // alias to align with the script name
  .option('--host [host]', `[string] specify hostname`)
  .option('--port <port>', `[number] specify port`)
  .option('--https', `[boolean] use TLS + HTTP/2`)
  .option('--open [path]', `[boolean | string] open browser on startup`)
  .option('-m, --mode <mode>', `[string] set env mode`)
  .action(async (root: string, options: any) => {
    // const serve = await import('./server')
    console.log(options)
  })

cli.help()

cli.version(pkg.version)
cli.parse()
