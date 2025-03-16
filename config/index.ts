import type { ConfigType } from '@moneko/core';

const CDNHOST = 'https://cdn.statically.io';
const conf: Partial<ConfigType> = {
  htmlPluginOption: {
    favicon: './site/assets/images/favicon.ico',
    meta: {
      CSP: {
        'http-equiv': 'Content-Security-Policy',
        content: `script-src 'self' ${CDNHOST} 'unsafe-eval' 'unsafe-inline' blob:;`,
      },
    },
  },
  fallbackCompPath: '@/components/fallback',
  importOnDemand: {
    lodash: {
      transform: '${member}',
    },
    '@moneko/common': {
      transform: 'esm/${member}',
    },
    antd: {
      transform: 'es/${member}',
      style: 'es/${member}/style',
      memberTransformers: ['dashed_case'],
    },
  },
  prefixCls: 'ant',
  reactCompiler: {
    target: '17',
  }
};

export default conf;
