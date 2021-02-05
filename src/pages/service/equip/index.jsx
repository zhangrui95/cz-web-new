import React, { Component } from 'react'
import {
	Message,
	Row,
	Col,
	Switch,
	Form,
	Divider,
	Badge,
	Card,
	Button,
	Icon,
	Avatar,
	Modal,
	Input,
	Table,
	Pagination,
	Select,
	Tree,
	DatePicker
} from 'antd'
import moment from 'moment'
import { connect } from 'dva'
import { connect as mqttConnect } from 'mqtt'
const { configUrl } = window

const FormItem = Form.Item
const { TreeNode } = Tree
const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker
import styles from '../style.less'
import { tableList } from '@/utils/utils'
import FormModal from './components/FormModal'
import { authorityIsTrue } from '@/utils/authority'
const getParentKey = (title, tree) => {
	let parentKey
	for (let i = 0; i < tree.length; i++) {
		const node = tree[i]
		if (node.childrenList) {
			if (node.childrenList.some((item) => item.name === title)) {
				parentKey = node.code
			} else if (getParentKey(title, node.childrenList)) {
				parentKey = getParentKey(title, node.childrenList)
			}
		}
	}
	return parentKey
}

const dataList = []
const key = 'updatable'
const generateList = (data) => {
	for (let i = 0; i < data.length; i++) {
		const node = data[i]
		const code = node.code
		dataList.push({ code, name: node.name })
		if (node.childrenList) {
			generateList(node.childrenList)
		}
	}
}
/*对于异步加载的子节点使用该key进行自增赋值*/
// let key = 10;
@connect(({ service, loading }) => ({
	service,
	loading: loading.models.service
}))
class service extends Component {
	constructor(props) {
		super(props)

		this.localClient = mqttConnect(window.configUrl.localhostMqttUrl)
		// this.localClient.on('connect', this.localConnect);
		this.localClient.on('message', this.localMessage)
	}
	state = {
		expandForm: false,
		formValues: {},
		value: 1,
		loading: false,
		expandedKeys: ['0'],
		searchValue: '',
		autoExpandParent: true,
		searchTreeLoad: false,
		createModalVisible: false,
		updateModalVisible: false,
		editModalVisible: false,
		updateValues: {},
		treeValue: '0',
		isCar: false,
		mqttMess: false,
        selectedKeys:['0']
	}

	sendLabel = (files) => {
		console.log('发标签', files)
        Message.destroy()
		Message.loading({ content: '发标签中', key })
		var _self = this
		this.localClient.subscribe('Opt/RFID_TAG_READER_UNIT')
		this.localClient.subscribe('Opt/RFID_TAG_READER_UNIT', (err) => {
			if (!err) {
				const param = {
					Tag: 'COMMAND',
					UnitID: 1000001,
					RoomID: 100001,
					DevID: 1001,
					OptRequestDateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
					OptTag: 'DRIVE_WRITE_RFID_TAG',
					RfidTagContent: files,
					RfidTagRemark: '00000000000000000000000000000000'
				}
				console.log(param)
				_self.setState({ mqttMess: true }, () => {
					setTimeout(() => {
						if (_self.state.mqttMess) {
							console.log('----', err)
                            Message.destroy()
							Message.error({ content: '发标签失败', key })
							_self.setState({ mqttMess: false })
							return false
						}
					}, 500)
				})

				this.localClient.publish('Opt/RFID_TAG_READER_UNIT', JSON.stringify(param))
				this.localClient.subscribe('Ret/RFID_TAG_READER_UNIT')
			} else {
				console.log('----', err)
                Message.destroy()
				Message.error({ content: '发标签失败', key })
				// return
			}
		})
	}
	localConnect = () => {
		const topic = 'Opt/RFID_TAG_READER_UNIT'
		this.localClient.subscribe(topic, (err) => {
			if (err) {
                Message.destroy()
				Message.error({ content: '发标签失败', key })
			}
		})
	}
	localMessage = (topic, res) => {
		this.setState({ mqttMess: false })
		const info = JSON.parse(res.toString())
		console.log('MQTT接收到info', info, topic)
		if (topic == 'Ret/RFID_TAG_READER_UNIT') {
			if (info.Tag == 'RESULT') {
				if (info.OptTag == 'DRIVE_WRITE_RFID_TAG_RETURN') {
					console.log('info.OptResult', info.OptResult)
					if (info.OptResult) {
                        Message.destroy()
						Message.success({ content: '发标签成功', key })
					} else {
                        Message.destroy()
						Message.error({ content: '发标签失败', key })
					}
				}
			}
		} else {
			console.log('发标签中')
			//  Message.loading({ content: '发标签中', key, duration: 20})
		}
	}
	componentWillUnmount() {
		this.localClient.unsubscribe('Ret/RFID_TAG_READER_UNIT', () => {
			console.log('取消订阅')
		})
		this.localClient.end(true) //断开连接
	}
	componentWillMount() {}
	componentDidMount() {
		this.getTableData()
		this.equipmentType()
		this.equipmentState()
	}
	equipmentType = (changePage, pd) => {
		const { dispatch } = this.props

		dispatch({
			type: 'service/policeQuery',
			payload: { code: window.configUrl.dictionariesEquipmentType }
		})
	}
	equipmentState = (changePage, pd) => {
		const { dispatch } = this.props

		dispatch({
			type: 'service/policeQuery',
			payload: { code: window.configUrl.dictionariesEquipmentState }
		})
	}
	getTableData = (changePage, pd) => {
		const { dispatch, service: { data: { page } } } = this.props
		const pages = changePage || {
			currentPage: 1,
			showCount: tableList
		}

		const pds = pd || {}

		const param = {
			...pages,
			pd: { ...pds }
		}
		dispatch({
			type: 'service/getEquipmentList',
			payload: param
		})
	}
	onChangeTable = (currentPage) => {
		const { service: { data: { page } } } = this.props
		const { formValues } = this.state
		page.currentPage = currentPage
		console.log(currentPage)
		// 查询改变页数后的数据
		this.getTableData(page, formValues)
	}
	handleSubmit = (e) => {
		e.preventDefault()
		const { form, service: { data: { page } } } = this.props

		form.validateFields((err, fieldsValue) => {
			if (err) return
			console.log('fieldsValue', fieldsValue['range_picker'])
			const rangeValue = fieldsValue['range_picker']
			const values = {
				...fieldsValue,
				equipment_organization_code: this.state.treeValue == '0' ? '' : this.state.treeValue,
				starttime: rangeValue ? (rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD') : null) : null,
				endtime: rangeValue ? (rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD') : null) : null
			}

			this.setState({
				formValues: values
			})

			page.currentPage = 1
			page.showCount = tableList
			console.log(page, values)
			this.getTableData(page, values)
		})
	}
	startTimeChange = (date, dateString) => {
		console.log(date, dateString)
	}
	endTimeChange = (date, dateString) => {
		console.log(date, dateString)
	}
	renderForm = () => {
		const { form, service: { equipmentState, equipmentType } } = this.props
		const { getFieldDecorator } = form

		const formItemLayout = {
			labelCol: { span: 16 },
			wrapperCol: { span: 8 }
		}
		return (
			<Form layout="inline" onSubmit={this.handleSubmit}>
				<Row>
					<Col span={8}>
						<FormItem label="关键字">
							{getFieldDecorator('keyWord')(<Input placeholder="请输入关键字" style={{ width: '330px' }} />)}
						</FormItem>
					</Col>
					<Col span={8}>
						<FormItem label="装备类型">
							{getFieldDecorator('equipment_type')(
								<Select placeholder="请选择" style={{ width: '330px' }}>
									{equipmentType &&
										equipmentType.map((v) => (
											<Option value={v.code} key={v.code}>
												{v.name}
											</Option>
										))}
								</Select>
							)}
						</FormItem>
					</Col>
					<Col span={8}>
						<FormItem label="装备状态">
							{getFieldDecorator('equipment_state')(
								<Select placeholder="请选择" style={{ width: '330px' }}>
									{equipmentState &&
										equipmentState.map((v) => (
											<Option value={v.code} key={v.code}>
												{v.name}
											</Option>
										))}
								</Select>
							)}
						</FormItem>
					</Col>
					{/* <br/> */}
					<Col span={8}>
						<FormItem label="装备日期">
							{getFieldDecorator('range_picker')(<RangePicker style={{ width: '330px' }} />)}
						</FormItem>
					</Col>
					<Col span={8}>{this.renderSearchButton()}</Col>
				</Row>
			</Form>
		)
	}
	// 渲染查询条件的按钮渲染
	renderSearchButton = () => (
		// <Col offset={8} md={8} sm={24}>
		<span className={styles.submitButtons}>
			<Button
				type="primary"
				htmlType="submit"
				className={styles.submitButton}
				style={{ background: '#3470F4', borderColor: '#3470F4', color: '#fff' }}
			>
				搜索
			</Button>
			<Button
				className={styles.submitButton}
				onClick={this.handleFormReset}
				style={{ background: '#269CF4', borderColor: '#269CF4', color: '#fff' }}
			>
				重置
			</Button>
			{authorityIsTrue('czht_qwgl_zbgl_xz') ? (
				<Button
					className={styles.submitButton}
					style={{ background: '#38B248', borderColor: '#38B248', color: '#fff' }}
					onClick={() => this.handleCreateModalVisible(true)}
				>
					添加
				</Button>
			) : null}
		</span>
		// </Col>
	)
	// 查询条件重置
	handleFormReset = () => {
		const { form, service: { data: { page } } } = this.props
		form.resetFields()
		this.setState({
			formValues: {},
			expandedKeys: ['0'],
            autoExpandParent: false,
			treeValue: '0',
            selectedKeys:['0']
		})
		page.currentPage = 1
		page.showCount = tableList
		this.getTableData(page)
	}
	onSelect = (expandedKeys) => {
		/*用于打开该节点的详细信息*/
		console.log('selected', expandedKeys)
		if (expandedKeys.length > 0) {
			console.log('selected')
			this.setState({ treeValue: expandedKeys[0],selectedKeys:expandedKeys })
			const { form, service: { data: { page } } } = this.props

			form.validateFields((err, fieldsValue) => {
				if (err) return

				const values = {
					...fieldsValue,
					equipment_organization_code: expandedKeys[0]
				}
				//   console.log('fieldsValue', values);
				this.setState({
					formValues: values
				})

				page.currentPage = 1
				page.showCount = tableList
				//   console.log(page, values)
				if (expandedKeys.length) {
					this.getTableData(page, values)
				}
			})
		}
	}

	onExpand = (expandedKeys) => {
		this.setState({
			expandedKeys,
			autoExpandParent: false
		})
	}

	onChange = (value) => {
		// const value = e.target.value;
		this.setState({ searchTreeLoad: true })
		const expandedKeys = dataList
			.map((item) => {
				console.log(item.name.indexOf(value))
				if (item.name.indexOf(value) > -1) {
					return getParentKey(item.name, this.props.service.useList)
				}
				return null
			})
			.filter((item, i, self) => item && self.indexOf(item) === i)
		this.setState({
			expandedKeys,
			searchValue: value,
			autoExpandParent: true,
			searchTreeLoad: false
		})
	}

	loop = (data) =>
		data.map((item) => {
			let { searchValue } = this.state
			const index = item.name.indexOf(searchValue)
			const beforeStr = item.name.substr(0, index)
			const afterStr = item.name.substr(index + searchValue.length)
			const title =
				index > -1 ? (
					<span>
						{beforeStr}
						<span style={{ color: '#f50' }}>{searchValue}</span>
						{afterStr}
					</span>
				) : (
					<span>{item.name}</span>
				)
			if (item.childrenList) {
				return (
					<TreeNode key={item.code} title={item.name} dataRef={item}>
						{this.loop(item.childrenList)}
					</TreeNode>
				)
			}
			return <TreeNode dataRef={item} key={item.code} title={item.name} />
		})

	//删除
	delPoliceUnitList = (files) => {
		const { dispatch, form } = this.props
		var _self = this
		console.log('000000', files)
		Modal.confirm({
			title: '您确认删除该装备吗？',
			// content: '您确认删除该车辆吗？',
			okText: '确定',
			cancelText: '取消',
			onOk: () => {
				dispatch({
					type: 'service/delEquipment',
					payload: {
						equipment_id: files
					},
					success: (e) => {
						if (e.result.reason.code == '200') {
                            Message.destroy()
							Message.success('删除成功')
							form.validateFields((err, fieldsValue) => {
								if (err) return
								const rangeValue = fieldsValue['range_picker']

								const values = {
									...fieldsValue,
									equipment_organization_code: this.state.treeValue == '0' ? '' : this.state.treeValue,
									startTime: rangeValue
										? rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss') : null
										: null,
									endTime: rangeValue
										? rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss') : null
										: null
								}

								this.setState({
									formValues: values
								})

								const { service: { data: { page } } } = this.props
								page.currentPage = 1
								page.showCount = tableList

								this.getTableData(page, values)
							})
						} else {
                            Message.destroy()
							Message.error('删除失败，请稍后重试！')
							return false
						}
					}
				})
			}
		})
	}
	handleCreate = (flag) => {
		console.log('新建')
		const { dispatch, form } = this.props
		form.validateFields((err, fieldsValue) => {
			if (err) return
			const rangeValue = fieldsValue['range_picker']

			const values = {
				...fieldsValue,
				equipment_organization_code: this.state.treeValue == '0' ? '' : this.state.treeValue,
				startTime: rangeValue ? (rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss') : null) : null,
				endTime: rangeValue ? (rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss') : null) : null
			}
			this.setState({
				formValues: values,
				createModalVisible: !!flag,
				isCar: !!flag
			})

			const { service: { data: { page } } } = this.props
			page.currentPage = 1
			page.showCount = tableList

			this.getTableData(page, values)
		})
	}
	handleUpdate = (flag) => {
		console.log('编辑', flag)
		const { dispatch, form } = this.props
		form.validateFields((err, fieldsValue) => {
			if (err) return
			const rangeValue = fieldsValue['range_picker']

			const values = {
				...fieldsValue,
				equipment_organization_code: this.state.treeValue == '0' ? '' : this.state.treeValue,
				startTime: rangeValue ? (rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss') : null) : null,
				endTime: rangeValue ? (rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss') : null) : null
			}

			this.setState({
				formValues: values,
				updateModalVisible: !!flag,
				isCar: !!flag
			})

			const { service: { data: { page } } } = this.props
			page.currentPage = 1
			page.showCount = tableList

			this.getTableData(page, values)
		})
	}
	handleUpdateModalVisible = (flag, record) => {
		this.setState({
			updateModalVisible: !!flag,
			updateValues: record || {},
			isCar: !!flag
		})
		console.log(record)
		if (record) {
			this.chooseCode(record.equipment_organization_code)
		}
	}
	handleEditModalVisible = (flag, record) => {
		this.setState({
			editModalVisible: !!flag,
			updateValues: record || {},
			isCar: !!flag
		})
		// console.log(record)
		if (record) {
			this.chooseCode(record.equipment_organization_code)
		}
	}
	handleCreateModalVisible = (flag) => {
		this.setState({
			createModalVisible: !!flag,
			isCar: false
		})
	}
	chooseCode = (value) => {
		//  this.props.form.setFieldsValue({ shifts_organization_code: [] });
		// this.props.form.setFieldsValue({'police_unit_organization_name': value})
		console.log(value)
		const { dispatch } = this.props
		this.setState({ isCar: true })
		dispatch({
			type: 'service/getVehicleList',
			payload: { vehicle_organization_code: value }
		})
	}
	render() {
		const { expandedKeys, autoExpandParent, searchTreeLoad } = this.state
		const { service: { data: { list, page }, useList, policeList, equipmentType, equipmentState } } = this.props
		// 进行数组扁平化处理
		generateList(this.props.service.useList)
		const columns = [
			{
				title: '品名',
				dataIndex: 'equipment_name',
				// fixed: 'left',
				width: 150,
				ellipsis: true
			},
			{
				title: '品牌',
				dataIndex: 'brand',
				// fixed: 'left',
				width: 150,
				ellipsis: true
			},
			{
				title: '型号',
				dataIndex: 'model',
				width: 150,
				ellipsis: true
			},
			{
				title: '装备类型',
				// fixed: 'left',
				ellipsis: true,
				width: 150,
				render: (record) => (
					<span>
						{equipmentType.map((v) => {
							if (v.code == record.equipment_type) {
								return v.name
							}
						})}
					</span>
				)
			},

			{
				title: '装备状态',
				// fixed: 'left',
				ellipsis: true,
				width: 120,
				render: (record) => (
					<span>
						{equipmentState.map((v) => {
							if (v.code == record.equipment_state) {
								return v.name
							}
						})}
					</span>
				)
			},
			{
				title: '关联车辆',
				width: 120,
				dataIndex: 'carNo',
				ellipsis: true
			},
			{
				title: '序列号',
				width: 120,
				ellipsis: true,
				dataIndex: 'serial_number'
			},
			{
				title: '生产厂家',
				width: 120,
				ellipsis: true,
				dataIndex: 'manufacture'
			},
			{
				title: '业务联系电话',
				width: 150,
				ellipsis: true,
				dataIndex: 'business_telephone'
			},
			{
				title: '供应商',
				width: 120,
				ellipsis: true,
				dataIndex: 'supplier'
			},
			{
				title: '维保联系电话',
				width: 150,
				ellipsis: true,
				dataIndex: 'maintenance_contact_telephone'
			},
			{
				title: '装备经费来源',
				width: 150,
				ellipsis: true,
				dataIndex: 'equipment_outlay_source'
			},
			{
				title: '装备日期',
				width: 120,
				ellipsis: true,
				dataIndex: 'equipment_date'
			},
			{
				title: '质保到期时间',
				width: 120,
				ellipsis: true,
				dataIndex: 'warranty_expiration_date'
			},
			{
				title: '配发日期',
				width: 120,
				ellipsis: true,
				dataIndex: 'allotment_date'
			},
			{
				title: '接收单位',
				width: 120,
				ellipsis: true,
				dataIndex: 'receive_org_name'
			},
			{
				title: '操作',
				fixed: 'right',
				width: 220,
				render: (record) => (
					<span>
						<a onClick={() => this.handleEditModalVisible(true, record)}>查看</a>

						{authorityIsTrue('czht_qwgl_zbgl_bj') ? <Divider type="vertical" /> : null}
						{authorityIsTrue('czht_qwgl_zbgl_bj') ? (
							<a onClick={() => this.handleUpdateModalVisible(true, record)}>编辑</a>
						) : null}
						{authorityIsTrue('czht_qwgl_zbgl_sc') ? <Divider type="vertical" /> : null}
						{authorityIsTrue('czht_qwgl_zbgl_sc') ? (
							<a onClick={() => this.delPoliceUnitList(record.equipment_id)}>删除</a>
						) : null}
						{authorityIsTrue('czht_qwgl_zbgl_fbq') ? <Divider type="vertical" /> : null}
						{authorityIsTrue('czht_qwgl_zbgl_fbq') ? (
							<a onClick={() => this.sendLabel(record.equipment_id)}>发标签</a>
						) : null}
					</span>
				)
			}
		]
		const createMethods = {
			modalVisible: this.state.createModalVisible,
			handleSubmit: this.handleCreate,
			handleModalVisible: this.handleCreateModalVisible,
			loading: this.props.loadings,
			policeUnitData: useList,
			policeList: policeList,
			equipmentType: equipmentType,
			equipmentState: equipmentState,
			chooseCode: this.chooseCode,
			isCar: this.state.isCar
		}
		const updateMethods = {
			modalVisible: this.state.updateModalVisible,
			handleSubmit: this.handleUpdate,
			handleModalVisible: this.handleUpdateModalVisible,
			values: this.state.updateValues,
			loading: this.props.loadings,
			policeUnitData: useList,
			policeList: policeList,
			equipmentType: equipmentType,
			equipmentState: equipmentState,
			chooseCode: this.chooseCode,
			isCar: this.state.isCar
		}
		const editMethods = {
			modalVisible: this.state.editModalVisible,
			handleModalVisible: this.handleEditModalVisible,
			values: this.state.updateValues,
			loading: this.props.loadings,
			policeUnitData: useList,
			policeList: policeList,
			equipmentType: equipmentType,
			equipmentState: equipmentState,
			edit: true,
			chooseCode: this.chooseCode,
			isCar: this.state.isCar
		}
		return (
			<div>
				<div className={styles.tableListForm}>{this.renderForm()}</div>
				<Card style={{ width: '100%', background: 'none' }} bordered={false}>
					<Row gutter={[ 8, 16 ]}>
						<Col span={3}>
							<Card
								bordered={false}
								className={styles.tableListCard}
								style={{
									overflowX: 'auto',
									height: '450px'
								}}
							>
								<div style={{ marginBottom: '200px' }}>
									<Search
										style={{ marginBottom: 8 }}
										placeholder="搜索"
										onSearch={(value) => this.onChange(value)}
										enterButton
									/>
									<Tree
										onSelect={this.onSelect}
										onExpand={this.onExpand}
										expandedKeys={expandedKeys}
										autoExpandParent={autoExpandParent}
										selectedKeys={this.state.selectedKeys}
                                       defaultSelectedKeys={this.state.selectedKeys}

										// onLoad={searchTreeLoad}
									>
                                    <TreeNode key={'0'} title={'全部'} dataRef={'0'}>
                                       {this.loop(this.props.service.useList)}
                                    </TreeNode>

									</Tree>
								</div>
							</Card>
						</Col>
						<Col span={21}>
							<Card bordered={false} className={styles.tableListCard}>
								<Table
									columns={columns}
									loading={this.props.loading}
									dataSource={list}
									//   showSizeChanger
									size="default"
									pagination={false}
									scroll={{ x: 1300 }}
									//   scroll={{}}
								/>
							</Card>
							{page&&page.totalResult ? (
								<Row className={styles.pagination}>
									<Pagination
										// showSizeChanger
										showQuickJumper
										// pageSizeOptions={['16', '24', '32']}
										total={page.totalResult}
										current={page.currentPage}
										pageSize={page.showCount}
										onChange={this.onChangeTable}
										onShowSizeChange={this.onShowSizeChange}
										showTotal={(total, range) => `共${total}项`}
									/>
								</Row>
							) : null}
						</Col>
					</Row>
				</Card>
				<FormModal {...createMethods} />
				<FormModal {...updateMethods} />
				<FormModal {...editMethods} />
			</div>
		)
	}
}

export default Form.create()(service)
// export default () => <div>hecha</div>;
