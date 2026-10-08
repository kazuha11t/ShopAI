module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json', '.native.js'],
        alias: {
          '@screens': './src/screens',
          '@components': './src/components',
          '@constants': './src/constants',
          '@navigation': './src/navigation',
          '@contexts': './src/contexts',
          '@data': './src/data',
          '@hooks': './src/hooks',
          '@types': './src/types',
          '@store': './src/store',
          '@services': './src/services',
          '@i18n': './src/i18n',
          '@utils': './src/utils',
          '@assets': './src/assets',
        },
      },
    ],
    // Cần cho zod v4 (dùng cú pháp `export * as core from ...`)
    '@babel/plugin-transform-export-namespace-from',
    // Reanimated (Worklets) plugin PHẢI đứng cuối cùng trong danh sách plugins
    'react-native-reanimated/plugin',
  ],
};
