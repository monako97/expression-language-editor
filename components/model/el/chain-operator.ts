import type { NodeData } from '@antv/g6';

import icon from '../../assets/chain-icon.svg';
import { ConditionTypeEnum, NodeTypeEnum } from '../../enums';
import { type CellOption, ELNode, type GraphData, type Properties } from '../node';
import { colorMap, getConditionNodeStyle } from '../utils';
import { ELEndNode } from '../utils/end';
import { ELStartNode } from '../utils/start';

import { NodeOperator } from './node-operator';

let rollingCode = 1;
/**
 * 子流程操作符：CHAIN。
 *
 * 例如一个子流程(CHAIN)示例：
 * (1) EL表达式语法：t1 = THEN(a, b, c)
 * (2) JSON表示形式：
 * {
    type: ConditionTypeEnum.CHAIN,
    id: 't1',
    children: [
      { type: NodeTypeEnum.COMMON, id: 'a' },
      { type: NodeTypeEnum.COMMON, id: 'b' },,
      { type: NodeTypeEnum.COMMON, id: 'c' },
    ],
  }
  * (3) 通过ELNode节点模型进行表示的组合关系为：
                                          ┌─────────────────┐
                                      ┌──▶│  NodeOperator   │
  ┌─────────┐    ┌─────────────────┐  │   └─────────────────┘
  │  Chain  │───▶│  ChainOperator  │──┤   ┌─────────────────┐
  └─────────┘    └─────────────────┘  ├──▶│  NodeOperator   │
                                      │   └─────────────────┘
                                      │   ┌─────────────────┐
                                      └──▶│  NodeOperator   │
                                          └─────────────────┘
 */

export class ChainOperator extends ELNode {
  static icon = icon;
  static label = '子流程(Chain)';
  static type = ConditionTypeEnum.CHAIN;
  static startNode: NodeData;
  static endNode?: NodeData;
  type = ConditionTypeEnum.CHAIN;
  parent?: ELNode;
  children: ELNode[] = [];
  properties: Properties;
  id: string;

  constructor(parent?: ELNode, id?: string, children?: ELNode[], properties?: Properties) {
    super();
    this.parent = parent;
    this.id = id || `${this.constructor.name}-${rollingCode++}`;
    if (children) {
      this.children = children;
    }
    this.properties = properties || {};
  }

  public static create(parent?: ELNode, type?: NodeTypeEnum): ELNode {
    const newNode = new ChainOperator(parent);

    newNode.appendChild(NodeOperator.create(newNode, type));
    return newNode;
  }

  public toCells(options: CellOption = {}): GraphData {
    this.resetCells();
    const { id, children, cells } = this;
    const toolbar = {
      prepend: true,
      append: true,
      delete: true,
      replace: true,
      collapse: true,
    };
    const label = this.properties.memo ?? this.properties.tag ?? this.id;
    const color = colorMap[this.type];

    if (!this.startNode) {
      this.startNode = {
        id: `${id}-START`,
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

    const childrens = this.getNodes().filter((n) => ![this.startNode!.id].includes(n.id));

    if (childrens.length && this.startNode) {
      this.startNode.children = childrens.map((n) => n.id);
    }
    return this.getCells();
  }

  public toEL(prefix?: string): string {
    const { id } = this;

    if (typeof prefix === 'string') {
      return `${prefix}${id}${this.propertiesToEL()}`;
    }
    return `${id}${this.propertiesToEL()}`;
  }
}
