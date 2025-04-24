import React, { type FC, memo, useMemo } from 'react';
import coverage from '@app/coverage';
import { name } from '@app/info';
import { useLocation } from '@moneko/react';

import './coverage.css';

type CoverageType = 'statements' | 'conditionals' | 'methods';
const conf: Record<CoverageType, string> = {
  statements: '语句覆盖率',
  conditionals: '条件覆盖率',
  methods: '函数覆盖率',
};

function getNum(num: number) {
  return typeof num === 'number' && !isNaN(num) ? num : '-';
}
const Coverage: FC = () => {
  'use memo';
  const location = useLocation();
  const coverages = useMemo(() => {
    const component = location.pathname.substring(1);

    return coverage[component ? `components.${component}` : name] || {};
  }, [location.pathname]);

  if (location.pathname === '/examples') return null;
  if (location.pathname === '/fap') return null;
  return (
    <div className="site-coverage">
      {Object.keys(conf).map((k) => {
        const c = parseFloat(coverages[k as CoverageType]);
        const covered = parseFloat(coverages[`covered${k}` as CoverageType]);
        const coverNum = c === 0 && covered === 0 ? 100 : Math.round((covered / c) * 100) || 0;
        const stat = coverNum < 50 ? 'error' : coverNum < 80 ? 'warning' : 'success';

        return (
          <div key={k} className={`site-coverage-body site-coverage-${stat}`}>
            <div className="site-coverage-label">{conf[k as CoverageType]}</div>
            <div className="site-coverage-value">
              <div>{coverNum}%</div>
              <div>{`${getNum(c)} / ${getNum(covered)}`}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default memo(Coverage, () => true);
