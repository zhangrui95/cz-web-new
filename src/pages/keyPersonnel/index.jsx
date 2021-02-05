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
import PersonMsg from '@/pages/personnelDetails/components/PersonMsg';
import Social from '@/pages/personnelDetails/components/social';
import PersonGx from '@/pages/personnelDetails/components/PersonGx';
import PersonGj from '@/pages/personnelDetails/components/PersonGj';
import PersonTzList from '@/pages/personnelDetails/components/PersonTzList';
const { Option } = Select;
const list = [];
@connect(({ keyPersonnel, loading, personnelDetails }) => ({
    keyPersonnel,
    personnelDetails,
    loading: loading.effects['keyPersonnel/fetchNoticeList'],
}))
class keyPersonnel extends Component {
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
        gxList: null,
        gtgxList: null,
        tzList: [],
    };

    componentDidMount() {
        this.getTableData();
    }
    getSocial = () => {
        this.props.form.validateFields((err, fieldsValue) => {
            if (err) return;
            this.props.dispatch({
                type: 'personnelDetails/getPersonArchivesList',
                payload: {
                    data: {
                        archives_type_codes: [window.configUrl.shgx],
                        idcard: fieldsValue.idcard || '',
                        person_id: '',
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
        });
    };
    getTz = () => {
        this.props.form.validateFields((err, fieldsValue) => {
            if (err) return;
            this.setState({
                importLoading: true,
            });
            this.props.dispatch({
                type: 'personnelDetails/getPersonHotelList',
                payload: {
                    idcard: fieldsValue.idcard || '',
                    inTime:
                        fieldsValue.time && fieldsValue.time[0]
                            ? moment(fieldsValue.time[0]).format('YYYY-MM-DD HH:mm:ss')
                            : '',
                    outTime:
                        fieldsValue.time && fieldsValue.time[1]
                            ? moment(fieldsValue.time[1]).format('YYYY-MM-DD HH:mm:ss')
                            : '',
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
        });
    };
    getTrajectory = () => {
        this.props.form.validateFields((err, fieldsValue) => {
            if (err) return;
            this.props.dispatch({
                type: 'personnelDetails/getPersonArchivesList',
                payload: {
                    data: {
                        archives_type_codes: [
                            window.configUrl.zsxx, //住宿信息
                            window.configUrl.tlxx, //铁路信息
                        ],
                        idcard: fieldsValue.idcard || '',
                        person_id: '',
                    },
                    type: '1',
                },
            });
        });
    };
    getGtgx = () => {
        this.props.form.validateFields((err, fieldsValue) => {
            if (err) return;
            this.props.dispatch({
                type: 'personnelDetails/getPersonRelation',
                payload: {
                    idcardPri: fieldsValue.idcardPri || '',
                    idcardSec: fieldsValue.idcardSec || '',
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
        });
    };

    getTableData = (changePage, pd) => {
        const {
            dispatch,
            keyPersonnel: {
                data: { page },
            },
        } = this.props;
        const pages = changePage || {
            currentPage: 1,
            showCount: tableList,
        };
        const pds = pd || {};
        const param = {
            ...pages,
            pd: { ...pds },
        };
        dispatch({
            type: 'keyPersonnel/getPersonListSearch',
            payload: param,
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
                if (k == 3) {
                    this.props.form.setFieldsValue({
                        idcard: '23060619921231857X',
                    });
                    this.getSocial();
                }
                if (k == 4) {
                    this.props.form.setFieldsValue({
                        idcardPri: '232303194801243018',
                        // idcardSec:"230101198105173018"
                    });
                    this.getGtgx();
                }
                if (k == 5) {
                    this.props.form.setFieldsValue({
                        idcard: '230101198104243018',
                    });
                    this.getTrajectory();
                }
                if (k == 6) {
                    this.props.form.setFieldsValue({
                        idcard: '23060619921231857X',
                    });
                    this.getTz();
                }
            },
        );
    };

    // 查询条件重置
    handleFormReset = () => {
        const {
            form,
            keyPersonnel: {
                data: { page },
            },
        } = this.props;
        form.resetFields();
        this.setState({
            formValues: {},
            gxList: null,
            gtgxList: null,
            tzList: [],
        });
        this.props.personnelDetails.information = null;
        if (page) {
            page.currentPage = 1;
            page.showCount = tableList;
            this.getTableData(page);
        }
    };

    onChange = currentPage => {
        const {
            keyPersonnel: {
                data: { page },
            },
        } = this.props;
        const { formValues } = this.state;
        page.currentPage = currentPage;
        // 查询改变页数后的数据
        this.getTableData(page, formValues);
    };

    onShowSizeChange = (current, pageSize) => {
        const {
            keyPersonnel: {
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
            const {
                keyPersonnel: {
                    data: { page },
                },
            } = this.props;
            page.currentPage = 1;
            page.showCount = tableList;
            this.getTableData(page, fieldsValue);
        });
    };

    renderPersonForm() {
        const {
            form,
            keyPersonnel: { riskList, useList },
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
                        <FormItem label="姓名">
                            {getFieldDecorator('name')(
                                <Input placeholder="请输入姓名" style={{ width: '330px' }} />,
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem label="身份证号">
                            {getFieldDecorator('idcard')(
                                <Input placeholder="请输入身份证号" style={{ width: '330px' }} />,
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
                keyPersonnel: {
                    data: { page },
                },
            } = this.props;
            page.currentPage = 1;
            page.showCount = tableList;

            this.getTableData(page, fieldsValue);
        });
    };

    toDetail = record => {
        this.props.dispatch(
            routerRedux.push({
                pathname: '/person/detail',
                query: { id: record.id, idcard: record.idcard },
            }),
        );
    };
    idCardValidator = (rule, value, callback) => {
        let cardValid = function(value) {
            let ex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
            return ex.test(value);
            //     //身份证
            //     let ex = /^((1[1-5])|(2[1-3])|(3[1-7])|(4[1-6])|(5[0-4])|(6[1-5])|71|(8[12])|91)\d{4}(19|2[0-9])((\d{2}(0[13-9]|1[012])(0[1-9]|[12]\d|30))|(\d{2}(0[13578]|1[02])31)|(\d{2}02(0[1-9]|1\d|2[0-8]))|(([13579][26]|[2468][048]|0[48])0229))\d{3}(\d|X|x)?$/;
            //     let pattern = new RegExp(ex);
            //     if (!pattern.test(value)) {
            //         return false;
            //     }
            //     let params = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
            //     let checks = [1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2];
            //     let id = value;
            //     let sum = 0;
            //     for (let i = 0; i < 17; i++) {
            //         let tmp = id.charAt(i);
            //         sum += params[i] * tmp;
            //     }
            //     sum %= 11;
            //     let check;
            //     if (id.charAt(17) == 'x' || id.charAt(17) == 'X') {
            //         check = 10;
            //     } else {
            //         check = id.charAt(17);
            //     }
            //     return check == checks[sum];
        };
        if (value && !cardValid(value)) {
            callback('请输入正确的证件号码！');
        }
        callback();
    };
    render() {
        const { expandForm, loading, data } = this.state;
        const {
            keyPersonnel: {
                data: { list, page },
            },
            form,
        } = this.props;
        const columns = [
            {
                title: '照片',
                dataIndex: 'xp',
                render: text => <img src={text} width={40} height={40} />,
            },
            {
                title: '姓名',
                dataIndex: 'name',
                ellipsis: true,
                // width:150
            },
            {
                title: '曾用名',
                dataIndex: 'alias',
                ellipsis: true,
                // width:150
            },
            {
                title: '身份证号',
                dataIndex: 'idcard',
                ellipsis: true,
                width: 180,
            },
            {
                title: '性别',
                dataIndex: 'xb',
                // width:150
            },
            {
                title: '民族',
                dataIndex: 'mz',
                // width:150
            },
            {
                title: '出生地',
                dataIndex: 'birthplace',
                // width:150
            },
            {
                title: '出生日期',
                dataIndex: 'birth',
                // width:150
            },
            {
                title: '标签',
                dataIndex: 'tags',
                ellipsis: true,
                width: '20%',
                render: text => (
                    <span>
                        <Tooltip
                            title={
                                text &&
                                text.length &&
                                text
                                    .map(x => {
                                        if (x.tag_name) return x.tag_name;
                                    })
                                    .join('、')
                            }
                        >
                            {text &&
                                text.length &&
                                text.map((tag, k) => {
                                    if (tag.tag_color != '') {
                                        return (
                                            <Tag color={tag.tag_color} key={k}>
                                                {tag.tag_name.toUpperCase()}
                                            </Tag>
                                        );
                                    } else {
                                        return '';
                                    }
                                })}
                        </Tooltip>
                    </span>
                ),
            },
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
            { title: '人员背景核查', clicked: '1', id: 1 },
            // { title: '人员基本信息', clicked: '2', id: 2 },
            { title: '人员关系图', clicked: '3', id: 3 },
            { title: '共同关系人', clicked: '4', id: 4 },
            { title: '人员活动轨迹', clicked: '5', id: 5 },
            { title: '人员同住分析', clicked: '6', id: 6 },
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
                                loading={this.props.loading || this.state.importLoading}
                                dataSource={list}
                                // showSizeChanger
                                size="default"
                                pagination={false}
                                // scroll={{ y: 370 }}
                            />
                        </Card>
                        {page && page.totalResult ? (
                            <Row className={styles.pagination}>
                                <Pagination
                                    // showSizeChanger
                                    showQuickJumper
                                    // pageSizeOptions={['16', '24', '32']}
                                    total={page.totalResult}
                                    current={page.currentPage}
                                    pageSize={page.showCount}
                                    onChange={this.onChange}
                                    onShowSizeChange={this.onShowSizeChange}
                                    showTotal={(total, range) => `共${total}项`}
                                />
                            </Row>
                        ) : null}
                    </div>
                ) : null}
                {expandForm == '3' ? (
                    <div>
                        <div className={styles.formTop}>
                            <Form layout="inline" {...formItemLayout}>
                                <Row>
                                    <Col span={8}>
                                        <FormItem label="身份证号">
                                            {getFieldDecorator('idcard', {
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '请输入身份证号搜索',
                                                    },
                                                    {
                                                        validator: this.idCardValidator,
                                                    },
                                                ],
                                            })(
                                                <Input
                                                    placeholder="请输入身份证号"
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
                                                    onClick={this.getSocial}
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
                        <Social {...this.props} {...this.state} />
                    </div>
                ) : null}
                {expandForm == '4' ? (
                    <div>
                        <div className={styles.formTop}>
                            <Form layout="inline" {...formItemLayout}>
                                <Row>
                                    <Col span={8}>
                                        <FormItem label="主要人员证件号">
                                            {getFieldDecorator('idcardPri', {
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '请输入主要人员证件号',
                                                    },
                                                    {
                                                        validator: this.idCardValidator,
                                                    },
                                                ],
                                            })(
                                                <Input
                                                    placeholder="请输入主要人员证件号"
                                                    style={{ width: '330px' }}
                                                />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={8}>
                                        <FormItem label="次要人员证件号">
                                            {getFieldDecorator('idcardSec', {
                                                rules: [
                                                    {
                                                        validator: this.idCardValidator,
                                                    },
                                                ],
                                            })(
                                                <Input
                                                    placeholder="请输入次要人员证件号"
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
                                                    onClick={this.getGtgx}
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
                        <PersonGx {...this.state} />
                    </div>
                ) : null}
                {expandForm == '5' ? (
                    <div>
                        <div className={styles.formTop}>
                            <Form layout="inline" {...formItemLayout}>
                                <Row>
                                    <Col span={8}>
                                        <FormItem label="身份证号">
                                            {getFieldDecorator('idcard', {
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '请输入身份证号搜索',
                                                    },
                                                    {
                                                        validator: this.idCardValidator,
                                                    },
                                                ],
                                            })(
                                                <Input
                                                    placeholder="请输入身份证号"
                                                    style={{ width: '330px' }}
                                                />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    {/*<Col span={8}>*/}
                                    {/*    <FormItem label="时间">*/}
                                    {/*        {getFieldDecorator('time')(*/}
                                    {/*            <RangePicker*/}
                                    {/*                showTime*/}
                                    {/*                format="YYYY-MM-DD HH:mm:ss"*/}
                                    {/*                style={{ width: '330px' }}*/}
                                    {/*            />,*/}
                                    {/*        )}*/}
                                    {/*    </FormItem>*/}
                                    {/*</Col>*/}
                                    <Col span={16}>
                                        <Col offset={16} md={8} sm={24}>
                                            <div className={styles.submitButtons}>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    className={styles.submitButton}
                                                    onClick={this.getTrajectory}
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
                        <PersonGj {...this.props} {...this.state} isSearch={true} />
                    </div>
                ) : null}
                {expandForm == '6' ? (
                    <div>
                        <div className={styles.formTop}>
                            <Form layout="inline" {...formItemLayout}>
                                <Row>
                                    <Col span={6}>
                                        <FormItem label="身份证号">
                                            {getFieldDecorator('idcard', {
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '请输入身份证号搜索',
                                                    },
                                                    {
                                                        validator: this.idCardValidator,
                                                    },
                                                ],
                                            })(
                                                <Input
                                                    placeholder="请输入身份证号"
                                                    style={{ width: '330px' }}
                                                />,
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={6}>
                                        <FormItem label="时间">
                                            {getFieldDecorator('time')(
                                                <RangePicker
                                                    showTime
                                                    format="YYYY-MM-DD HH:mm:ss"
                                                    style={{ width: '330px' }}
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
                                                    onClick={this.getTz}
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
                        <PersonTzList {...this.state} />
                    </div>
                ) : null}
            </div>
        );
    }
}

export default Form.create()(keyPersonnel);
