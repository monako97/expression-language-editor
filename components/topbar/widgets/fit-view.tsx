import React from 'react';
import { LayoutOutlined } from '@ant-design/icons';

import { fitView } from '../../store';

import makeBtnWidget from './common/makeBtnWidget';

const FitView: React.FC = makeBtnWidget({
  tooltip: '将图缩放至合适大小并平移至视口中心',
  getIcon() {
    return <LayoutOutlined />;
  },
  handler: fitView,
});

export default FitView;
