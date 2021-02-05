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
	Tree
} from 'antd'
import moment from 'moment'
import { connect } from 'dva'
const FormItem = Form.Item
const { TreeNode } = Tree
const { Search } = Input
const { Option } = Select
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
let key = 10
@connect(({ service, loading }) => ({
	service,
	loading: loading.effects['service/getPoliceUnitList']
}))
class service extends Component {
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
		updateValues: {},
		treeValue: '0',
		isArea: false,
		isLine: false,
		isUser: false,
        selectedKeys:['0']
	}
	componentWillMount() {}
	componentDidMount() {
		this.policeQuery()
		this.getTableData()
	}
	policeQuery = () => {
		const { dispatch } = this.props
		dispatch({
			type: 'service/policeQuery',
			payload: { code: window.configUrl.dictionariesPolice },
			success: (e) => {
				console.log(e)
			}
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
			type: 'service/getPoliceUnitList',
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
			console.log('fieldsValue', fieldsValue)
			const values = {
				...fieldsValue,
				police_unit_organization_code: this.state.treeValue == '0' ? '' : this.state.treeValue
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
		const { form, service: { policeList } } = this.props
		const { getFieldDecorator } = form

		const formItemLayout = {
			labelCol: { span: 16 },
			wrapperCol: { span: 8 }
		}
		return (
			<Form layout="inline" onSubmit={this.handleSubmit} {...formItemLayout}>
				<Row>
					<Col span={8}>
						<FormItem label="警力类型">
							{getFieldDecorator('police_unit_type')(
								<Select placeholder="请选择" style={{ width: '330px' }}>
									{policeList &&
										policeList.map((v) => (
											<Option value={v.code} key={v.code}>
												{v.name}
											</Option>
										))}
								</Select>
							)}
						</FormItem>
					</Col>
					<Col span={8}>
						<FormItem label="名称">
							{getFieldDecorator('police_unit_name')(
								<Input placeholder="请输入名称" style={{ width: '330px' }} />
							)}
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
			{authorityIsTrue('czht_qwgl_jldy_xz') ? (
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
		console.log(this.state.expandedKeys)
		this.setState({ treeValue: expandedKeys[0],selectedKeys:expandedKeys })
		const { form, service: { data: { page } } } = this.props

		form.validateFields((err, fieldsValue) => {
			if (err) return

			const values = {
				...fieldsValue,
				police_unit_organization_code: expandedKeys[0]
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

	onExpand = (expandedKeys) => {
		this.setState({
			expandedKeys,
			autoExpandParent: false
		})
	}

	onChange = (value) => {
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
			title: '您确认删除该警力单元吗？',
			// content: '您确认删除该车辆吗？',
			okText: '确定',
			cancelText: '取消',
			onOk: () => {
				dispatch({
					type: 'service/delPoliceUnitList',
					payload: {
						police_unit_id: files
					},
					success: (e) => {
						if (e.result.reason.code == '200') {
							Message.success('删除成功')
							form.validateFields((err, fieldsValue) => {
								if (err) return
								const values = {
									...fieldsValue,
									police_unit_organization_code: this.state.treeValue == '0' ? '' : this.state.treeValue
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
			const values = {
				...fieldsValue,
				police_unit_organization_code: this.state.treeValue == '0' ? '' : this.state.treeValue
			}

			this.setState({
				formValues: values,
				createModalVisible: !!flag,
				isArea: false,
				isLine: false,
				isUser: false
			})

			const { service: { data: { page } } } = this.props
			page.currentPage = 1
			page.showCount = tableList

			this.getTableData(page, values)
			this.policeQuery()
		})
	}
	handleUpdate = (flag) => {
		console.log('编辑')
		const { dispatch, form } = this.props
		form.validateFields((err, fieldsValue) => {
			if (err) return
			const values = {
				...fieldsValue,
				police_unit_organization_code: this.state.treeValue == '0' ? '' : this.state.treeValue
			}

			this.setState({
				formValues: values,
				updateModalVisible: !!flag,
				isArea: false,
				isLine: false,
				isUser: false
			})

			const { service: { data: { page } } } = this.props
			page.currentPage = 1
			page.showCount = tableList

			this.getTableData(page, values)
		})
	}
	handleUpdateModalVisible = (flag, record) => {
		let userIds = []
		if (record) {
			this.getGpsList(record.police_unit_organization_code)
			this.findUserByDeptList(record.police_unit_organization_code)
			if (record.label_area_id) {
				this.chooseArea(record.label_area_id)
			}
			if (record.police_message) {
				const arr = record.police_message.map((x) => {
					return x.id
				})
				console.log(arr)
				userIds = arr
			}
		}
		console.log(record)
		this.setState({
			updateModalVisible: !!flag,
			updateValues: { ...record, userIds: userIds } || {},
			isArea: true
			//   isUser:true
			// isLine:true
		})
	}
	handleCreateModalVisible = (flag) => {
		this.setState({
			createModalVisible: !!flag,
			isArea: false,
			isLine: false,
			isUser: false
		})
		// this.setState({isArea:false,isLine:false})
	}
	chooseArea = (e) => {
		const { dispatch } = this.props
		var _self = this
		this.setState({ isLine: false })
		console.log(e)
		if (e) {
			dispatch({
				type: 'service/getGpsLabelLineListByCode',
				status: true,
				payload: {
					association_label_id: e
				},
				success: (files) => {
					console.log('获取成功', files)
					if (files.result.reason.code == '200') {
						_self.setState({ isLine: true })
					} else {
						return false
					}
				}
			})
		}
	}
	findUserByDeptList = (e) => {
		const { dispatch } = this.props
		console.log(e)
		var _self = this
		this.setState({ isUser: false })
		dispatch({
			type: 'service/findUserByDeptList',
			payload: {
				departmentList: [ e ]
			},
			success: (files) => {
				console.log('获取成功人员', files)
                if (files.error == null) {
						_self.setState({ isUser: true })
					} else {
						return false
					}
			}
		})
	}
	getGpsList = (e) => {
		const { dispatch } = this.props
		var _self = this
		this.setState({ isLine: false, isArea: false })
		dispatch({
			type: 'service/getGpsLabelAreaListByCode',
			status: true,
			payload: {
				label_organization_code: e
			},
			success: (files) => {
				console.log('获取成功', files)
                if (files.result.reason.code == '200') {
						_self.setState({ isArea: true })
					} else {
						return false
					}
			}
		})
	}
	render() {
		const { expandedKeys, autoExpandParent, searchTreeLoad, treeValue } = this.state
		const {
			service: { data: { list, page }, useList, policeList, labelArea, labelLine, userPliceList }
		} = this.props
		// 进行数组扁平化处理
		generateList(this.props.service.useList)
		const columns = [
			{
				title: '名称',
				dataIndex: 'police_unit_name',
				key: 'police_unit_name',
				ellipsis: true
			},
			{
				title: '警力类型',
				render: (record) => (
					<span>
						{policeList.map((v) => {
							if (v.code == record.police_unit_type) {
								return v.name
							}
						})}
					</span>
				),
				key: 'police_unit_type'
			},
			{
				title: '所属单位',
				dataIndex: 'police_unit_organization_name',
				key: 'police_unit_organization_name',
				ellipsis: true
			},
			{
				title: '警员',
				ellipsis: true,
				render: (record) => (
					<span>
						{record.police_message &&
							record.police_message
								.map((x) => {
									return x.name
								})
								.join('、')}
					</span>
				),
				key: 'police_message'
			},
			{
				title: '巡逻区域',
				dataIndex: 'label_area_name',
				key: 'label_area_name',
				ellipsis: true
			},
			{
				title: '巡逻线路',
				dataIndex: 'label_line_name',
				key: 'label_line_name',
				ellipsis: true
			},
			{
				title: '操作',
				key: 'police_unit_id',
				render: (record) => (
					<span>
						{authorityIsTrue('czht_qwgl_jldy_bj') ? (
							<a onClick={() => this.handleUpdateModalVisible(true, record)}>编辑</a>
						) : null}
						{authorityIsTrue('czht_qwgl_jldy_bj') ? <Divider type="vertical" /> : null}
						{authorityIsTrue('czht_qwgl_jldy_sc') ? (
							<a onClick={() => this.delPoliceUnitList(record.police_unit_id)}>删除</a>
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
			isArea: this.state.isArea,
			isLine: this.state.isLine,
			labelArea: labelArea,
			labelLine: labelLine,
			getGpsList: this.getGpsList,
			chooseArea: this.chooseArea,
			findUserByDeptList: this.findUserByDeptList,
			userPlice: userPliceList,
			isUser: this.state.isUser
		}
		const updateMethods = {
			modalVisible: this.state.updateModalVisible,
			handleSubmit: this.handleUpdate,
			handleModalVisible: this.handleUpdateModalVisible,
			values: this.state.updateValues,
			loading: this.props.loadings,
			policeUnitData: useList,
			policeList: policeList,
			isArea: this.state.isArea,
			isLine: this.state.isLine,
			labelArea: labelArea,
			labelLine: labelLine,
			getGpsList: this.getGpsList,
			chooseArea: this.chooseArea,
			findUserByDeptList: this.findUserByDeptList,
			userPlice: userPliceList,
			isUser: this.state.isUser
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
									// scroll={{ y: 350 }}
								/>
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
				<FormModal {...createMethods} />
				<FormModal {...updateMethods} />
			</div>
		)
	}
}

export default Form.create()(service)
// export default () => <div>hecha</div>;
