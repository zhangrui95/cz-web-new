import React, { Component } from 'react'
import moment from 'moment'
import {
	message,
	Row,
	Col,
	Switch,
	Form,
	Divider,
	List,
	Badge,
	Card,
	Menu,
	Dropdown,
	Button,
	Icon,
	Avatar,
	Modal
} from 'antd'
import { connect } from 'dva'
import ol from 'openlayers'
import Calendar from 'react-calendar'
import styles from './index.less'
import webSocketClient from '@/components/websocket/webSocketService'
import { connect as mqttConnect } from 'mqtt'
import { offlineMapLayerScreen, initView } from '@/utils/olUtils'
import { setInterval } from 'timers'
import Statistical from './compontent/statistical'
import LeaderDuty from './compontent/leaderDuty'
import WarningSituation from './compontent/warningSituation'
import Called from './compontent/called'
import TodayCheck from './compontent/todayCheck'
import WarningList from './compontent/warningList'
import SearchEngine from './compontent/searchEngine'
import SwitchList from './compontent/switchList'
import Equipment from './compontent/equipment'
import WarningDetails from './compontent/warningDetails'
import VehicleDetail from './compontent/vehicleDetail'
import Patrolwarning from './compontent/patrolwarning'
import WrittenWarning from './compontent/writtenWarning'
import TrafficWarning from './compontent/trafficWarning'
import VideoPlayer from '@/components/VideoPlayer/VideoPlayer'

var latreg = /^(\-|\+)?([0-8]?\d{1}\.\d{0,15}|90\.0{0,15}|[0-8]?\d{1}|90)$/
var longrg = /^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,15})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,15}|180)$/
@connect(({ screen, loading }) => ({
	screen,
	loading: loading.models.screen
}))
class screen extends Component {
	constructor(props) {
		super(props)

		// this.client = mqttConnect(window.configUrl.mqttUrl)
		// this.client.on('connect', this.connect)
		// this.client.on('message', this.message)
		this.wc = null
		this.called = null
		// this.localClient = mqttConnect(window.configUrl.localhostMqttUrl);
		// this.localClient.on('connect', this.localConnect);
		// this.localClient.on('message', this.localMessage);
	}

	state = {
		map: null,
		view: null,
		vector: null,
		overlay: null,
		source: null,
		sourceHeat: null,
		vectorHeat: null,
		sourceCar: null,
		showCarVector: null,
		sourceIntercom: null,
		showIntercomVector: null,
		sourceIndividual: null,
		showIndividualVector: null,
		sourceSwan: null,
		showSwanVector: null,
		sourceMonitoring: null,
		showMonitoringVector: null,
		sourceKeyPlace: null,
		showKeyPlaceVector: null,
		sourcePoliceStation: null,
		showPoliceStationVector: null,
		sourceJurisdiction: null,
		showJurisdictionVector: null,
		sourceWarning: null,
		showWaringVector: null,
		sourcePoliceDetails: null,
		showPoliceDetailsVector: null,
		warnings: null,
		overlayWarning: null,
		sourceTrajectory: null,
		showTrajectoryVector: null,
		sourceSearchBar: null,
		showSearchBarVector: null,
		searchBar: null,
		overlaySearchBar: null,

		content: null,

		showHeat: false, //热力图
		showVehicle: true, //警车
		showAlert: false, //警情
		showIntercom: false, //对讲机
		showIndividual: false, //单兵设备
		showSwan: false, //卡口
		showMonitoring: false, //监控
		showStation: false, //警务站
		showPlace: false, //重点场所
		showJurisdiction: false, //查看辖区

		policeAlarmCounts: {}, //警情统计列表
		schedules: {}, //当日勤务信息
		individualList: [], //单兵设备列表
		policeAlarmList: [], //警情列表
		comparisonList: [], //核查统计
		vehicleGpsList: [], //车辆列表
		vehicleStatusList: [], //车辆状态
		heatList: [], //警情热力图
		alarmList: [], //预警列表
		intercomList: [], //对讲机列表
		swanList: [], //卡口列表
		monitoringList: [], //监控列表
		keyPlaceList: [], //重点场所列表
		policeStationList: [], //警务站列表
		vehicleInfor: false, //车辆信息为true  全局为false
		isOneRender: false,
		vehicleDetailInfor: {}, //车辆信息
		vehicleState: false, //车辆信息状态
		vehicleid: '', //切换车辆ID
		gxdwdm: '', //切换车辆管辖机构代码
		vehicleComparisonList: [], //车辆核查统计
		policeDetails: {}, //接处警详情
		searchDetailsType: '', //检索类型
		searchDetails: {}, //检索详情
		alarmType: null, //预警详情类型
		alarmDetails: {}, //预警详情
		showAlarmDetails: false, //现实预警详情
		showTrajectory: false, //判断是否显示轨迹
		showVideo: false, //是否显示车辆视频
		videoInfor: [] //车辆视频内容
	}
	// connect = () => {
	// 	const topic = 'Ret/backstage/alarm/#'
	// 	this.client.subscribe(topic)
	// }
	// message = (topic, res) => {
	// 	const vehicleGpsList = this.state.vehicleGpsList
	// 	const monitoringList = this.state.monitoringList
	// 	const info = JSON.parse(res.toString())
	// 	const topics = topic.substring(topic.lastIndexOf('/') + 1)
	// 	const { showMonitoring, abnormalPeoples } = this.state
	// 	console.log('MQTT接收到info', info, topics)

	// }
	componentWillMount() {}
	componentDidMount() {
		// 初始化地图
		this.initMap()
		this.equipmentType()
		this.getSocket()
	}
	getSocket = (parameter) => {
		const { showHeat, showVehicle, showAlert, showIntercom, showIndividual } = this.state
		const _self = this
		console.log(this.state)
		this.wc = new webSocketClient({
			url: window.configUrl.websocketBig,
			globalParams: {
				token: sessionStorage.getItem('userToken'),
				government: JSON.parse(sessionStorage.getItem('groupListCode')),
				individualEquipmentFlag: _self.state.showIndividual,
				intercomFlag: _self.state.showIntercom,
				policeAlarmFlag: _self.state.showAlert,
				thermodynamicChartFlag: _self.state.showHeat,
				vehicleFlag: _self.state.showVehicle
			},
			heartbeatInterval: window.configUrl.heartbeatInterval, //心跳时间
			messageCallback: (files) => {
				console.log('收到信息===', files)
				this.setState(
					{
						policeAlarmCounts: files.policeAlarmCounts || {},
						schedules: files.schedules || {},
						individualList: files.individualEquipmentList || [],
						heatList: files.policeAlarmList || [],
						comparisonList: files.comparisonList || [],
						vehicleGpsList: files.vehicleGpsList || [],
						vehicleStatusList: files.vehicleStatusList || [],
						alarmList: files.alarmList || [],
						intercomList: files.intercomList || [],
						policeAlarmList: files.policeAlarm || []
					},
					() => {
						_self.getHeatMap()
						_self.getVehicleMap(false)
						// _self.getIntercomMap()
                        if (_self.state.vehicleState) {
							console.log(_self.state.vehicleid, 'xuanzhongde =====')
							const gpss = files.vehicleGpsList.find((v) => v.vehicle_id == _self.state.vehicleid)
								.gps_point
							_self.state.overlay.setPosition(ol.proj.fromLonLat(this.transform(gpss[0], gpss[1])))
							//设置中心点
							let cenarr = []
							cenarr.push(ol.proj.fromLonLat(this.transform(gpss[0], gpss[1])))

							//设置中心点
							let exent = ol.extent.boundingExtent(cenarr)
							let center = ol.extent.getCenter(exent)

							_self.state.view.fit(exent)
							// _self.state.view.setZoom(16)
							_self.state.view.setCenter(center)
						}
						_self.getPiontMap(
							_self.state.intercomList,
							false,
							'sourceIntercom',
							'showIntercomVector',
							'./image/djj_1.png',
							'intercom',
							'gps_point'
						)
						// _self.getIndividualMap()
						_self.getPiontMap(
							_self.state.individualList,
							false,
							'sourceIndividual',
							'showIndividualVector',
							'./image/dbsb_1.png',
							'individual',
							'gps_point'
						)
						_self.getWarningMap()
                        // if (_self.state.showVehicle) {
						// 	_self.getVehicleMap(false)
						// }
						// if (_self.state.showHeat) {
						// 	_self.getHeatMap()
						// }
                        // if (_self.state.showIntercom) {
						// 	_self.getPiontMap(
						// 	_self.state.intercomList,
						// 	false,
						// 	'sourceIntercom',
						// 	'showIntercomVector',
						// 	'./image/djj_1.png',
						// 	'intercom',
						// 	'gps_point'
						// )
						// }
                        // if (_self.state.showIndividual) {
						// 	_self.getPiontMap(
						// 	_self.state.individualList,
						// 	false,
						// 	'sourceIndividual',
						// 	'showIndividualVector',
						// 	'./image/dbsb_1.png',
						// 	'individual',
						// 	'gps_point'
						// )
						// }
                        // if (_self.state.showAlert) {
						// 	_self.getWarningMap()
						// }
					}
				)
			},

			errorCallback: (err) => console.log(err),
			closeCallback: (msg) => {
				console.log(msg)
				this.wc.close()
			},
			//连接成功后
			openCallback: () => {
				console.log('websocket链接已启动')
				this.wc.send({
					// "projectCode": port.webSocket.projectCode,
					token: sessionStorage.getItem('userToken'),
					government: JSON.parse(sessionStorage.getItem('groupListCode')),
					individualEquipmentFlag: _self.state.showIndividual,
					intercomFlag: _self.state.showIntercom,
					policeAlarmFlag: _self.state.showAlert,
					thermodynamicChartFlag: _self.state.showHeat,
					vehicleFlag: _self.state.showVehicle
				})
			}
		})
	}
	componentWillUnmount() {
		console.log(this.wc)
		if (this.wc) {
			if (this.wc.wsObject) {
				if (this.wc.wsObject.onclose) {
					this.wc.wsObject.onclose()
				}
			}
		}
	}
	equipmentType = () => {
		const { dispatch } = this.props
		// equipmentType
		dispatch({
			type: 'screen/policeQuery',
			payload: { code: window.configUrl.dictionariesEquipmentType }
		})
	}
	clickfu = () => {}
	//地图
	initMap = () => {
		let circle // 绘制对象
		var _self = this
		// 创建地图
		const view = initView()
		// 指定地图要显示在id为map的div中
		const map = new ol.Map({
			view,
			target: 'map'
		})
		map.addLayer(offlineMapLayerScreen()) // 将地图加载上来

		// 实例化一个矢量图层Vector作为绘制层
		const source = new ol.source.Vector({})
		const vector = new ol.layer.Vector({
			source,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: 'rgba(224,156,25, 0.2)'
				}),
				stroke: new ol.style.Stroke({
					color: '#5358FD',
					width: 2
				})
			})
		})
		const sourceHeat = new ol.source.Vector({})
		const vectorHeat = new ol.layer.Heatmap({
			source: sourceHeat,
			blur: parseInt(22, 10),
			radius: parseInt(18, 15),
			gradient: [ '#04fbb2', '#18fb04', '#fbd804', '#f94000', '#b30303' ] //颜色
		})
		const sourceCar = new ol.source.Vector({})
		const showCarVector = new ol.layer.Vector({
			source: sourceCar
		})
		const sourceIntercom = new ol.source.Vector({})
		const showIntercomVector = new ol.layer.Vector({
			source: sourceIntercom
		})
		const sourceIndividual = new ol.source.Vector({})
		const showIndividualVector = new ol.layer.Vector({
			source: sourceIndividual
		})
		const sourceSwan = new ol.source.Vector({})
		const showSwanVector = new ol.layer.Vector({
			source: sourceSwan
		})
		const sourceMonitoring = new ol.source.Vector({})
		const showMonitoringVector = new ol.layer.Vector({
			source: sourceMonitoring
		})
		const sourceKeyPlace = new ol.source.Vector({})
		const showKeyPlaceVector = new ol.layer.Vector({
			source: sourceKeyPlace
		})
		const sourcePoliceStation = new ol.source.Vector({})
		const showPoliceStationVector = new ol.layer.Vector({
			source: sourcePoliceStation
		})
		const sourceJurisdiction = new ol.source.Vector({})
		const showJurisdictionVector = new ol.layer.Vector({
			source: sourceJurisdiction
		})
		const sourceWarning = new ol.source.Vector({})
		const showWaringVector = new ol.layer.Vector({
			source: sourceWarning
		})
		const sourcePoliceDetails = new ol.source.Vector({})
		const showPoliceDetailsVector = new ol.layer.Vector({
			source: sourcePoliceDetails
		})
		const sourceSearchBar = new ol.source.Vector({})
		const showSearchBarVector = new ol.layer.Vector({
			source: sourceSearchBar
		})
		const sourceTrajectory = new ol.source.Vector({})
		const showTrajectoryVector = new ol.layer.Vector({
			source: sourceTrajectory
		})

		var searchBarBody = document.getElementById('searchBar')
		var searchBar = document.getElementById('searchBar-content')
		var warningBody = document.getElementById('warnings')
		var warnings = document.getElementById('warnings-content')

		var container = document.getElementById('popup')
		var content = document.getElementById('popup-content')
		// 创建一个overlay, 绑定html元素container
		var overlay = new ol.Overlay(
			/** @type {olx.OverlayOptions} */ {
				element: container,
				autoPan: true,
				positioning: 'bottom-center',
				stopEvent: false
				// offset: [ 2, -18]
				// autoPanAnimation: {
				// 	duration: 250
				// }
			}
		)
		// 创建一个overlay, 绑定html元素warningBody
		var overlayWarning = new ol.Overlay(
			/** @type {olx.OverlayOptions} */ {
				element: warningBody,
				autoPan: true,
				positioning: 'right-center',
				stopEvent: false,
				autoPanAnimation: {
					duration: 250
				}
			}
		)
		// 创建一个overlay, 绑定html元素searchBarBody
		var overlaySearchBar = new ol.Overlay(
			/** @type {olx.OverlayOptions} */ {
				element: searchBarBody,
				autoPan: true,
				positioning: 'right-center',
				stopEvent: false,
				autoPanAnimation: {
					duration: 250
				}
			}
		)
		map.addOverlay(overlayWarning)
		map.addOverlay(overlaySearchBar)

		map.addLayer(showWaringVector)
		map.addLayer(vector) // 将绘制层添加到地图容器中
		map.addOverlay(overlay)
		map.addLayer(vectorHeat)
		map.addLayer(showIntercomVector)
		map.addLayer(showIndividualVector)
		map.addLayer(showSwanVector)
		map.addLayer(showMonitoringVector)
		map.addLayer(showKeyPlaceVector)
		map.addLayer(showPoliceStationVector)
		map.addLayer(showJurisdictionVector)
		map.addLayer(showPoliceDetailsVector)
		map.addLayer(showTrajectoryVector)

		map.addLayer(showCarVector)
		map.addLayer(showSearchBarVector)
		map.on('singleclick', (e) => {})
		//为地图容器添加单击事件监听
		map.on('click', function(evt) {
			let point = evt.coordinate //鼠标单击点坐标
			var pixel = map.getEventPixel(evt.originalEvent)
			//判断当前单击处是否有要素，捕获到要素时弹出popup
			var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
				return feature
			})
			if (feature) {
				console.log('---', feature.get('type'))
				console.log('---', feature.get('layer'))
				console.log('===', feature.get('gps'))
				// _self.setState({vehicleInfor: true})
				if (feature.get('type') == 'vehicle') {
					_self.addFeatrueInfo(feature.get('layer'))
					_self.setState(
						{
							vehicleInfor: true,
							vehicleState: true,
							vehicleid: feature.get('layer').vehicle_id,
							showDetail: true,
							showTrajectory: false,
							gxdwdm: feature.get('layer').vehicle_organization_code,
							vehicleDetailInfor: {
								carNo: feature.get('layer').vehicle_license_plate
							},
							vehicleComparisonList: feature.get('layer').comparison_message
						},
						() => {
							_self.addFeatrueInfo(feature.get('layer'))
							_self.state.showTrajectoryVector.setSource(null)
							_self.state.sourceTrajectory.clear()
						}
					)
					_self.getDetailById(feature.get('layer'))
					overlay.setPosition(ol.proj.fromLonLat(feature.get('gps')))
					_self.closePoliceDetails()
				}
			}
		})
		map.on('moveend', function(e) {
			console.log('层级变化', e, map.getView().getZoom())
			if (_self.state.showVehicle) {
				_self.getVehicleMap(false)
				_self.checkPoliceDetails()
				_self.checkSearchDetails()
				// _self.getIntercomMap()
				_self.getPiontMap(
					_self.state.intercomList,
					false,
					'sourceIntercom',
					'showIntercomVector',
					'./image/djj_1.png',
					'intercom',
					'gps_point'
				)
				// _self.getIndividualMap()
				_self.getPiontMap(
					_self.state.individualList,
					false,
					'sourceIndividual',
					'showIndividualVector',
					'./image/dbsb_1.png',
					'individual',
					'gps_point'
				)
				// _self.getSwanMap()

				_self.getPiontMap(
					_self.state.swanList,
					false,
					'sourceSwan',
					'showSwanVector',
					'./image/kk_1.png',
					'swan',
					'gps'
				)
				_self.getPiontMap(
					_self.state.monitoringList,
					false,
					'sourceMonitoring',
					'showMonitoringVector',
					'./image/jk_1.png',
					'monitoring',
					'gps'
				)
				// _self.getMonitoringMap()
				// _self.getKeyPlaceMap()
				_self.getPiontMap(
					_self.state.keyPlaceList,
					false,
					'sourceKeyPlace',
					'showKeyPlaceVector',
					'./image/zdcs_1.png',
					'keyPlace',
					'gps'
				)
				// _self.getPoliceStationMap()
				_self.getPiontMap(
					_self.state.policeStationList,
					false,
					'sourcePoliceStation',
					'showPoliceStationVector',
					'./image/jwz_1.png',
					'policeStation',
					'gps'
				)
				_self.getWarningMap()
				overlay.setOffset([ 0, Number(map.getView().getZoom() / 0.45) ])
			}
		})

		this.setState({
			map,
			view,
			vector,
			source,
			overlay,
			sourceHeat,
			vectorHeat,
			sourceCar,
			showCarVector,
			sourceIntercom,
			showIntercomVector,
			sourceIndividual,
			showIndividualVector,
			sourceSwan,
			showSwanVector,
			sourceMonitoring,
			showMonitoringVector,
			sourceKeyPlace,
			showKeyPlaceVector,
			sourcePoliceStation,
			showPoliceStationVector,
			sourceJurisdiction,
			showJurisdictionVector,
			sourceWarning,
			showWaringVector,
			sourcePoliceDetails,
			showPoliceDetailsVector,
			content,
			overlayWarning,
			warnings,
			sourceSearchBar,
			showSearchBarVector,
			searchBar,
			overlaySearchBar,
			sourceTrajectory,
			showTrajectoryVector
		})
	}

	getDetailById = (e) => {
		this.props.dispatch({
			type: 'screen/getEquipmentListByVehicleId',
			payload: {
				vehicle_id: e.vehicle_id
			}
		})
		this.props.dispatch({
			type: 'screen/getScheduleListByVehicleId',
			payload: {
				vehicle_id: e.vehicle_id
			}
		})
		this.props.dispatch({
			type: 'screen/getVehiclePoliceAlarmList',
			payload: {
				carNo: e.vehicle_license_plate,
				imei: e.pad_cid,
				vehicle_organization_code: e.vehicle_organization_code
			}
		})
		this.props.dispatch({
			type: 'screen/getScheduleCountByVehicleId',
			payload: {
				vehicle_id: e.vehicle_id
			},
			success: (e) => {
				if (e.result.reason.code == '200') {
					console.log(e)
					if (e.result.list) {
						this.setState({
							vehicleDetailInfor: {
								...this.state.vehicleDetailInfor,
								absenceCounts: e.result.list[0].absenceCounts,
								attendanceCounts: e.result.list[0].attendanceCounts,
								scheduleCounts: e.result.list[0].scheduleCounts,
								cth: e.result.device == null ? '暂无车台' : e.result.device.cth || '暂无车台'
							}
						})
					}
				} else {
					return false
				}
			}
		})
	}
	getBayonetsList = (files) => {
		var _self = this
		this.props.dispatch({
			type: 'screen/getBayonetsList',
			payload: {
				bayonet_type: files
			},
			success: (e) => {
				if (e.result.reason.code == '200') {
					if (files == 1) {
						this.setState({ swanList: e.result.list }, () => {
							// _self.getSwanMap()
							_self.getPiontMap(
								_self.state.swanList,
								false,
								'sourceSwan',
								'showSwanVector',
								'./image/kk_1.png',
								'swan',
								'gps'
							)
						})
					} else if (files == 2) {
						this.setState({ monitoringList: e.result.list }, () => {
							// _self.getMonitoringMap()
							_self.getPiontMap(
								_self.state.monitoringList,
								false,
								'sourceMonitoring',
								'showMonitoringVector',
								'./image/jk_1.png',
								'monitoring',
								'gps'
							)
						})
					} else if (files == 3) {
						this.setState({ keyPlaceList: e.result.list }, () => {
							// _self.getKeyPlaceMap()
							_self.getPiontMap(
								_self.state.keyPlaceList,
								false,
								'sourceKeyPlace',
								'showKeyPlaceVector',
								'./image/zdcs_1.png',
								'keyPlace',
								'gps'
							)
						})
					} else if (files == 4) {
						this.setState({ policeStationList: e.result.list }, () => {
							// _self.getPoliceStationMap()
							_self.getPiontMap(
								_self.state.policeStationList,
								false,
								'sourcePoliceStation',
								'showPoliceStationVector',
								'./image/jwz_1.png',
								'policeStation',
								'gps'
							)
						})
					}
				} else {
					return false
				}
			}
		})
	}

	getJurisdiction = () => {
		this.props.dispatch({
			type: 'screen/getOrgGpsLabelList',
			payload: {
				association_organization_id: JSON.parse(sessionStorage.getItem('user')).group.parentId,
				brother_status: false,
				children_status: false,
				label_organization_code: JSON.parse(sessionStorage.getItem('user')).group.code,
				label_organization_id: JSON.parse(sessionStorage.getItem('user')).group.id,
				label_type: [ 0 ],
				parent_status: false
			},
			success: (e) => {
				console.log(e)
				if (e.result.reason.code == '200') {
					if (e.result.label.jgfw) {
						this.getJurisdictionMap(e.result.label.jgfw)
					}
				} else {
					return false
				}
			}
		})
	}

	// ///////////谷歌地球-谷歌地图/////////经纬度转换
	transformLat = (x, y) => {
		const pi = 3.1415926535897932384626
		let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
		ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0
		ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0
		ret += (160.0 * Math.sin(y / 12.0 * pi) + 320.0 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0
		return ret
	}

	transformLon = (x, y) => {
		const pi = 3.1415926535897932384626
		let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
		ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0
		ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0
		ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x * pi / 30.0)) * 2.0 / 3.0
		return ret
	}

	transform = (lon, lat) => {
		const pi = 3.1415926535897932384626
		const a = 6378245.0
		const ee = 0.00669342162296594323

		let dLat = this.transformLat(lon - 105.0, lat - 35.0)
		let dLon = this.transformLon(lon - 105.0, lat - 35.0)

		const radLat = lat / 180.0 * pi
		let magic = Math.sin(radLat)
		magic = 1 - ee * magic * magic
		const sqrtMagic = Math.sqrt(magic)

		dLat = dLat * 180.0 / (a * (1 - ee) / (magic * sqrtMagic) * pi)
		dLon = dLon * 180.0 / (a / sqrtMagic * Math.cos(radLat) * pi)

		const mgLat = lat + dLat
		const mgLon = lon + dLon

		return [ mgLon, mgLat ]
	}

	/**
   *  图层初始化
   *  */
	initLayers = () => {
		const { map, vector, source } = this.state
		vector.setSource(null)
		source.clear()
	}
	statesChange = (files) => {
		console.log(files)
		var _self = this
		const {
			showHeat,
			showVehicle,
			showAlert,
			showIntercom,
			showJurisdiction,
			showIndividual,
			showSwan,
			showMonitoring,
			showStation,
			showPlace
		} = this.state
		switch (files) {
			case 'showHeat':
				this.setState({ showHeat: !showHeat }, () => {
					if (!this.state.showHeat) {
						_self.state.vectorHeat.setSource(null)
						_self.state.sourceHeat.clear()
					}
					console.log(this)
					this.sendSet()
				})

				break
			case 'showVehicle':
				this.setState({ showVehicle: !showVehicle }, () => {
					if (!this.state.showVehicle) {
						_self.state.showCarVector.setSource(null)
						_self.state.sourceCar.clear()
					}
					this.sendSet()
				})
				break
			case 'showAlert':
				this.setState({ showAlert: !showAlert }, () => {
					if (!this.state.showAlert) {
						_self.state.showWaringVector.setSource(null)
						_self.state.sourceWarning.clear()
					}
					this.sendSet()
				})
				break
			case 'showIntercom':
				this.setState({ showIntercom: !showIntercom }, () => {
					if (!this.state.showIntercom) {
						_self.state.showIntercomVector.setSource(null)
						_self.state.sourceIntercom.clear()
					}
					this.sendSet()
				})
				break
			case 'showIndividual':
				this.setState({ showIndividual: !showIndividual }, () => {
					if (!this.state.showIndividual) {
						_self.state.showIndividualVector.setSource(null)
						_self.state.sourceIndividual.clear()
					}
					this.sendSet()
				})
				break
			case 'showSwan':
				this.setState({ showSwan: !showSwan }, () => {
					// this.sendSet()
					if (this.state.showSwan) {
						this.getBayonetsList(1)
					} else {
						this.setState({ swanList: [] }, () => {
							// this.getSwanMap()
							_self.state.showSwanVector.setSource(null)
							_self.state.sourceSwan.clear()
							// _self.getPiontMap(_self.state.swanList,'sourceSwan', 'showSwanVector','./image/kk_1.png','swan','gps')
						})
					}
				})
				break
			case 'showMonitoring':
				this.setState({ showMonitoring: !showMonitoring }, () => {
					// this.sendSet()
					if (this.state.showMonitoring) {
						this.getBayonetsList(2)
					} else {
						this.setState({ monitoringList: [] }, () => {
							// this.getMonitoringMap()
							_self.state.showMonitoringVector.setSource(null)
							_self.state.sourceMonitoring.clear()
							// _self.getPiontMap(_self.state.monitoringList,'sourceMonitoring','showMonitoringVector','./image/jk_1.png','monitoring','gps')
						})
					}
				})
				break
			case 'showPlace':
				this.setState({ showPlace: !showPlace }, () => {
					// this.sendSet()
					if (this.state.showPlace) {
						this.getBayonetsList(3)
					} else {
						this.setState({ keyPlaceList: [] }, () => {
							// this.getKeyPlaceMap()
							_self.state.showKeyPlaceVector.setSource(null)
							_self.state.sourceKeyPlace.clear()
							// _self.getPiontMap(_self.state.keyPlaceList,'sourceKeyPlace', 'showKeyPlaceVector','./image/zdcs_1.png','keyPlace','gps')
						})
					}
				})
				break
			case 'showStation':
				this.setState({ showStation: !showStation }, () => {
					// this.sendSet()
					if (this.state.showStation) {
						this.getBayonetsList(4)
					} else {
						this.setState({ policeStationList: [] }, () => {
							// this.getPoliceStationMap()
							_self.state.showPoliceStationVector.setSource(null)
							_self.state.sourcePoliceStation.clear()
							// _self.getPiontMap(_self.state.policeStationList,'sourcePoliceStation', 'showPoliceStationVector','./image/jwz_1.png','policeStation','gps')
						})
					}
				})
				break
			case 'showJurisdiction':
				this.setState({ showJurisdiction: !showJurisdiction }, () => {
					if (this.state.showJurisdiction) {
						this.getJurisdiction()
					} else {
						this.state.sourceJurisdiction.clear()
						this.state.showJurisdictionVector.setSource(null)
					}
				})
				break
			default:
				break
		}
	}
	sendSet = () => {
		var _self = this
		this.wc.options.globalParams = {
			token: sessionStorage.getItem('userToken'),
			government: JSON.parse(sessionStorage.getItem('groupListCode')),
			individualEquipmentFlag: _self.state.showIndividual,
			intercomFlag: _self.state.showIntercom,
			policeAlarmFlag: _self.state.showAlert,
			thermodynamicChartFlag: _self.state.showHeat,
			vehicleFlag: _self.state.showVehicle
		}
		this.wc.send()
	}

	//在地图上渲染预警信息
	getWarningMap = () => {
		var _self = this
		// this.setState({ determine: 'edit' });
		let { view, map, sourceWarning, showWaringVector, policeAlarmList } = this.state
		let arr = [],
			vector
		let vehicleState = ''
		//实例一个线的全局变量
		var geometry = new ol.geom.Point() //线,Point 点,Polygon 面
		sourceWarning.clear()
		showWaringVector.setSource(null)
		if (policeAlarmList) {
			for (var i = 0; i < policeAlarmList.length; i++) {
				if (policeAlarmList[i].xzb && policeAlarmList[i].yzb) {
					if (longrg.test(policeAlarmList[i].xzb) && latreg.test(policeAlarmList[i].yzb)) {
						const pointFeaturea = new ol.Feature({
							geometry: new ol.geom.Point([
								Number(policeAlarmList[i].xzb),
								Number(policeAlarmList[i].yzb)
							])
						})
						const pointFeature = new ol.Feature({
							geometry: new ol.geom.Point([
								Number(policeAlarmList[i].xzb),
								Number(policeAlarmList[i].yzb)
							])
						})
						const pointFeatured = new ol.Feature({
							geometry: new ol.geom.Point([
								Number(policeAlarmList[i].xzb),
								Number(policeAlarmList[i].yzb)
							]),
							type: 'showAlert',
							layer: policeAlarmList[i],
							gps: [ Number(policeAlarmList[i].xzb), Number(policeAlarmList[i].yzb) ]
						})
						const pointFeatureT = new ol.Feature({
							geometry: new ol.geom.Point([
								Number(policeAlarmList[i].xzb),
								Number(policeAlarmList[i].yzb)
							]),
							type: 'showAlert',
							layer: policeAlarmList[i],
							gps: [ Number(policeAlarmList[i].xzb), Number(policeAlarmList[i].yzb) ]
						})
						pointFeatureT.setStyle(
							new ol.style.Style({
								image: new ol.style.Icon({
									scale: map.getView().getZoom() / 20, // 图标缩放比例
									src: './image/jq_1.png' // 图标的url
								})
							})
						)
						pointFeatured.setStyle(
							new ol.style.Style({
								image: new ol.style.Circle({
									radius: this.warningStyles().d,
									fill: new ol.style.Fill({
										color: 'rgba(255,0,0, 0.6)'
									}),
									stroke: new ol.style.Stroke({
										color: 'rgba(255, 0, 0, 0.6)'
										// width: map.getView().getZoom()*3,
									})
								})
							})
						)
						// pointFeature.setStyle(this.styleFunction(pointFeature))
						pointFeature.setStyle(
							new ol.style.Style({
								image: new ol.style.Circle({
									radius: this.warningStyles().b,
									fill: new ol.style.Fill({
										color: 'rgba(255,0,0, 0.4)'
									}),
									stroke: new ol.style.Stroke({
										color: 'rgba(255, 0, 0, 0.4)'
										// width: map.getView().getZoom()*3,
									})
								})
							})
						)
						pointFeaturea.setStyle(
							new ol.style.Style({
								image: new ol.style.Circle({
									radius: this.warningStyles().c,
									fill: new ol.style.Fill({
										color: 'rgba(255,0,0, 0.2)'
									}),
									stroke: new ol.style.Stroke({
										color: 'rgba(255, 0, 0, 0.2)'
										// width: map.getView().getZoom()*5,
									})
								})
							})
						)
						pointFeatured.getGeometry().transform('EPSG:4326', 'EPSG:3857')
						pointFeaturea.getGeometry().transform('EPSG:4326', 'EPSG:3857')
						pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
						pointFeatureT.getGeometry().transform('EPSG:4326', 'EPSG:3857')

						sourceWarning.addFeature(pointFeaturea)
						sourceWarning.addFeature(pointFeatured)
						sourceWarning.addFeature(pointFeature)
						sourceWarning.addFeature(pointFeatureT)
						_self.setState({
							pointFeaturea,
							pointFeature,
							pointFeatureT
						})
					}
				}
				// map.addLayer(vector);
				showWaringVector.setSource(sourceWarning)
				//  overlayWarning.setPosition([ Number(policeAlarm[0].xzb), Number(policeAlarm[0].yzb) ])
			}
		}
	}

	warningStyles = () => {
		let d = null,
			b = null,
			c = null
		switch (Number(this.state.map.getView().getZoom())) {
			case 8:
				// a = 0.1
				d = 2
				b = 6
				c = 10
				break
			case 9:
				// a = 0.1
				d = 4.04
				b = 12.1
				c = 20.18
				break
			case 10:
				// a = 0.2
				d = 8.07
				b = 24.2
				c = 40.37
				break
			case 11:
				// a = 0.2
				d = 16.1
				b = 48.4
				c = 80.7
				break
			case 12:
				// a = 0.3
				d = 32.3
				b = 96.9
				c = 161.5
				break
			case 13:
				// a = 0.54
				d = 64.6
				b = 193.8
				c = 322.9
				break
			case 14:
				// a = 0.7
				d = 129.1
				b = 387.6
				c = 645.9
				break
			case 15:
				// a = 0.9
				d = 258.3
				b = 775.2
				c = 1297.8
				break
			case 16:
				// a = 1
				d = 516.6
				b = 1550.4
				c = 2583.6
				break

			default:
				// a = 0.1
				d = 2
				b = 6
				c = 10
				break
		}
		return { b: b, c: c, d: d }
	}
	//在地图上渲染辖区
	getJurisdictionMap = (files) => {
		const { sourceJurisdiction, view, map, showJurisdictionVector } = this.state

		let arr = []
		sourceJurisdiction.clear()
		showJurisdictionVector.setSource(null)
		if (files) {
			console.log('11121212')
			if (files.own) {
				const clis = files.own[0]
				if (clis.label_gps_point && clis.label_gps_point.length) {
					const polygonFeature = new ol.Feature({
						geometry: new ol.geom.Polygon([ clis.label_gps_point ])
					})
					polygonFeature.setStyle(
						new ol.style.Style({
							// 设置选中时的样式
							stroke: new ol.style.Stroke({
								color: '#fba136',
								size: 3,
								width: 3
							}),
							fill: new ol.style.Fill({
								color: 'rgba(251,161,54, 0.2)'
							})
						})
					)

					polygonFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
					sourceJurisdiction.addFeature(polygonFeature)
					showJurisdictionVector.setSource(sourceJurisdiction)
				} else {
					message.error('未设置所属机构管辖范围')
					return false
				}

				for (let i = 0; i < clis.label_gps_point.length; i++) {
					//获取轨迹点位各点坐标
					arr.push(ol.proj.fromLonLat(clis.label_gps_point[i]))
				}

				let exent = ol.extent.boundingExtent(arr)
				let center = ol.extent.getCenter(exent)
				view.fit(exent)
				view.setCenter(center)
			}
		}
	}
	//在地图上渲染热力图
	getHeatMap = () => {
		const { sourceHeat, map, heatList, vectorHeat } = this.state
		console.log(this.state)
		let heatData = {
			type: 'FeatureCollection',
			features: []
		}
		sourceHeat.clear()
		vectorHeat.setSource(null)
		if (heatList && heatList.length) {
			for (let index = 0; index < heatList.length; index++) {
				const element = heatList[index]
				if (element.gps) {
					// let weightNum = Math.random()
					let weightNum = 0.6
					heatData.features.push({
						type: 'Feature',
						geometry: { type: 'Point', coordinates: this.transform(element.gps[0], element.gps[1]) },
						properties: { weight: weightNum }
					})
				}
			}
			var features = new ol.format.GeoJSON().readFeatures(heatData, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:3857'
			})
			sourceHeat.addFeatures(features)
			vectorHeat.setSource(sourceHeat)
		}
	}
	// 将警车图标渲染到地图
	getVehicleMap = (type, files) => {
		var _self = this
		// this.setState({ determine: 'edit' });
		let { view, map, draw, overlay, circle, vehicleGpsList, showCarVector, sourceCar } = this.state
		let arr = []
		let vehicleState = ''
		let pointFeature = null
		console.log(type)
		if (type) {
			this.state[files.vector].setSource(null)
			this.state[files.source].clear()
		} else {
			showCarVector.setSource(null)
			sourceCar.clear()
		}
		let lists = type ? files.list : vehicleGpsList

		if (lists) {
			if (lists.length) {
				for (var i = 0; i < lists.length; i++) {
					if (lists[i].gps_point) {
						//  console.log(lists[i])
						if (longrg.test(lists[i].gps_point[0]) && latreg.test(lists[i].gps_point[1])) {
							pointFeature = new ol.Feature({
								geometry: new ol.geom.Point(
									this.transform(lists[i].gps_point[0], lists[i].gps_point[1])
								),
								type: 'vehicle',
								layer: lists[i],
								gps: this.transform(lists[i].gps_point[0], lists[i].gps_point[1])
							})

							pointFeature.setStyle(
								new ol.style.Style({
									text: new ol.style.Text({
										textAlign: 'center', // 位置
										textBaseline: 'alphabetic', // 基准线
										// font: 'normal 12px 微软雅黑', // 文字样式
										font: 'normal ' + map.getView().getZoom() + 'px 微软雅黑',
										text: lists[i].vehicle_license_plate, // 文本内容
										// offsetX: '45',
										offsetY: map.getView().getZoom() - 23,
										fill: new ol.style.Fill({
											color: '#fff'
										}) // 文本填充样式（即文字颜色）
										// stroke: ison ? new ol.style.Stroke({
										//     color: colors,
										//     width: 1,
										// }) : '',
									}),
									image: new ol.style.Icon({
										anchor: type ? [ 0.5, 85 ] : [ 0.5, 75 ],
										anchorXUnits: 'fraction', //锚点X值单位(单位:分数)
										anchorYUnits: 'pixels',
										scale: map.getView().getZoom() / 20, // 图标缩放比例
										src: type
											? lists[i].vehicle_state == '0' ? files.imgsOn : files.imgs
											: lists[i].vehicle_state == '0' ? './image/clxq_1.png' : './image/clxq.png', // 图标的url
										offsetOrigin: 'top-center'
									})
								})
							)

							pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
							if (type) {
								_self.state[files.source].addFeature(pointFeature)
							} else {
								sourceCar.addFeature(pointFeature)
							}

							arr.push(ol.proj.fromLonLat(this.transform(lists[i].gps_point[0], lists[i].gps_point[1])))
						}
					}
				}
				if (type) {
					_self.state[files.vector].setSource(_self.state[files.source])
				} else {
					showCarVector.setSource(sourceCar)
				}

				if (!_self.state.isOneRender) {
					// console.log(arr)
					if (arr.length) {
						let exent = ol.extent.boundingExtent(arr)
						let center = ol.extent.getCenter(exent)
						view.fit(exent)
						view.setCenter(center)
						_self.setState({ isOneRender: true })
					}
				}
				if (type) {
					if (files.bool) {
						//设置中心点
						let exent = ol.extent.boundingExtent(arr)
						let center = ol.extent.getCenter(exent)
						view.fit(exent)
						view.setCenter(center)
					}
				}

				//  overlay.setPositioning("bottom-center");
			}
		}
	}

	//渲染各个点的公用方法
	getPiontMap = (files, bool, source, vector, imgs, type, gps) => {
		var _self = this
		let arr = []
		let { map, warnings, overlayWarning, view } = this.state
		this.state[vector].setSource(null)
		this.state[source].clear()
		if (files) {
			if (files.length) {
				for (var i = 0; i < files.length; i++) {
					if (files[i][gps]) {
						if (longrg.test(files[i][gps][0]) && latreg.test(files[i][gps][1])) {
							//  console.log(files[i])
							const pointFeature = new ol.Feature({
								geometry: new ol.geom.Point(this.transform(files[i][gps][0], files[i][gps][1])),
								type: type,
								layer: files[i],
								gps: this.transform(files[i][gps][0], files[i][gps][1])
							})
							pointFeature.setStyle(
								new ol.style.Style({
									image: new ol.style.Icon({
										scale: map.getView().getZoom() / 20, // 图标缩放比例
										src: imgs // 图标的url
									})
								})
							)
							pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
							this.state[source].addFeature(pointFeature)
							arr.push(ol.proj.fromLonLat(files[i][gps]))
						}
					}
				}
				this.state[vector].setSource(this.state[source])
				if (bool) {
					//设置中心点
					let exent = ol.extent.boundingExtent(arr)
					let center = ol.extent.getCenter(exent)
					view.fit(exent)
					view.setCenter(center)
				}
			}
		}
	}
	//检索详情
	checkSearchDetails = (files, type) => {
		// 警情: 1,警车: 2,卡口: 3,视频卡口: 4,
		// 重点场所: 5,警务站: 6,对讲机: 7,单兵设备: 8
		console.log(files, type, '搜索详情')
		if (type) {
			this.setState({ searchDetailsType: type })
		}
		if (files) {
			this.setState({ searchDetails: files })
		}
		let types = type || this.state.searchDetailsType
		if (types == '1') {
			this.policeDetailsMap(
				files || this.state.searchDetails,
				files ? true : false,
				'sourceSearchBar',
				'overlaySearchBar',
				'showSearchBarVector',
				'searchBar'
			)
		} else if (types == '2') {
			this.getVehicleMap(true, {
				list: [ files || this.state.searchDetails ],
				bool: files ? true : false,
				source: 'sourceSearchBar',
				vector: 'showSearchBarVector',
				imgs: './image/xzcll.png',
				imgsOn: './image/xzcllon.png'
			})
		} else if (types == '3') {
			this.getPiontMap(
				[ files || this.state.searchDetails ],
				files ? true : false,
				'sourceSearchBar',
				'showSearchBarVector',
				'./image/xzkk.png',
				'sourceSwan',
				'gps'
			)
		} else if (types == '4') {
			this.getPiontMap(
				[ files || this.state.searchDetails ],
				files ? true : false,
				'sourceSearchBar',
				'showSearchBarVector',
				'./image/xzspjk.png',
				'monitoring',
				'gps'
			)
		} else if (types == '5') {
			this.getPiontMap(
				[ files || this.state.searchDetails ],
				files ? true : false,
				'sourceSearchBar',
				'showSearchBarVector',
				'./image/xzzdcs.png',
				'keyPlace',
				'gps'
			)
		} else if (types == '6') {
			this.getPiontMap(
				[ files || this.state.searchDetails ],
				files ? true : false,
				'sourceSearchBar',
				'showSearchBarVector',
				'./image/xzjwz.png',
				'policeStation',
				'gps'
			)
		} else if (types == '7') {
			this.getPiontMap(
				[ files || this.state.searchDetails ],
				files ? true : false,
				'sourceSearchBar',
				'showSearchBarVector',
				'./image/xzdjj.png',
				'intercom',
				'gps_point'
			)
		} else if (types == '8') {
			this.getPiontMap(
				[ files || this.state.searchDetails ],
				files ? true : false,
				'sourceSearchBar',
				'showSearchBarVector',
				'./image/xzyddb.png',
				'individual',
				'gps_point'
			)
		}
	}
	//关闭检索详情
	closeSearchDetails = () => {
		console.log(88888888888)
		const {
			map,
			view,
			sourceSearchBar,
			showSearchBarVector,
			searchBar,
			overlaySearchBar,
			searchDetails
		} = this.state
		var arr = []
		sourceSearchBar.clear()
		showSearchBarVector.setSource(null)
		this.setState({ searchDetails: {}, searchDetailsType: '' })
		searchBar.innerHTML = ''
		overlaySearchBar.setPosition(undefined)
	}
	//警情详情
	checkPoliceDetails = (files) => {
		if (files) {
			this.setState({ policeDetails: files })
		}
		this.policeDetailsMap(
			files || this.state.policeDetails,
			files ? true : false,
			'sourcePoliceDetails',
			'overlayWarning',
			'showPoliceDetailsVector',
			'warnings'
		)
	}
	//在地图上渲染轨迹
	getTrajectoryMap = (files) => {
		var _self = this
		console.log('画轨迹==', files)
		const { view, map, sourceTrajectory, showTrajectoryVector } = this.state
		const arr = []
		const location = []
		var geometry = new ol.geom.LineString()
		showTrajectoryVector.setSource(null)
		sourceTrajectory.clear()
		if (files.length) {
			for (let i = 0; i < files.length; i++) {
				if (files[i] && files[i].gps_point) {
					if (longrg.test(files[i].gps_point[0]) && latreg.test(files[i].gps_point[1])) {
						location.push(this.transform(files[i].gps_point[0], files[i].gps_point[1]))
						// console.log('===', location)
					}
				}
			}
			// console.log('---', location)
			if (location.length) {
				const lineFeature = new ol.Feature(new ol.geom.LineString(location))
				lineFeature.setStyle(
					new ol.style.Style({
						// 设置选中时的样式
						stroke: new ol.style.Stroke({
							color: '#FF6666FF',
							size: 4,
							width: 4
						})
					})
				)
				lineFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')

				sourceTrajectory.addFeature(lineFeature)

				showTrajectoryVector.setSource(sourceTrajectory)
				for (let i = 0; i < location.length; i++) {
					//获取轨迹点位各点坐标
					arr.push(ol.proj.fromLonLat(location[i]))
				}

				let exent = ol.extent.boundingExtent(arr)
				let center = ol.extent.getCenter(exent)
				view.fit(exent)
				view.setCenter(center)
			}

			// var mapClick = map.on(
			// 	'click',
			// 	function(evt) {
			// 		showTrajectoryVector.setSource(null)
			// 		sourceTrajectory.clear()
			// 		ol.Observable.unByKey(mapClick)
			// 		// _self.setState({ showVehicleDetails: false })
			// 	}.bind(this)
			// )
		}
	}

	//渲染警情详情再地图上
	policeDetailsMap = (files, type, source, overlay, vector, warnings) => {
		console.log(files, '警情详情')
		var _self = this
		const { map, view, sourcePoliceDetails, overlayWarning, showPoliceDetailsVector, policeDetails } = this.state
		var arr = []
		this.state[source].clear()
		this.state[vector].setSource(null)

		if (files) {
			if (files.xzb && files.yzb) {
				if (longrg.test(files.xzb) && latreg.test(files.yzb)) {
					const pointFeaturea = new ol.Feature({
						geometry: new ol.geom.Point([ Number(files.xzb), Number(files.yzb) ])
					})
					const pointFeature = new ol.Feature({
						geometry: new ol.geom.Point([ Number(files.xzb), Number(files.yzb) ])
					})
					const pointFeatured = new ol.Feature({
						geometry: new ol.geom.Point([ Number(files.xzb), Number(files.yzb) ]),
						type: 'showAlert',
						layer: files,
						gps: [ Number(files.xzb), Number(files.yzb) ]
					})
					const pointFeatureT = new ol.Feature({
						geometry: new ol.geom.Point([ Number(files.xzb), Number(files.yzb) ]),
						type: 'showAlert',
						layer: files,
						gps: [ Number(files.xzb), Number(files.yzb) ]
					})
					pointFeatureT.setStyle(
						new ol.style.Style({
							image: new ol.style.Icon({
								scale: map.getView().getZoom() / 15, // 图标缩放比例
								src: './image/jq_1.png' // 图标的url
							})
						})
					)
					pointFeatured.setStyle(
						new ol.style.Style({
							image: new ol.style.Circle({
								radius: this.warningStyles().d,
								fill: new ol.style.Fill({
									color: 'rgba(255,0,0, 0.6)'
								}),
								stroke: new ol.style.Stroke({
									color: 'rgba(255, 0, 0, 0.6)'
									// width: map.getView().getZoom()*3,
								})
							})
						})
					)
					pointFeature.setStyle(
						new ol.style.Style({
							image: new ol.style.Circle({
								radius: this.warningStyles().b,
								fill: new ol.style.Fill({
									color: 'rgba(255,0,0, 0.4)'
								}),
								stroke: new ol.style.Stroke({
									color: 'rgba(255, 0, 0, 0.4)'
									// width: map.getView().getZoom()*3,
								})
							})
						})
					)
					pointFeaturea.setStyle(
						new ol.style.Style({
							image: new ol.style.Circle({
								radius: this.warningStyles().c,
								fill: new ol.style.Fill({
									color: 'rgba(255,0,0, 0.2)'
								}),
								stroke: new ol.style.Stroke({
									color: 'rgba(255, 0, 0, 0.2)'
									// width: map.getView().getZoom()*5,
								})
							})
						})
					)
					pointFeatured.getGeometry().transform('EPSG:4326', 'EPSG:3857')
					pointFeaturea.getGeometry().transform('EPSG:4326', 'EPSG:3857')
					pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
					pointFeatureT.getGeometry().transform('EPSG:4326', 'EPSG:3857')

					_self.state[source].addFeature(pointFeaturea)
					_self.state[source].addFeature(pointFeatured)
					_self.state[source].addFeature(pointFeature)
					_self.state[source].addFeature(pointFeatureT)
					_self.setState({
						pointFeaturea,
						pointFeature,
						pointFeatureT
					})
					_self.state[overlay].setPosition(ol.proj.fromLonLat([ Number(files.xzb), Number(files.yzb) ]))
					_self.warningRender(files, _self.state[warnings])
				}
			}
			_self.state[vector].setSource(_self.state[source])

			if (type) {
				if (files.xzb && files.yzb) {
					arr.push(ol.proj.fromLonLat([ Number(files.xzb), Number(files.yzb) ]))

					//设置中心点
					let exent = ol.extent.boundingExtent(arr)
					let center = ol.extent.getCenter(exent)

					view.fit(exent)
					view.setZoom(13)
					view.setCenter(center)
				}
			}
		}
	}
	//关闭接处警详情
	closePoliceDetails = () => {
		console.log(88888888888)
		const {
			map,
			view,
			warnings,
			overlayWarning,
			sourcePoliceDetails,
			showPoliceDetailsVector,
			policeDetails
		} = this.state
		var arr = []
		sourcePoliceDetails.clear()
		showPoliceDetailsVector.setSource(null)
		this.setState({ policeDetails: {} })
		warnings.innerHTML = ''
		overlayWarning.setPosition(undefined)
	}
	//预警详情
	checkAlarmDetails = (files) => {
		console.log(files, '预警详情')
		// if(files.alarm_type == 0 || files.alarm_type == 1 || files.alarm_type == 5){
		this.setState({ showAlarmDetails: true, alarmType: files.alarm_type, alarmDetails: files.alarm_message })
		// }
	}
	closeAlarmDetails = () => {
		this.setState({ alarmType: null, alarmDetails: {}, showAlarmDetails: false })
	}
	//视频和轨迹按钮构造函数
	addFeatrueInfo = (info) => {
		var _self = this
		const { content, showTrajectory } = this.state
		content.innerHTML = ''
		var bodyA = document.createElement('div')
		bodyA.className = 'contentBody'
		content.appendChild(bodyA)
		var elementA = document.createElement('div')
		elementA.className = 'markerTrajectory'
		elementA.id = 'markerTrajectory'
		var elementB = document.createElement('div')
		elementB.className = 'markerVideo'
		elementB.id = 'markerVideo'
		bodyA.appendChild(elementA)
		bodyA.appendChild(elementB)
		var elementImg = document.createElement('img')
		elementImg.src = './image/gj_icon.png'
		elementA.appendChild(elementImg)
		var elementVideoImg = document.createElement('img')
		elementVideoImg.src = './image/video_icon2.png'
		elementB.appendChild(elementVideoImg)
		var spanA = document.createElement('span')
		if (showTrajectory) {
			spanA.innerText = '隐藏轨迹'
		} else {
			spanA.innerText = '轨迹'
		}
		elementA.appendChild(spanA)
		var spanB = document.createElement('span')
		spanB.innerText = '视频'
		elementB.appendChild(spanB)
		this.setState({ mapClik: true })
		var markerTrajectory = document.getElementById('markerTrajectory')
		var colseVideo = document.getElementById('colseVideo')
		var markerVideo = document.getElementById('markerVideo')
		if (markerVideo) {
			markerTrajectory.onclick = () => {
				console.log('yincan----------------')
				if (_self.state.showTrajectory) {
					console.log('yincan----------------')
					_self.setState({ showTrajectory: false }, () => {
						_self.addFeatrueInfo(info)
						_self.state.showTrajectoryVector.setSource(null)
						_self.state.sourceTrajectory.clear()
					})
				} else {
					_self.props.dispatch({
						type: 'home/getVehicleTrajectory',
						payload: {
							endTime: '',
							ifDay: '1',
							startTime: '',
							vehicle_id: info.vehicle_id
						},
						success: (e) => {
							console.log(e)
							if (e.result.reason.code == '200') {
								if (e.result.list) {
									if (e.result.list.length) {
										_self.setState({ showTrajectory: true }, () => {
											_self.addFeatrueInfo(info)
											_self.getTrajectoryMap(e.result.list)
										})
									} else {
										message.error('暂无轨迹')
										return false
									}
								}
							} else {
								return false
							}
						}
					})
				}
			}
			markerVideo.onclick = () => {
				console.log('视频')
				if (info.vehicle_state == 1) {
					// content.innerHTML = ''
					_self.setState({
						showVideo: true,
						videoInfor: info.device_message || []
					})
				} else {
					message.error('该车为离线状态，无在线设备！')
					return false
				}
			}
		}
	}
	//警情信息构造函数
	warningRender = (files, warnings) => {
		console.log(files)
		warnings.innerHTML = ''
		var body = document.createElement('div')
		body.className = 'warningBody'
		body.style.backgroundImage = "url('./image/jqbj.png')"
		warnings.appendChild(body)
		var elementA = document.createElement('div')
		elementA.className = 'item'
		body.appendChild(elementA)
		var spanB = document.createElement('div')
		spanB.className = 'itemTitle'
		spanB.innerText = files.bjlxmc
		elementA.appendChild(spanB)
		var elementA = document.createElement('div')
		elementA.className = 'item'
		body.appendChild(elementA)
		var spanA = document.createElement('div')
		spanA.className = 'title'
		spanA.innerText = '警情编号 ：'
		elementA.appendChild(spanA)
		var spanB = document.createElement('div')
		spanB.className = 'text'
		spanB.innerText = files.jqbh
		elementA.appendChild(spanB)
		var elementA = document.createElement('div')
		elementA.className = 'item'
		body.appendChild(elementA)
		var spanA = document.createElement('div')
		spanA.className = 'title'
		spanA.innerText = '报案时间 ：'
		elementA.appendChild(spanA)
		var spanB = document.createElement('div')
		spanB.className = 'text'
		spanB.innerText = files.afsj
		elementA.appendChild(spanB)
		var elementA = document.createElement('div')
		elementA.className = 'item'
		body.appendChild(elementA)
		var spanA = document.createElement('div')
		spanA.className = 'title'
		spanA.innerText = '警情地点 ：'
		elementA.appendChild(spanA)
		var spanB = document.createElement('div')
		spanB.className = 'text'
		spanB.innerText = files.afdd
		elementA.appendChild(spanB)
		var elementA = document.createElement('div')
		elementA.className = 'item'
		body.appendChild(elementA)
		var spanA = document.createElement('div')
		spanA.className = 'title'
		spanA.innerText = '报警电话 ：'
		elementA.appendChild(spanA)
		var spanB = document.createElement('div')
		spanB.className = 'text'
		spanB.innerText = files.bjrxm + '-' + files.lxdh
		elementA.appendChild(spanB)
		var elementA = document.createElement('div')
		elementA.className = 'item'
		body.appendChild(elementA)
		var spanA = document.createElement('div')
		spanA.className = 'title'
		spanA.innerText = '警情类别 ：'
		elementA.appendChild(spanA)
		var spanB = document.createElement('div')
		spanB.className = 'text'
		spanB.innerText =
			files.bjlbmc +
			`${files.bjlxmc == null ? '' : `-${files.bjlxmc}`}` +
			`${files.bjxlmc == null ? '' : `-${files.bjxlmc}`}`
		elementA.appendChild(spanB)
		var elementA = document.createElement('div')
		elementA.className = 'item'
		body.appendChild(elementA)
		var spanA = document.createElement('div')
		spanA.className = 'title'
		spanA.innerText = '报警单位 ：'
		elementA.appendChild(spanA)
		var spanB = document.createElement('div')
		spanB.className = 'text'
		spanB.innerText = files.jjdwmc
		elementA.appendChild(spanB)
		var elementA = document.createElement('div')
		elementA.className = 'item'
		body.appendChild(elementA)
		var spanA = document.createElement('div')
		spanA.className = 'title'
		spanA.innerText = '报警内容 ：'
		elementA.appendChild(spanA)
		var spanB = document.createElement('div')
		spanB.className = 'text'
		spanB.innerText = files.bjnr
		elementA.appendChild(spanB)
		body.appendChild(elementA)
	}
	closeLiveVideo = () => {
		this.setState({ showVideo: false, videoInfor: [] })
	}
	render() {
		const { screen: {}, loading } = this.props
		const {} = this.state
		return (
			<div className={styles.screen}>
				<div className={styles.main}>
					<div className={styles.calendar}>
						<div id="map" className={styles.mapScreenStyle}>
							<div id="popup" className={styles.olpopup}>
								<div id="popup-content" />
							</div>
							<div id="warnings" className={styles.olpopup}>
								<div id="warnings-content" />
							</div>
							<div id="searchBar" className={styles.olpopup}>
								<div id="searchBar-content" />
							</div>
						</div>
					</div>
					<div className={styles.leftMune}>
						<div className={styles.content}>
							<Statistical
								schedules={this.state.schedules}
								vehicleStatusList={this.state.vehicleStatusList}
								vehicleState={this.state.vehicleState}
								vehicleDetailInfor={this.state.vehicleDetailInfor}
							/>
							{/* {this.state.vehicleState ? <LeaderDuty vehicleState={this.state.vehicleState} /> : < WarningSituation/>} */}
                            {this.state.vehicleState ? <LeaderDuty vehicleState={this.state.vehicleState} /> : null}
							<Called
								checkPoliceDetails={(e) => this.checkPoliceDetails(e)}
								policeAlarmCounts={
									this.state.vehicleState ? this.props.screen.alarmList : this.state.policeAlarmCounts
								}
								ref={(el) => (this.called = el)}
								vehicleState={this.state.vehicleState}
								vehicleid={this.state.vehicleid}
								gxdwdm={this.state.gxdwdm}
								closePoliceDetails={() => this.closePoliceDetails()}
							/>
						</div>
					</div>
					<div className={styles.rightMune}>
						<div className={styles.content}>
							<TodayCheck
								comparisonList={
									this.state.vehicleState ? (
										this.state.vehicleComparisonList
									) : (
										this.state.comparisonList
									)
								}
							/>
							{/*  */}
							{this.state.vehicleState ? (
								<Equipment />
							) : (
								<WarningList
									alarmList={this.state.alarmList}
									checkAlarmDetails={(e) => this.checkAlarmDetails(e)}
								/>
							)}
						</div>
					</div>
					{!this.state.vehicleState ? (
						<SearchEngine
							checkSearchDetails={(e, g) => this.checkSearchDetails(e, g)}
							resetRender={() => this.closeSearchDetails()}
						/>
					) : null}
					{!this.state.vehicleState ? <SwitchList getData={(e) => this.statesChange(e)} /> : null}

					{this.state.vehicleState ? (
						<div
							className={styles.backGlobal}
							onClick={() => {
								const { content, warnings } = this.state
								content.innerHTML = ''
								// warnings.innerHTML = ''
								this.setState({ vehicleState: false, showTrajectory: false, vehicleid: '' })
								// this.checkPoliceDetails()
								this.state.showTrajectoryVector.setSource(null)
								this.state.sourceTrajectory.clear()
								this.closePoliceDetails()
							}}
						>
							<img src="./image/left.png" alt="" />
							<span>返回全局</span>
						</div>
					) : null}
					{console.log(this.state.alarmType)}
					{this.state.showAlarmDetails ? (
						<div>
							{this.state.alarmType == 0 ? (
								<WarningDetails
									files={this.state.alarmDetails}
									closes={() => this.closeAlarmDetails()}
								/>
							) : null}
							{this.state.alarmType == 5 ? (
								<WarningDetails
									files={this.state.alarmDetails}
									closes={() => this.closeAlarmDetails()}
								/>
							) : null}
							{this.state.alarmType == 1 ? (
								<VehicleDetail
									files={this.state.alarmDetails}
									closes={() => this.closeAlarmDetails()}
								/>
							) : null}
							{this.state.alarmType == 7 ? (
								<Patrolwarning
									files={this.state.alarmDetails}
									closes={() => this.closeAlarmDetails()}
								/>
							) : null}
							{this.state.alarmType == 4 ? (
								<TrafficWarning
									files={this.state.alarmDetails}
									closes={() => this.closeAlarmDetails()}
								/>
							) : null}
							{this.state.alarmType == 2 ? (
								<WrittenWarning
									files={this.state.alarmDetails}
									closes={() => this.closeAlarmDetails()}
								/>
							) : null}
						</div>
					) : null}
				</div>
				<Modal
					title="视频直播"
					visible={this.state.showVideo}
					onCancel={this.closeLiveVideo}
					//   onOk={this.handleOk}
					//   okText="关闭"
					footer={null}
					width="950px"
					id="player"
					className={styles.modals}
					maskClosable={false}
					centered={true}
				>
					{this.state.showVideo ? (
						<VideoPlayer
							ref="childVideo"
							src={this.state.videoInfor && this.state.videoInfor.length && this.state.videoInfor[0].mldz}
							deviceMessage={this.state.videoInfor}
							videoName={
								this.state.videoInfor &&
								this.state.videoInfor.length &&
								this.state.videoInfor[0].device_name
							}
							showVideo={this.state.showVideo}
						/>
					) : null}
				</Modal>
			</div>
		)
	}
}

export default Form.create()(screen)
