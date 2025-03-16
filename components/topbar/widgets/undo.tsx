import React from 'react';
import { UndoOutlined } from '@ant-design/icons';

import { canUndoHistory, undoHistory } from '../../store/history';

import makeBtnWidget from './common/makeBtnWidget';

const Save: React.FC = makeBtnWidget({
  tooltip: '撤销',
  handler() {
    undoHistory();
    return false;
  },
  getIcon() {
    return <UndoOutlined />;
  },
  disabled() {
    return !canUndoHistory();
  },
});

export default Save;
