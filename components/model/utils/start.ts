import type { NodeData } from '@antv/g6';

import icon from '../../assets/start-icon.svg';
import { NodeTypeEnum } from '../../enums';
import { type DSL, ELNode, type GraphData, type Properties } from '../node';

/**
 * 操作符中开始节点的模型（作为操作符模型的代理），
 * 操作符包括WHEN、CATCH、AND、OR、NOT等等。
 */
export class ELStartNode extends ELNode {
  static icon = icon;
  static label = '开始';
  static type = NodeTypeEnum.VIRTUAL;
  type = NodeTypeEnum.VIRTUAL;
  /** 代理的节点组件 */
  public proxy: ELNode;
  /** 代理节点组件的相关属性 */
  public parent?: ELNode;

  constructor(proxy: ELNode) {
    super();
    this.proxy = proxy;
    this.parent = proxy.parent;
  }

  public prepend(newNode: ELNode): boolean {
    return this.proxy.prepend(newNode);
  }

  public append(newNode: ELNode): boolean {
    return this.proxy.prependChild(newNode);
  }

  public remove(): boolean {
    return this.proxy.remove();
  }

  public replace(newNode: ELNode): boolean {
    return this.proxy.replace(newNode);
  }

  public toCells(): GraphData {
    throw new Error('Method not implemented.');
  }

  public getCells(): GraphData {
    return this.proxy.getCells();
  }

  public getNodes(): NodeData[] {
    return this.proxy.getNodes();
  }

  public getStartNode() {
    return this.proxy.getStartNode();
  }

  public getEndNode() {
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
