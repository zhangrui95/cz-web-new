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
class warningSituation extends React.Component {
	state = {}
	componentDidMount() {}

	render() {
		const { screen: { dutyPoliceList, scheduleList }, vehicleState } = this.props

		const list = [
			{
				type: '0',
				name: '异常人员',
				img: './image/qkry.png',
				class: styles.qkry
			},
			{
				type: '1',
				name: '异常车辆',
				img: './image/qkcl.png',
				class: styles.qkcl
			},
			{
				type: '2',
				name: '警情',
				img: './image/qkjq.png',
				class: styles.qkjq
			},
			{
				type: '3',
				name: '人流密度',
				img: './image/qkmd.png',
				class: styles.qkmd
			},
			{
				type: '4',
				name: '重点人员',
				img: './image/qkzd.png',
				class: styles.qkzd
			},
			{
				type: '5',
				name: '巡逻异常',
				img: './image/qkxl.png',
				class: styles.qkxl
			}
		]
        const num = {
                ycry: '1',
                yccl: '32',
                jq: '122',
                rlmd: '4',
                zdry: '15',
                xlyc: '27',
            }
        
		return (
			<div className={styles.warningSituation}>
				<div className={styles.classificationTitle} style={{ backgroundImage: "url('./image/bt_bj.png')" }}>
					预警情况
				</div>
				<div className={styles.content}>
					<div className={styles.list}>
						{list.map((v) => (
							<div className={styles.item} key={v.type}>
								<span className={styles.imgs}>
									<img src={v.img} alt="" className={v.class} />
								</span>
								<span className={styles.name}>{v.name}：</span>
								<span className={styles.count}>{v.type == '0' ? num.ycry : v.type == '1' ? num.yccl : v.type == '2' ? num.jq : v.type == '3' ? num.rlmd : v.type == '4' ? num.zdry : v.type == '5' ? num.xlyc : '0'}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		)
	}
}

export default warningSituation
