import {
    Button,
    Card,
    Col,
    DatePicker,
    Result,
    Form,
    Input,
    Modal,
    Upload,
    TreeSelect,
    Message,
    Row,
    Select,
    List,
    Pagination,
    Radio,
    Table,
    Tag,
    Divider,
} from 'antd';
import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import SwitchTag from '@/components/SwitchTag';
import styles from './style.less';
import { tableList } from '@/utils/utils';
const { TreeNode } = TreeSelect;
const FormItem = Form.Item;
const { Option } = Select;
import FormModal from './components/FormModal';
import BayonetModal from './components/bayonetModal';
import IndividualModal from './components/individualModal';

import { authorityIsTrue } from '@/utils/authority';
const TreeSelectProps = {
    showSearch: true,
    allowClear: false,
    autoExpandParent: false,
    treeDefaultExpandAll: true,
    searchPlaceholder: '请输入',
    treeNodeFilterProp: 'title',
    dropdownStyle: { maxHeight: 400, overflow: 'auto' },
    style: {
        maxWidth: 330,
    },
};
const list = [];
const bayonetList = [
    {
        type: 1,
        name: '卡口',
    },
    {
        type: 2,
        name: '视频卡口',
    },
    {
        type: 3,
        name: '重点场所',
    },
    {
        type: 4,
        name: '警务站',
    },
];
const individualList = [
    {
        type: '1',
        name: '对讲机',
    },
    {
        type: '2',
        name: '单兵设备',
    },
];
@connect(({ device, loading }) => ({
    device,
    loading: loading.models.device,
}))
class deviceManager extends Component {
    state = {
        expandForm: authorityIsTrue('czht_sbgl_clgl')
            ? '1'
            : authorityIsTrue('czht_sbgl_kkgl')
            ? '2'
            : authorityIsTrue('czht_sbgl_dbsbgl')
            ? '3'
            : '',
        formValues: {},
        value: 1,
        loading: false,
        data: [],
        pagination: {},
        createModalVisible: false,
        updateModalVisible: false,
        updateValues: {},
        createBayonetVisible: false,
        updateBayonetVisible: false,
        createIndividualVisible: false,
        updateIndividualVisible: false,
        isIntercom: false,
        importLoading: false,
    };

    componentDidMount() {
        const {
            dispatch,
            device: {
                data: { page },
            },
        } = this.props;
        var _self = this;
        if (this.props.location.state != undefined) {
            const states = this.props.location.state;
            const pages = JSON.parse(states.pages);
            console.log(pages, states);
            this.setState(
                {
                    expandForm: states.expandForm,
                    formValues: pages.pd,
                },
                () => {
                    _self.props.form.setFieldsValue({
                        ...pages.pd,
                    });
                    _self.getCardData(pages, {
                        ...pages.pd,
                    });
                },
            );
            this.getCardData(pages, pages.pd);
        } else {
            // 第一次访问，获取默认选中  人脸抓拍记录
            if (this.state.expandForm != '') {
                this.getCardData();
            }
        }
        this.queryDictionary();
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
                type: 'device/getUseDept',
                payload: {
                    // department: JSON.parse(sessionStorage.getItem('user')).department,
                    groupList: codes,
                },
            });
        }
    };
    getCardData = (changePage, pd) => {
        const {
            dispatch,
            device: {
                data: { page },
            },
        } = this.props;
        const pages = changePage || {
            currentPage: 1,
            showCount: tableList,
        };
        const pds = pd
            ? pd
            : this.state.expandForm == '0'
            ? { vehicle_flag: '2' }
            : this.state.expandForm == '1'
            ? { vehicle_flag: '1' }
            : {};

        const param = {
            ...pages,
            pd: { ...pds },
        };

        dispatch({
            type: this.currentQueryList(),
            payload: param,
        });
    };
    queryDictionary = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'device/dictionaryQuery',
            payload: { code: window.configUrl.dictionariesVehicle },
        });
    };
    handleSubmit = e => {
        const { dispatch, form } = this.props;
        e.preventDefault();
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            fieldsValue.vehicle_flag = this.state.expandForm == '0' ? '2' : '1';
            this.setState({
                formValues: fieldsValue,
            });
            const {
                device: {
                    data: { page },
                },
            } = this.props;
            page.currentPage = 1;
            page.showCount = tableList;
            this.getCardData(page, fieldsValue);
        });
    };

    //导出
    exportXLSX = e => {
        const { form, dispatch } = this.props;
        const { expandForm } = this.state;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            console.log('fieldsValue', fieldsValue);
            const fieldsValues = JSON.stringify({
                ...fieldsValue,
                government: JSON.parse(sessionStorage.getItem('groupListCode')),
            });
            console.log(fieldsValues);
            window.open(
                `${'./dow.html?serverUrl='}${
                    window.configUrl.serverUrl
                }${'&fieldsValue='}${fieldsValues}${'&currentXLSX='}${
                    expandForm == '1'
                        ? 'vehicle/exportVehicle'
                        : expandForm == '2'
                        ? 'bayonet/exportBayonet'
                        : 'individualEquipment/exportIndividualEquipment'
                }`,
                '_blank',
            );
            // dispatch({
            // 	type: 'device/exportXLSX',
            // 	payload: { ...fieldsValue },
            // 	success: (e) => {
            // 		window.location.href = `${window.configUrl.serverUrl}${e.path}`
            // 		Message.success('导出成功');
            // 	}
            // })
        });
    };
    //下载模板
    downloadTemplate = e => {
        const { form, dispatch } = this.props;
        const { expandForm } = this.state;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            console.log('fieldsValue', fieldsValue);
            const fieldsValues = JSON.stringify({
                ...fieldsValue,
                government: JSON.parse(sessionStorage.getItem('groupListCode')),
            });
            console.log(fieldsValues);

            dispatch({
                type: expandForm == '2' ? 'device/bayonetXLSX' : 'device/individualXLSX',
                payload: { ...fieldsValue },
                success: e => {
                    console.log(e);
                    if (e.result.reason.code == '200') {
                        window.location.href = `${window.configUrl.serverUrl}${e.result.path}`;
                    } else {
                        return false;
                    }
                },
            });
        });
    };

    // 获取当前选中tag返回获取数据的url
    currentQueryList() {
        const { expandForm } = this.state;
        return expandForm == '0' || expandForm == '1'
            ? 'device/fetchVehicleList'
            : expandForm == '2'
            ? 'device/fetchBayonetList'
            : expandForm == '3'
            ? 'device/fetchIndividual'
            : '';
    }
    onChange = e => {
        console.log('radio checked', e.target.value);
        this.setState({
            value: e.target.value,
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
    choose = () => {};
    //车辆管理查询模块
    renderPersonForm() {
        const {
            form,
            device: { dictionary, useList },
        } = this.props;
        const { getFieldDecorator } = form;
        // 从安全中心获取管辖机构
        const userInfo = JSON.parse(sessionStorage.getItem('user'));
        const { groupList } = userInfo;
        // const { deviceManager: { policeCarList, data: { page } } } = this.props;
        const { expandForm, tagState } = this.state;

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
        this.loopUse(useList);
        return (
            <Form layout="inline" onSubmit={this.handleSubmit} {...formItemLayout}>
                <Row>
                    {/* <Col md={8} sm={24}> */}
                    <Col span={this.state.expandForm == '0' ? 6 : 8}>
                        <FormItem label={this.state.expandForm == '0' ? '警务通名称' : '车牌号码'}>
                            {getFieldDecorator('vehicle_license_plate')(
                                <Input
                                    placeholder={
                                        this.state.expandForm == '0'
                                            ? '请输入警务通名称'
                                            : '请输入车牌号码'
                                    }
                                    style={{ width: '330px' }}
                                />,
                            )}
                        </FormItem>
                    </Col>
                    {this.state.expandForm == '1' ? (
                        <Col span={8}>
                            <FormItem label="车辆品牌">
                                {getFieldDecorator('clpp')(
                                    <Input
                                        placeholder="请输入车辆品牌"
                                        style={{ width: '330px' }}
                                    />,
                                )}
                            </FormItem>
                        </Col>
                    ) : null}
                    <Col span={this.state.expandForm == '0' ? 6 : 8}>
                        <FormItem label={this.state.expandForm == '0' ? '状态' : '车辆状态'}>
                            {getFieldDecorator('vehicle_status')(
                                <Radio.Group onChange={this.onChange} style={{ width: '260px' }}>
                                    {dictionary &&
                                        dictionary.map(v => (
                                            <Radio key={v.code} value={v.code}>
                                                {v.name}
                                            </Radio>
                                        ))}
                                </Radio.Group>,
                            )}
                        </FormItem>
                    </Col>

                    <Col span={this.state.expandForm == '0' ? 6 : 8}>
                        <FormItem label="所属机构名称">
                            {getFieldDecorator('vehicle_organization_code')(
                                <TreeSelect
                                    onChange={value => this.choose(value)}
                                    treeNodeFilterProp="title"
                                    treeDefaultExpandAll
                                    placeholder="请选择"
                                    {...TreeSelectProps}
                                >
                                    {this.renderloop(useList)}
                                </TreeSelect>,
                            )}
                        </FormItem>
                    </Col>
                    <Col span={this.state.expandForm == '0' ? 6 : 8}>
                        {this.renderSearchButton()}
                    </Col>
                </Row>
            </Form>
        );
    }
    //视频卡口管理查询模块
    videoMonitoring() {
        const { form } = this.props;
        const { getFieldDecorator } = form;
        // 从安全中心获取管辖机构
        const userInfo = JSON.parse(sessionStorage.getItem('user'));
        const { groupList } = userInfo;
        // const { deviceManager: { policeCarList, data: { page } } } = this.props;
        const { expandForm, tagState } = this.state;

        // const formItemLayout = {
        // 	labelCol: { span: 16 },
        // 	wrapperCol: { span: 8 },
        // }
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
            <Form layout="inline" onSubmit={this.handleSubmit} {...formItemLayout}>
                <Row>
                    {/* <Col md={8} sm={24}> */}
                    <Col span={8}>
                        <FormItem label="卡口名称">
                            {getFieldDecorator('kkmc')(
                                <Input placeholder="请输入卡口名称" style={{ width: '330px' }} />,
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem label="卡口ID">
                            {getFieldDecorator('kkid')(
                                <Input placeholder="请输入卡口ID" style={{ width: '330px' }} />,
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem label="卡口代码">
                            {getFieldDecorator('kkdm', {
                                // initialValue: 2
                            })(<Input placeholder="请输入卡口代码" style={{ width: '330px' }} />)}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem label="卡口类型">
                            {getFieldDecorator('bayonet_type', {
                                // initialValue: 2
                            })(
                                <Select placeholder="请选择" style={{ width: '330px' }}>
                                    {bayonetList &&
                                        bayonetList.map(v => (
                                            <Option value={v.type} key={v.type}>
                                                {v.name}
                                            </Option>
                                        ))}
                                </Select>,
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>{this.renderSearchButton()}</Col>
                </Row>
            </Form>
        );
    }
    //单兵设备管理查询条件
    individualMonitoring() {
        const {
            form,
            device: { dictionary, useList },
        } = this.props;
        const { getFieldDecorator } = form;
        // 从安全中心获取管辖机构
        const userInfo = JSON.parse(sessionStorage.getItem('user'));
        const { groupList } = userInfo;
        // const { deviceManager: { policeCarList, data: { page } } } = this.props;
        const { expandForm, tagState } = this.state;

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
        this.loopUse(useList);
        return (
            <Form layout="inline" onSubmit={this.handleSubmit} {...formItemLayout}>
                <Row>
                    {/* <Col md={8} sm={24}> */}
                    <Col span={8}>
                        <FormItem label="设备名称">
                            {getFieldDecorator('equipment_name')(
                                <Input placeholder="请输入设备名称" style={{ width: '330px' }} />,
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem label="所属机构名称">
                            {getFieldDecorator('equipment_organization_code')(
                                <TreeSelect
                                    onChange={value => this.choose(value)}
                                    treeNodeFilterProp="title"
                                    treeDefaultExpandAll
                                    placeholder="请选择"
                                    //   style={{ width: "230px" }}
                                    {...TreeSelectProps}
                                >
                                    {this.renderloop(useList)}
                                </TreeSelect>,
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem label="设备类型">
                            {getFieldDecorator('equipment_type')(
                                <Select placeholder="请选择" style={{ width: '330px' }}>
                                    {individualList &&
                                        individualList.map(v => (
                                            <Option value={v.type} key={v.type}>
                                                {v.name}
                                            </Option>
                                        ))}
                                </Select>,
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>{this.renderSearchButton()}</Col>
                </Row>
            </Form>
        );
    }
    // 查询条件重置
    handleFormReset = () => {
        const {
            form,
            device: {
                data: { page },
            },
        } = this.props;
        form.resetFields();
        this.setState({
            formValues: {},
        });
        page.currentPage = 1;
        page.showCount = tableList;
        this.getCardData(page);
    };
    //导入
    handleImports = option => {
        console.log(option, 'daoru', typeof sessionStorage.getItem('groupListCode'));
        const {
            form,
            device: {
                data: { page },
            },
        } = this.props;
        this.setState({ importLoading: true });
        var _self = this;
        let formData = new FormData();
        formData.append('file', option.file);
        formData.append('government', sessionStorage.getItem('groupListCode'));

        const token = sessionStorage.getItem('userToken') || '';
        fetch(
            `${configUrl.serverUrl}${
                this.state.expandForm == '2'
                    ? '/bayonet/importBayonet'
                    : '/individualEquipment/importIndividualEquipment'
            }`,
            {
                method: 'post',
                body: formData,
                headers: {
                    Authorization: token,
                },
            },
        )
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
                        _self.getCardData(page, fieldsValue);
                    });
                } else {
                    Message.error('导入失败');
                    this.setState({ importLoading: false });
                    return false;
                }
            });
    };
    // 渲染查询条件的按钮渲染
    renderSearchButton = () => (
        // <Col offset={8} md={8} sm={24}>
        <span className={styles.submitButtons} style={{ marginTop: 5 }}>
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
                style={{ background: '#269CF4', borderColor: '#269CF4' }}
            >
                重置
            </Button>
            {authorityIsTrue(
                `${
                    this.state.expandForm == 1
                        ? 'czht_sbgl_clgl_cldc'
                        : this.state.expandForm == 2
                        ? 'czht_sbgl_kkgl_kkdc'
                        : 'czht_sbgl_dbsbgl_dbsbdc'
                }`,
            ) ? (
                <Button
                    className={styles.submitButton}
                    onClick={this.exportXLSX}
                    style={{ background: '#38B248', borderColor: '#38B248' }}
                >
                    导出
                </Button>
            ) : null}

            {(this.state.expandForm == '2' && authorityIsTrue('czht_sbgl_kkgl_kkdr')) ||
            (this.state.expandForm == '3' && authorityIsTrue('czht_sbgl_dbsbgl_dbsbdr')) ? (
                <Upload
                    showUploadList={false}
                    customRequest={this.handleImports}
                    //   disabled={this.props.loadings.imports}
                    accept=".xls,.xlsx"
                >
                    <Button type="primary" className={styles.submitButton}>
                        导入
                    </Button>
                </Upload>
            ) : null}
            {(this.state.expandForm == '2' && authorityIsTrue('czht_sbgl_kkgl_kkdr')) ||
            (this.state.expandForm == '3' && authorityIsTrue('czht_sbgl_dbsbgl_dbsbdr')) ? (
                <Button
                    className={styles.submitButton}
                    onClick={this.downloadTemplate}
                    style={{ background: '#38B248', borderColor: '#38B248' }}
                >
                    导入模板下载
                </Button>
            ) : null}
        </span>
        // </Col>
    );
    renderForm() {
        return this.state.expandForm == '2'
            ? this.videoMonitoring()
            : this.state.expandForm == '1' || this.state.expandForm == '0'
            ? this.renderPersonForm()
            : this.individualMonitoring();
        // return this.renderPersonForm();
    }
    toggleForm = files => {
        this.setState(
            {
                expandForm: files,
            },
            () => {
                // 重置搜索条件以及查询
                this.handleFormReset();
            },
        );
    };
    onShowSizeChange = () => {};
    onChangeye = currentPage => {
        console.log('Page: ', currentPage);

        const {
            dispatch,
            device: {
                data: { page },
            },
        } = this.props;
        const { formValues } = this.state;
        page.currentPage = currentPage;
        this.getCardData(page, formValues);
    };
    //删除车辆
    deleteVehicle = files => {
        const { dispatch, form } = this.props;
        let title = this.state.expandForm == '0' ? '警务通' : '车辆';
        console.log('000000', files);
        Modal.confirm({
            title: '您确认要删除该' + title + '吗？',
            // content: '您确认删除该车辆吗？',
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                dispatch({
                    type: 'device/deleteVehicle',
                    payload: {
                        vehicle_id: files,
                    },
                    success: e => {
                        if (e.result.reason.code == '200') {
                            Message.success('删除成功');
                            form.validateFields((err, fieldsValue) => {
                                if (err) return;
                                fieldsValue.vehicle_flag = this.state.expandForm == '0' ? '2' : '1';
                                this.setState({
                                    formValues: fieldsValue,
                                });
                                const {
                                    device: {
                                        data: { page },
                                    },
                                } = this.props;
                                page.currentPage = 1;
                                page.showCount = tableList;
                                this.getCardData(page, fieldsValue);
                            });
                        } else {
                            Message.error('删除失败，请稍后重试！');
                            return false;
                        }
                    },
                });
            },
        });
    };
    //删除卡口
    deleteBayonet = files => {
        const { dispatch, form } = this.props;
        console.log('000000', files);
        Modal.confirm({
            title: '您确认删除该卡口吗？',
            // content: '您确认删除该车辆吗？',
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                dispatch({
                    type: 'device/delBayonet',
                    payload: {
                        bayonet_id: files,
                    },
                    success: e => {
                        if (e.result.reason.code == '200') {
                            Message.success('删除成功');
                            form.validateFields((err, fieldsValue) => {
                                if (err) return;
                                this.setState({
                                    formValues: fieldsValue,
                                });

                                const {
                                    device: {
                                        data: { page },
                                    },
                                } = this.props;
                                page.currentPage = 1;
                                page.showCount = tableList;
                                this.getCardData(page, fieldsValue);
                            });
                        } else {
                            Message.error('删除失败，请稍后重试！');
                            return false;
                        }
                    },
                });
            },
        });
    };
    //删除单兵设备
    deleteIndividual = files => {
        const { dispatch, form } = this.props;
        console.log('000000', files);
        Modal.confirm({
            title: '您确认删除该设备吗？',
            // content: '您确认删除该车辆吗？',
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                dispatch({
                    type: 'device/delIndividual',
                    payload: {
                        equipment_id: files,
                    },
                    success: e => {
                        if (e.result.reason.code == '200') {
                            Message.success('删除成功');
                            form.validateFields((err, fieldsValue) => {
                                if (err) return;
                                this.setState({
                                    formValues: fieldsValue,
                                });

                                const {
                                    device: {
                                        data: { page },
                                    },
                                } = this.props;
                                page.currentPage = 1;
                                page.showCount = tableList;
                                this.getCardData(page, fieldsValue);
                            });
                        } else {
                            Message.error('删除失败，请稍后重试！');
                            return false;
                        }
                    },
                });
            },
        });
    };
    //车辆新建
    handleCreate = flag => {
        console.log('新建');
        const {
            dispatch,
            form,
            device: {
                data: { page },
            },
        } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            const values = {
                ...fieldsValue,
            };
            values.vehicle_flag = this.state.expandForm == '0' ? '2' : '1';
            this.setState({
                formValues: values,
                createModalVisible: !!flag,
            });

            page.currentPage = 1;
            page.showCount = tableList;

            //   this.getTableData(page, values);
            this.getCardData(page, values);
            this.queryDictionary();
            this.getUseDept();
        });
    };
    //卡口新建
    handleCreateBayonet = flag => {
        console.log('新建');
        const {
            dispatch,
            form,
            device: {
                data: { page },
            },
        } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            const values = {
                ...fieldsValue,
            };

            this.setState({
                formValues: values,
                createBayonetVisible: !!flag,
            });

            page.currentPage = 1;
            page.showCount = tableList;

            //   this.getTableData(page, values);
            this.getCardData(page, values);
            this.queryDictionary();
            this.getUseDept();
        });
    };
    //设备新建
    handleCreateIndividual = flag => {
        console.log('新建');
        const {
            dispatch,
            form,
            device: {
                data: { page },
            },
        } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            const values = {
                ...fieldsValue,
            };

            this.setState({
                formValues: values,
                createIndividualVisible: !!flag,
            });

            page.currentPage = 1;
            page.showCount = tableList;

            //   this.getTableData(page, values);
            this.getCardData(page, values);
            this.queryDictionary();
            this.getUseDept();
        });
    };

    //车辆编辑
    handleUpdate = flag => {
        console.log('编辑');
        const {
            dispatch,
            form,
            device: {
                data: { page },
            },
        } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            const values = {
                ...fieldsValue,
            };
            values.vehicle_flag = this.state.expandForm == '0' ? '2' : '1';
            this.setState({
                formValues: values,
                updateModalVisible: !!flag,
            });

            page.currentPage = 1;
            page.showCount = tableList;
            //   this.getTableData(page, values);
            this.getCardData(page, values);
            this.queryDictionary();
            this.getUseDept();
        });
    };
    //卡口编辑
    handleUpdateBayonet = flag => {
        console.log('编辑');
        const {
            dispatch,
            form,
            device: {
                data: { page },
            },
        } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            const values = {
                ...fieldsValue,
            };

            this.setState({
                formValues: values,
                updateBayonetVisible: !!flag,
            });

            page.currentPage = 1;
            page.showCount = tableList;

            //   this.getTableData(page, values);
            this.getCardData(page, values);
            this.queryDictionary();
            this.getUseDept();
        });
    };
    //设备编辑
    handleUpdateIndividual = flag => {
        console.log('编辑');
        const {
            dispatch,
            form,
            device: {
                data: { page },
            },
        } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            const values = {
                ...fieldsValue,
            };

            this.setState({
                formValues: values,
                updateIndividualVisible: !!flag,
            });

            page.currentPage = 1;
            page.showCount = tableList;

            //   this.getTableData(page, values);
            this.getCardData(page, values);
            this.queryDictionary();
            this.getUseDept();
        });
    };

    handleUpdateModalVisible = (flag, record) => {
        this.setState({
            updateModalVisible: !!flag,
            updateValues: record || {},
        });
    };
    handleCreateModalVisible = flag => {
        this.setState({
            createModalVisible: !!flag,
        });
    };
    handleUpdateBayonetVisible = (flag, record) => {
        console.log(flag, record);
        this.setState({
            updateBayonetVisible: !!flag,
            updateValues: record || {},
        });
    };
    handleCreateBayonetVisible = flag => {
        this.setState({
            createBayonetVisible: !!flag,
        });
    };
    handleUpdateIndividualVisible = (flag, record) => {
        console.log(flag, record);
        this.setState({
            updateIndividualVisible: !!flag,
            updateValues: record || {},
            isIntercom: record ? (record.equipment_type == '1' ? true : false) : false,
        });
    };
    handleCreateIndividualVisible = flag => {
        this.setState({
            createIndividualVisible: !!flag,
        });
    };
    deviceContext = id => {
        const {
            form,
            device: {
                data: { page },
            },
        } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            const formdata = {
                ...page,
                pd: {
                    ...fieldsValue,
                },
            };
            this.props.history.push(
                `./czht_sbgl/vehicle/${id}/${this.state.expandForm}/${JSON.stringify(formdata)}`,
            );
            // this.props.history.push(
            //     `./czht_zpjl/detail/${expandForm == '1'
            //         ? item.portrait_id
            //         : expandForm == '2'
            //             ? item.comparison_id
            //             : ''}/${expandForm}/${JSON.stringify(formdata)}`
            // )
        });
    };
    deviceEquipment = id => {
        const {
            form,
            device: {
                data: { page },
            },
        } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            const formdata = {
                ...page,
                pd: {
                    ...fieldsValue,
                },
            };
            this.props.history.push(
                `./czht_sbgl/inventory/${id}/${JSON.stringify(formdata)}/${'czht_sbgl'}`,
            );
        });
    };
    deviceTrajectory = id => {
        const {
            form,
            device: {
                data: { page },
            },
        } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            const formdata = {
                ...page,
                pd: {
                    ...fieldsValue,
                },
            };
            this.props.history.push(`./czht_sbgl/trajectory/${id}/${JSON.stringify(formdata)}`);
        });
    };
    render() {
        const { expandForm } = this.state;
        const {
            device: {
                data: { list, page },
                dictionary,
                useList,
            },
            loading,
        } = this.props;
        const createMethods = {
            modalVisible: this.state.createModalVisible,
            handleSubmit: this.handleCreate,
            handleModalVisible: this.handleCreateModalVisible,
            loading: this.props.loadings,
            policeUnitData: useList,
            dictionary: dictionary,
        };
        const updateMethods = {
            modalVisible: this.state.updateModalVisible,
            handleSubmit: this.handleUpdate,
            handleModalVisible: this.handleUpdateModalVisible,
            values: this.state.updateValues,
            loading: this.props.loadings,
            policeUnitData: useList,
            dictionary: dictionary,
        };
        const createBayonet = {
            modalVisible: this.state.createBayonetVisible,
            handleSubmit: this.handleCreateBayonet,
            handleModalVisible: this.handleCreateBayonetVisible,
            loading: this.props.loadings,
            policeUnitData: useList,
            dictionary: dictionary,
        };
        const updateBayonet = {
            modalVisible: this.state.updateBayonetVisible,
            handleSubmit: this.handleUpdateBayonet,
            handleModalVisible: this.handleUpdateBayonetVisible,
            values: this.state.updateValues,
            loading: this.props.loadings,
            policeUnitData: useList,
            dictionary: dictionary,
        };
        const createIndividual = {
            modalVisible: this.state.createIndividualVisible,
            handleSubmit: this.handleCreateIndividual,
            handleModalVisible: this.handleCreateIndividualVisible,
            loading: this.props.loadings,
            policeUnitData: useList,
            dictionary: dictionary,
        };
        const updateIndividual = {
            modalVisible: this.state.updateIndividualVisible,
            handleSubmit: this.handleUpdateIndividual,
            handleModalVisible: this.handleUpdateIndividualVisible,
            values: this.state.updateValues,
            loading: this.props.loadings,
            policeUnitData: useList,
            dictionary: dictionary,
            isInter: this.state.isIntercom,
        };

        const titles = [
            { title: '车辆管理', id: '1', permissions: 'czht_sbgl_clgl' },
            { title: '警务通管理', id: '0', permissions: 'czht_sbgl_clgl' },
            { title: '卡口管理', id: '2', permissions: 'czht_sbgl_kkgl' },
            { title: '单兵设备管理', id: '3', permissions: 'czht_sbgl_dbsbgl' },
        ];

        const columns = [
            {
                title: '序号',
                dataIndex: 'xh',
                ellipsis: true,
                width: 100,
            },
            {
                title: '车牌号码',
                dataIndex: 'vehicle_license_plate',
                ellipsis: true,
                // width: 150
            },
            {
                title: '车辆品牌',
                dataIndex: 'clpp',
                ellipsis: true,
                // width: 180
            },
            {
                title: '车辆状态',
                render: item => (
                    <div>
                        {dictionary.map((v, k) => {
                            // console.log(v.code, item.vehicle_status)
                            if (v.code == item.vehicle_status) {
                                return (
                                    <Tag
                                        color={
                                            v.name == '保养中'
                                                ? '#FF6666'
                                                : v.name == '修理中'
                                                ? '#FF3366'
                                                : '#00CCCB'
                                        }
                                        key={k}
                                    >
                                        {' '}
                                        {v.name}{' '}
                                    </Tag>
                                );
                            }
                        })}
                    </div>
                ),
            },
            {
                title: '所属机构名称',
                dataIndex: 'vehicle_organization_name',
                ellipsis: true,
                // width: 250
            },
            {
                title: '录入时间',
                dataIndex: 'createtime',
                ellipsis: true,
                // width: 180
            },
            {
                title: '操作',
                width: 320,
                render: record => (
                    <span>
                        <a onClick={() => this.deviceContext(record.vehicle_id)}>关联设备 </a>
                        <Divider type="vertical" />
                        <a onClick={() => this.deviceEquipment(record.pad_cid)}>装备盘点 </a>
                        <Divider type="vertical" />
                        <a onClick={() => this.deviceTrajectory(record.vehicle_id)}>轨迹 </a>
                        {authorityIsTrue('czht_sbgl_clgl_bj') ? <Divider type="vertical" /> : null}
                        {authorityIsTrue('czht_sbgl_clgl_bj') ? (
                            <a onClick={() => this.handleUpdateModalVisible(true, record)}>编辑 </a>
                        ) : null}
                        {authorityIsTrue('czht_sbgl_clgl_sc') ? <Divider type="vertical" /> : null}
                        {authorityIsTrue('czht_sbgl_clgl_sc') ? (
                            <a onClick={() => this.deleteVehicle(record.vehicle_id)}>删除</a>
                        ) : null}

                        {/* <a onClick={() => this.props.history.push(`./czht_sbgl/addCar/${record.vehicle_id}/${'edit'}`)}>编辑 </a> */}
                    </span>
                ),
            },
        ];
        const columnsJwt = [
            {
                title: '序号',
                dataIndex: 'xh',
                ellipsis: true,
                width: 100,
            },
            {
                title: '警务通名称',
                dataIndex: 'vehicle_license_plate',
                ellipsis: true,
                // width: 150
            },
            {
                title: '状态',
                render: item => (
                    <div>
                        {dictionary.map((v, k) => {
                            // console.log(v.code, item.vehicle_status)
                            if (v.code == item.vehicle_status) {
                                return (
                                    <Tag
                                        color={
                                            v.name == '保养中'
                                                ? '#FF6666'
                                                : v.name == '修理中'
                                                ? '#FF3366'
                                                : '#00CCCB'
                                        }
                                        key={k}
                                    >
                                        {' '}
                                        {v.name}{' '}
                                    </Tag>
                                );
                            }
                        })}
                    </div>
                ),
            },
            {
                title: '所属机构名称',
                dataIndex: 'vehicle_organization_name',
                ellipsis: true,
                // width: 250
            },
            {
                title: '录入时间',
                dataIndex: 'createtime',
                ellipsis: true,
                // width: 180
            },
            {
                title: '操作',
                width: 320,
                render: record => (
                    <span>
                        {authorityIsTrue('czht_sbgl_clgl_bj') ? (
                            <a onClick={() => this.handleUpdateModalVisible(true, record)}>编辑 </a>
                        ) : null}
                        {authorityIsTrue('czht_sbgl_clgl_sc') ? <Divider type="vertical" /> : null}
                        {authorityIsTrue('czht_sbgl_clgl_sc') ? (
                            <a onClick={() => this.deleteVehicle(record.vehicle_id)}>删除</a>
                        ) : null}

                        {/* <a onClick={() => this.props.history.push(`./czht_sbgl/addCar/${record.vehicle_id}/${'edit'}`)}>编辑 </a> */}
                    </span>
                ),
            },
        ];
        const videoColumns = [
            {
                title: '序号',
                dataIndex: 'xh',
                ellipsis: true,
                width: 100,
            },
            {
                title: '卡口名称',
                dataIndex: 'kkmc',
                ellipsis: true,
            },
            {
                title: '卡口经度',
                dataIndex: 'jd',
                ellipsis: true,
            },
            {
                title: '卡口纬度',
                dataIndex: 'wd',
                ellipsis: true,
            },
            {
                title: '卡口ID',
                dataIndex: 'kkid',
                ellipsis: true,
            },
            {
                title: '卡口代码',
                dataIndex: 'kkdm',
                ellipsis: true,
            },
            {
                title: '卡口类型',
                dataIndex: 'bayonet_type',
                render: item => (
                    <span>
                        {bayonetList &&
                            bayonetList.map(v => {
                                if (v.type == item) {
                                    return v.name;
                                }
                            })}
                    </span>
                ),
                ellipsis: true,
            },
            {
                title: '所属机构名称',
                dataIndex: 'gxdwmc',
                ellipsis: true,
            },
            {
                title: '操作',
                width: 250,
                render: record => (
                    <span>
                        <a onClick={() => this.deviceContext(record.bayonet_id)}>关联设备 </a>

                        {authorityIsTrue('czht_sbgl_kkgl_bj') ? <Divider type="vertical" /> : null}
                        {authorityIsTrue('czht_sbgl_kkgl_bj') ? (
                            <a onClick={() => this.handleUpdateBayonetVisible(true, record)}>
                                编辑{' '}
                            </a>
                        ) : null}
                        {authorityIsTrue('czht_sbgl_kkgl_sc') ? <Divider type="vertical" /> : null}
                        {authorityIsTrue('czht_sbgl_kkgl_sc') ? (
                            <a onClick={() => this.deleteBayonet(record.bayonet_id)}>删除</a>
                        ) : null}

                        {/* <a onClick={() => this.props.history.push(`./czht_sbgl/addCar/${record.vehicle_id}/${'edit'}`)}>编辑 </a> */}
                    </span>
                ),
            },
        ];
        const individualColumns = [
            {
                title: '序号',
                dataIndex: 'xh',
                ellipsis: true,
                width: 100,
            },
            {
                title: '设备名称',
                dataIndex: 'equipment_name',
                ellipsis: true,
            },
            {
                title: '车台号',
                ellipsis: true,
                render: record => (
                    <span>{record.equipment_message ? record.equipment_message.cth : ''}</span>
                ),
            },
            {
                title: '设备类型',
                dataIndex: 'equipment_type',
                render: item => (
                    <span>
                        {individualList &&
                            individualList.map(v => {
                                if (v.type == item) {
                                    return v.name;
                                }
                            })}
                    </span>
                ),
                ellipsis: true,
            },
            {
                title: '所属机构名称',
                dataIndex: 'equipment_organization_name',
                ellipsis: true,
            },
            {
                title: '创建时间',
                dataIndex: 'createtime',
                ellipsis: true,
            },
            {
                title: '创建人',
                dataIndex: 'createuser',
                ellipsis: true,
            },
            {
                title: '设备识别代码',
                dataIndex: 'equipment_identification_code',
                ellipsis: true,
            },
            {
                title: '更新时间',
                dataIndex: 'updatetime',
                ellipsis: true,
            },
            {
                title: '更新人',
                dataIndex: 'updateuser',
                ellipsis: true,
            },
            {
                title: '数据来源',
                dataIndex: 'source_type',
                ellipsis: true,
                render: item => <span>{item == 1 ? '系统' : '局方'}</span>,
                // width:150
            },
            {
                title: '备注',
                dataIndex: 'remark',
                ellipsis: true,
            },
            {
                title: '操作',
                width: 250,
                render: record => (
                    <span>
                        {authorityIsTrue('czht_sbgl_dbsbgl_bj') ? (
                            <a onClick={() => this.handleUpdateIndividualVisible(true, record)}>
                                编辑{' '}
                            </a>
                        ) : null}
                        {authorityIsTrue('czht_sbgl_dbsbgl_sc') ? (
                            <Divider type="vertical" />
                        ) : null}
                        {authorityIsTrue('czht_sbgl_dbsbgl_sc') ? (
                            <a onClick={() => this.deleteIndividual(record.equipment_id)}>删除</a>
                        ) : null}
                    </span>
                ),
            },
        ];

        return (
            <div>
                {expandForm != '' ? (
                    <div>
                        <div className={styles.headerInfo}>
                            {titles.map(item =>
                                authorityIsTrue(item.permissions) ? (
                                    <Button
                                        type="primary"
                                        key={item.id}
                                        size="large"
                                        className={styles.button}
                                        style={{
                                            backgroundColor: item.id == expandForm ? '' : '#333367',
                                        }}
                                        onClick={() => this.toggleForm(item.id)}
                                        loading={this.props.loading}
                                    >
                                        {item.title}
                                    </Button>
                                ) : null,
                            )}
                        </div>
                        {/* <SwitchTag {...expandForm} titles={titles} toggleForm={this.toggleForm()} /> */}
                        <div className={styles.tableListForm}>{this.renderForm()}</div>
                        <Card bordered={false} className={styles.tableListCard}>
                            <div className={styles.headTitle}>
                                <h2 className={styles.h2Color}>
                                    {' '}
                                    {expandForm == '0'
                                        ? '警务通列表'
                                        : expandForm == '1'
                                        ? '车辆列表'
                                        : expandForm == '2'
                                        ? '卡口列表'
                                        : '单兵设备列表'}
                                </h2>
                                {expandForm == '0' && authorityIsTrue('czht_sbgl_clgl_xz') ? (
                                    <Button
                                        type="primary"
                                        className={styles.addCarBtn}
                                        onClick={() => this.handleCreateModalVisible(true)}
                                    >
                                        添加警务通
                                    </Button>
                                ) : null}
                                {expandForm == '1' && authorityIsTrue('czht_sbgl_clgl_xz') ? (
                                    <Button
                                        type="primary"
                                        className={styles.addCarBtn}
                                        onClick={() => this.handleCreateModalVisible(true)}
                                    >
                                        添加车辆
                                    </Button>
                                ) : null}
                                {expandForm == '2' && authorityIsTrue('czht_sbgl_kkgl_xz') ? (
                                    <Button
                                        type="primary"
                                        className={styles.addCarBtn}
                                        onClick={() => this.handleCreateBayonetVisible(true)}
                                    >
                                        添加卡口
                                    </Button>
                                ) : null}
                                {expandForm == '3' && authorityIsTrue('czht_sbgl_dbsbgl_xz') ? (
                                    <Button
                                        type="primary"
                                        className={styles.addCarBtn}
                                        onClick={() => this.handleCreateIndividualVisible(true)}
                                    >
                                        添加单兵设备
                                    </Button>
                                ) : null}
                            </div>

                            <Table
                                columns={
                                    expandForm == '0'
                                        ? columnsJwt
                                        : expandForm == '1'
                                        ? columns
                                        : expandForm == '2'
                                        ? videoColumns
                                        : individualColumns
                                }
                                dataSource={list}
                                loading={loading || this.state.importLoading}
                                pagination={false}
                            />
                        </Card>
                        {page.totalResult ? (
                            <Row className={styles.pagination}>
                                <Pagination
                                    // showSizeChanger
                                    showQuickJumper
                                    // pageSizeOptions={['16', '24', '32']}
                                    total={page.totalResult}
                                    current={page.currentPage}
                                    pageSize={page.showCount}
                                    onChange={this.onChangeye}
                                    onShowSizeChange={this.onShowSizeChange}
                                    showTotal={(total, range) => `共${total}项`}
                                />
                            </Row>
                        ) : null}
                        <FormModal {...createMethods} expandForm={expandForm} />
                        <FormModal {...updateMethods} expandForm={expandForm} />
                        <BayonetModal {...createBayonet} />
                        <BayonetModal {...updateBayonet} />
                        <IndividualModal {...createIndividual} />
                        <IndividualModal {...updateIndividual} />
                    </div>
                ) : (
                    <div>
                        <Result status="403" title="403" subTitle="抱歉，您没有相关权限" />
                    </div>
                )}
            </div>
        );
    }
}

export default Form.create()(deviceManager);
