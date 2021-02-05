import { Avatar, Icon, Menu, Spin } from 'antd';
import { FormattedMessage } from 'umi-plugin-react/locale';
import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import user from '@/assets/user.png';


class AvatarDropdown extends React.Component {
    onMenuClick = event => {
        const { key } = event;

        if (key === 'logout') {
            const { dispatch } = this.props;

            if (dispatch) {
                dispatch({
                    type: 'login/logout',
                });
            }

            return;
        }

        router.push(`/account/${key}`);
    };

    render() {
        const {
            currentUsers,
            menu,
        } = this.props;
        // const currentUser = JSON.parse(sessionStorage.getItem('user'));

        const menuHeaderDropdown = (
            <Menu className={styles.menu} selectedKeys={[]} onClick={this.onMenuClick}>
                {/* {menu && (
          <Menu.Item key="center">
            <Icon type="user" />
            <FormattedMessage id="menu.account.center" defaultMessage="account center" />
          </Menu.Item>
        )}
        {menu && (
          <Menu.Item key="settings">
            <Icon type="setting" />
            <FormattedMessage id="menu.account.settings" defaultMessage="account settings" />
          </Menu.Item>
        )}
        {menu && <Menu.Divider />} */}

                <Menu.Item key="logout">
                    <Icon type="logout" />
                    <FormattedMessage id="menu.account.logout" defaultMessage="logout" />
                </Menu.Item>
            </Menu>
        );
        return currentUsers && currentUsers.name ? (
            <HeaderDropdown overlay={menuHeaderDropdown} >

        <span className={`${styles.action} ${styles.account}`}>
        {
            //   console.log(currentUsers,'currentUser---',this.props)
        }
            <Avatar size="small" className={styles.avatar} src={currentUsers.photo || user} alt="avatar" />
            {/* <span className={styles.name}>{currentUser.name}</span> */}
            {
                JSON.parse(sessionStorage.getItem('quit'))
                    ?
                    <Icon type="down" />
                    :
                    null
            }
        </span>
            </HeaderDropdown>
        ) : (
            <Spin
                size="small"
                style={{
                    marginLeft: 8,
                    marginRight: 8,
                }}
            />
        );
    }
}

export default connect(({ user }) => ({
    currentUser: user.currentUser,
}))(AvatarDropdown);
