import {
	Button,
	Card,
	Col,
	DatePicker,
	TreeSelect,
	Form,
	Input,
	Row,
	Select,
	Modal,
	Message,
	List,
	Pagination,
	Radio,
	Table,
	Tag,
	Divider
} from 'antd'
import React, { Component } from 'react'
import { connect } from 'dva'
import styles from './../index.less'
const FormItem = Form.Item
const { Option } = Select
const { RangePicker } = DatePicker
const { TreeNode } = TreeSelect
import { tableList } from '@/utils/utils'
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
@connect(({ scouts, loading }) => ({
	scouts,
	loading: loading.models.scouts
}))
class verification extends React.Component {
	state = {
		muneKey: '0',
		timeType: 'year',
		formValues: {}
	}
	componentDidMount() {
		this.getUseDept()
		this.getTableData()
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
				type: 'scouts/getUseDept',
				payload: {
					groupList: codes
				}
			})
		}
	}
	getTableData = (changePage, pd) => {
		console.log(this.props)
		const { dispatch, scouts: { verification: { page } } } = this.props
		console.log('changePage', changePage, 'pd', pd)
		const pages = changePage || {
			currentPage: 1,
			showCount: tableList
		}

		const pds = pd || {
			type: this.state.timeType
		}
		const param = {
			...pages,
			pd: { ...pds }
		}
		dispatch({
			type: this.getInterface(),
			payload: param
		})
	}
	getInterface = () => {
		const { muneKey } = this.state
		return muneKey == '0' ? 'scouts/getOrgHCStatisticsList' : 'scouts/getDateHCStatisticsList'
	}
	titleChange = (files) => {
		this.setState({ muneKey: files }, () => {
			// 重置搜索条件以及查询
			this.handleFormReset()
		})
	}

	handleSubmit = (e) => {
		const { dispatch, form } = this.props
		e.preventDefault()
		form.validateFields((err, fieldsValue) => {
			if (err) return
			const rangeValue = fieldsValue['range_picker']
			let values = {}
			if (fieldsValue.type == 'day') {
				values = {
					...fieldsValue,
					startDate: rangeValue ? (rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD') : null) : null,
					endDate: rangeValue ? (rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD') : null) : null
				}
			} else {
				values = fieldsValue
			}

			this.setState({
				formValues: values
			})
			console.log(values, 'values')
			const { scouts: { verification: { page } } } = this.props
			page.currentPage = 1
			page.showCount = tableList
			this.getTableData(page, values)
		})
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
	handleChange = (value) => {
		console.log(`selected ${value}`)
		this.setState({
			timeType: value
		})
	}

	renderForm = () => {
		const { form, scouts: { useList } } = this.props
		const { timeType } = this.state
		const { getFieldDecorator } = form

		const formItemLayout = {
			labelCol: { span: 16 },
			wrapperCol: { span: 8 }
		}
		this.loopUse(useList)
		return (
			<Form layout="inline" onSubmit={this.handleSubmit} {...formItemLayout}>
				<Row>
					<Col span={8}>
						<FormItem label="机构名称">
							{getFieldDecorator('jybmbm')(
								<TreeSelect
									// onChange={(value) => this.choose(value)}
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
						<FormItem label="时间类型">
							{getFieldDecorator('type', {
								initialValue: timeType
							})(
								<Select
									placeholder="请选择"
									style={{
										width: '330px'
									}}
									onChange={this.handleChange}
								>
									<Option value="year">本年</Option>
									<Option value="month">本月</Option>
									<Option value="week">本周</Option>
									<Option value="day">日期</Option>
								</Select>
							)}
						</FormItem>
					</Col>
					{timeType == 'day' ? (
						<Col span={8} className={styles.datePicker}>
							<FormItem label="选择日期">
								{getFieldDecorator('range_picker')(
									<RangePicker format="YYYY-MM-DD" style={{ width: '330px' }} />
								)}
							</FormItem>
						</Col>
					) : null}

					<Col span={8}>{this.renderSearchButton()}</Col>
				</Row>
			</Form>
		)
	}
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
			<Button
				className={styles.submitButton}
				onClick={this.exportXLSX}
				style={{ background: '#38B248', borderColor: '#38B248', color: '#fff' }}
			>
				导出
			</Button>
		</span>
		// </Col>
	)
    //导出
	exportXLSX = (e) => {
		const { form, dispatch } = this.props
		const { muneKey } = this.state
		form.validateFields((err, fieldsValue) => {
			if (err) return
			console.log('fieldsValue', fieldsValue, muneKey)
			const rangeValue = fieldsValue['range_picker']

			let fieldsValues = {}
			if (fieldsValue.type == 'day') {
				fieldsValues = JSON.stringify({
					...fieldsValue,
					startDate: rangeValue ? (rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD') : null) : null,
					endDate: rangeValue ? (rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD') : null) : null,
					government: JSON.parse(sessionStorage.getItem('groupListCode'))
				})
			} else {
				fieldsValues = JSON.stringify({
					...fieldsValue,
					government: JSON.parse(sessionStorage.getItem('groupListCode'))
				})
			}

			console.log(fieldsValues)
			window.open(
				`${'./dow.html?serverUrl='}${window.configUrl
					.serverUrl}${'&fieldsValue='}${fieldsValues}${'&currentXLSX='}${this.currentXLSX()}`,
				'_blank'
			)
		})
	}
	// 获取当前选中tag返回获取数据的url
	currentXLSX() {
		const { muneKey } = this.state
		return muneKey == '0' ? 'statistics/exportOrgHCStatisticsList' : 'statistics/exportDateHCStatisticsList'
	}
	onChange = (currentPage) => {
		const { scouts: { snap: { page } } } = this.props
		const { formValues } = this.state
		const rangeValue = formValues['range_picker']
		let values = {}
		if (formValues.type == 'day') {
			values = {
				...formValues,
				startDate: rangeValue ? (rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD') : null) : null,
				endDate: rangeValue ? (rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD') : null) : null
			}
		} else {
			values = formValues
		}
		page.currentPage = currentPage
		// 查询改变页数后的数据
		this.getTableData(page, values)
	}

	onShowSizeChange = (current, pageSize) => {
		const { scouts: { snap: { page } } } = this.props
		const { formValues } = this.state
		const rangeValue = formValues['range_picker']
		let values = {}
		if (formValues.type == 'day') {
			values = {
				...formValues,
				startDate: rangeValue ? (rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD') : null) : null,
				endDate: rangeValue ? (rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD') : null) : null
			}
		} else {
			values = formValues
		}
		page.currentPage = current
		page.showCount = pageSize
		this.getTableData(page, formValues)
	}

	// 查询条件重置
	handleFormReset = () => {
		const { form, scouts: { verification: { page } } } = this.props
		form.resetFields()
		this.setState(
			{
				formValues: {},
				timeType: 'year'
			},
			() => {
				page.currentPage = 1
				page.showCount = tableList
				this.getTableData(page)
			}
		)
	}
	render() {
		const { scouts: { verification: { list, page } } } = this.props
		const { muneKey } = this.state
		const munes = [
			{
				key: '0',
				name: '机构',
                permissions: 'czht_xfzgtj_hctj_jg'
			},
			{
				key: '1',
				name: '时间',
                permissions: 'czht_xfzgtj_hctj_sj'
			}
		]
		const columns = [
			{
				title: '序号',
				dataIndex: 'xh',
				width: 100
			},
			{
				title: muneKey == '0' ? '机构名称' : '数据日期',
				dataIndex: muneKey == '0' ? 'jybmmc' : 'sjrq',
				ellipsis: true
				// width: 120
			},
			{
				title: '核查次数',
				dataIndex: 'hccs',
				ellipsis: true
			},
			{
				title: '异常次数',
				dataIndex: 'yccs',
				ellipsis: true
			},
			{
				title: '异常比例',
				dataIndex: 'ycbl',
				ellipsis: true
			},
			{
				title: '人员核查异常次数',
				dataIndex: 'ryhcyccs',
				ellipsis: true
			},
			{
				title: '人员核查次数',
				dataIndex: 'ryhccs',
				ellipsis: true
			},
			{
				title: '人员异常比例',
				dataIndex: 'ryycbl',
				ellipsis: true
			},
			{
				title: '车辆核查异常次数',
				dataIndex: 'clhcyccs'
			},
			{
				title: '车辆核查次数',
				dataIndex: 'clhccs'
			},
			{
				title: '车辆异常比例',
				dataIndex: 'clycbl'
			}
		]
		return (
			<div className={styles.snap}>
				<div className={styles.btns}>
					<Button.Group>
						{munes.map((v) => 
                         authorityIsTrue(v.permissions)
                        ?
							<Button
								key={v.key}
								type="primary"
								className={muneKey == v.key ? null : styles.avtion}
								onClick={() => this.titleChange(v.key)}
							>
								{v.name}
							</Button>
						:
                        null)}
					</Button.Group>
				</div>
				<div className={styles.tableListForm}>{this.renderForm()}</div>
				<Card bordered={false} className={styles.tableListCard}>
					{/* <h2 className={styles.h2Color}>核查记录</h2> */}

					<Table
						columns={columns}
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
		)
	}
}

export default Form.create()(verification)
