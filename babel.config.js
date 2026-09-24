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
        },
      },
    ],
  ],
};
