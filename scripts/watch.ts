import * as path from 'path'
import * as glob from 'glob'
import * as shell from 'shelljs'
import * as fs from 'fs'
;(async () => {
  const cwd = path.join(__dirname, '../packages')
  const packages = glob.sync('*', {cwd}).map(dirname => path.join('packages', dirname))

  const references = packages.map(name => ({
    path: name,
  }))
  fs.writeFileSync(
    path.join(__dirname, '../tsconfig.json'),
    JSON.stringify(
      {
        files: [],
        references,
      },
      null,
      '\t',
    ),
  )

  // swc packages/*
  // clean
  shell.exec('pnpm run clean')

  const str = references.reduce((prev, next, key) => {
    return `${prev}'cd ${next.path} && swc src -d dist --watch' `
  }, `concurrently `)
  shell.exec(str + `'tsc --build -w' `)
})().catch(e => {
  console.trace(e)
  // eslint-disable-next-line no-process-exit
  process.exit(128)
})
