module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '18',
        },
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@config': './src/config',
          '@controllers': './src/main/controllers',
          '@services': './src/main/services',
          '@routes': './src/main/routes',
          '@models': './src/main/models',
          '@middlewares': './src/main/middlewares',
          '@utils': './src/utils',
          '@types': './src/types',
        },
      },
    ],
  ],
};