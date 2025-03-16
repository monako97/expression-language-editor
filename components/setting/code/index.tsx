import React, { useEffect, useRef, useState } from 'react';
import type { Language } from 'neko-ui';

import { model } from '../../store';

type Segmented = 'EL表达式' | 'DSL';
const Code: React.FC = () => {
  const segmented = useRef(null);
  const codeRef = useRef(null);
  const [current, setCurrent] = useState<Segmented>('EL表达式');
  const { code, dsl } = model;

  useEffect(() => {
    Object.assign(segmented.current!, {
      options: ['EL表达式', 'DSL'],
      onchange: (e: CustomEvent<Segmented>) => {
        setCurrent(e.detail);
      },
    });
  }, []);
  useEffect(() => {
    if (code) {
      Object.assign(codeRef.current!, {
        code: current === 'EL表达式' ? code : JSON.stringify(dsl, null, 2),
      });
    }
  }, [code, current, dsl]);
  return (
    <div style={{ position: 'relative', height: 'calc(100% - 40px)' }}>
      <n-segmented
        ref={segmented}
        css={`
          :host {
            position: absolute;
            z-index: 3;
            display: inline-block;
            margin: auto;
            inline-size: fit-content;
            inset-inline: 0;
            inset-block-start: 0;
            transform: translateY(-4px) scale(0.6);
          }
        `}
        value={current}
      />
      <n-code
        ref={codeRef}
        css={`
          :host {
            height: 100%;
          }
          pre {
            height: 100%;
          }
          pre > code {
            height: calc(100% - 40px);
          }
        `}
        language={'javascript ' as Language}
        toolbar
      />
    </div>
  );
};

export default Code;
