import React from 'react';
import { registry, Skeleton } from 'neko-ui';

registry(Skeleton);
const Fallback = () => {
  return <n-skeleton active={true} title={true} rows={6} />;
};

export default Fallback;
