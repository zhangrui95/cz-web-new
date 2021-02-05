/* 摄像头点位标注
    ** Author: jhm
    ** Date: 20201215
 */

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
    Modal,Select, message,
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
const { Option } = Select;
var mapClick = null;
import {
    initView,
    offlineMapLayer,
    initshowVectorP,
    initShowVectorPoint,
    initShowVector,
    highlightCarLocationStyle,
    initOtherView,
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
let HMap;
let edit;
let addPointPopup;
let popup;
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
        searchValue: '',
        autoExpandParent: true, // 是否自动展开tree的父节点
        drawGps: [],
        createBtn: false, // 绘制场所标注时的标注信息模态框
        isDraw: false, // 场所绘制标注按钮是否展示
        drawType: '', // 是点还是线
        polygonId: '',
        pointId: '',
        determine: '',
        childrenStatus: false,
        brotherStatus: false,
        parentStatus: false,
        newSource: null,
        treeValue: '', // 选中的机构的编码
        disabledParent: false,
        disabledBrother: false,
        disabledChildren: false,
        limit: false, // true :新建标注时有些按钮无法点击 
        isEdit: false,
        isCancel: false,
        selectedKeys: ['0'],
        addPoint: false, // 是否是添加点
        deleteBtn: [], // 删除的点
        EditPoint: false, // 编辑标注点
        editBtn: [], // 选择编辑的数据点
        streetValue: '', // 卡口街道名称
        userCode: JSON.parse(sessionStorage.getItem('user')).department, // 当前账号所属的机构编码
        jdmc:'',
        sxtbh:'',
        sblx:'',
        layer:'',// 编辑时选中的点的信息
        kklx:'',
        kkname:'2', // 卡口名称，默认是视频卡口
    };

    componentDidMount() {
        // 初始化地图
        console.log('111111111111111111111111',JSON.parse(sessionStorage.getItem('user')));
        this.initMap();
        // 绑定编辑操作记录新增事件
        HGis.onEditRecordCreate(HMap, e => {
            this.onEditRecordCreate(e, this);
        });
    }
    componentWillUnmount() {
        HGis.destroyMapEdit(HMap);
    }
    onEditRecordCreate = (e, that) => {
        console.log('e',e)
        if (e.record.type == 2 || e.record.type == 3 || e.record.type == 4) {
            that.setState({
                createBtn: true,
                isCancel: false,
                drawGps: e.record.features[0].geometry.coordinates,
            });
            document.getElementById('add-content').innerHTML = '';
        }
        e.record;
    };
    // 获取网格
    getGpsList = (treevalue) => {
        console.log('获取网格');
        const { dispatch } = this.props;
        dispatch({
            type: 'createService/getGpsList',
            payload: {
                pd: {
                    bayonet_type: this.state.kkname,
                    gxdwdm: treevalue ? treevalue : '',
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
        
    };
    // 初始化地图
    initMap = () => {
        const {treeValue} = this.state;
        const mapOptions = initOtherView();
        HMap = HGis.initMap(
            window.configUrl.mapType,
            'map',
            mapOptions,
            window.configUrl.mapServerUrl,
        );
        this.setState({
            view: HMap.map,
        });
        edit = HGis.initMapEdit(HMap, { // 加载编辑组件
            boxSelect: true,
            touchEnabled: true,
            displayControlsDefault: true,
            showButtons: false,
        });
        HGis.enableEditDraw(HMap);
        // HGis.disableEditDraw(HMap);
        let IconAdd = HGis.makeIcon(HMap, {
            iconUrl: './image/sysmark_1.png',
        });
        let Icon = HGis.makeIcon(HMap, {
            iconUrl: './image/sysmark.png',
        });
        this.setState({
            view: HMap.map,
            IconAddId: IconAdd.id,
            Icon,
        });
        this.getPopUp('point');
        let _self = this;
        HMap.map.on("edit.selected", (e)=>{
            console.log('d',edit.draw.getSelected())
            let layer = edit.draw.getSelected().features[0].properties
            layer.gps = [...edit.draw.getSelected().features[0].geometry.coordinates]
            // layer.bayonet_id = edit.draw.getSelected().features[0].id
            console.log('layer',layer)
            _self.setState({
                createBtn: true,
                drawType: 'Point',
                determine: 'edit',
                limit: true,
                isEdit: true,
                deleteBtn: [],
                jdmc:layer.jdmc,
                sxtbh:layer.sxtbh,
                sblx:layer.sblx,
                kklx:layer.kklx,
                layer,
            });
        });
    };
    //鼠标划过提示
    getPopUp = type => {
        let _self = this;
        let options = {
            popupOptions: {
                closeButton: false,
                closeOnClick: false,
                anchor: 'top-left',
                offset: [0, 10],
            },
        };
        if (!popup) {
            popup = HGis.addPopup(HMap, options);
        }
        let popupBody = document.getElementById('popups');
        let popups = document.getElementById('popups-content');
        HGis.bindMapMouseMove(
            HMap,
            (point, coord, features) => {
                if (features && features.length) {
                    HMap.map.getCanvas().style.cursor = 'pointer';
                    let layer = features[0].properties.layer
                        ? JSON.parse(features[0].properties.layer)
                        : {};
                    _self.popupRender(layer, popups);
                    HGis.setElementLatLng(HMap, popup, coord);
                    HGis.setElementHTMLElement(HMap, popup, popupBody);
                    HGis.addElementToMap(HMap, popup);
                }
            },
            type,
        );
        HGis.bindMapMouseLeave(
            HMap,
            () => {
                popups.innerHTML = '';
                HGis.removePopup(HMap, popup);
                HMap.map.getCanvas().style.cursor = '-webkit-grab';
            },
            type,
        );
    };
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
        // console.log('files', files);
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

    // 地图画点
    drawPoint = type => {
        console.log('type122',type)
        HMap.map.getCanvas().style.cursor = 'copy';
        let options = {
            trackPointer: true,
            popupOptions: {
                closeButton: false,
                closeOnClick: false,
                offset: [0, 56],
            },
        };
        if (!addPointPopup) {
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
        console.log('this.state.IconAddId', this.state.IconAddId);
        HGis.onEditCtrlActive(HMap, 'icon', {
            iconImage: this.state.IconAddId,
            iconSize: 1,
            iconRotate: 0,
        });
    };

    // 点回显
    showPoint = files => {
        console.log('画点', files);
        var _self = this;
        const {
            createService: { gpsList },
        } = this.props;

        HGis.enableEditDraw(HMap);
        let data = [];
        // HGis.removeLayer(HMap, 'point');
        for (var i = 0; i < files.length; i++) {
            if (files[i]['gps']) {
                data.push({
                    coordinate: files[i]['gps'],
                    properties: {
                        custom_style: "true",
                        feature_type: "icon",
                        iconImage: this.state.Icon.id,
                        iconSize: 1,
                        iconRotate: 0,
                        sxtbh:files[i]['kkdm'],
                        jdmc:files[i]['kkmc'],
                        sblx:files[i]['classify'],
                        kklx:files[i]['bayonet_type'].toString(),
                        bayonet_id: files[i]['bayonet_id'],
                    },
                });
            }
        }
        HGis.setEditFeature(HMap, 'Point', data);
        // 旧
        // let markOptions = {
        //     id: 'point',
        //     data: [],
        //     textField: 'title',
        //     iconSize: 1,
        // };
        // if (files) {
        //     const { view, showVectorPoint, map, vector, source, draw } = this.state;
        //     HGis.removeLayer(HMap, 'point');
        //     for (var i = 0; i < files.length; i++) {
        //         if (files[i]['gps']) {
        //             if (longrg.test(files[i]['gps'][0]) && latreg.test(files[i]['gps'][1])) {
        //                 markOptions.data.push({
        //                     coordinate: files[i]['gps'],
        //                     properties: {
        //                         title: '',
        //                         type: 'Point',
        //                         layer: files[i],
        //                     },
        //                 });

        //             }
        //         }
        //     }
        //     HGis.addMarkLayer(HMap, this.state.Icon, markOptions);
        // }
    };
    // 绘制点保存
    saveDraw = () => {
        let {
            drawGps,
            expandedKeys,
            userCode,
            drawType,
            treeValue,layer,
        } = this.state;
        let newdrawGpsObj = [];
        if (drawType == 'Point') {
            newdrawGpsObj = [...drawGps];
        }
        console.log('layer',layer)
        const {
            dispatch,
            createService: { useList },
        } = this.props;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.dispatch({
                    type: 'createService/createNewGpsLabel',
                    payload: {
                        kkdm: values.sxtbh,
                        kkmc: values.jdmc,
                        jd: newdrawGpsObj[0],
                        wd: newdrawGpsObj[1],
                        bayonet_type: values.kklx,
                        gxdwdm: treeValue,
                        classify: values.sblx,
                    },
                    success: e => {
                        console.log('e000',e);
                        if (e.result.reason.code == '200') {
                            this.getGpsList(treeValue);
                            this.initLayers();
                            Message.success('保存成功');
                            HMap.map.getCanvas().style.cursor = '-webkit-grab';
                            // HGis.delEditAllFeatures(HMap);
                            this.setState({
                                createBtn: false,
                                limit: false,
                                isCancel: false,
                                addPoint: false,
                                jdmc:'',
                                sxtbh:'',
                                sblx:'',
                                kklx:'',
                            });
                            this.props.prompt(false);
                            this.props.form.resetFields();
                            // [126.70154571533202, 45.75925987208319] 国际会议中心[126.70135259628294, 45.75530004103774]
                        } else {
                            this.getGpsList(treeValue);
                            this.initLayers();
                            Message.error('保存失败,'+e&&e.result&&e.result.reason&&e.result.reason.text?e.result.reason.text:'');
                            HMap.map.getCanvas().style.cursor = '-webkit-grab';
                            // HGis.delEditAllFeatures(HMap);
                            this.setState({
                                createBtn: false,
                                limit: false,
                                isCancel: false,
                                addPoint: false,
                                jdmc:'',
                                sxtbh:'',
                                sblx:'',
                                kklx:'',
                            });
                            this.props.form.resetFields();
                            return false;
                        }
                    },
                });
            } else {
                Message.error('有必填信息没填写');
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
            editBtn,layer,
            userCode,
        } = this.state;
        console.log('layer',layer)
        console.log('userCode', userCode);
        console.log('drawGps', drawGps);
        let newdrawGpsObj = [];
        if (drawType == 'Point') {
            newdrawGpsObj = [...drawGps];
        }
        const that = this;
        console.log('ca',this.props.form.getFieldsValue())
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('values',values)
                that.props.dispatch({
                    type: 'createService/updatenewGpsLabel',
                    payload: {
                            bayonet_id:layer.bayonet_id,
                            kkdm: values.sxtbh,
                            kkmc: values.jdmc,
                            jd: newdrawGpsObj.length>0?newdrawGpsObj[0]:layer.gps[0],
                            wd: newdrawGpsObj.length>0?newdrawGpsObj[1]:layer.gps[1],
                            bayonet_type: values.kklx,
                            gxdwdm: treeValue,
                            classify: values.sblx,
                    },
                    success: e => {
                        if (e.result.reason.code == '200') {
                            Message.success('修改成功');
                            HMap.map.getCanvas().style.cursor = '-webkit-grab';
                            // HGis.delEditAllFeatures(HMap);
                            that.getGpsList(treeValue);
                            that.initLayers();
                            that.setState({
                                createBtn: false,
                                limit: false,
                                isCancel: false,
                                EditPoint: false,
                                editBtn: [],
                                layer:'',
                                jdmc:'',
                                sxtbh:'',
                                sblx:'',
                                kklx:'',
                            });
                            that.props.prompt(false);
                            this.props.form.resetFields();
                        } else {
                            that.getGpsList(treeValue);
                            that.initLayers();
                            that.setState({
                                createBtn: false,
                                limit: false,
                                isCancel: false,
                                EditPoint: false,
                                editBtn: [],
                                layer:'',
                                jdmc:'',
                                sxtbh:'',
                                sblx:'',
                                kklx:'',
                            });
                            HMap.map.getCanvas().style.cursor = '-webkit-grab';
                            // HGis.delEditAllFeatures(HMap);
                            this.props.form.resetFields();
                            Message.error('修改失败');
                            return false;
                        }
                    },
                });
            }
            else {
                console.log('err',err)
                Message.error('有必填信息没填写');
            }
        });

    };
    // 修改或添加的取消
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
            // draw.setActive(false);
            console.log(treeValue);
            // map.removeInteraction(draw);
            if (HMap && edit) {
                // HGis.delEditAllFeatures(HMap); // 整个地图不可编辑
                // HGis.disableEditDraw(HMap);
            }
            document.getElementById('add-content').innerHTML = '';
            HMap.map.getCanvas().style.cursor = '-webkit-grab';
        } else {
            this.setState({
                EditPoint: false,
                editBtn: [],
                layer:'',
            });
        }
        this.props.prompt(false);
        // map.removeInteraction(draw)
        this.initLayers();
        // select.getFeatures().clear();
        this.getGpsList(treeValue);
        this.setState({ createBtn: false, limit: false, isEdit: false,jdmc:'',sxtbh:'',sblx:'',kklx:'', drawGps: [],});
        document.getElementById('map').onmouseover = function() {
            // this.style.cursor = "url('./image/pen.png'),w-resize";
            this.style.cursor = 'auto';
        };
        this.props.form.resetFields();
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
        const { deleteBtn, treeValue,layer } = this.state;
        console.log('layer',layer);
        let that = this;
        Modal.confirm({
            title: '您确认要删除该机构标注吗？',
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                that.props.dispatch({
                    type: 'createService/delGpsLabel',
                    payload: {
                        bayonet_id: layer.bayonet_id,
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
                                limit: false,
                                jdmc:'',
                                sxtbh:'',
                                sblx:'',
                                kklx:'',
                                drawGps: [],
                            });
                            this.props.form.resetFields();
                        } else {
                            Message.error('删除失败，请稍后重试！');
                            this.getGpsList(treeValue);
                            this.initLayers();
                            this.setState({
                                createBtn: false,
                                drawType: 'Point',
                                isCancel: false,
                                deleteBtn: [],
                                limit: false,
                                jdmc:'',
                                sxtbh:'',
                                sblx:'',
                                kklx:'',
                                drawGps: [],
                            });
                            this.props.form.resetFields();
                            return false;
                        }
                    },
                });
            },
            onCancel:()=>{
                this.setState({
                    createBtn: false,
                    drawType: 'Point',
                    isCancel: false,
                    deleteBtn: [],
                    drawGps: [],
                    limit: false,
                    jdmc:'',
                    sxtbh:'',
                    sblx:'',
                    kklx:'',
                });
            }
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
        const that = this
            this.setState(
                {
                    treeValue: expandedKeys[0],
                    autoExpandParent: true,
                    isDraw: true,
                    createBtn: false,
                    limit: false,
                },
                () => {
                    HMap.map.on('load', function() {
                        console.log('cunwanle lllllll');
                        if (expandedKeys.length) {
                            that.getGpsList(expandedKeys[0]);
                        }
                    });
                    if (expandedKeys.length) {
                        that.getGpsList(expandedKeys[0]);
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
    // 选择卡口名称
    selectStreet = obj => {
        console.log('obj', obj);
        const { treeValue } = this.state;
        this.setState({
            kkname:obj
        },()=>{
            this.getGpsList(treeValue);
        })
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

                {isDraw ? (
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
                                场所标注绘制
                            </Button>
                        </Dropdown>
                    </div>
                ) : null}
                {createBtn && (
                    <div className={styles.saveModel}>
                        <Form style={{ padding: '12px 24px 6px 24px' }}>
                            <Row>
                                <Col {...colLayout}>
                                    <FormItem label="街道名称" {...formItemLayout}>
                                        {getFieldDecorator('jdmc', {
                                            initialValue: this.state.jdmc,
                                            rules: [{ required: true, message: '请填写街道名称' }],
                                        })(<Input placeholder="请填写街道名称" />)}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row>
                                <Col {...colLayout}>
                                    <FormItem label="摄像头编号" {...formItemLayout}>
                                        {getFieldDecorator('sxtbh', {
                                            initialValue: this.state.sxtbh,
                                            rules: [{ required: true, message: '请填写摄像头编号' }],
                                        })(<Input placeholder="请填写摄像头编号" />)}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row>
                                <Col {...colLayout}>
                                    <FormItem label="设备类型" {...formItemLayout}>
                                        {getFieldDecorator('sblx', {
                                            initialValue: this.state.sblx? this.state.sblx:undefined,
                                            rules: [{ required: true, message: '请选择设备类型' }],
                                        })(
                                            <Select placeholder='请选择设备类型'>
                                                <Option key='hdCamera'>高清摄像头</Option>
                                                <Option key='ordinaryCamera'>普通摄像头</Option>
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row>
                                <Col {...colLayout}>
                                    <FormItem label="卡口类型" {...formItemLayout}>
                                        {getFieldDecorator('kklx', {
                                            initialValue: this.state.kklx? this.state.kklx:undefined,
                                            rules: [{ required: true, message: '请选择卡口类型' }],
                                        })(
                                            <Select placeholder='卡口类型'>
                                                <Option key='1'>卡口</Option>
                                                <Option key='2'>视频卡口</Option>
                                                <Option key='3'>重点场所</Option>
                                                <Option key='4'>警务站</Option>
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                        </Form>
                        <Row gutter={[16, 0]} style={{padding:'0 24px 24px'}}>
                            <Col span={9}>

                            </Col>
                            <Col span={5}>
                                {determine == 'edit'?
                                    <Button
                                        className="ant-dropdown-link"
                                        type="primary"
                                        id="saveBtn"
                                        onClick={() =>this.DelePoint()  }
                                        // disabled={!!this.state.isCancel}
                                    >
                                        删除
                                    </Button>
                                    :''
                                }
                            </Col>
                            <Col span={5}>
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
                            <Col span={5}>
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
                                {this.loop(this.props.createService.useList)}
                            </Tree>
                        </div>
                    </Card>
                </div>
                <div className={styles.selectList}>
                    <Card bordered={false} className={styles.tableListCard}>
                        <div className={styles.selectname}>请选择卡口类别：</div>
                        <div>
                            <Select
                                // mode="multiple"
                                // allowClear
                                style={{ width: '100%' }}
                                placeholder="请选择卡口类别"
                                defaultValue={'2'}
                                onChange={this.selectStreet}
                                disabled={this.state.limit}
                            >
                               <Option key='1'>卡口</Option>
                               <Option key='2'>视频卡口</Option>
                               <Option key='3'>重点场所</Option>
                               <Option key='4'>警务站</Option>
                            </Select>
                        </div>
                    </Card>
                </div>
            
            </div>
        );
    }
}

export default Form.create()(Organization);
