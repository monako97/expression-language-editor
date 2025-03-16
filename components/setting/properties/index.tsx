import React, { useEffect, useMemo, useRef } from 'react';
import type { InputElement, InputNumberElement, SelectElement } from 'neko-ui';

import { ConditionTypeEnum, NodeTypeEnum } from '../../enums';
import { getSelectElNode, model, store, updateElNodeData } from '../../store';

const anyOptions = [
  { label: '是', value: true },
  { label: '否', value: false },
];

const idChange = (e: CustomEvent) => {
  const current = getSelectElNode();

  updateElNodeData(current, 'id', e.detail);
};
const maxWaitChange = (e: CustomEvent) => {
  const current = getSelectElNode();

  updateElNodeData(current, 'maxWaitSeconds', e.detail);
};
const memoChange = (e: CustomEvent) => {
  const current = getSelectElNode();

  updateElNodeData(current, 'memo', e.detail);
};
const dataChange = (e: CustomEvent) => {
  const current = getSelectElNode();

  updateElNodeData(current, 'data', e.detail);
};
const anyChange = (e: CustomEvent) => {
  const current = getSelectElNode();

  updateElNodeData(current, 'any', e.detail[0]);
};
const tagChange = (e: CustomEvent) => {
  const current = getSelectElNode();

  updateElNodeData(current, 'tag', e.detail[0]);
};
const Properties: React.FC = () => {
  const { refresh } = model;
  const { tagOptions = [], readonly } = store;
  const current = getSelectElNode();
  const anyRef = useRef<SelectElement>(null);
  const idRef = useRef<InputElement>(null);
  const memoRef = useRef<InputElement>(null);
  const maxWaitRef = useRef<InputNumberElement>(null);
  const dataRef = useRef<InputElement>(null);
  const tagRef = useRef<SelectElement>(null);
  const properties = useMemo(() => {
    return { ...current?.getProperties(), id: current?.id, refresh: refresh };
  }, [current, refresh]);

  useEffect(() => {
    const _tag = tagRef.current;

    if (_tag) {
      _tag.options = tagOptions;
    }
    _tag?.addEventListener?.('change', tagChange);
    return () => {
      _tag?.removeEventListener?.('change', tagChange);
    };
  }, [tagOptions]);
  useEffect(() => {
    const _id = idRef.current;
    const _memo = memoRef.current;
    const _data = dataRef.current;
    const _maxWait = maxWaitRef.current;
    const _any = anyRef.current;

    if (_any) {
      _any.options = anyOptions;
    }
    _id?.addEventListener?.('change', idChange);
    _any?.addEventListener?.('change', anyChange);
    _data?.addEventListener?.('change', dataChange);
    _memo?.addEventListener?.('change', memoChange);
    _maxWait?.addEventListener?.('change', maxWaitChange);
    return () => {
      _id?.removeEventListener?.('change', idChange);
      _any?.removeEventListener?.('change', anyChange);
      _data?.removeEventListener?.('change', dataChange);
      _memo?.removeEventListener?.('change', memoChange);
      _maxWait?.removeEventListener?.('change', maxWaitChange);
    };
  }, []);

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBlock: 8 }}>
      {current?.type === ConditionTypeEnum.WHEN && (
        <n-select
          ref={anyRef}
          label="Any（any）"
          value={properties.any as unknown as string}
          disabled={readonly}
          placeholder={readonly ? '-' : void 0}
          style={{ width: '100%', marginBottom: 16 }}
        />
      )}
      <n-input
        ref={idRef}
        label="ID"
        value={properties.id}
        disabled={readonly}
        placeholder={readonly ? '-' : void 0}
        style={{ width: '100%', marginBottom: 16 }}
      />
      {current?.type === NodeTypeEnum.COMMON && (
        <n-input
          ref={dataRef}
          label="参数（data）"
          value={properties.data as string}
          disabled={readonly}
          placeholder={readonly ? '-' : void 0}
          style={{ width: '100%', marginBottom: 16 }}
        />
      )}
      <n-select
        ref={tagRef}
        label="标签（tag）"
        value={properties.tag}
        disabled={readonly}
        placeholder={readonly ? '-' : void 0}
        style={{ width: '100%', marginBottom: 16 }}
      />
      <n-input-number
        ref={maxWaitRef}
        label="超时（maxWaitSeconds）"
        value={properties.maxWaitSeconds}
        min={0}
        disabled={readonly}
        placeholder={readonly ? '-' : void 0}
        style={{ width: '100%', marginBottom: 16 }}
      />
      <n-input
        ref={memoRef}
        label="备注"
        value={properties.memo}
        disabled={readonly}
        placeholder={readonly ? '-' : void 0}
        style={{ width: '100%', marginBottom: 16 }}
      />
    </div>
  );
};

export default Properties;
