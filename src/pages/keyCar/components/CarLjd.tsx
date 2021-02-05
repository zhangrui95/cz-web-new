import { Card, Empty, Form, message, Row, Spin, Steps } from 'antd';
import React, { Component } from 'react';
import ol from 'openlayers';
import { connect } from 'dva';
import styles from '../index.less';
import { initView, offlineMapLayer } from '@/utils/olUtils';
import dw2 from '@/assets/dw2.png';
import dw1 from '@/assets/dw1.png';
import dw from '@/assets/dw.png';
let latreg = /^(\-|\+)?([0-8]?\d{1}\.\d{0,15}|90\.0{0,15}|[0-8]?\d{1}|90)$/;
let longrg = /^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,15})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,15}|180)$/;
class CarLjd extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: props.ljdList,
            sourcePlace: null,
            showPlaceVector: null,
        };
    }
    componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any) {
        if (prevProps.ljdList !== this.props.ljdList) {
            this.getPiontMap(
                this.props.ljdList,
                true,
                'sourcePlace',
                'showPlaceVector',
                dw2,
                'place',
                'gpsPoint',
            );
        }
    }

    componentDidMount() {
        this.initMap();
    }
    popupRender = files => {
        console.log('files', files);
        var popups = document.getElementById('popups-content');
        popups.innerHTML = '';
        var body = document.createElement('div');
        body.className = 'popupBody';
        body.style.background = 'rgba(0,0,0,0.5)';
        body.style.padding = '2px 5px';
        popups.appendChild(body);
        var elementA = document.createElement('div');
        elementA.className = 'item';
        body.appendChild(elementA);
        var spanA = document.createElement('div');
        spanA.className = 'title';
        spanA.innerText =
            '名称：' +
            files.address +
            '\n' +
            '当前经度：' +
            files.gpsPoint[0] +
            '\n' +
            '当前纬度：' +
            files.gpsPoint[1] +
            '\n' +
            '时间：' +
            files.passTime +
            '\n' +
            '次数：' +
            files.times;
        elementA.appendChild(spanA);
        body.appendChild(elementA);
    };

    //地图
    initMap = () => {
        let policesOverlay;
        let _self = this;
        // 创建地图
        const view = initView();
        // 指定地图要显示在id为map的div中
        const map = new ol.Map({
            view,
            target: 'mapLjs',
        });
        map.addLayer(offlineMapLayer()); // 将地图加载上来
        var popupBody = document.getElementById('popups');
        var popups = document.getElementById('popups-content');
        var overlaypopup = new ol.Overlay(
            /** @type {olx.OverlayOptions} */ {
                element: popupBody,
                autoPan: true,
                positioning: 'right-center',
                stopEvent: false,
                autoPanAnimation: {
                    duration: 250,
                },
            },
        );
        map.addOverlay(overlaypopup);
        // 实例化一个矢量图层Vector作为绘制层
        const source = new ol.source.Vector({});
        const vector = new ol.layer.Vector({
            source,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(224,156,25, 0.2)',
                }),
                stroke: new ol.style.Stroke({
                    color: '#5358FD',
                    width: 2,
                }),
            }),
        });
        const sourcePlace = new ol.source.Vector({});
        const showPlaceVector = new ol.layer.Vector({
            source: sourcePlace,
        });
        map.addLayer(vector); // 将绘制层添加到地图容器中

        map.addLayer(showPlaceVector);
        map.on('singleclick', e => {});
        map.on('moveend', function(e) {});
        map.on('pointermove', function(evt) {
            var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                return feature;
            });
            if (feature) {
                var coodinate = ol.proj.fromLonLat(feature.get('gps'));
                if (window.configUrl.iStreet) {
                    _self.popupRender(feature.get('layer'));
                    _self.setState({
                        mapClik: true,
                    });
                    overlaypopup.setPosition(coodinate);
                }
            } else {
                popups.innerHTML = '';
                overlaypopup.setPosition(undefined);
            }
        });
        this.setState(
            {
                map,
                view,
                vector,
                source,
                sourcePlace,
                showPlaceVector,
            },
            () => {
                this.getPiontMap(
                    this.state.list,
                    true,
                    'sourcePlace',
                    'showPlaceVector',
                    dw2,
                    'place',
                    'gpsPoint',
                );
            },
        );
    };
    // ///////////谷歌地球-谷歌地图/////////经纬度转换
    transformLat = (x, y) => {
        const pi = 3.1415926535897932384626;
        let ret =
            -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
        ret += ((20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0) / 3.0;
        ret += ((20.0 * Math.sin(y * pi) + 40.0 * Math.sin((y / 3.0) * pi)) * 2.0) / 3.0;
        ret +=
            ((160.0 * Math.sin((y / 12.0) * pi) + 320.0 * Math.sin((y * pi) / 30.0)) * 2.0) / 3.0;
        return ret;
    };

    transformLon = (x, y) => {
        const pi = 3.1415926535897932384626;
        let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
        ret += ((20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0) / 3.0;
        ret += ((20.0 * Math.sin(x * pi) + 40.0 * Math.sin((x / 3.0) * pi)) * 2.0) / 3.0;
        ret +=
            ((150.0 * Math.sin((x / 12.0) * pi) + 300.0 * Math.sin((x * pi) / 30.0)) * 2.0) / 3.0;
        return ret;
    };
    transform = (lon, lat) => {
        const pi = 3.1415926535897932384626;
        const a = 6378245.0;
        const ee = 0.00669342162296594323;

        let dLat = this.transformLat(lon - 105.0, lat - 35.0);
        let dLon = this.transformLon(lon - 105.0, lat - 35.0);

        const radLat = (lat / 180.0) * pi;
        let magic = Math.sin(radLat);
        magic = 1 - ee * magic * magic;
        const sqrtMagic = Math.sqrt(magic);

        dLat = (dLat * 180.0) / (((a * (1 - ee)) / (magic * sqrtMagic)) * pi);
        dLon = (dLon * 180.0) / ((a / sqrtMagic) * Math.cos(radLat) * pi);

        const mgLat = lat + dLat;
        const mgLon = lon + dLon;

        return [mgLon, mgLat];
    };
    //渲染各个点的公用方法
    getPiontMap = (files, bool, source, vector, imgs, type, gps) => {
        console.log('files', files, this.state[vector], this.state[source]);
        console.log('this.state[vector]', this.state[vector]);
        console.log('this.state[source]', this.state[source]);
        var _self = this;
        let arr = [];
        let { map, popups, overlaypopup, view } = this.state;
        this.state[vector].setSource(null);
        this.state[source].clear();
        if (files) {
            if (files.length > 0) {
                for (var i = 0; i < files.length; i++) {
                    console.log('gogogo', files[i]);
                    if (files[i][gps]) {
                        console.log('===执行===', files[i][gps]);
                        if (longrg.test(files[i][gps][0]) && latreg.test(files[i][gps][1])) {
                            //  console.log(files[i])
                            const pointFeature = new ol.Feature({
                                geometry: new ol.geom.Point(
                                    this.transform(files[i][gps][0], files[i][gps][1]),
                                ),
                                type: type,
                                layer: files[i],
                                gps: this.transform(files[i][gps][0], files[i][gps][1]),
                            });
                            pointFeature.setStyle(
                                new ol.style.Style({
                                    image: new ol.style.Icon({
                                        scale: map.getView().getZoom() / 18, // 图标缩放比例
                                        src:
                                            files[i].times && files[i].times < 3
                                                ? dw
                                                : files[i].times && files[i].times < 5
                                                ? dw1
                                                : imgs, // 图标的url
                                    }),
                                }),
                            );
                            pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                            this.state[source].addFeature(pointFeature);
                            arr.push(ol.proj.fromLonLat(files[i][gps]));
                        }
                    }
                }
                this.state[vector].setSource(this.state[source]);
                if (bool) {
                    //设置中心点
                    let exent = ol.extent.boundingExtent(arr);
                    let center = ol.extent.getCenter(exent);
                    // view.fit(exent);
                    view.setCenter(center);
                }
            }
        }
    };
    render() {
        const { ljdList, importLoading } = this.props;
        return (
            <Card bordered={false} className={styles.tableListCard}>
                <Spin spinning={importLoading}>
                    <div className={styles.tableListCard} style={{ height: 750 }}>
                        <div id="popups" className={styles.olpopup}>
                            <div id="popups-content" />
                        </div>
                        <Card
                            className={styles.tableListCard}
                            style={{ height: 750 }}
                            id={'mapLjs'}
                        ></Card>
                    </div>
                </Spin>
            </Card>
        );
    }
}

export default Form.create()(CarLjd);
