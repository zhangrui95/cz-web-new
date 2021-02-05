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
class addCar extends Component {
	state = {
		expandedKeys: [], //所有菜单信息集合
		menuArry: [],
		fetchCategoryListArry: [],
		numListArry: {}, //菜单ID匹配下标对象
		searchValue: '',
       
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
					id: values.id,
				}
			} else {
				payload = {
                    ...fieldsValue,
                    }
			}
			console.log(payload)

			dispatch({
				type: values ? 'control/updateTemporaryCtrlCar' : 'control/saveTemporaryCtrlCar',
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
            carType,
            vehicleLabel
		} = this.props
		const { getFieldDecorator } = form
		return (
			<Modal
				destroyOnClose
				confirmLoading={loading}
				title={values ? '编辑临控车辆' : '添加临控车辆'}
				visible={modalVisible}
				onOk={this.okHandle}
				onCancel={this.clalModalVisible}
                maskClosable={false}
				 centered={true}
			>
				
				<FormItem {...formItemLayout} label="车牌号">
					{getFieldDecorator('license_plate_no', {
                        rules: [
							{
								required: true,
								message: '请输入车牌号'
							},
                            plateNumRule
						],
						initialValue: values ? values.license_plate_no : ''
					})(<Input placeholder="" maxLength="10" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="号牌种类">
							{getFieldDecorator('license_plate_type', {
                                initialValue: values ? values.license_plate_type : '',
                                 rules: [
							{
								required: true,
								message: '请选择'
							}
						],
							})(
								<Select
									placeholder="请选择"
									style={{
										width: '353px'
									}}
								>
                                {
                                    carType&&carType.map(v => <Option value={v.code} key={v.code}>{v.name}</Option>)
                                }
								</Select>
							)}
						</FormItem>
				<FormItem {...formItemLayout} label="车辆类型">
					{getFieldDecorator('car_type', {
						initialValue: values ? values.car_type : ''
					})(<Input placeholder="" maxLength="25" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="车辆型号">
					{getFieldDecorator('car_model', {
						initialValue: values ? values.car_model : ''
					})(<Input placeholder="" maxLength="25" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="车辆品牌">
					{getFieldDecorator('car_brand', {
						initialValue: values ? values.car_brand : ''
					})(<Input placeholder="" maxLength="25" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="车身颜色">
					{getFieldDecorator('car_color', {
						initialValue: values ? values.car_color : ''
					})(<Input placeholder="" maxLength="25" />)}
				</FormItem>
                <FormItem {...formItemLayout} label="车辆所有人">
					{getFieldDecorator('car_owner', {
						initialValue: values ? values.car_owner : ''
					})(<Input placeholder="" maxLength="25" />)}
				</FormItem>
                <FormItem {...formItemLayout} label="车辆所有人电话">
					{getFieldDecorator('car_owner_tel', {
                        rules:[phoneRule],
						initialValue: values ? values.car_owner_tel : ''
					})(<Input placeholder="" maxLength="11" />)}
				</FormItem>
                <FormItem {...formItemLayout} label="VIN码">
					{getFieldDecorator('vin_number', {
						initialValue: values ? values.vin_number : ''
					})(<Input placeholder="" maxLength="50" />)}
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
							{vehicleLabel &&
								vehicleLabel.map((v) => (
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
				
				
			</Modal>
		)
	}
}

export default Form.create()(addCar)
