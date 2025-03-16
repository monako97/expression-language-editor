import React from 'react';

import FitView from './fit-view';
import Fullscreen from './fullscreen';
import Redo from './redo';
import Save from './save';
import Undo from './undo';
import Zoom from './zoom';
// import Mock from './mock'

const tools: React.FC[][] = [
  [Zoom],
  [FitView, Undo, Redo, Save, Fullscreen],
  // ,[Mock]
];

export default tools;
