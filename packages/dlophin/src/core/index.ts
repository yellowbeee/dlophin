import path from 'path'
import glob from 'glob'
import fs from 'fs'
import chalk from 'chalk'
import {isFunction, merge} from 'lodash'
import WebpackChainConfig from 'webpack-chain'
import loadFile from '../utils/loadFile'
import getBuildConfig from '../utils/getBuildConfig'
import {TCliCommomOptions} from '../cli'
//
export type CommandName = 'start' | 'test' | 'build'

export type CommandArgs = TCliCommomOptions & Record<string, any>

export type TPluginsList = (string | [string, Record<any, string>])[]

export type TPluginOptions = Record<string, any> | Record<string, any>[]

export type TPluginAPI = Pick<BuildCore, 'command' | 'commandArgs' | 'onHook' | 'webpackConfig'>

export type TPluginInfo = {
  name?: string
  pluginPath?: string
  options?: TPluginOptions
  fn: (api: TPluginAPI) => Promise<void> | void
}

export type TBuildCoreOptions = {
  command: CommandName
  args: CommandArgs
  rootDir?: string
  plugins?: TPluginsList
}

export type TBuildModuleOptions = {command: CommandName; commandArgs: CommandArgs; userConfig: TUserConfig}

export type TBuildModule<T> = (context: BuildCore, options: any) => Promise<T>

export type TBuildModules<T> = Record<CommandName, TBuildModule<T>>

export type TUserConfig = {
  webpack?: (config: WebpackChainConfig) => WebpackChainConfig
  buildType?: 'webpack' | 'vite'
  plugins?: TPluginsList
}

export type TOnEventHookCallBack = (params: TOnEventHookCallBackParams) => Promise<void> | void

export type TOnEventHookCallBackParams = {
  args?: CommandArgs
  config?: WebpackChainConfig
}

export type TEventHooks = {
  [key: string]: TOnEventHookCallBack[]
}

class BuildCore {
  public command: CommandName

  public commandArgs: CommandArgs

  public userConfig: TUserConfig

  public buildModules: TBuildModules<any> | Record<string, never>

  public rootDir: string

  public eventHooks: TEventHooks

  public plugins: TPluginInfo[]

  public webpackConfig: WebpackChainConfig

  constructor(public options: TBuildCoreOptions) {
    const {command, args = {}} = options || {}

    this.command = command
    this.commandArgs = args
    this.rootDir = args.root || process.cwd()
    this.userConfig = {}
    this.buildModules = {}
    this.eventHooks = {}
    this.plugins = []
    this.webpackConfig = new WebpackChainConfig()
  }

  private async init() {
    this.resolveConfig()
    await this.workPlugins()
    await this.workUserConfig()
  }

  public getUserConfig(): TUserConfig {
    const {config} = this.commandArgs
    const configPath = getBuildConfig(config || '', this.rootDir)

    let userConfig = {}
    // config exisis
    if (configPath && fs.existsSync(configPath)) {
      try {
        userConfig = loadFile(configPath)
      } catch (err) {
        console.info('CONFIG', `Fail to load config file ${configPath}`)
        console.log(chalk.red('CONFIG', err.stack || err.toString()))
        // eslint-disable-next-line no-process-exit
        process.exit(1)
      }
    } else {
      console.log(chalk.red('CONFIG', `config file${`(${configPath})` || ''} is not exist`))
      // eslint-disable-next-line no-process-exit
      process.exit(1)
    }
    return userConfig
  }

  public workUserConfig() {
    const {webpack} = this.userConfig
    if (webpack) {
      this.webpackConfig = merge(this.webpackConfig, webpack(this.webpackConfig))
    }
  }

  public async resolveConfig() {
    this.userConfig = await this.getUserConfig()
    const {plugins = []} = this.options
    const registerPlugins = [...plugins, ...(this.userConfig.plugins || [])]
    this.plugins = this.resolvePlugins(registerPlugins)
  }

  public resolvePlugins(plugins: TPluginsList) {
    return plugins.map(plugin => {
      if (isFunction(plugin)) {
        return {
          options: {},
          fn: plugin,
        }
      }
      // => [name, options]
      const newPlugin: [string, TPluginOptions | undefined] = Array.isArray(plugin) ? plugin : [plugin, undefined]
      // pluginName
      const pluginName = newPlugin[0]
      // pluginPath => absolute path
      const pluginPath = path.isAbsolute(pluginName) ? pluginName : require.resolve(pluginName, {paths: [this.rootDir]})
      // pluginOptions
      const pluginOptions = newPlugin[1]

      let fn: any = () => {}
      // absolute path => require()
      try {
        fn = require(pluginPath)
        fn = fn.default || fn
      } catch (err) {
        console.log(chalk.red('PLUGIN', `Fail to load plugin ${pluginPath}\n`))
        console.log(chalk.red('PLUGIN', err.stack || err.toString()))
        // eslint-disable-next-line no-process-exit
        process.exit(1)
      }
      return {
        name: pluginName,
        pluginPath,
        fn,
        options: pluginOptions,
      }
    })
  }

  public async workPlugins() {
    for (const plugin of this.plugins) {
      const {name, options, fn} = plugin

      const api = {
        command: this.command,
        commandArgs: this.commandArgs,
        onHook: this.onHook,
        webpackConfig: this.webpackConfig,
      }
      await fn(api)
    }
  }

  public workWebpackConfig() {}

  public getBuildModule(options: TBuildModuleOptions): TBuildModule<any> {
    const {command} = options
    if (this.buildModules && this.buildModules[command]) {
      return this.buildModules[command]
    } else {
      throw new Error(`command ${command} is not support`)
    }
  }

  public async applyHook(key: string, options: any) {
    for (const fn of this.eventHooks[key] || []) {
      await fn(options)
    }
  }

  public onHook: (key: string, fn: TOnEventHookCallBack) => void = (key, fn) => {
    if (!Array.isArray(this.eventHooks[key])) {
      this.eventHooks[key] = []
    }
    this.eventHooks[key].push(fn)
  }

  public async run(options: any) {
    const {command, commandArgs, userConfig} = this
    await this.init()
    const buildModule = this.getBuildModule({command, commandArgs, userConfig})
    return buildModule(this, options)
  }
}

export default BuildCore
