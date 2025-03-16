import { ConditionTypeEnum, NodeTypeEnum } from '../enums';

import { AndOperator } from './el/and-operator';
import { CatchOperator } from './el/catch-operator';
import { ChainOperator } from './el/chain-operator';
import { ForOperator } from './el/for-operator';
import { IfOperator } from './el/if-operator';
import { IteratorOperator } from './el/iterator-operator';
import { NodeOperator } from './el/node-operator';
import { NotOperator } from './el/not-operator';
import { OrOperator } from './el/or-operator';
import { SwitchOperator } from './el/switch-operator';
import { ThenOperator } from './el/then-operator';
import { WhenOperator } from './el/when-operator';
import { WhileOperator } from './el/while-operator';
import { Chain } from './chain';
import type { DSL, ELNode } from './node';

export function parse({ parent, data }: ParseParameters): ELNode | undefined {
  if (!data?.type) {
    return void 0;
  }

  function parseOperator({ parent: _parent, data: _data, type }: ParseParameters): ELNode {
    const { condition, children = [], properties } = _data;

    if (condition) {
      const conditionNode = parse({ parent: _parent, data: condition });

      if (conditionNode) {
        _parent.condition = conditionNode;
      }
    }
    if (children && children.length) {
      children.forEach((child: DSL) => {
        const childNode = parse({ parent: _parent, data: child });

        if (childNode) {
          _parent.appendChild(childNode);
        }
      });
    }
    if (properties) {
      _parent.setProperties(properties);
    }
    if (type) {
      _parent.type = type;
    }
    return _parent;
  }

  switch (data.type) {
    // 1、编排类：顺序、分支、循环
    case ConditionTypeEnum.THEN:
    case ConditionTypeEnum.SER:
      return parseOperator({ parent: new ThenOperator(parent), data });
    case ConditionTypeEnum.WHEN:
    case ConditionTypeEnum.PAR:
      return parseOperator({ parent: new WhenOperator(parent), data });
    case ConditionTypeEnum.SWITCH:
      return parseOperator({ parent: new SwitchOperator(parent), data });
    case ConditionTypeEnum.IF:
      return parseOperator({ parent: new IfOperator(parent), data });
    case ConditionTypeEnum.FOR:
      return parseOperator({ parent: new ForOperator(parent), data });
    case ConditionTypeEnum.WHILE:
      return parseOperator({ parent: new WhileOperator(parent), data });
    case ConditionTypeEnum.ITERATOR:
      return parseOperator({ parent: new IteratorOperator(parent), data });
    case ConditionTypeEnum.CATCH:
      return parseOperator({ parent: new CatchOperator(parent), data });
    case ConditionTypeEnum.AND:
      return parseOperator({ parent: new AndOperator(parent), data });
    case ConditionTypeEnum.OR:
      return parseOperator({ parent: new OrOperator(parent), data });
    case ConditionTypeEnum.NOT:
      return parseOperator({ parent: new NotOperator(parent), data });
    case ConditionTypeEnum.CHAIN:
      return parseOperator({ parent: new ChainOperator(parent, data.id), data });
    case ConditionTypeEnum.PRE:
    case ConditionTypeEnum.FINALLY:
    case ConditionTypeEnum.BREAK:
    case ConditionTypeEnum.ABSTRACT:
    case ConditionTypeEnum.DEFAULT:
      return parseOperator({ parent: new ThenOperator(parent), data, type: data.type });
    // 2、组件类：顺序、分支、循环
    case NodeTypeEnum.COMMON:
    default:
      return new NodeOperator(parent, data.type, data.id, data.properties);
  }
}

export function builder(data: DSL | DSL[]): ELNode {
  const chain: Chain = new Chain();

  if (Array.isArray(data)) {
    data.forEach((item) => {
      const next: ELNode | undefined = parse({ parent: chain, data: item });

      if (next) {
        chain.appendChild(next);
      }
    });
  } else {
    const next: ELNode | undefined = parse({ parent: chain, data });

    if (next) {
      chain.appendChild(next);
    }
  }

  return chain;
}

interface ParseParameters {
  data: DSL;
  parent: ELNode;
  type?: NodeTypeEnum | ConditionTypeEnum;
}

/**
 * 将EL表达式的JSON表示，构造成ELNode模型表示。
 * EL表达式的模型表示：数据结构本质上是一个树形结构。
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
export class ELBuilder {
  public static build(data: DSL | DSL[]) {
    return builder(data);
  }

  public static createELNode(
    type: ConditionTypeEnum | NodeTypeEnum,
    parent?: ELNode,
    id?: string,
  ): ELNode {
    switch (type) {
      // 1. 编排类型
      case ConditionTypeEnum.THEN:
      case ConditionTypeEnum.SER:
        return ThenOperator.create(parent);
      case ConditionTypeEnum.WHEN:
      case ConditionTypeEnum.PAR:
        return WhenOperator.create(parent);
      case ConditionTypeEnum.SWITCH:
        return SwitchOperator.create(parent);
      case ConditionTypeEnum.IF:
        return IfOperator.create(parent);
      case ConditionTypeEnum.FOR:
        return ForOperator.create(parent);
      case ConditionTypeEnum.WHILE:
        return WhileOperator.create(parent);
      case ConditionTypeEnum.ITERATOR:
        return IteratorOperator.create(parent);
      case ConditionTypeEnum.CATCH:
        return CatchOperator.create(parent);
      case ConditionTypeEnum.AND:
        return AndOperator.create(parent);
      case ConditionTypeEnum.OR:
        return OrOperator.create(parent);
      case ConditionTypeEnum.NOT:
        return NotOperator.create(parent);
      case ConditionTypeEnum.CHAIN:
        return ChainOperator.create(parent);
      case ConditionTypeEnum.PRE:
      case ConditionTypeEnum.FINALLY:
      case ConditionTypeEnum.BREAK:
      case ConditionTypeEnum.ABSTRACT:
      case ConditionTypeEnum.DEFAULT:
        return ThenOperator.create(parent);
      // 2. 节点类型
      case NodeTypeEnum.COMMON:
      default:
        return NodeOperator.create(parent, type as NodeTypeEnum, id);
    }
  }
}
