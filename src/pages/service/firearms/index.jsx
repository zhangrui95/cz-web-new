import React, { Component } from 'react';
import {
    Message,
    Row,
    Col,
    Switch,
    Form,
    Divider,
    Badge,
    Card,
    Button,
    Icon,
    Avatar,
    Modal,
    Input,
    Table,
    Pagination,
    Select,
    Tree,
    DatePicker,
    Radio,
    message,
} from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import { connect as mqttConnect } from 'mqtt';
const { configUrl } = window;

const FormItem = Form.Item;
const { TreeNode } = Tree;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
import styles from '../style.less';
import { tableList } from '@/utils/utils';
import FormModal from './components/FormModal';
import { authorityIsTrue } from '@/utils/authority';
const getParentKey = (title, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.childrenList) {
            if (node.childrenList.some(item => item.name === title)) {
                parentKey = node.code;
            } else if (getParentKey(title, node.childrenList)) {
                parentKey = getParentKey(title, node.childrenList);
            }
        }
    }
    return parentKey;
};

const dataList = [];
const key = 'updatable';
const generateList = data => {
    for (let i = 0; i < data.length; i++) {
        const node = data[i];
        const code = node.code;
        dataList.push({ code, name: node.name });
        if (node.childrenList) {
            generateList(node.childrenList);
        }
    }
};
/*对于异步加载的子节点使用该key进行自增赋值*/
// let key = 10;
@connect(({ service, loading, instruction }) => ({
    service,
    loading: loading.models.service,
    instruction,
}))
class service extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expandForm: false,
            formValues: {},
            value: 1,
            loading: false,
            expandedKeys: ['0'],
            searchValue: '',
            autoExpandParent: true,
            searchTreeLoad: false,
            treeValue: '0',
            selectedKeys: ['0'],
            visible: false,
            personName: '',
            schedule_id: '',
            idcard: '',
            haveFirearms: '1',
            zfjlList: [],
            djjList: [],
            jwtList: [],
            list: [],
            page: {},
        };
    }
    componentDidMount() {
        this.getTableData();
    }
    getTableData = (changePage, pd) => {
        this.setState({ loading: true });
        const { page } = this.state;
        const { dispatch } = this.props;
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
            type: 'service/getFirearmsList',
            payload: param,
            success: res => {
                console.log('人员列表=======>', res);
                this.setState({
                    list: res.result.list,
                    page: res.result.page ? res.result.page : {},
                    loading: false,
                });
            },
        });
    };
    onChangeTable = currentPage => {
        const { page } = this.state;
        const { formValues } = this.state;
        page.currentPage = currentPage;
        console.log(currentPage);
        // 查询改变页数后的数据
        this.getTableData(page, formValues);
    };
    handleSubmit = e => {
        e.preventDefault();
        const { form } = this.props;
        const { page } = this.state;

        form.validateFields((err, fieldsValue) => {
            console.log('fieldsValue', fieldsValue);
            if (err) return;
            //nameSearch，haveFirearmsSearch，firearmsNumberSearch
            const values = {
                xm: fieldsValue.nameSearch,
                firearms_no: fieldsValue.firearmsNumberSearch,
                flag: fieldsValue.haveFirearmsSearch ? fieldsValue.haveFirearmsSearch : '',
                schedule_organization_code:
                    this.state.treeValue && this.state.treeValue != '0' ? this.state.treeValue : '',
            };

            this.setState({
                formValues: values,
            });

            page.currentPage = 1;
            page.showCount = tableList;
            console.log(page, values);
            this.getTableData(page, values);
        });
    };
    renderForm = () => {
        const { form } = this.props;
        const { getFieldDecorator } = form;

        const formItemLayout = {
            labelCol: { span: 16 },
            wrapperCol: { span: 8 },
        };
        return (
            <Form layout="inline" onSubmit={this.handleSubmit}>
                <Row>
                    <Col span={7}>
                        <FormItem label="人员姓名">
                            {getFieldDecorator('nameSearch')(
                                <Input placeholder="请输入人员姓名" style={{ width: '330px' }} />,
                            )}
                        </FormItem>
                    </Col>
                    <Col span={5}>
                        <FormItem label="是否佩戴枪支">
                            {getFieldDecorator('haveFirearmsSearch', {
                                initialValue: '',
                            })(
                                <Radio.Group>
                                    <Radio value={''}>全部</Radio>
                                    <Radio value={'1'}>是</Radio>
                                    <Radio value={'0'}>否</Radio>
                                </Radio.Group>,
                            )}
                        </FormItem>
                    </Col>
                    <Col span={6}>
                        <FormItem label="枪支编号">
                            {getFieldDecorator('firearmsNumberSearch')(
                                <Input placeholder="请输入枪支编号" style={{ width: '330px' }} />,
                            )}
                        </FormItem>
                    </Col>
                    <Col span={6}>{this.renderSearchButton()}</Col>
                </Row>
            </Form>
        );
    };
    // 渲染查询条件的按钮渲染
    renderSearchButton = () => (
        // <Col offset={8} md={8} sm={24}>
        <span className={styles.submitButtons}>
            <Button
                type="primary"
                htmlType="submit"
                className={styles.submitButton}
                style={{ background: '#3470F4', borderColor: '#3470F4', color: '#fff' }}
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
        </span>
        // </Col>
    );
    // 查询条件重置
    handleFormReset = () => {
        const { form } = this.props;
        const { page } = this.state;
        form.resetFields();
        this.setState({
            formValues: {},
            expandedKeys: ['0'],
            autoExpandParent: false,
            treeValue: '0',
            selectedKeys: ['0'],
        });
        page.currentPage = 1;
        page.showCount = tableList;
        this.getTableData(page);
    };
    onSelect = expandedKeys => {
        /*用于打开该节点的详细信息*/
        console.log('selected', expandedKeys);
        if (expandedKeys.length > 0) {
            console.log('selected');
            this.setState({ treeValue: expandedKeys[0], selectedKeys: expandedKeys });
            const { form } = this.props;
            const { page } = this.state;

            form.validateFields((err, fieldsValue) => {
                if (err) return;

                const values = {
                    xm: fieldsValue.nameSearch,
                    firearms_no: fieldsValue.firearmsNumberSearch,
                    flag: fieldsValue.haveFirearmsSearch ? fieldsValue.haveFirearmsSearch : '',
                    schedule_organization_code:
                        expandedKeys[0] && expandedKeys[0] != '0' ? expandedKeys[0] : '',
                };
                //   console.log('fieldsValue', values);
                this.setState({
                    formValues: values,
                });

                page.currentPage = 1;
                page.showCount = tableList;
                //   console.log(page, values)
                if (expandedKeys.length) {
                    this.getTableData(page, values);
                }
            });
        }
    };

    onExpand = expandedKeys => {
        this.setState({
            expandedKeys,
            autoExpandParent: false,
        });
    };

    onChange = value => {
        // const value = e.target.value;
        this.setState({ searchTreeLoad: true });
        const expandedKeys = dataList
            .map(item => {
                console.log(item.name.indexOf(value));
                if (item.name.indexOf(value) > -1) {
                    return getParentKey(item.name, this.props.service.useList);
                }
                return null;
            })
            .filter((item, i, self) => item && self.indexOf(item) === i);
        this.setState({
            expandedKeys,
            searchValue: value,
            autoExpandParent: true,
            searchTreeLoad: false,
        });
    };

    loop = data =>
        data.map(item => {
            let { searchValue } = this.state;
            const index = item.name.indexOf(searchValue);
            const beforeStr = item.name.substr(0, index);
            const afterStr = item.name.substr(index + searchValue.length);
            const title =
                index > -1 ? (
                    <span>
                        {beforeStr}
                        <span style={{ color: '#f50' }}>{searchValue}</span>
                        {afterStr}
                    </span>
                ) : (
                    <span>{item.name}</span>
                );
            if (item.childrenList) {
                return (
                    <TreeNode key={item.code} title={item.name} dataRef={item}>
                        {this.loop(item.childrenList)}
                    </TreeNode>
                );
            }
            return <TreeNode dataRef={item} key={item.code} title={item.name} />;
        });
    handleEditModalVisible = record => {
        const { dispatch } = this.props;
        dispatch({
            type: 'service/getDjj',
            payload: {},
            success: res => {
                this.setState({
                    djjList: res.result.list,
                });
            },
        });
        dispatch({
            type: 'service/getZfjly',
            payload: {},
            success: res => {
                this.setState({
                    zfjlList: res.result.list,
                });
            },
        });
        dispatch({
            type: 'instruction/getVehicleList',
            payload: { vehicle_flag: '2' },
            success: e => {
                this.setState({
                    jwtList: e.result.list,
                });
            },
        });
        console.log('record', record);
        this.props.form.setFieldsValue({
            name: record.xm,
            firearmsNumber: record.firearms_no || '',
            zfjly: record.zimei || '',
            djj: record.dimei || '',
            jwt: record.jwtid || '',
            haveFirearms: record.flag ? record.flag : '0',
        });
        this.setState({
            visible: true,
            personName: record.xm || '',
            schedule_id: record.schedule_id || '',
            haveFirearms: record.flag ? record.flag : '0',
            idcard: record.idcard || '',
        });
    };
    okHandle = () => {
        const { dispatch, form } = this.props;
        const { schedule_id, personName, idcard } = this.state;
        form.validateFields((err, fieldsValue) => {
            console.log('fieldsValue==========>', fieldsValue);
            if (err) return;
            dispatch({
                type: 'service/saveFirearms',
                payload: {
                    schedule_id,
                    police_name: personName,
                    flag: fieldsValue.haveFirearms || '',
                    firearms_no: fieldsValue.firearmsNumber || '',
                    zimei: fieldsValue.zfjly || '',
                    dimei: fieldsValue.djj || '',
                    jwtid: fieldsValue.jwt || '',
                    idcard,
                },
                success: res => {
                    message.success('操作成功');
                    this.handleModalVisible();
                    const { formValues } = this.state;
                    this.getTableData({}, formValues);
                },
            });
        });
    };
    handleModalVisible = () => {
        const { form } = this.props;
        form.resetFields(['name', 'haveFirearms', 'firearmsNumber', 'zfjly', 'djj', 'jwt']);
        this.setState({
            visible: false,
            personName: '',
            schedule_id: '',
            idcard: '',
        });
    };
    onChangeRadio = e => {
        this.setState({
            haveFirearms: e.target.value,
        });
    };
    render() {
        const {
            expandedKeys,
            autoExpandParent,
            visible,
            personName,
            haveFirearms,
            djjList,
            zfjlList,
            jwtList,
            list,
            page,
        } = this.state;
        const {
            form: { getFieldDecorator },
        } = this.props;
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
        // 进行数组扁平化处理
        generateList(this.props.service.useList);
        const columns = [
            {
                title: '姓名',
                dataIndex: 'xm',
                width: 100,
                ellipsis: true,
            },
            {
                title: '班次时间',
                dataIndex: 'time',
                width: 320,
                ellipsis: true,
                render: (text, record) => (
                    <span>
                        {(record && record.begintime) || ''} ~ {(record && record.endtime) || ''}
                    </span>
                ),
            },
            {
                title: '是否佩戴枪支',
                dataIndex: 'flag',
                ellipsis: true,
                render: text => <span>{text === '0' ? '否' : text === '1' ? '是' : ''}</span>,
            },
            {
                title: '枪支编号',
                dataIndex: 'firearms_no',
                ellipsis: true,
            },
            {
                title: '执法记录仪',
                dataIndex: 'zimei',
                ellipsis: true,
            },
            {
                title: '对讲机',
                dataIndex: 'dimei',
                ellipsis: true,
            },
            {
                title: '警务通',
                dataIndex: 'jwtid',
                ellipsis: true,
            },
            {
                title: '操作',
                fixed: 'right',
                width: 80,
                render: record => (
                    <span>
                        <a onClick={() => this.handleEditModalVisible(record)}>配置</a>
                    </span>
                ),
            },
        ];
        return (
            <div>
                <div className={styles.tableListForm}>{this.renderForm()}</div>
                <Card style={{ width: '100%', background: 'none' }} bordered={false}>
                    <Row gutter={[8, 16]}>
                        <Col span={3}>
                            <Card
                                bordered={false}
                                className={styles.tableListCard}
                                style={{
                                    overflowX: 'auto',
                                    height: '450px',
                                }}
                            >
                                <div style={{ marginBottom: '200px' }}>
                                    <Search
                                        style={{ marginBottom: 8 }}
                                        placeholder="搜索"
                                        onSearch={value => this.onChange(value)}
                                        enterButton
                                    />
                                    <Tree
                                        onSelect={this.onSelect}
                                        onExpand={this.onExpand}
                                        expandedKeys={expandedKeys}
                                        autoExpandParent={autoExpandParent}
                                        selectedKeys={this.state.selectedKeys}
                                        defaultSelectedKeys={this.state.selectedKeys}
                                    >
                                        <TreeNode key={'0'} title={'全部'} dataRef={'0'}>
                                            {this.loop(this.props.service.useList)}
                                        </TreeNode>
                                    </Tree>
                                </div>
                            </Card>
                        </Col>
                        <Col span={21}>
                            <Card bordered={false} className={styles.tableListCard}>
                                <Table
                                    columns={columns}
                                    loading={this.state.loading}
                                    dataSource={list}
                                    size="default"
                                    pagination={false}
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
                                        onChange={this.onChangeTable}
                                        onShowSizeChange={this.onShowSizeChange}
                                        showTotal={(total, range) => `共${total}项`}
                                    />
                                </Row>
                            ) : null}
                        </Col>
                    </Row>
                </Card>
                <Modal
                    title={'枪支配置'}
                    visible={visible}
                    onOk={this.okHandle}
                    onCancel={this.handleModalVisible}
                    maskClosable={false}
                    width={'800px'}
                    centered={true}
                >
                    <Row gutter={[8, 0]}>
                        <Col span={12}>
                            <FormItem {...formItemLayout} label="姓名">
                                {getFieldDecorator('name')(
                                    <Input
                                        placeholder="请输入姓名"
                                        style={{ width: '230px' }}
                                        disabled={true}
                                    />,
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...formItemLayout} label="是否佩戴枪支">
                                {getFieldDecorator('haveFirearms', {
                                    rules: [
                                        {
                                            required: visible,
                                            message: '必需选择是否佩戴枪支',
                                        },
                                    ],
                                    initialValue: '1',
                                })(
                                    <Radio.Group onChange={this.onChangeRadio}>
                                        <Radio value={'1'}>是</Radio>
                                        <Radio value={'0'}>否</Radio>
                                    </Radio.Group>,
                                )}
                            </FormItem>
                        </Col>
                        {haveFirearms == '1' ? (
                            <Row>
                                <Col span={12}>
                                    <FormItem {...formItemLayout} label="枪支编号">
                                        {getFieldDecorator('firearmsNumber', {
                                            rules: [
                                                {
                                                    required: visible && haveFirearms == '1',
                                                    message: '必需输入枪支编号',
                                                },
                                            ],
                                            initialValue: '',
                                        })(
                                            <Input
                                                placeholder="请输入枪支编号"
                                                style={{ width: '230px' }}
                                            />,
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...formItemLayout} label="执法记录仪">
                                        {getFieldDecorator('zfjly')(
                                            <Select
                                                placeholder="请选择执法记录仪"
                                                style={{ width: '230px' }}
                                                showSearch
                                                allowClear
                                                filterOption={(input, option) =>
                                                    option.props.children.findIndex(
                                                        item => item.indexOf(input) >= 0,
                                                    ) >= 0
                                                }
                                            >
                                                {zfjlList.map(item => {
                                                    return (
                                                        <Option value={item.imei}>
                                                            {item.carno}({item.imei})
                                                        </Option>
                                                    );
                                                })}
                                            </Select>,
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...formItemLayout} label="对讲机">
                                        {getFieldDecorator('djj')(
                                            <Select
                                                placeholder="请选择对讲机"
                                                style={{ width: '230px' }}
                                                showSearch
                                                allowClear
                                                filterOption={(input, option) =>
                                                    option.props.children.findIndex(
                                                        item => item.indexOf(input) >= 0,
                                                    ) >= 0
                                                }
                                            >
                                                {djjList.map(item => {
                                                    return (
                                                        <Option value={item.imei}>
                                                            {item.carno}({item.imei})
                                                        </Option>
                                                    );
                                                })}
                                            </Select>,
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...formItemLayout} label="警务通">
                                        {getFieldDecorator('jwt')(
                                            <Select
                                                placeholder="请选择警务通"
                                                style={{ width: '230px' }}
                                                showSearch
                                                allowClear
                                                filterOption={(input, option) =>
                                                    option.props.children.indexOf(input) >= 0
                                                }
                                            >
                                                {jwtList.map(item => {
                                                    return (
                                                        <Option value={item.vehicle_id}>
                                                            {item.carNo}
                                                        </Option>
                                                    );
                                                })}
                                            </Select>,
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                        ) : null}
                    </Row>
                </Modal>
            </div>
        );
    }
}

export default Form.create()(service);
// export default () => <div>hecha</div>;
