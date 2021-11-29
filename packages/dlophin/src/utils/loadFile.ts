import fs from 'fs'
import buildFile from './buildFile'

export = (filePath: string) => {
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
