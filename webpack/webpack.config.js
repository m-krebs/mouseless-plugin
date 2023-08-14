const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
module.exports = {
  mode: "production",
  entry: {
    "service-worker": path.resolve(__dirname, "..", "src", "service-worker.ts"),
    "scripts/content-script": path.resolve(__dirname, "..", "src", "scripts", "content.ts"),
    "options/options": path.resolve(__dirname, "..", "src", "options", "options.ts"),
  },
  output: {
    path: path.join(__dirname, "../dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: ".", to: ".", context: "public" },
        { from: "src/popup/", to: "popup" },
        { from: "src/options/", to: "options" },
        { from: "src/icons/", to: "icons" },
        { from: "src/styles.css", to: "styles.css"}
      ],
    }),
  ],
};
