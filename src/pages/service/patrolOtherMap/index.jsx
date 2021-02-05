import React, { Component } from 'react';
import moment from 'moment';
import {
    message,
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
    Select,
    TreeSelect,
    Popover,
} from 'antd';
import { connect } from 'dva';
import ol from 'openlayers';
import Calendar from 'react-calendar';
import styles from './index.less';
import outlineCar from '@/assets/outlineCar.png';
import { authorityIsTrue } from '@/utils/authority';
const { Option } = Select;
const { configUrl } = window;
const FormItem = Form.Item;
const { Search } = Input;
const { SubMenu } = Menu;
const { TreeNode, DirectoryTree } = Tree;
var mapClick = null;
import {
    initView,
    offlineMapLayer,
    initpatrolRoutesVector,
    initpatrolRoutesVectorZd,
    inittourPointVector,
    initShowVector,
    initpatrolGridVector,
    initbreakPointVector,
    highlightCarLocationStyle,
    initOtherView,
} from '@/utils/olUtils';
import '@/utils/HGis.js';
import { setInterval } from 'timers';
import hylink from '@/assets/hylink.png';
let edit;
let addPointPopup;
let popup;
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
const key = 'updatable';
let dataList = []; //组织机构树数据初始
let dataReconList = []; //网格菜单数据初始
const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
    },
};
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
let HMap;
@connect(({ service, loading }) => ({
    service,
    loading: loading.models.service,
}))
class PatrolOtherMap extends Component {
    constructor(props) {
        super(props);
    }
    state = {
        map: null,
        view: null,
        vector: null,
        select: null,
        modify: null,
        breakPointVector: null, //休息点的vector
        showVector: null, //机构边界的vector
        patrolRoutesVector: null, //线路点的vector
        patrolRoutesZdVector: null, //自动线路的vector
        tourPointVector: null, //驻巡点的vector
        patrolGridVector: null, //网格的vector
        onlySource: null, //选中左侧菜单栏时的source
        pointFeature: null,
        newSource: null, //新建时的source
        source: null,
        searchValue: '', //左侧菜单栏搜索的值
        // autoExpandParent: true,//
        drawTitle: '休息点',
        draw: null, //
        expandedKeys: [], //左侧组织机构树选中合集
        parentKeys: '', //左侧组织机构树的父级的值
        expandedKeysId: '', //左侧组织机构树选中的id值
        autoExpandParent: false, //控制左侧组织机构数的展开
        isDraw: false, //判断当前是否为左侧菜单栏的选中绘画
        expandedKeysName: '', //左侧组织机构树选中的名称
        createBtn: false, //保存与取消按钮的开关
        disabledPatrolGrid: false, //网格switch的disabled属性
        disabledPatrolRoutes: false, //线路switch的disabled属性
        disabledZdxl: false, //自动巡逻
        disabledTourPoint: false, //驻巡点switch的disabled属性
        disabledBreakPoint: false, //休息点switch的disabled属性
        patrolGrid: false, //网格switch选中开关
        patrolRoutes: false, //线路switch选中开关
        patrolRoutesZd: false, //自动巡逻线路switch选中开关
        tourPoint: false, //驻巡点switch选中开关
        breakPoint: false, //休息点switch选中开关
        drawType: '', //出发draw时的类型   * 2网格 3驻巡点 4休息点 5线路
        treeValue: '', //左侧组织结构选中值
        selectCite: false, //组织机构树和巡逻范围菜单切换
        modalVisible: false,
        labelId: '', //选中的网格、线路、休息点、驻巡点的id
        isGpsPiont: false, //显示下拉菜单的菜单列表
        breakPointSource: null, //休息点的source
        patrolRoutesSource: null, //线路的source
        patrolRoutesZdSource: null, //自动线路的source
        tourPointSource: null, //驻巡点的source
        patrolGridSource: null, //网格的source
        breakPointValue: [], //休息点的list
        patrolRoutesValue: [], //线路的list
        patrolRoutesZdValue: [], //线路的list
        tourPointValue: [], //驻巡点的list
        patrolGridValue: [], //驻巡点的list
        isMenu: false, //选中菜单显示对应的新建、编辑、删除下拉菜单
        determine: '', //新建、编辑判断    *  new新建 edit编辑
        drawGps: [], //绘制出来的gps点
        defaultSelectValue: [], //菜单栏默认选中值
        openKeys: [], //菜单栏展开项的值
        changeType: null, //巡逻类型    * 2网格 3驻巡点 4休息点 5线路
        limit: false, //绘制时对页面其他按钮的disabled属性的更改
        selectMenuValue: '', //左侧菜单栏选中的值
        openMenus: [], //左侧菜单栏展开项
        anSecond: false, //展开二级菜单
        anFirst: false, //展开一级菜单
        isCancel: false, //保存按钮的disabled属性的更改
        isEdit: false, //判断是否为编辑
        isRender: false, //取消保存数据重新渲染判断
        timeType: '1', // 判断自动巡逻路线的时间段，默认是白天
        lxIds:[],
        patrolGrids:[],
        patrolRoutesIds:[],
        tourPointIds:[],
        breakPointIds:[],
    };

    componentDidMount() {
        // 绘制地图
        this.initMapOther();
        //禁止鼠标右键
        document.oncontextmenu = function() {
            event.returnValue = false;
        };
        // 绑定编辑操作记录新增事件
        HGis.onEditRecordCreate(HMap,(e)=>{
            this.onEditRecordCreate(e,this)
        })
    }
    componentWillUnmount(){
        HGis.destroyMapEdit(HMap);
    }
    initMapOther = () => {
        const view = initOtherView();
        HMap = HGis.initMap(window.configUrl.mapType, 'map', view, window.configUrl.mapServerUrl);
        // HGis.onMapLoad(HMap,()=>{
            edit = HGis.initMapEdit(HMap,{
                boxSelect: true,
                touchEnabled: true,
                displayControlsDefault: true,
                showButtons: false,
            });
            HGis.disableEditDraw(HMap);
        // });
        this.getPopUp('points1');
        this.getPopUp('points2');
        this.getPopUp('points3');
        let Icon = HGis.makeIcon(HMap, {
            iconUrl: './image/syzxd.png',
        });
        let IconXx = HGis.makeIcon(HMap, {
            iconUrl: './image/syxxd.png',
        });
        this.setState({
            Icon,
            IconXx,
        })
    };
    //获取机构边界、所有网格数据
    getGpsList = e => {
        const { dispatch } = this.props;
        var _self = this;
        //地图初始化
        this.initLayers();
        dataReconList = [];
        if (e) {
            dispatch({
                type: 'service/getpatrolListTree',
                status: true,
                payload: {
                    label_organization_code: e,
                    label_type: [0, 2, 3, 4, 5],
                },
                success: files => {
                    if (files.result.reason.code == '200') {
                        _self.setState({
                            jgfw: files.result.jgfw,
                        });
                        //处理巡逻范围菜单
                        _self.dataRecon(files.result.xlqy);
                        // //绘制机构边界
                        _self.showInstitutions(files.result.jgfw);
                        // //绘制除边界外其他点线面
                        _self.showMapGps();
                    } else {
                        return false;
                    }
                },
            });
        }
    };
    //鼠标划过提示
    getPopUp = (type) => {
        console.log('type')
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
                console.log('features',features)
                if (features && features.length) {
                    HMap.map.getCanvas().style.cursor = 'pointer';
                    let layer = features[0].properties.layer
                        ? JSON.parse(features[0].properties.layer)
                        : {};
                    _self.popupRender(type, layer, popups);
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
    popupRender = (type, files, popups) => {
        console.log('files',files)
        popups.innerHTML = '';
        let body = document.createElement('div');
        body.className = 'popupBody';
        body.style.background = '#fff';
        body.style.padding = '5px 10px';
        popups.appendChild(body);
        let elementA = document.createElement('div');
        elementA.className = 'item';
        body.appendChild(elementA);
        let spanA = document.createElement('div');
        spanA.style.color = '#333';
        spanA.innerText =
            '经度：' +
            (files.x || '') +
            '\n' +
            '纬度：' +
            (files.y || '') +
            '\n'
        elementA.appendChild(spanA);
        body.appendChild(elementA);
    };
    //绘制除边界外其他点线面  开关控制的集合调用方式
    showMapGps = () => {
        const {
            patrolGrid,
            tourPoint,
            breakPoint,
            patrolRoutes,
            selectMenuValue,
            isRender,
            breakPointSource,
            patrolRoutesSource,
            patrolRoutesZdSource,
            tourPointSource,
            patrolGridSource,
            source,
        } = this.state;
        let {lxIds,patrolGrids} = this.state;
        lxIds.map((event)=>{
            HGis.removeLayer(HMap, event);
        });
        patrolGrids.map((item)=>{
            HGis.removeLayer(HMap, item);
        });
        HGis.removeLayer(HMap, 'points1');
        HGis.removeLayer(HMap, 'points2');
        HGis.removeLayer(HMap, 'points3');
        if (dataReconList.length) {
            for (let index = 0; index < dataReconList.length; index++) {
                const element = dataReconList[index];
                //根据label_type判断 要绘制的类型  * 2网格 3驻巡点 4休息点 5线路
                if (selectMenuValue != '') {
                    if (isRender) {
                        if (selectMenuValue == element.label_id) {
                            this.groupingRender(element.label_type, element);
                        } else {
                            this.switchGroupRender(element.label_type, element);
                        }
                    }
                } else {
                    this.switchGroupRender(element.label_type, element);
                }
            }
        }
        let _self = this;
        if (_self.state.patrolRoutesZd) {
            // HGis.removeLayer(HMap, 'polygonBj');
            const { timeType } = this.state;
            _self.props.dispatch({
                type: 'service/getRecommendNavigation',
                payload: {
                    bagNum: 3,
                    timeType: timeType,
                    timeStart: timeType == '1' ? '06:00:00' : '20:00:00',
                    timeEnd: timeType == '1' ? '20:00:00' : '06:00:00',
                    association_organization_id: JSON.parse(sessionStorage.getItem('user')).group
                        .parentId,
                    brother_status: false,
                    children_status: true,
                    label_organization_code: JSON.parse(sessionStorage.getItem('user')).group.code,
                    label_organization_id: JSON.parse(sessionStorage.getItem('user')).group.id,
                    label_type: [0],
                    parent_status: false,
                },
                success: res => {
                    if (!res.reason) {
                        _self.showZdxl(
                            res.result && res.result.navigationAllList
                                ? res.result.navigationAllList
                                : [],
                        );
                        _self.showJq(
                            res.result && res.result.getBagList ? res.result.getBagList : [],
                        );
                        // _self.showCircle(res.result && res.result.cirList ? res.result.cirList : null);
                    }
                },
            });
        }
    };
    switchGroupRender = (drawType, element) => {
        const { patrolGrid, tourPoint, breakPoint, patrolRoutes } = this.state;

        //根据patrolGrid判断 switch的开关状态来控制网格显示
        if (patrolGrid) {
            if (drawType == 2) {
                //调取绘制网格方法
                this.showPolygonLoop(
                    [element],
                    'patrolGrid',
                    '#EF1030',
                    'patrolGridVector',
                    'patrolGridSource',
                );
            }
        }

        if (tourPoint) {
            if (drawType == 3) {
                //调取绘制点方法
                this.showTourPointLoop(
                    [element],
                    'tourPoint',
                    '#008FFF',
                    'tourPointVector',
                    'tourPointSource',
                );
            }
        }
        //根据breakPoint判断 switch的开关状态来控制休息点显示
        if (breakPoint) {
            if (drawType == 4) {
                //调取绘制点方法
                this.showBreakPointLoop(
                    [element],
                    'breakPoint',
                    '#008FFF',
                    'breakPointVector',
                    'breakPointSource',
                );
            }
        }
        //根据patrolRoutes判断 switch的开关状态来控制巡逻线路显示
        if (patrolRoutes) {
            if (drawType == 5) {
                //调取绘制线方法
                this.showLineLoop(
                    [element],
                    'patrolRoutes',
                    '#01A472',
                    'patrolRoutesVector',
                    'patrolRoutesSource',
                );
            }
        }
    };
    groupingRender = (drawType, drawData) => {
        this.setState({ isRender: false });
        HGis.removeLayer(HMap, 'patrolGridOnlySource');
        HGis.removeLayer(HMap, 'patrolRoutesOnlySource');
        HGis.removeLayer(HMap, 'tourPointOnlySource');
        HGis.removeLayer(HMap, 'breakPointOnlySource');
        let {patrolGrids} = this.state;
        patrolGrids.map((item)=>{
            HGis.removeLayer(HMap, item);
        });
        if (drawType == 2) {
            this.showPolygonLoop([drawData], 'patrolGrid', '#faad14', 'vector', 'onlySource');
        } else if (drawType == 5) {
            this.showLineLoop([drawData], 'patrolRoutes', '#faad14', 'vector', 'onlySource');
        } else if (drawType == 3) {
            this.showTourPointLoop([drawData], 'tourPoint', '#faad14', 'vector', 'onlySource');
        } else if (drawType == 4) {
            this.showBreakPointLoop([drawData], 'breakPoint', '#faad14', 'vector', 'onlySource');
        }
    };
    //绘制地图
    initMap = () => {
        let draw, circle; // 绘制对象
        var _self = this;
        // 创建地图
        const view = initView();
        // 指定地图要显示在id为map的div中
        const map = new ol.Map({
            view,
            target: 'map',
        });
        map.addLayer(offlineMapLayer()); // 将地图加载上来
        //实例化一个矢量图层Vector作为绘制层
        //实例化一个机构边界的source
        var source = new ol.source.Vector({});
        //实例化一个新建时的source
        var newSource = new ol.source.Vector({});
        //实例化一个休息点的source
        var breakPointSource = new ol.source.Vector({});
        //实例化一个线路的source
        var patrolRoutesSource = new ol.source.Vector({});
        var patrolRoutesZdSource = new ol.source.Vector({});
        //实例化一个驻巡点的source
        var tourPointSource = new ol.source.Vector({});
        //实例化一个网格的source
        var patrolGridSource = new ol.source.Vector({});
        //实例化一个选中左侧菜单时的source
        var onlySource = new ol.source.Vector({});

        var vector = new ol.layer.Vector({
            source: source,
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
        //构建一个选中的interaction
        let select = new ol.interaction.Select({
            style: function(feature) {
                return _self.styleSelect(feature);
            },
            // 关键： 设置过了条件，可以用feature来写过滤，也可以用layer来写过滤
            filter: function(feature, layer, type) {
                var geometry = feature.getGeometry();
                var attribute = feature.getProperties();
                //根据determine判断 新建与编辑
                if (_self.state.determine == 'new') {
                    if (feature.get('typeName') == undefined) {
                        return true;
                    }
                } else {
                    return feature.get('eqNum') == _self.state.labelId;
                }
            },
        });
        //构建一个编辑的interaction
        let modify = new ol.interaction.Modify({
            features: select.getFeatures(), //选中的要素
        });
        map.addInteraction(select);
        map.addInteraction(modify);
        select.setActive(false); //激活选择要素控件
        modify.setActive(false); //激活修改要素控件

        //实例化一个矢量图层Vector
        //实例化一个线路的Vector
        var patrolRoutesVector = initpatrolRoutesVector();
        var patrolRoutesZdVector = initpatrolRoutesVectorZd();
        //实例化一个驻巡点的Vector
        var tourPointVector = inittourPointVector();
        //实例化一个网格的Vector
        var patrolGridVector = initpatrolGridVector();
        //实例化一个休息点的Vector
        var breakPointVector = initbreakPointVector();
        //实例化一个点击左侧菜单栏时的Vector
        var showVector = initShowVector();

        map.addLayer(patrolRoutesVector);
        map.addLayer(patrolRoutesZdVector);
        map.addLayer(tourPointVector);
        map.addLayer(patrolGridVector);
        map.addLayer(breakPointVector);
        map.addLayer(showVector);
        map.addLayer(vector); //将绘制层添加到地图容器中
        this.setState({
            draw: draw,
            circle: circle,
            map: map,
            view: view,
            vector: vector,
            source: source,
            select: select,
            modify: modify,
            breakPointVector: breakPointVector,
            patrolRoutesVector: patrolRoutesVector,
            patrolRoutesZdVector: patrolRoutesZdVector,
            tourPointVector: tourPointVector,
            patrolGridVector: patrolGridVector,
            newSource: newSource,
            showVector: showVector,
            onlySource: onlySource,
            breakPointSource: breakPointSource,
            patrolRoutesSource: patrolRoutesSource,
            patrolRoutesZdSource: patrolRoutesZdSource,
            tourPointSource: tourPointSource,
            patrolGridSource: patrolGridSource,
        });
    };
    //绘制机构边界网格
    showInstitutions = files => {
        let { view, showVector, source } = this.state;
        //实例一个线的全局变量
        // var geometry = new ol.geom.Polygon(); //线,Point 点,Polygon 面
        let arr = [];
        HGis.removeLayer(HMap, 'polygonBj');
        if (files) {
            if (files.label_gps_point) {
                let jdCenter = 0;
                let wdCenter = 0;
                files.label_gps_point.map(item => {
                    jdCenter = jdCenter + item[0];
                    wdCenter = wdCenter + item[1];
                });
                HGis.addPolylineLayer(HMap,{
                    id:'polygonBj',
                    data:[{coordinate:files.label_gps_point}],
                    lineColor:'#259bf3',
                    lineWidth:3,
                    lineOpacity:1,
                });
                let len = files.label_gps_point.length;
                HGis.setMapCenter(HMap, [jdCenter / len, wdCenter / len - 0.002]);
            }
        }
    };
    //绘制网格
    showPolygonLoop = (files, types, color, vectorType, sourceType, kkk) => {
        let {patrolGrids} = this.state;
        patrolGrids.map((item)=>{
            HGis.removeLayer(HMap, item);
        });
        if (files) {
            for (var i = 0; i < files.length; i++) {
                if (files[i].label_gps_point) {
                    //根据参数sourceType判断 是否为点击菜单栏的绘制请求  *  onlySource是
                    if (sourceType == 'onlySource') {
                        HGis.addPolylineLayer(HMap,{
                            id:'patrolGridOnlySource',
                            data:[{coordinate:files[i].label_gps_point}],
                            lineColor:'#faad14',
                            lineWidth:3,
                            lineOpacity:1,
                        });
                        this.setState({
                            polygonGps:files[i].label_gps_point,
                        });
                    } else {
                        //根据gps点构建网格
                        HGis.addPolylineLayer(HMap,{
                            id:types + i,
                            data:[{coordinate:files[i].label_gps_point}],
                            lineColor:color,
                            lineWidth:3,
                            lineOpacity:1,
                            lineDasharray:[2,2],
                        });
                        patrolGrids.push(types + i);
                    }
                }
            }
        }
    };
    //绘制线路
    showLineLoop = (files, types, color, vectorType, sourceType, kkk) => {
        let {patrolRoutesIds} = this.state;
        patrolRoutesIds.map((item)=>{
            HGis.removeLayer(HMap, item);
        });
        if (files) {
            for (var i = 0; i < files.length; i++) {
                if (files[i].label_gps_point) {
                    //根据参数sourceType判断 是否为点击菜单栏的绘制请求  *  onlySource是
                    if (sourceType == 'onlySource') {
                        HGis.addPolylineLayer(HMap,{
                            id:'patrolRoutesOnlySource',
                            data:[{coordinate:files[i].label_gps_point}],
                            lineColor:'#faad14',
                            lineWidth:3,
                            lineOpacity:1,
                        });
                        this.setState({
                            polygonGpsLine:files[i].label_gps_point,
                        });
                    } else {
                        HGis.addPolylineLayer(HMap,{
                            id:types + i,
                            data:[{coordinate:files[i].label_gps_point}],
                            lineColor:color,
                            lineWidth:3,
                            lineOpacity:1,
                            lineDasharray:[2,2],
                        });
                        patrolRoutesIds.push(types + i);
                    }
                }
            }
        }
    };
    showBreakPointLoop = (files, types, color, vectorType, sourceType, kkk) => {
        //实例一个线的全局变量
        let Icon1 = HGis.makeIcon(HMap, {
            iconUrl: './image/syxxd.png',
        });
        let Icon2 = HGis.makeIcon(HMap, {
            iconUrl: './image/syxxd_1.png',
        });
        let {breakPointIds} = this.state;
        breakPointIds.map((item)=>{
            HGis.removeLayer(HMap, item);
        });
        if (files) {
            for (var i = 0; i < files.length; i++) {
                if (files[i].label_gps_point) {

                    if (sourceType == 'onlySource') {
                        let markOptions = {
                            id: 'breakPointOnlySource',
                            data: [{
                                coordinate: files[i].label_gps_point
                            }],
                            textField: 'title',
                            iconSize:1
                        }
                        this.setState({
                            pointXx: files[i].label_gps_point,
                        });
                        HGis.setMapCenter(HMap,files[i].label_gps_point);
                        HGis.addMarkLayer(HMap, Icon1, markOptions);
                    } else {
                        let markOptions = {
                            id: types + i,
                            data: [{
                                coordinate: files[i].label_gps_point
                            }],
                            textField: 'title',
                            iconSize:1
                        }
                        HGis.addMarkLayer(HMap, Icon2, markOptions);
                        breakPointIds.push(types + i);
                    }
                }
            }
        }
    };
    showTourPointLoop = (files, types, color, vectorType, sourceType, kkk) => {
        let {tourPointIds} = this.state;
        tourPointIds.map((item)=>{
            HGis.removeLayer(HMap, item);
        });
        if (files) {
            let Icon2 = HGis.makeIcon(HMap, {
                iconUrl: './image/syzxd_1.png',
            });
            for (var i = 0; i < files.length; i++) {
                if (files[i].label_gps_point) {
                    if (sourceType == 'onlySource') {
                        let markOptions = {
                            id: 'tourPointOnlySource',
                            data: [{
                                coordinate: files[i].label_gps_point
                            }],
                            textField: 'title',
                            iconSize:1
                        }
                        HGis.addMarkLayer(HMap, this.state.Icon , markOptions);
                        this.setState({
                            pointZx:files[i].label_gps_point,
                        });
                        HGis.setMapCenter(HMap,files[i].label_gps_point);
                    } else {
                        let markOptions = {
                            id: types + i,
                            data: [{
                                coordinate: files[i].label_gps_point
                            }],
                            textField: 'title',
                            iconSize:1
                        }
                        HGis.addMarkLayer(HMap, Icon2, markOptions);
                        tourPointIds.push(types + i);
                    }
                }
            }
        }
    };

    /**
     *  图层初始化
     *  */
    initLayers = () => {
        HGis.removeLayer(HMap, 'polygonBj');
        let {patrolGrids} = this.state;
        patrolGrids.map((item)=>{
            HGis.removeLayer(HMap, item);
        });
        let {patrolRoutesIds} = this.state;
        patrolRoutesIds.map((item)=>{
            HGis.removeLayer(HMap, item);
        });
        let {tourPointIds} = this.state;
        tourPointIds.map((item)=>{
            HGis.removeLayer(HMap, item);
        });
        let {breakPointIds} = this.state;
        breakPointIds.map((item)=>{
            HGis.removeLayer(HMap, item);
        });
        let {lxIds} = this.state;
        lxIds.map((event)=>{
            HGis.removeLayer(HMap, event);
        });
        HGis.removeLayer(HMap, 'points1');
        HGis.removeLayer(HMap, 'points2');
        HGis.removeLayer(HMap, 'points3');
        HGis.removeLayer(HMap, 'patrolGridOnlySource');
        HGis.removeLayer(HMap, 'patrolRoutesOnlySource');
        HGis.removeLayer(HMap, 'tourPointOnlySource');
        HGis.removeLayer(HMap, 'breakPointOnlySource');
        // const {
        //     map,
        //     vector,
        //     breakPointVector,
        //     showVector,
        //     patrolRoutesVector,
        //     patrolRoutesZdVector,
        //     tourPointVector,
        //     patrolGridVector,
        //     select,
        //     modify,
        //     source,
        //     newSource,
        //     patrolGridSource,
        //     patrolRoutesSource,
        //     patrolRoutesZdSource,
        //     breakPointSource,
        //     tourPointSource,
        //     onlySource,
        // } = this.state;
        // vector.setSource(null);
        // showVector.setSource(null);
        // patrolRoutesVector.setSource(null);
        // patrolRoutesZdVector.setSource(null);
        // tourPointVector.setSource(null);
        // patrolGridVector.setSource(null);
        // breakPointVector.setSource(null);
        // select.setActive(false);
        // modify.setActive(false);
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
    backTree = () => {
        const { treeValue, expandedKeysName, expandedKeys } = this.state;
        this.setState({ selectCite: false, selectMenuValue: '' }, () => {
            this.getGpsList(treeValue);
        });
    };
    onSelect = (expandedKeys, info) => {
        /*用于打开该节点的详细信息*/
        const { node } = info;
        const { props } = node;
        const {
            form,
            service: {
                data: { page },
            },
        } = this.props;

        this.setState(
            {
                // expandedKeys,
                parentKeys: props.dataRef.pid,
                expandedKeysId: props.dataRef.id,
                autoExpandParent: true,
                expandedKeysName: props.dataRef.name,
                createBtn: false,
                treeValue: expandedKeys[0],
                selectCite: true,
                selectMenuValue: '',
            },
            () => {
                if (expandedKeys.length) {
                    this.getGpsList(expandedKeys[0]);
                }
            },
        );
    };
    onExpand = expandedKeys => {
        this.setState({
            expandedKeys,
            autoExpandParent: false,
        });
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
            if (item.childrenList) {
                let { expandedKeys2 } = this.state;
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

    parentOrganization = e => {
        const {
            treeValue,
            patrolGridVector,
            isMenu,
            patrolGridSource,
            breakPointValue,
            patrolRoutesValue,
            tourPointValue,
            patrolGridValue,
        } = this.state;

        var arr = [];
        if (e) {
            if (treeValue == '') {
                message.error('请选择组织机构');
                this.setState({ disabledPatrolGrid: false });
                return false;
            } else {
                this.setState({ patrolGrid: e, disabledPatrolGrid: e, isRender: true }, () => {
                    this.showMapGps();
                    // for (let index = 0; index < dataReconList.length; index++) {
                    // 	const element = dataReconList[index]
                    // 	if (element.label_type == 2) {
                    // 		this.showPolygonLoop(
                    // 			[ element ],
                    // 			'patrolGrid',
                    // 			'#EF1030',
                    // 			'patrolGridVector',
                    // 			'patrolGridSource'
                    // 		)
                    // 	}
                    // }
                });
            }
        } else {
            let {patrolGrids} = this.state;
            patrolGrids.map((item)=>{
                HGis.removeLayer(HMap, item);
            });
            this.setState({ patrolGrid: e, disabledPatrolGrid: e });
        }
    };
    subOrganization = e => {
        const {
            treeValue,
            patrolRoutesVector,
            isMenu,
            patrolRoutesSource,
            breakPointValue,
            patrolRoutesValue,
            tourPointValue,
            patrolGridValue,
        } = this.state;

        var arr = [];

        if (e) {
            if (treeValue == '') {
                message.error('请选择组织机构');
                this.setState({ disabledPatrolRoutes: false });
                return false;
            } else {
                this.setState({ patrolRoutes: e, disabledPatrolRoutes: e, isRender: true }, () => {
                    this.showMapGps();
                    // for (let index = 0; index < dataReconList.length; index++) {
                    // 	const element = dataReconList[index]
                    // 	if (element.label_type == 5) {
                    // 		this.showLineLoop(
                    // 			[ element ],
                    // 			'patrolRoutes',
                    // 			'#01A472',
                    // 			'patrolRoutesVector',
                    // 			'patrolRoutesSource'
                    // 		)
                    // 	}
                    // }
                });
            }
        } else {
            let {patrolRoutesIds} = this.state;
            patrolRoutesIds.map((item)=>{
                HGis.removeLayer(HMap, item);
            });
            this.setState({ patrolRoutes: e, disabledPatrolRoutes: e });
        }
    };
    showZdxl = navigationAllList => {
        console.log('自动路线=====>',navigationAllList)
        let colorList = [
            '#f23636',
            '#faad14',
            '#2400ff',
            '#006f0b',
            '#a46e01',
            '#dcf357',
            '#9f5cfc',
            '#23bd2a',
            '#4d57c1',
            '#a136dc',
            '#8689c4',
            '#b33589',
        ];
        let num = 0;
        let lxIds = [];
        navigationAllList.map((item,i) => {
            let list = item.result && item.result.list ? item.result.list : [];
            list.map(event => {
                let pointsList = event.item;
                if(i == 0){
                    pointsList.push({
                        turnlatlon:"126.64843396515604,45.77350897625325"
                    });
                    pointsList.push({
                        turnlatlon:"126.64989517513482,45.77491193597238"
                    });
                }
                if(i == 2){
                    pointsList.splice(pointsList.length - 1,1);
                    pointsList.push({
                        turnlatlon:"126.63227513545841,45.76872870420648"
                    });
                    pointsList.push({
                        turnlatlon:"126.64476533831254,45.77197867203793"
                    });
                }
                let poitnts = [];
                pointsList.map(e => {
                    let latlon = e.turnlatlon.split(',');
                    poitnts.push([Number(latlon[0]),Number(latlon[1])]);
                });
                HGis.removeLayer(HMap, 'zdlx' + i);
                HGis.addPolylineLayer(HMap,{
                    id:'zdlx' + i,
                    data:[{coordinate:poitnts}],
                    lineColor:colorList[num],
                    lineWidth:8,
                    lineOpacity:0.7,
                });
                console.log('路线===========>',pointsList,colorList[num]);
                lxIds.push('zdlx' + i);
                this.setState({
                    lxIds,
                });
                num++;
            });
        });
    };
    showJq = getBagList => {
        HGis.removeLayer(HMap, 'points1');
        HGis.removeLayer(HMap, 'points2');
        HGis.removeLayer(HMap, 'points3');
        let markOptions1 = {
            id: 'points1',
            data: [],
            textField: 'title',
            iconSize:0.4
        }
        let markOptions2 = {
            id: 'points2',
            data: [],
            textField: 'title',
            iconSize:0.4
        }
        let markOptions3 = {
            id: 'points3',
            data: [],
            textField: 'title',
            iconSize:0.4
        }
        let pointIcon1 = HGis.makeIcon(HMap, {
            iconUrl: './image/qz1.png',
        });
        let pointIcon2 = HGis.makeIcon(HMap, {
            iconUrl: './image/qz2.png',
        });
        let pointIcon3 = HGis.makeIcon(HMap, {
            iconUrl: './image/qz3.png',
        });
        getBagList.map((item, index) => {
            item.map(event => {
                if(index == 0){
                    markOptions1.data.push({
                        coordinate: [event.x, event.y],
                        properties: {
                            layer: event,
                        },
                    });
                }
                if(index == 1){
                    markOptions2.data.push({
                        coordinate:[event.x, event.y],
                        properties: {
                            layer: event,
                        },
                    });
                }
                if(index == 2){
                    markOptions3.data.push({
                        coordinate: [event.x, event.y],
                        properties: {
                            layer: event,
                        },
                    });
                }
            });
        });
        HGis.addMarkLayer(HMap, pointIcon1, markOptions1);
        HGis.addMarkLayer(HMap, pointIcon2, markOptions2);
        HGis.addMarkLayer(HMap, pointIcon3, markOptions3);
    };
    showCircle = cirList => {
        if (cirList) {
            const { patrolRoutesZdVector, patrolRoutesZdSource, map } = this.state;
            cirList.map(item => {
                const pointFeature = new ol.Feature({
                    geometry: new ol.geom.Circle(
                        [item.centerPoint.x, item.centerPoint.y],
                        item.r,
                    ),
                    typeName: 'Circle',
                });
                pointFeature.setStyle(
                    new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(211, 223, 235, 0.5)',
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#1D70FF',
                        }),
                    }),
                );
                pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857'); // location.push(position)
                patrolRoutesZdSource.addFeature(pointFeature);
                patrolRoutesZdVector.setSource(patrolRoutesZdSource);
            });
        }
    };
    getZdxl = e => {
        const {
            treeValue,
            lxIds,
            timeType,
        } = this.state;
        console.log('-----执行getZdxl-----',e);
        if (e) {
            if (treeValue == '') {
                message.error('请选择组织机构');
                this.setState({ disabledZdxl: false });
                return false;
            } else {
                this.setState({ patrolRoutesZd: e, disabledZdxl: e, isRender: true }, () => {
                        let data = {"reason":null,"result":{"navigationAllList":[{"data":{"rows":[{"duration":417,"item":[
                            {"swlink":"686655,0,85465065","niIds":"85465065,0,8;","distance":8,"tmc":[{"route":"126.645788,45.786516;126.645828,45.786453","level":1}],"turncode":5,"strguide":"直行进入南十四道街","routelonlat":"126.645788,45.786516;126.645828,45.786453","streetName":"南十四道街","turnlatlon":"126.645828,45.786453","sectIdx":0,"turntype":6,"id":0,"turnlink":"686655,0,85465065"},{"swlink":"686655,0,49715023","niIds":"85464922,0,9;85464923,0,64;38181217,0,67;38181218,0,4;3034792,0,47;3092224,0,20;3078816,0,64;3078817,0,7;102299954,0,57;102299955,0,51;49715023,0,3;","distance":393,"tmc":[{"route":"126.645828,45.786453;126.645883,45.786365","level":1},{"route":"126.645883,45.786365;126.646227,45.785833","level":1},{"route":"126.646227,45.785833;126.646578,45.785271","level":1},{"route":"126.646578,45.785271;126.646594,45.785234","level":1},{"route":"126.646594,45.785234;126.646844,45.784844","level":1},{"route":"126.646844,45.784844;126.646945,45.784672","level":1},{"route":"126.646945,45.784672;126.647297,45.784141","level":1},{"route":"126.647297,45.784141;126.647336,45.784073","level":1},{"route":"126.647336,45.784073;126.647633,45.783589","level":1},{"route":"126.647633,45.783589;126.647906,45.783161","level":1},{"route":"126.647906,45.783161;126.647922,45.783130","level":1}],"turncode":10,"strguide":"左前方进入南十四道街","routelonlat":"126.645828,45.786453;126.645883,45.786365;126.646227,45.785833;126.646578,45.785271;126.646594,45.785234;126.646844,45.784844;126.646945,45.784672;126.647297,45.784141;126.647336,45.784073;126.647633,45.783589;126.647906,45.783161;126.647922,45.783130","streetName":"南十四道街","turnlatlon":"126.647922,45.783130","sectIdx":0,"turntype":6,"id":1,"turnlink":"686655,0,49715023"},{"swlink":"686655,0,49715026","niIds":"49715025,0,35;49715026,0,5;","distance":40,"tmc":[{"route":"126.647922,45.783130;126.648117,45.782839","level":1},{"route":"126.648117,45.782839;126.648141,45.782786","level":1}],"turncode":5,"strguide":"直行进入南十四道街","routelonlat":"126.647922,45.783130;126.648117,45.782839;126.648141,45.782786","streetName":"南十四道街","turnlatlon":"126.648141,45.782786","sectIdx":0,"turntype":6,"id":2,"turnlink":"686655,0,49715026"},{"swlink":"686655,0,3034859","niIds":"3034850,0,9;102299974,0,65;102299975,0,49;102299780,0,27;102299817,0,44;102299818,0,21;3034859,0,29;","distance":244,"tmc":[{"route":"126.648141,45.782786;126.648211,45.782708","level":1},{"route":"126.648211,45.782708;126.648562,45.782167","level":1},{"route":"126.648562,45.782167;126.648820,45.781755","level":1},{"route":"126.648820,45.781755;126.648969,45.781526","level":1},{"route":"126.648969,45.781526;126.649211,45.781156","level":1},{"route":"126.649211,45.781156;126.649328,45.780969","level":1},{"route":"126.649328,45.780969;126.649492,45.780724","level":1}],"turncode":5,"strguide":"直行进入南十四道街","routelonlat":"126.648141,45.782786;126.648211,45.782708;126.648562,45.782167;126.648820,45.781755;126.648969,45.781526;126.649211,45.781156;126.649328,45.780969;126.649492,45.780724","streetName":"南十四道街","turnlatlon":"126.649492,45.780724","sectIdx":0,"turntype":6,"id":3,"turnlink":"686655,0,3034859"},{"swlink":"686655,1,14274376","niIds":"3034858,1,7;14274376,1,61;","distance":68,"tmc":[{"route":"126.649492,45.780724;126.649539,45.780656","level":1},{"route":"126.649539,45.780656;126.649883,45.780146","level":1}],"turncode":11,"strguide":"右前方进入南十四道街","routelonlat":"126.649492,45.780724;126.649539,45.780656;126.649883,45.780146","streetName":"南十四道街","turnlatlon":"126.649883,45.780146","sectIdx":0,"turntype":6,"id":4,"turnlink":"686655,1,14274376"},{"swlink":"686655,1,102299374","niIds":"102299357,1,8;102299356,1,10;3045639,1,70;3034863,1,13;73947882,1,10;47374058,1,26;47374057,1,39;102299374,1,46;","distance":222,"tmc":[{"route":"126.649883,45.780146;126.649883,45.780068","level":1},{"route":"126.649883,45.780068;126.649898,45.779974","level":1},{"route":"126.649898,45.779974;126.650242,45.779385","level":1},{"route":"126.650242,45.779385;126.650312,45.779266","level":1},{"route":"126.650312,45.779266;126.650367,45.779167","level":1},{"route":"126.650367,45.779167;126.650500,45.778943","level":1},{"route":"126.650500,45.778943;126.650695,45.778615","level":1},{"route":"126.650695,45.778615;126.650930,45.778224","level":1}],"turncode":9,"strguide":"右转进入保障街","routelonlat":"126.649883,45.780146;126.649883,45.780068;126.649898,45.779974;126.650242,45.779385;126.650312,45.779266;126.650367,45.779167;126.650500,45.778943;126.650695,45.778615;126.650930,45.778224","streetName":"保障街","turnlatlon":"126.650930,45.778224","sectIdx":0,"turntype":6,"id":5,"turnlink":"686655,1,102299374"},{"swlink":"686655,0,31933744","niIds":"73947871,0,36;112974016,0,11;112974017,0,53;73947868,0,47;73947864,0,60;73947858,0,70;31933744,0,14;","distance":291,"tmc":[{"route":"126.650930,45.778224;126.650602,45.777974","level":1},{"route":"126.650602,45.777974;126.650492,45.777896","level":1},{"route":"126.650492,45.777896;126.650000,45.777547","level":1},{"route":"126.650000,45.777547;126.649570,45.777234","level":1},{"route":"126.649570,45.777234;126.649023,45.776844","level":1},{"route":"126.649023,45.776844;126.648391,45.776385","level":1},{"route":"126.648391,45.776385;126.648258,45.776286","level":1}],"turncode":5,"strguide":"直行进入保障街","routelonlat":"126.650930,45.778224;126.650602,45.777974;126.650492,45.777896;126.650000,45.777547;126.649570,45.777234;126.649023,45.776844;126.648391,45.776385;126.648258,45.776286","streetName":"保障街","turnlatlon":"126.648258,45.776286","sectIdx":0,"turntype":6,"id":6,"turnlink":"686655,0,31933744"},{"swlink":"686655,1,3030297","niIds":"3045571,1,11;78391068,1,5;78391067,1,29;78391070,1,4;78391079,1,50;78391078,1,44;3030297,1,43;","distance":186,"tmc":[{"route":"126.648258,45.776286;126.648148,45.776208","level":1},{"route":"126.648148,45.776208;126.648086,45.776167","level":1},{"route":"126.648086,45.776167;126.647813,45.775979","level":1},{"route":"126.647813,45.775979;126.647773,45.775948","level":1},{"route":"126.647773,45.775948;126.647305,45.775620","level":1},{"route":"126.647305,45.775620;126.646898,45.775328","level":1},{"route":"126.646898,45.775328;126.646492,45.775042","level":2}],"turncode":8,"strguide":"左转进入三育街","routelonlat":"126.648258,45.776286;126.648148,45.776208;126.648086,45.776167;126.647813,45.775979;126.647773,45.775948;126.647305,45.775620;126.646898,45.775328;126.646492,45.775042","streetName":"三育街","turnlatlon":"126.646492,45.775042","sectIdx":0,"turntype":6,"id":7,"turnlink":"686655,1,3030297"},{"swlink":"686655,0,38182135","niIds":"38182134,0,88;38182135,0,37;","distance":125,"tmc":[{"route":"126.646492,45.775042;126.647305,45.774479","level":1},{"route":"126.647305,45.774479;126.647656,45.774245","level":1}],"turncode":9,"strguide":"右转进入","routelonlat":"126.646492,45.775042;126.647305,45.774479;126.647656,45.774245","streetName":"","turnlatlon":"126.647656,45.774245","sectIdx":0,"turntype":6,"id":8,"turnlink":"686655,0,38182135"},{"swlink":"686655,0,38182128","niIds":"38182128,0,20;","distance":20,"tmc":[{"route":"126.647656,45.774245;126.647469,45.774109","level":0}],"turncode":11,"strguide":"右前方进入","routelonlat":"126.647656,45.774245;126.647469,45.774109","streetName":"","turnlatlon":"126.647469,45.774109","sectIdx":0,"turntype":6,"id":9,"turnlink":"686655,0,38182128"},{"swlink":"686655,0,38182130","niIds":"38182130,0,30;","distance":30,"tmc":[{"route":"126.647469,45.774109;126.647078,45.774099","level":0}],"turncode":9,"strguide":"右转进入","routelonlat":"126.647469,45.774109;126.647078,45.774099","streetName":"","turnlatlon":"126.647078,45.774099","sectIdx":0,"turntype":6,"id":10,"turnlink":"686655,0,38182130"},{"swlink":"686655,0,38182126","niIds":"38182126,0,6;","distance":6,"tmc":[{"route":"126.647078,45.774099;126.647015,45.774145","level":0}],"turncode":5,"strguide":"直行进入","routelonlat":"126.647078,45.774099;126.647015,45.774145","streetName":"","turnlatlon":"126.647015,45.774145","sectIdx":0,"turntype":6,"id":11,"turnlink":"686655,0,38182126"}],"niIds":"85465065,0,8;85464922,0,9;85464923,0,64;38181217,0,67;38181218,0,4;3034792,0,47;3092224,0,20;3078816,0,64;3078817,0,7;102299954,0,57;102299955,0,51;49715023,0,3;49715025,0,35;49715026,0,5;3034850,0,9;102299974,0,65;102299975,0,49;102299780,0,27;102299817,0,44;102299818,0,21;3034859,0,29;3034858,1,7;14274376,1,61;102299357,1,8;102299356,1,10;3045639,1,70;3034863,1,13;73947882,1,10;47374058,1,26;47374057,1,39;102299374,1,46;73947871,0,36;112974016,0,11;112974017,0,53;73947868,0,47;73947864,0,60;73947858,0,70;31933744,0,14;3045571,1,11;78391068,1,5;78391067,1,29;78391070,1,4;78391079,1,50;78391078,1,44;3030297,1,43;38182134,0,88;38182135,0,37;38182128,0,20;38182130,0,30;38182126,0,6;","distance":1633,"routelatlon":"126.645788,45.786516,1,0;126.645828,45.786453,1,0;126.645828,45.786453,1,0;126.645883,45.786365,1,0;126.645883,45.786365,1,0;126.646227,45.785833,1,0;126.646227,45.785833,1,0;126.646578,45.785271,1,0;126.646578,45.785271,1,0;126.646594,45.785234,1,0;126.646594,45.785234,1,0;126.646844,45.784844,1,0;126.646844,45.784844,1,0;126.646945,45.784672,1,0;126.646945,45.784672,1,0;126.647297,45.784141,1,0;126.647297,45.784141,1,0;126.647336,45.784073,1,0;126.647336,45.784073,1,0;126.647633,45.783589,1,0;126.647633,45.783589,1,0;126.647906,45.783161,1,0;126.647906,45.783161,1,0;126.647922,45.783130,1,0;126.647922,45.783130,1,0;126.648117,45.782839,1,0;126.648117,45.782839,1,0;126.648141,45.782786,1,0;126.648141,45.782786,1,0;126.648211,45.782708,1,0;126.648211,45.782708,1,0;126.648562,45.782167,1,0;126.648562,45.782167,1,0;126.648820,45.781755,1,0;126.648820,45.781755,1,0;126.648969,45.781526,1,0;126.648969,45.781526,1,0;126.649211,45.781156,1,0;126.649211,45.781156,1,0;126.649328,45.780969,1,0;126.649328,45.780969,1,0;126.649492,45.780724,1,0;126.649492,45.780724,1,0;126.649539,45.780656,1,0;126.649539,45.780656,1,0;126.649883,45.780146,1,0;126.649883,45.780146,1,0;126.649883,45.780068,1,0;126.649883,45.780068,1,0;126.649898,45.779974,1,0;126.649898,45.779974,1,0;126.650242,45.779385,1,0;126.650242,45.779385,1,0;126.650312,45.779266,1,0;126.650312,45.779266,1,0;126.650367,45.779167,1,0;126.650367,45.779167,1,0;126.650500,45.778943,1,0;126.650500,45.778943,1,0;126.650695,45.778615,1,0;126.650695,45.778615,1,0;126.650930,45.778224,1,0;126.650930,45.778224,1,0;126.650602,45.777974,1,0;126.650602,45.777974,1,0;126.650492,45.777896,1,0;126.650492,45.777896,1,0;126.650000,45.777547,1,0;126.650000,45.777547,1,0;126.649570,45.777234,1,0;126.649570,45.777234,1,0;126.649023,45.776844,1,0;126.649023,45.776844,1,0;126.648391,45.776385,1,0;126.648391,45.776385,1,0;126.648258,45.776286,1,0;126.648258,45.776286,1,0;126.648148,45.776208,1,0;126.648148,45.776208,1,0;126.648086,45.776167,1,0;126.648086,45.776167,1,0;126.647813,45.775979,1,0;126.647813,45.775979,1,0;126.647773,45.775948,1,0;126.647773,45.775948,1,0;126.647305,45.775620,1,0;126.647305,45.775620,1,0;126.646898,45.775328,1,0;126.646898,45.775328,2,0;126.646492,45.775042,2,0;126.646492,45.775042,1,0;126.647305,45.774479,1,0;126.647305,45.774479,1,0;126.647656,45.774245,1,0;126.647656,45.774245,0,0;126.647469,45.774109,0,0;126.647469,45.774109,0,0;126.647078,45.774099,0,0;126.647078,45.774099,0,0;126.647015,45.774145,0,0"}]},"errcode":0,"errmsg":"","result":{"rows":[{"duration":417,"item":[{"swlink":"686655,0,85465065","niIds":"85465065,0,8;","distance":8,"tmc":[{"route":"126.645788,45.786516;126.645828,45.786453","level":1}],"turncode":5,"strguide":"直行进入南十四道街","routelonlat":"126.645788,45.786516;126.645828,45.786453","streetName":"南十四道街","turnlatlon":"126.645828,45.786453","sectIdx":0,"turntype":6,"id":0,"turnlink":"686655,0,85465065"},{"swlink":"686655,0,49715023","niIds":"85464922,0,9;85464923,0,64;38181217,0,67;38181218,0,4;3034792,0,47;3092224,0,20;3078816,0,64;3078817,0,7;102299954,0,57;102299955,0,51;49715023,0,3;","distance":393,"tmc":[{"route":"126.645828,45.786453;126.645883,45.786365","level":1},{"route":"126.645883,45.786365;126.646227,45.785833","level":1},{"route":"126.646227,45.785833;126.646578,45.785271","level":1},{"route":"126.646578,45.785271;126.646594,45.785234","level":1},{"route":"126.646594,45.785234;126.646844,45.784844","level":1},{"route":"126.646844,45.784844;126.646945,45.784672","level":1},{"route":"126.646945,45.784672;126.647297,45.784141","level":1},{"route":"126.647297,45.784141;126.647336,45.784073","level":1},{"route":"126.647336,45.784073;126.647633,45.783589","level":1},{"route":"126.647633,45.783589;126.647906,45.783161","level":1},{"route":"126.647906,45.783161;126.647922,45.783130","level":1}],"turncode":10,"strguide":"左前方进入南十四道街","routelonlat":"126.645828,45.786453;126.645883,45.786365;126.646227,45.785833;126.646578,45.785271;126.646594,45.785234;126.646844,45.784844;126.646945,45.784672;126.647297,45.784141;126.647336,45.784073;126.647633,45.783589;126.647906,45.783161;126.647922,45.783130","streetName":"南十四道街","turnlatlon":"126.647922,45.783130","sectIdx":0,"turntype":6,"id":1,"turnlink":"686655,0,49715023"},{"swlink":"686655,0,49715026","niIds":"49715025,0,35;49715026,0,5;","distance":40,"tmc":[{"route":"126.647922,45.783130;126.648117,45.782839","level":1},{"route":"126.648117,45.782839;126.648141,45.782786","level":1}],"turncode":5,"strguide":"直行进入南十四道街","routelonlat":"126.647922,45.783130;126.648117,45.782839;126.648141,45.782786","streetName":"南十四道街","turnlatlon":"126.648141,45.782786","sectIdx":0,"turntype":6,"id":2,"turnlink":"686655,0,49715026"},{"swlink":"686655,0,3034859","niIds":"3034850,0,9;102299974,0,65;102299975,0,49;102299780,0,27;102299817,0,44;102299818,0,21;3034859,0,29;","distance":244,"tmc":[{"route":"126.648141,45.782786;126.648211,45.782708","level":1},{"route":"126.648211,45.782708;126.648562,45.782167","level":1},{"route":"126.648562,45.782167;126.648820,45.781755","level":1},{"route":"126.648820,45.781755;126.648969,45.781526","level":1},{"route":"126.648969,45.781526;126.649211,45.781156","level":1},{"route":"126.649211,45.781156;126.649328,45.780969","level":1},{"route":"126.649328,45.780969;126.649492,45.780724","level":1}],"turncode":5,"strguide":"直行进入南十四道街","routelonlat":"126.648141,45.782786;126.648211,45.782708;126.648562,45.782167;126.648820,45.781755;126.648969,45.781526;126.649211,45.781156;126.649328,45.780969;126.649492,45.780724","streetName":"南十四道街","turnlatlon":"126.649492,45.780724","sectIdx":0,"turntype":6,"id":3,"turnlink":"686655,0,3034859"},{"swlink":"686655,1,14274376","niIds":"3034858,1,7;14274376,1,61;","distance":68,"tmc":[{"route":"126.649492,45.780724;126.649539,45.780656","level":1},{"route":"126.649539,45.780656;126.649883,45.780146","level":1}],"turncode":11,"strguide":"右前方进入南十四道街","routelonlat":"126.649492,45.780724;126.649539,45.780656;126.649883,45.780146","streetName":"南十四道街","turnlatlon":"126.649883,45.780146","sectIdx":0,"turntype":6,"id":4,"turnlink":"686655,1,14274376"},{"swlink":"686655,1,102299374","niIds":"102299357,1,8;102299356,1,10;3045639,1,70;3034863,1,13;73947882,1,10;47374058,1,26;47374057,1,39;102299374,1,46;","distance":222,"tmc":[{"route":"126.649883,45.780146;126.649883,45.780068","level":1},{"route":"126.649883,45.780068;126.649898,45.779974","level":1},{"route":"126.649898,45.779974;126.650242,45.779385","level":1},{"route":"126.650242,45.779385;126.650312,45.779266","level":1},{"route":"126.650312,45.779266;126.650367,45.779167","level":1},{"route":"126.650367,45.779167;126.650500,45.778943","level":1},{"route":"126.650500,45.778943;126.650695,45.778615","level":1},{"route":"126.650695,45.778615;126.650930,45.778224","level":1}],"turncode":9,"strguide":"右转进入保障街","routelonlat":"126.649883,45.780146;126.649883,45.780068;126.649898,45.779974;126.650242,45.779385;126.650312,45.779266;126.650367,45.779167;126.650500,45.778943;126.650695,45.778615;126.650930,45.778224","streetName":"保障街","turnlatlon":"126.650930,45.778224","sectIdx":0,"turntype":6,"id":5,"turnlink":"686655,1,102299374"},{"swlink":"686655,0,31933744","niIds":"73947871,0,36;112974016,0,11;112974017,0,53;73947868,0,47;73947864,0,60;73947858,0,70;31933744,0,14;","distance":291,"tmc":[{"route":"126.650930,45.778224;126.650602,45.777974","level":1},{"route":"126.650602,45.777974;126.650492,45.777896","level":1},{"route":"126.650492,45.777896;126.650000,45.777547","level":1},{"route":"126.650000,45.777547;126.649570,45.777234","level":1},{"route":"126.649570,45.777234;126.649023,45.776844","level":1},{"route":"126.649023,45.776844;126.648391,45.776385","level":1},{"route":"126.648391,45.776385;126.648258,45.776286","level":1}],"turncode":5,"strguide":"直行进入保障街","routelonlat":"126.650930,45.778224;126.650602,45.777974;126.650492,45.777896;126.650000,45.777547;126.649570,45.777234;126.649023,45.776844;126.648391,45.776385;126.648258,45.776286","streetName":"保障街","turnlatlon":"126.648258,45.776286","sectIdx":0,"turntype":6,"id":6,"turnlink":"686655,0,31933744"},{"swlink":"686655,1,3030297","niIds":"3045571,1,11;78391068,1,5;78391067,1,29;78391070,1,4;78391079,1,50;78391078,1,44;3030297,1,43;","distance":186,"tmc":[{"route":"126.648258,45.776286;126.648148,45.776208","level":1},{"route":"126.648148,45.776208;126.648086,45.776167","level":1},{"route":"126.648086,45.776167;126.647813,45.775979","level":1},{"route":"126.647813,45.775979;126.647773,45.775948","level":1},{"route":"126.647773,45.775948;126.647305,45.775620","level":1},{"route":"126.647305,45.775620;126.646898,45.775328","level":1},{"route":"126.646898,45.775328;126.646492,45.775042","level":2}],"turncode":8,"strguide":"左转进入三育街","routelonlat":"126.648258,45.776286;126.648148,45.776208;126.648086,45.776167;126.647813,45.775979;126.647773,45.775948;126.647305,45.775620;126.646898,45.775328;126.646492,45.775042","streetName":"三育街","turnlatlon":"126.646492,45.775042","sectIdx":0,"turntype":6,"id":7,"turnlink":"686655,1,3030297"},{"swlink":"686655,0,38182135","niIds":"38182134,0,88;38182135,0,37;","distance":125,"tmc":[{"route":"126.646492,45.775042;126.647305,45.774479","level":1},{"route":"126.647305,45.774479;126.647656,45.774245","level":1}],"turncode":9,"strguide":"右转进入","routelonlat":"126.646492,45.775042;126.647305,45.774479;126.647656,45.774245","streetName":"","turnlatlon":"126.647656,45.774245","sectIdx":0,"turntype":6,"id":8,"turnlink":"686655,0,38182135"},{"swlink":"686655,0,38182128","niIds":"38182128,0,20;","distance":20,"tmc":[{"route":"126.647656,45.774245;126.647469,45.774109","level":0}],"turncode":11,"strguide":"右前方进入","routelonlat":"126.647656,45.774245;126.647469,45.774109","streetName":"","turnlatlon":"126.647469,45.774109","sectIdx":0,"turntype":6,"id":9,"turnlink":"686655,0,38182128"},{"swlink":"686655,0,38182130","niIds":"38182130,0,30;","distance":30,"tmc":[{"route":"126.647469,45.774109;126.647078,45.774099","level":0}],"turncode":9,"strguide":"右转进入","routelonlat":"126.647469,45.774109;126.647078,45.774099","streetName":"","turnlatlon":"126.647078,45.774099","sectIdx":0,"turntype":6,"id":10,"turnlink":"686655,0,38182130"},{"swlink":"686655,0,38182126","niIds":"38182126,0,6;","distance":6,"tmc":[{"route":"126.647078,45.774099;126.647015,45.774145","level":0}],"turncode":5,"strguide":"直行进入","routelonlat":"126.647078,45.774099;126.647015,45.774145","streetName":"","turnlatlon":"126.647015,45.774145","sectIdx":0,"turntype":6,"id":11,"turnlink":"686655,0,38182126"}],"niIds":"85465065,0,8;85464922,0,9;85464923,0,64;38181217,0,67;38181218,0,4;3034792,0,47;3092224,0,20;3078816,0,64;3078817,0,7;102299954,0,57;102299955,0,51;49715023,0,3;49715025,0,35;49715026,0,5;3034850,0,9;102299974,0,65;102299975,0,49;102299780,0,27;102299817,0,44;102299818,0,21;3034859,0,29;3034858,1,7;14274376,1,61;102299357,1,8;102299356,1,10;3045639,1,70;3034863,1,13;73947882,1,10;47374058,1,26;47374057,1,39;102299374,1,46;73947871,0,36;112974016,0,11;112974017,0,53;73947868,0,47;73947864,0,60;73947858,0,70;31933744,0,14;3045571,1,11;78391068,1,5;78391067,1,29;78391070,1,4;78391079,1,50;78391078,1,44;3030297,1,43;38182134,0,88;38182135,0,37;38182128,0,20;38182130,0,30;38182126,0,6;","distance":1633,"routelatlon":"126.645788,45.786516,1,0;126.645828,45.786453,1,0;126.645828,45.786453,1,0;126.645883,45.786365,1,0;126.645883,45.786365,1,0;126.646227,45.785833,1,0;126.646227,45.785833,1,0;126.646578,45.785271,1,0;126.646578,45.785271,1,0;126.646594,45.785234,1,0;126.646594,45.785234,1,0;126.646844,45.784844,1,0;126.646844,45.784844,1,0;126.646945,45.784672,1,0;126.646945,45.784672,1,0;126.647297,45.784141,1,0;126.647297,45.784141,1,0;126.647336,45.784073,1,0;126.647336,45.784073,1,0;126.647633,45.783589,1,0;126.647633,45.783589,1,0;126.647906,45.783161,1,0;126.647906,45.783161,1,0;126.647922,45.783130,1,0;126.647922,45.783130,1,0;126.648117,45.782839,1,0;126.648117,45.782839,1,0;126.648141,45.782786,1,0;126.648141,45.782786,1,0;126.648211,45.782708,1,0;126.648211,45.782708,1,0;126.648562,45.782167,1,0;126.648562,45.782167,1,0;126.648820,45.781755,1,0;126.648820,45.781755,1,0;126.648969,45.781526,1,0;126.648969,45.781526,1,0;126.649211,45.781156,1,0;126.649211,45.781156,1,0;126.649328,45.780969,1,0;126.649328,45.780969,1,0;126.649492,45.780724,1,0;126.649492,45.780724,1,0;126.649539,45.780656,1,0;126.649539,45.780656,1,0;126.649883,45.780146,1,0;126.649883,45.780146,1,0;126.649883,45.780068,1,0;126.649883,45.780068,1,0;126.649898,45.779974,1,0;126.649898,45.779974,1,0;126.650242,45.779385,1,0;126.650242,45.779385,1,0;126.650312,45.779266,1,0;126.650312,45.779266,1,0;126.650367,45.779167,1,0;126.650367,45.779167,1,0;126.650500,45.778943,1,0;126.650500,45.778943,1,0;126.650695,45.778615,1,0;126.650695,45.778615,1,0;126.650930,45.778224,1,0;126.650930,45.778224,1,0;126.650602,45.777974,1,0;126.650602,45.777974,1,0;126.650492,45.777896,1,0;126.650492,45.777896,1,0;126.650000,45.777547,1,0;126.650000,45.777547,1,0;126.649570,45.777234,1,0;126.649570,45.777234,1,0;126.649023,45.776844,1,0;126.649023,45.776844,1,0;126.648391,45.776385,1,0;126.648391,45.776385,1,0;126.648258,45.776286,1,0;126.648258,45.776286,1,0;126.648148,45.776208,1,0;126.648148,45.776208,1,0;126.648086,45.776167,1,0;126.648086,45.776167,1,0;126.647813,45.775979,1,0;126.647813,45.775979,1,0;126.647773,45.775948,1,0;126.647773,45.775948,1,0;126.647305,45.775620,1,0;126.647305,45.775620,1,0;126.646898,45.775328,1,0;126.646898,45.775328,2,0;126.646492,45.775042,2,0;126.646492,45.775042,1,0;126.647305,45.774479,1,0;126.647305,45.774479,1,0;126.647656,45.774245,1,0;126.647656,45.774245,0,0;126.647469,45.774109,0,0;126.647469,45.774109,0,0;126.647078,45.774099,0,0;126.647078,45.774099,0,0;126.647015,45.774145,0,0"}],"list":[{"duration":417,"item":[{"swlink":"686655,0,85465065","niIds":"85465065,0,8;","distance":8,"tmc":[{"route":"126.645788,45.786516;126.645828,45.786453","level":1}],"turncode":5,"strguide":"直行进入南十四道街","routelonlat":"126.645788,45.786516;126.645828,45.786453","streetName":"南十四道街","turnlatlon":"126.645828,45.786453","sectIdx":0,"turntype":6,"id":0,"turnlink":"686655,0,85465065"},{"swlink":"686655,0,49715023","niIds":"85464922,0,9;85464923,0,64;38181217,0,67;38181218,0,4;3034792,0,47;3092224,0,20;3078816,0,64;3078817,0,7;102299954,0,57;102299955,0,51;49715023,0,3;","distance":393,"tmc":[{"route":"126.645828,45.786453;126.645883,45.786365","level":1},{"route":"126.645883,45.786365;126.646227,45.785833","level":1},{"route":"126.646227,45.785833;126.646578,45.785271","level":1},{"route":"126.646578,45.785271;126.646594,45.785234","level":1},{"route":"126.646594,45.785234;126.646844,45.784844","level":1},{"route":"126.646844,45.784844;126.646945,45.784672","level":1},{"route":"126.646945,45.784672;126.647297,45.784141","level":1},{"route":"126.647297,45.784141;126.647336,45.784073","level":1},{"route":"126.647336,45.784073;126.647633,45.783589","level":1},{"route":"126.647633,45.783589;126.647906,45.783161","level":1},{"route":"126.647906,45.783161;126.647922,45.783130","level":1}],"turncode":10,"strguide":"左前方进入南十四道街","routelonlat":"126.645828,45.786453;126.645883,45.786365;126.646227,45.785833;126.646578,45.785271;126.646594,45.785234;126.646844,45.784844;126.646945,45.784672;126.647297,45.784141;126.647336,45.784073;126.647633,45.783589;126.647906,45.783161;126.647922,45.783130","streetName":"南十四道街","turnlatlon":"126.647922,45.783130","sectIdx":0,"turntype":6,"id":1,"turnlink":"686655,0,49715023"},{"swlink":"686655,0,49715026","niIds":"49715025,0,35;49715026,0,5;","distance":40,"tmc":[{"route":"126.647922,45.783130;126.648117,45.782839","level":1},{"route":"126.648117,45.782839;126.648141,45.782786","level":1}],"turncode":5,"strguide":"直行进入南十四道街","routelonlat":"126.647922,45.783130;126.648117,45.782839;126.648141,45.782786","streetName":"南十四道街","turnlatlon":"126.648141,45.782786","sectIdx":0,"turntype":6,"id":2,"turnlink":"686655,0,49715026"},{"swlink":"686655,0,3034859","niIds":"3034850,0,9;102299974,0,65;102299975,0,49;102299780,0,27;102299817,0,44;102299818,0,21;3034859,0,29;","distance":244,"tmc":[{"route":"126.648141,45.782786;126.648211,45.782708","level":1},{"route":"126.648211,45.782708;126.648562,45.782167","level":1},{"route":"126.648562,45.782167;126.648820,45.781755","level":1},{"route":"126.648820,45.781755;126.648969,45.781526","level":1},{"route":"126.648969,45.781526;126.649211,45.781156","level":1},{"route":"126.649211,45.781156;126.649328,45.780969","level":1},{"route":"126.649328,45.780969;126.649492,45.780724","level":1}],"turncode":5,"strguide":"直行进入南十四道街","routelonlat":"126.648141,45.782786;126.648211,45.782708;126.648562,45.782167;126.648820,45.781755;126.648969,45.781526;126.649211,45.781156;126.649328,45.780969;126.649492,45.780724","streetName":"南十四道街","turnlatlon":"126.649492,45.780724","sectIdx":0,"turntype":6,"id":3,"turnlink":"686655,0,3034859"},{"swlink":"686655,1,14274376","niIds":"3034858,1,7;14274376,1,61;","distance":68,"tmc":[{"route":"126.649492,45.780724;126.649539,45.780656","level":1},{"route":"126.649539,45.780656;126.649883,45.780146","level":1}],"turncode":11,"strguide":"右前方进入南十四道街","routelonlat":"126.649492,45.780724;126.649539,45.780656;126.649883,45.780146","streetName":"南十四道街","turnlatlon":"126.649883,45.780146","sectIdx":0,"turntype":6,"id":4,"turnlink":"686655,1,14274376"},{"swlink":"686655,1,102299374","niIds":"102299357,1,8;102299356,1,10;3045639,1,70;3034863,1,13;73947882,1,10;47374058,1,26;47374057,1,39;102299374,1,46;","distance":222,"tmc":[{"route":"126.649883,45.780146;126.649883,45.780068","level":1},{"route":"126.649883,45.780068;126.649898,45.779974","level":1},{"route":"126.649898,45.779974;126.650242,45.779385","level":1},{"route":"126.650242,45.779385;126.650312,45.779266","level":1},{"route":"126.650312,45.779266;126.650367,45.779167","level":1},{"route":"126.650367,45.779167;126.650500,45.778943","level":1},{"route":"126.650500,45.778943;126.650695,45.778615","level":1},{"route":"126.650695,45.778615;126.650930,45.778224","level":1}],"turncode":9,"strguide":"右转进入保障街","routelonlat":"126.649883,45.780146;126.649883,45.780068;126.649898,45.779974;126.650242,45.779385;126.650312,45.779266;126.650367,45.779167;126.650500,45.778943;126.650695,45.778615;126.650930,45.778224","streetName":"保障街","turnlatlon":"126.650930,45.778224","sectIdx":0,"turntype":6,"id":5,"turnlink":"686655,1,102299374"},{"swlink":"686655,0,31933744","niIds":"73947871,0,36;112974016,0,11;112974017,0,53;73947868,0,47;73947864,0,60;73947858,0,70;31933744,0,14;","distance":291,"tmc":[{"route":"126.650930,45.778224;126.650602,45.777974","level":1},{"route":"126.650602,45.777974;126.650492,45.777896","level":1},{"route":"126.650492,45.777896;126.650000,45.777547","level":1},{"route":"126.650000,45.777547;126.649570,45.777234","level":1},{"route":"126.649570,45.777234;126.649023,45.776844","level":1},{"route":"126.649023,45.776844;126.648391,45.776385","level":1},{"route":"126.648391,45.776385;126.648258,45.776286","level":1}],"turncode":5,"strguide":"直行进入保障街","routelonlat":"126.650930,45.778224;126.650602,45.777974;126.650492,45.777896;126.650000,45.777547;126.649570,45.777234;126.649023,45.776844;126.648391,45.776385;126.648258,45.776286","streetName":"保障街","turnlatlon":"126.648258,45.776286","sectIdx":0,"turntype":6,"id":6,"turnlink":"686655,0,31933744"},{"swlink":"686655,1,3030297","niIds":"3045571,1,11;78391068,1,5;78391067,1,29;78391070,1,4;78391079,1,50;78391078,1,44;3030297,1,43;","distance":186,"tmc":[{"route":"126.648258,45.776286;126.648148,45.776208","level":1},{"route":"126.648148,45.776208;126.648086,45.776167","level":1},{"route":"126.648086,45.776167;126.647813,45.775979","level":1},{"route":"126.647813,45.775979;126.647773,45.775948","level":1},{"route":"126.647773,45.775948;126.647305,45.775620","level":1},{"route":"126.647305,45.775620;126.646898,45.775328","level":1},{"route":"126.646898,45.775328;126.646492,45.775042","level":2}],"turncode":8,"strguide":"左转进入三育街","routelonlat":"126.648258,45.776286;126.648148,45.776208;126.648086,45.776167;126.647813,45.775979;126.647773,45.775948;126.647305,45.775620;126.646898,45.775328;126.646492,45.775042","streetName":"三育街","turnlatlon":"126.646492,45.775042","sectIdx":0,"turntype":6,"id":7,"turnlink":"686655,1,3030297"},{"swlink":"686655,0,38182135","niIds":"38182134,0,88;38182135,0,37;","distance":125,"tmc":[{"route":"126.646492,45.775042;126.647305,45.774479","level":1},{"route":"126.647305,45.774479;126.647656,45.774245","level":1}],"turncode":9,"strguide":"右转进入","routelonlat":"126.646492,45.775042;126.647305,45.774479;126.647656,45.774245","streetName":"","turnlatlon":"126.647656,45.774245","sectIdx":0,"turntype":6,"id":8,"turnlink":"686655,0,38182135"},{"swlink":"686655,0,38182128","niIds":"38182128,0,20;","distance":20,"tmc":[{"route":"126.647656,45.774245;126.647469,45.774109","level":0}],"turncode":11,"strguide":"右前方进入","routelonlat":"126.647656,45.774245;126.647469,45.774109","streetName":"","turnlatlon":"126.647469,45.774109","sectIdx":0,"turntype":6,"id":9,"turnlink":"686655,0,38182128"},{"swlink":"686655,0,38182130","niIds":"38182130,0,30;","distance":30,"tmc":[{"route":"126.647469,45.774109;126.647078,45.774099","level":0}],"turncode":9,"strguide":"右转进入","routelonlat":"126.647469,45.774109;126.647078,45.774099","streetName":"","turnlatlon":"126.647078,45.774099","sectIdx":0,"turntype":6,"id":10,"turnlink":"686655,0,38182130"},{"swlink":"686655,0,38182126","niIds":"38182126,0,6;","distance":6,"tmc":[{"route":"126.647078,45.774099;126.647015,45.774145","level":0}],"turncode":5,"strguide":"直行进入","routelonlat":"126.647078,45.774099;126.647015,45.774145","streetName":"","turnlatlon":"126.647015,45.774145","sectIdx":0,"turntype":6,"id":11,"turnlink":"686655,0,38182126"}],"niIds":"85465065,0,8;85464922,0,9;85464923,0,64;38181217,0,67;38181218,0,4;3034792,0,47;3092224,0,20;3078816,0,64;3078817,0,7;102299954,0,57;102299955,0,51;49715023,0,3;49715025,0,35;49715026,0,5;3034850,0,9;102299974,0,65;102299975,0,49;102299780,0,27;102299817,0,44;102299818,0,21;3034859,0,29;3034858,1,7;14274376,1,61;102299357,1,8;102299356,1,10;3045639,1,70;3034863,1,13;73947882,1,10;47374058,1,26;47374057,1,39;102299374,1,46;73947871,0,36;112974016,0,11;112974017,0,53;73947868,0,47;73947864,0,60;73947858,0,70;31933744,0,14;3045571,1,11;78391068,1,5;78391067,1,29;78391070,1,4;78391079,1,50;78391078,1,44;3030297,1,43;38182134,0,88;38182135,0,37;38182128,0,20;38182130,0,30;38182126,0,6;","distance":1633,"routelatlon":"126.645788,45.786516,1,0;126.645828,45.786453,1,0;126.645828,45.786453,1,0;126.645883,45.786365,1,0;126.645883,45.786365,1,0;126.646227,45.785833,1,0;126.646227,45.785833,1,0;126.646578,45.785271,1,0;126.646578,45.785271,1,0;126.646594,45.785234,1,0;126.646594,45.785234,1,0;126.646844,45.784844,1,0;126.646844,45.784844,1,0;126.646945,45.784672,1,0;126.646945,45.784672,1,0;126.647297,45.784141,1,0;126.647297,45.784141,1,0;126.647336,45.784073,1,0;126.647336,45.784073,1,0;126.647633,45.783589,1,0;126.647633,45.783589,1,0;126.647906,45.783161,1,0;126.647906,45.783161,1,0;126.647922,45.783130,1,0;126.647922,45.783130,1,0;126.648117,45.782839,1,0;126.648117,45.782839,1,0;126.648141,45.782786,1,0;126.648141,45.782786,1,0;126.648211,45.782708,1,0;126.648211,45.782708,1,0;126.648562,45.782167,1,0;126.648562,45.782167,1,0;126.648820,45.781755,1,0;126.648820,45.781755,1,0;126.648969,45.781526,1,0;126.648969,45.781526,1,0;126.649211,45.781156,1,0;126.649211,45.781156,1,0;126.649328,45.780969,1,0;126.649328,45.780969,1,0;126.649492,45.780724,1,0;126.649492,45.780724,1,0;126.649539,45.780656,1,0;126.649539,45.780656,1,0;126.649883,45.780146,1,0;126.649883,45.780146,1,0;126.649883,45.780068,1,0;126.649883,45.780068,1,0;126.649898,45.779974,1,0;126.649898,45.779974,1,0;126.650242,45.779385,1,0;126.650242,45.779385,1,0;126.650312,45.779266,1,0;126.650312,45.779266,1,0;126.650367,45.779167,1,0;126.650367,45.779167,1,0;126.650500,45.778943,1,0;126.650500,45.778943,1,0;126.650695,45.778615,1,0;126.650695,45.778615,1,0;126.650930,45.778224,1,0;126.650930,45.778224,1,0;126.650602,45.777974,1,0;126.650602,45.777974,1,0;126.650492,45.777896,1,0;126.650492,45.777896,1,0;126.650000,45.777547,1,0;126.650000,45.777547,1,0;126.649570,45.777234,1,0;126.649570,45.777234,1,0;126.649023,45.776844,1,0;126.649023,45.776844,1,0;126.648391,45.776385,1,0;126.648391,45.776385,1,0;126.648258,45.776286,1,0;126.648258,45.776286,1,0;126.648148,45.776208,1,0;126.648148,45.776208,1,0;126.648086,45.776167,1,0;126.648086,45.776167,1,0;126.647813,45.775979,1,0;126.647813,45.775979,1,0;126.647773,45.775948,1,0;126.647773,45.775948,1,0;126.647305,45.775620,1,0;126.647305,45.775620,1,0;126.646898,45.775328,1,0;126.646898,45.775328,2,0;126.646492,45.775042,2,0;126.646492,45.775042,1,0;126.647305,45.774479,1,0;126.647305,45.774479,1,0;126.647656,45.774245,1,0;126.647656,45.774245,0,0;126.647469,45.774109,0,0;126.647469,45.774109,0,0;126.647078,45.774099,0,0;126.647078,45.774099,0,0;126.647015,45.774145,0,0"}]}},{"data":{"rows":[{"duration":361,"item":[{"swlink":"686655,0,501195479","niIds":"3090740,0,33;102299893,0,64;102299894,0,39;102299895,0,48;501195478,0,25;501195479,0,64;","distance":273,"tmc":[{"route":"126.641590,45.787200;126.641930,45.787370","level":1},{"route":"126.641930,45.787370;126.642609,45.787719","level":1},{"route":"126.642609,45.787719;126.643023,45.787927","level":1},{"route":"126.643023,45.787927;126.643523,45.788198","level":1},{"route":"126.643523,45.788198;126.643789,45.788339","level":1},{"route":"126.643789,45.788339;126.644453,45.788698","level":1}],"turncode":2,"strguide":"掉头进入大新街","routelonlat":"126.641590,45.787200;126.641930,45.787370;126.642609,45.787719;126.643023,45.787927;126.643523,45.788198;126.643789,45.788339;126.644453,45.788698","streetName":"大新街","turnlatlon":"126.644453,45.788698","sectIdx":0,"turntype":6,"id":0,"turnlink":"686655,0,501195479"},{"swlink":"686655,1,3078472","niIds":"3043730,1,7;3043709,1,13;3043718,1,8;600195223,1,64;607195808,1,25;102299901,1,46;3095355,1,104;3095354,1,41;15877913,1,11;15877912,1,23;3078472,1,22;","distance":364,"tmc":[{"route":"126.644453,45.788698;126.644539,45.788734","level":1},{"route":"126.644539,45.788734;126.644445,45.788839","level":1},{"route":"126.644445,45.788839;126.644344,45.788797","level":1},{"route":"126.644344,45.788797;126.643680,45.788432","level":1},{"route":"126.643680,45.788432;126.643414,45.788286","level":1},{"route":"126.643414,45.788286;126.642930,45.788031","level":1},{"route":"126.642930,45.788031;126.641836,45.787479","level":1},{"route":"126.641836,45.787479;126.641391,45.787260","level":1},{"route":"126.641391,45.787260;126.641273,45.787193","level":1},{"route":"126.641273,45.787193;126.641031,45.787052","level":1},{"route":"126.641031,45.787052;126.640781,45.786943","level":1}],"turncode":5,"strguide":"直行进入大新街","routelonlat":"126.644453,45.788698;126.644539,45.788734;126.644445,45.788839;126.644344,45.788797;126.643680,45.788432;126.643414,45.788286;126.642930,45.788031;126.641836,45.787479;126.641391,45.787260;126.641273,45.787193;126.641031,45.787052;126.640781,45.786943","streetName":"大新街","turnlatlon":"126.640781,45.786943","sectIdx":0,"turntype":6,"id":1,"turnlink":"686655,1,3078472"},{"swlink":"686655,1,20727260","niIds":"3078471,1,76;3025905,1,69;3092087,1,27;20727261,1,33;20727260,1,77;","distance":282,"tmc":[{"route":"126.640781,45.786943;126.639953,45.786563","level":1},{"route":"126.639953,45.786563;126.639148,45.786276","level":1},{"route":"126.639148,45.786276;126.638805,45.786177","level":1},{"route":"126.638805,45.786177;126.638414,45.786047","level":1},{"route":"126.638414,45.786047;126.637508,45.785734","level":1}],"turncode":5,"strguide":"直行进入大新街","routelonlat":"126.640781,45.786943;126.639953,45.786563;126.639148,45.786276;126.638805,45.786177;126.638414,45.786047;126.637508,45.785734","streetName":"大新街","turnlatlon":"126.637508,45.785734","sectIdx":0,"turntype":6,"id":2,"turnlink":"686655,1,20727260"},{"swlink":"686655,0,3092174","niIds":"3083112,0,6;19483389,0,67;73947796,0,67;73947797,0,68;3092173,0,92;3092174,0,75;","distance":375,"tmc":[{"route":"126.637508,45.785734;126.637422,45.785719","level":1},{"route":"126.637422,45.785719;126.636609,45.785500","level":1},{"route":"126.636609,45.785500;126.635789,45.785286","level":1},{"route":"126.635789,45.785286;126.634961,45.785068","level":1},{"route":"126.634961,45.785068;126.633906,45.784672","level":1},{"route":"126.633906,45.784672;126.633047,45.784344","level":1}],"turncode":5,"strguide":"直行进入大新街","routelonlat":"126.637508,45.785734;126.637422,45.785719;126.636609,45.785500;126.635789,45.785286;126.634961,45.785068;126.633906,45.784672;126.633047,45.784344","streetName":"大新街","turnlatlon":"126.633047,45.784344","sectIdx":0,"turntype":6,"id":3,"turnlink":"686655,0,3092174"},{"swlink":"686655,1,3025752","niIds":"3095345,1,69;3095344,1,39;3087579,1,21;81695613,1,33;81695612,1,40;3092214,1,23;3025752,1,72;","distance":297,"tmc":[{"route":"126.633047,45.784344;126.632242,45.784052","level":1},{"route":"126.632242,45.784052;126.631781,45.783885","level":1},{"route":"126.631781,45.783885;126.631523,45.783797","level":1},{"route":"126.631523,45.783797;126.631133,45.783656","level":1},{"route":"126.631133,45.783656;126.630664,45.783484","level":1},{"route":"126.630664,45.783484;126.630383,45.783385","level":1},{"route":"126.630383,45.783385;126.629523,45.783099","level":1}],"turncode":8,"strguide":"左转进入景阳街","routelonlat":"126.633047,45.784344;126.632242,45.784052;126.631781,45.783885;126.631523,45.783797;126.631133,45.783656;126.630664,45.783484;126.630383,45.783385;126.629523,45.783099","streetName":"景阳街","turnlatlon":"126.629523,45.783099","sectIdx":0,"turntype":6,"id":4,"turnlink":"686655,1,3025752"},{"swlink":"686655,1,3025912","niIds":"3025760,1,15;3025907,1,56;81695658,1,73;81695660,1,34;81695659,1,20;3025913,1,75;3025912,1,86;","distance":359,"tmc":[{"route":"126.629523,45.783099;126.629523,45.782958","level":1},{"route":"126.629523,45.782958;126.629805,45.782484","level":1},{"route":"126.629805,45.782484;126.630172,45.781865","level":1},{"route":"126.630172,45.781865;126.630352,45.781573","level":1},{"route":"126.630352,45.781573;126.630453,45.781396","level":1},{"route":"126.630453,45.781396;126.630813,45.780755","level":1},{"route":"126.630813,45.780755;126.631219,45.780026","level":1}],"turncode":5,"strguide":"直行进入景阳街","routelonlat":"126.629523,45.783099;126.629523,45.782958;126.629805,45.782484;126.630172,45.781865;126.630352,45.781573;126.630453,45.781396;126.630813,45.780755;126.631219,45.780026","streetName":"景阳街","turnlatlon":"126.631219,45.780026","sectIdx":0,"turntype":6,"id":5,"turnlink":"686655,1,3025912"},{"swlink":"686655,1,3025836","niIds":"3025836,1,59;","distance":59,"tmc":[{"route":"126.631219,45.780026;126.631492,45.779516","level":1}],"turncode":9,"strguide":"右转进入北马路","routelonlat":"126.631219,45.780026;126.631492,45.779516","streetName":"北马路","turnlatlon":"126.631492,45.779516","sectIdx":0,"turntype":6,"id":6,"turnlink":"686655,1,3025836"},{"swlink":"686655,0,39838510","niIds":"3025839,0,46;49715038,0,32;84875362,0,21;84875363,0,22;49715041,0,61;38181752,0,21;38181753,0,7;39838509,0,26;39838510,0,22;","distance":258,"tmc":[{"route":"126.631492,45.779516;126.630922,45.779365","level":0},{"route":"126.630922,45.779365;126.630531,45.779255","level":0},{"route":"126.630531,45.779255;126.630266,45.779187","level":0},{"route":"126.630266,45.779187;126.629984,45.779115","level":0},{"route":"126.629984,45.779115;126.629234,45.778917","level":0},{"route":"126.629234,45.778917;126.628969,45.778839","level":0},{"route":"126.628969,45.778839;126.628867,45.778807","level":0},{"route":"126.628867,45.778807;126.628539,45.778708","level":0},{"route":"126.628539,45.778708;126.628258,45.778620","level":0}],"turncode":8,"strguide":"左转进入新马路","routelonlat":"126.631492,45.779516;126.630922,45.779365;126.630531,45.779255;126.630266,45.779187;126.629984,45.779115;126.629234,45.778917;126.628969,45.778839;126.628867,45.778807;126.628539,45.778708;126.628258,45.778620","streetName":"新马路","turnlatlon":"126.628258,45.778620","sectIdx":0,"turntype":6,"id":7,"turnlink":"686655,0,39838510"},{"swlink":"686655,0,500184125","niIds":"500184125,0,146;","distance":146,"tmc":[{"route":"126.628258,45.778620;126.627800,45.777336","level":0}],"turncode":5,"strguide":"直行进入","routelonlat":"126.628258,45.778620;126.627800,45.777336","streetName":"","turnlatlon":"126.627800,45.777336","sectIdx":0,"turntype":6,"id":8,"turnlink":"686655,0,500184125"}],"niIds":"3090740,0,33;102299893,0,64;102299894,0,39;102299895,0,48;501195478,0,25;501195479,0,64;3043730,1,7;3043709,1,13;3043718,1,8;600195223,1,64;607195808,1,25;102299901,1,46;3095355,1,104;3095354,1,41;15877913,1,11;15877912,1,23;3078472,1,22;3078471,1,76;3025905,1,69;3092087,1,27;20727261,1,33;20727260,1,77;3083112,0,6;19483389,0,67;73947796,0,67;73947797,0,68;3092173,0,92;3092174,0,75;3095345,1,69;3095344,1,39;3087579,1,21;81695613,1,33;81695612,1,40;3092214,1,23;3025752,1,72;3025760,1,15;3025907,1,56;81695658,1,73;81695660,1,34;81695659,1,20;3025913,1,75;3025912,1,86;3025836,1,59;3025839,0,46;49715038,0,32;84875362,0,21;84875363,0,22;49715041,0,61;38181752,0,21;38181753,0,7;39838509,0,26;39838510,0,22;500184125,0,146;","distance":2413,"routelatlon":"126.641590,45.787200,1,0;126.641930,45.787370,1,0;126.641930,45.787370,1,0;126.642609,45.787719,1,0;126.642609,45.787719,1,0;126.643023,45.787927,1,0;126.643023,45.787927,1,0;126.643523,45.788198,1,0;126.643523,45.788198,1,0;126.643789,45.788339,1,0;126.643789,45.788339,1,0;126.644453,45.788698,1,0;126.644453,45.788698,1,0;126.644539,45.788734,1,0;126.644539,45.788734,1,0;126.644445,45.788839,1,0;126.644445,45.788839,1,0;126.644344,45.788797,1,0;126.644344,45.788797,1,0;126.643680,45.788432,1,0;126.643680,45.788432,1,0;126.643414,45.788286,1,0;126.643414,45.788286,1,0;126.642930,45.788031,1,0;126.642930,45.788031,1,0;126.641836,45.787479,1,0;126.641836,45.787479,1,0;126.641391,45.787260,1,0;126.641391,45.787260,1,0;126.641273,45.787193,1,0;126.641273,45.787193,1,0;126.641031,45.787052,1,0;126.641031,45.787052,1,0;126.640781,45.786943,1,0;126.640781,45.786943,1,0;126.639953,45.786563,1,0;126.639953,45.786563,1,0;126.639148,45.786276,1,0;126.639148,45.786276,1,0;126.638805,45.786177,1,0;126.638805,45.786177,1,0;126.638414,45.786047,1,0;126.638414,45.786047,1,0;126.637508,45.785734,1,0;126.637508,45.785734,1,0;126.637422,45.785719,1,0;126.637422,45.785719,1,0;126.636609,45.785500,1,0;126.636609,45.785500,1,0;126.635789,45.785286,1,0;126.635789,45.785286,1,0;126.634961,45.785068,1,0;126.634961,45.785068,1,0;126.633906,45.784672,1,0;126.633906,45.784672,1,0;126.633047,45.784344,1,0;126.633047,45.784344,1,0;126.632242,45.784052,1,0;126.632242,45.784052,1,0;126.631781,45.783885,1,0;126.631781,45.783885,1,0;126.631523,45.783797,1,0;126.631523,45.783797,1,0;126.631133,45.783656,1,0;126.631133,45.783656,1,0;126.630664,45.783484,1,0;126.630664,45.783484,1,0;126.630383,45.783385,1,0;126.630383,45.783385,1,0;126.629523,45.783099,1,0;126.629523,45.783099,1,0;126.629523,45.782958,1,0;126.629523,45.782958,1,0;126.629805,45.782484,1,0;126.629805,45.782484,1,0;126.630172,45.781865,1,0;126.630172,45.781865,1,0;126.630352,45.781573,1,0;126.630352,45.781573,1,0;126.630453,45.781396,1,0;126.630453,45.781396,1,0;126.630813,45.780755,1,0;126.630813,45.780755,1,0;126.631219,45.780026,1,0;126.631219,45.780026,1,0;126.631492,45.779516,1,0;126.631492,45.779516,0,0;126.630922,45.779365,0,0;126.630922,45.779365,0,0;126.630531,45.779255,0,0;126.630531,45.779255,0,0;126.630266,45.779187,0,0;126.630266,45.779187,0,0;126.629984,45.779115,0,0;126.629984,45.779115,0,0;126.629234,45.778917,0,0;126.629234,45.778917,0,0;126.628969,45.778839,0,0;126.628969,45.778839,0,0;126.628867,45.778807,0,0;126.628867,45.778807,0,0;126.628539,45.778708,0,0;126.628539,45.778708,0,0;126.628258,45.778620,0,0;126.628258,45.778620,0,0;126.627800,45.777336,0,0"}]},"errcode":0,"errmsg":"","result":{"rows":[{"duration":361,"item":[{"swlink":"686655,0,501195479","niIds":"3090740,0,33;102299893,0,64;102299894,0,39;102299895,0,48;501195478,0,25;501195479,0,64;","distance":273,"tmc":[{"route":"126.641590,45.787200;126.641930,45.787370","level":1},{"route":"126.641930,45.787370;126.642609,45.787719","level":1},{"route":"126.642609,45.787719;126.643023,45.787927","level":1},{"route":"126.643023,45.787927;126.643523,45.788198","level":1},{"route":"126.643523,45.788198;126.643789,45.788339","level":1},{"route":"126.643789,45.788339;126.644453,45.788698","level":1}],"turncode":2,"strguide":"掉头进入大新街","routelonlat":"126.641590,45.787200;126.641930,45.787370;126.642609,45.787719;126.643023,45.787927;126.643523,45.788198;126.643789,45.788339;126.644453,45.788698","streetName":"大新街","turnlatlon":"126.644453,45.788698","sectIdx":0,"turntype":6,"id":0,"turnlink":"686655,0,501195479"},{"swlink":"686655,1,3078472","niIds":"3043730,1,7;3043709,1,13;3043718,1,8;600195223,1,64;607195808,1,25;102299901,1,46;3095355,1,104;3095354,1,41;15877913,1,11;15877912,1,23;3078472,1,22;","distance":364,"tmc":[{"route":"126.644453,45.788698;126.644539,45.788734","level":1},{"route":"126.644539,45.788734;126.644445,45.788839","level":1},{"route":"126.644445,45.788839;126.644344,45.788797","level":1},{"route":"126.644344,45.788797;126.643680,45.788432","level":1},{"route":"126.643680,45.788432;126.643414,45.788286","level":1},{"route":"126.643414,45.788286;126.642930,45.788031","level":1},{"route":"126.642930,45.788031;126.641836,45.787479","level":1},{"route":"126.641836,45.787479;126.641391,45.787260","level":1},{"route":"126.641391,45.787260;126.641273,45.787193","level":1},{"route":"126.641273,45.787193;126.641031,45.787052","level":1},{"route":"126.641031,45.787052;126.640781,45.786943","level":1}],"turncode":5,"strguide":"直行进入大新街","routelonlat":"126.644453,45.788698;126.644539,45.788734;126.644445,45.788839;126.644344,45.788797;126.643680,45.788432;126.643414,45.788286;126.642930,45.788031;126.641836,45.787479;126.641391,45.787260;126.641273,45.787193;126.641031,45.787052;126.640781,45.786943","streetName":"大新街","turnlatlon":"126.640781,45.786943","sectIdx":0,"turntype":6,"id":1,"turnlink":"686655,1,3078472"},{"swlink":"686655,1,20727260","niIds":"3078471,1,76;3025905,1,69;3092087,1,27;20727261,1,33;20727260,1,77;","distance":282,"tmc":[{"route":"126.640781,45.786943;126.639953,45.786563","level":1},{"route":"126.639953,45.786563;126.639148,45.786276","level":1},{"route":"126.639148,45.786276;126.638805,45.786177","level":1},{"route":"126.638805,45.786177;126.638414,45.786047","level":1},{"route":"126.638414,45.786047;126.637508,45.785734","level":1}],"turncode":5,"strguide":"直行进入大新街","routelonlat":"126.640781,45.786943;126.639953,45.786563;126.639148,45.786276;126.638805,45.786177;126.638414,45.786047;126.637508,45.785734","streetName":"大新街","turnlatlon":"126.637508,45.785734","sectIdx":0,"turntype":6,"id":2,"turnlink":"686655,1,20727260"},{"swlink":"686655,0,3092174","niIds":"3083112,0,6;19483389,0,67;73947796,0,67;73947797,0,68;3092173,0,92;3092174,0,75;","distance":375,"tmc":[{"route":"126.637508,45.785734;126.637422,45.785719","level":1},{"route":"126.637422,45.785719;126.636609,45.785500","level":1},{"route":"126.636609,45.785500;126.635789,45.785286","level":1},{"route":"126.635789,45.785286;126.634961,45.785068","level":1},{"route":"126.634961,45.785068;126.633906,45.784672","level":1},{"route":"126.633906,45.784672;126.633047,45.784344","level":1}],"turncode":5,"strguide":"直行进入大新街","routelonlat":"126.637508,45.785734;126.637422,45.785719;126.636609,45.785500;126.635789,45.785286;126.634961,45.785068;126.633906,45.784672;126.633047,45.784344","streetName":"大新街","turnlatlon":"126.633047,45.784344","sectIdx":0,"turntype":6,"id":3,"turnlink":"686655,0,3092174"},{"swlink":"686655,1,3025752","niIds":"3095345,1,69;3095344,1,39;3087579,1,21;81695613,1,33;81695612,1,40;3092214,1,23;3025752,1,72;","distance":297,"tmc":[{"route":"126.633047,45.784344;126.632242,45.784052","level":1},{"route":"126.632242,45.784052;126.631781,45.783885","level":1},{"route":"126.631781,45.783885;126.631523,45.783797","level":1},{"route":"126.631523,45.783797;126.631133,45.783656","level":1},{"route":"126.631133,45.783656;126.630664,45.783484","level":1},{"route":"126.630664,45.783484;126.630383,45.783385","level":1},{"route":"126.630383,45.783385;126.629523,45.783099","level":1}],"turncode":8,"strguide":"左转进入景阳街","routelonlat":"126.633047,45.784344;126.632242,45.784052;126.631781,45.783885;126.631523,45.783797;126.631133,45.783656;126.630664,45.783484;126.630383,45.783385;126.629523,45.783099","streetName":"景阳街","turnlatlon":"126.629523,45.783099","sectIdx":0,"turntype":6,"id":4,"turnlink":"686655,1,3025752"},{"swlink":"686655,1,3025912","niIds":"3025760,1,15;3025907,1,56;81695658,1,73;81695660,1,34;81695659,1,20;3025913,1,75;3025912,1,86;","distance":359,"tmc":[{"route":"126.629523,45.783099;126.629523,45.782958","level":1},{"route":"126.629523,45.782958;126.629805,45.782484","level":1},{"route":"126.629805,45.782484;126.630172,45.781865","level":1},{"route":"126.630172,45.781865;126.630352,45.781573","level":1},{"route":"126.630352,45.781573;126.630453,45.781396","level":1},{"route":"126.630453,45.781396;126.630813,45.780755","level":1},{"route":"126.630813,45.780755;126.631219,45.780026","level":1}],"turncode":5,"strguide":"直行进入景阳街","routelonlat":"126.629523,45.783099;126.629523,45.782958;126.629805,45.782484;126.630172,45.781865;126.630352,45.781573;126.630453,45.781396;126.630813,45.780755;126.631219,45.780026","streetName":"景阳街","turnlatlon":"126.631219,45.780026","sectIdx":0,"turntype":6,"id":5,"turnlink":"686655,1,3025912"},{"swlink":"686655,1,3025836","niIds":"3025836,1,59;","distance":59,"tmc":[{"route":"126.631219,45.780026;126.631492,45.779516","level":1}],"turncode":9,"strguide":"右转进入北马路","routelonlat":"126.631219,45.780026;126.631492,45.779516","streetName":"北马路","turnlatlon":"126.631492,45.779516","sectIdx":0,"turntype":6,"id":6,"turnlink":"686655,1,3025836"},{"swlink":"686655,0,39838510","niIds":"3025839,0,46;49715038,0,32;84875362,0,21;84875363,0,22;49715041,0,61;38181752,0,21;38181753,0,7;39838509,0,26;39838510,0,22;","distance":258,"tmc":[{"route":"126.631492,45.779516;126.630922,45.779365","level":0},{"route":"126.630922,45.779365;126.630531,45.779255","level":0},{"route":"126.630531,45.779255;126.630266,45.779187","level":0},{"route":"126.630266,45.779187;126.629984,45.779115","level":0},{"route":"126.629984,45.779115;126.629234,45.778917","level":0},{"route":"126.629234,45.778917;126.628969,45.778839","level":0},{"route":"126.628969,45.778839;126.628867,45.778807","level":0},{"route":"126.628867,45.778807;126.628539,45.778708","level":0},{"route":"126.628539,45.778708;126.628258,45.778620","level":0}],"turncode":8,"strguide":"左转进入新马路","routelonlat":"126.631492,45.779516;126.630922,45.779365;126.630531,45.779255;126.630266,45.779187;126.629984,45.779115;126.629234,45.778917;126.628969,45.778839;126.628867,45.778807;126.628539,45.778708;126.628258,45.778620","streetName":"新马路","turnlatlon":"126.628258,45.778620","sectIdx":0,"turntype":6,"id":7,"turnlink":"686655,0,39838510"},{"swlink":"686655,0,500184125","niIds":"500184125,0,146;","distance":146,"tmc":[{"route":"126.628258,45.778620;126.627800,45.777336","level":0}],"turncode":5,"strguide":"直行进入","routelonlat":"126.628258,45.778620;126.627800,45.777336","streetName":"","turnlatlon":"126.627800,45.777336","sectIdx":0,"turntype":6,"id":8,"turnlink":"686655,0,500184125"}],"niIds":"3090740,0,33;102299893,0,64;102299894,0,39;102299895,0,48;501195478,0,25;501195479,0,64;3043730,1,7;3043709,1,13;3043718,1,8;600195223,1,64;607195808,1,25;102299901,1,46;3095355,1,104;3095354,1,41;15877913,1,11;15877912,1,23;3078472,1,22;3078471,1,76;3025905,1,69;3092087,1,27;20727261,1,33;20727260,1,77;3083112,0,6;19483389,0,67;73947796,0,67;73947797,0,68;3092173,0,92;3092174,0,75;3095345,1,69;3095344,1,39;3087579,1,21;81695613,1,33;81695612,1,40;3092214,1,23;3025752,1,72;3025760,1,15;3025907,1,56;81695658,1,73;81695660,1,34;81695659,1,20;3025913,1,75;3025912,1,86;3025836,1,59;3025839,0,46;49715038,0,32;84875362,0,21;84875363,0,22;49715041,0,61;38181752,0,21;38181753,0,7;39838509,0,26;39838510,0,22;500184125,0,146;","distance":2413,"routelatlon":"126.641590,45.787200,1,0;126.641930,45.787370,1,0;126.641930,45.787370,1,0;126.642609,45.787719,1,0;126.642609,45.787719,1,0;126.643023,45.787927,1,0;126.643023,45.787927,1,0;126.643523,45.788198,1,0;126.643523,45.788198,1,0;126.643789,45.788339,1,0;126.643789,45.788339,1,0;126.644453,45.788698,1,0;126.644453,45.788698,1,0;126.644539,45.788734,1,0;126.644539,45.788734,1,0;126.644445,45.788839,1,0;126.644445,45.788839,1,0;126.644344,45.788797,1,0;126.644344,45.788797,1,0;126.643680,45.788432,1,0;126.643680,45.788432,1,0;126.643414,45.788286,1,0;126.643414,45.788286,1,0;126.642930,45.788031,1,0;126.642930,45.788031,1,0;126.641836,45.787479,1,0;126.641836,45.787479,1,0;126.641391,45.787260,1,0;126.641391,45.787260,1,0;126.641273,45.787193,1,0;126.641273,45.787193,1,0;126.641031,45.787052,1,0;126.641031,45.787052,1,0;126.640781,45.786943,1,0;126.640781,45.786943,1,0;126.639953,45.786563,1,0;126.639953,45.786563,1,0;126.639148,45.786276,1,0;126.639148,45.786276,1,0;126.638805,45.786177,1,0;126.638805,45.786177,1,0;126.638414,45.786047,1,0;126.638414,45.786047,1,0;126.637508,45.785734,1,0;126.637508,45.785734,1,0;126.637422,45.785719,1,0;126.637422,45.785719,1,0;126.636609,45.785500,1,0;126.636609,45.785500,1,0;126.635789,45.785286,1,0;126.635789,45.785286,1,0;126.634961,45.785068,1,0;126.634961,45.785068,1,0;126.633906,45.784672,1,0;126.633906,45.784672,1,0;126.633047,45.784344,1,0;126.633047,45.784344,1,0;126.632242,45.784052,1,0;126.632242,45.784052,1,0;126.631781,45.783885,1,0;126.631781,45.783885,1,0;126.631523,45.783797,1,0;126.631523,45.783797,1,0;126.631133,45.783656,1,0;126.631133,45.783656,1,0;126.630664,45.783484,1,0;126.630664,45.783484,1,0;126.630383,45.783385,1,0;126.630383,45.783385,1,0;126.629523,45.783099,1,0;126.629523,45.783099,1,0;126.629523,45.782958,1,0;126.629523,45.782958,1,0;126.629805,45.782484,1,0;126.629805,45.782484,1,0;126.630172,45.781865,1,0;126.630172,45.781865,1,0;126.630352,45.781573,1,0;126.630352,45.781573,1,0;126.630453,45.781396,1,0;126.630453,45.781396,1,0;126.630813,45.780755,1,0;126.630813,45.780755,1,0;126.631219,45.780026,1,0;126.631219,45.780026,1,0;126.631492,45.779516,1,0;126.631492,45.779516,0,0;126.630922,45.779365,0,0;126.630922,45.779365,0,0;126.630531,45.779255,0,0;126.630531,45.779255,0,0;126.630266,45.779187,0,0;126.630266,45.779187,0,0;126.629984,45.779115,0,0;126.629984,45.779115,0,0;126.629234,45.778917,0,0;126.629234,45.778917,0,0;126.628969,45.778839,0,0;126.628969,45.778839,0,0;126.628867,45.778807,0,0;126.628867,45.778807,0,0;126.628539,45.778708,0,0;126.628539,45.778708,0,0;126.628258,45.778620,0,0;126.628258,45.778620,0,0;126.627800,45.777336,0,0"}],"list":[{"duration":361,"item":[{"swlink":"686655,0,501195479","niIds":"3090740,0,33;102299893,0,64;102299894,0,39;102299895,0,48;501195478,0,25;501195479,0,64;","distance":273,"tmc":[{"route":"126.641590,45.787200;126.641930,45.787370","level":1},{"route":"126.641930,45.787370;126.642609,45.787719","level":1},{"route":"126.642609,45.787719;126.643023,45.787927","level":1},{"route":"126.643023,45.787927;126.643523,45.788198","level":1},{"route":"126.643523,45.788198;126.643789,45.788339","level":1},{"route":"126.643789,45.788339;126.644453,45.788698","level":1}],"turncode":2,"strguide":"掉头进入大新街","routelonlat":"126.641590,45.787200;126.641930,45.787370;126.642609,45.787719;126.643023,45.787927;126.643523,45.788198;126.643789,45.788339;126.644453,45.788698","streetName":"大新街","turnlatlon":"126.644453,45.788698","sectIdx":0,"turntype":6,"id":0,"turnlink":"686655,0,501195479"},{"swlink":"686655,1,3078472","niIds":"3043730,1,7;3043709,1,13;3043718,1,8;600195223,1,64;607195808,1,25;102299901,1,46;3095355,1,104;3095354,1,41;15877913,1,11;15877912,1,23;3078472,1,22;","distance":364,"tmc":[{"route":"126.644453,45.788698;126.644539,45.788734","level":1},{"route":"126.644539,45.788734;126.644445,45.788839","level":1},{"route":"126.644445,45.788839;126.644344,45.788797","level":1},{"route":"126.644344,45.788797;126.643680,45.788432","level":1},{"route":"126.643680,45.788432;126.643414,45.788286","level":1},{"route":"126.643414,45.788286;126.642930,45.788031","level":1},{"route":"126.642930,45.788031;126.641836,45.787479","level":1},{"route":"126.641836,45.787479;126.641391,45.787260","level":1},{"route":"126.641391,45.787260;126.641273,45.787193","level":1},{"route":"126.641273,45.787193;126.641031,45.787052","level":1},{"route":"126.641031,45.787052;126.640781,45.786943","level":1}],"turncode":5,"strguide":"直行进入大新街","routelonlat":"126.644453,45.788698;126.644539,45.788734;126.644445,45.788839;126.644344,45.788797;126.643680,45.788432;126.643414,45.788286;126.642930,45.788031;126.641836,45.787479;126.641391,45.787260;126.641273,45.787193;126.641031,45.787052;126.640781,45.786943","streetName":"大新街","turnlatlon":"126.640781,45.786943","sectIdx":0,"turntype":6,"id":1,"turnlink":"686655,1,3078472"},{"swlink":"686655,1,20727260","niIds":"3078471,1,76;3025905,1,69;3092087,1,27;20727261,1,33;20727260,1,77;","distance":282,"tmc":[{"route":"126.640781,45.786943;126.639953,45.786563","level":1},{"route":"126.639953,45.786563;126.639148,45.786276","level":1},{"route":"126.639148,45.786276;126.638805,45.786177","level":1},{"route":"126.638805,45.786177;126.638414,45.786047","level":1},{"route":"126.638414,45.786047;126.637508,45.785734","level":1}],"turncode":5,"strguide":"直行进入大新街","routelonlat":"126.640781,45.786943;126.639953,45.786563;126.639148,45.786276;126.638805,45.786177;126.638414,45.786047;126.637508,45.785734","streetName":"大新街","turnlatlon":"126.637508,45.785734","sectIdx":0,"turntype":6,"id":2,"turnlink":"686655,1,20727260"},{"swlink":"686655,0,3092174","niIds":"3083112,0,6;19483389,0,67;73947796,0,67;73947797,0,68;3092173,0,92;3092174,0,75;","distance":375,"tmc":[{"route":"126.637508,45.785734;126.637422,45.785719","level":1},{"route":"126.637422,45.785719;126.636609,45.785500","level":1},{"route":"126.636609,45.785500;126.635789,45.785286","level":1},{"route":"126.635789,45.785286;126.634961,45.785068","level":1},{"route":"126.634961,45.785068;126.633906,45.784672","level":1},{"route":"126.633906,45.784672;126.633047,45.784344","level":1}],"turncode":5,"strguide":"直行进入大新街","routelonlat":"126.637508,45.785734;126.637422,45.785719;126.636609,45.785500;126.635789,45.785286;126.634961,45.785068;126.633906,45.784672;126.633047,45.784344","streetName":"大新街","turnlatlon":"126.633047,45.784344","sectIdx":0,"turntype":6,"id":3,"turnlink":"686655,0,3092174"},{"swlink":"686655,1,3025752","niIds":"3095345,1,69;3095344,1,39;3087579,1,21;81695613,1,33;81695612,1,40;3092214,1,23;3025752,1,72;","distance":297,"tmc":[{"route":"126.633047,45.784344;126.632242,45.784052","level":1},{"route":"126.632242,45.784052;126.631781,45.783885","level":1},{"route":"126.631781,45.783885;126.631523,45.783797","level":1},{"route":"126.631523,45.783797;126.631133,45.783656","level":1},{"route":"126.631133,45.783656;126.630664,45.783484","level":1},{"route":"126.630664,45.783484;126.630383,45.783385","level":1},{"route":"126.630383,45.783385;126.629523,45.783099","level":1}],"turncode":8,"strguide":"左转进入景阳街","routelonlat":"126.633047,45.784344;126.632242,45.784052;126.631781,45.783885;126.631523,45.783797;126.631133,45.783656;126.630664,45.783484;126.630383,45.783385;126.629523,45.783099","streetName":"景阳街","turnlatlon":"126.629523,45.783099","sectIdx":0,"turntype":6,"id":4,"turnlink":"686655,1,3025752"},{"swlink":"686655,1,3025912","niIds":"3025760,1,15;3025907,1,56;81695658,1,73;81695660,1,34;81695659,1,20;3025913,1,75;3025912,1,86;","distance":359,"tmc":[{"route":"126.629523,45.783099;126.629523,45.782958","level":1},{"route":"126.629523,45.782958;126.629805,45.782484","level":1},{"route":"126.629805,45.782484;126.630172,45.781865","level":1},{"route":"126.630172,45.781865;126.630352,45.781573","level":1},{"route":"126.630352,45.781573;126.630453,45.781396","level":1},{"route":"126.630453,45.781396;126.630813,45.780755","level":1},{"route":"126.630813,45.780755;126.631219,45.780026","level":1}],"turncode":5,"strguide":"直行进入景阳街","routelonlat":"126.629523,45.783099;126.629523,45.782958;126.629805,45.782484;126.630172,45.781865;126.630352,45.781573;126.630453,45.781396;126.630813,45.780755;126.631219,45.780026","streetName":"景阳街","turnlatlon":"126.631219,45.780026","sectIdx":0,"turntype":6,"id":5,"turnlink":"686655,1,3025912"},{"swlink":"686655,1,3025836","niIds":"3025836,1,59;","distance":59,"tmc":[{"route":"126.631219,45.780026;126.631492,45.779516","level":1}],"turncode":9,"strguide":"右转进入北马路","routelonlat":"126.631219,45.780026;126.631492,45.779516","streetName":"北马路","turnlatlon":"126.631492,45.779516","sectIdx":0,"turntype":6,"id":6,"turnlink":"686655,1,3025836"},{"swlink":"686655,0,39838510","niIds":"3025839,0,46;49715038,0,32;84875362,0,21;84875363,0,22;49715041,0,61;38181752,0,21;38181753,0,7;39838509,0,26;39838510,0,22;","distance":258,"tmc":[{"route":"126.631492,45.779516;126.630922,45.779365","level":0},{"route":"126.630922,45.779365;126.630531,45.779255","level":0},{"route":"126.630531,45.779255;126.630266,45.779187","level":0},{"route":"126.630266,45.779187;126.629984,45.779115","level":0},{"route":"126.629984,45.779115;126.629234,45.778917","level":0},{"route":"126.629234,45.778917;126.628969,45.778839","level":0},{"route":"126.628969,45.778839;126.628867,45.778807","level":0},{"route":"126.628867,45.778807;126.628539,45.778708","level":0},{"route":"126.628539,45.778708;126.628258,45.778620","level":0}],"turncode":8,"strguide":"左转进入新马路","routelonlat":"126.631492,45.779516;126.630922,45.779365;126.630531,45.779255;126.630266,45.779187;126.629984,45.779115;126.629234,45.778917;126.628969,45.778839;126.628867,45.778807;126.628539,45.778708;126.628258,45.778620","streetName":"新马路","turnlatlon":"126.628258,45.778620","sectIdx":0,"turntype":6,"id":7,"turnlink":"686655,0,39838510"},{"swlink":"686655,0,500184125","niIds":"500184125,0,146;","distance":146,"tmc":[{"route":"126.628258,45.778620;126.627800,45.777336","level":0}],"turncode":5,"strguide":"直行进入","routelonlat":"126.628258,45.778620;126.627800,45.777336","streetName":"","turnlatlon":"126.627800,45.777336","sectIdx":0,"turntype":6,"id":8,"turnlink":"686655,0,500184125"}],"niIds":"3090740,0,33;102299893,0,64;102299894,0,39;102299895,0,48;501195478,0,25;501195479,0,64;3043730,1,7;3043709,1,13;3043718,1,8;600195223,1,64;607195808,1,25;102299901,1,46;3095355,1,104;3095354,1,41;15877913,1,11;15877912,1,23;3078472,1,22;3078471,1,76;3025905,1,69;3092087,1,27;20727261,1,33;20727260,1,77;3083112,0,6;19483389,0,67;73947796,0,67;73947797,0,68;3092173,0,92;3092174,0,75;3095345,1,69;3095344,1,39;3087579,1,21;81695613,1,33;81695612,1,40;3092214,1,23;3025752,1,72;3025760,1,15;3025907,1,56;81695658,1,73;81695660,1,34;81695659,1,20;3025913,1,75;3025912,1,86;3025836,1,59;3025839,0,46;49715038,0,32;84875362,0,21;84875363,0,22;49715041,0,61;38181752,0,21;38181753,0,7;39838509,0,26;39838510,0,22;500184125,0,146;","distance":2413,"routelatlon":"126.641590,45.787200,1,0;126.641930,45.787370,1,0;126.641930,45.787370,1,0;126.642609,45.787719,1,0;126.642609,45.787719,1,0;126.643023,45.787927,1,0;126.643023,45.787927,1,0;126.643523,45.788198,1,0;126.643523,45.788198,1,0;126.643789,45.788339,1,0;126.643789,45.788339,1,0;126.644453,45.788698,1,0;126.644453,45.788698,1,0;126.644539,45.788734,1,0;126.644539,45.788734,1,0;126.644445,45.788839,1,0;126.644445,45.788839,1,0;126.644344,45.788797,1,0;126.644344,45.788797,1,0;126.643680,45.788432,1,0;126.643680,45.788432,1,0;126.643414,45.788286,1,0;126.643414,45.788286,1,0;126.642930,45.788031,1,0;126.642930,45.788031,1,0;126.641836,45.787479,1,0;126.641836,45.787479,1,0;126.641391,45.787260,1,0;126.641391,45.787260,1,0;126.641273,45.787193,1,0;126.641273,45.787193,1,0;126.641031,45.787052,1,0;126.641031,45.787052,1,0;126.640781,45.786943,1,0;126.640781,45.786943,1,0;126.639953,45.786563,1,0;126.639953,45.786563,1,0;126.639148,45.786276,1,0;126.639148,45.786276,1,0;126.638805,45.786177,1,0;126.638805,45.786177,1,0;126.638414,45.786047,1,0;126.638414,45.786047,1,0;126.637508,45.785734,1,0;126.637508,45.785734,1,0;126.637422,45.785719,1,0;126.637422,45.785719,1,0;126.636609,45.785500,1,0;126.636609,45.785500,1,0;126.635789,45.785286,1,0;126.635789,45.785286,1,0;126.634961,45.785068,1,0;126.634961,45.785068,1,0;126.633906,45.784672,1,0;126.633906,45.784672,1,0;126.633047,45.784344,1,0;126.633047,45.784344,1,0;126.632242,45.784052,1,0;126.632242,45.784052,1,0;126.631781,45.783885,1,0;126.631781,45.783885,1,0;126.631523,45.783797,1,0;126.631523,45.783797,1,0;126.631133,45.783656,1,0;126.631133,45.783656,1,0;126.630664,45.783484,1,0;126.630664,45.783484,1,0;126.630383,45.783385,1,0;126.630383,45.783385,1,0;126.629523,45.783099,1,0;126.629523,45.783099,1,0;126.629523,45.782958,1,0;126.629523,45.782958,1,0;126.629805,45.782484,1,0;126.629805,45.782484,1,0;126.630172,45.781865,1,0;126.630172,45.781865,1,0;126.630352,45.781573,1,0;126.630352,45.781573,1,0;126.630453,45.781396,1,0;126.630453,45.781396,1,0;126.630813,45.780755,1,0;126.630813,45.780755,1,0;126.631219,45.780026,1,0;126.631219,45.780026,1,0;126.631492,45.779516,1,0;126.631492,45.779516,0,0;126.630922,45.779365,0,0;126.630922,45.779365,0,0;126.630531,45.779255,0,0;126.630531,45.779255,0,0;126.630266,45.779187,0,0;126.630266,45.779187,0,0;126.629984,45.779115,0,0;126.629984,45.779115,0,0;126.629234,45.778917,0,0;126.629234,45.778917,0,0;126.628969,45.778839,0,0;126.628969,45.778839,0,0;126.628867,45.778807,0,0;126.628867,45.778807,0,0;126.628539,45.778708,0,0;126.628539,45.778708,0,0;126.628258,45.778620,0,0;126.628258,45.778620,0,0;126.627800,45.777336,0,0"}]}},{"data":{"rows":[{"duration":395,"item":[{"swlink":"686655,1,38182103","niIds":"38182103,1,9;","distance":9,"tmc":[{"route":"126.643774,45.775303;126.643859,45.775365","level":0}],"turncode":8,"strguide":"左转进入德胜街","routelonlat":"126.643774,45.775303;126.643859,45.775365","streetName":"德胜街","turnlatlon":"126.643859,45.775365","sectIdx":0,"turntype":6,"id":0,"turnlink":"686655,1,38182103"},{"swlink":"686655,0,38182120","niIds":"38182120,0,62;","distance":62,"tmc":[{"route":"126.643859,45.775365;126.643187,45.775677","level":0}],"turncode":8,"strguide":"左转进入太原街","routelonlat":"126.643859,45.775365;126.643187,45.775677","streetName":"太原街","turnlatlon":"126.643187,45.775677","sectIdx":0,"turntype":6,"id":1,"turnlink":"686655,0,38182120"},{"swlink":"686655,0,102299407","niIds":"3044191,0,10;102299406,0,51;102299407,0,58;","distance":119,"tmc":[{"route":"126.643187,45.775677;126.643078,45.775734","level":0},{"route":"126.643078,45.775734;126.642563,45.775437","level":1},{"route":"126.642563,45.775437;126.642031,45.775057","level":1}],"turncode":9,"strguide":"右转进入大水晶街","routelonlat":"126.643187,45.775677;126.643078,45.775734;126.642563,45.775437;126.642031,45.775057","streetName":"大水晶街","turnlatlon":"126.642031,45.775057","sectIdx":0,"turntype":6,"id":2,"turnlink":"686655,0,102299407"},{"swlink":"686655,1,102299390","niIds":"38182068,1,20;38182067,1,31;38182066,1,4;38182065,1,30;102299390,1,47;","distance":132,"tmc":[{"route":"126.642031,45.775057;126.641797,45.775146","level":0},{"route":"126.641797,45.775146;126.641445,45.775297","level":0},{"route":"126.641445,45.775297;126.641391,45.775318","level":0},{"route":"126.641391,45.775318;126.641055,45.775458","level":0},{"route":"126.641055,45.775458;126.640523,45.775672","level":0}],"turncode":8,"strguide":"左转进入草市街","routelonlat":"126.642031,45.775057;126.641797,45.775146;126.641445,45.775297;126.641391,45.775318;126.641055,45.775458;126.640523,45.775672","streetName":"草市街","turnlatlon":"126.640523,45.775672","sectIdx":0,"turntype":6,"id":3,"turnlink":"686655,1,102299390"},{"swlink":"686655,0,102299431","niIds":"3078873,1,7;38182018,0,8;38182020,0,34;38182022,0,33;38182023,0,46;102299431,0,42;","distance":170,"tmc":[{"route":"126.640523,45.775672;126.640422,45.775698","level":0},{"route":"126.640422,45.775698;126.640367,45.775620","level":1},{"route":"126.640367,45.775620;126.640156,45.775349","level":1},{"route":"126.640156,45.775349;126.639953,45.775078","level":1},{"route":"126.639953,45.775078;126.639664,45.774703","level":1},{"route":"126.639664,45.774703;126.639406,45.774370","level":1}],"turncode":5,"strguide":"直行进入南马路","routelonlat":"126.640523,45.775672;126.640422,45.775698;126.640367,45.775620;126.640156,45.775349;126.639953,45.775078;126.639664,45.774703;126.639406,45.774370","streetName":"南马路","turnlatlon":"126.639406,45.774370","sectIdx":0,"turntype":6,"id":4,"turnlink":"686655,0,102299431"},{"swlink":"686655,1,49204296","niIds":"3030305,0,13;14274369,1,30;49204297,1,29;49204296,1,69;","distance":141,"tmc":[{"route":"126.639406,45.774370;126.639336,45.774260","level":1},{"route":"126.639336,45.774260;126.639227,45.774130;126.639086,45.774031","level":2},{"route":"126.639086,45.774031;126.638734,45.773911","level":2},{"route":"126.638734,45.773911;126.637906,45.773672","level":2}],"turncode":5,"strguide":"直行进入南马路","routelonlat":"126.639406,45.774370;126.639336,45.774260;126.639227,45.774130;126.639086,45.774031;126.638734,45.773911;126.637906,45.773672","streetName":"南马路","turnlatlon":"126.637906,45.773672","sectIdx":0,"turntype":6,"id":5,"turnlink":"686655,1,49204296"},{"swlink":"686655,1,3030322","niIds":"3030322,1,109;","distance":109,"tmc":[{"route":"126.637906,45.773672;126.636570,45.773323","level":2}],"turncode":5,"strguide":"直行进入南马路","routelonlat":"126.637906,45.773672;126.636570,45.773323","streetName":"南马路","turnlatlon":"126.636570,45.773323","sectIdx":0,"turntype":6,"id":6,"turnlink":"686655,1,3030322"},{"swlink":"686655,1,68171917","niIds":"68171918,1,57;68171917,1,39;","distance":96,"tmc":[{"route":"126.636570,45.773323;126.635875,45.773146","level":2},{"route":"126.635875,45.773146;126.635398,45.773016","level":2}],"turncode":5,"strguide":"直行进入南马路","routelonlat":"126.636570,45.773323;126.635875,45.773146;126.635398,45.773016","streetName":"南马路","turnlatlon":"126.635398,45.773016","sectIdx":0,"turntype":6,"id":7,"turnlink":"686655,1,68171917"},{"swlink":"686655,1,19483419","niIds":"3031655,1,13;3031660,1,70;3040938,1,18;68171868,1,67;68171867,1,13;81695573,1,3;81695572,1,48;81695566,1,61;81695565,1,27;19483419,1,62;","distance":382,"tmc":[{"route":"126.635398,45.773016;126.635227,45.772969","level":2},{"route":"126.635227,45.772969;126.634375,45.772750","level":1},{"route":"126.634375,45.772750;126.634141,45.772688","level":1},{"route":"126.634141,45.772688;126.633320,45.772479","level":1},{"route":"126.633320,45.772479;126.633141,45.772427","level":1},{"route":"126.633141,45.772427;126.633094,45.772422","level":1},{"route":"126.633094,45.772422;126.632500,45.772271","level":1},{"route":"126.632500,45.772271;126.631750,45.772083","level":1},{"route":"126.631750,45.772083;126.631414,45.772000","level":1},{"route":"126.631414,45.772000;126.630648,45.771802","level":1}],"turncode":8,"strguide":"左转进入开原街","routelonlat":"126.635398,45.773016;126.635227,45.772969;126.634375,45.772750;126.634141,45.772688;126.633320,45.772479;126.633141,45.772427;126.633094,45.772422;126.632500,45.772271;126.631750,45.772083;126.631414,45.772000;126.630648,45.771802","streetName":"开原街","turnlatlon":"126.630648,45.771802","sectIdx":0,"turntype":6,"id":8,"turnlink":"686655,1,19483419"},{"swlink":"686655,0,68171848","niIds":"3043651,1,10;84875252,0,18;68171847,0,21;68171848,0,26;","distance":75,"tmc":[{"route":"126.630648,45.771802;126.630633,45.771703","level":1},{"route":"126.630633,45.771703;126.630711,45.771542","level":1},{"route":"126.630711,45.771542;126.630805,45.771359","level":1},{"route":"126.630805,45.771359;126.630922,45.771130","level":1}],"turncode":5,"strguide":"直行进入开原街","routelonlat":"126.630648,45.771802;126.630633,45.771703;126.630711,45.771542;126.630805,45.771359;126.630922,45.771130","streetName":"开原街","turnlatlon":"126.630922,45.771130","sectIdx":0,"turntype":6,"id":9,"turnlink":"686655,0,68171848"},{"swlink":"686655,0,85296329","niIds":"85296328,0,72;85296329,0,14;","distance":86,"tmc":[{"route":"126.630922,45.771130;126.631242,45.770510","level":1},{"route":"126.631242,45.770510;126.631312,45.770380","level":1}],"turncode":9,"strguide":"右转进入南极三道街","routelonlat":"126.630922,45.771130;126.631242,45.770510;126.631312,45.770380","streetName":"南极三道街","turnlatlon":"126.631312,45.770380","sectIdx":0,"turntype":6,"id":10,"turnlink":"686655,0,85296329"},{"swlink":"686655,0,3087566","niIds":"81695558,0,45;81695559,0,106;3087569,0,67;3087566,0,23;","distance":241,"tmc":[{"route":"126.631312,45.770380;126.630758,45.770240","level":1},{"route":"126.630758,45.770240;126.629469,45.769911","level":1},{"route":"126.629469,45.769911;126.628656,45.769703","level":0},{"route":"126.628656,45.769703;126.628369,45.769633","level":0}],"turncode":5,"strguide":"直行进入","routelonlat":"126.631312,45.770380;126.630758,45.770240;126.629469,45.769911;126.628656,45.769703;126.628369,45.769633","streetName":"","turnlatlon":"126.628369,45.769633","sectIdx":0,"turntype":6,"id":11,"turnlink":"686655,0,3087566"}],"niIds":"38182103,1,9;38182120,0,62;3044191,0,10;102299406,0,51;102299407,0,58;38182068,1,20;38182067,1,31;38182066,1,4;38182065,1,30;102299390,1,47;3078873,1,7;38182018,0,8;38182020,0,34;38182022,0,33;38182023,0,46;102299431,0,42;3030305,0,13;14274369,1,30;49204297,1,29;49204296,1,69;3030322,1,109;68171918,1,57;68171917,1,39;3031655,1,13;3031660,1,70;3040938,1,18;68171868,1,67;68171867,1,13;81695573,1,3;81695572,1,48;81695566,1,61;81695565,1,27;19483419,1,62;3043651,1,10;84875252,0,18;68171847,0,21;68171848,0,26;85296328,0,72;85296329,0,14;81695558,0,45;81695559,0,106;3087569,0,67;3087566,0,23;","distance":1622,"routelatlon":"126.643774,45.775303,0,0;126.643859,45.775365,0,0;126.643859,45.775365,0,0;126.643187,45.775677,0,0;126.643187,45.775677,0,0;126.643078,45.775734,0,0;126.643078,45.775734,1,0;126.642563,45.775437,1,0;126.642563,45.775437,1,0;126.642031,45.775057,1,0;126.642031,45.775057,0,0;126.641797,45.775146,0,0;126.641797,45.775146,0,0;126.641445,45.775297,0,0;126.641445,45.775297,0,0;126.641391,45.775318,0,0;126.641391,45.775318,0,0;126.641055,45.775458,0,0;126.641055,45.775458,0,0;126.640523,45.775672,0,0;126.640523,45.775672,0,0;126.640422,45.775698,0,0;126.640422,45.775698,1,0;126.640367,45.775620,1,0;126.640367,45.775620,1,0;126.640156,45.775349,1,0;126.640156,45.775349,1,0;126.639953,45.775078,1,0;126.639953,45.775078,1,0;126.639664,45.774703,1,0;126.639664,45.774703,1,0;126.639406,45.774370,1,0;126.639406,45.774370,1,0;126.639336,45.774260,1,0;126.639336,45.774260,2,0;126.639227,45.774130,2,0;126.639086,45.774031,2,0;126.639086,45.774031,2,0;126.638734,45.773911,2,0;126.638734,45.773911,2,0;126.637906,45.773672,2,0;126.637906,45.773672,2,0;126.636570,45.773323,2,0;126.636570,45.773323,2,0;126.635875,45.773146,2,0;126.635875,45.773146,2,0;126.635398,45.773016,2,0;126.635398,45.773016,2,0;126.635227,45.772969,2,0;126.635227,45.772969,1,0;126.634375,45.772750,1,0;126.634375,45.772750,1,0;126.634141,45.772688,1,0;126.634141,45.772688,1,0;126.633320,45.772479,1,0;126.633320,45.772479,1,0;126.633141,45.772427,1,0;126.633141,45.772427,1,0;126.633094,45.772422,1,0;126.633094,45.772422,1,0;126.632500,45.772271,1,0;126.632500,45.772271,1,0;126.631750,45.772083,1,0;126.631750,45.772083,1,0;126.631414,45.772000,1,0;126.631414,45.772000,1,0;126.630648,45.771802,1,0;126.630648,45.771802,1,0;126.630633,45.771703,1,0;126.630633,45.771703,1,0;126.630711,45.771542,1,0;126.630711,45.771542,1,0;126.630805,45.771359,1,0;126.630805,45.771359,1,0;126.630922,45.771130,1,0;126.630922,45.771130,1,0;126.631242,45.770510,1,0;126.631242,45.770510,1,0;126.631312,45.770380,1,0;126.631312,45.770380,1,0;126.630758,45.770240,1,0;126.630758,45.770240,1,0;126.629469,45.769911,1,0;126.629469,45.769911,0,0;126.628656,45.769703,0,0;126.628656,45.769703,0,0;126.628369,45.769633,0,0"}]},"errcode":0,"errmsg":"","result":{"rows":[{"duration":395,"item":[{"swlink":"686655,1,38182103","niIds":"38182103,1,9;","distance":9,"tmc":[{"route":"126.643774,45.775303;126.643859,45.775365","level":0}],"turncode":8,"strguide":"左转进入德胜街","routelonlat":"126.643774,45.775303;126.643859,45.775365","streetName":"德胜街","turnlatlon":"126.643859,45.775365","sectIdx":0,"turntype":6,"id":0,"turnlink":"686655,1,38182103"},{"swlink":"686655,0,38182120","niIds":"38182120,0,62;","distance":62,"tmc":[{"route":"126.643859,45.775365;126.643187,45.775677","level":0}],"turncode":8,"strguide":"左转进入太原街","routelonlat":"126.643859,45.775365;126.643187,45.775677","streetName":"太原街","turnlatlon":"126.643187,45.775677","sectIdx":0,"turntype":6,"id":1,"turnlink":"686655,0,38182120"},{"swlink":"686655,0,102299407","niIds":"3044191,0,10;102299406,0,51;102299407,0,58;","distance":119,"tmc":[{"route":"126.643187,45.775677;126.643078,45.775734","level":0},{"route":"126.643078,45.775734;126.642563,45.775437","level":1},{"route":"126.642563,45.775437;126.642031,45.775057","level":1}],"turncode":9,"strguide":"右转进入大水晶街","routelonlat":"126.643187,45.775677;126.643078,45.775734;126.642563,45.775437;126.642031,45.775057","streetName":"大水晶街","turnlatlon":"126.642031,45.775057","sectIdx":0,"turntype":6,"id":2,"turnlink":"686655,0,102299407"},{"swlink":"686655,1,102299390","niIds":"38182068,1,20;38182067,1,31;38182066,1,4;38182065,1,30;102299390,1,47;","distance":132,"tmc":[{"route":"126.642031,45.775057;126.641797,45.775146","level":0},{"route":"126.641797,45.775146;126.641445,45.775297","level":0},{"route":"126.641445,45.775297;126.641391,45.775318","level":0},{"route":"126.641391,45.775318;126.641055,45.775458","level":0},{"route":"126.641055,45.775458;126.640523,45.775672","level":0}],"turncode":8,"strguide":"左转进入草市街","routelonlat":"126.642031,45.775057;126.641797,45.775146;126.641445,45.775297;126.641391,45.775318;126.641055,45.775458;126.640523,45.775672","streetName":"草市街","turnlatlon":"126.640523,45.775672","sectIdx":0,"turntype":6,"id":3,"turnlink":"686655,1,102299390"},{"swlink":"686655,0,102299431","niIds":"3078873,1,7;38182018,0,8;38182020,0,34;38182022,0,33;38182023,0,46;102299431,0,42;","distance":170,"tmc":[{"route":"126.640523,45.775672;126.640422,45.775698","level":0},{"route":"126.640422,45.775698;126.640367,45.775620","level":1},{"route":"126.640367,45.775620;126.640156,45.775349","level":1},{"route":"126.640156,45.775349;126.639953,45.775078","level":1},{"route":"126.639953,45.775078;126.639664,45.774703","level":1},{"route":"126.639664,45.774703;126.639406,45.774370","level":1}],"turncode":5,"strguide":"直行进入南马路","routelonlat":"126.640523,45.775672;126.640422,45.775698;126.640367,45.775620;126.640156,45.775349;126.639953,45.775078;126.639664,45.774703;126.639406,45.774370","streetName":"南马路","turnlatlon":"126.639406,45.774370","sectIdx":0,"turntype":6,"id":4,"turnlink":"686655,0,102299431"},{"swlink":"686655,1,49204296","niIds":"3030305,0,13;14274369,1,30;49204297,1,29;49204296,1,69;","distance":141,"tmc":[{"route":"126.639406,45.774370;126.639336,45.774260","level":1},{"route":"126.639336,45.774260;126.639227,45.774130;126.639086,45.774031","level":2},{"route":"126.639086,45.774031;126.638734,45.773911","level":2},{"route":"126.638734,45.773911;126.637906,45.773672","level":2}],"turncode":5,"strguide":"直行进入南马路","routelonlat":"126.639406,45.774370;126.639336,45.774260;126.639227,45.774130;126.639086,45.774031;126.638734,45.773911;126.637906,45.773672","streetName":"南马路","turnlatlon":"126.637906,45.773672","sectIdx":0,"turntype":6,"id":5,"turnlink":"686655,1,49204296"},{"swlink":"686655,1,3030322","niIds":"3030322,1,109;","distance":109,"tmc":[{"route":"126.637906,45.773672;126.636570,45.773323","level":2}],"turncode":5,"strguide":"直行进入南马路","routelonlat":"126.637906,45.773672;126.636570,45.773323","streetName":"南马路","turnlatlon":"126.636570,45.773323","sectIdx":0,"turntype":6,"id":6,"turnlink":"686655,1,3030322"},{"swlink":"686655,1,68171917","niIds":"68171918,1,57;68171917,1,39;","distance":96,"tmc":[{"route":"126.636570,45.773323;126.635875,45.773146","level":2},{"route":"126.635875,45.773146;126.635398,45.773016","level":2}],"turncode":5,"strguide":"直行进入南马路","routelonlat":"126.636570,45.773323;126.635875,45.773146;126.635398,45.773016","streetName":"南马路","turnlatlon":"126.635398,45.773016","sectIdx":0,"turntype":6,"id":7,"turnlink":"686655,1,68171917"},{"swlink":"686655,1,19483419","niIds":"3031655,1,13;3031660,1,70;3040938,1,18;68171868,1,67;68171867,1,13;81695573,1,3;81695572,1,48;81695566,1,61;81695565,1,27;19483419,1,62;","distance":382,"tmc":[{"route":"126.635398,45.773016;126.635227,45.772969","level":2},{"route":"126.635227,45.772969;126.634375,45.772750","level":1},{"route":"126.634375,45.772750;126.634141,45.772688","level":1},{"route":"126.634141,45.772688;126.633320,45.772479","level":1},{"route":"126.633320,45.772479;126.633141,45.772427","level":1},{"route":"126.633141,45.772427;126.633094,45.772422","level":1},{"route":"126.633094,45.772422;126.632500,45.772271","level":1},{"route":"126.632500,45.772271;126.631750,45.772083","level":1},{"route":"126.631750,45.772083;126.631414,45.772000","level":1},{"route":"126.631414,45.772000;126.630648,45.771802","level":1}],"turncode":8,"strguide":"左转进入开原街","routelonlat":"126.635398,45.773016;126.635227,45.772969;126.634375,45.772750;126.634141,45.772688;126.633320,45.772479;126.633141,45.772427;126.633094,45.772422;126.632500,45.772271;126.631750,45.772083;126.631414,45.772000;126.630648,45.771802","streetName":"开原街","turnlatlon":"126.630648,45.771802","sectIdx":0,"turntype":6,"id":8,"turnlink":"686655,1,19483419"},{"swlink":"686655,0,68171848","niIds":"3043651,1,10;84875252,0,18;68171847,0,21;68171848,0,26;","distance":75,"tmc":[{"route":"126.630648,45.771802;126.630633,45.771703","level":1},{"route":"126.630633,45.771703;126.630711,45.771542","level":1},{"route":"126.630711,45.771542;126.630805,45.771359","level":1},{"route":"126.630805,45.771359;126.630922,45.771130","level":1}],"turncode":5,"strguide":"直行进入开原街","routelonlat":"126.630648,45.771802;126.630633,45.771703;126.630711,45.771542;126.630805,45.771359;126.630922,45.771130","streetName":"开原街","turnlatlon":"126.630922,45.771130","sectIdx":0,"turntype":6,"id":9,"turnlink":"686655,0,68171848"},{"swlink":"686655,0,85296329","niIds":"85296328,0,72;85296329,0,14;","distance":86,"tmc":[{"route":"126.630922,45.771130;126.631242,45.770510","level":1},{"route":"126.631242,45.770510;126.631312,45.770380","level":1}],"turncode":9,"strguide":"右转进入南极三道街","routelonlat":"126.630922,45.771130;126.631242,45.770510;126.631312,45.770380","streetName":"南极三道街","turnlatlon":"126.631312,45.770380","sectIdx":0,"turntype":6,"id":10,"turnlink":"686655,0,85296329"},{"swlink":"686655,0,3087566","niIds":"81695558,0,45;81695559,0,106;3087569,0,67;3087566,0,23;","distance":241,"tmc":[{"route":"126.631312,45.770380;126.630758,45.770240","level":1},{"route":"126.630758,45.770240;126.629469,45.769911","level":1},{"route":"126.629469,45.769911;126.628656,45.769703","level":0},{"route":"126.628656,45.769703;126.628369,45.769633","level":0}],"turncode":5,"strguide":"直行进入","routelonlat":"126.631312,45.770380;126.630758,45.770240;126.629469,45.769911;126.628656,45.769703;126.628369,45.769633","streetName":"","turnlatlon":"126.628369,45.769633","sectIdx":0,"turntype":6,"id":11,"turnlink":"686655,0,3087566"}],"niIds":"38182103,1,9;38182120,0,62;3044191,0,10;102299406,0,51;102299407,0,58;38182068,1,20;38182067,1,31;38182066,1,4;38182065,1,30;102299390,1,47;3078873,1,7;38182018,0,8;38182020,0,34;38182022,0,33;38182023,0,46;102299431,0,42;3030305,0,13;14274369,1,30;49204297,1,29;49204296,1,69;3030322,1,109;68171918,1,57;68171917,1,39;3031655,1,13;3031660,1,70;3040938,1,18;68171868,1,67;68171867,1,13;81695573,1,3;81695572,1,48;81695566,1,61;81695565,1,27;19483419,1,62;3043651,1,10;84875252,0,18;68171847,0,21;68171848,0,26;85296328,0,72;85296329,0,14;81695558,0,45;81695559,0,106;3087569,0,67;3087566,0,23;","distance":1622,"routelatlon":"126.643774,45.775303,0,0;126.643859,45.775365,0,0;126.643859,45.775365,0,0;126.643187,45.775677,0,0;126.643187,45.775677,0,0;126.643078,45.775734,0,0;126.643078,45.775734,1,0;126.642563,45.775437,1,0;126.642563,45.775437,1,0;126.642031,45.775057,1,0;126.642031,45.775057,0,0;126.641797,45.775146,0,0;126.641797,45.775146,0,0;126.641445,45.775297,0,0;126.641445,45.775297,0,0;126.641391,45.775318,0,0;126.641391,45.775318,0,0;126.641055,45.775458,0,0;126.641055,45.775458,0,0;126.640523,45.775672,0,0;126.640523,45.775672,0,0;126.640422,45.775698,0,0;126.640422,45.775698,1,0;126.640367,45.775620,1,0;126.640367,45.775620,1,0;126.640156,45.775349,1,0;126.640156,45.775349,1,0;126.639953,45.775078,1,0;126.639953,45.775078,1,0;126.639664,45.774703,1,0;126.639664,45.774703,1,0;126.639406,45.774370,1,0;126.639406,45.774370,1,0;126.639336,45.774260,1,0;126.639336,45.774260,2,0;126.639227,45.774130,2,0;126.639086,45.774031,2,0;126.639086,45.774031,2,0;126.638734,45.773911,2,0;126.638734,45.773911,2,0;126.637906,45.773672,2,0;126.637906,45.773672,2,0;126.636570,45.773323,2,0;126.636570,45.773323,2,0;126.635875,45.773146,2,0;126.635875,45.773146,2,0;126.635398,45.773016,2,0;126.635398,45.773016,2,0;126.635227,45.772969,2,0;126.635227,45.772969,1,0;126.634375,45.772750,1,0;126.634375,45.772750,1,0;126.634141,45.772688,1,0;126.634141,45.772688,1,0;126.633320,45.772479,1,0;126.633320,45.772479,1,0;126.633141,45.772427,1,0;126.633141,45.772427,1,0;126.633094,45.772422,1,0;126.633094,45.772422,1,0;126.632500,45.772271,1,0;126.632500,45.772271,1,0;126.631750,45.772083,1,0;126.631750,45.772083,1,0;126.631414,45.772000,1,0;126.631414,45.772000,1,0;126.630648,45.771802,1,0;126.630648,45.771802,1,0;126.630633,45.771703,1,0;126.630633,45.771703,1,0;126.630711,45.771542,1,0;126.630711,45.771542,1,0;126.630805,45.771359,1,0;126.630805,45.771359,1,0;126.630922,45.771130,1,0;126.630922,45.771130,1,0;126.631242,45.770510,1,0;126.631242,45.770510,1,0;126.631312,45.770380,1,0;126.631312,45.770380,1,0;126.630758,45.770240,1,0;126.630758,45.770240,1,0;126.629469,45.769911,1,0;126.629469,45.769911,0,0;126.628656,45.769703,0,0;126.628656,45.769703,0,0;126.628369,45.769633,0,0"}],"list":[{"duration":395,"item":[{"swlink":"686655,1,38182103","niIds":"38182103,1,9;","distance":9,"tmc":[{"route":"126.643774,45.775303;126.643859,45.775365","level":0}],"turncode":8,"strguide":"左转进入德胜街","routelonlat":"126.643774,45.775303;126.643859,45.775365","streetName":"德胜街","turnlatlon":"126.643859,45.775365","sectIdx":0,"turntype":6,"id":0,"turnlink":"686655,1,38182103"},{"swlink":"686655,0,38182120","niIds":"38182120,0,62;","distance":62,"tmc":[{"route":"126.643859,45.775365;126.643187,45.775677","level":0}],"turncode":8,"strguide":"左转进入太原街","routelonlat":"126.643859,45.775365;126.643187,45.775677","streetName":"太原街","turnlatlon":"126.643187,45.775677","sectIdx":0,"turntype":6,"id":1,"turnlink":"686655,0,38182120"},{"swlink":"686655,0,102299407","niIds":"3044191,0,10;102299406,0,51;102299407,0,58;","distance":119,"tmc":[{"route":"126.643187,45.775677;126.643078,45.775734","level":0},{"route":"126.643078,45.775734;126.642563,45.775437","level":1},{"route":"126.642563,45.775437;126.642031,45.775057","level":1}],"turncode":9,"strguide":"右转进入大水晶街","routelonlat":"126.643187,45.775677;126.643078,45.775734;126.642563,45.775437;126.642031,45.775057","streetName":"大水晶街","turnlatlon":"126.642031,45.775057","sectIdx":0,"turntype":6,"id":2,"turnlink":"686655,0,102299407"},{"swlink":"686655,1,102299390","niIds":"38182068,1,20;38182067,1,31;38182066,1,4;38182065,1,30;102299390,1,47;","distance":132,"tmc":[{"route":"126.642031,45.775057;126.641797,45.775146","level":0},{"route":"126.641797,45.775146;126.641445,45.775297","level":0},{"route":"126.641445,45.775297;126.641391,45.775318","level":0},{"route":"126.641391,45.775318;126.641055,45.775458","level":0},{"route":"126.641055,45.775458;126.640523,45.775672","level":0}],"turncode":8,"strguide":"左转进入草市街","routelonlat":"126.642031,45.775057;126.641797,45.775146;126.641445,45.775297;126.641391,45.775318;126.641055,45.775458;126.640523,45.775672","streetName":"草市街","turnlatlon":"126.640523,45.775672","sectIdx":0,"turntype":6,"id":3,"turnlink":"686655,1,102299390"},{"swlink":"686655,0,102299431","niIds":"3078873,1,7;38182018,0,8;38182020,0,34;38182022,0,33;38182023,0,46;102299431,0,42;","distance":170,"tmc":[{"route":"126.640523,45.775672;126.640422,45.775698","level":0},{"route":"126.640422,45.775698;126.640367,45.775620","level":1},{"route":"126.640367,45.775620;126.640156,45.775349","level":1},{"route":"126.640156,45.775349;126.639953,45.775078","level":1},{"route":"126.639953,45.775078;126.639664,45.774703","level":1},{"route":"126.639664,45.774703;126.639406,45.774370","level":1}],"turncode":5,"strguide":"直行进入南马路","routelonlat":"126.640523,45.775672;126.640422,45.775698;126.640367,45.775620;126.640156,45.775349;126.639953,45.775078;126.639664,45.774703;126.639406,45.774370","streetName":"南马路","turnlatlon":"126.639406,45.774370","sectIdx":0,"turntype":6,"id":4,"turnlink":"686655,0,102299431"},{"swlink":"686655,1,49204296","niIds":"3030305,0,13;14274369,1,30;49204297,1,29;49204296,1,69;","distance":141,"tmc":[{"route":"126.639406,45.774370;126.639336,45.774260","level":1},{"route":"126.639336,45.774260;126.639227,45.774130;126.639086,45.774031","level":2},{"route":"126.639086,45.774031;126.638734,45.773911","level":2},{"route":"126.638734,45.773911;126.637906,45.773672","level":2}],"turncode":5,"strguide":"直行进入南马路","routelonlat":"126.639406,45.774370;126.639336,45.774260;126.639227,45.774130;126.639086,45.774031;126.638734,45.773911;126.637906,45.773672","streetName":"南马路","turnlatlon":"126.637906,45.773672","sectIdx":0,"turntype":6,"id":5,"turnlink":"686655,1,49204296"},{"swlink":"686655,1,3030322","niIds":"3030322,1,109;","distance":109,"tmc":[{"route":"126.637906,45.773672;126.636570,45.773323","level":2}],"turncode":5,"strguide":"直行进入南马路","routelonlat":"126.637906,45.773672;126.636570,45.773323","streetName":"南马路","turnlatlon":"126.636570,45.773323","sectIdx":0,"turntype":6,"id":6,"turnlink":"686655,1,3030322"},{"swlink":"686655,1,68171917","niIds":"68171918,1,57;68171917,1,39;","distance":96,"tmc":[{"route":"126.636570,45.773323;126.635875,45.773146","level":2},{"route":"126.635875,45.773146;126.635398,45.773016","level":2}],"turncode":5,"strguide":"直行进入南马路","routelonlat":"126.636570,45.773323;126.635875,45.773146;126.635398,45.773016","streetName":"南马路","turnlatlon":"126.635398,45.773016","sectIdx":0,"turntype":6,"id":7,"turnlink":"686655,1,68171917"},{"swlink":"686655,1,19483419","niIds":"3031655,1,13;3031660,1,70;3040938,1,18;68171868,1,67;68171867,1,13;81695573,1,3;81695572,1,48;81695566,1,61;81695565,1,27;19483419,1,62;","distance":382,"tmc":[{"route":"126.635398,45.773016;126.635227,45.772969","level":2},{"route":"126.635227,45.772969;126.634375,45.772750","level":1},{"route":"126.634375,45.772750;126.634141,45.772688","level":1},{"route":"126.634141,45.772688;126.633320,45.772479","level":1},{"route":"126.633320,45.772479;126.633141,45.772427","level":1},{"route":"126.633141,45.772427;126.633094,45.772422","level":1},{"route":"126.633094,45.772422;126.632500,45.772271","level":1},{"route":"126.632500,45.772271;126.631750,45.772083","level":1},{"route":"126.631750,45.772083;126.631414,45.772000","level":1},{"route":"126.631414,45.772000;126.630648,45.771802","level":1}],"turncode":8,"strguide":"左转进入开原街","routelonlat":"126.635398,45.773016;126.635227,45.772969;126.634375,45.772750;126.634141,45.772688;126.633320,45.772479;126.633141,45.772427;126.633094,45.772422;126.632500,45.772271;126.631750,45.772083;126.631414,45.772000;126.630648,45.771802","streetName":"开原街","turnlatlon":"126.630648,45.771802","sectIdx":0,"turntype":6,"id":8,"turnlink":"686655,1,19483419"},{"swlink":"686655,0,68171848","niIds":"3043651,1,10;84875252,0,18;68171847,0,21;68171848,0,26;","distance":75,"tmc":[{"route":"126.630648,45.771802;126.630633,45.771703","level":1},{"route":"126.630633,45.771703;126.630711,45.771542","level":1},{"route":"126.630711,45.771542;126.630805,45.771359","level":1},{"route":"126.630805,45.771359;126.630922,45.771130","level":1}],"turncode":5,"strguide":"直行进入开原街","routelonlat":"126.630648,45.771802;126.630633,45.771703;126.630711,45.771542;126.630805,45.771359;126.630922,45.771130","streetName":"开原街","turnlatlon":"126.630922,45.771130","sectIdx":0,"turntype":6,"id":9,"turnlink":"686655,0,68171848"},{"swlink":"686655,0,85296329","niIds":"85296328,0,72;85296329,0,14;","distance":86,"tmc":[{"route":"126.630922,45.771130;126.631242,45.770510","level":1},{"route":"126.631242,45.770510;126.631312,45.770380","level":1}],"turncode":9,"strguide":"右转进入南极三道街","routelonlat":"126.630922,45.771130;126.631242,45.770510;126.631312,45.770380","streetName":"南极三道街","turnlatlon":"126.631312,45.770380","sectIdx":0,"turntype":6,"id":10,"turnlink":"686655,0,85296329"},{"swlink":"686655,0,3087566","niIds":"81695558,0,45;81695559,0,106;3087569,0,67;3087566,0,23;","distance":241,"tmc":[{"route":"126.631312,45.770380;126.630758,45.770240","level":1},{"route":"126.630758,45.770240;126.629469,45.769911","level":1},{"route":"126.629469,45.769911;126.628656,45.769703","level":0},{"route":"126.628656,45.769703;126.628369,45.769633","level":0}],"turncode":5,"strguide":"直行进入","routelonlat":"126.631312,45.770380;126.630758,45.770240;126.629469,45.769911;126.628656,45.769703;126.628369,45.769633","streetName":"","turnlatlon":"126.628369,45.769633","sectIdx":0,"turntype":6,"id":11,"turnlink":"686655,0,3087566"}],"niIds":"38182103,1,9;38182120,0,62;3044191,0,10;102299406,0,51;102299407,0,58;38182068,1,20;38182067,1,31;38182066,1,4;38182065,1,30;102299390,1,47;3078873,1,7;38182018,0,8;38182020,0,34;38182022,0,33;38182023,0,46;102299431,0,42;3030305,0,13;14274369,1,30;49204297,1,29;49204296,1,69;3030322,1,109;68171918,1,57;68171917,1,39;3031655,1,13;3031660,1,70;3040938,1,18;68171868,1,67;68171867,1,13;81695573,1,3;81695572,1,48;81695566,1,61;81695565,1,27;19483419,1,62;3043651,1,10;84875252,0,18;68171847,0,21;68171848,0,26;85296328,0,72;85296329,0,14;81695558,0,45;81695559,0,106;3087569,0,67;3087566,0,23;","distance":1622,"routelatlon":"126.643774,45.775303,0,0;126.643859,45.775365,0,0;126.643859,45.775365,0,0;126.643187,45.775677,0,0;126.643187,45.775677,0,0;126.643078,45.775734,0,0;126.643078,45.775734,1,0;126.642563,45.775437,1,0;126.642563,45.775437,1,0;126.642031,45.775057,1,0;126.642031,45.775057,0,0;126.641797,45.775146,0,0;126.641797,45.775146,0,0;126.641445,45.775297,0,0;126.641445,45.775297,0,0;126.641391,45.775318,0,0;126.641391,45.775318,0,0;126.641055,45.775458,0,0;126.641055,45.775458,0,0;126.640523,45.775672,0,0;126.640523,45.775672,0,0;126.640422,45.775698,0,0;126.640422,45.775698,1,0;126.640367,45.775620,1,0;126.640367,45.775620,1,0;126.640156,45.775349,1,0;126.640156,45.775349,1,0;126.639953,45.775078,1,0;126.639953,45.775078,1,0;126.639664,45.774703,1,0;126.639664,45.774703,1,0;126.639406,45.774370,1,0;126.639406,45.774370,1,0;126.639336,45.774260,1,0;126.639336,45.774260,2,0;126.639227,45.774130,2,0;126.639086,45.774031,2,0;126.639086,45.774031,2,0;126.638734,45.773911,2,0;126.638734,45.773911,2,0;126.637906,45.773672,2,0;126.637906,45.773672,2,0;126.636570,45.773323,2,0;126.636570,45.773323,2,0;126.635875,45.773146,2,0;126.635875,45.773146,2,0;126.635398,45.773016,2,0;126.635398,45.773016,2,0;126.635227,45.772969,2,0;126.635227,45.772969,1,0;126.634375,45.772750,1,0;126.634375,45.772750,1,0;126.634141,45.772688,1,0;126.634141,45.772688,1,0;126.633320,45.772479,1,0;126.633320,45.772479,1,0;126.633141,45.772427,1,0;126.633141,45.772427,1,0;126.633094,45.772422,1,0;126.633094,45.772422,1,0;126.632500,45.772271,1,0;126.632500,45.772271,1,0;126.631750,45.772083,1,0;126.631750,45.772083,1,0;126.631414,45.772000,1,0;126.631414,45.772000,1,0;126.630648,45.771802,1,0;126.630648,45.771802,1,0;126.630633,45.771703,1,0;126.630633,45.771703,1,0;126.630711,45.771542,1,0;126.630711,45.771542,1,0;126.630805,45.771359,1,0;126.630805,45.771359,1,0;126.630922,45.771130,1,0;126.630922,45.771130,1,0;126.631242,45.770510,1,0;126.631242,45.770510,1,0;126.631312,45.770380,1,0;126.631312,45.770380,1,0;126.630758,45.770240,1,0;126.630758,45.770240,1,0;126.629469,45.769911,1,0;126.629469,45.769911,0,0;126.628656,45.769703,0,0;126.628656,45.769703,0,0;126.628369,45.769633,0,0"}]}}],"policeAlarmList":[{"police_alarm_id":"56d9ad287e9448de810b04643403da45","police_alarm_destination_gps":null,"jqbh":"23010020201026174731702011","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处家中被盗！","afdd":"道外区德胜街 28号楼 1单元 301室","bjsj":"2020/10/26 17:47:32","bjdh":"013504555859","lng":"126.64899","xzb":"126.64899","lat":"45.77711","yzb":"45.77711","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"赵毓杰","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1603705859000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100101","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104610000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020102617492938600000001001011","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104610000","cjr":"赵毓杰"},{"cjrdwdm":"230104000000","cjr":"道外2"}],"ay":null,"jjdzt":"04","ajjssj":null,"createuser":null,"createtime":1603705859000,"updateuser":null,"updatetime":1603705859000,"visibale":1,"flag":"900902"},{"police_alarm_id":"c37370a6296040718b20cf6ce39cc881","police_alarm_destination_gps":null,"jqbh":"23010020190921081804000005","afsj":null,"sjfssj":null,"bjnr":"报警人称：此处电瓶车丢失。","afdd":"道外区祥泰花园小区B3栋3单元202室","bjsj":"2019/09/21 08:18:05","bjdh":"15603663559","lng":"126.645217000","xzb":"126.645217000","lat":"45.776745000","yzb":"45.776745000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"钟奇峰","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1569028623000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104510000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002019092108185935500000001001005","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104510000","cjr":"钟奇峰"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1569028623000,"updateuser":null,"updatetime":1569028623000,"visibale":1,"flag":"900902"},{"police_alarm_id":"69428506cdf340389a5764bc0499922b","police_alarm_destination_gps":null,"jqbh":"23010020190921112612000013","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处电瓶被偷","afdd":"道外区南极国际小区 2号写字楼","bjsj":"2019/09/21 11:26:12","bjdh":"13039999158","lng":"126.639577000","xzb":"126.639577000","lat":"45.768977000","yzb":"45.768977000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"孙广平","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1569054905000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002019092111273239200000001001013","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"孙广平"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1569054905000,"updateuser":null,"updatetime":1569054905000,"visibale":1,"flag":"900902"},{"police_alarm_id":"547eb47e566f48399e729cba3fbc1629","police_alarm_destination_gps":null,"jqbh":"23010020190923205840000016","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处家中被盗","afdd":"南极四道街4号3单元4楼内","bjsj":"2019/09/23 20:58:41","bjdh":"15504655963","lng":"126.631380000","xzb":"126.631380000","lat":"45.771173000","yzb":"45.771173000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"白洪涛","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1569253263000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100101","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002019092320592182700000001001016","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"白洪涛"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1569253263000,"updateuser":null,"updatetime":1569253263000,"visibale":1,"flag":"900902"},{"police_alarm_id":"4fe00476475349638559f39b823ff2f3","police_alarm_destination_gps":null,"jqbh":"23010020201030184218878005","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处家中被盗","afdd":"道外区升平街1号楼7单元403室","bjsj":"2020/10/30 18:42:19","bjdh":"15145011541","lng":"126.64157","xzb":"126.64157","lat":"45.78724","yzb":"45.78724","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"道外1","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1604054732000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100101","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104600000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020103018425818800000001002005","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104000000","cjr":"道外1"},{"cjrdwdm":"230104600000","cjr":"关天悦"}],"ay":null,"jjdzt":"04","ajjssj":null,"createuser":null,"createtime":1604054732000,"updateuser":null,"updatetime":1604054732000,"visibale":1,"flag":"900902"},{"police_alarm_id":"df7c59fd2efd47ad9ab0cfa766943c12","police_alarm_destination_gps":null,"jqbh":"23010020190927204942000005","afsj":null,"sjfssj":null,"bjnr":"报警人称：家中被盗了  ","afdd":"道外区  南极街50号3单元301室  ","bjsj":"2019/09/27 20:49:42","bjdh":"013578928822","lng":"126.64847","xzb":"126.64847","lat":"45.77281","yzb":"45.77281","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"白洪涛","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1569598268000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100101","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002019092720502562100000001001005","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"白洪涛"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1569598268000,"updateuser":null,"updatetime":1569598268000,"visibale":1,"flag":"900902"},{"police_alarm_id":"b5a0589585db412d92c45cf45eb92d97","police_alarm_destination_gps":null,"jqbh":"23010020201201090036477013","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处门市被盗。","afdd":"道外区大新街 342号宝宇天邑蓝湾澳卓酒庄内","bjsj":"2020/12/01 09:00:36","bjdh":"15546340567","lng":"126.628477000","xzb":"126.628477000","lat":"45.783020000","yzb":"45.783020000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"关天悦","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1606784606000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100101","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104600000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020120109013517600000001001013","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104600000","cjr":"关天悦"}],"ay":null,"jjdzt":"04","ajjssj":null,"createuser":null,"createtime":1606784606000,"updateuser":null,"updatetime":1606784606000,"visibale":1,"flag":"900902"},{"police_alarm_id":"01b11b58fe2543219e33a3741e96d08a","police_alarm_destination_gps":null,"jqbh":"23010020201201090657677018","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处门市被盗。","afdd":"道外区大新街 342号宝宇天邑蓝湾澳卓酒庄内","bjsj":"2020/12/01 09:06:57","bjdh":null,"lng":"126.628477000","xzb":"126.628477000","lat":"45.783020000","yzb":"45.783020000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"关天悦","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1606784606000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100101","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104600000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020120109013517600000001001013","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104600000","cjr":"关天悦"}],"ay":null,"jjdzt":"04","ajjssj":null,"createuser":null,"createtime":1606784606000,"updateuser":null,"updatetime":1606784606000,"visibale":1,"flag":"900902"},{"police_alarm_id":"3703fb94c92a465d92a4b7f252283185","police_alarm_destination_gps":null,"jqbh":"23010020201207160507596007","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处手包被盗了","afdd":"道外区南马路 46号门前","bjsj":"2020/12/07 16:05:07","bjdh":"13212921575","lng":"126.635778000","xzb":"126.635778000","lat":"45.773023000","yzb":"45.773023000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"孙广平","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1607328420000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100130","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020120716054242300000001001007","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"孙广平"}],"ay":null,"jjdzt":"04","ajjssj":null,"createuser":null,"createtime":1607328420000,"updateuser":null,"updatetime":1607328420000,"visibale":1,"flag":"900902"},{"police_alarm_id":"666776fc74104afcb27228f28cd5da1c","police_alarm_destination_gps":null,"jqbh":"23010020201114223147942017","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处手机被盗。","afdd":"道外区南极街 47-49号饭店内","bjsj":"2020/11/14 22:31:48","bjdh":"018346921247","lng":"126.65161","xzb":"126.65161","lat":"45.77417","yzb":"45.77417","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":null,"jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1605364390000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100120","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104610000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020111422325315900000001001017","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104610000"},{"cjrdwdm":"13"}],"ay":null,"jjdzt":"04","ajjssj":null,"createuser":null,"createtime":1605364390000,"updateuser":null,"updatetime":1605364390000,"visibale":1,"flag":"900902"},{"police_alarm_id":"41467b77c7294eaca238a6510fe736b8","police_alarm_destination_gps":null,"jqbh":"23010020201126075913580004","afsj":null,"sjfssj":null,"bjnr":"报警人称：白色长安吉普 黑AL681P 在此处早上丢失","afdd":"道外区东莱街 97号门前","bjsj":"2020/11/26 07:59:13","bjdh":"13895725911","lng":"126.65097","xzb":"126.65097","lat":"45.77750","yzb":"45.77750","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"汤文骏","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1606348896000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100102","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104510000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020112608010678300000001015004","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230100172000","cjr":"汤文骏"},{"cjrdwdm":"230100172000","cjr":"汤文骏"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230104000000"},{"cjrdwdm":"230104000000"},{"cjrdwdm":"230100171800","cjr":"李唯"},{"cjrdwdm":"230100171800","cjr":"李唯"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230103000000"},{"cjrdwdm":"230103000000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100171600"},{"cjrdwdm":"230100171600"},{"cjrdwdm":"230102000000"},{"cjrdwdm":"230102000000"},{"cjrdwdm":"230100172100"},{"cjrdwdm":"230100172100"},{"cjrdwdm":"230100171700"},{"cjrdwdm":"230100171700"},{"cjrdwdm":"230100172500"},{"cjrdwdm":"230100172500"},{"cjrdwdm":"230106000000"},{"cjrdwdm":"230106000000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100172300","cjr":"韩启龙15245069789"},{"cjrdwdm":"230100172300","cjr":"韩启龙15245069789"},{"cjrdwdm":"230104510000"},{"cjrdwdm":"230104510000"},{"cjrdwdm":"230100172400"},{"cjrdwdm":"230100172400"},{"cjrdwdm":"230100171900"},{"cjrdwdm":"230100171900"},{"cjrdwdm":"230103520000"},{"cjrdwdm":"230103520000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230121000000"},{"cjrdwdm":"230121000000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100172200"},{"cjrdwdm":"230100172200"},{"cjrdwdm":"230109000000"},{"cjrdwdm":"230109000000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230108000000","cjr":"平房1"},{"cjrdwdm":"230108000000","cjr":"平房1"},{"cjrdwdm":"230131030000"},{"cjrdwdm":"230131030000"}],"ay":null,"jjdzt":"05","ajjssj":null,"createuser":null,"createtime":1606348896000,"updateuser":null,"updatetime":1606348896000,"visibale":1,"flag":"900902"},{"police_alarm_id":"50b2e42f5d1949a4871d6b82eee0f309","police_alarm_destination_gps":null,"jqbh":"23010020191018202846000009","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处手机被抢","afdd":"道外区南极市场 213公交车车站","bjsj":"2019/10/18 20:28:47","bjdh":"13936618589","lng":"126.64848","xzb":"126.64848","lat":"45.77281","yzb":"45.77281","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"康毅","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1571407868000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100120","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002019101820294245800000001001009","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"康毅"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1571407868000,"updateuser":null,"updatetime":1571407868000,"visibale":1,"flag":"900902"},{"police_alarm_id":"136d3ceb807b44bf8cf221343a7599a4","police_alarm_destination_gps":null,"jqbh":"23010020191019152620000001","afsj":null,"sjfssj":null,"bjnr":"报警人称：家里被盗，首饰和现金被偷","afdd":"道外区大水晶街 110号 701室内","bjsj":"2019/10/19 15:26:21","bjdh":"15246783252","lng":"126.64480","xzb":"126.64480","lat":"45.77762","yzb":"45.77762","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"赵宇","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1571475190000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100101","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104510000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002019101915274835600000001001001","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104510000","cjr":"赵宇"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1571475190000,"updateuser":null,"updatetime":1571475190000,"visibale":1,"flag":"900902"},{"police_alarm_id":"b0a12a0da8194643a59b5699c533800b","police_alarm_destination_gps":null,"jqbh":"23010020201121124322043005","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处手机被偷","afdd":"道外区南头道街 64号门前","bjsj":"2020/11/21 12:43:22","bjdh":"015210559997","lng":"126.63926","xzb":"126.63926","lat":"45.78276","yzb":"45.78276","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":null,"jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1605933902000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100120","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104590000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020112112444376500000001001005","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104590000"},{"cjrdwdm":"13"}],"ay":null,"jjdzt":"04","ajjssj":null,"createuser":null,"createtime":1605933902000,"updateuser":null,"updatetime":1605933902000,"visibale":1,"flag":"900902"},{"police_alarm_id":"66f17f10b9aa4c47a016fe3aaf8020d9","police_alarm_destination_gps":null,"jqbh":"23010020201125151144187005","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处手机被偷","afdd":"道外区南头道街 77号门前","bjsj":"2020/11/25 15:11:44","bjdh":"18545104444","lng":"126.636977000","xzb":"126.636977000","lat":"45.777824000","yzb":"45.777824000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":null,"jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1606288399000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100120","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104590000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020112515124136600000001001005","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104590000"},{"cjrdwdm":"13"}],"ay":null,"jjdzt":"04","ajjssj":null,"createuser":null,"createtime":1606288399000,"updateuser":null,"updatetime":1606288399000,"visibale":1,"flag":"900902"},{"police_alarm_id":"11174220532d4ed196b1f6312a51cf81","police_alarm_destination_gps":null,"jqbh":"23010020191023081111000005","afsj":null,"sjfssj":null,"bjnr":"报警人称：此处电动车电瓶被盗。","afdd":"道外区小水晶街 32号5单元门前","bjsj":"2019/10/23 08:11:11","bjdh":"13945145138","lng":"126.64014","xzb":"126.64014","lat":"45.77810","yzb":"45.77810","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"由金国","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1571791159000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104510000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002019102308114201600000001001005","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104510000","cjr":"由金国"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1571791159000,"updateuser":null,"updatetime":1571791159000,"visibale":1,"flag":"900902"},{"police_alarm_id":"82de6d6e03424fb1b692e0b085828770","police_alarm_destination_gps":null,"jqbh":"23010020191024174939000016","afsj":null,"sjfssj":null,"bjnr":"报警人称：在上述地址，家中被盗。","afdd":"道外区台胞小区2号楼2单元404室","bjsj":"2019/10/24 17:49:39","bjdh":"18545110737","lng":"126.645747000","xzb":"126.645747000","lat":"45.786487000","yzb":"45.786487000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"李 论","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1571918473000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100101","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104550000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002019102417503780700000001001016","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104550000","cjr":"李 论"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1571918473000,"updateuser":null,"updatetime":1571918473000,"visibale":1,"flag":"900902"},{"police_alarm_id":"57d98e0305084d65bbe4ef8cd1a67326","police_alarm_destination_gps":null,"jqbh":"23010020191226100038000013","afsj":null,"sjfssj":null,"bjnr":"报警人称：在上述地址，家中被盗。","afdd":"道外区保障街 102号 202室","bjsj":"2019/12/26 10:00:38","bjdh":"13945031423","lng":"126.65461","xzb":"126.65461","lat":"45.77660","yzb":"45.77660","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"魏继辉","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1577347873000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100199","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104610000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002019122610010648200000001001013","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104610000","cjr":"魏继辉"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1577347873000,"updateuser":null,"updatetime":1577347873000,"visibale":1,"flag":"900902"},{"police_alarm_id":"03e0a23cb0de494e97a2cd9de4a8a024","police_alarm_destination_gps":null,"jqbh":"23010020191104080902000005","afsj":null,"sjfssj":null,"bjnr":"报警人称：此处车内物品被盗。","afdd":"道外区大水晶街 76号楼门前","bjsj":"2019/11/04 08:09:02","bjdh":"18246053322","lng":"126.65103","xzb":"126.65103","lat":"45.77750","yzb":"45.77750","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"黄宇辉","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1572831538000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104610000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002019110408093504100000001001005","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104610000","cjr":"黄宇辉"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1572831538000,"updateuser":null,"updatetime":1572831538000,"visibale":1,"flag":"900902"},{"police_alarm_id":"47f7f5e1d7b94f17bbac609480a296ce","police_alarm_destination_gps":null,"jqbh":"23010020191207065520000014","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处手机丢了。","afdd":"道外区南极三道街 4号源源网络会馆内","bjsj":"2019/12/07 06:55:20","bjdh":"018234926370","lng":"126.63843","xzb":"126.63843","lat":"45.77281","yzb":"45.77281","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"孙广平","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1575677352000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002019120706570718200000001001014","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"孙广平"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1575677352000,"updateuser":null,"updatetime":1575677352000,"visibale":1,"flag":"900902"},{"police_alarm_id":"7ae068366efd48d8b908d12a78d9ed15","police_alarm_destination_gps":null,"jqbh":"23010020191210075154000009","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处手机被偷","afdd":"道外区阳光路 2号水利汇洗浴内","bjsj":"2019/12/10 07:51:54","bjdh":"15663771938","lng":"126.645210000","xzb":"126.645210000","lat":"45.776787000","yzb":"45.776787000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"李富纯","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1575942792000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100199","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104610000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002019121007523653200000001001009","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104610000","cjr":"李富纯"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1575942792000,"updateuser":null,"updatetime":1575942792000,"visibale":1,"flag":"900902"},{"police_alarm_id":"459e7334c2e747b0845382d1e758e1f9","police_alarm_destination_gps":null,"jqbh":"23010020191221111427000016","afsj":null,"sjfssj":null,"bjnr":"报警人称：钱与手机被盗","afdd":"香坊区承德街与南极街交口转盘道","bjsj":"2019/12/21 11:14:39","bjdh":"18745714502","lng":"126.65162","xzb":"126.65162","lat":"45.77418","yzb":"45.77418","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"康毅","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1576899195000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100108","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002019122111152159300000001001016","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"康毅"},{"cjrdwdm":"230104610000","cjr":"黄宇辉"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1576899195000,"updateuser":null,"updatetime":1576899195000,"visibale":1,"flag":"900902"},{"police_alarm_id":"c3d2400741f8409aa8225b4ae50b7c46","police_alarm_destination_gps":null,"jqbh":"23010020191226081036000014","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处抓到一个小偷","afdd":"道外区太古商城门前","bjsj":"2019/12/26 08:10:37","bjdh":"13796079471","lng":"126.64684","xzb":"126.64684","lat":"45.78075","yzb":"45.78075","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"王川","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1577365862000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100120","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104590000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002019122608111474900000001001014","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104590000","cjr":"王川"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1577365862000,"updateuser":null,"updatetime":1577365862000,"visibale":1,"flag":"900902"},{"police_alarm_id":"9591154c492448e7a19f0a82112e37b5","police_alarm_destination_gps":null,"jqbh":"23010020191226080320000007","afsj":null,"sjfssj":null,"bjnr":"报警人称：在上述地址抓住小偷了","afdd":"道外区太古街 533号门前","bjsj":"2019/12/26 08:03:20","bjdh":"18745077757","lng":"126.64684","xzb":"126.64684","lat":"45.78075","yzb":"45.78075","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"王川","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1577406899000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100120","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104590000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002019122608041521900000001001007","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104590000","cjr":"王川"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1577406899000,"updateuser":null,"updatetime":1577406899000,"visibale":1,"flag":"900902"},{"police_alarm_id":"d58993369bef4764b91b768e17852418","police_alarm_destination_gps":null,"jqbh":"23010020200104144527000014","afsj":null,"sjfssj":null,"bjnr":"报警人称：此地手机被偷了","afdd":"道外区靖宇头道街 408号   哈药古玩城内","bjsj":"2020/01/04 14:45:28","bjdh":"013910668207","lng":"126.63932","xzb":"126.63932","lat":"45.78280","yzb":"45.78280","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"丁丁","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1578137337000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104590000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020010414471671800000001001014","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104590000","cjr":"丁丁"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1578137337000,"updateuser":null,"updatetime":1578137337000,"visibale":1,"flag":"900902"},{"police_alarm_id":"ce50678035bb455095957dfa3ce44758","police_alarm_destination_gps":null,"jqbh":"23010020191226075930000014","afsj":null,"sjfssj":null,"bjnr":"报警人称：抓到一个小偷 ","afdd":"道外区太古街 太古商城门前","bjsj":"2019/12/26 07:59:31","bjdh":"15204511144","lng":"126.64365","xzb":"126.64365","lat":"45.77967","yzb":"45.77967","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"王川","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1577406899000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100120","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104590000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002019122608002650000000001001014","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104590000","cjr":"王川"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1577406899000,"updateuser":null,"updatetime":1577406899000,"visibale":1,"flag":"900902"},{"police_alarm_id":"21130a41295240fd9e88757d16b2f632","police_alarm_destination_gps":null,"jqbh":"23010020191230092541000003","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处钱包被抢走","afdd":"道外区南极市场内5楼","bjsj":"2019/12/30 09:25:42","bjdh":"13149614999","lng":"126.641979000","xzb":"126.641979000","lat":"45.770082000","yzb":"45.770082000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"孙广平","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1577676699000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100200","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002019123009282115700000001001003","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"孙广平"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1577676699000,"updateuser":null,"updatetime":1577676699000,"visibale":1,"flag":"900902"},{"police_alarm_id":"f1eebc63fd494584987740f4f77fd94c","police_alarm_destination_gps":null,"jqbh":"23010020200122113225000002","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处手机被偷 ","afdd":"道外区阳光路 2号水利汇洗浴","bjsj":"2020/01/22 11:32:25","bjdh":"015245538047","lng":"126.65013","xzb":"126.65013","lat":"45.77779","yzb":"45.77779","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"吴迪","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1579664134000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104610000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020012211330358400000001001002","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104610000","cjr":"吴迪"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1579664134000,"updateuser":null,"updatetime":1579664134000,"visibale":1,"flag":"900902"},{"police_alarm_id":"b367081b3a9b4b41a431b01142f8970c","police_alarm_destination_gps":null,"jqbh":"23010020200116124543000003","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处手机被偷","afdd":"道外区承德街 60号门前","bjsj":"2020/01/16 12:45:43","bjdh":"015822480440","lng":"126.65162","xzb":"126.65162","lat":"45.77418","yzb":"45.77418","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":null,"jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1579150016000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100120","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020011612463836600000001001003","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1579150016000,"updateuser":null,"updatetime":1579150016000,"visibale":1,"flag":"900902"},{"police_alarm_id":"8af7ac6fe5d34b7c8ee6c0a7e174ffd0","police_alarm_destination_gps":null,"jqbh":"23010020200116152853000006","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处好几家商铺被盗","afdd":"道外区南极调料城1楼1028店铺","bjsj":"2020/01/16 15:28:53","bjdh":"13674639177","lng":"126.64371","xzb":"126.64371","lat":"45.77524","yzb":"45.77524","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"贾佩衡","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1579159977000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020011615295002900000001001006","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"贾佩衡"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1579159977000,"updateuser":null,"updatetime":1579159977000,"visibale":1,"flag":"900902"},{"police_alarm_id":"0512232b94f842919cd8117e6e2d5420","police_alarm_destination_gps":null,"jqbh":"23010020200120064722000009","afsj":null,"sjfssj":null,"bjnr":"报警人称：环卫工人的电动三轮车在此处被偷","afdd":"道外区南极街与承德街 交口","bjsj":"2020/01/20 06:47:23","bjdh":"13804524758","lng":"126.65165","xzb":"126.65165","lat":"45.77414","yzb":"45.77414","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"孙广平","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1579474261000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100105","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020012006491604700000001001009","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"孙广平"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1579474261000,"updateuser":null,"updatetime":1579474261000,"visibale":1,"flag":"900902"},{"police_alarm_id":"2317933cbbcb434b99be6f64b0bc9c22","police_alarm_destination_gps":null,"jqbh":"23010020200118105721000014","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处快递和电瓶被偷了。","afdd":"道外区南极街 54号门前","bjsj":"2020/01/18 10:57:21","bjdh":"18503688268","lng":"126.641720000","xzb":"126.641720000","lat":"45.770820000","yzb":"45.770820000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"王宇","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1579316476000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100108","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020011810592993000000001001014","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"王宇"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1579316476000,"updateuser":null,"updatetime":1579316476000,"visibale":1,"flag":"900902"},{"police_alarm_id":"7e7b8c4f21004e57abbdbd40ceab412f","police_alarm_destination_gps":null,"jqbh":"23010020200118134736000017","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处现金被偷。","afdd":"道外区南极市场门前","bjsj":"2020/01/18 13:47:37","bjdh":"18346112049","lng":"126.64847","xzb":"126.64847","lat":"45.77277","yzb":"45.77277","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":null,"jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1579326544000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100120","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020011813482909600000001001017","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1579326544000,"updateuser":null,"updatetime":1579326544000,"visibale":1,"flag":"900902"},{"police_alarm_id":"1d18ac24a0f64f61834650dd84cbd739","police_alarm_destination_gps":null,"jqbh":"23010020200120214625000010","afsj":null,"sjfssj":null,"bjnr":"报警人称：此地家中被盗，","afdd":"道外区宝宇天邑澜湾5号楼1单元2301室","bjsj":"2020/01/20 21:46:25","bjdh":"13845076712","lng":"126.63412","xzb":"126.63412","lat":"45.78295","yzb":"45.78295","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"关天悦","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1579528136000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100101","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104600000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020012021472299800000001001010","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104600000","cjr":"关天悦"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1579528136000,"updateuser":null,"updatetime":1579528136000,"visibale":1,"flag":"900902"},{"police_alarm_id":"f2cacbbe7f2b42b2b11610b7b47d9884","police_alarm_destination_gps":null,"jqbh":"23010020200129100340000009","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处摩托车被偷","afdd":"道外区景阳街 106-1号院内","bjsj":"2020/01/29 10:03:40","bjdh":"13704507006","lng":"126.64377","xzb":"126.64377","lat":"45.77530","yzb":"45.77530","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":null,"jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1580263494000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100103","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020012910044427500000001001009","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1580263494000,"updateuser":null,"updatetime":1580263494000,"visibale":1,"flag":"900902"},{"police_alarm_id":"c131f220e2414090ae8db48ac4e76e42","police_alarm_destination_gps":null,"jqbh":"23010020200122145021000009","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处手机被偷","afdd":"道外区南极名优城门前","bjsj":"2020/01/22 14:50:22","bjdh":"13694654010","lng":"126.64525","xzb":"126.64525","lat":"45.77260","yzb":"45.77260","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"康毅","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1579676004000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100120","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020012214504903500000001001009","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"康毅"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1579676004000,"updateuser":null,"updatetime":1579676004000,"visibale":1,"flag":"900902"},{"police_alarm_id":"e174695826bd49e29b95f7b08af19880","police_alarm_destination_gps":null,"jqbh":"23010020200121141241000002","afsj":null,"sjfssj":null,"bjnr":"报警人称：钱包在此处被偷","afdd":"道外区南极市场2楼","bjsj":"2020/01/21 14:12:41","bjdh":"15663613187","lng":"126.641610000","xzb":"126.641610000","lat":"45.771040000","yzb":"45.771040000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"贾佩衡","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1579587303000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100120","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020012114133852500000001001002","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"贾佩衡"},{"cjrdwdm":"230104520000","cjr":"贾佩衡"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1579587303000,"updateuser":null,"updatetime":1579587303000,"visibale":1,"flag":"900902"},{"police_alarm_id":"fe51e53ff484423791e2f53ff36452ef","police_alarm_destination_gps":null,"jqbh":"23010020200121114001000003","afsj":null,"sjfssj":null,"bjnr":"报警人称：车在此处被砸，车内没有发现丢东西","afdd":"道外区新闻电影院门前","bjsj":"2020/01/21 11:40:02","bjdh":"13936690548","lng":"126.63931","xzb":"126.63931","lat":"45.78276","yzb":"45.78276","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"于叶伟","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1579578183000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100199","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104600000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020012111410625900000001001003","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104600000","cjr":"于叶伟"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1579578183000,"updateuser":null,"updatetime":1579578183000,"visibale":1,"flag":"900902"},{"police_alarm_id":"468d51387e594daf8b1815b9217da89a","police_alarm_destination_gps":null,"jqbh":"23010020200122010022000009","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处手机被盗。","afdd":"道外区南五道街 副58号 烧烤店内","bjsj":"2020/01/22 01:00:22","bjdh":"13654561641","lng":"126.64648","xzb":"126.64648","lat":"45.77951","yzb":"45.77951","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"胡田野","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1579626297000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104510000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020012201014036900000001001009","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104510000","cjr":"胡田野"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1579626297000,"updateuser":null,"updatetime":1579626297000,"visibale":1,"flag":"900902"},{"police_alarm_id":"aa61af8bbe414804b2b708909f0693be","police_alarm_destination_gps":null,"jqbh":"23010020200124082016000005","afsj":null,"sjfssj":null,"bjnr":"报警人称：此处手机被偷。","afdd":"道外区南极三道街中财雅典城小区附近早市","bjsj":"2020/01/24 08:20:16","bjdh":"13936425211","lng":"126.63649","xzb":"126.63649","lat":"45.76945","yzb":"45.76945","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"孙广平","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1579825393000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100120","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020012408215283600000001001005","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"孙广平"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1579825393000,"updateuser":null,"updatetime":1579825393000,"visibale":1,"flag":"900902"},{"police_alarm_id":"9a5c331279c749e3b67eb49ce0f89f67","police_alarm_destination_gps":null,"jqbh":"23010020200416073746941013","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处手机被偷。","afdd":"道外区开元三道街早市附近","bjsj":"2020/04/16 07:37:47","bjdh":"13115451923","lng":"126.628427000","xzb":"126.628427000","lat":"45.769400000","yzb":"45.769400000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"孙广平","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1586996479000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100120","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020041607390978600000001001013","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"孙广平"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1586996479000,"updateuser":null,"updatetime":1586996479000,"visibale":1,"flag":"900902"},{"police_alarm_id":"70f93af987434dff98555960b9b5a3bc","police_alarm_destination_gps":null,"jqbh":"23010020200210103945000011","afsj":null,"sjfssj":null,"bjnr":"报警人称：在上述地址卷帘门被人撬了","afdd":"道外区八区四巷 副13-15号门市","bjsj":"2020/02/10 10:39:45","bjdh":"13804600353","lng":"126.63845","xzb":"126.63845","lat":"45.77276","yzb":"45.77276","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"白洪涛","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1581305956000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100117","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020021010421361300000001001011","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"白洪涛"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1581305956000,"updateuser":null,"updatetime":1581305956000,"visibale":1,"flag":"900902"},{"police_alarm_id":"b7a80eeb27d54bd9b81e9c805375d6b5","police_alarm_destination_gps":null,"jqbh":"23010020200409170613863014","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处自行车被偷","afdd":"道外区大水晶街 76-1号2单元门前处","bjsj":"2020/04/09 17:06:13","bjdh":"13604816721","lng":"126.64877","xzb":"126.64877","lat":"45.77603","yzb":"45.77603","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":null,"jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1586423235000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104610000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020040917071378800000001001014","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104610000"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1586423235000,"updateuser":null,"updatetime":1586423235000,"visibale":1,"flag":"900902"},{"police_alarm_id":"3468cc64f9f14013b1d77fad883dff3d","police_alarm_destination_gps":null,"jqbh":"23010020200212105854000014","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处门市被盗","afdd":"道外区南平街 副56号面馆内","bjsj":"2020/02/12 10:58:54","bjdh":"15204635530","lng":"126.64374","xzb":"126.64374","lat":"45.77530","yzb":"45.77530","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"孙广平","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1581479933000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020021211000912100000001001014","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"孙广平"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1581479933000,"updateuser":null,"updatetime":1581479933000,"visibale":1,"flag":"900902"},{"police_alarm_id":"0c9f7acf5ff440a1b6df65d84c54272c","police_alarm_destination_gps":null,"jqbh":"23010020200303072816000016","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处店内被盗了","afdd":"道外区南勋街 282号中医日杂商店","bjsj":"2020/03/03 07:28:16","bjdh":"13074592257","lng":"126.638335000","xzb":"126.638335000","lat":"45.780554000","yzb":"45.780554000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"王川","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1583196543000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100101","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104590000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020030307290040100000001001016","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104590000","cjr":"王川"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1583196543000,"updateuser":null,"updatetime":1583196543000,"visibale":1,"flag":"900902"},{"police_alarm_id":"fd25fbd2cd5e4f10a11866cdd96fcb9e","police_alarm_destination_gps":null,"jqbh":"23010020200313171204000014","afsj":null,"sjfssj":null,"bjnr":"报警人称：此地物品被盗了","afdd":"道外区南极一路 南极国际B区 2号楼写字楼1911室","bjsj":"2020/03/13 17:12:04","bjdh":"13199481223","lng":"126.643313000","xzb":"126.643313000","lat":"45.770357000","yzb":"45.770357000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"白洪涛","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1584090899000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100120","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020031317135771500000001001014","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"白洪涛"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1584090899000,"updateuser":null,"updatetime":1584090899000,"visibale":1,"flag":"900902"},{"police_alarm_id":"8b6e6a32a54d48d9ba9eeccc8676ccdf","police_alarm_destination_gps":null,"jqbh":"23010020200409111837487003","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处手机被偷","afdd":"道外区南极街 70号门前","bjsj":"2020/04/09 11:18:37","bjdh":"13903612791","lng":"126.64850","xzb":"126.64850","lat":"45.77284","yzb":"45.77284","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"贾佩衡","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1586402469000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100120","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020040911201484700000001001003","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"贾佩衡"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1586402469000,"updateuser":null,"updatetime":1586402469000,"visibale":1,"flag":"900902"},{"police_alarm_id":"0005bb477ae0446795ee7e54e21faef6","police_alarm_destination_gps":null,"jqbh":"23010020200611172319289002","afsj":null,"sjfssj":null,"bjnr":"报警人称：电动车被偷了","afdd":"道外区草市街 40-1号1栋1单元702门","bjsj":"2020/06/11 17:23:19","bjdh":"13613617743","lng":"126.64877","xzb":"126.64877","lat":"45.77603","yzb":"45.77603","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"张金宇","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1591870383000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":"201016","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104610000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020061117234821400000001001002","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104610000","cjr":"张金宇"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1591870383000,"updateuser":null,"updatetime":1591870383000,"visibale":1,"flag":"900902"},{"police_alarm_id":"d7b35bcdd6344e289ea67af2fc687b29","police_alarm_destination_gps":null,"jqbh":"23010020200515064527763008","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处电动三轮车与货物被盗","afdd":"道外区八区街 1-5号中央钢条市场内","bjsj":"2020/05/15 06:45:27","bjdh":"15204655598","lng":"126.64269","xzb":"126.64269","lat":"45.77167","yzb":"45.77167","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"孙广平","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1589500621000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020051506461471400000001001008","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"孙广平"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1589500621000,"updateuser":null,"updatetime":1589500621000,"visibale":1,"flag":"900902"},{"police_alarm_id":"aa44c30e8db0404db59f1700eae2738c","police_alarm_destination_gps":null,"jqbh":"23010020200602161229978008","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处金手镯被盗了","afdd":"道外区靖宇十道街151号门市内","bjsj":"2020/06/02 16:12:29","bjdh":"15546074967","lng":"126.644664000","xzb":"126.644664000","lat":"45.784273000","yzb":"45.784273000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"李 论","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1591113065000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100199","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104550000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020060216142752100000001001008","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104550000","cjr":"李 论"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1591113065000,"updateuser":null,"updatetime":1591113065000,"visibale":1,"flag":"900902"},{"police_alarm_id":"e5e3b41bc3314751944716552de185a9","police_alarm_destination_gps":null,"jqbh":"23010020200510080642034005","afsj":null,"sjfssj":null,"bjnr":"报警人称：此处三轮车丢失。","afdd":"道外区南极国际冷现场门前","bjsj":"2020/05/10 08:06:42","bjdh":"18714504730","lng":"126.64850","xzb":"126.64850","lat":"45.77282","yzb":"45.77282","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"孙广平","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1589078234000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020051008072278300000001001005","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"孙广平"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1589078234000,"updateuser":null,"updatetime":1589078234000,"visibale":1,"flag":"900902"},{"police_alarm_id":"d97794251c964979b3be5678c18d7509","police_alarm_destination_gps":null,"jqbh":"23010020200521093640552006","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处手机被骑摩托车的抢走了。","afdd":"道外区南马路与景阳街交口","bjsj":"2020/05/21 09:36:41","bjdh":"18686849929","lng":"126.645183000","xzb":"126.645183000","lat":"45.776717000","yzb":"45.776717000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"王宇","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1590031377000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100199","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020052109375203900000001001006","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"王宇"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1590031377000,"updateuser":null,"updatetime":1590031377000,"visibale":1,"flag":"900902"},{"police_alarm_id":"3b71c2fc7922443381b6998fcd64edff","police_alarm_destination_gps":null,"jqbh":"23010020200607063818460016","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处仓买店被盗了","afdd":"道外区地灵街 49号仓买","bjsj":"2020/06/07 06:38:19","bjdh":"15045678110","lng":"126.63929","xzb":"126.63929","lat":"45.78277","yzb":"45.78277","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"郭玉鹏","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1591489544000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100199","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104550000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020060706390780700000001001016","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104550000","cjr":"郭玉鹏"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1591489544000,"updateuser":null,"updatetime":1591489544000,"visibale":1,"flag":"900902"},{"police_alarm_id":"6e5f25fb347a43bab374ed2d95f4c069","police_alarm_destination_gps":null,"jqbh":"23010020200615091427673013","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处钱包被偷","afdd":"道外区南马路 113路公交车上","bjsj":"2020/06/15 09:14:27","bjdh":"18346219747","lng":"126.62891","xzb":"126.62891","lat":"45.77694","yzb":"45.77694","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"赵天柱","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1592185307000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100120","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020061509150218700000001002013","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230100490000","cjr":"赵天柱"},{"cjrdwdm":"230104520000","cjr":"孙广平"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1592185307000,"updateuser":null,"updatetime":1592185307000,"visibale":1,"flag":"900902"},{"police_alarm_id":"3ffedd10b8324ecf8146ee5aa175bc2a","police_alarm_destination_gps":null,"jqbh":"23010020200613180021597010","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处电动车丢失","afdd":"道外区观澜宝坻小区门前","bjsj":"2020/06/13 18:00:22","bjdh":"13946136938","lng":"126.62954","xzb":"126.62954","lat":"45.77997","yzb":"45.77997","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"于叶伟","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1592053990000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104600000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020061318004865000000001001010","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104600000","cjr":"于叶伟"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1592053990000,"updateuser":null,"updatetime":1592053990000,"visibale":1,"flag":"900902"},{"police_alarm_id":"ff834312369c40d59796bac48c170136","police_alarm_destination_gps":null,"jqbh":"23010020200614055446518012","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处被偷3个电话","afdd":"道外区宝宇环球港后身 工地内","bjsj":"2020/06/14 05:54:46","bjdh":"18646120527","lng":"126.626810000","xzb":"126.626810000","lat":"45.779260000","yzb":"45.779260000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"于劲松","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1592092281000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100199","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104600000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020061405554752000000001001012","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104600000","cjr":"于劲松"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1592092281000,"updateuser":null,"updatetime":1592092281000,"visibale":1,"flag":"900902"},{"police_alarm_id":"d82506efc22f4b87b5aa919d6c5d125b","police_alarm_destination_gps":null,"jqbh":"23010020200702070440682017","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处手机被偷。","afdd":"道外区南极三道街早市内","bjsj":"2020/07/02 07:04:41","bjdh":"18845577328","lng":"126.64148","xzb":"126.64148","lat":"45.77340","yzb":"45.77340","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"于立恒","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1593644824000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100120","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020070207053494100000001001017","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"于立恒"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1593644824000,"updateuser":null,"updatetime":1593644824000,"visibale":1,"flag":"900902"},{"police_alarm_id":"b07c02e2c90c4b6e923306593b72c72e","police_alarm_destination_gps":null,"jqbh":"23010020200620062005268016","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处被盗","afdd":"道外区小水晶街 42号大雨食杂店门前","bjsj":"2020/06/20 06:20:05","bjdh":"15045681722","lng":"126.64361","xzb":"126.64361","lat":"45.77971","yzb":"45.77971","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":null,"jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1592605290000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104510000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020062006205889500000001001016","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104510000"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1592605290000,"updateuser":null,"updatetime":1592605290000,"visibale":1,"flag":"900902"},{"police_alarm_id":"125dd8b791dc442ea89b1598d07c5ccd","police_alarm_destination_gps":null,"jqbh":"23010020200622155823096014","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处屋内进小偷了。","afdd":"道外区升平街 28号门前","bjsj":"2020/06/22 15:58:24","bjdh":"13703619767","lng":"126.63970","xzb":"126.63970","lat":"45.78603","yzb":"45.78603","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":null,"jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1592812755000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100101","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104600000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020062215590490100000001001014","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104600000"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1592812755000,"updateuser":null,"updatetime":1592812755000,"visibale":1,"flag":"900902"},{"police_alarm_id":"e8ab45bc8fc545bba0f8d3b0afa8d62e","police_alarm_destination_gps":null,"jqbh":"23010020200708050819763008","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处8辆汽车被砸，物品丢失。","afdd":"道外区南安街 47号门前","bjsj":"2020/07/08 05:08:20","bjdh":"13284512112","lng":"126.639853000","xzb":"126.639853000","lat":"45.773354000","yzb":"45.773354000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"王宇","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1594167192000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100108","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020070805100058500000001001008","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"王宇"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1594167192000,"updateuser":null,"updatetime":1594167192000,"visibale":1,"flag":"900902"},{"police_alarm_id":"49c37f2200954586b78c6bac6dc4f459","police_alarm_destination_gps":null,"jqbh":"23010020200704100857915014","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处电动车电瓶被偷了。","afdd":"道外区南五道街 副32号门前","bjsj":"2020/07/04 10:08:58","bjdh":"13796088204","lng":"126.64647","xzb":"126.64647","lat":"45.77951","yzb":"45.77951","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"徐思滨","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1593828706000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":"201005","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104510000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020070410095725300000001001014","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104510000","cjr":"徐思滨"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1593828706000,"updateuser":null,"updatetime":1593828706000,"visibale":1,"flag":"900902"},{"police_alarm_id":"8ef8038820d9471cbb811fed9130c395","police_alarm_destination_gps":null,"jqbh":"23010020200708050829074012","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处车被砸伤 ","afdd":"道外区南安街 66号门前","bjsj":"2020/07/08 05:08:29","bjdh":"13199576264","lng":"126.639880000","xzb":"126.639880000","lat":"45.773300000","yzb":"45.773300000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"王宇","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1594167192000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100108","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020070805084931800000001001012","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"王宇"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1594167192000,"updateuser":null,"updatetime":1594167192000,"visibale":1,"flag":"900902"},{"police_alarm_id":"90a279dc0600492b99fe6002e4afc8dd","police_alarm_destination_gps":null,"jqbh":"23010020200708031112027001","afsj":null,"sjfssj":null,"bjnr":"报警人称：车辆被砸 物品被盗","afdd":"道外区南安街 41号门前","bjsj":"2020/07/08 03:11:12","bjdh":"13244567989","lng":"126.639900000","xzb":"126.639900000","lat":"45.773354000","yzb":"45.773354000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"王宇","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1594166705000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100108","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020070803120022300000001001001","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"王宇"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1594166705000,"updateuser":null,"updatetime":1594166705000,"visibale":1,"flag":"900902"},{"police_alarm_id":"ec0616ade9d4422fb60f40df2b1345f5","police_alarm_destination_gps":null,"jqbh":"23010020200708051956004008","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处车辆被砸","afdd":"道外区南安街 47号门前","bjsj":"2020/07/08 05:19:57","bjdh":"15663849726","lng":"126.639895000","xzb":"126.639895000","lat":"45.773356000","yzb":"45.773356000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"王宇","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1594167315000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100108","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020070805205443400000001001008","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"王宇"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1594167315000,"updateuser":null,"updatetime":1594167315000,"visibale":1,"flag":"900902"},{"police_alarm_id":"e7532112a64b4de8bf18dc9b9c97cf5c","police_alarm_destination_gps":null,"jqbh":"23010020200708052052175012","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处多车被砸伤 ","afdd":"道外区南安街 41号门前","bjsj":"2020/07/08 05:20:52","bjdh":"13029722345","lng":"126.639907000","xzb":"126.639907000","lat":"45.773355000","yzb":"45.773355000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"王宇","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1594167315000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100108","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020070805212026100000001001012","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"王宇"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1594167315000,"updateuser":null,"updatetime":1594167315000,"visibale":1,"flag":"900902"},{"police_alarm_id":"e11e168d80ab4d88a3657b225bab0c26","police_alarm_destination_gps":null,"jqbh":"23010020200709124642934014","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处太阳伞被偷","afdd":"道外区地灵街 126号大果子店门前","bjsj":"2020/07/09 12:46:43","bjdh":"15946057571","lng":"126.64398","xzb":"126.64398","lat":"45.78797","yzb":"45.78797","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"于叶伟","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1594284549000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104600000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020070912473386100000001001014","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104600000","cjr":"于叶伟"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1594284549000,"updateuser":null,"updatetime":1594284549000,"visibale":1,"flag":"900902"},{"police_alarm_id":"468f305b8b054d4da6161af4f766524e","police_alarm_destination_gps":null,"jqbh":"23010020200708050802140012","afsj":null,"sjfssj":null,"bjnr":"报警人称：车在此处被砸伤 ","afdd":"道外区南安街 47号门前","bjsj":"2020/07/08 05:08:03","bjdh":"15776221663","lng":"126.64374","xzb":"126.64374","lat":"45.77527","yzb":"45.77527","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"王宇","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1594166823000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100108","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020070805082749500000001001012","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"王宇"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1594166823000,"updateuser":null,"updatetime":1594166823000,"visibale":1,"flag":"900902"},{"police_alarm_id":"8c62d76ec6bd43f1ba5aef0508a639c6","police_alarm_destination_gps":null,"jqbh":"23010020200731045029947014","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处电动车被偷","afdd":"道外区南和街 84号门前","bjsj":"2020/07/31 04:50:29","bjdh":"15945090250","lng":"126.64273","xzb":"126.64273","lat":"45.77485","yzb":"45.77485","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"贾宝琢","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1596142378000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020073104511166400000001001014","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"贾宝琢"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1596142378000,"updateuser":null,"updatetime":1596142378000,"visibale":1,"flag":"900902"},{"police_alarm_id":"975c8efd16c646c6bf786a8684d1242d","police_alarm_destination_gps":null,"jqbh":"23010020200726055545895017","afsj":null,"sjfssj":null,"bjnr":"报警人称：此处玻璃被砸物品被盗","afdd":"道外区承德街 71号裕昌副食店","bjsj":"2020/07/26 05:55:45","bjdh":null,"lng":"126.64946","xzb":"126.64946","lat":"45.77466","yzb":"45.77466","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"王海涛","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1595714217000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100101","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104610000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020072605551153800000001001017","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104610000","cjr":"王海涛"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1595714217000,"updateuser":null,"updatetime":1595714217000,"visibale":1,"flag":"900902"},{"police_alarm_id":"55756e95dc104a1c98e6f483b34e1b4a","police_alarm_destination_gps":null,"jqbh":"23010020200818124925837014","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处手机被偷","afdd":"道外区东莱街 71号考斯特烧烤店内","bjsj":"2020/08/18 12:49:26","bjdh":"13654682866","lng":"126.65097","xzb":"126.65097","lat":"45.77750","yzb":"45.77750","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"钟奇峰","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1597738165000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":"201099","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104510000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020081812500193500000001001014","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104510000","cjr":"钟奇峰"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1597738165000,"updateuser":null,"updatetime":1597738165000,"visibale":1,"flag":"900902"},{"police_alarm_id":"bea75fdd8080493f92c0cca97c0ebe74","police_alarm_destination_gps":null,"jqbh":"23010020200805034904410002","afsj":null,"sjfssj":null,"bjnr":"报警人称：黑A6RQC8白色哈弗H1被偷 辖区派出所出警 各单位注意发现","afdd":"道外区南十二道街 108号门前","bjsj":"2020/08/05 03:49:05","bjdh":"18646363344","lng":"126.645606000","xzb":"126.645606000","lat":"45.784353000","yzb":"45.784353000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"汤文俊","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1596571141000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100102","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104550000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020080503574646400000001014002","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230100172000","cjr":"汤文俊"},{"cjrdwdm":"230103520000","cjr":"王景春"},{"cjrdwdm":"230121000000","cjr":"呼兰分局"},{"cjrdwdm":"230100172200","cjr":"马胜利"},{"cjrdwdm":"230100172300","cjr":"李宇轩13936032799"},{"cjrdwdm":"230100172400","cjr":"哈西大队"},{"cjrdwdm":"230100172100","cjr":"吴思奇"},{"cjrdwdm":"230100172300","cjr":"李宇轩13936032799"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230131030000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100171800","cjr":"沈峰"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100171800","cjr":"沈峰"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100172500"},{"cjrdwdm":"230104550000"},{"cjrdwdm":"230108000000"},{"cjrdwdm":"230100172100","cjr":"吴思奇"},{"cjrdwdm":"230100470000","cjr":"曾诚"},{"cjrdwdm":"230100172500"},{"cjrdwdm":"230103000000"},{"cjrdwdm":"230104000000"},{"cjrdwdm":"230100171600","cjr":"杨恒伟"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100171900","cjr":"马致远"},{"cjrdwdm":"230104000000"},{"cjrdwdm":"230100172000","cjr":"汤文俊"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230103520000","cjr":"王景春"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100171900","cjr":"马致远"},{"cjrdwdm":"230100172200","cjr":"马胜利"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230103000000"},{"cjrdwdm":"230121000000","cjr":"呼兰分局"},{"cjrdwdm":"230104550000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230109000000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230102000000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100171700","cjr":"刘卫强"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100171600","cjr":"杨恒伟"},{"cjrdwdm":"230100172400","cjr":"哈西大队"},{"cjrdwdm":"230106000000"},{"cjrdwdm":"230108000000"},{"cjrdwdm":"230106000000"},{"cjrdwdm":"230109000000"},{"cjrdwdm":"230102000000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100171700","cjr":"刘卫强"},{"cjrdwdm":"230131030000"},{"cjrdwdm":"230100470000"},{"cjrdwdm":"230100470000","cjr":"曾诚"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1596571141000,"updateuser":null,"updatetime":1596571141000,"visibale":1,"flag":"900902"},{"police_alarm_id":"cb9c9e1444384c5a922e58ea139e26f8","police_alarm_destination_gps":null,"jqbh":"23010020200808084931208002","afsj":null,"sjfssj":null,"bjnr":"报警人称：此处家里被盗了","afdd":"道外区景阳街与大新街交口门市","bjsj":"2020/08/08 08:49:31","bjdh":"13895792595","lng":"126.63523","xzb":"126.63523","lat":"45.78517","yzb":"45.78517","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":null,"jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1596848227000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100101","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104600000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020080808564491100000001001023","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104000000"},{"cjrdwdm":"230104600000"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1596848227000,"updateuser":null,"updatetime":1596848227000,"visibale":1,"flag":"900902"},{"police_alarm_id":"b21b2004d86d4fb9992fc82d52cdbcc5","police_alarm_destination_gps":null,"jqbh":"23010020200813083018515017","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处车内被盗。","afdd":"道外区景阳街141号门前","bjsj":"2020/08/13 08:30:19","bjdh":"13945058284","lng":"126.64273","xzb":"126.64273","lat":"45.77485","yzb":"45.77485","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"白洪涛","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1597278697000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100108","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020081308310039200000001001017","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"白洪涛"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1597278697000,"updateuser":null,"updatetime":1597278697000,"visibale":1,"flag":"900902"},{"police_alarm_id":"03d3a65ac010428f90086b225566ee7a","police_alarm_destination_gps":null,"jqbh":"23010020200821083616744016","afsj":null,"sjfssj":null,"bjnr":"报警人称：电动车电瓶被盗","afdd":"道外区南康街 2号门前","bjsj":"2020/08/21 08:36:16","bjdh":"13936442947","lng":"126.64848","xzb":"126.64848","lat":"45.77279","yzb":"45.77279","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"白洪涛","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1597983697000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020082108370001500000001001016","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"白洪涛"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1597983697000,"updateuser":null,"updatetime":1597983697000,"visibale":1,"flag":"900902"},{"police_alarm_id":"2b8e5d1b5a174a69bbb446dec58df493","police_alarm_destination_gps":null,"jqbh":"23010020200819072533178012","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处被盗 ","afdd":"道外区南极一路 11号 商服内","bjsj":"2020/08/19 07:25:33","bjdh":"13945667712","lng":"126.64847","xzb":"126.64847","lat":"45.77277","yzb":"45.77277","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"张伟华","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1597798773000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020081907260736800000001001012","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"张伟华"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1597798773000,"updateuser":null,"updatetime":1597798773000,"visibale":1,"flag":"900902"},{"police_alarm_id":"d4c3ad28be0641bb91ceeb857558821e","police_alarm_destination_gps":null,"jqbh":"23010020200822062107979005","afsj":null,"sjfssj":null,"bjnr":"报警人称：此处抓到一个小偷。","afdd":"道外区南极三道街 副26-6号早市门前","bjsj":"2020/08/22 06:21:08","bjdh":"18345163329","lng":"126.63756","xzb":"126.63756","lat":"45.77316","yzb":"45.77316","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"康毅","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1598048584000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020082206220830800000001001005","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"康毅"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1598048584000,"updateuser":null,"updatetime":1598048584000,"visibale":1,"flag":"900902"},{"police_alarm_id":"61b150656d99493baf7c59562fc1a773","police_alarm_destination_gps":null,"jqbh":"23010020200902103718150016","afsj":null,"sjfssj":null,"bjnr":"报警人称：测温枪被人偷走","afdd":"道外区南平街 52号门前","bjsj":"2020/09/02 10:37:19","bjdh":"18603652519","lng":"126.637859000","xzb":"126.637859000","lat":"45.773377000","yzb":"45.773377000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":null,"jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1599014390000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020090210380131600000001001016","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1599014390000,"updateuser":null,"updatetime":1599014390000,"visibale":1,"flag":"900902"},{"police_alarm_id":"2a86c58f7fc449dd9cfd00e15d3570a1","police_alarm_destination_gps":null,"jqbh":"23010020190902063901000007","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处手机被偷。","afdd":"道外区南极三道街早市处","bjsj":"2019/09/02 06:39:01","bjdh":"13100872620","lng":"126.632689000","xzb":"126.632689000","lat":"45.772516000","yzb":"45.772516000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"张伟华","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1567384026000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002019090206401181900000001001007","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104520000","cjr":"张伟华"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1567384026000,"updateuser":null,"updatetime":1567384026000,"visibale":1,"flag":"900902"},{"police_alarm_id":"ac3bea86236a4777942bb0451bd92c30","police_alarm_destination_gps":null,"jqbh":"23010020201010235013952006","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处两个小孩抢了两盒烟 ，兜里还有刀 ，往南七道街方向骑摩托车逃跑（看似未成年）","afdd":"道外区大水晶街 251 号 新水晶仓买","bjsj":"2020/10/10 23:50:14","bjdh":"15104516564","lng":"126.64011","xzb":"126.64011","lat":"45.77804","yzb":"45.77804","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"郑建华","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1602347101000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100200","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104510000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020101100232874600000001001006","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104510000","cjr":"郑建华"},{"cjrdwdm":"230104510000","cjr":"郑建华"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1602347101000,"updateuser":null,"updatetime":1602347101000,"visibale":1,"flag":"900902"},{"police_alarm_id":"73531fb682c049a58a22da832d44d47c","police_alarm_destination_gps":null,"jqbh":"23010020201004123331171017","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处车辆眼镜被盗。","afdd":"道外区北十三道街与靖宇街交口","bjsj":"2020/10/04 12:33:31","bjdh":"018604652319","lng":"126.644232000","xzb":"126.644232000","lat":"45.785726000","yzb":"45.785726000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"郭玉鹏","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1601786210000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100108","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104550000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020100412345770900000001001017","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104550000","cjr":"郭玉鹏"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1601786210000,"updateuser":null,"updatetime":1601786210000,"visibale":1,"flag":"900902"},{"police_alarm_id":"5878a358e5cc47ce905afca9cd5196c2","police_alarm_destination_gps":null,"jqbh":"23010020190915181405000002","afsj":null,"sjfssj":null,"bjnr":"报警人称：手机在此处被偷","afdd":"道外区南十四道街阿拉伯广场位置","bjsj":"2019/09/15 18:14:05","bjdh":"18346015923","lng":"126.64620","xzb":"126.64620","lat":"45.77757","yzb":"45.77757","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"郎晓玺","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1568554514000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":"201020","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104550000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002019091518144213000000001001002","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104550000","cjr":"郎晓玺"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1568554514000,"updateuser":null,"updatetime":1568554514000,"visibale":1,"flag":"900902"},{"police_alarm_id":"680316e3c7b84dc489a909dc19e3ba88","police_alarm_destination_gps":null,"jqbh":"23010020190905061943000010","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处电动车丢失","afdd":"道外区大新街 268号门前","bjsj":"2019/09/05 06:19:43","bjdh":"018846361378","lng":"126.63528","xzb":"126.63528","lat":"45.78522","yzb":"45.78522","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"武波","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1567640223000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":"201004","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104600000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002019090506203873900000001001010","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104600000","cjr":"武波"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1567640223000,"updateuser":null,"updatetime":1567640223000,"visibale":1,"flag":"900902"},{"police_alarm_id":"cb55337482a048118a55a4fd60e5235b","police_alarm_destination_gps":null,"jqbh":"23010020190915181606000006","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处手机丢失","afdd":"道外区阿拉伯广场附近位置","bjsj":"2019/09/15 18:16:06","bjdh":"15114591911","lng":"126.64618","xzb":"126.64618","lat":"45.77753","yzb":"45.77753","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"郎晓玺","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1568554421000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100120","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104550000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002019091518164561600000001001006","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104550000","cjr":"郎晓玺"},{"cjrdwdm":"230100490000","cjr":"赵天柱"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1568554421000,"updateuser":null,"updatetime":1568554421000,"visibale":1,"flag":"900902"},{"police_alarm_id":"af5dec3e78be4ff3b55bb0d397286918","police_alarm_destination_gps":null,"jqbh":"23010020201020100701828016","afsj":null,"sjfssj":null,"bjnr":"报警人称：车内物品被盗","afdd":"道外区南七道街 182-9号门前","bjsj":"2020/10/20 10:07:01","bjdh":"15846518883","lng":"126.64647","xzb":"126.64647","lat":"45.78372","yzb":"45.78372","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"景波","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1603159836000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104590000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020102010073964200000001001016","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104590000","cjr":"景波"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1603159836000,"updateuser":null,"updatetime":1603159836000,"visibale":1,"flag":"900902"},{"police_alarm_id":"29c1ce4539574074b09e8653be2aa64e","police_alarm_destination_gps":null,"jqbh":"23010020201021164521719007","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处手机被盗","afdd":"道外区大新街 238号门前","bjsj":"2020/10/21 16:45:22","bjdh":"15504650509","lng":"126.628423000","xzb":"126.628423000","lat":"45.783055000","yzb":"45.783055000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"李柏松","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1603270150000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100120","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104600000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020102116464353600000001001007","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104600000","cjr":"李柏松"},{"cjrdwdm":"13"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1603270150000,"updateuser":null,"updatetime":1603270150000,"visibale":1,"flag":"900902"},{"police_alarm_id":"ad695ecfd86a4e2986ac4255cfbbae76","police_alarm_destination_gps":null,"jqbh":"23010020201020161403937004","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处屋内被盗了","afdd":"道外区太原街 144号503室","bjsj":"2020/10/20 16:14:03","bjdh":"13946026245","lng":"126.64843","xzb":"126.64843","lat":"45.77825","yzb":"45.77825","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"黄宇辉","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1603181782000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":"100101","bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104610000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020102016144728700000001001004","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104610000","cjr":"黄宇辉"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1603181782000,"updateuser":null,"updatetime":1603181782000,"visibale":1,"flag":"900902"},{"police_alarm_id":"4c77ecb737d94e2d9496aa021fa31b2c","police_alarm_destination_gps":null,"jqbh":"23010020201021142928380004","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处家里被盗 具体时间不详","afdd":"道外区南康街 52号11单元302室","bjsj":"2020/10/21 14:29:29","bjdh":"13836117591","lng":"126.64699","xzb":"126.64699","lat":"45.77411","yzb":"45.77411","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":"道外1","jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1603261841000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"10","bjlxdm":"100100","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104520000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020102114302594700000001002004","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"230104000000","cjr":"道外1"},{"cjrdwdm":"230104520000"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1603261841000,"updateuser":null,"updatetime":1603261841000,"visibale":1,"flag":"900902"},{"police_alarm_id":"275d4bdabbaf45c5bea301f12004873b","police_alarm_destination_gps":null,"jqbh":"23010020201021161554697014","afsj":null,"sjfssj":null,"bjnr":"报警人称：在此处手机被偷","afdd":"道外区太古街 太古公馆小区附近处","bjsj":"2020/10/21 16:15:54","bjdh":"17645113214","lng":"126.635714000","xzb":"126.635714000","lat":"45.774568000","yzb":"45.774568000","status":null,"one_level_time":null,"two_level_time":null,"alarm_time":null,"arrive_time":null,"finish_time":null,"bjfsdm":null,"bjfs":null,"jjyxm":null,"jjczsj":null,"yhxm":null,"yhdz":null,"jjlyh":null,"thsc":null,"bjrxm":"匿名","bjr":"匿名","bjrxb":null,"lhlbdm":null,"lxdh":null,"bjrlxdz":null,"bjcph":null,"syqx":null,"clqx":null,"jjdscbz":null,"zjly":null,"ldgbh":null,"cllx":null,"rksjc":null,"fkyq":null,"hzdj":null,"jzlb":null,"jzjg":null,"qhcs":null,"bzwqk":null,"blqk":null,"sfbw":null,"rswxz":null,"yfwxwz":null,"ywbzxl":null,"yfty":null,"ywbkry":null,"sfzxxs":null,"bcjjnr":null,"yjdw":null,"yjr":null,"yjsm":null,"xzqh":null,"jjlxdm":null,"etl_sbsz":null,"sjgxsj":"1603268319000","jptsj":null,"pad_cid":null,"receive_type":null,"receive_message":null,"jjdwmc":null,"police_alarm_flow_id":null,"bjlbdm":"20","bjlxdm":"201000","bjxldm":null,"bjlbmc":null,"bjlxmc":null,"bjxlmc":null,"gxdwmc":null,"gxdwdm":"230104510000","bjrzjh":null,"qssj":null,"qsxx":null,"qsjyxm":null,"dcsj":null,"dcxx":null,"dcjyxm":null,"jssj":null,"jsxx":null,"jsjyxm":null,"cjdwdm":null,"cjdwmc":null,"cjdbh":"2301002020102116165547100000001002014","cjsj":null,"cjyj":null,"jqjb":null,"cjxx":[{"cjrdwdm":"13"},{"cjrdwdm":"230104510000","cjr":"钟奇峰"}],"ay":null,"jjdzt":"02","ajjssj":null,"createuser":null,"createtime":1603268319000,"updateuser":null,"updatetime":1603268319000,"visibale":1,"flag":"900902"}],"getBagList":[[{"x":126.64989517513482,"y":45.77491193597238},{"x":126.64899,"y":45.77711},{"x":126.64522,"y":45.776745},{"x":126.64847,"y":45.77281},{"x":126.65161,"y":45.77417},{"x":126.65097,"y":45.7775},{"x":126.64848,"y":45.77281},{"x":126.6448,"y":45.77762},{"x":126.645744,"y":45.786488},{"x":126.65461,"y":45.7766},{"x":126.65103,"y":45.7775},{"x":126.64521,"y":45.776787},{"x":126.65162,"y":45.77418},{"x":126.64684,"y":45.78075},{"x":126.64684,"y":45.78075},{"x":126.64365,"y":45.77967},{"x":126.65013,"y":45.77779},{"x":126.65162,"y":45.77418},{"x":126.65165,"y":45.77414},{"x":126.64847,"y":45.77277},{"x":126.64648,"y":45.77951},{"x":126.64877,"y":45.77603},{"x":126.6485,"y":45.77284},{"x":126.64877,"y":45.77603},{"x":126.64466,"y":45.78427},{"x":126.6485,"y":45.77282},{"x":126.64518,"y":45.77672},{"x":126.64361,"y":45.77971},{"x":126.64647,"y":45.77951},{"x":126.64398,"y":45.78797},{"x":126.64946,"y":45.77466},{"x":126.65097,"y":45.7775},{"x":126.64561,"y":45.78435},{"x":126.64848,"y":45.77279},{"x":126.64847,"y":45.77277},{"x":126.64423,"y":45.785725},{"x":126.6462,"y":45.77757},{"x":126.64618,"y":45.77753},{"x":126.64647,"y":45.78372},{"x":126.64843,"y":45.77825},{"x":126.64699,"y":45.77411}],[{"x":126.64157,"y":45.78724},{"x":126.62848,"y":45.78302},{"x":126.62848,"y":45.78302},{"x":126.63926,"y":45.78276},{"x":126.63932,"y":45.7828},{"x":126.63412,"y":45.78295},{"x":126.63931,"y":45.78276},{"x":126.638336,"y":45.780556},{"x":126.63929,"y":45.78277},{"x":126.62891,"y":45.77694},{"x":126.62954,"y":45.77997},{"x":126.62681,"y":45.77926},{"x":126.6397,"y":45.78603},{"x":126.63523,"y":45.78517},{"x":126.63528,"y":45.78522},{"x":126.628426,"y":45.783054}],[{"x":126.63958,"y":45.76898},{"x":126.63138,"y":45.77117},{"x":126.63578,"y":45.77302},{"x":126.63698,"y":45.777824},{"x":126.64014,"y":45.7781},{"x":126.63843,"y":45.77281},{"x":126.641975,"y":45.77008},{"x":126.64371,"y":45.77524},{"x":126.64172,"y":45.77082},{"x":126.64377,"y":45.7753},{"x":126.64525,"y":45.7726},{"x":126.64161,"y":45.77104},{"x":126.63649,"y":45.76945},{"x":126.628426,"y":45.7694},{"x":126.63845,"y":45.77276},{"x":126.64374,"y":45.7753},{"x":126.64331,"y":45.770355},{"x":126.64269,"y":45.77167},{"x":126.64148,"y":45.7734},{"x":126.639854,"y":45.773354},{"x":126.63988,"y":45.7733},{"x":126.6399,"y":45.773354},{"x":126.63989,"y":45.773357},{"x":126.63991,"y":45.773354},{"x":126.64374,"y":45.77527},{"x":126.64273,"y":45.77485},{"x":126.64273,"y":45.77485},{"x":126.63756,"y":45.77316},{"x":126.637856,"y":45.773376},{"x":126.63269,"y":45.772514},{"x":126.64011,"y":45.77804},{"x":126.63571,"y":45.774567}]],"cirList":[{"centerPoint":{"x":126.64699,"y":45.77411},"r":0.005}],"reason":{"code":"200","text":"操作成功！"}}}

                        if((JSON.parse(sessionStorage.getItem('user')).department == '230104000000' || JSON.parse(sessionStorage.getItem('user')).department == '230104510000')&&!window.configUrl.isgetLine){
                            this.showZdxl(
                                data.result && data.result.navigationAllList
                                    ? data.result.navigationAllList
                                    : [],
                            );
                            this.showJq(
                                data.result && data.result.getBagList
                                    ? data.result.getBagList
                                    : [],
                            );
                        }else{
                            this.props.dispatch({
                                type: 'service/getRecommendNavigation',
                                payload: {
                                    bagNum: 3,
                                    timeType: timeType,
                                    timeStart: timeType == '1' ? '06:00:00' : '20:00:00',
                                    timeEnd: timeType == '1' ? '20:00:00' : '06:00:00',
                                    association_organization_id: JSON.parse(
                                        sessionStorage.getItem('user'),
                                    ).group.parentId,
                                    brother_status: false,
                                    children_status: true,
                                    label_organization_code: JSON.parse(sessionStorage.getItem('user'))
                                        .group.code,
                                    label_organization_id: JSON.parse(sessionStorage.getItem('user'))
                                        .group.id,
                                    label_type: [0],
                                    parent_status: false,
                                },
                                success: res => {
                                    console.log('-----getRecommendNavigation回值-----',res);
                                    if (!res.reason) {
                                        this.showZdxl(
                                            res.result && res.result.navigationAllList
                                                ? res.result.navigationAllList
                                                : [],
                                        );
                                        this.showJq(
                                            res.result && res.result.getBagList
                                                ? res.result.getBagList
                                                : [],
                                        );
                                        // this.showCircle(res.result && res.result.cirList ? res.result.cirList : null);
                                    }
                                },
                            });
                        }
                });
            }
            // HGis.removeLayer(HMap, 'polygonBj');
        } else {
            if (this.state.jgfw) {
                this.showInstitutions(this.state.jgfw);
            }
            lxIds.map((event)=>{
                HGis.removeLayer(HMap, event);
            });
            HGis.removeLayer(HMap, 'points1');
            HGis.removeLayer(HMap, 'points2');
            HGis.removeLayer(HMap, 'points3');
            this.setState({ patrolRoutesZd: e, disabledZdxl: e });
        }
    };
    visOrganization = e => {
        const {
            treeValue,
            tourPointVector,
            isMenu,
            tourPointSource,
            breakPointValue,
            patrolRoutesValue,
            tourPointValue,
            patrolGridValue,
        } = this.state;

        var arr = [];

        if (e) {
            if (treeValue == '') {
                message.error('请选择组织机构');
                this.setState({ disabledTourPoint: false });
                return false;
            } else {
                this.setState({ tourPoint: e, disabledTourPoint: e, isRender: true }, () => {
                    this.showMapGps();
                });
            }
        } else {
            let {tourPointIds} = this.state;
            tourPointIds.map((item)=>{
                HGis.removeLayer(HMap, item);
            });
            this.setState({ tourPoint: e, disabledTourPoint: e });
        }
    };
    trOrganization = e => {
        const {
            treeValue,
            isMenu,
            breakPointSource,
            breakPointVector,
            breakPointValue,
            patrolRoutesValue,
            tourPointValue,
            patrolGridValue,
        } = this.state;

        var arr = [];

        if (e) {
            if (treeValue == '') {
                message.error('请选择组织机构');
                this.setState({ disabledBreakPoint: false });
                return false;
            } else {
                this.setState({ breakPoint: e, disabledBreakPoint: e, isRender: true }, () => {
                    this.showMapGps();
                    // for (let index = 0; index < dataReconList.length; index++) {
                    // 	const element = dataReconList[index]
                    // 	if (element.label_type == 4) {
                    // 		this.showBreakPointLoop(
                    // 			[ element ],
                    // 			'breakPoint',
                    // 			'#008FFF',
                    // 			'breakPointVector',
                    // 			'breakPointSource'
                    // 		)
                    // 	}
                    // }
                });
            }
        } else {
            let {breakPointIds} = this.state;
            breakPointIds.map((item)=>{
                HGis.removeLayer(HMap, item);
            });
            this.setState({ breakPoint: e, disabledBreakPoint: e });
        }
    };
    //整理网格菜单结构
    dataRecon = e => {
        for (let index = 0; index < e.length; index++) {
            const element = e[index];
            dataReconList.push(element);
            if (element.childrens) {
                this.dataRecon(element.childrens);
            }
        }
    };

    /*
     * 点击菜单时调用
     * 用来变更点击存储数据存储
     */

    frameModule = (files, arr) => {
        const {
            tourPointSource,
            breakPointSource,
            patrolRoutesSource,
        } = this.state;
        let {patrolGrids} = this.state;
        patrolGrids.map((item)=>{
            HGis.removeLayer(HMap, item);
        });
        let {tourPointIds} = this.state;
        tourPointIds.map((item)=>{
            HGis.removeLayer(HMap, item);
        });
        let {breakPointIds} = this.state;
        breakPointIds.map((item)=>{
            HGis.removeLayer(HMap, item);
        });
        let {patrolRoutesIds} = this.state;
        patrolRoutesIds.map((item)=>{
            HGis.removeLayer(HMap, item);
        });
        // 根据label_type 判断当前点击的数据类型 并变更对应的state，其他state为空值
        this.setState(
            {
                patrolGridValue: arr.find(v => v.label_type == 2) || [],
                patrolRoutesValue: arr.find(v => v.label_type == 5) || [],
                tourPointValue: arr.find(v => v.label_type == 3) || [],
                breakPointValue: arr.find(v => v.label_type == 4) || [],
            },
            () => {
                this.showMapGps(arr);
            },
        );
        //绘制点击项
        if (files.label_type == 2) {
            this.showPolygonLoop([files], 'patrolGrid', '#faad14', 'vector', 'onlySource');
        }
        if (files.label_type == 3) {
            this.showTourPointLoop([files], 'tourPoint', '#faad14', 'vector', 'onlySource');
        }
        if (files.label_type == 4) {
            this.showBreakPointLoop([files], 'breakPoint', '#faad14', 'vector', 'onlySource');
        }
        if (files.label_type == 5) {
            this.showLineLoop([files], 'patrolRoutes', '#faad14', 'vector', 'onlySource');
        }
    };
    styleSelect = feature => {
        const { drawType } = this.state;
        if (drawType == 3) {
            return new ol.style.Style({
                image: new ol.style.Icon({
                    scale: 1.1, // 图标缩放比例 // 0为离线其他为在线
                    src: './image/syzxd.png', // 图标的url
                }),
            });
        } else if (drawType == 4) {
            return new ol.style.Style({
                image: new ol.style.Icon({
                    scale: 1.1, // 图标缩放比例 // 0为离线其他为在线
                    src: './image/syxxd.png', // 图标的url
                }),
            });
        } else {
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
    onEditRecordCreate = (e,that) => {
        if( e.record.type == 2 || e.record.type == 3){
            console.log('e=====>', e.record)
            console.log('e.record.features[0].geometry.coordinates=====>', e.record.features[0].geometry.coordinates);
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
    //画点线面的方法 根据type 切换
    drawFeature = (files, type) => {
        this.setState({
            drawType: type,
            determine: 'new',
            limit: true,
            createBtn: true,
            isCancel: true,
        });
        console.log('新增中……');
        HMap.map.getCanvas().style.cursor = 'copy';
        HGis.enableEditDraw(HMap);
        if(type == 2){
            HGis.onEditCtrlActive(HMap, 'polygon');
        }else if(type == 5){
            HGis.onEditCtrlActive(HMap, 'line');
        }else if(type == 3){
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
            body.style.backgroundImage = "url('./image/syzxd.png')";
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
            HGis.onEditCtrlActive(HMap, 'icon', {iconImage: this.state.Icon.id, iconSize: 1, iconRotate: 0});
        }else if(type == 4){
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
            body.style.backgroundImage = "url('./image/syxxd.png')";
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
            HGis.onEditCtrlActive(HMap, 'icon', {iconImage: this.state.IconXx.id, iconSize: 1, iconRotate: 0});
        }

        // // 添加一个绘制的线使用的layer
        // var _self = this;
        // document.getElementById('map').onmouseover = function() {
        //     // this.style.cursor = "url('./image/pen.png'),w-resize";
        //     this.style.cursor = 'copy';
        // };
        // this.setState({ determine: 'new', drawType: type });
        // let { source, vector, view, map, draw, modify, select, circle } = this.state;
        // let drawArr = [];
        // map.removeInteraction(draw); //移除绘制图形
        // const lineLayer = new ol.layer.Vector({
        //     source: source,
        //     style: function(feature) {
        //         return _self.styleSelect(feature);
        //     },
        // });
        // map.addLayer(lineLayer);
        // draw = new ol.interaction.Draw({
        //     type: files,
        //     source: lineLayer.getSource(), // 注意设置source，这样绘制好的线，就会添加到这个source里
        //     style: function(feature) {
        //         return _self.styleSelect(feature);
        //     },
        //     //   minPoints:     // 限制不超过4个点
        // });
        //
        // map.addInteraction(draw);
        //
        // //监听绘制动作是否开始
        // draw.on('drawstart', function(event) {
        //     if (!_self.state.limit) {
        //         draw.setActive(false);
        //         return false;
        //     }
        //
        //     _self.setState({ createBtn: false, isCancel: false });
        // });
        // // 监听线绘制结束事件，获取坐标
        // draw.on('drawend', function(event) {
        //     draw.setActive(false);
        //     select.setActive(true); //激活选择要素控件
        //     modify.setActive(true);
        //     _self.setState({
        //         drawGps: event.feature.getGeometry(),
        //         source: source,
        //         vector: vector,
        //         draw: draw,
        //         select: select,
        //         modify: modify,
        //         createBtn: true,
        //         isCancel: false,
        //         isEdit: false,
        //     });
        // });
        // modify.on('modifyend', function(e) {
        //     _self.setState({
        //         drawGps: e.features.item(0).getGeometry(),
        //         source: source,
        //         vector: vector,
        //         draw: draw,
        //         select: select,
        //         modify: modify,
        //     });
        // });
        // _self.setState({
        //     draw: draw,
        // });
    };
    editPolygon = (type) => {
        HGis.enableEditDraw(HMap);
        let data = [];
        if(type == 2){
            HGis.removeLayer(HMap, 'patrolGridOnlySource');
            data.push({
                coordinate: [
                    this.state.polygonGps
                ],
                properties: {
                    custom_style: "true",
                    fillColor: "#5358FD",
                    fillOpacity: 0.1,
                    fillOutlineColor: "#5358FD",
                    fillOutlineWidth: 3,
                },
            });
            HGis.setEditFeature(HMap, 'Polygon', data);
        }else if(type == 5){
            HGis.removeLayer(HMap, 'patrolRoutesOnlySource');
            data.push({
                coordinate: this.state.polygonGpsLine,
                properties: {
                    custom_style: "true",
                    fillColor: "#5358FD",
                    fillOpacity: 0.1,
                    fillOutlineColor: "#5358FD",
                    fillOutlineWidth: 3,
                    lineColor: "#5358FD",
                    lineWidth: 3
                },
            });
            HGis.setEditFeature(HMap, 'LineString', data);
        }else if(type == 3){//pointZx
            HGis.removeLayer(HMap, 'tourPointOnlySource');
            data.push({
                coordinate: this.state.pointZx,
                properties: {
                    custom_style: "true",
                    feature_type: "icon",
                    iconImage: this.state.Icon.id,
                    iconSize: 1,
                    iconRotate: 0
                },
            });
            HGis.setEditFeature(HMap, 'Point', data);
        }else if(type == 4){//pointZx
            HGis.removeLayer(HMap, 'breakPointOnlySource');
            data.push({
                coordinate: this.state.pointXx,
                properties: {
                    custom_style: "true",
                    feature_type: "icon",
                    iconImage: this.state.IconXx.id,
                    iconSize: 1,
                    iconRotate: 0
                },
            });
            HGis.setEditFeature(HMap, 'Point', data);
        }
        this.setState({
            createBtn: true,
            determine: 'edit',
            limit: true,
            isEdit: true,
            isCancel: false,
        });
        // //    this.setState({determine: 'edit'})
        // document.getElementById('map').onmouseover = function() {
        //     this.style.cursor = 'all-scroll';
        // };
        // let {
        //     vector,
        //     view,
        //     map,
        //     draw,
        //     modify,
        //     showVector,
        //     select,
        //     circle,
        //     source,
        //     drawType,
        // } = this.state;
        // this.setState({
        //     createBtn: true,
        //     determine: 'edit',
        //     limit: true,
        //     isEdit: true,
        //     isCancel: false,
        // });
        // this.props.prompt(true);
        // var _self = this;
        // select.setActive(true); //激活选择要素控件
        // modify.setActive(true);
        // select.on('select', function(e) {
        // });
        // modify.on('modifyend', function(e) {
        //     _self.setState({
        //         drawGps: e.features.item(0).getGeometry(),
        //         source: source,
        //         vector: vector,
        //         draw: draw,
        //         select: select,
        //         modify: modify,
        //         isEdit: true,
        //     });
        // });
    };
    //分类绘画方式
    onDraw = () => {
        this.setState({ limit: true, createBtn: true, isCancel: true });
        this.props.prompt(true);
        switch (this.state.drawTitle) {
            case '网格':
                this.drawFeature('polygon', 2);
                break;
            case '线路':
                this.drawFeature('LineString', 5);
                break;
            case '驻巡点':
                this.drawFeature('Point', 3);
                break;
            case '休息点':
                this.drawFeature('Point', 4);
                break;
            default:
                break;
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
            defaultSelectValue,
            labelId,
        } = this.state;
        const {
            dispatch,
            service: { patrol },
        } = this.props;
        let newdrawGps = [];
        if (drawType == 2) {
            newdrawGps = drawGps[0];
        } else {
            newdrawGps = drawGps;
        }
        dispatch({
            type: 'service/updateGpsLabel',
            payload: {
                label_id: labelId,
                label_gps_point: newdrawGps,
                label_type: drawType,
            },
            success: e => {
                if (e.result.reason.code == '200') {
                    message.success('保存成功');
                    this.initLayers();
                    HGis.delEditAllFeatures(HMap);
                    this.setState({
                        createBtn: false,
                        isGpsPiont: true,
                        limit: false,
                        isEdit: false,
                        isRender: true,
                    });
                    HMap.map.getCanvas().style.cursor = '-webkit-grab';
                    this.getGpsList(treeValue);
                    this.props.prompt(false);
                } else {
                    HGis.delEditAllFeatures(HMap);
                    Message.error('保存失败');
                    HMap.map.getCanvas().style.cursor = '-webkit-grab';
                    return false;
                }
            },
        });
    };

    cancelDraw = () => {
        let {
            source,
            vector,
            isEdit,
            view,
            map,
            draw,
            modify,
            showVector,
            select,
            circle,
            treeValue,
            patrolGridValue,
            patrolRoutesValue,
            tourPointValue,
            breakPointValue,
            drawType,
        } = this.state;
        this.props.prompt(false);
        if (HMap && edit) {
            HGis.delEditAllFeatures(HMap);
            HGis.disableEditDraw(HMap);
        }
        document.getElementById('add-content').innerHTML = '';
        HMap.map.getCanvas().style.cursor = '-webkit-grab';
        // if (!isEdit) {
        //     draw.setActive(false);
        //     map.removeInteraction(draw);
        // }
        // let formData = {}
        // if (drawType == 2) {
        // 	formData = patrolGridValue
        // } else if (drawType == 3) {
        // 	formData = tourPointValue
        // } else if (drawType == 4) {
        // 	formData = patrolGridValue
        // } else if (drawType == 5) {
        // 	formData = breakPointValue
        // }

        // select.getFeatures().clear();
        //    frameModule
        this.getGpsList(treeValue);
        this.initLayers();
        //  this.frameModule(formData, [ formData ])
        this.setState({ createBtn: false, limit: false, isEdit: false, isRender: true });
    };
    okHandle = e => {
        const {
            form,
            dispatch,
            service: { useList },
        } = this.props;
        let {
            drawGps,
            parentKeys,
            treeValue,
            expandedKeysName,
            expandedKeysId,
            drawType,
        } = this.state;
        if (treeValue != '') {
            form.validateFields((err, fieldsValue) => {
                if (err) return;
                dispatch({
                    type: 'service/createGpsLabel',
                    payload: {
                        association_label_id: fieldsValue.association_label_id,
                        association_organization_id: parentKeys,
                        label_organization_code: treeValue,
                        label_organization_name: expandedKeysName,
                        label_organization_id: expandedKeysId,
                        label_type: fieldsValue.label_type,
                        label_name: fieldsValue.label_name,
                    },
                    success: e => {
                        if (e.result.reason.code == '200') {
                            message.success('保存成功');

                            this.setState({
                                modalVisible: false,
                                changeType: null,
                                isRender: true,
                            });
                            this.initLayers();
                            this.getGpsList(treeValue);
                            form.resetFields();
                        } else {
                            Message.error('保存失败');
                            return false;
                        }
                    },
                });
            });
        }
    };
    delDraw = () => {
        let { treeValue, drawType, labelId, onlySource } = this.state;
        const {
            dispatch,
            service: { useList },
        } = this.props;
        Modal.confirm({
            title: `${'您确认要删除'}${
                drawType == '5'
                    ? '该巡逻线路'
                    : drawType == '2'
                    ? '该巡逻网格'
                    : drawType == '4'
                    ? '该驻巡点'
                    : '该休息点'
            }${'吗？'}`,
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                dispatch({
                    type: 'service/updateGpsLabel',
                    payload: {
                        label_id: labelId,
                        label_gps_point: [],
                        label_type: drawType,
                    },
                    success: e => {
                        if (e.result.reason.code == '200') {
                            message.success('删除成功');
                            HGis.removeLayer(HMap, 'patrolGridOnlySource');
                            HGis.removeLayer(HMap, 'patrolRoutesOnlySource');
                            HGis.removeLayer(HMap, 'tourPointOnlySource');
                            HGis.removeLayer(HMap, 'breakPointOnlySource');
                            this.initLayers();
                            this.getGpsList(treeValue);
                            this.setState({
                                createBtn: false,
                                isGpsPiont: false,
                                isRender: true,
                            });
                            message.error({ content: '该巡逻范围无坐标信息，请开始绘制！' });
                        } else {
                            Message.error('删除失败，请稍后重试！');
                            return false;
                        }
                    },
                });
            },
        });
    };
    delMenu = files => {
        let { treeValue, drawType, labelId, onlySource, vector, selectMenuValue } = this.state;
        const {
            dispatch,
            service: { useList },
        } = this.props;
        const selectMenuValues = selectMenuValue;
        var _self = this;
        Modal.confirm({
            title: `您确认要删除${
                files.label_type == 2
                    ? '巡逻网格（'
                    : files.label_type == 3
                    ? '驻巡点（'
                    : files.label_type == 4
                    ? '休息点（'
                    : '巡逻线路（'
            }${files.label_name}）吗？`,
            okText: '确认',
            cancelText: '取消',
            onOk: () => {
                dispatch({
                    type: 'service/delGpsLabel',
                    payload: {
                        label_id: files.label_id,
                    },
                    success: e => {
                        if (e.result.reason.code == '200') {
                            message.success('删除成功');
                            if (selectMenuValues == files.label_id) {
                                _self.setState({
                                    selectMenuValue: '',
                                });
                            }
                            _self.initLayers();
                            vector.setSource(null);
                            _self.getGpsList(treeValue);
                            _self.setState({
                                createBtn: false,
                                isDraw: false,
                                isRender: true,
                            });
                        } else {
                            Message.error('删除失败，请稍后重试！');
                            return false;
                        }
                    },
                });
            },
        });
    };
    onChangeType = value => {
        this.setState({ changeType: value });
    };
    linktosonpage = (item, index) => {
        if (item.link) {
            // item.link是子菜单的路由地址
            location.replace(`#${item.link}`);
            // this.props.history.push(item.link) // 用这个报错Cannot read property 'push' of undefined
        } else {
            let that = this;
            let data = that.state.menus;
            data[index].show = !data[index].show;
            that.setState({
                menus: data,
            });
        }
    };
    stoppropgation(e) {
        e.stopPropagation();
    }

    //左侧菜单一级菜单展开收起
    changeFirstMenu = (files, items) => {
        const { selectMenuValue, openMenus, anSecond, anFirst, onlySource } = this.state;
        HGis.removeLayer(HMap, 'patrolGridOnlySource');
        HGis.removeLayer(HMap, 'patrolRoutesOnlySource');
        HGis.removeLayer(HMap, 'tourPointOnlySource');
        HGis.removeLayer(HMap, 'breakPointOnlySource');
        if (files[0] == openMenus[0]) {
            this.setState({ anFirst: !anFirst });
        } else {
            this.setState({ anFirst: true });
        }
        this.setState({
            selectMenuValue: files[0],
            openMenus: files,
            anSecond: false,
            drawType: items.label_type,
            labelId: items.label_id,
            drawTitle:
                items.label_type == 2
                    ? '网格'
                    : items.label_type == 5
                    ? '线路'
                    : items.label_type == 3
                    ? '驻巡点'
                    : '休息点',
        });

        if (items.label_gps_point != null) {
            // arr.push(items)

            this.setState(
                {
                    isDraw: true,
                    createBtn: false,
                    isGpsPiont: true,
                    isMenu: true,
                    isRender: true,
                },
                () => {
                    // this.frameModule(items, [ items ])
                    this.showMapGps();
                },
            );
        } else {
            this.setState({ isGpsPiont: false, isMenu: true, isRender: true }, () => {
                message.error({ content: '该巡逻范围无坐标信息，请开始绘制！' });
                this.showMapGps();
                return false;
            });
        }
    };
    //左侧菜单二级菜单展开收起
    changeSecondMenu = (files, items) => {
        const { selectMenuValue, openMenus, anSecond, anFirst, onlySource } = this.state;
        HGis.removeLayer(HMap, 'patrolGridOnlySource');
        HGis.removeLayer(HMap, 'patrolRoutesOnlySource');
        HGis.removeLayer(HMap, 'tourPointOnlySource');
        HGis.removeLayer(HMap, 'breakPointOnlySource');
        if (files[1] == openMenus[1]) {
            this.setState({ anSecond: !anSecond });
        } else {
            this.setState({ anSecond: true });
        }

        this.setState({
            selectMenuValue: files[1],
            openMenus: files,
            anFirst: true,
            drawType: items.label_type,
            labelId: items.label_id,
            drawTitle:
                items.label_type == 2
                    ? '网格'
                    : items.label_type == 5
                    ? '线路'
                    : items.label_type == 3
                    ? '驻巡点'
                    : '休息点',
        });

        if (items.label_gps_point != null) {
            // arr.push(items)

            this.setState(
                {
                    isDraw: true,
                    createBtn: false,
                    isGpsPiont: true,
                    isMenu: true,
                    isRender: true,
                },
                () => {
                    this.showMapGps();
                },
            );
            // this.frameModule(items, [ items ])
        } else {
            this.setState({ isGpsPiont: false, isMenu: true, isRender: true }, () => {
                message.error({ content: '该巡逻范围无坐标信息，请开始绘制！' });
                this.showMapGps();
                return false;
            });
        }
    };
    //左侧菜单选中事件
    selectMunes = (files, items) => {
        HGis.removeLayer(HMap, 'patrolGridOnlySource');
        HGis.removeLayer(HMap, 'patrolRoutesOnlySource');
        HGis.removeLayer(HMap, 'tourPointOnlySource');
        HGis.removeLayer(HMap, 'breakPointOnlySource');
        this.setState({
            selectMenuValue: files,
        });

        this.setState({
            selectMenuValue: files,
            drawType: items.label_type,
            labelId: items.label_id,
            drawTitle:
                items.label_type == 2
                    ? '网格'
                    : items.label_type == 5
                    ? '线路'
                    : items.label_type == 3
                    ? '驻巡点'
                    : '休息点',
        });

        if (items.label_gps_point != null) {
            // arr.push(items)

            this.setState(
                {
                    isDraw: true,
                    createBtn: false,
                    isGpsPiont: true,
                    isMenu: true,
                    isRender: true,
                },
                () => {
                    this.showMapGps();
                },
            );
            // this.frameModule(items, [ items ])
        } else {
            this.setState({ isGpsPiont: false, isMenu: true, isRender: true }, () => {
                // console
                this.showMapGps();
                message.error({ content: '该巡逻范围无坐标信息，请开始绘制！' });
                return false;
            });
        }
    };
    handleVisibleChange = visible => {
        this.setState({ visible });
    };
    onChangeTime = type => {
        this.setState(
            {
                timeType: type,
            },
            () => {
                this.getZdxl(true);
            },
        );
    };

    render() {
        const {
            expandedKeys,
            autoExpandParent,
            searchTreeLoad,
            selectCite,
            drawTitle,
            isDraw,
            breakPoint,
            tourPoint,
            patrolRoutes,
            patrolRoutesZd,
            patrolGrid,
            createBtn,
            isGpsPiont,
            determine,
            isMenu,
            disabledPatrolGrid,
            disabledPatrolRoutes,
            disabledZdxl,
            disabledTourPoint,
            disabledBreakPoint,
            selectMenuValue,
            openMenus,
            anSecond,
            anFirst,
        } = this.state;
        const {
            service: {
                data: { list, page },
                useList,
                policeList,
                patrol,
                patrolTree,
            },
            form: { getFieldDecorator },
        } = this.props;
        // 进行数组扁平化处理
        generateList(this.props.service.useList);

        const mapMunes = (
            <Menu style={{ background: 'hsla(229, 42%, 21%, 0.75)', width: '140px' }}>
                {!isGpsPiont &&
                    authorityIsTrue(
                        `${
                            drawTitle == '网格'
                                ? 'czht_qwgl_xlfw_xz'
                                : drawTitle == '线路'
                                ? 'czht_qwgl_xlfw_xlxlxz'
                                : drawTitle == '驻巡点'
                                ? 'czht_qwgl_xlfw_zxdxz'
                                : 'czht_qwgl_xlfw_xdxz'
                        }`,
                    ) && (
                        <Menu.Item key="0" onClick={() => this.onDraw()}>
                            新建{drawTitle}
                        </Menu.Item>
                    )}
                {isGpsPiont &&
                    authorityIsTrue(
                        `${
                            drawTitle == '网格'
                                ? 'czht_qwgl_xlfw_bj'
                                : drawTitle == '线路'
                                ? 'czht_qwgl_xlfw_xlxlbj'
                                : drawTitle == '驻巡点'
                                ? 'czht_qwgl_xlfw_zxdbj'
                                : 'czht_qwgl_xlfw_xdbj'
                        }`,
                    ) && (
                        <Menu.Item key="1" onClick={() => this.editPolygon( drawTitle == '网格'
                            ? 2
                            : drawTitle == '线路'
                                ? 5
                                : drawTitle == '驻巡点'
                                    ? 3
                                    : 4)}>
                            修改{drawTitle}{' '}
                        </Menu.Item>
                    )}
                {isGpsPiont &&
                    authorityIsTrue(
                        `${
                            drawTitle == '网格'
                                ? 'czht_qwgl_xlfw_sc'
                                : drawTitle == '线路'
                                ? 'czht_qwgl_xlfw_xlxlsc'
                                : drawTitle == '驻巡点'
                                ? 'czht_qwgl_xlfw_zxdsc'
                                : 'czht_qwgl_xlfw_xdsc'
                        }`,
                    ) && (
                        <Menu.Item key="2" onClick={() => this.delDraw()}>
                            删除{drawTitle}
                        </Menu.Item>
                    )}
            </Menu>
        );

        return (
            <div>
                <div id="add">
                    <div id="add-content" />
                </div>
                <img src={hylink} className={styles.hylinkLogo} />
                <div className={styles.calendar}>
                    <div id="map" className={styles.mapDivStyle} />
                </div>
                <div className={styles.mapMunes}>
                    <Row gutter={[16, 8]}>
                        <Col span={4} style={{ textAlign: 'center' }} offset={1}>
                            <Switch
                                onChange={this.parentOrganization}
                                checked={disabledPatrolGrid}
                                className={`${patrolGrid ? 'patrolGrid' : ''}`}
                                disabled={!!this.state.limit}
                            />
                            <span>巡逻网格</span>
                        </Col>
                        <Col span={4} style={{ textAlign: 'center' }}>
                            <Switch
                                onChange={this.subOrganization}
                                checked={disabledPatrolRoutes}
                                className={`${patrolRoutes ? 'patrolRoutes' : ''}`}
                                disabled={!!this.state.limit}
                            />
                            <span>巡逻线路</span>
                        </Col>
                        <Col span={6} style={{ textAlign: 'center' }}>
                            <Switch
                                onChange={this.getZdxl}
                                checked={disabledZdxl}
                                className={`${patrolRoutesZd ? 'patrolRoutesZd' : ''}`}
                                disabled={!!this.state.limit}
                            />
                            <Popover
                                content={
                                    <div>
                                        <Select
                                            placeholder="请选择"
                                            style={{ width: '160px' }}
                                            onChange={this.onChangeTime}
                                            defaultValue="1"
                                        >
                                            <Option value={'1'}>
                                                白天 {window.configUrl.lightTime[0]}~
                                                {window.configUrl.lightTime[1]}
                                            </Option>
                                            <Option value={'2'}>
                                                夜晚 {window.configUrl.darkTime[0]}~
                                                {window.configUrl.darkTime[1]}
                                            </Option>
                                        </Select>
                                    </div>
                                }
                                title={null}
                                trigger="click"
                                visible={disabledZdxl}
                                placement="bottomLeft"
                                onVisibleChange={this.handleVisibleChange}
                            >
                                <span>自动巡逻路线</span>
                            </Popover>
                        </Col>
                        <Col span={4} style={{ textAlign: 'center' }}>
                            <Switch
                                onChange={this.visOrganization}
                                checked={disabledTourPoint}
                                className={`${tourPoint ? 'tourPoint' : ''}`}
                                disabled={!!this.state.limit}
                            />

                            <span>驻巡点</span>
                        </Col>
                        <Col span={4} style={{ textAlign: 'center' }}>
                            <Switch
                                onChange={this.trOrganization}
                                checked={disabledBreakPoint}
                                className={`${breakPoint ? 'breakPoint' : ''}`}
                                disabled={!!this.state.limit}
                            />
                            <span>休息点</span>
                        </Col>
                    </Row>
                </div>
                {isMenu && (
                    <div className={styles.draw}>
                        <Dropdown
                            overlay={mapMunes}
                            trigger={['click']}
                            disabled={!!this.state.limit}
                        >
                            {authorityIsTrue('czht_qwgl_xlfw_bj') ||
                            authorityIsTrue('czht_qwgl_xlfw_sc') ||
                            authorityIsTrue('czht_qwgl_xlfw_xdbj') ||
                            authorityIsTrue('czht_qwgl_xlfw_xdsc') ||
                            authorityIsTrue('czht_qwgl_xlfw_xdxz') ||
                            authorityIsTrue('czht_qwgl_xlfw_xlxlbj') ||
                            authorityIsTrue('czht_qwgl_xlfw_xlxlsc') ||
                            authorityIsTrue('czht_qwgl_xlfw_xlxlxz') ||
                            authorityIsTrue('czht_qwgl_xlfw_xz') ||
                            authorityIsTrue('czht_qwgl_xlfw_zxdbj') ||
                            authorityIsTrue('czht_qwgl_xlfw_zxdsc') ||
                            authorityIsTrue('czht_qwgl_xlfw_zxdxz') ? (
                                <Button
                                    className="ant-dropdown-link"
                                    type="link"
                                    style={{ color: '#fff', fontSize: '15px' }}
                                >
                                    <Icon type="gateway" style={{ fontSize: '26px' }} />
                                    绘制{drawTitle}
                                </Button>
                            ) : null}
                        </Dropdown>
                    </div>
                )}
                {createBtn && (
                    <div className={styles.saveModel}>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Button
                                    className="ant-dropdown-link"
                                    type="primary"
                                    id="saveBtn"
                                    onClick={() => this.saveDraw()}
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
                        {!selectCite ? (
                            <div style={{ marginBottom: '200px' }}>
                                <Search
                                    style={{ marginBottom: 8 }}
                                    placeholder="搜索"
                                    onSearch={value => this.onChange(value)}
                                    enterButton
                                />
                                <Tree
                                    onSelect={this.onSelect}
                                    onExpand={this.onExpand}
                                    defaultSelectedKeys={[this.state.treeValue]}
                                    expandedKeys={expandedKeys}
                                    autoExpandParent={autoExpandParent}
                                    // onLoad={searchTreeLoad}
                                >
                                    {this.loop(this.props.service.useList)}
                                </Tree>
                            </div>
                        ) : (
                            <div style={{ marginBottom: '200px' }}>
                                <Button
                                    className={styles.muneTitle}
                                    onClick={() => this.backTree()}
                                    disabled={!!this.state.limit}
                                >
                                    <Icon type="left" />
                                    {this.state.expandedKeysName}
                                </Button>
                                {authorityIsTrue('czht_qwgl_xlfw_cdxz') ? (
                                    <Button
                                        className="ant-dropdown-link"
                                        type="link"
                                        disabled={!!this.state.limit}
                                        onClick={() => {
                                            this.setState({ modalVisible: true });
                                            // this.initLayers()
                                            this.setState({
                                                defaultSelectValue: [],
                                            });
                                        }}
                                        style={{
                                            color: '#fff',
                                            background: '#259BF3',
                                            width: '100%',
                                            border: ' 1px solid #259BF3',
                                            marginBottom: '10px',
                                        }}
                                    >
                                        <Icon type="plus" />
                                        添加巡逻范围
                                    </Button>
                                ) : null}
                                <div className={styles.menuSorr}>
                                    <div className={styles.MenuList}>
                                        <ul className={styles.stair}>
                                            {patrolTree.xlqy &&
                                                patrolTree.xlqy.map((v, k) => {
                                                    if (v.childrens.length) {
                                                        return (
                                                            <li>
                                                                <Button
                                                                    type="primary"
                                                                    disabled={!!this.state.limit}
                                                                    onClick={() =>
                                                                        this.changeFirstMenu(
                                                                            [v.label_id],
                                                                            v,
                                                                        )
                                                                    }
                                                                    className={`${styles.menuBtn} ${
                                                                        selectMenuValue ==
                                                                        v.label_id
                                                                            ? styles.setSelect
                                                                            : null
                                                                    }`}
                                                                >
                                                                    {v.label_name}
                                                                    <Icon
                                                                        type={
                                                                            selectMenuValue ==
                                                                                v.label_id &&
                                                                            anFirst
                                                                                ? 'up'
                                                                                : 'down'
                                                                        }
                                                                    />
                                                                </Button>
                                                                {anFirst &&
                                                                openMenus[0] == v.label_id ? (
                                                                    <ul
                                                                        className={styles.secondary}
                                                                    >
                                                                        {v.childrens.map(item => {
                                                                            if (
                                                                                item.childrens
                                                                                    .length
                                                                            ) {
                                                                                return (
                                                                                    <li>
                                                                                        <Button
                                                                                            type="primary"
                                                                                            disabled={
                                                                                                !!this
                                                                                                    .state
                                                                                                    .limit
                                                                                            }
                                                                                            onClick={() =>
                                                                                                this.changeSecondMenu(
                                                                                                    [
                                                                                                        v.label_id,
                                                                                                        item.label_id,
                                                                                                    ],
                                                                                                    item,
                                                                                                )
                                                                                            }
                                                                                            className={`${
                                                                                                styles.menuBtn
                                                                                            } ${
                                                                                                selectMenuValue ==
                                                                                                item.label_id
                                                                                                    ? styles.setSelect
                                                                                                    : null
                                                                                            }`}
                                                                                        >
                                                                                            {
                                                                                                item.label_name
                                                                                            }
                                                                                            <Icon
                                                                                                type={
                                                                                                    selectMenuValue ==
                                                                                                        item.label_id &&
                                                                                                    anSecond
                                                                                                        ? 'up'
                                                                                                        : 'down'
                                                                                                }
                                                                                            />
                                                                                        </Button>
                                                                                        {anSecond &&
                                                                                        openMenus[1] ==
                                                                                            item.label_id ? (
                                                                                            <ul
                                                                                                className={
                                                                                                    styles.level
                                                                                                }
                                                                                            >
                                                                                                {item.childrens.map(
                                                                                                    j => (
                                                                                                        <li>
                                                                                                            <Button
                                                                                                                disabled={
                                                                                                                    !!this
                                                                                                                        .state
                                                                                                                        .limit
                                                                                                                }
                                                                                                                type="primary"
                                                                                                                onClick={() =>
                                                                                                                    this.selectMunes(
                                                                                                                        j.label_id,
                                                                                                                        j,
                                                                                                                    )
                                                                                                                }
                                                                                                                className={`${
                                                                                                                    styles.menuBtn
                                                                                                                } ${
                                                                                                                    selectMenuValue ==
                                                                                                                    j.label_id
                                                                                                                        ? styles.setSelect
                                                                                                                        : null
                                                                                                                }`}
                                                                                                            >
                                                                                                                {
                                                                                                                    j.label_name
                                                                                                                }
                                                                                                            </Button>
                                                                                                            {authorityIsTrue(
                                                                                                                'czht_qwgl_xlfw_cdsc',
                                                                                                            ) ? (
                                                                                                                <Button
                                                                                                                    disabled={
                                                                                                                        !!this
                                                                                                                            .state
                                                                                                                            .limit
                                                                                                                    }
                                                                                                                    onClick={e => {
                                                                                                                        e.stopPropagation();
                                                                                                                        this.delMenu(
                                                                                                                            j,
                                                                                                                        );
                                                                                                                    }}
                                                                                                                    className={`${
                                                                                                                        styles.debtn
                                                                                                                    } ${
                                                                                                                        selectMenuValue ==
                                                                                                                        j.label_id
                                                                                                                            ? styles.setSelect
                                                                                                                            : null
                                                                                                                    }`}
                                                                                                                >
                                                                                                                    <Icon type="delete" />
                                                                                                                    删除
                                                                                                                </Button>
                                                                                                            ) : null}
                                                                                                        </li>
                                                                                                    ),
                                                                                                )}
                                                                                            </ul>
                                                                                        ) : null}
                                                                                    </li>
                                                                                );
                                                                            } else {
                                                                                return (
                                                                                    <li
                                                                                        className={
                                                                                            styles.secondaryItem
                                                                                        }
                                                                                    >
                                                                                        <Button
                                                                                            type="primary"
                                                                                            disabled={
                                                                                                !!this
                                                                                                    .state
                                                                                                    .limit
                                                                                            }
                                                                                            className={`${
                                                                                                styles.menuBtn
                                                                                            } ${
                                                                                                selectMenuValue ==
                                                                                                item.label_id
                                                                                                    ? styles.setSelect
                                                                                                    : null
                                                                                            }`}
                                                                                            onClick={() =>
                                                                                                this.selectMunes(
                                                                                                    item.label_id,
                                                                                                    item,
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            {
                                                                                                item.label_name
                                                                                            }
                                                                                        </Button>
                                                                                        {authorityIsTrue(
                                                                                            'czht_qwgl_xlfw_cdsc',
                                                                                        ) ? (
                                                                                            <Button
                                                                                                className={`${
                                                                                                    styles.debtn
                                                                                                } ${
                                                                                                    selectMenuValue ==
                                                                                                    item.label_id
                                                                                                        ? styles.setSelect
                                                                                                        : null
                                                                                                }`}
                                                                                                disabled={
                                                                                                    !!this
                                                                                                        .state
                                                                                                        .limit
                                                                                                }
                                                                                                onClick={e => {
                                                                                                    e.stopPropagation();
                                                                                                    this.delMenu(
                                                                                                        item,
                                                                                                    );
                                                                                                }}
                                                                                            >
                                                                                                <Icon type="delete" />
                                                                                                删除
                                                                                            </Button>
                                                                                        ) : null}
                                                                                    </li>
                                                                                );
                                                                            }
                                                                        })}
                                                                    </ul>
                                                                ) : null}
                                                            </li>
                                                        );
                                                    } else {
                                                        return (
                                                            <li className={styles.stairItem}>
                                                                <Button
                                                                    type="primary"
                                                                    disabled={!!this.state.limit}
                                                                    className={`${styles.menuBtn} ${
                                                                        selectMenuValue ==
                                                                        v.label_id
                                                                            ? styles.setSelect
                                                                            : null
                                                                    }`}
                                                                    onClick={e => {
                                                                        e.stopPropagation();
                                                                        this.selectMunes(
                                                                            v.label_id,
                                                                            v,
                                                                        );
                                                                    }}
                                                                >
                                                                    {v.label_name}
                                                                </Button>
                                                                {authorityIsTrue(
                                                                    'czht_qwgl_xlfw_cdsc',
                                                                ) ? (
                                                                    <Button
                                                                        disabled={
                                                                            !!this.state.limit
                                                                        }
                                                                        className={`${
                                                                            styles.debtn
                                                                        } ${
                                                                            selectMenuValue ==
                                                                            v.label_id
                                                                                ? styles.setSelect
                                                                                : null
                                                                        }`}
                                                                        onClick={e => {
                                                                            e.stopPropagation();
                                                                            this.delMenu(v);
                                                                        }}
                                                                    >
                                                                        <Icon type="delete" />
                                                                        删除
                                                                    </Button>
                                                                ) : null}
                                                            </li>
                                                        );
                                                    }
                                                })}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
                <div className={styles.calendar}>
                    <div id="popups" className={styles.olpopup}>
                        <div id="popups-content" />
                    </div>
                </div>
                <Modal
                    destroyOnClose
                    title={'添加巡逻范围'}
                    visible={this.state.modalVisible}
                    onOk={this.okHandle}
                    centered={true}
                    maskClosable={false}
                    onCancel={() => this.setState({ modalVisible: false, changeType: null })}
                >
                    <FormItem {...formItemLayout} label="类型">
                        {getFieldDecorator('label_type', {
                            rules: [
                                {
                                    required: true,
                                    message: '必需选择类型',
                                },
                            ],
                        })(
                            <Select
                                placeholder="请选择"
                                style={{ width: '390px' }}
                                onChange={this.onChangeType}
                            >
                                <Option value={2}>巡逻网格</Option>
                                <Option value={5}>巡逻线路</Option>
                                <Option value={3}>驻巡点</Option>
                                <Option value={4}>休息点</Option>
                            </Select>,
                        )}
                    </FormItem>
                    {this.state.changeType == 3 ||
                    this.state.changeType == 4 ||
                    this.state.changeType == 5 ? (
                        <FormItem {...formItemLayout} label="范围">
                            {getFieldDecorator('association_label_id', {
                                rules: [
                                    {
                                        required: true,
                                        message: '必需选择范围',
                                    },
                                ],
                            })(
                                <TreeSelect
                                    showSearch
                                    style={{ width: '100%' }}
                                    // value={this.state.value}
                                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                    placeholder="请选择"

                                    // treeDefaultExpandAll
                                    // onChange={this.onChange}
                                >
                                    {patrolTree.xlqy &&
                                        patrolTree.xlqy.map((v, k) => {
                                            if (v.childrens.length) {
                                                return (
                                                    <TreeSelect.TreeNode
                                                        value={v.label_id}
                                                        title={v.label_name}
                                                        key={v.label_id}
                                                        disabled={this.state.changeType != 5}
                                                    >
                                                        {v.childrens.map(item => {
                                                            // if(item.childrens.length){
                                                            //     return (<TreeSelect.TreeNode value={item.label_id} title={item.label_name} key={item.label_id}>
                                                            //     {
                                                            //         item.childrens.map(j =>  <TreeSelect.TreeNode value={j.label_id} title={j.label_name} key={j.label_id} />)
                                                            //     }
                                                            //     </TreeSelect.TreeNode>)
                                                            // }else{
                                                            return (
                                                                <TreeSelect.TreeNode
                                                                    value={item.label_id}
                                                                    title={item.label_name}
                                                                    key={item.label_id}
                                                                    disabled={
                                                                        this.state.changeType == 5
                                                                    }
                                                                />
                                                            );
                                                            // }
                                                        })}
                                                    </TreeSelect.TreeNode>
                                                );
                                            } else {
                                                return (
                                                    <TreeSelect.TreeNode
                                                        value={v.label_id}
                                                        title={v.label_name}
                                                        key={v.label_id}
                                                        disabled={this.state.changeType != 5}
                                                    />
                                                );
                                            }
                                        })}
                                </TreeSelect>,
                            )}
                        </FormItem>
                    ) : null}
                    <FormItem {...formItemLayout} label="名称">
                        {getFieldDecorator('label_name', {
                            rules: [
                                {
                                    required: true,
                                    message: '必需输入名称',
                                },
                            ],
                        })(<Input placeholder="请输入名称" />)}
                    </FormItem>
                </Modal>
            </div>
        );
    }
}

export default Form.create()(PatrolOtherMap);
