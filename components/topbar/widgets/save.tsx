import React from 'react';
import { SaveOutlined } from '@ant-design/icons';

import { model, toJSON } from '../../store';

import makeBtnWidget from './common/makeBtnWidget';

const Save: React.FC = (props) => {
  const { root } = model;
  const Btn = makeBtnWidget({
    tooltip: '保存',
    handler() {
      const elData = toJSON();

      if (elData) {
        const objectURL = URL.createObjectURL(new Blob([JSON.stringify(elData)]));
        const btn = document.createElement('a');

        btn.download = decodeURI(`EL-${new Date().toJSON()}.json`);
        btn.href = objectURL;
        btn.click();
        URL.revokeObjectURL(objectURL);
        btn.remove();
      }
      return false;
    },
    getIcon() {
      return <SaveOutlined />;
    },
    disabled() {
      return !root;
    },
  });

  return <Btn {...props} />;
};

export default Save;
