import React, { Component } from 'react'
// import Gif from 'react-gif'
// import videojs from 'video.js';
// import 'video.js/dist/video-js.min.css';
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
// import 'react-calendar/dist/entry.nostyle';
import styles from './index.less'
import icon1 from '@/assets/1.png'
import dateImg from '@/assets/date.png'
import onlineCar from '@/assets/onlineCar.png'
import outlineCar from '@/assets/outlineCar.png'
import positioningIcon from '@/assets/positioning.png'
import positioningIconOut from '@/assets/positioning_1.png'
import videoIcon from '@/assets/video.png'
import posicon from '@/assets/posicon.png'
import posicon_1 from '@/assets/posicon.gif'
import VideoPlayer from '@/components/VideoPlayer/VideoPlayer'
// import Player from 'griffith'
import webSocketClient from '@/components/websocket/webSocketService'
import WarningDetails from '@/components/WarningDetails'
import Warningplace from '@/components/Warningplace'
const { configUrl } = window

var latreg = /^(\-|\+)?([0-8]?\d{1}\.\d{0,15}|90\.0{0,15}|[0-8]?\d{1}|90)$/
var longrg = /^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,15})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,15}|180)$/
let num = []
// import { subscribe } from 'mqtt-react';
import { connect as mqttConnect } from 'mqtt'
var mapClick = null
import {
	initView,
	offlineMapLayer,
	initShowVectorP,
	initShowVector,
	highlightCarLocationStyle,
	bayonetVector,
	intercomVector,
	carVector,
	carStyles,
	monitoringStyles,
	trajectoryVector,
	waringVector,
	placeVector,
	monitoringVector,
	individualVector,
	initShowStationVector
} from '@/utils/olUtils'
import { setInterval } from 'timers'
let monitoringList = [],
	bayonetList = [], //卡口信息
	placeList = [], //重点场所信息
	stationList = [] //警务站信息
@connect(({ home, loading, screen }) => ({
	home,
	screen,
	loading: loading.models.home
}))
class Home extends Component {
	constructor(props) {
		super(props)

		this.client = mqttConnect(window.configUrl.mqttUrl)
		this.client.on('connect', this.connect)
		this.client.on('message', this.message)
		this.wc = null
		// this.localClient = mqttConnect(window.configUrl.localhostMqttUrl);
		// this.localClient.on('connect', this.localConnect);
		// this.localClient.on('message', this.localMessage);
	}

	state = {
		map: null,
		view: null,
		vector: null,
		showVector: null,
		showVectorP: null,
		showBayonetVector: null,
		sourceHeat: null,
		showIndividualVector: null,
		showMonitoringVector: null,
		showStationVector: null,
		sourceStation: null,
		vectorHeat: null,
		pointFeature: null,
		sourceBayonet: null,
		sourceIntercom: null,
		showIntercomVector: null,
		overlayWarning: null,
		sourcePlace: null,
		showPlaceVector: null,
		showTrajectoryVector: null,
		showWaringVector: null,
		showCarVector: null,
		overlay: null,
		densityOverlay: null,
		select: null,
		sourceCar: null,
		sourceTrajectory: null,
		content: null,
		warnings: null,
		densityContent: null,
		selectFeature: null,
		sourceWarning: null,
		sourceIndividual: null,
		sourceMonitoring: null,
		showCar: true, //显示车辆
		showIntercom: false, //对讲机
		showCamera: false, //显示卡口
		showMonitoring: false, //显示视频监控
		showIndividual: false, //显示移动单兵设备
		showPlace: false, //显示重点场所
		showHeat: false, //显示热力图
		showEncirclement: false, //显示一三五包围圈
		showPoliceStation: false, //显示警务站
		showSwanVideo: false, //显示卡口视频
		swanVideoList: [], //卡口视频地址
		showAccording: false,
		showVoice: false,
		showVideo: false,
		showAdd: false,
		showPase: false,
		showPositioning: false,
		showSignal: false,
		showMore: false,
		showOfficerDetails: false,
		showVehicleDetails: false,
		isOneRender: false,

		individualList: [], //移动单兵设备信息
		// monitoringList: [], //视频监控信息
		// monitoringListAll:[],
		comparisonList: [], //核查信息
		intercomList: [], //对讲信息

		schedules: {}, //勤务信息

		vehicleGpsList: [], //车辆信息
		vehicleStatusList: [], //车辆考勤信息
		comparisonMessage: [], //根据车辆查询核查信息
		deviceMessage: [], //根据车辆查询设备信息
		policeAlarmCounts: {}, //接处警
		policeAlarm: [], //预警信息
		heatAlarmList: [], //警情热力图
		zoomItem: [],
		warningInfor: {}, //预警信息
		isWarning: false,
		showWarning: false,
		showCarWarning: false,
		mapClik: false,
		abnormalPeoples: [], //异常人员合集
		abnormalVehicles: [], //异常车辆合集
		pointFeaturea: null,
		pointFeature: null,
		pointFeatureT: null,
		videoInfor: {},
		moreEquipment: false,
		setLeft: 0, //警员信息位置
		upDown: 'up', //警员信息左右切换开关
		isds: false
	}
	connect = () => {
		const topic = 'Ret/backstage/alarm/#'
		this.client.subscribe(topic)
	}
	message = (topic, res) => {
		const vehicleGpsList = this.state.vehicleGpsList
		const monitoringList = this.state.monitoringList
		const info = JSON.parse(res.toString())
		const topics = topic.substring(topic.lastIndexOf('/') + 1)
		// const abnormalPeoples = this.state.abnormalPeoples
		const { showMonitoring, abnormalPeoples } = this.state
		// console.log('MQTT接收到info', info, topics)
		// this.setState({warningInfor: info})
		if (info.type == 0) {
			if (vehicleGpsList.length) {
				for (var i = 0; i < vehicleGpsList.length; i++) {
					// console.log(topics, vehicleGpsList[i].pad_cid)
					if (topics == vehicleGpsList[i].pad_cid) {
						this.setState({ mapClik: true })
						// this.state.content.innerHTML = ''
						// this.captureWarning(info,'展开','./image/zhankai.png')
						num = vehicleGpsList[i].gps_point
						abnormalPeoples.push({
							...info,
							topics: topics
						})
						this.setState({
							abnormalPeoples: abnormalPeoples
						})
						var conPeo = document.getElementById(`${'conPeo'}${vehicleGpsList[i].pad_cid}`)
						// console.log(conPeo)
						this.sss(info, '查看', './image/zhankai.png', conPeo, topics)
						// this.state.overlay.setPosition(new ol.proj.transform(vehicleGpsList[i].gps_point, 'EPSG:4326', 'EPSG:3857'));
					}
				}
			}
		} else if (info.type == 1) {
			if (vehicleGpsList.length) {
				for (var i = 0; i < vehicleGpsList.length; i++) {
					if (topics == vehicleGpsList[i].pad_cid) {
						this.setState({ mapClik: true })
						// this.setState({warningInfor: info.show, showCarWarning:true});
						this.state.content.innerHTML = ''
						this.captureWarning(info, '展开', './image/zhankai.png')
						num = vehicleGpsList[i].gps_point
						var conPeo = document.getElementById(`${'conPeo'}${vehicleGpsList[i].pad_cid}`)
						this.sss(info, '展开', './image/zhankai.png', conPeo, topics)
						// this.state.overlay.setPosition(new ol.proj.transform(vehicleGpsList[i].gps_point, 'EPSG:4326', 'EPSG:3857'));
					}
				}
			}
		}
        // else if (info.type == 4) {
		// 	// console.log('人流密度')
		// 	if (showMonitoring) {
		// 		if (monitoringList.length) {
		// 			for (var i = 0; i < monitoringList.length; i++) {
		// 				if (topics == monitoringList[i].bayonet_id) {
		// 					var density = document.getElementById(`${'density'}${monitoringList[i].bayonet_id}`)
		// 					this.addDensityInfo(info, density, monitoringList[i].kkmc)
		// 				}
		// 			}
		// 		}
		// 	}
		// } else if (info.type == 5) {
		// 	// console.log('重点目标')
		// 	if (showMonitoring) {
		// 		if (monitoringList.length) {
		// 			for (var i = 0; i < monitoringList.length; i++) {
		// 				if (topics == monitoringList[i].bayonet_id) {
		// 					var personnel = document.getElementById(`${'personnel'}${monitoringList[i].bayonet_id}`)
		// 					this.addPersonnelInfo(info, personnel, monitoringList[i].kkmc)
		// 				}
		// 			}
		// 		}
		// 	}
		// }
	}
	componentDidMount() {
		// 初始化地图
		this.initMap()
		this.equipmentType()
		const _self = this
		this.wc = new webSocketClient({
			url: window.configUrl.websocketUrl,
			globalParams: {
				token: sessionStorage.getItem('userToken'),
				government: JSON.parse(sessionStorage.getItem('groupListCode'))
			},
			heartbeatInterval: window.configUrl.heartbeatInterva, //心跳时间
			messageCallback: (files) => {
				console.log('收到信息===', files)

				_self.setState(
					{
						// bayonetList: files.bayonetList || [],
						comparisonList: files.comparisonList || [],
						intercomList: files.intercomList || [],
						// placeList: files.keyPlaceList || [],
						individualList: files.individualEquipmentList || [],
						// monitoringList: files.videoList || [],
						schedules: files.schedules || {},
						vehicleGpsList: files.vehicleGpsList || [],
						vehicleStatusList: files.vehicleStatusList || [],
						policeAlarmCounts: files.policeAlarmCounts || {},
						policeAlarm: files.policeAlarm || [],
						heatAlarmList: files.policeAlarmList || []
						// stationList: files.policeStationList || []
					},
					() => {
						if (_self.state.showCar) {
							_self.showReportLocation()
						}
						if (_self.state.showIntercom) {
							_self.intercomPoint()
						}
						// if (_self.state.showCamera) {
						// 	_self.bayonetPoint()
						// }
						// if (_self.state.showPlace) {
						// 	_self.placePoint()
						// }

						if (_self.state.showIndividual) {
							_self.individualPoint()
						}
						// if (_self.state.showMonitoring) {
						// 	_self.monitoringPoint()
						// }
						if (_self.state.showHeat) {
							_self.getHeatMap()
						}
						if (_self.state.showEncirclement) {
							_self.showWarningFun()
						}
						// if (_self.state.showPoliceStation) {
						// 	_self.showStationFun()
						// }
					}
				)
			},

			// errorCallback: (err) => console.log(err),
			closeCallback: (msg) => {
				// console.log(msg)
				this.wc.close()
			},
			//连接成功后
			openCallback: () => {
				// console.log('websocket链接已启动')
				this.wc.send({
					// "projectCode": port.webSocket.projectCode,
					token: sessionStorage.getItem('userToken')
				})
			}
		})
	}
	componentWillUnmount() {
		// console.log(this.wc&&this.wc.wsObject)
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
			type: 'home/policeQuery',
			payload: { code: window.configUrl.dictionariesEquipmentType }
		})
	}
	clickfu = () => {}
	//地图
	initMap = () => {
		let draw, circle // 绘制对象
		var _self = this
		const { mapClik, pointFeaturea, pointFeature, pointFeatureT } = this.state
		// 创建地图
		const view = initView()
		// 创建一个比例尺控件
		const scaleLineControl = new ol.control.ScaleLine({
			units: 'metric' // 比例尺默认的单位
		})
		// 指定地图要显示在id为map的div中
		const map = new ol.Map({
			view,
			loadTilesWhileAnimating: true,
			target: 'map',
			controls: ol.control.defaults({ attribution: false }).extend(
				new ol.control.ScaleLine({
					units: 'metric' // 比例尺默认的单位
				})
			),
			interactions: ol.interaction.defaults({
				mouseWheelZoom: true, // 取消滚动鼠标中间的滑轮交互
				doubleClickZoom: false // 取消双击放大功能交互
			})
		})
		map.addLayer(offlineMapLayer()) // 将地图加载上来

		// 实例化一个矢量图层Vector作为绘制层
		const source = new ol.source.Vector({})
		const sourceBayonet = new ol.source.Vector({})
		const sourceIntercom = new ol.source.Vector({})
		const sourceCar = new ol.source.Vector({})
		const sourceTrajectory = new ol.source.Vector({})
		const sourceWarning = new ol.source.Vector({})
		const sourceStation = new ol.source.Vector({})
		const sourcePlace = new ol.source.Vector({})
		const sourceIndividual = new ol.source.Vector({})
		const sourceMonitoring = new ol.source.Vector({})
		const sourceHeat = new ol.source.Vector({})
		const vectorHeat = new ol.layer.Heatmap({
			source: sourceHeat,
			blur: parseInt(22, 10),
			radius: parseInt(18, 15),
			gradient: [ '#04fbb2', '#18fb04', '#fbd804', '#f94000', '#b30303' ] //颜色
		})
		const vector = new ol.layer.Vector({
			source,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: 'rgba(224,156,25, 0.2)'
				}),
				stroke: new ol.style.Stroke({
					color: 'red',
					width: 10
				}),
				image: new ol.style.Circle({
					radius: 6,
					fill: new ol.style.Fill({
						color: '#FF0000'
					})
				})
			})
		})
		map.addLayer(vector) // 将绘制层添加到地图容器中

		var warningBody = document.getElementById('warnings')
		var warnings = document.getElementById('warnings-content')

		var container = document.getElementById('popup')
		var content = document.getElementById('popup-content')
		var closer = document.getElementById('popup-closer')
		// 创建一个overlay, 绑定html元素container
		var overlay = new ol.Overlay(
			/** @type {olx.OverlayOptions} */ {
				element: container,
				autoPan: true,
				positioning: 'right-center',
				stopEvent: false,
				autoPanAnimation: {
					duration: 250
				}
			}
		)
		map.addOverlay(overlay)
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
		map.addOverlay(overlayWarning)
		// _self.warningRender(warnings)

		map.on('singleclick', (e) => {})
		//为地图容器添加单击事件监听
		map.on('click', function(evt) {
			if (_self.state.selectFeature) {
			}
			let point = evt.coordinate //鼠标单击点坐标
			// console.log(point,'地图坐标点')
			//判断当前单击处是否有要素，捕获到要素时弹出popup
			var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
				return feature
			})
			if (feature) {
				console.log('---', feature.get('type'))
				// console.log('gps点信息',feature.get('gps'))

				if (feature.get('type') == 'car') {
					_self.addFeatrueInfo(feature.get('information'))
					_self.setState({
						showVehicleDetails: true,
						comparisonMessage: feature.get('information').comparison_message,
						deviceMessage: feature.get('information').device_message,
						mapClik: true
					})
					_self.getDetailById(feature.get('information'))

					overlay.setPosition(point)
					var markerTrajectory = document.getElementById('markerTrajectory')
					var colseVideo = document.getElementById('colseVideo')
					var markerVideo = document.getElementById('markerVideo')
					if (markerVideo) {
						markerTrajectory.onclick = () => {
							// console.log('轨迹====')
							_self.props.dispatch({
								type: 'home/getVehicleTrajectory',
								payload: {
									endTime: '',
									ifDay: '1',
									startTime: '',
									vehicle_id: markerTrajectory.getAttribute('type')
								},
								success: (e) => {
									console.log('轨迹====', e)
									if (e.result.reason.code == '200') {
										_self.drawTrajectory(e.result.list)
									} else {
										return false
									}
								}
							})
						}
						markerVideo.onclick = () => {
							// getPlayUrl
							// console.log('视频')
							if (feature.get('information').vehicle_state == 1) {
								// content.innerHTML = ''
								_self.setState({
									showVideo: true,
									mapClik: true,
									videoInfor: JSON.parse(markerVideo.getAttribute('info'))
								})
								// _self.addFeatrueInfo(JSON.parse(markerVideo.getAttribute('info')))
							} else {
								message.error('该车为离线状态，无在线设备！')
								return false
							}
						}
					}
					if (colseVideo) {
					}
				} else if (feature.get('type') == 'bayone') {
					// console.log('卡口', feature.get('kkbfmldz'))
					if (window.configUrl.iStreet) {
						let swanVideoList = []
						swanVideoList.push({
							mldz: feature.get('kkbfmldz'),
							device_name: '卡口'
						})
						_self.setState({
							showSwanVideo: true,
							swanVideoList: swanVideoList
						})
					}
				} else if (feature.get('type') == 'jingwuzhan') {
					// console.log('警务站', feature.get('kkbfmldz'))
					if (window.configUrl.iStreet) {
						let swanVideoList = []
						swanVideoList.push({
							mldz: feature.get('kkbfmldz'),
							device_name: '警务站'
						})
						_self.setState({
							showSwanVideo: true,
							swanVideoList: swanVideoList
						})
					}
				} else if (feature.get('type') == 'jiankong') {
					// console.log('监控', feature.get('kkbfmldz'))
					if (window.configUrl.iStreet) {
						_self.props.dispatch({
							type: 'home/getPlayUrl',
							payload: {
								cameraIndexCode: feature.get('layer').kkdm,
								subStream: '0',
								protocol: '1'
							},
							success: (e) => {
								// console.log('kouk====', e)
								if (e.result.reason.code == '200') {
									if (e.result.playrealUrl) {
										let swanVideoList = []
										swanVideoList.push({
											mldz: e.result.playrealUrl,
											device_name: '监控'
										})
										_self.setState({
											showSwanVideo: true,
											swanVideoList: swanVideoList
										})
									}
								} else {
									return false
								}
							}
						})
					}
				} else if (feature.get('type') == 'zdcs') {
					// console.log('重点', feature.get('kkbfmldz'))
					if (window.configUrl.iStreet) {
						let swanVideoList = []
						swanVideoList.push({
							mldz: feature.get('kkbfmldz'),
							device_name: '重点'
						})
						_self.setState({
							showSwanVideo: true,
							swanVideoList: swanVideoList
						})
					}
				} else if (feature.get('type') == 'jingqing') {
					// console.log('一三五', feature.get('list'))
					if (window.configUrl.iStreet) {
						_self.warningRender(feature.get('list'))
						_self.setState({
							mapClik: true
						})
						// _self.getDetailById(feature.get('information'))

						overlayWarning.setPosition(point)
						var warningClose = document.getElementById('warningClose')
						if (warningClose) {
							warningClose.onclick = () => {
								warnings.innerHTML = ''
								overlayWarning.setPosition(undefined)
							}
						}
					}
				}
			} else {
				// debugger;;
				if (!_self.state.mapClik) {
					// debugger;;
					overlay.setPosition(undefined)
					overlayWarning.setPosition(undefined)
					_self.setState({ zoomItem: [] }, () => {
						_self.showReportLocation()
					})
				}
			}
			// }
		})
		map.on('moveend', function(e) {
			// console.log('层级变化', e, map.getView())
			if (_self.state.showEncirclement) {
				_self.showWarningFun()
			}

			// debugger
			if (_self.state.showCamera) {
				// debugger
				_self.getBayonetsList(1)
			}
			if (_self.state.showMonitoring) {
				// debugger
				_self.getBayonetsList(2)
			}

			if (_self.state.showPlace) {
				// debugger
				_self.getBayonetsList(3)
			}
			if (_self.state.showPoliceStation) {
				// debugger
				_self.getBayonetsList(4)
			}

			// var mapExtent = map.getView().calculateExtent(map.getSize())
			// var a = ol.proj.transform([ mapExtent[0], mapExtent[1] ], 'EPSG:3857', 'EPSG:4326')
			// var b = ol.proj.transform([ mapExtent[2], mapExtent[3] ], 'EPSG:3857', 'EPSG:4326')
			// var point = ol.extent.getCenter(mapExtent)
			// point = ol.proj.transform([ point[0], point[1] ], 'EPSG:3857', 'EPSG:4326')
			// console.log(
			// 	point,
			// 	'====',
			// 	map.getView().getZoom(),
			// 	map.getView().getResolution(),
			// 	map.getSize(),
			// 	'------',
			// 	mapExtent,
			// 	'------',
			// 	a,
			// 	'---',
			// 	b
			// )
		})
		const showVector = initShowVector()
		const showVectorP = initShowVectorP()
		const showBayonetVector = bayonetVector()
		const showIntercomVector = intercomVector()
		const showCarVector = carVector()
		const showTrajectoryVector = trajectoryVector()
		const showWaringVector = waringVector()
		const showPlaceVector = placeVector()
		const showMonitoringVector = monitoringVector()
		const showIndividualVector = individualVector()
		const showStationVector = initShowStationVector()
		map.addLayer(showWaringVector)
		map.addLayer(showVector)
		map.addLayer(showVectorP)
		map.addLayer(showBayonetVector)
		map.addLayer(showIntercomVector)
		map.addLayer(showTrajectoryVector)
		map.addLayer(showStationVector)
		map.addLayer(showPlaceVector)
		map.addLayer(showMonitoringVector)
		map.addLayer(showIndividualVector)
		map.addLayer(vectorHeat)
		map.addLayer(showCarVector)

		this.setState({
			map,
			view,
			vector,
			source,
			showVector,
			showVectorP,
			showBayonetVector,
			showIndividualVector,
			showMonitoringVector,
			sourceIndividual,
			sourceMonitoring,
			sourceBayonet,
			sourceIntercom,
			showPlaceVector,
			showIntercomVector,
			sourcePlace,
			showCarVector,
			vectorHeat,
			sourceCar,
			overlay,
			sourceHeat,
			overlayWarning,
			warnings,
			// densityOverlay,
			content,
			sourceTrajectory,
			showTrajectoryVector,
			sourceWarning,
			showWaringVector,
			showStationVector,
			sourceStation

			// select
		})
	}

	//警务站
	showStationFun = (files) => {
		var _self = this
		// this.setState({ determine: 'edit' });
		let { view, map, draw, circle, showStationVector, sourceStation } = this.state
		let arr = []
		const datas = files || stationList
		//实例一个线的全局变量
		var geometry = new ol.geom.Point() //线,Point 点,Polygon 面
		showStationVector.setSource(null)
		sourceStation.clear()
		// console.log(stationList,'stationList')
		if (datas) {
			for (var i = 0; i < datas.length; i++) {
				if (datas[i].gps) {
					if (longrg.test(datas[i].gps[0]) && latreg.test(datas[i].gps[1])) {
						// console.log(datas[i].gps)

						const pointFeature = new ol.Feature({
							geometry: new ol.geom.Point(this.transform(files[i].gps[0],files[i].gps[1])),
							name: `${datas[i].count || ''}`,
							type: map.getView().getZoom() <= window.configUrl.aggregationNum ? '' : 'jingwuzhan',
							kkbfmldz: datas[i].bfmldz || '',
							gps: this.transform(files[i].gps[0],files[i].gps[1])
						})
						pointFeature.setStyle(
							monitoringStyles(pointFeature, map.getView().getZoom(), './image/jwz.png')
						)
						// pointFeature.setStyle(
						// 	new ol.style.Style({
						// 		image: new ol.style.Icon({
						// 			scale: map.getView().getZoom() / 25, // 图标缩放比例
						// 			src: './image/jwz.png' // 图标的url
						// 		})
						// 	})
						// )
						pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
						sourceStation.addFeature(pointFeature)
						// 监听地图层级变化
						// map.getView().on('change:resolution', function() {
						// 	var style = pointFeature.getStyle()
						// 	// 重新设置图标的缩放率，基于层级10来做缩放
						// 	style.getImage().setScale(this.getZoom() / 25)
						// 	pointFeature.setStyle(style)
						// })
					}
				}
			}
			showStationVector.setSource(sourceStation)
		}
	}
	//一三五包围圈信息构造函数
	warningRender = (files) => {
		const { warnings } = this.state
		// console.log(files)
		warnings.innerHTML = ''
		var body = document.createElement('div')
		body.className = 'warningBody'
		body.style.backgroundImage = "url('./image/spk.png')"
		warnings.appendChild(body)
		var imgs = document.createElement('img')
		imgs.className = 'close'
		imgs.id = 'warningClose'
		imgs.src = './image/close_1.png'
		body.appendChild(imgs)

		var elementA = document.createElement('div')
		elementA.className = 'item'
		body.appendChild(elementA)
		var spanA = document.createElement('div')
		spanA.className = 'title'
		spanA.innerText = '当前状态:'
		elementA.appendChild(spanA)
		var spanB = document.createElement('div')
		spanB.className = 'text'
		spanB.innerText = '待签收'
		elementA.appendChild(spanB)

		var elementA = document.createElement('div')
		elementA.className = 'item'
		body.appendChild(elementA)
		var spanA = document.createElement('div')
		spanA.className = 'title'
		spanA.innerText = '警情编号:'
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
		spanA.innerText = '报案时间:'
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
		spanA.innerText = '警情地点:'
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
		spanA.innerText = '报警电话:'
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
		spanA.innerText = '警情类别:'
		elementA.appendChild(spanA)
		var spanB = document.createElement('div')
		spanB.className = 'text'
		spanB.innerText = files.bjlbmc + '-' + files.bjlxmc + '-' + files.bjxlmc
		elementA.appendChild(spanB)
		var elementA = document.createElement('div')
		elementA.className = 'item'
		body.appendChild(elementA)
		var spanA = document.createElement('div')
		spanA.className = 'title'
		spanA.innerText = '报警内容:'
		elementA.appendChild(spanA)
		var spanB = document.createElement('div')
		spanB.className = 'text'
		spanB.innerText = files.bjnr
		elementA.appendChild(spanB)
		body.appendChild(elementA)
	}

	//一三五包围圈
	showWarningFun = () => {
		var _self = this
		// this.setState({ determine: 'edit' });
		let {
			view,
			map,
			draw,
			circle,
			vehicleGpsList,
			showCarVector,
			sourceWarning,
			zoomItem,
			overlay,
			content,
			policeAlarm,
			showWaringVector,
			overlayWarning
			// select
		} = this.state
		let arr = [],
			vector
		let vehicleState = ''
		//实例一个线的全局变量
		var geometry = new ol.geom.Point() //线,Point 点,Polygon 面
		sourceWarning.clear()
		console.log(policeAlarm, '警情')
		if (policeAlarm) {
			for (var i = 0; i < policeAlarm.length; i++) {
				if (policeAlarm[i].xzb && policeAlarm[i].yzb) {
					if (longrg.test(Number(policeAlarm[i].xzb)) && latreg.test(Number(policeAlarm[i].yzb))) {

						const pointFeaturea = new ol.Feature({
							geometry: new ol.geom.Point(this.transform(Number(policeAlarm[i].xzb), Number(policeAlarm[i].yzb)))
						})
						const pointFeature = new ol.Feature({
							geometry: new ol.geom.Point(this.transform(Number(policeAlarm[i].xzb), Number(policeAlarm[i].yzb)))
						})
						const pointFeatured = new ol.Feature({
							geometry: new ol.geom.Point(this.transform(Number(policeAlarm[i].xzb), Number(policeAlarm[i].yzb))),
							type: 'jingqing',
							list: policeAlarm[i]
						})
						const pointFeatureT = new ol.Feature({
							geometry: new ol.geom.Point(this.transform(Number(policeAlarm[i].xzb), Number(policeAlarm[i].yzb))),
							type: 'jingqing',
							list: policeAlarm[i]
						})
						// overlayWarning.setPosition(this.transform(Number(policeAlarm[i].xzb), Number(policeAlarm[i].yzb)))
						var a = Number(map.getView().getZoom()) / 28
						var b = Number(map.getView().getZoom()) * 1.2
						var c = Number(map.getView().getZoom()) * 1.9
						var d = Number(map.getView().getZoom()) * 0.8
						switch (Number(map.getView().getZoom())) {
							case 8:
								a = 0.1
								d = 2
								b = 6
								c = 10
								break
							case 9:
								a = 0.1
								d = 4.04
								b = 12.1
								c = 20.18
								break
							case 10:
								a = 0.2
								d = 8.07
								b = 24.2
								c = 40.37
								break
							case 11:
								a = 0.2
								d = 16.1
								b = 48.4
								c = 80.7
								break
							case 12:
								a = 0.3
								d = 32.3
								b = 96.9
								c = 161.5
								break
							case 13:
								a = 0.54
								d = 64.6
								b = 193.8
								c = 322.9
								break
							case 14:
								a = 0.7
								d = 129.1
								b = 387.6
								c = 645.9
								break
							case 15:
								a = 0.9
								d = 258.3
								b = 775.2
								c = 1297.8
								break
							case 16:
								a = 1
								d = 516.6
								b = 1550.4
								c = 2583.6
								break

							default:
								a = 0.1
								d = 2
								b = 6
								c = 10
								break
						}

						// console.log(map.getView().getZoom(), a, b, c)
						pointFeatureT.setStyle(
							new ol.style.Style({
								image: new ol.style.Icon({
									scale: a, // 图标缩放比例
									src: './image/jingbao.png' // 图标的url
								})
							})
						)
						pointFeatured.setStyle(
							new ol.style.Style({
								image: new ol.style.Circle({
									radius: d,
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
									radius: b,
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
									radius: c,
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
					// map.addLayer(vector);
					showWaringVector.setSource(sourceWarning)
					//  overlayWarning.setPosition([ Number(policeAlarm[0].xzb), Number(policeAlarm[0].yzb) ])
				}
			}
		}
	}

	//预警信息去详情构建函数
	captureWarning = (files, html, src) => {
		// console.log(files)
		let times = null
		const { content, map } = this.state
		content.innerHTML = ''
		var body = document.createElement('div')
		body.className = 'captureBody'
		content.appendChild(body)

		var elementA = document.createElement('div')
		elementA.className = 'captureImgs'
		var elementB = document.createElement('div')
		elementB.className = 'captureFooter'
		body.appendChild(elementA)
		body.appendChild(elementB)
		var elementImgA = document.createElement('img')
		if (files.type == '0') {
			elementImgA.src = files.show.portrait_img
			elementImgA.className = 'capturePortrait'
			elementA.appendChild(elementImgA)
		} else if (files.type == '1') {
			elementImgA.src = files.show.comparison_img
			elementImgA.className = 'cehiclePortrait'
			elementA.appendChild(elementImgA)
			var pAD = document.createElement('p')
			pAD.innerHTML = files.show.verificationPd.hphm
			pAD.className = 'cehiclePext'
			elementA.appendChild(pAD)
		}

		if (files.type == '0') {
			var elementImgB = document.createElement('img')
			elementImgB.src = files.show.verificationPortraitDataList[0].path
			elementImgB.className = 'contrastPortrait'
			elementA.appendChild(elementImgB)
			var elementC = document.createElement('div')
			elementC.className = 'labelTag'
			elementC.innerHTML = files.show.verificationPortraitDataList[0].score
			elementA.appendChild(elementC)
		} else if (files.type == '1') {
			var elementE = document.createElement('div')
			elementE.className = 'captureVehicle'
			elementA.appendChild(elementE)
			var pA = document.createElement('p')
			pA.innerHTML = files.show.verificationPd.hphm
			elementE.appendChild(pA)
			var pB = document.createElement('p')
			pB.innerHTML = files.show.verificationPd.clpp
			elementE.appendChild(pB)
			var pC = document.createElement('p')
			pC.innerHTML = files.show.verificationPd.cllx
			elementE.appendChild(pC)
		}

		var elementImgB = document.createElement('img')
		elementImgB.src = './image/shijian.png'
		elementImgB.className = 'captureTimeIcon'
		elementB.appendChild(elementImgB)

		var spanA = document.createElement('span')
		spanA.className = 'captureTimes'
		if (files.type == '0') {
			spanA.innerHTML = files.show.portrait_time
		} else if (files.type == '1') {
			spanA.innerHTML = files.show.comparison_time
		}

		elementB.appendChild(spanA)

		var elementD = document.createElement('div')
		elementD.className = 'captureTimeBtn'
		elementD.id = 'captureTimeBtn'
		elementB.appendChild(elementD)

		var spanB = document.createElement('span')
		spanB.className = 'packUp'
		spanB.innerHTML = html
		spanB.id = 'packUp'
		elementD.appendChild(spanB)

		var elementImgC = document.createElement('img')
		elementImgC.src = src
		elementImgC.className = 'captureBtnIcon'
		elementImgC.id = 'captureBtnIcon'
		elementD.appendChild(elementImgC)

		var packUp = document.getElementById('packUp')
		var captureBtnIcon = document.getElementById('captureBtnIcon')
		var captureTimeBtn = document.getElementById('captureTimeBtn')
		if (captureTimeBtn) {
			captureTimeBtn.onclick = () => {
				// clearTimeout()
				// console.log(captureTimeBtn)
				// console.log('dianji', files, this.state.showWarning)
				if (files.type == '0') {
					if (this.state.showWarning) {
						//    this.state.content.innerHTML = ''
						this.captureWarning(files, '展开', './image/zhankai.png')
						this.state.overlay.setPosition(new ol.proj.transform(num, 'EPSG:4326', 'EPSG:3857'))
						this.setState({ warningInfor: files, showWarning: false, mapClik: true })
					} else {
						// this.state.content.innerHTML = ''
						this.captureWarning(files, '收起', './image/shouqi.png')
						this.state.overlay.setPosition(new ol.proj.transform(num, 'EPSG:4326', 'EPSG:3857'))

						this.setState({ warningInfor: files, showWarning: true, mapClik: true })
					}
				} else if (files.type == '1') {
					if (this.state.showCarWarning) {
						//    this.state.content.innerHTML = ''
						this.captureWarning(files, '展开', './image/zhankai.png')
						this.state.overlay.setPosition(new ol.proj.transform(num, 'EPSG:4326', 'EPSG:3857'))
						this.setState({ warningInfor: files, showCarWarning: false, mapClik: true })
					} else {
						// this.state.content.innerHTML = ''
						this.captureWarning(files, '收起', './image/shouqi.png')
						this.state.overlay.setPosition(new ol.proj.transform(num, 'EPSG:4326', 'EPSG:3857'))

						this.setState({ warningInfor: files, showCarWarning: true, mapClik: true })
					}
				}
			}
		}
	}
	showGlobal = () => {
		const { content, showTrajectoryVector, sourceTrajectory } = this.state
		showTrajectoryVector.setSource(null)
		sourceTrajectory.clear()
		if (this.state.showVehicleDetails) {
			this.setState({ showVehicleDetails: false, showOfficerDetails: false, setLeft: 0, upDown: 'up' })
			document.getElementById('popup-content').innerHTML = ''
		}
	}
	getDetailById = (e) => {
		this.props.dispatch({
			type: 'home/getEquipmentListByVehicleId',
			payload: {
				vehicle_id: e.vehicle_id
			}
		})
		this.props.dispatch({
			type: 'home/getScheduleListByVehicleId',
			payload: {
				vehicle_id: e.vehicle_id
			}
		})
		this.props.dispatch({
			type: 'home/getVehiclePoliceAlarmList',
			payload: {
				carNo: e.vehicle_license_plate,
				imei: e.pad_cid,
				vehicle_organization_code: e.vehicle_organization_code
			}
		})
		this.props.dispatch({
			type: 'home/getScheduleCountByVehicleId',
			payload: {
				vehicle_id: e.vehicle_id
			}
		})
	}
	//卡口
	bayonetPoint = (files) => {
		var _self = this
		// this.setState({ determine: 'edit' });
		let { view, map, draw, circle, showBayonetVector, sourceBayonet, intercomList } = this.state
		let arr = []
		const datas = files || bayonetList
		//实例一个线的全局变量
		var geometry = new ol.geom.Point() //线,Point 点,Polygon 面
		showBayonetVector.setSource(null)
		sourceBayonet.clear()
		if (datas) {
			for (var i = 0; i < datas.length; i++) {
				if (datas[i].gps) {
					if (longrg.test(datas[i].gps[0]) && latreg.test(datas[i].gps[1])) {

						const pointFeature = new ol.Feature({
							geometry: new ol.geom.Point( this.transform(datas[i].gps[0], datas[i].gps[1])),
							name: `${datas[i].count || ''}`,
							type: map.getView().getZoom() <= window.configUrl.aggregationNum ? '' : 'bayone',
							kkbfmldz: datas[i].bfmldz || '',
							gps: this.transform(files[i].gps[0],files[i].gps[1])
						})

						pointFeature.setStyle(
							monitoringStyles(pointFeature, map.getView().getZoom(), './image/kakou.png')
						)
						// pointFeature.setStyle(
						// 	new ol.style.Style({
						// 		image: new ol.style.Icon({
						// 			scale: map.getView().getZoom() / 25, // 图标缩放比例
						// 			src: './image/kakou.png' // 图标的url
						// 		})
						// 	})
						// )
						pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
						sourceBayonet.addFeature(pointFeature)
						// 监听地图层级变化
						// map.getView().on('change:resolution', function() {
						// 	var style = pointFeature.getStyle()
						// 	// 重新设置图标的缩放率，基于层级10来做缩放
						// 	style.getImage().setScale(this.getZoom() / 25)
						// 	pointFeature.setStyle(style)
						// })
					}
				}
			}
			showBayonetVector.setSource(sourceBayonet)
		}
	}
	//在地图展示对讲信息
	intercomPoint = () => {
		var _self = this
		// this.setState({ determine: 'edit' });
		let { view, map, draw, circle, showIntercomVector, sourceIntercom, intercomList } = this.state
		let arr = []
		//实例一个线的全局变量
		var geometry = new ol.geom.Point() //线,Point 点,Polygon 面
		showIntercomVector.setSource(null)
		sourceIntercom.clear()
		if (intercomList) {
			for (var i = 0; i < intercomList.length; i++) {
				if (intercomList[i].gps_point) {
					if (longrg.test(intercomList[i].gps_point[0]) && latreg.test(intercomList[i].gps_point[1])) {
						const pointFeature = new ol.Feature({
							geometry: new ol.geom.Point(this.transform(intercomList[i].gps_point[0], intercomList[i].gps_point[1])),
							gps: this.transform(intercomList[i].gps_point[0], intercomList[i].gps_point[1])
						})
						pointFeature.setStyle(
							new ol.style.Style({
								image: new ol.style.Icon({
									scale: map.getView().getZoom() / 25, // 图标缩放比例
									src: './image/duijiang.png' // 图标的url
								})
							})
						)
						pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
						sourceIntercom.addFeature(pointFeature)
						// 监听地图层级变化
						map.getView().on('change:resolution', function() {
							var style = pointFeature.getStyle()
							// 重新设置图标的缩放率，基于层级10来做缩放
							style.getImage().setScale(this.getZoom() / 25)
							pointFeature.setStyle(style)
						})
					}
				}
			}
			showIntercomVector.setSource(sourceIntercom)
		}
	}
	//移动单兵设备
	individualPoint = () => {
		var _self = this
		// this.setState({ determine: 'edit' });
		let { view, map, draw, circle, showIndividualVector, sourceIndividual, individualList } = this.state
		let arr = []
		//实例一个线的全局变量
		var geometry = new ol.geom.Point() //线,Point 点,Polygon 面
		showIndividualVector.setSource(null)
		sourceIndividual.clear()
		if (individualList) {
			for (var i = 0; i < individualList.length; i++) {
				if (individualList[i].gps_point) {
					// console.log(individualList[i].gps_point)
					if (longrg.test(individualList[i].gps_point[0]) && latreg.test(individualList[i].gps_point[1])) {
						const pointFeature = new ol.Feature({
							geometry: new ol.geom.Point(this.transform(individualList[i].gps_point[0], individualList[i].gps_point[1])),
							gps: this.transform(individualList[i].gps_point[0], individualList[i].gps_point[1])
						})
						pointFeature.setStyle(
							new ol.style.Style({
								image: new ol.style.Icon({
									scale: map.getView().getZoom() / 25, // 图标缩放比例
									src: './image/yddb_1.png' // 图标的url
								})
							})
						)
						pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
						sourceIndividual.addFeature(pointFeature)
						// 监听地图层级变化
						map.getView().on('change:resolution', function() {
							var style = pointFeature.getStyle()
							// 重新设置图标的缩放率，基于层级10来做缩放
							style.getImage().setScale(this.getZoom() / 25)
							pointFeature.setStyle(style)
						})
					}
				}
			}
			showIndividualVector.setSource(sourceIndividual)
		}
	}
	getBayonetsList = (files) => {
		var _self = this
		const { map } = this.state
		console.log(files)
		// debugger
		var mapExtent = map.getView().calculateExtent(map.getSize())
		// debugger
		var a = ol.proj.transform([ mapExtent[0], mapExtent[1] ], 'EPSG:3857', 'EPSG:4326')
		// debugger
		var b = ol.proj.transform([ mapExtent[2], mapExtent[3] ], 'EPSG:3857', 'EPSG:4326')
		// debugger
		var point = ol.extent.getCenter(mapExtent)
		// debugger
		point = ol.proj.transform([ point[0], point[1] ], 'EPSG:3857', 'EPSG:4326')
		// debugger
		console.log(
			point,
			'====',
			map.getView().getZoom(),
			map.getView().getResolution(),
			map.getSize(),
			'------',
			mapExtent,
			'------',
			a,
			'---',
			b,
			'==='
		)
        // this.setState({isfd: true})
		// debugger
		this.props.dispatch({
			type: 'screen/getBayonetsList',
			payload: {
				bayonet_type: files,
				leftX: a[0],
				leftY: a[1],
				rightX: b[0],
				rightY: b[1],
				level: map.getView().getZoom()
			},
			success: (e) => {
				// debugger
				console.log(e.result)
				// debugger
				if (e.result.reason.code == '200') {
					// debugger

					if (files == 1) {
						if (e.result.list && e.result.list.length) {
							var arr = e.result.list || []

							console.log(arr, 'ereqw')
							bayonetList = arr
							setTimeout(() => {
                                // _self.setState({isfd: false})
								_self.bayonetPoint(arr)
							}, 100)
						}
						// _self.setState({ bayonetList: e.result.list }, () => {
						//     if (e.result.list && e.result.list.length) {
						// 	var arr = e.result.list || []

						// 	console.log(arr, 'ereqw')
						// 	monitoringList = arr
						// 	setTimeout(() => {
						//         _self.monitoringPoint(arr)
						// 	}, 100);
						// }
						// 	_self.bayonetPoint()
						// 	// _self.getPiontMap(
						// 	// 	_self.state.swanList,
						// 	// 	false,
						// 	// 	'sourceSwan',
						// 	// 	'showSwanVector',
						// 	// 	'./image/kk_1.png',
						// 	// 	'swan',
						// 	// 	'gps'
						// 	// )
						// })
					} else if (files == 2) {
						if (e.result.list && e.result.list.length) {
							var arr = e.result.list || []

							console.log(arr, 'ereqw')
							monitoringList = arr
							setTimeout(() => {
                                //  _self.setState({isfd: false})
								_self.monitoringPoint(arr)
							}, 100)
						}
					} else if (files == 3) {
						if (e.result.list && e.result.list.length) {
							var arr = e.result.list || []

							console.log(arr, 'ereqw')
							placeList = arr
							setTimeout(() => {
                                //  _self.setState({isfd: false})
								_self.placePoint(arr)
							}, 100)
						}
						// _self.setState({ placeList: e.result.list }, () => {
						// 	_self.placePoint()
						// 	// _self.getPiontMap(
						// 	// 	_self.state.keyPlaceList,
						// 	// 	false,
						// 	// 	'sourceKeyPlace',
						// 	// 	'showKeyPlaceVector',
						// 	// 	'./image/zdcs_1.png',
						// 	// 	'keyPlace',
						// 	// 	'gps'
						// 	// )
						// })
					} else if (files == 4) {
						if (e.result.list && e.result.list.length) {
							var arr = e.result.list || []

							console.log(arr, 'ereqw')
							stationList = arr
							setTimeout(() => {

								_self.showStationFun(arr)
							}, 100)
						}
						// _self.setState({ stationList: e.result.list }, () => {
						// 	_self.showStationFun()
						// 	// _self.getPiontMap(
						// 	// 	_self.state.policeStationList,
						// 	// 	false,
						// 	// 	'sourcePoliceStation',
						// 	// 	'showPoliceStationVector',
						// 	// 	'./image/jwz_1.png',
						// 	// 	'policeStation',
						// 	// 	'gps'
						// 	// )
						// })
					}
				}
			}
		})
	}
	//视频监控
	monitoringPoint = (files) => {
		var _self = this
		// this.setState({ determine: 'edit' });
		let { view, map, draw, circle, showMonitoringVector, sourceMonitoring } = this.state
		let arr = []
		//实例一个线的全局变量
		var geometry = new ol.geom.Point() //线,Point 点,Polygon 面
		showMonitoringVector.setSource(null)
		sourceMonitoring.clear()
		console.log(monitoringList, '画')
		if (monitoringList && monitoringList.length) {
			// debugger
			for (var i = 0; i < monitoringList.length; i++) {
				// debugger
				if (monitoringList[i].gps) {
					// debugger
					if (longrg.test(monitoringList[i].gps[0]) && latreg.test(monitoringList[i].gps[1])) {
						// debugger
						// console.log(monitoringList[i].gps)

						const pointFeature = new ol.Feature({
							geometry: new ol.geom.Point(this.transform(monitoringList[i].gps[0], monitoringList[i].gps[1])),
							gps: this.transform(monitoringList[i].gps[0], monitoringList[i].gps[1]),
							name: `${monitoringList[i].count || ''}`,
							type: map.getView().getZoom() <= window.configUrl.aggregationNum ? '' : 'jiankong',
							kkbfmldz: monitoringList[i].bfmldz || '',
							layer: monitoringList[i]
						})
						pointFeature.setStyle(
							monitoringStyles(pointFeature, map.getView().getZoom(), './image/spjk_1.png')
						)
						// if (map.getView().getZoom() > window.configUrl.aggregationNum) {

						// // 	// 创建一个overlay, 绑定html元素container

						// var densityOverlay = new ol.Overlay(
						// 	/** @type {olx.OverlayOptions} */ {
						// 		element: document.getElementById(`${'density'}${monitoringList[i].bayonet_id}`),
						// 		autoPan: true,
						// 		positioning: 'right-center',
						// 		stopEvent: false,
						// 		position: new ol.proj.transform(monitoringList[i].gps, 'EPSG:4326', 'EPSG:3857'),
						// 		autoPanAnimation: {
						// 			duration: 250
						// 		}
						// 	}
						// )
						// // 	// debugger
						// map.addOverlay(densityOverlay)

						// var personnelOverlay = new ol.Overlay(
						// 	/** @type {olx.OverlayOptions} */ {
						// 		element: document.getElementById(`${'personnel'}${monitoringList[i].bayonet_id}`),
						// 		autoPan: true,
						// 		positioning: 'right-center',
						// 		stopEvent: false,
						// 		position: new ol.proj.transform(monitoringList[i].gps, 'EPSG:4326', 'EPSG:3857'),
						// 		autoPanAnimation: {
						// 			duration: 250
						// 		}
						// 	}
						// )
						// map.addOverlay(personnelOverlay)
						// }

						// 监听地图层级变化
						// map.getView().on('change:resolution', function() {
						// 	var style = pointFeature.getStyle()
						// 	// 重新设置图标的缩放率，基于层级10来做缩放
						// 	style.getImage().setScale(this.getZoom() / 25)
						// 	pointFeature.setStyle(style)
						// })
						pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
						sourceMonitoring.addFeature(pointFeature)
					}
				}
			}
			// debugger
			showMonitoringVector.setSource(sourceMonitoring)
			// debugger
		}
	}
	setClusterStyle(feature) {
		var features = feature.get('features')
		var size = features.length
		var style = new ol.style.Style({
			image: new ol.style.Circle({
				radius: 18,
				stroke: new ol.style.Stroke({
					color: '#fff'
				}),
				fill: new ol.style.Fill({
					color: '#3399CC'
				})
			}),
			text: new ol.style.Text({
				font: '15px sans-serif',
				text: size.toString(),
				fill: new ol.style.Fill({
					color: '#fff'
				})
			})
		})
		return style
	}
	//人流密度人流密度构建函数
	addDensityInfo = (info, con, name) => {
		// const { densityContent } = this.state;
		con.innerHTML = ''
		// console.log(info, con)
		var bodyA = document.createElement('div')
		bodyA.className = 'densityBody'
		bodyA.style.backgroundImage = "url('./image/rlmdbg.png')"
		con.appendChild(bodyA)
		var elementA = document.createElement('div')
		elementA.className = 'densityTitle'
		elementA.innerText = '人流密度监测'
		var elementB = document.createElement('div')
		elementB.className = 'densityConcton'
		bodyA.appendChild(elementA)
		bodyA.appendChild(elementB)
		var itemA = document.createElement('div')
		itemA.className = 'densityItem'
		elementB.appendChild(itemA)
		var spanA = document.createElement('span')
		spanA.innerText = name + '：' + info.show.flow_density + '人'
		itemA.appendChild(spanA)
		//  this.setState({mapClik: true})
		setTimeout(() => {
			con.innerHTML = ''
		}, 5000)
	}
	//重点目标构建函数
	addPersonnelInfo = (info, con, name) => {
		con.innerHTML = ''
		var bodyA = document.createElement('div')
		bodyA.className = 'personnelBody'
		bodyA.style.backgroundImage = "url('./image/zdrybg.png')"
		con.appendChild(bodyA)
		var elementA = document.createElement('div')
		elementA.className = 'personnelTitle'
		elementA.innerText = '重点目标'
		var elementB = document.createElement('div')
		elementB.className = 'personnelConcton'
		bodyA.appendChild(elementA)
		bodyA.appendChild(elementB)
		var elementImgB = document.createElement('img')
		elementImgB.src = info.show.portrait_img
		elementImgB.className = 'personnelIcon'
		elementB.appendChild(elementImgB)
		var itemA = document.createElement('div')
		itemA.className = 'personnelItem'
		elementB.appendChild(itemA)
		var time = document.createElement('div')
		time.innerText = info.show.portrait_time
		time.className = 'time'
		itemA.appendChild(time)
		var address = document.createElement('div')
		address.innerText = name
		address.className = 'address'
		itemA.appendChild(address)
		setTimeout(() => {
			con.innerHTML = ''
		}, 5000)
	}
	//重点场所
	placePoint = (files) => {
		var _self = this
		// this.setState({ determine: 'edit' });
		let { view, map, draw, circle, showPlaceVector, sourcePlace } = this.state
		let arr = []
		const datas = files || placeList
		//实例一个线的全局变量
		var geometry = new ol.geom.Point() //线,Point 点,Polygon 面
		showPlaceVector.setSource(null)
		sourcePlace.clear()
		if (datas) {
			for (var i = 0; i < datas.length; i++) {
				if (datas[i].gps) {
					// console.log(datas[i].gps)i
					if (longrg.test(datas[i].gps[0]) && latreg.test(datas[i].gps[1])) {
						const pointFeature = new ol.Feature({
							geometry: new ol.geom.Point(this.transform(datas[i].gps[0], datas[i].gps[1])),
							name: `${datas[i].count || ''}`,
							type: map.getView().getZoom() <= window.configUrl.aggregationNum ? '' : 'zdcs',
							kkbfmldz: datas[i].bfmldz || '',
							gps: this.transform(datas[i].gps[0], datas[i].gps[1])
						})
						pointFeature.setStyle(
							monitoringStyles(pointFeature, map.getView().getZoom(), './image/zdcs_1.png')
						)
						// pointFeature.setStyle(
						// 	new ol.style.Style({
						// 		image: new ol.style.Icon({
						// 			scale: map.getView().getZoom() / 25, // 图标缩放比例
						// 			src: './image/zdcs_1.png' // 图标的url
						// 		})
						// 	})
						// )

						pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
						sourcePlace.addFeature(pointFeature)
						// 监听地图层级变化
						// map.getView().on('change:resolution', function() {
						// 	var style = pointFeature.getStyle()
						// 	// 重新设置图标的缩放率，基于层级10来做缩放
						// 	style.getImage().setScale(this.getZoom() / 25)
						// 	pointFeature.setStyle(style)
						// })
					}
				}
			}
			showPlaceVector.setSource(sourcePlace)
		}
	}

	// 将警车图标渲染到地图
	showReportLocation = () => {
		var _self = this
		// this.setState({ determine: 'edit' });
		let {
			view,
			map,
			draw,
			circle,
			vehicleGpsList,
			showCarVector,
			sourceCar,
			zoomItem,
			overlay,
			content
			// select
		} = this.state
		let arr = []
		let vehicleState = ''
		//实例一个线的全局变量
		var geometry = new ol.geom.Point() //线,Point 点,Polygon 面
		showCarVector.setSource(null)
		sourceCar.clear()

		if (vehicleGpsList) {
			// console.log(vehicleGpsList)

			if (vehicleGpsList.length) {
				for (var i = 0; i < vehicleGpsList.length; i++) {
					if (vehicleGpsList[i].gps_point) {
						//  console.log(vehicleGpsList[i])
						if (
							longrg.test(vehicleGpsList[i].gps_point[0]) &&
							latreg.test(vehicleGpsList[i].gps_point[1])
						) {

							const pointFeature = new ol.Feature({
								geometry: new ol.geom.Point(this.transform(vehicleGpsList[i].gps_point[0], vehicleGpsList[i].gps_point[1])),
								name: vehicleGpsList[i].vehicle_license_plate,
								information: vehicleGpsList[i],
								vehicleState: vehicleGpsList[i].vehicle_state,
								type: 'car',
								gps: this.transform(vehicleGpsList[i].gps_point[0], vehicleGpsList[i].gps_point[1])
							})
							// if(vehicleGpsList[i].gps_point == zoomItem){
							//     vehicleState = '2';
							// }else{
							//     vehicleState = vehicleGpsList[i].vehicle_state
							// }
							// var abnorPeo =;

							//  // 创建一个overlay, 绑定html元素container
							var captureTimeBtn = document.getElementById(
								`${'captureTimeBtn'}${vehicleGpsList[i].pad_cid}`
							)
							var abnorPeo = document.getElementById(`${'abnorPeo'}${vehicleGpsList[i].pad_cid}`)
							//  console.log(abnorPeo)
							var packUp = document.getElementById(`${'packUp'}${vehicleGpsList[i].pad_cid}`)
							var captureBtnIcon = document.getElementById(
								`${'captureBtnIcon'}${vehicleGpsList[i].pad_cid}`
							)

							var overlayPeo = new ol.Overlay(
								/** @type {olx.OverlayOptions} */ {
									element: document.getElementById(`${'abnorPeo'}${vehicleGpsList[i].pad_cid}`),
									autoPan: true,
									positioning: 'right-center',
									stopEvent: false,
									position: new ol.proj.transform(
										this.transform(vehicleGpsList[i].gps_point[0], vehicleGpsList[i].gps_point[1]),
										'EPSG:4326',
										'EPSG:3857'
									),
									autoPanAnimation: {
										duration: 250
									}
								}
							)
							map.addOverlay(overlayPeo)

							// console.log(conPeo)
							if (captureTimeBtn) {
								// console.log('xinjian')
								captureTimeBtn.setAttribute('text', captureTimeBtn.getAttribute('text'))
								// document.getElementById(`${'packUp'}${vehicleGpsList[i].pad_cid}`).innerHTML = '查看';
								// document.getElementById(`${'captureBtnIcon'}${vehicleGpsList[i].pad_cid}`).src = './image/zhankai.png';
							}

							pointFeature.setStyle(
								carStyles(vehicleGpsList[i].vehicle_state, pointFeature, map.getView().getZoom())
							)
							pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
							sourceCar.addFeature(pointFeature)
							arr.push(ol.proj.fromLonLat(this.transform(vehicleGpsList[i].gps_point[0], vehicleGpsList[i].gps_point[1])))
							// 监听地图层级变化
							map.getView().on('change:resolution', function() {
								var style = pointFeature.getStyle()
								// 重新设置图标的缩放率，基于层级10来做缩放
								style.getImage().setScale(this.getZoom() / 20)
								pointFeature.setStyle(style)
							})
						}
					}
				}

				showCarVector.setSource(sourceCar)
				if (!_self.state.isOneRender) {
					// console.log(arr)
					if (arr.length) {
						let exent = ol.extent.boundingExtent(arr)
						let center = ol.extent.getCenter(exent)
						view.fit(exent)
						view.setCenter(center)
						_self.setState({ isOneRender: true })
						view.setZoom(13)
					}
				}

				var selectSingleClick = new ol.interaction.Select(
					{
						// API文档里面有说明，可以设置style参数，用来设置选中后的样式，但是这个地方我们注释掉不用，因为就算不注释，也没作用，为什么？
						// style: new ol.style.Style({
						//     image: new ol.style.Icon({
						//         scale: 1.1, // 图标缩放比例
						//         src: './image/car_click.png', // 图标的url
						//     }),
						// })
					}
				)

				map.addInteraction(selectSingleClick)
				selectSingleClick.on('select', function(event) {
					selectSingleClick.getFeatures().clear()

					if (event.selected[0]) {
						// selectSingleClick.getFeatures().clear();

						//  if(event.selected[0].get('vehicleState') == 1){

						if (event.selected[0].get('information') != undefined) {
							// console.log('454545')
							_self.setState(
								{
									zoomItem: event.selected[0].get('information').gps_point,
									mapClik: true,
									selectFeature: selectSingleClick,
									showVehicleDetails: true
								},
								() => {
									_self.showReportLocation()
								}
							)
						}
					}
				})
			}
		}
	}
	//预警信息内容
	sss = (files, html, src, type, code) => {
		// console.log(e)
		// var body = document.createElement('div');
		// body.className = 'captureBody';
		// e.appendChild(body);
		// var elementA = document.createElement('div');
		// elementA.className = 'captureImgs';
		// elementA.innerHTML = a;
		// body.appendChild(elementA);

		// console.log(type)
		let times = null
		// const { content, map } = this.state;
		type.innerHTML = ''
		var body = document.createElement('div')
		body.className = 'captureBody'
		type.appendChild(body)

		var colse = document.createElement('img')
		if (files.type == '0') {
			colse.src = 'image/colse.png'
		} else if (files.type == '1') {
			colse.src = 'image/close_1.png'
		}
		colse.className = 'captureClose'
		colse.id = 'captureClose' + code
		body.appendChild(colse)

		var elementA = document.createElement('div')
		elementA.className = 'captureImgs'
		var elementB = document.createElement('div')
		elementB.className = 'captureFooter'
		body.appendChild(elementA)
		body.appendChild(elementB)
		var elementImgA = document.createElement('img')
		if (files.type == '0') {
			elementImgA.src = files.show.portrait_img
			elementImgA.className = 'capturePortrait'
			elementA.appendChild(elementImgA)
		} else if (files.type == '1') {
			elementImgA.src = files.show.comparison_img
			elementImgA.className = 'cehiclePortrait'
			elementA.appendChild(elementImgA)
			var pAD = document.createElement('p')
			pAD.innerHTML = files.show.verificationPd.hphm
			pAD.className = 'cehiclePext'
			elementA.appendChild(pAD)
		}

		if (files.type == '0') {
			var elementImgB = document.createElement('img')
			elementImgB.src = files.show.verificationPortraitDataList[0].path
			elementImgB.className = 'contrastPortrait'
			elementA.appendChild(elementImgB)
			var elementC = document.createElement('div')
			elementC.className = 'labelTag'
			elementC.innerHTML = files.show.verificationPortraitDataList[0].score
			elementA.appendChild(elementC)
		} else if (files.type == '1') {
			var elementE = document.createElement('div')
			elementE.className = 'captureVehicle'
			elementA.appendChild(elementE)
			var pA = document.createElement('p')
			pA.innerHTML = files.show.verificationPd.hphm
			elementE.appendChild(pA)
			var pB = document.createElement('p')
			pB.innerHTML = files.show.verificationPd.clpp
			elementE.appendChild(pB)
			var pC = document.createElement('p')
			pC.innerHTML = files.show.verificationPd.cllx
			elementE.appendChild(pC)
		}

		var elementImgB = document.createElement('img')
		elementImgB.src = './image/shijian.png'
		elementImgB.className = 'captureTimeIcon'
		elementB.appendChild(elementImgB)

		var spanA = document.createElement('span')
		spanA.className = 'captureTimes'
		if (files.type == '0') {
			spanA.innerHTML = files.show.portrait_time
		} else if (files.type == '1') {
			spanA.innerHTML = files.show.comparison_time
		}

		elementB.appendChild(spanA)

		var elementD = document.createElement('div')
		elementD.className = 'captureTimeBtn'
		elementD.id = 'captureTimeBtn' + code
		elementD.setAttribute('text', JSON.stringify(files))
		elementB.appendChild(elementD)

		var spanB = document.createElement('span')
		spanB.className = 'packUp'
		spanB.innerHTML = '查看'
		spanB.id = 'packUp' + code
		elementD.appendChild(spanB)

		var elementImgC = document.createElement('img')
		elementImgC.src = './image/zhankai.png'
		elementImgC.className = 'captureBtnIcon'
		elementImgC.id = 'captureBtnIcon' + code
		elementD.appendChild(elementImgC)

		var captureClose = document.getElementById(`${'captureClose'}${code}`)
		var packUp = document.getElementById(`${'packUp'}${code}`)
		var captureBtnIcon = document.getElementById(`${'captureBtnIcon'}${code}`)
		var captureTimeBtn = document.getElementById(`${'captureTimeBtn'}${code}`)
		if (captureClose) {
			captureClose.onclick = () => {
				type.innerHTML = ''
			}
		}
		if (captureTimeBtn) {
			captureTimeBtn.onclick = () => {
				// console.log(!this.state.showWarning && !this.state.showCarWarning)

				//    if(!this.state.showWarning && !this.state.showCarWarning){
				const mess = captureTimeBtn.getAttribute('text')
				// console.log('点击', packUp, files)
				if (files.type == '0') {
					// console.log('---------')
					if (this.state.showWarning) {
						// console.log('---------1')
						// packUp.innerHTML = '收起';
						// captureBtnIcon.src = './image/shouqi.png';
						// this.setState({warningInfor: {}, showWarning:false,showCarWarning:false, mapClik: true});
					} else {
						// packUp.innerHTML = '展开';
						// captureBtnIcon.src = './image/zhankai.png';
						// console.log('---------2')
						this.setState({
							warningInfor: { ...JSON.parse(mess), code: code },
							showWarning: true,
							mapClik: true
						})
					}
				} else if (files.type == '1') {
					// console.log('==========')
					if (this.state.showCarWarning) {
						// console.log('==========1')
						// packUp.innerHTML = '收起';
						// captureBtnIcon.src = './image/shouqi.png';
						// this.setState({warningInfor: {}, showCarWarning:false,showWarning:false, mapClik: true});
					} else {
						// packUp.innerHTML = '展开';
						// captureBtnIcon.src = './image/zhankai.png';
						// console.log('==========2')
						this.setState({
							warningInfor: { ...JSON.parse(mess), code: code },
							showCarWarning: true,
							mapClik: true
						})
					}
				}
				//    }
			}
		}
	}
	//在地图上渲染热力图
	getHeatMap = () => {
		const { sourceHeat, map, heatAlarmList, vectorHeat } = this.state
		let heatData = {
			type: 'FeatureCollection',
			features: []
		}
		sourceHeat.clear()
		vectorHeat.setSource(null)
		if (heatAlarmList && heatAlarmList.length) {
			for (let index = 0; index < heatAlarmList.length; index++) {
				const element = heatAlarmList[index]
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
			// var vectorHeat = new ol.layer.Heatmap({
			//     source: sourceHeat,
			//     blur: parseInt(16, 10),
			//     radius: parseInt(12, 10),
			//     gradient: ['#04fbb2', '#18fb04', '#fbd804', '#f94000','#b30303'], //颜色
			// });
			// map.addLayer(vectorHeat);
			// this.setState({vectorHeat: vectorHeat})
		}
	}

	amplification = () => {
		let { view } = this.state
		this.setState({ showAdd: true, showPase: false })
		view.setZoom(view.getZoom() + 1)
	}
	narrow = () => {
		let { view } = this.state
		this.setState({ showAdd: false, showPase: true })
		view.setZoom(view.getZoom() - 1)
	}
	//在地图上渲染轨迹
	drawTrajectory = (files) => {
		var _self = this
		const { view, showVector, map, vector, sourceTrajectory, showTrajectoryVector } = this.state
		//实例一个线(标记点)的全局变量
		var geometry = new ol.geom.LineString() //线,Point 点,Polygon 面
		const arr = []
		const location = []
		// var coordinate = [[126.663201,45.781979],[126.660330,45.779754],[126.654756,45.774573],[126.648194,45.769033],[126.646898,45.767595],[126.641242,45.765543],[126.636343,45.763590],[126.632710,45.763435],[126.630545,45.763138],[126.629716,45.762779],[126.625814,45.759562],[126.623527,45.759095],[126.620831,45.759327],[126.620512,45.759098],[126.621301,45.757186],[126.620712,45.754076]]
		// var routeCoords = [];
		let tempprolineFeatureList = []
		showTrajectoryVector.setSource(null)
		sourceTrajectory.clear()
		if (files.length) {
			for (let i = 0; i < files.length; i++) {
				if (files[i] && files[i].gps_point) {
					if (longrg.test(files[i].gps_point[0]) && latreg.test(files[i].gps_point[1])) {
						location.push( this.transform(files[i].gps_point[0], files[i].gps_point[1]))
					}
				}
			}
			console.log('---', location)
			const lineFeature = new ol.Feature(new ol.geom.LineString(location))
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
			var mapClick = map.on(
				'click',
				function(evt) {
					showTrajectoryVector.setSource(null)
					sourceTrajectory.clear()
					ol.Observable.unByKey(mapClick)
					// _self.setState({ showVehicleDetails: false })
				}.bind(this)
			)
			/**
 *  动态轨迹
 */
			// for (let i = 0; i < files.length; i++) {
			// 		if (files[i] && files[i].gps_point) {
			// 			routeCoords.push(files[i].gps_point)
			// 		}
			// 	}
		} else {
			message.error('暂无轨迹')
			return false
		}
	}

	//视频和轨迹按钮构造函数
	addFeatrueInfo = (info) => {
		const { content } = this.state
		content.innerHTML = ''
		var bodyA = document.createElement('div')
		bodyA.className = 'contentBody'
		bodyA.style.backgroundImage = "url('./image/xzcl.png')"
		content.appendChild(bodyA)
		var elementA = document.createElement('div')
		elementA.className = 'markerTrajectory'
		elementA.id = 'markerTrajectory'
		elementA.setAttribute('type', info.vehicle_id)
		var elementB = document.createElement('div')
		elementB.className = 'markerVideo'
		elementB.id = 'markerVideo'
		elementB.setAttribute('info', JSON.stringify(info))
		bodyA.appendChild(elementA)
		bodyA.appendChild(elementB)
		var elementImg = document.createElement('img')
		elementImg.src = './image/gj_icon.png'
		elementA.appendChild(elementImg)
		var elementVideoImg = document.createElement('img')
		elementVideoImg.src = './image/video_icon2.png'
		elementB.appendChild(elementVideoImg)
		var spanA = document.createElement('span')
		spanA.innerText = '轨迹'
		elementA.appendChild(spanA)
		var spanB = document.createElement('span')
		spanB.innerText = '视频'
		elementB.appendChild(spanB)
		this.setState({ mapClik: true })
	}

	closeLiveVideo = () => {
		var _self = this
		this.setState({ showVideo: false, showSwanVideo: false }, () => {
			// if(_self.refs.childVideo.player){
			// document.getElementById('popup-content').innerHTML = ''
			// _self.refs.childVideo.close()
			// console.log(_self.refs)
			// }
		})
	}

	//以路线为中心
	centerWithLine = () => {
		let { view, curArr } = this.state
		if (curArr.length > 0) {
			let exent = ol.extent.boundingExtent(curArr)
			let center = ol.extent.getCenter(exent)
			view.fit(exent)
			view.setCenter(center)
		}
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
		const { map, vector, showVector, showVectorP, select } = this.state
		vector.setSource(null)
		showVector.setSource(null)
		showVectorP.setSource(null)
		// select.setActive(false);
	}

	render() {
		const {
			form: { getFieldDecorator },
			home: { checkList, vehicleGps, equipmentType, equipmentList, scheduleCount, scheduleList, alarmList },
			loading
		} = this.props

		const {
			comparisonList,
			showVideo,
			swanVideoList,
			showSwanVideo,
			showHeat,
			vehicleGpsList,
			// monitoringList,
			abnormalPeoples,
			policeAlarmCounts,
			comparisonMessage,
			vehicleStatusList,
			schedules,
			deviceMessage,
			showCar,
			showIntercom,
			showCamera,
			showVehicleDetails,
			showOfficerDetails,
			showAccording,
			showVoice,
			showAdd,
			showPase,
			showPositioning,
			showSignal,
			showMore,
			showMonitoring,
			showIndividual,
			showPlace,
			showEncirclement,
			showPoliceStation,
			moreEquipment,
			setLeft,
			upDown
		} = this.state

		return (
			<div className={styles.main}>
				<div className={styles.calendar}>
					<div id="map" className={styles.mapDivStyle}>
						<div id="popup" className={styles.olpopup}>
							<div id="popup-content" />
						</div>
						<div id="warnings" className={styles.olpopup}>
							<div id="warnings-content" />
						</div>
						{vehicleGpsList && vehicleGpsList.length ? (
							vehicleGpsList.map((v, k) => (
								<div id={`${'abnorPeo'}${v.pad_cid}`} key={k} className={styles.olpopup}>
									<div id={`${'conPeo'}${v.pad_cid}`} />
								</div>
							))
						) : null}
						{/* {monitoringList && monitoringList.length ? (
							monitoringList.map((v, k) => (
								<div id={`${'density'}${v.bayonet_id}`} key={k} className={styles.olpopup}>
									<div id={`${'density-content'}${v.bayonet_id}`} />
								</div>
							))
						) : null} */}
						{/* {monitoringList && monitoringList.length ? (
							monitoringList.map((v, k) => (
								<div id={`${'personnel'}${v.bayonet_id}`} key={k} className={styles.olpopup}>
									<div id={`${'personnel-content'}${v.bayonet_id}`} />
								</div>
							))
						) : null} */}
					</div>
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
							src={deviceMessage && deviceMessage.length && deviceMessage[0].mldz}
							deviceMessage={deviceMessage}
							videoName={deviceMessage && deviceMessage.length && deviceMessage[0].device_name}
							showVideo={showVideo}
						/>
					) : null}
				</Modal>

				<Modal
					title="视频直播"
					visible={this.state.showSwanVideo}
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
					{this.state.showSwanVideo ? (
						<VideoPlayer
							ref="childVideo"
							src={swanVideoList && swanVideoList.length && swanVideoList[0].mldz}
							deviceMessage={swanVideoList}
							videoName={swanVideoList && swanVideoList.length && swanVideoList[0].device_name}
							showVideo={showSwanVideo}
						/>
					) : null}
				</Modal>
				<div className={styles.leftMune}>
					{showVehicleDetails ? (
						<div className={styles.detailBack}>
							<Button
								type="primary"
								onClick={() => this.showGlobal()}
								style={{
									backgroundImage: 'linear-gradient(to right, rgba(7,18,89,0.8), rgba(7,54,143,0.8))',
									border: 0
								}}
							>
								返回全局
							</Button>
						</div>
					) : null}
					{showVehicleDetails ? (
						<div className={styles.equipment} style={{ backgroundImage: "url('./image/zbxx.png')" }}>
							<ul>
								{equipmentList && equipmentList.length ? (
									equipmentList.map((v, index) => {
										if (equipmentList.length > 6) {
											if (moreEquipment) {
												if (index >= 0 && index < 6) {
													return (
														<li
															key={index}
															className={`${styles.equipmentLeft} ${v.checkCount < v.total
																? styles.lackof
																: null}`}
														>
															<div className={styles.information}>
																<div>
																	{equipmentType ? (
																		equipmentType.find(
																			(x) => x.code == v.equipment_type
																		).name
																	) : (
																		''
																	)}
																</div>
																<div className={styles.num}>
																	{v.checkCount}/{v.total}件
																</div>
															</div>
															<div className={styles.icon}>
																{v.checkCount < v.total ? (
																	<img src="./image/jly.png" alt="图标" />
																) : (
																	<img src="./image/jly_1.png" alt="图标" />
																)}
															</div>
														</li>
													)
												}
											} else {
												if (index >= 0 && index < 5) {
													return (
														<li
															key={index}
															className={`${styles.equipmentLeft} ${v.checkCount < v.total
																? styles.lackof
																: null}`}
														>
															<div className={styles.information}>
																<div>
																	{equipmentType ? (
																		equipmentType.find(
																			(x) => x.code == v.equipment_type
																		).name
																	) : (
																		''
																	)}
																</div>

																<div className={styles.num}>
																	{v.checkCount}/{v.total}件
																</div>
															</div>
															<div className={styles.icon}>
																{v.checkCount < v.total ? (
																	<img src="./image/jly.png" alt="图标" />
																) : (
																	<img src="./image/jly_1.png" alt="图标" />
																)}
															</div>
														</li>
													)
												}
											}
										} else {
											return (
												<li
													key={index}
													className={`${styles.equipmentLeft} ${v.checkCount < v.total
														? styles.lackof
														: null}`}
												>
													<div className={styles.information}>
														<div>
															{equipmentType ? (
																equipmentType.find((x) => x.code == v.equipment_type)
																	.name
															) : (
																''
															)}
														</div>
														<div className={styles.num}>
															{v.checkCount}/{v.total}件
														</div>
													</div>
													<div className={styles.icon}>
														{v.checkCount < v.total ? (
															<img src="./image/jly.png" alt="图标" />
														) : (
															<img src="./image/jly_1.png" alt="图标" />
														)}
													</div>
												</li>
											)
										}
									})
								) : (
									<li className={styles.noneEquipment}>暂无装备</li>
								)}
							</ul>
							{equipmentList.length > 6 && !moreEquipment ? (
								<div className={styles.moreOfficer}>
									<Button
										onClick={() => this.setState({ moreEquipment: true })}
										style={{ background: '#11193D', border: 0, color: '#fff', borderRadius: 0 }}
									>
										展开装备信息<Icon type="double-right" />
									</Button>
								</div>
							) : null}
						</div>
					) : null}

					{showVehicleDetails && moreEquipment ? (
						<div
							className={styles.equipmentMore}
							style={{ width: Math.ceil((Number(equipmentList.length) - 5) / 3) * 137 + 'px' }}
						>
							<ul>
								{equipmentList.length ? (
									equipmentList.map((v, index) => {
										if (index >= 6) {
											return (
												<li
													key={index}
													className={`${styles.equipmentLeft} ${v.checkCount < v.total
														? styles.lackof
														: null}`}
												>
													<div className={styles.information}>
														<div>
															{equipmentType &&
																equipmentType.find((x) => x.code == v.equipment_type)
																	.name}
														</div>

														<div className={styles.num}>
															{v.checkCount}/{v.total}件
														</div>
													</div>
													<div className={styles.icon}>
														{v.checkCount < v.total ? (
															<img src="./image/jly.png" alt="图标" />
														) : (
															<img src="./image/jly_1.png" alt="图标" />
														)}
													</div>
												</li>
											)
										}
									})
								) : null}
							</ul>

							<div className={styles.moreOfficersq}>
								<Button
									onClick={() => this.setState({ moreEquipment: false })}
									style={{ background: '#11193D', border: 0, color: '#fff', borderRadius: 0 }}
								>
									<Icon type="double-left" />收起装备信息
								</Button>
							</div>
						</div>
					) : null}
					<div
						className={`${styles.todayCheck}`}
						style={{
							backgroundImage: showVehicleDetails
								? "url('./image/jthc.png')"
								: "url('./image/jrhc_1.png')"
						}}
					>
						<ul>
							<li className={styles.todayCheckPeople}>
								<div className={styles.todayCheckTitle}>核查人次</div>
								<div className={styles.todayCheckText}>
									{showVehicleDetails ? comparisonMessage.length ? (
										comparisonMessage[0].portraitCount
									) : (
										0
									) : comparisonList.length ? (
										comparisonList[0].portraitCount
									) : (
										'0'
									)}{' '}
									人次
								</div>
							</li>
							<li>
								<div className={styles.todayCheckTitle}>核查车次</div>
								<div className={styles.todayCheckText}>
									{showVehicleDetails ? comparisonMessage.length ? (
										comparisonMessage[0].comparisonCount
									) : (
										0
									) : comparisonList.length ? (
										comparisonList[0].comparisonCount
									) : (
										'0'
									)}{' '}
									车次
								</div>
							</li>
							<li className={`${styles.todayCheckPeople} ${styles.todayCheckCar}`}>
								<div className={styles.todayCheckTitle}>异常人次</div>
								<div className={styles.todayCheckText}>
									{showVehicleDetails ? comparisonMessage.length ? (
										comparisonMessage[0].portraitExceptionCount
									) : (
										0
									) : comparisonList.length ? (
										comparisonList[0].portraitExceptionCount
									) : (
										'0'
									)}{' '}
									人次
								</div>
							</li>
							<li className={styles.todayCheckCar}>
								<div className={styles.todayCheckTitle}>异常车次</div>
								<div className={styles.todayCheckText}>
									{' '}
									{showVehicleDetails ? comparisonMessage.length ? (
										comparisonMessage[0].comparisonExceptionCount
									) : (
										0
									) : comparisonList.length ? (
										comparisonList[0].comparisonExceptionCount
									) : (
										'0'
									)}{' '}
									车次
								</div>
							</li>
						</ul>
					</div>
					{!showVehicleDetails ? (
						<div className={styles.globalService} style={{ backgroundImage: "url('./image/qjqw.png')" }}>
							<ul>
								<li>
									<Badge color="#00CDFF" text="应出勤人数：" />
									{/* <span className={styles.globalServiceCar}> */}
									{/* {schedules ? schedules.schedule ? schedules.schedule.vehicleCount : 0 : 0} 辆 */}
									{/* </span> */}
									<span className={styles.globalServicePeople}>
										{schedules.schedule ? schedules.schedule : 0} 人
									</span>
								</li>
								<li>
									<Badge color="#02A925" text="已出勤人数：" />
									{/* <span className={styles.globalServiceCar}> */}
									{/* {schedules ? schedules.attendance ? schedules.attendance.vehicleCount : 0 : 0} 辆 */}
									{/* </span> */}
									<span className={styles.globalServicePeople}>
										{schedules.attendance ? schedules.attendance : 0} 人
									</span>
								</li>
								<li>
									<Badge color="#FF7500" text="缺&#12288;勤人数：" />
									{/* <span className={styles.globalServiceCar}> */}
									{/* {schedules ? schedules.absence ? schedules.absence.vehicleCount : 0 : 0} 辆 */}
									{/* </span> */}
									<span className={styles.globalServicePeople}>
										{schedules.absence ? schedules.absence : 0} 人
									</span>
								</li>
							</ul>
						</div>
					) : null}

					<div className={styles.calledLove} style={{ backgroundImage: "url('./image/jcj.png')" }}>
						<ul>
							<li className={styles.calledLoveLeft}>
								<img src="./image/dqs_icon.png" alt="待签收图标" />
								<span className={styles.calledLoveTitle}>待签收</span>
								<span>{showVehicleDetails ? alarmList.wqs ? alarmList.wqs : '0' : policeAlarmCounts.wqs ? policeAlarmCounts.wqs : '0'} 条</span>
							</li>
							<li>
								<img src="./image/ddc_icon.png" alt="待到场图标" />
								<span className={styles.calledLoveTitle}>待到场</span>
								<span>{showVehicleDetails ?alarmList.wdc ? alarmList.wdc : '0'  : policeAlarmCounts.wdc? policeAlarmCounts.wdc : '0' } 条</span>
							</li>
							<li className={styles.calledLoveLeft}>
								<img src="./image/djs_icon.png" alt="待结束图标" />
								<span className={styles.calledLoveTitle}>待结束</span>
								<span>{showVehicleDetails ? alarmList.wjs? alarmList.wjs : '0'  : policeAlarmCounts.wjs? policeAlarmCounts.wjs : '0' } 条</span>
							</li>
							<li>
								<img src="./image/dfk_icon.png" alt="待反馈图标" />
								<span className={styles.calledLoveTitle}>待反馈</span>
								<span>{showVehicleDetails ? alarmList.wfk? alarmList.wfk : '0'  : policeAlarmCounts.wfk? policeAlarmCounts.wfk : '0' } 条</span>
							</li>
							<li className={styles.calledLoveLeft}>
								<img src="./image/wdjq_icon.png" alt="警情图标" />
								<span className={styles.calledLoveTitle}>{showVehicleDetails ? '我的警情' : '全局警情'}</span>
								<span>{showVehicleDetails ? alarmList.wdjq? alarmList.wdjq : '0'  : policeAlarmCounts.total? policeAlarmCounts.total : '0' } 条</span>
							</li>
							<li>
								<img src="./image/ywj_icon.png" alt="已完结图标" />
								<span className={styles.calledLoveTitle}>已完结</span>
								<span>{showVehicleDetails ? alarmList.yfk? alarmList.yfk : '0'  : policeAlarmCounts.yfk? policeAlarmCounts.yfk : '0' } 条</span>
							</li>
						</ul>
					</div>
					{!showVehicleDetails ? (
						<div className={styles.timeDynamic} style={{ backgroundImage: "url('./image/ssdt.png')" }}>
							<ul>
								<li className={styles.timeDynamicItem}>
									<div className={styles.timeDynamicNum}>
										{vehicleStatusList.length ? vehicleStatusList[0].online : '0'}
									</div>
									<div className={styles.timeDynamicText}>在线车辆</div>
								</li>
								<li>
									<div className={styles.timeDynamicNum}>
										{vehicleStatusList.length ? vehicleStatusList[0].offline : '0'}
									</div>
									<div className={styles.timeDynamicText}>离线车辆</div>
								</li>
							</ul>
						</div>
					) : (
						<div className={styles.vehicleOfficer} style={{ backgroundImage: 'url(./image/cljy.png)' }}>
							<ul>
								<li>
									<Badge color="#00CDFF" text="应出勤：" />
									<span>{scheduleCount.length ? scheduleCount[0].scheduleCounts : 0}人</span>
								</li>
								<li>
									<Badge color="#ecc551" text="缺勤：" />
									<span>{scheduleCount.length ? scheduleCount[0].absenceCounts : 0}人</span>
								</li>
								<li>
									<Badge color="#02A925" text="实际出勤：" />
									<span>{scheduleCount.length ? scheduleCount[0].attendanceCounts : 0}人</span>
								</li>
							</ul>
							{scheduleList.length ? (
								<div className={styles.moreOfficer}>
									<Button
										onClick={() =>
											this.setState({
												showOfficerDetails: !showOfficerDetails,
												setLeft: 0,
												upDown: 'up'
											})}
										style={{ background: '#11193D', border: 0, color: '#fff', borderRadius: 0 }}
									>
										{showOfficerDetails ? <Icon type="double-left" /> : ''}
										{showOfficerDetails ? '收起警员信息' : '查看警员信息'}
										{showOfficerDetails ? '' : <Icon type="double-right" />}
									</Button>
								</div>
							) : null}
						</div>
					)}

					{showOfficerDetails ? (
						<div className={styles.officerDetails}>
							<div className={styles.officerDetailsMore}>
								<ul
									style={{
										width: `${scheduleList.length * 292}${'px'}`,
										left: `${setLeft}${'px'}`
									}}
								>
									{scheduleList.map((v, k) => (
										<li style={{ backgroundImage: 'url(./image/jyxx.png)' }} key={k}>
											<div className={styles.information}>
												<div>姓名： {v.policename}</div>
												<div>编号： {v.pcard}</div>
												<div>{v.departmentname}</div>
											</div>
											<div className={styles.portrait}>
												<img src={v.photo ? v.photo : './image/moren.png'} alt="" />
											</div>
											<div
												className={`${styles.officerDetailsState} ${v.sign_identification !=
												'qd'
													? styles.officerDetailsCo
													: null}`}
											>
												{v.sign_identification == 'qd' ? '出勤中' : '缺勤'}
											</div>
										</li>
									))}
								</ul>
							</div>
							}
							{scheduleList.length > 4 ? (
								<div className={styles.officerDetailsMoreBtn}>
									{/* <Button.Group> */}
									<Button
										type="primary"
										size="large"
										disabled={upDown == 'up'}
										onClick={() => {
											const num = setLeft + 292
											if (scheduleList.length * 292 - 1168 >= num * -1 && setLeft * -1 > 0) {
												if (num * -1 == 0) {
													this.setState({ setLeft: num, upDown: 'up' })
												} else {
													this.setState({ setLeft: num, upDown: '' })
												}
											} else {
												this.setState({ upDown: 'up' })
											}
										}}
									>
										<Icon type="left" />
									</Button>
									<Button
										type="primary"
										size="large"
										disabled={upDown == 'down'}
										onClick={() => {
											const num = setLeft - 292
											if (scheduleList.length * 292 - 1168 > num * -1) {
												this.setState({ setLeft: num, upDown: '' })
											} else if (scheduleList.length * 292 - 1168 == num * -1) {
												this.setState({ setLeft: num, upDown: 'down' })
											} else {
												this.setState({ upDown: 'down' })
											}
										}}
									>
										<Icon type="right" />
									</Button>
									{/* </Button.Group> */}
								</div>
							) : null}
						</div>
					) : null}
				</div>
				<div className={styles.rightMune} style={{ backgroundImage: "url('./image/miaobian.png')" }}>
					<ul>
						<li
							title="警车"
							onClick={() => {
								if (!this.state.showCar) {
									this.showReportLocation()
								} else {
									this.state.sourceCar.clear()
									this.state.showCarVector.setSource(null)
								}
								document.getElementById('popup-content').innerHTML = ''
								this.setState({ showCar: !this.state.showCar, showVehicleDetails: false })
							}}
							className={`${styles.rightIconCar} ${showCar ? styles.atvice : null}`}
						>
							<img src="./image/car_icon.png" alt="警车" />
						</li>
						<li
							title="视频监控"
							onClick={() => {
								if (!this.state.showMonitoring) {
									// this.monitoringPoint()
									this.getBayonetsList(2)
								} else {
									// this.setState({monitoringList:[]})
									this.state.sourceMonitoring.clear()
									this.state.showMonitoringVector.setSource(null)
								}
								this.setState({ showMonitoring: !this.state.showMonitoring })
							}}
							className={`${styles.rightIconSxt} ${showMonitoring ? styles.atvice : null}`}
						>
							<img src="./image/spjk.png" alt="视频监控" />
						</li>
						<li
							title="一三五包围圈"
							onClick={() => {
								if (!this.state.showEncirclement) {
									this.showWarningFun()
								} else {
									this.state.sourceWarning.clear()
									this.state.showWaringVector.setSource(null)
								}
								this.setState({ showEncirclement: !this.state.showEncirclement })
							}}
							className={`${styles.rightIconSxt} ${showEncirclement ? styles.atvice : null}`}
						>
							<img src="./image/jqicon.png" alt="一三五包围圈" />
						</li>
						<li
							title="警务站"
							onClick={() => {
								if (!this.state.showPoliceStation) {
									this.getBayonetsList(4)
								} else {
									this.state.sourceStation.clear()
									this.state.showStationVector.setSource(null)
								}
								this.setState({ showPoliceStation: !this.state.showPoliceStation })
							}}
							className={`${styles.rightIconSxt} ${showPoliceStation ? styles.atvice : null}`}
						>
							<img src="./image/jwz_icon.png" alt="警务站" />
						</li>
						<li
							title="对讲机"
							onClick={() => {
								if (!this.state.showIntercom) {
									this.intercomPoint()
								} else {
									this.state.sourceIntercom.clear()
									this.state.showIntercomVector.setSource(null)
								}
								this.setState({ showIntercom: !this.state.showIntercom })
							}}
							className={`${styles.rightIconDj} ${showIntercom ? styles.atvice : null}`}
						>
							<img src="./image/dj_icon.png" alt="对讲机" />
						</li>
						<li
							title="卡口"
							onClick={() => {
								if (!this.state.showCamera) {
									this.getBayonetsList(1)
								} else {
									this.state.sourceBayonet.clear()
									this.state.showBayonetVector.setSource(null)
								}
								this.setState({ showCamera: !this.state.showCamera })
							}}
							className={`${styles.rightIconSxt} ${showCamera ? styles.atvice : null}`}
						>
							<img src="./image/sxt_icon.png" alt="卡口" />
						</li>
						<li
							title="热力图"
							onClick={() => {
								if (!this.state.showHeat) {
									this.getHeatMap()
								} else {
									this.state.sourceHeat.clear()
									this.state.vectorHeat.setSource(null)
								}
								this.setState({ showHeat: !this.state.showHeat })
							}}
							className={`${styles.rightIconSxt} ${showHeat ? styles.atvice : null}`}
						>
							<img src="./image/rlt.png" alt="热力图" />
						</li>

						<li
							title="重点场所"
							onClick={() => {
								if (!this.state.showPlace) {
									this.getBayonetsList(3)
								} else {
									this.state.sourcePlace.clear()
									this.state.showPlaceVector.setSource(null)
								}
								this.setState({ showPlace: !this.state.showPlace })
							}}
							className={`${styles.rightIconSxt} ${showPlace ? styles.atvice : null}`}
						>
							<img src="./image/zdcs.png" alt="重点场所" />
						</li>
						<li
							title="移动单兵设备"
							onClick={() => {
								if (!this.state.showIndividual) {
									this.individualPoint()
								} else {
									this.state.sourceIndividual.clear()
									this.state.showIndividualVector.setSource(null)
								}
								this.setState({ showIndividual: !this.state.showIndividual })
							}}
							className={`${styles.rightIconSxt} ${showIndividual ? styles.atvice : null}`}
						>
							<img src="./image/yddb.png" alt="移动单兵设备" />
						</li>
						{/* <li onClick={() => this.setState({showAccording: !showAccording})} className={`${styles.rightIconLo} ${ showAccording ? styles.atvice : null}`}>
                            <img src="./image/look_icon.png" alt="查看"/>
                        </li>
                        <li onClick={() => this.setState({showVoice: !showVoice})} className={`${styles.rightIconYy} ${ showVoice ? styles.atvice : null}`}>
                            <img src="./image/yy_icon.png" alt="语音"/>
                        </li> */}
						<li
							title="放大"
							onClick={() => {
								// if (!this.state.isds) {
									this.amplification()
								// }
							}}
							className={`${styles.rightIconAdd} ${styles.amplification}`}
						>
							<img src="./image/add_icon.png" alt="放大" />
						</li>
						<li
							title="缩小"
							onClick={() => {
                                // if (!this.state.isds) {
									this.narrow()
								// }
							}}
							className={`${styles.rightIconPase} ${styles.narrow}`}
						>
							<img src="./image/pase_icon.png" alt="缩小" />
						</li>
						{/* <li onClick={() => this.setState({showPositioning: !showPositioning})} className={`${styles.rightIconDw} ${ showPositioning ? styles.atvice : null}`}>
                            <img src="./image/dw_icon.png" alt="定位"/>
                        </li>
                        <li onClick={() => this.setState({showSignal: !showSignal})} className={`${styles.rightIconXh} ${ showSignal ? styles.atvice : null}`}>
                            <img src="./image/xh_icon.png" alt="信号灯"/>
                        </li>
                        <li onClick={() => this.showGlobal()} title="显示全局" className={`${styles.rightIconMore} ${styles.showGlobal}`}>
                            <img src="./image/more_icon.png" alt="菜单" title="显示全局"/>
                        </li> */}
					</ul>
				</div>
				{this.state.showWarning ? (
					<div className={styles.warnings}>
						<WarningDetails
							files={this.state.warningInfor.show}
							code={this.state.warningInfor.code}
							closes={(e) => {
								// this.captureWarning(this.state.warningInfor,'展开','./image/zhankai.png')
								// this.state.overlay.setPosition(new ol.proj.transform(num, 'EPSG:4326', 'EPSG:3857'));
								this.setState({
									warningInfor: {},
									showWarning: false,
									showCarWarning: false,
									mapClik: true
								})
								// var packUp = document.getElementById(`${'packUp'}${e}`);
								// var captureBtnIcon = document.getElementById(`${'captureBtnIcon'}${e}`);
								// packUp.innerHTML = '展开';
								// captureBtnIcon.src = './image/zhankai.png';
							}}
						/>
					</div>
				) : null}
				{this.state.showCarWarning ? (
					<div className={styles.warnings}>
						<Warningplace
							files={this.state.warningInfor.show}
							code={this.state.warningInfor.code}
							closes={(e) => {
								// var packUp = document.getElementById(`${'packUp'}${e}`);
								// var captureBtnIcon = document.getElementById(`${'captureBtnIcon'}${e}`);
								// packUp.innerHTML = '展开';
								// captureBtnIcon.src = './image/zhankai.png';
								// this.captureWarning(this.state.warningInfor,'展开','./image/zhankai.png')
								// this.state.overlay.setPosition(new ol.proj.transform(num, 'EPSG:4326', 'EPSG:3857'));
								this.setState({
									warningInfor: {},
									showCarWarning: false,
									showWarning: false,
									mapClik: true
								})
							}}
						/>
					</div>
				) : null}
			</div>
		)
	}
}

export default Form.create()(Home)
