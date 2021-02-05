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
	Empty,
	Modal,
	Upload,
	TreeSelect,
	Spin,
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
import Social from './social'
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
	loading: loading.models.personnelDetails
}))
class textField extends Component {
	state = {}

	componentWillMount() {
		const { tabs } = this.props
		console.log(this.props)
		if (tabs == '1') {
			// debugger;;
			this.getBasis()
		}
		if (tabs == '2') {
			this.getBackground()
		}
		if (tabs == '3') {
			this.getTrajectory()
		}
		if (tabs == '4') {
			this.getMembers()
		}
		if (tabs == '5') {
			this.getSocial()
		}
		if (tabs == '6') {
			this.getTransport()
		}
	}
	getBasis = () => {
		this.props.dispatch({
			type: 'personnelDetails/getPersonArchivesList',
			payload: {
				data: {
					archives_type_codes: [
						window.configUrl.edzxx, //二代证信息
						window.configUrl.jszxx, //驾驶证信息
						window.configUrl.czrkxx, //常驻人口信息
						window.configUrl.zzrkxx //暂住人口信息
					],
					person_id: this.props.id || ''
				},
				type: '1',
                lable:'1'
			}
		})
	}
	getBackground = () => {
		this.props.dispatch({
			type: 'personnelDetails/getPersonArchivesList',
			payload: {
				data: {
					archives_type_codes: [
						window.configUrl.qgzt, //全国在逃
						window.configUrl.qlzdr, //七类重点人
						window.configUrl.xjxx, //刑拘信息
						window.configUrl.wzxx //违章信息
					],
					person_id: this.props.id || ''
				},
				type: '1'
			}
		})
	}
	getTrajectory = () => {
		this.props.dispatch({
			type: 'personnelDetails/getPersonArchivesList',
			payload: {
				data: {
					archives_type_codes: [
						window.configUrl.zsxx, //住宿信息
						window.configUrl.tlxx //铁路信息
					],
					person_id: this.props.id || ''
				},
				type: '1'
			}
		})
	}
	getMembers = () => {
		this.props.dispatch({
			type: 'personnelDetails/getPersonArchivesList',
			payload: {
				data: {
					archives_type_codes: [
						window.configUrl.jtcyxx //家庭成员信息
					],
					person_id: this.props.id || ''
				},
				type: '1'
			}
		})
	}
	getTransport = () => {
		this.props.dispatch({
			type: 'personnelDetails/getPersonArchivesList',
			payload: {
				data: {
					archives_type_codes: [
						window.configUrl.jdcxx //机动车信息
					],
					person_id: this.props.id || ''
				},
				type: '1'
			}
		})
	}
	getSocial = () => {
		this.props.dispatch({
			type: 'personnelDetails/getPersonArchivesList',
			payload: {
				data: {
					archives_type_codes: [
						window.configUrl.shgx //机动车信息
					],
					person_id: this.props.id || ''
				},
				type: '2'
			}
		})
	}
	updatePersonArchives = () => {
		const { tabs } = this.props
		let arr = []
		if (tabs == '1') {
			arr = [
				window.configUrl.edzxx, //二代证信息
				window.configUrl.jszxx, //驾驶证信息
				window.configUrl.czrkxx, //常驻人口信息
				window.configUrl.zzrkxx //暂住人口信息
			]
		}
		if (tabs == '2') {
			arr = [
				window.configUrl.qgzt, //全国在逃
				window.configUrl.qlzdr, //七类重点人
				window.configUrl.xjxx, //刑拘信息
				window.configUrl.wzxx //违章信息
			]
		}
		if (tabs == '3') {
			arr = [
				window.configUrl.zsxx, //住宿信息
				window.configUrl.tlxx //铁路信息
			]
		}
		if (tabs == '4') {
			arr = [
				window.configUrl.jtcyxx //家庭成员信息
			]
		}
		if (tabs == '5') {
			arr = [
				window.configUrl.shgx //机动车信息
			]
		}
		if (tabs == '6') {
			arr = [
				window.configUrl.jdcxx //机动车信息
			]
		}

		this.props.dispatch({
			type: 'personnelDetails/updatePersonArchives',
			payload: {
				archives_type_codes: arr,
				person_id: this.props.id || ''
			},
			success: (e) => {
				if (e.result.reason.code == '200') {
					if (tabs == '1') {
						this.getBasis()
					}
					if (tabs == '2') {
						this.getBackground()
					}
					if (tabs == '3') {
						this.getTrajectory()
					}
					if (tabs == '4') {
						this.getMembers()
					}
					if (tabs == '5') {
						this.getSocial()
					}
					if (tabs == '6') {
						this.getTransport()
					}
				}
			}
		})
	}
	dataKeyRender = (files) => {
		let arr = []
		for (var index in files) {
			// console.log(index ,":", files[index]);
			arr.push({
				value: files[index],
				name: `${index}：`
			})
		}
		return arr
	}
	renderTransport = () => {
		const { tabs, form, personnelDetails: { information } } = this.props
		return (
			<div className={styles.item}>
				{information.map((x) => (
					<div key={x.id}>
						{/* <div className={styles.itemTitle}>{x.archives_type_name}</div> */}
						<div className={styles.members}>
							<ul>
								{x.archives_info &&
									x.archives_info.length &&
									x.archives_info.map((g, l) => (
										<li key={l}>
											<div className={styles.icons}>
												<img src="./image/jdc.png" alt="" />
											</div>
											<div className={styles.text}>
												{this.dataKeyRender(g).map((v, k) => (
													<div key={k} className={styles.con}>
														<span className={styles.titleColumn}>{v.name}</span>
														<span className={styles.textColumn}>{v.value}</span>
													</div>
												))}
											</div>
										</li>
									))}
							</ul>
						</div>
					</div>
				))}
			</div>
		)
	}
	renderMembers = () => {
		const { tabs, form, personnelDetails: { information } } = this.props
		return (
			<div className={styles.item}>
				{information.map((x) => (
					<div key={x.id}>
						{/* <div className={styles.itemTitle}>{x.archives_type_name}</div> */}
						<div className={styles.members}>
							<ul>
								{x.archives_info &&
									x.archives_info.length &&
									x.archives_info.map((g, l) => (
										<li key={l}>
											<div className={styles.icons}>
												<img src="./image/ry.png" alt="" />
											</div>
											<div className={styles.text}>
												{this.dataKeyRender(g).map((v, k) => (
													<div key={k} className={styles.con}>
														<span className={styles.titleColumn}>{v.name}</span>
														<span className={styles.textColumn}>{v.value}</span>
													</div>
												))}
											</div>
										</li>
									))}
							</ul>
						</div>
					</div>
				))}
			</div>
		)
	}
	renderBackground = () => {
		const { tabs, form, personnelDetails: { information } } = this.props
		return (
			<div className={styles.item}>
				{information.map((x) => (
					<div key={x.id}>
						<div className={styles.itemTitle}>{x.archives_type_name}</div>
						<div className={styles.content}>
							<ul>
								{this.dataKeyRender(
									x.archives_info && x.archives_info.length && x.archives_info[0]
								).map((v, k) => (
									<li key={k}>
										<span className={styles.titleColumn}>{v.name}</span>
										<span className={styles.textColumn}>{v.value}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				))}
			</div>
		)
	}
	renderTrajectory = () => {
		const { tabs, form, personnelDetails: { information } } = this.props
		return (
			<div className={styles.item}>
				{information.map((x) => (
					<div key={x.id}>
						<div className={styles.itemTitle}>{x.archives_type_name}</div>
						<div className={styles.trajectory}>
							<ul>
								{x.archives_info &&
									x.archives_info.length &&
									x.archives_info.map((g, l) => (
										<li key={l}>
											<div className={styles.icons}>
												<img
													src={
														x.archives_type_code == window.configUrl.zsxx ? (
															'./image/zs.png'
														) : x.archives_type_code == window.configUrl.tlxx ? (
															'./image/tl.png'
														) : (
															''
														)
													}
													alt=""
												/>
											</div>
											<div className={styles.text}>
												{this.dataKeyRender(g).map((v, k) => (
													<div key={k} className={styles.con}>
														<span className={styles.titleColumn}>{v.name}</span>
														<span className={styles.textColumn}>{v.value}</span>
													</div>
												))}
											</div>
										</li>
									))}
							</ul>
						</div>
					</div>
				))}
			</div>
		)
	}
	renderBasis = () => {
		const { tabs, form, personnelDetails: { information } } = this.props
		return (
			<div className={styles.item}>
				<div className={styles.content}>
					<ul className={styles.itemUl}>
						{this.dataKeyRender(
							information &&
								information.length &&
								information[0].archives_info &&
								information[0].archives_info.length &&
								information[0].archives_info[0]
						).map((v, k) => (
							<li key={k}>
								<span className={styles.titleColumn}>{v.name}</span>
								<span className={styles.textColumn}>{v.value}</span>
							</li>
						))}
					</ul>
					{information[0].archives_info &&
					information[0].archives_info.length &&
					information[0].archives_info[0].相片 ? (
						<img src={information[0].archives_info[0].相片} alt="" />
					) : null}
				</div>
			</div>
		)
	}
	renderForm = () => {
		const { tabs, form, personnelDetails: { information } } = this.props
		return (
			<div className={styles.detailInfor}>
				{information && information.length && information[0] ? (
					<div className={styles.infors}>
						{tabs == '1' ? <div>{this.renderBasis()}</div> : null}
						{tabs == '2' ? <div>{this.renderBackground()}</div> : null}
						{tabs == '3' ? <div>{this.renderTrajectory()}</div> : null}
						{tabs == '4' ? <div>{this.renderMembers()}</div> : null}
						{tabs == '5' ? (
							<div>
								<Social />
							</div>
						) : null}
						{tabs == '6' ? <div>{this.renderTransport()}</div> : null}
					</div>
				) : (
					<div className={styles.empty}>
						<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
					</div>
				)}
			</div>
		)
	}
	render() {
		const { form, tabs } = this.props

		return (
			<div>
				<div className={styles.update}>
					<Button type="primary" onClick={() => this.updatePersonArchives()}>
						更新
					</Button>
				</div>
				<Card bordered={false} className={styles.tableListCard}>
					{this.props.loading ? (
						<div
							style={{
								textAlign: 'center',
								marginTop: '90px',
								marginBottom: '90px'
							}}
						>
							<Spin spinning={this.props.loading} />
						</div>
					) : (
						<div>{this.renderForm()}</div>
					)}
				</Card>
			</div>
		)
	}
}

export default Form.create()(textField)
