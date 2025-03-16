import type { NodeData } from '@antv/g6';

import icon from '../../assets/when-icon.svg';
import { ConditionTypeEnum, NodeTypeEnum } from '../../enums';
import { type CellOption, ELNode, type GraphData, type Properties } from '../node';
import { colorMap, getConditionNodeStyle } from '../utils';
import { ELEndNode } from '../utils/end';
import { ELStartNode } from '../utils/start';

import { NodeOperator } from './node-operator';

/**
 * 并行编排操作符：WHEN。
 *
 * 例如一个并行编排(WHEN)示例：
 * (1) EL表达式语法：THEN(a, WHEN(b, c, d), e)
 * (2) JSON表示形式：
 * {
    type: ConditionTypeEnum.THEN,
    children: [
      { type: NodeTypeEnum.COMMON, id: 'a' },
      {
        type: ConditionTypeEnum.WHEN,
        children: [
          { type: NodeTypeEnum.COMMON, id: 'b' },
          { type: NodeTypeEnum.COMMON, id: 'c' },
          { type: NodeTypeEnum.COMMON, id: 'd' },
        ],
      },
      { type: NodeTypeEnum.COMMON, id: 'e' },
    ],
  }
  * (3) 通过ELNode节点模型进行表示的组合关系为：
                                          ┌─────────────────┐      ┌─────────────────┐
                                      ┌──▶│  NodeOperator   │  ┌──▶│  NodeOperator   │
  ┌─────────┐    ┌─────────────────┐  │   └─────────────────┘  │   └─────────────────┘
  │  Chain  │───▶│  ThenOperator   │──┤   ┌─────────────────┐  │   ┌─────────────────┐
  └─────────┘    └─────────────────┘  ├──▶│  WhenOperator   │──┼──▶│  NodeOperator   │
                                      │   └─────────────────┘  │   └─────────────────┘
                                      │   ┌─────────────────┐  │   ┌─────────────────┐
                                      └──▶│  NodeOperator   │  └──▶│  NodeOperator   │
                                          └─────────────────┘      └─────────────────┘
 */
export class WhenOperator extends ELNode {
  static icon = icon;
  static label = '并行(When)';
  static type = ConditionTypeEnum.WHEN;
  static startNode: NodeData;
  static endNode?: NodeData;
  type = ConditionTypeEnum.WHEN;
  parent?: ELNode;
  children: ELNode[] = [];
  properties?: Properties;

  constructor(parent?: ELNode, children?: ELNode[], properties?: Properties) {
    super();
    this.parent = parent;
    if (children) {
      this.children = children;
    }
    this.properties = properties;
  }

  public static create(parent?: ELNode, type?: NodeTypeEnum): ELNode {
    const newNode = new WhenOperator(parent);

    newNode.appendChild(NodeOperator.create(newNode, type));
    return newNode;
  }

  public toCells(options: CellOption = {}): GraphData {
    this.resetCells();
    const { children, cells, id } = this;
    const toolbar = {
      prepend: true,
      append: true,
      delete: true,
      replace: true,
      collapse: true,
    };
    const label = this.properties?.memo ?? this.properties?.tag ?? this.id;
    const color = colorMap[this.type];

    if (!this.startNode) {
      this.startNode = {
        id: `${id}-START`,
        style: getConditionNodeStyle({
          labelText: label,
          iconSrc: this.icon,
          fill: color,
          toolbar: toolbar,
          badgeText: this.type,
        }),
      };
    }
    this.startNode.data = {
      model: new ELStartNode(this),
    };
    cells.nodes.push(this.addNode(this.startNode));

    if (!this.endNode) {
      this.endNode = {
        id: `${id}-END`,
        style: getConditionNodeStyle({
          labelText: label,
          fill: color,
          toolbar: toolbar,
          badgeText: `${this.type} 结束`,
        }),
      };
    }
    this.endNode.data = {
      model: new ELEndNode(this),
    };
    cells.nodes.push(this.addNode(this.endNode));

    if (children.length) {
      children.forEach((child) => {
        child.toCells(options);
        const nextStartNode = child.getStartNode();

        cells.edges.push({
          id: `${this.startNode!.id}->${nextStartNode.id}`,
          source: this.startNode!.id,
          target: nextStartNode.id,
          data: {
            owner: this.type,
          },
        });
        const nextEndNode = child.getEndNode();

        cells.edges.push({
          id: `${nextEndNode.id}->${this.endNode!.id}`,
          source: nextEndNode.id,
          target: this.endNode!.id,
          data: {
            owner: this.type,
          },
        });
      });
    } else {
      cells.edges.push({
        id: `${this.startNode!.id}->${this.endNode!.id}`,
        source: this.startNode!.id,
        target: this.endNode!.id,
        data: {
          owner: this.type,
        },
      });
    }
    const ids = this.getNodes()
      .map((n) => n.id)
      .filter((n) => ![this.startNode!.id].includes(n));

    if (ids.length && this.startNode) {
      this.startNode.children = ids;
    }

    return this.getCells();
  }

  public toEL(prefix?: string): string {
    const { type } = this;

    if (typeof prefix === 'string') {
      return `${prefix}${type}(\n${this.children
        .map((x) => x.toEL(`${prefix}  `))
        .join(', \n')}\n${prefix})${this.propertiesToEL()}`;
    }
    return `${type}(${this.children.map((x) => x.toEL()).join(', ')})${this.propertiesToEL()}`;
  }
}
