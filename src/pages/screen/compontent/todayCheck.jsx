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
	Divider
} from 'antd'
import React, { Component } from 'react'
import { connect } from 'dva'
import styles from './index.less'

@connect(({ screen, loading }) => ({
	screen,
	loading: loading.models.screen
}))
class todayCheck extends React.Component {
	state = {
        isCar:false
    }
	componentDidMount() {}
	render() {
		const { screen, comparisonList } = this.props
		return (
			<div className={styles.todayCheck}>
				<div className={styles.classificationTitle} style={{ backgroundImage: "url('./image/bt_bj.png')" }}>
					{this.state.isCar ? '警车今日核查' : '今日核查'}
				</div>
				<div className={styles.content}>
					<div className={`${styles.item} ${styles.checkPeople}`} style={{flexGrow: Number(comparisonList&&comparisonList.length&&comparisonList[0].portraitCount ? comparisonList[0].portraitCount : '')+1}}>
						<p className={styles.count}>{comparisonList&&comparisonList.length&&comparisonList[0].portraitCount ? comparisonList[0].portraitCount : '0'}</p>
						<p className={styles.title}>核查人次</p>
					</div>
					<div className={`${styles.item} ${styles.checkCar}`} style={{flexGrow: Number(comparisonList&&comparisonList.length&&comparisonList[0].comparisonCount ? comparisonList[0].comparisonCount : '0')+1}}>
						<p className={styles.count}>{comparisonList&&comparisonList.length&&comparisonList[0].comparisonCount ? comparisonList[0].comparisonCount : '0'}</p>
						<p className={styles.title}>核查车次</p>
					</div>
					<div className={`${styles.item} ${styles.abnormalPeople}`} style={{flexGrow: Number(comparisonList&&comparisonList.length&&comparisonList[0].portraitExceptionCount ? comparisonList[0].portraitExceptionCount : '0')+1}}>
						<p className={styles.count}>{comparisonList&&comparisonList.length&&comparisonList[0].portraitExceptionCount ? comparisonList[0].portraitExceptionCount : '0'}</p>
						<p className={styles.title}>异常人次</p>
					</div>
					<div className={`${styles.item} ${styles.abnormalCar}`} style={{flexGrow: Number(comparisonList&&comparisonList.length&&comparisonList[0].comparisonExceptionCount ? comparisonList[0].comparisonExceptionCount : '0')+1}}>
						<p className={styles.count}>{comparisonList&&comparisonList.length&&comparisonList[0].comparisonExceptionCount ? comparisonList[0].comparisonExceptionCount : '0'}</p>
						<p className={styles.title}>异常车次</p>
					</div>
				</div>
				<div className={styles.foot} style={{ backgroundImage: "url('./image/jrkc_bg.png')" }}>
					<div className={styles.checkPeople}  style={{flexGrow: Number(comparisonList&&comparisonList.length&&comparisonList[0].portraitCount ? comparisonList[0].portraitCount : '0')+1}}/>
					<div className={styles.checkCar}  style={{flexGrow: Number(comparisonList&&comparisonList.length&&comparisonList[0].comparisonCount ? comparisonList[0].comparisonCount : '0')+1}}/>
					<div className={styles.abnormalPeople}  style={{flexGrow: Number(comparisonList&&comparisonList.length&&comparisonList[0].portraitExceptionCount ? comparisonList[0].portraitExceptionCount : '0')+1}}/>
					<div className={styles.abnormalCar}  style={{flexGrow: Number(comparisonList&&comparisonList.length&&comparisonList[0].comparisonExceptionCount ? comparisonList[0].comparisonExceptionCount : '0')+1}}/>
				</div>
			</div>
		)
	}
}

export default todayCheck
