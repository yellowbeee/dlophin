import * as swc from '@swc/core'
import fs from 'fs'

export function buildFile(filePath: string) {
  const {code} = swc.transformFileSync(filePath, {
    jsc: {
      target: 'es2019',
      parser: {
        syntax: 'typescript',
        dynamicImport: true,
      },
    },
    module: {
      type: 'commonjs',
    },
  })

  return code
}

export function loadFile(filePath: string) {
  const isJson = filePath.endsWith('.json')
  const isTs = filePath.endsWith('.ts')

  if (isJson) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  }

  let json = ''

  if (isTs) {
    const code = buildFile(filePath)
    const tempFile = `${filePath}.js`
    fs.writeFileSync(tempFile, code)
    delete require.cache[require.resolve(tempFile)]
    try {
      const temp = require(tempFile)
      json = temp.__esModule ? temp.default : temp
    } catch (err) {
      fs.unlinkSync(tempFile)
      throw err
    }
    fs.unlinkSync(tempFile)

    return json
  }
}
