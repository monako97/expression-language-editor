import React from 'react';
import { type DragSourceMonitor, type DropTargetMonitor, useDrag, useDrop } from 'react-dnd';
import { type EdgeData, Graph } from '@antv/g6';

import type { ELDragItem } from '../options/groups';
import type { ElLikeData } from '../shape/rect-node';
import { clearState, getDataByClient, updateCellState } from '../store';

import * as styles from './index.module.less';

interface DropContainerProps {
  children: React.ReactNode;
  graph?: Graph;
}
export interface DragResult {
  type: 'node' | 'edge';
  target: ElLikeData | EdgeData | undefined;
  x: number;
  y: number;
  source: ELDragItem;
}

const DropContainer: React.FC<DropContainerProps> = ({ children, graph }) => {
  const [, dropRef] = useDrop({
    accept: 'DragItem',
    hover(_, monitor) {
      if (!graph) return;

      const offset = monitor.getClientOffset();

      if (offset) {
        clearState(graph, 'active');
        const result = getDataByClient(graph, [offset.x, offset.y]);

        if (result.target) {
          if (result.type === 'edge') {
            if (result.target.id) {
              graph.setElementState(result.target.id, ['active']);
            }
          } else {
            const _model = (result.target as ElLikeData).data?.model;

            if (_model) {
              updateCellState(graph, _model, 'active');
            }
          }
        }
      }
    },
    drop: (item, monitor): DragResult | void => {
      if (!graph) return;
      const offset = monitor.getClientOffset();

      if (offset) {
        clearState(graph, 'active');
        const result = getDataByClient(graph, [offset.x, offset.y]);

        return {
          source: item as ELDragItem,
          ...offset,
          ...result,
        };
      }
      return;
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver({ shallow: false }),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div className={styles.container} ref={dropRef as unknown as React.Ref<HTMLDivElement>}>
      {children}
    </div>
  );
};

interface DragItemProps {
  onDragEnd?: (item: DragResult) => void;
  item: ELDragItem;
}

export const DragItem: React.FC<DragItemProps> = (props) => {
  const { item, onDragEnd } = props;
  const [{ isDragging }, dragRef] = useDrag({
    type: 'DragItem',
    item: item,
    collect: (monitor: { isDragging: () => boolean }) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (_: ELDragItem, monitor: DragSourceMonitor) => {
      const dropResult = monitor.getDropResult<DragResult>();

      if (dropResult && onDragEnd) {
        onDragEnd(dropResult);
      }
    },
  });

  return (
    <div ref={dragRef as unknown as React.Ref<HTMLDivElement>} className={styles.cell}>
      <img
        className={styles.icon}
        src={item.icon}
        style={{
          cursor: 'move',
          opacity: isDragging ? 0.4 : 1,
          pointerEvents: isDragging ? 'none' : 'auto',
        }}
      />
      <p className={styles.label}>{item.label}</p>
    </div>
  );
};

export default DropContainer;
