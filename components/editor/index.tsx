import React, { useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import BreadcrumbPath from '../breadcrumb';
import DropContainer from '../drag';
import SettingBar from '../setting';
import SideBar from '../sidebar';
import {
  createGraph,
  graphDestroy,
  graphResize,
  model,
  refreshDraw,
  refreshLayout,
  store,
  type TagOption,
} from '../store';
import { resetHistory } from '../store/history';
import TopBar from '../topbar';

import * as styles from './index.module.less';

export interface ElEditorProps {
  /**
   * 样式类
   */
  className?: string;
  /**
   * 工具栏组件
   */
  widgets?: React.FC[];
  /**
   * 更多子节点
   */
  children?: React.ReactNode;
  disabled?: boolean;
  tagOptions?: TagOption[];
  style?: React.CSSProperties;
}

export function ElEditor({ tagOptions, disabled, widgets }: ElEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { graph, readonly } = store;
  const { relayout, refresh } = model;

  useEffect(() => {
    if (tagOptions) {
      store.tagOptions = tagOptions;
    }
  }, [tagOptions]);
  useEffect(() => {
    createGraph({ container: containerRef.current! });
    store.wrapper = wrapperRef.current;
    return () => {
      graphDestroy();
    };
  }, []);
  useEffect(() => {
    refreshDraw();
  }, [refresh]);
  useEffect(() => {
    refreshLayout();
  }, [relayout]);
  useEffect(() => {
    store.readonly = !!disabled;
    graphResize();
    resetHistory();
  }, [disabled]);

  return (
    <div ref={wrapperRef} className={styles.container}>
      <DndProvider backend={HTML5Backend}>
        <div className={styles.topbar}>
          <TopBar widgets={widgets} />
        </div>
        <div className={styles.layout}>
          {!readonly && (
            <div className={styles.side}>
              <SideBar />
            </div>
          )}
          <DropContainer graph={graph}>
            <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
            <BreadcrumbPath />
          </DropContainer>
          <div className={styles.setting}>
            <SettingBar />
          </div>
        </div>
      </DndProvider>
    </div>
  );
}
