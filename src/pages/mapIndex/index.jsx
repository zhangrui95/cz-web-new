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
import { routerRedux } from 'dva/router';
import ol from 'openlayers';
import Calendar from 'react-calendar';
import styles from '../otherIndex/index.less';
import webSocketClient from '@/components/websocket/webSocketService';
import { connect as mqttConnect } from 'mqtt';
import { offlineMapLayer, initView, initOtherView } from '@/utils/olUtils';
import { setInterval } from 'timers';
import Statistical from '../otherIndex/compontent/statistical';
import LeaderDuty from '../otherIndex/compontent/leaderDuty';
import Called from '../otherIndex/compontent/called';
import TodayCheck from '../otherIndex/compontent/todayCheck';
import WarningList from '../otherIndex/compontent/warningList';
import SearchEngine from '../otherIndex/compontent/searchEngine';
import SwitchList from '../otherIndex/compontent/switchList';
import Equipment from '../otherIndex/compontent/equipment';
import SnapList from '../otherIndex/compontent/snapList';
import SnapPeDetail from '../otherIndex/compontent/snapPeDetail';
import SnapVeDetail from '../otherIndex/compontent/snapVeDetail';
import WarningDetails from '../otherIndex/compontent/warningDetails';
import VehicleDetail from '../otherIndex/compontent/vehicleDetail';
import Patrolwarning from '../otherIndex/compontent/patrolwarning';
import WrittenWarning from '../otherIndex/compontent/writtenWarning';
import TrafficWarning from '../otherIndex/compontent/trafficWarning';
import VideoPlayers from '../otherIndex/VideoPlayers/VideoPlayers';
import SynergyDetail from '../otherIndex/compontent/synergyDetail';
import VideoPlayer from '@/components/VideoPlayer/VideoPlayer';
import ShowInterComModal from '../otherIndex/compontent/callout';
import vedio1 from '@/assets/vedio1.png';
import vedio2 from '@/assets/vedio2.png';
import vedio3 from '@/assets/vedio3.png';
import Vedio1 from '@/assets/vedio1-1.png';
import Vedio2 from '@/assets/vedio2-1.png';
import Vedio3 from '@/assets/vedio3-1.png';
import gj from '@/assets/gj.png';
import hylink from '@/assets/hylink.png';
import bk from '@/assets/bk.png';
import tj from '@/assets/tongji.png';
import tj2 from '@/assets/tongji2.png';
import FormModal from '../instruction/components/FormModal';
import { tableList } from '@/utils/utils';
import '@/utils/minemap.js';
import '@/utils/minemap-modeling.js';
import '@/utils/minemap-edit.js';
import '@/utils/EzServerClient.min.js';
import '@/utils/leaflet.js';
import '@/utils/leaflet-heatmap.js';
import '@/utils/HGis.js';
let swanVideoList = [];
let latreg = /^(\-|\+)?([0-8]?\d{1}\.\d{0,15}|90\.0{0,15}|[0-8]?\d{1}|90)$/;
let longrg = /^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,15})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,15}|180)$/;
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
];
const FormItem = Form.Item;
const HGis = window.HGis;
let HMap;
let edit;
let popup;
let popupCar;
let popupWarning;
let dkWarning;
let popupZl;
var trafficLayerIds = [];
var _interval = null;
@connect(({ otherIndex, captureList, loading, instruction }) => ({
    otherIndex,
    captureList,
    instruction,
    loading: loading.models.otherIndex,
}))
class OtherIndex extends Component {
    constructor(props) {
        super(props);
        this.wc = null;
        this.called = null;
        this.disX = 0;
        this.disY = 0;
        this.disX1 = 0;
        this.disY1 = 0;
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
        showLk: false, //路况
        showVehicle: true, //警车
        showAlert: false, //警情
        showIntercom: false, //对讲机
        showIndividual: false, //单兵设备
        showSwan: false, //卡口
        showMonitoring: false, //监控
        hdCamera: false, //高清监控
        ordinaryCamera: false, //标清监控
        remoteCamera: false, //高点监控
        logis: true, // 重点场所物流
        express: true, // 重点场所快递
        codeChain: true, // 重点场所冷链运输
        coldStorage: true, // 重点场所冷库
        farmMarket: true, // 重点场所农贸市场
        showOtherPlace: true, // 重点场所其他
        showStation: false, //警务站
        showPlace: true, //重点场所
        showFirearms: false, //枪支
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
        gqList: [], //高清监控列表
        bqList: [], //标清监控列表
        gdList: [], //高点监控列表
        logisList:[], // 重点场所物流列表
        expressList:[], // 重点场所快递列表
        codeChainList:[], // 重点场所冷链运输列表
        coldStorageList:[], // 重点场所冷库列表
        farmMarketList:[], // 重点场所农贸市场列表
        showOtherPlaceList:[], // 重点场所其他列表
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
        arrId: [],
        isFirst: true,
        ShowInterComModalVisible: false, // 点击对讲机时显示的模态框
        InterComMachine: [], // 选中的对讲机信息
        jqHide: false,
        totalPointShow:false, // 首页工具箱中的重点场所的统计
        tj:tj,
        tj2:tj2,
        tjtp:tj2,
        logisListNum:0, // 物流类别的企业数量
        expressListNum:0, // 快递类别的企业数量
        codeChainListNum:0, // 冷链运输类别的企业数量
        coldStorageListNum:0, // 冷库类别的企业数量
        farmMarketListNum:0, // 农贸市场类别的企业数量
        showOtherPlaceListNum:0, // 其他类别的企业数量

    };
    componentDidMount() {
        if (_interval) {
            clearInterval(_interval);
            _interval = null;
        }
        // 初始化地图
        this.initMap();
        this.equipmentType();
        this.getUseDept();
        if (sessionStorage.getItem('synergyId')) {
            this.queryCoordinatedParticipantIsEnd();
        }
        HGis.onEditRecordCreate(HMap, e => {
            this.onEditRecordCreate(e, this);
        });
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
    getLk = () => {
        HGis.removeLayer(HMap, 'Traffic');
        this.updateTrafficSource();
        let map = HMap.map;
        //如果底图没有配置路况图层，需要自己手动增加
        if (HMap.map.getLayer('Traffic')) {
            HMap.map.setLayoutProperty('Traffic', 'visibility', 'visible');
        } else {
            let type = '';
            let { arrId } = this.state;
            if (arrId && arrId.length > 0 && HMap.map.getLayer(arrId[0])) {
                type = arrId[0];
            }
            map.addLayer(
                {
                    id: 'Traffic',
                    type: 'line',
                    source: 'Traffic',
                    'source-layer': 'Trafficrtic',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round',
                    },
                    paint: {
                        'line-color': {
                            property: 'status',
                            stops: [
                                [0, '#999999'],
                                [1, '#66cc00'],
                                [2, '#ff9900'],
                                [3, '#cc0000'],
                                [4, '#9d0404'],
                            ],
                        },
                        'line-width': {
                            stops: [
                                [5, 1],
                                [18, 3],
                            ],
                            base: 1.2,
                        },
                    },
                },
                type,
            );
        }
        trafficLayerIds.push('Traffic');
        //定时刷新路况
        if (_interval) {
            clearInterval(_interval);
            _interval = null;
        }
        let that = this;
        _interval = setInterval(function() {
            if (that.state.showLk) {
                that.updateTrafficSource();
            }
        }, 60000);
    };
    updateTrafficLayerVisibility = v => {
        let map = HMap.map;
        trafficLayerIds.forEach(function(id) {
            if (map.getLayer(id)) {
                map.setLayoutProperty(id, 'visibility', v);
            }
        });
    };
    updateTrafficSource = () => {
        let map = HMap.map;
        var d = new Date();
        if (HMap.map.getLayer('Traffic')) {
            HMap.map.setLayoutProperty('Traffic', 'visibility', 'visible');
        } else {
            HGis.removeLayer(HMap, 'Traffic');
            map.addSource('Traffic', {
                type: 'vector',
                traffic: true,
                tiles: [
                    (window.configUrl.TrafficUrl
                        ? window.configUrl.TrafficUrl
                        : 'minemapdatad://Trafficrtic/{z}/{x}/{y}/') + d.getTime(),
                ],
            });
        }
    };
    getPiontSource = () => {
        let _self = this;
        _self.getPiontMap(
            [],
            false,
            'sourceSwan',
            'showSwanVector',
            './image/kk_1.png',
            'swan',
            'gps',
            this.state.showSwan,
        );
        _self.getPiontMap(
            [],
            false,
            'sourceMonitoring',
            'showMonitoringVector',
            '/image/spjk_gq.png',
            'hdCamera',
            'gps',
            this.state.showMonitoring,
        );
        _self.getPiontMap(
            [],
            false,
            'sourceMonitoring',
            'showMonitoringVector',
            '/image/spjk_gd.png',
            'remoteCamera',
            'gps',
            this.state.remoteCamera,
        );
        _self.getPiontMap(
            [],
            false,
            'sourceKeyPlace',
            'showKeyPlaceVector',
            '/image/logis.png',
            'logis',
            'gps',
            this.state.showPlace,
        );
        _self.getPiontMap(
            [],
            false,
            'sourceKeyPlace',
            'showKeyPlaceVector',
            '/image/express.png',
            'express',
            'gps',
            this.state.showPlace,
        );
        _self.getPiontMap(
            [],
            false,
            'sourceKeyPlace',
            'showKeyPlaceVector',
            '/image/coldtransport.png',
            'codeChain',
            'gps',
            this.state.showPlace,
        );
        _self.getPiontMap(
            [],
            false,
            'sourceKeyPlace',
            'showKeyPlaceVector',
            '/image/coldhouse.png',
            'coldStorage',
            'gps',
            this.state.showPlace,
        );
        _self.getPiontMap(
            [],
            false,
            'sourceKeyPlace',
            'showKeyPlaceVector',
            '/image/openmarket.png',
            'farmMarket',
            'gps',
            this.state.showPlace,
        );
        _self.getPiontMap(
            [],
            false,
            'sourceKeyPlace',
            'showKeyPlaceVector',
            '/image/zdcs_1.png',
            'showOtherPlace',
            'gps',
            this.state.showPlace,
        );
        // _self.getPiontMap(
        //     [],
        //     false,
        //     'sourceKeyPlace',
        //     'showKeyPlaceVector',
        //     './image/zdcs_1.png',
        //     'keyPlace',
        //     'gps',
        //     this.state.showPlace,
        // );
        _self.getPiontMap(
            [],
            false,
            'sourcePoliceStation',
            'showPoliceStationVector',
            './image/jwz_1.png',
            'policeStation',
            'gps',
            this.state.showStation,
        );
    };
    getSocket = parameter => {
        const _self = this;
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
                firearmsFlag: _self.state.showFirearms, //枪支
                policeAlarmFlag: _self.state.showAlert,
                thermodynamicChartFlag: _self.state.showHeat,
                crowdDensity: _self.state.showPersonHeat,
                vehicleFlag: _self.state.showVehicle,
            },
            heartbeatInterval: window.configUrl.heartbeatInterval, //心跳时间
            messageCallback: files => {
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
                if (
                    _self.state.policeAlarmCounts &&
                    _self.state.policeAlarmCounts.total &&
                    files.policeAlarmCounts.total > _self.state.policeAlarmCounts.total
                ) {
                    if (window.configUrl.isPlay) {
                        _self.refs.music.play();
                    }
                }
                // if(_self.state.showFirearms){
                //     files.firearmsList = [
                //         {carno: "东莱所",gps_point: [126.63416666666667, 45.777316666666664],gps_time: "2020-09-19 05:55:33", remark: "东莱所", gxdwdm: "230104610000", gxdwmc: "东莱所",imei: "F787846",jgmc: "东莱所"},
                //         {carno: "东莱所",gps_point: [126.64416666666667, 45.797316666666664],gps_time: "2020-09-19 05:55:33", remark: "东莱所", gxdwdm: "230104610000", gxdwmc: "东莱所",imei: "F787846",jgmc: "东莱所"},
                //         {carno: "东莱所",gps_point: [126.68916666666667, 45.776916666666664],gps_time: "2020-09-19 05:55:33", remark: "东莱所", gxdwdm: "230104610000", gxdwmc: "东莱所",imei: "F787846",jgmc: "东莱所"},
                //         {carno: "东莱所",gps_point: [126.61536666666667, 45.799316666666664],gps_time: "2020-09-19 05:55:33", remark: "东莱所", gxdwdm: "230104610000", gxdwmc: "东莱所",imei: "F787846",jgmc: "东莱所"},
                //         {carno: "东莱所",gps_point: [126.63686666666667, 45.736316666666664],gps_time: "2020-09-19 05:55:33", remark: "东莱所", gxdwdm: "230104610000", gxdwmc: "东莱所",imei: "F787846",jgmc: "东莱所"},
                //         {carno: "东莱所",gps_point: [126.65516666666667, 45.742316666666664],gps_time: "2020-09-19 05:55:33", remark: "东莱所", gxdwdm: "230104610000", gxdwmc: "东莱所",imei: "F787846",jgmc: "东莱所"},
                //         ]
                // }
                this.setState(
                    {
                        policeAlarmCounts: files.policeAlarmCounts || {}, //接处警数量列表
                        schedules: files.schedules || {}, //当日勤务信息
                        individualList: individualList || [], //单兵设备列表
                        heatList: files.policeAlarmList || [], //警情热力图
                        heatPersonList: files.wifiDeviceList || [], //人流密度热力图
                        comparisonList: files.comparisonList || [], //核查统计
                        vehicleGpsList: files.vehicleGpsList || [], //车辆列表
                        vehicleStatusList: files.vehicleStatusList || [], //车辆状态
                        alarmList: files.alarmList || [], //预警列表
                        intercomList: files.intercomList || [], //对讲机
                        firearmsList: files.firearmsList || [], //枪支
                        policeAlarmList: files.policeAlarm || [], //警情列表
                        captureList: files.captureList || [], //抓拍列表数据
                    },
                    () => {
                        _self.getHeatPersonMap();
                        _self.getHeatMap();
                        let djj1 = [];
                        let djj2 = [];
                        let djj = [];
                        if (_self.state.showIntercom) {
                            _self.state.intercomList.map(item => {
                                if (item.djj_type && item.djj_type == 1) {
                                    djj1.push(item);
                                } else if (item.djj_type && item.djj_type == 2) {
                                    djj2.push(item);
                                } else {
                                    djj.push(item);
                                }
                            });
                        }
                        _self.getPiontMap(
                            djj,
                            false,
                            'sourceIntercom',
                            'showIntercomVector',
                            './image/djj_0.png',
                            'intercom',
                            'gps_point',
                            _self.state.showIntercom,
                        );
                        _self.getPiontMap(
                            djj1,
                            false,
                            'sourceIntercom',
                            'showIntercomVector',
                            './image/djj_1.png',
                            'intercom1',
                            'gps_point',
                            _self.state.showIntercom,
                        );
                        _self.getPiontMap(
                            djj2,
                            false,
                            'sourceIntercom',
                            'showIntercomVector',
                            './image/djj_2.png',
                            'intercom2',
                            'gps_point',
                            _self.state.showIntercom,
                        );
                        let listZl = [];
                        let list = [];
                        if (_self.state.showIndividual) {
                            _self.state.individualList.map(item => {
                                if (item.isZl) {
                                    listZl.push(item);
                                } else {
                                    list.push(item);
                                }
                            });
                        }
                        _self.getPiontMap(
                            list,
                            false,
                            'sourceIndividual',
                            'showIndividualVector',
                            './image/dbsb_1.png',
                            'individual',
                            'gps_point',
                            _self.state.showIndividual,
                        );
                        _self.getPiontMap(
                            listZl,
                            false,
                            'sourceIndividual',
                            'showIndividualVector',
                            './image/scj_1.png',
                            'individual1',
                            'gps_point',
                            _self.state.showIndividual,
                        );
                        //枪支
                        _self.getPiontMap(
                            this.state.firearmsList,
                            false,
                            'sourceIntercom',
                            'showIntercomVector',
                            './image/qz_1.png',
                            'firearms',
                            'gps_points',
                        );
                        _self.getVehicleMap(false);
                        if (_self.state.showAlert) {
                            _self.getWarningMap();
                        }
                    },
                );
            },
            errorCallback: err => console.log(err),
            closeCallback: msg => {
                this.wc.close();
            },
            //连接成功后
            openCallback: () => {
                this.wc.send({
                    // "projectCode": port.webSocket.projectCode,
                    token: sessionStorage.getItem('userToken'),
                    government: JSON.parse(sessionStorage.getItem('groupListCode')),
                    individualEquipmentFlag: _self.state.showIndividual,
                    policeTongFlag: _self.state.showIndividual,
                    bodyWornFlag: _self.state.showIndividual,
                    intercomFlag: _self.state.showIntercom,
                    firearmsFlag: _self.state.showFirearms, //枪支
                    policeAlarmFlag: _self.state.showAlert,
                    thermodynamicChartFlag: _self.state.showHeat,
                    crowdDensity: _self.state.showPersonHeat,
                    vehicleFlag: _self.state.showVehicle,
                });
            },
        });
    };
    componentWillUnmount() {
        if (this.wc) {
            if (this.wc.wsObject) {
                if (this.wc.wsObject.onclose) {
                    this.wc.wsObject.onclose();
                }
            }
        }
        if (_interval) {
            clearInterval(_interval);
            _interval = null;
            HGis.removeLayer(HMap, 'Traffic');
            this.setState({ showLk: false });
        }
        HGis.destroyMapEdit(HMap);
    }
    getUseDept = () => {
        const { dispatch } = this.props;
        let codes = [];
        const groupList = JSON.parse(sessionStorage.getItem('user')).groupList;
        for (let i = 0; i < groupList.length; i++) {
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
    getPlay = (layer, type) => {
        let _self = this;
        if (window.configUrl.iStreet) {
            let index = swanVideoList.findIndex(item => item.kkdm == layer.kkdm);
            if (index < 0) {
                _self.props.dispatch({
                    type: 'home/getPlayUrl',
                    payload: {
                        cameraIndexCode:
                            type === 'individual' || type === 'individual1'
                                ? layer.imei
                                : layer.kkdm,
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
                                    device_name: '监控',
                                    kkdm: layer.kkdm,
                                });
                                if (swanVideoList.length > _self.state.len) {
                                    swanVideoList = swanVideoList.slice(0, _self.state.len);
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
    //鼠标点击播放视频
    getClickPlay = type => {
        let _self = this;
        HGis.bindMapClick(
            HMap,
            (point, coord, features) => {
                let layer = features[0].properties.layer
                    ? JSON.parse(features[0].properties.layer)
                    : {};
                _self.getPlay(layer, type);
            },
            type,
        );
    };
    getIntercom = type => {
        let _self = this;
        let layer = {};
        HGis.bindMapClick(
            HMap,
            (point, coord, features) => {
                layer = features[0].properties.layer
                    ? JSON.parse(features[0].properties.layer)
                    : {};
                _self.setState({
                    ShowInterComModalVisible: true,
                    InterComMachine: layer,
                });
            },
            type,
        );
    };
    getCarPopup = type => {
        let content = document.getElementById('popup-content');
        let container = document.getElementById('popup');
        let _self = this;
        HGis.bindMapClick(
            HMap,
            (point, coord, features) => {
                let layer = features[0].properties.layer
                    ? JSON.parse(features[0].properties.layer)
                    : {};
                let options = {
                    popupOptions: {
                        closeButton: false,
                        closeOnClick: false,
                        offset: [0, 30],
                    },
                };
                if (!popupCar) {
                    popupCar = HGis.addPopup(HMap, options);
                }
                _self.addFeatrueInfo(layer, content);
                HGis.setElementLatLng(HMap, popupCar, coord);
                HGis.setElementHTMLElement(HMap, popupCar, container);
                HGis.addElementToMap(HMap, popupCar);
                _self.setState({
                    vehicleInfor: true,
                    vehicleState: true,
                    vehicleid: layer.vehicle_id,
                    showDetail: true,
                    showTrajectory: false,
                    gxdwdm: layer.vehicle_organization_code,
                    vehicleDetailInfor: {
                        carNo: layer.vehicle_license_plate,
                    },
                    vehicleComparisonList: layer.comparison_message,
                    selectVehicleInfor: [layer],
                });
                _self.getDetailById(layer);
                _self.closePoliceDetails();
            },
            type,
        );
    };
    getWarnPopup = type => {
        let _self = this;
        let warnings = document.getElementById('warnings-content');
        let warningBody = document.getElementById('warnings');
        HGis.bindMapClick(
            HMap,
            (point, coord, features) => {
                let coordinates = features[0].geometry.coordinates;
                if (_self.state.showWarningsCon) {
                    _self.setState({ showWarningsCon: false }, () => {
                        warnings.innerHTML = '';
                    });
                } else {
                    warnings.innerHTML = '';
                }
                if (HMap.map.getLayer('showAlertImg')) {
                    HGis.removeLayer(HMap, 'showAlertImg');
                }
                let layer = features[0].properties.layer
                    ? JSON.parse(features[0].properties.layer)
                    : {};
                if (!_self.state.showWarningsCon) {
                    _self.setState({ showWarningsCon: true }, () => {
                        let options = {
                            popupOptions: {
                                closeButton: false,
                                closeOnClick: false,
                                offset: [0, 10],
                            },
                        };
                        if (!popupWarning) {
                            popupWarning = HGis.addPopup(HMap, options);
                        }
                        if (
                            _self.state.coordinates &&
                            _self.state.coordinates[0] == coordinates[0] &&
                            _self.state.coordinates[1] == coordinates[1]
                        ) {
                            warnings.innerHTML = '';
                        } else {
                            _self.warningRender(layer, warnings);
                            HGis.setElementLatLng(HMap, popupWarning, coord);
                            HGis.setElementHTMLElement(HMap, popupWarning, warningBody);
                            HGis.addElementToMap(HMap, popupWarning);
                        }
                    });
                }
                let iconOption = {
                    iconUrl: './image/jqicon_5.png',
                };
                let markOptions = {
                    id: 'showAlertImg',
                    url: './image/jqicon_5.png',
                    coordinates: [
                        [coordinates[0] - 0.01, coordinates[1] + 0.0072],
                        [coordinates[0] + 0.01, coordinates[1] + 0.0072],
                        [coordinates[0] + 0.01, coordinates[1] - 0.0072],
                        [coordinates[0] - 0.01, coordinates[1] - 0.0072],
                    ],
                };
                // let Icon = HGis.makeIcon(HMap, iconOption);
                // markOptions.data.push({
                //     coordinate: coordinates,
                //     properties: {
                //         title: '',
                //         type: 'showAlertImg',
                //     },
                // });
                if (
                    !(
                        _self.state.coordinates &&
                        _self.state.coordinates[0] == coordinates[0] &&
                        _self.state.coordinates[1] == coordinates[1]
                    )
                ) {
                    HGis.addImageLayer(HMap, markOptions);
                    _self.setState({
                        coordinates,
                    });
                } else {
                    _self.setState({
                        coordinates: '',
                    });
                }
            },
            type,
        );
    };
    //其他地图
    initMap = async () => {
        let _self = this;
        let searchBar = document.getElementById('searchBar-content');
        let warnings = document.getElementById('warnings-content');
        let content = document.getElementById('popup-content');
        let alarmcon = document.getElementById('alarm-content');
        const mapOptions = initOtherView();
        HMap = HGis.initMap(
            window.configUrl.mapType,
            'map',
            mapOptions,
            window.configUrl.mapServerUrl,
        );
        HMap.map.on('load', function() {
            _self.getJurisdiction(() => {
                _self.getPiontSource();
            });
            _self.getSocket();
            _self.getBayonetsList(3, ['logis','express','showOtherPlace','codeChain','coldStorage','farmMarket']);
            _self.getBayonetsListNum(3, ['logis','express','codeChain','coldStorage','farmMarket']); // 获取各类重点场所的数量
        });
        window.minemap.util.getJSON('https:' + window.configUrl.style, function(error, data) {
            data.layers.forEach(function(layer) {
                //判断是否道路线图层
                if (
                    layer.type == 'line' &&
                    layer.source == 'Traffic' &&
                    layer['source-layer'] == 'Trafficrtic'
                ) {
                    trafficLayerIds.push(layer.id);
                }
            });
        });
        this.setState({
            view: HMap.map,
        });
        _self.getCarPopup('vehicle');
        _self.getCarPopup('vehicle1');
        _self.getCarPopup('vehicle2');
        _self.getCarPopup('vehicle3');
        _self.getCarPopup('vehicle4');
        _self.getCarPopup('vehicle5');
        _self.getCarPopup('vehicle6');
        _self.getCarPopup('vehicle7');
        _self.getCarPopup('vehicle8');
        _self.getCarPopup('vehicle9');
        _self.getCarPopup('vehicle10');
        _self.getCarPopup('vehicle11');
        _self.getWarnPopup('showAlert');
        _self.getClickPlay('monitoring');
        _self.getClickPlay('hdCamera');
        // _self.getClickPlay('ordinaryCamera');
        _self.getClickPlay('remoteCamera');
        _self.getClickPlay('swan');
        _self.getClickPlay('policeStation');
        _self.getClickPlay('individual');
        _self.getClickPlay('individual1');

        _self.getPopUp('vehicle');
        _self.getPopUp('vehicle1');
        _self.getPopUp('vehicle2');
        _self.getPopUp('vehicle3');
        _self.getPopUp('vehicle4');
        _self.getPopUp('vehicle5');
        _self.getPopUp('vehicle6');
        _self.getPopUp('vehicle7');
        _self.getPopUp('vehicle8');
        _self.getPopUp('vehicle9');
        _self.getPopUp('vehicle10');
        _self.getPopUp('vehicle11');
        _self.getPopUp('monitoring');
        _self.getPopUp('hdCamera');
        // _self.getPopUp('ordinaryCamera');
        _self.getPopUp('remoteCamera');
        _self.getPopUp('policeStation');
        _self.getPopUp('swan');
        _self.getPopUp('intercom');
        _self.getPopUp('intercom1');
        _self.getPopUp('intercom2');
        _self.getPopUp('firearms');
        _self.getPopUp('logis')
        _self.getPopUp('express')
        _self.getPopUp('codeChain')
        _self.getPopUp('coldStorage')
        _self.getPopUp('farmMarket')
        _self.getPopUp('showOtherPlace')
        // _self.getPopUp('keyPlace');
        _self.getPopUp('individual');
        _self.getPopUp('individual1');
        _self.getIntercom('intercom');
        _self.getIntercom('intercom1');
        _self.getIntercom('intercom2');
        let IconAlertCenter = HGis.makeIcon(HMap, {
            iconUrl: './image/jqicon_05.png',
        });
        let IconAlertIcon = HGis.makeIcon(HMap, {
            iconUrl: './image/jqicon_5.png',
        });
        let IconAdd = HGis.makeIcon(HMap, {
            iconUrl: './image/jqicon_6.png',
        });
        let pointCenter = HGis.makeIcon(HMap, {
            iconUrl: './image/jqicon_6.png',
        });
        let pointIcon1 = HGis.makeIcon(HMap, {
            iconUrl: './image/qz01.png',
        });
        let pointIcon2 = HGis.makeIcon(HMap, {
            iconUrl: './image/qz02.png',
        });
        let pointIcon3 = HGis.makeIcon(HMap, {
            iconUrl: './image/qz03.png',
        });
        let iconOption = HGis.makeIcon(HMap, {
            iconUrl: './image/pcsCar1.png',
        });
        let iconOption1 = HGis.makeIcon(HMap, {
            iconUrl: './image/pcsCar.png',
        });
        let iconOptionFj = HGis.makeIcon(HMap, {
            iconUrl: './image/fjCar.png',
        });
        let iconOptionFj1 = HGis.makeIcon(HMap, {
            iconUrl: './image/fjCar1.png',
        });
        let iconOptionWj = HGis.makeIcon(HMap, {
            iconUrl: './image/wjCar.png',
        });
        let iconOptionWj1 = HGis.makeIcon(HMap, {
            iconUrl: './image/wjCar1.png',
        });
        let iconOptionWjGreen = HGis.makeIcon(HMap, {
            iconUrl: './image/wjCarGreen.png',
        });
        let iconOptionWjGreen1 = HGis.makeIcon(HMap, {
            iconUrl: './image/wjCarGreen1.png',
        });
        let iconOptionWjWhite = HGis.makeIcon(HMap, {
            iconUrl: './image/wjCarWhite.png',
        });
        let iconOptionWjWhite1 = HGis.makeIcon(HMap, {
            iconUrl: './image/wjCarWhite1.png',
        });
        let iconOption2 = HGis.makeIcon(HMap, {
            iconUrl: './image/xzcllon.png',
        });
        let iconOption3 = HGis.makeIcon(HMap, {
            iconUrl: './image/xzcll.png',
        });
        edit = HGis.initMapEdit(HMap, {
            boxSelect: true,
            touchEnabled: true,
            displayControlsDefault: true,
            showButtons: false,
            userStyles: {
                inactive: {
                    fillOpacity: 0.2,
                    fillColor: '#171cba',
                    fillOutlineColor: '#171cba',
                    fillOutlineWidth: 3,
                    lineColor: '#171cba',
                    circleColor: '#171cba',
                    circleBorderColor: '#ffffff',
                    circleRadius: 2,
                    circleBorderRadius: 2,
                },
            },
        });
        HGis.disableEditDraw(HMap);
        HMap.map.on('moveend', function() {
            if (_self.state.singleWaring) {
                if (_self.state.showWarningsCon) {
                    _self.checkPoliceDetails('', true);
                    // _self.policeDetailsMap(
                    //     _self.state.policeDetails,
                    //     false,
                    //     'sourcePoliceDetails',
                    //     'overlayWarning',
                    //     'showPoliceDetailsVector',
                    //     true,
                    //     true,
                    // );
                }
            }
        });
        this.setState({
            searchBar,
            warnings,
            content,
            alarmcon,
            IconAlertCenter,
            IconAlertIcon,
            IconAddId: IconAdd.id,
            pointCenter,
            pointIcon1,
            pointIcon2,
            pointIcon3,
            iconOption,
            iconOption1,
            iconOptionFj,
            iconOptionFj1,
            iconOptionWj,
            iconOptionWj1,
            iconOptionWjGreen,
            iconOptionWjGreen1,
            iconOptionWjWhite,
            iconOptionWjWhite1,
            iconOption2,
            iconOption3,
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
        if (
            type === 'vehicle' ||
            type === 'vehicle1' ||
            type === 'vehicle2' ||
            type === 'vehicle3' ||
            type === 'vehicle4' ||
            type === 'vehicle5' ||
            type === 'vehicle6' ||
            type === 'vehicle7' ||
            type === 'vehicle8' ||
            type === 'vehicle9' ||
            type === 'vehicle10' ||
            type === 'vehicle11'
        ) {
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
            type === 'hdCamera' ||
            // type === 'ordinaryCamera' ||
            type === 'remoteCamera' ||
            type === 'policeStation' ||
            type === 'swan'
            // type === 'keyPlace'
        ) {
            spanA.innerText =
                '名称：' +
                (files.kkmc + '\n' || '') +
                '经度：' +
                (files.gps[0] + '\n' || '') +
                '纬度：' +
                (files.gps[1] + '\n' || '') +
                (files.kkid ? '编号：' + (files.kkid + '\n' || '') : '');
        }else if(type === 'logis' ||type === 'express'||type === 'codeChain'||type === 'coldStorage'||type === 'farmMarket' ||type === 'showOtherPlace' ) {
            spanA.innerText =
                '名称：' +
                (files.kkmc + '\n' || '') +
                '负责人：' +
                (files.fzr + '\n' || '') +
                '联系电话：' +
                (files.lxdh + '\n' || '') +
                '企业地址：' +
                (files.qydz + '\n' || '')
        }
        else if (
            type === 'intercom' ||
            type === 'intercom1' ||
            type === 'intercom2' ||
            type === 'individual' ||
            type === 'individual1'
        ) {
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
        } else if (type === 'firearms') {
            spanA.innerText =
                (files.firearms_no ? '编号：' + (files.firearms_no + '\n' || '') : '') +
                '经度：' +
                (files.gps_points[0] || '') +
                '\n' +
                '纬度：' +
                (files.gps_points[1] || '') +
                '\n' +
                // '时间：' +
                // (files.gps_time || '') +
                // '\n' +
                '机构：' +
                (files.dgxjgmc || '') +
                '\n';
        }

        elementA.appendChild(spanA);
        body.appendChild(elementA);
    };
     // 获取各类重点场所的数量
    getBayonetsListNum = (files, classify) => {
        let _self = this;
        classify.map(item => {
            this.props.dispatch({
                type: 'otherIndex/getBayonetsList',
                payload: {
                    bayonet_type: files,
                    classify:item,
                },
                success: e => {
                    if (e.result.reason.code == '200') {
                        if (files == 3) {
                            if(item === 'logis'){
                                this.setState({ logisListNum: e.result.list.length });
                            }
                            else if(item === 'express'){
                                this.setState({ expressListNum: e.result.list.length });
                            }
                            else if(item === 'codeChain'){
                                this.setState({ codeChainListNum: e.result.list.length });
                            }
                            else if(item === 'coldStorage'){
                                this.setState({ coldStorageListNum: e.result.list.length });
                            }
                            else if(item === 'farmMarket'){
                                this.setState({ farmMarketListNum: e.result.list.length });
                            }
                        }
                    } else {
                        return false;
                    }
                },
            });
        });

    }
    // 从物流统计中跳转而来
    getBayonetsListFromLogis = (files, classify,record) => {
        let _self = this;
        classify.map((item)=>{
            this.props.dispatch({
                type: 'otherIndex/getBayonetsList',
                payload: {
                    bayonet_type: files,
                    classify:item,
                },
                success: e => {
                    console.log('e.result.reason',e.result.reason)
                    if (e.result.reason.code == '200') {
                        console.log('files',files)
                        if (files == 3) {
                            HGis.removeLayer(HMap, 'showcoverplace');
                            record.gps = [parseFloat(record.jd),parseFloat(record.wd)]
                            let img = '';
                            if(record.classify=='logis'){
                                img = './image/logis1.png'
                            }
                            else if(record.classify=='express'){
                                img = './image/express1.png'
                            }
                            else if(record.classify=='codeChain'){
                                img = './image/coldtransport1.png'
                            }
                            else if(record.classify=='coldStorage'){
                                img = './image/coldhouse1.png'
                            }
                            else if(record.classify=='farmMarket'){
                                img = './image/openmarket1.png'
                            }
                            else {
                                img = './image/zdcs_11.png'
                            }
                            console.log('record',record)
                            if(record&&record.gps){
                                HGis.setMapCenter(HMap, record.gps);
                            }
                            _self.getPiontMap(
                                record,
                                false,
                                'sourceKeyPlace',
                                'showKeyPlaceVector',
                                img,
                                record.classify,
                                'gps',
                            );

                        }
                    }
                    else {
                        return false;
                    }
                },
            });
        })

    }
    getBayonetsListDate = (files, classify) => {
        let _self = this;
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
                        if (classify === 'hdCamera') {
                            this.setState({ gqList: e.result.list }, () => {
                                _self.getPiontMap(
                                    _self.state.gqList,
                                    false,
                                    'sourceMonitoring',
                                    'showMonitoringVector',
                                    '/image/spjk_gq.png',
                                    classify,
                                    'gps',
                                );
                            });
                        }
                        // if (classify === 'ordinaryCamera') {
                        //     this.setState({ bqList: e.result.list }, () => {
                        //         _self.getPiontMap(
                        //             _self.state.bqList,
                        //             false,
                        //             'sourceMonitoring',
                        //             'showMonitoringVector',
                        //             '/image/spjk_bq.png',
                        //             classify,
                        //             'gps',
                        //         );
                        //     });
                        // }
                        if (classify === 'remoteCamera') {
                            this.setState({ gdList: e.result.list }, () => {
                                _self.getPiontMap(
                                    _self.state.gdList,
                                    false,
                                    'sourceMonitoring',
                                    'showMonitoringVector',
                                    '/image/spjk_gd.png',
                                    classify,
                                    'gps',
                                );
                            });
                        }
                    } else if (files == 3) {
                        if(classify === 'logis'){
                            this.setState({ logisList: e.result.list }, () => {
                                // _self.getKeyPlaceMap()
                                _self.getPiontMap(
                                    _self.state.logisList,
                                    false,
                                    'sourceKeyPlace',
                                    'showKeyPlaceVector',
                                    './image/logis.png',
                                    classify,
                                    'gps',
                                );
                            });
                        }
                        else if(classify === 'express'){
                            this.setState({ expressList: e.result.list }, () => {
                                // _self.getKeyPlaceMap()
                                _self.getPiontMap(
                                    _self.state.expressList,
                                    false,
                                    'sourceKeyPlace',
                                    'showKeyPlaceVector',
                                    './image/express.png',
                                    classify,
                                    'gps',
                                );
                            });
                        }
                        else if(classify === 'codeChain'){
                            this.setState({ codeChainList: e.result.list }, () => {
                                // _self.getKeyPlaceMap()
                                _self.getPiontMap(
                                    _self.state.codeChainList,
                                    false,
                                    'sourceKeyPlace',
                                    'showKeyPlaceVector',
                                    './image/coldtransport.png',
                                    classify,
                                    'gps',
                                );
                            });
                        }
                        else if(classify === 'coldStorage'){
                            this.setState({ coldStorageList: e.result.list }, () => {
                                // _self.getKeyPlaceMap()
                                _self.getPiontMap(
                                    _self.state.coldStorageList,
                                    false,
                                    'sourceKeyPlace',
                                    'showKeyPlaceVector',
                                    './image/coldhouse.png',
                                    classify,
                                    'gps',
                                );
                            });
                        }
                        else if(classify === 'farmMarket'){
                            this.setState({ farmMarketList: e.result.list }, () => {
                                // _self.getKeyPlaceMap()
                                _self.getPiontMap(
                                    _self.state.farmMarketList,
                                    false,
                                    'sourceKeyPlace',
                                    'showKeyPlaceVector',
                                    './image/openmarket.png',
                                    classify,
                                    'gps',
                                );
                            });
                        }
                        else if(classify === 'showOtherPlace'){
                            this.setState({ showOtherPlaceList: e.result.list }, () => {
                                // _self.getKeyPlaceMap()
                                _self.getPiontMap(
                                    _self.state.showOtherPlaceList,
                                    false,
                                    'sourceKeyPlace',
                                    'showKeyPlaceVector',
                                    './image/zdcs_1.png',
                                    classify,
                                    'gps',
                                );
                            });
                        }

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
                                'gps',
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

    getJurisdiction = callback => {
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
                if (e.result.reason.code == '200') {
                    if (e.result.label.jgfw) {
                        this.getJurisdictionMap(e.result.label.jgfw);
                        if (callback) {
                            callback(true);
                        }
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
    /**
     * WGS84转GCj02
     * @param lng
     * @param lat
     * @returns {*[]}
     */
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
     * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
     * 即谷歌、高德 转 百度
     * @param lng
     * @param lat
     * @returns {*[]}
     */
    gcj02tobd09 = (lng, lat) => {
        var x_PI = (3.14159265358979324 * 3000.0) / 180.0;
        var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI);
        var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI);
        var bd_lng = z * Math.cos(theta) + 0.0065;
        var bd_lat = z * Math.sin(theta) + 0.006;
        return [bd_lng, bd_lat];
    };
    /**
     * GCJ02 转换为 WGS84
     * @param lng
     * @param lat
     * @returns {*[]}
     */
    gcj02towgs84 = (lng, lat) => {
        const PI = 3.1415926535897932384626;
        const a = 6378245.0;
        const ee = 0.00669342162296594323;
        let dlat = this.transformLat(lng - 105.0, lat - 35.0);
        let dlng = this.transformLon(lng - 105.0, lat - 35.0);
        let radlat = (lat / 180.0) * PI;
        let magic = Math.sin(radlat);
        magic = 1 - ee * magic * magic;
        const sqrtmagic = Math.sqrt(magic);
        dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * PI);
        dlng = (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * PI);
        let mglat = lat + dlat;
        let mglng = lng + dlng;
        return [lng * 2 - mglng, lat * 2 - mglat];
    };
    statesChange = files => {
        let _self = this;
        const {
            showHeat,
            showPersonHeat,
            showVehicle,
            showAlert,
            showIntercom,
            showFirearms,
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
            showLk,
            logis,
            express,
            codeChain,
            coldStorage,
            farmMarket,
            showOtherPlace,
        } = this.state;
        switch (files) {
            case 'showJurisdiction':
                this.setState({ showJurisdiction: !showJurisdiction }, () => {
                    if (this.state.showJurisdiction) {
                        this.getJurisdiction();
                    } else {
                        let { arrId } = this.state;
                        arrId.map(item => {
                            if (HMap.map.getLayer(item)) {
                                HMap.map.setLayoutProperty(item, 'visibility', 'none');
                            }
                        });
                    }
                });
                break;
            case 'showHeat':
                this.setState({ showHeat: !showHeat }, () => {
                    if (!this.state.showHeat) {
                        HMap.map.setLayoutProperty('Heat', 'visibility', 'none');
                    }
                    this.sendSet();
                });

                break;
            case 'showPersonHeat':
                this.setState({ showPersonHeat: !showPersonHeat }, () => {
                    if (!this.state.showPersonHeat) {
                        HMap.map.setLayoutProperty('PersonHeat', 'visibility', 'none');
                    }
                    this.sendSet();
                });

                break;
            case 'showLk':
                this.setState({ showLk: !showLk }, () => {
                    if (!this.state.showLk) {
                        if (HMap.map.getLayer('Traffic')) {
                            HMap.map.setLayoutProperty('Traffic', 'visibility', 'none');
                        }
                        if (_interval) {
                            clearInterval(_interval);
                            _interval = null;
                        }
                    } else {
                        this.getLk();
                    }
                });

                break;
            case 'showVehicle':
                this.setState({ showVehicle: !showVehicle }, () => {
                    if (!this.state.showVehicle) {
                        if (HMap.map.getLayer('vehicle')) {
                            HMap.map.setLayoutProperty('vehicle', 'visibility', 'none');
                        }
                        if (HMap.map.getLayer('vehicle1')) {
                            HMap.map.setLayoutProperty('vehicle1', 'visibility', 'none');
                        }
                        if (HMap.map.getLayer('vehicle2')) {
                            HMap.map.setLayoutProperty('vehicle2', 'visibility', 'none');
                        }
                        if (HMap.map.getLayer('vehicle3')) {
                            HMap.map.setLayoutProperty('vehicle3', 'visibility', 'none');
                        }
                        if (HMap.map.getLayer('vehicle4')) {
                            HMap.map.setLayoutProperty('vehicle4', 'visibility', 'none');
                        }
                        if (HMap.map.getLayer('vehicle5')) {
                            HMap.map.setLayoutProperty('vehicle5', 'visibility', 'none');
                        }
                        if (HMap.map.getLayer('vehicle6')) {
                            HMap.map.setLayoutProperty('vehicle6', 'visibility', 'none');
                        }
                        if (HMap.map.getLayer('vehicle7')) {
                            HMap.map.setLayoutProperty('vehicle7', 'visibility', 'none');
                        }
                        if (HMap.map.getLayer('vehicle8')) {
                            HMap.map.setLayoutProperty('vehicle8', 'visibility', 'none');
                        }
                        if (HMap.map.getLayer('vehicle9')) {
                            HMap.map.setLayoutProperty('vehicle9', 'visibility', 'none');
                        }
                        if (HMap.map.getLayer('vehicle10')) {
                            HMap.map.setLayoutProperty('vehicle10', 'visibility', 'none');
                        }
                        if (HMap.map.getLayer('vehicle11')) {
                            HMap.map.setLayoutProperty('vehicle11', 'visibility', 'none');
                        }
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
                            HGis.removeLayer(HMap, 'showAlert');
                            HGis.removeLayer(HMap, 'showAlertImg');
                            this.state.warnings.innerHTML = '';
                        }
                        this.sendSet();
                    },
                );
                break;
            case 'showIntercom':
                this.setState({ showIntercom: !showIntercom }, () => {
                    if (!this.state.showIntercom) {
                        if (HMap.map.getLayer('intercom')) {
                            HMap.map.setLayoutProperty('intercom', 'visibility', 'none');
                        }
                        if (HMap.map.getLayer('intercom1')) {
                            HMap.map.setLayoutProperty('intercom1', 'visibility', 'none');
                        }
                        if (HMap.map.getLayer('intercom2')) {
                            HMap.map.setLayoutProperty('intercom2', 'visibility', 'none');
                        }
                    }
                    this.sendSet();
                });
                break;
            case 'showFirearms':
                this.setState({ showFirearms: !showFirearms }, () => {
                    if (!this.state.showFirearms) {
                        if (HMap.map.getLayer('firearms')) {
                            HMap.map.setLayoutProperty('firearms', 'visibility', 'none');
                        }
                    }
                    this.sendSet();
                });
                break;
            case 'showIndividual':
                this.setState({ showIndividual: !showIndividual }, () => {
                    if (!this.state.showIndividual) {
                        if (HMap.map.getLayer('individual')) {
                            HMap.map.setLayoutProperty('individual', 'visibility', 'none');
                        }
                        if (HMap.map.getLayer('individual1')) {
                            HMap.map.setLayoutProperty('individual1', 'visibility', 'none');
                        }
                    }
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
                            HMap.map.setLayoutProperty('swan', 'visibility', 'none');
                        });
                    }
                });
                break;
            case 'showMonitoring':
                this.setState(
                    {
                        showMonitoring: !showMonitoring,
                        hdCamera: true,
                        ordinaryCamera: false,
                        remoteCamera: true,
                    },
                    () => {
                        // this.sendSet()
                        if (this.state.showMonitoring) {
                            this.getBayonetsList(2, ['hdCamera', 'remoteCamera']);
                        } else {
                            this.setState({ monitoringList: [] }, () => {
                                // HMap.map.setLayoutProperty('monitoring', 'visibility', 'none');
                                if (HMap.map.getLayer('hdCamera')) {
                                    HMap.map.setLayoutProperty('hdCamera', 'visibility', 'none');
                                }
                                // HMap.map.setLayoutProperty('ordinaryCamera', 'visibility', 'none');
                                if (HMap.map.getLayer('remoteCamera')) {
                                    HMap.map.setLayoutProperty(
                                        'remoteCamera',
                                        'visibility',
                                        'none',
                                    );
                                }
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
                        this.setState({ gqList: [] }, () => {
                            if (HMap.map.getLayer('hdCamera')) {
                                HMap.map.setLayoutProperty('hdCamera', 'visibility', 'none');
                            }
                        });
                    }
                });
                break;
            // case 'ordinaryCamera':
            //     this.setState({ ordinaryCamera: !ordinaryCamera }, () => {
            //         // this.sendSet()
            //         if (this.state.ordinaryCamera) {
            //             this.getBayonetsList(2, ['ordinaryCamera']);
            //         } else {
            //             this.setState({ bqList: [] }, () => {
            //                 HMap.map.setLayoutProperty('ordinaryCamera', 'visibility', 'none');
            //             });
            //         }
            //     });
            //     break;
            case 'remoteCamera':
                this.setState({ remoteCamera: !remoteCamera }, () => {
                    if (this.state.remoteCamera) {
                        this.getBayonetsList(2, ['remoteCamera']);
                    } else {
                        this.setState({ gdList: [] }, () => {
                            if (HMap.map.getLayer('remoteCamera')) {
                                HMap.map.setLayoutProperty('remoteCamera', 'visibility', 'none');
                            }
                        });
                    }
                });
                break;
            case 'showPlace':
                this.setState({
                    showPlace: !showPlace ,
                    logis: !logis,
                    express: !express,
                    codeChain:!codeChain,
                    coldStorage:!coldStorage,
                    farmMarket:!farmMarket,
                    showOtherPlace: !showOtherPlace,
                }, () => {
                    // this.sendSet()
                    if (this.state.showPlace) {
                        this.getBayonetsList(3, ['logis','express','showOtherPlace','codeChain','coldStorage','farmMarket']);
                    } else {
                        this.setState({ keyPlaceList: [] }, () => {
                            if (HMap.map.getLayer('logis')) {
                                HMap.map.setLayoutProperty('logis', 'visibility', 'none');
                            }
                            if (HMap.map.getLayer('express')) {
                                HMap.map.setLayoutProperty('express', 'visibility', 'none');
                            }
                            if (HMap.map.getLayer('codeChain')) {
                                HMap.map.setLayoutProperty('codeChain', 'visibility', 'none');
                            }
                            if (HMap.map.getLayer('coldStorage')) {
                                HMap.map.setLayoutProperty('coldStorage', 'visibility', 'none');
                            }
                            if (HMap.map.getLayer('farmMarket')) {
                                HMap.map.setLayoutProperty('farmMarket', 'visibility', 'none');
                            }
                            if (HMap.map.getLayer('showOtherPlace')) {
                                HMap.map.setLayoutProperty('showOtherPlace', 'visibility', 'none');
                            }
                        });
                    }
                });
                break;
            case 'logis':
                this.setState({ logis: !logis }, () => {
                    // this.sendSet()
                    if (this.state.logis) {
                        this.getBayonetsList(3,['logis']);
                    } else {
                        this.setState({ logisList: [] }, () => {
                            if (HMap.map.getLayer('logis')) {
                                HMap.map.setLayoutProperty('logis', 'visibility', 'none');
                            }
                        });
                    }
                });
                break;
            case 'express':
                this.setState({ express: !express }, () => {
                    // this.sendSet()
                    if (this.state.express) {
                        this.getBayonetsList(3,['express']);
                    } else {
                        this.setState({ expressList: [] }, () => {
                            if (HMap.map.getLayer('express')) {
                                HMap.map.setLayoutProperty('express', 'visibility', 'none');
                            }
                        });
                    }
                });
                break;
            case 'codeChain':
                this.setState({ codeChain: !codeChain }, () => {
                        // this.sendSet()
                    if (this.state.codeChain) {
                        this.getBayonetsList(3,['codeChain']);
                    } else {
                        this.setState({ codeChainList: [] }, () => {
                            if (HMap.map.getLayer('codeChain')) {
                                HMap.map.setLayoutProperty('codeChain', 'visibility', 'none');
                            }
                        });
                    }
                });
                break;
            case 'coldStorage':
                this.setState({ coldStorage: !coldStorage }, () => {
                    // this.sendSet()
                    if (this.state.coldStorage) {
                        this.getBayonetsList(3,['coldStorage']);
                    } else {
                        this.setState({ coldStorageList: [] }, () => {
                            if (HMap.map.getLayer('coldStorage')) {
                                HMap.map.setLayoutProperty('coldStorage', 'visibility', 'none');
                            }
                        });
                    }
                });
                break;
            case 'farmMarket':
                this.setState({ farmMarket: !farmMarket }, () => {
                    // this.sendSet()
                    if (this.state.farmMarket) {
                        this.getBayonetsList(3,['farmMarket']);
                    } else {
                        this.setState({ farmMarketList: [] }, () => {
                            if (HMap.map.getLayer('farmMarket')) {
                                HMap.map.setLayoutProperty('farmMarket', 'visibility', 'none');
                            }
                        });
                    }
                });
                break;
            case 'showOtherPlace':
                this.setState({ showOtherPlace: !showOtherPlace }, () => {
                    // this.sendSet()
                    if (this.state.showOtherPlace) {
                        this.getBayonetsList(3,['showOtherPlace']);
                    } else {
                        this.setState({ showOtherPlaceList: [] }, () => {
                            if (HMap.map.getLayer('showOtherPlace')) {
                                HMap.map.setLayoutProperty('showOtherPlace', 'visibility', 'none');
                            }
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
                            if (HMap.map.getLayer('policeStation')) {
                                HMap.map.setLayoutProperty('policeStation', 'visibility', 'none');
                            }
                        });
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
        let _self = this;
        if (this.wc && this.wc.options) {
            this.wc.options.globalParams = {
                token: sessionStorage.getItem('userToken'),
                government: JSON.parse(sessionStorage.getItem('groupListCode')),
                individualEquipmentFlag: _self.state.showIndividual,
                policeTongFlag: _self.state.showIndividual,
                bodyWornFlag: _self.state.showIndividual,
                intercomFlag: _self.state.showIntercom,
                firearmsFlag: _self.state.showFirearms, //枪支
                policeAlarmFlag: _self.state.showAlert,
                thermodynamicChartFlag: _self.state.showHeat,
                crowdDensity: _self.state.showPersonHeat,
                vehicleFlag: _self.state.showVehicle,
            };
            this.wc.send();
        }
    };

    //在地图上渲染预警信息
    getWarningMap = () => {
        let _self = this;
        let { policeAlarmList } = this.state;
        if (policeAlarmList && policeAlarmList.length > 0) {
            _self.addMarksByOverlay(policeAlarmList);
        }
    };
    addMarksByOverlay = points => {
        const { IconAlertCenter } = this.state;
        let markOptions = {
            id: 'showAlert',
            data: [],
            textField: 'title',
        };
        //循环点集
        for (let i = 0; i < points.length; i++) {
            markOptions.data.push({
                coordinate: [Number(points[i].xzb), Number(points[i].yzb)],
                properties: {
                    title: '',
                    type: 'showAlert',
                    layer: points[i],
                },
            });
        }
        if (!HMap.map.getLayer('showAlert')) {
            HGis.addMarkLayer(HMap, IconAlertCenter, markOptions);
        }
    };
    warningStyles = () => {
        let d = 2,
            b = 6,
            c = 10;
        const zoom = Number(HMap.map.getZoom());
        if (zoom <= 8) {
            return { b: b, c: c, d: d };
        } else {
            const num = zoom - 8;
            b = Math.pow(2, num) * b;
            c = Math.pow(2, num) * c;
            d = Math.pow(2, num) * d;
            return { b: b, c: c, d: d };
        }
    };
    //在地图上渲染辖区
    getJurisdictionMap = files => {
        const { sourceJurisdiction, view, map, showJurisdictionVector } = this.state;
        let arr = [];
        let arrId = [];
        if (files) {
            if (files.own) {
                const clis = files.own[0];
                if (clis.label_gps_point && clis.label_gps_point.length) {
                    let jdCenter = 0;
                    let wdCenter = 0;
                    clis.label_gps_point.map(item => {
                        jdCenter = jdCenter + item[0];
                        wdCenter = wdCenter + item[1];
                    });
                    if (HMap.map.getLayer('own')) {
                        HMap.map.setLayoutProperty('own', 'visibility', 'visible');
                    } else {
                        HGis.addPolygonLayer(HMap, {
                            id: 'own',
                            data: [{ coordinate: [clis.label_gps_point] }],
                            fillColor: '#73d2ff',
                            fillOutlineColor: '#73d2ff',
                            fillOpacity: 0.1,
                        });
                    }
                    if (HMap.map.getLayer('ownLine')) {
                        HMap.map.setLayoutProperty('ownLine', 'visibility', 'visible');
                    } else {
                        HGis.addPolylineLayer(HMap, {
                            id: 'ownLine',
                            data: [{ coordinate: clis.label_gps_point }],
                            lineColor: '#73d2ff',
                            lineWidth: 3,
                            lineOpacity: 1,
                        });
                    }
                    arrId.push('own');
                    arrId.push('ownLine');
                    let len = clis.label_gps_point.length;
                    // let llb = new minemap.LngLatBounds(clis.label_gps_point);
                    // let centerLib = llb.getCenter();
                    HGis.setMapCenter(HMap, [jdCenter / len, wdCenter / len]);
                    HMap.map.setZoom(14);
                } else {
                    message.error('未设置所属机构管辖范围');
                    return false;
                }
            }
            if (files.children_list && files.children_list.length > 0) {
                files.children_list.map((clis, idx) => {
                    let jdCenter = 0;
                    let wdCenter = 0;
                    clis.label_gps_point.map(item => {
                        jdCenter = jdCenter + item[0];
                        wdCenter = wdCenter + item[1];
                    });
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
                        let len = clis.label_gps_point.length;
                        let markOptions = {
                            id: 'brotherName' + idx,
                            data: [
                                {
                                    coordinate: [jdCenter / len, wdCenter / len],
                                    properties: {
                                        title: clis.label_organization_name,
                                        type: 'vehicle',
                                    },
                                },
                            ],
                            textField: 'title',
                            textSize: 16,
                            textColor: colorBorder ? colorBorder : colors[idx],
                            textOffset: clis.label_organization_name.includes('胜利')
                                ? [-2, 0]
                                : [0, 0],
                        };
                        if (HMap.map.getLayer('brotherPolygon' + idx)) {
                            HMap.map.setLayoutProperty(
                                'brotherPolygon' + idx,
                                'visibility',
                                'visible',
                            );
                        } else {
                            HGis.addPolygonLayer(HMap, {
                                id: 'brotherPolygon' + idx,
                                data: [{ coordinate: [clis.label_gps_point] }],
                                fillColor: colorBorder ? colorBorder : colors[idx],
                                fillOutlineColor: colorBorder ? colorBorder : colors[idx],
                                fillOpacity: 0.2,
                            });
                        }
                        if (HMap.map.getLayer('brother' + idx)) {
                            HMap.map.setLayoutProperty('brother' + idx, 'visibility', 'visible');
                        } else {
                            HGis.addPolylineLayer(HMap, {
                                id: 'brother' + idx,
                                data: [{ coordinate: clis.label_gps_point }],
                                lineColor: colorBorder ? colorBorder : colors[idx],
                                lineWidth: 3,
                                lineOpacity: 1,
                            });
                        }
                        if (HMap.map.getLayer('brotherName' + idx)) {
                            HMap.map.setLayoutProperty(
                                'brotherName' + idx,
                                'visibility',
                                'visible',
                            );
                        } else {
                            HGis.addMarkLayer(HMap, '', markOptions);
                        }
                        arrId.push('brotherPolygon' + idx);
                        arrId.push('brother' + idx);
                        arrId.push('brotherName' + idx);
                    } else {
                        return false;
                    }
                });
            }
        }
        this.setState({
            arrId,
        });
    };
    //在地图上渲染热力图
    getHeatMap = () => {
        let _self = this;
        var markOptions = {
            id: 'Heat',
            valueField: 'mag',
            gradient: [
                [0, 'rgba(0, 0, 255, 0)'],
                [0.1, 'lime'],
                [0.2, 'yellow'],
                [0.3, 'orange'],
                [0.5, 'red'],
                [1, 'red'],
            ],
        };
        let heatData = [];
        const { heatList } = this.state;
        if (heatList && heatList.length) {
            for (let index = 0; index < heatList.length; index++) {
                const element = heatList[index];
                if (element.gps) {
                    let weightNum = 8;
                    heatData.push({
                        coordinate: element.gps,
                        properties: {
                            mag: weightNum,
                        },
                    });
                }
            }
        }
        // HGis.addHeat(HMap, markOptions, heatData);
        const Source = HMap.map.getSource('Heat');
        if (heatData && heatData.length > 0) {
            if (Source) {
                if (_self.state.showHeat) {
                    var jsonData = HGis.buildGeoJsonData('Point', heatData);
                    Source.setData(jsonData);
                    HMap.map.setLayoutProperty('Heat', 'visibility', 'visible');
                }
            } else {
                HGis.addHeat(HMap, markOptions, heatData);
            }
        } else {
            if (!Source) {
                HGis.addHeat(HMap, markOptions, []);
            }
        }
    };
    //在地图上渲染人流热力图
    getHeatPersonMap = () => {
        let _self = this;
        var markOptions = {
            id: 'PersonHeat',
            valueField: 'mag',
            gradient: [
                [0, 'rgba(12,215,64,0)'],
                [0.1, '#57f14c'],
                [0.3, '#ff9718'],
                [0.5, '#e7ff12'],
                [0.7, '#ff1846'],
                [1, 'red'],
            ],
        };
        let heatData = [];
        const { heatPersonList } = this.state;
        if (heatPersonList && heatPersonList.length) {
            for (let index = 0; index < heatPersonList.length; index++) {
                const element = heatPersonList[index];
                if (element.gps) {
                    // let weightNum = Math.random()
                    let weightNum = 5;
                    heatData.push({
                        coordinate: element.gps,
                        properties: {
                            mag: weightNum,
                        },
                    });
                }
            }
        }
        // HGis.addHeat(HMap, markOptions, heatData);
        const Source = HMap.map.getSource('PersonHeat');
        if (heatData && heatData.length > 0) {
            if (Source) {
                if (_self.state.showPersonHeat) {
                    var jsonData = HGis.buildGeoJsonData('Point', heatData);
                    Source.setData(jsonData);
                    HMap.map.setLayoutProperty('PersonHeat', 'visibility', 'visible');
                }
            } else {
                HGis.addHeat(HMap, markOptions, heatData);
            }
        } else {
            if (!Source) {
                HGis.addHeat(HMap, markOptions, []);
            }
        }
    };

    // 将警车图标渲染到地图
    getVehicleMap = (type, files) => {
        let { vehicleGpsList, showTrajectory, selectVehicleInfor } = this.state;
        let lists = type ? files.list : showTrajectory ? selectVehicleInfor : vehicleGpsList;
        let markOptions = {
            id: 'vehicle',
            data: [],
            textField: 'title',
            textSize: 12,
            textColor: '#333',
            iconSize: 0.4,
            textOffset: [0, 1],
        };
        let markOptions1 = {
            id: 'vehicle1',
            data: [],
            textField: 'title',
            textSize: 12,
            textColor: '#333',
            iconSize: 0.4,
            textOffset: [0, 1],
        };
        let markOptions2 = {
            id: 'vehicle2',
            data: [],
            textField: 'title',
            textSize: 12,
            textColor: '#333',
            iconSize: 0.4,
            textOffset: [0, 1],
        };
        let markOptions3 = {
            id: 'vehicle3',
            data: [],
            textField: 'title',
            textSize: 12,
            textColor: '#333',
            iconSize: 0.4,
            textOffset: [0, 1],
        };
        let markOptions4 = {
            id: 'vehicle4',
            data: [],
            textField: 'title',
            textSize: 12,
            textColor: '#333',
            iconSize: 0.4,
            textOffset: [0, 1],
        };
        let markOptions5 = {
            id: 'vehicle5',
            data: [],
            textField: 'title',
            textSize: 12,
            textColor: '#333',
            iconSize: 0.4,
            textOffset: [0, 1],
        };
        let markOptions6 = {
            id: 'vehicle6',
            data: [],
            textField: 'title',
            textSize: 12,
            textColor: '#333',
            iconSize: 0.4,
            textOffset: [0, 1],
        };
        let markOptions7 = {
            id: 'vehicle7',
            data: [],
            textField: 'title',
            textSize: 12,
            textColor: '#333',
            iconSize: 0.4,
            textOffset: [0, 1],
        };
        let markOptions8 = {
            id: 'vehicle8',
            data: [],
            textField: 'title',
            textSize: 12,
            textColor: '#333',
            iconSize: 0.4,
            textOffset: [0, 1],
        };
        let markOptions9 = {
            id: 'vehicle9',
            data: [],
            textField: 'title',
            textSize: 12,
            textColor: '#333',
            iconSize: 0.4,
            textOffset: [0, 1],
        };
        let markOptions10 = {
            id: 'vehicle10',
            data: [],
            textField: 'title',
            textSize: 12,
            textColor: '#333',
            iconSize: 0.4,
            textOffset: [0, 1],
        };
        let markOptions11 = {
            id: 'vehicle11',
            data: [],
            textField: 'title',
            textSize: 12,
            textColor: '#333',
            iconSize: 0.4,
            textOffset: [0, 1],
        };
        let {
            iconOption,
            iconOption1,
            iconOptionFj,
            iconOptionFj1,
            iconOptionWj,
            iconOptionWj1,
            iconOptionWjGreen,
            iconOptionWjGreen1,
            iconOptionWjWhite,
            iconOptionWjWhite1,
            iconOption2,
            iconOption3,
        } = this.state;
        if (lists && lists.length > 0) {
            for (let i = 0; i < lists.length; i++) {
                if (lists[i].gps_point) {
                    if (longrg.test(lists[i].gps_point[0]) && latreg.test(lists[i].gps_point[1])) {
                        if (type) {
                            if (lists[i].vehicle_state == '0') {
                                markOptions2.data.push({
                                    coordinate: lists[i].gps_point,
                                    properties: {
                                        title: lists[i].vehicle_license_plate,
                                        type: 'vehicle',
                                        layer: lists[i],
                                    },
                                });
                            } else {
                                markOptions3.data.push({
                                    coordinate: lists[i].gps_point,
                                    properties: {
                                        title: lists[i].vehicle_license_plate,
                                        type: 'vehicle',
                                        layer: lists[i],
                                    },
                                });
                            }
                        } else {
                            if (lists[i].vehicle_state == '0') {
                                if (lists[i].vehicle_type == '11') {
                                    markOptions4.data.push({
                                        coordinate: lists[i].gps_point,
                                        properties: {
                                            title: lists[i].vehicle_license_plate, // + '（离线中）',
                                            type: 'vehicle',
                                            layer: lists[i],
                                        },
                                    });
                                } else if (lists[i].vehicle_type == '9') {
                                    markOptions5.data.push({
                                        coordinate: lists[i].gps_point,
                                        properties: {
                                            title: lists[i].vehicle_license_plate,
                                            type: 'vehicle',
                                            layer: lists[i],
                                        },
                                    });
                                } else if (lists[i].vehicle_type == '20') {
                                    markOptions8.data.push({
                                        coordinate: lists[i].gps_point,
                                        properties: {
                                            title: lists[i].vehicle_license_plate,
                                            type: 'vehicle',
                                            layer: lists[i],
                                        },
                                    });
                                } else if (lists[i].vehicle_type == '21') {
                                    markOptions9.data.push({
                                        coordinate: lists[i].gps_point,
                                        properties: {
                                            title: lists[i].vehicle_license_plate,
                                            type: 'vehicle',
                                            layer: lists[i],
                                        },
                                    });
                                } else {
                                    markOptions.data.push({
                                        coordinate: lists[i].gps_point,
                                        properties: {
                                            title: lists[i].vehicle_license_plate,
                                            type: 'vehicle',
                                            layer: lists[i],
                                        },
                                    });
                                }
                            } else {
                                if (lists[i].vehicle_type == '11') {
                                    markOptions6.data.push({
                                        coordinate: lists[i].gps_point,
                                        properties: {
                                            title: lists[i].vehicle_license_plate, // + '（在线）',
                                            type: 'vehicle',
                                            layer: lists[i],
                                        },
                                    });
                                } else if (lists[i].vehicle_type == '9') {
                                    markOptions7.data.push({
                                        coordinate: lists[i].gps_point,
                                        properties: {
                                            title: lists[i].vehicle_license_plate,
                                            type: 'vehicle',
                                            layer: lists[i],
                                        },
                                    });
                                } else if (lists[i].vehicle_type == '20') {
                                    markOptions10.data.push({
                                        coordinate: lists[i].gps_point,
                                        properties: {
                                            title: lists[i].vehicle_license_plate,
                                            type: 'vehicle',
                                            layer: lists[i],
                                        },
                                    });
                                } else if (lists[i].vehicle_type == '21') {
                                    markOptions11.data.push({
                                        coordinate: lists[i].gps_point,
                                        properties: {
                                            title: lists[i].vehicle_license_plate,
                                            type: 'vehicle',
                                            layer: lists[i],
                                        },
                                    });
                                } else {
                                    markOptions1.data.push({
                                        coordinate: lists[i].gps_point,
                                        properties: {
                                            title: lists[i].vehicle_license_plate,
                                            type: 'vehicle',
                                            layer: lists[i],
                                        },
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
        this.getVehicleData(markOptions, 'vehicle', iconOption);
        this.getVehicleData(markOptions1, 'vehicle1', iconOption1);
        this.getVehicleData(markOptions2, 'vehicle2', iconOption2);
        this.getVehicleData(markOptions3, 'vehicle3', iconOption3);
        this.getVehicleData(markOptions4, 'vehicle4', iconOptionFj1);
        this.getVehicleData(markOptions5, 'vehicle5', iconOptionWj1);
        this.getVehicleData(markOptions6, 'vehicle6', iconOptionFj);
        this.getVehicleData(markOptions7, 'vehicle7', iconOptionWj);
        this.getVehicleData(markOptions8, 'vehicle8', iconOptionWjGreen1);
        this.getVehicleData(markOptions9, 'vehicle9', iconOptionWjWhite1);
        this.getVehicleData(markOptions10, 'vehicle10', iconOptionWjGreen);
        this.getVehicleData(markOptions11, 'vehicle11', iconOptionWjWhite);
    };
    getVehicleData = (markOptions, type, iconOption) => {
        if (markOptions.data && markOptions.data.length > 0) {
            const Source = HMap.map.getSource(type);
            if (Source) {
                var jsonData = HGis.buildGeoJsonData('Point', markOptions.data);
                Source.setData(jsonData);
                HMap.map.setLayoutProperty(type, 'visibility', 'visible');
            } else {
                HGis.addMarkLayer(HMap, iconOption, markOptions);
            }
        }
    };
    getNewPiontMap = async (files, bool, source, vector, imgs, type, gps) => {
        let Icon = '';
        let markOptions = {
            id: type,
            data: [],
            textField: 'title',
            iconSize: 0.4,
        };
        let iconOption = {
            iconUrl: imgs,
        };
        Icon = HGis.makeIcon(HMap, iconOption);
        if (files) {
            if (files.length) {
                for (let i = 0; i < files.length; i++) {
                    if (files[i][gps]) {
                        if (longrg.test(files[i][gps][0]) && latreg.test(files[i][gps][1])) {
                            markOptions.data.push({
                                coordinate: files[i][gps],
                                properties: {
                                    title: '',
                                    type: type,
                                    layer: files[i],
                                },
                            });
                        }
                    }
                }
                if (markOptions.data && markOptions.data.length > 0) {
                    const Source = HMap.map.getSource(type);
                    if (Source) {

                        var jsonData = HGis.buildGeoJsonData('Point', markOptions.data);
                        Source.setData(jsonData);
                        HMap.map.setLayoutProperty(type, 'visibility', 'visible');

                    } else {

                        HGis.addMarkLayer(HMap, Icon, markOptions);
                    }
                }
            } else {
                const Source = HMap.map.getSource(type);
                if (!Source) {
                    HGis.addMarkLayer(HMap, Icon, markOptions);
                }
            }
        }
    };
    getPointFromLoogis = (files) => {
        HGis.removeLayer(HMap, 'showcoverplace');
        files.gps=[files.jd,files.wd]
            let img = '';
            if(files.classify=='logis'){
                console.log('1')
                img = './image/logis1.png'
            }
            else if(files.classify=='express'){
                console.log('2')
                img = './image/express1.png'
            }
            else if(files.classify=='codeChain'){
                img = './image/coldtransport1.png'
            }
            else if(files.classify=='coldStorage'){
                img = './image/coldhouse1.png'
            }
            else if(files.classify=='farmMarket'){
                img = './image/openmarket1.png'
            }
            else {
                img = './image/zdcs_11.png'
            }
            if(files&&files.gps){
                HGis.setMapCenter(HMap, files.gps);
            }
            console.log('img',img)
            this.getNewPiontMap(
                [files] ,
                files ? true : false,
                'sourceSearchBar',
                'showSearchBarVector',
                img,
                'showcoverplace',
                'gps',
            );

    }
    //渲染各个点的公用方法
    getPiontMap = async (files, bool, source, vector, imgs, type, gps) => {
        let Icon = '', that = this;
        let markOptions = {
            id: type,
            data: [],
            textField: 'title',
            iconSize: 0.4,
        };
        let iconOption = {
            iconUrl: imgs,
        };
        Icon = HGis.makeIcon(HMap, iconOption);
        if (files) {
            if (files.length) {
                for (let i = 0; i < files.length; i++) {
                    if (files[i][gps]) {
                        if (longrg.test(files[i][gps][0]) && latreg.test(files[i][gps][1])) {
                            markOptions.data.push({
                                coordinate: files[i][gps],
                                properties: {
                                    title: '',
                                    type: type,
                                    layer: files[i],
                                },
                            });
                        }
                    }
                }
                if (markOptions.data && markOptions.data.length > 0) {
                    const Source = HMap.map.getSource(type);
                    if (Source) {
                        var jsonData = HGis.buildGeoJsonData('Point', markOptions.data);
                        Source.setData(jsonData);
                        HMap.map.setLayoutProperty(type, 'visibility', 'visible');
                        if(that.props.location.state){
                            that.getPointFromLoogis(that.props.location.state.record)
                        }
                    } else {
                        HGis.addMarkLayer(HMap, Icon, markOptions);
                    }
                }
            } else {
                const Source = HMap.map.getSource(type);
                if (!Source) {
                    HGis.addMarkLayer(HMap, Icon, markOptions);
                }
            }
        }
    };
    //检索详情
    checkSearchDetails = (files, type) => {
        // 警情: 1,警车: 2,卡口: 3,视频卡口: 4,
        // 重点场所: 5,警务站: 6,对讲机: 7,单兵设备: 8
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
            this.getPiontMap(true,{
                list:[files || this.state.searchDetails],
                bool:files ? true : false,
                source:'sourceSearchBar',
                vector:'showSearchBarVector',
                imgs: './image/xzcll.png',
                imgsOn: './image/xzcllon.png',
            });
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
            console.log('files---',files.classify);
            HGis.removeLayer(HMap, 'showcoverplace');
            let img = '';
            if(files.classify=='logis'){
                console.log('1')
                img = './image/logis1.png'
            }
            else if(files.classify=='express'){
                console.log('2')
                img = './image/express1.png'
            }
            else if(files.classify=='codeChain'){
                img = './image/coldtransport1.png'
            }
            else if(files.classify=='coldStorage'){
                img = './image/coldhouse1.png'
            }
            else if(files.classify=='farmMarket'){
                img = './image/openmarket1.png'
            }
            else {
                img = './image/zdcs_11.png'
            }
            if(files&&files.gps){
                HGis.setMapCenter(HMap, files.gps);
            }
            console.log('img',img)
            this.getPiontMap(
                [files || this.state.searchDetails],
                files ? true : false,
                'sourceSearchBar',
                'showSearchBarVector',
                img,
                'showcoverplace',
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
        const {
            map,
            view,
            sourceSearchBar,
            showSearchBarVector,
            searchBar,
            overlaySearchBar,
            searchDetails,
        } = this.state;
        let arr = [];
        // sourceSearchBar.clear();
        // showSearchBarVector.setSource(null);
        this.setState({ searchDetails: {}, searchDetailsType: '' });
        searchBar.innerHTML = '';
        // overlaySearchBar.setPosition(undefined);

        if (HMap.map.getLayer('showcoverplace')) {
            HMap.map.setLayoutProperty('showcoverplace', 'visibility', 'none');
        }
    }
    //警情详情
    checkPoliceDetails = (files, change) => {
        if (files) {
            this.setState({ policeDetails: files });
        }
        this.policeDetailsMap(
            files || this.state.policeDetails,
            files ? true : false,
            'sourcePoliceDetails',
            'overlayWarning',
            'showPoliceDetailsVector',
            true,
            change ? true : false,
        );
    };
    //在地图上渲染轨迹
    getTrajectoryMap = files => {
        const location = [];
        HMap.map.setLayoutProperty('Trajectory', 'visibility', 'none');
        if (files.length) {
            for (let i = 0; i < files.length; i++) {
                if (files[i] && files[i].gps_point) {
                    if (longrg.test(files[i].gps_point[0]) && latreg.test(files[i].gps_point[1])) {
                        location.push(files[i].gps_point);
                    }
                }
            }
            if (location.length) {
                HGis.addPolylineLayer(HMap, {
                    id: 'Trajectory',
                    data: [{ coordinate: location }],
                    lineColor: '#ff6666',
                    lineWidth: 3,
                    lineOpacity: 1,
                });
                // const lineFeature = new ol.Feature(new ol.geom.LineString(location));
                // lineFeature.setStyle(
                //     new ol.style.Style({
                //         // 设置选中时的样式
                //         stroke: new ol.style.Stroke({
                //             color: '#FF6666FF',
                //             size: 4,
                //             width: 4,
                //         }),
                //     }),
                // );
                // lineFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                //
                // sourceTrajectory.addFeature(lineFeature);
                //
                // showTrajectoryVector.setSource(sourceTrajectory);
                // for (let i = 0; i < location.length; i++) {
                //     //获取轨迹点位各点坐标
                //     arr.push(ol.proj.fromLonLat(location[i]));
                // }
                //
                // let exent = ol.extent.boundingExtent(arr);
                // let center = ol.extent.getCenter(exent);
                // view.fit(exent);
                // view.setCenter(center);
            }

            // let mapClick = map.on(
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
    policeDetailsMap = (files, type, source, overlay, vector, isDetail, isChange) => {
        let _self = this;
        const { IconAlertCenter, IconAlertIcon } = this.state;
        HGis.removeLayer(HMap, 'showAlert1');
        HGis.removeLayer(HMap, 'showAlert2');
        let warnings = document.getElementById('warnings-content');
        warnings.innerHTML = '';
        if (files) {
            if (files.xzb && files.yzb && files.xzb != 0.0 && files.yzb != 0.0) {
                if (longrg.test(files.xzb) && latreg.test(files.yzb)) {
                    let warningBody = document.getElementById('warnings');
                    // let coordinates = _self.gcj02towgs84(Number(files.xzb), Number(files.yzb));
                    let coordinates = [Number(files.xzb), Number(files.yzb)];
                    let markOptions = {
                        id: 'showAlert1',
                        data: [
                            {
                                coordinate: coordinates,
                                properties: {
                                    title: '',
                                    type: 'showAlert1',
                                },
                            },
                        ],
                        textField: 'title',
                    };
                    let markOptions2 = {
                        id: 'showAlert2',
                        url: './image/jqicon_5.png',
                        coordinates: [
                            [coordinates[0] - 0.01, coordinates[1] + 0.0072],
                            [coordinates[0] + 0.01, coordinates[1] + 0.0072],
                            [coordinates[0] + 0.01, coordinates[1] - 0.0072],
                            [coordinates[0] - 0.01, coordinates[1] - 0.0072],
                        ],
                    };
                    HGis.addImageLayer(HMap, markOptions2);
                    // HGis.addMarkLayer(HMap, IconAlertIcon, markOptions2);
                    HGis.addMarkLayer(HMap, IconAlertCenter, markOptions);
                    if (_self.state.showWarningsCon) {
                        _self.setState({ showWarningsCon: false }, () => {
                            warnings.innerHTML = '';
                        });
                    } else {
                        warnings.innerHTML = '';
                    }
                    let layer = files;
                    _self.setState({ showWarningsCon: true }, () => {
                        let options = {
                            popupOptions: {
                                closeButton: false,
                                closeOnClick: false,
                                offset: [0, 10],
                            },
                        };
                        if (!popupWarning) {
                            popupWarning = HGis.addPopup(HMap, options);
                        }
                        _self.warningRender(layer, warnings);
                        HGis.setElementLatLng(HMap, popupWarning, coordinates);
                        HGis.setElementHTMLElement(HMap, popupWarning, warningBody);
                        HGis.addElementToMap(HMap, popupWarning);
                        if (!isChange) {
                            HGis.setMapCenter(HMap, coordinates);
                        }
                        _self.setState({
                            singleWaring: true,
                        });
                    });
                }
            } else {
                if (isDetail && JSON.stringify(files) != '{}') {
                    message.warning('当前警情暂无定位');
                }
            }
        }
    };
    //关闭接处警详情
    closePoliceDetails = () => {
        HGis.removeLayer(HMap, 'showAlert1');
        HGis.removeLayer(HMap, 'showAlert2');
        const { warnings, alarmcon } = this.state;
        this.setState({ policeDetails: {} });
        warnings.innerHTML = '';
        alarmcon.innerHTML = '';
    };
    //预警详情
    checkAlarmDetails = files => {
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
    addFeatrueInfo = (info, content) => {
        let _self = this;
        content.innerHTML = '';
        const { showTrajectory, selectVehicleInfor, map, overlay } = this.state;
        let bodyA = document.createElement('div');
        bodyA.className = 'contentBody';
        content.appendChild(bodyA);
        let elementA = document.createElement('div');
        elementA.className = 'markerTrajectory';
        elementA.id = 'markerTrajectory';
        let elementB = document.createElement('div');
        elementB.className = 'markerVideo';
        elementB.id = 'markerVideo';
        bodyA.appendChild(elementA);
        bodyA.appendChild(elementB);
        let elementVideoImg = document.createElement('img');
        elementVideoImg.src = './image/video_icon2.png';
        elementB.appendChild(elementVideoImg);
        let spanB = document.createElement('span');
        spanB.innerText = '视频';
        elementB.appendChild(spanB);
        this.setState({ mapClik: true });
        let markerTrajectory = document.getElementById('markerTrajectory');
        let colseVideo = document.getElementById('colseVideo');
        let markerVideo = document.getElementById('markerVideo');
        if (markerVideo) {
            markerTrajectory.onclick = () => {
                if (_self.state.showTrajectory) {
                    _self.setState({ showTrajectory: false }, () => {
                        _self.addFeatrueInfo(info, content);
                        HMap.map.setLayoutProperty('Trajectory', 'visibility', 'none');
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
                                                    Number(HMap.map.getZoom() / 0.45),
                                                ]);
                                                _self.addFeatrueInfo(info, content);
                                            },
                                        );
                                    } else {
                                        message.warn('暂无轨迹');
                                        return false;
                                    }
                                }
                            } else {
                                message.warn('暂无轨迹');
                                return false;
                            }
                        },
                    });
                }
            };
            markerVideo.onclick = () => {
                if (info.vehicle_state == 1) {
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
        HGis.delEditAllFeatures(HMap);
        HMap.map.getCanvas().style.cursor = '-webkit-grab';
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
        this.setState({
            isWd: true,
        });
        this.getWdqMap(center, list);
    };
    //在地图上渲染围堵圈
    getWdqMap = (center, list) => {
        if (list && list.pointsF && list.pointsF !== 'ERROR') {
            let pointsList = JSON.parse(list.pointsF);
            HGis.addPolygonLayer(HMap, {
                id: 'pointsF',
                data: [{ coordinate: [pointsList] }],
                fillColor: '#fc5c65',
                fillOutlineColor: '#fc5c65',
                fillOpacity: 0.2,
            });
            let pointsListLine = pointsList;
            if (pointsList.length > 2) {
                pointsListLine.push(pointsList[0]);
            }
            HGis.addPolylineLayer(HMap, {
                id: 'pointsFLine',
                data: [{ coordinate: pointsListLine }],
                lineColor: '#fc5c65',
                lineWidth: 3,
                lineOpacity: 1,
            });
            let markOptions = {
                id: 'pointsFIcon',
                data: [],
                textField: 'title',
                iconSize: 0.6,
            };
            pointsList.map(item => {
                markOptions.data.push({
                    coordinate: item,
                });
            });
            HGis.addMarkLayer(HMap, this.state.pointIcon1, markOptions);
        }
        if (list && list.pointsS && list.pointsS !== 'ERROR') {
            let pointsList = JSON.parse(list.pointsS);
            HGis.addPolygonLayer(HMap, {
                id: 'pointsS',
                data: [{ coordinate: [pointsList] }],
                fillColor: '#f6b766',
                fillOutlineColor: '#f6b766',
                fillOpacity: 0.2,
            });
            let pointsListLine = pointsList;
            if (pointsList.length > 2) {
                pointsListLine.push(pointsList[0]);
            }
            HGis.addPolylineLayer(HMap, {
                id: 'pointsSLine',
                data: [{ coordinate: pointsListLine }],
                lineColor: '#f6b766',
                lineWidth: 3,
                lineOpacity: 1,
            });
            let markOptions = {
                id: 'pointsSIcon',
                data: [],
                textField: 'title',
                iconSize: 0.6,
            };
            pointsList.map(item => {
                markOptions.data.push({
                    coordinate: item,
                });
            });
            HGis.addMarkLayer(HMap, this.state.pointIcon2, markOptions);
        }
        if (list && list.pointsT && list.pointsT !== 'ERROR') {
            let pointsList = JSON.parse(list.pointsT);
            HGis.addPolygonLayer(HMap, {
                id: 'pointsT',
                data: [{ coordinate: [pointsList] }],
                fillColor: '#171cba',
                fillOutlineColor: '#171cba',
                fillOpacity: 0.2,
            });
            let pointsListLine = pointsList;
            if (pointsList.length > 2) {
                pointsListLine.push(pointsList[0]);
            }
            HGis.addPolylineLayer(HMap, {
                id: 'pointsTLine',
                data: [{ coordinate: pointsListLine }],
                lineColor: '#171cba',
                lineWidth: 3,
                lineOpacity: 1,
            });
            let markOptions = {
                id: 'pointsTIcon',
                data: [],
                textField: 'title',
                iconSize: 0.6,
            };
            pointsList.map(item => {
                markOptions.data.push({
                    coordinate: item,
                });
            });
            HGis.addMarkLayer(HMap, this.state.pointIcon3, markOptions);
        }
        let markOptions = {
            id: 'pointCenter',
            data: [
                {
                    coordinate: center,
                },
            ],
            textField: 'title',
            iconSize: 1,
        };
        HGis.addMarkLayer(HMap, this.state.pointCenter, markOptions);
        let zl = document.getElementById('zl');
        let zlContent = document.getElementById('zl-content');
        let options = {
            popupOptions: {
                closeButton: false,
                closeOnClick: false,
                offset: [10, 0],
            },
        };
        if (!popupZl) {
            popupZl = HGis.addPopup(HMap, options);
        }
        // this.getZl(zlContent);
        HGis.setElementLatLng(HMap, popupZl, center);
        HGis.setElementHTMLElement(HMap, popupZl, zl);
        HGis.addElementToMap(HMap, popupZl);
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
        this.setState(
            {
                drawGps: [Number(record.jd), Number(record.wd)],
                // dkloading: true,
                // visible: true,
                isWd: true,
                zltzRecord: record,
            },
            () => {
                if (record.alarm_message && record.alarm_message.portrait_img) {
                    this.getImgUpload(record.alarm_message.portrait_img);
                }
                this.handleCreateModalVisible(true);
                this.handleOk();
            },
        );
    };
    //是否下发指令
    getZl = warnings => {
        let _self = this;
        warnings.innerHTML = '';
        let body = document.createElement('div');
        body.className = 'zlBody';
        body.style.backgroundImage = "url('./image/jqbj.png')";
        warnings.appendChild(body);
        let elementA = document.createElement('div');
        elementA.className = 'item';
        body.appendChild(elementA);
        let spanB = document.createElement('div');
        spanB.className = 'item';
        spanB.innerText = '是否确定要下发指令通知?';
        elementA.appendChild(spanB);
        let buttonA = document.createElement('button');
        buttonA.className = 'buttonA';
        buttonA.id = 'buttonA';
        buttonA.innerText = '确定';
        body.appendChild(buttonA);
        let buttonB = document.createElement('buttonB');
        buttonB.className = 'buttonB';
        buttonB.id = 'buttonB';
        buttonB.innerText = '取消';
        body.appendChild(buttonB);
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
        const { drawGps, IconAlertCenter } = this.state;
        HGis.disableEditDraw(HMap);
        this.props.form.validateFields((err, fieldsValue) => {
            if (err) return;
            // _self.setState({
            //     dkloading: true,
            // });
            let coordinates = [Number(drawGps[0]), Number(drawGps[1])];
            let markOptions2 = {
                id: 'pointsS',
                url: './image/jqicon_5.png',
                coordinates: [
                    [coordinates[0] - 0.01, coordinates[1] + 0.0072],
                    [coordinates[0] + 0.01, coordinates[1] + 0.0072],
                    [coordinates[0] + 0.01, coordinates[1] - 0.0072],
                    [coordinates[0] - 0.01, coordinates[1] - 0.0072],
                ],
            };
            HGis.addImageLayer(HMap, markOptions2);
            // this.props.dispatch({
            //     type: 'otherIndex/getHullByPoint',
            //     payload: {
            //         fromLon: drawGps && drawGps[0] ? drawGps[0].toString() : '',
            //         fromLat: drawGps && drawGps[1] ? drawGps[1].toString() : '',
            //         association_organization_id: JSON.parse(sessionStorage.getItem('user')).group
            //             .parentId,
            //         brother_status: false,
            //         children_status: true,
            //         label_organization_code: JSON.parse(sessionStorage.getItem('user')).group.code,
            //         label_organization_id: JSON.parse(sessionStorage.getItem('user')).group.id,
            //         label_type: [0],
            //         parent_status: false,
            //     },
            //     callback: res => {
            //         if (!res.reason) {
            //             if (res.result && res.result.pointPd) {
            //                 let list = res.result.pointPd;
            //                 _self.getShowBkArea(drawGps, list);
            //                 _self.handleCancels(true);
            //             }
            //         } else {
            //             message.warn('操作失败，请重试');
            //             this.setState({
            //                 dkloading: false,
            //             });
            //         }
            //     },
            // });
        });
    };
    //警情信息构造函数
    warningRender = (files, warnings) => {
        var _self = this;
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
        spanB.innerText = files.bjlxmc ? files.bjlxmc : files.bjlxdm ? files.bjlxdm : '';
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
            (files.bjlbmc ? files.bjlbmc : files.bjlbdm ? files.bjlbdm : '') +
            `${files.bjlxdm == null ? '' : `-${files.bjlxmc ? files.bjlxmc : files.bjlxdm}`}` +
            `${files.bjxldm == null ? '' : `-${files.bjxlmc ? files.bjxlmc : files.bjxldm}`}`;
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
        spanB.innerText = files.gxdwmc ? files.gxdwmc : files.gxdwdm;
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
        body.appendChild(elementA);
        if (files.cjrxm || files.cjsj || files.cjqk || files.fksj) {
            var elementA = document.createElement('div');
            elementA.className = 'borderLine';
            body.appendChild(elementA);
        }
        if (files.cjrxm) {
            var elementA = document.createElement('div');
            elementA.className = 'item';
            body.appendChild(elementA);
            var spanA = document.createElement('div');
            spanA.className = 'title';
            spanA.innerText = '处警人姓名 ：';
            elementA.appendChild(spanA);
            var spanB = document.createElement('div');
            spanB.className = 'text';
            spanB.innerText = files.cjrxm || '';
            elementA.appendChild(spanB);
        }
        if (files.cjsj) {
            var elementA = document.createElement('div');
            elementA.className = 'item';
            body.appendChild(elementA);
            var spanA = document.createElement('div');
            spanA.className = 'title';
            spanA.innerText = '处警时间 ：';
            elementA.appendChild(spanA);
            var spanB = document.createElement('div');
            spanB.className = 'text';
            spanB.innerText = files.cjsj || '';
            elementA.appendChild(spanB);
        }
        if (files.cjqk) {
            var elementA = document.createElement('div');
            elementA.className = 'item';
            body.appendChild(elementA);
            var spanA = document.createElement('div');
            spanA.className = 'title';
            spanA.innerText = '处警情况 ：';
            elementA.appendChild(spanA);
            var spanB = document.createElement('div');
            spanB.className = 'text';
            spanB.innerText = files.cjqk || '';
            elementA.appendChild(spanB);
        }
        if (files.fksj) {
            var elementA = document.createElement('div');
            elementA.className = 'item';
            body.appendChild(elementA);
            var spanA = document.createElement('div');
            spanA.className = 'title';
            spanA.innerText = '反馈时间 ：';
            elementA.appendChild(spanA);
            var spanB = document.createElement('div');
            spanB.className = 'text';
            spanB.innerText = files.fksj || '';
            elementA.appendChild(spanB);
        }
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
        if (buttonA) {
            buttonA.onclick = () => {
                _self.setState(
                    {
                        // drawGps:  _self.gcj02towgs84(Number(files.xzb), Number(files.yzb)),
                        drawGps: [Number(files.xzb), Number(files.yzb)],
                        // isWd: true,
                        zltzRecord: { bt: files.afdd + '发生警情', nr: files.bjnr },
                    },
                    () => {
                        _self.handleCreateModalVisible(true);
                        warnings.innerHTML = '';
                        _self.setState({
                            isCar: true,
                        });
                        // _self.handleOk();
                    },
                );
                // _self.getShowBk();
            };
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
        this.setState({
            needX: event.clientX - this.disX - 150,
            needY: event.clientY - this.disY - 20,
        });
    };
    fnUp = () => {
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
        this.setState({
            previewImage: file.url || file.preview,
            previewVisible: true,
        });
    };

    handleChange = ({ fileList }) => this.setState({ filePersonList: fileList });
    handleChanges = ({ fileList }) => this.setState({ fileCarList: fileList });
    onEditRecordCreate = (e, that) => {
        if (e.record.type == 2 || e.record.type == 3) {
            that.setState(
                {
                    drawGps: e.record.features[0].geometry.coordinates,
                },
                () => {
                    // that.getShowBk();
                    document.getElementById('dk-content').innerHTML = '';
                    that.handleCreateModalVisible(true);
                    that.handleOk();
                },
            );
        }
        // record结果说明如下：
        // {
        //     type:0,/*操作类型：0-无、1-删除、2-修改、3-新增、4-替换*/
        //     action:0,/*更新操作行为：0-无、1-图形移动、2-更改图形形状点、3-更改properties*/
        //     features:[],/*本次操作后的features*/
        //     prevFeatures[] /*本次操作前的features*/
        // }

        e.record;
    };
    drawPoint = () => {
        // 添加一个绘制的线使用的layer
        let _self = this;
        _self.setState({
            isWd: true,
            totalPointShow:false,
            tjtp:this.state.tj2,
        });
        HMap.map.getCanvas().style.cursor = 'copy';
        let options = {
            trackPointer: true,
            popupOptions: {
                closeButton: false,
                closeOnClick: false,
                offset: [0, 30],
            },
        };
        if (!dkWarning) {
            dkWarning = HGis.addPopup(HMap, options);
        }
        let warnings = document.getElementById('dk-content');
        let warningBody = document.getElementById('dk');
        warnings.innerHTML = '';
        var body = document.createElement('div');
        body.className = 'dkBody';
        body.style.backgroundImage = "url('./image/jqicon_6.png')";
        warnings.appendChild(body);
        HGis.setElementHTMLElement(HMap, dkWarning, warningBody);
        HGis.addElementToMap(HMap, dkWarning);
        this.setState({
            drawType: 'Point',
            determine: 'new',
            limit: true,
            createBtn: false,
            isCancel: false,
        });
        HGis.enableEditDraw(HMap);
        HGis.onEditCtrlActive(HMap, 'icon', {
            iconImage: this.state.IconAddId,
            iconSize: 1,
            iconRotate: 0,
        });
    };
    totalPoint = () => {
        this.setState({
            totalPointShow:!this.state.totalPointShow,
        },()=>{
            this.setState({
                tjtp:this.state.totalPointShow?this.state.tj:this.state.tj2
            })
        })
    }
    getQxBk = () => {
        this.handleCancels(false);
        document.getElementById('dk-content').innerHTML = '';
        HGis.removeLayer(HMap, 'pointCenter');
        HGis.removeLayer(HMap, 'pointsF');
        HGis.removeLayer(HMap, 'pointsS');
        HGis.removeLayer(HMap, 'pointsT');
        HGis.removeLayer(HMap, 'pointsFLine');
        HGis.removeLayer(HMap, 'pointsSLine');
        HGis.removeLayer(HMap, 'pointsTLine');
        HGis.removeLayer(HMap, 'pointsFIcon');
        HGis.removeLayer(HMap, 'pointsSIcon');
        HGis.removeLayer(HMap, 'pointsTIcon');
        let zlContent = document.getElementById('zl-content');
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
    // 关闭对讲机呼叫模态框
    handleInterComCancel = () => {
        this.setState({
            ShowInterComModalVisible: false,
        });
    };
    // 跳转到详情
    chooseDetail = (classify,name) => {
        this.props.dispatch(
            routerRedux.push({
              pathname: '/logistics',
              state: {
                label:classify,
                labelName:name,
              },
            }),
        );
    };
    render() {
        const {
            instruction: { useList, vehicleCode },
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
                          fsdwbm:
                              JSON.parse(sessionStorage.getItem('user')).department ==
                              '230104000000'
                                  ? '230104510000'
                                  : '',
                          fsjcs: vehicleCode.length > 0 ? [vehicleCode[0].vehicle_id] : [],
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
                          fsdwbm:
                              JSON.parse(sessionStorage.getItem('user')).department ==
                              '230104000000'
                                  ? '230104510000'
                                  : '',
                          fsjcs: vehicleCode.length > 0 ? [vehicleCode[0].vehicle_id] : [],
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
                          fsdwbm:
                              JSON.parse(sessionStorage.getItem('user')).department ==
                              '230104000000'
                                  ? '230104510000'
                                  : '',
                          fsjcs: vehicleCode.length > 0 ? [vehicleCode[0].vehicle_id] : [],
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
            totalPointShow,
            logisList,
            expressList,
            codeChainList,
            coldStorageList,
            farmMarketList,
            tjtp,
            logisListNum,
            expressListNum,
            codeChainListNum,
            coldStorageListNum,
            farmMarketListNum,
            showOtherPlaceListNum,
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
                <audio src="audio/audio.mp3" controls="controls" hidden="true" ref="music" />
                <div className={styles.main}>
                    {totalPointShow?
                        <div className={styles.totalStyle}>
                            <ul>
                                <li onClick={()=>this.chooseDetail('logis','物流')}>
                                    <div className={styles.NumStyle}>{logisListNum}</div>
                                    <div className={styles.NameStyle}>物流</div>
                                </li>
                                <li onClick={()=>this.chooseDetail('express','快递')}>
                                    <div className={styles.NumStyle}>{expressListNum}</div>
                                    <div className={styles.NameStyle}>快递</div>
                                </li>
                                <li onClick={()=>this.chooseDetail('codeChain','冷链运输')}>
                                    <div className={styles.NumStyle}>{codeChainListNum}</div>
                                    <div className={styles.NameStyle}>冷链运输</div>
                                </li>
                                <li onClick={()=>this.chooseDetail('coldStorage','冷库')}>
                                    <div className={styles.NumStyle}>{coldStorageListNum}</div>
                                    <div className={styles.NameStyle}>冷库</div>
                                </li>
                                <li onClick={()=>this.chooseDetail('farmMarket','农贸市场')}>
                                    <div className={styles.NumStyle}>{farmMarketListNum}</div>
                                    <div className={styles.NameStyle}>农贸市场</div>
                                </li>
                            </ul>
                        </div>
                        :''
                    }

                    <img src={hylink} className={styles.hylinkLogo} />
                    {!this.state.isWd ? (
                        <nav className={styles.nav} style={isRightHide ? { right: 350 } : {}}>
                            <input type="checkbox" className={styles.nav__cb} id="menu-cb" />
                            <div className={styles.nav__content}>
                                <ul className={styles.nav__items}>
                                    <li className={styles.nav__item}>
                                        <Tooltip placement="top" title={'统计'}>
                                            <img src={tjtp} onClick={this.totalPoint} />
                                        </Tooltip>
                                    </li>
                                    <li className={styles.nav__item} style={{width:1,height:'100%',position:'relative'}}>
                                        <div style={{background:'#40B8FD',opacity:0.5,width:1,height:18,position:'absolute',left:0,top:'50%',marginTop:'-9px'}}></div>
                                    </li>
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
                            <div id="dk" className={styles.olpopup}>
                                <div id="dk-content" />
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
                                vehicleState={false}
                                vehicleDetailInfor={this.state.vehicleDetailInfor}
                            />
                            {/* <LeaderDuty vehicleState={this.state.vehicleState} /> */}
                            {/*{this.state.vehicleState ? (*/}
                            {/*    <LeaderDuty />*/}
                            {/*) : (*/}
                            <WarningList
                                alarmList={this.state.alarmList}
                                checkAlarmDetails={e => this.checkAlarmDetails(e)}
                                warningDk={this.warningDk}
                            />
                            {/*)}*/}
                            <Called
                                checkPoliceDetails={e => this.checkPoliceDetails(e)}
                                policeAlarmCounts={
                                    // this.state.vehicleState
                                    //     ? this.props.otherIndex.alarmList
                                    //     :
                                    this.state.policeAlarmCounts
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
                            {/*{this.state.vehicleState ? (*/}
                            {/*    <Equipment />*/}
                            {/*) : (*/}
                            <SnapList
                                // toSnap={() => {}}
                                captureData={this.state.captureList}
                                showDetail={type => {
                                    if (type == '1') {
                                        this.setState({ showSnapVe: true, showSnapPe: false });
                                    } else {
                                        this.setState({ showSnapPe: true, showSnapVe: false });
                                    }
                                }}
                            />
                            {/*)}*/}
                        </div>
                    </div>
                    {this.state.vehicleState ? null : (
                        <SearchEngine
                            checkSearchDetails={(e, g) => this.checkSearchDetails(e, g)}
                            resetRender={() => this.closeSearchDetails()}
                            isLeftHide={this.state.isLeftHide}
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
                        isRightHide={this.state.isRightHide}
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
                                // warnings.innerHTML = ''
                                this.setState({
                                    vehicleState: false,
                                    showTrajectory: false,
                                    vehicleid: '',
                                });
                                // this.checkPoliceDetails()
                                // this.state.showTrajectoryVector.setSource(null);
                                // this.state.sourceTrajectory.clear();
                                content.innerHTML = '';
                                // HGis.removePopup(HMap,popupCar);
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
                {this.state.ShowInterComModalVisible ? (
                    <ShowInterComModal
                        visible={this.state.ShowInterComModalVisible}
                        handleInterComCancel={this.handleInterComCancel}
                        InterComMachine={this.state.InterComMachine}
                    />
                ) : (
                    ''
                )}
            </div>
        );
    }
}

export default Form.create()(OtherIndex);
