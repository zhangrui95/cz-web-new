import React, { Component } from 'react'
import moment from 'moment'
import { Form, Input, Modal, TreeSelect, Select, Message, DatePicker, Row, Col, Radio, Icon, Button } from 'antd'
import ol from 'openlayers'
import ReactEcharts from 'echarts-for-react'
import echarts from 'echarts'
import styles from './../index.less'
import { connect } from 'dva'
import Calendar from 'react-calendar'
var mapClick = null
let current_month = []
import {
	initView,
	offlineMapLayer,
	initshowVectorP,
	initShowVectorPoint,
	initShowVector,
	highlightCarLocationStyle
} from '@/utils/olUtils'
@connect(({ service, loading }) => ({
	service,
	loading: loading.models.service
}))
class FormModal extends Component {
	state = {
		value: 1,
		map: null,
		view: null,
		vector: null,
		source: null,
		showVector: null,
		showVectorPoint: null,
		newSource: null,
		sourceHeat: null,
		vectorHeat: null
	}
	componentWillMount() {}
	componentDidMount() {
		// 初始化地图
		console.log('111111111111111111')
		this.initMap()

		var lastMonth = []
		for (var i = 0; i <= 30; i++) {
			//  console.log(new Date(new Date().setDate(new Date().getDate()-i-1)).toLocaleDateString().replace(/\//g, '-'))
			lastMonth.unshift(
				new Date(new Date().setDate(new Date().getDate() - i - 1)).toLocaleDateString().replace(/\//g, '-')
			)
		}
		// console.log(lastMonth)
		current_month = lastMonth
		document.oncontextmenu = function() {
			event.returnValue = false
		}
		if (this.state.value == 1) {
			this.getAllGpsLabelById()
			this.getPoliceAlarmCountByDate()
			this.getPoliceAlarmListByDate()
		}
	}
	getAllGpsLabelById = () => {
		const { dispatch, rangeValue } = this.props
		console.log(rangeValue)
		var _self = this
		dispatch({
			type: 'service/getAllGpsLabelById',
			payload: {
				label_id: rangeValue.label_area_id
			},
			success: (e) => {
				if (e.result.reason.code == '200') {
					_self.showPolygonLoop()
				} else {
					return false
				}
			}
		})
	}
	getPoliceAlarmCountByDate = () => {
		const { dispatch, rangeValue } = this.props
		console.log(rangeValue)
		var _self = this
		dispatch({
			type: 'service/getPoliceAlarmCountByDate',
			payload: {
				gxdwdm: rangeValue.code,
				label_id: rangeValue.label_area_id
			}
		})
	}
	getFlowDensitysCountByDate = () => {
		const { dispatch, rangeValue } = this.props
		console.log(rangeValue)
		var _self = this
		dispatch({
			type: 'service/getFlowDensitysCountByDate',
			payload: {
				density_organization_code: rangeValue.code,
				label_id: rangeValue.label_area_id
			}
		})
	}
	getPoliceAlarmListByDate = (bp) => {
		const { dispatch, rangeValue } = this.props
		console.log(rangeValue)
		var _self = this
		const formData = bp || {
			gxdwdm: rangeValue.code,
			label_id: rangeValue.label_area_id
		}
		dispatch({
			type: 'service/getPoliceAlarmListByDate',
			payload: formData,
			success: (e) => {
                if (e.result.reason.code == '200') {
					_self.getHeatMap()
				} else {
					return false
				}
				
			}
		})
	}
	getFlowDensitysListByDate = (bp) => {
		const { dispatch, rangeValue } = this.props
		console.log(rangeValue)
		var _self = this
		const formData = bp || {
			density_organization_code: rangeValue.code,
			label_id: rangeValue.label_area_id
		}
		dispatch({
			type: 'service/getFlowDensitysListByDate',
			payload: formData,
			success: (e) => {
                if (e.result.reason.code == '200') {
					_self.getHeatMap()
				} else {
					return false
				}
			}
		})
	}
	showPolygonLoop = () => {
		var _self = this
		let { vector, view, map, source } = this.state
		const { service: { unitIdGpsList } } = this.props
		console.log('多线条', unitIdGpsList)

		//实例一个线的全局变量
		var geometry = new ol.geom.Polygon() //线,Point 点,Polygon 面
		console.log('===gps', unitIdGpsList)
		let arr = []
		if (unitIdGpsList) {
			if (unitIdGpsList.length) {
				//根据gps点构建网格
				for (let index = 0; index < unitIdGpsList.length; index++) {
					const element = unitIdGpsList[index]
					if (element.label_type == 2) {
						if (element.label_gps_point && element.label_gps_point.length) {
							console.log('11111111111', element.label_gps_point)

							const polygonFeature = new ol.Feature({
								geometry: new ol.geom.Polygon([ element.label_gps_point ])
							})
							polygonFeature.setStyle(
								new ol.style.Style({
									stroke: new ol.style.Stroke({
										color: '#3BBCF5',
										size: 3,
										width: 2,
										lineDash: [ 1, 2, 3, 4, 5, 6 ]
									})
								})
							)
							polygonFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
							source.addFeature(polygonFeature)
							vector.setSource(source)
							for (let i = 0; i < element.label_gps_point.length; i++) {
								//获取轨迹点位各点坐标
								arr.push(ol.proj.fromLonLat(element.label_gps_point[i]))
							}
							//设置中心点
							let exent = ol.extent.boundingExtent(arr)
							let center = ol.extent.getCenter(exent)
							view.fit(exent)
							view.setCenter(center)
						}
					} else if (element.label_type == 5) {
						if (element.label_gps_point) {
							console.log('222222222222222', element.label_gps_point)
							const polygonFeature = new ol.Feature({
								geometry: new ol.geom.LineString(element.label_gps_point)
							})
							polygonFeature.setStyle(
								new ol.style.Style({
									stroke: new ol.style.Stroke({
										color: '#44B269',
										size: 3,
										width: 4
									})
								})
							)
							polygonFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
							source.addFeature(polygonFeature)
							const startFeature = new ol.Feature({
								geometry: new ol.geom.Point(element.label_gps_point[0])
							})
							startFeature.setStyle(
								new ol.style.Style({
									image: new ol.style.Icon({
										scale: 0.8, // 图标缩放比例 // 0为离线其他为在线
										src: './image/syqd.png' // 图标的url
									})
								})
							)
							startFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
							source.addFeature(startFeature)
							const num = element.label_gps_point.length
							const endPoint = new ol.Feature({
								geometry: new ol.geom.Point(element.label_gps_point[num - 1])
							})
							endPoint.setStyle(
								new ol.style.Style({
									image: new ol.style.Icon({
										scale: 0.8, // 图标缩放比例 // 0为离线其他为在线
										src: './image/syzhd.png' // 图标的url
									})
								})
							)
							endPoint.getGeometry().transform('EPSG:4326', 'EPSG:3857')
							source.addFeature(endPoint)
							vector.setSource(source)
						}
					} else if (element.label_type == 4) {
						if (element.label_gps_point) {
							console.log('333333333333', element.label_gps_point)
							const pointFeature = new ol.Feature({
								geometry: new ol.geom.Point(element.label_gps_point)
							})
							pointFeature.setStyle(
								new ol.style.Style({
									image: new ol.style.Icon({
										scale: 0.8, // 图标缩放比例 // 0为离线其他为在线
										src: './image/syxd.png' // 图标的url
									})
								})
							)
							pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
							source.addFeature(pointFeature)
							vector.setSource(source)
						}
					} else if (element.label_type == 3) {
						if (element.label_gps_point) {
							console.log('44444444444444444', element.label_gps_point)

							const pointFeature = new ol.Feature({
								geometry: new ol.geom.Point(element.label_gps_point)
							})
							pointFeature.setStyle(
								new ol.style.Style({
									image: new ol.style.Icon({
										scale: 0.8, // 图标缩放比例 // 0为离线其他为在线
										src: './image/syzd.png' // 图标的url
									})
								})
							)
							pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
							source.addFeature(pointFeature)
							vector.setSource(source)
						}
					}
				}
			}
		}
	}
	//在地图上渲染热力图
	getHeatMap = () => {
		const { sourceHeat, map, vectorHeat, value } = this.state

		const { service: { thermalList } } = this.props
		let heatData = {
			type: 'FeatureCollection',
			features: []
		}
		sourceHeat.clear()
		vectorHeat.setSource(null)
		console.log(thermalList)
		if (thermalList && thermalList.length) {
			for (let index = 0; index < thermalList.length; index++) {
				const element = thermalList[index]
				if (element.gps) {
					// let weightNum = Math.random()
					let weightNum = 0.6
					heatData.features.push({
						type: 'Feature',
						geometry: { type: 'Point', coordinates: element.gps },
						properties: { weight: value == 1 ? weightNum : Number(element.flow_density) / 100 }
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
	formatDate(date) {
		date = new Date(date)
		let myyear = date.getFullYear()
		let mymonth = date.getMonth() + 1
		let myweekday = date.getDate()
		mymonth < 10 ? (mymonth = '0' + mymonth) : mymonth
		myweekday < 10 ? (myweekday = '0' + myweekday) : myweekday
		return `${myyear}-${mymonth}-${myweekday}`
	}
	// 获取当前月的天数
	mGetDate() {
		var date = new Date()
		var year = date.getFullYear()
		var month = date.getMonth() + 1
		var d = new Date(year, month, 0)
		return d.getDate()
	}

	getLineCar = () => {
		const { service: { tatisticsList }, loading } = this.props
		// console.log(tatisticsList)

		let first_paragraph = [],
			months = [],
			second_paragraph = [],
			third_paragraph = [],
			fourth_paragraph = []
		for (let index = 0; index < tatisticsList.length; index++) {
			const element = tatisticsList[index]
			if (this.state.value == 1) {
				months.push(element.bjrq)
			} else {
				months.push(element.sjrq)
			}

			first_paragraph.push(element.h1)
			second_paragraph.push(element.h2)
			third_paragraph.push(element.h3)
			fourth_paragraph.push(element.h4)
		}

		return {
			title: {
				text: '趋势分析',
				left: 'left',
				textStyle: {
					color: '#fff'
				}
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				containLabel: true
			},
			color: [ '#6FBAE1', '#90E5E7', '#FBE289', '#FBB8A1' ],
			tooltip: {
				trigger: 'axis',
				//  formatter: '{b} ： {c} 条',
				axisPointer: {
					type: 'shadow',
					label: {
						// backgroundColor: '#6a7985'
					}
				}
			},
			legend: {
				data: [ '0点到6点', '6点到12点', '12点到18点', '18点到24点' ],
				textStyle: {
					color: '#fff'
				}
			},

			xAxis: {
				type: 'category',
				data: !loading ? months : current_month,
				boundaryGap: false,
				axisLabel: {
					// x轴线 标签修改
					textStyle: {
						color: '#fff' //坐标值得具体的颜色
					}
				},
				axisLine: {
					show: true, // X轴 网格线 颜色类型的修改
					lineStyle: {
						color: '#fff'
					}
				}
			},
			yAxis: {
				type: 'value',
				axisLabel: {
					// x轴线 标签修改
					textStyle: {
						color: '#fff' //坐标值得具体的颜色
					}
				},
				axisLine: {
					show: true, // X轴 网格线 颜色类型的修改
					lineStyle: {
						color: '#fff'
					}
				}
			},
			series: [
				{
					name: '0点到6点',
					data: first_paragraph,
					type: 'line',
					areaStyle: {}
				},
				{
					name: '6点到12点',
					data: second_paragraph,
					type: 'line',
					areaStyle: {}
				},
				{
					name: '12点到18点',
					data: third_paragraph,
					type: 'line',
					areaStyle: {}
				},
				{
					name: '18点到24点',
					data: fourth_paragraph,
					type: 'line',
					areaStyle: {}
				}
			]
		}
	}
	onChange = (e) => {
		console.log('radio checked', e.target.value)
		if (e.target.value == 1) {
			this.getAllGpsLabelById()
			this.getPoliceAlarmCountByDate()
			this.getPoliceAlarmListByDate()
		} else {
			this.getAllGpsLabelById()
			this.getFlowDensitysCountByDate()
			this.getFlowDensitysListByDate()
		}
		this.setState({
			value: e.target.value
		})
	}
	initMap = () => {

		// 创建地图
		const view = initView()

		// 指定地图要显示在id为map的div中
		var map = new ol.Map({
			view: view,
			target: 'map',
			layers: []
		})
		map.addLayer(offlineMapLayer())
		//实例化一个矢量图层Vector作为绘制层
		var source = new ol.source.Vector({})
		// var newSource = new ol.source.Vector({})
		var vector = new ol.layer.Vector({
			source: source
			// style: new ol.style.Style({
			// 	fill: new ol.style.Fill({
			// 		color: 'rgba(224,156,25, 0.2)'
			// 	}),
			// 	stroke: new ol.style.Stroke({
			// 		color: '#5358FD',
			// 		width: 2
			// 	}),
			// 	image: new ol.style.Circle({
			// 		radius: 6,
			// 		fill: new ol.style.Fill({
			// 			color: '#FF0000'
			// 		})
			// 	})
			// })
		})
		const sourceHeat = new ol.source.Vector({})
		const vectorHeat = new ol.layer.Heatmap({
			source: sourceHeat,
			blur: parseInt(22, 10),
			radius: parseInt(18, 15),
			gradient: [ '#04fbb2', '#18fb04', '#fbd804', '#f94000', '#b30303' ] //颜色
		})
		map.addLayer(vector) //将绘制层添加到地图容器中
		map.addLayer(vectorHeat)

		// //为地图容器添加单击事件监听
		// map.on('click', function(evt) {})
		// // 为地图容器添加双击事件
		// map.on('dblclick', function(event) {})
		// /**
		// * 为map添加鼠标移动事件监听，当指向标注时改变鼠标光标状态
		// */
		// /*        map.on('pointermove', function (e) {
		//                 var pixel = map.getEventPixel(e.originalEvent);
		//                 var hit = map.hasFeatureAtPixel(pixel);
		//                 map.getTargetElement().style.cursor = hit ? 'pointer' : '';
		//             });*/
		// map.on('singleclick', (e) => {
		// 	console.log('单击')
		// })

		// var showVector = initShowVector()
		// var showVectorPoint = initShowVectorPoint()
		// map.addLayer(showVector)
		// map.addLayer(showVectorPoint)

		this.setState({
			map: map,
			view: view,
			vector: vector,
			source: source,
			vectorHeat: vectorHeat,
			sourceHeat: sourceHeat
			// showVector: showVector,
			// showVectorPoint: showVectorPoint,
			// newSource: newSource
		})
	}
	/**
   *  图层初始化
   *  */
	initLayers = () => {
		console.log('图层初始化')
		const { map, vector, showVector, showVectorPoint, source, newSource } = this.state
		vector.setSource(null)
		showVector.setSource(null)
		showVectorPoint.setSource(null)
		source.clear()
		newSource.clear()
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
	onclick = {
		click: this.clickEchartsPie.bind(this)
	}
	clickEchartsPie(e) {
		console.log(e)
		const { dispatch, rangeValue } = this.props
		let formData = {}
		if (this.state.value == 1) {
			formData = {
				gxdwdm: rangeValue.code,
				label_id: rangeValue.label_area_id,
				endDate: `${e.name} ${e.seriesIndex == 0
					? '06:00:00'
					: e.seriesIndex == 1 ? '12:00:00' : e.seriesIndex == 2 ? '18:00:00' : '24:00:00'}`,
				startDate: `${e.name} ${e.seriesIndex == 0
					? '00:00:00'
					: e.seriesIndex == 1 ? '06:00:00' : e.seriesIndex == 2 ? '12:00:00' : '18:00:00'}`
			}
			this.getPoliceAlarmListByDate(formData)
		} else {
			formData = {
				density_organization_code: rangeValue.code,
				label_id: rangeValue.label_area_id,
				endDate: `${e.name} ${e.seriesIndex == 0
					? '06:00:00'
					: e.seriesIndex == 1 ? '12:00:00' : e.seriesIndex == 2 ? '18:00:00' : '24:00:00'}`,
				startDate: `${e.name} ${e.seriesIndex == 0
					? '00:00:00'
					: e.seriesIndex == 1 ? '06:00:00' : e.seriesIndex == 2 ? '12:00:00' : '18:00:00'}`
			}
			this.getFlowDensitysListByDate(formData)
		}
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
	close = () => {
		console.log('close')
		this.props.handleModalVisible()
	}
	render() {
		const { modalVisible, loading, handleModalVisible, service: { unitIdGpsList } } = this.props
		return (
			// <Modal
			// 	destroyOnClose
			// 	confirmLoading={loading}
			// 	visible={modalVisible}
			// 	maskClosable={false}
			// 	footer={null}
			// 	width={'1352px'}
			// 	height={'919px'}
			// 	style={{ top: 20 }}
			// 	onCancel={handleModalVisible}
			// >
			<div className={styles.models}>
				<div className={styles.modelsCon}>
					<Button icon="close" className={styles.modelsClose} onClick={() => this.close()} />
					<Row>
						<Col span={22}>
							<div className={styles.brokenLine}>
								<div className={styles.brokenContent}>
									<ReactEcharts
										option={this.getLineCar()}
										style={{ height: '300px' }}
										className="react_for_echarts"
										ref={(node) => {
											this.echartspie = node
										}}
										onEvents={this.onclick}
									/>
								</div>
							</div>
						</Col>
						<Col span={2}>
							<Radio.Group
								onChange={this.onChange}
								value={this.state.value}
								style={{ marginTop: '55px' }}
							>
								<Radio value={1} style={{ color: this.state.value == 1 ? '#00BAFF' : '#fff' }}>
									警情
								</Radio>
								<Radio
									value={2}
									style={{ marginTop: '10px', color: this.state.value == 2 ? '#00BAFF' : '#fff' }}
								>
									人流
								</Radio>
							</Radio.Group>
						</Col>
					</Row>
					<div className={styles.thermal}>
						<div className={styles.thermalTitle}>热力分析</div>
						<div className={styles.calendar}>
							<div id="map" className={styles.mapDivStyle} />
						</div>
					</div>
				</div>
			</div>
			//  </Modal>
		)
	}
}

export default Form.create()(FormModal)
