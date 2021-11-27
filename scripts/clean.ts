import * as path from 'path'
import * as rimraf from 'rimraf'

const cwd = path.join(__dirname, '../packages/*/dist')

rimraf.sync(cwd)
