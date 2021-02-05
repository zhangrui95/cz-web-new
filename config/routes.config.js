export default [
    {
        path: '/user',
        component: '../layouts/UserLayout',
        routes: [
            {
                name: '登录',
                path: '/user/login',
                component: './user/login',
            },
        ],
    },
    //大屏
    {
        path: '/screen',
        component: '../layouts/ScreenLayout',
        routes: [
            {
                name: '大屏显示',
                path: '/screen',
                component: './screen',
            },
        ],
    },
    {
        path: '/',
        component: '../layouts/SecurityLayout',
        routes: [
            {
                path: '/',
                component: '../layouts/BasicLayoutEdit',
                // component: '../layouts/BasicLayout',
                //   authority: ['admin', 'user'],
                routes: [
                    //首页
                    {
                        path: '/',
                        redirect: '/loginByToken',
                    },
                    // {
                    // 	path: '/loginByToken',
                    // 	name: '首页',
                    // 	icon: 'image/01.png',
                    // 	icon_on: 'image/001.png',
                    // 	component: './index',
                    // 	id: 1,
                    // 	authority: [ 'czht_welcome' ]
                    // },
                    {
                        path: '/loginByToken',
                        name: '首页',
                        icon: 'image/01.png',
                        icon_on: 'image/001.png',
                        component: './home',
                        id: 1,
                        authority: ['czht_welcome'],
                    },
                    {
                        path: '/home',
                        name: '首页',
                        component: './otherIndex',
                        authority: ['czht_welcome1'],
                    },
                    {
                        path: '/index',
                        name: '首页',
                        component: './mapIndex',
                        authority: ['czht_welcome2'],
                    },
                    //新首页
                    // {
                    // 	path: '/czht_xsy',
                    // 	name: '新首页',
                    // 	icon: 'image/01.png',
                    // 	icon_on: 'image/001.png',
                    // 	component: './otherIndex',
                    // 	id: 11,
                    // 	authority: [ 'czht_welcome' ]
                    // },
                    //指令通知
                    {
                        path: '/czht_xfzl',
                        id: 8,
                        name: '指令通知',
                        icon: 'image/08.png',
                        icon_on: 'image/008.png',
                        component: './instruction',
                        authority: ['czht_xfzl'],
                    },
                    //核查记录
                    {  // 新
                        path: '/czht_hcjl',
                        name: '核查记录',
                        icon_on: 'image/004.png',
                        icon: 'image/04.png',
                        id: 3,
                        //   component: './check',
                        component: '../layouts/BlankLayout',
                        hideChildrenInMenu: true,
                        authority: ['czht_hcjl'],
                        routes: [
                            {
                                path: '/czht_hcjl',
                                name: '核查记录',
                                component: './newcheck',
                                authority: ['czht_hcjl'],
                            },
                            {
                                path: '/czht_hcjl/detail/:types/:page',
                                // name: 'vehicle',
                                component: './newcheck/detail',
                                authority: ['czht_hcjl'],
                            },
                        ],
                    },
                    //预警管理
                    {
                        path: '/czht_yjgl',
                        name: '预警管理',
                        icon: 'image/011.png',
                        icon_on: 'image/0011.png',
                        //   component: './warning',
                        authority: ['czht_yjgl'],
                        component: '../layouts/BlankLayout',
                        hideChildrenInMenu: true,
                        routes: [
                            {
                                path: '/czht_yjgl',
                                name: '预警管理',
                                component: './warning',
                                authority: ['czht_yjgl'],
                            },
                            {
                                path: '/czht_yjgl/detail/:id/:types/:page',
                                // name: 'vehicle',
                                component: './warning/detail',
                                authority: ['czht_yjgl'],
                            },
                        ],
                    },
                    //抓拍记录
                    {
                        path: '/czht_zpjl',
                        name: '抓拍记录',
                        icon: 'image/02.png',
                        icon_on: 'image/002.png',
                        id: 2,
                        //   component: './capture',
                        component: '../layouts/BlankLayout',
                        hideChildrenInMenu: true,
                        authority: ['czht_zpjl'],
                        routes: [
                            {
                                path: '/czht_zpjl',
                                name: '抓拍记录',
                                component: './capture',
                                authority: ['czht_zpjl'],
                            },
                            {
                                path: '/czht_zpjl/detail/:id/:types/:page',
                                // name: 'vehicle',
                                component: './capture/detail',
                                authority: ['czht_zpjl'],
                            },
                        ],
                    },
                    //核查记录
                    // { // 旧
                    //     path: '/czht_hcjl',
                    //     name: '核查记录',
                    //     icon_on: 'image/004.png',
                    //     icon: 'image/04.png',
                    //     id: 3,
                    //     //   component: './check',
                    //     component: '../layouts/BlankLayout',
                    //     hideChildrenInMenu: true,
                    //     authority: ['czht_hcjl'],
                    //     routes: [
                    //         {
                    //             path: '/czht_hcjl',
                    //             name: '核查记录',
                    //             component: './check',
                    //             authority: ['czht_hcjl'],
                    //         },
                    //         {
                    //             path: '/czht_hcjl/detail/:id/:types/:page',
                    //             // name: 'vehicle',
                    //             component: './check/detail',
                    //             authority: ['czht_hcjl'],
                    //         },
                    //     ],
                    // },
                    //处警记录
                    {
                        path: '/czht_cjjl',
                        name: '处警记录',
                        icon: 'image/03.png',
                        icon_on: 'image/003.png',
                        //   component: './alarming',
                        authority: ['czht_cjjl'],
                        id: 4,
                        component: '../layouts/BlankLayout',
                        hideChildrenInMenu: true,
                        routes: [
                            {
                                path: '/czht_cjjl',
                                name: '处警记录',
                                component: './alarming',
                                authority: ['czht_cjjl'],
                            },
                            {
                                path: '/czht_cjjl/detail/:id/:page',
                                // name: 'vehicle',
                                component: './alarming/detail',
                                authority: ['czht_cjjl'],
                            },
                        ],
                    },
                    //协同作战
                    {
                        path: '/czht_xtzz',
                        name: '协同作战',
                        icon: 'image/013.png',
                        icon_on: 'image/0013.png',
                        authority: ['czht_yjgl'],
                        component: '../layouts/BlankLayout',
                        hideChildrenInMenu: true,
                        routes: [
                            {
                                path: '/czht_xtzz',
                                name: '协同作战',
                                component: './operateWith',
                                authority: ['czht_yjgl'],
                            },
                            {
                                path: '/czht_xtzz/detail/:id/:page',
                                // name: 'vehicle',
                                component: './operateWith/detail',
                                authority: ['czht_yjgl'],
                            },
                        ],
                    },
                    //勤务管理
                    {
                        path: '/czht_qwgl',
                        name: '勤务管理',
                        icon_on: 'image/005.png',
                        icon: 'image/05.png',
                        component: './service',
                        authority: ['czht_qwgl'],
                        id: 5,
                    },
                    //物流统计
                    {
                        path: '/logistics',
                        name: '物流统计',
                        icon_on: 'image/0014.png',
                        icon: 'image/014.png',
                        component: './logistics',
                        // authority: ['czht_wltj'],
                        // id: 12,
                    },
                    //临控管理
                    {
                        path: '/czht_lkgl',
                        name: '临控管理',
                        icon: 'image/012.png',
                        icon_on: 'image/0012.png',
                        component: './control',
                        authority: ['czht_lkgl'],
                    },
                    //应用成效
                    // {
                    //   path: '/czht_yycx',
                    //   name: '应用成效',
                    //   icon_on: 'image/006.png',
                    //   icon: 'image/06.png',
                    //   component: './applicationEffect',
                    //   authority: ['czht_yycx'],
                    // },
                    //设备管理
                    {
                        path: '/czht_sbgl',
                        name: '设备管理',
                        icon: 'image/07.png',
                        icon_on: 'image/007.png',
                        component: '../layouts/BlankLayout',
                        hideChildrenInMenu: true,
                        id: 7,
                        authority: ['czht_sbgl'],
                        routes: [
                            {
                                path: '/czht_sbgl',
                                name: '设备管理',
                                component: './device/home',
                                authority: ['czht_sbgl'],
                            },
                            {
                                path: '/czht_sbgl/inventory/:files/:pages/:type',
                                // name: 'vehicle',
                                component: './device/inventory',
                                authority: ['czht_sbgl'],
                            },
                            {
                                path: '/czht_sbgl/trajectory/:files/:pages',
                                // name: 'vehicle',
                                component: './device/trajectory',
                                authority: ['czht_sbgl'],
                            },
                            {
                                path: '/czht_sbgl/vehicle/:files/:expandForm/:page',
                                // name: 'vehicle',
                                component: './device/vehicle',
                                authority: ['czht_sbgl'],
                            },
                            {
                                path: '/czht_sbgl/addVehicle/:files/:type/:edit/:expandForm',
                                // name: 'addVehicle',
                                component: './device/addVehicle',
                                authority: ['czht_sbgl'],
                            },
                            {
                                path: '/czht_sbgl/addCar/:files/:type/:expandForm/:page',
                                // name: 'addVehicle',
                                component: './device/addCar',
                                authority: ['czht_sbgl'],
                            },
                        ],
                    },
                    //巡防战果
                    {
                        path: '/czht_xfzgtj',
                        id: 9,
                        name: '巡防战果',
                        icon: 'image/09.png',
                        icon_on: 'image/009.png',
                        component: './scouts',
                        authority: ['czht_xfzgtj'],
                    },
                    //日志管理
                    {
                        path: '/czht_rzgl',
                        id: 10,
                        name: '日志管理',
                        icon: 'image/010.png',
                        icon_on: 'image/0010.png',
                        component: './logManagement',
                        authority: ['czht_rzgl'],
                    },
                    {
                        path: '/czht_sz',
                        name: '设置',
                        icon_on: 'image/005.png',
                        icon: 'image/05.png',
                        component: './setUp',
                        // authority: [ 'czht_qwgl' ],
                        // id: 5
                    },
                    {
                        path: '/person',
                        name: '人员数据分析',
                        icon_on: 'image/person1.png',
                        icon: 'image/person.png',
                        component: '../layouts/BlankLayout',
                        hideChildrenInMenu: true,
                        authority: ['czht_person'],
                        routes: [
                            {
                                path: '/person',
                                name: '重点人员管理',
                                component: './keyPersonnel',
                                authority: ['czht_person'],
                            },
                            {
                                path: '/person/detail',
                                // name: 'vehicle',
                                component: './personnelDetails',
                                authority: ['czht_person'],
                            },
                            {
                                path: '/warningRules',
                                component: './warningRules',
                            },
                        ],
                    },
                    {
                        path: '/car',
                        name: '车辆数据分析',
                        icon_on: 'image/car1.png',
                        icon: 'image/car.png',
                        component: '../layouts/BlankLayout',
                        hideChildrenInMenu: true,
                        authority: ['czht_car'],
                        routes: [
                            {
                                path: '/car',
                                name: '车辆数据分析',
                                component: './keyCar',
                                authority: ['czht_car'],
                            },
                            {
                                path: '/car/detail',
                                name: '车辆详情',
                                component: './carDetails',
                                authority: ['czht_car'],
                            },
                        ],
                    },
                ],
            },
            {
                component: './404',
            },
        ],
    },
    {
        component: './404',
    },
];
