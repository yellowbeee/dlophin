import {cac} from 'cac'
import { version } from '../package.json'

const cli = cac('dlophin')

cli
  .command('[root]') // default command
  .alias('dev') // alias to align with the script name
  .action((root:string, options: any) => {
    console.log(root, options)
  })

cli.help()
cli.version(version)
cli.parse()