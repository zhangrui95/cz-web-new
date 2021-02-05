/*!
 * configUrl.js
 * author:ghn
 * date: 2019/10/11
 */

// 必须修改，服务器地址，不带http://
// const ip = '192.168.104.213';//本、地
// const ip = '192.168.104.88'; //本、地
const ip = '192.168.104.137'; //本、地
// const ip = '192.168.104.237'; //本、地
// const ip = '192.168.104.223'; //本、地
// const ips = '192.168.3.100';
// const ip = '172.17.224.6' //本、地
const ips = '172.17.224.6';
const personip = '192.168.3.98';
const calloutIp = '127.0.0.1'; // 对讲机通信协议Ip
// const personip = '10.113.129.222';

// 开发模式地址
const developConfigUrl = {
    // 不需要更改，系统标题
    sysName: '智慧车载系统',
    // 不需要更改，系统页面底部展示内容
    footName: '哈尔滨海邻科信息技术有限公司',
    /**
     *  header 标题
     */
    name: '可视化综合指挥平台', //车载标版
    //   name:'可视化指挥平台',     //街面
    iStreet: true, //街面 true  车载标版 false
    // 版本号，
    version: 'r1.0.0.200331',

    /*
     **地图配置
     */
    // mapServerUrlScreen:'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}',
    mapServerUrlScreen: 'http://mt2.google.cn/vt/lyrs=h&scale=2&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}',
    mapServerUrl: 'http://mt2.google.cn/vt/lyrs=m&scale=2&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}', //谷歌地图
    isNetwork: true, //谷歌地图路径与服务器切换  false为谷歌center

    zoom: 14, //当前层级
    maxZoom: 17, //最大层级
    minZoom: 4, //最小层级
    aggregationNum: 15, //地图点聚合层级
    domainUrl: '//minedata.cn' /* MineMap根域名地址 */,
    dataDomainUrl: '//datahive.minedata.cn' /* MineMap矢量数据服务根域名地址 */,
    spriteUrl: '//minedata.cn/minemapapi/v2.1.0/sprite/sprite' /* MineMap底图雪碧图地址 */,
    serviceUrl: '//mineservice.minedata.cn/service/' /* MineMap后台服务根地址 */,
    appKey: 'e0f6705fa74e4d648cdd968078722d7c' /* MineMap key */,
    solution: 14242,
    style: '//mineservice.minedata.cn/service/solu/style/id/14242' /* 底图样式 */,
    TrafficUrl: 'minemapdatad://Trafficrtic/{z}/{x}/{y}/' /* 实时路况 */,
    // domainUrl: "//35.33.32.246:21009", /* MineMap根域名地址 */
    // dataDomainUrl: "//35.33.32.246:21009",/* MineMap矢量数据服务根域名地址 */
    // spriteUrl: "//35.33.32.246:21009/minemapapi/v2.1.0/sprite/sprite",/* MineMap底图雪碧图地址 */
    // serviceUrl: "//35.33.32.246:21009/service/",/* MineMap后台服务根地址 */
    // appKey: "a839dd7409a24d668502b64498f908a5",/* MineMap key */
    // solution: 12650,
    // style: "//35.33.32.246:21009/service/solu/style/id/12650", /* 底图样式 */
    /*
     ** 请求地址
     */

    serverUrl: `http://${ip}:7702`, //本地 接口请求地址
    personcarserverUrl: `http://${personip}:7005`, //核查记录人员、车辆服务
    // serverUrl: `http://172.17.224.6:9000/zhbf-service`,//本地 接口请求地址
    // serverUrl: `http://${ip}:9000/gacz-backstage-service`, // 互联网 接口请求地址
    heartbeatInterval: 10, //websocket 心跳时间
    websocketUrl: `ws://${ip}:7702/ws/homePage`, //本地 首页websocket
    websocketNew: `ws://${ip}:7702/ws/homePageNew`, //本地  新首页websocket
    websocketBig: `ws://${ip}:7702/ws/homePageBig`, //本地 websocket
    // websocketUrl: `ws://${ip}:9000/webSocket/ws/homePage`, //互联网 首页websocket
    // websocketNew: `ws://${ip}:9000/webSocket/ws/homePageNew`, //互联网 新首页websocket
    // websocketBig: `ws://${ip}:9000/webSocket/ws/homePageBig`, //互联网大屏 websocket
    localhostMqttUrl: 'ws://localhost:9001/mqtt', //本地MQTT地址
    mqttUrl: `ws://${ips}:8083/mqtt`, //预警信息MQTT
    pid: `http://${ips}:9000/ywzx/api`, //运维中心地址  查询字典地址
    logUrl: `${ip}`, //登录日志地址
    securityCenterUrl: `http://${ips}:9000/aqzx/api`, // 安全中心地址
    // securityCenterUrl: `http://192.168.3.249:8100`, // 安全中心地址
    interComUrl: `http://${calloutIp}:8600`, // 对讲机通讯ip
    isgetLine:true, // 判断勤务管理中自动巡逻路线的点和线是否通过接口获取；true:通过接口，false:暂时前端写死

    /**
     * pid => code
     */
    dictionariesVehicle: '5018701', //车辆状态
    dictionariesStreaming: '5018702', //码流格式
    dictionariesConfiguration: '5018703', //主机配置模块
    dictionariesSnap: '5018704', //抓拍类型
    dictionariesCapture: '5018705', //抓拍设备厂商
    dictionariesDevice: '5018706', //设备类型
    dictionariesPolice: '5018901', //警力类型
    dictionariesEquipmentType: '5018902', //装备类型
    dictionariesEquipmentState: '5018903', //装备状态
    dictionariesControlPeople: '100', //临控人员
    dictionariesControlVehicle: '101', //临控车辆
    dictionariesRisk: '501701', //风险等级
    dictionariesFile: '501703', //档案类型
    dictionariesBelongings: '501704', //随身物品
    edzxx: '50170301', //二代证信息
    jszxx: '50170302', //驾驶证信息
    czrkxx: '50170303', //常驻人口信息
    zzrkxx: '50170304', //暂住人口信息
    hcyxx: '50170305', //户成员信息
    qgzt: '50170306', //全国在逃
    qlzdr: '50170307', //七类重点人
    xjxx: '50170308', //刑拘信息
    wzxx: '50170309', //违章信息
    jtcyxx: '50170310', //家庭成员信息
    shgx: '50170311', //社会关系
    zsxx: '50170312', //住宿信息
    jdcxx: '50170313', //机动车信息
    xfjl: '50170314', //消费记录
    tlxx: '50170315', //铁路信息
    /**
     *  设备code
     */
    cameraCode: '5011701', //  相机
    videoHostCode: '5011702', //  视频主机
    nvrCode: '5011703', //  nvr
    ableCode: '5011704', //  车台
    boardHostCode: '5011705', //  车载主机
    captureDeviceCode: '5011706', //  抓拍设备
    lightsCode: '5011707', //  警灯
    boardTabletCode: '5011708', //  车载平板
    lightTime: ['06:00', '20:00'], //白天默认值
    darkTime: ['20:00', '06:00'], //夜晚默认值
    mapType: 'minemap', //'pgis,leaflet,openlayers,minemap'地图类型
    isPlay: true, //警情音频播放
    // window.configUrl.boardTabletCode
};

window.configUrl = developConfigUrl;
// window.carNum = e =>{
//     if(e == '230103000000' || e == '230103630000'){
//         return 4;
//     }else{
//         return 16;
//     }
// }
window.mapCenter = e => {
    if (e == '310000000000') {
        return [121.4739, 31.2301]; //上海地图默认中心位置
    } else if (e == '440300000000') {
        return [113.937705, 22.56225]; //深圳地图默认中心位置
    } else if (e == '350100000000') {
        return [119.2971, 26.0741]; //福州地图默认中心位置
    } else if (e == '350200000000') {
        return [118.0897, 24.4798]; //厦门地图默认中心位置
    } else if (e == '330300000000') {
        return [120.6993, 27.9948]; //温州地图默认中心位置
    } else if (e == '110000000000') {
        return [116.3974, 39.9085]; //北京地图默认中心位置
    } else if (e == '330109000000') {
        return [120.2726823, 30.139121]; //萧山区地图默认中心位置（杭州）
    } else if (e == '360100000000') {
        return [115.85823, 28.689121]; //南昌地图默认中心位置
    } else if (e == '230103000000' || e == '230103630000') {
        return [126.65121674537659, 45.75784795132964]; //南岗区荣市派出所
    } else if (e == '230109000000' || e == '230109600000') {
        return [126.50979995727539, 45.804355159885034]; //祥安大街派出所警务室
    } else {
        return [126.64450854063031, 45.778747557938516]; //黑龙江地图默认中心位置
    }
};
window.mapUrl = e => {
    if (e == '310000000000') {
        return `http://${ips}:9000/map/shanghai/{z}/{x}/{y}.png`; //上海地图˘
    } else if (e == '440300000000') {
        return `http://${ips}:9000/map/shenzhen/{z}/{x}/{y}.png`; //深圳地图˘
    } else if (e == '350100000000') {
        return `http://${ips}:9000/map/fuzhou/{z}/{x}/{y}.png`; //福州地图˘
    } else if (e == '350200000000') {
        return `http://${ips}:9000/map/xiamen/{z}/{x}/{y}.png`; //厦门地图˘
    } else if (e == '330300000000') {
        return `http://${ips}:9000/map/wenzhou/{z}/{x}/{y}.png`; //温州地图˘
    } else if (e == '110000000000') {
        return `http://${ips}:9000/map/beijing/{z}/{x}/{y}.png`; //北京地图˘
    } else if (e == '330109000000') {
        return `http://${ips}:9000/map/hangzhou/{z}/{x}/{y}.png`; //杭州地图˘
    } else {
        return `http://${ips}:9000/map/heilongjiang/{z}/{x}/{y}.png`; //黑龙江地图
    }
};
