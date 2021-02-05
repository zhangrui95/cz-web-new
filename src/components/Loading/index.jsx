import React from 'react';
import { Button,Icon } from 'antd';
import styles from './index.less';

const Loadings = props => {
  return (
    <div className={styles.headerInfo}>
      <Icon type="loading" />
    </div>
  );
};

export default Loadings;
