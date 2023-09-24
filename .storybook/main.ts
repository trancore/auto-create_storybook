import type { StorybookConfig } from "@storybook/react-webpack5";
import path from "path";

const rootPath = path.resolve(__dirname, "../src/");

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/preset-create-react-app",
    "@storybook/addon-onboarding",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  staticDirs: ["../src/assets"],
  webpackFinal: (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve?.alias,
        "~": [
          path.resolve(__dirname, "../src/"),
          path.resolve(__dirname, "../"),
        ],
      };
      config.resolve.roots = [
        path.resolve(__dirname, "../public"),
        "node_modules",
      ];
    }
    return config;
  },
};
export default config;
