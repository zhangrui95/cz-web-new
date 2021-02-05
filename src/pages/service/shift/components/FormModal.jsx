import React, { Component } from 'react'
import { Form, Input, Modal, TreeSelect, Select, Message, TimePicker } from 'antd'
import moment from 'moment'
import { connect } from 'dva'
const FormItem = Form.Item
const { Option } = Select
const { TreeNode } = TreeSelect
const formItemLayout = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 4 }
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 20 }
	}
}
const list = []
const TreeSelectProps = {
	showSearch: true,
	allowClear: false,
	autoExpandParent: false,
	treeDefaultExpandAll: true,
	searchPlaceholder: '请输入',
	treeNodeFilterProp: 'title',
	dropdownStyle: { maxHeight: 400, overflow: 'auto' },
	style: {
		width: 392
	}
}

@connect(({ service, loading }) => ({
	service,
	loading: loading.models.service
}))
class FormModal extends Component {
	state = {
		expandedKeys: [], //所有菜单信息集合
		menuArry: [],
		fetchCategoryListArry: [],
		numListArry: {}, //菜单ID匹配下标对象
		searchValue: '',
		beginTime: '',
		endTime: ''
	}
	componentWillMount() {}
	componentDidMount() {}
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
	okHandle = () => {
		const { form, dispatch, policeUnitData, handleSubmit, values, loopUseList } = this.props
		const { endTime, beginTime } = this.state
		let a = ''
		form.validateFields((err, fieldsValue) => {
			if (err) return
			let formData = {}
			console.log('bianji', fieldsValue)
			if (fieldsValue.is_across_day == 1) {
				console.log('xiaoyu')
				if (
					fieldsValue.shifts_begin_tiem.format('HH:mm:ss') >= fieldsValue.shifts_end_time.format('HH:mm:ss')
				) {
					Message.error('结束时间不能小于开始时间')
					return false
				}
			}
			console.log(list)
			//  this.loopUse()
			if (values) {
				console.log('value')
				formData = {
					shifts_organization_name: list.find((v) => fieldsValue.shifts_organization_code == v.code).name,
					shifts_id: values.shifts_id,
					shifts_name: fieldsValue.shifts_name,
					shifts_organization_code: fieldsValue.shifts_organization_code,
					shifts_begin_tiem: fieldsValue.shifts_begin_tiem.format('HH:mm:ss'),
					shifts_end_time: fieldsValue.shifts_end_time.format('HH:mm:ss'),
					is_across_day: fieldsValue.is_across_day
				}
			} else {
				console.log('shenme ')
				console.log('movalue', fieldsValue.shifts_organization_code, a)

				formData = {
					shifts_name: fieldsValue.shifts_name,
					shifts_organization_code: fieldsValue.shifts_organization_code,
					shifts_organization_name: list.find((v) => fieldsValue.shifts_organization_code == v.code).name,
					shifts_begin_tiem: fieldsValue.shifts_begin_tiem.format('HH:mm:ss'),
					shifts_end_time: fieldsValue.shifts_end_time.format('HH:mm:ss'),
					is_across_day: fieldsValue.is_across_day
				}
			}
			console.log('zou', formData)
			dispatch({
				type: values ? 'service/updateShifts' : 'service/createShifts',
				payload: formData,
				success: (e) => {
					// console.log(e)

					if (e.result.reason.code == '200') {
						Message.success(values ? '编辑成功' : '添加成功')
						form.resetFields()
						handleSubmit(false)
					} else {
						Message.error(values ? '编辑失败' : '添加失败')
						return false
					}
				}
			})
		})
	}
	choose = (value) => {
		this.props.form.setFieldsValue({ shifts_organization_code: [] })
		// this.props.form.setFieldsValue({'police_unit_organization_name': value})
		console.log(value)
	}
	onBeginChange = (time, timeString) => {
		console.log(time, timeString)
		this.setState({
			beginTime: timeString
		})
	}
	onEndChange = (time, timeString) => {
		console.log(time, timeString)
		this.setState({
			endTime: timeString
		})
	}
	onSearch = (value) => {
		const expandedKeys = dataList
			.map((item) => {
				// console.log(item.name.indexOf(value))
				if (item.name.indexOf(value) > -1) {
					return getParentKey(item.name, this.props.policeUnitData)
				}
				return null
			})
			.filter((item, i, self) => item && self.indexOf(item) === i)
		this.setState({
			expandedKeys,
			searchValue: value
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
	render() {
		const { values, modalVisible, loading, handleModalVisible, form, policeUnitData, policeList } = this.props
		// console.log(policeUnitData)
		const { getFieldDecorator } = form
		this.loopUse(policeUnitData)
		return (
			<Modal
				destroyOnClose
				confirmLoading={loading}
				title={values ? '编辑班次' : '添加班次'}
				visible={modalVisible}
				onOk={this.okHandle}
				onCancel={() => handleModalVisible()}
				maskClosable={false}
				centered={true}
			>
				<FormItem {...formItemLayout} label="班次名称">
					{getFieldDecorator('shifts_name', {
						rules: [
							{
								required: true,
								message: '必需输入名称'
							}
						],
						initialValue: values ? values.shifts_name : ''
					})(<Input placeholder="请输入班次名称" maxLength="50" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="所属单位">
					{getFieldDecorator('shifts_organization_code', {
						initialValue: values ? values.shifts_organization_code : '',
						rules: [
							{
								required: true,
								message: `必需选择所属单位`
							}
						]
					})(
						<TreeSelect
							onChange={(value) => this.choose(value)}
							treeNodeFilterProp="title"
							treeDefaultExpandAll
							{...TreeSelectProps}
							placeholder="请选择"
						>
							{this.renderloop(policeUnitData)}
						</TreeSelect>
					)}
				</FormItem>
				<FormItem {...formItemLayout} label="开始时间">
					{getFieldDecorator('shifts_begin_tiem', {
						rules: [
							{
								required: true,
								message: '必需选择时间'
							}
						],
						initialValue: values ? moment(values.shifts_begin_tiem, 'HH:mm:ss') : ''
					})(<TimePicker onChange={this.onBeginChange} />)}
				</FormItem>
				<FormItem {...formItemLayout} label="结束时间">
					{getFieldDecorator('shifts_end_time', {
						rules: [
							{
								required: true,
								message: '必需选择时间'
							}
						],

						initialValue: values ? moment(values.shifts_end_time, 'HH:mm:ss') : ''
					})(<TimePicker onChange={this.onEndChange} />)}
				</FormItem>
				<FormItem {...formItemLayout} label="是否跨天">
					{getFieldDecorator('is_across_day', {
						rules: [
							{
								required: true,
								message: `必需选择`
							}
						],
						initialValue: values ? values.is_across_day : ''
					})(
						<Select {...TreeSelectProps}>
							<Option value={1}>否</Option>
							<Option value={0}>是</Option>
						</Select>
					)}
				</FormItem>
			</Modal>
		)
	}
}

export default Form.create()(FormModal)
