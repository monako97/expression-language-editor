import type { NodeData } from '@antv/g6';

import icon from '../../assets/and-icon.svg';
import { ConditionTypeEnum, NodeTypeEnum } from '../../enums';
import { type CellOption, ELNode, type GraphData, type Properties } from '../node';
import { colorMap, getConditionNodeStyle } from '../utils';
import { ELEndNode } from '../utils/end';
import { ELStartNode } from '../utils/start';

import { NodeOperator } from './node-operator';

/**
 * 与操作符：AND。
 *
 * 例如一个与(AND)示例：
 * (1) EL表达式语法：IF(AND(a, b)), c)
 * (2) JSON表示形式：
 * {
    type: ConditionTypeEnum.IF,
    condition: {
      type: ConditionTypeEnum.AND,
      children: [
        { type: NodeTypeEnum.COMMON, id: 'a' },
        { type: NodeTypeEnum.COMMON, id: 'b' }
      ]
    },
    children: [
      { type: NodeTypeEnum.COMMON, id: 'c' }
    ],
  }
  * (3) 通过ELNode节点模型进行表示的组合关系为：
                                          ┌─────────────────┐      ┌─────────────────┐
                                      ┌──▶│  AndOperator    │──┌──▶│  NodeOperator   │
  ┌─────────┐    ┌─────────────────┐  │   └─────────────────┘  │   └─────────────────┘
  │  Chain  │───▶│    IfOperator   │──┤   ┌─────────────────┐  │   ┌─────────────────┐
  └─────────┘    └─────────────────┘  └──▶│  NodeOperator   │  └──▶│  NodeOperator   │
                                          └─────────────────┘      └─────────────────┘
 */
export class AndOperator extends ELNode {
  static icon = icon;
  static label = '与(And)';
  static startNode: NodeData;
  static endNode?: NodeData;
  static type = ConditionTypeEnum.AND;
  type = ConditionTypeEnum.AND;
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
    const newNode = new AndOperator(parent);

    newNode.appendChild(NodeOperator.create(newNode, type));
    return newNode;
  }

  public toCells(options: CellOption = {}): GraphData {
    this.resetCells();
    const { children, cells } = this;
    const label = this.properties?.memo ?? this.properties?.tag ?? this.id;
    const toolbar = {
      prepend: true,
      append: true,
      delete: true,
      replace: true,
      collapse: true,
    };
    const color = colorMap[this.type];

    if (!this.startNode) {
      this.startNode = {
        id: `${this.id}-START`,
        ...options,
        style: getConditionNodeStyle({
          toolbar: toolbar,
          labelText: label,
          iconSrc: this.icon,
          fill: color,
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
        id: `${this.id}-END`,
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
        child.toCells();
        const nextStartNode = child.getStartNode();

        cells.edges.push({
          id: `${this.startNode!.id}->${nextStartNode.id}`,
          source: this.startNode!.id,
          target: nextStartNode.id,
          style: {
            labelAutoRotate: false,
            labelText: '+',
            labelFill: '#fff',
            labelPadding: [0, 3],
            labelBackground: true,
            labelBackgroundFill: color,
            labelBackgroundRadius: 16,
            inset: false,
          },
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
    const childrens = this.getNodes().filter((n) => ![this.startNode!.id].includes(n.id));

    if (childrens.length && this.startNode) {
      this.startNode.children = childrens.map((n) => n.id);
    }
    return this.getCells();
  }

  public toEL(prefix?: string): string {
    if (typeof prefix === 'string') {
      return `${prefix}AND(\n${this.children
        .map((x) => x.toEL(`${prefix}  `))
        .join(', \n')}\n${prefix})${this.propertiesToEL()}`;
    }
    return `AND(${this.children.map((x) => x.toEL()).join(', ')})${this.propertiesToEL()}`;
  }
}
