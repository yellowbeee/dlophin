import path from 'path'
import glob from 'glob'
import fs from 'fs'
import shell from 'shelljs'
;(async () => {
  const cwd = path.join(__dirname, '../packages')
  const packages = glob.sync('*', {cwd}).map(dirname => path.join('packages', dirname))

  const tsWriter = fs.createWriteStream(path.join(__dirname, '../tsconfig.cache.json'))
  tsWriter.write(
    JSON.stringify(
      {
        files: [],
        references: packages.map(name => ({
          path: name,
        })),
      },
      null,
      '\t',
    ),
  )

  //
  shell.exec('tsc --build ./tsconfig.cache.json -w')
})().catch(e => {
  console.trace(e)
  // eslint-disable-next-line no-process-exit
  process.exit(128)
})
