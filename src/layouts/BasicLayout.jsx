/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout from '@ant-design/pro-layout';
import React, { useEffect } from 'react';
import Link from 'umi/link';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { isAntDesignPro } from '@/utils/utils';
import logo from '../assets/logo.svg';
import DocumentTitle from 'react-document-title'
/**
 * use Authorized check all menu item
 */
const menuDataRender = menuList =>
  menuList.map(item => {
    const localItem = { ...item, children: item.children ? menuDataRender(item.children) : [] };
    console.log(item, localItem,'7777777',Authorized.check(item.authority, localItem, null),'========')
    return Authorized.check(item.authority, localItem, null);
  });

const footerRender = (_, defaultDom) => {
  if (!isAntDesignPro()) {
    return defaultDom;
  }

  return (
    <>
      {defaultDom}
      <div
        style={{
          padding: '0px 24px 24px',
          textAlign: 'center',
        }}
      >
        <a href="https://www.netlify.com" target="_blank" rel="noopener noreferrer">
          <img
            src="https://www.netlify.com/img/global/badges/netlify-color-bg.svg"
            width="82px"
            alt="netlify logo"
          />
        </a>
      </div>
    </>
  );
};

const BasicLayout = props => {
  const { dispatch, children, settings,location: { pathname },breadcrumbNameMap } = props;
  /**
   * constructor
   */

  useEffect(() => {
    if (dispatch) {
      // dispatch({
      //   type: 'user/fetchCurrent',
      // });
      // dispatch({
      //   type: 'settings/getSetting',
      // });
    }
  }, []);
  /**
   * init variables
   */

  const handleMenuCollapse = payload => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  };
  const matchParamsPath = (pathname, breadcrumbNameMap) => {
    const pathKey = Object.keys(breadcrumbNameMap).find(key => pathToRegexp(key).test(pathname));
    return breadcrumbNameMap[pathKey];
  };
const getPageTitle = (pathname, breadcrumbNameMap) => {
    console.log(pathname, breadcrumbNameMap)
    // debugger;;
    // const currRouterData = matchParamsPath(pathname, breadcrumbNameMap);

    // if (!currRouterData) {
    //   return 'Ant Design Pro';
    // }
    // const pageName = formatMessage({
    //   id: currRouterData.locale || currRouterData.name,
    //   defaultMessage: currRouterData.name,
    // });

    return `${pathname} - Ant Design Pro`;
  };
  return (
      <DocumentTitle  logo={logo} title={getPageTitle(pathname, breadcrumbNameMap)}>
    <ProLayout
    //   logo={logo}
    //   title={'智慧街面巡防'}
    //   onCollapse={handleMenuCollapse}
      menuItemRender={(menuItemProps, defaultDom) => {
        if (menuItemProps.isUrl) {
          return defaultDom;
        }

        return <Link to={menuItemProps.path}>{defaultDom}</Link>;
      }}
      pageTitleRender={ () => {
          return 'hdjhaj'
      }}
      breadcrumbRender={(routers = []) => [
        // {
        //   path: '/',
        //   breadcrumbName: formatMessage({
        //     id: 'menu.home',
        //     defaultMessage: 'Home',
        //   }),
        // },
        // ...routers,
      ]}
    //   itemRender={(route, params, routes, paths) => {
    //     const first = routes.indexOf(route) === 0;
    //     return first ? (
    //       <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
    //     ) : (
    //       <span>{route.breadcrumbName}</span>
    //     );
    //   }}
      footerRender={false}
      menuDataRender={menuDataRender}
    //   formatMessage={formatMessage}
      rightContentRender={rightProps => <RightContent {...rightProps} />}
      {...props}
      {...settings}
    >
      {children}
    </ProLayout>
    </DocumentTitle>
  );
};

export default connect(({ global, settings }) => ({
  collapsed: global.collapsed,
  settings,
}))(BasicLayout);
