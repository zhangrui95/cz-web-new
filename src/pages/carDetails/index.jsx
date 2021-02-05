import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Icon,
    Input,
    InputNumber,
    Row,
    Select,
    Table,
    Tag,
    Pagination,
    Message,
    Divider,
    Modal,
    Upload,
    TreeSelect,
    Badge,
} from 'antd';
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './index.less';
import { authorityIsTrue } from '@/utils/authority';
import CarMsg from '@/pages/keyCar/components/CarMsg';
import CarDq from '@/pages/keyCar/components/CarDq';
import CarTx from '@/pages/keyCar/components/CarTx';
import CarZfyc from '@/pages/keyCar/components/CarZfyc';
import CarCcrc from '@/pages/keyCar/components/CarCcrc';
import CarTpc from '@/pages/keyCar/components/CarTpc';
import CarPfgc from '@/pages/keyCar/components/CarPfgc';
import CarLxwg from '@/pages/keyCar/components/CarLxwg';
import CarGj from '@/pages/keyCar/components/CarGj';
import moment from 'moment';
import CarLjd from '@/pages/keyCar/components/CarLjd';
@connect(({ carDetails, loading, keyPersonnel, warningRules }) => ({
    carDetails,
    keyPersonnel,
    warningRules,
    loading: loading.effects['carDetails/fetchNoticeList'],
}))
class carDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expandForm: '1',
            detail: {},
            importLoading: false,
            gjList: [],
            wgList: [],
            pfgcList: [],
            dqList: [],
            tpList: [],
            txList: [],
            zfycList: [],
            ljdList: [],
            ccrcList: [],
        };
    }
    componentDidMount() {
        this.setState({
            importLoading: true,
        });
        this.props.dispatch({
            type: 'keyCar/getCarById',
            payload: {
                carId:
                    this.props.location.query && this.props.location.query.carId
                        ? this.props.location.query.carId
                        : '',
            },
            callback: res => {
                console.log('detail', res);
                if (!res.reason) {
                    this.setState({
                        detail: res.result && res.result.device ? res.result.device : {},
                        importLoading: false,
                    });
                }
            },
        });
    }
    toggleForm = k => {
        const { expandForm } = this.state;
        this.setState({
            expandForm: k,
        });
        if (k == '2') {
            this.getDq();
        }
        if (k == '3') {
            this.getGj();
        }
        if (k == '4') {
            this.getLjd();
        }
        if (k == '5') {
            this.getTx();
        }
        if (k == '6') {
            this.getZfyc();
        }
        if (k == '7') {
            this.getCcrc();
        }
        if (k == '8') {
            this.getTp();
        }
        if (k == '9') {
            this.getPfgc();
        }
        if (k == '10') {
            this.getWg();
        }
    };
    //盗抢
    getDq = () => {
        const { dispatch, form } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            this.setState({
                importLoading: true,
            });
            this.props.dispatch({
                type: 'keyCar/getRobberyList',
                payload: {
                    carNumber:
                        this.props.location.query && this.props.location.query.carNumber
                            ? this.props.location.query.carNumber
                            : '',
                    robberyTimeStart: '',
                    robberyTimeEnd: '',
                },
                callback: res => {
                    if (!res.reason) {
                        console.log('res.result.list', res.result.list);
                        this.setState({
                            dqList: res.result && res.result.list ? res.result.list : [],
                            importLoading: false,
                        });
                    }
                },
            });
        });
    };
    //套牌车
    getTp = () => {
        const { dispatch, form } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            this.setState({
                importLoading: true,
            });
            this.props.dispatch({
                type: 'keyCar/getDeckList',
                payload: {
                    carNumber:
                        this.props.location.query && this.props.location.query.carNumber
                            ? this.props.location.query.carNumber
                            : '',
                    deckTimeStart: '',
                    deckTimeEnd: '',
                },
                callback: res => {
                    if (!res.reason) {
                        this.setState({
                            tpList: res.result && res.result.list ? res.result.list : [],
                            importLoading: false,
                        });
                    }
                },
            });
        });
    };
    //同行车辆
    getTx = () => {
        const { dispatch, form } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            this.setState({
                importLoading: true,
            });
            this.props.dispatch({
                type: 'keyCar/getCompanionList',
                payload: {
                    carNumber:
                        this.props.location.query && this.props.location.query.carNumber
                            ? this.props.location.query.carNumber
                            : '',
                    timeStart: '',
                    timeEnd: '',
                    inMinuteLimit: '',
                    outMinuteLimit: '',
                },
                callback: res => {
                    if (!res.reason) {
                        this.setState({
                            txList: res.result && res.result.list ? res.result.list : [],
                            importLoading: false,
                        });
                    }
                },
            });
        });
    };
    getGj = () => {
        const { dispatch, form } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            this.setState({
                importLoading: true,
            });
            console.log(fieldsValue.trackTime);
            this.props.dispatch({
                type: 'keyCar/getTrackList',
                payload: {
                    carNumber:
                        this.props.location.query && this.props.location.query.carNumber
                            ? this.props.location.query.carNumber
                            : '',
                    trackTimeStart: '',
                    trackTimeEnd: '',
                },
                callback: res => {
                    if (!res.reason) {
                        this.setState({
                            gjList: res.result && res.result.list ? res.result.list : [],
                            importLoading: false,
                        });
                    }
                },
            });
        });
    };
    //昼伏夜出
    getZfyc = () => {
        const { dispatch, form } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            this.setState({
                importLoading: true,
            });
            this.props.dispatch({
                type: 'keyCar/getOwlList',
                payload: {
                    carNumber:
                        this.props.location.query && this.props.location.query.carNumber
                            ? this.props.location.query.carNumber
                            : '',
                    cs: '',
                    kkbh: '',
                    passTimeStart: '',
                    passTimeEnd: '',
                },
                callback: res => {
                    if (!res.reason) {
                        this.setState({
                            zfycList: res.result && res.result.list ? res.result.list : [],
                            importLoading: false,
                        });
                    }
                },
            });
        });
    };
    //落脚点
    getLjd = () => {
        const { dispatch, form } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            this.setState({
                importLoading: true,
            });
            this.props.dispatch({
                type: 'keyCar/getFootholdList',
                payload: {
                    carNumber:
                        this.props.location.query && this.props.location.query.carNumber
                            ? this.props.location.query.carNumber
                            : '',
                    passTimeStart: '',
                    passTimeEnd: '',
                },
                callback: res => {
                    if (!res.reason) {
                        this.setState({
                            ljdList: res.result && res.result.list ? res.result.list : [],
                            importLoading: false,
                        });
                    }
                },
            });
        });
    };
    //初次入城
    getCcrc = () => {
        const { dispatch, form } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            this.setState({
                importLoading: true,
            });
            this.props.dispatch({
                type: 'keyCar/getFirstInListSearch',
                payload: {
                    currentPage: 1,
                    pd: {
                        carNumber:
                            this.props.location.query && this.props.location.query.carNumber
                                ? this.props.location.query.carNumber
                                : '',
                        passTimeStart: '',
                        passTimeEnd: '',
                    },
                    showCount: 10,
                },
                callback: res => {
                    if (!res.reason) {
                        this.setState({
                            ccrcList: res.result && res.result.list ? res.result.list : [],
                            importLoading: false,
                        });
                    }
                },
            });
        });
    };
    getPfgc = () => {
        const { dispatch, form } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            this.setState({
                importLoading: true,
            });
            console.log(fieldsValue.passTime);
            this.props.dispatch({
                type: 'keyCar/getPassList',
                payload: {
                    carNumber:
                        this.props.location.query && this.props.location.query.carNumber
                            ? this.props.location.query.carNumber
                            : '',
                },
                callback: res => {
                    if (!res.reason) {
                        console.log('res.result.list', res.result.list);
                        this.setState({
                            pfgcList: res.result && res.result.list ? res.result.list : [],
                            importLoading: false,
                        });
                    }
                },
            });
        });
    };
    renderForm = () => {
        const { detail } = this.state;
        return (
            <Card className={styles.tableListCard}>
                {/*<div>*/}
                {/*    <Tag color="#ff6666" style={{fontSize:16,padding: '2px 8px'}}>临控车辆</Tag>*/}
                {/*</div>*/}
                <div className={styles.information}>
                    <div className={styles.content}>
                        <div className={styles.base}>
                            <div className={styles.name}>车牌号码：{detail.carNumber}</div>
                            <div className={styles.name}>车辆类型：{detail.carTypeName}</div>
                            <div className={styles.name}>车身颜色：{detail.carColor}</div>
                        </div>
                    </div>
                </div>
            </Card>
        );
    };
    getWg = () => {
        const { dispatch, form } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            this.setState({
                importLoading: true,
            });
            console.log(fieldsValue.trackTime);
            this.props.dispatch({
                type: 'keyCar/getViolationList',
                payload: {
                    carNumber:
                        this.props.location.query && this.props.location.query.carNumber
                            ? this.props.location.query.carNumber
                            : '',
                },
                callback: res => {
                    if (!res.reason) {
                        console.log('res.result.list', res.result.list);
                        this.setState({
                            wgList: res.result && res.result.list ? res.result.list : [],
                            importLoading: false,
                        });
                    }
                },
            });
        });
    };
    render() {
        const {
            carDetails: {
                data: { list, page },
                readStatus,
            },
            form,
            match: {
                params: { types, pages },
            },
        } = this.props;
        const { expandForm } = this.state;
        const titles = [
            { title: '基本信息', key: '1' },
            { title: '盗抢信息', key: '2' },
            { title: '轨迹分析', key: '3' },
            { title: '落脚点分析', key: '4' },
            { title: '同行车辆分析', key: '5' },
            { title: '昼伏夜出行车分析', key: '6' },
            { title: '初次入城分析', key: '7' },
            { title: '套牌车分析', key: '8' },
            { title: '频繁过车分析', key: '9' },
            { title: '连续违法分析', key: '10' },
        ];
        const readData = {
            modalVisible: this.state.showToRead,
            handleModalVisible: this.handleToReadVisible,
            handleSubmit: this.handleToReadVisible,
        };
        const warningData = {
            modalVisible: this.state.showToWarning,
            handleModalVisible: this.handleshowToWarningVisible,
            handleSubmit: this.handleshowToWarningVisible,
        };
        console.log('warningRules', this.props);
        return (
            <div>
                <div>
                    <Button
                        type="primary"
                        style={{ marginBottom: '15px' }}
                        onClick={() =>
                            this.props.history.replace({
                                pathname: '/car',
                            })
                        }
                    >
                        返回
                    </Button>
                </div>
                <div className={styles.tableListForm}>{this.renderForm()}</div>
                <div className={styles.headerInfo}>
                    {titles.map((v, k) => (
                        <Button
                            // type="primary"
                            key={v.key}
                            size="large"
                            className={styles.button}
                            style={{
                                background:
                                    v.key == expandForm
                                        ? 'rgba(52,61,112,1)'
                                        : 'rgba(52,61,112,0.5)',
                            }}
                            onClick={() => this.toggleForm(v.key)}
                            loading={this.props.loading}
                        >
                            {readStatus && readStatus.hczt == 0 && v.key == '7' ? (
                                <Badge color="#FF4646FF" />
                            ) : null}
                            {readStatus && readStatus.xfzt == 0 && v.key == '8' ? (
                                <Badge color="#FF4646FF" />
                            ) : null}
                            {readStatus && readStatus.ypzt == 0 && v.key == '9' ? (
                                <Badge color="#FF4646FF" />
                            ) : null}
                            {/* {v.key > '6' ? <Badge color="#FF4646FF" /> : null} */}
                            {v.title}
                        </Button>
                    ))}
                </div>
                <div className={styles.tableListForm}>
                    {expandForm == '1' ? <CarMsg {...this.state} /> : null}
                    {expandForm == '2' ? (
                        <CarDq
                            dqList={this.state.dqList}
                            importLoading={this.state.importLoading}
                        />
                    ) : null}
                    {expandForm == '3' ? (
                        <CarGj
                            arryData={this.state.gjList}
                            importLoading={this.state.importLoading}
                        />
                    ) : null}
                    {expandForm == '4' ? <CarLjd {...this.state} /> : null}
                    {expandForm == '5' ? (
                        <CarTx
                            txList={this.state.txList}
                            importLoading={this.state.importLoading}
                        />
                    ) : null}
                    {expandForm == '6' ? <CarZfyc {...this.state} /> : null}
                    {expandForm == '7' ? <CarCcrc {...this.state} /> : null}
                    {expandForm == '8' ? (
                        <CarTpc
                            tpList={this.state.tpList}
                            importLoading={this.state.importLoading}
                        />
                    ) : null}
                    {expandForm == '9' ? (
                        <CarPfgc
                            pfgcList={this.state.pfgcList}
                            importLoading={this.state.importLoading}
                        />
                    ) : null}
                    {expandForm == '10' ? (
                        <CarLxwg
                            wgList={this.state.wgList}
                            importLoading={this.state.importLoading}
                        />
                    ) : null}
                </div>
            </div>
        );
    }
}

export default Form.create()(carDetails);
