import React, { Component } from 'react';
import moment from 'moment';
import {
    Message,
    Row,
    Col,
    Switch,
    Tree,
    Form,
    Input,
    Divider,
    List,
    Badge,
    Card,
    Menu,
    Dropdown,
    Button,
    Icon,
    Avatar,
    Modal,
} from 'antd';
import { connect } from 'dva';
import ol from 'openlayers';
import Calendar from 'react-calendar';
import styles from './index.less';
import outlineCar from '@/assets/outlineCar.png';
import { authorityIsTrue } from '@/utils/authority';
const { configUrl } = window;
const FormItem = Form.Item;
const { TreeNode } = Tree;
const { Search } = Input;
var mapClick = null;
import {
    initView,
    offlineMapLayer,
    initshowVectorP,
    initShowVectorPoint,
    initShowVector,
    highlightCarLocationStyle,
} from '@/utils/olUtils';
import { setInterval } from 'timers';
import hylink from '@/assets/hylink.png';
const getParentKey = (title, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.childrenList) {
            if (node.childrenList.some(item => item.name === title)) {
                parentKey = node.code;
            } else if (getParentKey(title, node.childrenList)) {
                parentKey = getParentKey(title, node.childrenList);
            }
        }
    }
    return parentKey;
};
const owngetKey = (title, tree) => {
    let ownKey;
    for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.childrenList) {
            node.childrenList.some(item => {
                if (item.name === title) {
                    ownKey = item.code;
                }
            });
            if (owngetKey(title, node.childrenList)) {
                ownKey = owngetKey(title, node.childrenList);
            }
        }
    }
    return ownKey;
};
const dataList = [];

const generateList = data => {
    for (let i = 0; i < data.length; i++) {
        const node = data[i];
        const code = node.code;
        dataList.push({ code, name: node.name });
        if (node.childrenList) {
            generateList(node.childrenList);
        }
    }
};
@connect(({ service, loading }) => ({
    service,
    loading: loading.models.service,
}))
class Organization extends Component {
    constructor(props) {
        super(props);
    }
    state = {
        map: null,
        view: null,
        vector: null,
        select: null,
        modify: null,
        showVector: null,
        showVectorPoint: null,
        pointFeature: null,
        circle: null,
        draw: null,
        expandedKeys: [],
        expandedKeysName: '',
        parentKeys: '',
        searchValue: '',
        autoExpandParent: true,
        drawGps: [],
        createBtn: false,
        isDraw: false,
        expandedKeysId: '',
        drawType: '',
        polygonId: '',
        pointId: '',
        determine: '',
        childrenStatus: false,
        brotherStatus: false,
        parentStatus: false,
        newSource: null,
        treeValue: '',
        disabledParent: false,
        disabledBrother: false,
        disabledChildren: false,
        limit: false,
        isEdit: false,
        isCancel: false,
        selectedKeys: ['0'],
    };

    componentDidMount() {
        // 初始化地图
        this.initMap();
        document.oncontextmenu = function() {
            event.returnValue = false;
        };
    }
    getGpsList = e => {
        console.log('获取网格');
        const { dispatch } = this.props;
        console.log(
            this.state.parentKeys,
            this.state.childrenStatus,
            this.state.brotherStatus,
            this.state.polygonId,
            this.state.parentStatus,
            e,
            this.state.expandedKeysId,
        );
        if (e) {
            // console.log('发送获取网格');
            dispatch({
                type: 'service/getGpsList',
                payload: {
                    association_organization_id: this.state.parentKeys,
                    children_status: this.state.childrenStatus,
                    brother_status: this.state.brotherStatus,
                    // label_id: this.state.polygonId,
                    parent_status: this.state.parentStatus,
                    label_organization_code: e,
                    label_organization_id: this.state.expandedKeysId,
                    label_type: [0, 1],
                },
                success: files => {
                    this.initLayers();
                    console.log('获取成功', files);
                    if (files.result.reason.code == '200') {
                        this.showPolygon(files.result.label.jgfw);
                        this.showPoint(files.result.label.bz);
                        if (this.state.parentStatus) {
                            //  console.log('准备画父级');
                            if (files.result.label.jgfw && files.result.label.jgfw.parent_list) {
                                this.showPolygonLoop(
                                    files.result.label.jgfw.parent_list,
                                    'parent',
                                    '#EF1030',
                                    1,
                                );
                            }
                        }
                        if (this.state.brotherStatus) {
                            //  console.log('准备画同级');
                            if (files.result.label.jgfw && files.result.label.jgfw.brother_list) {
                                this.showPolygonLoop(
                                    files.result.label.jgfw.brother_list,
                                    'brother',
                                    '#008FFF',
                                    2,
                                );
                            }
                        }
                        if (this.state.childrenStatus) {
                            // console.log('准备画子级', files.result.label.jgfw)
                            if (files.result.label.jgfw && files.result.label.jgfw.children_list) {
                                this.showPolygonLoop(
                                    files.result.label.jgfw.children_list,
                                    'children',
                                    '#FF7B02',
                                    3,
                                );
                            }
                        }
                    } else {
                        return false;
                    }
                },
            });
        }
    };
    initMap = () => {
        let draw, circle; // 绘制对象
        var _self = this;

        // 创建地图
        const view = initView();

        // 指定地图要显示在id为map的div中
        var map = new ol.Map({
            view: view,
            target: 'map',
        });
        map.addLayer(offlineMapLayer());
        //实例化一个矢量图层Vector作为绘制层
        var source = new ol.source.Vector({});
        var newSource = new ol.source.Vector({});
        var vector = new ol.layer.Vector({
            source: source,
        });

        map.addLayer(vector); //将绘制层添加到地图容器中

        //为地图容器添加单击事件监听
        map.on('click', function(evt) {
            let point = evt.coordinate; //鼠标单击点坐标
            console.log(point, '地图坐标点', evt);
            // console.log(point.transform('EPSG:3857', 'EPSG:4326').getCoordinates())
            console.log(ol.proj.transform(point, 'EPSG:3857', 'EPSG:4326'));
            //判断当前单击处是否有要素，捕获到要素时弹出popup
            var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                return feature;
            });
            if (feature) {
                console.log('gps点信息', ol.proj.transform(feature, 'EPSG:3857', 'EPSG:4326'));
            }
        });
        // 为地图容器添加双击事件
        map.on('dblclick', function(event) {});
        /**
         * 为map添加鼠标移动事件监听，当指向标注时改变鼠标光标状态
         */
        /*        map.on('pointermove', function (e) {
                        var pixel = map.getEventPixel(e.originalEvent);
                        var hit = map.hasFeatureAtPixel(pixel);
                        map.getTargetElement().style.cursor = hit ? 'pointer' : '';
                    });*/
        map.on('singleclick', e => {
            console.log('单击');
        });
        let select = new ol.interaction.Select({
            style: function(feature) {
                return _self.styleSelect(feature);
            },
            // 关键： 设置过了条件，可以用feature来写过滤，也可以用layer来写过滤
            filter: function(feature, layer, type) {
                var geometry = feature.getGeometry();
                var attribute = feature.getProperties();
                console.log(
                    feature,
                    '=====',
                    layer,
                    '----',
                    _self.state.drawType,
                    '++',
                    feature.getGeometry(),
                    '----',
                    feature.get('typeName'),
                    '=====',
                    _self.state.determine,
                    'type',
                );
                if (_self.state.determine == 'new') {
                    if (feature.get('typeName') == undefined) {
                        return true;
                    }
                } else {
                    return feature.get('typeName') == _self.state.drawType;
                }
            },
        });
        let modify = new ol.interaction.Modify({
            features: select.getFeatures(), //选中的要素
        });
        map.addInteraction(select);
        map.addInteraction(modify);
        select.setActive(false); //激活选择要素控件
        modify.setActive(false); //激活修改要素控件

        var showVector = initShowVector();
        var showVectorPoint = initShowVectorPoint();
        map.addLayer(showVector);
        map.addLayer(showVectorPoint);

        this.setState({
            draw: draw,
            circle: circle,
            map: map,
            view: view,
            vector: vector,
            source: source,
            select: select,
            modify: modify,
            showVector: showVector,
            showVectorPoint: showVectorPoint,
            newSource: newSource,
        });
    };
    drawPolygon = type => {
        // 添加一个绘制的线使用的layer
        document.getElementById('map').onmouseover = function() {
            // this.style.cursor = "url('./image/pen.png'),w-resize";
            this.style.cursor = 'copy';
        };
        var _self = this;
        this.setState({
            drawType: type,
            determine: 'new',
            limit: true,
            createBtn: true,
            isCancel: true,
        });
        this.props.prompt(true);
        let { source, vector, view, map, draw, modify, showVector, select, circle } = this.state;
        let drawArr = [];
        map.removeInteraction(draw); //移除绘制图形
        const lineLayer = new ol.layer.Vector({
            source: source,
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: '#5358FD',
                    size: 3,
                    width: 3,
                }),
            }),
        });
        map.addLayer(lineLayer);
        draw = new ol.interaction.Draw({
            type: type,
            source: lineLayer.getSource(), // 注意设置source，这样绘制好的线，就会添加到这个source里
            style: new ol.style.Style({
                // 设置绘制时的样式
                stroke: new ol.style.Stroke({
                    color: '#5358FD',
                    size: 3,
                    width: 3,
                    lineDash: [1, 2, 3, 4, 5, 6],
                }),
            }),
            //   minPoints:     // 限制不超过4个点
        });

        map.addInteraction(draw);
        //监听绘制动作是否开始
        draw.on('drawstart', function(event) {
            console.log('开始画了============');
            if (!_self.state.limit) {
                draw.setActive(false);
                return false;
            }

            _self.setState({ createBtn: false, isCancel: false });
        });
        // 监听线绘制结束事件，获取坐标
        draw.on('drawend', function(event) {
            console.log(event, '[[[');
            draw.setActive(false);
            select.setActive(true); //激活选择要素控件
            modify.setActive(true);
            _self.setState({
                drawGps: event.feature.getGeometry(),
                source: source,
                vector: vector,
                draw: draw,
                select: select,
                modify: modify,
                createBtn: true,
                isCancel: false,
            });
        });
        modify.on('modifyend', function(e) {
            _self.setState({
                drawGps: e.features.item(0).getGeometry(),
                source: source,
                vector: vector,
                draw: draw,
                select: select,
                modify: modify,
            });
        });
        _self.setState({
            draw: draw,
        });
    };
    styleSelect = feature => {
        const { drawType } = this.state;
        // console.log(feature, drawType, '样式', feature.get('NAME'));
        if (drawType == 'Point') {
            // console.log('xuandain点');
            return new ol.style.Style({
                image: new ol.style.Icon({
                    scale: 1.1, // 图标缩放比例 // 0为离线其他为在线
                    src: './image/sysmark_1.png', // 图标的url
                }),
                stroke: new ol.style.Stroke({
                    color: '#5358FD',
                    size: 10,
                    width: 10,
                }),
            });
        } else {
            // console.log('xuandain线');
            return new ol.style.Style({
                // 设置选中时的样式
                stroke: new ol.style.Stroke({
                    color: '#5358FD',
                    size: 3,
                    width: 3,
                    lineDash: [1, 2, 3, 4, 5, 6],
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(224,156,25, 0.2)',
                }),
            });
        }
    };
    drawPoint = type => {
        // 添加一个绘制的线使用的layer
        var _self = this;
        document.getElementById('map').onmouseover = function() {
            // this.style.cursor = "url('./image/pen.png'),w-resize";
            this.style.cursor = 'copy';
        };
        this.setState({
            drawType: type,
            determine: 'new',
            limit: true,
            createBtn: false,
            isCancel: false,
        });
        this.props.prompt(true);
        let { source, vector, view, map, draw, modify, showVector, select, circle } = this.state;
        let drawArr = [];
        map.removeInteraction(draw); //移除绘制图形
        const lineLayer = new ol.layer.Vector({
            source: source,
            style: new ol.style.Style({
                image: new ol.style.Icon({
                    scale: 1.1, // 图标缩放比例 // 0为离线其他为在线
                    src: './image/sysmark.png', // 图标的url
                }),
                // fill: new ol.style.Fill({
                // 	color: 'rgba(224,156,25, 0.2)'
                // }),
                // stroke: new ol.style.Stroke({
                // 	color: 'red',
                // 	width: 5
                // })
            }),
        });
        map.addLayer(lineLayer);

        draw = new ol.interaction.Draw({
            type: type,
            source: lineLayer.getSource(), // 注意设置source，这样绘制好的线，就会添加到这个source里
            style: new ol.style.Style({
                image: new ol.style.Icon({
                    scale: 1.1, // 图标缩放比例 // 0为离线其他为在线
                    src: './image/sysmark_1.png', // 图标的url
                }),
            }),
            // minPoints: 4    // 限制不超过4个点
        });

        map.addInteraction(draw);

        select.setActive(true);
        modify.setActive(true);
        // 监听线绘制结束事件，获取坐标
        draw.on('drawend', function(event) {
            draw.setActive(false);

            //   map.addInteraction(modify);
            _self.setState({
                drawGps: event.feature.getGeometry(),
                vector: vector,
                draw: draw,
                select: select,
                modify: modify,
                createBtn: true,
            });
        });
    };
    showLoop = files => {
        var _self = this;
        let { vector, view, map, draw, modify, showVector, select, circle, newSource } = this.state;
        var arr = [],
            brr = [];
        var newVector = new ol.layer.Vector({
            source: newSource,
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: '#EF1030',
                    size: 3,
                    width: 2,
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(224,156,25, 0.2)',
                }),
            }),
        });
        map.addLayer(newVector);
        console.log(files, '111111');
        if (files) {
            // console.log('多线条1')
            if (files.length) {
                for (var i = 0; i < files.length; i++) {
                    if (files[i].point) {
                        const polygonFeature = new ol.Feature({
                            geometry: new ol.geom.Polygon([files[i].point]),
                        });
                        // arr.push(files[i].label_gps_point)
                        polygonFeature.setStyle(
                            new ol.style.Style({
                                stroke: new ol.style.Stroke({
                                    color: '#EF1030',
                                    size: 3,
                                    width: 2,
                                }),
                                fill: new ol.style.Fill({
                                    color: 'rgba(224,156,25, 0.2)',
                                }),
                            }),
                        );
                        polygonFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                        newVector.getSource().addFeature(polygonFeature);
                    }
                }
                newVector.setSource(newVector.getSource());
            }
        }
    };
    showPolygon = files => {
        var _self = this;
        this.setState({ determine: 'edit' });
        let { vector, view, map, draw, modify, showVector, select, circle, source } = this.state;
        const {
            service: { gpsList },
        } = this.props;

        let location = [],
            arr = [];
        // console.log('画线', files);
        map.removeInteraction(draw); //移除绘制图形
        if (files) {
            console.log('11121212');
            if (files.own) {
                const clis = files.own[0];
                // console.log('画线1', clis);
                this.setState({ polygonId: clis.label_id });
                if (clis.label_gps_point) {
                    // console.log('画线2', clis.label_gps_point);
                    const polygonFeature = new ol.Feature({
                        geometry: new ol.geom.Polygon([clis.label_gps_point]),
                        typeName: 'Polygon',
                        style: new ol.style.Style({
                            // 设置选中时的样式
                            stroke: new ol.style.Stroke({
                                color: '#5358FD',
                                size: 3,
                                width: 4,
                                lineDash: [1, 2, 3, 4, 5, 6],
                            }),
                            fill: new ol.style.Fill({
                                color: 'rgba(224,156,25, 0.2)',
                            }),
                        }),
                    });
                    polygonFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                    source.addFeature(polygonFeature);
                    showVector.setSource(source);
                }

                for (let i = 0; i < clis.label_gps_point.length; i++) {
                    //获取轨迹点位各点坐标
                    arr.push(ol.proj.fromLonLat(clis.label_gps_point[i]));
                }

                let exent = ol.extent.boundingExtent(arr);
                let center = ol.extent.getCenter(exent);
                view.fit(exent);
                view.setCenter(center);
            }
        }
    };
    showPolygonLoop = (files, types, color, zooms) => {
        var _self = this;
        this.setState({ determine: 'edit' });
        let { vector, view, map, draw, modify, showVector, select, circle, newSource } = this.state;
        const {
            service: { gpsList },
        } = this.props;
        console.log('多线条', files, types, color);
        var arr = [],
            brr = [];
        var newVector = new ol.layer.Vector({
            source: newSource,
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: color,
                    size: 3,
                    width: 2,
                    lineDash: [1, 2, 3, 4, 5, 6],
                }),
            }),
        });
        map.addLayer(newVector);
        if (files) {
            // console.log('多线条1')
            if (files.length) {
                for (var i = 0; i < files.length; i++) {
                    if (files[i].label_gps_point) {
                        const polygonFeature = new ol.Feature({
                            geometry: new ol.geom.Polygon([files[i].label_gps_point]),
                            typeName: types,
                        });
                        // arr.push(files[i].label_gps_point)
                        polygonFeature.setStyle(
                            new ol.style.Style({
                                stroke: new ol.style.Stroke({
                                    color: color,
                                    size: 3,
                                    width: 2,
                                    lineDash: [1, 2, 3, 4, 5, 6],
                                }),
                            }),
                        );
                        polygonFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                        newVector.getSource().addFeature(polygonFeature);
                    }
                }
                newVector.setSource(newVector.getSource());
                if (zooms == 1) {
                    for (let i = 0; i < files[0].label_gps_point.length; i++) {
                        //获取轨迹点位各点坐标
                        brr.push(ol.proj.fromLonLat(files[0].label_gps_point[i]));
                    }
                    //设置中心点
                    let exent = ol.extent.boundingExtent(brr);
                    let center = ol.extent.getCenter(exent);
                    view.fit(exent);
                    view.setCenter(center);
                }
            }
        }
    };

    editPolygon = type => {
        //    this.setState({determine: 'edit'})
        document.getElementById('map').onmouseover = function() {
            this.style.cursor = 'all-scroll';
        };
        let { vector, view, map, draw, modify, showVector, select, circle, source } = this.state;
        this.setState({
            createBtn: true,
            drawType: type,
            determine: 'edit',
            limit: true,
            isEdit: true,
        });
        this.props.prompt(true);
        var _self = this;
        select.setActive(true); //激活选择要素控件
        modify.setActive(true);
        select.on('select', function(e) {
            // console.log(e,'编辑----====')
        });
        modify.on('modifyend', function(e) {
            _self.setState({
                drawGps: e.features.item(0).getGeometry(),
                source: source,
                vector: vector,
                draw: draw,
                select: select,
                modify: modify,
            });
        });
    };
    showPoint = files => {
        // console.log('画点', files);
        var _self = this;
        const {
            service: { gpsList },
        } = this.props;
        if (files) {
            // console.log('画点1');
            const locationList = files[0].label_gps_point;
            this.setState({ pointId: files[0].label_id });
            const { view, showVectorPoint, map, vector, source, draw } = this.state; // 谷歌地球点转换成地图点
            map.removeInteraction(draw);
            //   const position = this.transform(locationList[0], locationList[1]);
            const pointFeature = new ol.Feature({
                geometry: new ol.geom.Point(locationList),
                typeName: 'Point',
            });
            pointFeature.setStyle(
                new ol.style.Style({
                    image: new ol.style.Icon({
                        scale: map.getView().getZoom() / 15, // 图标缩放比例 // 0为离线其他为在线
                        src: './image/sysmark.png', // 图标的url
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#5358FD',
                        size: 10,
                        width: 10,
                    }),
                }),
            );
            pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857'); // location.push(position)

            source.addFeature(pointFeature);
            showVectorPoint.setSource(source);
            // 监听地图层级变化
            map.getView().on('change:resolution', function() {
                var style = pointFeature.getStyle();
                // 重新设置图标的缩放率，基于层级10来做缩放
                style.getImage().setScale(this.getZoom() / 15);
                pointFeature.setStyle(style);
            });
        }
    };
    saveDraw = () => {
        let {
            drawGps,
            parentKeys,
            expandedKeys,
            expandedKeysName,
            expandedKeysId,
            drawType,
            treeValue,
        } = this.state;
        let newdrawGps = [];
        if (drawType == 'Point') {
            newdrawGps = drawGps.transform('EPSG:3857', 'EPSG:4326').getCoordinates();
        } else {
            newdrawGps = drawGps.transform('EPSG:3857', 'EPSG:4326').getCoordinates()[0];
        }

        const {
            dispatch,
            service: { useList },
        } = this.props;
        // console.log(expandedKeysName, treeValue, parentKeys, expandedKeysId)
        dispatch({
            type: 'service/createGpsLabel',
            payload: {
                association_organization_id: parentKeys,
                label_gps_point: newdrawGps,
                label_organization_code: treeValue,
                label_organization_name: expandedKeysName,
                label_organization_id: expandedKeysId,
                label_type: drawType == 'Point' ? 1 : 0,
            },
            success: e => {
                console.log(e);

                if (e.result.reason.code == '200') {
                    Message.success('保存成功');
                    document.getElementById('map').onmouseover = function() {
                        this.style.cursor = 'auto';
                    };
                    this.getGpsList(treeValue);
                    this.initLayers();
                    this.setState({
                        createBtn: false,
                        limit: false,
                        isCancel: false,
                    });
                    this.props.prompt(false);
                } else {
                    this.getGpsList(treeValue);
                    this.initLayers();
                    Message.error('保存失败');
                    this.setState({
                        createBtn: false,
                        limit: false,
                        isCancel: false,
                    });
                    return false;
                }
            },
        });
    };
    updateDraw = () => {
        let { drawGps, expandedKeys, drawType, polygonId, pointId, treeValue } = this.state;
        let newdrawGps = [];
        if (drawType == 'Point') {
            newdrawGps = drawGps.transform('EPSG:3857', 'EPSG:4326').getCoordinates();
        } else {
            newdrawGps = drawGps.transform('EPSG:3857', 'EPSG:4326').getCoordinates()[0];
        }

        const {
            dispatch,
            service: { useList },
        } = this.props;

        dispatch({
            type: 'service/updateGpsLabel',
            payload: {
                label_id: drawType == 'Point' ? pointId : polygonId,
                label_gps_point: newdrawGps,
                label_type: drawType == 'Point' ? 1 : 0,
            },
            success: e => {
                if (e.result.reason.code == '200') {
                    Message.success('修改成功');
                    this.getGpsList(treeValue);
                    this.initLayers();
                    this.setState({
                        createBtn: false,
                        limit: false,
                        isCancel: false,
                    });
                    this.props.prompt(false);
                } else {
                    this.getGpsList(treeValue);
                    this.initLayers();
                    this.setState({
                        createBtn: false,
                        limit: false,
                        isCancel: false,
                    });
                    Message.error('修改失败');
                    return false;
                }
            },
        });
    };
    delDraw = types => {
        let { treeValue, drawType, polygonId, pointId } = this.state;

        const {
            dispatch,
            service: { useList },
        } = this.props;
        Modal.confirm({
            title: `${'您确认要删除'}${types == 'Point' ? '该机构标注' : '该机构边界'}${'吗？'}`,
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                dispatch({
                    type: 'service/delGpsLabel',
                    payload: {
                        label_id: types == 'Point' ? pointId : polygonId,
                    },
                    success: e => {
                        if (e.result.reason.code == '200') {
                            Message.success('删除成功');
                            this.getGpsList(treeValue);
                            this.initLayers();
                            this.setState({
                                createBtn: false,
                                drawType: types,
                                isCancel: false,
                            });
                        } else {
                            Message.error('删除失败，请稍后重试！');
                            this.getGpsList(treeValue);
                            this.initLayers();
                            this.setState({
                                createBtn: false,
                                drawType: types,
                                isCancel: false,
                            });
                            return false;
                        }
                    },
                });
            },
        });
    };
    cancelDraw = () => {
        let {
            source,
            vector,
            isCancel,
            view,
            map,
            draw,
            modify,
            showVector,
            select,
            circle,
            treeValue,
            isEdit,
        } = this.state;
        if (!isEdit) {
            console.log('新建取消');
            draw.setActive(false);
            console.log(treeValue);
            map.removeInteraction(draw);
        }
        this.props.prompt(false);
        // map.removeInteraction(draw)
        this.initLayers();
        select.getFeatures().clear();
        this.getGpsList(treeValue);
        this.setState({ createBtn: false, limit: false, isEdit: false });
        document.getElementById('map').onmouseover = function() {
            // this.style.cursor = "url('./image/pen.png'),w-resize";
            this.style.cursor = 'auto';
        };
        // if (!isCancel) {
        // 	console.log('quxiao')
        // 	draw.setActive(false)
        // 	map.removeInteraction(draw)
        // 	return
        // } else {
        // 	console.log('quxiao1')
        // }
    };

    /**
     *  图层初始化
     *  */
    initLayers = () => {
        console.log('图层初始化');
        const {
            map,
            vector,
            showVector,
            showVectorPoint,
            select,
            modify,
            source,
            draw,
            newSource,
        } = this.state;
        map.removeInteraction(draw); //移除绘制图形
        vector.setSource(null);
        showVector.setSource(null);
        showVectorPoint.setSource(null);
        select.setActive(false);
        modify.setActive(false);
        source.clear();
        newSource.clear();
    };
    //以路线为中心
    centerWithLine = () => {
        let { view, curArr } = this.state;
        if (curArr.length > 0) {
            let exent = ol.extent.boundingExtent(curArr);
            let center = ol.extent.getCenter(exent);
            view.fit(exent);
            view.setCenter(center);
        }
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
    //组织机构选择
    onSelect = (expandedKeys, info) => {
        /*用于打开该节点的详细信息*/
        const {
            form,
            service: {
                data: { page },
            },
        } = this.props;
        const { node } = info;
        const { props } = node;
        // if(!this.state.limit){
        console.log('selected', expandedKeys, info, props.dataRef.pid);

        // console.log(props.dataRef.parentId);
        // console.log(this.props.service.useList.some(v => props.dataRef.parentId == v.parentId));
        // this.initLayers();

        this.setState(
            {
                treeValue: expandedKeys[0],
                parentKeys: props.dataRef.pid,
                expandedKeysId: props.dataRef.id,
                autoExpandParent: true,
                isDraw: true,
                expandedKeysName: props.dataRef.name,
                createBtn: false,
                limit: false,
            },
            () => {
                console.log('cunwanle lllllll');
                if (expandedKeys.length) {
                    this.getGpsList(expandedKeys[0]);
                }
            },
        );

        // }
    };
    onExpand = expandedKeys => {
        console.log(expandedKeys);
        if (!this.state.limit) {
            this.setState({
                expandedKeys,
                // parentKeys: expandedKeys,
                autoExpandParent: false,
            });
        }
    };

    onChange = value => {
        // const value = e.target.value;
        this.setState({ searchTreeLoad: true });
        const expandedKeys = dataList
            .map(item => {
                if (item.name.indexOf(value) > -1) {
                    return getParentKey(item.name, this.props.service.useList);
                }
                return null;
            })
            .filter((item, i, self) => item && self.indexOf(item) === i);
        const expandedKeys2 = dataList
            .map(item => {
                // console.log(item.name.indexOf(value))
                if (item.name.indexOf(value) > -1) {
                    return owngetKey(item.name, this.props.service.useList);
                }
                return null;
            })
            .filter((item, i, self) => item && self.indexOf(item) === i);
        this.setState({
            expandedKeys,
            expandedKeys2: value ? expandedKeys2 : [],
            searchValue: value,
            autoExpandParent: true,
            searchTreeLoad: false,
        });
    };

    loop = data =>
        data.map(item => {
            let { searchValue } = this.state;
            const index = item.name.indexOf(searchValue);
            const beforeStr = item.name.substr(0, index);
            const afterStr = item.name.substr(index + searchValue.length);
            // console.log(item,index,beforeStr,afterStr,searchValue)
            const title =
                index > -1 ? (
                    <span>
                        {beforeStr}
                        <span style={{ color: '#f50' }}>{searchValue}</span>
                        {afterStr}
                    </span>
                ) : (
                    <span>{item.name}</span>
                );
            // console.log(title)
            let { expandedKeys2 } = this.state;
            if (item.childrenList) {
                return (
                    <TreeNode
                        key={item.code}
                        title={item.name}
                        dataRef={item}
                        className={
                            expandedKeys2 &&
                            expandedKeys2.length > 0 &&
                            expandedKeys2.findIndex(e => e == item.code) > -1
                                ? styles.searchName
                                : ''
                        }
                    >
                        {this.loop(item.childrenList)}
                    </TreeNode>
                );
            }
            return (
                <TreeNode
                    dataRef={item}
                    key={item.code}
                    title={item.name}
                    className={
                        expandedKeys2 &&
                        expandedKeys2.length > 0 &&
                        expandedKeys2.findIndex(e => e == item.code) > -1
                            ? styles.searchName
                            : ''
                    }
                />
            );
        });
    parentOrganization = checked => {
        const { parentKeys, treeValue, parentStatus } = this.state;
        const { dispatch } = this.props;
        //  console.log('父级机构', parentKeys, treeValue, checked);
        if (checked) {
            if (treeValue == '') {
                Message.error('请选择组织机构');
                this.setState({ disabledParent: false });
                return false;
            }
        }

        this.setState({ parentStatus: checked, disabledParent: checked }, () => {
            //  console.log('更新完成')
            if (treeValue) {
                this.getGpsList(treeValue);
            }
        });
    };
    subOrganization = checked => {
        const { parentKeys, treeValue } = this.state;
        const { dispatch } = this.props;
        //  console.log('子级机构', parentKeys, treeValue, checked);
        if (checked) {
            if (treeValue == '') {
                Message.error('请选择组织机构');
                this.setState({ disabledChildren: false });
                return false;
            }
        }
        this.setState({ childrenStatus: checked, disabledChildren: checked }, () => {
            //  console.log('更新完成')
            if (treeValue) {
                this.getGpsList(treeValue);
            }
        });
    };

    visOrganization = checked => {
        const { parentKeys, treeValue } = this.state;
        const { dispatch } = this.props;
        //  console.log('同级机构', parentKeys, treeValue, checked);
        if (checked) {
            if (treeValue == '') {
                Message.error('请选择组织机构');
                this.setState({ disabledBrother: false });
                return false;
            }
        }
        this.setState({ brotherStatus: checked, disabledBrother: checked }, () => {
            //  console.log('更新完成')
            if (treeValue) {
                this.getGpsList(treeValue);
            }
        });
    };

    render() {
        const {
            expandedKeys,
            autoExpandParent,
            searchTreeLoad,
            createBtn,
            isDraw,
            drawType,
            determine,
            parentStatus,
            brotherStatus,
            childrenStatus,
            disabledParent,
            disabledBrother,
            disabledChildren,
        } = this.state;
        const {
            service: {
                data: { list, page },
                useList,
                policeList,
                gpsList,
            },
            form: { getFieldDecorator },
        } = this.props;
        // 进行数组扁平化处理
        generateList(this.props.service.useList);
        const mapMunes = (
            <Menu style={{ background: 'hsla(229, 42%, 21%, 0.75)', width: '120px' }}>
                {gpsList.jgfw == undefined ||
                (gpsList.jgfw.own == undefined && authorityIsTrue('czht_qwgl_jgbj_bjxz')) ? (
                    <Menu.Item key="0" onClick={() => this.drawPolygon('Polygon')}>
                        新建网格
                    </Menu.Item>
                ) : (
                    ''
                )}
                {gpsList.jgfw &&
                    gpsList.jgfw.own != undefined &&
                    authorityIsTrue('czht_qwgl_jgbj_bjbj') && (
                        <Menu.Item key="1" onClick={() => this.editPolygon('Polygon')}>
                            修改网格{' '}
                        </Menu.Item>
                    )}
                {gpsList.jgfw &&
                    gpsList.jgfw.own != undefined &&
                    authorityIsTrue('czht_qwgl_jgbj_bjsc') && (
                        <Menu.Item key="2" onClick={() => this.delDraw('Polygon')}>
                            删除网格
                        </Menu.Item>
                    )}
            </Menu>
        );
        const markDraw = (
            <Menu style={{ background: 'hsla(229, 42%, 21%, 0.75)', width: '120px' }}>
                {gpsList.bz == undefined && authorityIsTrue('czht_qwgl_jgbj_bzxz') && (
                    <Menu.Item key="0" onClick={() => this.drawPoint('Point')}>
                        新建标注
                    </Menu.Item>
                )}
                {gpsList.bz != undefined && authorityIsTrue('czht_qwgl_jgbj_bzbj') && (
                    <Menu.Item key="1" onClick={() => this.editPolygon('Point')}>
                        修改标注
                    </Menu.Item>
                )}
                {gpsList.bz != undefined && authorityIsTrue('czht_qwgl_jgbj_bzsc') && (
                    <Menu.Item key="2" onClick={() => this.delDraw('Point')}>
                        删除标注
                    </Menu.Item>
                )}
            </Menu>
        );
        return (
            <div>
                <img src={hylink} className={styles.hylinkLogo} />
                <div className={styles.calendar}>
                    <div id="map" className={styles.mapDivStyle} />
                </div>
                <div className={styles.mapMunes}>
                    <Row gutter={[16, 8]}>
                        <Col span={8} style={{ textAlign: 'center' }}>
                            <Switch
                                onChange={this.parentOrganization}
                                checked={disabledParent}
                                className={`${parentStatus ? 'parentPolygon' : ''}`}
                                disabled={!!this.state.limit}
                            />
                            <span>父机构网格</span>
                        </Col>
                        <Col span={8} style={{ textAlign: 'center' }}>
                            <Switch
                                onChange={this.subOrganization}
                                checked={disabledChildren}
                                className={`${childrenStatus ? 'childPolygon' : ''}`}
                                disabled={!!this.state.limit}
                            />
                            <span>子机构网格</span>
                        </Col>
                        <Col span={8} style={{ textAlign: 'center' }}>
                            <Switch
                                onChange={this.visOrganization}
                                checked={disabledBrother}
                                className={`${brotherStatus ? 'borPolygon' : ''}`}
                                disabled={!!this.state.limit}
                            />
                            <span>同级机构网格</span>
                        </Col>
                    </Row>
                </div>

                {(authorityIsTrue('czht_qwgl_jgbj_bjsc') && isDraw) ||
                (authorityIsTrue('czht_qwgl_jgbj_bjxz') && isDraw) ||
                (authorityIsTrue('czht_qwgl_jgbj_bjbj') && isDraw) ? (
                    <div className={styles.draw}>
                        <Dropdown
                            overlay={mapMunes}
                            trigger={['click']}
                            disabled={this.state.limit}
                        >
                            <Button
                                className="ant-dropdown-link"
                                type="link"
                                style={{ color: '#fff', fontSize: '15px' }}
                            >
                                <Icon type="gateway" style={{ fontSize: '26px' }} />
                                网格绘制
                            </Button>
                        </Dropdown>
                    </div>
                ) : null}

                {(authorityIsTrue('czht_qwgl_jgbj_bzbj') && isDraw) ||
                (authorityIsTrue('czht_qwgl_jgbj_bzsc') && isDraw) ||
                (authorityIsTrue('czht_qwgl_jgbj_bzxz') && isDraw) ? (
                    <div className={styles.markDraw}>
                        <Dropdown
                            overlay={markDraw}
                            trigger={['click']}
                            disabled={this.state.limit}
                        >
                            <Button
                                className="ant-dropdown-link"
                                type="link"
                                style={{ color: '#fff', fontSize: '15px' }}
                            >
                                <Icon type="environment" style={{ fontSize: '26px' }} />
                                标注绘制
                            </Button>
                        </Dropdown>
                    </div>
                ) : null}
                {createBtn && (
                    <div className={styles.saveModel}>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Button
                                    className="ant-dropdown-link"
                                    type="primary"
                                    id="saveBtn"
                                    onClick={() =>
                                        determine == 'edit' ? this.updateDraw() : this.saveDraw()
                                    }
                                    disabled={!!this.state.isCancel}
                                >
                                    保存
                                </Button>
                            </Col>
                            <Col span={12}>
                                <Button
                                    className="ant-dropdown-link"
                                    id="cancelBtn"
                                    onClick={() => this.cancelDraw()}
                                >
                                    取消
                                </Button>
                            </Col>
                        </Row>
                    </div>
                )}

                <div className={styles.treeList}>
                    <Card bordered={false} className={styles.tableListCard}>
                        <div style={{ marginBottom: '200px' }}>
                            <Search
                                style={{ marginBottom: 8 }}
                                disabled={this.state.limit}
                                placeholder="搜索"
                                onSearch={value => this.onChange(value)}
                                enterButton
                            />
                            <Tree
                                onSelect={this.onSelect}
                                onExpand={this.onExpand}
                                expandedKeys={expandedKeys}
                                autoExpandParent={autoExpandParent}
                                disabled={!!this.state.limit}
                                // onLoad={searchTreeLoad}
                            >
                                {this.loop(this.props.service.useList)}
                            </Tree>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }
}

export default Form.create()(Organization);
