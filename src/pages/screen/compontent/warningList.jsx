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
	Tooltip,
	Divider
} from 'antd'
import React, { Component } from 'react'
import { connect } from 'dva'
import styles from './index.less'

@connect(({ screen, loading }) => ({
	screen,
	loading: loading.models.screen
}))
class warningList extends React.Component {
	state = {
		tagDropDown: ''
	}
	componentDidMount() {}
	toDetail = (files) => {
		console.log(files)
        this.props.checkAlarmDetails(files)
	}
	render() {
		const { screen, alarmList } = this.props
		const { tagDropDown } = this.state
		// 0人员异常 1车辆异常 2警情  4人流密度 5重点人员  7巡逻异常   预警的 类型int

		return (
			<div className={styles.warningList}>
				<div className={styles.classificationTitle} style={{ backgroundImage: "url('./image/bt_bj.png')" }}>
					预警列表
				</div>
                {
                    alarmList && alarmList.length
                    ?
                    <div className={styles.content}>
					<div className={styles.list}>
						{alarmList.map((v) => (
							<div className={styles.item} key={v.alarm_id} onClick={() => this.toDetail(v)}>
								{v.alarm_message ? (
									<div>
										{v.alarm_type == 0 || v.alarm_type == 5 ? (
											<div
												className={`${v.alarm_message && v.alarm_message.portrait_img
													? styles.picture
													: styles.target}`}
											>
												{v.alarm_message.portrait_img ? (
													<div className={styles.head}>
														<img
															src={v.alarm_message.portrait_img}
															alt=""
															className={styles.snap}
														/>
														<img
															src={
																v.alarm_message.verificationPortraitDataList &&
																v.alarm_message.verificationPortraitDataList[0].path
															}
															alt=""
															className={styles.contrast}
														/>
													</div>
												) : (
													<img src="./image/im.png" alt="" />
												)}
												{v.alarm_message.portrait_img ? (
													<p className={styles.num}>
														{v.alarm_message.verificationPortraitDataList &&
															v.alarm_message.verificationPortraitDataList[0].score}
														<span>%</span>
													</p>
												) : null}
												{v.alarm_message.portrait_img ? (
													<p className={styles.title}>相似度</p>
												) : null}

												{/* <p className={styles.title}>相似度</p> */}
											</div>
										) : null}
										{v.alarm_type == 1 ? (
											<div
												className={
													v.alarm_message.comparison_img ? styles.carPicture : styles.target
												}
											>
												{v.alarm_message.comparison_img ? (
													<div className={styles.head}>
														<img src={v.alarm_message.comparison_img} alt="" />
													</div>
												) : (
													<img src="./image/chel.png" alt="" />
												)}
												{v.alarm_message.comparison_img ? (
													<p className={styles.num}>
														{v.alarm_message.verificationPd &&
															v.alarm_message.verificationPd.hphm}
													</p>
												) : null}
											</div>
										) : null}
										{v.alarm_type == 4 || v.alarm_type == 7 || v.alarm_type == 2 ? (
											<div className={styles.target}>
												<img
													src={
														v.alarm_type == 4 ? (
															'./image/reny.png'
														) : v.alarm_type == 7 ? (
															'./image/weiz.png'
														) : (
															'./image/yuj.png'
														)
													}
													alt=""
												/>
											</div>
										) : null}
										<div className={styles.infor}>
											<div className={styles.head}>
												<p
													className={
														v.alarm_type == 0 || v.alarm_type == 5 ? (
															styles.name
														) : (
															styles.carp
														)
													}
												>
													<Tooltip
														placement="topLeft"
														title={
															v.alarm_type == 0 || v.alarm_type == 5 ? (
																v.alarm_message.verificationPortraitDataList &&
																v.alarm_message.verificationPortraitDataList[0].name
															) : v.alarm_type == 1 ? (
																v.alarm_message.verificationPd &&
																v.alarm_message.verificationPd.hphm
															) : v.alarm_type == 7 ? (
																v.carNo
															) : v.alarm_type == 4 ? (
																'人流密度检测'
															) : v.alarm_type == 2 ? (
																v.alarm_message.ay
															) : (
																''
															)
														}
													>
														{v.alarm_type == 0 || v.alarm_type == 5 ? (
															v.alarm_message.verificationPortraitDataList &&
															v.alarm_message.verificationPortraitDataList[0].name
														) : v.alarm_type == 1 ? (
															v.alarm_message.verificationPd &&
															v.alarm_message.verificationPd.hphm
														) : v.alarm_type == 7 ? (
															v.carNo
														) : v.alarm_type == 4 ? (
															'人流密度检测'
														) : v.alarm_type == 2 ? (
															v.alarm_message.ay
														) : (
															''
														)}
													</Tooltip>
												</p>
												{(v.alarm_type == 0 && v.alarm_message.portrait_img) ||
												(v.alarm_type == 5 && v.alarm_message.portrait_img) ? (
													<p className={styles.idcard}>
														{v.alarm_message.verificationPortraitDataList &&
															v.alarm_message.verificationPortraitDataList[0].idcard}
													</p>
												) : null}
												{(v.alarm_type == 0 && v.alarm_message.portrait_img == undefined) ||
												(v.alarm_type == 5 && v.alarm_message.portrait_img == undefined) ? (
													<p className={styles.idcard}>
														{v.alarm_message.comparison_message &&
															v.alarm_message.comparison_message.sfzh &&
															v.alarm_message.comparison_message.sfzh}
													</p>
												) : null}
											</div>

											{v.alarm_type == 4 ? (
												<div className={styles.wasTraffic}>
													人流量 ：<span>{v.alarm_message.flow_density}</span>人
												</div>
											) : null}
											{(v.alarm_type == 0 && v.alarm_message.portrait_img) ||
											(v.alarm_type == 5 && v.alarm_message.portrait_img) ? (
												<div className={styles.tags}>
													{v.alarm_message.verificationPortraitDataList &&
														v.alarm_message.verificationPortraitDataList[0]
															.comparisonData &&
														v.alarm_message.verificationPortraitDataList[0].comparisonData.Tags.map(
															(item, index) => {
																if (index <= 2) {
																	return (
																		<span
																			className={
																				item == '正常' ? styles.normal : null
																			}
																			key={item}
																		>
																			{item}
																		</span>
																	)
																}
															}
														)}
												</div>
											) : null}
											{(v.alarm_type == 0 && v.alarm_message.portrait_img == undefined) ||
											(v.alarm_type == 5 && v.alarm_message.portrait_img == undefined) ||
											v.alarm_type == 1 ? (
												<div className={styles.tags}>
													{v.alarm_message.tagesInfoList &&
														v.alarm_message.tagesInfoList.map((item, index) => {
															if (index <= 2) {
																return (
																	<span
																		className={
																			item.tag == '正常' ? styles.normal : null
																		}
																		key={item.tag}
																	>
																		{item.tag}
																	</span>
																)
															}
														})}
												</div>
											) : null}

											{v.alarm_type == 7 ? (
												<div className={styles.tags}>
													<span>{v.alarm_message.warnInfo}</span>
												</div>
											) : null}
											{v.alarm_type == 2 ? (
												<div className={styles.serialNum}>
													<Tooltip placement="topLeft" title={v.alarm_message.cjdbh}>
														{v.alarm_message.cjdbh}
													</Tooltip>
												</div>
											) : null}
											{v.alarm_type == 7 ? <div className={styles.address}>巡逻异常</div> : null}
											{v.alarm_type == 2 ? (
												<div className={styles.address}>
													<Tooltip placement="topLeft" title={v.alarm_message.afdd}>
														{v.alarm_message.afdd}
													</Tooltip>
												</div>
											) : null}
											{v.alarm_type == 1 || v.alarm_type == 5 || v.alarm_type == 0 ? (
												<div className={styles.address}>
													<Tooltip
														placement="topLeft"
														title={`${v.alarm_message.comparison_message
															? `${v.alarm_message.comparison_message.gps_x}${'，'}`
															: ''}${v.alarm_message.comparison_message
															? v.alarm_message.comparison_message.gps_y
															: ''}`}
													>
														{`${v.alarm_message.comparison_message
															? `${v.alarm_message.comparison_message.gps_x}${'，'}`
															: ''}${v.alarm_message.comparison_message
															? v.alarm_message.comparison_message.gps_y
															: ''}`}
													</Tooltip>
												</div>
											) : null}

											<div className={styles.time}>
												{v.alarm_type == 2 ? v.alarm_message.afsj : v.alarm_time}
											</div>
										</div>

										{v.alarm_type == 0 &&
										v.alarm_message.portrait_img &&
										v.alarm_message.verificationPortraitDataList &&
										v.alarm_message.verificationPortraitDataList[0].comparisonData &&
										v.alarm_message.verificationPortraitDataList[0].comparisonData.Tags &&
										v.alarm_message.verificationPortraitDataList[0].comparisonData.Tags.length >
											3 ? (
											<div
												className={styles.btn}
												onClick={(e) => {
													e.stopPropagation()
													if (v.alarm_id == tagDropDown) {
														this.setState({ tagDropDown: '' })
													} else {
														this.setState({ tagDropDown: v.alarm_id })
													}
												}}
											>
												<img
													src={
														tagDropDown == v.alarm_id ? (
															'./image/b_up.png'
														) : (
															'./image/b_down.png'
														)
													}
													alt=""
												/>
											</div>
										) : null}
										{v.alarm_type == 5 &&
										v.alarm_message.verificationPortraitDataList &&
										v.alarm_message.verificationPortraitDataList[0].comparisonData &&
										v.alarm_message.verificationPortraitDataList[0].comparisonData.Tags &&
										v.alarm_message.verificationPortraitDataList[0].comparisonData.Tags.length >
											3 ? (
											<div
												className={styles.btn}
												onClick={(e) => {
													e.stopPropagation()
													if (v.alarm_id == tagDropDown) {
														this.setState({ tagDropDown: '' })
													} else {
														this.setState({ tagDropDown: v.alarm_id })
													}
												}}
											>
												<img
													src={
														tagDropDown == v.alarm_id ? (
															'./image/b_up.png'
														) : (
															'./image/b_down.png'
														)
													}
													alt=""
												/>
											</div>
										) : null}
										{v.alarm_type == 0 &&
										v.alarm_message.portrait_img == undefined &&
										v.alarm_message.tagesInfoList &&
										v.alarm_message.tagesInfoList.length > 3 ? (
											<div
												className={styles.btn}
												onClick={(e) => {
													e.stopPropagation()
													if (v.alarm_id == tagDropDown) {
														this.setState({ tagDropDown: '' })
													} else {
														this.setState({ tagDropDown: v.alarm_id })
													}
												}}
											>
												<img
													src={
														tagDropDown == v.alarm_id ? (
															'./image/b_up.png'
														) : (
															'./image/b_down.png'
														)
													}
													alt=""
												/>
											</div>
										) : null}
										{v.alarm_type == 1 &&
										v.alarm_message.tagesInfoList &&
										v.alarm_message.tagesInfoList.length > 3 ? (
											<div
												className={styles.btn}
												onClick={(e) => {
													e.stopPropagation()
													if (v.alarm_id == tagDropDown) {
														this.setState({ tagDropDown: '' })
													} else {
														this.setState({ tagDropDown: v.alarm_id })
													}
												}}
											>
												<img
													src={
														tagDropDown == v.alarm_id ? (
															'./image/b_up.png'
														) : (
															'./image/b_down.png'
														)
													}
													alt=""
												/>
											</div>
										) : null}

										{v.alarm_id == tagDropDown ? (
											<div className={styles.tagsList}>
												{v.alarm_type == 0 &&
													v.alarm_message.portrait_img &&
													v.alarm_message.portrait_img &&
													v.alarm_message.verificationPortraitDataList &&
													v.alarm_message.verificationPortraitDataList[0].comparisonData &&
													v.alarm_message.verificationPortraitDataList[0].comparisonData
														.Tags &&
													v.alarm_message.verificationPortraitDataList[0].comparisonData.Tags.map(
														(item, index) => {
															if (index > 2) {
																return <span key={item}>{item}</span>
															}
														}
													)}
												{v.alarm_type == 5 &&
													v.alarm_message.verificationPortraitDataList &&
													v.alarm_message.verificationPortraitDataList[0].comparisonData &&
													v.alarm_message.verificationPortraitDataList[0].comparisonData
														.Tags &&
													v.alarm_message.verificationPortraitDataList[0].comparisonData.Tags.map(
														(item, index) => {
															if (index > 2) {
																return <span key={item}>{item}</span>
															}
														}
													)}
												{v.alarm_type == 0 &&
													v.alarm_message.portrait_img == undefined &&
													v.alarm_message.tagesInfoList &&
													v.alarm_message.tagesInfoList.map((item, index) => {
														if (index > 2) {
															return <span key={item.tag}>{item.tag}</span>
														}
													})}

												{v.alarm_type == 1 &&
													v.alarm_message.tagesInfoList &&
													v.alarm_message.tagesInfoList.map((item, index) => {
														if (index > 2) {
															return <span key={item.tag}>{item.tag}</span>
														}
													})}
											</div>
										) : null}
									</div>
								) : null}
							</div>
						))}
					</div>
				</div>
                    :
                    <div className={styles.nowarningList}>
                        <img src="./image/yjqs.png" alt=""/>
                        <p>暂无预警</p>
                    </div>
                }
				
				<div className={styles.muneLine}>
					<img src="./image/jqlbdbx.png" alt="" />
				</div>
			</div>
		)
	}
}

export default warningList
