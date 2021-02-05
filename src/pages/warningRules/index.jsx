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
	Tooltip,
	TreeSelect,
	Result,
	Divider,
    Modal
} from 'antd'
import React, { Component } from 'react'
import { connect } from 'dva'
import SwitchTag from '@/components/SwitchTag'
import styles from './index.less'
import { tableList } from '@/utils/utils'
const { RangePicker } = DatePicker
const { TreeNode } = TreeSelect
const FormItem = Form.Item
const { Option } = Select
import { cardNoRule } from '@/utils/validator'
import FormModal from './components/FormModal'
import { authorityIsTrue } from '@/utils/authority'
import moment from 'moment'
const TreeSelectProps = {
	showSearch: true,
	allowClear: false,
	autoExpandParent: false,
	treeDefaultExpandAll: true,
	searchPlaceholder: '请输入',
	treeNodeFilterProp: 'title',
	dropdownStyle: { maxHeight: 400, overflow: 'auto' },
	style: {
		width: 330
	}
}
const list = []
@connect(({ warningRules, anticipation, loading, keyPersonnel }) => ({
	warningRules,
	anticipation,
	keyPersonnel,
	loading: loading.effects['warningRules/queryLabelModelList']
}))
class warningRules extends Component {
	state = {
		updateValues: {},
		createModalVisible: false,
		updateModalVisible: false
	}
	componentDidMount() {
		this.getTableData()

		this.getUseDept()
		this.dictionariesRisk()
		this.querySysCode()
	}
	dictionariesRisk = () => {
		this.props.dispatch({
			type: 'anticipation/policeQuery',
			payload: { code: window.configUrl.dictionariesRisk }
		})
	}
	querySysCode = () => {
		this.props.dispatch({
			type: 'warningRules/querySysCode',
			payload: {}
		})
	}
	getUseDept = () => {
		const { dispatch } = this.props
		let codes = []
		const groupList = JSON.parse(sessionStorage.getItem('user')).groupList
		for (var i = 0; i < groupList.length; i++) {
			codes.push(groupList[i].code)
		}
		if (codes.length == groupList.length) {
			dispatch({
				type: 'keyPersonnel/getUseDept',
				payload: {
					// department: JSON.parse(sessionStorage.getItem('user')).department,
					groupList: codes
				}
			})
		}
	}
	// 渲染机构树
	renderloop = (data) =>
		data.map((item) => {
			if (item.childrenList && item.childrenList.length) {
				return (
					<TreeNode value={item.code} key={item.code} title={item.name}>
						{this.renderloop(item.childrenList)}
					</TreeNode>
				)
			}
			return <TreeNode key={item.code} value={item.code} title={item.name} />
		})
	loopUse = (params) => {
		for (var i = 0; i < params.length; i++) {
			//   console.log(params[i],code)
			//   if(code == params[i].code){
			list.push({
				name: params[i].name,
				code: params[i].code
			})
			//   console.log(params[i].name)
			//    return params[i].name
			//   }else{
			if (params[i].childrenList) {
				this.loopUse(params[i].childrenList)
			}
		}
		//   }}
	}
	choose = () => {}
	getTableData = (changePage) => {
		const { dispatch, warningRules: { data: { page } } } = this.props
		const pages = changePage || {
			currentPage: 1,
			showCount: tableList
		}
		const param = {
			...pages,
			pd: {}
		}
		dispatch({
			type: 'warningRules/queryLabelModelList',
			payload: param
		})
	}

	// 查询条件重置
	handleFormReset = () => {
		const { form, warningRules: { data: { page } } } = this.props
		page.currentPage = 1
		page.showCount = tableList
		this.getTableData(page)
	}

	onChange = (currentPage) => {
		const { warningRules: { data: { page } } } = this.props
		page.currentPage = currentPage
		// 查询改变页数后的数据
		this.getTableData(page)
	}

	onShowSizeChange = (current, pageSize) => {
		const { warningRules: { data: { page } } } = this.props
		page.currentPage = current
		page.showCount = pageSize
		this.getTableData(page)
	}
	handleCreateModalVisible = (flag) => {
		this.setState({
			createModalVisible: !!flag
		})
	}
	handleCreate = (flag) => {
		console.log('新建')
		const { dispatch, form, warningRules: { data: { page } } } = this.props

		this.setState({
			createModalVisible: !!flag
		})

		page.currentPage = 1
		page.showCount = tableList

		this.getTableData(page)
	}
	handleUpdate = (flag) => {
		console.log('编辑')
		const { dispatch, form, warningRules: { data: { page } } } = this.props

		this.setState({
			updateModalVisible: !!flag
		})
		page.currentPage = 1
		page.showCount = tableList

		this.getTableData(page)
	}
	handleUpdateModalVisible = (flag, record) => {
		this.setState({
			updateModalVisible: !!flag,
			updateValues: record || {}
		})
	}
	toDelete = (files) => {
		const { dispatch, form, warningRules: { data: { page } } } = this.props
		var _self = this
		console.log('000000', files)
		Modal.confirm({
			title: '您确认要删除该标签模型吗？',
			// content: '您确认删除该车辆吗？',
			okText: '确定',
			cancelText: '取消',
			onOk: () => {
				dispatch({
					type: 'warningRules/delLabelModel',
					payload: {
						id: files
					},
					success: (e) => {
						if (e.result.reason.code == '200') {
							Message.success('删除成功')

							page.currentPage = 1
							page.showCount = tableList

							this.getTableData(page)
						} else {
							Message.error('删除失败，请稍后重试！')
							return false
						}
					}
				})
			}
		})
	}
	render() {
		const { warningRules: { data: { list, page }, ruleList }, form, anticipation: { riskList } } = this.props

		const columns = [
			{
				title: '序号',
				dataIndex: 'xh',
				width: 100
			},
			{
				title: '标签名称',
				dataIndex: 'label_name',
				ellipsis: true
				// width: 120
			},
			{
				title: '标签等级',
				// width:200,
				ellipsis: true,
				render: (record) => (
					<span>
						{record.label_level_color ? (
							<Tag
								color={record.label_level_color}
								style={{ width: '5px', height: '10px', display: 'inline-block' }}
							/>
						) : null}
						{record.label_level_name}
					</span>
				)
			},
			{
				title: '标签类型',
				dataIndex: 'label_type',
				ellipsis: true,
				// width: 200,
				render: (text) => <span> {text == '0' ? '盘查标签' : text == '1' ? '自定义标签' : ''}</span>
			},
			{
				title: '标签code',
				dataIndex: 'label_code',
				ellipsis: true
				// width: 120
			},
			{
				title: '配置规则',
				dataIndex: 'is_config_rule',
				ellipsis: true,
				// width: 200,
				render: (text) => <span> {text == '0' ? '否' : text == '1' ? '是' : ''}</span>
			},
			{
				title: '预警形式',
				dataIndex: 'alarm_form_array',
				ellipsis: true,
				render: (text) => (
                    <span>
						{text &&
							text.length ?
                            text.map(x => {return x == '0' ? '研判预警' : x == '1' ? '系统预警' : x == '2' ? '联合预警' : ''}).join('、')
                            :
                            ''
						}
					</span>
				)
			},
			{
				title: '处置措施',
				dataIndex: 'take_step',
				ellipsis: true
				// width: 120
			},
			{
				title: '更新人',
				dataIndex: 'updateuser',
				ellipsis: true
				// width: 200
			},
			{
				title: '更新时间',
				dataIndex: 'updatetime',
				ellipsis: true,
				width: 220
			},
			{
				title: '操作',
				filterType: authorityIsTrue('czht_hcjl_ry_ck'),
				width: 200,
				render: (record) => (
					<span>
                        {authorityIsTrue('bf_yjgz_bqxg') ? (
							<a onClick={() => this.handleUpdateModalVisible(true, record)}>编辑</a>
						) : null}
						{authorityIsTrue('bf_yjgz_bqsc') && authorityIsTrue('bf_yjgz_bqxg') ? (
							<Divider type="vertical" />
						) : null}
						{authorityIsTrue('bf_yjgz_bqsc') ? (
							<a onClick={() => this.toDelete(record.id)}>删除</a>
						) : null}
					</span>
				)
			}
		]
		const addModel = {
			modalVisible: this.state.createModalVisible,
			handleModalVisible: this.handleCreateModalVisible,
			handleSubmit: this.handleCreate
			// policeData: useList,
		}
		const updateMethods = {
			modalVisible: this.state.updateModalVisible,
			handleSubmit: this.handleUpdate,
			handleModalVisible: this.handleUpdateModalVisible,
			values: this.state.updateValues
			// policeData: useList,
		}
		return (
			<div>
				<div>
					<Card bordered={false} className={styles.tableListCard}>
						<div className={styles.headTitle}>
							<h2 className={styles.h2Color}>标签模型列表</h2>
							{authorityIsTrue('bf_yjgz_bqxj') ? (
								<Button
									type="primary"
									className={styles.addCarBtn}
									onClick={() => this.handleCreateModalVisible(true)}
								>
									添加标签
								</Button>
							) : null}
						</div>

						<Table
							// columns={expandForm == '1' ? columns : columns_sechend}
							columns={columns.filter((item) => item.filterType || item.filterType === undefined)}
							loading={this.props.loading}
							dataSource={list}
							// showSizeChanger
							size="default"
							pagination={false}
							// scroll={{ y: 290 }}
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
				</div>
				{this.state.createModalVisible ? <FormModal {...addModel} /> : null}
				{this.state.updateModalVisible ? <FormModal {...updateMethods} /> : null}
			</div>
		)
	}
}

export default Form.create()(warningRules)
