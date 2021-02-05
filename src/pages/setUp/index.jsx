import React, { Component } from 'react'
import { Message, Row, Col, Switch, Result, Form, Divider, Badge, Card, Button, Menu, Icon, Avatar, Modal } from 'antd'
import moment from 'moment'
import { connect } from 'dva'
import styles from './style.less'
// import PoliceUnit from './policeUnit/index'
// import Shift from './shift/index'
// import Equip from './equip/index'
// import EquipStatistics from './equipStatistics/index'
import Organization from './organization/index'
import Patrol from './patrol/index'
import PhotoOtherMap from './photoOtherMap/index'
import ImportOtherMap from './importOtherMap/index'
// import Reported from './reported/index'
import { authorityIsTrue } from '@/utils/authority'
import OrganizationOtherMap from "./organizationOtherMap";
import PatrolOtherMap from "./patrolOtherMap";

@connect(({ createService, loading }) => ({
	createService,
	loading: loading.models.createService
}))
class service extends Component {
	state = {
		// current: authorityIsTrue('czht_qwgl_jgbj')
		// 	? '0'
		// 	: authorityIsTrue('czht_qwgl_xlfw')
		// 		? '1'
		// 		: authorityIsTrue('czht_qwgl_jldy')
		// 			? '2'
		// 			: authorityIsTrue('czht_qwgl_bcgl')
		// 				? '3'
		// 				: authorityIsTrue('czht_qwgl_zbgl')
		// 					? '4'
		// 					: authorityIsTrue('czht_qwgl_ZBTJ')
		// 						? '5'
		// 						: authorityIsTrue('czht_qwgl_qwbb') ? '6' : authorityIsTrue('czht_qwgl_qwjg') ? '7' : '',
		isDraw: false,
		current: '0',
	}

	componentWillMount() {



	}
	componentDidMount() {
        // console.log(this.props)
		if (this.props.location.state != undefined) {
			const states = this.props.location.state
            console.log(states)
			this.setState({current: states.expandForm})
		}
		this.getUseDept()
	}
	getUseDept = () => {
		const { dispatch } = this.props
		let codes = []
		const groupList = JSON.parse(sessionStorage.getItem('user')).groupList
		for (var i = 0; i < groupList.length; i++) {
			codes.push(groupList[i].code)
		}
		if (codes.length == groupList.length) {
			dispatch({
				type: 'createService/getUseDept',
				payload: {
					// department: JSON.parse(sessionStorage.getItem('user')).department,
					groupList: codes
				}
			})
		}
	}
	handleMune = (e) => {
		console.log('click ', e, this.state.isDraw)
		var _self = this
		if (this.state.isDraw) {
			Modal.confirm({
				title: '切换后当前绘制数据将清除，是否要切换？',
				okText: '确认',
				cancelText: '取消',
				onOk() {
					_self.setState({
						current: e,
						isDraw: false
					})
				}
			})
		} else {
			this.setState({
				current: e,
				isDraw: false
			})
		}
	}
	prompt = (e) => {
		console.log('切换页面', e)
		this.setState({ isDraw: e })
	}
	renderCard = () => {
		switch (this.state.current) {
			case '0':
                return window.configUrl.mapType === 'openlayers' || !window.configUrl.mapType ? (
                    <Organization prompt={e => this.prompt(e)} />
                ) : (
                    <OrganizationOtherMap prompt={e => this.prompt(e)} />
                );
				break
			case '1':
                return window.configUrl.mapType === 'openlayers' || !window.configUrl.mapType ? (
                    <Patrol prompt={e => this.prompt(e)} />
                ) : (
                    <PatrolOtherMap prompt={e => this.prompt(e)} />
                );
				break
            case '2':
                return <PhotoOtherMap prompt={e => this.prompt(e)} />
                break
            case '3':
                return <ImportOtherMap prompt={e => this.prompt(e)} />
                break
			// case '2':
			// 	return <PoliceUnit />
			// 	break
			// case '3':
			// 	return <Shift />
			// 	break
			// case '4':
			// 	return <Equip />
			// 	break
			// case '5':
			// 	return <EquipStatistics history={this.props.history} location={this.props.location}/>
			// 	break
			// case '6':
			// 	return <Reported />
			// 	break
			default:
				break
		}
	}
	render() {
		const { loading } = this.props
		const menuList = [
			{ name: '重点路口', key: '0', permissions: 'czht_qwgl_jgbj' },
			{ name: '重点场所', key: '1', permissions: 'czht_qwgl_xlfw' },
            { name: '摄像头点位标注', key: '2', permissions: 'czht_qwgl_jldy' },
            { name: '全部重点路口', key: '3', permissions: 'czht_qwgl_qbzdlk' },
		]

		return (
			<div>
                <div className={styles.headerInfo}>
                    {menuList.map(
                        (item) =>
                           (
                                <Button
                                    type="primary"
                                    key={item.key}
                                    size="large"
                                    className={styles.button}
                                    style={{ backgroundColor: this.state.current == item.key ? '' : '#333367' }}
                                    onClick={() => this.handleMune(item.key)}
                                    // loading={loading}
                                >
                                    {item.name}
                                </Button>
                            )
                    )}
                </div>

				{this.state.current != '' ? (
					this.renderCard()
				) : (
					<div>
						<Result status="403" title="403" subTitle="抱歉，您没有相关权限" />
					</div>
				)}
			</div>
		)
	}
}

export default Form.create()(service)
// export default () => <div>hecha</div>;
