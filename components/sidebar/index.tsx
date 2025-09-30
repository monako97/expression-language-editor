import React, { useRef } from 'react';
import type { EdgeData } from '@antv/g6';
import { Collapse } from 'antd';

import { DragItem, type DragResult } from '../drag';
import { ConditionTypeEnum, NodeTypeEnum } from '../enums';
import { ELBuilder } from '../model/builder';
import { ELNode } from '../model/node';
import { groups } from '../options/groups';
import { fromJSON, store } from '../store';
import { pushHistory } from '../store/history';

import * as styles from './index.module.less';

const SideBar: React.FC = () => {
  const lastEdge = useRef<EdgeData>(null);

  const onDragEnd = async (item: DragResult) => {
    const _graph = store.graph!;
    // 完全进入画布，则生成一个节点

    if (_graph.getNodeData().length === 0) {
      // 没有节点创建一个空块
      fromJSON({});
      Object.assign(lastEdge, {
        current: _graph.getEdgeData()?.[0],
      });
    }
    if (item.type === 'edge') {
      Object.assign(lastEdge, {
        current: item.target,
      });
    }
    if (lastEdge.current) {
      const targetNode = _graph.getNodeData(lastEdge.current.target);
      const targetModel = (targetNode.data || {}).model as ELNode;
      const sourceNode = _graph.getNodeData(lastEdge.current.source);
      const sourceModel = (sourceNode?.data || {}).model as ELNode;
      const inComingEdges = _graph.getRelatedEdgesData(lastEdge.current.target);

      if (inComingEdges.length > 1 || (sourceModel && targetModel?.isParentOf(sourceModel))) {
        sourceModel?.append(ELBuilder.createELNode(item.source.type as NodeTypeEnum, targetModel));
      } else {
        targetModel?.prepend(ELBuilder.createELNode(item.source.type as NodeTypeEnum, targetModel));
      }
      pushHistory();
    } else if (item.type === 'node' && item.target) {
      const next = ELBuilder.createELNode(item.source.type as ConditionTypeEnum);
      const model = item.target.data!.model as ELNode;

      model?.replace(next);
      pushHistory();
    }

    Object.assign(lastEdge, {
      current: void 0,
    });
  };

  return (
    <div className={styles.container}>
      <Collapse
        ghost
        bordered={false}
        className={styles.collapse}
        defaultActiveKey={['node', 'sequence', 'branch', 'control', 'other', 'chain']}
        items={groups.map((group) => ({
          key: group.key,
          label: group.name,
          className: styles.panel,
          children: group.cellTypes.map((item, index) => (
            <DragItem key={index} item={item} onDragEnd={onDragEnd} />
          )),
        }))}
      />
    </div>
  );
};

export default SideBar;
