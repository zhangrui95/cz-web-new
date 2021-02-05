import React, { Component } from 'react';
import { Form, Input, Modal, TreeSelect, Select, Radio, Message, Table, Tag, Divider } from 'antd';
import moment from 'moment';
import { connect } from 'dva';
const FormItem = Form.Item;
const { Option } = Select;
const { TreeNode } = TreeSelect;
import { phoneRule, plateNumRule, cardNoRule, onlyNumber } from '@/utils/validator';
const formItemLayout = {
    labelCol: {
        xs: { span: 20 },
        sm: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 18 },
        sm: { span: 18 },
    },
};
const TreeSelectProps = {
    showSearch: true,
    allowClear: false,
    autoExpandParent: false,
    treeDefaultExpandAll: true,
    searchPlaceholder: '请输入',
    treeNodeFilterProp: 'title',
    dropdownStyle: { maxHeight: 400, overflow: 'auto' },
    style: {
        width: 354,
    },
};

const list = [];
@connect(({ service, loading, addCar }) => ({
    service,
    loading: loading.models.service,
    addCar,
}))
class FormModal extends Component {
    state = {
        expandedKeys: [], //所有菜单信息集合
        menuArry: [],
        fetchCategoryListArry: [],
        numListArry: {}, //菜单ID匹配下标对象
        searchValue: '',
    };
    componentWillMount() {
        const { values } = this.props;

        this.queryDictionary();
        if (values) {
            console.log(1111);
            // this.getDetail()
        }
    }
    componentDidMount() {
        this.getUseDept();
    }

    queryDictionary = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'addCar/dictionaryQuery',
            payload: { code: window.configUrl.dictionariesVehicle },
        });
    };
    getUseDept = () => {
        const { dispatch } = this.props;
        let codes = [];
        const groupList = JSON.parse(sessionStorage.getItem('user')).groupList;
        for (var i = 0; i < groupList.length; i++) {
            codes.push(groupList[i].code);
        }
        if (codes.length == groupList.length) {
            dispatch({
                type: 'addCar/getUseDept',
                payload: {
                    // department: JSON.parse(sessionStorage.getItem('user')).department,
                    groupList: codes,
                },
            });
        }
    };
    getDetail = () => {
        console.log(1111);
        const {
            dispatch,
            match: {
                params: { files, type },
            },
        } = this.props;
        dispatch({
            type: 'addCar/fetch',
            payload: { vehicle_id: files },
        });
    };

    okHandle = e => {
        const {
            form,
            handleSubmit,
            dispatch,
            expandForm,
            addCar: { dictionary, detail },
            loading,
            values,
        } = this.props;

        const { getFieldDecorator } = form;
        e.preventDefault();
        let payload = {};
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            console.log(fieldsValue);
            payload = {
                vehicle_message: {
                    clms: fieldsValue.clms,
                    clpp: fieldsValue.clpp,
                    glryCode: fieldsValue.glryCode,
                    glrylxfs: fieldsValue.glrylxfs,
                    glrysfzh: fieldsValue.glrysfzh,
                    glryxm: fieldsValue.glryxm,
                },
                vehicle_flag: expandForm == 0 ? '2' : '1',
                vehicle_license_plate: fieldsValue.vehicle_license_plate,
                vehicle_organization_code: fieldsValue.vehicle_organization_code,
                vehicle_organization_name: list.find(
                    v => fieldsValue.vehicle_organization_code == v.code,
                ).name,
                vehicle_status: fieldsValue.vehicle_status,
                vehicle_volume_type: fieldsValue.vehicle_volume_type,
            };
            if (values) {
                payload = {
                    ...payload,
                    vehicle_id: values.vehicle_id,
                };
            } else {
                payload = payload;
            }
            console.log(payload, list);

            dispatch({
                type: this.requestAddress(),
                payload: payload,
                success: e => {
                    console.log(e);

                    if (e.result.reason.code == '200') {
                        Message.success(values ? '编辑成功' : '添加成功');
                        form.setFieldsValue();
                        handleSubmit();
                    } else {
                        Message.error(values ? '编辑失败' : '添加失败');
                        return false;
                    }
                },
            });
        });
    };
    requestAddress = () => {
        const { values } = this.props;
        return values ? 'addCar/update' : 'addCar/increase';
    };
    choose = value => {
        this.props.form.setFieldsValue({ vehicle_organization_code: [] });
        // this.props.form.setFieldsValue({'police_unit_organization_name': value})
        console.log(value);
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
    validatorCar = (rule, value, callback) => {
        console.log(rule, value, callback);
        const {
            form: { getFieldValue },
            dispatch,
            addCar: { detail },
            values,
        } = this.props;
        console.log(values, getFieldValue('vehicle_license_plate'), value);
        //   if(getFieldValue('vehicle_license_plate') == values.vehicle_license_plate){
        //       console.log('没有更改',)
        //       callback()
        //   }else{

        try {
            if (values) {
                if (getFieldValue('vehicle_license_plate') == values.vehicle_license_plate) {
                    console.log('没有更改');
                    callback();
                } else {
                    console.log('更改');
                    if (getFieldValue('vehicle_license_plate') != '') {
                        console.log('更改不为空');
                        dispatch({
                            type: 'addCar/getVehicleByCarNo',
                            payload: {
                                vehicle_license_plate: getFieldValue('vehicle_license_plate'),
                            },
                            success: e => {
                                console.log(e);
                                if (e.result.reason.code == '200') {
                                    if (e.result.vehicle == null) {
                                        callback();
                                    } else {
                                        callback('车牌号码已存在');
                                    }
                                }
                            },
                        });
                    } else {
                        console.log('更改为空');
                        callback();
                    }
                }
            } else {
                console.log('更改2');
                if (getFieldValue('vehicle_license_plate') != '') {
                    console.log('更改不为空');
                    dispatch({
                        type: 'addCar/getVehicleByCarNo',
                        payload: {
                            vehicle_license_plate: getFieldValue('vehicle_license_plate'),
                        },
                        success: e => {
                            console.log(e);
                            if (e.result.reason.code == '200') {
                                if (e.result.vehicle == null) {
                                    callback();
                                } else {
                                    callback('车牌号码已存在');
                                }
                            }
                        },
                    });
                } else {
                    console.log('更改为空');
                    callback();
                }
            }
        } catch (err) {
            callback(err);
        }

        //   }
    };
    clalModalVisible = () => {
        const { handleModalVisible, form } = this.props;
        form.resetFields();
        handleModalVisible();
    };
    render() {
        const {
            values,
            modalVisible,
            loading,
            handleModalVisible,
            handleSubmit,
            form,
            policeUnitData,
            policeList,
            dictionary,
            expandForm,
        } = this.props;
        // console.log(policeUnitData)
        const { getFieldDecorator } = form;
        this.loopUse(policeUnitData);
        let title = expandForm == 0 ? '警务通' : '车辆';
        return (
            <Modal
                destroyOnClose
                confirmLoading={loading}
                title={values ? '编辑' + title : '添加' + title}
                visible={modalVisible}
                onOk={this.okHandle}
                onCancel={this.clalModalVisible}
                maskClosable={false}
                centered={true}
            >
                <FormItem {...formItemLayout} label={expandForm == 0 ? '警务通名称' : '车牌号码'}>
                    {getFieldDecorator('vehicle_license_plate', {
                        validate:
                            expandForm == 0
                                ? [
                                      {
                                          trigger: 'onBlur',
                                          rules: [
                                              {
                                                  required: true,
                                                  message: '请填写警务通名称',
                                              },
                                          ],
                                      },
                                  ]
                                : [
                                      // 在onBlur时，触发两个对象中的规则
                                      {
                                          trigger: 'onBlur',
                                          rules: [
                                              plateNumRule,
                                              {
                                                  validator: this.validatorCar,
                                              },
                                              {
                                                  required: true,
                                                  message: '请填写车牌号码',
                                              },
                                          ],
                                      },
                                  ],
                        initialValue: values ? values.vehicle_license_plate : '',
                    })(<Input placeholder="" maxLength="10" />)}
                </FormItem>
                {expandForm == 0 ? null : (
                    <FormItem {...formItemLayout} label="车辆型号">
                        {getFieldDecorator('vehicle_volume_type', {
                            initialValue: values ? values.vehicle_volume_type : '',
                        })(<Input placeholder="" maxLength="50" />)}
                    </FormItem>
                )}
                {expandForm == 0 ? null : (
                    <FormItem {...formItemLayout} label="车辆品牌">
                        {getFieldDecorator('clpp', {
                            initialValue: values ? values.clpp : '',
                        })(<Input placeholder="" maxLength="50" />)}
                    </FormItem>
                )}
                <FormItem {...formItemLayout} label="管理人姓名">
                    {getFieldDecorator('glryxm', {
                        initialValue: values ? values.glryxm : '',
                    })(<Input placeholder="" maxLength="50" />)}
                </FormItem>
                <FormItem {...formItemLayout} label="管理人联系方式">
                    {getFieldDecorator('glrylxfs', {
                        initialValue: values ? values.glrylxfs : '',
                        // rules:[
                        // 	phoneRule
                        // ],
                    })(<Input placeholder="" maxLength="11" />)}
                </FormItem>
                <FormItem {...formItemLayout} label="管理人警号">
                    {getFieldDecorator('glryCode', {
                        rules: [onlyNumber],
                        initialValue: values ? values.glryCode : '',
                    })(<Input placeholder="" maxLength="20" />)}
                </FormItem>
                <FormItem {...formItemLayout} label="管理人身份证号">
                    {getFieldDecorator('glrysfzh', {
                        rules: [cardNoRule],
                        initialValue: values ? values.glrysfzh : '',
                    })(<Input placeholder="" maxLength="18" />)}
                </FormItem>
                <FormItem {...formItemLayout} label={title + '描述'}>
                    {getFieldDecorator('clms', {
                        initialValue: values ? values.clms : '',
                    })(
                        <Input.TextArea
                            autoSize={{ minRows: 3, maxRows: 5 }}
                            placeholder=""
                            maxLength="250"
                        />,
                    )}
                </FormItem>
                <FormItem {...formItemLayout} {...formItemLayout} label={title + '状态'}>
                    {getFieldDecorator('vehicle_status', {
                        rules: [
                            {
                                required: true,
                                message: '请选择状态',
                            },
                        ],
                        initialValue: values ? values.vehicle_status : '',
                    })(
                        <Radio.Group>
                            {dictionary &&
                                dictionary.map(v => (
                                    <Radio key={v.code} value={v.code}>
                                        {v.name}
                                    </Radio>
                                ))}
                        </Radio.Group>,
                    )}
                </FormItem>
                <FormItem {...formItemLayout} {...formItemLayout} label="所属单位">
                    {getFieldDecorator('vehicle_organization_code', {
                        initialValue: values ? values.vehicle_organization_code : '',
                        rules: [
                            {
                                required: true,
                                message: `必需选择所属单位`,
                            },
                        ],
                    })(
                        <TreeSelect
                            onChange={value => this.choose(value)}
                            treeNodeFilterProp="title"
                            treeDefaultExpandAll
                            {...TreeSelectProps}
                            placeholder="请选择"
                        >
                            {this.renderloop(policeUnitData)}
                        </TreeSelect>,
                    )}
                </FormItem>
            </Modal>
        );
    }
}

export default Form.create()(FormModal);
