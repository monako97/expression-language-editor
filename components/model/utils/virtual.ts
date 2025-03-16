import type { NodeData } from '@antv/g6';

import icon from '../../assets/virtual-icon.svg';
import { NodeTypeEnum } from '../../enums';
import { type DSL, ELNode, type GraphData, type Properties } from '../node';

/**
 * 操作符中占位节点的模型（作为占位节点的代理），
 * 操作符包括IF等等
 */
export class ELVirtualNode extends ELNode {
  static icon = icon;
  static type = NodeTypeEnum.VIRTUAL;
  public index: number = 0;
  public parent: ELNode;
  public proxy: ELNode;
  type = NodeTypeEnum.VIRTUAL;

  constructor(parent: ELNode, index: number, proxy: ELNode) {
    super();
    this.parent = parent;
    this.index = index;
    this.proxy = proxy;
  }

  public prepend(newNode: ELNode): boolean {
    return this.replace(newNode);
  }

  public append(newNode: ELNode): boolean {
    return this.replace(newNode);
  }

  public remove(): boolean {
    return false;
  }

  public replace(newNode: ELNode): boolean {
    return this.parent.appendChild(newNode, this.index);
  }

  public toCells(): GraphData {
    return this.proxy.toCells();
  }

  public getCells(): GraphData {
    return this.proxy.getCells();
  }

  public getNodes(): NodeData[] {
    return this.proxy.getNodes();
  }

  public getStartNode(): NodeData {
    return this.proxy.getStartNode();
  }

  public getEndNode(): NodeData {
    return this.proxy.getEndNode();
  }

  public getProperties(): Properties {
    return this.proxy.getProperties();
  }

  public setProperties(properties: Properties): void {
    this.proxy.setProperties(properties);
  }

  public propertiesToEL(): string {
    return this.proxy.propertiesToEL();
  }

  public toEL(prefix?: string): string {
    return this.proxy.toEL(prefix);
  }

  public toJSON(): DSL {
    return this.proxy.toJSON();
  }
}
