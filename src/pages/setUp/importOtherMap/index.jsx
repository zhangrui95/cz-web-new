// 全部重点路口
// Author: jhm
// Date: 20201215

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
    Select,
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
    };

    componentDidMount() {
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
        if (e.record.type == 2 || e.record.type == 3) {
            that.setState({
                createBtn: true,
                isCancel: false,
                drawGps: e.record.features[0].geometry.coordinates,
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
        e.record;
    };
    // 获取网格
    getGpsList = (e, obj) => {
        console.log('获取网格');
        const { dispatch } = this.props;
        const { treeValue } = this.state;
        // console.log('发送获取网格');
        dispatch({
            type: 'createService/getAllGpsList',
            payload: {
                gxdwdm: e ? e : '',
                crossFlag: obj ? obj : [],
            },
            success: files => {
                this.initLayers();
                console.log('获取成功', files);
                if (files.result) {
                    this.showPoint(files.result.list);
                } else {
                    return false;
                }
            },
        });
    };
    // 初始化地图
    initMap = () => {
        const mapOptions = initOtherView();
        HMap = HGis.initMap(
            window.configUrl.mapType,
            'map',
            mapOptions,
            window.configUrl.mapServerUrl,
        );
        edit = HGis.initMapEdit(HMap, {
            boxSelect: true,
            touchEnabled: true,
            displayControlsDefault: true,
            showButtons: false,
        });
        HGis.disableEditDraw(HMap);
        let IconAdd = HGis.makeIcon(HMap, {
            iconUrl: './image/sysmark_1.png',
        });
        let Icon = HGis.makeIcon(HMap, {
            iconUrl: './image/qz1.png',
        });
        this.setState({
            view: HMap.map,
            IconAddId: IconAdd.id,
            Icon,
        });
        this.getPopUp('point');
        let _self = this;
    };
    //鼠标划过提示
    getPopUp = type => {
        console.log('type', type);
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
        spanA.innerText =
            '经度：' + (files.gps[0] || '') + '\n' + '纬度：' + (files.gps[1] || '') + '\n';
        elementA.appendChild(spanA);
        body.appendChild(elementA);
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
            iconSize: 0.2,
        };
        if (files) {
            const { view, showVectorPoint, map, vector, source, draw } = this.state;
            HGis.removeLayer(HMap, 'point');
            for (var i = 0; i < files.length; i++) {
                if (files[i]['X'] && files[i]['Y']) {
                    files[i]['gps'] = [files[i]['X'], files[i]['Y']];
                    if (longrg.test(files[i]['X']) && latreg.test(files[i]['Y'])) {
                        markOptions.data.push({
                            coordinate: files[i]['gps'],
                            properties: {
                                title: '',
                                type: 'Point',
                                layer: files[i],
                            },
                        });
                    }
                }
            }
            HGis.addMarkLayer(HMap, this.state.Icon, markOptions);
        }
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
    // 选择街道
    selectStreet = obj => {
        console.log('obj', obj);
        const { treeValue } = this.state;
        this.getGpsList(treeValue, obj);
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

        // 进行数组扁平化处理
        generateList(this.props.createService.useList);
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
                        <div>
                            <Select
                                mode="multiple"
                                allowClear
                                style={{ width: '100%' }}
                                placeholder="请选择街道级别"
                                // defaultValue={}
                                onChange={this.selectStreet}
                            >
                                <Option key="0">0级街道</Option>
                                <Option key="1">1级街道</Option>
                                <Option key="2">2级街道</Option>
                                <Option key="3">3级街道</Option>
                            </Select>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }
}

export default Form.create()(Organization);
