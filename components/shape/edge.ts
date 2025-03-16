import { Group, Path } from '@antv/g';
import {
  type BaseEdgeStyleProps,
  CommonEvent,
  type LabelStyleProps,
  type PathArray,
  Polyline,
} from '@antv/g6';

import { store } from '../store';

const expand = (size: number): PathArray => {
  const radius = size / 4;
  const offset = 4;

  return [
    ['M', 0 - size + radius, 0 - size],
    ['H', 0 + size - radius],
    ['A', radius, radius, 0, 0, 1, 0 + size, 0 - size + radius],
    ['V', 0 + size - radius],
    ['A', radius, radius, 0, 0, 1, 0 + size - radius, 0 + size],
    ['H', 0 - size + radius],
    ['A', radius, radius, 0, 0, 1, 0 - size, 0 + size - radius],
    ['V', 0 - size + radius],
    ['A', radius, radius, 0, 0, 1, 0 - size + radius, 0 - size],
    ['Z'],
    ['M', 0 - size + offset, 0],
    ['L', 0 + size - offset, 0],
    ['M', 0, 0 - size + offset],
    ['L', 0, 0 + size - offset],
    ['Z'],
  ];
};

export enum EDGE_EVENT {
  inset = 'el-edge:inset',
}

export class ElEdge extends Polyline {
  static type = 'EL_EDGE';
  timer: NodeJS.Timeout | undefined;
  get mount() {
    return this.context.model.hasEdge(this.id);
  }
  render(attributes: Required<BaseEdgeStyleProps>, container: Group) {
    super.render(attributes);

    if (!Reflect.has(container, '__bind__')) {
      Reflect.set(container, '__bind__', true);
    }
    if (store.readonly) {
      this.removeShape();
      container.removeEventListener(CommonEvent.POINTER_ENTER, this.drawPlusBtn);
      container.removeEventListener(CommonEvent.POINTER_LEAVE, this.removeShape);
    } else {
      container.addEventListener(CommonEvent.POINTER_ENTER, this.drawPlusBtn);
      container.addEventListener(CommonEvent.POINTER_LEAVE, this.removeShape);
    }
  }

  removeShape() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      clearTimeout(this.timer);
      if (this.mount) {
        this.upsert('inset', Path, false, this);
      }
    }, 300);
  }
  drawPlusBtn() {
    if (!this.mount) {
      return;
    }
    const attributes = this.parsedAttributes;

    if (attributes && 'inset' in attributes && attributes.inset === false) {
      this.removeShape();
      return;
    }
    const { transform } = this.getLabelStyle({ ...attributes!, labelText: '+' }) as LabelStyleProps;
    const btn = this.upsert(
      'inset',
      Path,
      {
        stroke: '#70D871',
        d: expand(12),
        cursor: 'pointer',
        fill: '#fff',
        zIndex: 1,
        transform: transform,
        lineWidth: 1.5,
      },
      this,
    );

    if (btn && !Reflect.has(btn, '__bind__')) {
      Reflect.set(btn, '__bind__', true);
      btn.addEventListener(CommonEvent.CLICK, () => {
        this.context.graph.emit(EDGE_EVENT.inset, this);
      });
    }
  }
  destroy(): void {
    super.destroy();
    clearTimeout(this.timer);
  }
}
