import BuildCore from '@dlophin/build-core'
import type {TBuildModule, TBuildModuleOptions} from '@dlophin/build-core'
import {webpackStart} from './webpack'

class BuildService extends BuildCore {
  getBuildModule(options: TBuildModuleOptions): TBuildModule<any> {
    const {command} = options

    return webpackStart as any
  }
}

export default BuildService
