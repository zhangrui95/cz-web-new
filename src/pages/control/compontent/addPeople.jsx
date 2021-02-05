import React, { Component } from 'react'
import { Form, Input, Modal, TreeSelect, Select, Radio, Message, Table, Tag, Divider } from 'antd'
import moment from 'moment'
import { connect } from 'dva'
const FormItem = Form.Item
const { Option } = Select
const { TreeNode } = TreeSelect
import { phoneRule, plateNumRule, cardNoRule, onlyNumber } from '@/utils/validator'
const formItemLayout = {
	labelCol: {
		xs: { span: 20 },
		sm: { span: 6 }
	},
	wrapperCol: {
		xs: { span: 18 },
		sm: { span: 18 }
	}
}
const TreeSelectProps = {
	showSearch: true,
	allowClear: false,
	autoExpandParent: false,
	treeDefaultExpandAll: true,
	searchPlaceholder: '请输入',
	treeNodeFilterProp: 'title',
	dropdownStyle: { maxHeight: 400, overflow: 'auto' },
	style: {
		width: 354
	}
}

const list = []
@connect(({ service, loading, addCar }) => ({
	service,
	loading: loading.models.service,
	addCar
}))
class addPeople extends Component {
	state = {
		expandedKeys: [], //所有菜单信息集合
		menuArry: [],
		fetchCategoryListArry: [],
		numListArry: {}, //菜单ID匹配下标对象
		searchValue: ''
	}
	componentWillMount() {
		const { values } = this.props

		this.queryDictionary()
		if (values) {
			console.log(1111)
			// this.getDetail()
		}
	}
	componentDidMount() {
		this.getUseDept()
	}

	queryDictionary = () => {
		const { dispatch } = this.props
		dispatch({
			type: 'addCar/dictionaryQuery',
			payload: { code: window.configUrl.dictionariesVehicle }
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
				type: 'addCar/getUseDept',
				payload: {
					// department: JSON.parse(sessionStorage.getItem('user')).department,
					groupList: codes
				}
			})
		}
	}
	getDetail = () => {
		console.log(1111)
		const { dispatch, match: { params: { files, type } } } = this.props
		dispatch({
			type: 'addCar/fetch',
			payload: { vehicle_id: files }
		})
	}

	okHandle = (e) => {
		const { form, handleSubmit, dispatch, loading, values } = this.props

		const { getFieldDecorator } = form
		e.preventDefault()
		let payload = {}
		form.validateFields((err, fieldsValue) => {
			if (err) return
			console.log(fieldsValue)

			if (values) {
				payload = {
					...fieldsValue,
					id: values.id
				}
			} else {
				payload = {
					...fieldsValue
				}
			}
			console.log(payload)

			dispatch({
				type: values ? 'control/updateTemporaryCtrlPerson' : 'control/saveTemporaryCtrlPerson',
				payload: payload,
				success: (e) => {
					console.log(e)
					if (e.result.reason.code == '200') {
                        Message.destroy()
						Message.success(values ? '编辑成功' : '添加成功')
						form.setFieldsValue()
						handleSubmit()
					} else {
                        Message.destroy()
						Message.error(values ? '编辑失败' : '添加失败')
						return false
					}
				}
			})
		})
	}
	requestAddress = () => {
		const { values } = this.props
		return values ? 'addCar/update' : 'addCar/increase'
	}
	choose = (value) => {
		this.props.form.setFieldsValue({ vehicle_organization_code: [] })
		// this.props.form.setFieldsValue({'police_unit_organization_name': value})
		console.log(value)
	}

	clalModalVisible = () => {
		const { handleModalVisible, form } = this.props
		form.resetFields()
		handleModalVisible()
	}
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
			personnelLabel
		} = this.props
		// console.log(policeUnitData)
		const { getFieldDecorator } = form
		return (
			<Modal
				destroyOnClose
				confirmLoading={loading}
				title={values ? '编辑临控人员' : '添加临控人员'}
				visible={modalVisible}
				onOk={this.okHandle}
				onCancel={this.clalModalVisible}
				maskClosable={false}
				centered={true}
			>
				<FormItem {...formItemLayout} label="姓名">
					{getFieldDecorator('name', {
						rules: [
							{
								required: true,
								message: '请输入姓名'
							}
						],
						initialValue: values ? values.name : ''
					})(<Input placeholder="" maxLength="25" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="身份证号">
					{getFieldDecorator('idcard', {
						rules: [
							{
								required: true,
								message: '请输入身份证号'
							},
							cardNoRule
						],
						initialValue: values ? values.idcard : ''
					})(<Input placeholder="" maxLength="18" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="生日">
					{getFieldDecorator('birth', {
						initialValue: values ? values.birth : ''
					})(<Input placeholder="" maxLength="25" />)}
				</FormItem>
				<FormItem {...formItemLayout} {...formItemLayout} label="性别">
					{getFieldDecorator('sex', {
						initialValue: values ? values.sex : ''
					})(
						<Radio.Group>
							<Radio value={'男'}>男</Radio>
							<Radio value={'女'}>女</Radio>
						</Radio.Group>
					)}
				</FormItem>
				<FormItem {...formItemLayout} label="电话">
					{getFieldDecorator('phone_number', {
						rules: [ phoneRule ],
						initialValue: values ? values.phone_number : ''
					})(<Input placeholder="" maxLength="11" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="住址">
					{getFieldDecorator('address', {
						initialValue: values ? values.address : ''
					})(<Input placeholder="" maxLength="50" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="单位">
					{getFieldDecorator('unit', {
						initialValue: values ? values.unit : ''
					})(<Input placeholder="" maxLength="50" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="民族">
					{getFieldDecorator('nation', {
						initialValue: values ? values.nation : ''
					})(<Input placeholder="" maxLength="25" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="自定义标签">
					{getFieldDecorator('custom_tags_id', {
						initialValue: values ? values.custom_tags_id : ''
					})(
						<Select
							placeholder="请选择"
							allowClear
							style={{
								width: '353px'
							}}
						>
							{personnelLabel &&
								personnelLabel.map((v) => (
									<Option value={v.custom_tags_id} key={v.custom_tags_id}>
										{v.label}
									</Option>
								))}
						</Select>
					)}
				</FormItem>
				<FormItem {...formItemLayout} label="布控状态">
					{getFieldDecorator('ctrl_status', {
                        rules: [
							{
								required: true,
								message: '请选择布控状态'
							},
						],
						initialValue: values ? values.ctrl_status : ''
					})(
						<Select
							allowClear
							placeholder="请选择"
							style={{
								width: '353px'
							}}
						>
							<Option value={'0'}>否</Option>
							<Option value={'1'}>是</Option>
						</Select>
					)}
				</FormItem>
				<FormItem {...formItemLayout} label="布控类型">
					{getFieldDecorator('ctrl_type', {
						initialValue: values ? values.ctrl_type : ''
					})(<Input placeholder="" maxLength="25" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="布控原因">
					{getFieldDecorator('reason', {
                        rules: [
							{
								required: true,
								message: '请输入布控原因'
							},
						],
						initialValue: values ? values.reason : ''
					})(<Input.TextArea autoSize={{ minRows: 3, maxRows: 5 }} placeholder="" maxLength="250" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="布控警员姓名">
					{getFieldDecorator('ctrl_police_name', {
						rules: [
							{
								required: true,
								message: '请输入布控警员姓名'
							}
						],
						initialValue: values ? values.ctrl_police_name : ''
					})(<Input placeholder="" maxLength="25" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="布控警员电话">
					{getFieldDecorator('ctrl_police_phone', {
						rules: [
							{
								required: true,
								message: '请输入布控警员电话'
							},
							phoneRule
						],
						initialValue: values ? values.ctrl_police_phone : ''
					})(<Input placeholder="" maxLength="11" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="布控警员单位">
					{getFieldDecorator('ctrl_police_unit', {
						initialValue: values ? values.ctrl_police_unit : ''
					})(<Input placeholder="" maxLength="50" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="备注">
					{getFieldDecorator('remark', {
						initialValue: values ? values.remark : ''
					})(<Input.TextArea autoSize={{ minRows: 3, maxRows: 5 }} placeholder="" maxLength="250" />)}
				</FormItem>
			</Modal>
		)
	}
}

export default Form.create()(addPeople)
