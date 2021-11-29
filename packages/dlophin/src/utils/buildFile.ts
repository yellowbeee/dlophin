import * as swc from '@swc/core'

export = (filePath: string) => {
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
