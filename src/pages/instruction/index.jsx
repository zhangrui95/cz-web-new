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
} from 'antd';
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './style.less';
import { tableList } from '@/utils/utils';
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
import { cardNoRule } from '@/utils/validator';
import FormModal from './components/FormModal';
import { authorityIsTrue } from '@/utils/authority';

@connect(({ instruction, loading }) => ({
    instruction,
    loading: loading.effects['instruction/fetchNoticeList'],
}))
class instruction extends Component {
    state = {
        formValues: {},
        tagState: 0,
        createModalVisible: false,
        updateModalVisible: false,
        updateValues: {},
        isCar: false,
    };

    componentDidMount() {
        console.log(window.location);

        var _self = this;
        //   if(this.props.location.state != undefined){
        //       const states = this.props.location.state
        //      const pages = JSON.parse(states.pages)
        //       this.setState({
        //           formValues: pages.pd
        //       },() => {
        //           _self.props.form.setFieldsValue({
        //               ...pages.pd
        //           })
        //           _self.getTableData(pages,pages.pd)
        //             })

        //   }else{
        //     // 第一次访问，获取默认选中  人脸抓拍记录
        this.getTableData();
        this.getUseDept();
        //   }
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
                type: 'instruction/getUseDept',
                payload: {
                    // department: JSON.parse(sessionStorage.getItem('user')).department,
                    groupList: codes,
                },
            });
        }
    };
    getTableData = (changePage, pd) => {
        const {
            dispatch,
            instruction: {
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
        console.log(param);
        dispatch({
            type: 'instruction/fetchNoticeList',
            payload: param,
        });
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
            },
        );
    };

    // 查询条件重置
    handleFormReset = () => {
        const {
            form,
            instruction: {
                data: { page },
            },
        } = this.props;
        form.resetFields();
        this.setState({
            formValues: {},
        });
        page.currentPage = 1;
        page.showCount = tableList;
        this.getTableData(page);
    };

    onChange = currentPage => {
        const {
            instruction: {
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
            instruction: {
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
            const rangeTimeValue = fieldsValue.selectTime;
            const rangeValue = fieldsValue['range_picker'];
            const values = {
                ...fieldsValue,
                startTime: rangeValue
                    ? rangeValue[0]
                        ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss')
                        : null
                    : null,
                endTime: rangeValue
                    ? rangeValue[1]
                        ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss')
                        : null
                    : null,
            };

            this.setState({
                formValues: values,
            });

            const {
                instruction: {
                    data: { page },
                },
            } = this.props;
            page.currentPage = 1;
            page.showCount = tableList;
            this.getTableData(page, values);
        });
    };

    renderPersonForm() {
        const { form } = this.props;
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
                    <Col span={8} className={styles.datePicker}>
                        <FormItem label="发布日期">
                            {getFieldDecorator('range_picker')(
                                <RangePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    style={{ width: '330px' }}
                                />,
                            )}
                        </FormItem>
                    </Col>

                    <Col span={8}>
                        <FormItem label="指令通知标题">
                            {getFieldDecorator('bt')(
                                <Input
                                    placeholder="请输入指令通知标题"
                                    style={{ width: '330px' }}
                                />,
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem label="指令通知内容">
                            {getFieldDecorator('nr')(
                                <Input
                                    placeholder="请输入指令通知内容"
                                    style={{ width: '330px' }}
                                />,
                            )}
                        </FormItem>
                    </Col>

                    <Col span={8}> {this.renderSearchButton()} </Col>
                    {/* {this.renderSearchButton()} */}
                </Row>
            </Form>
        );
    }

    // 渲染查询条件的按钮渲染
    renderSearchButton = () => (
        <Col offset={8} md={8} sm={24}>
            <span className={styles.submitButtons}>
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
                {authorityIsTrue('czht_xfzl_xz') ? (
                    <Button
                        className={styles.submitButton}
                        style={{ background: '#38B248', borderColor: '#38B248', color: '#fff' }}
                        onClick={() => this.handleCreateModalVisible(true)}
                    >
                        添加
                    </Button>
                ) : null}
            </span>
        </Col>
    );

    renderForm() {
        return this.renderPersonForm();
    }
    handleUpdateModalVisible = (flag, record) => {
        this.setState({
            updateModalVisible: !!flag,
            updateValues: record || {},
        });
        if (flag) {
            this.chooseCode(record.fsdwbm);
        }
    };
    chooseCode = (value, flag) => {
        //  this.props.form.setFieldsValue({ shifts_organization_code: [] });
        // this.props.form.setFieldsValue({'police_unit_organization_name': value})
        console.log(value);
        const { dispatch } = this.props;
        this.setState({ isCar: true });
        dispatch({
            type: 'instruction/getVehicleList',
            payload: { vehicle_organization_code: value, vehicle_flag: flag ? flag : '2' },
            success: e => {
                if (e.result.reason.code == '200') {
                    if (e.result.list && !e.result.list.length) {
                        Message.error('当前单位无设备！');
                    }
                } else {
                    return false;
                }
            },
        });
    };
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
            const rangeValue = fieldsValue['range_picker'];
            const values = {
                ...fieldsValue,
                startTime: rangeValue
                    ? rangeValue[0]
                        ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss')
                        : null
                    : null,
                endTime: rangeValue
                    ? rangeValue[1]
                        ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss')
                        : null
                    : null,
            };

            this.setState({
                formValues: values,
                createModalVisible: !!flag,
            });

            const {
                instruction: {
                    data: { page },
                },
            } = this.props;
            page.currentPage = 1;
            page.showCount = tableList;

            this.getTableData(page, values);
        });
    };
    //删除
    delPoliceNotice = files => {
        const { dispatch, form } = this.props;
        var _self = this;
        Modal.confirm({
            title: '您确认删除该条指令通知吗？',
            // content: '您确认删除该车辆吗？',
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                dispatch({
                    type: 'instruction/delPoliceNotice',
                    payload: {
                        notice_id: files,
                    },
                    success: e => {
                        if (e.result.reason.code == '200') {
                            Message.success('删除成功');

                            form.validateFields((err, fieldsValue) => {
                                if (err) return;
                                const rangeValue = fieldsValue['range_picker'];
                                const values = {
                                    ...fieldsValue,
                                    startTime: rangeValue
                                        ? rangeValue[0]
                                            ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss')
                                            : null
                                        : null,
                                    endTime: rangeValue
                                        ? rangeValue[1]
                                            ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss')
                                            : null
                                        : null,
                                };

                                this.setState({
                                    formValues: values,
                                });

                                const {
                                    instruction: {
                                        data: { page },
                                    },
                                } = this.props;
                                page.currentPage = 1;
                                page.showCount = tableList;

                                this.getTableData(page, values);
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
    handleUpdate = flag => {
        console.log('编辑');
        const { dispatch, form } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            const rangeValue = fieldsValue['range_picker'];
            const values = {
                ...fieldsValue,
                startTime: rangeValue
                    ? rangeValue[0]
                        ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss')
                        : null
                    : null,
                endTime: rangeValue
                    ? rangeValue[1]
                        ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss')
                        : null
                    : null,
            };

            this.setState({
                formValues: values,
                updateModalVisible: !!flag,
            });

            const {
                instruction: {
                    data: { page },
                },
            } = this.props;
            page.currentPage = 1;
            page.showCount = tableList;

            this.getTableData(page, values);
        });
    };
    renderVale = values => {
        let brr = [];
        if (values && values.attachment) {
            for (let index = 0; index < values.attachment.length; index++) {
                const element = values.attachment[index];
                brr.push({
                    uid: index + 1,
                    name: 'image.png',
                    status: 'done',
                    url: element,
                });
            }
            // this.setState({fileList:brr})
        }
        return brr;
    };
    videoVale = values => {
        let brr = [];
        if (values && values.video_message) {
            for (let index = 0; index < values.video_message.length; index++) {
                const element = values.video_message[index];
                brr.push({
                    uid: index + 1,
                    name: '视频' + (Number(index) + 1),
                    status: 'done',
                    url: element.path,
                    imgPath: element.imgPath,
                });
            }
            // this.setState({fileList:brr})
        }
        return brr;
    };
    audioVale = values => {
        let brr = [];
        if (values && values.audio_message) {
            for (let index = 0; index < values.audio_message.length; index++) {
                const element = values.audio_message[index];
                brr.push({
                    uid: index + 1,
                    name: '音频' + (Number(index) + 1),
                    status: 'done',
                    url: element.path,
                    playTime: element.playTime,
                });
            }
            // this.setState({fileList:brr})
        }
        return brr;
    };
    render() {
        const {
            instruction: {
                data: { list, page },
                useList,
            },
            form,
        } = this.props;
        const columns = [
            {
                title: '序号',
                dataIndex: 'xh',
                width: 100,
            },
            {
                title: '指令通知标题',
                dataIndex: 'bt',
                ellipsis: true,
                // width:150
            },
            {
                title: '指令通知内容',
                dataIndex: 'nr',
                ellipsis: true,
                // width:150
            },
            {
                title: '发送对象',
                dataIndex: 'fsdwmc',
                ellipsis: true,
                // width:100
            },
            {
                title: '发布人',
                dataIndex: 'fbrxm',
                ellipsis: true,
                // width:100
            },
            {
                title: '发布单位',
                dataIndex: 'fbdwmc',
                ellipsis: true,
                // width:150
            },
            {
                title: '发布时间',
                dataIndex: 'fbsj',
                ellipsis: true,
                // width:150
            },
            //    {
            //     title: '已阅人数',
            //     dataIndex: 'isread',
            //   },

            {
                title: '操作',
                width: 120,
                render: record => (
                    <span>
                        {authorityIsTrue('czht_xfzl_bj') ? (
                            <a
                                style={{ color: '#fff' }}
                                onClick={() => this.handleUpdateModalVisible(true, record)}
                            >
                                编辑
                            </a>
                        ) : null}
                        {authorityIsTrue('czht_xfzl_bj') ? <Divider type="vertical" /> : null}
                        {authorityIsTrue('czht_xfzl_sc') ? (
                            <a
                                style={{ color: '#fff' }}
                                onClick={() => this.delPoliceNotice(record.notice_id)}
                            >
                                删除
                            </a>
                        ) : null}
                    </span>
                ),
            },
        ];

        const createMethods = {
            modalVisible: this.state.createModalVisible,
            handleSubmit: this.handleCreate,
            handleModalVisible: this.handleCreateModalVisible,
            //   loading: this.props.loadings,
            policeUnitData: useList,
            chooseCode: this.chooseCode,
            isCar: this.state.isCar,
        };
        const updateMethods = {
            modalVisible: this.state.updateModalVisible,
            handleSubmit: this.handleUpdate,
            handleModalVisible: this.handleUpdateModalVisible,
            values: this.state.updateValues,
            renderVale: this.renderVale(this.state.updateValues),
            audioVale: this.audioVale(this.state.updateValues),
            videoVale: this.videoVale(this.state.updateValues),
            //   loading: this.props.loadings,
            policeUnitData: useList,
            chooseCode: this.chooseCode,
            isCar: this.state.isCar,
        };
        return (
            <div>
                <div className={styles.tableListForm}>{this.renderForm()}</div>
                <Card bordered={false} className={styles.tableListCard}>
                    <Table
                        columns={columns}
                        loading={this.props.loading}
                        dataSource={list}
                        // showSizeChanger
                        size="default"
                        pagination={false}
                        // scroll={{ y: 370 }}
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
                            onChange={this.onChange}
                            onShowSizeChange={this.onShowSizeChange}
                            showTotal={(total, range) => `共${total}项`}
                        />
                    </Row>
                ) : null}
                {this.state.createModalVisible ? <FormModal {...createMethods} /> : null}
                {this.state.updateModalVisible ? <FormModal {...updateMethods} /> : null}
            </div>
        );
    }
}

export default Form.create()(instruction);
