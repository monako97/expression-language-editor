import type { NodeData } from '@antv/g6';

import icon from '../../assets/common-icon.svg';
import { NodeTypeEnum } from '../../enums';
import { type CellOption, ELNode, type GraphData, type Properties } from '../node';
import { ELVirtualNode } from '../utils/virtual';

let rollingCode = 0;
/**
 * 节点组件操作符：是EL表达式树型结构的叶子结点。
 *
 * 例如一个串行编排(THEN)：
 * (1) EL表达式形式：THEN(a, b, c, d)
 * (2) JSON表示形式：
 * {
    type: ConditionTypeEnum.THEN,
    children: [
      { type: NodeTypeEnum.COMMON, id: 'a' },
      { type: NodeTypeEnum.COMMON, id: 'b' },
      { type: NodeTypeEnum.COMMON, id: 'c' },
      { type: NodeTypeEnum.COMMON, id: 'd' },
    ],
  }
 * (3) 通过ELNode节点模型进行表示的组合关系为：
                                          ┌─────────────────┐
                                      ┌──▶│  NodeOperator   │
                                      │   └─────────────────┘
                                      │   ┌─────────────────┐
                                      ├──▶│  NodeOperator   │
  ┌─────────┐    ┌─────────────────┐  │   └─────────────────┘
  │  Chain  │───▶│  ThenOperator   │──┤   ┌─────────────────┐
  └─────────┘    └─────────────────┘  ├──▶│  NodeOperator   │
                                      │   └─────────────────┘
                                      │   ┌─────────────────┐
                                      └──▶│  NodeOperator   │
                                          └─────────────────┘
 */

export class NodeOperator extends ELNode {
  static icon = icon;
  static label = '节点';
  static type = NodeTypeEnum.COMMON;
  type = NodeTypeEnum.COMMON;
  id: string;
  nodeId: string;
  node?: NodeData;

  constructor(parent?: ELNode, type?: NodeTypeEnum, id?: string, properties?: Properties) {
    super();
    rollingCode++;
    this.parent = parent;
    this.type = type || NodeOperator.type;
    this.id = id || `Stage${rollingCode}`;
    this.nodeId = `Stage${rollingCode}`;
    this.properties = properties;
  }

  public static create(parent?: ELNode, type?: NodeTypeEnum, id?: string): NodeOperator {
    return new NodeOperator(parent, type, id);
  }

  public toCells(options: CellOption = {}): GraphData {
    if (!this.node) {
      this.resetCells();
      const { nodeId, id, cells } = this;

      this.node = {
        id: nodeId,
        type: this.type,
        ...(options || {}),
        data: {
          model: this,
        },
      };

      if (this.type === NodeTypeEnum.VIRTUAL) {
        this.node.style = {
          labelFill: '#43BA89',
          iconSrc: ELVirtualNode.icon,
          labelX: -14,
          labelY: 30,
          fill: null,
          stroke: null,
          iconWidth: 40,
          iconHeight: 40,
          iconX: 0,
          toolbar: {
            prepend: false,
            append: false,
            delete: true,
            replace: true,
          },
        };
      } else {
        this.node.style = {
          labelText: this.properties?.memo ?? this.properties?.tag ?? id,
          iconSrc: this.icon,
          toolbar: {
            prepend: true,
            append: true,
            delete: true,
            replace: true,
          },
        };
      }
      cells.nodes.push(this.addNode(this.node));
    }
    return this.getCells();
  }

  public getStartNode(): NodeData {
    return this.node!;
  }

  public getEndNode(): NodeData {
    return this.node!;
  }

  public toEL(prefix: string = ''): string {
    return `${prefix}${this.id}${this.propertiesToEL()}`;
  }
}
