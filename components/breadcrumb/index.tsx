import React, { useEffect, useState } from 'react';

import { Chain } from '../model/chain';
import { ELNode } from '../model/node';
import { getSelectElNode, model, selectNode } from '../store';

import * as styles from './index.module.less';

const loop = (el: ELNode, arr: ELNode[]) => {
  if (el.parent) {
    arr.splice(0, 0, el);
    loop(el.parent, arr);
  }
};
const BreadcrumbPath: React.FC = () => {
  const { refresh } = model;
  const [data, setData] = useState<ELNode[]>([]);

  useEffect(() => {
    const _parents: ELNode[] = refresh ? [] : [];
    const selected = getSelectElNode();

    if (selected) {
      loop(selected, _parents);
    }
    setData(_parents);
  }, [refresh]);

  return (
    <div className={styles.breadcrumb}>
      <div className={styles.item}>
        <img className={styles.icon} src={Chain.icon} />
        <span>{Chain.label}</span>
      </div>
      {data.map((item) => {
        const handleClick = () => {
          selectNode(item, true);
        };

        return (
          <React.Fragment key={item.id}>
            <div className={styles.divider}>&gt;</div>
            <div className={styles.item} onClick={handleClick}>
              <img className={styles.icon} src={item.icon} />
              <span>{item.type}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default BreadcrumbPath;
