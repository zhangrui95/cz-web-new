
//URL参数常量
export  const URL_TAB = "tab";
export  const URL_PAGE = "page";
export  const URL_SFZH ="sfzh";//被盘查人身份证号码
export  const URL_NAME = "name"; //被盘查人姓名
export  const URL_JYSFZH ="jysfzh";//警员身份证号
export  const URL_JYXM = "jyxm";//警员姓名
export  const URL_JYBMBH = "jybmbh";//警员部门编号
export  const URL_TOKEN = "token";//token信息

export  const URL_HPHM = "hphm";//车辆号牌
export  const URL_HPZL = "hpzl";//车辆号牌种类
export  const URL_TARGET = "target";//查询对象  (car 车辆信息，person 人员信息)
export  const Target = {car:'car',person:'person'};//查询对象值

//地图默认中心位置
// export const MAP_CENTER_LOCATION = [117.206631, 39.135689];
export const MAP_CENTER_LOCATION = [126.5300002679, 45.8002383102];

// 126.5300002679,45.8002383102
//绘画类型
export const DRAW_TYPE = {
    None: 'None',//无
    Point: 'Point',//点
    LineString: 'LineString',//线
    Polygon: 'Polygon',//多边形
    Circle: 'Circle',//圆
    Square: 'Square',//正方形
    Box: 'Box',//长方形
};

//人员状态
export const PEOPLE_TYPE = {
    Online: 'Online',//在线
    Offline: 'Offline',//离线
    Unusual: 'Unusual',//异常
    Search: 'Search'//搜索
};
//组织类型
export const GROPU_TYPE = {
    LocalCentralOffice: 'LocalCentralOffice',//分局
    StationHouse: 'StationHouse',//派出所
    PoliceRoom: 'PoliceRoom',//警务室
};