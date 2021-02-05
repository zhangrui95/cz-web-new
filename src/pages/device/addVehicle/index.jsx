import {
	Button,
	Card,
	Col,
	DatePicker,
	Form,
	Input,
	Row,
	Select,
	List,
	Message,
	Pagination,
	Radio,
	Table,
	Tag,
	Divider
} from 'antd'
import React, { Component } from 'react'
import moment from 'moment'
import { connect } from 'dva'
import SwitchTag from '@/components/SwitchTag'
import styles from './style.less'
import { cardList } from '@/utils/utils'
import CarListForm from './compontent/carListForm'
import DeviceForm from './compontent/deviceForm'
import SwanForm from './compontent/swanForm'
const FormItem = Form.Item
const { Option } = Select

@connect(({ addVehicle, loading, vehicle }) => ({
	addVehicle,
	vehicle,
	loading: loading.models.addVehicle
}))
class addVehicle extends Component {
	state = {
		formValues: {},
		value: 1,
		loading: false,
		data: [],
		pagination: {},
		deviceType: '',
		isClick: false
	}

	componentDidMount() {
		const { dispatch, match: { params: { files, type, expandForm } } } = this.props
		if (type == 'edit') {
			this.getDevicesById()
		}
		if (expandForm == '1') {
			this.getDetailById()
		} else {
			this.getBayonetById()
		}
		this.queryDictionary()
		this.getDevicesList()
		this.queryDictionaryVehicle()
	}
	getBayonetById = () => {
		const { dispatch, match: { params: { files } } } = this.props
		dispatch({
			type: 'vehicle/fetchBayonetById',
			payload: { bayonet_id: files }
		})
	}
	getDevicesById = () => {
		const { dispatch, match: { params: { files, type, edit } } } = this.props
		console.log(this.props)
		dispatch({
			type: 'addVehicle/fetchDevicesById',
			payload: { device_id: edit }
		})
	}
	getDetailById = () => {
		const { dispatch, match: { params: { files, type } } } = this.props
		console.log(this.props)
		dispatch({
			type: 'addVehicle/fetchDetailById',
			payload: { vehicle_id: files }
		})
	}

	getDetailById = () => {
		const { dispatch, match: { params: { files, type } } } = this.props
		console.log(this.props)
		dispatch({
			type: 'addVehicle/fetchDetailById',
			payload: { vehicle_id: files }
		})
	}
	getDevicesList = () => {
		const { dispatch, match: { params: { files } } } = this.props
		dispatch({
			type: 'addVehicle/fetchDevicesList',
			payload: { vehicle_id: files }
		})
	}
	queryDictionaryVehicle = () => {
		console.log(88888888888888)
		const { dispatch, match: { params: { files } } } = this.props
		dispatch({
			type: 'addVehicle/dictionaryQuery',
			payload: { code: window.configUrl.dictionariesVehicle },
			success: (e) => {
				console.log(e)

				// this.queryFacility( e[0].code)
			}
		})
	}
	queryDictionary = () => {
		const { dispatch, match: { params: { files } } } = this.props
		dispatch({
			type: 'addVehicle/dictionaryQuery',
			payload: { code: window.configUrl.dictionariesDevice },
			success: (e) => {
				console.log(e)
				this.setState({
					deviceType: e[0].code
				})

				// this.queryFacility( e[0].code)
			}
		})
	}

	handleSelectChange = (value) => {
		console.log(value)

		this.props.form.resetFields()
		this.setState({ isClick: false })
		if (value == '5011705') {
			this.queryFacility(value)
		}
		if (value == '5011708') {
			this.queryFacility(value)
		}
		this.setState({
			deviceType: value
		})
	}
	queryFacility = (value) => {
		const { dispatch, deviceType, match: { params: { files } } } = this.props
		const _self = this

		console.log(deviceType)
		dispatch({
			type: 'addVehicle/queryFacility',
			payload: {
				device_type: value,
				vehicle_id: files
			},
			success: (e) => {
				console.log(e)
				if (e.result.reason.code == '200') {
					if (Number(e.result.device.deviceCount) > 0) {
						Message.error('该类型已存在，不能重复添加！')
						_self.setState({ isClick: true })
					}
				} else {
					return false
				}
			}
		})
	}
	render() {
		const { deviceType } = this.state
		console.log(this.props)
		const {
			form,
			addVehicle: { dictionary, data, deviceDetail, dictionaryVehicle },
			vehicle: { bayonet },
			match: { params: { files, type, edit, expandForm } },
			loading
		} = this.props
		console.log(dictionaryVehicle)
		const showInformation = {
			data: expandForm == '1' ? data : bayonet,
			loading: loading,
			form: form,
			dictionaryVehicle: dictionaryVehicle
		}
		const deviceFormState = {
			deviceType: type == 'edit' ? deviceDetail.device_type : deviceType,
			loading: loading,
			form: form,
			value: type == 'edit' ? deviceDetail : {},
			type: type,
			files: files,
			edit: edit,
			isClick: this.state.isClick
		}
		const { getFieldDecorator } = form
		return (
			<div>
				<Row gutter={[ 8, 16 ]}>
					<Col span={7}>
						<Card bordered={false} className={styles.tableListCard}>
							<div className={styles.headTitle}>
								<h2 className={styles.h2Color}>{expandForm == '1' ? '车辆信息' : '卡口信息'}</h2>
							</div>
							<div className={styles.tableListForm}>
								{/* {this.renderForm()} */}
								{expandForm == '1' ? (
									<CarListForm {...showInformation} />
								) : (
									<SwanForm {...showInformation} />
								)}
							</div>
						</Card>
					</Col>
					<Col span={17}>
						<Card bordered={false} className={styles.tableListCard}>
							<div className={styles.headTitle}>
								<h2 className={styles.h2Color}>设备信息</h2>
							</div>

							<div className={styles.tableListForm}>
								<div className={styles.vehiclType}>
									<Form>
										<FormItem label="设备类型">
											{getFieldDecorator('code', {
												initialValue:
													type == 'edit'
														? deviceDetail.device_type
														: dictionary ? deviceType : ''
											})(
												<Select
													placeholder=""
													onChange={this.handleSelectChange}
													disabled={type == 'edit' ? true : false}
												>
													{dictionary &&
														dictionary.map((v) => (
															<Option value={v.code} key={v.code}>
																{v.name}
															</Option>
														))}
													{/* <Option value="1">male</Option>
													<Option value="2">female</Option> */}
												</Select>
											)}
										</FormItem>
									</Form>
								</div>

								{console.log(deviceFormState, showInformation)}
								<div className={styles.vehiclForm}>
									<DeviceForm {...deviceFormState} />
								</div>
							</div>
						</Card>
					</Col>
				</Row>
			</div>
		)
	}
}

export default Form.create()(addVehicle)
// export default () => <div>hecha</div>;
