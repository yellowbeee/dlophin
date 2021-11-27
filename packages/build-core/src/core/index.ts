//
export type CommandName = 'start' | 'test' | 'build'

export type CommandArgs = Record<string, any>

export type TUserConfig = Record<string, any>

export type TBuildCoreOptions = {
  command: CommandName
  args: CommandArgs
}

export type TBuildModuleOptions = {command: CommandName; commandArgs: CommandArgs; userConfig: TUserConfig}

export type TBuildModule<T> = (context: BuildCore, options: any) => Promise<T>

export type TBuildModules<T> = Record<CommandName, TBuildModule<T>>

class BuildCore {
  public command: CommandName

  public commandArgs: CommandArgs

  public userConfig: TUserConfig

  public buildModules: TBuildModules<any> | Record<string, never>

  constructor(public options: TBuildCoreOptions) {
    const {command, args = {}} = options || {}

    this.command = command
    this.commandArgs = args
    this.userConfig = {}
    this.buildModules = {}
  }

  public getUserConfig() {
    return {}
  }

  public async resolveConfig() {
    this.userConfig = await this.getUserConfig()
  }

  public getBuildModule(options: TBuildModuleOptions): TBuildModule<any> {
    const {command} = options
    if (this.buildModules && this.buildModules[command]) {
      return this.buildModules[command]
    } else {
      throw new Error(`command ${command} is not support`)
    }
  }
}

export default BuildCore
