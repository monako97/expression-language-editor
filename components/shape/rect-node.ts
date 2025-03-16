import { type BaseCustomElementStyleProps, type Group, Image, type ImageStyleProps } from '@antv/g';
import {
  Badge,
  type BadgeStyleProps,
  type BaseNodeStyleProps,
  type CollapseExpandNodeOptions,
  CommonEvent,
  type Graph,
  type LabelStyleProps,
  type NodeBadgeStyleProps,
  type NodeData,
  parseSize,
  Rect,
  type RectStyleProps,
  subStyleProps,
} from '@antv/g6';
import { textBounding } from '@moneko/common';

import addIcon from '../assets/add-icon.svg';
import deleteIcon from '../assets/delete-icon.svg';
import replaceIcon from '../assets/replace-icon.svg';
import { ConditionTypeEnum, NodeTypeEnum } from '../enums';
import type { ELNode } from '../model/node';
import { ELEndNode } from '../model/utils/end';
import { store } from '../store';

export interface ToolbarProps {
  prepend?: boolean;
  append?: boolean;
  delete?: boolean;
  replace?: boolean;
}
interface ElRectNodeStyleProps
  extends Omit<RectStyleProps, 'x' | 'y'>,
    BaseCustomElementStyleProps,
    BaseNodeStyleProps {
  collapsed?: boolean;
  radius?: number;
  x?: number;
  y?: number;
  width: string | number;
  height: string | number;
  toolbar: ToolbarProps;
}

const shadowMap: Record<keyof ToolbarProps, string> = {
  delete: '#ff4d4f',
  append: '#70D871',
  prepend: '#70D871',
  replace: '#f9a913',
};

const btnStyle = (
  style: Partial<RectStyleProps> & { radius?: [number, number, number, number] },
): RectStyleProps => {
  const styles: RectStyleProps = {
    cursor: 'pointer',
    iconY: -0,
    iconX: -10,
    iconWidth: 10,
    iconHeight: 10,
    labelFontSize: 8,
    labelY: -5,
    labelX: 6,
    labelFill: style.stroke,
    stroke: style.stroke,
    zIndex: -1,
  };

  return {
    radius: [4, 4, 0, 0],
    ...styles,
    ...style,
  } as RectStyleProps;
};
const addIconStyle = (style: Partial<ImageStyleProps>): ImageStyleProps => {
  return {
    cursor: 'pointer',
    width: 16,
    height: 16,
    src: addIcon,
    zIndex: 2,
    ...style,
  };
};

export enum NODE_EVENT {
  prepend = 'el-node:prepend',
  append = 'el-node:append',
  replace = 'el-node:replace',
  delete = 'el-node:delete',
}

export async function collapseShape(
  id: string | undefined,
  collapsed: boolean | undefined,
  graph: Graph,
  options: boolean | CollapseExpandNodeOptions = false,
) {
  if (!id) return;
  const targetEdge = graph.getRelatedEdgesData(id).find((e) => e.source === id);
  const childrenData = graph.getChildrenData(id);

  if (!targetEdge) return;
  if (collapsed) {
    graph.updateEdgeData([
      {
        id: targetEdge.id,
        target: targetEdge.id!.split('->')[1],
      },
    ]);
    await graph.expandElement(id, options);
    await Promise.all(
      childrenData
        .map((child) => {
          if (Array.isArray(child.children) && child.children.length) {
            return collapseShape(child.id, true, graph, false);
          }
          return false;
        })
        .filter(Boolean),
    );
  } else {
    const end = childrenData.find((n) => (n.data as ElLikeData)?.model instanceof ELEndNode);
    const endTargetId =
      end && graph.getRelatedEdgesData(end.id).find((e) => e.source === end.id)?.target;

    graph.updateEdgeData([
      {
        id: targetEdge.id,
        target: endTargetId,
      },
    ]);
    await graph.collapseElement(id, options);
  }
  await graph.layout();
}

export const getTextRect = textBounding('8px');

export interface ElLikeData extends NodeData {
  data?: {
    model?: ELNode;
  };
}

export function getLabelWidth(labelText: string | number = '') {
  const MIN_WIDTH = 40;
  const width = getTextRect(labelText, '14px')[0] + 40;

  return width < MIN_WIDTH ? MIN_WIDTH : width;
}
export class ElRectNode extends Rect {
  static type = 'EL_NODE';
  name = this.constructor.name;
  owner?: ElRectNode;
  public get parsedAttributes(): Required<ElRectNodeStyleProps> {
    const attributes = super.parsedAttributes as Required<ElRectNodeStyleProps>;

    if (attributes.badgeText) {
      attributes.badges = [{ text: attributes.badgeText }];
    } else {
      const parent = this.data?.data?.model?.parent;

      if (parent?.type === ConditionTypeEnum.THEN && this.data?.type === NodeTypeEnum.COMMON) {
        attributes.badges = [{ text: ConditionTypeEnum.THEN }];
      }
    }
    return attributes;
  }
  get mount() {
    return this.context.model.hasNode(this.id);
  }
  get data() {
    return this.mount ? (this.context.model.getNodeLikeDatum(this.id) as ElLikeData) : null;
  }
  get childrenData() {
    return this.mount ? this.context.model.getChildrenData(this.id) : [];
  }
  get isCommon() {
    return this.data?.data?.model?.type === NodeTypeEnum.COMMON;
  }
  getSize(attributes = this.attributes) {
    if (attributes.size === void 0) {
      const width = getLabelWidth(attributes.labelText);
      const size = parseSize([width, 40]);

      this.context.graph.updateNodeData([{ id: this.id, style: { size } }]);
      return size;
    }
    return parseSize(attributes.size);
  }
  handleEvent(key: keyof ToolbarProps): void {
    const btn = this.getShape(key);

    if (btn && !Reflect.has(btn, '__bind__')) {
      Reflect.set(btn, 'owner', this);
      Reflect.set(btn, '__bind__', true);
      const graph = this.context.graph;

      btn.addEventListener(CommonEvent.POINTER_ENTER, () => {
        btn.style.shadowColor = shadowMap[key];
        btn.style.shadowBlur = 10;
        btn.style.shadowType = 'outer';
      });
      btn.addEventListener(CommonEvent.POINTER_LEAVE, () => {
        btn.style.shadowBlur = 0;
      });
      btn.addEventListener(CommonEvent.CLICK, () => {
        const _model = this.data?.data?.model as ELNode;

        graph.emit(NODE_EVENT[key], _model);
      });
    }
  }
  getKeyStyle(): Required<ElRectNodeStyleProps> {
    const customStyle = this.data?.style
      ? super.getKeyStyle(this.data?.style as Required<ElRectNodeStyleProps>)
      : {};

    return Object.assign(
      {
        lineWidth: 1,
        stroke: '#5F95FF',
        fill: '#F7FAFF',
        radius: 4,
      } as Required<ElRectNodeStyleProps>,
      customStyle,
    );
  }
  getLabelStyle(attributes: Required<ElRectNodeStyleProps>): LabelStyleProps | false {
    if (!this.data || attributes.label === false || !attributes.labelText) return false;
    const style = this.getKeyStyle();
    const labelStyle: LabelStyleProps = subStyleProps(
      this.getGraphicStyle(this.data?.style as Required<ElRectNodeStyleProps>),
      'label',
    );

    return Object.assign(
      {
        x: style.x + 30,
        y: style.y + 22,
        textAlign: 'left',
        textOverflow: 'ellipsis',
        textBaseline: 'middle',
        fontSize: 14,
        opacity: 0.85,
        fill: '#4083f7',
      },
      labelStyle,
    );
  }

  getIconStyle(attributes: Required<ElRectNodeStyleProps>): ImageStyleProps | false {
    if (!this.data || attributes.icon === false || (!attributes.iconText && !attributes.iconSrc))
      return false;
    const style = this.getKeyStyle();
    const iconStyle: ImageStyleProps = subStyleProps(
      this.getGraphicStyle(this.data.style as Required<ElRectNodeStyleProps>),
      'icon',
    );

    return Object.assign(
      {
        x: style.x + 16,
        y: style.y + 20,
        width: 16,
        height: 16,
        zIndex: 1,
      },
      iconStyle,
    );
  }

  getHaloStyle(attributes: Required<ElRectNodeStyleProps>) {
    if (attributes.halo === false) return false;
    const haloStyle = super.getHaloStyle(attributes);
    const style = Object.assign({}, haloStyle, {
      zIndex: -2,
      lineWidth: 10,
    });

    if (this.data?.type === NodeTypeEnum.COMMON) {
      style.stroke = '#5F95FF';
    }
    return style;
  }

  getBadgeStyle(style: NodeBadgeStyleProps) {
    const badgeStyle = super.getBadgeStyle(style);
    const keyStyle = this.getKeyStyle();
    const width = this.getSize()[0] + Number(keyStyle.lineWidth);

    return Object.assign(
      {
        fontSize: 8,
        padding: [0, 4],
        textBaseline: 'middle',
        textAlign: 'middle',
        fill: keyStyle.fill,
        backgroundFill: this.data?.type === NodeTypeEnum.COMMON ? keyStyle.stroke : '#fff',
        zIndex: 0,
        y: -18,
        x: width / 2 - getTextRect(badgeStyle.text)[0] / 2 - 8,
        backgroundRadius: 2.5,
      } as NodeBadgeStyleProps,
      badgeStyle,
    );
  }
  getCollapseStyle(attributes: Required<ElRectNodeStyleProps>): BadgeStyleProps | false {
    if (this.childrenData.length === 0) return false;
    const { collapsed } = attributes;
    const [, height] = super.getSize(attributes);
    const style = this.getKeyStyle();

    return {
      backgroundFill: '#fff',
      backgroundHeight: 16,
      backgroundLineWidth: 1,
      backgroundRadius: 2,
      backgroundStroke: style.stroke || '#CED4D9',
      backgroundWidth: 16,
      cursor: 'pointer',
      fill: style.stroke || '#CED4D9',
      fontSize: 16,
      text: collapsed ? '+' : '-',
      textAlign: 'center',
      textBaseline: 'middle',
      y: height / 2,
      zIndex: 1,
    };
  }
  drawCollapseShape(attributes: Required<ElRectNodeStyleProps>, container: Group) {
    const collapseStyle = this.getCollapseStyle(attributes);
    const btn = this.upsert('collapse', Badge, collapseStyle, container);

    if (btn && !Reflect.has(btn, '__bind__')) {
      Reflect.set(btn, '__bind__', true);
      btn.addEventListener(CommonEvent.CLICK, () => {
        collapseShape(this.id, this.attributes.collapsed, this.context.graph);
      });
    }
  }
  getPrependStyle(attributes: Required<ElRectNodeStyleProps>): ImageStyleProps | false {
    if (!attributes.toolbar.prepend) return false;
    const style = this.getKeyStyle();

    return addIconStyle({
      x: style.x - 8,
      y: style.y + 12,
    });
  }
  drawPrependShape(attributes: Required<ElRectNodeStyleProps>, container: Group) {
    const appendStyle = this.getPrependStyle(attributes);

    this.upsert('prepend', Image, appendStyle, container);
    this.handleEvent('prepend');
  }

  getAppendStyle(attributes: Required<ElRectNodeStyleProps>): ImageStyleProps | false {
    if (!attributes.toolbar.append) return false;
    const style = this.getKeyStyle();

    return addIconStyle({
      x: -(style.x + 8),
      y: style.y + 12,
    });
  }
  drawAppendShape(attributes: Required<ElRectNodeStyleProps>, container: Group) {
    const appendStyle = this.getAppendStyle(attributes);

    this.upsert('append', Image, appendStyle, container);
    this.handleEvent('append');
  }
  getDeleteShape(attributes: Required<ElRectNodeStyleProps>): RectStyleProps | false {
    if (!attributes.toolbar.delete) return false;
    const style = this.getKeyStyle();
    const [width, height] = this.getSize();
    const notCollapse = this.childrenData.length === 0;

    return btnStyle({
      x: -(style.x + width / 2),
      y: style.y + 8 + height,
      radius: [0, 0, 4, 4],
      iconSrc: deleteIcon,
      iconY: notCollapse ? 0 : 6,
      labelText: '删除',
      labelY: notCollapse ? -5 : 1,
      fill: '#FFF6F6',
      stroke: shadowMap.delete,
      size: [40, notCollapse ? 16 : 28],
    });
  }
  drawDeleteShape(attributes: Required<ElRectNodeStyleProps>, container: Group) {
    const deleteStyle = this.getDeleteShape(attributes);

    this.upsert('delete', Rect, deleteStyle, container);
    this.handleEvent('delete');
  }
  getReplaceShape(attributes: Required<ElRectNodeStyleProps>): RectStyleProps | false {
    if (!attributes.toolbar.replace) return false;
    const style = this.getKeyStyle();
    const [width] = this.getSize();

    return btnStyle({
      x: style.x + width / 2,
      y: style.y - 8,
      iconSrc: replaceIcon,
      iconY: this.isCommon ? 0 : -9,
      labelText: '替换',
      labelY: this.isCommon ? -5 : -14,
      fill: '#FFFBF3',
      stroke: shadowMap.replace,
      size: [40, this.isCommon ? 16 : 32],
    });
  }
  drawReplaceShape(attributes: Required<ElRectNodeStyleProps>, container: Group) {
    const replaceStyle = this.getReplaceShape(attributes);

    this.upsert('replace', Rect, replaceStyle, container);
    this.handleEvent('replace');
  }

  async render(attributes = this.parsedAttributes, container: Group) {
    super.render(attributes, container);
    this.drawCollapseShape(attributes, container);

    if (!Reflect.has(container, '__bind__')) {
      Reflect.set(container, '__bind__', true);
    }
    if (store.readonly) {
      this.removeShape();
      container.removeEventListener(CommonEvent.POINTER_ENTER, this.drawShape);
      container.removeEventListener(CommonEvent.POINTER_LEAVE, this.removeShape);
    } else {
      container.addEventListener(CommonEvent.POINTER_ENTER, this.drawShape);
      container.addEventListener(CommonEvent.POINTER_LEAVE, this.removeShape);
    }
  }
  drawShape() {
    const attributes = this.parsedAttributes;

    if (!this.getShape('append')) {
      this.drawAppendShape(attributes, this);
    }
    if (!this.getShape('prepend')) {
      this.drawPrependShape(attributes, this);
    }
    if (!this.getShape('delete')) {
      this.drawDeleteShape(attributes, this);
    }
    if (!this.getShape('replace')) {
      this.drawReplaceShape(attributes, this);
    }
  }
  removeShape() {
    this.upsert('append', Image, false, this);
    this.upsert('prepend', Image, false, this);
    this.upsert('delete', Rect, false, this);
    this.upsert('replace', Rect, false, this);
  }
}
