import React, { Component } from 'react'
import moment from 'moment'
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
	TreeSelect
} from 'antd'
import { connect } from 'dva'
import ol from 'openlayers'
import Calendar from 'react-calendar'
import { tableList } from '@/utils/utils'
import styles from './index.less'
const { Option } = Select
const { configUrl } = window
const { RangePicker } = DatePicker
const FormItem = Form.Item
const { Search } = Input
const { TreeNode } = TreeSelect
import { authorityIsTrue } from '@/utils/authority'
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
const stateAlert = [
	{
		code: '01',
		name: '未签收'
	},
	{
		code: '02',
		name: '未到场'
	},
	{
		code: '03',
		name: '未结束'
	},
	{
		code: '04',
		name: '未反馈'
	},
	{
		code: '05',
		name: '已反馈'
	}
]
@connect(({ alarming, loading, instruction, getVehicle }) => ({
	alarming,
	instruction,
	getVehicle,
	loading: loading.effects['alarming/getPoliceAlarmList'] && loading.effects['instruction/getUseDept']
}))
class Alarming extends Component {
	constructor(props) {
		super(props)
	}
	state = {
		formValues: {}
	}
	componentDidMount() {
		var _self = this
		if (this.props.location.state != undefined) {
			const states = this.props.location.state
			const pages = JSON.parse(states.pages)
			//  console.log(pages)
			this.setState(
				{
					formValues: pages.pd
				},
				() => {
					if (pages.pd.startTime != null) {
						_self.props.form.setFieldsValue({
							...pages.pd,
							range_picker: [
								moment(pages.pd.startTime, 'YYYY-MM-DD HH:mm:ss'),
								moment(pages.pd.endTime, 'YYYY-MM-DD HH:mm:ss')
							]
						})
						_self.getTableData(pages, {
							...pages.pd,
							range_picker: [
								moment(pages.pd.startTime, 'YYYY-MM-DD HH:mm:ss'),
								moment(pages.pd.endTime, 'YYYY-MM-DD HH:mm:ss')
							]
						})
					} else {
						_self.props.form.setFieldsValue({
							...pages.pd
						})
						_self.getTableData(pages, {
							...pages.pd
						})
					}
				}
			)
		} else {
			//     // 第一次访问，获取默认选中  人脸抓拍记录
			this.getTableData()
		}
		this.getUseDept()
		this.getPoliceCarData()
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
				type: 'instruction/getUseDept',
				payload: {
					// department: JSON.parse(sessionStorage.getItem('user')).department,
					groupList: codes
				}
			})
		}
	}
	getTableData = (changePage, pd) => {
		const { dispatch, alarming: { data: { page } } } = this.props
		const pages = changePage || {
			currentPage: 1,
			showCount: tableList
		}

		const pds = pd || {}

		const param = {
			...pages,
			pd: { ...pds }
		}
		console.log(param)
		dispatch({
			type: 'alarming/getPoliceAlarmList',
			payload: param
		})
	}

	toggleForm = (k) => {
		const { expandForm } = this.state

		this.setState(
			{
				expandForm: k
			},
			() => {
				// 重置搜索条件以及查询
				this.handleFormReset()
			}
		)
	}

	// 查询条件重置
	handleFormReset = () => {
		const { form, alarming: { data: { page } } } = this.props
		form.resetFields()
		this.setState({
			formValues: {}
		})
		page.currentPage = 1
		page.showCount = tableList
		this.getTableData(page)
		this.getPoliceCarData()
	}

	onChange = (currentPage) => {
		const { alarming: { data: { page } } } = this.props
		const { formValues } = this.state
		page.currentPage = currentPage
		// 查询改变页数后的数据
		this.getTableData(page, formValues)
	}
	// 根据组织机构获取警车，code不存在获取全部警车数据
	getPoliceCarData = (code) => {
		this.props.dispatch({
			type: 'getVehicle/fetchPoliceCarList',
			payload: {
				vehicle_organization_code: code || null
			}
		})
	}
	onShowSizeChange = (current, pageSize) => {
		const { alarming: { data: { page } } } = this.props
		const { formValues } = this.state
		page.currentPage = current
		page.showCount = pageSize
		this.getTableData(page, formValues)
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
	handleSubmit = (e) => {
		e.preventDefault()
		const { form } = this.props

		form.validateFields((err, fieldsValue) => {
			if (err) return
			console.log('fieldsValue', fieldsValue)
			const rangeTimeValue = fieldsValue.selectTime
			const rangeValue = fieldsValue['range_picker']
			const values = {
				...fieldsValue,
				startTime: rangeValue ? (rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss') : null) : null,
				endTime: rangeValue ? (rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss') : null) : null
			}

			this.setState({
				formValues: values
			})

			const { alarming: { data: { page } } } = this.props
			page.currentPage = 1
			page.showCount = tableList
			this.getTableData(page, values)
		})
	}

	renderPersonForm() {
		const { form, getVehicle: { policeCarList }, instruction: { useList } } = this.props
		const { getFieldDecorator } = form
		const formItemLayout = {
			labelCol: {
				xs: { span: 24 },
				sm: { span: 8 }
			},
			wrapperCol: {
				xs: { span: 24 },
				sm: { span: 16 }
			}
		}

		return (
			<Form layout="inline" {...formItemLayout} onSubmit={this.handleSubmit}>
				<Row>
					{/* 警情列表展示，可根据所属机构、警情状态、接警车辆、报警时间等条件搜索搜索 */}
					<Col span={8} className={styles.datePicker}>
						<FormItem label="选择日期">
							{getFieldDecorator('range_picker')(
								<RangePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '330px' }} />
							)}
						</FormItem>
					</Col>
					<Col span={8}>
						<FormItem label="接警机构">
							{getFieldDecorator('gxdwdm')(
								<TreeSelect
									onChange={(value) => this.getPoliceCarData(value)}
									treeNodeFilterProp="title"
									treeDefaultExpandAll
									placeholder="请选择"
									//   style={{ width: "230px" }}
									{...TreeSelectProps}
								>
									{this.renderloop(useList)}
								</TreeSelect>
							)}
						</FormItem>
					</Col>
					<Col span={8}>
						<FormItem label="接警车辆">
							{getFieldDecorator('vehicle_id')(
								<Select
									showSearch
									placeholder="请选择"
									optionFilterProp="children"
									style={{ width: '330px' }}
								>
									{policeCarList.length &&
										policeCarList.map((item, k) => (
											<Option value={item.vehicle_id} key={item.carNo}>
												{item.carNo}
											</Option>
										))}
								</Select>
							)}
						</FormItem>
					</Col>
					<Col span={8}>
						<FormItem label="警情状态">
							{getFieldDecorator('jjdzt')(
								<Select placeholder="请选择" style={{ width: '330px' }}>
									{stateAlert.length &&
										stateAlert.map((item, k) => (
											<Option value={item.code} key={item.code}>
												{item.name}
											</Option>
										))}
								</Select>
							)}
						</FormItem>
					</Col>
					<Col span={8}>
						<FormItem label="报警内容">
							{getFieldDecorator('bjnr')(<Input placeholder="请输入报警内容" style={{ width: '330px' }} />)}
						</FormItem>
					</Col>

					<Col span={8}> {this.renderSearchButton()} </Col>
					{/* {this.renderSearchButton()} */}
				</Row>
			</Form>
		)
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
			</span>
		</Col>
	)

	renderForm() {
		return this.renderPersonForm()
	}
	toDetail = (files) => {
		console.log(files, '===')
		const { form, alarming: { data: { list, page } } } = this.props
		form.validateFields((err, fieldsValue) => {
			if (err) return
			// console.log('fieldsValue', fieldsValue, expandForm)
			const rangeValue = fieldsValue['range_picker']
			const formdata = {
				...page,
				pd: {
					...fieldsValue,
					startTime: rangeValue ? (rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss') : null) : null,
					endTime: rangeValue ? (rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss') : null) : null
				}
			}
			this.props.history.push(`./czht_cjjl/detail/${files}/${JSON.stringify(formdata)}`)
		})
	}
	chooseCode = (value) => {
		//  this.props.form.setFieldsValue({ shifts_organization_code: [] });
		// this.props.form.setFieldsValue({'police_unit_organization_name': value})
		console.log(value)
		const { dispatch } = this.props
		this.setState({ isCar: true })
		dispatch({
			type: 'instruction/getVehicleList',
			payload: { vehicle_organization_code: value },
			success: (e) => {
				console.log('回调', e)

				if (e.result.reason.code == '200') {
					if (e.result.list && !e.result.list.length) {
                        Message.destroy()
						Message.error('当前接警机构无车辆！')
					}
				} else {
					return false
				}
			}
		})
	}

	render() {
		const { alarming: { data: { list, page }, instruction: useList }, form } = this.props
		const columns = [
			{
				title: '序号',
				dataIndex: 'xh',
				ellipsis: true
			},
			{
				title: '警情状态',
				dataIndex: 'jjdzt',
				render: (item) => <span>{stateAlert && stateAlert.find((v) => v.code == item).name}</span>,
				ellipsis: true
				// width:150
			},
			{
				title: '警情编号',
				dataIndex: 'jqbh',
				ellipsis: true
				// width:150
			},
			{
				title: '报案时间',
				dataIndex: 'bjsj',
				ellipsis: true,
				width: 200
			},
			{
				title: '警情地点',
				dataIndex: 'afdd',
				ellipsis: true
				// width:150
			},
			{
				title: '报警人姓名',
				dataIndex: 'bjrxm',
				ellipsis: true
				// width:150
			},
			{
				title: '报警人联系方式',
				dataIndex: 'lxdh',
				ellipsis: true
				// width:150
			},
			{
				title: '警情类别',
				dataIndex: 'bjlbmc',
				ellipsis: true,
				render: (item, record) => (
					<span>
						{`${item}${record.bjlxmc == null ? '' : '-'}${record.bjlxmc == null
							? ''
							: record.bjlxmc}${record.bjxlmc == null ? '' : '-'}${record.bjxlmc == null
							? ''
							: record.bjxlmc}`}
					</span>
				)
				// width:150
			},
			{
				title: '接警机构',
				dataIndex: 'cjdwmc',
				ellipsis: true
				// width:150
			},
			{
				title: '报警内容',
				dataIndex: 'bjnr',
				ellipsis: true
				// width:150
			},
			{
				title: '警情坐标',
				dataIndex: 'lat',
				render: (item, record) => <span>{`${item}${','}${record.lng}`}</span>,
				ellipsis: true
				// width:150
			},
			{
				title: '操作',
				width: 120,
				filterType: authorityIsTrue('czht_cjjl_ck'),
				render: (record) => (
					<span>
						<a style={{ color: '#fff' }} onClick={() => this.toDetail(record.police_alarm_id)}>
							查看
						</a>
					</span>
				)
			}
		]

		return (
			<div className={styles.alarming}>
				<div className={styles.tableListForm}>{this.renderForm()}</div>
				<Card bordered={false} className={styles.tableListCard}>
					<Table
						// columns={columns}
						columns={columns.filter((item) => item.filterType || item.filterType === undefined)}
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
			</div>
		)
	}
}

export default Form.create()(Alarming)
