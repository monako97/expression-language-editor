import type { NodeData } from '@antv/g6';

import icon from '../../assets/switch-icon.svg';
import { ConditionTypeEnum, NodeTypeEnum } from '../../enums';
import { type CellOption, ELNode, type GraphData, type Properties } from '../node';
import { colorMap, getConditionNodeStyle } from '../utils';
import { ELEndNode } from '../utils/end';

import { NodeOperator } from './node-operator';

/**
 * 选择编排操作符：SWITCH。
 *
 * 例如一个选择编排(SWITCH)示例：
 * (1) EL表达式语法：SWITCH(x).to(a, b, c)
 * (2) JSON表示形式：
 * {
    type: ConditionTypeEnum.SWITCH,
    condition: { type: NodeTypeEnum.SWITCH, id: 'x' },
    children: [
      { type: NodeTypeEnum.COMMON, id: 'a' },
      { type: NodeTypeEnum.COMMON, id: 'b' },
      { type: NodeTypeEnum.COMMON, id: 'c' },
    ],
  }
  * (3) 通过ELNode节点模型进行表示的组合关系为：
                                          ┌─────────────────┐
                                      ┌──▶│  NodeOperator   │
                                      │   └─────────────────┘
                                      │   ┌─────────────────┐
                                      ├──▶│  NodeOperator   │
  ┌─────────┐    ┌─────────────────┐  │   └─────────────────┘
  │  Chain  │───▶│ SwitchOperator  │──┤   ┌─────────────────┐
  └─────────┘    └─────────────────┘  ├──▶│  NodeOperator   │
                                      │   └─────────────────┘
                                      │   ┌─────────────────┐
                                      └──▶│  NodeOperator   │
                                          └─────────────────┘
 */
export class SwitchOperator extends ELNode {
  static icon = icon;
  static label = '选择(Switch)';
  static type = ConditionTypeEnum.SWITCH;
  static startNode?: NodeData;
  static endNode?: NodeData;
  type = ConditionTypeEnum.SWITCH;
  parent?: ELNode;
  condition: ELNode = new NodeOperator(this, NodeTypeEnum.SWITCH);
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
    const newNode = new SwitchOperator(parent);

    newNode.appendChild(NodeOperator.create(newNode, type));
    return newNode;
  }

  public toCells(options: CellOption = {}): GraphData {
    this.resetCells();
    const { condition, children, cells } = this;

    condition.toCells({
      type: NodeTypeEnum.SWITCH,
    });
    const label = this.properties?.memo ?? this.properties?.tag ?? this.id;
    const color = colorMap[this.type];
    const toolbar = {
      prepend: true,
      append: true,
      delete: true,
      replace: true,
      collapse: true,
    };

    this.startNode = condition.getStartNode();
    this.startNode.style = getConditionNodeStyle({
      toolbar: toolbar,
      labelText: label,
      iconSrc: this.icon,
      fill: color,
      badgeText: this.type,
    });
    this.startNode.data = {
      model: condition,
    };
    const end = condition.getEndNode();

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
        const childStartNode = child.getStartNode();

        cells.edges.push({
          id: `${end.id}->${childStartNode.id}`,
          source: end.id,
          target: childStartNode.id,
          data: {
            owner: this.type,
          },
        });
        const childEndNode = child.getEndNode();

        cells.edges.push({
          id: `${childEndNode.id}->${this.endNode!.id}`,
          source: childEndNode.id,
          target: this.endNode!.id,
          data: {
            owner: this.type,
          },
        });
      });
    } else {
      cells.edges.push({
        id: `${end.id}->${this.endNode!.id}`,
        source: end.id,
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
      return `${prefix}SWITCH(${this.condition.toEL()}).to(\n${this.children
        .map((x) => x.toEL(`${prefix}  `))
        .join(', \n')}\n${prefix})`;
    }
    return `SWITCH(${this.condition.toEL()}).to(${this.children.map((x) => x.toEL()).join(', ')})`;
  }
}
