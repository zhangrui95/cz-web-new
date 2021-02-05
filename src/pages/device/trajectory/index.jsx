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
	Modal,
	TreeSelect
} from 'antd'
import React, { Component } from 'react'
import { connect } from 'dva'
import styles from './style.less'
import { tableList } from '@/utils/utils'
const { RangePicker } = DatePicker
const FormItem = Form.Item
import { cardNoRule } from '@/utils/validator'
import myplanImg from '../../../assets/posicon.gif'
import ol from 'openlayers'
import { initView, offlineMapLayer, trajectoryVector, carVector } from '@/utils/olUtils'
import { authorityIsTrue } from '@/utils/authority'
var latreg = /^(\-|\+)?([0-8]?\d{1}\.\d{0,20}|90\.0{0,20}|[0-8]?\d{1}|90)$/
var longrg = /^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,20})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,20}|180)$/
var path = [],
	original = [],
	pathIndex = 0, // 路径点索引
	marker = null, //移动点
	splitNumber = 10, // 每两个经纬度之间的分割点
	setIntervalTime = 100, // 移动点间隔时间
	intervalLader = null,
	// myplanImg = myplanImg, // 移动点的图片
	helpTooltipElement = null, // 平台信息div
	helpTooltip = null // 平台信息overlay
@connect(({ trajectory, loading }) => ({
	trajectory,
	loading: loading.models.trajectory
}))
class trajectory extends Component {
	state = {
		formValues: {},
		map: null,
		vector: null,
		source: null,
		view: null,
		circle: null,
		sourceTrajectory: null,
		showTrajectoryVector: null,
		sourceCar: null,
		showCarVector: null,
		playing: false,
		showPlay: false,
		tracking: false,
		trackType: ''
	}

	componentDidMount() {
		const { match: { params: { files, page } } } = this.props
		// 绘制地图
		this.initMap()
		//禁止鼠标右键
		document.oncontextmenu = function() {
			event.returnValue = false
		}
	}

	getTableData = (pd) => {
		const { dispatch, match: { params: { files, pages } } } = this.props
		this.initLayers()

		const pds = pd || {
			ifDay: '1'
		}

		const param = { ...pds, vehicle_id: files }

		console.log(param)
		dispatch({
			type: 'trajectory/fetchList',
			payload: param,
			success: (e) => {
				console.log(e)

				if (e.result.reason.code == '200') {
					this.showPolygonLoop(e.result.list)
				} else {
					return false
				}
			}
		})
	}

	// 查询条件重置
	handleFormReset = () => {
		const { form } = this.props
		form.resetFields()
		this.setState({
			formValues: {},
			playing: false,
			showPlay: false,
			tracking: false,
			trackType: ''
		})
		this.getTableData()
		window.clearInterval(intervalLader)

		pathIndex = 0
		setIntervalTime = 100
		path = []
		original = []
		this.state.showTrajectoryVector.setSource(null)
		this.state.sourceTrajectory.clear()
		this.state.showCarVector.setSource(null)
		this.state.sourceCar.clear()
	}

	handleSubmit = (e) => {
		e.preventDefault()
		const { form } = this.props

		form.validateFields((err, fieldsValue) => {
			if (err) return
			console.log('fieldsValue', fieldsValue)
			const rangeTimeValue = fieldsValue.selectTime
			const rangeValue = fieldsValue['range_picker']
			const values = {
				startTime: rangeValue ? (rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss') : null) : null,
				endTime: rangeValue ? (rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss') : null) : null,
				ifDay: '0'
			}

			this.setState({
				formValues: values,
				playing: false,
				showPlay: false,
				tracking: false,
				trackType: ''
			})
			window.clearInterval(intervalLader)
			pathIndex = 0
			setIntervalTime = 100
			path = []
			original = []
			this.state.showTrajectoryVector.setSource(null)
			this.state.sourceTrajectory.clear()
			this.state.showCarVector.setSource(null)
			this.state.sourceCar.clear()
			this.getTableData(values)
		})
	}
	//绘制地图
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
		map.addLayer(offlineMapLayer()) // 将地图加载上来
		//实例化一个矢量图层Vector作为绘制层
		//实例化一个机构边界的source
		const source = new ol.source.Vector({})
		const sourceTrajectory = new ol.source.Vector({})
		const sourceCar = new ol.source.Vector({})
		var vector = new ol.layer.Vector({
			source: source,
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

		//为地图容器添加单击事件监听
		map.on('click', function(evt) {})
		// 为地图容器添加双击事件
		map.on('dblclick', function(event) {})
		/**
        * 为map添加鼠标移动事件监听，当指向标注时改变鼠标光标状态
        */

		map.on('singleclick', (e) => {
			console.log('单击')
		})
		map.addLayer(vector) //将绘制层添加到地图容器中
		const showTrajectoryVector = trajectoryVector()
		const showCarVector = carVector()
		map.addLayer(showTrajectoryVector)
		map.addLayer(showCarVector)
		this.setState(
			{
				circle: circle,
				map: map,
				view: view,
				vector: vector,
				source: source,
				showTrajectoryVector: showTrajectoryVector,
				sourceTrajectory: sourceTrajectory,
				sourceCar: sourceCar,
				showCarVector: showCarVector
			},
			() => {
				_self.getTableData()
			}
		)
	}
	//绘制轨迹
	showPolygonLoop = (files) => {
		var _self = this
		const { view, map, vector, sourceTrajectory, showTrajectoryVector } = this.state
		//实例一个线(标记点)的全局变量
		var geometry = new ol.geom.LineString() //线,Point 点,Polygon 面
		const arr = []

		let position = [],
			positions = []
		// console.log(files)
		let tempprolineFeatureList = []
		showTrajectoryVector.setSource(null)
		sourceTrajectory.clear()
		if (files.length) {
			for (let i = 0; i < files.length; i++) {
				if (files[i] && files[i].gps_point) {
					if (longrg.test(files[i].gps_point[0]) && latreg.test(files[i].gps_point[1])) {
						path.push(this.transform(files[i].gps_point[0], files[i].gps_point[1]))
						original.push(this.transform(files[i].gps_point[0], files[i].gps_point[1]))
					}
				}
			}

			// console.log(path)
			_self.analysisPath(path)

			var startStyle = new ol.style.Style({
				image: new ol.style.Icon /** @type {olx.style.IconOptions} */({
					// anchor: [0.5, 0.8],
					opacity: 0.8,
					src: 'image/syqd.png'
					/*anchorXUnits: 'fraction', anchorYUnits: 'pixels', opacity: 0.75,*/
				})
			})
			var endStyle = new ol.style.Style({
				image: new ol.style.Icon /** @type {olx.style.IconOptions} */({
					src: 'image/syzhd.png'
					// anchor: [0.5, 0.8],
				})
			})

			const lineFeature = new ol.Feature(new ol.geom.LineString(path))
			lineFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
			sourceTrajectory.addFeature(lineFeature)
			var startFeature = new ol.Feature({
				//起点
				geometry: new ol.geom.Point(path[0]),
				population: 4000,
				rainfall: 500
			})
			startFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
			startFeature.setStyle(startStyle)
			sourceTrajectory.addFeature(startFeature)
			var endFeature = new ol.Feature({
				//终点
				geometry: new ol.geom.Point(path[path.length - 1]),
				population: 4000,
				rainfall: 500
			})
			endFeature.setStyle(endStyle)
			endFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
			sourceTrajectory.addFeature(endFeature)

			showTrajectoryVector.setSource(sourceTrajectory)

			for (let i = 0; i < path.length; i++) {
				//获取轨迹点位各点坐标
				arr.push(ol.proj.fromLonLat(path[i]))
			}

			let exent = ol.extent.boundingExtent(arr)
			let center = ol.extent.getCenter(exent)
			view.fit(exent)
			view.setCenter(center)
			_self.setState({ showPlay: true })
		} else {
			Message.error('暂无轨迹')
			_self.setState({ showPlay: false })
			return false
		}
	}
	carMove = () => {
		var _self = this
		const { view, map, vector, sourceCar, showCarVector, tracking, trackType } = this.state
		showCarVector.setSource(null)
		sourceCar.clear()
		// let speed = pathIndex
		// console.log(speed,'==========')
		// if (pathIndex == -1) {
		//     console.log(pathIndex,'==========')
		// 	pathIndex = path.length - 1
		// }
		if (trackType == '2') {
			if (pathIndex == original.length - 1) {
				window.clearInterval(intervalLader)
				this.setState({
					playing: false,
					tracking: false,
					trackType: ''
				})
			}
			let carFeature = new ol.Feature({
				//车子
				geometry: new ol.geom.Point(original[pathIndex]),
				population: 4000,
				rainfall: 500
			})
			var carStyle = new ol.style.Style({
				image: new ol.style.Icon /** @type {olx.style.IconOptions} */({
					src: './image/gjc.png',
					scale: 0.2
					// anchor: [0.5, 0.8],
				})
			})
			carFeature.setStyle(carStyle)
			carFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
			sourceCar.addFeature(carFeature)
			showCarVector.setSource(sourceCar)
			if (tracking) {
				//设置中心点
				let cenarr = []
				cenarr.push(ol.proj.fromLonLat(_self.transform(original[pathIndex][0], original[pathIndex][1])))
				let exent = ol.extent.boundingExtent(cenarr)
				let center = ol.extent.getCenter(exent)
				const zooms = _self.state.view.getZoom()
				_self.state.view.fit(exent)
				_self.state.view.setZoom(16)
				_self.state.view.setCenter(center)
			}
		} else {
			if (pathIndex == path.length - 1) {
				window.clearInterval(intervalLader)
				this.setState({
					playing: false,
					tracking: false,
					trackType: ''
				})
			}
			let carFeature = new ol.Feature({
				//车子
				geometry: new ol.geom.Point(path[pathIndex]),
				population: 4000,
				rainfall: 500
			})
			var carStyle = new ol.style.Style({
				image: new ol.style.Icon /** @type {olx.style.IconOptions} */({
					src: './image/gjc.png',
					scale: 0.2
					// anchor: [0.5, 0.8],
				})
			})
			carFeature.setStyle(carStyle)
			carFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
			sourceCar.addFeature(carFeature)
			showCarVector.setSource(sourceCar)
			if (tracking) {
				//设置中心点
				let cenarr = []
				cenarr.push(ol.proj.fromLonLat(_self.transform(path[pathIndex][0], path[pathIndex][1])))
				let exent = ol.extent.boundingExtent(cenarr)
				let center = ol.extent.getCenter(exent)
				const zooms = _self.state.view.getZoom()
				_self.state.view.fit(exent)
				_self.state.view.setZoom(16)
				_self.state.view.setCenter(center)
			}
		}

		pathIndex = pathIndex + 1

		// console.log(pathIndex,'-------------')
	}

	analysisPath = () => {
		var tempPath = path
		var splitNumber = 10
		var pathResults = []
		var tempPoint = [ 0, 0 ]
		if (tempPath.length > 1) {
			// console.log(tempPath,'1111111111')
			for (let i = 0; i < tempPath.length - 1; i++) {
				// 每两个点之间分割出splitNumber个点

				pathResults.push(tempPath[i])
				// console.log(pathResults,'2222222222')
				if (tempPath[i + 1][0] != tempPath[i][0] && tempPath[i + 1][1] != tempPath[i][1]) {
					for (let j = 0; j < splitNumber; j++) {
						let x = (tempPath[i + 1][0] - tempPath[i][0]) * (j + 1) / splitNumber + tempPath[i][0]

						// console.log(x, '55555555')
						let y = (tempPath[i + 1][1] - tempPath[i][1]) * (j + 1) / splitNumber + tempPath[i][1]
						// console.log(y, '666666')

						// console.log([x,y], '333333333')
						pathResults.push([ x, y ])
						// console.log(pathResults, '777777')
					}
				} else {
					// for (let j = 0; j < splitNumber; j++) {
					// 	pathResults.push(tempPath[i])
					// }
				}
			}

			pathResults.push(tempPath[tempPath.length - 1])
			path = pathResults
			// console.log(path)
		}
	}
	toPlay = () => {
		console.log(11111111111)
		var _self = this
		pathIndex = 0
		setIntervalTime = 100
		const { view, map, vector, sourceCar, showCarVector } = this.state
		_self.setState(
			{
				playing: true,
				trackType: '1'
			},
			() => {
				console.log(222222)
				// map.once('postcompose', (event) => {
				console.log(setIntervalTime)
				_self.carMove()
				intervalLader = setInterval(() => {
					_self.carMove()
				}, setIntervalTime)
				// })
			}
		)
	}
	/**
        *  图层初始化
        *  */
	initLayers = () => {
		console.log('初始化')
		const { map, vector, source, showTrajectoryVector, sourceTrajectory } = this.state
		vector.setSource(null)
		source.clear()
		showTrajectoryVector.setSource(null)
		sourceTrajectory.clear()
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
	renderPersonForm() {
		const { form } = this.props
		const { getFieldDecorator } = form
		const formItemLayout = {
			labelCol: {
				xs: { span: 24 },
				sm: { span: 8 }
			},
			wrapperCol: {
				xs: { span: 24 },
				sm: { span: 16 }
			}
		}
		return (
			<Form layout="inline" {...formItemLayout} onSubmit={this.handleSubmit}>
				<Row>
					<Col span={8} className={styles.datePicker}>
						<FormItem label="选择日期">
							{getFieldDecorator('range_picker')(
								<RangePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '330px' }} />
							)}
						</FormItem>
					</Col>
					<Col span={8}> {this.renderSearchButton()} </Col>
					{/* {this.renderSearchButton()} */}
				</Row>
			</Form>
		)
	}

	// 渲染查询条件的按钮渲染
	renderSearchButton = () => (
		<Col offset={8} md={8} sm={24}>
			<span className={styles.submitButtons}>
				<Button
					type="primary"
					htmlType="submit"
					className={styles.submitButton}
					style={{ background: '#3470F4', borderColor: '#3470F4', color: '#fff' }}
				>
					搜索
				</Button>
				<Button
					className={styles.submitButton}
					onClick={this.handleFormReset}
					style={{ background: '#269CF4', borderColor: '#269CF4', color: '#fff' }}
				>
					重置
				</Button>
				<Button
					className={styles.submitButton}
					onClick={() =>
						this.props.history.replace({
							pathname: '/czht_sbgl',
							state: { expandForm: '1', pages: this.props.match.params.pages }
						})}
					style={{ background: '#38B248', borderColor: '#38B248', color: '#fff' }}
				>
					返回
				</Button>
				{this.state.showPlay ? (
					<Button
						className={styles.submitButton}
						onClick={this.trackBack}
						disabled={this.state.trackType == '1' ? true : false}
						style={{ background: '#269CF4', borderColor: '#269CF4', color: '#fff' }}
					>
						极速轨迹回溯
					</Button>
				) : null}
				{this.state.showPlay ? (
					<Button
						className={styles.submitButton}
						onClick={this.toPlay}
						disabled={this.state.trackType == '2' ? true : false}
						style={{ background: '#3470F4', borderColor: '#3470F4', color: '#fff' }}
					>
						播放
					</Button>
				) : null}
				{this.state.playing ? (
					<Button
						className={styles.submitButton}
						onClick={this.toTrack}
						style={{ background: '#269CF4', borderColor: '#269CF4', color: '#fff' }}
					>
						{this.state.tracking ? '取消追踪' : '追踪警车'}
					</Button>
				) : null}
				{this.state.playing ? (
					<Button
						className={styles.submitButton}
						onClick={this.tenTimesSpeed}
						style={{ background: '#269CF4', borderColor: '#269CF4', color: '#fff' }}
					>
						10倍速
					</Button>
				) : null}
				{this.state.playing ? (
					<Button
						className={styles.submitButton}
						onClick={this.twentyTimesSpeed}
						style={{ background: '#269CF4', borderColor: '#269CF4', color: '#fff' }}
					>
						20倍速
					</Button>
				) : null}
				{this.state.playing ? (
					<Button
						className={styles.submitButton}
						onClick={this.fiftyTimesSpeed}
						style={{ background: '#269CF4', borderColor: '#269CF4', color: '#fff' }}
					>
						50倍速
					</Button>
				) : null}
			</span>
		</Col>
	)
	trackBack = () => {
		var _self = this
		const { form } = this.props
		_self.setState({ trackType: '2' }, () => {
			setIntervalTime = original.length / 10000
			pathIndex = 0
			console.log(original.length, setIntervalTime)
			window.clearInterval(intervalLader)
			intervalLader = setInterval(() => {
				_self.carMove()
			}, setIntervalTime)
		})
	}
	toTrack = () => {
		this.setState({ tracking: !this.state.tracking })
	}
	tenTimesSpeed = () => {
		var _self = this
		setIntervalTime = 100
		window.clearInterval(intervalLader)
		intervalLader = setInterval(() => {
			_self.carMove()
		}, setIntervalTime)
	}
	twentyTimesSpeed = () => {
		var _self = this
		setIntervalTime = 50
		window.clearInterval(intervalLader)
		intervalLader = setInterval(() => {
			_self.carMove()
		}, setIntervalTime)
	}
	fiftyTimesSpeed = () => {
		var _self = this
		setIntervalTime = 20
		window.clearInterval(intervalLader)
		intervalLader = setInterval(() => {
			_self.carMove()
		}, setIntervalTime)
	}
	renderForm() {
		return this.renderPersonForm()
	}

	render() {
		const { trajectory: { data }, form } = this.props

		return (
			<div>
				<div className={styles.tableListForm}>{this.renderForm()}</div>
				<Card bordered={false} className={styles.tableListCard}>
					<div className={styles.patrolwarning}>
						<div className={styles.calendar}>
							<div id="map" className={styles.mapDivStyle} />
							{/* <div id="popup" className={styles.olpopup}> */}
							<div id="geo-marker" />
							{/* </div> */}
							{/* </div> */}
							<div id="geo-marker" />
						</div>
					</div>
				</Card>
			</div>
		)
	}
}

export default Form.create()(trajectory)
