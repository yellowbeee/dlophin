import path from 'path'
import glob from 'glob'

export const USER_CONFIG = 'dlophin.config.{js,ts}'

export default (config: string, rootDir: string) => {
  let configPath = ''
  if (config) {
    configPath = path.isAbsolute(config) ? config : path.resolve(rootDir, config)
  } else {
    const [defaultUserConfig] = glob.sync(USER_CONFIG, {cwd: rootDir, absolute: true})
    configPath = defaultUserConfig
  }
  return configPath
}
