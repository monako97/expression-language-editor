---
title: 基本使用
description: 基本使用
order: 1
---

```jsx
import React, { useCallback, useState } from 'react';
import { Modal, Button, registry } from 'neko-ui';
import { ElEditor, toJSON, Modal } from 'expression-language-editor';

registry(Button);
const SaveDSL = () => {
  return (
    <n-button
      onClick={() => {
        Modal.open({
          title: '保存DSL!!!',
          content: () => {
            const code = document.createElement('n-code');

            code.css = `pre {
              background-color: transparent;
              box-shadow: none;
            }`;
            code.language = 'javascript';
            code.code = JSON.stringify(toJSON(), null, 4);
            return code;
          },
          async onOk() {
            return new Promise((resolve) => {
              setTimeout(() => {
                console.log('close');
                resolve(true);
              }, 2000);
            });
          },
          centered: true,
          okText: '确定',
        });
      }}
    >
      保存 DSL
    </n-button>
  );
};

function Demo() {
  return (
    <div style={{ height: 500 }}>
      <ElEditor widgets={[SaveDSL]} />
    </div>
  );
}

export default Demo;
```
