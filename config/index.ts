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
      'X-Content-Type-Options': 'nosniff',
    },
  },
  fallbackCompPath: '@/components/fallback',
  prefixCls: 'ant',
  modifyVars: {
    '@ant-prefix': 'ant',
  },
  devServer: {
    https: true,
  },
  strict: true,
  reactCompiler: {
    compilationMode: 'annotation',
    target: '19',
  },
};

export default conf;
