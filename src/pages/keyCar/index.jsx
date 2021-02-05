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
    Tooltip,
    Badge,
} from 'antd';
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './index.less';
import { tableList } from '@/utils/utils';
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const { TreeNode } = TreeSelect;
import { cardNoRule } from '@/utils/validator';
import FormModal from './components/FormModal';
import { authorityIsTrue } from '@/utils/authority';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import CarMsg from '@/pages/keyCar/components/CarMsg';
import CarDq from '@/pages/keyCar/components/CarDq';
import CarTx from '@/pages/keyCar/components/CarTx';
import CarZfyc from '@/pages/keyCar/components/CarZfyc';
import CarCcrc from '@/pages/keyCar/components/CarCcrc';
import CarTpc from '@/pages/keyCar/components/CarTpc';
import CarPfgc from '@/pages/keyCar/components/CarPfgc';
import CarLxwg from '@/pages/keyCar/components/CarLxwg';
import CarGj from '@/pages/keyCar/components/CarGj';
import CarLjd from '@/pages/keyCar/components/CarLjd';
const { Option } = Select;
const list = [];
@connect(({ keyCar, loading, personnelDetails }) => ({
    keyCar,
    personnelDetails,
    loading: loading.effects['keyCar/fetchNoticeList'],
}))
class keyCar extends Component {
    state = {
        formValues: {},
        tagState: 0,
        createModalVisible: false,
        updateValues: {},
        isCar: false,
        importLoading: false,
        expandForm: '1',
        data: {},
        currentPage: 1,
        detail: null,
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

    componentDidMount() {
        this.getTableData();
        // this.dictionaryQuery()
        // this.getUseDept()
        // this.queryLabelModelList()
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
                type: 'keyCar/getUseDept',
                payload: {
                    // department: JSON.parse(sessionStorage.getItem('user')).department,
                    groupList: codes,
                },
            });
        }
    };
    dictionaryQuery = () => {
        this.props.dispatch({
            type: 'keyCar/policeQuery',
            payload: { code: window.configUrl.dictionariesRisk },
        });
    };
    queryLabelModelList = () => {
        const { dispatch } = this.props;

        const param = {
            currentPage: 1,
            showCount: 999,
            pd: {},
        };
        console.log(param);
        dispatch({
            type: 'keyCar/queryLabelModelList',
            payload: param,
        });
    };
    getTableData = (changePage, pd) => {
        this.setState({
            importLoading: true,
        });
        const param = {
            currentPage: changePage ? changePage : 1,
            pd: pd ? pd : {},
            showCount: 10,
        };
        this.props.dispatch({
            type: 'keyCar/getCarListSearch',
            payload: param,
            callback: res => {
                if (!res.reason) {
                    this.setState({
                        data: res.result,
                        importLoading: false,
                    });
                }
            },
        });
    };
    // 渲染机构树
    renderloop = data =>
        data.map(item => {
            if (item.childrenList && item.childrenList.length) {
                return (
                    <TreeNode value={item.code} key={item.code} title={item.name}>
                        {this.renderloop(item.childrenList)}
                    </TreeNode>
                );
            }
            return <TreeNode key={item.code} value={item.code} title={item.name} />;
        });
    loopUse = params => {
        for (var i = 0; i < params.length; i++) {
            //   console.log(params[i],code)
            //   if(code == params[i].code){
            list.push({
                name: params[i].name,
                code: params[i].code,
            });
            //   console.log(params[i].name)
            //    return params[i].name
            //   }else{
            if (params[i].childrenList) {
                this.loopUse(params[i].childrenList);
            }
        }
        //   }}
    };
    toggleForm = k => {
        const { expandForm } = this.state;
        this.setState(
            {
                expandForm: k,
            },
            () => {
                // 重置搜索条件以及查询
                this.handleFormReset();
                if (k != 1) {
                    this.props.form.setFieldsValue({
                        carNumber: '黑A383RZ',
                    });
                }
                if(k == 2){
                    this.searchDetail();
                }
                if(k == 3){
                    this.getDq();
                }
                if(k == 4){
                    this.getGj();
                }
                if(k == 5){
                    this.getLjd();
                }
                if(k == 6){
                    this.getTx();
                }
                if(k == 7){
                    this.getZfyc();
                }
                if(k == 8){
                    this.getCcrc();
                }
                if(k == 9){
                    this.getTp();
                }
                if(k == 10){
                    this.getPfgc();
                }
                if(k == 11){
                    this.getWg();
                }
            },
        );
    };

    // 查询条件重置
    handleFormReset = () => {
        const { form } = this.props;
        form.resetFields();
        this.setState({
            formValues: {},
            detail: null,
            gjList: [],
            wgList: [],
            pfgcList: [],
            dqList: [],
            tpList: [],
            txList: [],
            zfycList: [],
            ljdList: [],
            ccrcList: [],
        });
        if (this.state.expandForm == '1') {
            this.getTableData(1, {});
        }
    };

    onChange = currentPage => {
        const { formValues } = this.state;
        this.setState({
            currentPage: currentPage,
        });
        // 查询改变页数后的数据
        this.getTableData(currentPage, formValues);
    };

    onShowSizeChange = (current, pageSize) => {
        const {
            keyCar: {
                data: { page },
            },
        } = this.props;
        const { formValues } = this.state;
        page.currentPage = current;
        page.showCount = pageSize;
        this.getTableData(page, formValues);
    };

    handleSubmit = e => {
        e.preventDefault();
        const { form } = this.props;

        form.validateFields((err, fieldsValue) => {
            if (err) return;
            console.log('fieldsValue', fieldsValue);
            this.getTableData(1, fieldsValue);
        });
    };

    renderPersonForm() {
        const {
            form,
            keyCar: { riskList, useList },
        } = this.props;
        const { getFieldDecorator } = form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };

        return (
            <Form layout="inline" {...formItemLayout} onSubmit={this.handleSubmit}>
                <Row>
                    <Col span={8}>
                        <FormItem label="车牌号码">
                            {getFieldDecorator('carNumber')(
                                <Input placeholder="请输入车牌号码" style={{ width: '330px' }} />,
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem label="号牌种类">
                            {getFieldDecorator('carTypeCode')(
                                <Select
                                    allowClear={true}
                                    placeholder="请选择号牌种类"
                                    style={{
                                        width: '330px',
                                    }}
                                >
                                    <Option value={'01'} key={'01'}>
                                        微型车
                                    </Option>
                                    <Option value={'02'} key={'02'}>
                                        小型车
                                    </Option>
                                    <Option value={'03'} key={'03'}>
                                        紧凑型车
                                    </Option>
                                    <Option value={'04'} key={'04'}>
                                        中型车
                                    </Option>
                                    <Option value={'05'} key={'05'}>
                                        中大型车
                                    </Option>
                                    <Option value={'06'} key={'06'}>
                                        豪华车
                                    </Option>
                                </Select>,
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}> {this.renderSearchButton()} </Col>
                </Row>
            </Form>
        );
    }

    // 渲染查询条件的按钮渲染
    renderSearchButton = () => (
        <Col offset={16} md={8} sm={24}>
            <div className={styles.submitButtons}>
                <Button
                    type="primary"
                    htmlType="submit"
                    className={styles.submitButton}
                    style={{ background: '#3470F4', borderColor: '#3470F4' }}
                >
                    搜索
                </Button>
                <Button
                    className={styles.submitButton}
                    onClick={this.handleFormReset}
                    style={{ background: '#269CF4', borderColor: '#269CF4', color: '#fff' }}
                >
                    重置
                </Button>
                {/*<Button*/}
                {/*         className={styles.submitButton}*/}
                {/*         onClick={this.handleFormReset}*/}
                {/*         style={{ background: '#6f77d9', borderColor: '#6f77d9', color: '#fff' }}*/}
                {/*     >*/}
                {/*	导出*/}
                {/*</Button>*/}
            </div>
        </Col>
    );

    renderForm() {
        return this.renderPersonForm();
    }

    handleCreateModalVisible = flag => {
        this.setState({
            createModalVisible: !!flag,
        });
    };
    //导入
    handleImports = option => {
        console.log(option, 'daoru', typeof sessionStorage.getItem('groupListCode'));
        const {
            form,
            keyCar: {
                data: { page },
            },
        } = this.props;
        this.setState({ importLoading: true });
        var _self = this;
        let formData = new FormData();
        formData.append('file', option.file);
        formData.append('government', sessionStorage.getItem('groupListCode'));

        const token = sessionStorage.getItem('userToken') || '';
        fetch(`${configUrl.serverUrl}${'/person/importPerson'}`, {
            method: 'post',
            body: formData,
            headers: {
                Authorization: token,
            },
        })
            .then(function(res) {
                return res.json();
            })
            .then(function(json) {
                console.log(json);
                if (json.result.reason.code == '200') {
                    Message.success(
                        `导入成功${json.result.success}条，导入失败${json.result.fail}条`,
                    );
                    if (json.result.fail != 0) {
                        window.location.href = configUrl.serverUrl + json.result.path;
                    }

                    form.validateFields((err, fieldsValue) => {
                        if (err) return;

                        _self.setState({
                            formValues: fieldsValue,
                            importLoading: false,
                        });
                        page.currentPage = 1;
                        page.showCount = tableList;
                        _self.getTableData(page, fieldsValue);
                    });
                } else {
                    Message.error('导入失败');
                    _self.setState({ importLoading: false });
                    return false;
                }
            });
    };
    //下载模板
    downloadTemplate = e => {
        const { form, dispatch } = this.props;
        dispatch({
            type: 'keyCar/downloadPersonModal',
            payload: {},
            success: e => {
                console.log(e);
                if (e.result.reason.code == '200') {
                    window.location.href = `${window.configUrl.serverUrl}${e.result.path}`;
                }
            },
        });
    };
    handleCreate = flag => {
        console.log('新建');
        const { dispatch, form } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;

            this.setState({
                formValues: fieldsValue,
                createModalVisible: !!flag,
            });

            const {
                keyCar: {
                    data: { page },
                },
            } = this.props;
            page.currentPage = 1;
            page.showCount = tableList;

            this.getTableData(page, fieldsValue);
        });
    };
    searchDetail = () => {
        const { dispatch, form } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            this.setState({
                importLoading: true,
            });
            this.props.dispatch({
                type: 'keyCar/getCarById',
                payload: {
                    carNumber: fieldsValue.carNumber,
                },
                callback: res => {
                    console.log('detail', res);
                    if (!res.reason) {
                        this.setState({
                            detail: res.result && res.result.device ? res.result.device : null,
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
                    carNumber: fieldsValue.carNumber,
                    trackTimeStart:
                        fieldsValue.trackTime && fieldsValue.trackTime[0]
                            ? moment(fieldsValue.trackTime[0]).format('YYYY-MM-DD')
                            : '',
                    trackTimeEnd:
                        fieldsValue.trackTime && fieldsValue.trackTime[1]
                            ? moment(fieldsValue.trackTime[1]).format('YYYY-MM-DD')
                            : '',
                },
                callback: res => {
                    if (!res.reason) {
                        console.log('res.result.list', res.result.list);
                        this.setState({
                            gjList: res.result && res.result.list ? res.result.list : [],
                            importLoading: false,
                        });
                    }
                },
            });
        });
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
                    carNumber: fieldsValue.carNumber,
                    robberyTimeStart:
                        fieldsValue.robberyTime && fieldsValue.robberyTime[0]
                            ? moment(fieldsValue.robberyTime[0]).format('YYYY-MM-DD')
                            : '',
                    robberyTimeEnd:
                        fieldsValue.robberyTime && fieldsValue.robberyTime[1]
                            ? moment(fieldsValue.robberyTime[1]).format('YYYY-MM-DD')
                            : '',
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
                    carNumber: fieldsValue.carNumber || '',
                    deckTimeStart:
                        fieldsValue.deckTime && fieldsValue.deckTime[0]
                            ? moment(fieldsValue.deckTime[0]).format('YYYY-MM-DD')
                            : '',
                    deckTimeEnd:
                        fieldsValue.deckTime && fieldsValue.deckTime[1]
                            ? moment(fieldsValue.deckTime[1]).format('YYYY-MM-DD')
                            : '',
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
                    carNumber: fieldsValue.carNumber || '',
                    timeStart:
                        fieldsValue.time && fieldsValue.time[0]
                            ? moment(fieldsValue.time[0]).format('YYYY-MM-DD HH:mm:ss')
                            : '',
                    timeEnd:
                        fieldsValue.time && fieldsValue.time[1]
                            ? moment(fieldsValue.time[1]).format('YYYY-MM-DD HH:mm:ss')
                            : '',
                    inMinuteLimit: fieldsValue.inMinuteLimit || '',
                    outMinuteLimit: fieldsValue.outMinuteLimit || '',
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
                    carNumber: fieldsValue.carNumber || '',
                    cs: fieldsValue.cs || '',
                    kkbh: fieldsValue.kkbh || '',
                    passTimeStart:
                        fieldsValue.passTime && fieldsValue.passTime[0]
                            ? moment(fieldsValue.passTime[0]).format('YYYY-MM-DD HH:mm:ss')
                            : '',
                    passTimeEnd:
                        fieldsValue.passTime && fieldsValue.passTime[1]
                            ? moment(fieldsValue.passTime[1]).format('YYYY-MM-DD HH:mm:ss')
                            : '',
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
                    carNumber: fieldsValue.carNumber || '',
                    passTimeStart:
                        fieldsValue.passTime && fieldsValue.passTime[0]
                            ? moment(fieldsValue.passTime[0]).format('YYYY-MM-DD HH:mm:ss')
                            : '',
                    passTimeEnd:
                        fieldsValue.passTime && fieldsValue.passTime[1]
                            ? moment(fieldsValue.passTime[1]).format('YYYY-MM-DD HH:mm:ss')
                            : '',
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
                        carNumber: fieldsValue.carNumber || '',
                        passTimeStart:
                            fieldsValue.passTime && fieldsValue.passTime[0]
                                ? moment(fieldsValue.passTime[0]).format('YYYY-MM-DD')
                                : '',
                        passTimeEnd:
                            fieldsValue.passTime && fieldsValue.passTime[1]
                                ? moment(fieldsValue.passTime[1]).format('YYYY-MM-DD')
                                : '',
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
                    carNumber: fieldsValue.carNumber,
                    violationTimeStart:
                        fieldsValue.trackTime && fieldsValue.trackTime[0]
                            ? moment(fieldsValue.trackTime[0]).format('YYYY-MM-DD')
                            : '',
                    violationTimeEnd:
                        fieldsValue.trackTime && fieldsValue.trackTime[1]
                            ? moment(fieldsValue.trackTime[1]).format('YYYY-MM-DD')
                            : '',
                    fwcs: fieldsValue.fwcs,
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
                    carNumber: fieldsValue.carNumber,
                    kkbh: fieldsValue.kkbh,
                    passTimeStart:
                        fieldsValue.passTime && fieldsValue.passTime[0]
                            ? moment(fieldsValue.passTime[0]).format('YYYY-MM-DD')
                            : '',
                    passTimeEnd:
                        fieldsValue.passTime && fieldsValue.passTime[1]
                            ? moment(fieldsValue.passTime[1]).format('YYYY-MM-DD')
                            : '',
                    jgpl: fieldsValue.jgpl,
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
    toDetail = record => {
        this.props.dispatch(
            routerRedux.push({
                pathname: '/car/detail',
                query: { carId: record.carId, carNumber: record.carNumber },
            }),
        );
    };
    carNumberValidator = (rule, value, callback) => {
        var xreg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}(([0-9]{5}[DF]$)|([DF][A-HJ-NP-Z0-9][0-9]{4}$))/;
        var creg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1}$/;
        if (
            !value ||
            (value.length == 7 && creg.test(value)) ||
            (value.length == 8 && xreg.test(value))
        ) {
            callback();
        } else {
            callback('请输入正确的车牌号查询');
        }
    };
    render() {
        const { expandForm, loading, data } = this.state;
        const { form } = this.props;
        const columns = [
            {
                title: '序号',
                dataIndex: 'xh',
                width: 100,
                render: (text, record, index) => {
                    return (
                        <span>
                            {(this.state.currentPage - 1) * this.state.currentPage + (index + 1)}
                        </span>
                    );
                },
            },
            {
                title: '车牌号码',
                dataIndex: 'carNumber',
                ellipsis: true,
            },
            {
                title: '号牌种类',
                dataIndex: 'carTypeName',
                ellipsis: true,
            },
            {
                title: '品牌',
                dataIndex: 'carBrand',
                ellipsis: true,
            },
            {
                title: '车身颜色',
                dataIndex: 'carColor',
                ellipsis: true,
            },
            // {
            // 	title: '标签',
            // 	dataIndex: 'postalLabel',
            //     ellipsis: true,
            // 	// width:200,
            // 	render: (text) => (<Tag color={text=='通过' ? '#00cccb':'#ff6666'}>{text}</Tag>)
            // },
            {
                title: '操作',
                width: 120,
                render: record => (
                    <span>
                        <a onClick={() => this.toDetail(record)}>详情</a>
                    </span>
                ),
            },
        ];
        const addModel = {
            modalVisible: this.state.createModalVisible,
            handleModalVisible: this.handleCreateModalVisible,
            handleSubmit: this.handleCreate,
        };
        const titles = [
            { title: '车辆数据分析', clicked: '1', id: 1 },
            { title: '基本信息', clicked: '2', id: 2 },
            { title: '盗抢信息', clicked: '3', id: 3 },
            { title: '轨迹分析', clicked: '4', id: 4 },
            { title: '落脚点分析', clicked: '5', id: 5 },
            { title: '同行车辆分析', clicked: '6', id: 6 },
            { title: '昼伏夜出行车分析', clicked: '7', id: 7 },
            { title: '初次入城分析', clicked: '8', id: 8 },
            { title: '套牌车分析', clicked: '9', id: 9 },
            { title: '频繁过车分析', clicked: '10', id: 10 },
            { title: '连续违法分析', clicked: '11', id: 11 },
        ];
        const { getFieldDecorator } = form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };
        const formItemLayouts = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 10 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 14 },
            },
        };
        return (
            <div>
                <div className={styles.headerInfo}>
                    {/* {
                    console.log(authorityIsTrue(item.permissions))
                } */}
                    {titles.map(item => (
                        <Button
                            type="primary"
                            key={item.id}
                            size="large"
                            className={styles.button}
                            style={{ backgroundColor: item.clicked == expandForm ? '' : '#333367' }}
                            onClick={() => this.toggleForm(item.clicked)}
                            loading={loading}
                        >
                            {item.title}
                        </Button>
                    ))}
                </div>
                {expandForm == '1' ? (
                    <div>
                        <div className={styles.tableListForm}>{this.renderForm()}</div>
                        <Card bordered={false} className={styles.tableListCard}>
                            <Table
                                columns={columns}
                                loading={this.state.importLoading}
                                dataSource={data && data.list ? data.list : []}
                                // showSizeChanger
                                size="default"
                                pagination={false}
                                // scroll={{ y: 370 }}
                            />
                        </Card>
                        {data && data.page && data.page.totalResult ? (
                            <Row className={styles.pagination}>
                                <Pagination
                                    // showSizeChanger
                                    showQuickJumper
                                    // pageSizeOptions={['16', '24', '32']}
                                    total={data.page.totalResult}
                                    current={data.page.currentPage}
                                    pageSize={data.page.showCount}
                                    onChange={this.onChange}
                                    onShowSizeChange={this.onShowSizeChange}
                                    showTotal={(total, range) => `共${total}项`}
                                />
                            </Row>
                        ) : null}
                    </div>
                ) : null}
                {expandForm == '2' ? (
                    <div>
                        <div className={styles.formTop}>
                            <Form layout="inline" {...formItemLayout}>
                                <Row>
                                    <Col span={8}>
                                        <FormItem label="车牌号码">
                                            {getFieldDecorator('carNumber', {
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '请输入车牌号码搜索',
                                                    },
                                                    {
                                                        validator: this.carNumberValidator,
                                                    },
                                                ],
                                            })(
                                                <Input
                                                    placeholder="请输入车牌号码"
                                                    style={{ width: '330px' }}
                                                />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={16}>
                                        <Col offset={16} md={8} sm={24}>
                                            <div className={styles.submitButtons}>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    className={styles.submitButton}
                                                    onClick={this.searchDetail}
                                                    style={{
                                                        background: '#3470F4',
                                                        borderColor: '#3470F4',
                                                    }}
                                                >
                                                    搜索
                                                </Button>
                                                <Button
                                                    className={styles.submitButton}
                                                    onClick={this.handleFormReset}
                                                    style={{
                                                        background: '#269CF4',
                                                        borderColor: '#269CF4',
                                                        color: '#fff',
                                                    }}
                                                >
                                                    重置
                                                </Button>
                                            </div>
                                        </Col>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                        <CarMsg
                            detail={this.state.detail}
                            importLoading={this.state.importLoading}
                        />
                    </div>
                ) : null}
                {expandForm == '3' ? (
                    <div>
                        <div className={styles.formTop}>
                            <Form layout="inline" {...formItemLayout}>
                                <Row>
                                    <Col span={8}>
                                        <FormItem label="车牌号码">
                                            {getFieldDecorator('carNumber', {
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '请输入车牌号码搜索',
                                                    },
                                                    {
                                                        validator: this.carNumberValidator,
                                                    },
                                                ],
                                            })(
                                                <Input
                                                    placeholder="请输入车牌号码"
                                                    style={{ width: '330px' }}
                                                />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem label="时间">
                                            {getFieldDecorator('robberyTime')(
                                                <RangePicker style={{ width: '330px' }} />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <Col offset={16} md={8} sm={24}>
                                            <div className={styles.submitButtons}>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    className={styles.submitButton}
                                                    onClick={this.getDq}
                                                    style={{
                                                        background: '#3470F4',
                                                        borderColor: '#3470F4',
                                                    }}
                                                >
                                                    搜索
                                                </Button>
                                                <Button
                                                    className={styles.submitButton}
                                                    onClick={this.handleFormReset}
                                                    style={{
                                                        background: '#269CF4',
                                                        borderColor: '#269CF4',
                                                        color: '#fff',
                                                    }}
                                                >
                                                    重置
                                                </Button>
                                            </div>
                                        </Col>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                        <CarDq
                            dqList={this.state.dqList}
                            importLoading={this.state.importLoading}
                        />
                    </div>
                ) : null}
                {expandForm == '4' ? (
                    <div>
                        <div className={styles.formTop}>
                            <Form layout="inline" {...formItemLayout}>
                                <Row>
                                    <Col span={8}>
                                        <FormItem label="车牌号码">
                                            {getFieldDecorator('carNumber', {
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '请输入车牌号码搜索',
                                                    },
                                                    {
                                                        validator: this.carNumberValidator,
                                                    },
                                                ],
                                            })(
                                                <Input
                                                    placeholder="请输入车牌号码"
                                                    style={{ width: '330px' }}
                                                />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem label="时间">
                                            {getFieldDecorator('trackTime')(
                                                <RangePicker style={{ width: '330px' }} />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <Col offset={16} md={8} sm={24}>
                                            <div className={styles.submitButtons}>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    className={styles.submitButton}
                                                    onClick={this.getGj}
                                                    style={{
                                                        background: '#3470F4',
                                                        borderColor: '#3470F4',
                                                    }}
                                                >
                                                    搜索
                                                </Button>
                                                <Button
                                                    className={styles.submitButton}
                                                    onClick={this.handleFormReset}
                                                    style={{
                                                        background: '#269CF4',
                                                        borderColor: '#269CF4',
                                                        color: '#fff',
                                                    }}
                                                >
                                                    重置
                                                </Button>
                                            </div>
                                        </Col>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                        <CarGj
                            arryData={this.state.gjList}
                            importLoading={this.state.importLoading}
                        />
                    </div>
                ) : null}
                {expandForm == '5' ? (
                    <div>
                        <div className={styles.formTop}>
                            <Form layout="inline" {...formItemLayout}>
                                <Row>
                                    <Col span={8}>
                                        <FormItem label="车牌号码">
                                            {getFieldDecorator('carNumber', {
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '请输入车牌号码搜索',
                                                    },
                                                    {
                                                        validator: this.carNumberValidator,
                                                    },
                                                ],
                                            })(
                                                <Input
                                                    placeholder="请输入车牌号码"
                                                    style={{ width: '330px' }}
                                                />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem label="时间">
                                            {getFieldDecorator('passTime')(
                                                <RangePicker
                                                    showTime
                                                    format="YYYY-MM-DD HH:mm:ss"
                                                    style={{ width: '330px' }}
                                                />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <Col offset={16} md={8} sm={24}>
                                            <div className={styles.submitButtons}>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    className={styles.submitButton}
                                                    style={{
                                                        background: '#3470F4',
                                                        borderColor: '#3470F4',
                                                    }}
                                                    onClick={this.getLjd}
                                                >
                                                    搜索
                                                </Button>
                                                <Button
                                                    className={styles.submitButton}
                                                    onClick={this.handleFormReset}
                                                    style={{
                                                        background: '#269CF4',
                                                        borderColor: '#269CF4',
                                                        color: '#fff',
                                                    }}
                                                >
                                                    重置
                                                </Button>
                                            </div>
                                        </Col>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                        <CarLjd
                            ljdList={this.state.ljdList}
                            importLoading={this.state.importLoading}
                        />
                    </div>
                ) : null}
                {expandForm == '6' ? (
                    <div>
                        <div className={styles.formTop}>
                            <Form layout="inline" {...formItemLayout}>
                                <Row>
                                    <Col span={5}>
                                        <FormItem label="车牌号码">
                                            {getFieldDecorator('carNumber', {
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '请输入车牌号码搜索',
                                                    },
                                                    {
                                                        validator: this.carNumberValidator,
                                                    },
                                                ],
                                            })(
                                                <Input
                                                    placeholder="请输入车牌号码"
                                                    style={{ width: '230px' }}
                                                />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={7}>
                                        <FormItem label="行驶时间">
                                            {getFieldDecorator('time')(
                                                <RangePicker
                                                    showTime
                                                    format="YYYY-MM-DD HH:mm:ss"
                                                    style={{ width: '350px' }}
                                                />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={5}>
                                        <FormItem label="起点追踪时间差" {...formItemLayouts}>
                                            {getFieldDecorator('inMinuteLimit')(
                                                <Input
                                                    placeholder="请输入起点追踪时间差"
                                                    style={{ width: '180px' }}
                                                />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={5}>
                                        <FormItem label="终点追踪时间差" {...formItemLayouts}>
                                            {getFieldDecorator('outMinuteLimit')(
                                                <Input
                                                    placeholder="请输入终点追踪时间差"
                                                    style={{ width: '180px' }}
                                                />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={2}>
                                        <Col offset={16} md={8} sm={24}>
                                            <div className={styles.submitButtons}>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    className={styles.submitButton}
                                                    onClick={this.getTx}
                                                    style={{
                                                        background: '#3470F4',
                                                        borderColor: '#3470F4',
                                                    }}
                                                >
                                                    搜索
                                                </Button>
                                                <Button
                                                    className={styles.submitButton}
                                                    onClick={this.handleFormReset}
                                                    style={{
                                                        background: '#269CF4',
                                                        borderColor: '#269CF4',
                                                        color: '#fff',
                                                    }}
                                                >
                                                    重置
                                                </Button>
                                            </div>
                                        </Col>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                        <CarTx
                            txList={this.state.txList}
                            importLoading={this.state.importLoading}
                        />
                    </div>
                ) : null}
                {expandForm == '7' ? (
                    <div>
                        <div className={styles.formTop}>
                            <Form layout="inline" {...formItemLayout}>
                                <Row>
                                    <Col span={5}>
                                        <FormItem label="车牌号码">
                                            {getFieldDecorator('carNumber', {
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '请输入车牌号码搜索',
                                                    },
                                                    {
                                                        validator: this.carNumberValidator,
                                                    },
                                                ],
                                            })(
                                                <Input
                                                    placeholder="请输入车牌号码"
                                                    style={{ width: '230px' }}
                                                />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={5}>
                                        <FormItem label="卡口名称">
                                            {getFieldDecorator('kkbh')(
                                                <Select
                                                    allowClear={true}
                                                    placeholder="请选择卡口名称"
                                                    style={{
                                                        width: '230px',
                                                    }}
                                                >
                                                    <Option value={'001'} key={'001'}>
                                                        嵩山路
                                                    </Option>
                                                    <Option value={'002'} key={'002'}>
                                                        华山路
                                                    </Option>
                                                    <Option value={'003'} key={'003'}>
                                                        汉水路
                                                    </Option>
                                                    <Option value={'098'} key={'098'}>
                                                        阳明滩大桥桥上1
                                                    </Option>
                                                    <Option value={'099'} key={'099'}>
                                                        阳明滩大桥桥上2
                                                    </Option>
                                                    <Option value={'100'} key={'100'}>
                                                        阳明滩大桥桥上3
                                                    </Option>
                                                </Select>,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={5}>
                                        <FormItem label="时间">
                                            {getFieldDecorator('passTime')(
                                                <RangePicker
                                                    showTime
                                                    format="YYYY-MM-DD HH:mm:ss"
                                                    style={{ width: '230px' }}
                                                />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={5}>
                                        <FormItem label="频度阙值">
                                            {getFieldDecorator('cs')(
                                                <Input
                                                    placeholder="请输入频度阙值"
                                                    style={{ width: '230px' }}
                                                />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={4}>
                                        <Col offset={16} md={8} sm={24}>
                                            <div className={styles.submitButtons}>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    className={styles.submitButton}
                                                    style={{
                                                        background: '#3470F4',
                                                        borderColor: '#3470F4',
                                                    }}
                                                    onClick={this.getZfyc}
                                                >
                                                    搜索
                                                </Button>
                                                <Button
                                                    className={styles.submitButton}
                                                    onClick={this.handleFormReset}
                                                    style={{
                                                        background: '#269CF4',
                                                        borderColor: '#269CF4',
                                                        color: '#fff',
                                                    }}
                                                >
                                                    重置
                                                </Button>
                                            </div>
                                        </Col>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                        <CarZfyc
                            zfycList={this.state.zfycList}
                            importLoading={this.state.importLoading}
                        />
                    </div>
                ) : null}
                {expandForm == '8' ? (
                    <div>
                        <div className={styles.formTop}>
                            <Form layout="inline" {...formItemLayout}>
                                <Row>
                                    <Col span={8}>
                                        <FormItem label="车牌号码">
                                            {getFieldDecorator('carNumber', {
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '请输入车牌号码搜索',
                                                    },
                                                    {
                                                        validator: this.carNumberValidator,
                                                    },
                                                ],
                                            })(
                                                <Input
                                                    placeholder="请输入车牌号码"
                                                    style={{ width: '330px' }}
                                                />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem label="时间">
                                            {getFieldDecorator('passTime')(
                                                <RangePicker style={{ width: '330px' }} />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <Col offset={16} md={8} sm={24}>
                                            <div className={styles.submitButtons}>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    className={styles.submitButton}
                                                    style={{
                                                        background: '#3470F4',
                                                        borderColor: '#3470F4',
                                                    }}
                                                    onClick={this.getCcrc}
                                                >
                                                    搜索
                                                </Button>
                                                <Button
                                                    className={styles.submitButton}
                                                    onClick={this.handleFormReset}
                                                    style={{
                                                        background: '#269CF4',
                                                        borderColor: '#269CF4',
                                                        color: '#fff',
                                                    }}
                                                >
                                                    重置
                                                </Button>
                                            </div>
                                        </Col>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                        <CarCcrc
                            ccrcList={this.state.ccrcList}
                            importLoading={this.state.importLoading}
                        />
                    </div>
                ) : null}
                {expandForm == '9' ? (
                    <div>
                        <div className={styles.formTop}>
                            <Form layout="inline" {...formItemLayout}>
                                <Row>
                                    <Col span={8}>
                                        <FormItem label="车牌号码">
                                            {getFieldDecorator('carNumber')(
                                                <Input
                                                    placeholder="请输入车牌号码"
                                                    style={{ width: '330px' }}
                                                />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem label="时间">
                                            {getFieldDecorator('deckTime')(
                                                <RangePicker style={{ width: '330px' }} />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <Col offset={16} md={8} sm={24}>
                                            <div className={styles.submitButtons}>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    className={styles.submitButton}
                                                    onClick={this.getTp}
                                                    style={{
                                                        background: '#3470F4',
                                                        borderColor: '#3470F4',
                                                    }}
                                                >
                                                    搜索
                                                </Button>
                                                <Button
                                                    className={styles.submitButton}
                                                    onClick={this.handleFormReset}
                                                    style={{
                                                        background: '#269CF4',
                                                        borderColor: '#269CF4',
                                                        color: '#fff',
                                                    }}
                                                >
                                                    重置
                                                </Button>
                                            </div>
                                        </Col>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                        <CarTpc
                            tpList={this.state.tpList}
                            importLoading={this.state.importLoading}
                        />
                    </div>
                ) : null}
                {expandForm == '10' ? (
                    <div>
                        <div className={styles.formTop}>
                            <Form layout="inline" {...formItemLayout}>
                                <Row>
                                    <Col span={5}>
                                        <FormItem label="车牌号码">
                                            {getFieldDecorator('carNumber', {
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '请输入车牌号码搜索',
                                                    },
                                                    {
                                                        validator: this.carNumberValidator,
                                                    },
                                                ],
                                            })(
                                                <Input
                                                    placeholder="请输入车牌号码"
                                                    style={{ width: '230px' }}
                                                />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={5}>
                                        <FormItem label="时间范围">
                                            {getFieldDecorator('passTime')(
                                                <RangePicker style={{ width: '230px' }} />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={5}>
                                        <FormItem label="卡口名称">
                                            {getFieldDecorator('kkbh')(
                                                <Select
                                                    allowClear={true}
                                                    placeholder="请选择卡口名称"
                                                    style={{
                                                        width: '230px',
                                                    }}
                                                >
                                                    <Option value={'001'} key={'001'}>
                                                        嵩山路
                                                    </Option>
                                                    <Option value={'002'} key={'002'}>
                                                        华山路
                                                    </Option>
                                                    <Option value={'003'} key={'003'}>
                                                        汉水路
                                                    </Option>
                                                    <Option value={'098'} key={'098'}>
                                                        阳明滩大桥桥上1
                                                    </Option>
                                                    <Option value={'099'} key={'099'}>
                                                        阳明滩大桥桥上2
                                                    </Option>
                                                    <Option value={'100'} key={'100'}>
                                                        阳明滩大桥桥上3
                                                    </Option>
                                                </Select>,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={5}>
                                        <FormItem label="频度阙值">
                                            {getFieldDecorator('jgpl')(
                                                <Input
                                                    placeholder="请输入频度阙值"
                                                    style={{ width: '230px' }}
                                                />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={4}>
                                        <Col offset={16} md={8} sm={24}>
                                            <div className={styles.submitButtons}>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    className={styles.submitButton}
                                                    style={{
                                                        background: '#3470F4',
                                                        borderColor: '#3470F4',
                                                    }}
                                                    onClick={this.getPfgc}
                                                >
                                                    搜索
                                                </Button>
                                                <Button
                                                    className={styles.submitButton}
                                                    onClick={this.handleFormReset}
                                                    style={{
                                                        background: '#269CF4',
                                                        borderColor: '#269CF4',
                                                        color: '#fff',
                                                    }}
                                                >
                                                    重置
                                                </Button>
                                            </div>
                                        </Col>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                        <CarPfgc
                            pfgcList={this.state.pfgcList}
                            importLoading={this.state.importLoading}
                        />
                    </div>
                ) : null}
                {expandForm == '11' ? (
                    <div>
                        <div className={styles.formTop}>
                            <Form layout="inline" {...formItemLayout}>
                                <Row>
                                    <Col span={6}>
                                        <FormItem label="车牌号码">
                                            {getFieldDecorator('carNumber', {
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '请输入车牌号码搜索',
                                                    },
                                                    {
                                                        validator: this.carNumberValidator,
                                                    },
                                                ],
                                            })(
                                                <Input
                                                    placeholder="请输入车牌号码"
                                                    style={{ width: '300px' }}
                                                />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={6}>
                                        <FormItem label="时间范围">
                                            {getFieldDecorator('trackTime')(
                                                <RangePicker style={{ width: '300px' }} />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={6}>
                                        <FormItem label="违法次数">
                                            {getFieldDecorator('fwcs')(
                                                <Input
                                                    placeholder="违法次数"
                                                    style={{ width: '300px' }}
                                                />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={6}>
                                        <Col offset={16} md={8} sm={24}>
                                            <div className={styles.submitButtons}>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    className={styles.submitButton}
                                                    style={{
                                                        background: '#3470F4',
                                                        borderColor: '#3470F4',
                                                    }}
                                                    onClick={this.getWg}
                                                >
                                                    搜索
                                                </Button>
                                                <Button
                                                    className={styles.submitButton}
                                                    onClick={this.handleFormReset}
                                                    style={{
                                                        background: '#269CF4',
                                                        borderColor: '#269CF4',
                                                        color: '#fff',
                                                    }}
                                                >
                                                    重置
                                                </Button>
                                            </div>
                                        </Col>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                        <CarLxwg
                            wgList={this.state.wgList}
                            importLoading={this.state.importLoading}
                        />
                    </div>
                ) : null}
            </div>
        );
    }
}

export default Form.create()(keyCar);
