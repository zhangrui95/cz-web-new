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
	Calendar,
	Descriptions,
	DatePicker,
	Tooltip,
	Popconfirm,
	Checkbox,
	Spin,
	Empty,
	Radio
} from 'antd'
import moment from 'moment'
import { connect } from 'dva'
const { Group } = Radio
const FormItem = Form.Item
const { TreeNode } = Tree
const { Search } = Input
const { Option } = Select
const { WeekPicker } = DatePicker
import styles from './index.less'
import { reportList } from '@/utils/utils'
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
let h_max = 'auto'
@connect(({ service, loading }) => ({
	service,
	loading: loading.effects['service/getSchedulingList']
}))
class service extends Component {
	constructor(props) {
		super(props)
		this.state = {
			expandForm: false,
			formValues: {},
			value: 1,
			loading: false,
			expandedKeys: ['0'],
			searchValue: '', //机构数选择值
			weekData: this.getWeekOfYear(new Date()), //当前日期是哪年第几周
			dates: `${this.getWeekStartDate(new Date())}至${this.getWeekEndDate(new Date())}`, //一周的开始日期和结束日期（月日）
			startDate: this.getWeekStartDate(new Date()), //开始日期（月日）
			endDate: this.getWeekEndDate(new Date()), //结束日期（月日）
			headKey: '', //头部点击三角箭头对应值
			weekMone: this.getAllDate(
				this.getWeekStartDate(new Date(), true),
				this.getWeekEndDate(new Date(), true),
				false
			), //一周的所有日期（月日）
			allWeekMone: this.getAllDate(
				this.getWeekStartDate(new Date(), true),
				this.getWeekEndDate(new Date(), true),
				true
			), //一周的所有日期（年月日）
			startTakeTears: this.getWeekStartDate(new Date(), true), //开始日期（年月日）
			endTakeTears: this.getWeekEndDate(new Date(), true), //结束日期（年月日）
			shiftKey: '', //选中班次值
			policeUnitKey: '', //选中警力单元值
			dateKey: '', //选中日期值
			visibles: '', //选中组合值
			types: '', //判断新建编辑
			visibleCopyDate: '', //复制排班（日）的判断
			openKey: false,
			visibleCopyWeek: false,
			modalVisible: false,
			rangeValue: {},
			isHeight: false,
            selectedKeys:['0'],
            treeValue:'0'
		}
	}
	componentWillMount() {}
	componentDidMount() {
		this.getSchedulingList()
		// console.log(this.getWeekStartDate(new Date(), true))
	}
	componentWillUnmount() {
		h_max = 'auto'
	}
	rederDom = () => {
		// console.log(document.getElementsByClassName('shiftTitles'))
		//         console.log(document.getElementsByName('shiftTitles'))
		// `${'shiftTitles'} ${styles.shiftTitle}`
		var hi_max = 0
		var disv = document.getElementsByName('shiftTitles')
		// window.onload = () => {
		// var div = document.getElementsByClassName("shiftTitles");
		// window.onresize = autoResize;
		var shiftTitles = document.getElementsByClassName('shiftTitles')
		if (shiftTitles) {
			for (let index = 0; index < shiftTitles.length; index++) {
				const element = shiftTitles[index]
				var h = element.clientHeight
				// console.log('h', h)
				hi_max = hi_max < h ? h : hi_max
			}
			// console.log(hi_max)
			// for (let index = 0; index < shiftTitles.length; index++) {
			//     const element = shiftTitles[index];
			//     element.style.heigh = h_max + 'px'
			// }
			// if (shiftTitles) {
			if (hi_max > 41) {
				h_max = hi_max + 'px'
				this.setState({ isHeight: true })
				// shiftTitles.style.height = h_max + 'px'
				// console.log(disv.style)
			}
			// }
		}
		// }
	}
	getSchedulingList = (changePage, pd) => {
		const { dispatch, service: { schedulingList: { page } } } = this.props
		const { startDate, endDate, searchValue, startTakeTears, endTakeTears } = this.state
		const pages = changePage || {
			currentPage: 1,
			showCount: reportList
		}
		h_max = 'auto'
		this.setState({ isHeight: false })

		const pds = pd || {
			schedule_end_date: endTakeTears,
			schedule_organization_code: searchValue,
			schedule_start_date: startTakeTears
		}

		const param = {
			...pages,
			pd: { ...pds }
		}
		dispatch({
			type: 'service/getSchedulingList',
			payload: param,
			success: (e) => {
                if(e.result.reason.code == '200'){
                    this.rederDom()
                    this.setState({ isHeight: true })
                }else{
                    return false
                }

			}
		})
	}

	//获得本周的开端日期
	getWeekStartDate(now, type) {
		// var now = new Date() //当前日期
		var nowDayOfWeek = now.getDay() //今天本周的第几天
		var nowDay = now.getDate() //当前日
		var nowMonth = now.getMonth() //当前月
		var nowYear = now.getFullYear() //当前年

		var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek + 1)
		return this.formatDate(weekStartDate, type)
	}
	//整理格式
	formatDate(date, type) {
		var myyear = date.getFullYear()
		var mymonth = date.getMonth() + 1
		var myweekday = date.getDate()

		if (mymonth < 10) {
			mymonth = '0' + mymonth
		}
		if (myweekday < 10) {
			myweekday = '0' + myweekday
		}
		if (type) {
			return myyear + '-' + mymonth + '-' + myweekday
		} else {
			return mymonth + '-' + myweekday
		}
	}

	//获得本周的停止日期
	getWeekEndDate(now, type) {
		// var now = new Date() //当前日期
		var nowDayOfWeek = now.getDay() //今天本周的第几天
		var nowDay = now.getDate() //当前日
		var nowMonth = now.getMonth() //当前月
		var nowYear = now.getFullYear() //当前年

		var weekEndDate = new Date(nowYear, nowMonth, nowDay + (7 - nowDayOfWeek))
		return this.formatDate(weekEndDate, type)
	}
	//周选择器
	handleWeekChange = (weekData, weekStrings) => {
		const { form, service: { schedulingList: { page } } } = this.props
		console.log('----', weekData, weekStrings)
		const startDate = moment(weekData).day(1).format('MM-DD') // 周一日期
		const endDate = moment(weekData).day(7).format('MM-DD') // 周日日期
		const startTakeTears = moment(weekData).day(1).format('YYYY-MM-DD') // 周一日期
		const endTakeTears = moment(weekData).day(7).format('YYYY-MM-DD') // 周日日期
		console.log(moment(weekData).day(1).format('YYYY-MM-DD'), endDate)
		this.setState({
			dates: `${startDate}至${endDate}`,
			startDate: startDate,
			endDate: endDate,
			startTakeTears: startTakeTears,
			endTakeTears: endTakeTears,
			weekMone: this.getAllDate(startTakeTears, endTakeTears),
			allWeekMone: this.getAllDate(startTakeTears, endTakeTears, true),
			shiftKey: '',
			policeUnitKey: '',
			dateKey: '',
			headKey: ''
		})

		// var now = new Date()
		page.currentPage = 1
		page.showCount = reportList

		this.getSchedulingList(page, {
			schedule_end_date: endTakeTears,
			schedule_organization_code: this.state.treeValue == '0' ? '' : this.state.treeValue,
			schedule_start_date: startTakeTears
		})
	}
	//获取当前日期是本年第几周
	getWeekOfYear(today) {
		// var today = new Date()
		var nowYear = today.getFullYear() //当前年
		console.log(nowYear)
		var firstDay = new Date(today.getFullYear(), 0, 1)
		var dayOfWeek = firstDay.getDay()
		var spendDay = 1
		if (dayOfWeek != 0) {
			spendDay = 7 - dayOfWeek + 1
		}
		firstDay = new Date(today.getFullYear(), 0, 1 + spendDay)
		var d = Math.ceil((today.valueOf() - firstDay.valueOf()) / 86400000)
		var result = Math.ceil(d / 7)
		return nowYear + '-' + (result + 1) + '周'
	}
	//根基开始时间和结束时间 计算出中间的所有日期
	getAllDate = (start, end, type) => {
		let dateArr = []
		let startArr = start.split('-')
		let endArr = end.split('-')
		let db = new Date()
		db.setUTCFullYear(startArr[0], startArr[1] - 1, startArr[2])
		let de = new Date()
		de.setUTCFullYear(endArr[0], endArr[1] - 1, endArr[2])
		let unixDb = db.getTime()
		let unixDe = de.getTime()
		let stamp
		const oneDay = 24 * 60 * 60 * 1000
		for (stamp = unixDb; stamp <= unixDe; ) {
			dateArr.push(this.formatDate(new Date(parseInt(stamp)), type))
			stamp = stamp + oneDay
		}
		return dateArr
	}
	//左侧树选择
	onSelect = (expandedKeys) => {
		/*用于打开该节点的详细信息*/
		console.log('selected', expandedKeys)
		console.log(this.state.expandedKeys)
		this.setState({
			treeValue: expandedKeys[0],
			shiftKey: '',
			headKey: '',
            selectedKeys: expandedKeys
		})
		const { form, service: { schedulingList: { page } } } = this.props
		const { endDate, startDate, startTakeTears, endTakeTears } = this.state
		// var now = new Date()
		page.currentPage = 1
		page.showCount = reportList

		if (expandedKeys.length) {
			this.getSchedulingList(page, {
				schedule_end_date: endTakeTears,
				schedule_organization_code: expandedKeys[0],
				schedule_start_date: startTakeTears
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
			searchTreeLoad: false,
			shiftKey: '',
			headKey: ''
		})
	}
	onChangeTable = (currentPage) => {
		const { service: { schedulingList: { page } } } = this.props
		const { endTakeTears, startTakeTears, treeValue } = this.state
		page.currentPage = currentPage
		console.log(currentPage)
		// 查询改变页数后的数据
		this.setState({
			shiftKey: '',
			headKey: ''
		})
		this.getSchedulingList(page, {
			schedule_end_date: endTakeTears,
			schedule_organization_code: this.state.treeValue == '0' ? '' : this.state.treeValue,
			schedule_start_date: startTakeTears
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

	//清空排班
	clearDates = (shiftsId, values, type, policeUnitName, shiftsName) => {
		console.log('清空', shiftsId, values, type)
		const { dispatch, form, service: { schedulingList: { page } } } = this.props
		var _self = this
		const { allWeekMone, treeValue, endTakeTears, startTakeTears, dates } = this.state
		let formData = {}
		if (allWeekMone) {
			if (shiftsId == null) {
				formData = {
					date_list: type == 'arr' ? values : [ values ]
				}
			} else {
				// console.log(allWeekMone[Number(values)])
				formData = {
					date_list: [ allWeekMone[values] ],
					schedule_id: shiftsId
				}
			}
			const weekName = allWeekMone[values]
			console.log('清空提交', formData, weekName, allWeekMone)

			Modal.confirm({
				title: `您确认清空${shiftsId == null ? (type == 'arr' ? '本周' : values) : weekName}${shiftsId == null
					? type == 'arr' ? dates : '全日'
					: policeUnitName}${shiftsId != null ? shiftsName : ''}的排班吗？`,

				// content: '您确认删除该车辆吗？',
				okText: '确定',
				cancelText: '取消',
				onOk: () => {
					dispatch({
						type: 'service/delSchedule',
						payload: {
							...formData
						},
						success: (e) => {

                            if (e.result.reason.code == '200') {
                                Message.destroy()
								Message.success('清空成功')

									page.currentPage = 1
									page.showCount = reportList
									this.setState({
										shiftKey: '',
										headKey: ''
									})
									this.getSchedulingList(page, {
										schedule_end_date: endTakeTears,
										schedule_organization_code: this.state.treeValue == '0' ? '' : this.state.treeValue,
										schedule_start_date: startTakeTears
									})
							} else {
                                Message.destroy()
								Message.error('清空失败')
								return false
							}
						}
					})
				}
			})
		}
	}
	//获取人员列表
	getPoliceScheduleList = (policeUnitId, values, shiftsId, scheduleId, types) => {
		const { dispatch, service: { schedulingList: { page } } } = this.props
		const { startDate, endDate, searchValue, startTakeTears, endTakeTears, allWeekMone } = this.state
		var _self = this
		console.log(types)
		// if (types == 'edit') {
		// 	this.setState({ isHeight: false })
		// }
		dispatch({
			type: 'service/getPoliceScheduleList',
			payload: {
				police_unit_id: policeUnitId,
				schedule_date: allWeekMone[Number(values)]
			},
			success: (e) => {
                 if(e.result.reason.code == '200'){
                   _self.setState({
							visibles: `${shiftsId}${policeUnitId}${values}`,
							shiftKey: '',
							headKey: '',
							types: types
							// isHeight: true
						})
                }else{
                    return false
                }

			}
		})
	}
	//复制排班日期(日)
	confirmCopyDate = (scheduleDate, type) => {
		const { form, dispatch, service: { schedulingList: { page }, policeSchedule } } = this.props
		const { allWeekMone, endTakeTears, treeValue, startTakeTears } = this.state
		var _self = this

		form.validateFields((err, fieldsValue) => {
			if (err) return
			console.log('fieldsValue', fieldsValue, 'fieldsValue', type, scheduleDate)

			if (fieldsValue.copy_date) {
				if (fieldsValue.copy_date.format('YYYY-MM-DD') <= this.formatDate(new Date(), true)) {
                    Message.destroy()
					Message.error('不能复制到今天以前的日期（包含今天）')
					return false
				} else {
					dispatch({
						type: 'service/copyDaySchedule',
						payload: {
							schedule_date: scheduleDate,
							to_schedule_date: fieldsValue.copy_date.format('YYYY-MM-DD')
						},
						success: (e) => {

                            if (e.result.reason.code == '200') {
								console.log(e.result.code)
									if (e.result.code == 500) {
                                        Message.destroy()
										Message.error(e.result.msg)
									} else {
                                        Message.destroy()
										Message.success('复制排班成功')
									}
									_self.setState({
										visibles: '',
										shiftKey: '',
										headKey: '',
										visibleCopyDate: ''
									})

									page.currentPage = 1
									page.showCount = reportList

									this.getSchedulingList(page, {
										schedule_end_date: endTakeTears,
										schedule_organization_code: this.state.treeValue == '0' ? '' : this.state.treeValue,
										schedule_start_date: startTakeTears
									})
							} else {
                                Message.destroy()
								Message.error('复制排班失败')
								return false
							}
						}
					})
				}
			} else {
                Message.destroy()
				Message.error('请选择复制到的日期')
				return false
			}
		})
	}
	//复制排班日期（周）
	confirmCopyWeek = () => {
		const { form, dispatch, service: { schedulingList: { page }, policeSchedule } } = this.props
		const { allWeekMone, endTakeTears, treeValue, startTakeTears } = this.state
		var _self = this

		form.validateFields((err, fieldsValue) => {
			if (err) return
			console.log(
				'fieldsValue',
				moment(fieldsValue.copy_week).day(1).format('YYYY-MM-DD'),
				fieldsValue.copy_week,
				'fieldsValue',
				allWeekMone,
				this.getWeekStartDate(new Date(), true)
			)

			if (fieldsValue.copy_week) {
				if (
					moment(fieldsValue.copy_week).day(1).format('YYYY-MM-DD') <= this.getWeekStartDate(new Date(), true)
				) {
                    Message.destroy()
					Message.error('请选择本周之后的日期')
					return false
				} else {
					dispatch({
						type: 'service/copyWeekSchedule',
						payload: {
							schedule_date: allWeekMone[0],
							to_schedule_date: moment(fieldsValue.copy_week).day(1).format('YYYY-MM-DD')
						},
						success: (e) => {
							if (e.result.reason.code == '200') {
								console.log(e.result.code)
								if (e.result.code == 500) {
                                    Message.destroy()
									Message.error(e.result.msg)
								} else {
                                    Message.destroy()
									Message.success('复制排班成功')
								}
								_self.setState({
									visibles: '',
									shiftKey: '',
									headKey: '',
									visibleCopyWeek: false
								})

								page.currentPage = 1
								page.showCount = reportList

								this.getSchedulingList(page, {
									schedule_end_date: endTakeTears,
									schedule_organization_code: this.state.treeValue == '0' ? '' : this.state.treeValue,
									schedule_start_date: startTakeTears
								})
							} else {
                                Message.destroy()
								Message.error('复制排班失败')
								return false
							}
						}
					})
				}
			} else {
                Message.destroy()
				Message.error('请选择复制到的周')
				return false
			}
		})
	}
	//新建编辑弹窗确定
	confirm = (policeUnitId, type, shiftsId, name, code, scheduleId) => {
		// Message.info('Clicked on Yes.')
		console.log('确定', policeUnitId, type, shiftsId, name, code, scheduleId)

		const { form, dispatch, service: { schedulingList: { page }, policeSchedule } } = this.props
		const { startDate, endDate, searchValue, startTakeTears, endTakeTears, allWeekMone, treeValue } = this.state
		var _self = this

		form.validateFields((err, fieldsValue) => {
			if (err) return
			console.log('fieldsValue', fieldsValue, 'fieldsValue')

			let formData = {
				schedule_organization_code: code,
				schedule_organization_name: name,
				shifts_id: shiftsId,
				police_unit_id: policeUnitId,
				schedule_date: allWeekMone[Number(type)]
			}
			let police_message = []
			if (fieldsValue.place_values == undefined && fieldsValue.or_place_values == undefined) {
				console.log('什么都没选')
                Message.destroy()
				Message.error('请选择排班人员')
				return false
			}
			if (fieldsValue.place_values == undefined && !fieldsValue.or_place_values.length) {
				console.log('什么都没选')
                Message.destroy()
				Message.error('请选择排班人员')
				return false
			}

			if (fieldsValue.place_values && fieldsValue.place_values.length) {
				for (let index = 0; index < fieldsValue.place_values.length; index++) {
					const element = fieldsValue.place_values[index]
					console.log(element, policeSchedule.find((v) => element == v.idCard))
					if (policeSchedule.find((v) => element == v.idCard) != undefined) {
						police_message.push(policeSchedule.find((v) => element == v.idCard))
					}
				}
			}
			if (fieldsValue.or_place_values && fieldsValue.or_place_values.length) {
				for (let index = 0; index < fieldsValue.or_place_values.length; index++) {
					const element = fieldsValue.or_place_values[index]
					console.log(element, policeSchedule.find((v) => element == v.idCard))
					if (policeSchedule.find((v) => element == v.idCard) != undefined) {
						police_message.push(policeSchedule.find((v) => element == v.idCard))
					}
				}
			}
			if (scheduleId != null) {
				formData = {
					...formData,
					schedule_id: scheduleId
				}
			}
			console.log('提交===', {
				...formData,
				police_message: police_message
			})
			dispatch({
				type: scheduleId != null ? 'service/updateSchedule' : 'service/insertSchedule',
				payload: {
					...formData,
					police_message: police_message
				},
				success: (e) => {
					if (e.result.reason.code == '200') {
						console.log(e.result.code)
						if (e.result.code == 500) {
                            Message.destroy()
							Message.error(e.result.msg)
						} else {
                            Message.destroy()
							Message.success(scheduleId == null ? '排班成功' : '编辑成功')
						}
						_self.setState({
							visibles: '',
							shiftKey: '',
							headKey: ''
						})

						page.currentPage = 1
						page.showCount = reportList

						this.getSchedulingList(page, {
							schedule_end_date: endTakeTears,
							schedule_organization_code: this.state.treeValue == '0' ? '' : this.state.treeValue,
							schedule_start_date: startTakeTears
						})
					} else {
                        Message.destroy()
						Message.error(scheduleId == null ? '排班失败' : '编辑失败')
						return false
					}
				}
			})
		})
	}
	//弹窗 取消按钮
	cancel = (e) => {
		this.setState({
			visibles: '',
			shiftKey: '',
			headKey: '',
			types: '',
			visibleCopyDate: '',
			visibleCopyWeek: false
		})
	}
	//新建排班
	handleVisibleChange = (visible, policeUnitId, type, shiftsId) => {
		// this.setState({ visible })
		console.log(visible, policeUnitId, type, shiftsId)
		this.getPoliceScheduleList(policeUnitId, type, shiftsId)
	}
	//编辑新建排班人员选择弹窗内容
	content = (type, policeMessage) => {
		const { form, service: { policeSchedule } } = this.props
		const { getFieldDecorator } = form
		console.log(type, policeSchedule)

		let arr = [],
			brr = [],
			sectVluae = []
		if (type == 'edit') {
			if (policeMessage) {
				for (let index = 0; index < policeMessage.length; index++) {
					const element = policeMessage[index]
					console.log(element)
					sectVluae.push(element.idCard)
					console.log(sectVluae)
				}
			}
		}
		console.log(type, policeMessage, sectVluae)
		if (policeSchedule) {
			for (let index = 0; index < policeSchedule.length; index++) {
				const element = policeSchedule[index]
				if (element.type == 'N') {
					arr.push({
						...element
						// label: element.name,
						// value: element.idCard
					})
				} else {
					brr.push({
						...element
						// label: element.name,
						// value: element.idCard
					})
				}
			}
			return (
				<div className={styles.bubblePick}>
					<div className={styles.notchoosePick}>
						<div className={styles.poickTitle}>未排班人员</div>
						<div>
							{arr.length ? (
								<Form>
									<Form.Item>
										{getFieldDecorator('place_values')(
											<Checkbox.Group style={{ width: '100%' }}>
												<Row>
													{arr.map((v) => (
														<Col span={8}>
															<Checkbox value={v.idCard} key={v.idCard}>
																{v.name}
															</Checkbox>
														</Col>
													))}
												</Row>
											</Checkbox.Group>
										)}
									</Form.Item>
								</Form>
							) : (
								<div className={styles.poickFlow}>均已排班</div>
							)}

							{/* <Checkbox.Group options={arr} /> */}
						</div>
					</div>
					<div className={styles.choosePick}>
						<div className={styles.poickTitle}>已排班人员</div>
						<div>
							{brr.length ? (
								<Form>
									<Form.Item>
										{getFieldDecorator('or_place_values', {
											initialValue: type == 'edit' ? sectVluae : []
										})(
											<Checkbox.Group style={{ width: '100%' }}>
												<Row>
													{brr.map((v) => (
														<Col span={8}>
															<Checkbox value={v.idCard} key={v.idCard}>
																{v.name}
															</Checkbox>
														</Col>
													))}
												</Row>
											</Checkbox.Group>
										)}
									</Form.Item>
								</Form>
							) : (
								<div className={styles.poickFlow}>均未排班</div>
							)}

							{/* <Checkbox.Group options={brr} /> */}
						</div>
					</div>
				</div>
			)
		}
	}
	onPanelChange(value, mode) {
		console.log(value, mode)
	}
	//选择复制到哪一天的弹窗(日)
	copyDateSelection = (mones) => {
		const { form, service: { policeSchedule } } = this.props
		const { visibleCopyDate, openKey, allWeekMone } = this.state
		const { getFieldDecorator } = form
		// this.setState({openKey: true})
		console.log('渲染')
		return (
			<div className={styles.copyDate}>
				<div style={{ width: 282, border: '1px solid #40a9ff', borderRadius: 4, height: 305 }}>
					<Form onSubmit={this.confirmCopyDate}>
						{console.log('jici')}
						<Form.Item>
							{getFieldDecorator('copy_date', {})(
								<DatePicker
									dropdownClassName={`${mones == 0
										? styles.copyDatePicko
										: mones == 1
											? styles.copyDatePickt
											: mones == 2
												? styles.copyDatePickr
												: mones == 3
													? styles.copyDatePickf
													: mones == 4
														? styles.copyDatePicke
														: mones == 5
															? styles.copyDatePicks
															: mones == 6 ? styles.copyDatePicku : null}`}
									style={{ width: 280 }}
									open={true}
									showToday={false}
									dateRender={(current) => {
										const style = {}
										if (current.format('YYYY-MM-DD') === allWeekMone[mones]) {
											style.border = '1px solid #1890ff'
											style.borderRadius = '50%'
										}
										return (
											<div className="ant-calendar-date" style={style}>
												{current.date()}
											</div>
										)
									}}
								/>
							)}
						</Form.Item>
					</Form>
				</div>
			</div>
		)
	}
	//选择复制到哪一天的弹窗(周)
	copyWeekSelection = () => {
		const { form, service: { policeSchedule } } = this.props
		const { visibleCopyDate, openKey, allWeekMone } = this.state
		const { getFieldDecorator } = form
		// this.setState({openKey: true})
		console.log('渲染')
		return (
			<div className={styles.copyDate}>
				<div style={{ width: 288, border: '1px solid #40a9ff', borderRadius: 4, height: 272 }}>
					<Form onSubmit={this.confirmCopyWeek}>
						{console.log('jici')}
						<Form.Item>
							{getFieldDecorator('copy_week', {})(
								<WeekPicker
									dropdownClassName={styles.copyDatePick}
									style={{ width: 280 }}
									open={true}
									showToday={false}
									dateRender={(current) => {
										// console.log(current)
										const style = {}

										if (allWeekMone.find((x) => x === current.format('YYYY-MM-DD'))) {
											style.border = '1px solid #1890ff'
											style.borderRadius = '50%'
										}
										return (
											<div className="ant-calendar-date" style={style}>
												{current.date()}
											</div>
										)
									}}
								/>
							)}
						</Form.Item>
					</Form>
				</div>
			</div>
		)
	}
	handleModalVisibleClose = () => {
		console.log('4545456')

		this.setState({ modalVisible: false, rangeValue: {} })
	}
	modalVisibleChange = (ids, code) => {
		console.log(ids, code)
		if (ids && code) {
			this.setState({
				modalVisible: true,
				rangeValue: {
					label_area_id: ids,
					code: code
				}
			})
		}
	}
	//导出
	exportXLSX = (e) => {
		const { startTakeTears, endTakeTears, treeValue } = this.state

		const fieldsValues = JSON.stringify({
			schedule_end_date: endTakeTears,
			schedule_organization_code: this.state.treeValue == '0' ? '' : this.state.treeValue,
			schedule_start_date: startTakeTears,
			government: JSON.parse(sessionStorage.getItem('groupListCode'))
		})
		console.log(fieldsValues)
		window.open(
			`${'./dow.html?serverUrl='}${window.configUrl
				.serverUrl}${'&fieldsValue='}${fieldsValues}${'&currentXLSX='}${'duty/scheduleExport'}`,
			'_blank'
		)
	}
	render() {
		const {
			expandedKeys,
			autoExpandParent,
			searchTreeLoad,
			treeValue,
			weekData,
			dates,
			headKey,
			weekMone,
			shiftKey,
			allWeekMone,
			visibles,
			types,
			visibleCopyDate,
			visibleCopyWeek,
			isHeight
		} = this.state
		const {
			loading,
			service: {
				schedulingList: { list, page },
				useList,
				policeList,
				labelArea,
				labelLine,
				userPliceList,
				policeSchedule
			}
		} = this.props
		// console.log('isHeight', isHeight)
		// 进行数组扁平化处理
		generateList(this.props.service.useList)
		const headList = [
			{
				title: '机构',
				key: '1',
				class: styles.institutionsHead,
				mones: null
			},
			{
				title: '巡逻区域',
				key: '2',
				class: styles.areaHead,
				mones: null
			},
			{
				title: '巡逻线路',
				key: '3',
				class: styles.lineHead,
				mones: null
			},
			{
				title: '警力单元',
				key: '4',
				class: styles.unitHead,
				mones: null
			},
			{
				title: '星期一',
				key: '5',
				class: styles.weeks,
				mones: 0
			},
			{
				title: '星期二',
				key: '6',
				class: styles.weeks,
				mones: 1
			},
			{
				title: '星期三',
				key: '7',
				class: styles.weeks,
				mones: 2
			},
			{
				title: '星期四',
				key: '8',
				class: styles.weeks,
				mones: 3
			},
			{
				title: '星期五',
				key: '9',
				class: styles.weeks,
				mones: 4
			},
			{
				title: '星期六',
				key: '10',
				class: styles.weeks,
				mones: 5
			},
			{
				title: '星期日',
				key: '11',
				class: styles.lastweeks,
				mones: 6
			}
		]
		const dataMethods = {
			modalVisible: this.state.modalVisible,
			handleModalVisible: this.handleModalVisibleClose,
			loading: this.props.loading,
			rangeValue: this.state.rangeValue
		}
		return (
			<div>
				{/* {console.log(loading)} */}
				<Card style={{ width: '1663px', background: 'none' }} bordered={false}>
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
							<Card bordered={false} className={`${styles.tableListCard} ${styles.tableListLeft}`}>
								<div className={styles.headTitle}>
									{authorityIsTrue('czht_qwgl_qwbb_qwbbdc') ? (
										<Button type="primary" onClick={this.exportXLSX} className={styles.h2Color}>
											导出
										</Button>
									) : null}

									{list.length && authorityIsTrue('czht_qwgl_qwbb_sc') ? (
										<Button
											type="primary"
											className={styles.clearCarBtn}
											onClick={() => this.clearDates(null, allWeekMone, 'arr')}
										>
											清空本周排班
										</Button>
									) : null}
									{list.length && authorityIsTrue('czht_qwgl_qwbb_xz') ? (
										<Popconfirm
											placement="bottom"
											title={visibleCopyWeek ? this.copyWeekSelection() : ''}
											visible={visibleCopyWeek}
											onConfirm={() => this.confirmCopyWeek()}
											onCancel={this.cancel}
										>
											<Button
												type="primary"
												className={styles.addCarBtn}
												onClick={() =>
													this.setState({
														visibleCopyWeek: true
													})}
											>
												复制本周排班
											</Button>
										</Popconfirm>
									) : null}

									<div className={styles.showCountweek}>{dates}</div>
									<WeekPicker
										onChange={this.handleWeekChange}
										placeholder={weekData}
										className={styles.changeWeek}
									/>
								</div>

								<Spin spinning={loading}>
									<div className={styles.sched}>
										<ul className={styles.schedHead}>
											{headList.map((v) => (
												<Popconfirm
													placement="bottom"
													title={
														visibleCopyDate == v.key ? this.copyDateSelection(v.mones) : ''
													}
													visible={visibleCopyDate == v.key}
													onConfirm={() =>
														this.confirmCopyDate(allWeekMone[v.mones], 'dates')}
													onCancel={this.cancel}
													key={v.key}
												>
													<li className={`${styles.schedHeadItem} ${v.class}`}>
														{v.key > 4 ? (
															<div className={styles.schedHeadTime}>
																{v.title}（{weekMone[v.mones]}）
															</div>
														) : (
															<div className={styles.schedHeadTime}>{v.title}</div>
														)}

														{v.key > 4 && list.length ? (
															<div
																className={styles.schedHeadIcon}
																onClick={() =>
																	this.setState({
																		headKey: headKey == v.key ? '' : v.key,
																		visibleCopyDate: ''
																	})}
															>
																<img src="./image/downs.png" alt="" />
															</div>
														) : null}

														{headKey == v.key ? (
															<div className={styles.schedHeadBtns}>
																{authorityIsTrue('czht_qwgl_qwbb_xz') ? (
																	<p
																		onClick={() =>
																			this.setState({
																				visibleCopyDate: v.key,
																				headKey: ''
																			})}
																	>
																		复制本日排班
																	</p>
																) : null}

																{allWeekMone[v.mones] >=
																	this.formatDate(new Date(), true) &&
																authorityIsTrue('czht_qwgl_qwbb_sc') ? (
																	<p
																		onClick={() =>
																			this.clearDates(
																				null,
																				allWeekMone[v.mones],
																				'str'
																			)}
																	>
																		清空本日排班
																	</p>
																) : null}
															</div>
														) : null}
													</li>
												</Popconfirm>
											))}
										</ul>
										{list && list.length ? (
											<div className={styles.schedContent}>
												{list &&
													list.map((v, num) => (
														<ul className={styles.institutionsBody} key={num}>
															<li
																className={styles.institutions}
																id={v.police_unit_organization_code}
															>
																{v.police_unit_organization_name}
															</li>
															<li>
																{v.labelArea &&
																	v.labelArea.map((b, index) => (
																		<ul
																			className={styles.institutionsBody}
																			key={index}
																		>
																			<li
																				className={styles.area}
																				onClick={() =>
																					this.modalVisibleChange(
																						b.label_area_id,
																						v.police_unit_organization_code
																					)}
																				id={`label_area_id${num}${index}`}
																				style={{
																					height: !isHeight
																						? 'auto'
																						: v.labelArea.length == 1
																							? document.getElementById(
																									v.police_unit_organization_code
																								) != null
																								? document.getElementById(
																										v.police_unit_organization_code
																									).clientHeight +
																									2 +
																									'px'
																								: 'auto'
																							: 'auto'
																				}}
																			>
																				{b.label_area_name}
																			</li>
																			<li>
																				{b.poliecUnit &&
																					b.poliecUnit.map((m, k) => (
																						<ul
																							key={k}
																							className={`${styles.institutionsBody}${styles.institutionsDis}`}
																						>
																							{/* <div
																						className={
																							styles.institutionsCon
																						}
																					> */}

																							<li
																								className={styles.line}
																								style={{
																									height: !isHeight
																										? 'auto'
																										: b.poliecUnit
																												.length ==
																											1
																											? document.getElementById(
																													`label_area_id${num}${index}`
																												) != null
																												? document.getElementById(
																														`label_area_id${num}${index}`
																													)
																														.clientHeight +
																													2 +
																													'px'
																												: 'auto'
																											: 'auto'
																								}}
																							>
																								{m.label_line_name}
																							</li>
																							<li
																								className={styles.unit}
																								style={{
																									height: !isHeight
																										? 'auto'
																										: b.poliecUnit
																												.length ==
																											1
																											? document.getElementById(
																													`label_area_id${num}${index}`
																												) != null
																												? document.getElementById(
																														`label_area_id${num}${index}`
																													)
																														.clientHeight +
																													2 +
																													'px'
																												: 'auto'
																											: 'auto'
																								}}
																							>
																								{m.police_unit_name}
																							</li>
																							{m.d0 ? (
																								<ul
																									className={
																										styles.shiftsBody
																									}
																								>
																									{/* <div className={styles.shiftsCon}> */}
																									{m.d0.map(
																										(n, g) => (
																											<Popconfirm
																												placement="bottom"
																												key={g}
																												title={
																													visibles ==
																													`${n.shifts_id}${m.police_unit_id}${'0'}` ? (
																														this.content(
																															types,
																															n.police_message
																														)
																													) : (
																														''
																													)
																												}
																												visible={
																													visibles ==
																													`${n.shifts_id}${m.police_unit_id}${'0'}`
																												}
																												trigger="click"
																												className={
																													styles.popconfirms
																												}
																												onConfirm={() =>
																													this.confirm(
																														m.police_unit_id,
																														'0',
																														n.shifts_id,
																														v.police_unit_organization_name,
																														v.police_unit_organization_code,
																														n.schedule_id
																													)}
																												onCancel={
																													this
																														.cancel
																												}
																											>
																												<li
																													className={
																														styles.shifts
																													}
																													style={{
																														height: h_max
																													}}
																												>
																													{shiftKey ==
																													`${n.shifts_id}${m.police_unit_id}${'0'}` ? (
																														<div
																															className={
																																styles.shiftsBtns
																															}
																														>
																															{authorityIsTrue(
																																'czht_qwgl_qwbb_bj'
																															) ? (
																																<p
																																	className={
																																		styles.actives
																																	}
																																	onClick={() =>
																																		this.getPoliceScheduleList(
																																			m.police_unit_id,
																																			'0',
																																			n.shifts_id,
																																			n.schedule_id,
																																			'edit',
																																			n.police_message
																																		)}
																																>
																																	编辑
																																</p>
																															) : null}
																															{authorityIsTrue(
																																'czht_qwgl_qwbb_sc'
																															) ? (
																																<p
																																	className={
																																		styles.actives
																																	}
																																	onClick={() =>
																																		this.clearDates(
																																			n.schedule_id,
																																			'0',
																																			'str',
																																			m.police_unit_name,
																																			n.shifts_name
																																		)}
																																>
																																	清空
																																</p>
																															) : null}
																														</div>
																													) : null}

																													<div
																														className={`${'shiftTitles'} ${styles.shiftTitle}`}
																														name="shiftTitles"
																														style={{
																															height: h_max
																														}}
																													>
																														<Tooltip
																															title={
																																n.shifts_name
																															}
																														>
																															{n.shifts_name.slice(0, 2)}：{n.police_message ? (
																																n.police_message
																																	.map(
																																		(
																																			x
																																		) => {
																																			return x.name
																																		}
																																	)
																																	.join(
																																		'、'
																																	)
																															) : (
																																<span
																																	className={`${n.type ==
																																	'Y'
																																		? styles.unShift
																																		: styles.unShiftCo}`}
																																	onClick={() => {
																																		if (
																																			authorityIsTrue(
																																				'czht_qwgl_qwbb_xz'
																																			) &&
																																			n.type ==
																																				'Y'
																																		) {
																																			this.handleVisibleChange(
																																				true,
																																				m.police_unit_id,
																																				'0',
																																				n.shifts_id
																																			)
																																		}
																																	}}
																																>
																																	未排班
																																</span>
																															)}
																														</Tooltip>
																													</div>
																													{n.type ==
																														'Y' &&
																													n.schedule_id !=
																														null ? (
																														<div
																															className={
																																styles.shifticon
																															}
																														>
																															<img
																																src="./image/downs.png"
																																alt=""
																																onClick={() => {
																																	// if (
																																	// 	shiftKey !=
																																	// 	''
																																	// ) {
																																	// 	this.setState(
																																	// 		{
																																	// 			isHeight: false
																																	// 		},
																																	// 		() => {
																																	// 			this.setState(
																																	// 				{
																																	// 					isHeight: true
																																	// 				}
																																	// 			)
																																	// 		}
																																	// 	)
																																	// }
																																	this.setState(
																																		{
																																			shiftKey:
																																				shiftKey ==
																																				`${n.shifts_id}${m.police_unit_id}${'0'}`
																																					? ''
																																					: `${n.shifts_id}${m.police_unit_id}${'0'}`
																																		}
																																	)
																																}}
																															/>
																														</div>
																													) : null}
																												</li>
																											</Popconfirm>
																										)
																									)}
																									{/* </div> */}
																								</ul>
																							) : (
																								<li
																									className={
																										styles.unshiftsCon
																									}
																								>
																									无班次
																								</li>
																							)}
																							{m.d1 ? (
																								<ul
																									className={
																										styles.shiftsBody
																									}
																								>
																									{/* <div className={styles.shiftsCon}> */}
																									{m.d1.map(
																										(n, g) => (
																											<Popconfirm
																												key={g}
																												placement="bottom"
																												title={
																													visibles ==
																													`${n.shifts_id}${m.police_unit_id}${'1'}` ? (
																														this.content(
																															types,
																															n.police_message
																														)
																													) : (
																														''
																													)
																												}
																												visible={
																													visibles ==
																													`${n.shifts_id}${m.police_unit_id}${'1'}`
																												}
																												trigger="click"
																												className={
																													styles.popconfirms
																												}
																												onConfirm={() =>
																													this.confirm(
																														m.police_unit_id,
																														'1',
																														n.shifts_id,
																														v.police_unit_organization_name,
																														v.police_unit_organization_code,
																														n.schedule_id
																													)}
																												onCancel={
																													this
																														.cancel
																												}
																											>
																												<li
																													className={
																														styles.shifts
																													}
																													style={{
																														height: h_max
																													}}
																												>
																													{shiftKey ==
																													`${n.shifts_id}${m.police_unit_id}${'1'}` ? (
																														<div
																															className={
																																styles.shiftsBtns
																															}
																														>
																															{authorityIsTrue(
																																'czht_qwgl_qwbb_bj'
																															) ? (
																																<p
																																	className={
																																		styles.actives
																																	}
																																	onClick={() =>
																																		this.getPoliceScheduleList(
																																			m.police_unit_id,
																																			'1',
																																			n.shifts_id,
																																			n.schedule_id,
																																			'edit',
																																			n.police_message
																																		)}
																																>
																																	编辑
																																</p>
																															) : null}
																															{authorityIsTrue(
																																'czht_qwgl_qwbb_sc'
																															) ? (
																																<p
																																	className={
																																		styles.actives
																																	}
																																	onClick={() =>
																																		this.clearDates(
																																			n.schedule_id,
																																			'1',
																																			'str',
																																			m.police_unit_name,
																																			n.shifts_name
																																		)}
																																>
																																	清空
																																</p>
																															) : null}
																														</div>
																													) : null}
																													<div
																														className={`${'shiftTitles'} ${styles.shiftTitle}`}
																														mame="shiftTitles"
																														style={{
																															height: h_max
																														}}
																													>
																														<Tooltip
																															title={
																																n.shifts_name
																															}
																														>
																															{n.shifts_name.slice(0, 2)}：{n.police_message ? (
																																n.police_message
																																	.map(
																																		(
																																			x
																																		) => {
																																			return x.name
																																		}
																																	)
																																	.join(
																																		'、'
																																	)
																															) : (
																																<span
																																	className={`${n.type ==
																																	'Y'
																																		? styles.unShift
																																		: styles.unShiftCo}`}
																																	onClick={() => {
																																		if (
																																			authorityIsTrue(
																																				'czht_qwgl_qwbb_xz'
																																			) &&
																																			n.type ==
																																				'Y'
																																		) {
																																			this.handleVisibleChange(
																																				true,
																																				m.police_unit_id,
																																				'1',
																																				n.shifts_id
																																			)
																																		}
																																	}}
																																>
																																	未排班
																																</span>
																															)}
																														</Tooltip>
																													</div>
																													{n.type ==
																														'Y' &&
																													n.schedule_id !=
																														null ? (
																														<div
																															className={
																																styles.shifticon
																															}
																														>
																															<img
																																src="./image/downs.png"
																																alt=""
																																onClick={() => {
																																	// if (
																																	// 	shiftKey !=
																																	// 	''
																																	// ) {
																																	// 	this.setState(
																																	// 		{
																																	// 			isHeight: false
																																	// 		},
																																	// 		() => {
																																	// 			this.setState(
																																	// 				{
																																	// 					isHeight: true
																																	// 				}
																																	// 			)
																																	// 		}
																																	// 	)
																																	// }
																																	this.setState(
																																		{
																																			shiftKey:
																																				shiftKey ==
																																				`${n.shifts_id}${m.police_unit_id}${'1'}`
																																					? ''
																																					: `${n.shifts_id}${m.police_unit_id}${'1'}`
																																		}
																																	)
																																}}
																															/>
																														</div>
																													) : null}
																												</li>
																											</Popconfirm>
																										)
																									)}
																									{/* </div> */}
																								</ul>
																							) : (
																								<li
																									className={
																										styles.unshiftsCon
																									}
																								>
																									无班次
																								</li>
																							)}
																							{m.d2 ? (
																								<ul
																									className={
																										styles.shiftsBody
																									}
																								>
																									{/* <div className={styles.shiftsCon}> */}
																									{m.d2.map(
																										(n, g) => (
																											<Popconfirm
																												placement="bottom"
																												key={g}
																												title={
																													visibles ==
																													`${n.shifts_id}${m.police_unit_id}${'2'}` ? (
																														this.content(
																															types,
																															n.police_message
																														)
																													) : (
																														''
																													)
																												}
																												visible={
																													visibles ==
																													`${n.shifts_id}${m.police_unit_id}${'2'}`
																												}
																												trigger="click"
																												className={
																													styles.popconfirms
																												}
																												onConfirm={() =>
																													this.confirm(
																														m.police_unit_id,
																														'2',
																														n.shifts_id,
																														v.police_unit_organization_name,
																														v.police_unit_organization_code,
																														n.schedule_id
																													)}
																												onCancel={
																													this
																														.cancel
																												}
																											>
																												<li
																													className={
																														styles.shifts
																													}
																													style={{
																														height: h_max
																													}}
																												>
																													{shiftKey ==
																													`${n.shifts_id}${m.police_unit_id}${'2'}` ? (
																														<div
																															className={
																																styles.shiftsBtns
																															}
																														>
																															{authorityIsTrue(
																																'czht_qwgl_qwbb_bj'
																															) ? (
																																<p
																																	className={
																																		styles.actives
																																	}
																																	onClick={() =>
																																		this.getPoliceScheduleList(
																																			m.police_unit_id,
																																			'2',
																																			n.shifts_id,
																																			n.schedule_id,
																																			'edit',
																																			n.police_message
																																		)}
																																>
																																	编辑
																																</p>
																															) : null}
																															{authorityIsTrue(
																																'czht_qwgl_qwbb_sc'
																															) ? (
																																<p
																																	className={
																																		styles.actives
																																	}
																																	onClick={() =>
																																		this.clearDates(
																																			n.schedule_id,
																																			'2',
																																			'str',
																																			m.police_unit_name,
																																			n.shifts_name
																																		)}
																																>
																																	清空
																																</p>
																															) : null}
																														</div>
																													) : null}
																													<div
																														className={`${'shiftTitles'} ${styles.shiftTitle}`}
																														mame="shiftTitles"
																														style={{
																															height: h_max
																														}}
																													>
																														<Tooltip
																															title={
																																n.shifts_name
																															}
																														>
																															{n.shifts_name.slice(0, 2)}：{n.police_message ? (
																																n.police_message
																																	.map(
																																		(
																																			x
																																		) => {
																																			return x.name
																																		}
																																	)
																																	.join(
																																		'、'
																																	)
																															) : (
																																<span
																																	className={`${n.type ==
																																	'Y'
																																		? styles.unShift
																																		: styles.unShiftCo}`}
																																	onClick={() => {
																																		if (
																																			authorityIsTrue(
																																				'czht_qwgl_qwbb_xz'
																																			) &&
																																			n.type ==
																																				'Y'
																																		) {
																																			this.handleVisibleChange(
																																				true,
																																				m.police_unit_id,
																																				'2',
																																				n.shifts_id
																																			)
																																		}
																																	}}
																																>
																																	未排班
																																</span>
																															)}
																														</Tooltip>
																													</div>
																													{n.type ==
																														'Y' &&
																													n.schedule_id !=
																														null ? (
																														<div
																															className={
																																styles.shifticon
																															}
																														>
																															<img
																																src="./image/downs.png"
																																alt=""
																																onClick={() => {
																																	// if (
																																	// 	shiftKey !=
																																	// 	''
																																	// ) {
																																	// 	this.setState(
																																	// 		{
																																	// 			isHeight: false
																																	// 		},
																																	// 		() => {
																																	// 			this.setState(
																																	// 				{
																																	// 					isHeight: true
																																	// 				}
																																	// 			)
																																	// 		}
																																	// 	)
																																	// }
																																	this.setState(
																																		{
																																			shiftKey:
																																				shiftKey ==
																																				`${n.shifts_id}${m.police_unit_id}${'2'}`
																																					? ''
																																					: `${n.shifts_id}${m.police_unit_id}${'2'}`
																																		}
																																	)
																																}}
																															/>
																														</div>
																													) : null}
																												</li>
																											</Popconfirm>
																										)
																									)}
																									{/* </div> */}
																								</ul>
																							) : (
																								<li
																									className={
																										styles.unshiftsCon
																									}
																								>
																									无班次
																								</li>
																							)}
																							{m.d3 ? (
																								<ul
																									className={
																										styles.shiftsBody
																									}
																								>
																									{/* <div className={styles.shiftsCon}> */}
																									{m.d3.map(
																										(n, g) => (
																											<Popconfirm
																												placement="bottom"
																												key={g}
																												title={
																													visibles ==
																													`${n.shifts_id}${m.police_unit_id}${'3'}` ? (
																														this.content(
																															types,
																															n.police_message
																														)
																													) : (
																														''
																													)
																												}
																												visible={
																													visibles ==
																													`${n.shifts_id}${m.police_unit_id}${'3'}`
																												}
																												trigger="click"
																												className={
																													styles.popconfirms
																												}
																												onConfirm={() =>
																													this.confirm(
																														m.police_unit_id,
																														'3',
																														n.shifts_id,
																														v.police_unit_organization_name,
																														v.police_unit_organization_code,
																														n.schedule_id
																													)}
																												onCancel={
																													this
																														.cancel
																												}
																											>
																												<li
																													className={
																														styles.shifts
																													}
																													style={{
																														height: h_max
																													}}
																												>
																													{shiftKey ==
																													`${n.shifts_id}${m.police_unit_id}${'3'}` ? (
																														<div
																															className={
																																styles.shiftsBtns
																															}
																														>
																															{authorityIsTrue(
																																'czht_qwgl_qwbb_bj'
																															) ? (
																																<p
																																	className={
																																		styles.actives
																																	}
																																	onClick={() =>
																																		this.getPoliceScheduleList(
																																			m.police_unit_id,
																																			'3',
																																			n.shifts_id,
																																			n.schedule_id,
																																			'edit',
																																			n.police_message
																																		)}
																																>
																																	编辑
																																</p>
																															) : null}
																															{authorityIsTrue(
																																'czht_qwgl_qwbb_sc'
																															) ? (
																																<p
																																	className={
																																		styles.actives
																																	}
																																	onClick={() =>
																																		this.clearDates(
																																			n.schedule_id,
																																			'3',
																																			'str',
																																			m.police_unit_name,
																																			n.shifts_name
																																		)}
																																>
																																	清空
																																</p>
																															) : null}
																														</div>
																													) : null}
																													<div
																														className={`${'shiftTitles'} ${styles.shiftTitle}`}
																														mame="shiftTitles"
																														style={{
																															height: h_max
																														}}
																													>
																														<Tooltip
																															title={
																																n.shifts_name
																															}
																														>
																															{n.shifts_name.slice(0, 2)}：{n.police_message ? (
																																n.police_message
																																	.map(
																																		(
																																			x
																																		) => {
																																			return x.name
																																		}
																																	)
																																	.join(
																																		'、'
																																	)
																															) : (
																																<span
																																	className={`${n.type ==
																																	'Y'
																																		? styles.unShift
																																		: styles.unShiftCo}`}
																																	onClick={() => {
																																		if (
																																			authorityIsTrue(
																																				'czht_qwgl_qwbb_xz'
																																			) &&
																																			n.type ==
																																				'Y'
																																		) {
																																			this.handleVisibleChange(
																																				true,
																																				m.police_unit_id,
																																				'3',
																																				n.shifts_id
																																			)
																																		}
																																	}}
																																>
																																	未排班
																																</span>
																															)}
																														</Tooltip>
																													</div>
																													{n.type ==
																														'Y' &&
																													n.schedule_id !=
																														null ? (
																														<div
																															className={
																																styles.shifticon
																															}
																														>
																															<img
																																src="./image/downs.png"
																																alt=""
																																onClick={() => {
																																	// if (
																																	// 	shiftKey !=
																																	// 	''
																																	// ) {
																																	// 	this.setState(
																																	// 		{
																																	// 			isHeight: false
																																	// 		},
																																	// 		() => {
																																	// 			this.setState(
																																	// 				{
																																	// 					isHeight: true
																																	// 				}
																																	// 			)
																																	// 		}
																																	// 	)
																																	// }
																																	this.setState(
																																		{
																																			shiftKey:
																																				shiftKey ==
																																				`${n.shifts_id}${m.police_unit_id}${'3'}`
																																					? ''
																																					: `${n.shifts_id}${m.police_unit_id}${'3'}`
																																		}
																																	)
																																}}
																															/>
																														</div>
																													) : null}
																												</li>
																											</Popconfirm>
																										)
																									)}
																									{/* </div> */}
																								</ul>
																							) : (
																								<li
																									className={
																										styles.unshiftsCon
																									}
																								>
																									无班次
																								</li>
																							)}
																							{m.d4 ? (
																								<ul
																									className={
																										styles.shiftsBody
																									}
																								>
																									{/* <div className={styles.shiftsCon}> */}
																									{m.d4.map(
																										(n, g) => (
																											<Popconfirm
																												placement="bottom"
																												key={g}
																												title={
																													visibles ==
																													`${n.shifts_id}${m.police_unit_id}${'4'}` ? (
																														this.content(
																															types,
																															n.police_message
																														)
																													) : (
																														''
																													)
																												}
																												visible={
																													visibles ==
																													`${n.shifts_id}${m.police_unit_id}${'4'}`
																												}
																												trigger="click"
																												className={
																													styles.popconfirms
																												}
																												onConfirm={() =>
																													this.confirm(
																														m.police_unit_id,
																														'4',
																														n.shifts_id,
																														v.police_unit_organization_name,
																														v.police_unit_organization_code,
																														n.schedule_id
																													)}
																												onCancel={
																													this
																														.cancel
																												}
																											>
																												<li
																													className={
																														styles.shifts
																													}
																													style={{
																														height: h_max
																													}}
																												>
																													{shiftKey ==
																													`${n.shifts_id}${m.police_unit_id}${'4'}` ? (
																														<div
																															className={
																																styles.shiftsBtns
																															}
																														>
																															{authorityIsTrue(
																																'czht_qwgl_qwbb_bj'
																															) ? (
																																<p
																																	className={
																																		styles.actives
																																	}
																																	onClick={() =>
																																		this.getPoliceScheduleList(
																																			m.police_unit_id,
																																			'4',
																																			n.shifts_id,
																																			n.schedule_id,
																																			'edit',
																																			n.police_message
																																		)}
																																>
																																	编辑
																																</p>
																															) : null}
																															{authorityIsTrue(
																																'czht_qwgl_qwbb_sc'
																															) ? (
																																<p
																																	className={
																																		styles.actives
																																	}
																																	onClick={() =>
																																		this.clearDates(
																																			n.schedule_id,
																																			'4',
																																			'str',
																																			m.police_unit_name,
																																			n.shifts_name
																																		)}
																																>
																																	清空
																																</p>
																															) : null}
																														</div>
																													) : null}
																													<div
																														className={`${'shiftTitles'} ${styles.shiftTitle}`}
																														mame="shiftTitles"
																														style={{
																															height: h_max
																														}}
																													>
																														<Tooltip
																															title={
																																n.shifts_name
																															}
																														>
																															{n.shifts_name.slice(0, 2)}：{n.police_message ? (
																																n.police_message
																																	.map(
																																		(
																																			x
																																		) => {
																																			return x.name
																																		}
																																	)
																																	.join(
																																		'、'
																																	)
																															) : (
																																<span
																																	className={`${n.type ==
																																	'Y'
																																		? styles.unShift
																																		: styles.unShiftCo}`}
																																	onClick={() => {
																																		if (
																																			authorityIsTrue(
																																				'czht_qwgl_qwbb_xz'
																																			) &&
																																			n.type ==
																																				'Y'
																																		) {
																																			this.handleVisibleChange(
																																				true,
																																				m.police_unit_id,
																																				'4',
																																				n.shifts_id
																																			)
																																		}
																																	}}
																																>
																																	未排班
																																</span>
																															)}
																														</Tooltip>
																													</div>
																													{n.type ==
																														'Y' &&
																													n.schedule_id !=
																														null ? (
																														<div
																															className={
																																styles.shifticon
																															}
																														>
																															<img
																																src="./image/downs.png"
																																alt=""
																																onClick={() => {
																																	console.log(
																																		shiftKey
																																	)
																																	// if (
																																	// 	shiftKey !=
																																	// 	''
																																	// ) {
																																	// 	this.setState(
																																	// 		{
																																	// 			isHeight: false
																																	// 		},
																																	// 		() => {
																																	// 			this.setState(
																																	// 				{
																																	// 					isHeight: true
																																	// 				}
																																	// 			)
																																	// 		}
																																	// 	)
																																	// }
																																	this.setState(
																																		{
																																			shiftKey:
																																				shiftKey ==
																																				`${n.shifts_id}${m.police_unit_id}${'4'}`
																																					? ''
																																					: `${n.shifts_id}${m.police_unit_id}${'4'}`
																																			// isHeight: false
																																		}
																																	)
																																}}
																															/>
																														</div>
																													) : null}
																												</li>
																											</Popconfirm>
																										)
																									)}
																									{/* </div> */}
																								</ul>
																							) : (
																								<li
																									className={
																										styles.unshiftsCon
																									}
																								>
																									无班次
																								</li>
																							)}
																							{m.d5 ? (
																								<ul
																									className={
																										styles.shiftsBody
																									}
																								>
																									{/* <div className={styles.shiftsCon}> */}
																									{m.d5.map(
																										(n, g) => (
																											<Popconfirm
																												placement="bottom"
																												key={g}
																												title={
																													visibles ==
																													`${n.shifts_id}${m.police_unit_id}${'5'}` ? (
																														this.content(
																															types,
																															n.police_message
																														)
																													) : (
																														''
																													)
																												}
																												visible={
																													visibles ==
																													`${n.shifts_id}${m.police_unit_id}${'5'}`
																												}
																												trigger="click"
																												className={
																													styles.popconfirms
																												}
																												onConfirm={() =>
																													this.confirm(
																														m.police_unit_id,
																														'5',
																														n.shifts_id,
																														v.police_unit_organization_name,
																														v.police_unit_organization_code,
																														n.schedule_id
																													)}
																												onCancel={
																													this
																														.cancel
																												}
																											>
																												<li
																													className={
																														styles.shifts
																													}
																													style={{
																														height: h_max
																													}}
																												>
																													{shiftKey ==
																													`${n.shifts_id}${m.police_unit_id}${'5'}` ? (
																														<div
																															className={
																																styles.shiftsBtns
																															}
																														>
																															{authorityIsTrue(
																																'czht_qwgl_qwbb_bj'
																															) ? (
																																<p
																																	className={
																																		styles.actives
																																	}
																																	onClick={() =>
																																		this.getPoliceScheduleList(
																																			m.police_unit_id,
																																			'5',
																																			n.shifts_id,
																																			n.schedule_id,
																																			'edit',
																																			n.police_message
																																		)}
																																>
																																	编辑
																																</p>
																															) : null}
																															{authorityIsTrue(
																																'czht_qwgl_qwbb_sc'
																															) ? (
																																<p
																																	className={
																																		styles.actives
																																	}
																																	onClick={() =>
																																		this.clearDates(
																																			n.schedule_id,
																																			'5',
																																			'str',
																																			m.police_unit_name,
																																			n.shifts_name
																																		)}
																																>
																																	清空
																																</p>
																															) : null}
																														</div>
																													) : null}
																													<div
																														className={`${'shiftTitles'} ${styles.shiftTitle}`}
																														mame="shiftTitles"
																														style={{
																															height: h_max
																														}}
																													>
																														<Tooltip
																															title={
																																n.shifts_name
																															}
																														>
																															{n.shifts_name.slice(0, 2)}：{n.police_message ? (
																																n.police_message
																																	.map(
																																		(
																																			x
																																		) => {
																																			return x.name
																																		}
																																	)
																																	.join(
																																		'、'
																																	)
																															) : (
																																<span
																																	className={`${n.type ==
																																	'Y'
																																		? styles.unShift
																																		: styles.unShiftCo}`}
																																	onClick={() => {
																																		if (
																																			authorityIsTrue(
																																				'czht_qwgl_qwbb_xz'
																																			) &&
																																			n.type ==
																																				'Y'
																																		) {
																																			this.handleVisibleChange(
																																				true,
																																				m.police_unit_id,
																																				'5',
																																				n.shifts_id
																																			)
																																		}
																																	}}
																																>
																																	未排班
																																</span>
																															)}
																														</Tooltip>
																													</div>
																													{n.type ==
																														'Y' &&
																													n.schedule_id !=
																														null ? (
																														<div
																															className={
																																styles.shifticon
																															}
																														>
																															<img
																																src="./image/downs.png"
																																alt=""
																																onClick={() => {
																																	// if (
																																	// 	shiftKey !=
																																	// 	''
																																	// ) {
																																	// 	this.setState(
																																	// 		{
																																	// 			isHeight: false
																																	// 		},
																																	// 		() => {
																																	// 			this.setState(
																																	// 				{
																																	// 					isHeight: true
																																	// 				}
																																	// 			)
																																	// 		}
																																	// 	)
																																	// }
																																	this.setState(
																																		{
																																			shiftKey:
																																				shiftKey ==
																																				`${n.shifts_id}${m.police_unit_id}${'5'}`
																																					? ''
																																					: `${n.shifts_id}${m.police_unit_id}${'5'}`
																																		}
																																	)
																																}}
																															/>
																														</div>
																													) : null}
																												</li>
																											</Popconfirm>
																										)
																									)}
																									{/* </div> */}
																								</ul>
																							) : (
																								<li
																									className={
																										styles.unshiftsCon
																									}
																								>
																									无班次
																								</li>
																							)}
																							{m.d6 ? (
																								<ul
																									className={
																										styles.shiftsBody
																									}
																								>
																									{/* <div className={styles.shiftsCon}> */}
																									{m.d6.map(
																										(n, g) => (
																											<Popconfirm
																												placement="bottom"
																												key={g}
																												title={
																													visibles ==
																													`${n.shifts_id}${m.police_unit_id}${'6'}` ? (
																														this.content(
																															types,
																															n.police_message
																														)
																													) : (
																														''
																													)
																												}
																												visible={
																													visibles ==
																													`${n.shifts_id}${m.police_unit_id}${'6'}`
																												}
																												trigger="click"
																												className={
																													styles.popconfirms
																												}
																												// onVisibleChange={this.handleVisibleChange}
																												onConfirm={() =>
																													this.confirm(
																														m.police_unit_id,
																														'6',
																														n.shifts_id,
																														v.police_unit_organization_name,
																														v.police_unit_organization_code,
																														n.schedule_id
																													)}
																												onCancel={
																													this
																														.cancel
																												}
																											>
																												<li
																													className={
																														styles.shifts
																													}
																													style={{
																														height: h_max
																													}}
																												>
																													{shiftKey ==
																													`${n.shifts_id}${m.police_unit_id}${'6'}` ? (
																														<div
																															className={
																																styles.lastshiftsBtns
																															}
																														>
																															{authorityIsTrue(
																																'czht_qwgl_qwbb_bj'
																															) ? (
																																<p
																																	className={
																																		styles.actives
																																	}
																																	onClick={() =>
																																		this.getPoliceScheduleList(
																																			m.police_unit_id,
																																			'6',
																																			n.shifts_id,
																																			n.schedule_id,
																																			'edit',
																																			n.police_message
																																		)}
																																>
																																	编辑
																																</p>
																															) : null}
																															{authorityIsTrue(
																																'czht_qwgl_qwbb_sc'
																															) ? (
																																<p
																																	className={
																																		styles.actives
																																	}
																																	onClick={() =>
																																		this.clearDates(
																																			n.schedule_id,
																																			'6',
																																			'str',
																																			m.police_unit_name,
																																			n.shifts_name
																																		)}
																																>
																																	清空
																																</p>
																															) : null}
																														</div>
																													) : null}
																													<div
																														className={`${'shiftTitles'} ${styles.shiftTitle}`}
																														mame="shiftTitles"
																														style={{
																															height: h_max
																														}}
																													>
																														<Tooltip
																															title={
																																n.shifts_name
																															}
																														>
																															{n.shifts_name.slice(0, 2)}：{n.police_message ? (
																																n.police_message
																																	.map(
																																		(
																																			x
																																		) => {
																																			return x.name
																																		}
																																	)
																																	.join(
																																		'、'
																																	)
																															) : (
																																<span
																																	className={`${n.type ==
																																	'Y'
																																		? styles.unShift
																																		: styles.unShiftCo}`}
																																	onClick={() => {
																																		if (
																																			authorityIsTrue(
																																				'czht_qwgl_qwbb_xz'
																																			) &&
																																			n.type ==
																																				'Y'
																																		) {
																																			this.handleVisibleChange(
																																				true,
																																				m.police_unit_id,
																																				'6',
																																				n.shifts_id
																																			)
																																		}
																																	}}
																																>
																																	未排班
																																</span>
																															)}
																														</Tooltip>
																													</div>
																													{n.type ==
																														'Y' &&
																													n.schedule_id !=
																														null ? (
																														<div
																															className={
																																styles.shifticon
																															}
																														>
																															<img
																																src="./image/downs.png"
																																alt=""
																																onClick={() => {
																																	// if (
																																	// 	shiftKey !=
																																	// 	''
																																	// ) {
																																	// 	this.setState(
																																	// 		{
																																	// 			isHeight: false
																																	// 		},
																																	// 		() => {
																																	// 			this.setState(
																																	// 				{
																																	// 					isHeight: true
																																	// 				}
																																	// 			)
																																	// 		}
																																	// 	)
																																	// }
																																	this.setState(
																																		{
																																			shiftKey:
																																				shiftKey ==
																																				`${n.shifts_id}${m.police_unit_id}${'6'}`
																																					? ''
																																					: `${n.shifts_id}${m.police_unit_id}${'6'}`
																																		}
																																	)
																																}}
																															/>
																														</div>
																													) : null}
																												</li>
																											</Popconfirm>
																										)
																									)}
																									{/* </div> */}
																								</ul>
																							) : (
																								<li
																									className={
																										styles.unshiftsCon
																									}
																								>
																									无班次
																								</li>
																							)}
																							{/* </div> */}
																						</ul>
																					))}
																			</li>
																		</ul>
																	))}
															</li>
														</ul>
													))}
											</div>
										) : (
											<div className={styles.emptys}>
												<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
											</div>
										)}
									</div>
								</Spin>
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
										// onShowSizeChange={this.onShowSizeChange}
										showTotal={(total, range) => `共${total}项`}
									/>
								</Row>
							) : null}
						</Col>
					</Row>
				</Card>
				{this.state.modalVisible ? <FormModal {...dataMethods} /> : null}
			</div>
		)
	}
}

export default Form.create()(service)
// export default () => <div>hecha</div>;
