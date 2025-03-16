/** 逻辑组件类型 */
export enum NodeTypeEnum {
  COMMON = 'NodeComponent', // common, 普通

  BOOLEAN = 'NodeBooleanComponent', // boolean, 布尔

  SWITCH = 'NodeSwitchComponent', // switch, 选择

  IF = 'NodeIfComponent', // if, 条件

  FOR = 'NodeForComponent', // for, 循环次数

  WHILE = 'NodeWhileComponent', // while, 循环条件

  BREAK = 'NodeBreakComponent', // break, 循环跳出

  ITERATOR = 'NodeIteratorComponent', // iterator, 循环迭代

  SCRIPT = 'ScriptCommonComponent', // script, 脚本

  BOOLEAN_SCRIPT = 'ScriptBooleanComponent', // boolean_script, 布尔脚本

  SWITCH_SCRIPT = 'ScriptSwitchComponent', // switch_script, 选择脚本

  IF_SCRIPT = 'ScriptIfComponent', // if_script, 条件脚本

  FOR_SCRIPT = 'ScriptForComponent', // for_script, 循环次数脚本

  WHILE_SCRIPT = 'ScriptWhileComponent', // while_script, 循环条件脚本

  BREAK_SCRIPT = 'ScriptBreakComponent', // break_script, 循环跳出脚本

  FALLBACK = 'fallback', // 降级

  VIRTUAL = 'NodeVirtualComponent', // virtual, 虚节点
}

/** 逻辑编排类型 */
export enum ConditionTypeEnum {
  CHAIN = 'CHAIN', // chain，编排的根节点或者子流程

  THEN = 'THEN', // then，串行编排

  SER = 'SER', // ser，串行编排

  WHEN = 'WHEN', // when，并行编排

  PAR = 'PAR', // par，并行编排

  SWITCH = 'SWITCH', // switch，选择编排

  IF = 'IF', // if，条件编排

  PRE = 'PRE', // pre

  FINALLY = 'FINALLY', // finally

  FOR = 'FOR', // for，循环编排

  WHILE = 'WHILE', // while，循环编排

  ITERATOR = 'ITERATOR', // iterator

  BREAK = 'BREAK', // break

  CATCH = 'CATCH', // catch

  AND = 'AND', // and，与

  OR = 'OR', // or，或

  NOT = 'NOT', // not，非

  ABSTRACT = 'ABSTRACT', // abstract

  DEFAULT = 'DEFAULT', // default
}
