import { type ConfigType, isDev, PACKAGENAME } from '@moneko/core';

const conf: Partial<ConfigType> = {
  devtool: isDev ? 'eval-cheap-module-source-map' : false,
  bar: false,
  seo: {
    domain: 'monako97.github.io',
    jekyll: false,
  },
  htmlPluginOption: {
    publicPath: `/${PACKAGENAME}/`,
  },
  basename: `/${PACKAGENAME}/`,
  fixBrowserRouter: {
    pathSegmentsToKeep: 1,
    path: '404.html',
  },
};

export default conf;
