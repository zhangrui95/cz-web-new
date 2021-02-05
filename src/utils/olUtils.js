// const DateUtil = require('./Date');
// const Configuration = require('./Configuration');
// const Authority = require('./Authority');
// const Utils = require('./Utils');
// import {
//     DRAW_TYPE,
//     PEOPLE_TYPE,
//     GROPU_TYPE,
//     MAP_CENTER_LOCATION
// } from '../utils/constant';
import ol from 'openlayers';
import { MAP_CENTER_LOCATION } from './Constants';
// import $ from 'jquery';

// 初始化视图
export function initView() {
    // 定义赌徒的中心位置，范围和图层
    let cer = window.mapCenter(
        JSON.parse(sessionStorage.getItem('user'))
            ? JSON.parse(sessionStorage.getItem('user')).department
            : '',
    );

    return new ol.View({
        // 设置地图中心范围  [minX, minY, maxX, maxY]
        // extent: [124.59, 46.46, 125.36, 46.75],
        // 将一个经纬度坐标转换成当前地图投影的坐标
        center: ol.proj.fromLonLat(cer), // 百度地图拾取坐标位置
        // projection: 'EPSG:4326', //转换
        projection: 'EPSG:3857', // 转换
        zoom: window.configUrl.zoom,
        maxZoom: window.configUrl.maxZoom,
        minZoom: window.configUrl.minZoom,
    });
}
// 初始化其他地图视图
export function initOtherView() {
    // 定义赌徒的中心位置，范围和图层
    let cer = window.mapCenter(
        JSON.parse(sessionStorage.getItem('user'))
            ? JSON.parse(sessionStorage.getItem('user')).department
            : '',
    );
    return {
        minemapOption: {
            domainUrl: window.configUrl.domainUrl || '//minedata.cn',
            dataDomainUrl: window.configUrl.dataDomainUrl || '//datahive.minedata.cn',
            // spriteUrl: window.configUrl.spriteUrl || "//minedata.cn/minemapapi/v2.1.0/sprite/sprite",
            serviceUrl: window.configUrl.serviceUrl || '//mineservice.minedata.cn/service/',
            appKey: window.configUrl.appKey || 'e0f6705fa74e4d648cdd968078722d7c',
            solution: window.configUrl.solution || 14242,
            style:
                window.configUrl.style ||
                '//mineservice.minedata.cn/service/solu/style/id/14242' /* 底图样式 */,
        },
        center: cer, // 地图中心//[126.5300002679, 45.8002383102]
        zoom: window.configUrl.zoom, //缩放比列
        pitch: 0,
        maxZoom: window.configUrl.maxZoom,
        minZoom: window.configUrl.minZoom,
    };
}

// 离线瓦片地图图层
export function offlineMapLayer() {
    // 定义了一个图层数据来源提供的切片数据

    return new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: window.configUrl.isNetwork
                ? window.mapUrl(
                      JSON.parse(sessionStorage.getItem('user'))
                          ? JSON.parse(sessionStorage.getItem('user')).department
                          : '',
                  )
                : window.configUrl.mapServerUrl,
            // url: "http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}"
        }),
    });
}
// 离线瓦片地图图层  大屏
export function offlineMapLayerScreen() {
    // 定义了一个图层数据来源提供的切片数据
    return new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: window.configUrl.mapServerUrlScreen,
            // url: "http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}"
        }),
    });
}

// 添加标注、辖区图层
export function initDrawLayer() {
    return new ol.layer.Vector({
        source: null,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(224,156,25, 0.0)',
            }),
            stroke: new ol.style.Stroke({
                color: '#2b81ff',
                width: 3,
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#FF0000',
                }),
            }),
        }),
    });
}

// 选定机构显示图层
export function initShowVector() {
    return new ol.layer.Vector({
        source: null,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(83,88,253, 0.0)',
            }),
            stroke: new ol.style.Stroke({
                color: '#5358FD',
                width: 4,
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#FF0000',
                }),
            }),
        }),
    });
}
// 选定机构显示图层(点)
export function initShowVectorPoint() {
    return new ol.layer.Vector({
        source: null,
        style: new ol.style.Style({
            image: new ol.style.Icon({
                scale: 1.1, // 图标缩放比例 // 0为离线其他为在线
                src: './image/sysmark_1.png', // 图标的url
            }),
        }),
    });
}

// 选定机构父级显示图层
export function initShowVectorP() {
    return new ol.layer.Vector({
        source: null,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                // 矢量图层填充颜色，以及透明度
                color: 'rgba(255, 255, 255, 0.0)',
            }),
            stroke: new ol.style.Stroke({
                // 边界样式
                color: '#ff8300',
                width: 3,
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#F083FC',
                }),
            }),
        }),
    });
}

// 高亮警员位置样式
export function highlightPeopleLocationStyle(feature, type) {
    // console.log("---------type:",type);
    let url = '/images/ol/map_sd.png';
    if (type === 1) {
        // 当前位置
        url = '/images/ol/man2_b.png';
    } else if (type === 2) {
        // 驻巡点
        url = '/images/ol/map_jws.png';
    } else if (type === 3) {
        // 休息点
        url = '/images/ol/map_sd.png';
    }
    return new ol.style.Style({
        image: new ol.style.Icon(
            /** @type {olx.style.IconOptions} */ {
                scale: 1.5, // 图标缩放比例
                src: url, // 图标的url
            },
        ),
        text: new ol.style.Text({
            textAlign: 'center', // 位置
            textBaseline: 'middle', // 基准线
            font: 'normal 20px 微软雅黑', // 文字样式
            text: feature.get('name'), // 文本内容
            offsetX: '45',
            fill: new ol.style.Fill({
                color: '#0b54c0',
            }), // 文本填充样式（即文字颜色）
            stroke: new ol.style.Stroke({
                color: '#ffffff',
                width: 4,
            }),
        }),
    });
}

export function routeStyle(feature) {
    return new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#00978F',
            width: 4,
        }),
    });
}
// 起点样式
export function beginStyle(feature) {
    return new ol.style.Style({
        image: new ol.style.Icon(
            /** @type {olx.style.IconOptions} */ {
                anchor: [0.5, 38],
                anchorOrigin: 'top-right',
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                offsetOrigin: 'top-right',
                scale: 1.5,
                src: '/images/ol/begin.png', // 图标的url
            },
        ),
    });
}
// 终点样式
export function endStyle(feature) {
    return new ol.style.Style({
        image: new ol.style.Icon(
            /** @type {olx.style.IconOptions} */ {
                anchor: [0.5, 38],
                anchorOrigin: 'top-right',
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                offsetOrigin: 'top-right',
                scale: 1.5,
                src: '/images/ol/end.png', // 图标的url
            },
        ),
    });
}

/**
 *  单位辖区样式
 *  @param feature
 *  @flag  单位级别  1省、2市局、3分局、4所对、5警务室
 *  */
export function groupAreaStyle(feature, flag) {
    console.log("---------feature.get('name'):", feature.get('name'));
    const color = '#2b81ff';
    const fillColor = 'rgba(43,129,255, 0.2)';

    return new ol.style.Style({
        fill: new ol.style.Fill({
            color: fillColor,
        }),
        stroke: new ol.style.Stroke({
            color,
            width: 3,
        }),
        text: new ol.style.Text({
            textAlign: 'center', // 位置
            textBaseline: 'middle', // 基准线
            font: 'bold 22px 微软雅黑', // 文字样式
            text: feature.get('name'), // 文本内容 辖区名称展示
            fill: new ol.style.Fill({
                color,
            }), // 文本填充样式（即文字颜色）
            stroke: new ol.style.Stroke({
                color: '#ffffff',
                width: 1,
            }),
        }),
    });
}

// 高亮警情位置样式
export function highlightAlarmStyle(feature, type) {
    // console.log("---------type:",type);
    let url = '/images/ol/b_9.png';
    if (type === 4) {
        // 待签收
        url = '/images/ol/4.png';
    } else if (type === 5) {
        // 待确认
        url = '/images/ol/b_5.png';
    } else if (type === 6) {
        // 待处置
        url = '/images/ol/b_6.png';
    } else if (type === 0) {
        // 当前选择的警情
        url = '/images/ol/b_0.png';
    }
    // console.log("---------type:",url);
    return new ol.style.Style({
        image: new ol.style.Icon(
            /** @type {olx.style.IconOptions} */ {
                scale: 1.3, // 图标缩放比例
                src: url, // 图标的url
            },
        ),
    });
}

// 高亮警车位置样式
export function highlightCarLocationStyle(type) {
    // console.log("---------type:",type);
    let url = '../assets/outlineCar.png';
    if (type === 1) {
        // 自己
        url = '../assets/outlineCar.png';
    } else if (type === 2) {
        // 其他在线
        url = '/images/ol/car_online.png';
    } else if (type === 3) {
        // 其他离线
        url = '/images/ol/car_offline.png';
    }
    return new ol.style.Style({
        image: new ol.style.Icon(
            /** @type {olx.style.IconOptions} */ {
                scale: 1.2, // 图标缩放比例
                src: url, // 图标的url
            },
        ),
    });
}

// 单位标注样式
export function createLabelStyle(feature) {
    return new ol.style.Style({
        image: new ol.style.Icon(
            /** @type {olx.style.IconOptions} */ {
                /*            anchor: [0.5, 60],
                        anchorOrigin: 'top-right',
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'pixels',
                        offsetOrigin: 'top-right',
                        offset:[0,10],
                        opacity: 0.75,  //透明度 */
                scale: 1.2, // 图标缩放比例
                src: '/images/ol/fj_p.png', // 图标的url
            },
        ),
        text: new ol.style.Text({
            textAlign: 'center', // 位置
            textBaseline: 'middle', // 基准线
            font: 'normal 14px 微软雅黑', // 文字样式
            text: feature.get('name'), // 文本内容
            fill: new ol.style.Fill({
                color: '#aa3300',
            }), // 文本填充样式（即文字颜色）
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 3,
            }),
        }),
    });
}

/**
 *  单位标注样式
 *  @param feature
 *  @flag  单位级别  1省、2市局、3分局、4所对、5警务室
 *  @type 类型（1：默认，2 文字展示在线/离线/异常人员）
 *  */
export function groupLabelStyle(feature, flag, type = 1) {
    let src = '/images/ol/map_sj.png';
    let textOffsetY = '32';
    let textColor = '#0b54c0';
    if (type === 2) {
        textOffsetY = '75';
        textColor = '#FF4500';
    }
    if (flag === 2) {
        src = '/images/ol/map_sj.png';
    } else if (flag === 3) {
        src = '/images/ol/map_fj.png';
    } else if (flag === 4) {
        src = '/images/ol/map_sd.png';
    }
    return new ol.style.Style({
        image: new ol.style.Icon(
            /** @type {olx.style.IconOptions} */ {
                scale: 1.2, // 图标缩放比例
                src, // 图标的url
            },
        ),
        text: new ol.style.Text({
            textAlign: 'center', // 位置
            textBaseline: 'middle', // 基准线
            // offsetX:'45',
            offsetY: textOffsetY,
            font: 'normal 14px 微软雅黑', // 文字样式
            text: `${feature.get('name')}`, // 文本内容
            fill: new ol.style.Fill({
                color: textColor,
            }), // 文本填充样式（即文字颜色）
            stroke: new ol.style.Stroke({
                color: '#ffffff',
                width: 4,
            }),
        }),
    });
}

// 警员位置样式
export function peopleLocationStyle(feature, type) {
    // let url;
    // if (type === PEOPLE_TYPE.Online) { //在线
    //     url = '/images/ol/point_o.png';
    // } else if (type === PEOPLE_TYPE.Offline) { //离线
    //     url = '/images/ol/point_g.png';
    // }
    // return new ol.style.Style({
    //     image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
    //         /*            anchor: [0.5, 60],
    //                     anchorOrigin: 'top-right',
    //                     anchorXUnits: 'fraction',
    //                     anchorYUnits: 'pixels',
    //                     offsetOrigin: 'top-right',
    //                     offset:[0,10],
    //                     opacity: 0.75,  //透明度*/
    //         scale: 1.2, //图标缩放比例
    //         src: url //图标的url
    //     })),
    //     text: new ol.style.Text({
    //         textAlign: 'center', //位置
    //         textBaseline: 'middle', //基准线
    //         offsetX: '45',
    //         font: 'normal 14px 微软雅黑', //文字样式
    //         text: feature.get('name'), //文本内容
    //         fill: new ol.style.Fill({
    //             color: '#0b54c0'
    //         }), //文本填充样式（即文字颜色）
    //         stroke: new ol.style.Stroke({
    //             color: '#ffffff',
    //             width: 4
    //         })
    //     })
    // });
}

// 高亮组织机构位置样式
export function highlightGroupLocationStyle(feature, type) {
    let url;
    if (type === 'isSelect') {
        // 选中
        url = '/images/ol/fj_b.png';
    } else {
        url = '/images/ol/fj_r.png';
    }
    return new ol.style.Style({
        image: new ol.style.Icon(
            /** @type {olx.style.IconOptions} */ {
                /*            anchor: [0.5, 65],
                        anchorOrigin: 'top-right',
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'pixels',
                        offsetOrigin: 'top-right',
                        opacity: 1,  //透明度
                        offset:[0,10],
                        */
                scale: 1.2, // 图标缩放比例
                src: url, // 图标的url
            },
        ),
        text: new ol.style.Text({
            textAlign: 'center', // 位置
            textBaseline: 'middle', // 基准线
            // offsetX:'45',
            offsetY: '20',
            font: 'normal 14px 微软雅黑', // 文字样式
            text: feature.get('name'), // 文本内容
            fill: new ol.style.Fill({
                color: '#0b54c0',
            }), // 文本填充样式（即文字颜色）
            stroke: new ol.style.Stroke({
                color: '#ffffff',
                width: 4,
            }),
        }),
    });
}
// 组织机构位置样式
export function groupLocationStyle(feature) {
    const url = '/images/ol/point_r.png';
    return new ol.style.Style({
        image: new ol.style.Icon(
            /** @type {olx.style.IconOptions} */ {
                /*            anchor: [0.5, 60],
                        anchorOrigin: 'top-right',
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'pixels',
                        offsetOrigin: 'top-right',
                        offset:[0,10],
                        opacity: 0.75,  //透明度 */
                scale: 1.2, // 图标缩放比例
                src: url, // 图标的url
            },
        ),
        text: new ol.style.Text({
            textAlign: 'center', // 位置
            textBaseline: 'middle', // 基准线
            offsetY: '20',
            font: 'normal 14px 微软雅黑', // 文字样式
            text: feature.get('name'), // 文本内容
            fill: new ol.style.Fill({
                color: '#0b54c0',
            }), // 文本填充样式（即文字颜色）
            stroke: new ol.style.Stroke({
                color: '#ffffff',
                width: 4,
            }),
        }),
    });
}

// 辖区显示样式
export function areaStyle(feature) {
    return new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(224,156,25, 0.0)',
        }),
        stroke: new ol.style.Stroke({
            color: '#2b81ff',
            width: 3,
        }),
        text: new ol.style.Text({
            textAlign: 'center', // 位置
            textBaseline: 'middle', // 基准线
            font: 'bold 14px 微软雅黑', // 文字样式
            text: feature.get('name'), // 文本内容
            fill: new ol.style.Fill({
                color: '#2b81ff',
            }), // 文本填充样式（即文字颜色）
            stroke: new ol.style.Stroke({
                color: '#ffffff',
                width: 1,
            }),
        }),
    });
}

// 巡逻网格显示图层
export function initpatrolGridVector() {
    return new ol.layer.Vector({
        source: null,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#EF1030',
                width: 2,
                lineDash: [1, 2, 3, 4, 5, 6],
            }),
        }),
    });
}
// 巡逻自动线路显示图层
export function initpatrolRoutesVectorZd() {
    return new ol.layer.Vector({
        source: null,
        // style: new ol.style.Style({
        // 	stroke: new ol.style.Stroke({
        // 		color: '#5801a4',
        // 		width: 2,
        // 		// lineDash: [ 1, 2, 3, 4, 5, 6 ]
        // 	})
        // })
    });
}
// 巡逻线路显示图层
export function initpatrolRoutesVector() {
    return new ol.layer.Vector({
        source: null,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#01A472',
                width: 2,
                lineDash: [1, 2, 3, 4, 5, 6],
            }),
        }),
    });
}
// 驻巡点显示图层
export function inittourPointVector() {
    return new ol.layer.Vector({
        source: null,
        style: new ol.style.Style({
            image: new ol.style.Icon({
                scale: 1.1, // 图标缩放比例 // 0为离线其他为在线
                src: './image/syzxd.png', // 图标的url
            }),
        }),
    });
}
// 休息点显示图层
export function initbreakPointVector() {
    return new ol.layer.Vector({
        source: null,
        style: new ol.style.Style({
            image: new ol.style.Icon({
                scale: 1.1, // 图标缩放比例 // 0为离线其他为在线
                src: './image/syxxd.png', // 图标的url
            }),
        }),
    });
}
// 卡口点显示图层
export function bayonetVector() {
    return new ol.layer.Vector({
        source: null,
        style: new ol.style.Style({
            image: new ol.style.Icon({
                src: './image/kakou.png', // 图标的url
            }),
        }),
    });
}
// 对讲机点显示图层
export function intercomVector() {
    return new ol.layer.Vector({
        source: null,
        style: new ol.style.Style({
            image: new ol.style.Icon({
                src: './image/duijiang.png', // 图标的url
            }),
        }),
    });
}

//重点场所
export function placeVector() {
    return new ol.layer.Vector({
        source: null,
        style: new ol.style.Style({
            image: new ol.style.Icon({
                src: './image/zdcs_1.png', // 图标的url
            }),
        }),
    });
}
//警务站
export function initShowStationVector() {
    return new ol.layer.Vector({
        source: null,
        style: new ol.style.Style({
            image: new ol.style.Icon({
                src: './image/jwz.png', // 图标的url
            }),
        }),
    });
}

//视频监控
export function monitoringVector() {
    return new ol.layer.Vector({
        source: null,
        style: new ol.style.Style({
            image: new ol.style.Icon({
                src: './image/spjk_1.png', // 图标的url
            }),
        }),
    });
}
//移动单兵设备
export function individualVector() {
    return new ol.layer.Vector({
        source: null,
        style: new ol.style.Style({
            image: new ol.style.Icon({
                src: './image/yddb_1.png', // 图标的url
            }),
        }),
    });
}
// 车辆点显示图层
export function carVector() {
    return new ol.layer.Vector({
        source: null,
        style: new ol.style.Style({
            image: new ol.style.Icon({
                src: './image/car_on.png', // 图标的url
            }),
        }),
    });
}
// 车辆点显示图层
export function trajectoryVector() {
    return new ol.layer.Vector({
        source: null,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#00B265',
                width: 3,
            }),
            fill: new ol.style.Fill({
                color: '#00B265',
            }),
        }),
    });
}
//首页警车演示 带文字
export function carStyles(type, feature, zoom) {
    // console.log(type)
    let url = './image/car_on.png';
    let colors = '#3778c5';
    let ison = true;
    let num = 0.8;
    if (type == '1') {
        // 在线
        url = './image/car_on.png';
        colors = '#3778c5';
        ison = true;
        num = 0.8;
    } else if (type == '0') {
        // 离线
        url = './image/car_off.png';
        colors = '#666666';
        ison = false;
        num = 0.8;
    } else if (type == '2') {
        // 选中
        url = './image/car_click.png';
        colors = '#3778c5';
        ison = true;
        num = 0.9;
    }

    return new ol.style.Style({
        image: new ol.style.Icon(
            /** @type {olx.style.IconOptions} */ {
                scale: zoom / 20, // 图标缩放比例
                src: url, // 图标的url
            },
        ),
        stroke: new ol.style.Stroke({
            color: '#01A472',
            width: 2,
        }),
        text: new ol.style.Text({
            textAlign: 'center', // 位置
            textBaseline: 'middle', // 基准线
            font: 'normal 12px 微软雅黑', // 文字样式
            text: feature.get('name'), // 文本内容
            // offsetX: '45',
            offsetY: '23',
            fill: new ol.style.Fill({
                color: colors,
            }), // 文本填充样式（即文字颜色）
            stroke: ison
                ? new ol.style.Stroke({
                      color: colors,
                      width: 1,
                  })
                : '',
        }),
    });
}
// 已选择巡逻范围显示图层
export function initSelectedVector() {
    return new ol.layer.Vector({
        source: null,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#00ffff',
                width: 2,
            }),
        }),
    });
}
// 预警点显示图层
export function waringVector() {
    return new ol.layer.Vector({
        source: null,
        // style: new ol.style.Style({
        //     image: new ol.style.Circle({
        //         image: new ol.style.Icon({
        //             src: './image/jingbao.png', // 图标的url
        //             scale: 0.5, // 图标缩放比例
        //         }),
        //         radius: 5,
        //         fill: new ol.style.Fill({
        //             color: 'rgba(255,0,0, 0.8)'
        //         }),
        //         stroke: new ol.style.Stroke({
        //             color: 'rgba(255, 0, 0, 0.8)',
        //             width: 30,
        //             size: 30
        //         })
        //     }),
        //     stroke: new ol.style.Stroke({
        //         color: 'rgba(255,0,0, 0.4)',
        //         width: 30,
        //         size: 30
        //     }),
        //      fill: new ol.style.Fill({
        //         color: 'rgba(255,0,0, 0.4)'
        //     }),
        // }),
    });
}

export function monitoringStyles(feature, zoom, img) {
    // console.log(feature.get('name'),zoom)
    return new ol.style.Style({
        image: new ol.style.Icon(
            /** @type {olx.style.IconOptions} */ {
                scale: zoom / 20, // 图标缩放比例
                src: img, // 图标的url
            },
        ),
        text: new ol.style.Text({
            textAlign: 'center', // 位置
            textBaseline: 'middle', // 基准线
            font: 'normal 16px 微软雅黑', // 文字样式
            text: feature.get('name'), // 文本内容
            // offsetX: '45',
            // offsetY:'23',
            fill: new ol.style.Fill({
                color: '#FF6666FF',
            }), // 文本填充样式（即文字颜色）
            stroke: new ol.style.Stroke({
                color: '#FF6666FF',
                width: 2,
            }),
        }),
    });
}
