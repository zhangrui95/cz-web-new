import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Divider,
    Input,
    Row,
    Select,
    Modal,
    Message,
    List,
    Pagination,
    Radio,
    Table,
    Tag,
} from 'antd';
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './index.less';

@connect(({ otherIndex, loading }) => ({
    otherIndex,
    loading: loading.models.otherIndex,
}))
class switchList extends React.Component {
    state = {
        showHeat: false,
        showPersonHeat: false,
        showLk: false,
        showJurisdiction: true,
        showLayer: false,
        dropDown: false,
        showVehicle: true,
        showMonitoring: false,
        showAlert: false,
        showStation: false,
        showIntercom: false,
        showSwan: false,
        showPlace: true,
        showFirearms: false,
        showIndividual: false,
        showSynergy: false,
        corrdingatedTtype: '',
        logis:true,
        codeChain:true,
        coldStorage:true,
        farmMarket:true,
        express:true,
        showOtherPlace:true,
    };
    componentDidMount() {}
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.showIndividual !== this.props.showIndividual && this.props.showIndividual) {
            this.setState({
                showIndividual: true,
            });
        }
        if (prevProps.showVehicle !== this.props.showVehicle && this.props.showVehicle) {
            this.setState({
                showVehicle: true,
            });
        }
    }

    choose = files => {
        // console.log(files)
        const {
            showHeat,
            showPersonHeat,
            showLk,
            showJurisdiction,
            showSynergy,
            showLayer,
            dropDown,
            showVehicle,
            showMonitoring,
            showAlert,
            showStation,
            showIntercom,
            showSwan,
            showPlace,
            showIndividual,
            showFirearms,
            hdCamera,
            ordinaryCamera,
            remoteCamera,
            logis,
            codeChain,
            coldStorage,
            farmMarket,
            express,
            showOtherPlace,
        } = this.state;
        this.props.getData(files);
        switch (files) {
            case 'hdCamera':
                this.setState({ hdCamera: !hdCamera });
                break;
            case 'ordinaryCamera':
                this.setState({ ordinaryCamera: !ordinaryCamera });
                break;
            case 'remoteCamera':
                this.setState({ remoteCamera: !remoteCamera });
                break;
            case 'logis':
                this.setState({ logis: !logis });
                break;
            case 'express':
                this.setState({ express: !express });
                break;
            case 'codeChain':
                this.setState({ codeChain: !codeChain });
                break;
            case 'coldStorage':
                this.setState({ coldStorage: !coldStorage });
                break;
            case 'farmMarket':
                this.setState({ farmMarket: !farmMarket });
                break;
            case 'showOtherPlace':
                this.setState({ showOtherPlace: !showOtherPlace });
                break;
            case 'showHeat':
                this.setState({ showHeat: !showHeat });
                // this.getHeatMap()
                break;
            case 'showPersonHeat':
                this.setState({ showPersonHeat: !showPersonHeat });
                // this.getHeatMap()
                break;
            case 'showLk':
                this.setState({ showLk: !showLk });
                break;
            case 'showJurisdiction':
                this.setState({ showJurisdiction: !showJurisdiction });
                break;
            case 'showLayer':
                this.setState({ showLayer: !showLayer, dropDown: !showLayer }, () => {
                    if (this.state.showLayer) {
                        this.props.closeSynergy();
                        this.setState({ showSynergy: false, corrdingatedTtype: '' });
                    }
                });
                break;
            case 'showVehicle':
                this.setState({ showVehicle: !showVehicle });
                break;
            case 'showMonitoring':
                this.setState({
                    showMonitoring: !showMonitoring,
                    hdCamera: !showMonitoring,
                    ordinaryCamera: false,
                    remoteCamera: !showMonitoring,
                });
                break;
            case 'showAlert':
                this.setState({ showAlert: !showAlert });
                break;
            case 'showStation':
                this.setState({ showStation: !showStation });
                break;
            case 'showIntercom':
                this.setState({ showIntercom: !showIntercom });
                break;
            case 'showSwan':
                this.setState({ showSwan: !showSwan });
                break;
            case 'showPlace':
                this.setState({
                    showPlace: !showPlace,
                    logis: !showPlace,
                    express: !showPlace,
                    showOtherPlace: !showPlace,
                    codeChain:!showPlace,
                    coldStorage:!showPlace,
                    farmMarket:!showPlace,
                });
                break;
            case 'showFirearms':
                this.setState({ showFirearms: !showFirearms });
                break;
            case 'showIndividual':
                this.setState({ showIndividual: !showIndividual });
                break;
            case 'showSynergy':
                this.setState({ showSynergy: !showSynergy }, () => {
                    if (this.state.showSynergy) {
                        this.setState({ showLayer: false, dropDown: false });
                    }
                });
                break;

            default:
                break;
        }
    };
    join = files => {
        const { dispatch, toSynergyDetail, pageRefresh } = this.props;
        const user = JSON.parse(sessionStorage.getItem('user'));
        dispatch({
            type: 'otherIndex/addPlatformCoordinated',
            payload: {
                coordinated_operations_id: files.coordinated_operations_id,
                organization_code: user.group.code,
                organization_name: user.group.name,
                coordinated_operations_participant: {
                    organization_code: user.group.code,
                    organization_name: user.group.name,
                    participant_status: 1,
                    participant_type: 0,
                },
                participant_status: 1,
            },
            success: e => {
                if (e.result.reason.code == '200') {
                    console.log(e, 'xiangqi=====');
                    sessionStorage.setItem('synergyId', files.coordinated_operations_id);
                    Message.destroy();
                    Message.success('加入协同作战成功！');
                    toSynergyDetail(files, false);
                    pageRefresh(files.coordinated_operations_id);
                } else {
                    Message.destroy();
                    Message.error('加入协同作战失败，请稍后重试！');
                    return false;
                }
            },
        });
    };
    exit = files => {
        const { dispatch, toSynergyDetail, pageRefresh } = this.props;
        const user = JSON.parse(sessionStorage.getItem('user'));
        dispatch({
            type: 'otherIndex/endCombined',
            payload: {
                coordinated_operations_id: files.coordinated_operations_id,
                organization_code: user.group.code,
                is_launch: 0,
            },
            success: e => {
                if (e.result.reason.code == '200') {
                    console.log(e, 'xiangqi=====');
                    sessionStorage.removeItem('synergyId');
                    Message.destroy();
                    Message.success('退出协同作战成功！');
                    toSynergyDetail(files, false);
                    pageRefresh(files.coordinated_operations_id);
                } else {
                    Message.destroy();
                    Message.error('退出协同作战失败，请稍后重试！');
                    return false;
                }
            },
        });
    };
    render() {
        const {
            otherIndex,
            getData,
            switchSynergy,
            otherIndex: {
                operateWithList: { list },
            },
        } = this.props;
        const {
            showHeat,
            showPersonHeat,
            showLk,
            showJurisdiction,
            showLayer,
            dropDown,
            showVehicle,
            showMonitoring,
            showSynergy,
            showAlert,
            showStation,
            showIntercom,
            showSwan,
            showPlace,
            showIndividual,
        } = this.state;
        const muneList = [
            // {
            // 	title: '热力图',
            // 	icon: './image/rlt_2.png',
            // 	onicon: './image/rlt_1.png',
            // 	type: 'showHeat',
            // 	isDivider: true,
            //     class:styles.head
            // },
            // {
            // 	title: '查看辖区',
            // 	icon: './image/ckxq.png',
            // 	onicon: './image/ckxq_1.png',
            // 	type: 'showJurisdiction',
            // 	isDivider: true,
            //     class:styles.jurisdiction
            // },
            // {
            //     title: '协同作战',
            //     icon: './image/xietong.png',
            //     onicon: './image/xietong_1.png',
            //     type: 'showSynergy',
            //     isDivider: true,
            //     class: styles.layer,
            // },
            {
                title: '数据图层',
                icon: './image/sjtc.png',
                onicon: './image/sjtc_1.png',
                type: 'showLayer',
                isDivider: false,
                class: styles.layer,
            },
        ];
        const videoDownList = [
            {
                title: '高清',
                icon: './image/jk.png',
                type: 'hdCamera',
                class: styles.monitoring,
            },
            // {
            //     title: '标清',
            //     icon: './image/jk.png',
            //     type: 'ordinaryCamera',
            //     class:styles.monitoring
            // },
            {
                title: '高点',
                icon: './image/jk.png',
                type: 'remoteCamera',
                class: styles.monitoring,
            },
        ];
        const placeDownList = [
            {
                title: '物流',
                icon: './image/jk.png',
                type: 'logis',
                class: styles.monitoring,
            },
            {
                title: '快递',
                icon: './image/jk.png',
                type: 'express',
                class: styles.monitoring,
            },
            {
                title: '冷链运输',
                icon: './image/jk.png',
                type: 'codeChain',
                class: styles.monitoring,
            },
            {
                title: '冷库',
                icon: './image/jk.png',
                type: 'coldStorage',
                class: styles.monitoring,
            },
            {
                title: '农贸市场',
                icon: './image/jk.png',
                type: 'farmMarket',
                class: styles.monitoring,
            },
            {
                title: '其他',
                icon: './image/jk.png',
                type: 'showOtherPlace',
                class: styles.monitoring,
            },
        ];
        const dropDownList = [
            {
                title: '警车',
                icon: './image/jingche.png',
                type: 'showVehicle',
                class: styles.car,
            },
            {
                title: '视频监控',
                icon: './image/jk.png',
                type: 'showMonitoring',
                class: styles.monitoring,
            },
            {
                title: '警情',
                icon: './image/jq.png',
                type: 'showAlert',
                class: styles.alert,
            },
            {
                title: '警务站',
                icon: './image/jwz_2.png',
                type: 'showStation',
                class: styles.station,
            },
            {
                title: '对讲机',
                icon: './image/djj.png',
                type: 'showIntercom',
                class: styles.intercom,
            },
            {
                title: '卡口',
                icon: './image/kk.png',
                type: 'showSwan',
                class: styles.swan,
            },
            {
                title: '重点场所',
                icon: './image/zdcs_2.png',
                type: 'showPlace',
                class: styles.place,
            },
            {
                title: '移动单兵设备',
                icon: './image/dbsb.png',
                type: 'showIndividual',
                class: styles.individual,
            },
            {
                title: '枪支',
                icon: './image/qz.png',
                type: 'showFirearms',
                class: styles.individual,
            },
            {
                title: '警情热力图',
                icon: './image/relitu.png',
                type: 'showHeat',
                class: styles.individual,
            },
            {
                title: '人流密度热力图',
                icon: './image/relitu2.png',
                type: 'showPersonHeat',
                class: styles.individual,
            },
            {
                title: '查看辖区',
                icon: './image/guanxia.png',
                type: 'showJurisdiction',
                class: styles.individual,
            },
            {
                title: '查看实时路况',
                icon: './image/lk.png',
                type: 'showLk',
                class: styles.individual,
            },
        ];
        // console.log(this.state)
        return (
            <div>
                {!this.props.vehicleState ? (
                    <div
                        className={
                            this.props.isRightHide
                                ? styles.switchList + ' ' + styles.switchLists
                                : styles.switchList
                        }
                    >
                        <div className={styles.con}>
                            <div className={styles.conten}>
                                {muneList.map(v => (
                                    <div
                                        className={styles.item}
                                        key={v.type}
                                        onClick={() => this.choose(v.type)}
                                    >
                                        <div className={styles.list}>
                                            <img
                                                src={this.state[v.type] ? v.onicon : v.icon}
                                                alt=""
                                                className={`${styles.icons} ${v.class}`}
                                            />
                                            <span
                                                className={`${styles.text} ${
                                                    this.state[v.type] ? styles.onative : null
                                                }`}
                                            >
                                                {v.title}
                                            </span>
                                        </div>
                                        {v.isDivider ? (
                                            <div className={styles.line}>
                                                <Divider
                                                    type="vertical"
                                                    className={styles.lineDivider}
                                                />
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                            {dropDown ? (
                                <div className={styles.dropDownMenu}>
                                    {dropDownList.map(v => (
                                        <div
                                            className={`${styles.item} ${
                                                this.state[v.type] ? styles.ative : null
                                            }`}
                                            key={v.type}
                                            onClick={() => this.choose(v.type)}
                                        >
                                            <img
                                                src={v.icon}
                                                alt=""
                                                className={`${styles.icons} ${v.class}`}
                                            />

                                            <span className={styles.text}>{v.title}</span>
                                            {this.state[v.type] ? (
                                                <img
                                                    src={'./image/xz.png'}
                                                    alt=""
                                                    className={styles.selected}
                                                />
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                            {switchSynergy ? (
                                <div className={styles.corrdingatedMenu}>
                                    <div className={styles.list}>
                                        {list &&
                                            list.map(v => (
                                                <div
                                                    key={v.coordinated_operations_id}
                                                    className={`${styles.item} ${
                                                        this.state.corrdingatedTtype ==
                                                        v.coordinated_operations_id
                                                            ? styles.ative
                                                            : null
                                                    }`}
                                                    onClick={() => {
                                                        this.setState(
                                                            {
                                                                corrdingatedTtype:
                                                                    v.coordinated_operations_id,
                                                            },
                                                            () => {
                                                                if (v.coordinated_operations_id) {
                                                                    this.props.toSynergyDetail(
                                                                        v,
                                                                        true,
                                                                    );
                                                                }
                                                            },
                                                        );
                                                    }}
                                                >
                                                    <div className={styles.con}>
                                                        <p className={styles.title}>
                                                            {v.coordinated_operations_name}
                                                        </p>
                                                        <p className={styles.subtitle}>
                                                            {v.title || '其它'}
                                                        </p>
                                                        <p className={styles.time}>
                                                            {v.coordinated_operations_time}
                                                        </p>
                                                    </div>
                                                    <div className={styles.icons}>
                                                        {sessionStorage.getItem('synergyId') &&
                                                        sessionStorage.getItem('synergyId') ==
                                                            v.coordinated_operations_id ? (
                                                            <img
                                                                src="./image/tuichu.png"
                                                                alt=""
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    this.exit(v);
                                                                }}
                                                            />
                                                        ) : null}
                                                        {sessionStorage.getItem(
                                                            'synergyId',
                                                        ) ? null : (
                                                            <img
                                                                src="./image/jiaru.png"
                                                                alt=""
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    this.join(v);
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ) : null}
                            {videoDownList && showMonitoring && dropDown ? (
                                <div className={styles.dropDownMenuVideo}>
                                    {videoDownList.map(v => (
                                        <div
                                            className={`${styles.item} ${
                                                this.state[v.type] ? styles.ative : null
                                            }`}
                                            key={v.type}
                                            onClick={() => this.choose(v.type)}
                                        >
                                            <span className={styles.text}>{v.title}</span>
                                            {this.state[v.type] ? (
                                                <img
                                                    src={'./image/xz.png'}
                                                    alt=""
                                                    className={styles.selected}
                                                />
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                            {placeDownList && showPlace && dropDown ? (
                                <div className={styles.dropDownMenuPlace}>
                                    {placeDownList.map(v => (
                                        <div
                                            className={`${styles.item} ${
                                                this.state[v.type] ? styles.ative : null
                                            }`}
                                            key={v.type}
                                            onClick={() => this.choose(v.type)}
                                        >
                                            <span className={styles.text}>{v.title}</span>
                                            {this.state[v.type] ? (
                                                <img
                                                    src={'./image/xz.png'}
                                                    alt=""
                                                    className={styles.selected}
                                                />
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </div>
                ) : null}
            </div>
        );
    }
}

export default switchList;
