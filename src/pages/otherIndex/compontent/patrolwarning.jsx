import React from 'react';
import { List, Card, Row, Col, Button, Tag, Modal,Icon  } from 'antd';
import styles from './styles.less';
import ol from 'openlayers'
import {
	initView,
    offlineMapLayer
} from '@/utils/olUtils'
class Patrolwarning extends React.Component {
  
constructor(props) {
    super(props);
    this.state = {
        circle: null,
        map: null,
        view: null,
        vector: null,
        source: null,
    };
  }
  
  componentDidMount() {
		// 绘制地图
		this.initMap()
		//禁止鼠标右键
		document.oncontextmenu = function() {
			event.returnValue = false
		}
        
	}
  //绘制地图
	initMap = () => {
		let  circle // 绘制对象
		var _self = this
		// 创建地图
		const view = initView()
		// 指定地图要显示在id为map的div中
		const map = new ol.Map({
			view,
			target: 'patrolmap'
		})
		map.addLayer(offlineMapLayer()) // 将地图加载上来
		//实例化一个矢量图层Vector作为绘制层
		//实例化一个机构边界的source
		var source = new ol.source.Vector({})
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
		this.setState({
			circle: circle,
			map: map,
			view: view,
			vector: vector,
			source: source,
		}, () => {
            
            if(_self.props.files && _self.props.files.gpsLabels){
                 let arr = _self.props.files.gpsLabels
                arr.push({
                    label_gps_point: _self.props.files.gps,
                    label_type: ''
                    })
                _self.showPolygonLoop(arr)
            }
        })
	}
    //绘制网格
	showPolygonLoop = (files) => {
		var _self = this
		let arr = [],
        brr = []
		let polygonFeature = null
		// this.setState({ determine: 'edit' });
		let {
			view,
			map,
			circle,
			source,
            vector
		} = this.state
		//实例一个线的全局变量  LineString线,Point 点,Polygon 面
		var geometryPolygon = new ol.geom.Polygon();
        var geometryPoint = new ol.geom.Point();
        var geometryLine = new ol.geom.LineString();
        
		console.log('画格', files )

		if (files) {
			for (var i = 0; i < files.length; i++) {
				if (files[i].label_gps_point) {
                    //根据label_type判断 数据类型
                    if(files[i].label_type == 2){
                        //根据gps点构建巡逻范围
                        polygonFeature = new ol.Feature({
                            geometry: new ol.geom.Polygon([ files[i].label_gps_point ])
                        })
                        polygonFeature.setStyle(
                            new ol.style.Style({
                                stroke: new ol.style.Stroke({
                                    color: '#5358FD',
                                    size: 4,
                                    width: 3,
                                    // lineDash: [ 1, 2, 3, 4, 5, 6 ]
                                })
                            })
                        )
                        polygonFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
                        source.addFeature(polygonFeature)
                    }else if(files[i].label_type == 3){
                        //根据gps点构建休息点
                        polygonFeature = new ol.Feature({
                            geometry: new ol.geom.Point(files[i].label_gps_point)
                        })
                        polygonFeature.setStyle(
                            new ol.style.Style({
                                image: new ol.style.Icon({
                                    scale: 1.1, // 图标缩放比例 // 0为离线其他为在线
                                    src: './image/syxxd_1.png' // 图标的url
                                })
                            })
                        )
                        polygonFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
                        source.addFeature(polygonFeature)
                    }else if(files[i].label_type == 4){
                        //根据gps点构建巡驻点
                        polygonFeature = new ol.Feature({
                            geometry: new ol.geom.Point(files[i].label_gps_point)
                        })
                        polygonFeature.setStyle(
                            new ol.style.Style({
                                image: new ol.style.Icon({
                                    scale: 1.1, // 图标缩放比例 // 0为离线其他为在线
                                    src: './image/syzxd.png' // 图标的url
                                })
                            })
                        )
                        polygonFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
                        source.addFeature(polygonFeature)
                    }else if(files[i].label_type == 5){
                        //根据gps点构建网格
                        polygonFeature = new ol.Feature({
                            geometry: new ol.geom.LineString(files[i].label_gps_point)
                        })
                        polygonFeature.setStyle(
                            new ol.style.Style({
                                stroke: new ol.style.Stroke({
                                    color: '#01A472',
                                    size: 4,
                                    width: 3,
                                    lineDash: [ 1, 2, 3, 4, 5, 6 ]
                                })
                            })
                        )
                        polygonFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
                        source.addFeature(polygonFeature)
                    }else {
                    //根据gps点构建当前点
                        polygonFeature = new ol.Feature({
                            geometry: new ol.geom.Point(files[i].label_gps_point)
                        })
                        brr.push(files[i].label_gps_point)
                        polygonFeature.setStyle(
                            new ol.style.Style({
                                image: new ol.style.Icon({
                                    scale: 1.1, // 图标缩放比例 // 0为离线其他为在线
                                    src: './image/dqwz.png' // 图标的url
                                })
                            })
                        )
                        polygonFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
                        source.addFeature(polygonFeature)
                    }
				}
			}
			
            vector.setSource(source)
            if (brr&&brr.length) {
                console.log(brr)
					// for (let i = 0; i < arr.length; i++) {
					arr.push(ol.proj.fromLonLat(brr[0]))
					// }

					// //设置中心点
					let exent = ol.extent.boundingExtent(arr)
					let center = ol.extent.getCenter(exent)
					view.fit(exent)
					view.setCenter(center)
                    view.setZoom(12)
				}
			
		}
	}
  /**
        *  图层初始化
        *  */
	initLayers = () => {
		console.log('初始化')
		const {
			map,
			vector,
			source,
		} = this.state
		vector.setSource(null)
		source.clear()
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
  render() {
   
    const { files,closes } = this.props;
  
    return (
        <Card className={styles.tableListCard}>
         <div className={styles.close} onClick={() => closes()}><Icon type="close" /></div> 
        {
            files
            &&
            <div className={styles.patrolwarning}>
                <div className={styles.titles}> {files.warnInfo} </div>
                <div className={styles.calendar}>
                    <div id="patrolmap" className={styles.mapDivStyle} />
                </div>
            </div>
        }
            
            
        </Card>
    )
  }
}


export default Patrolwarning;