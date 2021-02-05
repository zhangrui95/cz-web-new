import { Button, Card, Col, DatePicker, Form, Row, Message, Select, List, Pagination, Input } from 'antd'
import React, { Component } from 'react'
import moment from 'moment'
import { connect } from 'dva'
import styles from './style.less'
import Loadings from '@/components/Loading'

@connect(({ operateWith, loading }) => ({
	operateWith,
	loading: loading.models.operateWith
}))
class synergyDetail extends Component {
	state = {
        details:{}
    }

	componentDidMount() {
        const { operateWith: { data:{ list } },match: { params: { id, page } } } = this.props
        if(id){
            this.toSynergyDetail()
            const detail = list.find(v => v.coordinated_operations_id == id)
            this.setState({details: detail})
        }
        
    }
toSynergyDetail = () => {
		const { dispatch,match: { params: { id } } } = this.props
		// equipmentType
		dispatch({
			type: 'operateWith/queryCorrdingatedList',
			payload: { coordinated_operations_id: id },
			// success: (e) => {
			// 	if (e.result.reason.code == '200') {
			// 		console.log(e, 'xiangqi=====')
                   
			// 	} else {
			// 		return false
			// 	}
			// }
		})
	}
	render() {
		const { operateWith: { data:{ list },corrdingatedList },match: { params: { id, page } } } = this.props
        const { details } = this.state
		return (
			<Card className={styles.synergyDetail}>
				<Button
					type="primary"
					style={{ marginBottom: '15px' }}
					onClick={() => {
						this.props.history.replace({ pathname: '/czht_xtzz', state: { pages: page } })
					}}
				>
					返回
				</Button>
                {
                    details
                    ?
                    <div className={styles.list}>
					{details.coordinated_operations_name != '' ? (
						<div className={styles.titleBig}>{details.coordinated_operations_name}</div>
					) : null}
					<div className={styles.time}>开始时间：{details.coordinated_operations_time}</div>
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
												{v.coordinated_operations_participant.carno ? (
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
												) : (
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
												)}

												<div className={styles.line} />
											</div>
										))}
								</div>
							</div>
						</div>
						{details.coordinated_operations_message ? (
							<div className={styles.infor}>
								<div className={styles.title}>警情信息：</div>
								<div className={styles.detail}>
									<div className={styles.item}>
										<p className={styles.tit}>警情编号：</p>
										<p className={styles.text}>
											{details.coordinated_operations_message.jqbh}
										</p>
									</div>
									<div className={styles.item}>
										<p className={styles.tit}>报案时间：</p>
										<p className={styles.text}>
											{details.coordinated_operations_message.bjsj}
										</p>
									</div>
									{/* <div className={styles.item}>警情地点：<span>福建省公安厅旁边啊滑上加滑福建省公安厅旁边啊滑上加滑</span></div> */}
									<div className={styles.item}>
										<p className={styles.tit}>警情地点：</p>
										<p className={styles.ontext}>
											{details.coordinated_operations_message.afdd}
										</p>
									</div>
									<div className={styles.item}>
										<p className={styles.tit}>报警电话：</p>
										<p className={styles.text}>
											{details.coordinated_operations_message.bjrxm}{' '}
											{details.coordinated_operations_message.bjdh}
										</p>
									</div>
									<div className={styles.item}>
										<p className={styles.tit}>警情类别：</p>
										<p className={styles.text}>{`${details.coordinated_operations_message
											.bjlxmc}${details.coordinated_operations_message.bjlxmc == null
											? ''
											: '-'}${details.coordinated_operations_message.bjlxmc == null
											? ''
											: details.coordinated_operations_message.bjlxmc}${details
											.coordinated_operations_message.bjxlmc == null
											? ''
											: '-'}${details.coordinated_operations_message.bjxlmc == null
											? ''
											: details.coordinated_operations_message.bjxlmc}`}</p>
									</div>
									<div className={styles.item}>
										<p className={styles.tit}>出警单位：</p>
										<p className={styles.text}>
											{details.coordinated_operations_message.jjdwmc}
										</p>
									</div>
									<div className={styles.item}>
										<p className={styles.tit}>报警内容：</p>
										<p className={styles.text}>
											{details.coordinated_operations_message.bjnr}
										</p>
									</div>
								</div>
							</div>
						) : null}
					</div>
				</div>
                    :
                    null
                }
				
			</Card>
		)
	}
}

export default Form.create()(synergyDetail)
