import React from 'react';
import { RedoOutlined } from '@ant-design/icons';

import { canRedoHistory, redoHistory } from '../../store/history';

import makeBtnWidget from './common/makeBtnWidget';

const Save: React.FC = makeBtnWidget({
  tooltip: '重做',
  handler() {
    redoHistory();
    return false;
  },
  getIcon() {
    return <RedoOutlined />;
  },
  disabled() {
    return !canRedoHistory();
  },
});

export default Save;
