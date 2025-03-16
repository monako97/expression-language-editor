import type { NodeData } from '@antv/g6';

import icon from '../../assets/if-icon.svg';
import { ConditionTypeEnum, NodeTypeEnum } from '../../enums';
import { type CellOption, ELNode, type GraphData, type Properties } from '../node';
import { colorMap, getConditionNodeStyle } from '../utils';
import { ELEndNode } from '../utils/end';
import { ELVirtualNode } from '../utils/virtual';

import { NodeOperator } from './node-operator';

/**
 * 条件编排操作符：IF。
 *
 * 例如一个条件编排(IF)示例：
 * (1) EL表达式语法：IF(x, a)
 * (2) JSON表示形式：
 * {
    type: ConditionTypeEnum.IF,
    condition: { type: NodeTypeEnum.IF, id: 'x' },
    children: [
      { type: NodeTypeEnum.COMMON, id: 'a' }
    ],
  }
  * (3) 通过ELNode节点模型进行表示的组合关系为：
                                          ┌─────────────────┐
                                      ┌──▶│  NodeOperator   │
  ┌─────────┐    ┌─────────────────┐  │   └─────────────────┘
  │  Chain  │───▶│    IfOperator   │──┤   ┌─────────────────┐
  └─────────┘    └─────────────────┘  └──▶│  NodeOperator   │
                                          └─────────────────┘
 */
export class IfOperator extends ELNode {
  static icon = icon;
  static label = '条件(If)';
  static type = ConditionTypeEnum.IF;
  static startNode?: NodeData;
  static endNode?: NodeData;
  type = ConditionTypeEnum.IF;
  parent?: ELNode;
  condition: ELNode = new NodeOperator(this, NodeTypeEnum.IF, 'x');
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
    const newNode = new IfOperator(parent);

    newNode.appendChild(NodeOperator.create(newNode, type));
    return newNode;
  }

  public toCells(options: CellOption = {}): GraphData {
    this.resetCells();
    const { condition, children = [], cells } = this;

    condition.toCells({
      type: NodeTypeEnum.IF,
    });
    const label = this.properties?.memo ?? this.properties?.tag ?? this.id;
    const color = colorMap[this.type];
    let start = condition.getStartNode();

    this.startNode = start;
    this.startNode.style = getConditionNodeStyle({
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

    const [trueNode, falseNode] = children;

    [trueNode, falseNode].forEach((item, index) => {
      const next = item || NodeOperator.create(this, NodeTypeEnum.VIRTUAL);

      next.toCells(options);
      const nextStartNode = next.getStartNode();

      cells.edges.push({
        id: `${start.id}->${nextStartNode.id}`,
        source: start.id,
        target: nextStartNode.id,
        style: {
          labelText: index ? 'false' : 'true',
          labelFontWeight: 'bold',
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
  public appendChild(newNode: ELNode, index?: number | ELNode): boolean {
    newNode.parent = this;
    if (this.children) {
      // 尝试在父节点中添加新节点
      if (typeof index === 'number') {
        // 1. 如果有索引
        // this.children.splice(index, this.children[index] ? 1: 0, newNode);
        this.children[index <= 1 ? index : 1] = newNode;
        return true;
      }
      if (index) {
        // 2. 如果有目标节点
        const _index = this.children.indexOf(index);

        if (_index !== -1) {
          // this.children.splice(_index + 1, this.children[_index] ? 1: 0, newNode);
          this.children[_index <= 1 ? _index : 1] = newNode;
          return true;
        }
        // 3. 如果是在condition之后追加
        if (this.condition === index) {
          return this.appendChild(newNode, 0);
        }
      }
      // 4. 否则直接插入
      this.children.push(newNode);
      return true;
    }
    return false;
  }

  /**
   * 在后面添加子节点
   * @param newNode 子节点
   * @param index 指定位置：可以是索引，也可以是兄弟节点
   */
  public prependChild(newNode: ELNode): boolean;
  public prependChild(newNode: ELNode, index: number): boolean;
  public prependChild(newNode: ELNode, sibling: ELNode): boolean;
  public prependChild(newNode: ELNode, index?: number | ELNode): boolean {
    newNode.parent = this;
    if (this.children) {
      // 尝试在父节点中添加新节点
      if (typeof index === 'number') {
        // 1. 如果有索引
        // this.children.splice(index, this.children[index] ? 1: 0, newNode);
        this.children[index] = newNode;
        return true;
      }
      if (index) {
        // 2. 如果有目标节点
        const _index = this.children.indexOf(index);

        if (_index !== -1) {
          // this.children.splice(_index, this.children[_index] ? 1: 0, newNode);
          this.children[_index] = newNode;
          return true;
        }
        if (this.condition === index) {
          // 3. 如果是在condition之前追加
          return this.prepend(newNode);
        }
      }
      // 4. 否则直接插入
      this.children.splice(0, this.children[0] ? 1 : 0, newNode);
      return true;
    }
    return false;
  }

  public toEL(prefix?: string): string {
    if (typeof prefix === 'string') {
      return `${prefix}IF(\n${[
        this.condition.toEL(`${prefix}  `),
        ...this.children.filter((x) => x).map((x) => x.toEL(`${prefix}  `)),
      ].join(', \n')}\n${prefix})${this.propertiesToEL()}`;
    }
    return `IF(${[
      this.condition.toEL(),
      ...this.children.filter((x) => x).map((x) => x.toEL()),
    ].join(', ')})${this.propertiesToEL()}`;
  }
}
