module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.LoaderOptionsPlugin({
        options: {
          babel: {
            plugins: ['@babel/plugin-transform-react-jsx'],
          },
        },
      }),
    ],
  },
};