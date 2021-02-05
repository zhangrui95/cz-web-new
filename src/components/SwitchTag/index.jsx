import React from 'react';
import { Button } from 'antd';
import styles from './index.less';

const SwitchTag = props => {
  const { expandForm, titles, loading } = props;
  return (
    <div className={styles.headerInfo}>
      {titles.map(item => (
        <Button
          type="primary"
          key={item.id}
          size="large"
          className={styles.button}
          style={{ backgroundColor: item.clicked ? '#2B9FF6' : '#333367' }}
          onClick={props.toggleForm}
          loading={loading}
        >
          {item.title}
        </Button>
      ))}
    </div>
  );
};

export default SwitchTag;
