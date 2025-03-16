import React from 'react';
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';

import { store } from '../../store';

import makeBtnWidget from './common/makeBtnWidget';

const ZoomOut: React.FC = makeBtnWidget({
  tooltip: '缩小',
  handler() {
    if (!store.graph) return false;
    const next = Number((store.zoom - 0.1).toPrecision(2));

    store.graph.zoomTo(next);
    store.zoom = next;
    return false;
  },
  getIcon() {
    return <ZoomOutOutlined />;
  },
  disabled() {
    return (store.zoom || 0) <= store.zoomRang[0];
  },
});

const ZoomIn: React.FC = makeBtnWidget({
  tooltip: '放大',
  handler() {
    if (!store.graph) return false;
    const next = Number((store.zoom + 0.1).toPrecision(2));

    store.graph.zoomTo(next);
    store.zoom = next;
    return false;
  },
  getIcon() {
    return <ZoomInOutlined />;
  },
  disabled() {
    return (store.zoom || 0) >= store.zoomRang[1];
  },
});

const Zoom: React.FC = (props) => {
  const { zoom } = store;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <ZoomOut {...props} />
      <span style={{ width: 45, textAlign: 'center' }}>{(zoom * 100).toFixed(0)}%</span>
      <ZoomIn {...props} />
    </div>
  );
};

export default Zoom;
