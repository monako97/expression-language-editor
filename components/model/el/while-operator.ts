import type { NodeData } from '@antv/g6';

import icon from '../../assets/while-icon.svg';
import { ConditionTypeEnum, NodeTypeEnum } from '../../enums';
import { type CellOption, ELNode, type GraphData, type Properties } from '../node';
import { colorMap, getConditionNodeStyle } from '../utils';
import { ELEndNode } from '../utils/end';

import { NodeOperator } from './node-operator';

/**
 * 循环编排操作符：WHILE。
 *
 * 例如一个WHILE循环编排示例：
 * (1) EL表达式语法：WHILE(x).DO(THEN(a, b))
 * (2) JSON表示形式：
 * {
    type: ConditionTypeEnum.WHILE,
    condition: { type: NodeTypeEnum.WHILE, id: 'x' },
    children: [
      {
        type: ConditionTypeEnum.THEN,
        children: [
          { type: NodeTypeEnum.COMMON, id: 'a' },
          { type: NodeTypeEnum.COMMON, id: 'b' },
        ],
      },
    ],
  }
  * (3) 通过ELNode节点模型进行表示的组合关系为：
                                          ┌─────────────────┐
                                      ┌──▶│  NodeOperator   │
  ┌─────────┐    ┌─────────────────┐  │   └─────────────────┘      ┌─────────────────┐
  │  Chain  │───▶│  WhileOperator  │──┤   ┌─────────────────┐  ┌──▶│  NodeOperator   │
  └─────────┘    └─────────────────┘  └──▶│  ThenOperator   │──┤   └─────────────────┘
                                          └─────────────────┘  │   ┌─────────────────┐
                                                               └──▶│  NodeOperator   │
                                                                   └─────────────────┘
 */
export class WhileOperator extends ELNode {
  static icon = icon;
  static label = 'While循环';
  static type = ConditionTypeEnum.WHILE;
  static startNode?: NodeData;
  static endNode?: NodeData;
  type = ConditionTypeEnum.WHILE;
  condition: ELNode = new NodeOperator(this, NodeTypeEnum.WHILE, 'x');
  children: ELNode[] = [];
  properties?: Properties;

  constructor(parent?: ELNode, condition?: ELNode, children?: ELNode[], properties?: Properties) {
    super();
    this.parent = parent;
    if (condition) {
      this.condition = condition;
    }
    if (children) {
      this.children = children;
    }
    this.properties = properties;
  }

  public static create(parent?: ELNode, type?: NodeTypeEnum): ELNode {
    const newNode = new WhileOperator(parent);

    newNode.appendChild(NodeOperator.create(newNode, type));
    return newNode;
  }

  public toCells(options: CellOption = {}): GraphData {
    this.resetCells();
    const { condition, children, cells } = this;

    condition.toCells({
      type: NodeTypeEnum.WHILE,
    });
    const label = this.properties?.memo ?? this.properties?.tag ?? this.id;
    const toolbar = {
      prepend: true,
      append: true,
      delete: true,
      replace: true,
      collapse: true,
    };
    let start = condition.getStartNode()!;
    const color = colorMap[this.type];

    this.startNode = start;
    this.startNode.style = getConditionNodeStyle({
      labelText: label,
      iconSrc: this.icon,
      fill: color,
      toolbar: toolbar,
      badgeText: this.type,
    });
    this.startNode.data = {
      model: condition,
    };
    start = condition.getEndNode();

    if (!this.endNode) {
      this.endNode = {
        id: `${this.id}-END`,
        style: getConditionNodeStyle({
          labelText: label,
          fill: color,
          toolbar: toolbar,
          badgeText: `${this.type} 结束`,
        }),
      };
    }
    this.endNode.data = { model: new ELEndNode(this) };
    cells.nodes.push(this.addNode(this.endNode));

    if (children.length) {
      children.forEach((child) => {
        child.toCells(options);
        const nextStartNode = child.getStartNode();

        cells.edges.push({
          id: `${start.id}->${nextStartNode.id}`,
          source: start.id,
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
        id: `${start.id}->${this.endNode!.id}`,
        source: start.id,
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
    if (typeof prefix === 'string') {
      return `${prefix}WHILE(${this.condition.toEL()}).DO(\n${this.children
        .map((x) => x.toEL(`${prefix}  `))
        .join(', \n')}\n${prefix})${this.propertiesToEL()}`;
    }

    return `WHILE(${this.condition.toEL()}).DO(${this.children.map((x) => x.toEL()).join(', ')})`;
  }
}
