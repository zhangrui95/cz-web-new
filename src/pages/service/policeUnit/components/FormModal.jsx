import React, { Component } from 'react'
import { Form, Input, Modal, TreeSelect, Select, Message } from 'antd'
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
		onLine: true,
		onArea: true,
		onPlice: true
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
		const {
			form,
			dispatch,
			policeUnitData,
			handleSubmit,
			values,
			policeList,
			userPlice,
			service: { labelArea, labelLine }
		} = this.props
		form.validateFields((err, fieldsValue) => {
			if (err) return
			let formData = {},
				arr = []
			console.log(fieldsValue)
			for (let index = 0; index < userPlice.length; index++) {
				const element = userPlice[index]
				for (let i = 0; i < fieldsValue.ids.length; i++) {
					const id = fieldsValue.ids[i]
					if (id == element.id) {
						arr.push({
							id: id,
							name: element.policeName,
							pcard: element.pcard,
							idCard: element.idCard,
							contact: element.contact,
							department: element.departmentNum,
							photo: element.photo,
							departmentName: element.departmentName
						})
					}
				}
			}

			if (values) {
				formData = {
					...fieldsValue,
					police_unit_organization_name: list.find((v) => fieldsValue.police_unit_organization_code == v.code)
						.name,
					police_unit_id: values.police_unit_id,
					label_area_id: fieldsValue.label_area_id ? fieldsValue.label_area_id : '',
					label_line_id: fieldsValue.label_line_id ? fieldsValue.label_line_id : '',
					label_area_name: fieldsValue.label_area_id
						? labelArea.find((v) => fieldsValue.label_area_id == v.label_id).label_name
						: '',
					label_line_name: fieldsValue.label_line_id
						? labelLine.find((v) => fieldsValue.label_line_id == v.label_id).label_name
						: '',
					police_message: arr
				}
			} else {
				formData = {
					...fieldsValue,
					police_unit_organization_name: list.find((v) => fieldsValue.police_unit_organization_code == v.code)
						.name,
					police_unit_type_name: policeList.find((v) => fieldsValue.police_unit_type == v.code).name,
					label_area_name: fieldsValue.label_area_id
						? labelArea.find((v) => fieldsValue.label_area_id == v.label_id).label_name
						: '',
					label_line_name: fieldsValue.label_line_id
						? labelLine.find((v) => fieldsValue.label_line_id == v.label_id).label_name
						: '',
					police_message: arr
				}
			}
			console.log(formData)
			if (fieldsValue.label_line_id) {
				console.log(fieldsValue.label_line_id, values)
				if (values) {
					if (fieldsValue.label_line_id == values.label_line_id) {
						this.submitPoliceUnit({ ...formData, saveFlag: 'false' })
						console.log('编辑没修改线路')
					} else {
						this.getDutyByLabelId(formData)
						console.log('编辑修改线路')
					}
				} else {
					this.getDutyByLabelId(formData)
					console.log('新建有线路')
				}
			} else {
				console.log('没有线路')
				this.submitPoliceUnit({ ...formData, saveFlag: 'false' })
			}
		})
	}
	getDutyByLabelId = (files) => {
		const { form, dispatch, values } = this.props
		console.log(files)
		var _self = this
		dispatch({
			type: 'service/getDutyPoliceUnitByLabelId',
			payload: { label_line_id: files.label_line_id },
			success: (e) => {
				console.log(e)
					if (e.result.reason.code == '200') {
						if (e.result.policeUnit) {
							const nameStr = e.result.policeUnit.police_unit_name
							const ids = e.result.policeUnit.police_unit_id

							Modal.confirm({
								title: '提示',
								content: `${'巡逻线路（'}${files.label_line_name}${'）已绑定警力单元（'}${nameStr}${'），是否强制变更巡逻线路（'}${files.label_line_name}${'）绑定警力单元（'}${files.police_unit_name}${'）'}`,
								okText: '是',
								cancelText: '否',
								onOk: () => {
									if (values) {
										Modal.confirm({
											title: '提示',
											content: `${'是否将警力单元（'}${files.police_unit_name}${'）原巡逻线路（'}${values.label_line_name}${'）绑定至警力单元（'}${nameStr}${'），否将清空警力单元（'}${nameStr}${'）巡逻线路'}`,
											okText: `是`,
											cancelText: `否`,
											onOk: () => {
												_self.submitPoliceUnit({ ...files, saveFlag: 'false', policeUnit: ids })
											},
											onCancel: () => {
												_self.submitPoliceUnit({ ...files, saveFlag: 'true', policeUnit: ids })
											}
										})
									} else {
										_self.submitPoliceUnit({ ...files, saveFlag: 'true', policeUnit: ids })
									}
								}
								// onCancel: () => {
								//      _self.submitPoliceUnit({...files,saveFlag: 'false'})
								// }
							})
						} else {
							_self.submitPoliceUnit({ ...files, saveFlag: 'true' })
						}
					} else {
						return false
					}
			}
		})
	}
	submitPoliceUnit = (files) => {
		const { form, dispatch, values, handleSubmit } = this.props
		console.log(files)
		dispatch({
			type: values ? 'service/updatePoliceUnitList' : 'service/createPoliceUnitList',
			payload: files,
			success: (e) => {
				// console.log(e)

				if (e.result.reason.code == '200') {
                    if(e.result.code == '500'){
                        Message.error(e.result.msg)
                        return false
                    }else{
                        Message.success(values ? '编辑成功' : '添加成功')
					form.resetFields()
					this.setState({ onLine: true, onArea: true, onPlice: true })
					// userIds = []
					handleSubmit(false)
                    }
					
				} else {
					Message.error(values ? '编辑失败' : '添加失败')
					return false
				}
			}
		})
	}
	choose = (value) => {
		this.props.form.setFieldsValue({ police_unit_organization_code: [] })
		this.props.form.setFieldsValue({ label_area_id: '' })
		this.props.form.setFieldsValue({ label_line_id: '' })
		this.props.form.setFieldsValue({ id: '' })
		// this.props.form.setFieldsValue({'police_unit_organization_name': value})
		console.log(value)
		// userIds = []
		this.setState({ onLine: false, onArea: false, onPlice: false })
		//  this.props.changeOrganization()
		if (value) {
			this.props.getGpsList(value)
			this.props.findUserByDeptList(value)
		}
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
		this.setState({ onLine: true, onArea: true, onPlice: true })
		this.props.form.resetFields()
		this.props.handleModalVisible()
		// userIds = []
	}
	// changeState = () =>{
	//     if(this.props.values){
	//         if()
	//     this.setState({isArea:true,isLine:true})
	// }
	// }
	render() {
		const {
			values,
			modalVisible,
			loading,
			handleModalVisible,
			form,
			policeUnitData,
			policeList,
			isArea,
			isLine,
			labelArea,
			labelLine,
			isUser,
			userPlice
			// service: { labelArea, labelLine }
		} = this.props
		// console.log(policeUnitData)
		const { getFieldDecorator } = form
		const { onLine, onArea, onPlice } = this.state
		this.loopUse(policeUnitData)
		//    this.changeState()
		// console.log(values)

		// console.log(userIds)
		return (
			<Modal
				destroyOnClose
				confirmLoading={loading}
				title={values ? '编辑警力单元' : '添加警力单元'}
				visible={modalVisible}
				maskClosable={false}
				centered={true}
				onOk={this.okHandle}
				onCancel={() => this.handleModalVisible()}
			>
				<FormItem {...formItemLayout} label="名称">
					{getFieldDecorator('police_unit_name', {
						rules: [
							{
								required: true,
								message: '必需输入名称'
							}
						],
						initialValue: values ? values.police_unit_name : ''
					})(<Input placeholder="请输入名称" maxLength="50" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="警力类型">
					{getFieldDecorator('police_unit_type', {
						rules: [
							{
								required: true,
								message: `必需选择警力类型`
							}
						],
						initialValue: values ? values.police_unit_type : ''
					})(
						<Select {...TreeSelectProps}>
							{policeList &&
								policeList.map((v, k) => (
									<Option value={v.code} key={v.code}>
										{v.name}
									</Option>
								))}
						</Select>
					)}
				</FormItem>
				<FormItem {...formItemLayout} label="所属单位">
					{getFieldDecorator('police_unit_organization_code', {
						initialValue: values ? values.police_unit_organization_code : '',
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
				{isUser ? (
					<FormItem {...formItemLayout} label="警员">
						{getFieldDecorator('ids', {
							rules: [
								{
									required: true,
									message: `必需选择警员`
								}
							],
							initialValue: onPlice ? (values ? values.userIds : []) : []
						})(
							<Select {...TreeSelectProps} optionFilterProp="children" mode="multiple">
								{userPlice &&
									userPlice.map((v, k) => (
										<Option value={v.id} key={v.id}>
											{v.policeName}
										</Option>
									))}
							</Select>
						)}
					</FormItem>
				) : null}
				{isArea ? (
					<FormItem {...formItemLayout} label="巡逻区域">
						{getFieldDecorator('label_area_id', {
							rules: [
								//   {
								//     required: true,
								//     message: `必需选择巡逻区域`
								//   }
							],
							initialValue: onArea ? (values ? values.label_area_id : '') : ''
						})(
							<Select
								{...TreeSelectProps}
								allowClear={true}
								onChange={(value) => {
									this.props.form.setFieldsValue({ label_line_id: '' })
									this.setState({ onLine: false })
									this.props.chooseArea(value)
								}}
							>
								{labelArea &&
									labelArea.map((v, k) => (
										<Option value={v.label_id} key={v.label_id}>
											{v.label_name}
										</Option>
									))}
							</Select>
						)}
					</FormItem>
				) : null}
				{isLine ? (
					<FormItem {...formItemLayout} label="巡逻线路">
						{getFieldDecorator('label_line_id', {
							rules: [
								//   {
								//     required: true,
								//     message: `必需选择巡逻线路`
								//   }
							],
							initialValue: onLine ? (values ? values.label_line_id : '') : ''
						})(
							<Select {...TreeSelectProps} allowClear={true}>
								{labelLine &&
									labelLine.map((v, k) => (
										<Option value={v.label_id} key={v.label_id}>
											{v.label_name}
										</Option>
									))}
							</Select>
						)}
					</FormItem>
				) : null}
			</Modal>
		)
	}
}

export default Form.create()(FormModal)
