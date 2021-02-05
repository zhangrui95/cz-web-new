import React, { Component } from 'react';
import {
    Message,
    Row,
    Col,
    Switch,
    Result,
    Form,
    Divider,
    Badge,
    Card,
    Button,
    Menu,
    Icon,
    Avatar,
    Modal,
} from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import styles from './style.less';
import PoliceUnit from './policeUnit/index';
import Shift from './shift/index';
import Equip from './equip/index';
import Firearms from './firearms/index';
import EquipStatistics from './equipStatistics/index';
import Organization from './organization/index';
import OrganizationOtherMap from './organizationOtherMap/index';
import Patrol from './patrol/index';
import PatrolOtherMap from './patrolOtherMap/index';
import Reported from './reported/index';
import { authorityIsTrue } from '@/utils/authority';

@connect(({ service, loading }) => ({
    service,
    loading: loading.models.service,
}))
class service extends Component {
    state = {
        current: authorityIsTrue('czht_qwgl_jgbj')
            ? '0'
            : authorityIsTrue('czht_qwgl_xlfw')
            ? '1'
            : authorityIsTrue('czht_qwgl_jldy')
            ? '2'
            : authorityIsTrue('czht_qwgl_bcgl')
            ? '3'
            : authorityIsTrue('czht_qwgl_zbgl')
            ? '4'
            : authorityIsTrue('czht_qwgl_ZBTJ')
            ? '5'
            : authorityIsTrue('czht_qwgl_qwbb')
            ? '6'
            : authorityIsTrue('czht_qwgl_qwjg')
            ? '7'
            : '',
        isDraw: false,
        // current: '5'
    };

    componentWillMount() {}
    componentDidMount() {
        console.log(this.props);
        if (this.props.location.state != undefined) {
            const states = this.props.location.state;
            console.log(states);
            this.setState({ current: states.expandForm });
        }
        this.getUseDept();
    }
    getUseDept = () => {
        const { dispatch } = this.props;
        let codes = [];
        const groupList = JSON.parse(sessionStorage.getItem('user')).groupList;
        for (var i = 0; i < groupList.length; i++) {
            codes.push(groupList[i].code);
        }
        if (codes.length == groupList.length) {
            dispatch({
                type: 'service/getUseDept',
                payload: {
                    // department: JSON.parse(sessionStorage.getItem('user')).department,
                    groupList: codes,
                },
            });
        }
    };
    handleMune = e => {
        console.log('click ', e, this.state.isDraw);
        var _self = this;
        if (this.state.isDraw) {
            Modal.confirm({
                title: '切换后当前绘制数据将清除，是否要切换？',
                okText: '确认',
                cancelText: '取消',
                onOk() {
                    _self.setState({
                        current: e,
                        isDraw: false,
                    });
                },
            });
        } else {
            this.setState({
                current: e,
                isDraw: false,
            });
        }
    };
    prompt = e => {
        console.log('切换页面', e);
        this.setState({ isDraw: e });
    };
    renderCard = () => {
        switch (this.state.current) {
            case '0':
                return window.configUrl.mapType === 'openlayers' || !window.configUrl.mapType ? (
                    <Organization prompt={e => this.prompt(e)} />
                ) : (
                    <OrganizationOtherMap prompt={e => this.prompt(e)} />
                );
                break;
            case '1':
                return window.configUrl.mapType === 'openlayers' || !window.configUrl.mapType ? (
                    <Patrol prompt={e => this.prompt(e)} />
                ) : (
                    <PatrolOtherMap prompt={e => this.prompt(e)} />
                );
                break;
            case '2':
                return <PoliceUnit />;
                break;
            case '3':
                return <Shift />;
                break;
            case '4':
                return <Equip />;
                break;
            case '5':
                return (
                    <EquipStatistics history={this.props.history} location={this.props.location} />
                );
                break;
            case '6':
                return <Reported />;
                break;
            case '8':
                return <Firearms />;
                break;
            default:
                break;
        }
    };
    render() {
        const { loading } = this.props;
        const menuList = [
            { name: '机构边界', key: '0', permissions: 'czht_qwgl_jgbj' },
            { name: '巡逻范围', key: '1', permissions: 'czht_qwgl_xlfw' },
            { name: '警力单元', key: '2', permissions: 'czht_qwgl_jldy' },
            { name: '班次管理', key: '3', permissions: 'czht_qwgl_bcgl' },
            { name: '装备管理', key: '4', permissions: 'czht_qwgl_zbgl' },
            { name: '装备统计', key: '5', permissions: 'czht_qwgl_zbtj' },
            { name: '勤务报备', key: '6', permissions: 'czht_qwgl_qwbb' },
            { name: '勤务结果', key: '7', permissions: 'czht_qwgl_qwjg' },
            { name: '勤务枪支管理', key: '8', permissions: 'czht_qwgl_qwbb' },
        ];

        return (
            <div>
                <div className={styles.headerInfo}>
                    {menuList.map(item =>
                        authorityIsTrue(item.permissions) ? (
                            <Button
                                type="primary"
                                key={item.key}
                                size="large"
                                className={styles.button}
                                style={{
                                    backgroundColor:
                                        this.state.current == item.key ? '' : '#333367',
                                }}
                                onClick={() => this.handleMune(item.key)}
                                // loading={loading}
                            >
                                {item.name}
                            </Button>
                        ) : null,
                    )}
                </div>

                {this.state.current != '' ? (
                    this.renderCard()
                ) : (
                    <div>
                        <Result status="403" title="403" subTitle="抱歉，您没有相关权限" />
                    </div>
                )}
            </div>
        );
    }
}

export default Form.create()(service);
// export default () => <div>hecha</div>;
