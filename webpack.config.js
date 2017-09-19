module.exports = {
  entry: "./app.js",
  output: {
    filename: "build/bundle.js"
  },
  devtool: 'source-map',
  module: {
   loaders: [
     {
       test: /\.es6$/,
       exclude: /node_modules/,
       loader: 'babel-loader',
       query: {
         presets: ['react', 'es2015']
       }
     }
   ]
 },
 resolve: {
   extensions: ['.js', '.es6']
 },
}
