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
    };

    componentDidMount() {
        // 绘制地图
        this.initMap();
        //禁止鼠标右键
        document.oncontextmenu = function() {
            event.returnValue = false;
        };
    }
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
                    console.log('获取成功', files);
                    if (files.result.reason.code == '200') {
                        _self.setState({
                            jgfw: files.result.jgfw,
                        });
                        //处理巡逻范围菜单
                        _self.dataRecon(files.result.xlqy);
                        //绘制机构边界
                        _self.showInstitutions(files.result.jgfw);
                        //绘制除边界外其他点线面
                        _self.showMapGps();
                    } else {
                        return false;
                    }
                },
            });
        }
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
        console.log('重新加载', dataReconList, selectMenuValue, '====');
        patrolGridSource.clear();
        patrolRoutesSource.clear();
        patrolRoutesZdSource.clear();
        tourPointSource.clear();
        breakPointSource.clear();
        console.log('第一步');
        if (dataReconList.length) {
            console.log('第二步');
            for (let index = 0; index < dataReconList.length; index++) {
                const element = dataReconList[index];
                //根据label_type判断 要绘制的类型  * 2网格 3驻巡点 4休息点 5线路

                if (selectMenuValue != '') {
                    console.log('进来了', isRender);
                    if (isRender) {
                        if (selectMenuValue == element.label_id) {
                            console.log(element, element.label_type);
                            // this.frameModule(element, [ element ])
                            this.groupingRender(element.label_type, element);
                        } else {
                            this.switchGroupRender(element.label_type, element);
                        }
                    }
                } else {
                    console.log('没有选中的时候');
                    this.switchGroupRender(element.label_type, element);
                }
            }
        }
        let _self = this;
        if (_self.state.patrolRoutesZd) {
            console.log('========执行==========');
            // source.clear();
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
        console.log('switchGroupRender---', element);

        //根据patrolGrid判断 switch的开关状态来控制网格显示
        if (patrolGrid) {
            if (drawType == 2) {
                console.log('准备画巡逻网格', element);
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
                console.log('准备画驻巡点');
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
                console.log('准备画休息点');
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
                console.log('准备画巡逻线路');
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
        const {
            patrolGridSource,
            tourPointSource,
            breakPointSource,
            patrolRoutesSource,
            onlySource,
        } = this.state;
        this.setState({ isRender: false });
        console.log('走了几次');
        //   patrolGridSource.clear()
        // tourPointSource.clear()
        // breakPointSource.clear()
        // patrolRoutesSource.clear()
        onlySource.clear();
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

        //为地图容器添加单击事件监听
        map.on('click', function(evt) {});
        // 为地图容器添加双击事件
        map.on('dblclick', function(event) {});
        /**
         * 为map添加鼠标移动事件监听，当指向标注时改变鼠标光标状态
         */

        map.on('singleclick', e => {
            console.log('单击');
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
                console.log(
                    '编辑',
                    feature,
                    '=====',
                    layer,
                    '----',
                    _self.state.labelId,
                    '++',
                    feature.getGeometry(),
                    '----',
                    feature.get('eqNum'),
                    '=====',
                    _self.state.determine,
                    'type',
                );
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
        var geometry = new ol.geom.Polygon(); //线,Point 点,Polygon 面
        console.log('画机构边界', files);
        let arr = [];
        if (files) {
            if (files.label_gps_point) {
                //根据gps点构建网格
                const polygonFeature = new ol.Feature({
                    geometry: new ol.geom.Polygon([files.label_gps_point]),
                    typeName: '边界',
                    eqNum: files.label_id,
                });
                polygonFeature.setStyle(
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: '#259bf3',
                            size: 3,
                            width: 4,
                        }),
                    }),
                );
                polygonFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                source.addFeature(polygonFeature);
                showVector.setSource(source);
                for (let i = 0; i < files.label_gps_point.length; i++) {
                    //获取轨迹点位各点坐标
                    arr.push(ol.proj.fromLonLat(files.label_gps_point[i]));
                }
                //设置中心点
                let exent = ol.extent.boundingExtent(arr);
                let center = ol.extent.getCenter(exent);
                view.fit(exent);
                view.setCenter(center);
            }
        }
    };
    //绘制网格
    showPolygonLoop = (files, types, color, vectorType, sourceType, kkk) => {
        var _self = this;
        let arr = [];
        let polygonFeature = null;
        // this.setState({ determine: 'edit' });
        let {
            view,
            map,
            draw,
            modify,
            select,
            circle,
            newSource,
            patrolGridVector,
            onlySource,
            patrolRoutesSource,
            isDraw,
            patrolGridValue,
        } = this.state;
        //实例一个线的全局变量
        var geometry = new ol.geom.Polygon(); //线,Point 点,Polygon 面
        console.log(
            '画网格',
            files,
            types,
            color,
            vectorType,
            sourceType,
            kkk,
            patrolGridValue,
            '=====',
        );

        if (files) {
            for (var i = 0; i < files.length; i++) {
                if (files[i].label_gps_point) {
                    //根据参数sourceType判断 是否为点击菜单栏的绘制请求  *  onlySource是
                    if (sourceType == 'onlySource') {
                        //根据gps点构建网格
                        polygonFeature = new ol.Feature({
                            geometry: new ol.geom.Polygon([files[i].label_gps_point]),
                            typeName: types,
                            eqNum: files[i].label_id,
                        });

                        polygonFeature.setStyle(
                            new ol.style.Style({
                                stroke: new ol.style.Stroke({
                                    color: '#faad14',
                                    size: 4,
                                    width: 3,
                                    // lineDash: [ 1, 2, 3, 4, 5, 6 ]
                                }),
                            }),
                        );

                        polygonFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                        this.state[sourceType].addFeature(polygonFeature);
                    } else {
                        //根据gps点构建网格

                        polygonFeature = new ol.Feature({
                            geometry: new ol.geom.Polygon([files[i].label_gps_point]),
                            typeName: types,
                            eqNum: files[i].label_id,
                        });
                        console.log(polygonFeature);
                        polygonFeature.setStyle(
                            new ol.style.Style({
                                stroke: new ol.style.Stroke({
                                    color: color,
                                    size: 4,
                                    width: 3,
                                    lineDash: [1, 2, 3, 4, 5, 6],
                                }),
                            }),
                        );

                        polygonFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                        this.state[sourceType].addFeature(polygonFeature);
                    }
                }
            }
            //判断是否为点击菜单栏触发的显示
            if (sourceType == 'onlySource') {
                this.state[vectorType].setSource(this.state[sourceType]);
                // if(!kkk){
                if (files[0].label_gps_point) {
                    for (let i = 0; i < files[0].label_gps_point.length; i++) {
                        arr.push(ol.proj.fromLonLat(files[0].label_gps_point[i]));
                    }
                    //设置中心点
                    let exent = ol.extent.boundingExtent(arr);
                    let center = ol.extent.getCenter(exent);
                    view.fit(exent);
                    view.setCenter(center);
                }

                // }
            } else {
                this.state[vectorType].setSource(this.state[sourceType]);
            }
        }
    };
    //绘制线路
    showLineLoop = (files, types, color, vectorType, sourceType, kkk) => {
        var _self = this;
        let arr = [];
        let lineFeature = null;
        // this.setState({ determine: 'edit' });
        let {
            view,
            map,
            draw,
            modify,
            select,
            circle,
            newSource,
            patrolRoutesVector,
            onlySource,
            isDraw,
            patrolRoutesValue,
        } = this.state;
        const {
            service: { gpsList },
        } = this.props;
        //实例一个线的全局变量
        var geometry = new ol.geom.LineString(); //线,Point 点,Polygon 面
        console.log('画线', files, patrolRoutesValue, color);
        if (files) {
            for (var i = 0; i < files.length; i++) {
                if (files[i].label_gps_point) {
                    console.log('sourceType', sourceType, 'isDraw', isDraw);
                    //根据参数sourceType判断 是否为点击菜单栏的绘制请求  *  onlySource是
                    if (sourceType == 'onlySource') {
                        lineFeature = new ol.Feature({
                            geometry: new ol.geom.LineString(files[i].label_gps_point),
                            typeName: types,
                            eqNum: files[i].label_id,
                        });
                        lineFeature.setStyle(
                            new ol.style.Style({
                                stroke: new ol.style.Stroke({
                                    color: '#faad14',
                                    size: 6,
                                    width: 3,
                                }),
                            }),
                        );
                        lineFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                        this.state[sourceType].addFeature(lineFeature);
                    } else {
                        lineFeature = new ol.Feature({
                            geometry: new ol.geom.LineString(
                                isDraw
                                    ? files[i].label_id != patrolRoutesValue.label_id
                                        ? files[i].label_gps_point
                                        : []
                                    : files[i].label_gps_point,
                            ),
                            typeName: types,
                            eqNum: files[i].label_id,
                        });
                        lineFeature.setStyle(
                            new ol.style.Style({
                                stroke: new ol.style.Stroke({
                                    color: color,
                                    size: 6,
                                    width: 3,
                                    lineDash: [1, 2, 3, 4, 5, 6],
                                }),
                            }),
                        );
                        lineFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                        this.state[sourceType].addFeature(lineFeature);
                    }
                }
            }
            //判断是否为点击菜单栏触发的显示
            if (sourceType == 'onlySource') {
                this.state[vectorType].setSource(this.state[sourceType]);
                if (files[0].label_gps_point) {
                    for (let i = 0; i < files[0].label_gps_point.length; i++) {
                        arr.push(ol.proj.fromLonLat(files[0].label_gps_point[i]));
                    }
                    //设置中心点
                    let exent = ol.extent.boundingExtent(arr);
                    let center = ol.extent.getCenter(exent);
                    view.fit(exent);
                    view.setCenter(center);
                }
            } else {
                this.state[vectorType].setSource(this.state[sourceType]);
            }
        }
    };
    showBreakPointLoop = (files, types, color, vectorType, sourceType, kkk) => {
        var _self = this;
        // this.setState({ determine: 'edit' });
        let {
            view,
            map,
            draw,
            modify,
            select,
            circle,
            newSource,
            breakPointVector,
            onlySource,
            isDraw,
            patrolRoutesValue,
            breakPointValue,
        } = this.state;
        let pointFeature = null;
        const {
            service: { gpsList },
        } = this.props;
        let arr = [];
        //实例一个线的全局变量
        var geometry = new ol.geom.Point(); //线,Point 点,Polygon 面
        console.log('画点休息', files);
        if (files) {
            for (var i = 0; i < files.length; i++) {
                if (files[i].label_gps_point) {
                    console.log('画点休息', files[i].label_gps_point, sourceType);

                    if (sourceType == 'onlySource') {
                        pointFeature = new ol.Feature({
                            geometry: new ol.geom.Point(files[i].label_gps_point),
                            typeName: types,
                            eqNum: files[i].label_id,
                        });
                        pointFeature.setStyle(
                            new ol.style.Style({
                                image: new ol.style.Icon({
                                    scale: 1.1, // 图标缩放比例 // 0为离线其他为在线
                                    src: './image/syxxd.png', // 图标的url
                                }),
                            }),
                        );
                        pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                        this.state[sourceType].addFeature(pointFeature);
                    } else {
                        console.log(
                            '点的位置',
                            isDraw
                                ? files[i].label_id != breakPointValue.label_id
                                    ? files[i].label_gps_point
                                    : []
                                : files[i].label_gps_point,
                            '--------',
                        );
                        pointFeature = new ol.Feature({
                            geometry: new ol.geom.Point(
                                isDraw
                                    ? files[i].label_id != breakPointValue.label_id
                                        ? files[i].label_gps_point
                                        : []
                                    : files[i].label_gps_point,
                            ),
                            typeName: types,
                            eqNum: files[i].label_id,
                        });
                        pointFeature.setStyle(
                            new ol.style.Style({
                                image: new ol.style.Icon({
                                    scale: 1.1, // 图标缩放比例 // 0为离线其他为在线
                                    src: './image/syxxd_1.png', // 图标的url
                                }),
                            }),
                        );
                        pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                        this.state[sourceType].addFeature(pointFeature);
                    }
                }
            }
            //判断是否为点击菜单栏触发的显示
            if (sourceType == 'onlySource') {
                this.state[vectorType].setSource(this.state[sourceType]);
                console.log(files);
                if (files[0].label_gps_point) {
                    // for (let i = 0; i < files[0].label_gps_point.length; i++) {
                    arr.push(ol.proj.fromLonLat(files[0].label_gps_point));
                    // }

                    //设置中心点
                    let exent = ol.extent.boundingExtent(arr);
                    let center = ol.extent.getCenter(exent);
                    view.fit(exent);
                    view.setCenter(center);
                }
            } else {
                this.state[vectorType].setSource(this.state[sourceType]);
            }
        }
    };
    showTourPointLoop = (files, types, color, vectorType, sourceType, kkk) => {
        var _self = this;
        // this.setState({ determine: 'edit' });
        let {
            view,
            map,
            draw,
            modify,
            select,
            circle,
            newSource,
            tourPointVector,
            onlySource,
            isDraw,
            patrolRoutesValue,
            tourPointValue,
        } = this.state;
        let pointFeature = null;
        const {
            service: { gpsList },
        } = this.props;
        let arr = [];
        //实例一个线的全局变量
        var geometry = new ol.geom.Point(); //线,Point 点,Polygon 面
        console.log('画点', types);
        if (files) {
            for (var i = 0; i < files.length; i++) {
                if (files[i].label_gps_point) {
                    if (sourceType == 'onlySource') {
                        pointFeature = new ol.Feature({
                            geometry: new ol.geom.Point(files[i].label_gps_point),
                            typeName: types,
                            eqNum: files[i].label_id,
                        });
                        pointFeature.setStyle(
                            new ol.style.Style({
                                image: new ol.style.Icon({
                                    scale: 1.1, // 图标缩放比例 // 0为离线其他为在线
                                    src: './image/syzxd.png', // 图标的url
                                }),
                            }),
                        );
                        pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                        this.state[sourceType].addFeature(pointFeature);
                    } else {
                        pointFeature = new ol.Feature({
                            geometry: new ol.geom.Point(
                                isDraw
                                    ? files[i].label_id != tourPointValue.label_id
                                        ? files[i].label_gps_point
                                        : []
                                    : files[i].label_gps_point,
                            ),
                            typeName: types,
                            eqNum: files[i].label_id,
                        });
                        pointFeature.setStyle(
                            new ol.style.Style({
                                image: new ol.style.Icon({
                                    scale: 1.1, // 图标缩放比例 // 0为离线其他为在线
                                    src: './image/syzxd_1.png', // 图标的url
                                }),
                            }),
                        );
                        pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                        this.state[sourceType].addFeature(pointFeature);
                    }
                }
            }
            //判断是否为点击菜单栏触发的显示
            if (sourceType == 'onlySource') {
                this.state[vectorType].setSource(this.state[sourceType]);
                console.log(files);
                if (files[0].label_gps_point) {
                    // for (let i = 0; i < files[0].label_gps_point.length; i++) {
                    arr.push(
                        ol.proj.fromLonLat([
                            files[0].label_gps_point[0],
                            files[0].label_gps_point[1],
                        ]),
                    );
                    // }

                    //设置中心点
                    let exent = ol.extent.boundingExtent(arr);
                    let center = ol.extent.getCenter(exent);
                    view.fit(exent);
                    view.setCenter(center);
                }
            } else {
                this.state[vectorType].setSource(this.state[sourceType]);
            }
        }
    };

    /**
     *  图层初始化
     *  */
    initLayers = () => {
        console.log('初始化');
        const {
            map,
            vector,
            breakPointVector,
            showVector,
            patrolRoutesVector,
            patrolRoutesZdVector,
            tourPointVector,
            patrolGridVector,
            select,
            modify,
            source,
            newSource,
            patrolGridSource,
            patrolRoutesSource,
            patrolRoutesZdSource,
            breakPointSource,
            tourPointSource,
            onlySource,
        } = this.state;
        vector.setSource(null);
        showVector.setSource(null);
        patrolRoutesVector.setSource(null);
        patrolRoutesZdVector.setSource(null);
        tourPointVector.setSource(null);
        patrolGridVector.setSource(null);
        breakPointVector.setSource(null);
        select.setActive(false);
        modify.setActive(false);
        source.clear();
        newSource.clear();
        patrolGridSource.clear();
        patrolRoutesSource.clear();
        patrolRoutesZdSource.clear();
        tourPointSource.clear();
        breakPointSource.clear();
        onlySource.clear();
    };
    partialInitLayers = () => {
        const {
            map,
            vector,
            breakPointVector,
            showVector,
            patrolRoutesVector,
            patrolRoutesZdVector,
            tourPointVector,
            patrolGridVector,
            select,
            modify,
            source,
            newSource,
            onlySource,
        } = this.state;
        vector.setSource(null);
        patrolRoutesVector.setSource(null);
        patrolRoutesZdVector.setSource(null);
        tourPointVector.setSource(null);
        patrolGridVector.setSource(null);
        onlySource.clear();
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
        console.log(treeValue, expandedKeysName, expandedKeys);
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
                // console.log('cunwanle lllllll')
                if (expandedKeys.length) {
                    this.getGpsList(expandedKeys[0]);
                }
            },
        );
    };
    onExpand = expandedKeys => {
        console.log('expandedKeysl', expandedKeys);
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
                // console.log(item.name.indexOf(value))
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

        console.log('巡逻网格', e, this.state.patrolGrid);
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
            patrolGridVector.setSource(null);
            patrolGridSource.clear();
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

        console.log('巡逻线路', this.state.patrolRoutes);
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
            patrolRoutesVector.setSource(null);
            patrolRoutesSource.clear();
            this.setState({ patrolRoutes: e, disabledPatrolRoutes: e });
        }
    };
    showZdxl = navigationAllList => {
        console.log('navigationAllList', navigationAllList);
        let colorList = [
            '#fc5c65',
            '#d57a09',
            '#5358FD',
            '#006f0b',
            '#a46e01',
            '#596801',
            '#9f5cfc',
            '#7f4d0f',
            '#67697f',
            '#46844b',
            '#14b140',
            '#355d72',
        ];
        const { patrolRoutesZdVector, patrolRoutesZdSource } = this.state;
        let num = 0;
        navigationAllList.map(item => {
            let list = item.result && item.result.list ? item.result.list : [];
            list.map(event => {
                let pointsList = event.item;
                let poitnts = [];
                pointsList.map(e => {
                    let latlon = e.turnlatlon.split(',');
                    poitnts.push([Number(latlon[0]),Number(latlon[1])]);
                });
                const polygonFeature = new ol.Feature({
                    geometry: new ol.geom.LineString(poitnts),
                });
                polygonFeature.setStyle(
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: colorList[num] ? colorList[num] : '#5358FD',
                            size: 3,
                            width: 3,
                        }),
                    }),
                );
                num++;
                polygonFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                patrolRoutesZdSource.addFeature(polygonFeature);
                patrolRoutesZdVector.setSource(patrolRoutesZdSource);
            });
        });
    };
    showJq = getBagList => {
        console.log('policeAlarmList', getBagList);
        getBagList.map((item, index) => {
            console.log('index', index);
            item.map(event => {
                const { patrolRoutesZdVector, patrolRoutesZdSource, map } = this.state;
                const pointFeature = new ol.Feature({
                    geometry: new ol.geom.Point(this.transform(event.x, event.y)),
                    typeName: 'Point',
                });
                pointFeature.setStyle(
                    new ol.style.Style({
                        image: new ol.style.Icon({
                            scale: 0.3, // 图标缩放比例 // 0为离线其他为在线
                            src:
                                index == 0
                                    ? './image/qz1.png'
                                    : index == 1
                                    ? './image/qz2.png'
                                    : './image/qz3.png', // 图标的url
                        }),
                    }),
                );
                pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857'); // location.push(position)
                patrolRoutesZdSource.addFeature(pointFeature);
                patrolRoutesZdVector.setSource(patrolRoutesZdSource);
            });
        });
    };
    showCircle = cirList => {
        console.log('cirList', cirList);
        if (cirList) {
            const { patrolRoutesZdVector, patrolRoutesZdSource, map } = this.state;
            cirList.map(item => {
                const pointFeature = new ol.Feature({
                    geometry: new ol.geom.Circle(
                        this.transform(item.centerPoint.x, item.centerPoint.y),
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
        console.log('e', e);
        const {
            treeValue,
            patrolRoutesZdVector,
            patrolRoutesZdSource,
            timeType,
            source,
        } = this.state;
        if (e) {
            if (treeValue == '') {
                message.error('请选择组织机构');
                this.setState({ disabledZdxl: false });
                return false;
            } else {
                this.setState({ patrolRoutesZd: e, disabledZdxl: e, isRender: true }, () => {
                    if (e) {
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
                                if (!res.reason) {
                                    console.log('res.result:', res.result);
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
            // source.clear();
        } else {
            if (this.state.jgfw) {
                this.showInstitutions(this.state.jgfw);
            }
            patrolRoutesZdVector.setSource(null);
            patrolRoutesZdSource.clear();
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

        console.log('驻巡点', this.state.tourPoint);
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
            tourPointVector.setSource(null);
            tourPointSource.clear();
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

        console.log('休息点', this.state.breakPoint);
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
            breakPointVector.setSource(null);
            breakPointSource.clear();
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
        console.log(files, arr, '-=-=-=-=');
        const {
            patrolGridSource,
            tourPointSource,
            breakPointSource,
            patrolRoutesSource,
        } = this.state;
        patrolGridSource.clear();
        tourPointSource.clear();
        breakPointSource.clear();
        patrolRoutesSource.clear();
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
        // console.log(feature, drawType, '样式', feature.get('NAME'));
        if (drawType == 3) {
            // console.log('xuandain点');
            return new ol.style.Style({
                image: new ol.style.Icon({
                    scale: 1.1, // 图标缩放比例 // 0为离线其他为在线
                    src: './image/syzxd.png', // 图标的url
                }),
            });
        } else if (drawType == 4) {
            // console.log('xuandain点');
            return new ol.style.Style({
                image: new ol.style.Icon({
                    scale: 1.1, // 图标缩放比例 // 0为离线其他为在线
                    src: './image/syxxd.png', // 图标的url
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

    //画点线面的方法 根据type 切换
    drawFeature = (files, type) => {
        // 添加一个绘制的线使用的layer
        var _self = this;
        console.log('draw的方式');
        document.getElementById('map').onmouseover = function() {
            // this.style.cursor = "url('./image/pen.png'),w-resize";
            this.style.cursor = 'copy';
        };
        this.setState({ determine: 'new', drawType: type });
        let { source, vector, view, map, draw, modify, select, circle } = this.state;
        let drawArr = [];
        map.removeInteraction(draw); //移除绘制图形
        const lineLayer = new ol.layer.Vector({
            source: source,
            style: function(feature) {
                return _self.styleSelect(feature);
            },
        });
        map.addLayer(lineLayer);
        draw = new ol.interaction.Draw({
            type: files,
            source: lineLayer.getSource(), // 注意设置source，这样绘制好的线，就会添加到这个source里
            style: function(feature) {
                return _self.styleSelect(feature);
            },
            //   minPoints:     // 限制不超过4个点
        });

        map.addInteraction(draw);

        //监听绘制动作是否开始
        draw.on('drawstart', function(event) {
            console.log('开始画了============');
            if (!_self.state.limit) {
                console.log('开始画了1111============');
                draw.setActive(false);
                return false;
            }

            _self.setState({ createBtn: false, isCancel: false });
        });
        // 监听线绘制结束事件，获取坐标
        draw.on('drawend', function(event) {
            draw.setActive(false);
            select.setActive(true); //激活选择要素控件
            modify.setActive(true);
            console.log('===========1');
            _self.setState({
                drawGps: event.feature.getGeometry(),
                source: source,
                vector: vector,
                draw: draw,
                select: select,
                modify: modify,
                createBtn: true,
                isCancel: false,
                isEdit: false,
            });
        });
        modify.on('modifyend', function(e) {
            //   console.log('===========2',  e.features.item(0).getGeometry())
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
    editPolygon = () => {
        //    this.setState({determine: 'edit'})
        document.getElementById('map').onmouseover = function() {
            this.style.cursor = 'all-scroll';
        };
        let {
            vector,
            view,
            map,
            draw,
            modify,
            showVector,
            select,
            circle,
            source,
            drawType,
        } = this.state;
        this.setState({
            createBtn: true,
            determine: 'edit',
            limit: true,
            isEdit: true,
            isCancel: false,
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
                isEdit: true,
            });
        });
    };
    //分类绘画方式
    onDraw = () => {
        console.log(this.state.drawTitle);
        this.setState({ limit: true, createBtn: true, isCancel: true });
        this.props.prompt(true);
        switch (this.state.drawTitle) {
            case '网格':
                this.drawFeature('Polygon', 2);
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
        // console.log('保存', drawGps,drawGps.transform('EPSG:3857', 'EPSG:4326').getCoordinates())
        let newdrawGps = [];
        if (drawType == 2) {
            newdrawGps = drawGps.transform('EPSG:3857', 'EPSG:4326').getCoordinates()[0];
        } else {
            newdrawGps = drawGps.transform('EPSG:3857', 'EPSG:4326').getCoordinates();
        }

        // console.log('保存1', drawGps, drawGps.transform('EPSG:3857', 'EPSG:4326').getCoordinates())
        console.log(
            'baoxun',
            expandedKeysName,
            '///',
            drawType,
            '---',
            treeValue,
            '===',
            parentKeys,
            '***',
            expandedKeysId,
            '￥￥￥￥',
            labelId,
            '&&&&',
        );
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

                    this.setState({
                        createBtn: false,
                        isGpsPiont: true,
                        limit: false,
                        isEdit: false,
                        isRender: true,
                    });
                    this.getGpsList(treeValue);
                    this.props.prompt(false);
                    console.log('保存=-====', drawType);
                } else {
                    Message.error('保存失败');
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
        if (!isEdit) {
            draw.setActive(false);
            map.removeInteraction(draw);
        }
        // console.log(drawType, patrolGridValue, patrolRoutesValue, tourPointValue, breakPointValue)
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

        select.getFeatures().clear();
        //    frameModule
        this.getGpsList(treeValue);
        this.initLayers();
        //  this.frameModule(formData, [ formData ])
        this.setState({ createBtn: false, limit: false, isEdit: false, isRender: true });
        document.getElementById('map').onmouseover = function() {
            // this.style.cursor = "url('./image/pen.png'),w-resize";
            this.style.cursor = 'auto';
        };
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
                console.log(fieldsValue);
                console.log(expandedKeysName, treeValue, parentKeys, expandedKeysId);
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
        console.log(drawType);
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
                            onlySource.clear();
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
                                console.log('xiangt----');
                                _self.setState({
                                    selectMenuValue: '',
                                });
                            }
                            _self.initLayers();
                            _self.state.onlySource.clear();
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
        console.log(value);
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
        onlySource.clear();
        console.log(files, items);
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
        onlySource.clear();
        console.log(files, items);
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
        this.state.onlySource.clear();
        console.log(files, items);
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
                        <Menu.Item key="1" onClick={() => this.editPolygon()}>
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

export default Form.create()(Organization);
