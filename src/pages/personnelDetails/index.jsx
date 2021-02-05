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
import PersonMsg from '@/pages/personnelDetails/components/PersonMsg';
import moment from 'moment';
import Social from '@/pages/personnelDetails/components/social';
import PersonTzList from '@/pages/personnelDetails/components/PersonTzList';
import PersonGx from '@/pages/personnelDetails/components/PersonGx';
import PersonGj from '@/pages/personnelDetails/components/PersonGj';
@connect(({ personnelDetails, loading, keyPersonnel, warningRules }) => ({
    personnelDetails,
    keyPersonnel,
    warningRules,
    loading: loading.effects['personnelDetails/fetchNoticeList'],
}))
class personnelDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expandForm: '1',
            detail: {},
            importLoading: false,
            gxList: {},
            gtgxList: {},
            tzList: [],
        };
    }
    componentDidMount() {
        this.setState({
            importLoading: true,
        });
        this.getDetail();
        this.getSocial();
        this.getGtgx();
    }
    getDetail = () => {
        this.props.dispatch({
            type: 'personnelDetails/getPersonByIdCard',
            payload: {
                idcard:
                    this.props.location.query && this.props.location.query.idcard
                        ? this.props.location.query.idcard
                        : '',
            },
            callback: res => {
                console.log('detail', res);
                if (!res.reason) {
                    this.setState({
                        detail: res.result && res.result.person ? res.result.person : {},
                        importLoading: false,
                    });
                }
            },
        });
    };
    getTrajectory = () => {
        this.props.dispatch({
            type: 'personnelDetails/getPersonArchivesList',
            payload: {
                data: {
                    archives_type_codes: [
                        window.configUrl.zsxx, //住宿信息
                        window.configUrl.tlxx, //铁路信息
                    ],
                    person_id:
                        this.props.location.query && this.props.location.query.id
                            ? this.props.location.query.id
                            : '',
                },
                type: '1',
            },
        });
    };
    getTz = () => {
        this.props.dispatch({
            type: 'personnelDetails/getPersonHotelList',
            payload: {
                idcard:
                    this.props.location.query && this.props.location.query.idcard
                        ? this.props.location.query.idcard
                        : '',
                inTime: '',
                outTime: '',
            },
            callback: res => {
                console.log('detail', res);
                if (!res.reason) {
                    this.setState({
                        tzList: res.result && res.result.list ? res.result.list : [],
                        importLoading: false,
                    });
                }
            },
        });
    };
    toggleForm = k => {
        const { expandForm } = this.state;
        this.setState({
            expandForm: k,
        });
        if (k == '1') {
            this.getDetail();
        }
        if (k == '4') {
            this.getTrajectory();
        }
        if (k == '5') {
            this.getTz();
        }
    };
    getSocial = () => {
        this.props.dispatch({
            type: 'personnelDetails/getPersonArchivesList',
            payload: {
                data: {
                    archives_type_codes: [window.configUrl.shgx],
                    person_id:
                        this.props.location.query && this.props.location.query.id
                            ? this.props.location.query.id
                            : '',
                },
                type: '2',
            },
            callback: res => {
                if (!res.reason) {
                    this.setState({
                        gxList: res,
                    });
                }
            },
        });
    };
    getGtgx = () => {
        this.props.dispatch({
            type: 'personnelDetails/getPersonRelation',
            payload: {
                idcardPri:
                    this.props.location.query && this.props.location.query.idcard
                        ? this.props.location.query.idcard
                        : '',
                idcardSec: '',
            },
            callback: res => {
                console.log('getSocial', res);
                if (!res.reason) {
                    console.log('res.result============》', res.result);
                    this.setState({
                        gtgxList: res.result.pdResult,
                    });
                }
            },
        });
    };
    renderForm = () => {
        const { detail } = this.state;
        return (
            <Card className={styles.tableListCard}>
                <div className={styles.information}>
                    <div className={styles.imgs}>
                        <img
                            src={detail.xp ? detail.xp : './image/nophoto.png'}
                            width={140}
                            alt=""
                        />
                    </div>
                    <div className={styles.content}>
                        <div>
                            {this.state.detail &&
                                this.state.detail.tags &&
                                this.state.detail.tags.map(item => {
                                    return (
                                        <Tag
                                            color={item.tag_color}
                                            style={{ fontSize: 16, padding: '2px 8px' }}
                                        >
                                            {item.tag_name}
                                        </Tag>
                                    );
                                })}
                        </div>
                        <div className={styles.base}>
                            <div className={styles.name}>姓名：{detail.name}</div>
                            <div className={styles.name}>身份证号：{detail.idcard}</div>
                            <div className={styles.name}>出生日期：{detail.birth}</div>
                            <div className={styles.name}>民族：{detail.mz}</div>
                            <div className={styles.name}>性别：{detail.xb}</div>
                            <div className={styles.name}>户籍地址：{detail.dz}</div>
                        </div>
                    </div>
                </div>
            </Card>
        );
    };
    render() {
        const {
            personnelDetails: {
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
            { title: '人员基本信息', key: '1' },
            { title: '人员关系图', key: '2' },
            { title: '共同关系人', key: '3' },
            { title: '人员活动轨迹', key: '4' },
            { title: '人员同住分析', key: '5' },
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
        return (
            <div>
                <div>
                    <Button
                        type="primary"
                        style={{ marginBottom: '15px' }}
                        onClick={() =>
                            this.props.history.replace({
                                pathname: '/person',
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
                    {expandForm == '1' ? (
                        <PersonMsg {...this.state} hideXp={true} {...this.props} />
                    ) : null}
                    {expandForm == '2' ? <Social {...this.props} {...this.state} /> : null}
                    {expandForm == '3' ? <PersonGx {...this.state} /> : null}
                    {expandForm == '4' ? <PersonGj {...this.props} /> : null}
                    {expandForm == '5' ? <PersonTzList {...this.state} /> : null}
                </div>
            </div>
        );
    }
}

export default Form.create()(personnelDetails);
