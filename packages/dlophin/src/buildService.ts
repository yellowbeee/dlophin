import BuildCore from './core'
import type {TBuildModule, TBuildModuleOptions} from './core'
import {webpackStart} from './webpack'

class BuildService extends BuildCore {
  getBuildModule(options: TBuildModuleOptions): TBuildModule<any> {
    const {userConfig, command} = options

    return webpackStart as any
  }
}

export default BuildService
