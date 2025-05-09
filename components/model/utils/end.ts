import type { NodeData } from '@antv/g6';

import { NodeTypeEnum } from '../../enums';
import { type DSL, ELNode, type GraphData, type Properties } from '../node';

/**
 * 操作符中结束节点的模型（作为操作符模型的代理），
 * 操作符包括WHEN、SWITCH、IF、FOR、WHILE、CATCH、AND、OR、NOT等等。
 */
export class ELEndNode extends ELNode {
  static icon =
    "data:image/svg+xml,%3csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3e%3cg transform='translate(3 3)' stroke='currentColor' stroke-width='1.6' fill='white' fill-rule='evenodd'%3e%3ccircle cx='9' cy='9' r='9'/%3e%3cpath d='M6 6h5.75v5.75H6z'/%3e%3c/g%3e%3c/svg%3e";
  static label = '结束';
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
    return this.proxy.appendChild(newNode);
  }

  public append(newNode: ELNode): boolean {
    return this.proxy.append(newNode);
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
