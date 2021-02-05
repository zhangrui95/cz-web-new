import React, { Component } from 'react'
import { connect } from 'dva'
import { List, Card, Row, Col, Button, Tag, Modal, Icon, Message } from 'antd'
import styles from './index.less'
@connect(({ otherIndex, loading }) => ({
	otherIndex,
	loading: loading.effects['otherIndex/getHomeAllSearchList']
}))
class synergyDetail extends React.Component {
	constructor(props) {
		super(props)
		this.state = {}
	}
	componentDidMount() {}
	toJoin = (files) => {
		const { dispatch, synergyDetail, toSynergyDetail,pageRefresh } = this.props
		const user = JSON.parse(sessionStorage.getItem('user'))
		dispatch({
			type: 'otherIndex/addPlatformCoordinated',
			payload: {
				coordinated_operations_id: files,
				organization_code: user.group.code,
				organization_name: user.group.name,
				coordinated_operations_participant: {
                    organization_code: user.group.code,
                    organization_name: user.group.name,
                    participant_status: 1,
                    participant_type:0
                },
				participant_status: 1
			},
			success: (e) => {
				if (e.result.reason.code == '200') {
					console.log(e, 'xiangqi=====')
					sessionStorage.setItem('synergyId', files)
                    Message.destroy()
					Message.success('加入协同作战成功！')
					toSynergyDetail(synergyDetail,false)
                    pageRefresh(files)
				} else {
                    Message.destroy()
					Message.error('加入协同作战失败，请稍后重试！')
					return false
				}
			}
		})
	}
	toExit = (files) => {
		const { dispatch, synergyDetail, toSynergyDetail,pageRefresh } = this.props
		const user = JSON.parse(sessionStorage.getItem('user'))
		dispatch({
			type: 'otherIndex/endCombined',
			payload: {
				coordinated_operations_id: files,
				organization_code: user.group.code,
				is_launch: 0
			},
			success: (e) => {
				if (e.result.reason.code == '200') {
					console.log(e, 'xiangqi=====')
					sessionStorage.removeItem('synergyId')
                    Message.destroy()
					Message.success('退出协同作战成功！')
					toSynergyDetail(synergyDetail,false)
                    pageRefresh(files)
				} else {
                    Message.destroy()
					Message.error('退出协同作战失败，请稍后重试！')
					return false
				}
			}
		})
	}
	render() {
		const { synergyDetail, closes, otherIndex: { corrdingatedList } } = this.props
		return (
			<Card className={styles.synergyDetail}>
				<div className={styles.close} onClick={() => closes()}>
					<img src="./image/cuowu.png" alt="" />
				</div>
				{sessionStorage.getItem('synergyId') == synergyDetail.coordinated_operations_id ? (
					<div
						className={styles.buttons}
						onClick={() => this.toExit(synergyDetail.coordinated_operations_id)}
					>
						退出协同作战
					</div>
				) : (
					<div
						className={styles.buttons}
						onClick={() => this.toJoin(synergyDetail.coordinated_operations_id)}
					>
						加入协同作战
					</div>
				)}

				<div className={styles.list}>
					{synergyDetail.coordinated_operations_name != '' ? (
						<div className={styles.titleBig}>{synergyDetail.coordinated_operations_name}</div>
					) : null}

					<div className={styles.time}>开始时间：{synergyDetail.coordinated_operations_time}</div>
					<div className={styles.con}>
						<div className={styles.participants}>
							<div className={styles.title}>参与单元：</div>
							<div className={styles.bodys}>
								<div className={styles.icons}>
									<img src="./image/cz.png" alt="" />
								</div>
								<div className={styles.velist}>
									{corrdingatedList &&
										corrdingatedList.map((v, k) => (
											<div key={k}>
                                            {
                                                v.coordinated_operations_participant.carno
                                                ?
                                                <div className={styles.item}>
													<p className={styles.plate}>
														{v.coordinated_operations_participant.carno}：
													</p>
													<p className={styles.names}>
														{v.coordinated_operations_participant &&
															v.coordinated_operations_participant.userInfo &&
															v.coordinated_operations_participant.userInfo
																.map((x) => {
																	return x.name
																})
																.join('、')}
													</p>
													<p
														className={`${v.participant_status == 0
															? styles.onbtn
															: styles.btn}`}
													>
														{v.participant_status == 0 ? '等待中' : '协同作战中'}
													</p>
												</div>
                                                :
                                                <div className={styles.item}>
													<p className={styles.command}>
														{v.coordinated_operations_participant.organization_name}
													</p>
													
													<p
														className={`${v.participant_status == 0
															? styles.onbtn
															: styles.btn}`}
													>
														{v.participant_status == 0 ? '等待中' : '协同作战中'}
													</p>
												</div>
                                            }
												
												<div className={styles.line} />
											</div>
										))}
								</div>
							</div>
						</div>
						{synergyDetail.coordinated_operations_message ? (
							<div className={styles.infor}>
								<div className={styles.title}>警情信息：</div>
								<div className={styles.detail}>
									<div className={styles.item}>
										<p className={styles.tit}>警情编号：</p>
										<p className={styles.text}>
											{synergyDetail.coordinated_operations_message.jqbh}
										</p>
									</div>
									<div className={styles.item}>
										<p className={styles.tit}>报案时间：</p>
										<p className={styles.text}>
											{synergyDetail.coordinated_operations_message.bjsj}
										</p>
									</div>
									{/* <div className={styles.item}>警情地点：<span>福建省公安厅旁边啊滑上加滑福建省公安厅旁边啊滑上加滑</span></div> */}
									<div className={styles.item}>
										<p className={styles.tit}>警情地点：</p>
										<p className={styles.ontext}>
											{synergyDetail.coordinated_operations_message.afdd}
										</p>
									</div>
									<div className={styles.item}>
										<p className={styles.tit}>报警电话：</p>
										<p className={styles.text}>
											{synergyDetail.coordinated_operations_message.bjrxm}{' '}
											{synergyDetail.coordinated_operations_message.bjdh}
										</p>
									</div>
									<div className={styles.item}>
										<p className={styles.tit}>警情类别：</p>
										<p className={styles.text}>{`${synergyDetail.coordinated_operations_message
											.bjlxmc}${synergyDetail.coordinated_operations_message.bjlxmc == null
											? ''
											: '-'}${synergyDetail.coordinated_operations_message.bjlxmc == null
											? ''
											: synergyDetail.coordinated_operations_message.bjlxmc}${synergyDetail
											.coordinated_operations_message.bjxlmc == null
											? ''
											: '-'}${synergyDetail.coordinated_operations_message.bjxlmc == null
											? ''
											: synergyDetail.coordinated_operations_message.bjxlmc}`}</p>
									</div>
									<div className={styles.item}>
										<p className={styles.tit}>出警单位：</p>
										<p className={styles.text}>
											{synergyDetail.coordinated_operations_message.jjdwmc}
										</p>
									</div>
									<div className={styles.item}>
										<p className={styles.tit}>报警内容：</p>
										<p className={styles.text}>
											{synergyDetail.coordinated_operations_message.bjnr}
										</p>
									</div>
								</div>
							</div>
						) : null}
					</div>
				</div>
			</Card>
		)
	}
}

export default synergyDetail
