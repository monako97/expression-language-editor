import type { ZoomCanvasOptions } from '@antv/g6';

import { store } from '../store';

export const zoomCanvas: ZoomCanvasOptions = {
  key: 'zoom-canvas',
  type: 'zoom-canvas',
  enable: true,
  //  trigger: ['Control'],
  onFinish() {
    if (!store.graph) return;
    store.zoom = store.graph.getZoom();
  },
};
