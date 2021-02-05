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
	loading: loading.models.service
}))
class service extends Component {
	state = {
		expandForm: false,
		formValues: {},
		value: 1,
		loading: false,
		expandedKeys: ['0'],
		searchValue: '',
		autoExpandParent: false,
		searchTreeLoad: false,
		createModalVisible: false,
		updateModalVisible: false,
		updateValues: {},
		treeValue: '0',
		visible: true,
        selectedKeys:['0']
	}
	componentWillMount() {}
	componentDidMount() {
		this.getTableData()
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
			type: 'service/getShiftsList',
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
			const values = {
				...fieldsValue,
				shifts_organization_code: this.state.treeValue == '0' ? '' : this.state.treeValue
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
		const { form } = this.props
		const { getFieldDecorator } = form

		const formItemLayout = {
			labelCol: { span: 16 },
			wrapperCol: { span: 8 }
		}
		return (
			<Form layout="inline" onSubmit={this.handleSubmit} {...formItemLayout}>
				<Row>
					<Col span={12}>
						<FormItem label="班次名称">
							{getFieldDecorator('shifts_name')(
								<Input placeholder="请输入班次名称" style={{ width: '330px' }} />
							)}
						</FormItem>
					</Col>
					<Col span={10}>{this.renderSearchButton()}</Col>
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
			{authorityIsTrue('czht_qwgl_bcgl_xz') ? (
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
				shifts_organization_code: expandedKeys[0]
			}
			//   console.log('fieldsValue', values);
			this.setState({
				formValues: values
			})

			page.currentPage = 1
			page.showCount = tableList
			//   console.log(page, values)
			this.getTableData(page, values)
		})
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
            selectedKeys:[value],
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
			title: '您确认删除该班次吗？',
			// content: '您确认删除该车辆吗？',
			okText: '确定',
			cancelText: '取消',
			onOk: () => {
				dispatch({
					type: 'service/delShifts',
					payload: {
						shifts_id: files
					},
					success: (e) => {
						if (e.result.reason.code == '200') {
							Message.success('删除成功')
							form.validateFields((err, fieldsValue) => {
								if (err) return
								const values = {
									...fieldsValue,
									shifts_organization_code: this.state.treeValue == '0' ? '' : this.state.treeValue
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
				shifts_organization_code: this.state.treeValue == '0' ? '' : this.state.treeValue
			}

			this.setState({
				formValues: values,
				createModalVisible: !!flag
			})

			const { service: { data: { page } } } = this.props
			page.currentPage = 1
			page.showCount = tableList

			this.getTableData(page, values)
		})
	}
	handleUpdate = (flag) => {
		console.log('编辑')
		const { dispatch, form } = this.props
		form.validateFields((err, fieldsValue) => {
			if (err) return
			const values = {
				...fieldsValue,
				shifts_organization_code: this.state.treeValue == '0' ? '' : this.state.treeValue
			}

			this.setState({
				formValues: values,
				updateModalVisible: !!flag
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
			updateValues: record || {}
		})
	}
	handleCreateModalVisible = (flag) => {
		this.setState({
			createModalVisible: !!flag
		})
	}
	render() {
		const { expandedKeys, autoExpandParent, searchTreeLoad,treeValue} = this.state
		const { service: { data: { list, page }, useList, policeList } } = this.props
		// 进行数组扁平化处理
		generateList(this.props.service.useList)
		const columns = [
			{
				title: '班次名称',
				dataIndex: 'shifts_name',
				ellipsis: true
			},
			{
				title: '开始时间',
				dataIndex: 'shifts_begin_tiem'
			},
			{
				title: '结束时间',
				dataIndex: 'shifts_end_time'
			},
			{
				title: '是否跨天',
				render: (record) => <span>{!record.is_across_day ? '是' : '否'}</span>
			},
			{
				title: '所属单位',
				dataIndex: 'shifts_organization_name',
				ellipsis: true
			},
			{
				title: '操作',
				render: (record) => (
					<span>
						{authorityIsTrue('czht_qwgl_bcgl_bj') ? (
							<a onClick={() => this.handleUpdateModalVisible(true, record)}>编辑</a>
						) : null}
						{authorityIsTrue('czht_qwgl_bcgl_bj') ? <Divider type="vertical" /> : null}
						{authorityIsTrue('czht_qwgl_bcgl_sc') ? (
							<a onClick={() => this.delPoliceUnitList(record.shifts_id)}>删除</a>
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
			loopUseList: generateList(useList),
			policeList: policeList
		}
		const updateMethods = {
			modalVisible: this.state.updateModalVisible,
			handleSubmit: this.handleUpdate,
			handleModalVisible: this.handleUpdateModalVisible,
			values: this.state.updateValues,
			loading: this.props.loadings,
			policeUnitData: useList,
			loopUseList: generateList(useList),
			policeList: policeList
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
									// showSizeChanger
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
