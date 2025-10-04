import {
  type EdgeData,
  ExtensionCategory,
  Graph,
  GraphEvent,
  type GraphOptions,
  type LayoutOptions,
  type NodeData,
  register,
} from '@antv/g6';
import type { ConditionTypeEnum } from '@pkg/enums';

import { dragCanvas } from '../behaviors/drag-canvas';
import { dragElement } from '../behaviors/drag-element';
import { zoomCanvas } from '../behaviors/zoom-canvas';
import { colorMap } from '../model/utils';
import { addPanelMenu } from '../plugins/add-panel';
import { contextmenu } from '../plugins/contentmenu';
import { ElEdge } from '../shape/edge';
import { ElRectNode, getLabelWidth } from '../shape/rect-node';

register(ExtensionCategory.EDGE, ElEdge.type, ElEdge);
register(ExtensionCategory.NODE, ElRectNode.type, ElRectNode);

export function createGraph(options: GraphOptions) {
  const layout: LayoutOptions = {
    type: 'antv-dagre',
    nodeSize: (node: { data: NodeData }) => {
      if (node.data.style?.size) {
        return node.data.style.size;
      }
      return [getLabelWidth(node.data.style?.labelText), 40];
    },
    ranksep: 40,
    nodesep: 40,
    align: void 0,
    rankdir: 'TB',
    controlPoints: true,
    preLayout: true,
  };
  const getEdgeHaloStyle = (edge: EdgeData) => {
    const owner = edge.data?.owner as ConditionTypeEnum;

    if (!owner || !colorMap[owner]) {
      return {
        halo: true,
      };
    }
    return {
      stroke: colorMap[owner],
      halo: true,
    };
  };

  const graph = new Graph({
    autoResize: true,
    layout: layout,
    animation: {
      delay: 0,
      duration: 0,
    },
    node: {
      type: ElRectNode.type,
      style: {
        ports: [
          { key: 'top', placement: 'top' },
          { key: 'bottom', placement: 'bottom' },
        ],
      },
    },
    edge: {
      type: ElEdge.type,
      style: {
        endArrow: true,
        radius: 16,
        router: {
          type: 'orth',
        },
        zIndex: -1,
      },
      state: {
        active: getEdgeHaloStyle,
        selected: getEdgeHaloStyle,
      },
    },
    ...options,
  });

  graph.once(GraphEvent.AFTER_RENDER, () => {
    graph.setPlugins((plugins) => plugins.concat([contextmenu, addPanelMenu]));
    graph.setBehaviors((behaviors) => [...behaviors, zoomCanvas, dragCanvas, dragElement]);
  });
  return graph;
}
