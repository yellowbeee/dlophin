import path from 'path'
import glob from 'glob'

export function getResolvePath(config: string, rootDir: string) {
  let configPath = ''
  if (path.isAbsolute(config)) return config

  const [defaultUserConfig] = glob.sync(config, {cwd: rootDir, absolute: true})
  configPath = defaultUserConfig

  return configPath
}
