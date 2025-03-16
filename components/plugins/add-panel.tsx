import type { ContextmenuOptions } from '@antv/g6';
import type { MenuOption } from 'neko-ui';

import { NodeTypeEnum } from '../enums';
import { ELBuilder } from '../model/builder';
import { groups } from '../options/groups';
import { collapseShape, type ElLikeData } from '../shape/rect-node';
import { clearCells, model, store } from '../store';
import { pushHistory } from '../store/history';

import 'neko-ui/es/dropdown';

const items: MenuOption[] = groups.map((group) => {
  return {
    label: group.name,
    options: group.cellTypes.map((cell) => {
      return {
        value: cell.type,
        label: cell.label,
        icon: () => {
          const img = document.createElement('img');

          img.width = 16;
          img.height = 16;
          img.src = cell.icon;

          return img;
        },
      };
    }),
  };
});
const titleMap = {
  prepend: '前面插入节点',
  replace: '替换当前节点',
  append: '后面插入节点',
  delete: '删除当前节点',
  inset: '插入节点',
};

const handleClick = async (key: string) => {
  const graph = store.graph;

  if (!graph) return;
  if (model.action === 'inset') {
    const edge = store.graph!.getElementDataByState('edge', 'selected')[0];

    if (edge) {
      const targetNode = graph.getElementData(edge.target) as ElLikeData;
      const targetModel = targetNode?.data?.model;
      const sourceNode = graph.getElementData(edge.source) as ElLikeData;
      const sourceModel = sourceNode?.data?.model;
      const inComingEdgesLength = graph.getRelatedEdgesData(targetNode.id).length;
      const newNode = ELBuilder.createELNode(key as NodeTypeEnum, targetModel);

      if (inComingEdgesLength > 1 || (sourceModel && targetModel?.isParentOf(sourceModel))) {
        sourceModel?.append(newNode);
      } else {
        targetModel?.prepend(newNode);
      }
      graph.setElementState(edge.id!, []);
      await graph.render();
      pushHistory();
    }
  } else {
    const elData = store.graph!.getElementDataByState('node', 'selected')[0] as ElLikeData;
    const selected = elData?.data?.model;

    if (selected) {
      const newNode = ELBuilder.createELNode(key as NodeTypeEnum, selected);

      if (model.action === 'prepend') {
        const start = (selected.proxy?.parent || selected.parent)?.getStartNode();

        if (start && start.type !== NodeTypeEnum.COMMON) {
          try {
            await collapseShape(start.id, true, store.graph!, false);
          } catch {
            void 0;
          }
        }

        selected.prepend(newNode);
      } else if (model.action === 'replace') {
        clearCells(selected);
        selected.replace(newNode);
        await store.graph!.render();
      } else {
        const start = selected.getStartNode();

        if (start.type !== NodeTypeEnum.COMMON) {
          try {
            await collapseShape(start.id, true, store.graph!, false);
          } catch {
            void 0;
          }
        }
        selected.append(newNode);
      }
      pushHistory();
    }
  }
};

export const addPanelMenu: ContextmenuOptions = {
  type: 'contextmenu',
  trigger: 'click',
  className: 'add-panel',
  getContent() {
    const { wrapper } = store;
    const { action } = model;
    const panel = document.createElement('div');
    const dropdown = document.createElement('n-dropdown');

    dropdown.trigger = 'click';
    dropdown.open = true;
    dropdown.placement = 'left';
    dropdown.items = [{ label: titleMap[action], disabled: true, class: 'title' }, ...items];
    dropdown.toggle = false;
    dropdown.getPopupContainer = () => wrapper!;
    dropdown.onOpenChange = (o) => {
      dropdown.open = o;
    };
    dropdown.addEventListener!('change', (e) => {
      handleClick(e.detail[0] as string);
    });
    dropdown.setAttribute!(
      'menu-css',
      ':host{max-height:400px;overflow-y:auto;width: 160px;}.title{text-align:center;color: var(--text-heading, rgb(0 0 0 / 85%)) !important;}.menu-icon{display:flex;align-items:center;}',
    );
    dropdown.appendChild!(panel);
    return dropdown as unknown as HTMLElement;
  },
  enable: (e) => {
    const list = ['prepend', 'append', 'replace', 'inset'];

    return list.includes(e.originalTarget.className) || list.includes(e.target.className);
  },
};
