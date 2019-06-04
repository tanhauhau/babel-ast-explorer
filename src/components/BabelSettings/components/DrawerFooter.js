import React from 'react';
import styles from './DrawerFooter.module.scss';

export default function DrawerFooter() {
  return (
    <div className={styles.footer}>
      {'Built with '}
      <a href="https://reactjs.org/" rel="noopener noreferrer" target="_blank">
        React
      </a>
      {', '}
      <a href="https://ant.design" rel="noopener noreferrer" target="_blank">
        Ant Design
      </a>
      {', '}
      <a href="http://babeljs.io" rel="noopener noreferrer" target="_blank">
        Babel
      </a>
      {' and ❤| '}
      <a
        href="https://github.com/tanhauhau/babel-ast-explorer"
        rel="noopener noreferrer"
        target="_blank"
      >
        Github
      </a>
    </div>
  );
}
