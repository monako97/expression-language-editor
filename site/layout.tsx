import React, { useEffect, useMemo, useRef, useState } from 'react';
import docs from '@app/docs';
import { Outlet, useLocation } from '@moneko/react';
import { type ColorScheme, mdStyle, type ProviderElement, theme } from 'neko-ui';

import ChangeLog from '../CHANGELOG.md';

import Colors from './components/colors';
import Coverage from './components/coverage';
import Footer from './components/footer';
import SandboxGroup from './components/sandbox-group';
import Sider from './components/sider';

import './global.css';

theme.setScheme('light');
document.documentElement.setAttribute('data-theme', theme.isDark() ? 'dark' : 'light');
function App() {
  const provider = useRef<ProviderElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const { isDark, scheme: orgScheme } = theme;
  const [scheme, setScheme] = useState(orgScheme());
  const location = useLocation();
  const active = useMemo(() => location.pathname.substring(1), [location.pathname]);
  const doc = useMemo(() => docs[active] || [], [active]);

  useEffect(() => {
    box.current?.scrollTo({ top: 0, behavior: 'smooth' });
    provider.current?.addEventListener?.('scheme', (e: CustomEvent<keyof typeof ColorScheme>) => {
      setScheme(e.detail);
      document.documentElement.setAttribute('data-theme', theme.isDark() ? 'dark' : 'light');
    });
  }, []);

  return (
    <n-provider ref={provider}>
      <style>{mdStyle}</style>
      <Sider scheme={scheme} />
      <main ref={box} className="site-doc-main">
        {!active.startsWith('@') && <Coverage />}
        <div className="site-page-view">
          <div className="n-md-box">
            <div className="n-md-body">
              <Outlet />
            </div>
          </div>
          <SandboxGroup name={active} />
          {doc.map((Item, i) => (
            <Item key={i} />
          ))}
          {!active && (
            <>
              <Colors />
              <div className="n-md-box">
                <div className="n-md-body">
                  <ChangeLog />
                </div>
              </div>
            </>
          )}
        </div>
        <Footer />
      </main>
      <n-back-top css=".back-top { position: fixed; }" />
      {scheme === 'light' || !isDark() ? <div className="n-site-bg" /> : null}
    </n-provider>
  );
}

export default App;
