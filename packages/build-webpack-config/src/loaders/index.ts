import type WebpackChainConfig from 'webpack-chain'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

function setRuleForCss(config: WebpackChainConfig) {
  const loaders: any[] = [
    ['css'],
    ['scss', ['sass-loader', 'sass-loader'], {implementation: require(require.resolve('sass'))}],
    [
      'less',
      [
        'less-loader',
        'less-loader',
        {implementation: require(require.resolve('less')), lessOptions: {javascriptEnabled: true}},
      ],
    ],
  ]

  loaders.forEach(([style, loader]) => {
    // module
    const moduleReg = new RegExp(`\\.module\\.${style}$`)
    // name
    const nameReg = new RegExp(`\\.${style}$`)

    // css and module rule
    ;['css', 'module'].forEach(key => {
      const rule =
        key === 'module'
          ? config.module.rule(`${style}.module`).test(moduleReg)
          : config.module.rule(style).test(nameReg).exclude.add(moduleReg).end()

      // MiniCssExtractPlugin
      rule
        .use('MiniCssExtractPlugin-loader')
        .loader(MiniCssExtractPlugin.loader)
        .options({esModule: false})
        .end()

        // css
        .use('css-loader')
        .loader(require.resolve('css-loader'))
        .options(
          key === 'module'
            ? {
                modules: {
                  localIdentName: '[folder]--[local]--[hash:base64:7]',
                },
              }
            : {},
        )
        .end()

        // postcss
        .use('postcss-loader')
        .loader(require.resolve('postcss-loader'))
        .options({
          implementation: require('postcss'),
          postcssOptions: {
            config: false,
            plugins: [
              [
                'postcss-preset-env',
                {
                  stage: 3,
                  browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 9', 'iOS >= 8', 'Android >= 4'],
                },
              ],
            ],
          },
        })
        .end()

      if (loader) {
        const [loaderName, loaderPath, loaderOptions] = loader
        rule.use(loaderName).loader(require.resolve(loaderPath)).options(loaderOptions)
      }
    })
  })
}

function setRuleForAssets(config: WebpackChainConfig) {
  const assets: any[] = [
    ['img', /\.(png|jpe?g|webp|gif|ico)$/i],
    ['woff2', /\.woff2?$/, {mimetype: 'application/font-woff'}],
    ['ttf', /\.ttf$/, {mimetype: 'application/octet-stream'}],
    ['eot', /\.eot$/, {mimetype: 'application/vnd.ms-fontobject'}],
    ['svg', /\.svg$/, {mimetype: 'image/svg+xml'}],
  ]

  const assetsResource: any[] = [['svga', /\.(svga)$/i]]

  // assets
  assets.forEach(([type, reg, options]) => {
    config.module
      .rule(type)
      .test(reg)
      .set('type', 'asset')
      .set('generator', {
        dataUrl: options,
      })
      .set('parser', {
        dataUrlCondition: {
          maxSize: 8 * 1024, // 8kb
        },
      })
  })

  // assets/resource
  assetsResource.forEach(([type, reg]) => {
    config.module.rule(type).test(reg).set('type', 'asset/resource')
  })
}

function setRuleForBabel(config: WebpackChainConfig) {
  const extensions = ['js', 'jsx', 'ts', 'tsx']

  extensions.forEach(extension => {
    config.module
      .rule(extension)
      .test(new RegExp(`\\.${extension}?$`))
      .exclude.add(/node_modules/)
      .end()
      .use('babel-loader')
      .loader(require.resolve('babel-loader'))
      .options({
        presets: [
          [
            require.resolve('@dlophin/babel-preset-env'),
            {
              env: {
                useBuiltIns: 'entry',
                // debug: isDev,
                debug: false,
                corejs: 3,
                bugfixes: true,
                exclude: ['transform-typeof-symbol'],
                loose: true,
              },
              typescript: extension === 'ts' || extension === 'tsx',
              react: extension === 'jsx' || extension === 'tsx' ? {} : undefined,
            },
          ],
        ],
      })
  })
}

export default (config: WebpackChainConfig) => {
  // set css loader
  setRuleForCss(config)
  // set assets loader
  setRuleForAssets(config)
  // set babel loader
  setRuleForBabel(config)
}
