import React, { Component } from 'react'
import { Form, Input, Modal, TreeSelect, Select, Radio, Message, Table, Tag, Divider, Button, Row, Col } from 'antd'
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
@connect(({ personnelDetails, keyPersonnel, warningRules, loading }) => ({
	personnelDetails,
	keyPersonnel,
	warningRules,
	loading: loading.models.personnelDetails
}))
class toWarning extends Component {
	state = {
		createLableVisible: false
	}
	componentWillMount() {}
	componentDidMount() {}

	okHandle = (e) => {
		const {
			form,
			handleSubmit,
			dispatch,
			loading,
			values,
			keyPersonnel: { riskList },
			warningRules: { data: { list } },
			personnelDetails: { personInfor, waringInfor }
		} = this.props

		const { getFieldDecorator } = form
		e.preventDefault()

		form.validateFields((err, fieldsValue) => {
			if (err) return
			console.log(fieldsValue,waringInfor,'====')

			let payload = {
				...fieldsValue,
                alarm_source: 2,
                alarm_message: {},
				alarm_level_name: riskList.find((v) => v.code == fieldsValue.alarm_level_code).name || '',
                alarm_level_color: riskList.find((v) => v.code == fieldsValue.alarm_level_code).remark || ''
			}
            if(waringInfor&&waringInfor.length > 0){
                if(waringInfor[0].archives_info&&waringInfor[0].archives_info.length > 0){
                    payload = {
                        ...payload,
                        alarm_message: waringInfor[0].archives_info[0]
                    }
                }
            }
			console.log(payload)

			dispatch({
				type: 'personnelDetails/insertAlarmRecord',
				payload: payload,
				success: (e) => {
					console.log(e)
					if (e.result.reason.code == '200') {
						Message.success('预警成功')
						form.setFieldsValue()
						handleSubmit()
					} else {
						Message.error('预警失败')
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

	render() {
		const {
			values,
			modalVisible,
			loading,
			handleModalVisible,
			handleSubmit,
			form,
			keyPersonnel: { riskList },
			warningRules: { data: { list } },
			personnelDetails: { personInfor }
		} = this.props

		const { getFieldDecorator } = form
		return (
			<div>
				<Modal
					destroyOnClose
					confirmLoading={loading}
					title={'预警'}
					visible={modalVisible}
					onOk={this.okHandle}
					onCancel={this.clalModalVisible}
					maskClosable={false}
					centered={true}
				>
					<FormItem {...formItemLayout} label="预警等级">
						{getFieldDecorator('alarm_level_code', {
							rules: [
								{
									required: true,
									message: '请选择预警等级'
								}
							]
						})(
							<Radio.Group>
								{riskList &&
									riskList.map((v) => (
										<Radio value={v.code} key={v.code}>
											<Tag
												color={v.remark}
												style={{ width: '5px', height: '10px', display: 'inline-block' }}
											/>
											{v.name}
										</Radio>
									))}
							</Radio.Group>
						)}
					</FormItem>

					<FormItem {...formItemLayout} label="处置措施">
						{getFieldDecorator('take_step', {
							rules: [
								{
									required: true,
									message: '请输入处置措施'
								}
							]
						})(<Input maxLength="25" placeholder="请输入处置措施" />)}
					</FormItem>
					<FormItem {...formItemLayout} label="预警方式">
						{getFieldDecorator('alarm_form', {
							rules: [
								{
									required: true,
									message: '请选择预警方式'
								}
							]
						})(
							<Select {...TreeSelectProps} mode="multiple">
								<Option value={0}>系统预警</Option>
								<Option value={1}>第三方预警</Option>
							</Select>
						)}
					</FormItem>
                    <FormItem {...formItemLayout} label="预警类型">
						{getFieldDecorator('alarm_type', {
							rules: [
								{
									required: true,
									message: '请选择预警类型'
								}
							]
						})(
							<Select {...TreeSelectProps} >
								<Option value={0}>人员异常</Option>
								<Option value={3}>人员频繁接触</Option>
                                <Option value={4}>人员轨迹异常</Option>
							</Select>
						)}
					</FormItem>
				</Modal>
			</div>
		)
	}
}

export default Form.create()(toWarning)
