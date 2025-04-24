import React, { memo } from 'react';
import { jsx } from 'react/jsx-runtime';
import { createRoot } from 'react-dom/client';
import { type ExampleModule } from '@app/example';
import * as Pkgs from '@pkg/index';
import CodeLive, { type CodeLiveElement } from 'n-code-live';
import {
  type BaseOption,
  Button,
  type CodeElement,
  type Language,
  Modal,
  registry,
  type SegmentedElement,
} from 'neko-ui';

import './sandbox.css';

CodeLive.registry();
interface SandboxProps extends Omit<ExampleModule, 'title'> {
  legend: string;
  codes: Record<string, string>;
  description?: string;
  style?: React.CSSProperties;
}

const scope = {
  React,
  CodeLive,
  Button,
  jsx,
  Modal,
  registry,
  ...React,
  ...Pkgs,
};

const Sandbox: React.FC<SandboxProps> = ({
  codes = {},
  description,
  legend,
  style,
}: SandboxProps) => {
  'use memo';
  const langsRef = React.useRef<SegmentedElement>(null);
  const live = React.useRef<CodeLiveElement>(null);
  const codeRef = React.useRef<CodeElement>(null);
  const [sources, setSources] = React.useState<Record<string, string>>({});
  const [current, setCurrent] = React.useState({
    code: '',
    jsx: false,
    lang: '',
  });
  const [open, setOpen] = React.useState(false);
  const hasDesc = React.useMemo(() => {
    if (typeof description === 'string') {
      return !!description?.trim().length;
    }
    return false;
  }, [description]);

  React.useEffect(() => {
    setSources({ ...codes });
  }, [codes]);
  const langChange = React.useCallback(
    (e: CustomEvent<string | number>) => {
      setCurrent({
        code: sources[e.detail as string],
        jsx: e.detail !== 'html',
        lang: e.detail as string,
      });
    },
    [sources],
  );
  const codeChange = React.useCallback(
    (e: CustomEvent<string>) => {
      setCurrent({ ...current, code: e.detail });
      setSources({ ...codes, [current.lang]: e.detail });
    },
    [codes, current],
  );
  const langs = React.useMemo<BaseOption[]>(() => {
    return Object.keys(codes).map<BaseOption>((k) => ({
      value: k,
      label: k.toLocaleUpperCase(),
    }));
  }, [codes]);

  React.useEffect(() => {
    if (live.current) {
      Object.assign(live.current, {
        components: scope,
        transform: {
          jsxImportSource: 'react',
          jsxPragma: 'React.createElement',
          jsxFragmentPragma: 'React.Fragment',
        },
        renderJsx: (dom: VoidFunction, el: HTMLElement) => {
          const Dom = dom as unknown as React.FC;
          const ele = document.createElement('div');

          el.append(ele);
          const root = createRoot(el);

          root.render(
            <React.StrictMode>{typeof Dom === 'function' ? <Dom /> : Dom}</React.StrictMode>,
          );

          return () => {
            try {
              root.unmount();
            } catch (error) {
              // eslint-disable-next-line no-console
              console.log(error);
            }
          };
        },
      });
    }
  }, []);
  React.useEffect(() => {
    const l = langs[0].value;

    setCurrent({
      jsx: l !== 'html',
      code: l !== void 0 ? codes[l] : '',
      lang: l as string,
    });
  }, [codes, langs]);
  React.useEffect(() => {
    if (live.current) {
      Object.assign(live.current, {
        source: sources[current.lang],
      });
    }
  }, [current, sources]);
  React.useEffect(() => {
    if (langsRef.current) {
      Object.assign(langsRef.current, {
        options: langs,
      });
    }
  }, [langs]);
  React.useEffect(() => {
    if (langsRef.current) {
      langsRef.current.addEventListener?.('change', langChange);
    }
  }, [langChange]);
  React.useEffect(() => {
    const code = codeRef.current;

    if (open && code) {
      code.addEventListener?.('change', codeChange);
    }
    return () => {
      code?.removeEventListener?.('change', codeChange);
    };
  }, [codeChange, open]);
  return (
    <section className="sandbox-box" style={style}>
      <fieldset className="sandbox-container">
        <legend className="sandbox-title">{legend}</legend>
        <section className="sandbox-view">
          <n-code-live ref={live} jsx={current.jsx} shadow={false} />
          {langs.length > 1 ? (
            <n-segmented ref={langsRef} class="lang-btn" value={current.lang} />
          ) : null}
          <span
            className={['sandbox-btn', hasDesc && 'sandbox-btn-desc'].filter(Boolean).join(' ')}
            data-open={open}
            onClick={() => setOpen(!open)}
          >
            编辑
          </span>
        </section>
        {hasDesc ? (
          <fieldset className="sandbox-info">
            <legend className="sandbox-title">描述</legend>
            <div className="sandbox-description">
              <n-md
                text={description}
                css={`
                  .n-md-body {
                    padding: 0;
                    margin-block-end: 0;
                    background-color: transparent;
                    box-shadow: none;
                  }
                `}
              />
            </div>
          </fieldset>
        ) : null}
        {open ? (
          <n-code
            ref={codeRef}
            class={['sandbox-live-editor', !open && 'hide'].filter(Boolean).join(' ')}
            code={sources[current.lang]}
            language={current.lang as Language}
            edit={true}
            css={`
              .n-editor,
              pre {
                border-radius: 0 0 var(--border-radius) var(--border-radius);
                box-shadow: none;
              }
            `}
          />
        ) : null}
      </fieldset>
    </section>
  );
};

export default memo(Sandbox);
