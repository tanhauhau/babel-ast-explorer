import React from 'react';
import { Tag } from 'antd';
import styles from './Tags.module.scss';

function Tags({ settings, onClick }) {
  const enabledSettings = Object.keys(settings).filter(
    setting => settings[setting].enabled
  );

  return (
    <span className={styles.container}>
      {enabledSettings.map(setting => (
        <Tag key={setting} onClick={onClick}>
          {setting}
        </Tag>
      ))}
    </span>
  );
}

export default React.memo(Tags);
