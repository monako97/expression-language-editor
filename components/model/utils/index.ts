/**
 * EL表达式各个操作符的辅助模型。
 */
import type { NodeStyle } from '@antv/g6/lib/spec/element/node';

import { ConditionTypeEnum } from '../../enums';

import { ELEndNode } from './end';

export const getConditionNodeStyle = (style: NodeStyle): NodeStyle => {
  const _styles: NodeStyle = {
    fill: '#5F95FF',
    labelFill: '#FFF',
    labelX: 0,
    labelTextAlign: 'center',
    fillOpacity: 1,
    iconY: -20,
    iconX: 0,
    iconWidth: 30,
    iconHeight: 30,
    iconShadowType: 'outer',
    iconShadowBlur: 1,
    iconSrc: ELEndNode.icon,
    ...style,
  };

  _styles.stroke = _styles.fill;
  _styles.iconShadowColor = _styles.fill as NodeStyle['iconShadowColor'];
  _styles.iconSrc = (_styles.iconSrc as string).replace(
    'currentColor',
    encodeURIComponent(_styles.fill as string),
  );

  return _styles;
};

export const colorMap: Record<string, string> = {
  [ConditionTypeEnum.THEN]: '#5F95FF',
  [ConditionTypeEnum.WHEN]: '#45C1D6',
  [ConditionTypeEnum.WHILE]: '#3FC1F1',
  [ConditionTypeEnum.SWITCH]: '#FF9FA3',
  [ConditionTypeEnum.AND]: '#7BA5FA',
  [ConditionTypeEnum.CATCH]: '#FE8283',
  [ConditionTypeEnum.CHAIN]: '#FE8283',
  [ConditionTypeEnum.FOR]: '#309DFF',
  [ConditionTypeEnum.IF]: '#F2B362',
  [ConditionTypeEnum.ITERATOR]: '#F2B359',
  [ConditionTypeEnum.NOT]: '#EC8374',
  [ConditionTypeEnum.OR]: '#FF9845',
};
