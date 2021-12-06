import path from 'path'
import fs from 'fs'
import chalk from 'chalk'
import {isFunction, merge} from 'lodash'
import WebpackChainConfig from 'webpack-chain'
import getWebpackConfig from '@dlophin/build-webpack-config'
import {loadFile, getResolvePath} from '@dlophin/build-utils'
//
export type CommandName = 'start' | 'test' | 'build'

export type CommandArgs = Record<string, any>

export type TPluginsList = (string | [string, Record<any, string>])[]

export type TPluginOptions = Record<string, any> | Record<string, any>[]

export type TPluginAPI = Pick<
  BuildCore,
  'command' | 'commandArgs' | 'root' | 'buildConfig' | 'onHook' | 'setWebpackConfig'
>

export type TPluginInfo = {
  name?: string
  pluginPath?: string
  options?: TPluginOptions
  fn: (api: TPluginAPI) => Promise<void> | void
}

export type TBuildConfig = {
  /** 项目入口目录 */
  project: string
  /** 入口 */
  entry: string | Array<string> | Record<string, string>
  /** 出口 */
  output: string
  /** 资源路径 */
  publicPath: string
  /** sourceMap */
  // sourceMap: string
  /** 排除bundle */
  externals?: Record<string, string>
  /** 压缩类型 */
  minify: 'swc' | 'esbuild' | 'terser'
  /** 网络代理 */
  proxy?: Record<string, {target: string}>
  buildType: 'webpack' | 'vite'
  /** 插件 */
  plugins?: TPluginsList
}

export type TUserConfig = Partial<TBuildConfig>

export type TBuildCoreOptions = {
  command: CommandName
  args: CommandArgs
  root?: string
  plugins?: TPluginsList
}

export type TBuildModuleOptions = {command: CommandName; commandArgs: CommandArgs; buildConfig: TBuildConfig}

export type TBuildModule<T> = (context: BuildCore, options: any) => Promise<T>

export type TBuildModules<T> = Record<CommandName, TBuildModule<T>>

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

  public root: string

  public buildConfig: TBuildConfig

  public buildModules: TBuildModules<any> | Record<string, never>

  public eventHooks: TEventHooks

  public plugins: TPluginInfo[]

  public webpackConfig: WebpackChainConfig

  // save webpackConfig to task
  public webpackConfigQueue: Array<(config: WebpackChainConfig) => WebpackChainConfig>

  constructor(public options: TBuildCoreOptions) {
    const {command, args = {}} = options || {}
    this.root = args.root || process.cwd()

    const project = getResolvePath(args.project || 'src', this.root)
    this.command = command
    this.commandArgs = args
    this.buildConfig = {
      entry: {
        index: getResolvePath('index.{js,jsx,ts,tsx}', project),
      },
      project,
      output: path.resolve(this.root, 'build'),
      publicPath: '/',
      minify: 'terser',
      buildType: 'webpack',
    }
    this.buildModules = {}
    this.eventHooks = {}
    this.plugins = []
    this.webpackConfig = getWebpackConfig(args.mode)
    this.webpackConfigQueue = []
  }

  private async init() {
    await this.resolveConfig()
    await this.workPlugins()
    await this.workUserConfig()
    await this.workWebpackConfig()
  }

  public getUserConfig(): Partial<TUserConfig> {
    const {config} = this.commandArgs
    const configPath = getResolvePath(config, this.root)
    let userConfig = {}
    // config exisis
    if (configPath && fs.existsSync(configPath)) {
      try {
        userConfig = loadFile(configPath)()
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
    // const {webpack} = this.userConfig
    // if (webpack) {
    //   this.webpackConfig = webpack(this.webpackConfig)
    // }
  }

  public async resolveConfig() {
    this.buildConfig = merge(this.buildConfig, await this.getUserConfig())
    const {plugins = []} = this.options
    const registerPlugins = [...plugins, ...(this.buildConfig.plugins || [])]
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
      const pluginPath = path.isAbsolute(pluginName) ? pluginName : require.resolve(pluginName, {paths: [this.root]})
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
        root: this.root,
        onHook: this.onHook,
        buildConfig: this.buildConfig,
        setWebpackConfig: this.setWebpackConfig.bind(this),
      }
      await fn(api)
    }
  }

  public setWebpackConfig(fn: (config: WebpackChainConfig) => WebpackChainConfig) {
    this.webpackConfigQueue.push(fn)
  }

  public async workWebpackConfig() {
    for (const fn of this.webpackConfigQueue) {
      this.webpackConfig = await fn(this.webpackConfig)
    }
  }

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
    const {command, commandArgs, buildConfig} = this
    await this.init()
    const buildModule = this.getBuildModule({command, commandArgs, buildConfig})
    return buildModule(this, options)
  }
}

export default BuildCore
