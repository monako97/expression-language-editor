import React, { memo, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation } from '@moneko/react';
import { description } from 'app:info';
import routes, { type RouteConfig } from 'app:routes';
import { type ColorScheme, type DropdownElement, type MenuOption, theme } from 'neko-ui';

import './sider.global.less';

export type MyPkg = Partial<RouteConfig> & {
  type?: string;
  title?: string;
  path?: string;
  subtitle?: string;
  icon?: string;
  order?: number;
  key?: string;
};
const obj: Record<string, MyPkg[]> = {},
  menuKeys: string[] = [],
  kv: Record<string, MyPkg | undefined> = {};

let all: MyPkg[] = [];

function extractMenu(list: RouteConfig[]) {
  return list.forEach(({ key, metadata, children }) => {
    if (metadata) {
      const type = metadata.type || '默认',
        prev = obj[type as string] || [];

      obj[type as string] = prev.concat({
        ...metadata,
        type: type as string,
        key,
      });
      if (!menuKeys.includes(type as string)) {
        menuKeys.push(type as string);
      }
      if (key) {
        kv[key] = {
          ...metadata,
          type: type as string,
          key,
        };
      }
    }
    if (Array.isArray(children) && children.length) {
      extractMenu(children);
    }
  });
}

extractMenu(routes);

for (const key in obj) {
  if (Object.prototype.hasOwnProperty.call(obj, key)) {
    obj[key] = obj[key].sort((a, b) => (a.order || 0) - (b.order || 0));
    all = all.concat(obj[key]);
  }
}

export { all, kv };
function Sider({ scheme }: { scheme?: keyof typeof ColorScheme }) {
  'use memo';
  const sider = useRef<HTMLDivElement>(null);
  const themeSwitch = useRef<DropdownElement>(null);
  const location = useLocation();
  const icons: Record<string, string> = {
    dark: '🌛',
    light: '🌞',
    auto: '⚙️',
  };
  const themes = useMemo<MenuOption[]>(
    () => [
      { label: '暗黑', value: 'dark', icon: icons.dark },
      { label: '明亮', value: 'light', icon: icons.light },
      { label: '跟随系统', value: 'auto', icon: icons.auto },
    ],
    [icons.auto, icons.dark, icons.light],
  );

  const active = useMemo(() => location.pathname.substring(1), [location.pathname]);

  useEffect(() => {
    if (active) {
      sider.current?.querySelector('.site-sider-item[data-active="true"] > a')?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [active]);
  useEffect(() => {
    if (themeSwitch.current) {
      themeSwitch.current.items = themes;
      themeSwitch.current?.addEventListener?.('change', (e: CustomEvent) => {
        theme.setScheme(e.detail[0]);
      });
    }
  }, [themes]);

  return (
    <section ref={sider} className="site-left">
      <header className="site-header">
        <Link to="/">
          <n-avatar
            css={`
              .avatar {
                background-image: none;
                animation: none;
              }
            `}
          />
        </Link>
        <hgroup className="site-title">
          <n-typography truncated>EL 编辑器</n-typography>
          <i>{description}</i>
        </hgroup>
        <n-dropdown
          ref={themeSwitch}
          value={scheme}
          css={`
            .theme-btn {
              font-size: 28px;
              text-align: center;
              color: #fc0;
              transition: transform var(--transition-duration) var(--transition-timing-function);
              min-inline-size: 28px;
              line-height: 32px;
              cursor: pointer;
              user-select: none;
            }

            [data-theme='dark'] .theme-btn {
              content: '☪';
              color: #fff;
            }
          `}
        >
          <span className="theme-btn">{icons[scheme!]}</span>
        </n-dropdown>
      </header>
      <section className="site-sider">
        <ul>
          {menuKeys.map((key) => {
            return (
              <li key={key} className="site-sider-group">
                <p className="site-sider-group-title">{key}</p>
                <ul className="site-sider-list">
                  {obj[key].map((item, i) => {
                    return (
                      <li
                        key={`${i}${item.path}${item.key}`}
                        className="site-sider-item"
                        data-active={active === item.key}
                      >
                        <Link to={`/${item.key}` as string}>
                          <span className="site-sider-icon">{item.icon}</span>
                          <div className="site-sider-label">{item.title || item.path}</div>
                          {item.subtitle && (
                            <div className="site-sider-subtitle">{item.subtitle}</div>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </section>
    </section>
  );
}
export default memo(Sider);
