import React from 'react';

import widgets from './widgets';

import * as styles from './index.module.less';

interface IProps {
  widgets?: React.FC[];
}

const TopBar: React.FC<IProps> = ({ widgets: customWidgets }) => {
  return (
    <div className={styles.container}>
      {widgets?.map((group, index) => (
        <div key={index} className={styles.group}>
          {group.map((ToolItem, index) => {
            return <ToolItem key={index} />;
          })}
        </div>
      ))}
      {customWidgets?.length ? (
        <div className={styles.group}>
          {customWidgets.map((WidgetItem, index) => (
            <WidgetItem key={index} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default TopBar;
