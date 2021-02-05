import React, { Component } from 'react'
import { Form, Input, Modal, TreeSelect, Select, Radio, Message, Table, Tag, Divider, Button, Row, Col } from 'antd'
import moment from 'moment'
import { connect } from 'dva'
const FormItem = Form.Item
import AddWarningRules from '../../warningRules/components/FormModal'
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
class toRead extends Component {
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
			personnelDetails: { personInfor }
		} = this.props

		const { getFieldDecorator } = form
		e.preventDefault()

		form.validateFields((err, fieldsValue) => {
			if (err) return
			console.log(fieldsValue, list)

			let payload = {
				...fieldsValue,
				name: personInfor.name,
				person_id: personInfor.id,
				study_judge_level_name: riskList.find((v) => v.code == fieldsValue.study_judge_level_code).name || '',
                study_judge_level_color: riskList.find((v) => v.code == fieldsValue.study_judge_level_code).remark || ''
			}
            if(fieldsValue.label_code){
                payload={
                    ...payload,
                    label_name: list.find((v) => v.label_code == fieldsValue.label_code).label_name || '',
                label_id: list.find((v) => v.label_code == fieldsValue.label_code).id || ''
                }
            }
			console.log(payload)

			dispatch({
				type: 'personnelDetails/insertStudyJudge',
				payload: payload,
				success: (e) => {
					console.log(e)
					if (e.result.reason.code == '200') {
						Message.success('研判成功')
						form.setFieldsValue()
						handleSubmit()
					} else {
						Message.error('研判失败')
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
	handleCreateLableVisible = (files) => {
		const { dispatch,  } = this.props
		const pages = {
			currentPage: 1,
			showCount: 999
		}
		const param = {
			...pages,
			pd: {}
		}
		this.setState({ createLableVisible: !!files }, () => {
			if (!files) {
				dispatch({
					type: 'warningRules/queryLabelModelList',
					payload: param
				})
			}
		})
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
		console.log(this.state.createLableVisible)
		const addModel = {
			modalVisible: this.state.createLableVisible,
			handleModalVisible: this.handleCreateLableVisible,
			handleSubmit: this.handleCreateLableVisible
			// policeData: useList,
		}
		const { getFieldDecorator } = form
		return (
			<div>
				<Modal
					destroyOnClose
					confirmLoading={loading}
					title={'研判'}
					visible={modalVisible}
					onOk={this.okHandle}
					onCancel={this.clalModalVisible}
					maskClosable={false}
					centered={true}
				>
					<FormItem {...formItemLayout} label="危险级别">
						{getFieldDecorator('study_judge_level_code', {
							rules: [
								{
									required: true,
									message: '请选择危险级别'
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

					<FormItem {...formItemLayout} label="变更说明">
						{getFieldDecorator('study_judge_description', {
							rules: [
								{
									required: true,
									message: '请输入变更说明'
								}
							]
						})(
							<Input.TextArea
								autoSize={{ minRows: 3, maxRows: 5 }}
								placeholder="请输入变更说明"
								style={{ width: '354px' }}
								maxLength="100"
							/>
						)}
					</FormItem>
					<FormItem {...formItemLayout} label="处置方案">
						{getFieldDecorator(
							'take_step',
							{
								rules: [
									{
										required: true,
										message: '请输入处置方案'
									}
								],
							}
						)(<Input maxLength="25" placeholder="请输入处置方案" />)}
					</FormItem>

					<FormItem {...formItemLayout} label="标签">
						<Row>
							<Col span={18}>
								{getFieldDecorator('label_code', {})(
									<Select style={{ width: '260px' }} placeholder="请选择标签">
										{list &&
											list.map((v) => (
												<Option value={v.label_code} key={v.label_code}>
													{v.label_name}
												</Option>
											))}
									</Select>
								)}
							</Col>
							<Col span={4}>
								<Button type="primary" onClick={() => this.handleCreateLableVisible(true)}>添加标签</Button>
							</Col>
						</Row>
					</FormItem>
				</Modal>
				<AddWarningRules {...addModel} />
			</div>
		)
	}
}

export default Form.create()(toRead)
