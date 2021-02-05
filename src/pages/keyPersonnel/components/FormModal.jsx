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
@connect(({ keyPersonnel, loading, addCar }) => ({
	keyPersonnel,
	loading: loading.models.keyPersonnel,
	addCar
}))
class FormModal extends Component {
	state = {
		expandedKeys: [], //所有菜单信息集合
		menuArry: [],
		fetchCategoryListArry: [],
		numListArry: {}, //菜单ID匹配下标对象
		searchValue: ''
	}
	componentWillMount() {
		const { values } = this.props
	}
	componentDidMount() {}

	okHandle = (e) => {
		const {
			form,
			handleSubmit,
			dispatch,
			loading,
			values,
			keyPersonnel: { useList, riskList, labelList }
		} = this.props

		const { getFieldDecorator } = form
		e.preventDefault()
		form.validateFields((err, fieldsValue) => {
			if (err) return
			console.log(fieldsValue, list)

			const payload = {
				...fieldsValue,
				data_source: 1,
				label_codes: [ fieldsValue.label_codes ],
				person_status_color: riskList.find((v) => v.code == fieldsValue.person_status_code).remark || '',
				person_status_name: riskList.find((v) => v.code == fieldsValue.person_status_code).name || '',
				police_unit_name: list.find((v) => v.code == fieldsValue.police_unit_code).name || ''
			}

			console.log(payload)

			dispatch({
				type: 'keyPersonnel/insertPerson',
				payload: payload,
				success: (e) => {
					console.log(e)
					if (e.result.reason.code == '200') {
						Message.success('添加成功')
						form.setFieldsValue()
						handleSubmit()
					} else {
						Message.error('添加失败')
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
			personnelLabel,
			keyPersonnel: { useList, riskList, labelList }
		} = this.props
		this.loopUse(useList)
		// console.log(policeUnitData)
		const { getFieldDecorator } = form
		return (
			<Modal
				destroyOnClose
				confirmLoading={loading}
				title={'添加重点人员'}
				visible={modalVisible}
				onOk={this.okHandle}
				onCancel={this.clalModalVisible}
				maskClosable={false}
				centered={true}
			>
				{/* <FormItem {...formItemLayout} label="姓名">
					{getFieldDecorator('name', {
						rules: [
							{
								required: true,
								message: '请输入姓名'
							}
						]
					})(<Input maxLength="25" placeholder="请输入姓名" />)}
				</FormItem> */}
				<FormItem {...formItemLayout} label="身份证号">
					{getFieldDecorator('idcard', {
						rules: [
							{
								required: true,
								message: '请输入身份证号'
							},
							cardNoRule
						]
					})(<Input maxLength="18" placeholder="请输入身份证号" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="所属机构">
					{getFieldDecorator('police_unit_code', {
						rules: [
							{
								required: true,
								message: '请选择所属机构'
							}
						]
					})(
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
				<FormItem {...formItemLayout} label="人员等级">
					{getFieldDecorator('person_status_code', {
						rules: [
							{
								required: true,
								message: '请选择人员等级'
							}
						]
					})(
						<Select style={{ width: '354px' }} placeholder="请选择人员等级">
							{riskList &&
								riskList.map((v) => (
									<Option value={v.code} key={v.code}>
										<Tag
											color={v.remark}
											style={{ width: '5px', height: '10px', display: 'inline-block' }}
										>
											{' '}
										</Tag>
										{v.name}
									</Option>
								))}
						</Select>
					)}
				</FormItem>
				<FormItem {...formItemLayout} label="标签">
					{getFieldDecorator('label_codes', {
						rules: [
							{
								required: true,
								message: '请选择标签'
							}
						]
					})(
						<Select style={{ width: '354px' }} placeholder="请选择标签">
							{labelList &&
								labelList.map((v) => (
									<Option value={v.label_code} key={v.label_code}>
										{v.label_name}
									</Option>
								))}
						</Select>
					)}
				</FormItem>
			</Modal>
		)
	}
}

export default Form.create()(FormModal)
