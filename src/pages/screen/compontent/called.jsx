import {
	Button,
	Card,
	Col,
	DatePicker,
	Form,
	Input,
	Row,
	Select,
	Modal,
	Message,
	List,
	Pagination,
	Radio,
	Table,
	Tag,
	Divider,
	Tooltip,
	Spin
} from 'antd'
import React, { Component } from 'react'
import { connect } from 'dva'
import styles from './index.less'

@connect(({ screen, loading }) => ({
	screen,
	loading: loading.effects['screen/getPoliceAlarmListSearch']
}))
class called extends React.Component {
	state = {
		choose: '',
		toDetail: '',
		showDetail: false,
		isCar: false
	}
	componentDidMount() {
		// this.getPoliceAlarmListSearch()
	}
	checkList = (files, count) => {
		console.log(files, count)
		const { choose } = this.state
		if (count == '0') {
			this.setState({ choose: '', showDetail: false, toDetail: '' })
			// return false
		} else {
			if (files == choose) {
				this.setState({ choose: '', showDetail: false, toDetail: '' })
			} else {
				this.setState({ choose: files, showDetail: true, toDetail: '' })
				this.getPoliceAlarmListSearch(files)
			}
		}
		this.props.closePoliceDetails()
	}
	getPoliceAlarmListSearch = (files) => {
		const { dispatch, vehicleState, vehicleid, gxdwdm } = this.props
        let formData = {
            jjdzt: files == '06' ? '' : files,
					startTime: this.getNowFormatDate() + ' 00:00:00',
					endTime: this.getNowFormatDate() + ' 23:59:59'
        }
        if(vehicleState && files != '01'){
            formData = {
                ...formData,
                vehicle_id: vehicleid,
            }
        }
        if(vehicleState){
            formData = {
                ...formData,
                gxdwdm: gxdwdm
            }
        }
		dispatch({
			type: 'screen/getPoliceAlarmListSearch',
			payload: {
				currentPage: 1,
				showCount: 999,
				pd: {
					...formData
				}
			}
		})
	}
	chooseDetail = (files) => {
		// console.log(files)
		this.setState({ toDetail: files.police_alarm_id })
		this.props.checkPoliceDetails(files)
	}
	getNowFormatDate() {
		var date = new Date()
		var seperator1 = '-'
		var year = date.getFullYear()
		var month = date.getMonth() + 1
		var strDate = date.getDate()
		if (month >= 1 && month <= 9) {
			month = '0' + month
		}
		if (strDate >= 0 && strDate <= 9) {
			strDate = '0' + strDate
		}
		var currentdate = year + seperator1 + month + seperator1 + strDate
		return currentdate
	}
//   componentWillReceiveProps(newProps) {
//         console.log('Component WILL RECEIVE PROPS!',newProps,'\\\\\\\\')


//   }
componentWillReceiveProps(nextProps) {
    console.log(nextProps.vehicleState,this.props.vehicleState,'1111')
        if (this.props.vehicleState != nextProps.vehicleState) {
            this.setState({ choose: '', showDetail: false, toDetail: '' });
            this.props.checkPoliceDetails()
        }
    }
//   componentWillUpdate(prevProps, prevState) {
//         console.log('Component DID UPDATE!',prevProps,'======' ,prevState,'-------',this.props,'!!!!!!!!!!!')
//   }
	render() {
		const calledList = [
			{
				title: '待签收',
				subtitle: '待签收',
				jjdzt: '01',
				class: styles.signfor,
				icon: './image/jingqing.png',
				count: '12'
			},
			{
				title: '待到场',
				subtitle: '待到场',
				jjdzt: '02',
				class: styles.present,
				icon: './image/ddc.png',
				count: '7'
			},
			{
				title: '待结束',
				subtitle: '待结束',
				jjdzt: '03',
				class: styles.end,
				icon: './image/djs.png',
				count: '1'
			},
			{
				title: '待反馈',
				subtitle: '待反馈',
				jjdzt: '04',
				class: styles.feedback,
				icon: './image/dfk.png',
				count: '20'
			},
			{
				title: '全局警情',
				subtitle: '我的警情',
				jjdzt: '06',
				class: styles.global,
				icon: './image/qjjq.png',
				count: '30'
			},
			{
				title: '已完结',
				subtitle: '已完结',
				jjdzt: '05',
				class: styles.finished,
				icon: './image/ywj.png',
				count: '8'
			}
		]
		const { screen: { policeAlarmList }, policeAlarmCounts, vehicleState,showDetails } = this.props
		const { choose, toDetail, showDetail, isCar } = this.state
		console.log(policeAlarmCounts)
		return (
			<div className={styles.called}>
				<div className={styles.classificationTitle} style={{ backgroundImage: "url('./image/bt_bj.png')" }}>
					{isCar ? '警车接处警' : '接处警'}
				</div>
				<div className={styles.content}>
					<div className={styles.list}>
						{calledList.map((v) => (
							<div
								key={v.title}
								className={`${styles.item} ${choose == v.jjdzt ? styles.chooseItem : null}`}
								style={{
									backgroundImage:
										choose == v.jjdzt ? "url('./image/jcj_bg_1.png')" : "url('./image/jcj_bg.png')"
								}}
								onClick={() =>
									this.checkList(
										v.jjdzt,
										v.jjdzt == '01'
											? policeAlarmCounts.wqs
											: v.jjdzt == '02'
												? policeAlarmCounts.wdc
												: v.jjdzt == '03'
													? policeAlarmCounts.wjs
													: v.jjdzt == '04'
														? policeAlarmCounts.wfk
														: v.jjdzt == '05'
															? policeAlarmCounts.yfk
															: v.jjdzt == '06' ? vehicleState ? policeAlarmCounts.wdjq : policeAlarmCounts.total : '0'
									)}
							>
								<span className={styles.icons}>
									<img src={v.icon} alt="" className={v.class} />
								</span>
								<span className={styles.title}>{!vehicleState ? v.title : v.subtitle}</span>
								{v.jjdzt == '01' ? (
									<span className={styles.count}>
										{policeAlarmCounts.wqs ? policeAlarmCounts.wqs : '0'}
									</span>
								) : null}
								{v.jjdzt == '02' ? (
									<span className={styles.count}>
										{policeAlarmCounts.wdc ? policeAlarmCounts.wdc : '0'}
									</span>
								) : null}
								{v.jjdzt == '03' ? (
									<span className={styles.count}>
										{policeAlarmCounts.wjs ? policeAlarmCounts.wjs : '0'}
									</span>
								) : null}
								{v.jjdzt == '04' ? (
									<span className={styles.count}>
										{policeAlarmCounts.wfk ? policeAlarmCounts.wfk : '0'}
									</span>
								) : null}
								{v.jjdzt == '05' ? (
									<span className={styles.count}>
										{policeAlarmCounts.yfk ? policeAlarmCounts.yfk : '0'}
									</span>
								) : null}
								{v.jjdzt == '06' ? (
									<span className={styles.count}>
										{policeAlarmCounts.total ? policeAlarmCounts.total : '0'}
									</span>
								) : null}

								<span className={styles.unit}>条</span>
								<img
									src={showDetail && choose == v.jjdzt ? './image/left_1.png' : './image/right.png'}
									alt=""
									className={styles.btn}
								/>
							</div>
						))}
					</div>
					{showDetail ? (
						<div className={styles.detail}>
							{this.props.loading ? (
								<div style={{ textAlign: 'center', marginTop: '180px' }}>
									<Spin delay={500} size="large" />
								</div>
							) : (
								<div className={styles.con}>
									{policeAlarmList.map((v) => (
										<div
											className={`${styles.detaillist} ${toDetail == v.police_alarm_id
												? styles.chooseDetail
												: null}`}
											key={v.police_alarm_id}
											onClick={() => this.chooseDetail(v)}
										>
											<div className={styles.item}>
												<div className={styles.head}>
													<span className={styles.title}>
														{' '}
														<Tooltip title={v.bjlxmc}>{v.bjlxmc}</Tooltip>
													</span>
													<span className={styles.time}>{v.bjsj}</span>
												</div>
												<div className={styles.serial}>
													<img src="./image/caidan.png" alt="" />
													<Tooltip title={v.cjdbh}>
														<span className={styles.num}>{v.cjdbh}</span>
													</Tooltip>
												</div>
												<div className={styles.address}>
													<img src="./image/weizhi.png" alt="" />
													<Tooltip title={v.afdd}>
														<span className={styles.add}>{v.afdd}</span>
													</Tooltip>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					) : null}
				</div>
			</div>
		)
	}
}

export default called
