import React, { Component } from 'react'
import { Form, Input, Modal, TreeSelect, Select, Radio, Message, Table, Tag, Divider } from 'antd'
import moment from 'moment'
import { connect } from 'dva'
const FormItem = Form.Item
const { Option } = Select
const { TreeNode } = TreeSelect
import { phoneRule, plateNumRule, decimal, onlyNumber, ipRule } from '@/utils/validator'
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

@connect(({ warningRules, anticipation, loading }) => ({
	warningRules,
	anticipation,
	loading: loading.models.warningRules
}))
class FormModal extends Component {
	constructor(props) {
		super(props)
		this.state = {
			tabs: `${this.props.values ? this.props.values.label_type : 0}`
		}
	}
	componentWillMount() {}

	componentDidMount() {
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
	okHandle = (e) => {
		const {
			form,
			handleSubmit,
			dispatch,
			loading,
			values,
			anticipation: { riskList },
			warningRules: { labelsList }
		} = this.props

		const { getFieldDecorator } = form
		e.preventDefault()

		form.validateFields((err, fieldsValue) => {
			if (err) return
			console.log(fieldsValue)

			let payload = {
				...fieldsValue,
				label_level_color: riskList.find((v) => fieldsValue.label_level_code == v.code).remark || '',
				label_level_name: riskList.find((v) => fieldsValue.label_level_code == v.code).name || '',
				label_level: riskList.find((v) => fieldsValue.label_level_code == v.code).sort || '',
                label_type: Number(fieldsValue.label_type),
				alarm_form: fieldsValue.alarm_form.map((x) => {return x}).join(',')
			}
			if (fieldsValue.label_type == '0') {
				payload = {
					...payload,
					remark: labelsList.find((v) => fieldsValue.label_code == v.code).remark || '',
					label_name: labelsList.find((v) => fieldsValue.label_code == v.code).name || '',
                    label_level: riskList.find((v) => fieldsValue.label_level_code == v.code).sort || '',
					sys_code_id: labelsList.find((v) => fieldsValue.label_code == v.code).id || ''
				}
			}
			if (values) {
				payload = {
					...payload,
					id: values.id
				}
			}
			console.log(payload)

			dispatch({
				type: values ? 'warningRules/updateLabelModel' : 'warningRules/insertLabelModel',
				payload: payload,
				success: (e) => {
					console.log(e)
					if (e.result.reason.code == '200') {
						Message.success(values ? '编辑成功' : '添加成功')
						form.setFieldsValue()
						handleSubmit()
					} else {
						Message.error(values ? '编辑失败' : '添加失败')
						return false
					}
				}
			})
		})
	}

	clalModalVisible = () => {
		const { handleModalVisible, form } = this.props
		form.resetFields()
		handleModalVisible()
	}
	tabChange = (e) => {
		console.log(e)
		this.props.form.resetFields()
		this.setState({ tabs: e.target.value })
	}
	// labelChange = files => {
	//    const { warningRules: { labelsList } } = this.props
	//     console.log(files)
	//     const name = labelsList.find(v => files == v.id).name || ''
	//     this.props.dispatch({
	// 		type: 'warningRules/existsLabel',
	// 		payload: { label_name: name },
	//         success: (e) => {
	//             console.log(e,'回调')
	//             if(e.result.reason.code == "200"){

	//             }else{
	//                 Message.error('标签已存在')
	//                 return false
	//             }
	//         }
	// 	})
	// }
	labelChange = (rule, value, callback) => {
		console.log(rule, value, callback)
		const { form: { getFieldValue }, dispatch, values, warningRules: { labelsList } } = this.props
		console.log(values, getFieldValue('label_code'), value)

		try {
			if (values) {
				if (getFieldValue('label_code') == values.label_code) {
					console.log('没有更改')
					callback()
				} else {
					console.log('更改')
					if (getFieldValue('label_code') != '') {
						console.log('更改不为空')
						dispatch({
							type: 'warningRules/existsLabel',
							payload: {
								label_name: labelsList.find((v) => getFieldValue('label_code') == v.code).name || ''
							},
							success: (e) => {
								console.log(e)
								if (e.result.reason.code == '200') {
									// if (e.result.vehicle == null) {
									callback()
									// } else {
									// 	callback('车牌号码已存在')
									// }
								} else {
									callback('标签已存在')
								}
							}
						})
					} else {
						console.log('更改为空')
						callback()
					}
				}
			} else {
				console.log('更改2')
				if (getFieldValue('label_code') != '') {
					console.log('更改不为空')
					dispatch({
						type: 'warningRules/existsLabel',
						payload: {
							label_name: labelsList.find((v) => getFieldValue('label_code') == v.code).name || ''
						},
						success: (e) => {
							console.log(e)
							if (e.result.reason.code == '200') {
								// if (e.result.vehicle == null) {
								callback()
								// }
							} else {
								callback('标签已存在')
							}
						}
					})
				} else {
					console.log('更改为空')
					callback()
				}
			}
		} catch (err) {
			callback(err)
		}

		//   }
	}
	nameChange = (rule, value, callback) => {
		console.log(rule, value, callback)
		const { form: { getFieldValue }, dispatch, values, warningRules: { labelsList } } = this.props
		console.log(values, getFieldValue('label_name'), value)

		try {
			if (values) {
				if (getFieldValue('label_name') == values.label_name) {
					console.log('没有更改')
					callback()
				} else {
					console.log('更改')
					if (getFieldValue('label_name') != '') {
						console.log('更改不为空')
						dispatch({
							type: 'warningRules/existsLabel',
							payload: {
								label_name: getFieldValue('label_name')
							},
							success: (e) => {
								console.log(e)
								if (e.result.reason.code == '200') {
									// if (e.result.vehicle == null) {
									callback()
									// } else {
									// 	callback('车牌号码已存在')
									// }
								} else {
									callback('标签已存在')
								}
							}
						})
					} else {
						console.log('更改为空')
						callback()
					}
				}
			} else {
				console.log('更改2')
				if (getFieldValue('label_name') != '') {
					console.log('更改不为空')
					dispatch({
						type: 'warningRules/existsLabel',
						payload: {
							label_name: getFieldValue('label_name')
						},
						success: (e) => {
							console.log(e)
							if (e.result.reason.code == '200') {
								// if (e.result.vehicle == null) {
								callback()
								// }
							} else {
								callback('标签已存在')
							}
						}
					})
				} else {
					console.log('更改为空')
					callback()
				}
			}
		} catch (err) {
			callback(err)
		}

		//   }
	}
	render() {
		const {
			values,
			modalVisible,
			loading,
			handleModalVisible,
			handleSubmit,
			form,
			anticipation: { riskList },
			warningRules: { labelsList }
		} = this.props
		const { getFieldDecorator } = form
		return (
			<Modal
				destroyOnClose
				confirmLoading={loading}
				title={values ? '编辑标签模型' : '添加标签模型'}
				visible={modalVisible}
				onOk={this.okHandle}
				onCancel={this.clalModalVisible}
				maskClosable={false}
				centered={true}
			>
				<Form.Item {...formItemLayout} label="标签类型">
					{getFieldDecorator('label_type', {
						rules: [
							{
								required: true,
								message: '请选择标签类型'
							}
						],
						initialValue: values ? `${values.label_type}` : this.state.tabs
					})(
						<Radio.Group buttonStyle="solid" onChange={this.tabChange} disabled={values}>
							<Radio.Button value={'0'}>盘查标签</Radio.Button>
							<Radio.Button value={'1'}>自定义标签</Radio.Button>
						</Radio.Group>
					)}
				</Form.Item>
				{this.state.tabs == '0' ? (
					<FormItem {...formItemLayout} label="标签名称">
						{getFieldDecorator('label_code', {
							rules: [
								{
									required: true,
									message: '请选择标签名称'
								},
								{
									validator: this.labelChange
								}
							],
							initialValue: values ? values.label_code : ''
						})(
							<Select {...TreeSelectProps}>
								{labelsList &&
									labelsList.map((v) => (
										<Option value={v.code} key={v.code}>
											{v.name}
										</Option>
									))}
							</Select>
						)}
					</FormItem>
				) : (
					<FormItem {...formItemLayout} label="标签名称">
						{getFieldDecorator('label_name', {
							rules: [
								{
									required: true,
									message: '请输入标签名称'
								},
								{ validator: this.nameChange }
							],
							initialValue: values ? values.label_name : ''
						})(<Input placeholder="" maxLength="10" />)}
					</FormItem>
				)}

				<FormItem {...formItemLayout} label="标签等级">
					{getFieldDecorator('label_level_code', {
						rules: [
							{
								required: true,
								message: '请选择标签等级'
							}
						],
						initialValue: values ? values.label_level_code : ''
					})(
						<Select placeholder="" {...TreeSelectProps}>
							{riskList &&
								riskList.map((v) => (
									<Option value={v.code} key={v.code}>
										<Tag
											color={v.remark}
											style={{ width: '5px', height: '10px', display: 'inline-block' }}
										/>
										{v.name}
									</Option>
								))}
						</Select>
					)}
				</FormItem>

				<FormItem {...formItemLayout} label="配置规则">
					{getFieldDecorator('is_config_rule', {
						rules: [
							{
								required: true,
								message: '请选择配置规则'
							}
						],
						initialValue: values ? values.is_config_rule : ''
					})(
						<Radio.Group>
							<Radio value={0}>否</Radio>
							{/* {this.state.tabs == '0' ? <Radio value={1}>是</Radio> : null} */}
						</Radio.Group>
					)}
				</FormItem>

				<FormItem {...formItemLayout} label="预警形式">
					{getFieldDecorator('alarm_form', {
						rules: [
							// {
							// 	required: this.state.tabs == '0' ? true : false,
							// 	message: '请选择预警形式'
							// }
						],
						initialValue: values ? values.alarm_form_array : []
					})(
						<Select {...TreeSelectProps} mode="multiple">
							<Option value={'0'}>研判预警</Option>
							<Option value={'1'}>系统预警</Option>
							<Option value={'2'}>联合预警</Option>
						</Select>
					)}
				</FormItem>
				<FormItem {...formItemLayout} label="标签分类">
					{getFieldDecorator('label_type_code', {
						rules: [
							{
								required: true,
								message: '请选择标签分类'
							}
						],
						initialValue: values ? values.label_type_code : ''
					})(
						<Select {...TreeSelectProps}>
							<Option value={0}>人员</Option>
							<Option value={1}>车辆</Option>
							<Option value={2}>船只</Option>
						</Select>
					)}
				</FormItem>
				{this.state.tabs == '0' ? (
					<FormItem {...formItemLayout} label="是否新增重点人">
						{getFieldDecorator('key_person_type', {
							rules: [
								{
									required: true,
									message: '请选择是否新增重点人'
								}
							],
							initialValue: values ? values.key_person_type : ''
						})(
							<Radio.Group>
								<Radio value={0}>否</Radio>
								<Radio value={1}>是</Radio>
							</Radio.Group>
						)}
					</FormItem>
				) : null}
				<FormItem {...formItemLayout} label="处置措施">
					{getFieldDecorator('take_step', {
						initialValue: values ? values.take_step : ''
					})(<Input placeholder="" maxLength="100" />)}
				</FormItem>
			</Modal>
		)
	}
}

export default Form.create()(FormModal)
