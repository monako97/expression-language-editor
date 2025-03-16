import React, { type ReactElement } from 'react';
import { Tooltip } from 'antd';

import { store } from '../../../store';

import * as styles from './index.module.less';

interface IOptions {
  tooltip: string;
  getIcon: () => ReactElement;
  handler: (props?: Record<string, unknown>) => void;
  disabled?: () => boolean;
  selected?: () => boolean;
}

const makeBtnWidget = (options: IOptions) => {
  const Widget: React.FC = (props: Record<string, unknown>) => {
    const { wrapper } = store;
    const { tooltip, getIcon, handler } = options;
    let { disabled = false, selected = false } = options;

    if (typeof disabled === 'function') {
      disabled = disabled();
    }
    if (typeof selected === 'function') {
      selected = selected();
    }
    const onClick = (): void => {
      if (disabled) return;
      handler(props);
    };

    return (
      <Tooltip
        title={tooltip}
        getPopupContainer={() => wrapper || document.body}
        destroyTooltipOnHide
      >
        <div
          className={`${styles.widget} ${disabled ? styles.disabled : ''} ${
            selected ? styles.selected : ''
          }`}
          onClick={onClick}
        >
          {getIcon()}
        </div>
      </Tooltip>
    );
  };

  return Widget;
};

export default makeBtnWidget;
