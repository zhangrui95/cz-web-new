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
const { Column } = Table
const FormItem = Form.Item
const { TreeNode } = Tree
const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker
import styles from '../style.less'
import { tableList } from '@/utils/utils'
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
let defaultValuean = ''
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
	state = {
		expandForm: false,
		formValues: {},
		value: 1,
		loading: false,
		expandedKeys: ['0'], //（受控）设置选中的树节点
		searchValue: '', //
		autoExpandParent: true, //是否自动展开父节点
		searchTreeLoad: false,
		createModalVisible: false,
		updateModalVisible: false,
		editModalVisible: false,
		updateValues: {},
		treeValue: '0', //（受控）设置选中的树节点
		isCar: false,
		mqttMess: false,
        selectedKeys:['0']
	}

	componentWillMount() {
		const { dispatch, service: { data: { page } } } = this.props
		var _self = this
		console.log(this.props)
		if (this.props.location.state != undefined) {
			const states = this.props.location.state
			const pages = JSON.parse(states.pages)
			console.log(pages, states)
			;(defaultValuean =
				pages.pd.equipment_organization_code != undefined ? pages.pd.equipment_organization_code : ''),
				this.setState(
					{
						formValues: pages.pd,
						treeValue:
							pages.pd.equipment_organization_code != undefined
								? pages.pd.equipment_organization_code
								: '',
						expandedKeys:
							pages.pd.equipment_organization_code != undefined
								? [ pages.pd.equipment_organization_code ]
								: []
					},
					() => {
						_self.props.form.setFieldsValue({
							...pages.pd
						})
						_self.getTableData(pages, {
							...pages.pd
						})
						console.log(_self.state.treeValue, _self.state.expandedKeys)
					}
				)
			this.getTableData(pages, pages.pd)
			console.log(pages, pages.pd)
			// this.onSelect(pages.pd.equipment_organization_code != undefined ? [pages.pd.equipment_organization_code] : [])
		} else {
			this.getTableData()
		}

		// this.getTableData();
		this.equipmentType()
		this.equipmentState()
	}
	componentDidMount() {}
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
		const { dispatch, service: { equipmentStatistics: { page } } } = this.props
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
			type: 'service/getEquipmentStatisticsList',
			payload: param
		})
	}
	onChangeTable = (currentPage) => {
		const { service: { equipmentStatistics: { page } } } = this.props
		const { formValues } = this.state
		page.currentPage = currentPage
		console.log(currentPage)
		// 查询改变页数后的数据
		this.getTableData(page, formValues)
	}
	handleSubmit = (e) => {
		e.preventDefault()
		const { form, service: { equipmentStatistics: { page } } } = this.props

		form.validateFields((err, fieldsValue) => {
			if (err) return
			console.log('fieldsValue', fieldsValue)
			const values = {
				...fieldsValue,
				equipment_organization_code: this.state.treeValue == '0' ? '' : this.state.treeValue
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
					{/* <Col span={8}>
            <FormItem label="装备状态">
              {getFieldDecorator("equipment_state")(
                <Select placeholder="请选择" style={{ width: "330px" }} >
                  {
                    equipmentState&&equipmentState.map( v => (<Option value={v.code} key={v.code}>{v.name}</Option>))
                  }
                </Select>
              )}
            </FormItem>
          </Col> */}
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
		</span>
		// </Col>
	)
	// 查询条件重置
	handleFormReset = () => {
		const { form, service: { equipmentStatistics: { page } } } = this.props
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
			const { form, service: { equipmentStatistics: { page } } } = this.props

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
            console.log(expandedKeys)
            if(!expandedKeys.length){
                Message.error('无关键字内容')
            }
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

	seeHistory = (recorder) => {
		console.log(recorder, '查看历史')

		const { form, service: { data: { page } } } = this.props
		form.validateFields((err, fieldsValue) => {
			if (err) return
			const formdata = {
				...page,
				pd: {
					...fieldsValue
				}
			}
			if (this.state.treeValue != '') {
				formdata.pd = {
					...formdata.pd,
					equipment_organization_code: this.state.treeValue == '0' ? '' : this.state.treeValue
				}
			}
			// console.log(window.g_app)
			this.props.history.push(`./czht_sbgl/inventory/${recorder}/${JSON.stringify(formdata)}/${'czht_qwgl'}`)
		})
	}
	render() {
		const { expandedKeys, autoExpandParent, searchTreeLoad, treeValue } = this.state
		const {
			service: {
				equipmentStatistics: { list, page },
				statisticsHead,
				useList,
				policeList,
				equipmentType,
				equipmentState
			}
		} = this.props
		// 进行数组扁平化处理
		generateList(this.props.service.useList)

		return (
			<div>
				{/* <div className={styles.tableListForm}>{this.renderForm()}</div> */}
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
										defaultSelectedKeys={[ treeValue ]}
										autoExpandParent={autoExpandParent}
										expandedKeys={expandedKeys}
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
									// columns={statisticsHead}
									loading={this.props.loading}
									dataSource={list}
									size="default"
									pagination={false}
									scroll={{ x: 1300 }}
								>
									{statisticsHead &&
										statisticsHead.map((item) => {
											return (
												<Column
													key={item.key}
													className={'Column-width'}
													title={item.title}
													dataIndex={item.dataIndex}
													ellipsis={item.ellipsis}
													width={item.width}
												/>
											)
										})}
									<Column
										key="ok"
										title="操作"
										width={110}
										fixed={'right'}
										render={(recorder) => (
											<span>
												<a onClick={() => this.seeHistory(recorder.pad_cid)}>查看历史</a>
											</span>
										)}
									/>
								</Table>
							</Card>
							{page.totalResult ? (
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
			</div>
		)
	}
}

export default Form.create()(service)
// export default () => <div>hecha</div>;
