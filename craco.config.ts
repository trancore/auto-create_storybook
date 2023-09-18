import { resolve as _resolve } from "path";

module.exports = {
  webpack: {
    alias: {
      "~": _resolve(__dirname, "./src/"),
    },
    configure: (webpackConfig: unknown) => {
      return webpackConfig;
    },
  },
};
