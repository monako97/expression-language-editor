import React, { memo } from 'react';

const Fallback = () => {
  'use memo';
  return <n-skeleton active={true} title={true} rows={6} />;
};

export default memo(Fallback);
