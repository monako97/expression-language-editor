import React, { useEffect, useRef } from 'react';

import codeIcon from '../icons/code';
import propertiesIcon from '../icons/properties';
import structureIcon from '../icons/structure';
import { getSelectElNode, model } from '../store';

import Code from './code';
import Outline from './outline';
import Properties from './properties';

const SettingBar: React.FC = () => {
  const segmented = useRef(null);
  const { setting, refresh } = model;
  const current = getSelectElNode();

  useEffect(() => {
    Object.assign(segmented.current!, {
      options: [
        {
          label: '属性',
          value: 'properties',
          icon: propertiesIcon,
          disabled: !refresh || !current?.parent,
        },
        { label: '代码', value: 'code', icon: codeIcon },
        { label: '结构', value: 'outline', icon: structureIcon },
      ],
      value: setting,
      onChange: (e: 'properties' | 'code' | 'outline') => {
        model.setting = e;
      },
    });
  }, [current?.parent, refresh, setting]);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: 16,
        height: '100%',
      }}
    >
      <n-segmented
        ref={segmented}
        css=".box {inline-size: 100%;}.label{flex:1;justify-content:center;}"
      />
      {setting === 'properties' && current?.parent && <Properties />}
      {setting === 'code' && <Code />}
      {setting === 'outline' && <Outline />}
    </div>
  );
};

export default SettingBar;
