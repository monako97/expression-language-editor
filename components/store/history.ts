import sso from 'shared-store-object';

import { ELBuilder } from '../model/builder';
import type { DSL, ELNode } from '../model/node';

import { model, modelRefresh, modelRelayout, toJSON } from '.';

const history = sso({
  $historyStack: [{}] as DSL[],
  $cursorIndex: 0 as number,
});

export const resetHistory = () => {
  history.$historyStack = [{}];
  history.$cursorIndex = 0;
};

export const cleanHistory = (el: ELNode) => {
  history.$historyStack = [el.toJSON()];
  history.$cursorIndex = 0;
};

export const countHistory = () => {
  return history.$historyStack.length ? history.$historyStack.length - 1 : 0;
};

export const canRedoHistory = () => {
  return history.$cursorIndex < history.$historyStack.length - 1;
};
export const canUndoHistory = () => {
  return history.$cursorIndex > 0;
};
export const redoHistory = () => {
  if (canRedoHistory()) {
    history.$cursorIndex++;
    model.root = ELBuilder.build(history.$historyStack[history.$cursorIndex]);
    modelRelayout();
    modelRefresh();
  }
};
export const undoHistory = () => {
  if (canUndoHistory()) {
    history.$cursorIndex--;
    model.root = ELBuilder.build(history.$historyStack[history.$cursorIndex]);
    modelRelayout();
    modelRefresh();
  }
};
export const pushHistory = (options = { silent: false }) => {
  if (history.$historyStack.length > history.$cursorIndex + 1) {
    history.$historyStack.splice(
      history.$cursorIndex + 1,
      history.$historyStack.length - history.$cursorIndex,
    );
  }
  history.$historyStack.push(toJSON());
  history.$cursorIndex++;
  if (!options.silent) {
    modelRelayout();
  }
  modelRefresh();
};
export default history;
