import React, { type FC, lazy, memo, Suspense, useMemo } from 'react';
import examples from '@app/example';
import Fallback from '@app/fallback';
import { isFunction } from '@moneko/common';

import Sandbox from './sandbox';

import './sandbox-group.css';

interface SandboxGroupProps {
  name: string;
  ignore?: string[];
}

const SandboxGroup: FC<SandboxGroupProps> = (props) => {
  'use memo';
  async function load(name: string) {
    let box: () => JSX.Element | null = () => null;
    const exampleModule = examples[`@app/example/${name}`];

    if (name.length > 0 && isFunction(exampleModule)) {
      const resp = (await exampleModule()).default || [];

      box = () => (
        <div className="sandbox-group">
          {resp.map(({ title = '', ...m }, i: number) => (
            <Sandbox
              key={title + i}
              style={{ flex: m.col || 'calc(50% - 24px)' }}
              legend={title}
              {...m}
            />
          ))}
        </div>
      );
    }
    return {
      default: box,
    };
  }
  const data = useMemo(() => {
    const app = load.bind(null, props.name);
    const View = lazy(app);

    return <View />;
  }, [props.name]);

  return <Suspense fallback={Fallback && <Fallback />}>{data}</Suspense>;
};

export default memo(SandboxGroup);
