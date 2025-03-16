import type { NodeData } from '@antv/g6';

import icon from '../../assets/catch-icon.svg';
import IntermediateErrorBoundaryIcon from '../../assets/intermediate-event-catch-error.svg';
import { ConditionTypeEnum, NodeTypeEnum } from '../../enums';
import { type CellOption, ELNode, type GraphData, type Properties } from '../node';
import { colorMap, getConditionNodeStyle } from '../utils';
import { ELEndNode } from '../utils/end';
import { ELStartNode } from '../utils/start';
import { ELVirtualNode } from '../utils/virtual';

import { NodeOperator } from './node-operator';

/**
 * 捕获异常操作符：CATCH。
 *
 * 例如一个捕获异常(CATCH)示例：
 * (1) EL表达式语法：CATCH(THEN(a, b)).DO(c)
 * (2) JSON表示形式：
 * {
    type: ConditionTypeEnum.CATCH,
    condition: {
      type: NodeTypeEnum.THEN,
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
                                      ┌──▶│  ThenOperator   │──┌──▶│  NodeOperator   │
  ┌─────────┐    ┌─────────────────┐  │   └─────────────────┘  │   └─────────────────┘
  │  Chain  │───▶│  CatchOperator  │──┤   ┌─────────────────┐  │   ┌─────────────────┐
  └─────────┘    └─────────────────┘  └──▶│  NodeOperator   │  └──▶│  NodeOperator   │
                                          └─────────────────┘      └─────────────────┘


 */
export class CatchOperator extends ELNode {
  static icon = icon;
  static label = '捕获异常(Catch)';
  static type = ConditionTypeEnum.CATCH;
  static startNode: NodeData;
  static endNode?: NodeData;
  type = ConditionTypeEnum.CATCH;
  parent?: ELNode;
  condition?: ELNode = new NodeOperator(this, NodeTypeEnum.COMMON);
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
    const newNode = new CatchOperator(parent);

    newNode.appendChild(NodeOperator.create(newNode, type));
    return newNode;
  }

  public toCells(options: CellOption = {}): GraphData {
    this.resetCells();
    const { condition, children, cells } = this;
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
        style: getConditionNodeStyle({
          toolbar: toolbar,
          labelText: label,
          iconSrc: this.icon,
          fill: color,
          badgeText: this.type,
          portMarkup: [
            {
              tagName: 'image',
              selector: 'circle',
              attrs: {
                x: -6,
                y: -6,
                width: 12,
                height: 12,
                'xlink:href': IntermediateErrorBoundaryIcon,
              },
            },
          ],
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
    this.endNode.data = { model: new ELEndNode(this) };
    cells.nodes.push(this.addNode(this.endNode));
    [condition, ...children].forEach((item: ELNode | undefined, index: number) => {
      const next = item || NodeOperator.create(this, NodeTypeEnum.VIRTUAL);

      next.toCells(options);
      const nextStartNode = next.getStartNode();

      cells.edges.push({
        id: `${this.startNode!.id}->${nextStartNode.id}`,
        source: this.startNode!.id,
        target: nextStartNode.id,
        style: {
          labelText: index === 1 ? '异常' : void 0,
          labelFill: '#FF4D4F',
          labelFontWeight: 'bold',
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

  public getCells(): GraphData {
    const cells = { ...this.cells };

    if (this.condition) {
      const conditionCells = this.condition.getCells();

      Object.assign(cells, {
        nodes: cells.nodes.concat(conditionCells.nodes),
        edges: cells.edges.concat(conditionCells.edges),
        combos: cells.combos.concat(conditionCells.combos),
      });
    }
    if (this.children && this.children.length) {
      this.children.forEach((child) => {
        const childCells = child.getCells();

        Object.assign(cells, {
          nodes: cells.nodes.concat(childCells.nodes),
          edges: cells.edges.concat(childCells.edges),
          combos: cells.combos.concat(childCells.combos),
        });
      });
    }

    return cells;
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
    // 没有condition节点，则优先添加为condition节点
    if (!this.condition) {
      this.condition = newNode;
      return true;
    }

    if (this.children) {
      // 尝试在父节点中添加新节点
      if (typeof index === 'number') {
        // 1. 如果有索引
        this.children[0] = newNode;
        return true;
      }
      if (index) {
        // 2. 如果有目标节点
        const _index = this.children.indexOf(index);

        if (_index !== -1) {
          this.children[0] = newNode;
          return true;
        }
        // 3. 如果是在condition之后追加
        if (this.condition === index) {
          this.condition = newNode;
          return true;
        }
      }
      // 4. 否则直接插入
      this.children[0] = newNode;
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
    // 没有condition节点，则优先添加为condition节点
    if (!this.condition) {
      this.condition = newNode;
      return true;
    }

    if (this.children) {
      // 尝试在父节点中添加新节点
      if (typeof index === 'number') {
        // 1. 如果有索引
        this.children[0] = newNode;
        return true;
      }
      if (index) {
        // 2. 如果有目标节点
        const _index = this.children.indexOf(index);

        if (_index !== -1) {
          this.children[0] = newNode;
          return true;
        }
        if (this.condition === index) {
          // 3. 如果是在condition之前追加
          this.condition = newNode;
          return true;
        }
      }
      // 4. 否则直接插入
      this.children[0] = newNode;
      return true;
    }
    return false;
  }

  public removeChild(child: ELNode): boolean {
    if (this.children) {
      const index = this.children.indexOf(child);

      if (index !== -1) {
        this.children.splice(index, 1);
        return true;
      }
    }
    if (this.condition && this.condition === child) {
      this.condition = void 0;
      return true;
    }
    return false;
  }

  public toEL(prefix?: string): string {
    const catchNode = this.condition;
    const [doNode] = this.children;

    if (typeof prefix === 'string') {
      return `${prefix}CATCH(\n${catchNode ? catchNode.toEL(`${prefix}  `) : ''}\n${prefix})${
        doNode ? `.DO(\n${doNode.toEL(`${prefix}  `)}\n${prefix})` : ''
      }${this.propertiesToEL()}`;
    }
    return `CATCH(${catchNode ? catchNode.toEL() : ''})${
      doNode ? `.DO(${doNode.toEL()})` : ''
    }${this.propertiesToEL()}`;
  }
}
