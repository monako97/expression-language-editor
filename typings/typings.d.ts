declare module 'expression-language-editor' {
  export * from '@pkg/editor';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-Any
type Any = Any;

declare interface LiteFlowNode {
  type: string;
  label: string;
  icon: string;
  shape?: string;
  node?: Any;
  disabled?: boolean;
}

declare type IContextPadScene = 'append' | 'prepend' | 'replace';
