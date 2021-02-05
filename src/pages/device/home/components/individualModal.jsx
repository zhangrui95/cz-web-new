import React, { Component } from 'react'
import { Form, Input, Modal, TreeSelect, Select, Radio, Message, Table, Tag, Divider } from 'antd'
import moment from 'moment'
import { connect } from 'dva'
const FormItem = Form.Item
const { Option } = Select
const { TreeNode } = TreeSelect
import { phoneRule, plateNumRule, cardNoRule, onlyNumber, decimal } from '@/utils/validator'
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

const individualList = [
	{
		type: '1',
		name: '对讲机'
	},
	{
		type: '2',
		name: '单兵设备'
	}
]
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
class FormModal extends Component {
	state = {
		expandedKeys: [], //所有菜单信息集合
		menuArry: [],
		fetchCategoryListArry: [],
		numListArry: {}, //菜单ID匹配下标对象
		searchValue: '',
		isIntercom: false
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
		const { form, handleSubmit, dispatch, addCar: { dictionary, detail }, loading, values } = this.props

		const { getFieldDecorator } = form
		console.log(values)
		e.preventDefault()
		let payload = {}
		form.validateFields((err, fieldsValue) => {
			if (err) return
			console.log(fieldsValue)
			payload = {
				...fieldsValue,
				equipment_organization_name: list.find((v) => fieldsValue.equipment_organization_code == v.code).name,
                equipment_message:{
                    cth: fieldsValue.cth
                }
			}
			if (values) {
				payload = {
					...payload,
					equipment_id: values.equipment_id
				}
				console.log(22222222)
			} else {
				payload = payload
				console.log(33333333)
			}
			console.log(payload, list)

			dispatch({
				type: this.requestAddress(),
				payload: payload,
				success: (e) => {
					console.log(e)
					
                    if (e.result.reason.code == '200') {
						Message.success(values ? '编辑成功' : '添加成功')
						form.setFieldsValue()
                         this.setState({isIntercom: false})
						handleSubmit()
					} else {
						Message.error(values ? '编辑失败' : '添加失败')
						return false
					}
				}
			})
		})
	}
	requestAddress = () => {
		const { values } = this.props
		return values ? 'device/updateIndividual' : 'device/insertIndividual'
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

	clalModalVisible = () => {
		const { handleModalVisible, form } = this.props
		form.resetFields()
        this.setState({isIntercom: false})
		handleModalVisible()
	}
    handleChange = (value) => {
  console.log(`selected ${value}`);
  if(value == '1'){
      this.setState({isIntercom: true})
  }else{
      this.setState({isIntercom: false})
  }
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
            isInter
		} = this.props
		// console.log(policeUnitData)
		const { getFieldDecorator } = form
		this.loopUse(policeUnitData)
		return (
			<Modal
				destroyOnClose
				confirmLoading={loading}
				title={values ? '编辑设备' : '添加设备'}
				visible={modalVisible}
				onOk={this.okHandle}
				onCancel={this.clalModalVisible}
				maskClosable={false}
				centered={true}
			>
				<FormItem {...formItemLayout} label="设备名称">
					{getFieldDecorator('equipment_name', {
						initialValue: values ? values.equipment_name : '',
						rules: [
							{
								required: true,
								message: `请填写设备名称`
							}
						]
					})(<Input placeholder="" maxLength="50" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="设备识别代码">
					{getFieldDecorator('equipment_identification_code', {
						initialValue: values ? values.equipment_identification_code : ''
					})(<Input placeholder="" maxLength="50" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="设备类型">
					{getFieldDecorator('equipment_type', {
						initialValue: values ? values.equipment_type : '',
						rules: [
							{
								required: true,
								message: `必需选择设备类型`
							}
						]
					})(
						<Select placeholder="请选择" style={{ width: '355px' }}onChange={this.handleChange}>
							{individualList &&
								individualList.map((v) => (
									<Option value={v.type} key={v.type}>
										{v.name}
									</Option>
								))}
						</Select>
					)}
				</FormItem>
				{this.state.isIntercom || isInter ? (
					<FormItem {...formItemLayout} label="车台号">
						{getFieldDecorator('cth', {
							initialValue: values ? values.equipment_message ? values.equipment_message.cth : '' : '',
							rules: [
								{
									required: true,
									message: `请填写车台号`
								}
							]
						})(<Input placeholder="" maxLength="20" />)}
					</FormItem>
				) : null}

				<FormItem {...formItemLayout} label="备注">
					{getFieldDecorator('remark', {
						initialValue: values ? values.remark : ''
					})(
						<Input.TextArea
							autoSize={{ minRows: 3, maxRows: 5 }}
							placeholder="请输入备注"
							style={{ width: '355px' }}
							maxLength="500"
						/>
					)}
				</FormItem>
				<FormItem {...formItemLayout} {...formItemLayout} label="所属单位">
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
							treeNodeFilterProp="title"
							treeDefaultExpandAll
							{...TreeSelectProps}
							placeholder="请选择"
						>
							{this.renderloop(policeUnitData)}
						</TreeSelect>
					)}
				</FormItem>
			</Modal>
		)
	}
}

export default Form.create()(FormModal)
