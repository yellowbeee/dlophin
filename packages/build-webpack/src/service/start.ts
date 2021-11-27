import {BuildCore, TBuildModule} from '@dlophin/build-core'

export default function webpackStart(core: BuildCore, options: any): TBuildModule<any> {
  const {command, commandArgs} = core
  console.log(command, commandArgs)
  return {} as TBuildModule<any>
}
