import type { NodeData } from '@antv/g6';

import icon from '../../assets/then-icon.svg';
import { ConditionTypeEnum, NodeTypeEnum } from '../../enums';
import { type CellOption, ELNode, type GraphData, type Properties } from '../node';

import { NodeOperator } from './node-operator';

/**
 * 串行编排操作符：THEN。
 *
 * 例如一个串行编排(THEN)示例：
 * (1) EL表达式语法：THEN(a, b, c, d)
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
export class ThenOperator extends ELNode {
  static type = ConditionTypeEnum.THEN;
  static icon = icon;
  static label = '串行(Then)';
  type = ConditionTypeEnum.THEN;
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
    const newNode = new ThenOperator(parent);

    newNode.appendChild(NodeOperator.create(newNode, type));
    return newNode;
  }

  public removeChild(child: ELNode): boolean {
    if (this.children && this.children.length > 1) {
      return super.removeChild(child);
    }
    return this.remove();
  }

  public toCells(options: CellOption = {}): GraphData {
    this.resetCells();
    const { children, cells } = this;
    let last: NodeData;

    children.forEach((child) => {
      child.toCells(options);
      const next = child.getStartNode();

      if (last) {
        cells.edges.push({
          id: `${last.id}->${next.id}`,
          source: last.id,
          target: next.id,
          data: {
            owner: this.type,
          },
        });
      }
      last = child.getEndNode();
    });

    return this.getCells();
  }

  public getStartNode(): NodeData {
    return this.children[0].getStartNode();
  }

  public getEndNode(): NodeData {
    return this.children[this.children.length - 1].getEndNode();
  }

  public toEL(prefix?: string): string {
    const { type } = this;

    if (typeof prefix === 'string') {
      return `${prefix}${type}(\n${this.children
        .map((x) => x.toEL(`${prefix}  `))
        .join(', \n')}\n${prefix})${this.propertiesToEL()}`;
    }
    return `${type}(${this.children.map((x) => x.toEL()).join(',')})${this.propertiesToEL()}`;
  }
}
