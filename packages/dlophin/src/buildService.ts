import {BuildCore, TBuildModule, TBuildModuleOptions} from '@dlophin/build-core'
import {webpackStart} from '@dlophin/build-webpack'

class BuildService extends BuildCore {
  getBuildModule(options: TBuildModuleOptions): TBuildModule<any> {
    const {userConfig, command} = options

    return webpackStart as any
  }
}

export default BuildService
