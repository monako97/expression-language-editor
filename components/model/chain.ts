import type { NodeData } from '@antv/g6';
import type { NodeStyle } from '@antv/g6/lib/spec/element/node';

import endIcon from '../assets/end-icon.svg';
import icon from '../assets/start-icon.svg';
import { ConditionTypeEnum } from '../enums';

import { ThenOperator } from './el/then-operator';
import { type DSL, ELNode, type GraphData, type Properties } from './node';

const iconStyle: NodeStyle = {
  size: [40, 40],
  labelX: -14,
  labelY: 30,
  fill: null,
  stroke: null,
  iconWidth: 40,
  iconHeight: 40,
  iconX: 0,
};
/**
 * EL表达式的根节点——EL表达式的所有延伸内容，都是在根节点上开始的。
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

export class Chain extends ELNode {
  static icon = icon;
  static label = '开始';
  static type = ConditionTypeEnum.CHAIN;
  static startNode: NodeData;
  static endNode: NodeData;
  type = ConditionTypeEnum.CHAIN;
  children: ELNode[] = [];

  constructor(children?: ELNode[]) {
    super();
    if (children) {
      this.children = children;
    }
  }

  public toCells(): GraphData {
    this.resetCells();
    const cells = this.cells;

    // 1. 首先：添加一个开始节点
    if (!this.startNode) {
      this.startNode = {
        id: 'START',
        data: {
          model: this,
        },
        style: {
          ...iconStyle,
          labelText: this.label,
          labelFill: '#43BA89',
          iconSrc: this.icon,
          toolbar: {
            prepend: false,
            append: true,
            delete: false,
            replace: false,
          },
        },
      };
    }
    cells.nodes.push(this.startNode);
    // 2. 其次：解析已有的节点
    let last = this.startNode;

    this.children.forEach((x) => {
      x.toCells();
      cells.edges.push({
        id: `${last.id}->${x.getStartNode().id}`,
        source: last.id,
        target: x.getStartNode().id,
      });
      last = x.getEndNode();
    });

    // 3. 最后：添加一个结束节点
    if (!this.endNode) {
      this.endNode = {
        id: 'END',
        data: {
          model: this,
        },
        style: {
          ...iconStyle,
          labelText: '结束',
          labelFill: '#F56C6C',
          iconSrc: endIcon,
          toolbar: {
            prepend: true,
            append: false,
            delete: false,
            replace: false,
          },
        },
      };
    }
    cells.nodes.push(this.endNode);
    cells.edges.push({
      id: `${last.id}->${this.endNode!.id}`,
      source: last.id,
      target: this.endNode!.id,
    });

    return this.getCells();
  }

  public toEL(prefix: string = ''): string {
    return `${this.dataPropertyToEL(prefix)}${this.children.map((x) => x.toEL(prefix)).join(', ')};`;
  }

  public dataPropertyToEL(prefix: string = ''): string {
    const dataProperties: Properties[] = [];
    let next: ELNode[] = [this];

    while (next.length) {
      let current: ELNode[] = [];

      next.forEach((item) => {
        const properties = item.getProperties();

        if (properties.data?.name && properties.data?.value) {
          dataProperties.push(properties.data);
        }

        if (item.condition) {
          current.push(item.condition);
        }
        if (item.children && item.children.length) {
          current = current.concat(item.children);
        }
      });
      next = current;
    }
    return dataProperties
      .map((dataProperty) => `${prefix}${dataProperty.name || ''}=${dataProperty.value || ''};\n`)
      .join('');
  }

  public toJSON(): DSL {
    if (this.children.length) {
      if (this.children.length === 1) {
        return this.children[0].toJSON();
      }
      return this.children.map((child) => child.toJSON()) as unknown as ReturnType<Chain['toJSON']>;
    }
    return {};
  }

  public append(newNode: ELNode): boolean {
    if (this.children.length === 1) {
      if (this.children[0].type === ConditionTypeEnum.THEN) {
        return this.children[0].prependChild(newNode, 0);
      }
    }
    return this.appendChild(newNode, 0);
  }

  public appendChild(newNode: ELNode, index?: number | ELNode): boolean {
    const result = super.appendChild(newNode, index as number);

    this.addWrapperIfPossible();
    return result;
  }

  public prepend(newNode: ELNode): boolean {
    if (this.children.length === 1) {
      if (this.children[0].type === ConditionTypeEnum.THEN) {
        return this.children[0].appendChild(newNode);
      }
    }
    return this.appendChild(newNode);
  }

  public prependChild(newNode: ELNode, index?: number | ELNode): boolean {
    const result = super.prependChild(newNode, index as number);

    this.addWrapperIfPossible();
    return result;
  }

  /**
   * 对于根节点，添加超过一个的新节点，则自动包一个THEN
   * @constructor
   */
  addWrapperIfPossible() {
    if (this.children.length > 1) {
      const wrapper = new ThenOperator(this, []);

      this.children.forEach((child) => {
        wrapper.appendChild(child);
      });
      this.children = [wrapper];
    }
  }

  /**
   * 根节点不允许删除
   * @returns {boolean} false
   */
  public remove(): boolean {
    return false;
  }
}
