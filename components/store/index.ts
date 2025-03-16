import {
  CanvasEvent,
  type Edge,
  type EdgeData,
  EdgeEvent,
  type FitViewOptions,
  type Graph,
  GraphEvent,
  type GraphOptions,
  type IEvent,
  type IPointerEvent,
  NodeEvent,
  type Point,
} from '@antv/g6';
import { Modal, notification } from 'neko-ui';
import sso from 'shared-store-object';

import { createGraph as createElGraph } from '../graph';
import { ELBuilder } from '../model/builder';
import type { DSL, ELNode } from '../model/node';
import { EDGE_EVENT, ElEdge } from '../shape/edge';
import {
  type ElLikeData,
  ElRectNode,
  getLabelWidth,
  NODE_EVENT,
  type ToolbarProps,
} from '../shape/rect-node';

import { pushHistory, resetHistory } from './history';

export interface TagOption {
  label: React.ReactNode;
  value?: string | number | null;
}

export const store = sso({
  wrapper: null as HTMLElement | null,
  graph: void 0 as Graph | undefined,
  zoom: 1,
  readonly: false,
  tagOptions: [] as TagOption[],
  fullscreen: false,
  zoomRang: [0.05, 1] as [number, number],
});

export const model = sso({
  root: void 0 as ELNode | undefined,
  action: 'append' as keyof ToolbarProps | 'inset',
  code: void 0 as string | undefined,
  dsl: {} as DSL,
  setting: 'code' as 'properties' | 'outline' | 'code' | undefined,
  refresh: 0,
  relayout: 0,
});

export const modelRelayout = () => {
  model.relayout = model.relayout + 1;
};

export const modelRefresh = () => {
  model.refresh = model.refresh + 1;
  model.code = model.root?.toEL('');
  model.dsl = model.root?.toJSON() || {};
};

export const refreshDraw = async () => {
  if (!store.graph) return;
  store.graph.draw();
};
export const reset = () => {
  model.dsl = {};
  model.code = void 0;
  model.root = void 0;
  model.setting = void 0;
};

export async function fitView(options?: FitViewOptions, animation?: boolean) {
  if (!store.graph) return;
  await store.graph.fitView(options, animation);
  store.zoom = store.graph.getZoom();
}
export const fromJSON = (data: DSL = {}) => {
  if (!store.graph) {
    notification.error('Graph 尚未初始化');
    return false;
  }
  reset();
  const root = ELBuilder.build(data);

  model.root = root;
  model.setting = 'code';
  modelRelayout();
  modelRefresh();
  store.graph.once(GraphEvent.AFTER_LAYOUT, () => {
    fitView({ when: 'overflow' }, false);
  });
  return true;
};
export const toJSON = () => {
  if (!store.graph || !model.root) {
    notification.error('Graph 尚未初始化');
    return {};
  }
  return model.root.toJSON();
};
export const graphResize = () => {
  const parent = store.graph?.getCanvas()?.getContainer();

  if (store.graph && parent) {
    const width = parent.clientWidth;
    const height = parent.clientHeight;

    store.graph.resize(width, height);
  }
};

export const graphDestroy = () => {
  reset();
  const graph = store.graph;

  if (graph) {
    graph.off();
    graph.destroy();
    store.graph = void 0;
  }
};

export async function updateCellState(graph: Graph, node: ELNode, state: string, remove = false) {
  const realNode = node.parent?.condition?.id === node.id ? node.parent : node;

  if (!realNode) return;
  const cells = realNode.getCells();
  const list = [...cells.nodes, ...cells.edges].map((item) => item.id!);

  await Promise.all(
    list.map((id) => {
      const hasCell = graph.getElementData(id);

      if (!hasCell) return;
      const prev = graph.getElementState(id);

      if (remove) {
        return graph.setElementState(
          id,
          prev.filter((p) => p !== state),
        );
      }
      return graph.setElementState(id, [...new Set(prev.concat(state))]);
    }),
  );
}
export const createGraph = (options: GraphOptions) => {
  if (options.container) {
    resetHistory();
    model.root = ELBuilder.build({});
    const _graph = createElGraph({ ...options, zoomRange: store.zoomRang });

    _graph.render();
    _graph.on<ELNode>(NODE_EVENT.append, (e) => {
      model.action = 'append';
      selectNode(e);
    });
    _graph.on<ELNode>(NODE_EVENT.prepend, (e) => {
      model.action = 'prepend';
      selectNode(e);
    });
    _graph.on<ELNode>(NODE_EVENT.replace, (e) => {
      model.action = 'replace';
      selectNode(e);
    });
    _graph.on<ELNode>(NODE_EVENT.delete, (e) => {
      model.action = 'delete';
      clearState(_graph, 'selected');
      removeElNode(_graph, e);
    });
    _graph.on<ElEdge>(EDGE_EVENT.inset, (e) => {
      model.action = 'inset';
      clearState(_graph, 'selected');
      _graph.setElementState(e.id, ['selected']);
    });
    _graph.on(CanvasEvent.CLICK, () => {
      clearState(_graph, 'active');
      clearState(_graph, 'selected');
      modelRefresh();
      if (model.setting === 'properties') {
        model.setting = 'code';
      }
    });
    _graph.on<IPointerEvent<ElRectNode>>(NodeEvent.CLICK, (e) => {
      clearState(_graph, 'selected').then(() => {
        const target = e.target.name === ElRectNode.name ? e.target : e.target.owner;

        if (target && _graph.getNodeData(target.id)) {
          _graph.setElementState(target.id, ['selected']).finally(() => {
            modelRefresh();
            model.setting = 'properties';
          });
        }
      });
    });
    _graph.on<{ target: Edge } & IEvent>(EdgeEvent.CLICK, () => {
      if (model.setting === 'properties') {
        model.setting = 'code';
      }
    });
    _graph.on<{ target: Edge } & IEvent>(EdgeEvent.POINTER_OVER, (e) => {
      const hasEdge = _graph.getEdgeData(e.target.id);

      if (hasEdge) {
        _graph.setElementZIndex(e.target.id, 2);
        const prev = _graph.getElementState(e.target.id);

        _graph.setElementState(e.target.id, [...new Set(prev.concat('active'))]);
      }
    });
    _graph.on<{ target: Edge } & IEvent>(EdgeEvent.POINTER_LEAVE, (e) => {
      const hasEdge = _graph.getEdgeData(e.target.id);

      if (hasEdge) {
        _graph.setElementZIndex(e.target.id, -1);
        const prev = _graph.getElementState(e.target.id);

        _graph.setElementState(
          e.target.id,
          prev.filter((p) => p !== 'active'),
        );
      }
    });
    _graph.on<IPointerEvent<ElRectNode>>(NodeEvent.POINTER_ENTER, (e) => {
      const target = e.target.name === ElRectNode.name ? e.target : e.target.owner;

      if (target && target.data?.data?.model) {
        updateCellState(_graph, target.data.data.model, 'active');
      }
    });
    _graph.on<IPointerEvent<ElRectNode>>(NodeEvent.POINTER_LEAVE, (e) => {
      const target = e.target.name === ElRectNode.name ? e.target : e.target.owner;

      if (target && target.data?.data?.model) {
        updateCellState(_graph, target.data.data.model, 'active', true);
      }
    });
    _graph.once(GraphEvent.AFTER_LAYOUT, () => {
      _graph.fitCenter();
    });
    store.graph = _graph;
  }
};

export const refreshLayout = async () => {
  const { graph } = store;

  if (model.root && graph) {
    const cells = model.root.toCells();

    graph.removeData({
      nodes: graph.getNodeData().map((n) => n.id),
      edges: graph.getEdgeData().map((n) => n.id!),
      combos: graph.getComboData().map((n) => n.id),
    });
    await graph.draw();
    graph.addData(cells);
    await graph.layout();
  }
};
export const clearCells = (current: ELNode | undefined) => {
  const graph = store.graph!;

  if (!current || !graph) return;
  const cells = current.getCells();
  const clearData = {
    edges: cells.edges.map((edge) => edge.id!),
    nodes: cells.nodes.map((node) => node.id),
    combos: cells.combos.map((combo) => combo.id),
  };

  if (current.endNode?.id) {
    const edges = graph.getRelatedEdgesData(current.endNode.id);

    edges.forEach((edge) => {
      if (!clearData.edges.includes(edge.id!)) {
        clearData.edges.push(edge.id!);
      }
    });
  }
  if (current.startNode?.id) {
    const edges = graph.getRelatedEdgesData(current.startNode.id);

    edges.forEach((edge) => {
      if (!clearData.edges.includes(edge.id!)) {
        clearData.edges.push(edge.id!);
      }
    });
    current.startNode.children?.forEach((nodeId) => {
      if (!clearData.nodes.includes(nodeId)) {
        clearData.nodes.push(nodeId);
      }
    });
  }
  graph.removeData(clearData);
};
export const removeElNode = async (graph: Graph, removeModel: ELNode) => {
  Modal.open({
    title: '确认要删除选中的节点？',
    content: '点击删除按钮进行删除，点击取消按钮返回',
    okText: '删除',
    okProps: {
      danger: true,
    },
    cancelText: '取消',
    maskClosable: false,
    escClosable: false,
    closeIcon: null,
    async onOk() {
      clearCells(removeModel);
      await graph.render();
      removeModel.remove();
      pushHistory();
      return true;
    },
  });
};
export async function selectNode(currentModel: ELNode, focus?: boolean) {
  try {
    const graph = store.graph;

    if (!graph) return;
    await clearState(graph, 'active');
    await updateCellState(graph, currentModel, 'active');
    const start = currentModel.getStartNode();

    if (focus) {
      await graph.focusElement([start.id, ...(start.children || [])]);
    }
    await graph.setElementState(start.id, ['active', 'selected']);
    modelRefresh();
  } catch {
    void 0;
  }
}
function findElementByPoint<T extends { id?: string }>(
  graph: Graph,
  data: T[],
  point: Point,
): T | undefined {
  const [x, y] = graph.getCanvasByClient([point[0], point[1]]);
  let closestElement: T | undefined;
  let minDistanceSquared = Infinity;

  for (const node of data) {
    if (!node.id) continue;
    // 获取元素包围盒
    const bbox = graph.getElementRenderBounds(node.id);
    const [minX, minY] = bbox.getMin();
    const [maxX, maxY] = bbox.getMax();

    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
      // 计算点到包围盒的最近距离（平方）
      let dx = 0;

      if (x < minX) dx = minX - x;
      else if (x > maxX) dx = x - maxX;

      let dy = 0;

      if (y < minY) dy = minY - y;
      else if (y > maxY) dy = y - maxY;

      const distanceSquared = dx * dx + dy * dy;

      // 更新最近元素
      if (distanceSquared < minDistanceSquared) {
        minDistanceSquared = distanceSquared;
        closestElement = node;
      }
    }
  }

  return closestElement;
}
export async function clearState(graph: Graph, state: string) {
  const list = [
    ...graph.getElementDataByState('node', state),
    ...graph.getElementDataByState('edge', state),
    ...graph.getElementDataByState('combo', state),
  ].map((item) => item.id!);

  await Promise.all(list.map((id) => graph.setElementState(id, [])));
}
export function getDataByClient(graph: Graph, point: Point) {
  const result = {
    type: 'node' as 'node' | 'edge',
    target: void 0 as ElLikeData | EdgeData | undefined,
  };

  result.target = findElementByPoint(graph, graph.getNodeData(), point);

  if (!result.target) {
    result.type = 'edge';
    result.target = findElementByPoint(graph, graph.getEdgeData(), point);
  }
  return result;
}

export function getSelectElNode() {
  const graph = store.graph;

  if (!graph) return;
  const node = graph.getElementDataByState('node', 'selected')?.[0] as ElLikeData;
  const selected = node?.data?.model;
  const current = selected?.proxy || selected;

  return current;
}

function updateLabel(graph: Graph, el: ElLikeData, label: string | undefined) {
  if (el.data) {
    graph.updateNodeData([
      { id: el.id, style: { labelText: label, size: [getLabelWidth(label), 40] } },
    ]);
  }
}
export function updateElNodeData(
  current: ELNode | undefined,
  key: string,
  value: string | number | boolean | null,
) {
  if (!current || !store.graph) return;
  const next = current.getProperties();

  if (key === 'id' && value) {
    current.id = value as string;
  } else {
    next[key] = value;
    current.setProperties(next);
  }

  if (['memo', 'tag', 'id'].includes(key)) {
    const label = next.memo || next.tag || current.id;

    updateLabel(store.graph, current.getStartNode(), label);
    updateLabel(store.graph, current.getEndNode(), label);
  }
  pushHistory({ silent: true });
  modelRefresh();
}
