export type TDlophinBabelPresetEnvOptions = {
  typescript?: boolean
  env?: Record<string, any>
  react?: Record<string, any>
}

function transformBabelPath(plugins: any[]) {
  return plugins.filter(Boolean).map(plugin => {
    if (Array.isArray(plugin)) {
      const [name, ...args] = plugin
      return [require.resolve(name), ...args]
    } else {
      return require.resolve(plugin)
    }
  })
}

export default (api: any, {env, react, typescript}: TDlophinBabelPresetEnvOptions) => ({
  // preset
  presets: transformBabelPath([
    env && ['@babel/preset-env', env],
    typescript && '@babel/preset-typescript',
    react && ['@babel/preset-react', react],
  ]),
  // plugins
  plugins: transformBabelPath([
    ['@babel/plugin-proposal-decorators', {legacy: true}],
    ['@babel/plugin-proposal-class-properties', {loose: true}],
    ['@babel/plugin-proposal-nullish-coalescing-operator', {loose: false}],
    '@babel/plugin-proposal-logical-assignment-operators',
    '@babel/plugin-proposal-export-default-from',
    ['@babel/plugin-proposal-optional-chaining', {loose: false}],
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-function-bind',
    '@babel/plugin-proposal-do-expressions',
    '@babel/plugin-proposal-function-sent',
    '@babel/plugin-proposal-numeric-separator',
    ['@babel/plugin-proposal-private-methods', {loose: true}],
    ['@babel/plugin-proposal-pipeline-operator', {proposal: 'minimal'}],
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    '@babel/plugin-proposal-throw-expressions',
    ['@babel/plugin-proposal-private-property-in-object', {loose: true}],
    '@babel/plugin-proposal-json-strings',
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: false,
        helpers: true,
        version: require('@babel/runtime/package.json').version,
        regenerator: true,
        useESModules: false,
        absoluteRuntime: false,
      },
    ],
  ]),
})
