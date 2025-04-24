import React, { memo, useState } from 'react';
import { author, name, repository } from '@app/info';

import './footer.css';

const Footer = () => {
  'use memo';
  const [year] = useState(new Date().getFullYear());

  return (
    <footer className="n-site-footer">
      <p>
        <a
          className="n-site-footer-link"
          href={repository?.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {name}&nbsp;
        </a>
        Ⓒ {year} Made with ❤️‍🔥 by&nbsp;
        <a
          className="n-site-footer-link"
          href={author?.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {author?.name}
        </a>
      </p>
    </footer>
  );
};

export default memo(Footer, () => true);
