import { type ContextmenuOptions, Graph } from '@antv/g6';

import { ELNode } from '../model/node';
import type { ToolbarProps } from '../shape/rect-node';
import { removeElNode } from '../store';

export const contextmenu: ContextmenuOptions = {
  type: 'contextmenu',
  trigger: 'contextmenu',
  onClick: (value, _, current) => {
    const graph = (current as { context?: { graph: Graph } }).context?.graph;

    if (!graph) return;

    const data = graph.getNodeData(current.id);
    const _model = data.data?.model as ELNode;

    switch (value) {
      case 'delete':
        removeElNode(graph, _model);
        break;
      case 'prepend':
      case 'append':
      case 'replace':
      default:
        break;
    }
  },
  getItems: (e) => {
    const graph: Graph = (e.target.config as { context: { graph: Graph } }).context.graph;
    const data = graph.getNodeData(e.target.id);
    const toolbar = (data.style?.toolbar || {}) as ToolbarProps;

    return [
      {
        name: '前面插入节点',
        value: 'prepend',
        enable: toolbar.prepend,
      },
      {
        name: '后面插入节点',
        value: 'append',
        enable: toolbar.append,
      },
      {
        name: '替换当前节点',
        value: 'replace',
        enable: toolbar.replace,
      },
      {
        name: '删除当前节点',
        value: 'delete',
        enable: toolbar.delete,
      },
    ].filter((item) => item.enable);
  },
  enable: (e) => {
    return e.targetType === 'node';
  },
};
