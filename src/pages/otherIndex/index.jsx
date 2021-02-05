import React, { Component, useState } from 'react';
import moment from 'moment';
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
    Modal,
    Input,
    Upload,
    Tooltip,
    Select,
    Spin,
    Message,
} from 'antd';
import { connect } from 'dva';
import ol from 'openlayers';
import Calendar from 'react-calendar';
import styles from './index.less';
import webSocketClient from '@/components/websocket/webSocketService';
import { connect as mqttConnect } from 'mqtt';
import { offlineMapLayer, initView } from '@/utils/olUtils';
import { setInterval } from 'timers';
import Statistical from './compontent/statistical';
import LeaderDuty from './compontent/leaderDuty';
import Called from './compontent/called';
import TodayCheck from './compontent/todayCheck';
import WarningList from './compontent/warningList';
import SearchEngine from './compontent/searchEngine';
import SwitchList from './compontent/switchList';
import Equipment from './compontent/equipment';
import SnapList from './compontent/snapList';
import SnapPeDetail from './compontent/SnapPeDetail';
import SnapVeDetail from './compontent/snapVeDetail';
import WarningDetails from './compontent/warningDetails';
import VehicleDetail from './compontent/vehicleDetail';
import Patrolwarning from './compontent/patrolwarning';
import WrittenWarning from './compontent/writtenWarning';
import TrafficWarning from './compontent/trafficWarning';
import VideoPlayers from './VideoPlayers/VideoPlayers';
import SynergyDetail from './compontent/synergyDetail';
import hylink from '@/assets/hylink.png';
import VideoPlayer from '@/components/VideoPlayer/VideoPlayer';
import vedio1 from '@/assets/vedio1.png';
import vedio2 from '@/assets/vedio2.png';
import vedio3 from '@/assets/vedio3.png';
import Vedio1 from '@/assets/vedio1-1.png';
import Vedio2 from '@/assets/vedio2-1.png';
import Vedio3 from '@/assets/vedio3-1.png';
import gj from '@/assets/gj.png';
import bk from '@/assets/bk.png';
import FormModal from '../instruction/components/FormModal';
import { tableList } from '@/utils/utils';
let swanVideoList = [];
var latreg = /^(\-|\+)?([0-8]?\d{1}\.\d{0,15}|90\.0{0,15}|[0-8]?\d{1}|90)$/;
var longrg = /^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,15})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,15}|180)$/;
const { Option } = Select;
let colors = [
    '#dcb60f',
    '#fb3636',
    '#25cb4e',
    '#30b8f6',
    '#6136fb',
    '#b636fb',
    '#fb36b9',
    '#eefb36',
    '#dcb60f',
    '#fb3636',
    '#25cb4e',
    '#30b8f6',
    '#6136fb',
    '#b636fb',
    '#fb36b9',
    '#eefb36',
];
const FormItem = Form.Item;
@connect(({ otherIndex, captureList, loading, instruction }) => ({
    otherIndex,
    captureList,
    instruction,
    loading: loading.models.otherIndex,
}))
class otherIndex extends Component {
    constructor(props) {
        super(props);

        // this.client = mqttConnect(window.configUrl.mqttUrl)
        // this.client.on('connect', this.connect)
        // this.client.on('message', this.message)
        this.wc = null;
        this.called = null;
        this.disX = 0;
        this.disY = 0;
        this.disX1 = 0;
        this.disY1 = 0;
        // this.localClient = mqttConnect(window.configUrl.localhostMqttUrl);
        // this.localClient.on('connect', this.localConnect);
        // this.localClient.on('message', this.localMessage);
    }

    state = {
        map: null,
        view: null,
        vector: null,
        overlay: null,
        source: null,
        sourceHeat: null,
        vectorHeat: null,
        sourcePersonHeat: null,
        vectorPersonHeat: null,
        sourceCar: null,
        policeAlarmOverlay: null,
        showCarVector: null,
        sourceIntercom: null,
        showIntercomVector: null,
        sourceIndividual: null,
        showIndividualVector: null,
        sourceSwan: null,
        showSwanVector: null,
        sourceMonitoring: null,
        showMonitoringVector: null,
        sourceKeyPlace: null,
        showKeyPlaceVector: null,
        sourcePoliceStation: null,
        showPoliceStationVector: null,
        sourceJurisdiction: null,
        showJurisdictionVector: null,
        sourceWarning: null,
        showWaringVector: null,
        sourcePoliceDetails: null,
        showPoliceDetailsVector: null,
        sourceWd: null,
        showWdVector: null,
        warnings: null,
        overlayWarning: null,
        sourceTrajectory: null,
        showTrajectoryVector: null,
        sourceSearchBar: null,
        showSearchBarVector: null,
        searchBar: null,
        overlaySearchBar: null,
        policesOverlay: null,
        content: null,
        alarmcon: null,
        personImg: '',
        showHeat: false, //热力图
        showPersonHeat: false, //人流热力图
        showVehicle: true, //警车
        showAlert: false, //警情
        showIntercom: false, //对讲机
        showIndividual: false, //单兵设备
        showSwan: false, //卡口
        showMonitoring: false, //监控
        hdCamera: false, //高清监控
        ordinaryCamera: false, //标清监控
        remoteCamera: false, //高点监控
        showStation: false, //警务站
        showPlace: false, //重点场所
        showJurisdiction: true, //查看辖区
        showOperateWith: false, //查看协同作战列表

        policeAlarmCounts: {}, //警情统计列表
        schedules: {}, //当日勤务信息
        individualList: [], //单兵设备列表
        policeAlarmList: [], //警情列表
        comparisonList: [], //核查统计
        vehicleGpsList: [], //车辆列表
        vehicleStatusList: [], //车辆状态
        heatList: [], //警情热力图
        heatPersonList: [], //警情热力图
        alarmList: [], //预警列表
        intercomList: [], //对讲机列表
        swanList: [], //卡口列表
        carTrajectoryGps: [], //点击轨迹时车的gps
        selectVehicleInfor: [], //选中的车辆信息
        monitoringList: [], //监控列表
        captureList: [], //抓拍列表数据
        keyPlaceList: [], //重点场所列表
        policeStationList: [], //警务站列表
        vehicleInfor: false, //车辆信息为true  全局为false
        isOneRender: false,
        vehicleDetailInfor: {}, //车辆信息
        vehicleState: false, //车辆信息状态
        vehicleid: '', //切换车辆ID
        gxdwdm: '', //切换车辆管辖机构代码
        vehicleComparisonList: [], //车辆核查统计
        policeDetails: {}, //接处警详情
        searchDetailsType: '', //检索类型
        searchDetails: {}, //检索详情
        alarmType: null, //预警详情类型
        alarmDetails: {}, //预警详情
        showAlarmDetails: false, //现实预警详情
        showTrajectory: false, //判断是否显示轨迹
        showWarningsCon: false, //警情具体内容显示
        showVideo: false, //是否显示车辆视频
        videoInfor: [], //车辆视频内容
        showSnapPe: false, //显示抓拍详情 人
        showSnapVe: false, //显示抓拍详情 车
        snapDetails: {}, //抓拍详情数据
        singleWaring: false, //判断是单一的警情
        multipleWaring: false, //判断是全部的警情
        selectedMultiple: {},
        showTopSynergy: false, //协同作战顶部
        switchSynergy: false, //协同作战列表展示
        showSynergyDetail: false, //显示协同作战详情
        synergyDetail: {}, //协同作战详情
        lock: false, //云台控制防连点
        swanVideoList: [],
        needX: (document.body.offsetWidth - 1145) / 2,
        needY: 150,
        needX1: (document.body.offsetWidth - 1145) / 2,
        needY1: 150,
        isSmall: false,
        isBig: false,
        len: 1,
        visible: false,
        previewVisible: false,
        previewImage: '',
        filePersonList: [],
        fileCarList: [],
        draw: null,
        isWd: false,
        isLeftHide: false,
        isRightHide: false,
        jqHide: false,
    };
    // connect = () => {
    // 	const topic = 'Ret/backstage/alarm/#'
    // 	this.client.subscribe(topic)
    // }
    // message = (topic, res) => {
    // 	const vehicleGpsList = this.state.vehicleGpsList
    // 	const monitoringList = this.state.monitoringList
    // 	const info = JSON.parse(res.toString())
    // 	const topics = topic.substring(topic.lastIndexOf('/') + 1)
    // 	const { showMonitoring, abnormalPeoples } = this.state
    // 	console.log('MQTT接收到info', info, topics)

    // }
    componentWillMount() {}
    componentDidMount() {
        // 初始化地图
        this.initMap();
        this.equipmentType();
        this.getSocket();
        this.getUseDept();
        if (sessionStorage.getItem('synergyId')) {
            this.queryCoordinatedParticipantIsEnd();
        }
    }
    queryCoordinatedParticipantIsEnd = files => {
        const { dispatch } = this.props;
        // equipmentType
        dispatch({
            type: 'otherIndex/queryCoordinatedParticipantIsEnd',
            payload: { coordinated_operations_id: files || sessionStorage.getItem('synergyId') },
            success: e => {
                if (e.result.reason.code == '200') {
                    if (e.result.flag == '1') {
                        this.setState({
                            showTopSynergy: false,
                        });
                    }
                    if (e.result.flag == '0') {
                        this.setState({
                            showTopSynergy: true,
                        });
                    }
                } else {
                    return false;
                }
            },
        });
    };
    toExit = () => {
        const { dispatch } = this.props;
        const { synergyDetail } = this.state;

        const user = JSON.parse(sessionStorage.getItem('user'));
        dispatch({
            type: 'otherIndex/endCombined',
            payload: {
                coordinated_operations_id: synergyDetail.coordinated_operations_id,
                organization_code: user.group.code,
                is_launch: 0,
            },
            success: e => {
                if (e.result.reason.code == '200') {
                    console.log(e, 'xiangqi=====');
                    sessionStorage.removeItem('synergyId');
                    message.destroy();
                    message.success('退出协同作战成功！');
                    this.toSynergyDetail(synergyDetail, false);
                    this.queryCoordinatedParticipantIsEnd(synergyDetail.coordinated_operations_id);
                } else {
                    message.destroy();
                    message.error('退出协同作战失败，请稍后重试！');
                    return false;
                }
            },
        });
    };
    getSocket = parameter => {
        const {
            showHeat,
            showVehicle,
            showAlert,
            showIntercom,
            showIndividual,
            showPersonHeat,
        } = this.state;
        const _self = this;
        console.log(this.state);
        // heartbeatInterval: window.configUrl.heartbeatInterval, //心跳时间
        this.wc = new webSocketClient({
            url: window.configUrl.websocketNew,
            globalParams: {
                token: sessionStorage.getItem('userToken'),
                government: JSON.parse(sessionStorage.getItem('groupListCode')),
                individualEquipmentFlag: _self.state.showIndividual,
                policeTongFlag: _self.state.showIndividual,
                bodyWornFlag: _self.state.showIndividual,
                intercomFlag: _self.state.showIntercom,
                policeAlarmFlag: _self.state.showAlert,
                thermodynamicChartFlag: _self.state.showHeat,
                crowdDensity: _self.state.showPersonHeat,
                vehicleFlag: _self.state.showVehicle,
            },
            heartbeatInterval: window.configUrl.heartbeatInterval, //心跳时间
            messageCallback: files => {
                console.log('收到信息===', files);
                let individualList = [];
                if (files.policeTongList && files.policeTongList.length > 0) {
                    files.policeTongList.map(item => {
                        item.isZl = true;
                    });
                    individualList = individualList.concat(
                        files.policeTongList ? files.policeTongList : [],
                    );
                }
                individualList = individualList.concat(
                    files.bodyWornCameraList ? files.bodyWornCameraList : [],
                );
                console.log('单兵=====>', individualList);
                this.setState(
                    {
                        policeAlarmCounts: files.policeAlarmCounts || {},
                        schedules: files.schedules || {},
                        individualList: individualList || [],
                        heatList: files.policeAlarmList || [],
                        heatPersonList: files.wifiDeviceList || [],
                        comparisonList: files.comparisonList || [],
                        vehicleGpsList: files.vehicleGpsList || [],
                        vehicleStatusList: files.vehicleStatusList || [],
                        alarmList: files.alarmList || [],
                        intercomList: files.intercomList || [],
                        policeAlarmList: files.policeAlarm || [],
                        captureList: files.captureList || [],
                    },
                    () => {
                        if (_self.state.showHeat) {
                            _self.getHeatMap();
                        }
                        if (_self.state.showPersonHeat) {
                            _self.getHeatPersonMap();
                        }

                        // if(!_self.state.showTrajectory){
                        const zooms = _self.state.view.getZoom();
                        // _self.getIntercomMap()
                        if (_self.state.vehicleState) {
                            console.log(_self.state.vehicleid, 'xuanzhongde =====', zooms);
                            const gpss = files.vehicleGpsList.find(
                                v => v.vehicle_id == _self.state.vehicleid,
                            ).gps_point;
                            _self.getVehicleMap(false);

                            if (!_self.state.showTrajectory) {
                                _self.state.overlay.setPosition(
                                    ol.proj.fromLonLat(this.transform(gpss[0], gpss[1])),
                                );
                                //设置中心点
                                let cenarr = [];
                                cenarr.push(ol.proj.fromLonLat(this.transform(gpss[0], gpss[1])));
                                let exent = ol.extent.boundingExtent(cenarr);
                                let center = ol.extent.getCenter(exent);

                                _self.state.view.fit(exent);
                                _self.state.view.setZoom(zooms);
                                _self.state.view.setCenter(center);
                            }
                        } else {
                            _self.getVehicleMap(false);
                        }

                        // }
                        if (_self.state.showIntercom) {
                            _self.getPiontMap(
                                _self.state.intercomList,
                                false,
                                'sourceIntercom',
                                'showIntercomVector',
                                './image/djj_0.png',
                                'intercom',
                                'gps_point',
                            );
                        }
                        if (_self.state.showIndividual) {
                            _self.getPiontMap(
                                _self.state.individualList,
                                false,
                                'sourceIndividual',
                                'showIndividualVector',
                                './image/dbsb_1.png',
                                'individual',
                                'gps_point',
                            );
                        }
                        if (_self.state.showAlert) {
                            _self.getWarningMap();
                        }

                        // _self.getIndividualMap()
                    },
                );
            },

            errorCallback: err => console.log(err),
            closeCallback: msg => {
                console.log(msg);
                this.wc.close();
            },
            //连接成功后
            openCallback: () => {
                console.log('websocket链接已启动');
                this.wc.send({
                    // "projectCode": port.webSocket.projectCode,
                    token: sessionStorage.getItem('userToken'),
                    government: JSON.parse(sessionStorage.getItem('groupListCode')),
                    individualEquipmentFlag: _self.state.showIndividual,
                    policeTongFlag: _self.state.showIndividual,
                    bodyWornFlag: _self.state.showIndividual,
                    intercomFlag: _self.state.showIntercom,
                    policeAlarmFlag: _self.state.showAlert,
                    thermodynamicChartFlag: _self.state.showHeat,
                    crowdDensity: _self.state.showPersonHeat,
                    vehicleFlag: _self.state.showVehicle,
                });
            },
        });
    };
    componentWillUnmount() {
        console.log(this.wc);
        if (this.wc) {
            if (this.wc.wsObject) {
                if (this.wc.wsObject.onclose) {
                    this.wc.wsObject.onclose();
                }
            }
        }
    }
    getUseDept = () => {
        const { dispatch } = this.props;
        let codes = [];
        const groupList = JSON.parse(sessionStorage.getItem('user')).groupList;
        for (var i = 0; i < groupList.length; i++) {
            codes.push(groupList[i].code);
        }
        if (codes.length == groupList.length) {
            dispatch({
                type: 'instruction/getUseDept',
                payload: {
                    // department: JSON.parse(sessionStorage.getItem('user')).department,
                    groupList: codes,
                },
            });
        }
    };
    equipmentType = () => {
        const { dispatch } = this.props;
        // equipmentType
        dispatch({
            type: 'otherIndex/policeQuery',
            payload: { code: window.configUrl.dictionariesEquipmentType },
        });
    };
    clickfu = () => {};
    //地图
    initMap = () => {
        let circle; // 绘制对象
        var _self = this;
        let policesOverlay;
        // 创建地图
        const view = initView();
        // 指定地图要显示在id为map的div中
        const map = new ol.Map({
            view,
            target: 'map',
        });
        map.addLayer(offlineMapLayer()); // 将地图加载上来

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
        const sourceHeat = new ol.source.Vector({});
        const vectorHeat = new ol.layer.Heatmap({
            source: sourceHeat,
            blur: parseInt(22, 10),
            radius: parseInt(18, 15),
            gradient: ['#04fbb2', '#18fb04', '#fbd804', '#f94000', '#b30303'], //颜色
        });
        const sourcePersonHeat = new ol.source.Vector({});
        const vectorPersonHeat = new ol.layer.Heatmap({
            source: sourcePersonHeat,
            blur: parseInt(20, 17),
            radius: parseInt(18, 15),
            gradient: ['#75fad4', '#65fd68', '#b846ff', '#6200ff', '#000dff'], //颜色
        });
        const sourceCar = new ol.source.Vector({});
        const showCarVector = new ol.layer.Vector({
            source: sourceCar,
        });
        const sourceIntercom = new ol.source.Vector({});
        const showIntercomVector = new ol.layer.Vector({
            source: sourceIntercom,
            zIndex: 9,
        });
        const sourceIndividual = new ol.source.Vector({});
        const showIndividualVector = new ol.layer.Vector({
            source: sourceIndividual,
            zIndex: 9,
        });
        const sourceSwan = new ol.source.Vector({});
        const showSwanVector = new ol.layer.Vector({
            source: sourceSwan,
            zIndex: 9,
        });
        const sourceMonitoring = new ol.source.Vector({});
        const showMonitoringVector = new ol.layer.Vector({
            source: sourceMonitoring,
            zIndex: 9,
        });
        const sourceKeyPlace = new ol.source.Vector({});
        const showKeyPlaceVector = new ol.layer.Vector({
            source: sourceKeyPlace,
            zIndex: 9,
        });
        const sourcePoliceStation = new ol.source.Vector({});
        const showPoliceStationVector = new ol.layer.Vector({
            source: sourcePoliceStation,
            zIndex: 9,
        });
        const sourceJurisdiction = new ol.source.Vector({});
        const showJurisdictionVector = new ol.layer.Vector({
            source: sourceJurisdiction,
        });
        const sourceWd = new ol.source.Vector({});
        const showWdVector = new ol.layer.Vector({
            source: sourceWd,
        });
        const sourceWarning = new ol.source.Vector({});
        const showWaringVector = new ol.layer.Vector({
            source: sourceWarning,
            zIndex: 9,
        });
        const sourcePoliceDetails = new ol.source.Vector({});
        const showPoliceDetailsVector = new ol.layer.Vector({
            source: sourcePoliceDetails,
            zIndex: 9,
        });
        const sourceSearchBar = new ol.source.Vector({});
        const showSearchBarVector = new ol.layer.Vector({
            source: sourceSearchBar,
            zIndex: 9,
        });
        const sourceTrajectory = new ol.source.Vector({});
        const showTrajectoryVector = new ol.layer.Vector({
            source: sourceTrajectory,
            zIndex: 9,
        });

        var searchBarBody = document.getElementById('searchBar');
        var searchBar = document.getElementById('searchBar-content');
        var warningBody = document.getElementById('warnings');
        var warnings = document.getElementById('warnings-content');

        var container = document.getElementById('popup');
        var content = document.getElementById('popup-content');
        var alarmBody = document.getElementById('alarm');
        var alarmcon = document.getElementById('alarm-content');
        // 创建一个overlay, 绑定html元素container
        var overlay = new ol.Overlay(
            /** @type {olx.OverlayOptions} */ {
                element: container,
                autoPan: true,
                positioning: 'bottom-center',
                stopEvent: false,
                // offset: [ 2, -18]
                // autoPanAnimation: {
                // 	duration: 250
                // }
            },
        );
        // 创建一个overlay, 绑定html元素warningBody
        var overlayWarning = new ol.Overlay(
            /** @type {olx.OverlayOptions} */ {
                element: warningBody,
                autoPan: true,
                positioning: 'right-center',
                stopEvent: false,
                autoPanAnimation: {
                    duration: 250,
                },
            },
        );
        // 创建一个overlay, 绑定html元素searchBarBody
        var overlaySearchBar = new ol.Overlay(
            /** @type {olx.OverlayOptions} */ {
                element: searchBarBody,
                autoPan: true,
                positioning: 'right-center',
                stopEvent: false,
                autoPanAnimation: {
                    duration: 250,
                },
            },
        );
        var policeAlarmOverlay = new ol.Overlay(
            /** @type {olx.OverlayOptions} */ {
                element: alarmBody,
                autoPan: true,
                positioning: 'center-center',
                stopEvent: false,
                autoPanAnimation: {
                    duration: 250,
                },
            },
        );
        map.addOverlay(policeAlarmOverlay);
        map.addOverlay(overlayWarning);
        map.addOverlay(overlaySearchBar);

        map.addLayer(showWaringVector);
        map.addLayer(vector); // 将绘制层添加到地图容器中
        map.addOverlay(overlay);
        map.addLayer(vectorHeat);
        map.addLayer(vectorPersonHeat);
        map.addLayer(showIntercomVector);
        map.addLayer(showIndividualVector);
        map.addLayer(showSwanVector);
        map.addLayer(showMonitoringVector);
        map.addLayer(showKeyPlaceVector);
        map.addLayer(showPoliceStationVector);
        map.addLayer(showJurisdictionVector);
        map.addLayer(showWdVector);
        map.addLayer(showPoliceDetailsVector);
        map.addLayer(showTrajectoryVector);

        map.addLayer(showCarVector);
        map.addLayer(showSearchBarVector);
        map.on('singleclick', e => {});
        this.getJurisdiction();
        //为地图容器添加单击事件监听
        map.on('click', function(evt) {
            console.log('evt', evt);
            let point = evt.coordinate; //鼠标单击点坐标
            var pixel = map.getEventPixel(evt.originalEvent);
            //判断当前单击处是否有要素，捕获到要素时弹出popup
            var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                return feature;
            });
            console.log('feature=====>', feature);
            if (feature) {
                console.log('---', feature.get('type'));
                console.log('---', feature.get('layer'));
                console.log('===', feature.get('gps'));
                console.log('===', feature);
                // _self.setState({vehicleInfor: true})
                if (feature.get('type') == 'vehicle') {
                    _self.addFeatrueInfo(feature.get('layer'));
                    _self.setState(
                        {
                            vehicleInfor: true,
                            vehicleState: true,
                            vehicleid: feature.get('layer').vehicle_id,
                            showDetail: true,
                            showTrajectory: false,
                            gxdwdm: feature.get('layer').vehicle_organization_code,
                            vehicleDetailInfor: {
                                carNo: feature.get('layer').vehicle_license_plate,
                            },
                            vehicleComparisonList: feature.get('layer').comparison_message,
                            selectVehicleInfor: [feature.get('layer')],
                        },
                        () => {
                            // _self.getVehicleMap(true, {
                            // 	vector:'showCarVector',
                            // 	source:'sourceCar',
                            // 	list: [ feature.get('layer') ]
                            // })
                            // _self.state.overlay.setPosition(ol.proj.fromLonLat(this.transform(feature.get('gps')[0], feature.get('gps')[1])))

                            _self.addFeatrueInfo(feature.get('layer'));
                            _self.state.showTrajectoryVector.setSource(null);
                            _self.state.sourceTrajectory.clear();
                        },
                    );
                    _self.getDetailById(feature.get('layer'));
                    _self.getVehicleMap(false);
                    overlay.setPosition(ol.proj.fromLonLat(feature.get('gps')));
                    _self.closePoliceDetails();
                }
                // if (feature.get('type') == 'swan' || feature.get('type') == 'policeStation' || feature.get('type') == 'individual') {
                //     if (window.configUrl.iStreet) {
                //         if (feature.get('layer').bfmldz) {
                //             let index = swanVideoList.findIndex(
                //                 item => item.mldz == feature.get('layer').bfmldz,
                //             );
                //             if (index < 0) {
                //                 swanVideoList.unshift({
                //                     mldz: feature.get('layer').bfmldz,
                //                     device_name:
                //                         feature.get('type') == 'swan'
                //                             ? '卡口'
                //                             : feature.get('type') == 'policeStation'
                //                             ? '警务站'
                //                             : feature.get('type') == 'individual'
                //                             ? '移动单兵设备'
                //                             : '',
                //                 });
                //                 _self.setState({
                //                     showSwanVideo: true,
                //                     showVideo: false,
                //                     needX: (document.body.offsetWidth - 1145) / 2,
                //                     needY: 150,
                //                     isSmall: false,
                //                     isBig: false,
                //                     swanVideoList: swanVideoList,
                //                 });
                //             } else {
                //                 message.warn('当前视频播放中，不可重复播放');
                //             }
                //         } else {
                //             message.warn(
                //                 '未获取到当前' +
                //                     (feature.get('type') == 'swan'
                //                         ? '卡口'
                //                         : feature.get('type') == 'policeStation'
                //                         ? '警务站'
                //                         : feature.get('type') == 'individual'
                //                         ? '移动单兵设备'
                //                         : '') +
                //                     '视频，请重新操作',
                //             );
                //         }
                //     }
                // }
                if (feature.get('type') == 'individual' && feature.get('layer').isZl) {
                    this.handleCreateModalVisible(true);
                    // let zltzRecord = this.state.zltzRecord;
                    // zltzRecord.fsjcs = feature.get('layer').kkdm;
                    // zltzRecord.isCar = true;
                    // this.setState({
                    //     zltzRecord
                    // });
                }
                if (
                    feature.get('type') == 'monitoring' ||
                    feature.get('type') == 'swan' ||
                    feature.get('type') == 'policeStation' ||
                    (feature.get('type') == 'individual' && !feature.get('layer').isZl)
                ) {
                    if (window.configUrl.iStreet) {
                        let index = swanVideoList.findIndex(
                            item => item.kkdm == feature.get('layer').kkdm,
                        );
                        if (index < 0) {
                            _self.props.dispatch({
                                type: 'home/getPlayUrl',
                                payload: {
                                    cameraIndexCode:
                                        feature.get('type') == 'individual'
                                            ? feature.get('layer').imei
                                            : feature.get('layer').kkdm,
                                    subStream: '1',
                                    protocol: 'hls',
                                },
                                success: e => {
                                    if (
                                        e.result &&
                                        e.result.reason &&
                                        e.result.reason.code &&
                                        e.result.reason.code == '200'
                                    ) {
                                        if (e.result && e.result.data && e.result.data.url) {
                                            swanVideoList.unshift({
                                                mldz: e.result.data.url,
                                                device_name:
                                                    feature.get('type') == 'swan'
                                                        ? '卡口'
                                                        : feature.get('type') == 'policeStation'
                                                        ? '警务站'
                                                        : feature.get('type') == 'individual'
                                                        ? '移动单兵设备'
                                                        : '监控',
                                                kkdm: feature.get('layer').kkdm,
                                            });
                                            if (swanVideoList.length > _self.state.len) {
                                                swanVideoList = swanVideoList.slice(
                                                    0,
                                                    _self.state.len,
                                                );
                                            }
                                            _self.setState({
                                                showSwanVideo: true,
                                                showVideo: false,
                                                needX: (document.body.offsetWidth - 1145) / 2,
                                                needY: 150,
                                                isSmall: false,
                                                isBig: false,
                                                swanVideoList: [...swanVideoList],
                                            });
                                        }
                                    } else {
                                        message.warn('未获取到当前监控视频，请重新操作');
                                        return false;
                                    }
                                },
                            });
                        } else {
                            message.warn('当前视频播放中，不可重复播放');
                        }
                    }
                }
                if (feature.get('type') == 'showAlert') {
                    if (!_self.state.showWarningsCon) {
                        _self.setState({ showWarningsCon: true }, () => {
                            _self.warningRender(feature.get('layer'), feature.get('warnings'));
                        });
                    }
                }
            }
        });
        map.on('moveend', function(e) {
            console.log('层级变化', e, map.getView().getZoom());

            // showHeat: false, //热力图
            // showVehicle: true, //警车
            // showAlert: false, //警情
            // showIntercom: false, //对讲机
            // showIndividual: false, //单兵设备
            // showSwan: false, //卡口
            // showMonitoring: false, //监控
            // showStation: false, //警务站
            // showPlace: false, //重点场所
            // showJurisdiction: false, //查看辖区
            if (_self.state.showVehicle) {
                _self.getVehicleMap(false);
                overlay.setOffset([0, Number(map.getView().getZoom() / 0.45)]);
            }

            _self.checkSearchDetails();
            if (_self.state.showIntercom) {
                _self.getPiontMap(
                    _self.state.intercomList,
                    false,
                    'sourceIntercom',
                    'showIntercomVector',
                    './image/djj_0.png',
                    'intercom',
                    'gps_point',
                );
            }
            if (_self.state.showIndividual) {
                _self.getPiontMap(
                    _self.state.individualList,
                    false,
                    'sourceIndividual',
                    'showIndividualVector',
                    './image/dbsb_1.png',
                    'individual',
                    'gps_point',
                );
            }
            if (_self.state.showSwan) {
                _self.getPiontMap(
                    _self.state.swanList,
                    false,
                    'sourceSwan',
                    'showSwanVector',
                    './image/kk_1.png',
                    'swan',
                    'gps',
                );
            }
            if (_self.state.showMonitoring) {
                _self.getPiontMap(
                    _self.state.monitoringList,
                    false,
                    'sourceMonitoring',
                    'showMonitoringVector',
                    './image/jk_1.png',
                    'monitoring',
                    'gps',
                );
            }
            if (_self.state.showPlace) {
                _self.getPiontMap(
                    _self.state.keyPlaceList,
                    false,
                    'sourceKeyPlace',
                    'showKeyPlaceVector',
                    './image/zdcs_1.png',
                    'keyPlace',
                    'gps',
                );
            }
            if (_self.state.showStation) {
                _self.getPiontMap(
                    _self.state.policeStationList,
                    false,
                    'sourcePoliceStation',
                    'showPoliceStationVector',
                    './image/jwz_1.png',
                    'policeStation',
                    'gps',
                );
            }
            console.log(_self.state.policeDetails, '_self.state.policeDetails');
            if (_self.state.singleWaring) {
                if (_self.state.showWarningsCon) {
                    _self.checkPoliceDetails();
                }

                _self.policeDetailsMap(
                    _self.state.policeDetails,
                    false,
                    'sourcePoliceDetails',
                    'overlayWarning',
                    'showPoliceDetailsVector',
                    'warnings',
                );
            }
            if (_self.state.showAlert) {
                _self.getWarningMap();
            }
            if (_self.state.multipleWaring) {
                _self.encirclement(_self.state.selectedMultiple);
            }
        });
        var popupBody = document.getElementById('popups');
        var popups = document.getElementById('popups-content');
        var overlaypopup = new ol.Overlay({
            element: popupBody,
            autoPan: true,
            positioning: 'right-center',
            stopEvent: false,
            autoPanAnimation: {
                duration: 250,
            },
        });
        map.addOverlay(overlaypopup);
        map.on('pointermove', function(evt) {
            var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                return feature;
            });
            if (
                feature &&
                feature.get('type') &&
                (feature.get('type') === 'vehicle' ||
                    feature.get('type') === 'monitoring' ||
                    feature.get('type') === 'policeStation' ||
                    feature.get('type') === 'swan' ||
                    feature.get('type') === 'intercom' ||
                    feature.get('type') === 'keyPlace' ||
                    feature.get('type') === 'individual')
            ) {
                var coodinate = ol.proj.fromLonLat(feature.get('gps'));
                // var coodinate =  ol.proj.fromLonLat(_self.transform(Number(feature.get('gps')[0]), Number(feature.get('gps')[1])));
                if (window.configUrl.iStreet) {
                    _self.popupRender(feature.get('type'), feature.get('layer'), popups);
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
        this.setState({
            map,
            view,
            vector,
            source,
            overlay,
            sourceHeat,
            vectorHeat,
            sourcePersonHeat,
            vectorPersonHeat,
            sourceCar,
            showCarVector,
            sourceIntercom,
            showIntercomVector,
            policeAlarmOverlay,
            policesOverlay,
            sourceIndividual,
            showIndividualVector,
            sourceSwan,
            showSwanVector,
            sourceMonitoring,
            showMonitoringVector,
            sourceKeyPlace,
            showKeyPlaceVector,
            sourcePoliceStation,
            showPoliceStationVector,
            sourceJurisdiction,
            showJurisdictionVector,
            sourceWd,
            showWdVector,
            sourceWarning,
            showWaringVector,
            sourcePoliceDetails,
            showPoliceDetailsVector,
            content,
            overlayWarning,
            warnings,
            alarmcon,
            sourceSearchBar,
            showSearchBarVector,
            searchBar,
            overlaySearchBar,
            sourceTrajectory,
            showTrajectoryVector,
        });
    };

    getDetailById = e => {
        this.props.dispatch({
            type: 'otherIndex/getEquipmentListByVehicleId',
            payload: {
                vehicle_id: e.vehicle_id,
            },
        });
        this.props.dispatch({
            type: 'otherIndex/getScheduleListByVehicleId',
            payload: {
                vehicle_id: e.vehicle_id,
            },
        });
        this.props.dispatch({
            type: 'otherIndex/getVehiclePoliceAlarmList',
            payload: {
                carNo: e.vehicle_license_plate,
                imei: e.pad_cid,
                vehicle_organization_code: e.vehicle_organization_code,
            },
        });
        this.props.dispatch({
            type: 'otherIndex/getScheduleCountByVehicleId',
            payload: {
                vehicle_id: e.vehicle_id,
            },
            success: e => {
                if (
                    e.result &&
                    e.result.reason &&
                    e.result.reason.code &&
                    e.result.reason.code == '200'
                ) {
                    console.log(e);
                    if (e.result.list) {
                        this.setState({
                            vehicleDetailInfor: {
                                ...this.state.vehicleDetailInfor,
                                absenceCounts: e.result.list[0].absenceCounts,
                                attendanceCounts: e.result.list[0].attendanceCounts,
                                scheduleCounts: e.result.list[0].scheduleCounts,
                                cth:
                                    e.result.device == null
                                        ? '暂无车台'
                                        : e.result.device.cth || '暂无车台',
                            },
                        });
                    }
                } else {
                    return false;
                }
            },
        });
    };
    popupRender = (type, files, popups) => {
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
        if (type === 'vehicle') {
            spanA.innerText =
                '名称：' +
                (files.vehicle_license_plate || '') +
                '\n' +
                '经度：' +
                (files.gps_point[0] || '') +
                '\n' +
                '纬度：' +
                (files.gps_point[1] || '') +
                '\n' +
                '时间：' +
                (files.gps_time || '') +
                '\n' +
                '机构：' +
                (files.vehicle_organization_name || '') +
                '\n';
        } else if (
            type === 'monitoring' ||
            type === 'policeStation' ||
            type === 'swan' ||
            type === 'keyPlace'
        ) {
            spanA.innerText =
                '名称：' +
                (files.kkmc + '\n' || '') +
                '经度：' +
                (files.gps[0] + '\n' || '') +
                '纬度：' +
                (files.gps[1] + '\n' || '') +
                (files.kkid ? '编号：' + (files.kkid + '\n' || '') : '');
        } else if (type === 'intercom' || type === 'individual') {
            spanA.innerText =
                (files.imei ? '编号：' + (files.imei + '\n' || '') : '') +
                '经度：' +
                (files.gps_point[0] || '') +
                '\n' +
                '纬度：' +
                (files.gps_point[1] || '') +
                '\n' +
                '时间：' +
                (files.gps_time || '') +
                '\n' +
                '机构：' +
                (files.jgmc || '') +
                '\n';
        }

        elementA.appendChild(spanA);
        body.appendChild(elementA);
    };
    getBayonetsListDate = (files, classify) => {
        var _self = this;
        this.props.dispatch({
            type: 'otherIndex/getBayonetsList',
            payload: {
                bayonet_type: files,
                classify,
            },
            success: e => {
                if (e.result.reason.code == '200') {
                    if (files == 1) {
                        this.setState({ swanList: e.result.list }, () => {
                            // _self.getSwanMap()
                            _self.getPiontMap(
                                _self.state.swanList,
                                false,
                                'sourceSwan',
                                'showSwanVector',
                                './image/kk_1.png',
                                'swan',
                                'gps',
                            );
                        });
                    } else if (files == 2) {
                        let monitoringList = this.state.monitoringList;
                        let list = e.result.list ? e.result.list : [];
                        list.map(item => {
                            item.classify = classify;
                        });
                        monitoringList = monitoringList.concat(list);
                        this.setState({ monitoringList: monitoringList }, () => {
                            // _self.getMonitoringMap()
                            _self.getPiontMap(
                                _self.state.monitoringList,
                                false,
                                'sourceMonitoring',
                                'showMonitoringVector',
                                './image/jk_1.png',
                                'monitoring',
                                'gps',
                            );
                        });
                    } else if (files == 3) {
                        this.setState({ keyPlaceList: e.result.list }, () => {
                            // _self.getKeyPlaceMap()
                            _self.getPiontMap(
                                _self.state.keyPlaceList,
                                false,
                                'sourceKeyPlace',
                                'showKeyPlaceVector',
                                './image/zdcs_1.png',
                                'keyPlace',
                                'gps',
                            );
                        });
                    } else if (files == 4) {
                        this.setState({ policeStationList: e.result.list }, () => {
                            // _self.getPoliceStationMap()
                            _self.getPiontMap(
                                _self.state.policeStationList,
                                false,
                                'sourcePoliceStation',
                                'showPoliceStationVector',
                                './image/jwz_1.png',
                                'policeStation',
                                'gps',
                            );
                        });
                    } else if (files == 6) {
                        this.setState({ individualList: e.result.list }, () => {
                            _self.getPiontMap(
                                _self.state.individualList,
                                false,
                                'sourceIndividual',
                                'showIndividualVector',
                                './image/dbsb_1.png',
                                'individual',
                                'gps_point',
                            );
                        });
                    }
                } else {
                    return false;
                }
            },
        });
    };
    getBayonetsList = (files, classify) => {
        if (classify) {
            classify.map(item => {
                this.getBayonetsListDate(files, item);
            });
        } else {
            this.getBayonetsListDate(files);
        }
    };

    getJurisdiction = () => {
        console.log('查看辖区');
        this.props.dispatch({
            type: 'otherIndex/getOrgGpsLabelList',
            payload: {
                association_organization_id: JSON.parse(sessionStorage.getItem('user')).group
                    .parentId,
                brother_status: false,
                children_status: true,
                label_organization_code: JSON.parse(sessionStorage.getItem('user')).group.code,
                label_organization_id: JSON.parse(sessionStorage.getItem('user')).group.id,
                label_type: [0],
                parent_status: false,
            },
            success: e => {
                console.log(e);
                if (e.result.reason.code == '200') {
                    if (e.result.label.jgfw) {
                        this.getJurisdictionMap(e.result.label.jgfw);
                    }
                } else {
                    return false;
                }
            },
        });
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

    /**
     *  图层初始化
     *  */
    initLayers = () => {
        const { map, vector, source } = this.state;
        vector.setSource(null);
        source.clear();
    };
    statesChange = files => {
        console.log('statesChange', files);
        var _self = this;
        const {
            showHeat,
            showPersonHeat,
            showVehicle,
            showAlert,
            showIntercom,
            showJurisdiction,
            showIndividual,
            showSwan,
            showMonitoring,
            showStation,
            showPlace,
            multipleWaring,
            showOperateWith,
            policeAlarmList,
            hdCamera,
            ordinaryCamera,
            remoteCamera,
        } = this.state;
        switch (files) {
            case 'showHeat':
                this.setState({ showHeat: !showHeat }, () => {
                    if (!this.state.showHeat) {
                        _self.state.vectorHeat.setSource(null);
                        _self.state.sourceHeat.clear();
                    }
                    console.log(this);
                    this.sendSet();
                });

                break;
            case 'showPersonHeat':
                this.setState({ showPersonHeat: !showPersonHeat }, () => {
                    if (!this.state.showPersonHeat) {
                        _self.state.vectorPersonHeat.setSource(null);
                        _self.state.sourcePersonHeat.clear();
                    }
                    console.log(this);
                    this.sendSet();
                });

                break;
            case 'showVehicle':
                this.setState({ showVehicle: !showVehicle }, () => {
                    if (!this.state.showVehicle) {
                        _self.state.showCarVector.setSource(null);
                        _self.state.sourceCar.clear();
                    }
                    this.sendSet();
                });
                break;
            case 'showAlert':
                this.setState(
                    {
                        showAlert: !showAlert,
                        multipleWaring: false,
                        selectedMultiple: {},
                    },
                    () => {
                        if (!this.state.showAlert) {
                            _self.state.showWaringVector.setSource(null);
                            _self.state.sourceWarning.clear();

                            if (policeAlarmList && policeAlarmList.length > 0) {
                                for (let i = 0; i < policeAlarmList.length; i++) {
                                    if (document.getElementById('overlay' + i)) {
                                        // console.log(document.getElementById('overlay' + i))
                                        document
                                            .getElementById('overlay' + i)
                                            .parentNode.removeChild(
                                                document.getElementById('overlay' + i),
                                            );
                                    }
                                }
                            }
                        }
                        this.sendSet();
                    },
                );
                break;
            case 'showIntercom':
                this.setState({ showIntercom: !showIntercom }, () => {
                    if (!this.state.showIntercom) {
                        _self.state.showIntercomVector.setSource(null);
                        _self.state.sourceIntercom.clear();
                    }
                    this.sendSet();
                });
                break;
            case 'showIndividual':
                this.setState({ showIndividual: !showIndividual }, () => {
                    if (!this.state.showIndividual) {
                        _self.state.showIndividualVector.setSource(null);
                        _self.state.sourceIndividual.clear();
                    }
                    // else {
                    // this.getBayonetsList(6);
                    // }
                    this.sendSet();
                });
                break;
            case 'showSwan':
                this.setState({ showSwan: !showSwan }, () => {
                    // this.sendSet()
                    if (this.state.showSwan) {
                        this.getBayonetsList(1);
                    } else {
                        this.setState({ swanList: [] }, () => {
                            // this.getSwanMap()
                            _self.state.showSwanVector.setSource(null);
                            _self.state.sourceSwan.clear();
                            // _self.getPiontMap(_self.state.swanList,'sourceSwan', 'showSwanVector','./image/kk_1.png','swan','gps')
                        });
                    }
                });
                break;
            case 'showMonitoring':
                this.setState(
                    {
                        showMonitoring: !showMonitoring,
                        hdCamera: !showMonitoring,
                        ordinaryCamera: false,
                        remoteCamera: !showMonitoring,
                    },
                    () => {
                        // this.sendSet()
                        if (this.state.showMonitoring) {
                            this.getBayonetsList(2, ['hdCamera', 'remoteCamera']);
                        } else {
                            this.setState({ monitoringList: [] }, () => {
                                // this.getMonitoringMap()
                                _self.state.showMonitoringVector.setSource(null);
                                _self.state.sourceMonitoring.clear();
                                // _self.getPiontMap(_self.state.monitoringList,'sourceMonitoring','showMonitoringVector','./image/jk_1.png','monitoring','gps')
                            });
                        }
                    },
                );
                break;
            case 'hdCamera':
                this.setState({ hdCamera: !hdCamera }, () => {
                    // this.sendSet()
                    if (this.state.hdCamera) {
                        this.getBayonetsList(2, ['hdCamera']);
                    } else {
                        let classify = [];
                        if (this.state.ordinaryCamera) {
                            classify.push('ordinaryCamera');
                        }
                        if (this.state.remoteCamera) {
                            classify.push('remoteCamera');
                        }
                        this.setState({ monitoringList: [] }, () => {
                            _self.state.showMonitoringVector.setSource(null);
                            _self.state.sourceMonitoring.clear();
                        });
                        if (classify.length > 0) {
                            this.getBayonetsList(2, classify);
                        }
                    }
                });
                break;
            case 'ordinaryCamera':
                this.setState({ ordinaryCamera: !ordinaryCamera }, () => {
                    // this.sendSet()
                    if (this.state.ordinaryCamera) {
                        this.getBayonetsList(2, ['ordinaryCamera']);
                    } else {
                        let classify = [];
                        if (this.state.hdCamera) {
                            classify.push('hdCamera');
                        }
                        if (this.state.remoteCamera) {
                            classify.push('remoteCamera');
                        }
                        this.setState({ monitoringList: [] }, () => {
                            _self.state.showMonitoringVector.setSource(null);
                            _self.state.sourceMonitoring.clear();
                        });
                        if (classify.length > 0) {
                            this.getBayonetsList(2, classify);
                        }
                    }
                });
                break;
            case 'remoteCamera':
                this.setState({ remoteCamera: !remoteCamera }, () => {
                    // this.sendSet()
                    if (this.state.remoteCamera) {
                        this.getBayonetsList(2, ['remoteCamera']);
                    } else {
                        let classify = [];
                        if (this.state.ordinaryCamera) {
                            classify.push('ordinaryCamera');
                        }
                        if (this.state.hdCamera) {
                            classify.push('hdCamera');
                        }
                        this.setState({ monitoringList: [] }, () => {
                            _self.state.showMonitoringVector.setSource(null);
                            _self.state.sourceMonitoring.clear();
                        });
                        if (classify.length > 0) {
                            this.getBayonetsList(2, classify);
                        }
                    }
                });
                break;
            case 'showPlace':
                this.setState({ showPlace: !showPlace }, () => {
                    // this.sendSet()
                    if (this.state.showPlace) {
                        this.getBayonetsList(3);
                    } else {
                        this.setState({ keyPlaceList: [] }, () => {
                            // this.getKeyPlaceMap()
                            _self.state.showKeyPlaceVector.setSource(null);
                            _self.state.sourceKeyPlace.clear();
                            // _self.getPiontMap(_self.state.keyPlaceList,'sourceKeyPlace', 'showKeyPlaceVector','./image/zdcs_1.png','keyPlace','gps')
                        });
                    }
                });
                break;
            case 'showStation':
                this.setState({ showStation: !showStation }, () => {
                    // this.sendSet()
                    if (this.state.showStation) {
                        this.getBayonetsList(4);
                    } else {
                        this.setState({ policeStationList: [] }, () => {
                            // this.getPoliceStationMap()
                            _self.state.showPoliceStationVector.setSource(null);
                            _self.state.sourcePoliceStation.clear();
                            // _self.getPiontMap(_self.state.policeStationList,'sourcePoliceStation', 'showPoliceStationVector','./image/jwz_1.png','policeStation','gps')
                        });
                    }
                });
                break;
            case 'showJurisdiction':
                this.setState({ showJurisdiction: !showJurisdiction }, () => {
                    if (this.state.showJurisdiction) {
                        this.getJurisdiction();
                    } else {
                        this.state.sourceJurisdiction.clear();
                        this.state.showJurisdictionVector.setSource(null);
                    }
                });
                break;
            case 'showSynergy':
                this.setState({ showOperateWith: !showOperateWith }, () => {
                    if (this.state.showOperateWith) {
                        this.queryImeiCoordinatedList();
                    } else {
                        this.setState({ switchSynergy: false });
                    }
                });
                break;

            default:
                break;
        }
    };
    queryImeiCoordinatedList = () => {
        // equipmentType
        const {
            dispatch,
            otherIndex: {
                operateWithList: { page },
            },
        } = this.props;

        const pages = {
            currentPage: 1,
            showCount: 999,
        };

        const param = {
            ...pages,
            pd: {},
        };

        dispatch({
            type: 'otherIndex/queryImeiCoordinatedList',
            payload: param,
            success: e => {
                if (e.result.reason.code == '200') {
                    this.setState({ switchSynergy: true });
                } else {
                    this.setState({ switchSynergy: false });
                    return false;
                }
            },
        });
    };
    sendSet = () => {
        var _self = this;
        console.log(this.wc, 'wsObject====');
        this.wc.options.globalParams = {
            token: sessionStorage.getItem('userToken'),
            government: JSON.parse(sessionStorage.getItem('groupListCode')),
            individualEquipmentFlag: _self.state.showIndividual,
            policeTongFlag: _self.state.showIndividual,
            bodyWornFlag: _self.state.showIndividual,
            intercomFlag: _self.state.showIntercom,
            policeAlarmFlag: _self.state.showAlert,
            thermodynamicChartFlag: _self.state.showHeat,
            crowdDensity: _self.state.showPersonHeat,
            vehicleFlag: _self.state.showVehicle,
        };
        this.wc.send();
    };

    //在地图上渲染预警信息
    getWarningMap = () => {
        var _self = this;
        // this.setState({ determine: 'edit' });
        let { view, map, sourceWarning, showWaringVector, policeAlarmList } = this.state;
        let arr = [],
            vector;
        let vehicleState = '';
        //实例一个线的全局变量
        var geometry = new ol.geom.Point(); //线,Point 点,Polygon 面
        sourceWarning.clear();
        showWaringVector.setSource(null);
        //         if(policesOverlay){
        // policesOverlay.setPosition(null)
        //         }
        if (policeAlarmList && policeAlarmList.length > 0) {
            _self.addMarksByOverlay(policeAlarmList);
        } else {
            // map.getOverlays().clear()
            // console.log(document.getElementById('marks'))
        }
    };
    encirclement = files => {
        let { view, map, sourceWarning, showWaringVector, policeAlarmList } = this.state;
        sourceWarning.clear();
        showWaringVector.setSource(null);

        const pointFeaturea = new ol.Feature({
            geometry: new ol.geom.Point(this.transform(Number(files.xzb), Number(files.yzb))),
        });
        const pointFeature = new ol.Feature({
            geometry: new ol.geom.Point(this.transform(Number(files.xzb), Number(files.yzb))),
        });
        const pointFeatured = new ol.Feature({
            geometry: new ol.geom.Point(this.transform(Number(files.xzb), Number(files.yzb))),
        });
        pointFeatured.setStyle(
            new ol.style.Style({
                image: new ol.style.Icon({
                    scale: this.warningStyles().d / 400,
                    // scale: map.getView().getZoom() / 15, // 图标缩放比例
                    src: './image/jqicon_2.png', // 图标的url
                }),
            }),
        );
        pointFeature.setStyle(
            new ol.style.Style({
                image: new ol.style.Icon({
                    scale: this.warningStyles().b / 400, // 图标缩放比例
                    // size:[this.warningStyles().b,this.warningStyles().b],
                    src: './image/jqicon_3.png', // 图标的url
                }),
            }),
        );
        pointFeaturea.setStyle(
            new ol.style.Style({
                image: new ol.style.Icon({
                    scale: this.warningStyles().c / 400, // 图标缩放比例
                    // scale: map.getView().getZoom() / 15, // 图标缩放比例
                    src: './image/jqicon_4.png', // 图标的url
                }),
            }),
        );

        pointFeatured.getGeometry().transform('EPSG:4326', 'EPSG:3857');
        pointFeaturea.getGeometry().transform('EPSG:4326', 'EPSG:3857');
        pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');

        sourceWarning.addFeature(pointFeaturea);
        sourceWarning.addFeature(pointFeatured);
        sourceWarning.addFeature(pointFeature);
        showWaringVector.setSource(sourceWarning);
    };
    addMarksByOverlay = points => {
        var _self = this;
        const { map, multipleWaring, sourceWarning, showWaringVector } = this.state;
        let marker = null;
        var _imgParam = {
            // width: '32px',
            // height: '32px',
            src: './image/jqicon_1.gif',
        };
        //循环点集
        for (let i = 0; i < points.length; i++) {
            //新增放置overly的div
            let _overlay = document.getElementById('marks');
            _overlay.id = 'marks';
            if (document.getElementById('overlay' + i)) {
                // console.log(document.getElementById('overlay' + i))
                // let _removeLyr = this.map.encmap.getOverlayById('overlay' + i);
                document
                    .getElementById('overlay' + i)
                    .parentNode.removeChild(document.getElementById('overlay' + i));
                // document.getElementById('overlay' + i).parentNode.parentNode.removeChild(document.getElementById('overlay' + i).parentNode)
                // map.encmap.removeOverlay(_removeLyr);
            }
            let sElement = document.createElement('div');
            sElement.id = 'overlay' + i;
            //   sElement.style.width = _imgParam.width;
            //   sElement.style.height = _imgParam.height;
            sElement.style.cursor = 'pointer';
            sElement.attr = points[i];
            sElement.x = this.transform(Number(points[i].xzb), Number(points[i].yzb))[0];
            sElement.y = this.transform(Number(points[i].xzb), Number(points[i].yzb))[1];
            _overlay.appendChild(sElement);

            //新增overly
            var lyr = new ol.Overlay({
                id: 'overlay' + i,
                positioning: 'center-center',
                //属性
                attributes: points[i],
                //overly放置的div
                element: document.getElementById('overlay' + i),
                stopEvent: false,
            });
            var img = document.createElement('img');
            img.src = _imgParam.src;
            img.style.width = _imgParam.width;
            img.style.height = _imgParam.height;

            //逐个把overly添加到地图上
            map.addOverlay(lyr);
            if (document.getElementById('overlay' + i)) {
                document.getElementById('overlay' + i).appendChild(img);
            }
            lyr.setPosition(
                ol.proj.fromLonLat(this.transform(Number(points[i].xzb), Number(points[i].yzb))),
            ); //显示
            if (document.getElementById('overlay' + i)) {
                document
                    .getElementById('overlay' + i)
                    .setAttribute('info', JSON.stringify(points[i]));
                document.getElementById('overlay' + i).onclick = function() {
                    var warningBody = document.getElementById('warning');
                    var warning = document.getElementById('warning-content');
                    if (
                        _self.state.selectedMultiple.police_alarm_id !=
                        JSON.parse(this.getAttribute('info')).police_alarm_id
                    ) {
                        _self.setState(
                            {
                                multipleWaring: true,
                                selectedMultiple: JSON.parse(this.getAttribute('info')),
                            },
                            () => {
                                // 创建一个overlay, 绑定html元素warningBody
                                var overlayWarning = new ol.Overlay(
                                    /** @type {olx.OverlayOptions} */ {
                                        element: warningBody,
                                        autoPan: true,
                                        positioning: 'right-center',
                                        stopEvent: false,
                                        autoPanAnimation: {
                                            duration: 250,
                                        },
                                    },
                                );
                                map.addOverlay(overlayWarning);
                                let files = JSON.parse(this.getAttribute('info'));
                                overlayWarning.setPosition(
                                    ol.proj.fromLonLat(
                                        _self.transform(Number(files.xzb), Number(files.yzb)),
                                    ),
                                );
                                _self.warningRender(files, warning);
                                _self.encirclement(JSON.parse(this.getAttribute('info')));
                            },
                        );
                    } else {
                        warning.innerHTML = '';
                        _self.setState(
                            {
                                multipleWaring: false,
                                selectedMultiple: {},
                            },
                            () => {
                                sourceWarning.clear();
                                showWaringVector.setSource(null);
                            },
                        );
                    }
                };
            }
            //   //鼠标移动事件
            //   if (clickFunc) {
            //     document.getElementById('overlay' + i).onmouseover = function(evt) {
            //       if (!evt.currentTarget.attr) {
            //         return;
            //       }
            //       let attr = evt.currentTarget.attr;
            //       attr.pixel={
            //         x:evt.x,
            //         y:evt.y
            //       }
            //       clickFunc(attr);
            //     };
            //   }
        }
    };
    warningStyles = () => {
        let d = 2,
            b = 6,
            c = 10;
        const zoom = Number(this.state.map.getView().getZoom());
        // console.log(zoom, 'zoom===')
        if (zoom <= 8) {
            // console.log({ b: b, c: c, d: d }, '{ b: b, c: c, d: d }===')
            return { b: b, c: c, d: d };
        } else {
            const num = zoom - 8;
            b = Math.pow(2, num) * b;
            c = Math.pow(2, num) * c;
            d = Math.pow(2, num) * d;
            // console.log({ b: b, c: c, d: d }, '{ b: b, c: c, d: d }---')
            return { b: b, c: c, d: d };
        }
    };
    //在地图上渲染辖区
    getJurisdictionMap = files => {
        const { sourceJurisdiction, view, map, showJurisdictionVector } = this.state;

        let arr = [];
        sourceJurisdiction.clear();
        showJurisdictionVector.setSource(null);
        if (files) {
            console.log('11121212');
            if (files.own) {
                const clis = files.own[0];
                if (clis.label_gps_point && clis.label_gps_point.length) {
                    const polygonFeature = new ol.Feature({
                        geometry: new ol.geom.Polygon([clis.label_gps_point]),
                    });
                    polygonFeature.setStyle(
                        new ol.style.Style({
                            // 设置选中时的样式
                            stroke: new ol.style.Stroke({
                                color: '#73d2ff',
                                size: 3,
                                width: 3,
                            }),
                            fill: new ol.style.Fill({
                                color: 'rgba(115,210,255, 0.1)',
                            }),
                            text: new ol.style.Text({
                                textAlign: 'center', // 位置
                                textBaseline: 'alphabetic', // 基准线
                                font: 'normal 16px 微软雅黑', // 文字样式
                                stroke: new ol.style.Stroke({
                                    color: '#fff',
                                    width: 1,
                                }),
                                text: clis.label_organization_name, // 文本内容
                                fill: new ol.style.Fill({
                                    color: '#73d2ff',
                                }),
                            }),
                        }),
                    );
                    polygonFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                    sourceJurisdiction.addFeature(polygonFeature);
                    showJurisdictionVector.setSource(sourceJurisdiction);
                } else {
                    message.error('未设置所属机构管辖范围');
                    return false;
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
            if (files.children_list && files.children_list.length > 0) {
                files.children_list.map((clis, idx) => {
                    let colorBg = clis.label_organization_name.includes('滨江')
                        ? 'rgba(1,1,194,0.2)'
                        : clis.label_organization_name.includes('南马')
                        ? 'rgba(155,61,175,0.2)'
                        : clis.label_organization_name.includes('太古')
                        ? 'rgba(92,199,62,0.2)'
                        : clis.label_organization_name.includes('靖宇')
                        ? 'rgba(244,174,114,0.2)'
                        : clis.label_organization_name.includes('东莱')
                        ? 'rgba(236,2,0, 0.2)'
                        : clis.label_organization_name.includes('胜利')
                        ? 'rgba(75,160,200,0.2)'
                        : '';
                    let colorBorder = clis.label_organization_name.includes('滨江')
                        ? '#0101c2'
                        : clis.label_organization_name.includes('南马')
                        ? '#9b3daf'
                        : clis.label_organization_name.includes('太古')
                        ? '#5cc73e'
                        : clis.label_organization_name.includes('靖宇')
                        ? '#f4ae72'
                        : clis.label_organization_name.includes('东莱')
                        ? '#ec0200'
                        : clis.label_organization_name.includes('胜利')
                        ? '#4ba0c8'
                        : '';
                    if (clis.label_gps_point && clis.label_gps_point.length) {
                        const polygonFeature = new ol.Feature({
                            geometry: new ol.geom.Polygon([clis.label_gps_point]),
                        });
                        polygonFeature.setStyle(
                            new ol.style.Style({
                                // 设置选中时的样式
                                stroke: new ol.style.Stroke({
                                    color: colorBorder ? colorBorder : colors[idx],
                                    size: 2,
                                    width: 2,
                                }),
                                fill: new ol.style.Fill({
                                    color: colorBg ? colorBg : 'rgba(251,161,54, 0)',
                                }),
                                text: new ol.style.Text({
                                    overflow: true,
                                    textAlign: 'center', // 位置
                                    textBaseline: 'middle', // 基准线
                                    font: 'normal 16px 微软雅黑', // 文字样式
                                    text: clis.label_organization_name, // 文本内容
                                    stroke: new ol.style.Stroke({
                                        color: '#fff',
                                        width: 1,
                                    }),
                                    fill: new ol.style.Fill({
                                        color: colorBorder ? colorBorder : colors[idx],
                                    }),
                                }),
                            }),
                        );

                        polygonFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                        sourceJurisdiction.addFeature(polygonFeature);
                        showJurisdictionVector.setSource(sourceJurisdiction);
                    } else {
                        return false;
                    }
                });
            }
        }
    };
    //在地图上渲染热力图
    getHeatMap = () => {
        const { sourceHeat, map, heatList, vectorHeat } = this.state;
        console.log(this.state);
        let heatData = {
            type: 'FeatureCollection',
            features: [],
        };
        sourceHeat.clear();
        vectorHeat.setSource(null);
        if (heatList && heatList.length) {
            for (let index = 0; index < heatList.length; index++) {
                const element = heatList[index];
                if (element.gps) {
                    // let weightNum = Math.random()
                    let weightNum = 0.6;
                    heatData.features.push({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: this.transform(element.gps[0], element.gps[1]),
                        },
                        properties: { weight: weightNum },
                    });
                }
            }
            var features = new ol.format.GeoJSON().readFeatures(heatData, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857',
            });
            sourceHeat.addFeatures(features);
            vectorHeat.setSource(sourceHeat);
        }
    };
    //在地图上渲染人流热力图
    getHeatPersonMap = () => {
        const { sourcePersonHeat, map, heatPersonList, vectorPersonHeat } = this.state;
        console.log(this.state);
        let heatData = {
            type: 'FeatureCollection',
            features: [],
        };
        sourcePersonHeat.clear();
        vectorPersonHeat.setSource(null);
        if (heatPersonList && heatPersonList.length) {
            for (let index = 0; index < heatPersonList.length; index++) {
                const element = heatPersonList[index];
                if (element.gps) {
                    // let weightNum = Math.random()
                    let weightNum = 0.6;
                    heatData.features.push({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: this.transform(element.gps[0], element.gps[1]),
                        },
                        properties: { weight: weightNum },
                    });
                }
            }
            var features = new ol.format.GeoJSON().readFeatures(heatData, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857',
            });
            sourcePersonHeat.addFeatures(features);
            vectorPersonHeat.setSource(sourcePersonHeat);
        }
    };

    // 将警车图标渲染到地图
    getVehicleMap = (type, files) => {
        var _self = this;
        // this.setState({ determine: 'edit' });
        let {
            view,
            map,
            draw,
            overlay,
            circle,
            vehicleGpsList,
            showCarVector,
            sourceCar,
            carTrajectoryGps,
            showTrajectory,
            selectVehicleInfor,
        } = this.state;
        let arr = [];
        let pointFeature = null;
        console.log(type, files, '-----警车');

        if (type) {
            this.state[files.vector].setSource(null);
            this.state[files.source].clear();
        } else {
            showCarVector.setSource(null);
            sourceCar.clear();
        }
        let lists = type ? files.list : showTrajectory ? selectVehicleInfor : vehicleGpsList;

        if (lists) {
            if (lists.length > 0) {
                for (var i = 0; i < lists.length; i++) {
                    if (lists[i].gps_point) {
                        //  console.log(lists[i])
                        if (
                            longrg.test(lists[i].gps_point[0]) &&
                            latreg.test(lists[i].gps_point[1])
                        ) {
                            pointFeature = new ol.Feature({
                                geometry: new ol.geom.Point(
                                    this.transform(lists[i].gps_point[0], lists[i].gps_point[1]),
                                ),
                                type: 'vehicle',
                                layer: lists[i],
                                gps: this.transform(lists[i].gps_point[0], lists[i].gps_point[1]),
                            });
                            pointFeature.setStyle(
                                new ol.style.Style({
                                    text: new ol.style.Text({
                                        textAlign: 'center', // 位置
                                        textBaseline: 'alphabetic', // 基准线
                                        font: 'normal 12px 微软雅黑', // 文字样式
                                        // font: 'normal ' + map.getView().getZoom() + 'px 微软雅黑',
                                        text: lists[i].vehicle_license_plate, // 文本内容
                                        // offsetX: '45',
                                        offsetY: map.getView().getZoom() - 3,
                                        fill: new ol.style.Fill({
                                            color: '#333',
                                        }), // 文本填充样式（即文字颜色）
                                        // stroke: ison ? new ol.style.Stroke({
                                        //     color: colors,
                                        //     width: 1,
                                        // }) : '',
                                    }),
                                    image: new ol.style.Icon({
                                        anchor: type ? [0.5, 90] : [0.5, 60],
                                        anchorXUnits: 'fraction', //锚点X值单位(单位:分数)
                                        anchorYUnits: 'pixels',
                                        scale: type
                                            ? map.getView().getZoom() / 40
                                            : map.getView().getZoom() / 25, // 图标缩放比例
                                        src: type
                                            ? lists[i].vehicle_state == '0'
                                                ? files.imgsOn
                                                : files.imgs
                                            : lists[i].vehicle_state == '0'
                                            ? lists[i].vehicle_type == '11'
                                                ? './image/fjCar1.png'
                                                : lists[i].vehicle_type == '9'
                                                ? './image/wjCar1.png'
                                                : lists[i].vehicle_type == '20'
                                                ? './image/wjCarGreen1.png'
                                                : lists[i].vehicle_type == '21'
                                                ? './image/wjCarWhite1.png'
                                                : './image/pcsCar1.png'
                                            : lists[i].vehicle_type == '11'
                                            ? './image/fjCar.png'
                                            : lists[i].vehicle_type == '9'
                                            ? './image/wjCar.png'
                                            : lists[i].vehicle_type == '20'
                                            ? './image/wjCarGreen.png'
                                            : lists[i].vehicle_type == '21'
                                            ? './image/wjCarWhite.png'
                                            : './image/pcsCar.png', // 图标的url
                                        offsetOrigin: 'top-center',
                                    }),
                                }),
                            );

                            pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                            if (type) {
                                _self.state[files.source].addFeature(pointFeature);
                            } else {
                                sourceCar.addFeature(pointFeature);
                            }

                            arr.push(
                                ol.proj.fromLonLat(
                                    this.transform(lists[i].gps_point[0], lists[i].gps_point[1]),
                                ),
                            );
                        }
                    }
                }
                if (type) {
                    _self.state[files.vector].setSource(_self.state[files.source]);
                } else {
                    showCarVector.setSource(sourceCar);
                }

                if (!_self.state.isOneRender) {
                    // console.log(arr)
                    if (arr.length) {
                        // let exent = ol.extent.boundingExtent(arr);
                        // let center = ol.extent.getCenter(exent);
                        // view.fit(exent);
                        // view.setCenter(center);
                        _self.setState({ isOneRender: true });
                    }
                }

                if (type) {
                    if (files.bool) {
                        //设置中心点
                        let exent = ol.extent.boundingExtent(arr);
                        let center = ol.extent.getCenter(exent);
                        view.fit(exent);
                        view.setCenter(center);
                    }
                }

                //  overlay.setPositioning("bottom-center");
            }
        }
    };

    //渲染各个点的公用方法
    getPiontMap = (files, bool, source, vector, imgs, type, gps) => {
        var _self = this;
        let arr = [];
        let { map, warnings, overlayWarning, view } = this.state;
        this.state[vector].setSource(null);
        this.state[source].clear();
        if (files) {
            if (files.length) {
                for (var i = 0; i < files.length; i++) {
                    if (files[i][gps]) {
                        if (longrg.test(files[i][gps][0]) && latreg.test(files[i][gps][1])) {
                            const pointFeature = new ol.Feature({
                                geometry:
                                    type == 'keyPlace'
                                        ? new ol.geom.Point(files[i][gps])
                                        : new ol.geom.Point(
                                              this.transform(files[i][gps][0], files[i][gps][1]),
                                          ),
                                type: type,
                                layer: files[i],
                                gps:
                                    type == 'keyPlace'
                                        ? files[i][gps]
                                        : this.transform(files[i][gps][0], files[i][gps][1]),
                            });
                            pointFeature.setStyle(
                                new ol.style.Style({
                                    image: new ol.style.Icon({
                                        scale: map.getView().getZoom() / 25, // 图标缩放比例
                                        src:
                                            files[i].classify === 'hdCamera'
                                                ? './image/spjk_gq.png'
                                                : files[i].classify === 'ordinaryCamera'
                                                ? './image/spjk_bq.png'
                                                : files[i].classify === 'remoteCamera'
                                                ? './image/spjk_gd.png'
                                                : files[i] &&
                                                  files[i]['djj_type'] &&
                                                  files[i]['djj_type'] == 1
                                                ? './image/djj_1.png'
                                                : files[i] &&
                                                  files[i]['djj_type'] &&
                                                  files[i]['djj_type'] == 2
                                                ? './image/djj_2.png'
                                                : files[i] && files[i]['isZl']
                                                ? './image/scj_1.png'
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
                    view.fit(exent);
                    view.setCenter(center);
                }
            }
        }
    };
    //检索详情
    checkSearchDetails = (files, type) => {
        // 警情: 1,警车: 2,卡口: 3,视频卡口: 4,
        // 重点场所: 5,警务站: 6,对讲机: 7,单兵设备: 8
        console.log(files, type, '搜索详情');
        if (type) {
            this.setState({ searchDetailsType: type });
        }
        if (files) {
            this.setState({ searchDetails: files });
        }
        let types = type || this.state.searchDetailsType;
        if (types == '1') {
            this.setState({ showWarningsCon: true }, () => {
                this.policeDetailsMap(
                    files || this.state.searchDetails,
                    files ? true : false,
                    'sourceSearchBar',
                    'overlaySearchBar',
                    'showSearchBarVector',
                    'searchBar',
                );
            });
        } else if (types == '2') {
            this.getVehicleMap(true, {
                list: [files || this.state.searchDetails],
                bool: files ? true : false,
                source: 'sourceSearchBar',
                vector: 'showSearchBarVector',
                imgs: './image/xzcll.png',
                imgsOn: './image/xzcllon.png',
            });
        } else if (types == '3') {
            this.getPiontMap(
                [files || this.state.searchDetails],
                files ? true : false,
                'sourceSearchBar',
                'showSearchBarVector',
                './image/xzkk.png',
                'sourceSwan',
                'gps',
            );
        } else if (types == '4') {
            this.getPiontMap(
                [files || this.state.searchDetails],
                files ? true : false,
                'sourceSearchBar',
                'showSearchBarVector',
                './image/xzspjk.png',
                'monitoring',
                'gps',
            );
        } else if (types == '5') {
            this.getPiontMap(
                [files || this.state.searchDetails],
                files ? true : false,
                'sourceSearchBar',
                'showSearchBarVector',
                './image/xzzdcs.png',
                'keyPlace',
                'gps',
            );
        } else if (types == '6') {
            this.getPiontMap(
                [files || this.state.searchDetails],
                files ? true : false,
                'sourceSearchBar',
                'showSearchBarVector',
                './image/xzjwz.png',
                'policeStation',
                'gps',
            );
        } else if (types == '7') {
            this.getPiontMap(
                [files || this.state.searchDetails],
                files ? true : false,
                'sourceSearchBar',
                'showSearchBarVector',
                './image/xzdjj.png',
                'intercom',
                'gps_point',
            );
        } else if (types == '8') {
            this.getPiontMap(
                [files || this.state.searchDetails],
                files ? true : false,
                'sourceSearchBar',
                'showSearchBarVector',
                './image/xzyddb.png',
                'individual',
                'gps_point',
            );
        }
    };
    //关闭检索详情
    closeSearchDetails = () => {
        console.log(88888888888);
        const {
            map,
            view,
            sourceSearchBar,
            showSearchBarVector,
            searchBar,
            overlaySearchBar,
            searchDetails,
        } = this.state;
        var arr = [];
        sourceSearchBar.clear();
        showSearchBarVector.setSource(null);
        this.setState({ searchDetails: {}, searchDetailsType: '' });
        searchBar.innerHTML = '';
        overlaySearchBar.setPosition(undefined);
    };
    //警情详情
    checkPoliceDetails = files => {
        if (files) {
            this.setState({ policeDetails: files });
        }
        this.setState({ showWarningsCon: true }, () => {
            this.policeDetailsMap(
                files || this.state.policeDetails,
                files ? true : false,
                'sourcePoliceDetails',
                'overlayWarning',
                'showPoliceDetailsVector',
                'warnings',
                true,
            );
        });
    };
    //在地图上渲染轨迹
    getTrajectoryMap = files => {
        var _self = this;
        console.log('画轨迹==', files);
        const { view, map, sourceTrajectory, showTrajectoryVector } = this.state;
        const arr = [];
        const location = [];
        var geometry = new ol.geom.LineString();
        showTrajectoryVector.setSource(null);
        sourceTrajectory.clear();
        if (files.length) {
            for (let i = 0; i < files.length; i++) {
                if (files[i] && files[i].gps_point) {
                    if (longrg.test(files[i].gps_point[0]) && latreg.test(files[i].gps_point[1])) {
                        location.push(this.transform(files[i].gps_point[0], files[i].gps_point[1]));
                        // console.log('===', location)
                    }
                }
            }
            // console.log('---', location)
            if (location.length) {
                const lineFeature = new ol.Feature(new ol.geom.LineString(location));
                lineFeature.setStyle(
                    new ol.style.Style({
                        // 设置选中时的样式
                        stroke: new ol.style.Stroke({
                            color: '#FF6666FF',
                            size: 4,
                            width: 4,
                        }),
                    }),
                );
                lineFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');

                sourceTrajectory.addFeature(lineFeature);

                showTrajectoryVector.setSource(sourceTrajectory);
                for (let i = 0; i < location.length; i++) {
                    //获取轨迹点位各点坐标
                    arr.push(ol.proj.fromLonLat(location[i]));
                }

                let exent = ol.extent.boundingExtent(arr);
                let center = ol.extent.getCenter(exent);
                view.fit(exent);
                view.setCenter(center);
            }

            // var mapClick = map.on(
            // 	'click',
            // 	function(evt) {
            // 		showTrajectoryVector.setSource(null)
            // 		sourceTrajectory.clear()
            // 		ol.Observable.unByKey(mapClick)
            // 		// _self.setState({ showVehicleDetails: false })
            // 	}.bind(this)
            // )
        }
    };

    //渲染警情详情再地图上
    policeDetailsMap = (files, type, source, overlay, vector, warnings, isDetail) => {
        console.log(files, '警情详情');
        var _self = this;
        const {
            map,
            view,
            sourcePoliceDetails,
            overlayWarning,
            showPoliceDetailsVector,
            policeDetails,
            alarmcon,
        } = this.state;
        var arr = [];
        this.state[source].clear();
        this.state[vector].setSource(null);
        alarmcon.innerHTML = '';
        if (_self.state.showWarningsCon) {
            _self.state[warnings].innerHTML = '';
        }
        if (files) {
            if (files.xzb && files.yzb && files.xzb != 0.0 && files.yzb != 0.0) {
                console.log('files.xzb', files.xzb, files.yzb);
                if (longrg.test(files.xzb) && latreg.test(files.yzb)) {
                    const pointFeaturea = new ol.Feature({
                        geometry: new ol.geom.Point(
                            this.transform(Number(files.xzb), Number(files.yzb)),
                        ),
                    });
                    const pointFeature = new ol.Feature({
                        geometry: new ol.geom.Point(
                            this.transform(Number(files.xzb), Number(files.yzb)),
                        ),
                    });
                    const pointFeatured = new ol.Feature({
                        geometry: new ol.geom.Point(
                            this.transform(Number(files.xzb), Number(files.yzb)),
                        ),
                        type: 'showAlert',
                        layer: files,
                        gps: this.transform(Number(files.xzb), Number(files.yzb)),
                    });
                    const pointFeatureT = new ol.Feature({
                        geometry: new ol.geom.Point(
                            this.transform(Number(files.xzb), Number(files.yzb)),
                        ),
                        // type: 'showAlert',
                        layer: files,
                        warnings: warnings,
                        gps: this.transform(Number(files.xzb), Number(files.yzb)),
                    });
                    pointFeatureT.setStyle(
                        new ol.style.Style({
                            image: new ol.style.Icon({
                                scale: map.getView().getZoom() / 20, // 图标缩放比例
                                anchor: [0.5, 1],
                                src: './image/jqicon_6.png', // 图标的url
                            }),
                        }),
                    );
                    pointFeatured.setStyle(
                        new ol.style.Style({
                            image: new ol.style.Icon({
                                scale: this.warningStyles().d / 400,
                                // scale: map.getView().getZoom() / 15, // 图标缩放比例
                                src: './image/jqicon_2.png', // 图标的url
                            }),
                        }),
                    );
                    pointFeature.setStyle(
                        new ol.style.Style({
                            image: new ol.style.Icon({
                                scale: this.warningStyles().b / 400, // 图标缩放比例
                                // size:[this.warningStyles().b,this.warningStyles().b],
                                src: './image/jqicon_3.png', // 图标的url
                            }),
                        }),
                    );
                    pointFeaturea.setStyle(
                        new ol.style.Style({
                            image: new ol.style.Icon({
                                scale: this.warningStyles().c / 400, // 图标缩放比例
                                // scale: map.getView().getZoom() / 15, // 图标缩放比例
                                src: './image/jqicon_4.png', // 图标的url
                            }),
                        }),
                    );

                    pointFeatured.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                    pointFeaturea.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                    pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                    pointFeatureT.getGeometry().transform('EPSG:4326', 'EPSG:3857');

                    _self.state[source].addFeature(pointFeaturea);
                    _self.state[source].addFeature(pointFeatured);
                    _self.state[source].addFeature(pointFeature);
                    // _self.state[source].addFeature(pointFeatureT)
                    _self.setState({
                        pointFeaturea,
                        pointFeature,
                        pointFeatureT,
                        singleWaring: true,
                    });
                    _self.state.policeAlarmOverlay.setPosition(
                        ol.proj.fromLonLat(this.transform(Number(files.xzb), Number(files.yzb))),
                    );
                    var body = document.createElement('img');
                    body.className = 'policeAlarmBody';
                    body.id = 'policeAlarmBody';
                    body.src = './image/jqicon_1.gif';
                    body.style.cursor = 'pointer';
                    body.style.transform =
                        'scale(' +
                        `${Number(map.getView().getZoom() / 20)}` +
                        // `${
                        //     Number(map.getView().getZoom()) < 12
                        //         ? map.getView().getZoom() / 15
                        //         : Number(map.getView().getZoom()) > 14
                        //         ? map.getView().getZoom() / 5
                        //         : this.warningStyles().d / 50
                        // }` +
                        ')';
                    alarmcon.appendChild(body);
                    _self.state[overlay].setPosition(
                        ol.proj.fromLonLat(this.transform(Number(files.xzb), Number(files.yzb))),
                    );
                    if (_self.state.showWarningsCon) {
                        _self.warningRender(files, _self.state[warnings]);
                    }
                }
            } else {
                if (isDetail && JSON.stringify(files) != '{}') {
                    message.warning('当前警情暂无定位');
                }
            }
            _self.state[vector].setSource(_self.state[source]);

            if (type) {
                if (files.xzb && files.yzb && files.xzb != 0.0 && files.yzb != 0.0) {
                    arr.push(
                        ol.proj.fromLonLat(this.transform(Number(files.xzb), Number(files.yzb))),
                    );

                    //设置中心点
                    let exent = ol.extent.boundingExtent(arr);
                    let center = ol.extent.getCenter(exent);

                    view.fit(exent);
                    view.setZoom(13);
                    view.setCenter(center);
                }
            }
        }
    };
    //关闭接处警详情
    closePoliceDetails = () => {
        console.log(88888888888);
        const {
            map,
            view,
            warnings,
            overlayWarning,
            sourcePoliceDetails,
            showPoliceDetailsVector,
            policeDetails,
            alarmcon,
            policeAlarmOverlay,
        } = this.state;
        var arr = [];
        sourcePoliceDetails.clear();
        showPoliceDetailsVector.setSource(null);
        this.setState({ policeDetails: {} });
        warnings.innerHTML = '';
        alarmcon.innerHTML = '';
        policeAlarmOverlay.setPosition(undefined);
        overlayWarning.setPosition(undefined);
    };
    //预警详情
    checkAlarmDetails = files => {
        console.log(files, '预警详情');
        // if(files.alarm_type == 0 || files.alarm_type == 1 || files.alarm_type == 5){
        this.setState({
            showAlarmDetails: true,
            alarmType: files.alarm_type,
            alarmDetails: files.alarm_message,
        });
        // }
    };
    closeAlarmDetails = () => {
        this.setState({ alarmType: null, alarmDetails: {}, showAlarmDetails: false });
    };
    //视频和轨迹按钮构造函数
    addFeatrueInfo = info => {
        var _self = this;
        const { content, showTrajectory, selectVehicleInfor, map, overlay } = this.state;
        content.innerHTML = '';
        var bodyA = document.createElement('div');
        bodyA.className = 'contentBody';
        content.appendChild(bodyA);
        var elementA = document.createElement('div');
        elementA.className = 'markerTrajectory';
        elementA.id = 'markerTrajectory';
        var elementB = document.createElement('div');
        elementB.className = 'markerVideo';
        elementB.id = 'markerVideo';
        bodyA.appendChild(elementA);
        bodyA.appendChild(elementB);
        // var elementImg = document.createElement('img');
        // elementImg.src = './image/gj_icon.png';
        // elementA.appendChild(elementImg);
        var elementVideoImg = document.createElement('img');
        elementVideoImg.src = './image/video_icon2.png';
        elementB.appendChild(elementVideoImg);
        // var spanA = document.createElement('span');
        // if (showTrajectory) {
        //     spanA.innerText = '隐藏轨迹';
        // } else {
        //     spanA.innerText = '轨迹';
        // }
        // elementA.appendChild(spanA);
        var spanB = document.createElement('span');
        spanB.innerText = '视频';
        elementB.appendChild(spanB);
        this.setState({ mapClik: true });
        var markerTrajectory = document.getElementById('markerTrajectory');
        var colseVideo = document.getElementById('colseVideo');
        var markerVideo = document.getElementById('markerVideo');
        if (markerVideo) {
            markerTrajectory.onclick = () => {
                console.log('yincan----------------', selectVehicleInfor);
                if (_self.state.showTrajectory) {
                    console.log('yincan----------------');
                    _self.setState({ showTrajectory: false }, () => {
                        _self.addFeatrueInfo(info);
                        _self.state.showTrajectoryVector.setSource(null);
                        _self.state.sourceTrajectory.clear();
                    });
                } else {
                    _self.props.dispatch({
                        type: 'home/getVehicleTrajectory',
                        payload: {
                            endTime: '',
                            ifDay: '1',
                            startTime: '',
                            vehicle_id: info.vehicle_id,
                        },
                        success: e => {
                            console.log(e);
                            const selectVehicleInfors = selectVehicleInfor[0];
                            if (e.result.reason.code == '200') {
                                if (e.result.list) {
                                    if (e.result.list.length) {
                                        _self.setState(
                                            {
                                                showTrajectory: true,
                                                selectVehicleInfor: [
                                                    {
                                                        ...selectVehicleInfors,
                                                        gps_point:
                                                            e.result.list[e.result.list.length - 1]
                                                                .gps_point,
                                                    },
                                                ],
                                            },
                                            () => {
                                                console.log(
                                                    selectVehicleInfors,
                                                    e.result.list[e.result.list.length - 1],
                                                    '===========---',
                                                );
                                                _self.getTrajectoryMap(e.result.list);
                                                _self.getVehicleMap(false);
                                                overlay.setPosition(
                                                    ol.proj.fromLonLat(
                                                        _self.transform(
                                                            e.result.list[e.result.list.length - 1]
                                                                .gps_point[0],
                                                            e.result.list[e.result.list.length - 1]
                                                                .gps_point[1],
                                                        ),
                                                    ),
                                                );
                                                overlay.setOffset([
                                                    0,
                                                    Number(map.getView().getZoom() / 0.45),
                                                ]);
                                                _self.addFeatrueInfo(info);
                                            },
                                        );
                                    } else {
                                        message.error('暂无轨迹');
                                        return false;
                                    }
                                }
                            } else {
                                return false;
                            }
                        },
                    });
                }
            };
            markerVideo.onclick = () => {
                if (info.vehicle_state == 1) {
                    let videoInfor = [];
                    if (info.device_message && info.device_message.length > 0) {
                        let videoInfor = [];
                        info.device_message.map(item => {
                            _self.props.dispatch({
                                type: 'home/getPlayUrl',
                                payload: {
                                    cameraIndexCode: item.sbdsfbm,
                                    subStream: '1',
                                    protocol: 'hls',
                                },
                                success: e => {
                                    if (
                                        e.result &&
                                        e.result.reason &&
                                        e.result.reason.code &&
                                        e.result.reason.code == '200'
                                    ) {
                                        if (e.result && e.result.data && e.result.data.url) {
                                            videoInfor.push({
                                                mldz: e.result.data.url,
                                                device_name: '视频',
                                                kkdm: item.sbdsfbm,
                                            });
                                        }
                                    }
                                },
                            });
                        });
                        console.log('videoInfor=======>', videoInfor);
                        _self.setState({
                            showVideo: true,
                            showSwanVideo: false,
                            needX1: (document.body.offsetWidth - 1145) / 2,
                            needY1: 150,
                            isSmall1: false,
                            isBig1: false,
                            videoInfor,
                            // videoInfor: info.device_message || [],
                        });
                    } else {
                        message.error('该车未绑定设备！');
                        return false;
                    }
                } else {
                    message.error('该车为离线状态，无在线设备！');
                    return false;
                }
            };
        }
    };
    handleCancels = isWd => {
        let { draw, map, source } = this.state;
        if (draw) {
            console.log('draw', draw);
            draw.setActive(false);
            map.removeInteraction(draw);
            source.clear();
            document.getElementById('map').onmouseover = function() {
                this.style.cursor = 'auto';
            };
        }
        this.setState(
            {
                visible: false,
                isWd: isWd,
                filePersonList: [],
                fileCarList: [],
            },
            () => {
                setTimeout(() => {
                    this.setState({
                        dkloading: false,
                    });
                }, 200);
            },
        );
    };
    getShowBkArea = (center, list) => {
        console.log('-------------执行-------------');
        this.setState({
            isWd: true,
        });
        this.getWdqMap(center, list);
    };
    //在地图上渲染围堵圈
    getWdqMap = (center, list) => {
        const { sourceWd, showWdVector, map, view } = this.state;
        sourceWd.clear();
        showWdVector.setSource(null);
        if (center) {
            const pointFeature = new ol.Feature({
                geometry: new ol.geom.Point(center),
                typeName: 'Point',
            });
            pointFeature.setStyle(
                new ol.style.Style({
                    image: new ol.style.Icon({
                        scale: map.getView().getZoom() / 15, // 图标缩放比例 // 0为离线其他为在线
                        src: './image/jqicon_6.png', // 图标的url
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#5358FD',
                        size: 10,
                        width: 10,
                    }),
                }),
            );
            pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857'); // location.push(position)
            sourceWd.addFeature(pointFeature);
            showWdVector.setSource(sourceWd);
        }
        if (list && list.pointsF && list.pointsF !== 'ERROR') {
            let pointsList = JSON.parse(list.pointsF);
            pointsList.map((item, index) => {
                const pointFeature = new ol.Feature({
                    geometry: new ol.geom.Point(item),
                    typeName: 'Point',
                    // name: index + 1,
                });
                pointFeature.setStyle(
                    new ol.style.Style({
                        image: new ol.style.Icon({
                            scale: map.getView().getZoom() / 25, // 图标缩放比例 // 0为离线其他为在线
                            // src: './image/test'+(index+1)+'.png', // 图标的url
                            src: './image/qz01.png', // 图标的url
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#5358FD',
                            size: 10,
                            width: 10,
                        }),
                    }),
                );
                pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857'); // location.push(position)
                sourceWd.addFeature(pointFeature);
                showWdVector.setSource(sourceWd);
            });
            // list.pointsF.map((item)=>{
            //     pointsList.push([item.y,item.x])
            // });
            const polygonFeature = new ol.Feature({
                geometry: new ol.geom.Polygon([pointsList]),
            });
            polygonFeature.setStyle(
                new ol.style.Style({
                    // 设置选中时的样式
                    stroke: new ol.style.Stroke({
                        color: '#fc5c65',
                        size: 3,
                        width: 3,
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(252,92,101, 0.3)',
                    }),
                }),
            );

            polygonFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
            sourceWd.addFeature(polygonFeature);
            showWdVector.setSource(sourceWd);
            let arr = [];
            for (let i = 0; i < pointsList.length; i++) {
                //获取轨迹点位各点坐标
                arr.push(ol.proj.fromLonLat(pointsList[i]));
            }

            // let exent = ol.extent.boundingExtent(arr);
            // let center = ol.extent.getCenter(exent);
            // view.fit(exent);
            // view.setCenter(center);
        }
        if (list && list.pointsS && list.pointsS !== 'ERROR') {
            let pointsList = JSON.parse(list.pointsS);
            pointsList.map((item, index) => {
                const pointFeature = new ol.Feature({
                    geometry: new ol.geom.Point(item),
                    typeName: 'Point',
                    // name: index + 1,
                });
                pointFeature.setStyle(
                    new ol.style.Style({
                        image: new ol.style.Icon({
                            scale: map.getView().getZoom() / 25, // 图标缩放比例 // 0为离线其他为在线
                            // src: './image/test'+(index+1)+'.png', // 图标的url
                            src: './image/qz02.png', // 图标的url
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#5358FD',
                            size: 10,
                            width: 10,
                        }),
                    }),
                );
                pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857'); // location.push(position)
                sourceWd.addFeature(pointFeature);
                showWdVector.setSource(sourceWd);
            });
            // list.pointsS.map((item)=>{
            //     pointsList.push([item.y,item.x])
            // });
            const polygonFeature = new ol.Feature({
                geometry: new ol.geom.Polygon([pointsList]),
            });
            polygonFeature.setStyle(
                new ol.style.Style({
                    // 设置选中时的样式
                    stroke: new ol.style.Stroke({
                        color: '#f6b766',
                        size: 3,
                        width: 3,
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(246,183,102, 0.2)',
                    }),
                }),
            );

            polygonFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
            sourceWd.addFeature(polygonFeature);
            showWdVector.setSource(sourceWd);
            let arr = [];
            for (let i = 0; i < pointsList.length; i++) {
                //获取轨迹点位各点坐标
                arr.push(ol.proj.fromLonLat(pointsList[i]));
            }

            // let exent = ol.extent.boundingExtent(arr);
            // let center = ol.extent.getCenter(exent);
            // view.fit(exent);
            // view.setCenter(center);
        }
        if (list && list.pointsT && list.pointsT !== 'ERROR') {
            let pointsList = JSON.parse(list.pointsT);
            pointsList.map((item, index) => {
                const pointFeature = new ol.Feature({
                    geometry: new ol.geom.Point(item),
                    typeName: 'Point',
                    // name: index + 1,
                });
                pointFeature.setStyle(
                    new ol.style.Style({
                        image: new ol.style.Icon({
                            scale: map.getView().getZoom() / 25, // 图标缩放比例 // 0为离线其他为在线
                            // src: './image/test'+(index+1)+'.png', // 图标的url
                            src: './image/qz03.png', // 图标的url
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#5358FD',
                            size: 10,
                            width: 10,
                        }),
                    }),
                );
                pointFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857'); // location.push(position)
                sourceWd.addFeature(pointFeature);
                showWdVector.setSource(sourceWd);
            });
            // list.pointsT.map((item)=>{
            //     pointsList.push([item.y,item.x])
            // });
            const polygonFeature = new ol.Feature({
                geometry: new ol.geom.Polygon([pointsList]),
            });
            polygonFeature.setStyle(
                new ol.style.Style({
                    // 设置选中时的样式
                    stroke: new ol.style.Stroke({
                        color: '#171cba',
                        size: 3,
                        width: 3,
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(23,28,186, 0.1)',
                    }),
                }),
            );

            polygonFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
            sourceWd.addFeature(polygonFeature);
            showWdVector.setSource(sourceWd);
            let arr = [];
            for (let i = 0; i < pointsList.length; i++) {
                //获取轨迹点位各点坐标
                arr.push(ol.proj.fromLonLat(pointsList[i]));
            }

            // let exent = ol.extent.boundingExtent(arr);
            // let center = ol.extent.getCenter(exent);
            // view.fit(exent);
            // view.setCenter(center);
        }
        var zl = document.getElementById('zl');
        var zlContent = document.getElementById('zl-content');
        var overlayWarning = new ol.Overlay(
            /** @type {olx.OverlayOptions} */ {
                element: zl,
                autoPan: true,
                positioning: 'right-center',
                stopEvent: false,
                autoPanAnimation: {
                    duration: 250,
                },
            },
        );
        map.addOverlay(overlayWarning);
        overlayWarning.setPosition(ol.proj.fromLonLat(center));
        // this.getZl(zlContent);
        this.handleCreateModalVisible(true);
        if (!this.state.showVehicle) {
            this.setState({ showVehicle: true }, () => {
                this.sendSet();
            });
        }
        if (!this.state.showIndividual) {
            this.setState({ showIndividual: true }, () => {
                // this.getBayonetsList(6);
                this.sendSet();
            });
        }
    };
    warningDk = record => {
        console.log('=====预警内容', record);
        this.setState(
            {
                drawGps: [Number(record.jd), Number(record.wd)],
                dkloading: true,
                visible: true,
                zltzRecord: record,
            },
            () => {
                if (record.alarm_message && record.alarm_message.portrait_img) {
                    this.getImgUpload(record.alarm_message.portrait_img);
                }
                this.handleOk();
            },
        );
    };
    //是否下发指令
    getZl = warnings => {
        var _self = this;
        console.log('fwarnings', warnings);
        warnings.innerHTML = '';
        var body = document.createElement('div');
        body.className = 'zlBody';
        body.style.backgroundImage = "url('./image/jqbj.png')";
        warnings.appendChild(body);
        var elementA = document.createElement('div');
        elementA.className = 'item';
        body.appendChild(elementA);
        var spanB = document.createElement('div');
        spanB.className = 'item';
        spanB.innerText = '是否确定要下发指令通知?';
        elementA.appendChild(spanB);
        var buttonA = document.createElement('button');
        buttonA.className = 'buttonA';
        buttonA.id = 'buttonA';
        buttonA.innerText = '确定';
        body.appendChild(buttonA);
        var buttonB = document.createElement('buttonB');
        buttonB.className = 'buttonB';
        buttonB.id = 'buttonB';
        buttonB.innerText = '取消';
        body.appendChild(buttonB);
        var buttonA = document.getElementById('buttonA');
        var buttonB = document.getElementById('buttonB');
        if (buttonB) {
            buttonB.onclick = () => {
                warnings.innerHTML = '';
            };
        }
        if (buttonA) {
            buttonA.onclick = () => {
                warnings.innerHTML = '';
                this.handleCreateModalVisible(true);
            };
        }
    };
    handleOk = () => {
        this.setState({
            jqHide: !this.state.jqHide,
        });
        let _self = this;
        const { drawGps } = this.state;
        console.log('drawGps1', drawGps);
        this.props.form.validateFields((err, fieldsValue) => {
            if (err) return;
            _self.setState({
                dkloading: true,
            });
            this.props.dispatch({
                type: 'otherIndex/getHullByPoint',
                payload: {
                    fromLon: drawGps && drawGps[0] ? drawGps[0].toString() : '',
                    fromLat: drawGps && drawGps[1] ? drawGps[1].toString() : '',
                },
                callback: res => {
                    if (!res.reason) {
                        if (res.result && res.result.pointPd) {
                            let list = res.result.pointPd;
                            _self.getShowBkArea(drawGps, list);
                            _self.handleCancels(true);
                        }
                    } else {
                        message.warn('操作失败，请重试');
                        this.setState({
                            dkloading: false,
                        });
                    }
                },
            });
        });
    };
    //警情信息构造函数
    warningRender = (files, warnings) => {
        var _self = this;
        console.log('files, warnings', files, warnings);
        warnings.innerHTML = '';
        var body = document.createElement('div');
        body.className = 'warningBody';
        body.style.backgroundImage = "url('./image/jqbj.png')";
        warnings.appendChild(body);
        var imgsA = document.createElement('img');
        imgsA.className = 'close_s';
        imgsA.id = 'close_s';
        imgsA.src = './image/close_1.png';
        body.appendChild(imgsA);
        var elementA = document.createElement('div');
        elementA.className = 'item';
        body.appendChild(elementA);
        var spanB = document.createElement('div');
        spanB.className = 'itemTitle';
        spanB.innerText = files.bjlxdm;
        elementA.appendChild(spanB);
        var elementA = document.createElement('div');
        elementA.className = 'item';
        body.appendChild(elementA);
        var spanA = document.createElement('div');
        spanA.className = 'title';
        spanA.innerText = '警情编号 ：';
        elementA.appendChild(spanA);
        var spanB = document.createElement('div');
        spanB.className = 'text';
        spanB.innerText = files.jqbh;
        elementA.appendChild(spanB);
        var elementA = document.createElement('div');
        elementA.className = 'item';
        body.appendChild(elementA);
        var spanA = document.createElement('div');
        spanA.className = 'title';
        spanA.innerText = '报案时间 ：';
        elementA.appendChild(spanA);
        var spanB = document.createElement('div');
        spanB.className = 'text';
        spanB.innerText = files.afsj || files.bjsj;
        elementA.appendChild(spanB);
        var elementA = document.createElement('div');
        elementA.className = 'item';
        body.appendChild(elementA);
        var spanA = document.createElement('div');
        spanA.className = 'title';
        spanA.innerText = '警情地点 ：';
        elementA.appendChild(spanA);
        var spanB = document.createElement('div');
        spanB.className = 'text';
        spanB.innerText = files.afdd;
        elementA.appendChild(spanB);
        var elementA = document.createElement('div');
        elementA.className = 'item';
        body.appendChild(elementA);
        var spanA = document.createElement('div');
        spanA.className = 'title';
        spanA.innerText = '报警电话 ：';
        elementA.appendChild(spanA);
        var spanB = document.createElement('div');
        spanB.className = 'text';
        spanB.innerText = files.bjrxm + '-' + (files.lxdh || files.bjdh);
        elementA.appendChild(spanB);
        var elementA = document.createElement('div');
        elementA.className = 'item';
        body.appendChild(elementA);
        var spanA = document.createElement('div');
        spanA.className = 'title';
        spanA.innerText = '警情类别 ：';
        elementA.appendChild(spanA);
        var spanB = document.createElement('div');
        spanB.className = 'text';
        spanB.innerText =
            (files.bjlbdm ? files.bjlbdm : '') +
            `${files.bjlxdm == null ? '' : `-${files.bjlxdm}`}` +
            `${files.bjxldm == null ? '' : `-${files.bjxldm}`}`;
        elementA.appendChild(spanB);
        var elementA = document.createElement('div');
        elementA.className = 'item';
        body.appendChild(elementA);
        var spanA = document.createElement('div');
        spanA.className = 'title';
        spanA.innerText = '报警单位 ：';
        elementA.appendChild(spanA);
        var spanB = document.createElement('div');
        spanB.className = 'text';
        spanB.innerText = files.gxdwdm;
        elementA.appendChild(spanB);
        var elementA = document.createElement('div');
        elementA.className = 'item';
        body.appendChild(elementA);
        var spanA = document.createElement('div');
        spanA.className = 'title';
        spanA.innerText = '报警内容 ：';
        elementA.appendChild(spanA);
        var spanB = document.createElement('div');
        spanB.className = 'text';
        spanB.innerText = files.bjnr;
        elementA.appendChild(spanB);
        console.log('elementA', elementA);
        body.appendChild(elementA);
        var buttonA = document.createElement('button');
        if (!this.state.isWd) {
            buttonA.className = 'buttonA';
            buttonA.id = 'buttonA';
            buttonA.innerText = '堵控';
            body.appendChild(buttonA);
        }
        var close_s = document.getElementById('close_s');
        var buttonA = document.getElementById('buttonA');
        var policeAlarmBody = document.getElementById('policeAlarmBody');
        if (close_s) {
            close_s.onclick = () => {
                if (_self.state.showWarningsCon) {
                    _self.setState({ showWarningsCon: false }, () => {
                        warnings.innerHTML = '';
                    });
                } else {
                    warnings.innerHTML = '';
                }
            };
        }
        console.log('files======>', files);
        // bt:
        //     this.state.zltzRecord &&
        //     this.state.zltzRecord.alarm_message &&
        //     this.state.zltzRecord.alarm_message.verificationPortraitDataList &&
        //     this.state.zltzRecord.alarm_message.verificationPortraitDataList[0]
        //         .name
        //         ? this.state.zltzRecord.alarm_message
        //         .verificationPortraitDataList[0].name + '需要被堵控'
        //         : '',
        //         nr:
        // this.state.zltzRecord &&
        // this.state.zltzRecord.alarm_message &&
        // this.state.zltzRecord.alarm_message.verificationPortraitDataList &&
        // this.state.zltzRecord.alarm_message.verificationPortraitDataList[0]
        //     .name
        //     ? this.state.zltzRecord.alarm_message
        //     .verificationPortraitDataList[0].name + '需要被堵控'
        //     : '',
        if (buttonA) {
            buttonA.onclick = () => {
                _self.setState(
                    {
                        drawGps: this.transform(Number(files.xzb), Number(files.yzb)),
                        isWd: true,
                        zltzRecord: { bt: files.afdd + '发生警情', nr: files.bjnr },
                    },
                    () => {
                        _self.handleOk();
                    },
                );
                // _self.getShowBk();
            };
        }
        if (policeAlarmBody) {
            // policeAlarmBody.onclick = () => {
            // 	if (!_self.state.showWarningsCon) {
            // 		_self.setState({ showWarningsCon: true }, () => {
            // 			_self.warningRender(files, warnings)
            // 		})
            // 	}
            // }
        }
    };
    getShowBk = () => {
        this.setState({
            visible: true,
        });
    };
    closeLiveVideo = type => {
        if (type === 'car') {
            this.setState({
                showVideo: false,
                videoInfor: [],
                isSmall1: false,
                isBig1: false,
            });
        } else {
            this.setState({
                showSwanVideo: false,
                isSmall: false,
                isBig: false,
                len: 1,
            });
            swanVideoList = [];
            this.setState({
                swanVideoList,
            });
        }
    };
    getSmall = type => {
        if (type === 'car') {
            this.setState({
                isSmall1: true,
            });
        } else {
            this.setState({
                isSmall: true,
            });
        }
    };
    getBig = type => {
        if (type === 'car') {
            this.setState({
                isBig1: true,
                needX1: -50,
                needY1: 34,
            });
        } else {
            this.setState({
                isBig: true,
                needX: -50,
                needY: 34,
            });
        }
    };
    getBlock = type => {
        if (type === 'car') {
            this.setState({
                isSmall1: false,
                isBig1: false,
                needX1: (document.body.offsetWidth - 1145) / 2,
                needY1: 150,
            });
        } else {
            this.setState({
                isSmall: false,
                isBig: false,
                needX: (document.body.offsetWidth - 1145) / 2,
                needY: 150,
            });
        }
    };
    renderVideo = data => {
        let Dom = [];
        if (data && data.length > 9) {
            data = data.slice(0, 9);
        }
        if (data.length < 10) {
            data &&
                data.map((item, index) => {
                    Dom.push(
                        <Col
                            span={data.length < 5 ? 12 : 8}
                            style={{
                                height: this.state.isBig1
                                    ? data.length < 5
                                        ? parseInt((document.body.offsetHeight - 118) / 2)
                                        : parseInt((document.body.offsetHeight - 118) / 3)
                                    : this.state.isSmall1
                                    ? data.length < 5
                                        ? 90
                                        : 60
                                    : data.length < 5
                                    ? 250
                                    : '220px',
                            }}
                        >
                            <div className={styles.itemCol}>
                                <VideoPlayers
                                    key={item}
                                    width={
                                        this.state.isBig1
                                            ? data.length < 5
                                                ? parseInt((document.body.offsetWidth - 95) / 2)
                                                : parseInt((document.body.offsetWidth - 95) / 3)
                                            : this.state.isSmall1
                                            ? data.length < 5
                                                ? 135
                                                : 90
                                            : data.length < 5
                                            ? 450
                                            : 300
                                    }
                                    height={
                                        this.state.isBig1
                                            ? data.length < 5
                                                ? parseInt((document.body.offsetHeight - 118) / 2)
                                                : parseInt((document.body.offsetHeight - 118) / 3)
                                            : this.state.isSmall1
                                            ? data.length < 5
                                                ? 90
                                                : 60
                                            : data.length < 5
                                            ? 250
                                            : 220
                                    }
                                    id={`myVideo${index}`}
                                    src={item.mldz}
                                    autoPlays={index == 0 ? true : false}
                                />
                            </div>
                        </Col>,
                    );
                });
            let num = data.length < 5 ? 4 - data.length : 9 - data.length; //不足9个，剩与空白占位
            for (let i = 0; i < num; i++) {
                Dom.push(
                    <Col
                        span={data.length < 5 ? 12 : 8}
                        style={{
                            height: this.state.isBig1
                                ? data.length < 5
                                    ? parseInt((document.body.offsetHeight - 118) / 2)
                                    : parseInt((document.body.offsetHeight - 118) / 3)
                                : this.state.isSmall1
                                ? data.length < 5
                                    ? 90
                                    : 60
                                : data.length < 5
                                ? 250
                                : '220px',
                        }}
                    >
                        <div
                            className={styles.itemCol_empty}
                            key={i}
                            style={{
                                textAlign: 'center',
                                lineHeight: this.state.isBig1
                                    ? data.length < 5
                                        ? parseInt((document.body.offsetHeight - 118) / 2) + 'px'
                                        : parseInt((document.body.offsetHeight - 118) / 3) + 'px'
                                    : this.state.isSmall1
                                    ? data.length < 5
                                        ? '90px'
                                        : '60px'
                                    : data.length < 5
                                    ? '250px'
                                    : '220px',
                                boxSizing: 'border-box',
                                width: '100%',
                                height: this.state.isBig1
                                    ? data.length < 5
                                        ? parseInt((document.body.offsetHeight - 118) / 2)
                                        : parseInt((document.body.offsetHeight - 118) / 3)
                                    : this.state.isSmall1
                                    ? data.length < 5
                                        ? 90
                                        : 60
                                    : data.length < 5
                                    ? 250
                                    : '220px',
                                backgroundColor: '#666',
                            }}
                        >
                            <img
                                src="./image/video.png"
                                style={{
                                    height: this.state.isSmall1 ? (data.length < 5 ? 30 : 20) : 90,
                                }}
                            />
                        </div>
                    </Col>,
                );
            }
        }
        return Dom;
    };
    closeVideo = index => {
        this.state.swanVideoList.splice(index, 1);
        swanVideoList.splice(index, 1);
        this.setState(
            {
                swanVideoList: [...this.state.swanVideoList],
            },
            () => {
                this.renderVideos(this.state.swanVideoList, this.state.len);
            },
        );
    };
    renderVideos = (data, len) => {
        let Dom = [];
        if (len) {
            if (data && data.length > len) {
                data = data.slice(0, len);
            }
        } else {
            if (data && data.length > 9) {
                data = data.slice(0, 9);
            }
        }
        if (data.length < 10) {
            data &&
                data.map((item, index) => {
                    Dom.push(
                        <Col
                            span={this.state.len < 5 ? 12 : 8}
                            style={{
                                height: this.state.isBig
                                    ? this.state.len < 5
                                        ? parseInt((document.body.offsetHeight - 118) / 2)
                                        : parseInt((document.body.offsetHeight - 118) / 3)
                                    : this.state.isSmall
                                    ? this.state.len < 5
                                        ? 90
                                        : 60
                                    : this.state.len < 5
                                    ? 250
                                    : '220px',
                            }}
                        >
                            <div className={styles.itemCol}>
                                <Icon
                                    type="close-circle"
                                    theme="filled"
                                    className={styles.closeSmall}
                                    onClick={index => this.closeVideo(index)}
                                />
                                <VideoPlayers
                                    key={item}
                                    width={
                                        this.state.isBig
                                            ? this.state.len < 5
                                                ? parseInt((document.body.offsetWidth - 95) / 2)
                                                : parseInt((document.body.offsetWidth - 95) / 3)
                                            : this.state.isSmall
                                            ? this.state.len < 5
                                                ? 135
                                                : 90
                                            : this.state.len < 5
                                            ? 450
                                            : 300
                                    }
                                    height={
                                        this.state.isBig
                                            ? this.state.len < 5
                                                ? parseInt((document.body.offsetHeight - 118) / 2)
                                                : parseInt((document.body.offsetHeight - 118) / 3)
                                            : this.state.isSmall
                                            ? this.state.len < 5
                                                ? 90
                                                : 60
                                            : this.state.len < 5
                                            ? 250
                                            : 220
                                    }
                                    id={`myVideo${index}`}
                                    src={item.mldz}
                                    autoPlays={true}
                                />
                            </div>
                        </Col>,
                    );
                });
            let num = this.state.len < 5 ? 4 - data.length : 9 - data.length; //不足9个，剩与空白占位
            for (let i = 0; i < num; i++) {
                Dom.push(
                    <Col
                        span={this.state.len < 5 ? 12 : 8}
                        style={{
                            height: this.state.isBig
                                ? this.state.len < 5
                                    ? parseInt((document.body.offsetHeight - 118) / 2)
                                    : parseInt((document.body.offsetHeight - 118) / 3)
                                : this.state.isSmall
                                ? this.state.len < 5
                                    ? 90
                                    : 60
                                : this.state.len < 5
                                ? 250
                                : '220px',
                        }}
                    >
                        <div
                            className={styles.itemCol_empty}
                            key={i}
                            style={{
                                textAlign: 'center',
                                lineHeight: this.state.isBig
                                    ? this.state.len < 5
                                        ? parseInt((document.body.offsetHeight - 118) / 2) + 'px'
                                        : parseInt((document.body.offsetHeight - 118) / 3) + 'px'
                                    : this.state.isSmall
                                    ? this.state.len < 5
                                        ? '90px'
                                        : '60px'
                                    : this.state.len < 5
                                    ? '250px'
                                    : '220px',
                                boxSizing: 'border-box',
                                width: '100%',
                                height: this.state.isBig
                                    ? this.state.len < 5
                                        ? parseInt((document.body.offsetHeight - 118) / 2)
                                        : parseInt((document.body.offsetHeight - 118) / 3)
                                    : this.state.isSmall
                                    ? this.state.len < 5
                                        ? 90
                                        : 60
                                    : this.state.len < 5
                                    ? 250
                                    : '220px',
                                backgroundColor: '#666',
                            }}
                        >
                            <img
                                src="./image/video.png"
                                style={{
                                    height: this.state.isSmall
                                        ? this.state.len < 5
                                            ? 30
                                            : 20
                                        : 90,
                                }}
                            />
                        </div>
                    </Col>,
                );
            }
        }
        return Dom;
    };
    toSynergyDetail = (files, bool) => {
        const { dispatch } = this.props;
        // equipmentType
        dispatch({
            type: 'otherIndex/queryCorrdingatedList',
            payload: { coordinated_operations_id: files.coordinated_operations_id },
            success: e => {
                if (e.result.reason.code == '200') {
                    console.log(e, 'xiangqi=====');
                    if (bool) {
                        this.setState({ showSynergyDetail: true });
                    }
                    this.setState({ synergyDetail: files });
                    sessionStorage.setItem('synergyDetail', JSON.stringify(files));
                } else {
                    return false;
                }
            },
        });
    };
    ptzControl = () => {
        this.setState({ lock: true });
        const { dispatch } = this.props;
        // equipmentType
        dispatch({
            type: 'otherIndex/ptzControl',
            payload: {},
            success: e => {
                this.setState({ lock: false });
                if (e.result.reason.code == '200') {
                } else {
                    return false;
                }
            },
        });
    };
    /*定义鼠标下落事件*/
    fnDown = e => {
        /*事件兼容*/
        let event = e || window.event;
        /*事件源对象兼容*/
        let target = document.getElementById('box');
        /*获取鼠标按下的地方距离元素左侧和上侧的距离*/
        this.disX = event.clientX - target.offsetLeft;
        this.disY = event.clientY - target.offsetTop;
        /*定义鼠标移动事件*/
        document.onmousemove = this.fnMove.bind(this);
        /*定义鼠标抬起事件*/
        document.onmouseup = this.fnUp.bind(this);
    };
    /*定义鼠标移动事件*/
    fnMove = e => {
        /*事件兼容*/
        let event = e || window.event;
        console.log(event.clientX - this.disX, event.clientY - this.disY);
        this.setState({
            needX: event.clientX - this.disX - 150,
            needY: event.clientY - this.disY - 20,
        });
    };
    fnUp = () => {
        console.log('log');
        document.onmousemove = null;
        document.onmuseup = null;
    };
    /*定义鼠标下落事件*/
    fnDown1 = e => {
        /*事件兼容*/
        let event = e || window.event;
        /*事件源对象兼容*/
        let target = document.getElementById('box1');
        /*获取鼠标按下的地方距离元素左侧和上侧的距离*/
        this.disX1 = event.clientX - target.offsetLeft;
        this.disY1 = event.clientY - target.offsetTop;
        /*定义鼠标移动事件*/
        document.onmousemove = this.fnMove1.bind(this);
        /*定义鼠标抬起事件*/
        document.onmouseup = this.fnUp.bind(this);
    };
    /*定义鼠标移动事件*/
    fnMove1 = e => {
        /*事件兼容*/
        let event = e || window.event;
        console.log(event.clientX - this.disX, event.clientY - this.disY);
        this.setState({
            needX1: event.clientX - this.disX1 - 150,
            needY1: event.clientY - this.disY1 - 20,
        });
    };
    getVideoNum = len => {
        if (swanVideoList.length > len) {
            swanVideoList = swanVideoList.slice(0, len);
        }
        this.setState(
            {
                len,
                swanVideoList: [...swanVideoList],
            },
            () => {
                this.renderVideos(...swanVideoList, len);
            },
        );
    };
    getBase64 = file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };
    handleCancel = () => this.setState({ previewVisible: false });

    handlePreview = async file => {
        if (!file.url && !file.preview) {
            file.preview = await this.getBase64(file.originFileObj);
        }
        console.log('file', file);
        this.setState({
            previewImage: file.url || file.preview,
            previewVisible: true,
        });
    };

    handleChange = ({ fileList }) => this.setState({ filePersonList: fileList });
    handleChanges = ({ fileList }) => this.setState({ fileCarList: fileList });
    drawPoint = () => {
        // 添加一个绘制的线使用的layer
        var _self = this;
        _self.setState({
            isWd: true,
        });
        document.getElementById('map').onmouseover = function() {
            // this.style.cursor = "url('./image/pen.png'),w-resize";
            this.style.cursor = 'copy';
        };
        this.setState({
            drawType: 'Point',
            determine: 'new',
            limit: true,
            createBtn: false,
            isCancel: false,
        });
        let { source, vector, view, map, draw } = this.state;
        map.removeInteraction(draw); //移除绘制图形
        const lineLayer = new ol.layer.Vector({
            source: source,
            style: new ol.style.Style({
                image: new ol.style.Icon({
                    scale: 1.1, // 图标缩放比例 // 0为离线其他为在线
                    src: './image/jqicon_6.png', // 图标的url
                }),
            }),
        });
        map.addLayer(lineLayer);

        draw = new ol.interaction.Draw({
            type: 'Point',
            source: lineLayer.getSource(), // 注意设置source，这样绘制好的线，就会添加到这个source里
            style: new ol.style.Style({
                image: new ol.style.Icon({
                    scale: 1.1, // 图标缩放比例 // 0为离线其他为在线
                    src: './image/jqicon_6.png', // 图标的url
                }),
            }),
            // minPoints: 4    // 限制不超过4个点
        });
        _self.setState({
            draw: draw,
        });
        map.addInteraction(draw);
        // 监听线绘制结束事件，获取坐标
        draw.on('drawend', function(event) {
            draw.setActive(false);
            // _self.getShowBk();
            _self.setState(
                {
                    drawGps: event.feature
                        .getGeometry()
                        .transform('EPSG:3857', 'EPSG:4326')
                        .getCoordinates(),
                    vector: vector,
                    draw: draw,
                    createBtn: true,
                },
                () => {
                    _self.handleOk();
                },
            );
        });
    };
    getQxBk = () => {
        this.handleCancels(false);
        this.state.sourceWd.clear();
        this.state.showWdVector.setSource(null);
        var zlContent = document.getElementById('zl-content');
        zlContent.innerHTML = '';
        this.setState({
            zltzRecord: {},
            personImg: '',
        });
    };
    showBox = () => {
        this.setState({
            isLeftHide: !this.state.isLeftHide,
        });
    };
    showRightBox = () => {
        this.setState({
            isRightHide: !this.state.isRightHide,
        });
    };
    handleCreateModalVisible = flag => {
        this.setState({
            createModalVisible: !!flag,
        });
    };
    handleCreate = flag => {
        console.log('新建');
        const { dispatch, form } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            const rangeValue = fieldsValue['range_picker'];
            const values = {
                ...fieldsValue,
                startTime: rangeValue
                    ? rangeValue[0]
                        ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss')
                        : null
                    : null,
                endTime: rangeValue
                    ? rangeValue[1]
                        ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss')
                        : null
                    : null,
            };

            this.setState({
                formValues: values,
                createModalVisible: !!flag,
            });

            const {
                instruction: {
                    data: { page },
                },
            } = this.props;
            page.currentPage = 1;
            page.showCount = tableList;

            this.getTableData(page, values);
        });
    };
    chooseCode = (value, flag) => {
        //  this.props.form.setFieldsValue({ shifts_organization_code: [] });
        // this.props.form.setFieldsValue({'police_unit_organization_name': value})
        console.log(value);
        const { dispatch } = this.props;
        this.setState({ isCar: true });
        dispatch({
            type: 'instruction/getVehicleList',
            payload: { vehicle_organization_code: value, vehicle_flag: flag ? flag : '2' },
            success: e => {
                if (e.result.reason.code == '200') {
                    if (e.result.list && !e.result.list.length) {
                        Message.error('当前单位无设备！');
                    }
                } else {
                    return false;
                }
            },
        });
    };
    getImgUpload = url => {
        this.props.dispatch({
            type: 'instruction/uploadImg',
            payload: {
                base64String: url.split(',')[1],
            },
            success: url => {
                if (url) {
                    this.setState({
                        personImg: url,
                    });
                }
            },
        });
    };
    render() {
        const {
            instruction: { useList },
        } = this.props;
        const createMethods = {
            modalVisible: this.state.createModalVisible,
            handleSubmit: this.handleCreate,
            handleModalVisible: this.handleCreateModalVisible,
            policeUnitData: useList,
            chooseCode: this.chooseCode,
            isCar: this.state.isCar,
            values:
                this.state.zltzRecord && this.state.zltzRecord.alarm_type === 1
                    ? {
                          bt:
                              this.state.zltzRecord &&
                              this.state.zltzRecord.alarm_message &&
                              this.state.zltzRecord.alarm_message.comparison_message
                                  ? this.state.zltzRecord.alarm_message.comparison_message.hphm +
                                    '需要被堵控'
                                  : '',
                          nr:
                              this.state.zltzRecord &&
                              this.state.zltzRecord.alarm_message &&
                              this.state.zltzRecord.alarm_message.comparison_message
                                  ? this.state.zltzRecord.alarm_message.comparison_message.hphm +
                                    '需要被堵控'
                                  : '',
                          fbrxm: JSON.parse(sessionStorage.getItem('user')).name,
                          fbdwmc:
                              JSON.parse(sessionStorage.getItem('user')).group &&
                              JSON.parse(sessionStorage.getItem('user')).group.name,
                      }
                    : this.state.zltzRecord && this.state.zltzRecord.alarm_type === 0
                    ? {
                          bt:
                              this.state.zltzRecord &&
                              this.state.zltzRecord.alarm_message &&
                              this.state.zltzRecord.alarm_message.verificationPortraitDataList &&
                              this.state.zltzRecord.alarm_message.verificationPortraitDataList[0]
                                  .name
                                  ? this.state.zltzRecord.alarm_message
                                        .verificationPortraitDataList[0].name + '需要被堵控'
                                  : '',
                          nr:
                              this.state.zltzRecord &&
                              this.state.zltzRecord.alarm_message &&
                              this.state.zltzRecord.alarm_message.verificationPortraitDataList &&
                              this.state.zltzRecord.alarm_message.verificationPortraitDataList[0]
                                  .name
                                  ? this.state.zltzRecord.alarm_message
                                        .verificationPortraitDataList[0].name + '需要被堵控'
                                  : '',
                          fbrxm: JSON.parse(sessionStorage.getItem('user')).name,
                          fbdwmc:
                              JSON.parse(sessionStorage.getItem('user')).group &&
                              JSON.parse(sessionStorage.getItem('user')).group.name,
                      }
                    : {
                          bt:
                              this.state.zltzRecord && this.state.zltzRecord.bt
                                  ? this.state.zltzRecord.bt
                                  : '',
                          nr:
                              this.state.zltzRecord && this.state.zltzRecord.nr
                                  ? this.state.zltzRecord.nr
                                  : '',
                          fbrxm: JSON.parse(sessionStorage.getItem('user')).name,
                          fsdwbm: JSON.parse(sessionStorage.getItem('user')).department,
                          fbdwmc:
                              JSON.parse(sessionStorage.getItem('user')).group &&
                              JSON.parse(sessionStorage.getItem('user')).group.name,
                      },
            renderVale:
                this.state.zltzRecord && this.state.zltzRecord.alarm_type === 1
                    ? this.state.zltzRecord &&
                      this.state.zltzRecord.alarm_message &&
                      this.state.zltzRecord.alarm_message.comparison_img
                        ? [
                              {
                                  uid: 1,
                                  name: 'image.png',
                                  status: 'done',
                                  url: this.state.zltzRecord.alarm_message.comparison_img,
                              },
                          ]
                        : []
                    : this.state.zltzRecord && this.state.zltzRecord.alarm_type === 0
                    ? this.state.personImg
                        ? [{ uid: 1, name: 'image.png', status: 'done', url: this.state.personImg }]
                        : []
                    : [],
        };
        const {
            previewVisible,
            previewImage,
            filePersonList,
            fileCarList,
            isLeftHide,
            isRightHide,
        } = this.state;
        const uploadButton = (
            <div>
                <Icon type="plus" />
            </div>
        );
        const {
            otherIndex: {},
            loading,
            captureList: { recordDetail },
        } = this.props;
        const { swanVideoList, showSwanVideo } = this.state;
        const menu = (
            <Menu className={styles.menuBox}>
                <Menu.Item onClick={() => this.getVideoNum(1)}>
                    <a target="_blank" rel="noopener noreferrer">
                        <img src={vedio1} />
                    </a>
                </Menu.Item>
                <Menu.Item onClick={() => this.getVideoNum(4)}>
                    <a target="_blank" rel="noopener noreferrer">
                        <img src={vedio2} />
                    </a>
                </Menu.Item>
                <Menu.Item onClick={() => this.getVideoNum(9)}>
                    <a target="_blank" rel="noopener noreferrer">
                        <img src={vedio3} />
                    </a>
                </Menu.Item>
            </Menu>
        );
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };
        const formItemLayouts = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 2 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 22 },
            },
        };
        const { getFieldDecorator } = this.props.form;
        return (
            <div className={styles.otherIndex}>
                <div className={styles.main}>
                    <img src={hylink} className={styles.hylinkLogo} />
                    {!this.state.isWd ? (
                        <nav className={styles.nav}>
                            <input type="checkbox" className={styles.nav__cb} id="menu-cb" />
                            <div className={styles.nav__content}>
                                <ul className={styles.nav__items}>
                                    <li className={styles.nav__item}>
                                        <Tooltip placement="top" title={'堵控'}>
                                            <img src={bk} onClick={this.drawPoint} />
                                        </Tooltip>
                                    </li>
                                </ul>
                            </div>
                            <label className={styles.nav__btn} htmlFor="menu-cb">
                                <img src={gj} />
                            </label>
                        </nav>
                    ) : null}
                    <div className={styles.calendar}>
                        <div id="popups" className={styles.olpopup}>
                            <div id="popups-content" />
                        </div>
                        <div id="zl" className={styles.olpopup}>
                            <div id="zl-content" />
                        </div>
                        <div id="warning" className={styles.olpopup}>
                            <div id="warning-content" />
                        </div>
                        <div id="map" className={styles.mapScreenStyle}>
                            <div id="popup" className={styles.olpopup}>
                                <div id="popup-content" />
                            </div>
                            <div id="warnings" className={styles.olpopup}>
                                <div id="warnings-content" />
                            </div>
                            <div id="searchBar" className={styles.olpopup}>
                                <div id="searchBar-content" />
                            </div>
                            <div id="alarm" className={styles.olpopup}>
                                <div id="alarm-content" />
                            </div>
                            {/* <div id="policetotls">
								{policeAlarmList && policeAlarmList.length ? (
									policeAlarmList.map((v, k) => (
										<div id={`${'polices'}${v.police_alarm_id}`} key={k} className={styles.olpopup}>
											<div id={`${'policeAlarm'}${v.police_alarm_id}`} />
										</div>
									))
								) : null}
							</div> */}
                            <div id="marks" className={styles.olpopup} />
                        </div>
                    </div>
                    <div
                        className={styles.leftMune}
                        style={isLeftHide ? { width: 100, height: 115 } : {}}
                    >
                        <div className={styles.leftBtn} onClick={this.showBox}>
                            {isLeftHide ? '展开' : '收起'}{' '}
                            <img src={isLeftHide ? './image/down1.png' : './image/up1.png'} />
                        </div>
                        <div className={isLeftHide ? styles.none : styles.content}>
                            <Statistical
                                schedules={this.state.schedules}
                                vehicleStatusList={this.state.vehicleStatusList}
                                vehicleState={this.state.vehicleState}
                                vehicleDetailInfor={this.state.vehicleDetailInfor}
                            />
                            {/* <LeaderDuty vehicleState={this.state.vehicleState} /> */}
                            {this.state.vehicleState ? (
                                <LeaderDuty />
                            ) : (
                                <WarningList
                                    alarmList={this.state.alarmList}
                                    checkAlarmDetails={e => this.checkAlarmDetails(e)}
                                    warningDk={this.warningDk}
                                />
                            )}
                            <Called
                                checkPoliceDetails={e => this.checkPoliceDetails(e)}
                                policeAlarmCounts={
                                    this.state.vehicleState
                                        ? this.props.otherIndex.alarmList
                                        : this.state.policeAlarmCounts
                                }
                                ref={el => (this.called = el)}
                                vehicleState={this.state.vehicleState}
                                jqHide={this.state.jqHide}
                                vehicleid={this.state.vehicleid}
                                gxdwdm={this.state.gxdwdm}
                                closePoliceDetails={() => this.closePoliceDetails()}
                            />
                        </div>
                    </div>
                    <div
                        className={styles.rightMune}
                        style={isRightHide ? { width: 100, height: 115 } : {}}
                    >
                        <div className={styles.rightBtn} onClick={this.showRightBox}>
                            {isRightHide ? '展开' : '收起'}{' '}
                            <img src={isRightHide ? './image/down1.png' : './image/up1.png'} />
                        </div>
                        <div className={isRightHide ? styles.none : styles.content}>
                            <TodayCheck
                                comparisonList={
                                    this.state.vehicleState
                                        ? this.state.vehicleComparisonList
                                        : this.state.comparisonList
                                }
                            />
                            {this.state.vehicleState ? (
                                <Equipment />
                            ) : (
                                <SnapList
                                    toSnap={() => {
                                        // console.log(useState)
                                        // const [ selected, setSelected ] = useState()
                                        //  console.log(setSelected)
                                        // // setSelected('/czht_zpjl')
                                        // this.props.history.push('/czht_zpjl')
                                    }}
                                    captureData={this.state.captureList}
                                    showDetail={type => {
                                        if (type == '1') {
                                            this.setState({ showSnapVe: true, showSnapPe: false });
                                        } else {
                                            this.setState({ showSnapPe: true, showSnapVe: false });
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </div>
                    {this.state.vehicleState ? null : (
                        <SearchEngine
                            checkSearchDetails={(e, g) => this.checkSearchDetails(e, g)}
                            resetRender={() => this.closeSearchDetails()}
                        />
                    )}
                    {/*{!this.state.vehicleState ? (*/}
                    <SwitchList
                        vehicleState={this.state.vehicleState}
                        getData={e => this.statesChange(e)}
                        switchSynergy={this.state.switchSynergy}
                        closeSynergy={() =>
                            this.setState({
                                switchSynergy: false,
                                showOperateWith: false,
                                showSynergyDetail: false,
                            })
                        }
                        showIndividual={this.state.showIndividual}
                        showVehicle={this.state.showVehicle}
                        toSynergyDetail={(e, bool) => this.toSynergyDetail(e, bool)}
                        pageRefresh={e => this.queryCoordinatedParticipantIsEnd(e)}
                    />
                    {/*) : null}*/}

                    {this.state.vehicleState ? (
                        <div
                            className={styles.backGlobal}
                            onClick={() => {
                                const { content, warnings } = this.state;
                                content.innerHTML = '';
                                // warnings.innerHTML = ''
                                this.setState({
                                    vehicleState: false,
                                    showTrajectory: false,
                                    vehicleid: '',
                                });
                                // this.checkPoliceDetails()
                                this.state.showTrajectoryVector.setSource(null);
                                this.state.sourceTrajectory.clear();
                                this.closePoliceDetails();
                            }}
                        >
                            <img src="./image/left.png" alt="" />
                            <span>返回全局</span>
                        </div>
                    ) : null}
                    {this.state.isWd ? (
                        <div
                            className={styles.backGlobal}
                            style={{ top: 75 }}
                            onClick={this.getQxBk}
                        >
                            <img src="./image/left.png" alt="" />
                            <span>取消堵控</span>
                        </div>
                    ) : null}
                    {this.state.showAlarmDetails ? (
                        <div>
                            {this.state.alarmType == 0 ? (
                                <WarningDetails
                                    files={this.state.alarmDetails}
                                    closes={() => this.closeAlarmDetails()}
                                />
                            ) : null}
                            {this.state.alarmType == 5 ? (
                                <WarningDetails
                                    files={this.state.alarmDetails}
                                    closes={() => this.closeAlarmDetails()}
                                />
                            ) : null}
                            {this.state.alarmType == 1 ? (
                                <VehicleDetail
                                    files={this.state.alarmDetails}
                                    closes={() => this.closeAlarmDetails()}
                                />
                            ) : null}
                            {this.state.alarmType == 7 ? (
                                <Patrolwarning
                                    files={this.state.alarmDetails}
                                    closes={() => this.closeAlarmDetails()}
                                />
                            ) : null}
                            {this.state.alarmType == 4 ? (
                                <TrafficWarning
                                    files={this.state.alarmDetails}
                                    closes={() => this.closeAlarmDetails()}
                                />
                            ) : null}
                            {this.state.alarmType == 2 ? (
                                <WrittenWarning
                                    files={this.state.alarmDetails}
                                    closes={() => this.closeAlarmDetails()}
                                />
                            ) : null}
                        </div>
                    ) : null}
                    {this.state.showSnapPe ? (
                        <SnapPeDetail
                            closes={() => this.setState({ showSnapPe: false, showSnapVe: false })}
                            files={recordDetail.portrait_result_show}
                        />
                    ) : null}
                    {this.state.showSnapVe ? (
                        <SnapVeDetail
                            closes={() => this.setState({ showSnapVe: false, showSnapPe: false })}
                            files={
                                recordDetail.comparison_result_show &&
                                recordDetail.comparison_result_show[0]
                            }
                        />
                    ) : null}
                </div>
                {this.state.showVideo ? (
                    <div
                        id="player"
                        className={styles.modalBox}
                        style={{
                            left: this.state.needX1,
                            top: this.state.needY1,
                            width: this.state.isBig1
                                ? 'calc(100% + 100px)'
                                : this.state.isSmall1
                                ? '270px'
                                : '900px',
                            height: this.state.isSmall1 ? '240px' : 'auto',
                        }}
                        onMouseDown={this.state.isBig1 ? '' : this.fnDown1}
                        id={'box1'}
                    >
                        <div className={styles.title}>
                            实时视频
                            <Icon
                                type="close"
                                className={styles.iconClose}
                                onClick={() => this.closeLiveVideo('car')}
                            />
                            {this.state.isSmall1 || this.state.isBig1 ? (
                                ''
                            ) : (
                                <Icon
                                    type="fullscreen"
                                    className={styles.iconClose}
                                    onClick={() => this.getBig('car')}
                                />
                            )}
                            {this.state.isSmall1 || this.state.isBig1 ? (
                                ''
                            ) : (
                                <Icon
                                    type="fullscreen-exit"
                                    className={styles.iconClose}
                                    onClick={() => this.getSmall('car')}
                                />
                            )}
                            {this.state.isSmall1 || this.state.isBig1 ? (
                                <Icon
                                    type={this.state.isSmall1 ? 'fullscreen' : 'fullscreen-exit'}
                                    className={styles.iconClose}
                                    onClick={() => this.getBlock('car')}
                                />
                            ) : (
                                ''
                            )}
                        </div>
                        <div>
                            <Row gutter={[2, 2]} className={styles.videoBox} style={{ margin: 0 }}>
                                {this.state.videoInfor && this.state.videoInfor.length == 1 ? (
                                    <VideoPlayer
                                        ref="childVideo"
                                        src={this.state.videoInfor[0].mldz}
                                        deviceMessage={this.state.videoInfor}
                                        width={
                                            this.state.isBig1
                                                ? parseInt(document.body.offsetWidth - 95)
                                                : this.state.isSmall1
                                                ? 270
                                                : ''
                                        }
                                        height={
                                            this.state.isBig1
                                                ? parseInt(document.body.offsetHeight - 118)
                                                : this.state.isSmall1
                                                ? 180
                                                : ''
                                        }
                                        videoName={
                                            this.state.videoInfor &&
                                            this.state.videoInfor.length &&
                                            this.state.videoInfor[0].device_name
                                        }
                                        showVideo={this.state.showVideo}
                                    />
                                ) : (
                                    this.renderVideo(this.state.videoInfor)
                                )}
                            </Row>
                        </div>
                    </div>
                ) : null}
                {this.state.showSwanVideo ? (
                    <div
                        className={styles.modalBox}
                        style={{
                            left: this.state.needX,
                            top: this.state.needY,
                            width: this.state.isBig
                                ? 'calc(100% + 100px)'
                                : this.state.isSmall
                                ? '270px'
                                : '900px',
                            height: this.state.isSmall ? '240px' : 'auto',
                        }}
                        onMouseDown={this.state.isBig ? '' : this.fnDown}
                        id={'box'}
                    >
                        <div className={styles.title}>
                            实时视频
                            <Icon
                                type="close"
                                className={styles.iconClose}
                                onClick={() => this.closeLiveVideo('video')}
                            />
                            {this.state.isSmall || this.state.isBig ? (
                                ''
                            ) : (
                                <Icon
                                    type="fullscreen"
                                    className={styles.iconClose}
                                    onClick={() => this.getBig('video')}
                                />
                            )}
                            {this.state.isSmall || this.state.isBig ? (
                                ''
                            ) : (
                                <Icon
                                    type="fullscreen-exit"
                                    className={styles.iconClose}
                                    onClick={() => this.getSmall('video')}
                                />
                            )}
                            {this.state.isSmall || this.state.isBig ? (
                                <Icon
                                    type={this.state.isSmall ? 'fullscreen' : 'fullscreen-exit'}
                                    className={styles.iconClose}
                                    onClick={() => this.getBlock('video')}
                                />
                            ) : (
                                ''
                            )}
                            <Dropdown overlay={menu} trigger={['click']}>
                                <a
                                    className="ant-dropdown-link"
                                    onClick={e => e.preventDefault()}
                                    style={{ float: 'right' }}
                                >
                                    {this.state.len === 1 ? (
                                        <img src={Vedio1} className={styles.imgTop} />
                                    ) : this.state.len === 4 ? (
                                        <img src={Vedio2} className={styles.imgTop} />
                                    ) : this.state.len === 9 ? (
                                        <img src={Vedio3} className={styles.imgTop} />
                                    ) : (
                                        <img src={Vedio1} className={styles.imgTop} />
                                    )}{' '}
                                    <Icon type="down" />
                                </a>
                            </Dropdown>
                        </div>
                        <div>
                            {this.state.len == 1 ? (
                                <VideoPlayer
                                    ref="childVideo"
                                    src={swanVideoList[0].mldz}
                                    deviceMessage={swanVideoList}
                                    width={
                                        this.state.isBig
                                            ? parseInt(document.body.offsetWidth - 95)
                                            : this.state.isSmall
                                            ? 270
                                            : ''
                                    }
                                    height={
                                        this.state.isBig
                                            ? parseInt(document.body.offsetHeight - 118)
                                            : this.state.isSmall
                                            ? 180
                                            : ''
                                    }
                                    videoName={
                                        swanVideoList &&
                                        swanVideoList.length &&
                                        swanVideoList[0].device_name
                                    }
                                    showVideo={showSwanVideo}
                                />
                            ) : this.state.len > 1 ? (
                                <Row
                                    gutter={[2, 2]}
                                    className={styles.videoBox}
                                    style={{ margin: 0 }}
                                >
                                    {this.renderVideos(swanVideoList, this.state.len)}
                                </Row>
                            ) : (
                                ''
                            )}
                        </div>
                    </div>
                ) : null}
                {this.state.showTopSynergy ? (
                    <div className={styles.synergys}>
                        <div
                            className={styles.con}
                            style={{ backgroundImage: "url('./image/xtbj.png')" }}
                        >
                            <div className={styles.time}>
                                开始时间：
                                {JSON.parse(sessionStorage.getItem('synergyDetail')) &&
                                    JSON.parse(sessionStorage.getItem('synergyDetail'))
                                        .coordinated_operations_time}
                            </div>
                            <div className={styles.title}>协同作战中</div>
                            <div className={styles.btn} onClick={() => this.toExit()}>
                                <span>
                                    <img src="./image/xtgb.png" alt="" />
                                </span>
                                <span>结束协同</span>
                            </div>
                        </div>
                    </div>
                ) : null}
                {this.state.showSynergyDetail ? (
                    <SynergyDetail
                        closes={() => this.setState({ showSynergyDetail: false })}
                        synergyDetail={this.state.synergyDetail}
                        toSynergyDetail={(e, bool) => this.toSynergyDetail(e, bool)}
                        pageRefresh={e => this.queryCoordinatedParticipantIsEnd(e)}
                    />
                ) : null}
                <Modal
                    title="堵控"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={() => this.handleCancels(false)}
                    centered={true}
                    width={900}
                    className={styles.bkModal}
                    footer={this.state.dkloading ? null : undefined}
                    maskClosable={false}
                >
                    {this.state.dkloading ? (
                        <div className={styles.dkloading}>
                            <Spin spinning={this.state.dkloading} /> 堵控圈计算中…
                        </div>
                    ) : (
                        <Form layout="inline" {...formItemLayout}>
                            <div className={styles.bkTitle}>人员信息</div>
                            <Row>
                                <Col span={24}>
                                    <FormItem
                                        label="人员相片"
                                        style={{ width: '100%' }}
                                        {...formItemLayouts}
                                    >
                                        {getFieldDecorator('xp')(
                                            <Upload
                                                accept={'image/*'}
                                                listType="picture-card"
                                                fileList={filePersonList}
                                                onPreview={this.handlePreview}
                                                onChange={this.handleChange}
                                            >
                                                {filePersonList.length >= 8 ? null : uploadButton}
                                            </Upload>,
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem label="姓名">
                                        {getFieldDecorator('name')(
                                            <Input
                                                placeholder="请输入姓名"
                                                style={{ width: '180px' }}
                                            />,
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem label="身份证号">
                                        {getFieldDecorator('idcard')(
                                            <Input
                                                placeholder="请输入身份证号"
                                                style={{ width: '180px' }}
                                            />,
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem label="性别">
                                        {getFieldDecorator('carTypeCode')(
                                            <Select
                                                allowClear={true}
                                                placeholder="请选择性别"
                                                style={{
                                                    width: '180px',
                                                }}
                                            >
                                                <Option value={'0'} key={'0'}>
                                                    男
                                                </Option>
                                                <Option value={'1'} key={'1'}>
                                                    女
                                                </Option>
                                                <Option value={'2'} key={'2'}>
                                                    未知
                                                </Option>
                                            </Select>,
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem label="手机号">
                                        {getFieldDecorator('phone')(
                                            <Input
                                                placeholder="请输入手机号"
                                                style={{ width: '180px' }}
                                            />,
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <div className={styles.bkTitle}>车辆信息</div>
                            <Row>
                                <Col span={24}>
                                    <FormItem
                                        label="车辆相片"
                                        style={{ width: '100%' }}
                                        {...formItemLayouts}
                                    >
                                        {getFieldDecorator('clxp')(
                                            <Upload
                                                accept={'image/*'}
                                                listType="picture-card"
                                                fileList={fileCarList}
                                                onPreview={this.handlePreview}
                                                onChange={this.handleChanges}
                                            >
                                                {fileCarList.length >= 8 ? null : uploadButton}
                                            </Upload>,
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem label="车牌号">
                                        {getFieldDecorator('carNumber')(
                                            <Input
                                                placeholder="请输入车牌号"
                                                style={{ width: '180px' }}
                                            />,
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                        </Form>
                    )}
                </Modal>
                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
                {this.state.createModalVisible ? <FormModal {...createMethods} /> : null}
            </div>
        );
    }
}

export default Form.create()(otherIndex);
