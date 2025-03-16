import type { NodeData } from '@antv/g6';

import icon from '../../assets/not-icon.svg';
import { ConditionTypeEnum, NodeTypeEnum } from '../../enums';
import { type CellOption, ELNode, type GraphData, type Properties } from '../node';
import { colorMap, getConditionNodeStyle } from '../utils';
import { ELEndNode } from '../utils/end';
import { ELStartNode } from '../utils/start';
import { ELVirtualNode } from '../utils/virtual';

import { NodeOperator } from './node-operator';

/**
 * 非操作符：NOT。
 *
 * 例如一个非(NOT)示例：
 * (1) EL表达式语法：IF(NOT(a)), b)
 * (2) JSON表示形式：
 * {
    type: ConditionTypeEnum.IF,
    condition: {
      type: ConditionTypeEnum.NOT,
      children: [
        { type: NodeTypeEnum.COMMON, id: 'a' }
      ]
    },
    children: [
      { type: NodeTypeEnum.COMMON, id: 'b' }
    ],
  }
  * (3) 通过ELNode节点模型进行表示的组合关系为：
                                          ┌─────────────────┐    ┌─────────────────┐
                                      ┌──▶│  NotOperator    │───▶│  NodeOperator   │
  ┌─────────┐    ┌─────────────────┐  │   └─────────────────┘    └─────────────────┘
  │  Chain  │───▶│   IfOperator    │──┤   ┌─────────────────┐
  └─────────┘    └─────────────────┘  └──▶│  NodeOperator   │
                                          └─────────────────┘
 */
export class NotOperator extends ELNode {
  static icon = icon;
  static label = '非(Not)';
  static type = ConditionTypeEnum.NOT;
  static startNode?: NodeData;
  static endNode?: NodeData;
  type = ConditionTypeEnum.NOT;
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
    const newNode = new NotOperator(parent);

    newNode.appendChild(NodeOperator.create(newNode, type));
    return newNode;
  }

  public toCells(options: CellOption = {}): GraphData {
    this.resetCells();
    const { children, cells } = this;
    const label = this.properties?.memo ?? this.properties?.tag ?? this.id;
    const color = colorMap[this.type];

    if (!this.startNode) {
      this.startNode = {
        id: `${this.id}-START`,
        ...options,
        style: getConditionNodeStyle({
          toolbar: {
            prepend: true,
            append: false,
            delete: true,
            replace: true,
            collapse: true,
          },
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
          toolbar: {
            prepend: false,
            append: true,
            delete: true,
            replace: true,
          },
          badgeText: `${this.type} 结束`,
        }),
      };
    }
    this.endNode.data = {
      model: new ELEndNode(this),
    };
    cells.nodes.push(this.addNode(this.endNode));

    const [notNode] = children;

    [notNode].forEach((item, index) => {
      const next = item || NodeOperator.create(this, NodeTypeEnum.VIRTUAL);

      next.toCells();
      const nextStartNode = next.getStartNode();

      cells.edges.push({
        id: `${this.startNode!.id}->${nextStartNode.id}`,
        source: this.startNode!.id,
        target: nextStartNode.id,
        style: {
          labelText: '-',
          labelAutoRotate: false,
          labelFill: color,
          inset: false,
        },
        data: {
          owner: this.type,
        },
      });
      const nextEndNode = next.getEndNode();

      cells.edges.push({
        id: `${nextEndNode.id}->${this.endNode!.id}`,
        source: nextEndNode.id,
        target: this.endNode!.id,
        style: {
          inset: false,
        },
        data: {
          owner: this.type,
        },
      });

      if (!item) {
        if (!nextStartNode.style) {
          nextStartNode.style = {};
        }
        nextStartNode.style.toolbar = {
          prepend: false,
          append: false,
          delete: false,
          replace: true,
        };
        nextStartNode.data = {
          model: new ELVirtualNode(this, index, next),
        };
        cells.nodes.push(this.addNode(nextStartNode));
      }
    });
    const childrens = this.getNodes().filter((n) => ![this.startNode!.id].includes(n.id));

    if (childrens.length && this.startNode) {
      this.startNode.children = childrens.map((n) => n.id);
    }
    return this.getCells();
  }

  /**
   * 在后面添加子节点
   * @param newNode 子节点
   * @param index 指定位置：可以是索引，也可以是兄弟节点
   */
  public appendChild(newNode: ELNode): boolean;
  public appendChild(newNode: ELNode, index: number): boolean;
  public appendChild(newNode: ELNode, sibling: ELNode): boolean;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public appendChild(newNode: ELNode, _index?: number | ELNode): boolean {
    newNode.parent = this;
    this.children[0] = newNode;
    return true;
  }

  /**
   * 在后面添加子节点
   * @param newNode 子节点
   * @param index 指定位置：可以是索引，也可以是兄弟节点
   */
  public prependChild(newNode: ELNode): boolean;
  public prependChild(newNode: ELNode, index: number): boolean;
  public prependChild(newNode: ELNode, sibling: ELNode): boolean;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public prependChild(newNode: ELNode, _index?: number | ELNode): boolean {
    newNode.parent = this;
    this.children[0] = newNode;
    return true;
  }

  public toEL(prefix?: string): string {
    if (typeof prefix === 'string') {
      return `${prefix}NOT(\n${this.children
        .map((x) => x.toEL(`${prefix}  `))
        .join(', \n')}\n${prefix})${this.propertiesToEL()}`;
    }
    return `NOT(${this.children.map((x) => x.toEL()).join(', ')})${this.propertiesToEL()}`;
  }
}
