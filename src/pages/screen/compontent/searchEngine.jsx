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
	Menu,
	Dropdown,
	Icon,
	Tooltip,
	Empty,
	Spin
} from 'antd'
import React, { Component } from 'react'
const FormItem = Form.Item
import { connect } from 'dva'
import styles from './index.less'
const { Search } = Input
@connect(({ screen, loading }) => ({
	screen,
	loading: loading.effects['screen/getHomeAllSearchList']
}))
class searchEngine extends React.Component {
	state = {
		dropDownText: '',
		chooseDropDown: false,
		dropDownType: '1',
		retrieveMake: false,
		toDetail: '',
		upPack: false
	}
	componentDidMount() {}
	toChooseDrop = () => {
		this.setState({ toDetail: '', chooseDropDown: !this.state.chooseDropDown, retrieveMake: false, upPack: false })
	}
	handleSubmit = () => {
		const { retrieveMake, dropDownType } = this.state
		this.setState({ chooseDropDown: false })
		this.props.form.validateFields((err, fieldsValue) => {
			if (err) return
			console.log(fieldsValue, retrieveMake, dropDownType)
			// if (retrieveMake) {
			// 	this.setState({ retrieveMake: false, upPack: false })
			// 	this.props.form.resetFields()
			// } else {
			const formData = {
				...fieldsValue,
				type: Number(dropDownType)
			}
			this.getHomeAllSearchList(formData)

			// }
		})
	}
	getHomeAllSearchList = (files) => {
		const { dispatch } = this.props
		var _self = this
		_self.setState({ retrieveMake: true, upPack: false })
		dispatch({
			type: 'screen/getHomeAllSearchList',
			payload: {
				...files
			},
			success: (e) => {
				if (e.result.reason.code == '200') {
					_self.props.resetRender()
				} else {
					return false
				}
			}
		})
	}
	chooseDetail = (files, index, type) => {
		this.setState({ toDetail: index })
		this.props.checkSearchDetails(files, type)
	}
	resetRender = () => {
		this.props.form.resetFields()
		this.setState(
			{
				dropDownText: '',
				chooseDropDown: false,
				dropDownType: '1',
				retrieveMake: false,
				toDetail: '',
				upPack: false
			},
			() => {
				// this.getHomeAllSearchList({keyWord: ''})
				this.props.resetRender()
			}
		)
	}
	render() {
		const { screen: { searchList }, form, loading } = this.props
		const { getFieldDecorator } = form
		const { dropDownText, chooseDropDown, dropDownType, retrieveMake, toDetail, upPack } = this.state
		const dropDownList = [
			{
				title: '警情',
				type: '1'
			},
			{
				title: '警车',
				type: '2'
			},
			{
				title: '卡口',
				type: '3'
			},
			{
				title: '视频卡口',
				type: '4'
			},
			{
				title: '重点场所',
				type: '5'
			},
			{
				title: '警务站',
				type: '6'
			},
			{
				title: '对讲机',
				type: '7'
			},
			{
				title: '单兵设备',
				type: '8'
			}
		]

		return (
			<div className={styles.searchEngine}>
				<div className={styles.retrieve}>
					<div className={styles.dropDown} onClick={() => this.toChooseDrop()}>
						<span className={styles.dropDownText}>
							{dropDownText == '' ? dropDownList[0].title : dropDownText}
						</span>
						<img
							src={chooseDropDown ? './image/b_up.png' : './image/b_down.png'}
							alt=""
							className={styles.dropDownIcon}
						/>
					</div>
					<div className={styles.line}>
						<Divider type="vertical" className={styles.lineDivider} />
					</div>
					<div className={styles.search}>
						<Form onSubmit={this.handleSubmit} style={{ width: '100%' }}>
							<Form.Item style={{ display: 'inline-block', width: '82%' }}>
								{getFieldDecorator('keyWord')(
									<Input
										type="text"
										placeholder="请输入关键字"
										onChange={() => {
											this.setState({ retrieveMake: false, upPack: false, chooseDropDown: false })
                                            this.props.resetRender()
										}}
									/>
								)}
							</Form.Item>
							<Form.Item style={{ display: 'inline-block', width: '18%' }}>
								<Button
									htmlType="submit"
									style={{
										width: '100%',
										textAlign: 'left',
										padding: '0',
										border: '0',
										background: '#001D3DFF'
									}}
								>
									<img src={'./image/ss.png'} alt="" style={{ marginTop: '-2px' }} />
								</Button>
							</Form.Item>
						</Form>
					</div>
				</div>
				<div className={styles.reset} onClick={() => this.resetRender()}>
					重置
				</div>
				{chooseDropDown ? (
					<div className={styles.dropDownMenu}>
						{dropDownList.map((v) => (
							<p
								key={v.type}
								className={dropDownType == v.type ? styles.ative : null}
								onClick={() => {
									this.setState({
										dropDownType: v.type,
										dropDownText: v.title,
										chooseDropDown: false,
										upPack: false
									})
									this.props.form.resetFields()
								}}
							>
								{v.title}
							</p>
						))}
					</div>
				) : null}
				{retrieveMake ? (
					<div className={styles.results}>
						{!upPack ? (
							<div className={styles.con}>
								{this.props.loading ? (
									<div style={{ textAlign: 'center', marginTop: '180px' }}>
										<Spin delay={500} size="large" />
									</div>
								) : (
									<div>
										{searchList && searchList.length ? (
											<div>
												{searchList.map((v, index) => (
													<div
														className={`${styles.detaillist} ${toDetail === index
															? styles.chooseDetail
															: null}`}
														key={
															dropDownType == '1' ? (
																v.police_alarm_id
															) : dropDownType == '2' ? (
																v.vehicle_id
															) : dropDownType == '3' ||
															dropDownType == '4' ||
															dropDownType == '5' ||
															dropDownType == '6' ? (
																v.bayonet_id
															) : dropDownType == '7' || dropDownType == '8' ? (
																v.equipment_id
															) : (
																v
															)
														}
														onClick={() => this.chooseDetail(v, index, dropDownType)}
													>
														<div
															className={`${styles.item} ${dropDownType == '8'
																? styles.itemRi
																: null}`}
														>
															<div className={styles.head}>
																<span className={styles.title}>
																	<Tooltip
																		placement="topLeft"
																		title={
																			dropDownType == '1' ? (
																				v.bjlxmc
																			) : dropDownType == '2' ? (
																				v.vehicle_license_plate
																			) : dropDownType == '3' ||
																			dropDownType == '4' ||
																			dropDownType == '5' ||
																			dropDownType == '6' ? (
																				v.kkmc
																			) : dropDownType == '7' ||
																			dropDownType == '8' ? (
																				v.equipment_name
																			) : (
																				''
																			)
																		}
																	>
																		{dropDownType == '1' ? (
																			v.bjlxmc
																		) : dropDownType == '2' ? (
																			v.vehicle_license_plate
																		) : dropDownType == '3' ||
																		dropDownType == '4' ||
																		dropDownType == '5' ||
																		dropDownType == '6' ? (
																			v.kkmc
																		) : dropDownType == '7' ||
																		dropDownType == '8' ? (
																			v.equipment_name
																		) : (
																			''
																		)}
																	</Tooltip>
																</span>
																{dropDownType == '1' ? (
																	<span className={styles.time}>{v.bjsj}</span>
																) : null}
															</div>
															{dropDownType != '8' ? (
																<div className={styles.serial}>
																	<img src="./image/caidan.png" alt="" />
																	<span className={styles.num}>
																		<Tooltip
																			placement="topLeft"
																			title={
																				dropDownType == '1' ? (
																					v.cjdbh
																				) : dropDownType == '2' ? (
																					v.pad_cid
																				) : dropDownType == '3' ||
																				dropDownType == '4' ||
																				dropDownType == '5' ||
																				dropDownType == '6' ? (
																					v.gxdwmc
																				) : dropDownType == '7' ? (
																					v.cth
																				) : (
																					''
																				)
																			}
																		>
																			{dropDownType == '1' ? (
																				v.cjdbh
																			) : dropDownType == '2' ? (
																				v.pad_cid
																			) : dropDownType == '3' ||
																			dropDownType == '4' ||
																			dropDownType == '5' ||
																			dropDownType == '6' ? (
																				v.gxdwmc
																			) : dropDownType == '7' ? (
																				v.cth
																			) : (
																				''
																			)}
																		</Tooltip>
																	</span>
																</div>
															) : null}

															<div className={styles.address}>
																<img src="./image/weizhi.png" alt="" />
																<Tooltip
																	placement="topLeft"
																	title={
																		dropDownType == '1' ? (
																			v.afdd
																		) : dropDownType == '2' ? (
																			v.vehicle_organization_name
																		) : dropDownType == '3' ||
																		dropDownType == '4' ||
																		dropDownType == '5' ||
																		dropDownType == '6' ? (
																			`${v.jd}，${v.wd}`
																		) : dropDownType == '7' ||
																		dropDownType == '8' ? (
																			v.equipment_organization_name
																		) : (
																			''
																		)
																	}
																>
																	<span className={styles.add}>
																		{dropDownType == '1' ? (
																			v.afdd
																		) : dropDownType == '2' ? (
																			v.vehicle_organization_name
																		) : dropDownType == '3' ||
																		dropDownType == '4' ||
																		dropDownType == '5' ||
																		dropDownType == '6' ? (
																			`${v.jd}，${v.wd}`
																		) : dropDownType == '7' ||
																		dropDownType == '8' ? (
																			v.equipment_organization_name
																		) : (
																			''
																		)}
																	</span>
																</Tooltip>
															</div>
														</div>
													</div>
												))}
											</div>
										) : (
											<div className={styles.empty}>
												<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
											</div>
										)}
									</div>
								)}
							</div>
						) : null}

						<div className={styles.btn} onClick={() => this.setState({ upPack: !upPack })}>
							<img src={upPack ? './image/w_down.png' : './image/w_up.png'} alt="" />
							<span>{upPack ? '展开' : '收起'}</span>
						</div>
					</div>
				) : null}
			</div>
		)
	}
}

// export default searchEngine
export default Form.create()(searchEngine)
