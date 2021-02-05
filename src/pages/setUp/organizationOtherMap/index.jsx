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
let HMap;
let edit;
let addPointPopup;
let popup;
import {
    initView,
    offlineMapLayer,
    initshowVectorP,
    initShowVectorPoint,
    initShowVector,
    highlightCarLocationStyle, initOtherView,
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
let latreg = /^(\-|\+)?([0-8]?\d{1}\.\d{0,15}|90\.0{0,15}|[0-8]?\d{1}|90)$/;
let longrg = /^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,15})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,15}|180)$/;
@connect(({ createService, loading }) => ({
    createService,
    loading: loading.models.createService,
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
        addPoint: false, // 是否是添加点
        deleteBtn: [], // 删除的点
        EditPoint: false, // 编辑标注点
        editBtn: [], // 选择编辑的数据点
        streetValue: '', // 卡口路口名称
        userCode: JSON.parse(sessionStorage.getItem('user')).department, // 当前账号所属的机构编码
    };

    componentDidMount() {
        this.initMap();
        // 绑定编辑操作记录新增事件
        HGis.onEditRecordCreate(HMap,(e)=>{
            this.onEditRecordCreate(e,this)
        })
    }
    componentWillUnmount(){
        HGis.destroyMapEdit(HMap);
    }
    onEditRecordCreate = (e,that) => {
        if( e.record.type == 2 || e.record.type == 3){
            that.setState({
                createBtn: true,
                isCancel: false,
                drawGps:e.record.features[0].geometry.coordinates,
            });
            document.getElementById('add-content').innerHTML = '';
        }
        // record结果说明如下：
        // {
        //     type:0,/*操作类型：0-无、1-删除、2-修改、3-新增、4-替换*/
        //     action:0,/*更新操作行为：0-无、1-图形移动、2-更改图形形状点、3-更改properties*/
        //     features:[],/*本次操作后的features*/
        //     prevFeatures[] /*本次操作前的features*/
        // }
        e.record
    }
    // 获取网格
    getGpsList = e => {
        console.log('获取网格');
        const { dispatch } = this.props;
        const { treeValue } = this.state;
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
                type: 'createService/getGpsList',
                payload: {
                    pd: {
                        bayonet_type: 5,
                        gxdwdm:treeValue,
                    },
                    currentPage: 1,
                    showCount: 99999,
                },
                success: files => {
                    this.initLayers();
                    console.log('获取成功', files);
                    if (files.result.reason.code == '200') {
                        this.showPoint(files.result.list);
                    } else {
                        return false;
                    }
                },
            });
        }
    };
    // 初始化地图
    initMap = () => {
        const mapOptions = initOtherView();
        HMap = HGis.initMap(window.configUrl.mapType, 'map', mapOptions, window.configUrl.mapServerUrl);
        edit = HGis.initMapEdit(HMap,{
            boxSelect: true,
            touchEnabled: true,
            displayControlsDefault: true,
            showButtons: false,
        })
        HGis.disableEditDraw(HMap);
        let IconAdd = HGis.makeIcon(HMap, {
            iconUrl: './image/sysmark_1.png',
        });
        let Icon = HGis.makeIcon(HMap, {
            iconUrl: './image/sysmark.png',
        });
        this.setState({
            view: HMap.map,
            IconAddId:IconAdd.id,
            Icon,
        });
        this.getPopUp('point');
        let _self = this;
        HGis.bindMapClick(HMap, (point,coord,features)=>{
            let layer = features[0].properties.layer ? JSON.parse(features[0].properties.layer) : {};
            //判断当前单击处是否有要素，捕获到要素时弹出popup
            console.log('addPoint', _self.state.addPoint);
            console.log('EditPoint', _self.state.EditPoint);
            if (layer && !_self.state.addPoint && !_self.state.EditPoint) {
                let deleteBtn = [];
                if (layer) {
                    deleteBtn.push(layer);
                }
                console.log('deleteBtn', deleteBtn);
                _self.setState({
                    deleteBtn,
                });
            } else if (layer && _self.state.EditPoint) {
                let editBtn = [];
                if (layer) {
                    editBtn.push(layer);
                }
                console.log('editBtn', editBtn);
                _self.setState({
                    editBtn,
                });
            }
        },'point');
        // let draw, circle; // 绘制对象
        // var _self = this;
        //
        // // 创建地图
        // const view = initView();
        //
        // // 指定地图要显示在id为map的div中
        // var map = new ol.Map({
        //     view: view,
        //     target: 'map',
        // });
        // map.addLayer(offlineMapLayer());
        // //实例化一个矢量图层Vector作为绘制层
        // var source = new ol.source.Vector({});
        // var newSource = new ol.source.Vector({});
        // var vector = new ol.layer.Vector({
        //     source: source,
        // });
        //
        // map.addLayer(vector); //将绘制层添加到地图容器中
        //
        // //为地图容器添加单击事件监听
        // map.on('click', function(evt) {
        //     let point = evt.coordinate; //鼠标单击点坐标
        //     console.log(point, '地图坐标点', evt);
        //     // console.log(point.transform('EPSG:3857', 'EPSG:4326').getCoordinates())
        //     console.log(ol.proj.transform(point, 'EPSG:3857', 'EPSG:4326'));
        //     //判断当前单击处是否有要素，捕获到要素时弹出popup
        //     var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
        //         return feature;
        //     });
        //     console.log('addPoint', _self.state.addPoint);
        //     console.log('EditPoint', _self.state.EditPoint);
        //     if (feature && !_self.state.addPoint && !_self.state.EditPoint) {
        //         console.log('gps点信息', feature.get('layer'));
        //         //    console.log('feature', feature)
        //         //    console.log('layer', feature.get('layer'))
        //         let deleteBtn = [];
        //         if (feature.get('layer')) {
        //             deleteBtn.push(feature.get('layer'));
        //         }
        //         console.log('deleteBtn', deleteBtn);
        //         _self.setState({
        //             deleteBtn,
        //         });
        //     } else if (feature && _self.state.EditPoint) {
        //         console.log('编辑', feature.get('layer'));
        //         let editBtn = [];
        //         if (feature.get('layer')) {
        //             editBtn.push(feature.get('layer'));
        //         }
        //         console.log('editBtn', editBtn);
        //         _self.setState({
        //             editBtn,
        //         });
        //     }
        // });
        // // 为地图容器添加双击事件
        // map.on('dblclick', function(event) {});
        // /**
        //  * 为map添加鼠标移动事件监听，当指向标注时改变鼠标光标状态
        //  */
        // /*        map.on('pointermove', function (e) {
        //                 var pixel = map.getEventPixel(e.originalEvent);
        //                 var hit = map.hasFeatureAtPixel(pixel);
        //                 map.getTargetElement().style.cursor = hit ? 'pointer' : '';
        //             });*/
        // map.on('singleclick', e => {
        //     console.log('单击');
        // });
        // let select = new ol.interaction.Select({
        //     style: function(feature) {
        //         return _self.styleSelect(feature);
        //     },
        //     // 关键： 设置过了条件，可以用feature来写过滤，也可以用layer来写过滤
        //     filter: function(feature, layer, type) {
        //         var geometry = feature.getGeometry();
        //         var attribute = feature.getProperties();
        //         console.log(
        //             feature,
        //             '=====',
        //             layer,
        //             '----',
        //             _self.state.drawType,
        //             '++',
        //             feature.getGeometry(),
        //             '----',
        //             feature.get('typeName'),
        //             '=====',
        //             _self.state.determine,
        //             'type',
        //         );
        //         if (_self.state.determine == 'new') {
        //             if (feature.get('typeName') == undefined) {
        //                 return true;
        //             }
        //         } else {
        //             return feature.get('typeName') == _self.state.drawType;
        //         }
        //     },
        // });
        // let modify = new ol.interaction.Modify({
        //     features: select.getFeatures(), //选中的要素
        // });
        // map.addInteraction(select);
        // map.addInteraction(modify);
        // select.setActive(false); //激活选择要素控件
        // modify.setActive(false); //激活修改要素控件
        //
        // var showVector = initShowVector();
        // var showVectorPoint = initShowVectorPoint();
        // map.addLayer(showVector);
        // map.addLayer(showVectorPoint);
        //
        // // 显示标注点信息
        // var popupBody = document.getElementById('popups');
        // var popups = document.getElementById('popups-content');
        // var overlaypopup = new ol.Overlay({
        //     element: popupBody,
        //     autoPan: true,
        //     positioning: 'right-center',
        //     stopEvent: false,
        //     autoPanAnimation: {
        //         duration: 250,
        //     },
        // });
        // map.addOverlay(overlaypopup);
        // map.on('pointermove', function(evt) {
        //     var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
        //         return feature;
        //     });
        //     if (feature && feature.get('gps')) {
        //         var coodinate = ol.proj.fromLonLat(feature.get('gps'));
        //         if (window.configUrl.iStreet) {
        //             _self.popupRender(feature.get('layer'), popups);
        //             _self.setState({
        //                 mapClik: true,
        //             });
        //             console.log('overlaypopup', overlaypopup);
        //             overlaypopup.setPosition(coodinate);
        //         }
        //     } else {
        //         popups.innerHTML = '';
        //         overlaypopup.setPosition(undefined);
        //     }
        // });
        //
        // this.setState({
        //     draw: draw,
        //     circle: circle,
        //     map: map,
        //     view: view,
        //     vector: vector,
        //     source: source,
        //     select: select,
        //     modify: modify,
        //     showVector: showVector,
        //     showVectorPoint: showVectorPoint,
        //     newSource: newSource,
        // });
    };
    //鼠标划过提示
    getPopUp = (type) =>{
        let _self = this;
        let options = {
            popupOptions:{
                closeButton: false,
                closeOnClick: false,
                anchor: 'top-left',
                offset: [0, 10]
            },
        }
        if(!popup){
            popup = HGis.addPopup(HMap, options);
        }
        let popupBody = document.getElementById('popups');
        let popups = document.getElementById('popups-content');
        HGis.bindMapMouseMove(HMap,(point,coord,features)=>{
            if(features && features.length){
                HMap.map.getCanvas().style.cursor = 'pointer';
                let layer = features[0].properties.layer ? JSON.parse(features[0].properties.layer) : {};
                _self.popupRender(layer, popups);
                HGis.setElementLatLng(HMap, popup, coord);
                HGis.setElementHTMLElement(HMap, popup,popupBody);
                HGis.addElementToMap(HMap, popup);
            }
        },type)
        HGis.bindMapMouseLeave(HMap,()=>{
            popups.innerHTML = '';
            HGis.removePopup(HMap, popup);
            HMap.map.getCanvas().style.cursor = '-webkit-grab';
        },type)
    }
    popupRender = (files, popups) => {
        popups.innerHTML = '';
        var body = document.createElement('div');
        body.className = 'popupBody';
        body.style.background = 'rgba(0,0,0,0.5)';
        body.style.padding = '5px 10px';
        popups.appendChild(body);
        var elementA = document.createElement('div');
        elementA.className = 'item';
        body.appendChild(elementA);
        var spanA = document.createElement('div');
        spanA.className = 'title';
        console.log('files', files);
        spanA.innerText =
            '名称：' +
            (files.kkmc || '') +
            '\n' +
            '经度：' +
            (files.gps[0] || '') +
            '\n' +
            '纬度：' +
            (files.gps[1] || '') +
            '\n';
        elementA.appendChild(spanA);
        body.appendChild(elementA);
    };

    // 地图上点与线的修改样式
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
    // 地图画点
    drawPoint = type => {
        HMap.map.getCanvas().style.cursor = 'copy';
        let options = {
            trackPointer:true,
            popupOptions:{
                closeButton: false,
                closeOnClick: false,
                offset: [0,56]
            },
        }
        if(!addPointPopup){
            addPointPopup = HGis.addPopup(HMap, options);
        }
        let addPoint = document.getElementById('add-content');
        let addPointBody = document.getElementById('add');
        addPoint.innerHTML = '';
        var body = document.createElement('div');
        body.className = 'addBody';
        body.style.backgroundImage = "url('./image/sysmark_1.png')";
        addPoint.appendChild(body);
        HGis.setElementHTMLElement(HMap, addPointPopup, addPointBody);
        HGis.addElementToMap(HMap, addPointPopup);
        this.setState({
            drawType: type,
            determine: 'new',
            limit: true,
            createBtn: false,
            isCancel: false,
        });
        HGis.enableEditDraw(HMap);
        console.log('this.state.IconAddId',this.state.IconAddId)
        HGis.onEditCtrlActive(HMap, 'icon', {iconImage: this.state.IconAddId, iconSize: 1, iconRotate: 0});
        // // 添加一个绘制的线使用的layer
        // var _self = this;
        // document.getElementById('map').onmouseover = function() {
        //     // this.style.cursor = "url('./image/pen.png'),w-resize";
        //     this.style.cursor = 'copy';
        // };
        // this.setState({
        //     drawType: type,
        //     determine: 'new',
        //     limit: true,
        //     createBtn: false,
        //     isCancel: false,
        // });
        // this.props.prompt(true);
        // let { source, vector, view, map, draw, modify, showVector, select, circle } = this.state;
        // let drawArr = [];
        // map.removeInteraction(draw); //移除绘制图形
        // const lineLayer = new ol.layer.Vector({
        //     source: source,
        //     style: new ol.style.Style({
        //         image: new ol.style.Icon({
        //             scale: 1.1, // 图标缩放比例 // 0为离线其他为在线
        //             src: './image/sysmark.png', // 图标的url
        //         }),
        //         // fill: new ol.style.Fill({
        //         // 	color: 'rgba(224,156,25, 0.2)'
        //         // }),
        //         // stroke: new ol.style.Stroke({
        //         // 	color: 'red',
        //         // 	width: 5
        //         // })
        //     }),
        // });
        // console.log('lineLayer', lineLayer);
        // map.addLayer(lineLayer);
        //
        // draw = new ol.interaction.Draw({
        //     type: type,
        //     source: lineLayer.getSource(), // 注意设置source，这样绘制好的线，就会添加到这个source里
        //     style: new ol.style.Style({
        //         image: new ol.style.Icon({
        //             scale: 1.1, // 图标缩放比例 // 0为离线其他为在线
        //             src: './image/sysmark_1.png', // 图标的url
        //         }),
        //     }),
        //     // minPoints: 4    // 限制不超过4个点
        // });
        //
        // map.addInteraction(draw);
        //
        // select.setActive(true);
        // modify.setActive(true);
        // // 监听线绘制结束事件，获取坐标
        // draw.on('drawend', function(event) {
        //     draw.setActive(false);
        //     console.log('event.feature.getGeometry()', event.feature.getGeometry());
        //     //   map.addInteraction(modify);
        //     _self.setState({
        //         drawGps: event.feature.getGeometry(),
        //         vector: vector,
        //         draw: draw,
        //         select: select,
        //         modify: modify,
        //         createBtn: true,
        //         addPoint: true,
        //     });
        // });
    };

    // 修改点
    editPolygon = type => {
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
        _self.setState({
            EditPoint: true,
        });
        select.on('select', function(e) {
            // 修改点
            console.log(e, '编辑----====');
        });
        modify.on('modifyend', function(e) {
            // 修改线
            console.log('EditPoint', _self.state.EditPoint);
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
    // 点回显
    showPoint = files => {
        // console.log('画点', files);
        var _self = this;
        const {
            createService: { gpsList },
        } = this.props;
        let markOptions = {
            id: 'point',
            data: [],
            textField: 'title',
            iconSize:1
        }
        if (files) {
            const { view, showVectorPoint, map, vector, source, draw } = this.state;
            HGis.removeLayer(HMap, 'point');
            for (var i = 0; i < files.length; i++) {
                if (files[i]['gps']) {
                    if (longrg.test(files[i]['gps'][0]) && latreg.test(files[i]['gps'][1])) {
                        markOptions.data.push({
                            coordinate: files[i]['gps'],
                            properties: {
                                title: '',
                                type: 'Point',
                                layer: files[i],
                            },
                        })
                        //  console.log(files[i])
                        // const pointFeature = new ol.Feature({
                        //     geometry: new ol.geom.Point(files[i]['gps']),
                        //     typeName: 'Point',
                        //     layer: files[i],
                        //     gps: files[i]['gps'],
                        // });
                        // pointFeature.setStyle(
                        //     new ol.style.Style({
                        //         image: new ol.style.Icon({
                        //             scale: map.getView().getZoom() / 18, // 图标缩放比例
                        //             src: './image/sysmark.png', // 图标的url
                        //         }),
                        //     }),
                        // );
                        // pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                        // source.addFeature(pointFeature);
                        // showVectorPoint.setSource(source);
                        //
                        // // // 监听地图层级变化
                        // map.getView().on('change:resolution', function() {
                        //     var style = pointFeature.getStyle();
                        //     // 重新设置图标的缩放率，基于层级10来做缩放
                        //     style.getImage().setScale(this.getZoom() / 15);
                        //     pointFeature.setStyle(style);
                        // });
                    }
                }
            }
            HGis.addMarkLayer(HMap, this.state.Icon, markOptions);
        }
    };
    // 绘制点保存
    saveDraw = () => {
        let {
            drawGps,
            parentKeys,
            expandedKeys,
            expandedKeysName,
            userCode,
            drawType,
            treeValue,
        } = this.state;
        let newdrawGpsObj = [];
        if (drawType == 'Point') {
            newdrawGpsObj = [...drawGps];
        }
        const {
            dispatch,
            createService: { useList },
        } = this.props;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                dispatch({
                    type: 'createService/createGpsLabel',
                    payload: {
                        kkmc: values.jdmc,
                        jd: newdrawGpsObj[0],
                        wd: newdrawGpsObj[1],
                        bayonet_type: 5,
                        gxdwdm: userCode,
                    },
                    success: e => {
                        if (e.result.reason.code == '200') {
                            Message.success('保存成功');
                            HMap.map.getCanvas().style.cursor = '-webkit-grab';
                            HGis.delEditAllFeatures(HMap);
                            this.getGpsList(treeValue);
                            this.initLayers();
                            this.setState({
                                createBtn: false,
                                limit: false,
                                isCancel: false,
                                addPoint: false,
                            });
                            this.props.prompt(false);
                            // [126.70154571533202, 45.75925987208319] 国际会议中心[126.70135259628294, 45.75530004103774]
                        } else {
                            this.getGpsList(treeValue);
                            this.initLayers();
                            HMap.map.getCanvas().style.cursor = '-webkit-grab';
                            HGis.delEditAllFeatures(HMap);
                            Message.error('保存失败');
                            this.setState({
                                createBtn: false,
                                limit: false,
                                isCancel: false,
                                addPoint: false,
                            });
                            return false;
                        }
                    },
                });
            } else {
                Message.error('请填写路口名称');
            }
        });
    };
    // 编辑线和点保存
    updateDraw = () => {
        let {
            drawGps,
            expandedKeys,
            drawType,
            polygonId,
            pointId,
            treeValue,
            editBtn,
        } = this.state;
        console.log('editBtn', editBtn);
        console.log('drawGps', drawGps);
        let newdrawGps = [];
        if (drawGps) {
            newdrawGps = drawGps.transform('EPSG:3857', 'EPSG:4326').getCoordinates();
        }
        const {
            dispatch,
            createService: { useList },
        } = this.props;
        if (editBtn.length > 0 && drawGps) {
            dispatch({
                type: 'createService/updateGpsLabel',
                payload: {
                    label_id: editBtn[0].label_id,
                    label_gps_point: newdrawGps,
                    label_type: 1,
                },
                success: e => {
                    if (e.result.reason.code == '200') {
                        Message.success('修改成功');
                        HMap.map.getCanvas().style.cursor = '-webkit-grab';
                        HGis.delEditAllFeatures(HMap);
                        this.getGpsList(treeValue);
                        this.initLayers();
                        this.setState({
                            createBtn: false,
                            limit: false,
                            isCancel: false,
                            EditPoint: false,
                            editBtn: [],
                        });
                        this.props.prompt(false);
                    } else {
                        this.getGpsList(treeValue);
                        this.initLayers();
                        this.setState({
                            createBtn: false,
                            limit: false,
                            isCancel: false,
                            EditPoint: false,
                            editBtn: [],
                        });
                        HMap.map.getCanvas().style.cursor = '-webkit-grab';
                        HGis.delEditAllFeatures(HMap);
                        Message.error('修改失败');
                        return false;
                    }
                },
            });
        } else {
            Message.warning('请选择编辑的标注点');
        }
    };
    // 删除网格和点
    delDraw = types => {
        let { treeValue, drawType, polygonId, pointId } = this.state;

        const {
            dispatch,
            createService: { useList },
        } = this.props;
        Modal.confirm({
            title: `${'您确认要删除'}${types == 'Point' ? '该机构标注' : '该机构边界'}${'吗？'}`,
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                dispatch({
                    type: 'createService/delGpsLabel',
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
    // 修改或添加取消
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
        if (HMap && edit) {
            HGis.delEditAllFeatures(HMap);
            HGis.disableEditDraw(HMap);
        }
        document.getElementById('add-content').innerHTML = '';
        HMap.map.getCanvas().style.cursor = '-webkit-grab';
        if (isEdit) {
            this.setState({
                EditPoint: false,
                editBtn: [],
            });
        }
        this.props.prompt(false);
        // map.removeInteraction(draw)
        this.initLayers();
        // select.getFeatures().clear();
        this.getGpsList(treeValue);
        this.setState({ createBtn: false, limit: false, isEdit: false });
        // document.getElementById('map').onmouseover = function() {
        //     // this.style.cursor = "url('./image/pen.png'),w-resize";
        //     this.style.cursor = 'auto';
        // };
        // if (!isCancel) {
        // 	console.log('quxiao')
        // 	draw.setActive(false)
        // 	map.removeInteraction(draw)
        // 	return
        // } else {
        // 	console.log('quxiao1')
        // }
    };
    // 删除标注点
    DelePoint = () => {
        const { deleteBtn, treeValue } = this.state;
        let that = this;
        Modal.confirm({
            title: '您确认要删除该机构标注吗？',
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                that.props.dispatch({
                    type: 'createService/delGpsLabel',
                    payload: {
                        bayonet_id: deleteBtn[0].bayonet_id,
                    },
                    success: e => {
                        if (e.result.reason.code == '200') {
                            Message.success('删除成功');
                            this.getGpsList(treeValue);
                            this.initLayers();
                            this.setState({
                                createBtn: false,
                                drawType: 'Point',
                                isCancel: false,
                                deleteBtn: [],
                            });
                        } else {
                            Message.error('删除失败，请稍后重试！');
                            this.getGpsList(treeValue);
                            this.initLayers();
                            this.setState({
                                createBtn: false,
                                drawType: 'Point',
                                isCancel: false,
                                deleteBtn: [],
                            });
                            return false;
                        }
                    },
                });
            },
        });
    };
    // 取消删除
    cancelDele = () => {
        this.setState({
            deleteBtn: [],
        });
    };

    /**
     *  图层初始化
     *  */
    initLayers = () => {
        console.log('图层初始化');
        HGis.removeLayer(HMap, 'point');
        // const {
        //     map,
        //     vector,
        //     showVector,
        //     showVectorPoint,
        //     select,
        //     modify,
        //     source,
        //     draw,
        //     newSource,
        // } = this.state;
        // map.removeInteraction(draw); //移除绘制图形
        // vector.setSource(null);
        // showVector.setSource(null);
        // showVectorPoint.setSource(null);
        // select.setActive(false);
        // modify.setActive(false);
        // source.clear();
        // newSource.clear();
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
            createService: {
                data: { page },
            },
        } = this.props;
        const { node } = info;
        const { props } = node;
        // if(!this.state.limit){
        console.log('selected', expandedKeys, info, props.dataRef.pid);

        // console.log(props.dataRef.parentId);
        // console.log(this.props.createService.useList.some(v => props.dataRef.parentId == v.parentId));
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
                    return getParentKey(item.name, this.props.createService.useList);
                }
                return null;
            })
            .filter((item, i, self) => item && self.indexOf(item) === i);

        this.setState({
            expandedKeys,
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
            if (item.childrenList) {
                return (
                    <TreeNode key={item.code} title={item.name} dataRef={item}>
                        {this.loop(item.childrenList)}
                    </TreeNode>
                );
            }
            return <TreeNode dataRef={item} key={item.code} title={item.name} />;
        });

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
            deleteBtn,
            streetValue,
        } = this.state;
        const {
            createService: {
                data: { list, page },
                useList,
                policeList,
                gpsList,
            },
            form: { getFieldDecorator },
        } = this.props;
        // console.log('gpsList',gpsList)
        // 进行数组扁平化处理
        generateList(this.props.createService.useList);
        const markDraw = (
            <Menu style={{ background: 'hsla(229, 42%, 21%, 0.75)', width: '160px' }}>
                {authorityIsTrue('czht_qwgl_jgbj_bzxz') && (
                    <Menu.Item key="0" onClick={() => this.drawPoint('Point')}>
                        新建标注
                    </Menu.Item>
                )}
                {/*{*/}
                {/*gpsList.length > 0 && authorityIsTrue('czht_qwgl_jgbj_bzbj') && (*/}
                {/*<Menu.Item key="1" onClick={() => this.editPolygon('Point')}>*/}
                {/*修改标注*/}
                {/*</Menu.Item>*/}
                {/*)}*/}
                {/*{*/}
                {/*authorityIsTrue('czht_qwgl_jgbj_bzsc') && (*/}
                {/*<Menu.Item key="2" onClick={() => this.delDraw('Point')}>*/}
                {/*删除标注*/}
                {/*</Menu.Item>*/}
                {/*)}*/}
            </Menu>
        );
        const formItemLayout = {
            labelCol: { xs: { span: 24 }, md: { span: 6 }, xl: { span: 6 }, xxl: { span: 6 } },
            wrapperCol: { xs: { span: 24 }, md: { span: 18 }, xl: { span: 18 }, xxl: { span: 18 } },
        };
        const colLayout = { sm: 24, md: 24, xl: 24, xxl: 24 };
        return (
            <div>
                <div id="add">
                    <div id="add-content" />
                </div>
                <img src={hylink} className={styles.hylinkLogo} />
                <div className={styles.calendar}>
                    <div id="map" className={styles.mapDivStyle} />
                </div>
                <div id="popups" className={styles.olpopup}>
                    <div id="popups-content" />
                </div>

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
                                路口标注绘制
                            </Button>
                        </Dropdown>
                    </div>
                ) : null}
                {createBtn && (
                    <div className={styles.saveModel}>
                        <Form style={{ padding: '6px 12px' }}>
                            <Row>
                                <Col {...colLayout}>
                                    <FormItem label="路口名称" {...formItemLayout}>
                                        {getFieldDecorator('jdmc', {
                                            // initialValue: this.state.jjsj,
                                            rules: [{ required: true, message: '请填写路口名称' }],
                                        })(<Input placeholder="请填写路口名称" />)}
                                    </FormItem>
                                </Col>
                            </Row>
                        </Form>
                        <Row gutter={[16, 0]}>
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
                {deleteBtn.length > 0 ? (
                    <div
                        className={styles.saveModel}
                        style={{ height: 60, width: 240, lineHeight: '60px' }}
                    >
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Button
                                    className="ant-dropdown-link"
                                    type="primary"
                                    id="saveBtn"
                                    onClick={() => this.DelePoint()}
                                    disabled={!!this.state.isCancel}
                                >
                                    删除
                                </Button>
                            </Col>
                            <Col span={12}>
                                <Button
                                    className="ant-dropdown-link"
                                    id="cancelBtn"
                                    onClick={() => this.cancelDele()}
                                >
                                    取消
                                </Button>
                            </Col>
                        </Row>
                    </div>
                ) : (
                    ''
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
                                {this.loop(this.props.createService.useList)}
                            </Tree>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }
}

export default Form.create()(Organization);
