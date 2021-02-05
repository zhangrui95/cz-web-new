import { Button, Card, Col, DatePicker, Form, Row, Message, Select, List, Pagination, Input } from 'antd'
import React, { Component } from 'react'
import moment from 'moment'
import { connect } from 'dva'
import styles from './style.less'
import Loadings from '@/components/Loading'
const stateAlert = [
	{
		code: '01',
		name: '未签收'
	},
	{
		code: '02',
		name: '未到场'
	},
	{
		code: '03',
		name: '未结束'
	},
	{
		code: '04',
		name: '未反馈'
	},
	{
		code: '05',
		name: '已反馈'
	}
]
let jjdztName = ''
@connect(({ alarming, loading }) => ({
	alarming,
	loading: loading.effects['alarming/getPoliceAlarmById']
}))
class ClarmingDetail extends Component {
	state = {}

	componentDidMount() {
		const { dispatch, match: { params: { id, page } } } = this.props
		console.log(id)
		var _self = this
		if (id) {
			dispatch({
				type: 'alarming/getPoliceAlarmById',
				payload: {
					police_alarm_id: id
				},
				success: (e) => {
					if (e.result.reason.code == '200') {
						if (e.result.policeAlarm.jjdzt == '05') {
							_self.getJqFkList(e.result.policeAlarm.jqbh)
						}
					} else {
						return false
					}
					
				}
			})
		}
	}
	getJqFkList = (e) => {
		const { dispatch, alarming: { feedbackList: { page } } } = this.props

		const pages = {
			currentPage: 1,
			showCount: 999
		}

		const param = {
			...pages,
			pd: {
				jqbh: e
			}
		}

		dispatch({
			type: 'alarming/getJqFkList',
			payload: param
		})
	}
	renderName = () => {
		const { alarming: { details }, loading, match: { params: { page } } } = this.props
		if (stateAlert && stateAlert.length && details) {
			for (let index = 0; index < stateAlert.length; index++) {
				const element = stateAlert[index]
				if (details.jjdzt == element.code) {
					jjdztName = element.name
				}
			}
		}
	}

	render() {
		const { alarming: { details, feedbackList: { list } }, loading, match: { params: { page } } } = this.props

		this.renderName()
		return (
			<div className={styles.clarmingDetail}>
				{!loading ? (
					<div>
						<div>
							<Button
								type="primary"
								style={{ marginBottom: '15px' }}
								onClick={() => {
									this.props.history.replace({ pathname: '/czht_cjjl', state: { pages: page } })
									// this.props.history.goBack()
								}}
							>
								返回
							</Button>
							<div>
								<Row gutter={[ 18, 0 ]}>
									<Col span={6}>
										<Card bordered={false} className={styles.tableListCard}>
											<div className={styles.let}>
												<div className={styles.titles}>
													<span>{jjdztName}</span> {details.jqbh}
												</div>
												<div className={styles.text}>
													<p className={styles.text_title}>接警单编号 ：</p>
													<p className={styles.text_sub}>{details.cjdbh}</p>
												</div>
												<div className={styles.text}>
													<p className={styles.text_title}>报警时间 ：</p>
													<p className={styles.text_sub}>{details.bjsj}</p>
												</div>
												<div className={styles.text}>
													<p className={styles.text_title}>报警人姓名 ：</p>
													<p className={styles.text_sub}>{details.bjrxm}</p>
												</div>
												<div className={styles.text}>
													<p className={styles.text_title}>警情地点 ：</p>
													<p className={styles.text_sub}>{details.afdd}</p>
												</div>
												<div className={styles.text}>
													<p className={styles.text_title}>报警电话 ：</p>
													<p className={styles.text_sub}>{details.lxdh}</p>
												</div>
												<div className={styles.text}>
													<p className={styles.text_title}>警情类别 ：</p>
													<p className={styles.text_sub}>
														{details.bjlbmc} {details.bjlxmc == null ? '' : '-'}{' '}
														{details.bjlxmc == null ? '' : details.bjlxmc}{' '}
														{details.bjxlmc == null ? '' : '-'}{' '}
														{details.bjxlmc == null ? '' : details.bjxlmc}
													</p>
												</div>
												<div className={styles.text}>
													<p className={styles.text_title}>出警单位 ：</p>
													<p className={styles.text_sub}>{details.cjdwmc}</p>
												</div>
												<div className={styles.text}>
													<p className={styles.text_title}>报警内容 ：</p>
													<p className={styles.text_sub}>{details.bjnr}</p>
												</div>
											</div>
										</Card>
									</Col>
									<Col span={18}>
										<Card bordered={false} className={styles.tableListCard}>
											<div className={styles.let}>
												<div className={`${styles.titles} ${styles.titlesan}`}>反馈信息</div>
												{console.log(
													details.jjdzt && details.jjdzt.replace(/\b(0+)/gi, ''),
													'=========='
												)}
												{details.jjdzt && details.jjdzt.replace(/\b(0+)/gi, '') >= 1 ? (
													<div className={styles.item}>
														<div className={styles.item_icon}>
															<p className={styles.item_num}>1</p>
															<p className={styles.item_text}>派发</p>
														</div>
														<div className={styles.item_con}>
															<p>派发时间 ：{details.alarm_time}</p>
														</div>
													</div>
												) : null}
												{details.jjdzt && details.jjdzt.replace(/\b(0+)/gi, '') > 1 ? (
													<div className={styles.segmentation}>
														<div className={styles.vertical} />
														<div className={styles.line} />
													</div>
												) : null}
												{details.jjdzt && details.jjdzt.replace(/\b(0+)/gi, '') >= 2 ? (
													<div className={styles.item}>
														<div className={styles.item_icon}>
															<p className={styles.item_num}>2</p>
															<p className={styles.item_text}>签收</p>
														</div>
														<div className={styles.item_con}>
															<p>签收警员 ：{details.qsjyxm}</p>
															<p>签收时间 ：{details.qssj}</p>
														</div>
													</div>
												) : null}
												{details.jjdzt && details.jjdzt.replace(/\b(0+)/gi, '') > 2 ? (
													<div className={styles.segmentation}>
														<div className={styles.vertical} />
														<div className={styles.line} />
													</div>
												) : null}
												{details.jjdzt && details.jjdzt.replace(/\b(0+)/gi, '') >= 3 ? (
													<div className={styles.item}>
														<div className={styles.item_icon}>
															<p className={styles.item_num}>3</p>
															<p className={styles.item_text}>到场</p>
														</div>
														<div className={styles.item_con}>
															<p>到场警员 ：{details.dcjyxm}</p>
															<p>到场时间 ：{details.dcsj}</p>
														</div>
													</div>
												) : null}
												{details.jjdzt && details.jjdzt.replace(/\b(0+)/gi, '') > 3 ? (
													<div className={styles.segmentation}>
														<div className={styles.vertical} />
														<div className={styles.line} />
													</div>
												) : null}
												{details.jjdzt && details.jjdzt.replace(/\b(0+)/gi, '') >= 4 ? (
													<div className={styles.item}>
														<div className={styles.item_icon}>
															<p className={styles.item_num}>4</p>
															<p className={styles.item_text}>结束</p>
														</div>
														<div className={styles.item_con}>
															<p>结束警员 ：{details.jsjyxm}</p>
															<p>结束时间 ：{details.jssj}</p>
														</div>
													</div>
												) : null}
												{details.jjdzt && details.jjdzt.replace(/\b(0+)/gi, '') > 4 ? (
													<div className={styles.segmentation}>
														<div className={styles.vertical} />
														<div className={styles.line} />
													</div>
												) : null}
												{details.jjdzt && details.jjdzt.replace(/\b(0+)/gi, '') >= 5 ? (
													<div>
														{list &&
															list.map((v, index) => (
																<div key={v.xh}>
																	<div className={styles.item}>
																		<div className={styles.item_icon}>
																			<p className={styles.item_num}>
																				{5 + index}
																			</p>
																			<p className={styles.item_text}>反馈</p>
																		</div>
																		<div
																			className={`${styles.item_con} ${index + 1 <
																			list.length
																				? styles.item_vertical
																				: null}`}
																		>
																			<p>反馈警员 ：{v.fkrxm}</p>
																			<p>反馈时间 ：{v.fksj}</p>
																			<div>
																				<Row>
																					<Col span={8}>
																						<p>发生时间 ：{v.ajfssj}</p>
																					</Col>
																					<Col span={8}>
																						<p>反馈单编号 ：{v.fkdbh}</p>
																					</Col>
																					<Col span={8}>
																						<p>反馈报警人 ：{v.BJR}</p>
																					</Col>
																					<Col span={8}>
																						<p>反馈报警人证件号 ：{v.bjrzjhm}</p>
																					</Col>
																					<Col span={8}>
																						<p>反馈报警电话 ：{v.BJDH} </p>
																					</Col>
																					<Col span={8}>
																						<p>反馈警情类别 ：{v.jqfklbmc} </p>
																					</Col>
																					<Col span={8}>
																						<p>反馈警情类型 ：{v.jqfklxmc} </p>
																					</Col>
																					<Col span={8}>
																						<p>反馈警情细类 ：{v.jqfkxlmc} </p>
																					</Col>
																					<Col span={8}>
																						<p>发生地点 ：{v.fsdd} </p>
																					</Col>
																					<Col span={8}>
																						<p>出动人数 ：{v.cdrs}人 </p>
																					</Col>
																					<Col span={8}>
																						<p>出动车船数 ：{v.cdccs}</p>
																					</Col>
																				</Row>
																			</div>
																			<p>反馈内容 ：{v.cjqk}</p>
																			<div className={styles.item_list}>
																				<p className={styles.item_list_title}>
																					现场照片 ：
																				</p>
																				{v.xctp &&
																					v.xctp.map((x, k) => (
																						<p key={k}>
																							<img
																								src={`${x.slice(0, 1) ==
																								'/'
																									? 'data:image/png;base64,'
																									: ''}${x}`}
																								alt=""
																							/>
																						</p>
																					))}
																			</div>
																			<div className={styles.item_list}>
																				<p className={styles.item_list_title}>
																					嫌疑人 ：
																				</p>
																				{v.xyrtp &&
																					v.xyrtp.map((x, k) => (
																						<p key={k}>
																							<img
																								src={`${x.slice(0, 1) ==
																								'/'
																									? 'data:image/png;base64,'
																									: ''}${x}`}
																								alt=""
																							/>
																						</p>
																					))}
																			</div>
																			<div className={styles.item_list}>
																				<p className={styles.item_list_title}>
																					其他照片 ：
																				</p>
																				{v.qttp &&
																					v.qttp.map((x, k) => (
																						<p key={k}>
																							<img
																								src={`${x.slice(0, 1) ==
																								'/'
																									? 'data:image/png;base64,'
																									: ''}${x}`}
																								alt=""
																							/>
																						</p>
																					))}
																			</div>
																		</div>
																	</div>
																	{index + 1 < list.length ? (
																		<div className={styles.segmentation}>
																			<div className={styles.vertical} />
																			<div className={styles.line} />
																		</div>
																	) : null}
																</div>
															))}
													</div>
												) : null}
											</div>
										</Card>
									</Col>
								</Row>
							</div>
						</div>
					</div>
				) : (
					<Loadings />
				)}

				{/* <Loadings /> */}
			</div>
		)
	}
}

export default Form.create()(ClarmingDetail)
