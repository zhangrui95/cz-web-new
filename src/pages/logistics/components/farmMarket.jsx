// 物流统计/冷链运输
// author:jhm
// date:220210114
import React, { Component, useState } from 'react';
import moment from 'moment';
import { routerRedux } from 'dva/router';
import {
    message,
    Row,
    Col,
    Switch,
    Form,
    Divider,
    List,
    Badge,
    Card,
    Menu,
    Dropdown,
    Button,
    Icon,
    Avatar,
    Modal,
    Input,
    Upload,
    Tooltip,
    Select,
    Spin,
    Message,
    Layout,
    Table,Pagination,
} from 'antd';
import { connect } from 'dva';
import Calendar from 'react-calendar';
import styles from '../index.less';
import { authorityIsTrue } from '@/utils/authority';
import { tableList,getUserInfos } from '@/utils/utils';
const { Option } = Select;
const FormItem = Form.Item;
const { Header, Footer, Sider, Content } = Layout;
@connect(({ logis, loading }) => ({
    logis,
    loading: loading.models.logis,
}))
class farmMarket extends Component {
    constructor(props) {
        super(props)
        this.state = {
            formValues:{}, // 查询条件
            isShow:props.isShow,
            jg:getUserInfos().department, // 当前账号所属的机构编码
        }
    }

    componentDidMount() {

    }
    componentWillReceiveProps(nextProps){
        if(nextProps.isShow!=this.props.isShow){
            this.props.form.resetFields()
        }
    }
    onChange = (currentPage) => {
        console.log('currentPage',currentPage)
		const {  page ,record } = this.props
		const { formValues } = this.state
		page.currentPage = currentPage
        this.props.getList(record, page, formValues)
    }
    handleFormReset = () => {

        const {  page ,record } = this.props
        const values = {
            qydz:'',
            lxdh:'',
            fzr:'',
            kkmc:'',
            wlkdlx:'',
        }
        this.props.form.resetFields()
        this.setState({
            formValues: values
        })
        this.props.getList(record, page, values)
    }
    handleSearch = (e) => {
        e.preventDefault()
        const { form, page ,record } = this.props
		form.validateFields((err, fieldsValue) => {
			if (err) return
			console.log('fieldsValue', fieldsValue)
			const values = {
                qydz:fieldsValue.dz,
                lxdh:fieldsValue.lxdh,
                fzr:fieldsValue.lxr,
                kkmc:fieldsValue.mc,
                wlkdlx:'',
			}

			this.setState({
				formValues: values
			})
			page.currentPage = 1
			this.props.getList(record,page, values)
		})
    }
    toDetail = (record) => {
        this.props.dispatch(
            routerRedux.push({
                pathname: '/index',
                state: {
                    record,
                },
            }),
        );
    }
    renderForm() {
        const { form} = this.props
		const { getFieldDecorator } = form
        const rowLayout = {md: 8, xl: 16, xxl: 24};
        const colLayout = {sm: 24, md: 12, xl: 12, xxl:8};
        const formItemLayout = {
            labelCol: {xs: {span: 24}, md: {span: 8}, xl: {span: 6}, xxl: {span: 4}},
            wrapperCol: {xs: {span: 24}, md: {span: 16}, xl: {span: 18}, xxl: {span: 20}},
        };
        return (
            <Form onSubmit={this.handleSearch}>
                <Row gutter={rowLayout} className={styles.searchForm}>
                    <Col {...colLayout}>
                        <FormItem label="名称" {...formItemLayout}>
                            {getFieldDecorator('mc', {
                                // initialValue: this.state.jjsj,
                            })(
                                <Input placeholder="请输入名称"/>,
                            )}
                        </FormItem>
                    </Col>
                    <Col {...colLayout}>
                        <FormItem label="联系电话" {...formItemLayout}>
                            {getFieldDecorator('lxdh', {
                                // initialValue: this.state.jjsj,
                            })(
                                <Input placeholder="请输入联系电话"/>,
                            )}
                        </FormItem>
                    </Col>
                    <Col {...colLayout}>
                        <FormItem label="联系人" {...formItemLayout}>
                            {getFieldDecorator('lxr', {
                                // initialValue: this.state.jjsj,
                            })(
                                <Input placeholder="请输入联系人"/>,
                            )}
                        </FormItem>
                    </Col>
                    <Col {...colLayout}>
                        <FormItem label="地址" {...formItemLayout}>
                            {getFieldDecorator('dz', {
                                // initialValue: this.state.jjsj,
                            })(
                                <Input placeholder="请输入地址"/>,
                            )}
                        </FormItem>
                    </Col>
                    <Col {...colLayout} />
                    <Col {...colLayout}>
                        <span style={{float: 'right', marginBottom: 24, marginTop: 5}}>
                            <Button
                                className={styles.submitButton}
                                onClick={this.handleFormReset}
                                style={{ background: '#269CF4', borderColor: '#269CF4', color: '#fff' }}
                            >
                                重置
                            </Button>
                            <Button
                                style={{marginLeft: 8,background:'#3470F4'}}
                                type="primary"
                                htmlType="submit"
                            >
                                搜索
                            </Button>
                        </span>
                    </Col>
                </Row>
            </Form>
        );
    }
    render() {
        const {form,page,labeltolabel,placelist,record} = this.props;
        const {jg} = this.state;
        const columns = [
			{
				title: '名称',
				dataIndex: 'kkmc',
				ellipsis: true
			},
			{
				title: '联系电话',
				dataIndex: 'lxdh',
				// render: (item) => <span>{stateAlert && stateAlert.find((v) => v.code == item).name}</span>,
				ellipsis: true
				// width:150
			},
			{
				title: '联系人',
				dataIndex: 'fzr',
				ellipsis: true
				// width:150
			},
			{
				title: '地址',
				dataIndex: 'qydz',
				ellipsis: true,
				// width: 200
			},
            {
                title: '操作',
                // width: 120,
                // filterType: authorityIsTrue('czht_cjjl_ck'),
                render: (record) => (
                    <span>
						<a style={{ color: '#fff' }} onClick={() => this.toDetail(record)}>
							查看地图位置
						</a>
					</span>
                )
            }
        ]
        return (
            <div>
                <div className={styles.content_right} style={{paddingLeft:jg&&jg.substring(4)=='00000000'?244:0}}>
                    <div className={styles.tableListForm} style={{marginTop:0}}>{this.renderForm()}</div>
                    <Card bordered={false} className={styles.tableListCard}>
                        <Table
                            columns={columns}
                            // columns={columns.filter((item) => item.filterType || item.filterType === undefined)}
                            loading={this.props.loading}
                            dataSource={placelist}
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
                                showTotal={(total, range) => `共${total}项`}
                            />
                        </Row>
                    ) : null}
                </div>
            </div>

        );
    }
}

export default Form.create()(farmMarket);



