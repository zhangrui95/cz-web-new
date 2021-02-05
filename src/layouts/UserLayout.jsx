import { getMenuData, getPageTitle } from '@ant-design/pro-layout';
import DocumentTitle from 'react-document-title';
import React from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import styles from './UserLayout.less';
import userBack from '../assets/userBack.jpg';

const UserLayout = props => {
  const {
    route = {
      routes: [],
    },
  } = props;
  const { routes = [] } = route;
  const {
    children,
    location = {
      pathname: '',
    },
  } = props;
  const { breadcrumb } = getMenuData(routes);

  const containerStyle = {
    backgroundImage: `url(${userBack})`,
  };
  return (
    <DocumentTitle
    title={window.configUrl.name}
    //   title={getPageTitle({
    //     // pathname: location.pathname,
    //     breadcrumb,
    //     formatMessage,
    //     ...props,
    //   })}
    >
   
      {/* <div className={styles.container} style={containerStyle}> */}
      <div className={`${styles.container} ${styles.containerStyle} `} >
        <img src='./image/userBack.jpg' alt="" className={styles.containerImg}/>
        {/* <div className={styles.lang}>
          <SelectLang />
        </div> */}
        <div className={styles.content}>{children}</div>
        {/* <DefaultFooter /> */}
      </div>
    </DocumentTitle>
  );
};

export default connect(({ settings }) => ({ ...settings }))(UserLayout);
