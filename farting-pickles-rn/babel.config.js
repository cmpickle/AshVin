module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@/src': './src',
            '@/components': './components',
            '@/screens': './src/screens',
            '@/game': './src/game',
            '@/services': './src/services',
            '@/types': './src/types',
            '@/constants': './constants',
            '@/assets': './assets',
          },
        },
      ],
    ],
  };
};