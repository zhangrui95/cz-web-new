/*
 * HGis 海邻科通用GIS插件
 * date: 20200713
 * author: lyp
 * version: v1.0
 * */
// import HeatmapOverlay from './leaflet-heatmap';
(function() {
    /** Built-in method references without a dependency on `root`. */
    var freeParseFloat = parseFloat,
        freeParseInt = parseInt;
    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof global == 'object' && global && global.Object == Object && global;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object == Object && self;

    /** Used as a reference to the global object. */
    var root = freeGlobal || freeSelf || Function('return this')();

    /** Detect free variable `exports`. */
    var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule =
        freeExports && typeof module == 'object' && module && !module.nodeType && module;

    var runInContext = function runInContext(context) {
        var hylinkGis = {};
        var EZMarkListener = '';
        var EZMapListener = '';
        var EZMapMarkDragListener = '';
        var xPI = (3.14159265358979324 * 3000.0) / 180.0;
        var PI = 3.1415926535897932384626;
        var a = 6378245.0;
        var ee = 0.00669342162296594323;
        var HGisEdit = null;
        // var HMap = {};
        /**
         * 初始化地图
         * @mapType string ['pgis', 'leaflet', 'minemap']
         * @mapId string
         * @options {
         *    	center: [lng经度, lat纬度]
         *    	zoom: number 初始化缩放层级
         *    	minZoom: number 最小层级
         *    	maxZoom: number 最大层级
         * }
         * @dataUrl string leaflet加载地图接口地址
         */
        function initMap(mapType, mapId, options, dataUrl) {
            //
            var HMap = {};
            HMap.mapType = mapType;
            if (mapType == 'pgis') {
                if (window.EzMap) {
                    var map = new EzMap(mapId, {
                        mapCenter: options.center,
                        mapInitLevel: options.zoom || 16,
                        mapMaxLevel: options.minZoom || 3,
                        mapMinLevel: options.maxZoom || 18,
                    });
                    HMap.map = map;
                } else {
                    console.error('地图初始化失败，未检测到PGIS!');
                }
            } else if (mapType == 'leaflet') {
                if (window.L) {
                    (options.zoomControl = false), //禁用 + - 按钮
                        (options.doubleClickZoom = false), // 禁用双击放大
                        (options.attributionControl = false); // 移除右下角leaflet标识
                    var newOptions = options;
                    newOptions.center = changeToLeafletCoord(options.center);
                    var map = L.map(mapId, newOptions);
                    L.tileLayer(dataUrl).addTo(map);
                    HMap.map = map;
                } else {
                    console.error('地图初始化失败，未检测到leaflet!');
                }
            } else if (mapType == 'minemap') {
                if (window.minemap) {
                    if (options.minemapOption) {
                        minemap.domainUrl = options.minemapOption.domainUrl;
                        minemap.dataDomainUrl = options.minemapOption.dataDomainUrl;
                        minemap.spriteUrl = options.minemapOption.spriteUrl;
                        minemap.serviceUrl = options.minemapOption.serviceUrl;
                        minemap.appKey = options.minemapOption.appKey;
                        minemap.solution = options.minemapOption.solution;

                        var map = new minemap.Map({
                            container: mapId,
                            style: options.minemapOption.style /* 底图样式 */,
                            center: options.center /* 地图中心点 */,
                            zoom: options.zoom || 10 /* 地图默认缩放等级 */,
                            pitch: options.pitch || 10 /* 地图俯仰角度 */,
                            maxZoom: options.maxZoom || 18 /* 地图最大缩放等级 */,
                            minZoom: options.minZoom || 3 /* 地图最小缩放等级 */,
                            logoControl: false,
                        });
                        HMap.map = map;
                    }
                } else {
                    console.error('地图初始化失败，未检测到minemap!');
                }
            }
            return HMap;
        }
        /**
         * 添加标记
         * @option [
         *    coord Array [lng经度, lat纬度]
         *    icon HIcon 自定义图标
         *    bindData: json{} 绑定的数据
         *    onclick: function(pixel, latlng, bindData)
         * ]
         */
        function addMark(HMap, options) {
            var HMarker;
            var icon = options.icon || undefined;
            if (HMap.mapType == 'pgis') {
                var map = HMap.map;
                var coord = options.coord;
                var position = new EzCoord(coord[0], coord[1]);
                var ezTitle = null;
                if (options.title) ezTitle = new EzTitle(options.title, options.style);
                HMarker = new EzMarker(position, icon, ezTitle, options); // 标记
                // if (options.draggable) setPGisMapDraggable(map, true); // 允许地图元素拖拽
                HMarker.bindData = options.bindData || {};
                var clickFn = options.onClick;
                var dragEndFn = options.onDragEnd;
                if (clickFn && typeof clickFn == 'function') {
                    // setEZElementMouseMoveStyle(map, EzMarker)
                    setEZElementMouseClickCallback(map, EzMarker, clickFn);
                }
                if (dragEndFn && typeof dragEndFn == 'function') {
                    // setEZElementMouseMoveStyle(map, EzMarker)
                    setEZElementDragEndCallback(map, EzMarker, dragEndFn);
                }
                var map = HMap.map;
                map.addOverlay(HMarker);
                if (options.title) HMarker.showTitle();
            } else if (HMap.mapType == 'leaflet') {
                let style = options.style
                    ? `'font-size: ${options.style.fontSize}px;color: ${options.style.fontColor};text-align: ${options.style.textAlign};'`
                    : '';
                let myIcon = L.divIcon({
                    html: `<div style=${style}><img style='width:${
                        icon.options.iconSize[0]
                    }px;height:${icon.options.iconSize[1]}px;' src='${icon.options.iconUrl}'/>${
                        options.title ? options.title : ''
                    }</div>`,
                    className: '',
                    iconSize: icon.options.iconSize[0],
                    iconAnchor: icon.options.iconAnchor,
                });
                options.icon = myIcon;
                HMarker = L.marker(changeToLeafletCoord(options.coord), options);
                HMarker.addTo(HMap.map);
                HMarker.bindData = options.bindData || {};
                var clickFn = options.onClick;
                var dragEndFn = options.onDragEnd;
                if (clickFn && typeof clickFn == 'function') {
                    HMarker.on('click', function(ev) {
                        var pixel = [ev.containerPoint.x, ev.containerPoint.y];
                        var lnglat = [ev.latlng.lng, ev.latlng.lat];
                        clickFn(pixel, lnglat, ev.target.bindData);
                    });
                }
                if (dragEndFn && typeof dragEndFn == 'function') {
                    HMarker.on('dragend', function(ev) {
                        var pixel = [ev.sourceTarget._newPos.x, ev.sourceTarget._newPos.y];
                        var lnglat = [ev.target._latlng.lng, ev.target._latlng.lat];
                        dragEndFn(pixel, lnglat, ev.target.bindData);
                    });
                }
            }
            return HMarker;
        }
        /**
         * 设置图标
         * @iconOptions object {
         *	iconUrl: string 本地图片路径
         *   iconSize: [number, number]
         *   iconAnchor: [number, number]
         * }
         *
         */
        function makeIcon(HMap, iconOptions) {
            var HIcon;
            if (HMap.mapType == 'pgis') {
                HIcon = new EzIcon({
                    // mark 自定义图标
                    src: iconOptions.iconUrl,
                    anchor: iconOptions.iconAnchor || [0, 0],
                    anchorXUnits: 'pixels',
                    anchorYUnits: 'pixels',
                    opacity: 1,
                    size: iconOptions.iconSize,
                });
            } else if (HMap.mapType == 'leaflet') {
                HIcon = L.icon(iconOptions);
            } else if (HMap.mapType == 'minemap') {
                var map = HMap.map;
                var iconId = makeUuid();
                map.loadImage(iconOptions.iconUrl, function(error, image) {
                    if (error) throw error;
                    map.addImage(iconId, image);
                });
                HIcon = {
                    id: iconId,
                    size: iconOptions.iconSize,
                    anchor: iconOptions.iconAnchor,
                };
            }
            return HIcon;
        }
        /**
         * 多边形
         * @coords [[],[]] 二维数组
         * @options object {
         *	color: string 描边颜色
         *   weight：number 描边宽度
         *   opacity: number 描边颜色透明度
         *   fillColor: string 填充颜色
         *   fillOpacity: number 填充颜色透明度
         * }
         *
         */
        function addPolygon(HMap, coords, options) {
            var HPolygon;
            if (HMap.mapType == 'pgis') {
                var coordsArray = [];
                for (var i = 0; i < coords.length; i++) {
                    var cor = coords[i];
                    coordsArray.push(cor[1]);
                    coordsArray.push(cor[0]);
                }
                HPolygon = new Polygon(coordsArray.join(','), {
                    strokeColor: options.color,
                    opacity: options.opacity,
                    strokeWeight: options.weight,
                    fillColor: options.fillColor,
                    fillOpacity: options.fillOpacity,
                    strokeLineDash: options.strokeLineDash,
                });
                HMap.map.addOverlay(HPolygon);
            } else if (HMap.mapType == 'leaflet') {
                var coordsArrayLeaflet = [];
                for (var i = 0; i < coords.length; i++) {
                    var cor = changeToLeafletCoord(coords[i]);
                    coordsArrayLeaflet.push(cor);
                }
                HPolygon = L.polygon(coordsArrayLeaflet, options).addTo(HMap.map);
            }
            return HPolygon;
        }
        /**
         * 折线
         * @coords [[],[]] 二维数组
         * @options object {
         *	color: string 颜色
         *   weight：number 宽度
         *   opacity: number 透明度
         * }
         *
         */
        function addPolyline(HMap, coords, options) {
            var HPolyline;
            if (HMap.mapType == 'pgis') {
                var coordsArray = [];
                for (var i = 0; i < coords.length; i++) {
                    var cor = coords[i];
                    coordsArray.push(cor[1]);
                    coordsArray.push(cor[0]);
                }
                HPolyline = new Polyline(coordsArray.join(','), {
                    strokeColor: options.color,
                    strokeOpacity: options.opacity,
                    strokeWidth: options.weight,
                    strokeLineDash: options.strokeLineDash,
                });
                HMap.map.addOverlay(HPolyline);
            } else if (HMap.mapType == 'leaflet') {
                var coordsArrayLeaflet = [];
                for (var i = 0; i < coords.length; i++) {
                    var cor = changeToLeafletCoord(coords[i]);
                    coordsArrayLeaflet.push(cor);
                }
                HPolyline = L.polyline(coordsArrayLeaflet, options).addTo(HMap.map);
            }
            return HPolyline;
        }
        /**
         * 圆形
         * @coords []
         * @options object {
         *	radius: number 半径
         *	color: string 描边颜色
         *   weight：number 描边宽度
         *   opacity: number 描边颜色透明度
         *   fillColor: string 填充颜色
         *   fillOpacity: number 填充颜色透明度
         * }
         *
         */
        function addCircle(HMap, coords, options) {
            var HCircle;
            if (HMap.mapType == 'pgis') {
                var EZcoord = changeToEZCoord(coords);
                HCircle = new Circle(new EzCoord(coords[0], coords[1]), options.radius, {
                    // 圆形
                    strokeWidth: options.weight || 1,
                    strokeColor: options.color,
                    strokeOpacity: options.opacity || 1,
                    fillOpacity: options.fillOpacity || 1,
                    fillColor: options.fillColor,
                });
                HMap.map.addOverlay(HCircle);
            } else if (HMap.mapType == 'leaflet') {
                HCircle = L.circle(changeToLeafletCoord(coords), options).addTo(HMap.map);
            }
            return HCircle;
        }

        /**
         * 热力图
         * heatData: Array<{coordinate坐标<[经度, 纬度]>, properties属性：object}
         * @configOpts object {
         *	id: string 图层ID
         *	radius: number 缺省是8
         *  blur：number 要素的影响半径大小
         *  xField: number 这个必须指定，对应上述数据json对象中的经度KEY
         *  yField: number 这个必须指定，对应上述数据json对象中的纬度KEY
         *  valueField: String 这个必须指定，对应上述数据json对象中的属性KEY
         *  gradient Array 颜色(二维数组)[[数值：number, 颜色值：string]]
         *	opacity 0-1
         * }
         *
         */
        function addHeat(HMap, configOpts, heatData) {
            var Heat;
            var defaultGradient = [
                [0, 'rgba(0, 0, 255, 0)'],
                [0.1, 'royalblue'],
                [0.3, 'cyan'],
                [0.5, 'lime'],
                [0.7, 'yellow'],
                [1, 'red'],
            ];
            var map = HMap.map;
            var hData =
                HMap.mapType == 'minemap' ? null : changeHeatMapData(HMap.mapType, heatData);
            if (HMap.mapType == 'pgis') {
                Heat = new EzLayerHeatMap(configOpts);
                HMap.map.addOverlay(Heat);
                Heat.addData(hData);
            } else if (HMap.mapType == 'leaflet') {
                var cfg = {
                    radius: configOpts.radius, //缺省是8
                    maxOpacity: configOpts.opacity,
                    latField: configOpts.yField,
                    lngField: configOpts.xField,
                    valueField: configOpts.valueField ? configOpts.valueField : '',
                    gradient: configOpts.gradient
                        ? changeToLeafletGradient(configOpts.gradient)
                        : changeToLeafletGradient(defaultGradient),
                };
                this.heatmapLayer = new HeatmapOverlay(cfg);
                Heat = this.heatmapLayer.addTo(map);
                this.heatmapLayer.setData({ data: hData });
            } else if (HMap.mapType == 'minemap') {
                var jsonData = buildGeoJsonData('Point', heatData);
                var gradient = configOpts.gradient
                    ? changeToMineMapGradient(configOpts.gradient)
                    : changeToMineMapGradient(defaultGradient);
                var heatMapColor = ['interpolate', ['linear'], ['heatmap-density']].concat(
                    gradient,
                );
                HMap.map.addLayer({
                    id: configOpts.id,
                    type: 'heatmap',
                    source: {
                        type: 'geojson',
                        data: jsonData,
                    },
                    layout: {
                        visibility: 'visible',
                    },
                    paint: {
                        // 一个热力图数据点的模糊范围，单位是像素，默认值30；要求：值大于等于1，可根据zoom level进行插值设置
                        'heatmap-radius': configOpts.radius || 30,
                        // 一个热力图单个数据点的热力程度，默认值为1；要求：值大于等于0，支持使用property中某个的热力值
                        'heatmap-weight': {
                            property: configOpts.valueField,
                            stops: [
                                [0, 0],
                                [10, 1],
                            ],
                        },
                        // 用于统一控制热力值的强度，默认值1；要求：值大于等于0，可根据zoom level进行插值设置
                        'heatmap-intensity': 1,
                        // 表示热力图颜色阶梯，阶梯的值域范围为0-1，默认值为["interpolate",["linear"],["heatmap-density"],0,"rgba(0, 0, 255, 0)",0.1,"royalblue",0.3,"cyan",0.5,"lime",0.7,"yellow",1,"red"]
                        'heatmap-color': heatMapColor,
                        // 表示热力图的不透明度，默认值1；值域范围0-1，可根据zoom level进行插值设置
                        'heatmap-opacity': configOpts.opacity || 1,
                    },
                });
            }
            return Heat;
        }
        /*
         * 转换热力图数据
         * type: 地图类型
         * data: Array<{coordinate坐标<[纬度， 经度]>, properties属性：object}
         * */
        function changeHeatMapData(type, data) {
            var array = [];
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                if (type == 'leaflet') {
                    array.push(changeToLeafletCoord(data.coordinate));
                } else if (type == 'pgis') {
                    array.push(data.coordinate);
                }
            }
            return array;
        }
        /*
         * 转换为leaflet热力图颜色数据
         * */
        function changeToLeafletGradient(value) {
            var obj = {};
            if (value) {
                for (var i = 0; i < value.length; i++) {
                    var item = value[i];
                    obj[item[0]] = item[1];
                }
            }
            return obj;
        }
        /*
         * 转换为minemap热力图颜色数据
         * */
        function changeToMineMapGradient(value) {
            var str = '';
            if (value) {
                var array = [];
                for (var i = 0; i < value.length; i++) {
                    var item = value[i];
                    array.push(item[0], item[1]);
                }
            }
            return array;
        }
        /**
         * HTML追加
         * @option object {
         *	id	String父容器id号
         *  coord 地理坐标
         *  strHTML innerHTML内容
         *  offset HTMLElementOverlay偏移量
         *  positioning HTMLElementOverlay的定位点,默认为左上角
         * }
         *
         */
        function addHtml(HMap, option) {
            var Html;
            let map = HMap.map;
            if (HMap.mapType == 'pgis') {
                Html = new HTMLElementOverLay(
                    option.id,
                    option.coord,
                    option.strHTML,
                    option.offset,
                );
                HMap.map.addOverlay(Html);
            } else if (HMap.mapType == 'leaflet') {
                let myIcon = L.divIcon({
                    html: option.strHTML,
                    className: '',
                    iconAnchor: ['-' + option.offset[0], '-' + option.offset[0]],
                });
                Html = L.marker([option.coord[1], option.coord[0]], { icon: myIcon });
                Html.addTo(HMap.map);
            }
            return Html;
        }
        /**
         * 增加mark图层
         * @option object {
         *	data	Array<{coordinate坐标<[纬度， 经度]>, properties属性：object}
         *  id 图层ID
         *  textField 图标显示的文字（需要与data中properties的属性名称对应）
         *  textOffset 文字偏移量
         *  textAnchor 表示文本锚点，值为字符类型，值域为["center", "left", "right", "top", "bottom", "top-left", "top-right", "bottom-left", "bottom-right"]，当"text-field"有值时才有效，默认值为"center"；
         *  textSize 文字字号
         *  textColor 文字颜色
         *  textOpacity 文字透明度0到1
         *  iconSize 图标大小0到1
         * }
         *
         */
        function addMarkLayer(HMap, icon, option) {
            if (HMap && option) {
                if (HMap.mapType == 'minemap') {
                    var jsonData = buildGeoJsonData('Point', option.data);
                    HMap.map.addLayer({
                        id: option.id,
                        type: 'symbol',
                        source: {
                            type: 'geojson',
                            data: jsonData,
                        },
                        layout: {
                            'icon-image': icon ? icon.id : '',
                            'text-field': '{' + option.textField + '}',
                            'text-offset': option.textOffset || [0, 0],
                            'text-anchor': option.textAnchor || 'top',
                            'icon-size': option.iconSize || 1,
                            'icon-allow-overlap': true, // 图标允许压盖
                            'text-allow-overlap': true, // 图标覆盖文字允许压盖
                            'text-size': option.textSize || 16,
                        },
                        paint: {
                            'text-color': option.textColor || '#000000',
                            'text-opacity': option.textOpacity || 1,
                        },
                    });
                }
            }
        }
        /**
         * 增加面图层
         * @option object {
         *	data	Array<{coordinate坐标<[纬度， 经度]>, properties属性：object}
         *  id 图层ID
         *  fillAntialias 表示面填充是否需要抗锯齿，值为布尔值，默认为true,
         *  fillColor 表示面的填充颜色，值可以是rgb值，也可以是十六进制颜色值；支持函数对象语句,
         *  fillOutlineColor 表示面边框的颜色，值可以是rgb值，也可以是十六进制颜色值；支持函数对象语句
         *  fillOpacity 表示面颜色的不透明度，与'fill-color'搭配使用，值域为[0,1]，默认值为1；支持函数对象语句,
         * }
         *
         */
        function addPolygonLayer(HMap, option) {
            if (HMap && option) {
                if (HMap.mapType == 'minemap') {
                    var jsonData = buildGeoJsonData('Polygon', option.data);
                    HMap.map.addLayer({
                        id: option.id,
                        type: 'fill',
                        source: {
                            type: 'geojson',
                            data: jsonData,
                        },
                        layout: {
                            visibility: 'visible',
                        },
                        paint: {
                            'fill-antialias': option.fillAntialias || true, // 表示面填充是否需要抗锯齿，值为布尔值，默认为true,
                            'fill-color': option.fillColor || 'rgba(0,0,0,0)', // 表示面的填充颜色，值可以是rgb值，也可以是十六进制颜色值；支持函数对象语句,
                            'fill-outline-color': option.fillOutlineColor || 'rgba(0,0,0,0)', // 表示面边框的颜色，值可以是rgb值，也可以是十六进制颜色值；支持函数对象语句,
                            'fill-opacity': option.fillOpacity || 1, // 表示面颜色的不透明度，与'fill-color'搭配使用，值域为[0,1]，默认值为1；支持函数对象语句,
                        },
                    });
                }
            }
        }
        /**
         * 增加图片图层
         * @option object {
         *	coordinates	Array<Array<lng, lat>>> 图像在地图上的坐标点边界,边界值为顺时针方式，依次为：左上、右上、右下、左下
         *  id 图层ID
         *  url 图片地址,
         *  rasterOpacity: number 栅格图片的不透明度，值域为[0,1]，默认值为1；支持函数对象语句
         *  minZoom 图层可展示的最小缩放等级值
         *  maxZoom 图层可展示的最大缩放等级值
         * }
         *
         */
        function addImageLayer(HMap, option) {
            if (HMap && option) {
                var map = HMap.map;
                if (HMap.mapType == 'minemap') {
                    map.addLayer({
                        id: option.id,
                        type: 'raster',
                        source: {
                            type: 'image' /*图像数据源类型*/,
                            url: option.url /*图像url地址*/,
                            coordinates: option.coordinates,
                            /* 图像在地图上的坐标点边界，边界值为顺时针方式，依次为：左上、右上、右下、左下*/
                        },
                        layout: {
                            visibility: 'visible',
                        },
                        paint: {
                            'raster-opacity': option.rasterOpacity || 1,
                        },
                        minzoom: option.minZoom || 10,
                        maxzoom: option.maxZoom || 19,
                    });
                }
            }
        }
        /**
         * 增加线图层
         * @option object {
         *	data	Array<{coordinate坐标<[纬度， 经度]>, properties属性：object}
         *  id 图层ID
         *  lineCap 表示线末端的样式，值域["butt"、"round"、"square"]，分别表示方角、圆角、线宽一半长的方角；默认值为"butt"
         *  lineJoin 表示线相交处的样连接式，值域["bevel"、"round", "miter"]，分别表示连接处为以线宽一半为长度的方角、连接处为以线宽一半为半径的圆角、连接处以尖锐角形式连接；默认值为"miter"
         *  lineColor 表示线的填充颜色，值可以是rgb值，也可以是十六进制颜色值；支持函数对象语句；
         *  lineOpacity 表示线颜色的不透明度，与'line-color'搭配使用，值域为[0,1]，默认值为1；支持函数对象语句；
         *  lineWidth 表示线宽度，值必须大于等于0，默认值为1；支持函数对象语句；
         *  lineDasharray 虚线
         * }
         *
         */
        function addPolylineLayer(HMap, option) {
            if (HMap && option) {
                if (HMap.mapType == 'minemap') {
                    var jsonData = buildGeoJsonData('LineString', option.data);
                    HMap.map.addLayer({
                        id: option.id,
                        type: 'line',
                        source: {
                            type: 'geojson',
                            data: jsonData,
                        },
                        layout: {
                            visibility: 'visible',
                            'line-cap': option.lineCap || 'butt',
                            'line-join': option.lineJoin || 'miter',
                        },
                        paint: {
                            'line-color': option.lineColor,
                            'line-width': option.lineWidth,
                            'line-opacity': option.lineOpacity,
                            'line-dasharray': option.lineDasharray || [1, 0],
                        },
                    });
                }
            }
        }
        /**
         * 删除图层
         * @id: 图层ID
         */
        function removeLayer(HMap, id) {
            var map = HMap.map;
            if (HMap.mapType === 'minemap') {
                if (map.getLayer(id)) {
                    map.removeLayer(id);
                }
                if (map.getSource(id)) {
                    // 删除与图层同一ID的数据源
                    map.removeSource(id);
                }
            }
        }
        /**
         * 删除数据源
         * @id: 数据源ID
         */
        function removeSource(HMap, id) {
            var map = HMap.map;
            if (HMap.mapType === 'minemap') {
                if (map.getSource(id)) {
                    map.removeSource(id);
                }
            }
        }
        /**
         * 添加popup信息框
         * @options: {
         *     popupOptions?： {
         *         closeButton?: boolean，true表示会展示一个关闭按钮；
         *         closeOnClick?: boolean，设置为true表示当地图被点击时该信息窗体会被关闭；
         *         offset?: [number, number]，参数为点位置相对于其左上角偏移像素大小；
         *         anchor?: string，停靠点，值域为[top,bottom,left,right,top-left,top-right,bottom-left,bottom-right]，如果不设置该参数，则会根据map container动态调整。
         *     },
         *     latlng?: [lat, lng],
         *     content?: {
         *         type: string, 内容类型[text, html, domContent]
         *         element: string | HTMLElement, 展示内容（必须与type类型对应，domContent为HTMLElement）
         *     },
         *     trackPointer: boolean popup的位置会跟随鼠标指针的位置，使用此方法就不再需要setLngLat来设置popup的位置
         *     addToObj?: obj, 需要添加到的图层对象，暂时为map对象
         * }
         */
        function addPopup(HMap, options) {
            var popup = null;
            if (HMap.mapType === 'minemap' && window.minemap) {
                var popupOptions = options.popupOptions || {};
                popup = new minemap.Popup(popupOptions);
                if (options.latlng) {
                    popup.setLngLat(changeToEZCoord(options.latlng));
                }
                if (options.content) {
                    if (options.content.type == 'text') {
                        popup.setText(options.content.element);
                    } else if (options.content.type == 'html') {
                        popup.setHTML(options.content.element);
                    } else if (options.content.type == 'domContent') {
                        popup.setDOMContent(options.content.element);
                    }
                }
                if (options.trackPointer) {
                    popup.trackPointer();
                }
                if (options.addToObj) {
                    popup.addTo(options.addToObj);
                }
            }
            return popup;
        }
        /**
         * 删除popup
         * @popupObj: popup对象
         */
        function removePopup(HMap, popupObj) {
            if (HMap.mapType == 'minemap' && popupObj) {
                popupObj.remove();
            }
        }
        /**
         * 设置元素的坐标
         * @element: 元素对象
         * @lnglat: 坐标[lng, lat]
         */
        function setElementLatLng(HMap, element, lnglat) {
            if (HMap && element && lnglat) {
                if (HMap.mapType == 'minemap') {
                    element.setLngLat(lnglat);
                }
            }
        }
        /**
         * 设置元素的坐标
         * @element: 元素对象
         * @lnglat: 坐标[lng, lat]
         */
        function setElementLatLng(HMap, element, lnglat) {
            if (HMap && element && lnglat) {
                if (HMap.mapType == 'minemap') {
                    element.setLngLat(lnglat);
                }
            }
        }
        /**
         * 设置元素的展示文字
         * @element: 元素对象
         * @text: 文字string
         */
        function setElementText(HMap, element, text) {
            if (HMap && element && text) {
                if (HMap.mapType == 'minemap') {
                    element.setText(text);
                }
            }
        }
        /**
         * 设置元素的展示HTML
         * @element: 元素对象
         * @html: HTML字符串string
         */
        function setElementHTMLString(HMap, element, html) {
            if (HMap && element && html) {
                if (HMap.mapType == 'minemap') {
                    element.setHTML(html);
                }
            }
        }
        /**
         * 设置元素的展示HTML
         * @element: 元素对象
         * @html: HTMLElement
         */
        function setElementHTMLElement(HMap, element, html) {
            if (HMap && element && html) {
                if (HMap.mapType == 'minemap') {
                    element.setDOMContent(html);
                }
            }
        }
        /**
         * 将元素加载到Map
         * @element: 元素对象
         */
        function addElementToMap(HMap, element) {
            if (HMap && element) {
                if (HMap.mapType == 'minemap') {
                    element.addTo(HMap.map);
                }
            }
        }
        /**
         * 构建geoJson数据
         * @type: 数据类型 Point | LineString | Polygon
         * @data: 数据 Array<{coordinate坐标<[经度, 纬度]>, properties属性：object}>
         */
        function buildGeoJsonData(type, data) {
            // if (data && data.length > 0) {
                var features = [];
                for (var i in data) {
                    features.push({
                        type: 'Feature',
                        geometry: {
                            type: type,
                            coordinates: data[i].coordinate,
                        },
                        properties: data[i].properties || {},
                    });
                }
                var geoJSONData = {
                    type: 'FeatureCollection',
                    features: features,
                };
                return geoJSONData;
            // }
            // return null;
        }
        /**
         * 地图地图事件监听
         */
        function getListterZoom(HMap, callback) {
            let map = HMap.map;
            if (HMap.mapType == 'pgis') {
                map.addMapEventListener(
                    Ez.Event.MAP_PANEND,
                    function(data) {
                        callback(data);
                    },
                    map,
                );
            } else if (HMap.mapType == 'leaflet') {
                map.on('moveend', function(data) {
                    callback(data, true);
                });
            } else if (HMap.mapType == 'minemap') {
                map.on('moveend', function(data) {
                    callback(data);
                });
            }
        }
        /**
         * 地图容器点击事件
         * @callback 返回（pixel, lnglat）
         * @layerIds minemap必填 容器ID集合 Array<string> | string
         */
        function bindMapClick(HMap, callback, layerIds) {
            if (typeof callback == 'function') {
                var map = HMap.map;
                if (HMap.mapType == 'pgis') {
                    setEZElementMouseClickCallback(map, 'map', callback);
                } else if (HMap.mapType == 'leaflet') {
                    map.on('click', function(ev) {
                        var pixel = [ev.containerPoint.x, ev.containerPoint.y];
                        var lnglat = [ev.latlng.lng, ev.latlng.lat];
                        callback(pixel, lnglat);
                    });
                } else if (HMap.mapType == 'minemap') {
                    if (typeof layerIds == 'object' && layerIds.length > 0) {
                        map.on('click', function(e) {
                            var features = map.queryRenderedFeatures(e.point, { layers: layerIds });
                            var feature = features[0];
                            var coord = feature ? feature.geometry.coordinates : [];
                            callback([e.point.x, e.point.y], coord, features);
                        });
                    } else if (typeof layerIds == 'string') {
                        map.on('click', layerIds, function(e) {
                            var features = e.features;
                            var coord = e.lngLat;
                            callback([e.point.x, e.point.y], [coord.lng, coord.lat], features);
                        });
                    } else {
                        console.error('layerIds不能为空');
                    }
                }
            }
        }
        /**
         * 地图容器双击事件
         * @callback 返回（pixel, lnglat）
         * @layerIds minemap必填 容器ID集合 Array<string> | string
         */
        function bindMapDbClick(HMap, callback, layerIds) {
            if (typeof callback == 'function') {
                var map = HMap.map;
                if (HMap.mapType == 'minemap') {
                    if (typeof layerIds == 'object' && layerIds.length > 0) {
                        map.on('dblclick', function(e) {
                            var features = map.queryRenderedFeatures(e.point, { layers: layerIds });
                            var feature = features[0];
                            var coord = feature ? feature.geometry.coordinates : [];
                            callback([e.point.x, e.point.y], coord, features);
                        });
                    } else if (typeof layerIds == 'string') {
                        map.on('click', layerIds, function(e) {
                            var features = e.features;
                            var coord = e.lngLat;
                            callback([e.point.x, e.point.y], [coord.lng, coord.lat], features);
                        });
                    } else {
                        console.error('layerIds不能为空');
                    }
                }
            }
        }
        /**
         * 地图容器mousemove事件
         * @callback 返回（pixel, lnglat）
         * @layerIds minemap必填 容器ID集合 Array<string> | string
         */
        function bindMapMouseMove(HMap, callback, layerIds) {
            if (typeof callback == 'function') {
                var map = HMap.map;
                if (HMap.mapType == 'minemap') {
                    if (typeof layerIds == 'object' && layerIds.length > 0) {
                        map.on('mousemove', function(e) {
                            var features = map.queryRenderedFeatures(e.point, { layers: layerIds });
                            var feature = features[0];
                            var coord = feature ? feature.geometry.coordinates : [];
                            callback([e.point.x, e.point.y], coord, features);
                        });
                    } else if (typeof layerIds == 'string') {
                        map.on('mousemove', layerIds, function(e) {
                            var features = e.features;
                            var coord = e.lngLat;
                            callback([e.point.x, e.point.y], [coord.lng, coord.lat], features);
                        });
                    } else {
                        console.error('layerIds不能为空');
                    }
                }
            }
        }
        /**
         * 地图容器mouseleave事件
         * @callback 返回（pixel, lnglat）
         * @layerId minemap必填 容器ID string
         */
        function bindMapMouseLeave(HMap, callback, layerId) {
            if (typeof callback == 'function') {
                var map = HMap.map;
                if (HMap.mapType == 'minemap') {
                    if (typeof layerId == 'string') {
                        map.on('mouseleave', layerId, function(e) {
                            var features = e.features;
                            var coord = e.lngLat;
                            callback([e.point.x, e.point.y], [coord.lng, coord.lat], features);
                        });
                    } else {
                        console.error('layerIds不能为空');
                    }
                }
            }
        }
        function unbindMapEvent(HMap, type, layerId) {
            var map = HMap.map;
            if (HMap.mapType == 'minemap') {
                map.off(type, layerId);
            }
        }
        /**
         * 初始化编辑功能
         * @options {
         *     boxSelect: Boolean 是否支持拉框选择 默认true
         *     touchEnabled: Boolean 是否支持手指触屏 默认true
         *     displayControlsDefault: Boolean 是否启用编辑控件 默认true
         *     showButtons: Boolean 是否启用默认控件按钮 默认false
         * }
         */
        function initMapEdit(HMap, options) {
            if (HMap.map) {
                if (HGisEdit == null) {
                    if (HMap.mapType == 'minemap') {
                        HGisEdit = new minemap.edit.init(HMap.map, {
                            boxSelect: options.boxSelect || true /* 是否支持拉框选择 */,
                            touchEnabled: options.touchEnabled || true /* 是否支持手指触屏 */,
                            displayControlsDefault:
                                options.displayControlsDefault || true /* 是否启用编辑控件 */,
                            showButtons: options.showButtons || false /* 是否启用默认控件按钮 */,
                        });
                    }
                }
                return HGisEdit;
            }
        }
        /**
         * 销毁编辑器对象
         */
        function destroyMapEdit(HMap) {
            if (HMap.map && HGisEdit) {
                if (HMap.mapType == 'minemap') {
                    // HGisEdit.dispose(); 在地图未加载完成前执行可能会报错
                    HGisEdit = null;
                }
            }
        }
        /**
         * 禁用编辑功能
         */
        function disableEditDraw(HMap) {
            if (HMap.map && HGisEdit) {
                if (HMap.mapType == 'minemap') {
                    HGisEdit.disableDraw();
                }
            }
        }
        /**
         * 启用编辑功能
         */
        function enableEditDraw(HMap) {
            if (HMap.map && HGisEdit) {
                if (HMap.mapType == 'minemap') {
                    HGisEdit.enableDraw();
                }
            }
        }
        /**
         * 编辑功能
         * @mode string 必填项 【
         * 	point：画点
         * 	line：画线
         * 	polygon：多边形
         * 	icon: 图标标注,
         * 	circle：画圆
         * 	trash：删除所选
         * 	undo：撤销上一步
         * 	redo：重复上一步
         * 	static: 不可编辑模式
         * 】
         * @modeOptions { 图形样式
         *     custom_style: "true", 非默认样式需要
         *     多边形样式：
         *     fillColor-面颜色，默认值"#55B1F3"
         *     fillOpacity-面不透明度，默认值0.1；
         *     fillOutlineColor-面轮廓颜色，默认值"#55B1F3"；
         *     fillOutlineWidth-面轮廓宽度，默认值2；
         *     fillOutlineDasharray-面轮廓是否为虚线，默认值"false"；
         *     线段样式：
         *     lineColor-线颜色，默认值"#55B1F3"；
         *     lineWidth-线宽度，默认值2；
         *     lineDasharray-线是否为虚线，默认值"false"；
         *     圆点样式：
         *     circleBorderColor-点边框颜色，默认值"#ffffff"；
         *     circleBorderRadius-点边框宽度，默认值2；
         *     circleColor-点颜色，默认值"#55B1F3"；
         *     circleRadius-点半径，默认值4；
         *     图标样式：
         *     feature_type: "icon",
         *     iconImage：图标名称(加入到minemap地图中的图标名称，其中包括sprite中的名称、以及通过使用map.addImage方法自定义添加的图标名称)；
         *     iconColor：图标颜色（如果图标是矢量的可编辑颜色的，需要增加该参数，否则不需要该参数）
         *     iconSize：图标大小，默认值为1，非必输项
         *     iconRotate：图标旋转角度(顺时针方向)，默认值为0，非必输项
         * }
         */
        function onEditCtrlActive(HMap, mode, modeOptions) {
            if (HGisEdit && mode) {
                if (HMap.mapType == 'minemap') {
                    HGisEdit.onBtnCtrlActive(mode, { style: modeOptions || undefined });
                }
            }
        }
        /**
         * 添加数据到编辑器中
         * @type: 数据类型 必填项 string Point | LineString | Polygon
         * @data: 数据 Array<{coordinate坐标<[经度, 纬度]>, properties属性：object(同modeOptions)}>
         */
        function addEditFeature(HMap, type, features) {
            if (HMap.map && HGisEdit) {
                var featuresId = '';
                var geoJsonData = buildGeoJsonData(type, features);
                if (HMap.mapType == 'minemap') {
                    featuresId = HGisEdit.draw.add(geoJsonData);
                }
                return featuresId;
            }
        }
        /**
         * 设置数据到编辑器中
         * @type: 数据类型 必填项 string Point | LineString | Polygon
         * @data: 数据 Array<{coordinate坐标<[经度, 纬度]>, properties属性：object}>
         */
        function setEditFeature(HMap, type, features) {
            if (HMap.map && HGisEdit) {
                var featuresId = '';
                var geoJsonData = buildGeoJsonData(type, features);
                if (HMap.mapType == 'minemap') {
                    featuresId = HGisEdit.setFeatures(geoJsonData);
                }
                return featuresId;
            }
        }
        /**
         * 删除所有已编辑的图形
         */
        function delEditAllFeatures(HMap) {
            if (HMap.map && HGisEdit) {
                if (HMap.mapType == 'minemap') {
                    HGisEdit.draw.deleteAll();
                }
            }
        }
        /**
         * 根据id数组删除编辑池中的数据
         * @ids:  string | Array<string>
         */
        function delEditFeatures(HMap, ids) {
            if (HMap.map && HGisEdit) {
                if (HMap.mapType == 'minemap') {
                    HGisEdit.removeFeatures(ids);
                }
            }
        }
        /**
         * 当地图加载后执行的函数
         */
        function onMapLoad(HMap, callback) {
            if (HMap.map && typeof callback == 'function') {
                var map = HMap.map;
                if (HMap.mapType == 'minemap') {
                    map.on('load', callback);
                }
            }
        }
        /**
         * 当图形删除、新增、修改、属性更新、图形合并拆分等会产生新增的操作记录.
         */
        function onEditRecordCreate(HMap, callback) {
            if (HMap.map && typeof callback == 'function') {
                var map = HMap.map;
                if (HMap.mapType == 'minemap') {
                    map.on('edit.record.create', callback);
                }
            }
        }
        /**
         * 地图编辑撤销上一步操作事件:
         */
        function onEditUnDo(HMap, callback) {
            if (HMap.map && typeof callback == 'function') {
                var map = HMap.map;
                if (HMap.mapType == 'minemap') {
                    map.on('edit.undo', callback);
                }
            }
        }
        /**
         * 地图编辑图形选中事件
         */
        function onEditSelected(HMap, callback) {
            if (HMap.map && typeof callback == 'function') {
                var map = HMap.map;
                if (HMap.mapType == 'minemap') {
                    map.on('edit.selected', callback);
                }
            }
        }
        /**
         * 设置地图中心点
         * @centerPoint [lng, lat]
         */
        function setMapCenter(HMap, centerPoint) {
            if (HMap.map) {
                var map = HMap.map;
                if (HMap.mapType == 'minemap') {
                    map.setCenter(centerPoint);
                }
            }
        }
        /**
         * 获取地图中心点
         *
         */
        function getMapCenter(HMap) {
            if (HMap.map) {
                var map = HMap.map;
                if (HMap.mapType == 'minemap') {
                    return map.getCenter();
                }
            }
        }
        /**
         * 设置地图层级
         * @zoomLevel number 1-18
         */
        function setMapZoom(HMap, zoomLevel) {
            if (HMap.map) {
                var map = HMap.map;
                if (HMap.mapType == 'minemap') {
                    map.setZoom(zoomLevel);
                }
            }
        }
        /**
         * 获取地图层级
         */
        function getMapZoom(HMap) {
            if (HMap.map) {
                var map = HMap.map;
                if (HMap.mapType == 'minemap') {
                    return map.getZoom();
                }
            }
        }
        /**
         * 添加
         * @sourceId 数据ID
         * @type: 数据类型 必填项 string Point | LineString | Polygon
         * @data: 数据 Array<{coordinate坐标<[经度, 纬度]>, properties属性：object}>
         */
        function addMapSource(HMap, sourceId, type, data) {
            if (HMap.map) {
                var map = HMap.map;
                if (HMap.mapType == 'minemap') {
                    var geoJsonData = buildGeoJsonData(type, data);
                    map.addSource(sourceId, {
                        type: 'geojson',
                        data: geoJsonData,
                    });
                }
            }
        }
        /**
         * 设置数据到编辑器中
         * @sourceId 数据ID
         * @type: 数据类型 必填项 string Point | LineString | Polygon
         * @data: 数据 Array<{coordinate坐标<[经度, 纬度]>, properties属性：object}>
         */
        function updateMapSource(HMap, sourceId, type, data) {
            if (HMap.map) {
                var map = HMap.map;
                if (HMap.mapType == 'minemap') {
                    var geoJsonData = buildGeoJsonData(type, data);
                    map.getSource(sourceId).setData(geoJsonData);
                }
            }
        }

        function updateTrafficSource(HMap, sourceName) {
            if (HMap.map) {
                var map = HMap.map;
                if (HMap.mapType == 'minemap') {
                    if (map.getSource(sourceName)) {
                        map.removeSource(sourceName);
                    }
                    var d = new Date();
                    map.addSource(sourceName, {
                        type: 'vector',
                        traffic: true,
                        tiles: ['minemapdatad://Trafficrtic/{z}/{x}/{y}/' + d.getTime()],
                    });
                }
            }
        }

        function addTrafficLayer(HMap, layerId, trafficSourceName) {
            if (HMap.map) {
                var map = HMap.map;
                if (HMap.mapType == 'minemap') {
                    map.addLayer({
                        id: layerId,
                        type: 'line',
                        source: trafficSourceName,
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
                    });
                }
            }
        }

        function addCombinePointLayer(HMap, options) {
            if (HMap.map) {
                var map = HMap.map;
                if (HMap.mapType == 'minemap') {
                    var layerOptions = {
                        id: options.layerId,
                        type: 'symbol',
                        source: options.sourceName,
                        layout: {},
                        paint: {},
                        filter: ['has', 'point_count'],
                    };
                    if (options.icon) {
                        var iconOpts = options.icon;
                        layerOptions.layout['icon-image'] = iconOpts.iconName;
                        layerOptions.layout['icon-size'] = iconOpts.iconSize || 1;
                    }
                    if (options.text) {
                        var textOpts = options.text;
                        layerOptions.layout['text-field'] = '{point_count}';
                        layerOptions.layout['text-size'] = textOpts.textSize || 10;
                        layerOptions.paint['text-color'] = textOpts.textColor || 'rgba(0,0,0,.75)';
                    }
                    map.addLayer(layerOptions);
                }
            }
        }

        function transformlat(lng, lat) {
            var ret =
                -100.0 +
                2.0 * lng +
                3.0 * lat +
                0.2 * lat * lat +
                0.1 * lng * lat +
                0.2 * Math.sqrt(Math.abs(lng));
            ret +=
                ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0;
            ret += ((20.0 * Math.sin(lat * PI) + 40.0 * Math.sin((lat / 3.0) * PI)) * 2.0) / 3.0;
            ret +=
                ((160.0 * Math.sin((lat / 12.0) * PI) + 320 * Math.sin((lat * PI) / 30.0)) * 2.0) /
                3.0;
            return ret;
        }

        function transformlng(lng, lat) {
            var ret =
                300.0 +
                lng +
                2.0 * lat +
                0.1 * lng * lng +
                0.1 * lng * lat +
                0.1 * Math.sqrt(Math.abs(lng));
            ret +=
                ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0;
            ret += ((20.0 * Math.sin(lng * PI) + 40.0 * Math.sin((lng / 3.0) * PI)) * 2.0) / 3.0;
            ret +=
                ((150.0 * Math.sin((lng / 12.0) * PI) + 300.0 * Math.sin((lng / 30.0) * PI)) *
                    2.0) /
                3.0;
            return ret;
        }
        /**
         * 判断是否在国内，不在国内则不做偏移
         * @param lng
         * @param lat
         * @returns {boolean}
         */
        function outOfChina(lng, lat) {
            return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271 || false;
        }
        /**
         * WGS84转GCj02
         * @param lng
         * @param lat
         * @returns {Array}
         */
        function wgs84ToGcj02(lat, lng) {
            if (outOfChina(lat, lng)) {
                return [lat, lng];
            } else {
                var dlat = transformlat(lng - 105.0, lat - 35.0);
                var dlng = transformlng(lng - 105.0, lat - 35.0);
                var radlat = (lat / 180.0) * PI;
                var magic = Math.sin(radlat);
                magic = 1 - ee * magic * magic;
                var sqrtmagic = Math.sqrt(magic);
                dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * PI);
                dlng = (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * PI);
                var mglat = lat + dlat;
                var mglng = lng + dlng;
                return [mglat, mglng];
            }
        }
        /**
         * GCJ02 转换为 WGS84
         * @param lng
         * @param lat
         * @returns {Array}
         */
        function gcj02ToWgs84(lat, lng) {
            if (outOfChina(lat, lng)) {
                return [lat, lng];
            } else {
                var dlat = transformlat(lng - 105.0, lat - 35.0);
                var dlng = transformlng(lng - 105.0, lat - 35.0);
                var radlat = (lat / 180.0) * PI;
                var magic = Math.sin(radlat);
                magic = 1 - ee * magic * magic;
                var sqrtmagic = Math.sqrt(magic);
                dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * PI);
                dlng = (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * PI);
                var mglat = lat + dlat;
                var mglng = lng + dlng;
                return [lat * 2 - mglat, lng * 2 - mglng];
            }
        }
        /**
         * 设置PGIS元素鼠标滑过样式
         */
        function setEZElementMouseMoveStyle(map, type) {
            map.addMapEventListener(
                Ez.Event.MAP_MOUSEMOVE,
                function(evt) {
                    var pixel = evt.pixel;
                    var element = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
                        if (feature instanceof type) {
                            return feature;
                        }
                    });
                    if (element) {
                        this.getViewport().style.cursor = 'pointer';
                    } else {
                        this.getViewport().style.cursor = '';
                    }
                },
                map,
            );
        }
        /**
         * 设置PGIS元素鼠标点击回调事件
         */
        function setEZElementMouseClickCallback(map, type, callback) {
            if (type == EzMarker) {
                map.removeMapEventListener(EZMarkListener);
            } else if (type == 'map') {
                map.removeMapEventListener(EZMapListener);
            }

            var listenerId = map.addMapEventListener(
                Ez.Event.MAP_CLICK,
                function(evt) {
                    var pixel = evt.pixel;
                    var coordinate = evt.coordinate;
                    if (type != 'map') {
                        var element = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
                            if (feature instanceof type) {
                                return feature;
                            }
                        });
                        if (element) {
                            var coord = element.coordinatesOfOl_;
                            callback(pixel, coord, element.bindData);
                        }
                    } else {
                        callback(pixel, coordinate);
                    }
                },
                map,
            );
            if (type == EzMarker) {
                EZMarkListener = listenerId;
            } else if (type == 'map') {
                EZMapListener = listenerId;
            }
        }
        /**
         * 设置PGIS元素鼠标点击回调事件
         */
        function setEZElementDragEndCallback(map, type, callback) {
            if (type == EzMarker) {
                map.removeMapEventListener(EZMapMarkDragListener);
            }

            var listenerId = map.addMapEventListener(
                Ez.Event.MAP_PAN,
                function(evt) {
                    var pixel = evt.pixel;
                    var element = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
                        if (feature instanceof type) {
                            return feature;
                        }
                    });
                    if (element) {
                        var coord = evt.coordinate;
                        callback(evt.pixel, coord, element.bindData);
                    }
                },
                map,
            );
            if (type == EzMarker) {
                EZMapMarkDragListener = listenerId;
            }
        }
        /**
         * 将坐标转换为PGIS使用的【经度，纬度】
         */
        function changeToEZCoord(coord) {
            return [coord[1], coord[0]];
        }
        /**
         * 将坐标转换为leaflet使用的【纬度, 经度】
         */
        function changeToLeafletCoord(coord) {
            return [coord[1], coord[0]];
        }
        /**
         * 设置PGis地图的元素（标记）拖拽效果
         */
        function setPGisMapDraggable(map, flag) {
            if (flag) {
                map.draggable();
            } else {
                map.disdraggable();
            }
        }
        /**清空当前坐标
         */
        function clear(HMap, mark) {
            let map = HMap.map;
            if (HMap.mapType == 'pgis') {
                map.removeOverlay(mark);
            } else if (HMap.mapType == 'leaflet') {
                mark.remove();
            }
        }
        /**清空当前坐标
         */
        function clears(HMap, mark, length, len, callback) {
            let map = HMap.map;
            if (HMap.mapType == 'pgis') {
                map.removeOverlay(mark);
                if (length == len) {
                    callback();
                }
            } else if (HMap.mapType == 'leaflet') {
                mark.remove();
            }
        }
        /**层级放大
         */
        function zoomIn(HMap) {
            let map = HMap.map;
            if (HMap.mapType == 'pgis') {
                map.zoomIn();
            } else if (HMap.mapType == 'leaflet') {
                if (getZoom(HMap) < window.configUrl.maxZoom) {
                    map.zoomIn();
                }
            }
        }
        /**层级减小
         */
        function zoomOut(HMap) {
            let map = HMap.map;
            if (HMap.mapType == 'pgis') {
                map.zoomOut();
            } else if (HMap.mapType == 'leaflet') {
                if (getZoom(HMap) > window.configUrl.minZoom) {
                    map.zoomOut();
                }
            }
        }
        /**获取当前地图级别大小
         */
        function getZoom(HMap) {
            let map = HMap.map;
            if (HMap.mapType == 'pgis') {
                return map.getZoom();
            } else if (HMap.mapType == 'leaflet') {
                return map.getZoom();
            }
        }
        /**对角线坐标
         */
        function getBoundsLatLng(HMap) {
            let map = HMap.map;
            if (HMap.mapType == 'pgis') {
                let bound = map.getBoundsLatLng();
                let leftX = bound.minX;
                let leftY = bound.minY;
                let rightX = bound.maxX;
                let rightY = bound.maxY;
                return [leftX, leftY, rightX, rightY];
            } else if (HMap.mapType == 'leaflet') {
                let bound = map.getBounds();
                let leftX = bound.getSouthWest().wrap().lng;
                let leftY = bound.getSouthWest().wrap().lat;
                let rightX = bound.getNorthEast().wrap().lng;
                let rightY = bound.getNorthEast().wrap().lat;
                return [leftX, leftY, rightX, rightY];
            }
        }
        function makeUuid() {
            let s = [];
            let hexDigits = '0123456789abcdef';
            for (let i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
            s[8] = s[13] = s[18] = s[23] = '-';
            let uuid = s.join('');
            return uuid;
        }
        hylinkGis.initMap = initMap;
        hylinkGis.addMark = addMark;
        hylinkGis.makeIcon = makeIcon;
        hylinkGis.addPolygon = addPolygon;
        hylinkGis.addPolyline = addPolyline;
        hylinkGis.addCircle = addCircle;
        hylinkGis.bindMapClick = bindMapClick;
        hylinkGis.bindMapDbClick = bindMapDbClick;
        hylinkGis.bindMapMouseMove = bindMapMouseMove;
        hylinkGis.bindMapMouseLeave = bindMapMouseLeave;
        hylinkGis.wgs84ToGcj02 = wgs84ToGcj02;
        hylinkGis.gcj02ToWgs84 = gcj02ToWgs84;
        hylinkGis.runInContext = runInContext;
        hylinkGis.clear = clear;
        hylinkGis.clears = clears;
        hylinkGis.zoomIn = zoomIn;
        hylinkGis.zoomOut = zoomOut;
        hylinkGis.getZoom = getZoom;
        hylinkGis.getBoundsLatLng = getBoundsLatLng;
        hylinkGis.addHeat = addHeat;
        hylinkGis.addHtml = addHtml;
        hylinkGis.getListterZoom = getListterZoom;
        hylinkGis.addMarkLayer = addMarkLayer;
        hylinkGis.addPolylineLayer = addPolylineLayer;
        hylinkGis.addPolygonLayer = addPolygonLayer;
        hylinkGis.addImageLayer = addImageLayer;
        hylinkGis.removeLayer = removeLayer;
        hylinkGis.removeSource = removeSource;
        hylinkGis.addPopup = addPopup;
        hylinkGis.removePopup = removePopup;
        hylinkGis.setElementLatLng = setElementLatLng;
        hylinkGis.setElementText = setElementText;
        hylinkGis.setElementHTMLString = setElementHTMLString;
        hylinkGis.setElementHTMLElement = setElementHTMLElement;
        hylinkGis.addElementToMap = addElementToMap;
        hylinkGis.initMapEdit = initMapEdit;
        hylinkGis.destroyMapEdit = destroyMapEdit;
        hylinkGis.disableEditDraw = disableEditDraw;
        hylinkGis.enableEditDraw = enableEditDraw;
        hylinkGis.onEditCtrlActive = onEditCtrlActive;
        hylinkGis.addEditFeature = addEditFeature;
        hylinkGis.setEditFeature = setEditFeature;
        hylinkGis.delEditFeatures = delEditFeatures;
        hylinkGis.delEditAllFeatures = delEditAllFeatures;
        hylinkGis.onMapLoad = onMapLoad;
        hylinkGis.onEditRecordCreate = onEditRecordCreate;
        hylinkGis.onEditUnDo = onEditUnDo;
        hylinkGis.onEditSelected = onEditSelected;
        hylinkGis.setMapCenter = setMapCenter;
        hylinkGis.getMapCenter = getMapCenter;
        hylinkGis.setMapZoom = setMapZoom;
        hylinkGis.getMapZoom = getMapZoom;
        hylinkGis.addMapSource = addMapSource;
        hylinkGis.updateMapSource = updateMapSource;
        hylinkGis.updateTrafficSource = updateTrafficSource;
        hylinkGis.addTrafficLayer = addTrafficLayer;
        hylinkGis.buildGeoJsonData = buildGeoJsonData;

        return hylinkGis;
    };
    /*--------------------------------------------------------------------------*/

    var HGis = runInContext();

    // Some AMD build optimizers, like r.js, check for condition patterns like:
    if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
        root.HGis = HGis;

        // Define as an anonymous module so, through path mapping, it can be
        // referenced as the "underscore" module.
        define(function() {
            return HGis;
        });
    }
    // Check for `exports` after `define` in case a build optimizer adds it.
    else if (freeModule) {
        // Export for Node.js.
        (freeModule.exports = HGis).HGis = HGis;
        // Export for CommonJS support.
        freeExports.HGis = HGis;
    } else {
        // Export to the global object.
        root.HGis = HGis;
    }
}.call(this));
