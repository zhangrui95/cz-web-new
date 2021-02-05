import React, { Component } from 'react'
import { Button, Col, Form, Input, Row, Select, List, Message } from 'antd'
import moment from 'moment'
import { connect } from 'dva'
const FormItem = Form.Item
const { Option } = Select
import styles from './../style.less'
import { phoneRule, plateNumRule, cardNoRule, ipRule, onlyNumber } from '@/utils/validator'
@connect(({ addVehicle, loading }) => ({
	addVehicle,
	loading: loading.models.addVehicle
}))
class equipmentForm extends Component {
	state = {
		deviceType: '',
		streaming: '',
		configurationL: '',
		snapType: '',
		snapFirm: ''
	}
	componentDidMount() {
		this.queryDictionary()
		this.queryConfiguration()
		this.querySnapType()
		this.querySnapFirm()
	}
	queryDictionary = () => {
		const { dispatch } = this.props
		dispatch({
			type: 'addVehicle/dictionaryQuery',
			payload: { code: window.configUrl.dictionariesStreaming },
			success: (e) => {
				this.setState({
					streaming: e[0].code
				})
			}
		})
	}
	queryConfiguration = () => {
		const { dispatch } = this.props
		dispatch({
			type: 'addVehicle/dictionaryQuery',
			payload: { code: window.configUrl.dictionariesConfiguration },
			success: (e) => {
				this.setState({
					configurationL: e[0].code
				})
			}
		})
	}
	querySnapType = () => {
		const { dispatch } = this.props
		dispatch({
			type: 'addVehicle/dictionaryQuery',
			payload: { code: window.configUrl.dictionariesSnap },
			success: (e) => {
				this.setState({
					snapType: e[0].code
				})
			}
		})
	}
	querySnapFirm = () => {
		const { dispatch } = this.props
		dispatch({
			type: 'addVehicle/dictionaryQuery',
			payload: { code: window.configUrl.dictionariesCapture },
			success: (e) => {
				this.setState({
					snapFirm: e[0].code
				})
			}
		})
	}
	handleSubmit = (e) => {
		const {
			form,
			dispatch,
			value,
			deviceType,
			files,
			addVehicle: {
				streamingFormat, //码流格式
				configuration, //主机配置模块
				snapType, //抓拍类型
				snapFirm //抓拍设备厂商
			},
			type,
			edit
		} = this.props
		console.log('//////////', this.props)
		e.preventDefault()
		let payload = {}
		form.validateFields((err, fieldsValue) => {
			console.log('\\\\\\\\', fieldsValue)
			if (err) return
			const formData = {
				device_message: {
					bfmldz: fieldsValue.bfmldz,
					bfmlgs: fieldsValue.bfmlgs,
					cth: fieldsValue.cth,
					imei: fieldsValue.imei,
					ip: fieldsValue.ip,
					jdlx: fieldsValue.jdlx,
					mldz: fieldsValue.mldz,
					mlgs: fieldsValue.mlgs,
					password: fieldsValue.password,
					port: fieldsValue.port,
					pzmk: fieldsValue.pzmk,
					sbcs: fieldsValue.sbcs,
					sbdsfbm: fieldsValue.sbdsfbm,
					sbms: fieldsValue.sbms,
					sbxh: fieldsValue.sbxh,
					sim: fieldsValue.sim,
					tdh: fieldsValue.tdh,
					username: fieldsValue.username,
					xsqxh: fieldsValue.xsqxh,
					zplx: fieldsValue.zplx
				},
				device_name: fieldsValue.device_name,
				device_type: deviceType,
				vehicle_id: files
			}
			if (deviceType == '5011701') {
				payload = {
					...formData,
					device_message: {
						...formData.device_message,
						bfmlgs_name: streamingFormat.find((v) => v.code == fieldsValue.bfmlgs).name,
						mlgs_name: streamingFormat.find((v) => v.code == fieldsValue.mlgs).name
					}
				}
			} else if (deviceType == '5011703') {
				payload = {
					...formData,
					device_message: {
						...formData.device_message,
						mlgs_name: streamingFormat.find((v) => v.code == fieldsValue.mlgs).name
					}
				}
			} else if (deviceType == '5011705') {
				payload = {
					...formData,
					device_message: {
						...formData.device_message,
						pzmk_name: configuration.find((v) => v.code == fieldsValue.pzmk).name
					}
				}
			} else if (deviceType == '5011706') {
				payload = {
					...formData,
					device_message: {
						...formData.device_message,
						zplx_name: snapType.find((v) => v.code == fieldsValue.zplx).name,
						sbcs_name: snapFirm.find((v) => v.code == fieldsValue.sbcs).name
					}
				}
			} else {
				payload = { ...formData }
			}

			if (type == 'edit') {
				payload = {
					...payload,
					device_id: edit
				}
			} else {
				console.log(5555)
				payload = { ...payload }
			}
			console.log(payload)
			dispatch({
				type: this.interfaceName(),
				payload: payload,
				success: (e) => {
					if (e.result.reason.code == '200') {
						Message.success(type  == 'edit' ? '编辑成功' : '添加成功')
						form.setFieldsValue()
						window.g_app._history.goBack()
					} else {
						Message.error(type  == 'edit' ? '编辑失败' : '添加失败')
						return false
					}
				}
			})

		})
	}
	interfaceName = () => {
		const { type } = this.props
		return type == 'new' ? 'addVehicle/createEquipments' : 'addVehicle/updateEquipments'
	}
	render() {
		const {
			form,
			deviceType,
			addVehicle: {
				streamingFormat, //码流格式
				configuration, //主机配置模块
				snapType, //抓拍类型
				snapFirm //抓拍设备厂商
			},
			type,
			value,
			loading,
			isClick
		} = this.props
		// const { deviceType } = this.state;
		const { getFieldDecorator } = form
		const formItemLayout = {
			labelCol: { span: 18 },
			wrapperCol: { span: 6 }
		}
		let list = []
		let device_name = '',
			model_num = '',
			describe = '',
			coding = ''
		// console.log(window.configUrl)
		switch (deviceType) {

			case '5011701':
				list = [
					{ name: '厂商', type: 'sbcs', required: true, floor: '2', rule: '', maxLength: '25' },
					{ name: '型号', type: 'sbxh', required: false, floor: '2', rule: '', maxLength: '25' },
					{ name: '用户名', type: 'username', required: true, floor: '2', rule: '', maxLength: '25' },
					{ name: '密码', type: 'password', required: true, floor: '2', rule: '', maxLength: '25' },
					{ name: 'ip', type: 'ip', required: true, floor: '2', rule: 'ipRule', maxLength: '' },
					{ name: '端口', type: 'port', required: true, floor: '2', rule: 'number', maxLength: '10' },
					// {name: '码流地址',type: 'mldz', required: true, floor:'2', rule: '', maxLength: '25'},
					// {name: '播放码流地址',type: 'bfmldz', required: false, floor:'2', rule: '', maxLength: '25'},
					{ name: 'sim卡信息', type: 'sim', required: false, floor: '2', rule: '', maxLength: '250' },
					{ name: '相机名称', type: 'device_name', required: true, floor: '1', rule: '', maxLength: '25' },
					{ name: '通道号', type: 'tdh', required: true, floor: '2', rule: 'number', maxLength: '20' },
					{ name: '相机描述', type: 'sbms', required: false, floor: '2', rule: '', maxLength: '250' },
					{ name: '第三方注册编码', type: 'sbdsfbm', required: true, floor: '2', rule: '', maxLength: '50' },
					{ name: '码流格式', type: 'mlgs', required: true, floor: '2', rule: '', maxLength: '25' },
					{ name: '播放码流格式', type: 'bfmlgs', required: true, floor: '2', rule: '', maxLength: '25' }
				]
				break
			case '5011702':
				list = [
					{ name: '厂商', type: 'sbcs', required: true, floor: '2', rule: '', maxLength: '25' },
					{ name: '型号', type: 'sbxh', required: false, floor: '2', rule: '', maxLength: '25' },
					{ name: '用户名', type: 'username', required: true, floor: '2', rule: '', maxLength: '25' },
					{ name: '密码', type: 'password', required: true, floor: '2', rule: '', maxLength: '25' },
					{ name: 'ip', type: 'ip', required: true, floor: '2', rule: 'ipRule', maxLength: '' },
					{ name: '端口', type: 'port', required: true, floor: '2', rule: 'number', maxLength: '10' },
					{ name: 'sim卡信息', type: 'sim', required: false, floor: '2', rule: '', maxLength: '250' },
					{ name: '视频主机名称', type: 'device_name', required: true, floor: '1', rule: '', maxLength: '25' },
					{ name: '视频主机描述', type: 'sbms', required: false, floor: '2', rule: '', maxLength: '250' },
					{ name: '第三方注册编码', type: 'sbdsfbm', required: true, floor: '2', rule: '', maxLength: '50' }
				]
				break
			case '5011703':
				list = [
					{ name: '厂商', type: 'sbcs', required: true, floor: '2', rule: '', maxLength: '25' },
					{ name: '型号', type: 'sbxh', required: false, floor: '2', rule: '', maxLength: '25' },
					{ name: '用户名', type: 'username', required: true, floor: '2', rule: '', maxLength: '25' },
					{ name: '密码', type: 'password', required: true, floor: '2', rule: '', maxLength: '25' },
					{ name: 'ip', type: 'ip', required: true, floor: '2', rule: 'ipRule', maxLength: '' },
					{ name: '端口', type: 'port', required: true, floor: '2', rule: 'number', maxLength: '10' },
					// {name: '码流地址',type: 'mldz', required: false, floor:'2', rule: '', maxLength: '25'},
					{ name: 'sim卡信息', type: 'sim', required: false, floor: '2', rule: '', maxLength: '250' },
					{ name: 'nvr名称', type: 'device_name', required: true, floor: '1', rule: '', maxLength: '25' },
					{ name: 'nvr描述', type: 'sbms', required: false, floor: '2', rule: '', maxLength: '250' },
					{ name: '码流格式', type: 'mlgs', required: true, floor: '2', rule: '', maxLength: '25' }
				]
				break
			case '5011704':
				list = [
					{ name: '厂商', type: 'sbcs', required: true, floor: '2', rule: '', maxLength: '25' },
					{ name: '型号', type: 'sbxh', required: false, floor: '2', rule: '', maxLength: '25' },
					{ name: '车台号', type: 'cth', required: true, floor: '2', rule: '', maxLength: '25' },
					{ name: '车台名称', type: 'device_name', required: true, floor: '1', rule: '', maxLength: '25' },
					{ name: '车台描述', type: 'sbms', required: false, floor: '2', rule: '', maxLength: '250' }
				]
				break
			case '5011705':
				list = [
					{ name: '主机IMEI', type: 'imei', required: true, floor: '2', rule: '', maxLength: '25' },
					{ name: '厂商', type: 'sbcs', required: true, floor: '2', rule: '', maxLength: '25' },
					{ name: '主机型号', type: 'sbxh', required: false, floor: '2', rule: '', maxLength: '25' },
					{ name: '主机名称', type: 'device_name', required: true, floor: '1', rule: '', maxLength: '25' },
					{ name: '主机描述', type: 'sbms', required: false, floor: '2', rule: '', maxLength: '250' },
					{ name: '主机配置模块', type: 'pzmk', required: true, floor: '2', rule: '', maxLength: '25' }
				]
				break
			case '5011706':
				list = [
					{ name: '型号', type: 'sbxh', required: false, floor: '2', rule: '', maxLength: '25' },
					{ name: 'ip', type: 'ip', required: true, floor: '2', rule: 'ipRule', maxLength: '' },
					{ name: '抓拍设备名称', type: 'device_name', required: true, floor: '1', rule: '', maxLength: '25' },
					{ name: '抓拍设备描述', type: 'sbms', required: false, floor: '2', rule: '', maxLength: '250' },
					{ name: '抓拍类型', type: 'zplx', required: true, floor: '2', rule: '', maxLength: '25' },
					{ name: '抓拍设备厂商', type: 'sbcs', required: true, floor: '2', rule: '', maxLength: '25' }
				]
				break
			case '5011707':
				list = [
					{ name: '厂商', type: 'sbcs', required: false, floor: '2', rule: '', maxLength: '25' },
					{ name: '警灯类型', type: 'jdlx', required: false, floor: '2', rule: '', maxLength: '25' },
					{ name: '警灯名称', type: 'device_name', required: true, floor: '1', rule: '', maxLength: '25' },
					{ name: '警灯描述', type: 'sbms', required: false, floor: '2', rule: '', maxLength: '250' }
				]
				break
			case '5011708':
				list = [
					{ name: '厂商', type: 'sbcs', required: true, floor: '2', rule: '', maxLength: '25' },
					{ name: '平板型号', type: 'sbxh', required: false, floor: '2', rule: '', maxLength: '25' },
					{ name: '平板名称', type: 'device_name', required: true, floor: '1', rule: '', maxLength: '25' },
					{ name: '平板描述', type: 'sbms', required: false, floor: '2', rule: '', maxLength: '250' }
				]
				break
			default:
				break
		}

		return (
			<Form className="ant-advanced-search-form" onSubmit={this.handleSubmit}>
				<Row gutter={24}>
					<List loading={loading}>
						{list.map((v, k) => (
							<Col span={12} key={k}>
								{v.type == 'mlgs' ? (
									<Form.Item label={v.name}>
										{getFieldDecorator(`${v.type}`, {
											rules: [
												{
													required: v.required,
													message: `请填写${v.name}`
												}
											],
											initialValue: type == 'edit' ? value.device_message[v.type] : ''
										})(
											<Select placeholder="" onChange={this.handleSelectChange}>
												{streamingFormat &&
													streamingFormat.map((item) => (
														<Option value={item.code} key={item.code}>
															{item.name}
														</Option>
													))}
											</Select>
										)}
									</Form.Item>
								) : v.type == 'bfmlgs' ? (
									<Form.Item label={v.name}>
										{getFieldDecorator(`${v.type}`, {
											rules: [
												{
													required: v.required,
													message: `请填写${v.name}`
												}
											],
											initialValue: type == 'edit' ? value.device_message[v.type] : ''
										})(
											<Select placeholder="" onChange={this.handleSelectChange}>
												{streamingFormat &&
													streamingFormat.map((item) => (
														<Option value={item.code} key={item.code}>
															{item.name}
														</Option>
													))}
											</Select>
										)}
									</Form.Item>
								) : v.type == 'pzmk' ? (
									<Form.Item label={v.name}>
										{getFieldDecorator(`${v.type}`, {
											rules: [
												{
													required: v.required,
													message: `请填写${v.name}`
												}
											],
											initialValue: type == 'edit' ? value.device_message[v.type] : ''
										})(
											<Select placeholder="" onChange={this.handleSelectChange}>
												{configuration &&
													configuration.map((item) => (
														<Option value={item.code} key={item.code}>
															{item.name}
														</Option>
													))}
											</Select>
										)}
									</Form.Item>
								) : v.type == 'zplx' ? (
									<Form.Item label={v.name}>
										{getFieldDecorator(`${v.type}`, {
											rules: [
												{
													required: v.required,
													message: `请填写${v.name}`
												}
											],
											initialValue: type == 'edit' ? value.device_message[v.type] : ''
										})(
											<Select placeholder="" onChange={this.handleSelectChange}>
												{snapType &&
													snapType.map((item) => (
														<Option value={item.code} key={item.code}>
															{item.name}
														</Option>
													))}
											</Select>
										)}
									</Form.Item>
								) : v.name == '抓拍设备厂商' ? (
									<Form.Item label={v.name}>
										{getFieldDecorator(`${v.type}`, {
											rules: [
												{
													required: v.required,
													message: `请填写${v.name}`
												}
											],
											initialValue: type == 'edit' ? value.device_message[v.type] : ''
										})(
											<Select placeholder="" onChange={this.handleSelectChange}>
												{snapFirm &&
													snapFirm.map((item) => (
														<Option value={item.code} key={item.code}>
															{item.name}
														</Option>
													))}
											</Select>
										)}
									</Form.Item>
								) : v.type == 'sbms' ? (
									<Form.Item label={v.name}>
										{getFieldDecorator(`${v.type}`, {
											rules: [
												{
													required: v.required,
													message: `请填写${v.name}`
												}
											],
											initialValue: type == 'edit' ? value.device_message[v.type] : ''
										})(
											<Input.TextArea autoSize={{ minRows: 3, maxRows: 5 }} placeholder="" maxLength={v.maxLength} />
										)}
									</Form.Item>
								): (
									<Form.Item label={v.name}>
										{getFieldDecorator(`${v.type}`, {
											rules: [
												{
													required: v.required,
													message: `请填写${v.name}`
												},

												v.rule == 'ipRule' ? ipRule : '',
												v.rule == 'number' ? onlyNumber : ''
											],
											initialValue:
												type == 'edit'
													? v.floor == '1' ? value[v.type] : value.device_message[v.type]
													: ''
										})(<Input placeholder="" maxLength={v.maxLength} />)}
									</Form.Item>
								)}
							</Col>
						))}
					</List>
					<Col span={24}>
						<span className={styles.submitButtons}>
							<Button type="primary" htmlType="submit" className={styles.submitButton} disabled={isClick}>
								确认
							</Button>
							<Button
								className={styles.submitButton}
								onClick={() => window.g_app._history.goBack()}
								style={{ background: '#999999', borderColor: '#999999', color: '#fff' }}
							>
								取消
							</Button>
						</span>
					</Col>
				</Row>
			</Form>
		)
	}
}

// const equipmentForm = (props) => {

// }
export default Form.create()(equipmentForm)
// export default equipmentForm
