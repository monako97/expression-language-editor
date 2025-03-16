import React, { useEffect } from 'react';
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';

import { store } from '../../store';

import makeBtnWidget from './common/makeBtnWidget';

interface IDocument extends Document {
  mozFullScreenElement: Document['fullscreenElement'];
  msFullScreenElement: Document['fullscreenElement'];
  webkitFullscreenElement: Document['fullscreenElement'];
  mozCancelFullScreen: Document['exitFullscreen'];
  msExitFullscreen: Document['exitFullscreen'];
  webkitExitFullscreen: Document['exitFullscreen'];
}
interface IHTMLElement extends HTMLElement {
  mozRequestFullScreen: HTMLElement['requestFullscreen'];
  msRequestFullscreen: HTMLElement['requestFullscreen'];
  webkitRequestFullscreen: HTMLElement['requestFullscreen'];
}
export function getFullscreenElement() {
  const element = document as IDocument;

  return (
    element.fullscreenElement ||
    element.mozFullScreenElement ||
    element.msFullScreenElement ||
    element.webkitFullscreenElement ||
    null
  );
}

const previousSize = { width: 800, height: 500 };
let onFullscreenChange = () => {
  // Do nothing
};

const Fullscreen: React.FC = makeBtnWidget({
  tooltip: '全屏',
  handler() {
    const graph = store.graph;

    if (!graph) return;
    const container = graph.getCanvas().getContainer();

    if (!container) return;
    const parent = container.parentElement?.parentElement?.parentElement as IHTMLElement;

    previousSize.width = container.clientWidth;
    previousSize.height = container.clientHeight;
    onFullscreenChange = () => {
      graph.resize(previousSize.width, previousSize.width);
      graph.fitCenter();
      graph.emit('graph:fullscreenchange', { data: !!getFullscreenElement() });
    };
    if (parent.requestFullscreen) {
      parent.requestFullscreen();
    } else if (parent.mozRequestFullScreen) {
      parent.mozRequestFullScreen();
    } else if (parent.msRequestFullscreen) {
      parent.msRequestFullscreen();
    } else if (parent.webkitRequestFullscreen) {
      parent.webkitRequestFullscreen();
    }

    document.addEventListener('fullscreenchange', onFullscreenChange);
  },
  getIcon() {
    return <FullscreenOutlined />;
  },
  disabled() {
    return false;
  },
});

const FullscreenExit: React.FC = makeBtnWidget({
  tooltip: '退出全屏',
  handler() {
    if (getFullscreenElement()) {
      if (onFullscreenChange) {
        onFullscreenChange();
      }
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      const element = document as IDocument;

      if (element.exitFullscreen) {
        element.exitFullscreen();
      } else if (element.mozCancelFullScreen) {
        element.mozCancelFullScreen();
      } else if (element.msExitFullscreen) {
        element.msExitFullscreen();
      } else if (element.webkitExitFullscreen) {
        element.webkitExitFullscreen();
      }
      store.fullscreen = false;
    }
  },
  getIcon() {
    return <FullscreenExitOutlined />;
  },
  disabled() {
    return false;
  },
});

const FullscreenTools: React.FC = () => {
  const { graph, fullscreen } = store;
  const fullscreenchange = (e: MessageEvent<boolean>) => {
    store.fullscreen = e.data;
  };

  useEffect(() => {
    graph?.on<MessageEvent<boolean>>('graph:fullscreenchange', fullscreenchange);
    return () => {
      graph?.off('graph:fullscreenchange', fullscreenchange);
    };
  }, [graph]);

  return fullscreen ? <FullscreenExit /> : <Fullscreen />;
};

export default FullscreenTools;
