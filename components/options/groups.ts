import { AndOperator } from '../model/el/and-operator';
import { CatchOperator } from '../model/el/catch-operator';
import { ChainOperator } from '../model/el/chain-operator';
import { ForOperator } from '../model/el/for-operator';
import { IfOperator } from '../model/el/if-operator';
import { IteratorOperator } from '../model/el/iterator-operator';
import { NodeOperator } from '../model/el/node-operator';
import { NotOperator } from '../model/el/not-operator';
import { OrOperator } from '../model/el/or-operator';
import { SwitchOperator } from '../model/el/switch-operator';
import { ThenOperator } from '../model/el/then-operator';
import { WhenOperator } from '../model/el/when-operator';
import { WhileOperator } from '../model/el/while-operator';
import type { ELNode } from '../model/node';

export interface ELDragItem {
  type: typeof ELNode.type;
  icon: typeof ELNode.icon;
  label: typeof ELNode.label;
}
interface IGroupItem {
  key: string;
  name: string;
  cellTypes: ELDragItem[];
}

const NODE_GROUP: IGroupItem = {
  key: 'node',
  name: '节点类',
  cellTypes: [{ ...NodeOperator }],
};

const SEQUENCE_GROUP: IGroupItem = {
  key: 'sequence',
  name: '顺序类',
  cellTypes: [{ ...ThenOperator }, { ...WhenOperator }],
};

const BRANCH_GROUP: IGroupItem = {
  key: 'branch',
  name: '分支类',
  cellTypes: [{ ...SwitchOperator }, { ...IfOperator }],
};

const CONTROL_GROUP: IGroupItem = {
  key: 'control',
  name: '循环类',
  cellTypes: [{ ...ForOperator }, { ...WhileOperator }, { ...IteratorOperator }],
};

const OTHER_GROUP: IGroupItem = {
  key: 'other',
  name: '其他类',
  cellTypes: [{ ...CatchOperator }, { ...AndOperator }, { ...OrOperator }, { ...NotOperator }],
};

const CHAIN_GROUP: IGroupItem = {
  key: 'chain',
  name: '流程',
  cellTypes: [{ ...ChainOperator }],
};

export const groups: IGroupItem[] = [
  SEQUENCE_GROUP,
  NODE_GROUP,
  CHAIN_GROUP,
  BRANCH_GROUP,
  CONTROL_GROUP,
  OTHER_GROUP,
];
