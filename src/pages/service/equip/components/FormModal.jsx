import React, { Component } from 'react'
import { Form, Input, Modal, TreeSelect, Select, Message, DatePicker, Row, Col } from 'antd'
import moment from 'moment'
import { connect } from 'dva'
const FormItem = Form.Item
const { Option } = Select
const { TreeNode } = TreeSelect
const { TextArea } = Input
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
const formLayout = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 4 }
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 20 }
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
		width: 230
	}
}
const list = []
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
		endTime: '',
		changeCar: true
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
		const { form, dispatch, policeUnitData, handleSubmit, values, edit, equipmentType } = this.props
		if (edit) {
			this.handleModalVisible()
			form.resetFields()
		} else {
			form.validateFields((err, fieldsValue) => {
				if (err) return
				let formData = {}
				console.log('fieldsValue', fieldsValue, values)

				if (values) {
					console.log('111111111111')
					formData = {
						equipment_message: {
							allotment_date: fieldsValue['allotment_date']
								? fieldsValue['allotment_date'].format('YYYY-MM-DD')
								: '',
							equipment_date: fieldsValue['equipment_date']
								? fieldsValue['equipment_date'].format('YYYY-MM-DD')
								: '',
							warranty_expiration_date: fieldsValue['warranty_expiration_date']
								? fieldsValue['warranty_expiration_date'].format('YYYY-MM-DD')
								: '',
							brand: fieldsValue.brand,
							business_telephone: fieldsValue.business_telephone,
							equipment_outlay_source: fieldsValue.equipment_outlay_source,
							maintenance_contact_telephone: fieldsValue.maintenance_contact_telephone,
							manufacture: fieldsValue.manufacture,
							model: fieldsValue.model,
							receive_org_name: fieldsValue.receive_org_name,
							serial_number: fieldsValue.serial_number,
							singature: fieldsValue.singature,
							supplier: fieldsValue.supplier,
							units: '件'
						},

						equipment_name: fieldsValue.equipment_name,
						equipment_organization_code: fieldsValue.equipment_organization_code,
						equipment_state: fieldsValue.equipment_state,
						equipment_type: fieldsValue.equipment_type,
						equipment_type_name: equipmentType.find((v) => fieldsValue.equipment_type == v.code).name,
						remark: fieldsValue.remark,
						vehicle_id: fieldsValue.vehicle_id ? fieldsValue.vehicle_id : '',

						equipment_organization_name: list.find((v) => fieldsValue.equipment_organization_code == v.code)
							.name,
						equipment_id: values.equipment_id
					}
				} else {
					formData = {
						equipment_message: {
							allotment_date: fieldsValue['allotment_date']
								? fieldsValue['allotment_date'].format('YYYY-MM-DD')
								: '',
							equipment_date: fieldsValue['equipment_date']
								? fieldsValue['equipment_date'].format('YYYY-MM-DD')
								: '',
							warranty_expiration_date: fieldsValue['warranty_expiration_date']
								? fieldsValue['warranty_expiration_date'].format('YYYY-MM-DD')
								: '',
							brand: fieldsValue.brand,
							business_telephone: fieldsValue.business_telephone,
							equipment_outlay_source: fieldsValue.equipment_outlay_source,
							maintenance_contact_telephone: fieldsValue.maintenance_contact_telephone,
							manufacture: fieldsValue.manufacture,
							model: fieldsValue.model,
							receive_org_name: fieldsValue.receive_org_name,
							serial_number: fieldsValue.serial_number,
							singature: fieldsValue.singature,
							supplier: fieldsValue.supplier,
							units: '件'
						},
						vehicle_id: fieldsValue.vehicle_id,
						equipment_name: fieldsValue.equipment_name,
						equipment_organization_code: fieldsValue.equipment_organization_code,
						equipment_state: fieldsValue.equipment_state,
						equipment_type: fieldsValue.equipment_type,
						equipment_type_name: equipmentType.find((v) => fieldsValue.equipment_type == v.code).name,
						remark: fieldsValue.remark,
						equipment_organization_name: list.find((v) => fieldsValue.equipment_organization_code == v.code)
							.name
					}
				}
				console.log('formData', formData)
				dispatch({
					type: values ? 'service/updateEquipment' : 'service/createEquipment',
					payload: formData,
					success: (e) => {
						console.log(e)

						if (e.result.reason.code == '200') {
							Message.success(values ? '编辑成功' : '添加成功')
							handleSubmit(false)
							form.resetFields()
							this.setState({ isCar: false, changeCar: true })
						} else {
							Message.error(values ? '编辑失败' : '添加失败')
							return false
						}
					}
				})
			})
		}
	}
	choose = (value) => {
		// this.props.form.setFieldsValue({ shifts_organization_code: [] });
		// // this.props.form.setFieldsValue({'police_unit_organization_name': value})
		// console.log(value);
		// const { dispatch} = this.props;
		// this.setState({isCar:true})
		// dispatch({
		//     type:'service/getVehicleList',
		//     vehicle_organization_code:value
		// })
		const { chooseCode } = this.props
		this.props.form.setFieldsValue({ vehicle_id: '' })
		this.setState({ changeCar: false })
		chooseCode(value)
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
	handleModalVisible = () => {
		const { handleModalVisible } = this.props
		this.setState({ isCar: false, changeCar: true })
		// this.setState({changeCar: true})
		handleModalVisible()
	}
	render() {
		const {
			values,
			modalVisible,
			loading,
			handleModalVisible,
			form,
			policeUnitData,
			policeList,
			equipmentType,
			equipmentState,
			chooseCode,
			isCar,
			service: { vehicleCode },
			edit
		} = this.props
		const { changeCar } = this.state
		console.log(values)
		const { getFieldDecorator } = form
		this.loopUse(policeUnitData)
		return (
			<Modal
				destroyOnClose
				confirmLoading={loading}
				title={edit ? '查看装备' : values ? '编辑装备' : '添加装备'}
				visible={modalVisible}
				onOk={this.okHandle}
				onCancel={() => this.handleModalVisible()}
				maskClosable={false}
				width={'800px'}
				centered={true}
			>
				<Row gutter={[ 8, 0 ]}>
					<Col span={12}>
						<FormItem {...formItemLayout} label="品名">
							{getFieldDecorator('equipment_name', {
								rules: [
									{
										required: true,
										message: '必需输入名称'
									}
								],
								initialValue: values ? values.equipment_name : ''
							})(<Input placeholder="请输入品名" style={{ width: '230px' }} disabled={edit} maxLength="50" />)}
						</FormItem>
					</Col>
					<Col span={12}>
						<FormItem {...formItemLayout} label="所属单位">
							{getFieldDecorator('equipment_organization_code', {
								initialValue: values ? values.equipment_organization_code : '',
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
									disabled={edit}
									placeholder="请选择"
								>
									{this.renderloop(policeUnitData)}
								</TreeSelect>
							)}
						</FormItem>
					</Col>

					{isCar && vehicleCode.length ? (
						<Col span={12}>
							<FormItem {...formItemLayout} label="车辆">
								{getFieldDecorator('vehicle_id', {
									initialValue: changeCar ? (values ? values.vehicle_id : '') : '',
									rules: [
										// {
										//     required: true,
										//     message: `必需选择车辆`
										// }
									]
								})(
									<Select {...TreeSelectProps} style={{ width: '230px' }} disabled={edit}>
										{vehicleCode &&
											vehicleCode.map((v, k) => (
												<Option value={v.vehicle_id} key={v.vehicle_id}>
													{v.carNo}
												</Option>
											))}
									</Select>
								)}
							</FormItem>
						</Col>
					) : null}

					<Col span={12}>
						<FormItem {...formItemLayout} label="装备类型">
							{getFieldDecorator('equipment_type', {
								rules: [
									{
										required: true,
										message: `必需选择`
									}
								],
								initialValue: values ? values.equipment_type : ''
							})(
								<Select {...TreeSelectProps} style={{ width: '230px' }} disabled={edit}>
									{equipmentType &&
										equipmentType.map((v, k) => (
											<Option value={v.code} key={v.vode}>
												{v.name}
											</Option>
										))}
								</Select>
							)}
						</FormItem>
					</Col>
					<Col span={12}>
						<FormItem {...formItemLayout} label="装备状态">
							{getFieldDecorator('equipment_state', {
								rules: [
									{
										required: true,
										message: `必需选择`
									}
								],
								initialValue: values ? values.equipment_state : ''
							})(
								<Select {...TreeSelectProps} style={{ width: '230px' }} disabled={edit}>
									{equipmentState &&
										equipmentState.map((v, k) => (
											<Option value={v.code} key={v.vode}>
												{v.name}
											</Option>
										))}
								</Select>
							)}
						</FormItem>
					</Col>
					<Col span={12}>
						<FormItem {...formItemLayout} label="品牌">
							{getFieldDecorator('brand', {
								rules: [
									{
										required: true,
										message: '必需输入品牌'
									}
								],
								initialValue: values ? values.brand : ''
							})(<Input placeholder="请输入品牌" style={{ width: '230px' }} disabled={edit} maxLength="50" />)}
						</FormItem>
					</Col>
					<Col span={12}>
						<FormItem {...formItemLayout} label="型号">
							{getFieldDecorator('model', {
								rules: [
									{
										required: true,
										message: '必需输入型号'
									}
								],
								initialValue: values ? values.model : ''
							})(<Input placeholder="请输入型号" style={{ width: '230px' }} disabled={edit} maxLength="50" />)}
						</FormItem>
					</Col>
					<Col span={12}>
						<FormItem {...formItemLayout} label="序列号">
							{getFieldDecorator('serial_number', {
								initialValue: values ? values.serial_number : ''
							})(
								<Input placeholder="请输入序列号" style={{ width: '230px' }} disabled={edit} maxLength="50" />
							)}
						</FormItem>
					</Col>
					<Col span={12}>
						<FormItem {...formItemLayout} label="生产厂家">
							{getFieldDecorator('manufacture', {
								initialValue: values ? values.manufacture : ''
							})(
								<Input
									placeholder="请输入生产厂家"
									style={{ width: '230px' }}
									disabled={edit}
									maxLength="50"
								/>
							)}
						</FormItem>
					</Col>
					<Col span={12}>
						<FormItem {...formItemLayout} label="业务联系电话">
							{getFieldDecorator('business_telephone', {
								initialValue: values ? values.business_telephone : ''
							})(
								<Input
									placeholder="请输入业务联系电话"
									style={{ width: '230px' }}
									disabled={edit}
									maxLength="15"
								/>
							)}
						</FormItem>
					</Col>
					<Col span={12}>
						<FormItem {...formItemLayout} label="供应商">
							{getFieldDecorator('supplier', {
								initialValue: values ? values.supplier : ''
							})(
								<Input placeholder="请输入供应商" style={{ width: '230px' }} disabled={edit} maxLength="50" />
							)}
						</FormItem>
					</Col>
					<Col span={12}>
						<FormItem {...formItemLayout} label="维保联系电话">
							{getFieldDecorator('maintenance_contact_telephone', {
								initialValue: values ? values.maintenance_contact_telephone : ''
							})(
								<Input
									placeholder="请输入维保联系电话"
									style={{ width: '230px' }}
									disabled={edit}
									maxLength="15"
								/>
							)}
						</FormItem>
					</Col>
					<Col span={12}>
						<FormItem {...formItemLayout} label="装备经费来源">
							{getFieldDecorator('equipment_outlay_source', {
								initialValue: values ? values.equipment_outlay_source : ''
							})(
								<Input
									placeholder="请输入装备经费来源"
									style={{ width: '230px' }}
									disabled={edit}
									maxLength="50"
								/>
							)}
						</FormItem>
					</Col>
					<Col span={12}>
						<FormItem {...formItemLayout} label="装备日期">
							{getFieldDecorator('equipment_date', {
								initialValue: values
									? values.equipment_date == '' ? '' : moment(values.equipment_date, [ 'YYYY-MM-DD' ])
									: ''
							})(<DatePicker style={{ width: '230px' }} disabled={edit} />)}
						</FormItem>
					</Col>
					<Col span={12}>
						<FormItem {...formItemLayout} label="质保到期时间">
							{getFieldDecorator('warranty_expiration_date', {
								initialValue: values
									? values.warranty_expiration_date == ''
										? ''
										: moment(values.warranty_expiration_date, [ 'YYYY-MM-DD' ])
									: ''
							})(<DatePicker style={{ width: '230px' }} disabled={edit} />)}
						</FormItem>
					</Col>
					<Col span={12}>
						<FormItem {...formItemLayout} label="配发日期">
							{getFieldDecorator('allotment_date', {
								initialValue: values
									? values.allotment_date == '' ? '' : moment(values.allotment_date, [ 'YYYY-MM-DD' ])
									: ''
							})(<DatePicker style={{ width: '230px' }} disabled={edit} />)}
						</FormItem>
					</Col>
					<Col span={12}>
						<FormItem {...formItemLayout} label="接收单位">
							{getFieldDecorator('receive_org_name', {
								initialValue: values ? values.receive_org_name : ''
							})(
								<Input
									placeholder="请输入接收单位"
									style={{ width: '230px' }}
									disabled={edit}
									maxLength="50"
								/>
							)}
						</FormItem>
					</Col>
					<Col span={24}>
						<FormItem {...formLayout} label="签收人">
							{getFieldDecorator('singature', {
								initialValue: values ? values.singature : ''
							})(<Input placeholder="请输入签收人" disabled={edit} />)}
						</FormItem>
					</Col>
					<Col span={24}>
						<FormItem {...formLayout} label="备注">
							{getFieldDecorator('remark', {
								initialValue: values ? values.remark : ''
							})(
								<TextArea
									placeholder="请输入备注"
									autoSize={{ minRows: 3, maxRows: 5 }}
									disabled={edit}
									maxLength="250"
								/>
							)}
						</FormItem>
					</Col>
				</Row>
			</Modal>
		)
	}
}

export default Form.create()(FormModal)
