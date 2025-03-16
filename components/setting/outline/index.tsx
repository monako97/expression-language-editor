import React, { useEffect, useRef } from 'react';
import type { TreeData, TreeElement } from 'neko-ui';

import { ConditionTypeEnum } from '../../enums';
import type { ELNode } from '../../model/node';
import { model, selectNode } from '../../store';

import * as styles from './index.module.less';

import 'neko-ui/es/tree';

const transformer = (currentModel: ELNode, keys: string[]): TreeData => {
  const key = `${currentModel.type}-${crypto.randomUUID()}`;
  const { id, type, properties = {}, icon, label } = currentModel!;
  let name = properties.memo ?? properties.tag ?? id;

  if (type in ConditionTypeEnum) {
    name = type;
  }
  keys.push(key);
  const node = {
    key,
    title: name || type,
    subTitle: label,
    icon: icon,
    data: currentModel,
    children: [],
  } as unknown as TreeData;

  if (currentModel.condition) {
    node.children!.push(transformer(currentModel.condition, keys));
  }
  if (currentModel.children) {
    node.children = node.children!.concat(
      currentModel.children.map((item) => transformer(item, keys)),
    );
  }
  return node;
};
const Outline: React.FC = () => {
  const tree = useRef<TreeElement>(null);
  const { refresh, root } = model;

  useEffect(() => {
    if (model.root) {
      const keys: string[] = [];

      tree.current.data = [transformer(model.root, keys)];
      tree.current.renderRow = (item: TreeData, title: string, subTitle: string) => {
        const img = document.createElement('img');

        img.width = 17;
        img.height = 17;
        img.src = item.icon as string;
        return [img, title || '-', subTitle];
      };
      tree.current.onchange = (e: CustomEvent<[string, TreeData & { data: ELNode }]>) => {
        selectNode(e.detail[1].data, true);
      };
    }
  }, [refresh]);

  return root ? (
    <n-tree
      ref={tree}
      className={styles.tree}
      css={`
        :host {
          width: 100%;
          text-wrap: nowrap;
          overflow: auto;
        }
        .tree {
          padding-inline: 2px;
        }
        .row {
          gap: 4px;
          align-items: center;
        }
        .sub-title {
          padding: 0;
        }
      `}
    />
  ) : (
    <n-empty />
  );
};

export default Outline;
