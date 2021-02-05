import {
	Button,
	Card,
	Col,
	DatePicker,
	Form,
	Icon,
	Input,
	InputNumber,
	Row,
	Select,
	Table,
	Tag,
	Pagination,
	Message,
	Divider,
	Modal,
	Upload,
	TreeSelect,
	Tooltip,
	Badge
} from 'antd'
import React, { Component } from 'react'
import { connect } from 'dva'
import styles from '../index.less'
import { reportList } from '@/utils/utils'
const { RangePicker } = DatePicker
const FormItem = Form.Item
const { TreeNode } = TreeSelect
import { cardNoRule } from '@/utils/validator'
import { authorityIsTrue } from '@/utils/authority'
const { Option } = Select
const TreeSelectProps = {
	showSearch: true,
	allowClear: false,
	autoExpandParent: false,
	treeDefaultExpandAll: true,
	searchPlaceholder: '请输入',
	treeNodeFilterProp: 'title',
	dropdownStyle: { maxHeight: 400, overflow: 'auto' },
	style: {
		width: 330
	}
}
const list = []
@connect(({ personnelDetails, loading }) => ({
	personnelDetails,
	loading:
		loading.effects['personnelDetails/getStudyJudgesList'] ||
		loading.effects['personnelDetails/queryCheckPersonList']
}))
class tables extends Component {
	state = {
		consumption: '1'
	}

	componentDidMount() {
		const { tabs } = this.props
		console.log(this.props)
		if (tabs == '9') {
			this.getStudyJudgesList()
		}
		if (tabs == '7') {
			this.queryCheckPersonList()
		}
		if (tabs == '8') {
			this.getPersonExpenseCalendarList()
		}
       
	}

	getStudyJudgesList = (changePage) => {
		const { id, dispatch, personnelDetails: { tables: { page } } } = this.props
		const pages = changePage || {
			currentPage: 1,
			showCount: reportList
		}
		const param = {
			...pages,
			pd: { person_id: id }
		}
		dispatch({
			type: 'personnelDetails/getStudyJudgesList',
			payload: param
		})
	}
    
	getPersonExpenseCalendarList = (changePage) => {
		const { card, dispatch, personnelDetails: { tables: { page } } } = this.props
		const { consumption } = this.state
		const pages = changePage || {
			currentPage: 1,
			showCount: reportList
		}
		const param = {
			...pages,
			pd: { idcard: card, type: consumption }
		}
		dispatch({
			type: 'personnelDetails/getPersonExpenseCalendarList',
			payload: param
		})
	}
	queryCheckPersonList = (changePage) => {
		const { card, dispatch, personnelDetails: { tables: { page } } } = this.props
		const pages = changePage || {
			currentPage: 1,
			showCount: reportList
		}
		const param = {
			...pages,
			pd: { check_card: card }
		}
		dispatch({
			type: 'personnelDetails/queryCheckPersonList',
			payload: param
		})
	}
	onChange = (currentPage) => {
		const { personnelDetails: { tables: { page } }, tabs } = this.props
		page.currentPage = currentPage
		// 查询改变页数后的数据
		if (tabs == '9') {
			this.getStudyJudgesList(page)
		}
		if (tabs == '8') {
			this.getPersonExpenseCalendarList(page)
		}
		if (tabs == '7') {
			this.queryCheckPersonList(page)
		}
	}
	onShowSizeChange = (current, pageSize) => {
		const { personnelDetails: { tables: { page } }, tabs } = this.props
		page.currentPage = current
		page.showCount = pageSize
		if (tabs == '9') {
			this.getStudyJudgesList(page)
		}
		if (tabs == '8') {
			this.getPersonExpenseCalendarList(page)
		}
		if (tabs == '7') {
			this.queryCheckPersonList(page)
		}
	}
	
	//消费记录
	recordsConsumption = () => {
		const { consumption } = this.state
		if (consumption == '1') {
			return [
				{
					title: '序号',
					dataIndex: 'xh',
					width: 100
				},
				{
					title: '网具名称',
					ellipsis: true,
                    render: (record) => <span> {record.expense_message&&record.expense_message.wj_mc? record.expense_message.wj_mc : ''}</span>
					// width:150
				},
                {
					title: '网具尺寸',
					ellipsis: true,
                    render: (record) => <span> {record.expense_message&&record.expense_message.wj_cc?record.expense_message.wj_cc : ''}</span>
					// width:150
				},
                {
					title: '网具数量',
					ellipsis: true,
                     render: (record) => <span> {record.expense_message&&record.expense_message.wj_sl?record.expense_message.wj_sl : ''}</span>
					// width:150
				},
                {
					title: '购买人身份证',
					dataIndex: 'buy_idcard',
					ellipsis: true
					// width:150
				},
                 {
					title: '录入人身份证',
					dataIndex: 'add_idcard',
					ellipsis: true
					// width:150
				},
                 {
					title: '交易场所',
					dataIndex: 'csmc',
					ellipsis: true
					// width:150
				},
                {
					title: '创建时间',
					dataIndex: 'expense_time',
					ellipsis: true,
					width:200
				}
			]
		}
		if (consumption == '2') {
			return [
				{
					title: '序号',
					dataIndex: 'xh',
					width: 100
				},
                {
					title: '渔民身份证',
					dataIndex: 'buy_idcard',
					ellipsis: true
					// width:150
				},
                {
					title: '斤数',
					render: (record) => <span> {record.expense_message&&record.expense_message.js?record.expense_message.js : ''}</span>,
					ellipsis: true
					// width:150
				},
                 {
					title: '产地证明',
					render: (record) => <span> {record.expense_message&&record.expense_message.cdzm?record.expense_message.cdzm : ''}</span>,
					ellipsis: true
					// width:150
				},
                 {
					title: '录入人身份证',
					dataIndex: 'add_idcard',
					ellipsis: true
					// width:150
				},
                {
					title: '交易场所',
					dataIndex: 'csmc',
					ellipsis: true
					// width:150
				},
                {
					title: '创建时间',
					dataIndex: 'expense_time',
					ellipsis: true,
					width:200
				},
			]
		}
		if (consumption == '3') {
			return [
				{
					title: '序号',
					dataIndex: 'xh',
					width: 100
				},
				{
					title: '油料类别',
					render: (record) => <span> {record.expense_message&&record.expense_message.yllbmc?record.expense_message.yllbmc : ''}</span>,
					ellipsis: true
					// width:150
				},
                {
					title: '油料型号',
					render: (record) => <span> {record.expense_message&&record.expense_message.ylxhmc?record.expense_message.ylxhmc : ''}</span>,
					ellipsis: true
					// width:150
				},
                {
					title: '油料数量',
					render: (record) => <span> {record.expense_message&&record.expense_message.ylsl?record.expense_message.ylsl : ''}</span>,
					ellipsis: true
					// width:150
				},
                {
					title: '油料用途',
					render: (record) => <span> {record.expense_message&&record.expense_message.ylyt?record.expense_message.ylyt : ''}</span>,
					ellipsis: true
					// width:150
				},
                {
					title: '购买人身份证',
					dataIndex: 'buy_idcard',
					ellipsis: true
					// width:150
				},
                 {
					title: '录入人身份证',
					dataIndex: 'add_idcard',
					ellipsis: true
					// width:150
				},
                {
					title: '交易场所',
					dataIndex: 'csmc',
					ellipsis: true
					// width:150
				},
                {
					title: '创建时间',
					dataIndex: 'expense_time',
					ellipsis: true,
					width:200
				},
			]
		}
		if (consumption == '4') {
			return [
				{
					title: '序号',
					dataIndex: 'xh',
					width: 100
				},
				{
					title: '维修项',
					render: (record) => <span> {record.expense_message&&record.expense_message.wxx?record.expense_message.wxx : ''}</span>,
					ellipsis: true
					// width:150
				},
                {
					title: '购买人身份证',
					dataIndex: 'buy_idcard',
					ellipsis: true
					// width:150
				},
                 {
					title: '录入人身份证',
					dataIndex: 'add_idcard',
					ellipsis: true
					// width:150
				},
                {
					title: '交易场所',
					dataIndex: 'csmc',
					ellipsis: true
					// width:150
				},
                {
					title: '创建时间',
					dataIndex: 'expense_time',
					ellipsis: true,
					width:200
				},
			]
		}
		if (consumption == '5') {
			return [
				{
					title: '序号',
					dataIndex: 'xh',
					width: 100
				},
				{
					title: '船艇及机器类型',
					render: (record) => <span> {record.expense_message&&record.expense_message.splx?record.expense_message.splx : ''}</span>,
					ellipsis: true
					// width:150
				},
                {
					title: '数量',
					render: (record) => <span> {record.expense_message&&record.expense_message.sl?record.expense_message.sl : ''}</span>,
					ellipsis: true
					// width:150
				},
               
                {
					title: '购买人身份证',
					dataIndex: 'buy_idcard',
					ellipsis: true
					// width:150
				},
                 {
					title: '录入人身份证',
					dataIndex: 'add_idcard',
					ellipsis: true
					// width:150
				},
                {
					title: '交易场所',
					dataIndex: 'csmc',
					ellipsis: true
					// width:150
				},
                {
					title: '创建时间',
					dataIndex: 'expense_time',
					ellipsis: true,
					width:200
				},
			]
		}
	}
	//盘查记录
	canRecord = () => {
		return [
			{
				title: '序号',
				dataIndex: 'xh',
				width: 100
			},
			{
				title: '姓名',
				dataIndex: 'check_name',
				ellipsis: true
				// width: 120
			},
			{
				title: '身份证号',
				dataIndex: 'check_card',
				ellipsis: true
				// width: 200
			},
			{
				title: '盘查异常',
				dataIndex: 'is_check_exception',
				ellipsis: true,
				// width: 200,
				render: (text) => <span> {text == '0' ? '否' : text == '1' ? '是' : ''}</span>
			},
			{
				title: '重点人',
				dataIndex: 'is_important',
				ellipsis: true,
				// width: 200,
				render: (text) => <span> {text == '0' ? '否' : text == '1' ? '是' : ''}</span>
			},
			{
				title: '标签',
				dataIndex: 'label_array',
				ellipsis: true,
				render: (text) => (
					<span>
						<Tooltip
							title={
								text &&
								text.length &&
								text.map((x) => {
										if (x.tag_name) return x.tag_name
									}).join('、')
							}
						>
							{text &&
								text.length &&
								text.map((tag, k) => {
									if (tag.tag_color != '') {
										return (
											<Tag color={tag.tag_color} key={k}>
												{tag.tag_name.toUpperCase()}
											</Tag>
										)
									} else {
										return ''
									}
								})}
                                
                             
						</Tooltip>
					</span>
				)
			},
			{
				title: '警员身份证号',
				dataIndex: 'police_idcard',
				ellipsis: true
				// width: 120
			},
			{
				title: '警员姓名',
				dataIndex: 'police_name',
				ellipsis: true
				// width: 120
			},
			{
				title: '警员单位',
				dataIndex: 'police_unit_name',
				ellipsis: true
				// width: 120
			},

			{
				title: '盘查时间',
				dataIndex: 'createtime',
				ellipsis: true,
				width: 200
			},
			{
				title: '经度',
				dataIndex: 'longitude',
				ellipsis: true
				// width: 120
			},
			{
				title: '纬度',
				dataIndex: 'latitude',
				ellipsis: true
				// width: 120
			}
		]
	}
	//研判记录
	toRecord = () => {
		return [
			{
				title: '序号',
				dataIndex: 'xh',
				width: 100
			},
			{
				title: '标签名称',
				dataIndex: 'label_name',
				ellipsis: true
				// width:150
			},
			{
				title: '研判等级',
				// width:200,
				ellipsis: true,
				render: (record) => (
					<span>
						{record.study_judge_level_color ? (
							<Tag
								color={record.study_judge_level_color}
								style={{ width: '5px', height: '10px', display: 'inline-block' }}
							/>
						) : null}
						{record.study_judge_level_name}
					</span>
				)
			},
			{
				title: '研判说明',
				dataIndex: 'study_judge_description',
				ellipsis: true
				// width:100
			},
			
			{
				title: '研判信息',
				dataIndex: 'study_judge_message',
				ellipsis: true
			},
			{
				title: '处置方案',
				dataIndex: 'take_step',
				ellipsis: true
			},
			{
				title: '研判时间',
				dataIndex: 'createtime',
				ellipsis: true,
				width: 200
			}
		]
	}
	renderForm = () => {
		const { tabs, personnelDetails: { tables: { list, page } }, form } = this.props
		console.log(tabs)
		return (
			<Table
				columns={tabs == '9' ? this.toRecord() : tabs == '7' ? this.canRecord() : this.recordsConsumption()}
				loading={this.props.loading}
				dataSource={list}
				// showSizeChanger
				size="default"
				pagination={false}
				// scroll={{ y: 370 }}
			/>
		)
	}
	// 查询条件重置
	handleFormReset = () => {
		const { tabs, form, personnelDetails: { tables: { page } } } = this.props

		page.currentPage = 1
		page.showCount = reportList
		if (tabs == '9') {
			this.getStudyJudgesList(page)
		}
		if (tabs == '8') {
			this.getPersonExpenseCalendarList(page)
		}
		if (tabs == '7') {
			this.queryCheckPersonList(page)
		}
		// this.getTableData(page)
	}

	toggleForm = (k) => {
		const { consumption } = this.state

		this.setState(
			{
				consumption: k
			},
			() => {
				// 重置搜索条件以及查询
				this.handleFormReset()
			}
		)
	}
	render() {
		const { personnelDetails: { tables: { list, page } }, form, tabs } = this.props
		const { consumption } = this.state
		const titles = [
			{ title: '网具销售', key: '1', permissions: 'czht_hcjl_ry' },
			{ title: '鱼行进货', key: '2', permissions: 'czht_hcjl_cl' },
			{ title: '油料消费', key: '3', permissions: 'czht_hcjl_cl' },
			{ title: '渔业船艇维修', key: '4', permissions: 'czht_hcjl_cl' },
			{ title: '渔业船艇购买', key: '5', permissions: 'czht_hcjl_cl' }
		]
		return (
			<div>
				{/* <div className={styles.tableListForm}>{this.renderForm()}</div> */}

				<Card bordered={false} className={styles.tableListCard}>
					{tabs  == '8' ? (
						<div className={styles.samllheaders}>
							{titles.map(
								(v, k) =>
									authorityIsTrue(v.permissions) ? (
										<Button
											// type="primary"
											key={v.key}
											size="large"
											className={styles.button}
											style={{
												background:
													v.key == consumption ? '#1890FF' : 'rgb(51, 51, 103)'
											}}
											onClick={() => this.toggleForm(v.key)}
											loading={this.props.loading}
										>
											{v.key > '5' ? <Badge color="#FF4646FF" /> : null}
											{v.title}
										</Button>
									) : null
							)}
						</div>
					) : null}

					{this.renderForm()}
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
							onChange={this.onChange}
							onShowSizeChange={this.onShowSizeChange}
							showTotal={(total, range) => `共${total}项`}
						/>
					</Row>
				) : null}
			</div>
		)
	}
}

export default Form.create()(tables)
