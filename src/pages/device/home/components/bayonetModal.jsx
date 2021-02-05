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
const bayonetList = [{
    type:1,
    name:'卡口'
},
{
    type:2,
    name:'视频卡口'
},
{
    type:3,
    name:'重点场所'
},
{
    type:4,
    name:'警务站'
}]
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
				gxdwmc: list.find((v) => fieldsValue.gxdwdm == v.code).name,
			}
			if (values) {
				payload = {
					...payload,
					bayonet_id: values.bayonet_id
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
		return values ? 'device/updateBayonet' : 'device/insertBayonet'
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
			dictionary
		} = this.props
		// console.log(policeUnitData)
		const { getFieldDecorator } = form
		this.loopUse(policeUnitData)
		return (
			<Modal
				destroyOnClose
				confirmLoading={loading}
				title={values ? '编辑卡口' : '添加卡口'}
				visible={modalVisible}
				onOk={this.okHandle}
				onCancel={this.clalModalVisible}
                maskClosable={false}
				 centered={true}
			>
				
				<FormItem {...formItemLayout} label="卡口名称">
					{getFieldDecorator('kkmc', {
						initialValue: values ? values.kkmc : '',
                        rules: [
							{
								required: true,
								message: `请填写卡口名称`
							}
						]
					})(<Input placeholder="" maxLength="50" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="卡口代码">
					{getFieldDecorator('kkdm', {
						initialValue: values ? values.kkdm : '',
                       
					})(<Input placeholder="" maxLength="50" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="卡口id">
					{getFieldDecorator('kkid', {
						initialValue: values ? values.kkid : '',
                       
					})(<Input placeholder="" maxLength="50" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="经度">
					{getFieldDecorator('jd', {
						initialValue: values ? values.jd : '',
						rules:[
							decimal,
                            {
								required: true,
								message: `请填写经度`
							}
						],
					})(<Input placeholder="" maxLength="20" />)}
				</FormItem>
				<FormItem {...formItemLayout} label="纬度">
					{getFieldDecorator('wd', {
						initialValue: values ? values.wd : '',
                        rules:[
							decimal,
                            {
								required: true,
								message: `请填写纬度`
							}
						],
					})(<Input placeholder="" maxLength="20" />)}
				</FormItem>
                <FormItem {...formItemLayout} label="卡口类型">
					{getFieldDecorator('bayonet_type', {
						initialValue: values ? values.bayonet_type : '',
                        rules: [
							{
								required: true,
								message: `必需选择卡口类型`
							}
						]
					})(<Select placeholder="请选择" style={{ width: '355px' }}>
                        {bayonetList &&
                            bayonetList.map((v) => (
                                <Option value={v.type} key={v.type}>
                                    {v.name}
                                </Option>
                                ))} 
                    </Select>)}
				</FormItem>
                <FormItem {...formItemLayout} label="来源">
					{getFieldDecorator('bayonet_source', {
						initialValue: values ? values.bayonet_source : '',
                        // rules: [
						// 	{
						// 		required: true,
						// 		message: `必需选择来源`
						// 	}
						// ]
					})(<Select placeholder="请选择" style={{ width: '355px' }}>
                            <Option value={0}> 局方 </Option>
                            <Option value={1}> 系统 </Option>
                    </Select>)}
				</FormItem>

				<FormItem {...formItemLayout} {...formItemLayout} label="所属单位">
					{getFieldDecorator('gxdwdm', {
						initialValue: values ? values.gxdwdm : '',
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
