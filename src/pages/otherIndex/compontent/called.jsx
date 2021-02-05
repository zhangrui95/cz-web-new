import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    Row,
    Select,
    Modal,
    Message,
    List,
    Pagination,
    Radio,
    Table,
    Tag,
    Divider,
    Tooltip,
    Spin,
} from 'antd';
import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import styles from './index.less';

@connect(({ otherIndex, loading }) => ({
    otherIndex,
    loading: loading.effects['otherIndex/getPoliceAlarmListSearch'],
}))
class called extends React.Component {
    state = {
        choose: '',
        toDetail: '',
        showDetail: false,
        isCar: false,
        isDetail:false,
    };
    componentDidMount() {
        // this.getPoliceAlarmListSearch('06');
    }
    checkList = (files, count) => {
        // console.log(files, count)
        const { choose } = this.state;
        if (count == '0') {
            this.setState({ choose: '', showDetail: false, toDetail: '' });
            // return false
        } else {
            if (files == choose) {
                this.setState({ choose: '', showDetail: false, toDetail: '' });
            } else {
                this.setState({ choose: files, showDetail: true, toDetail: '' });
                this.getPoliceAlarmListSearch(files);
            }
        }
        this.props.closePoliceDetails();
    };
    getPoliceAlarmListSearch = files => {
        const { dispatch, vehicleState, vehicleid, gxdwdm } = this.props;
        let formData = {
            jjdzt: files == '06' ? '' : files,
            startTime: this.getNowFormatDate() + ' 00:00:00',
            endTime: this.getNowFormatDate() + ' 23:59:59',
        };
        // if (vehicleState && files != '01') {
        //     formData = {
        //         ...formData,
        //         vehicle_id: vehicleid,
        //     };
        // }
        // if (vehicleState) {
        //     formData = {
        //         ...formData,
        //         gxdwdm: gxdwdm,
        //     };
        // }
        dispatch({
            type: 'otherIndex/getPoliceAlarmListSearch',
            payload: {
                currentPage: 1,
                showCount: 999,
                pd: {
                    ...formData,
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
            },
        });
    };
    chooseDetail = files => {
        // console.log(files)
        if(this.state.isDetail && (this.state.toDetail === files.police_alarm_id)){
            this.setState({ choose: '', showDetail: false, toDetail: '',isDetail:false });
            this.props.closePoliceDetails();
        }else{
            this.setState({ toDetail: files.police_alarm_id,isDetail:true });
            this.props.dispatch({
                type: 'otherIndex/getPoliceDetail',
                payload: {
                    police_alarm_id:files.police_alarm_id,
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
                success:(res)=>{
                    if(res.result && res.result.policeAlarm){
                        this.props.checkPoliceDetails(res.result.policeAlarm);
                    }else{
                        this.props.checkPoliceDetails(files);
                    }
                }
            });
        }
    };
    getNowFormatDate() {
        var date = new Date();
        var seperator1 = '-';
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = '0' + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = '0' + strDate;
        }
        var currentdate = year + seperator1 + month + seperator1 + strDate;
        return currentdate;
    }
    //   componentWillReceiveProps(newProps) {
    //         console.log('Component WILL RECEIVE PROPS!',newProps,'\\\\\\\\')

    //   }
    componentWillReceiveProps(nextProps) {
        // console.log(nextProps.vehicleState,this.props.vehicleState,'1111')
        if (this.props.vehicleState != nextProps.vehicleState) {
            this.setState({ choose: '', showDetail: false, toDetail: '' });
            this.props.closePoliceDetails();
            // this.props.checkPoliceDetails();
        }
        if (this.props.jqHide !== nextProps.jqHide) {
            this.setState({ choose: '', showDetail: false, toDetail: '' });
            this.props.closePoliceDetails();
        }
        if(this.props.policeAlarmCounts.total !== nextProps.policeAlarmCounts.total){
            this.getPoliceAlarmListSearch('06');
        }
    }
    //   componentWillUpdate(prevProps, prevState) {
    //         console.log('Component DID UPDATE!',prevProps,'======' ,prevState,'-------',this.props,'!!!!!!!!!!!')
    //   }
    render() {
        const calledList = [
            // {
            // 	title: '待签收',
            // 	subtitle: '待签收',
            // 	jjdzt: '01',
            // 	class: styles.signfor,
            // 	icon: './image/jingqing.png',
            // 	count: '12'
            // },
            // {
            //     title: '待到场',
            //     subtitle: '待到场',
            //     jjdzt: '02',
            //     class: styles.present,
            //     icon: './image/ddc.png',
            //     count: '7',
            // },
            // {
            // 	title: '待结束',
            // 	subtitle: '待结束',
            // 	jjdzt: '03',
            // 	class: styles.end,
            // 	icon: './image/djs.png',
            // 	count: '1'
            // },
            // {
            // 	title: '待反馈',
            // 	subtitle: '待反馈',
            // 	jjdzt: '04',
            // 	class: styles.feedback,
            // 	icon: './image/dfk.png',
            // 	count: '20'
            // },
            // {
            //     title: '全局警情',
            //     subtitle: '我的警情',
            //     jjdzt: '06',
            //     class: styles.global,
            //     icon: './image/qjjq.png',
            //     count: '30',
            // },
            // {
            //     title: '已完结',
            //     subtitle: '已完结',
            //     jjdzt: '05',
            //     class: styles.finished,
            //     icon: './image/ywj.png',
            //     count: '8',
            // },
        ];
        const {
            otherIndex: { policeAlarmList },
            policeAlarmCounts,
            vehicleState,
            showDetails,
        } = this.props;
        const { choose, toDetail, showDetail, isCar } = this.state;
        return (
            <div className={styles.called}>
                <div
                    className={styles.classificationTitle}
                    style={{ backgroundImage: "url('./image/bt_bj.png')" }}
                >
                    {/*{isCar ? '警车接处警' : '全部警情'}*/}
                    全部警情
                    <div className={styles.countAll}>
                        { policeAlarmCounts.total ? policeAlarmCounts.total : 0}
                        <span className={styles.unitAll}> 条</span>
                    </div>
                </div>
                <div className={styles.content}>
                    <div className={styles.detail}>
                        {this.props.loading ? (
                            <div style={{ textAlign: 'center', marginTop: '130px' }}>
                                <Spin delay={500} size="large" />
                            </div>
                        ) : (
                            <div className={styles.con}>
                                {
                                    policeAlarmList.length == 0 ? <div className={styles.nowarningList}>
                                        <img src="./image/yjqs.png" alt=""/>
                                        <p>暂无警情</p>
                                    </div> : null
                                }
                                {policeAlarmList.sort((a, b) =>  moment(b.bjsj).valueOf() - moment(a.bjsj).valueOf()).map(v => (
                                    <div
                                        className={`${styles.detaillist} ${
                                            toDetail == v.police_alarm_id
                                                ? styles.chooseDetail
                                                : null
                                        }`}
                                        key={v.police_alarm_id}
                                        onClick={() => this.chooseDetail(v)}
                                    >
                                        <div className={styles.item}>
                                            <div className={styles.head}>
                                                    <span className={styles.title}>
                                                        {' '}
                                                        <Tooltip title={v.bjlxmc}>
                                                            {v.bjlxmc}
                                                        </Tooltip>
                                                    </span>
                                                <span className={styles.time}>{v.bjsj}</span>
                                            </div>
                                            <div className={styles.serial}>
                                                <img src="./image/caidan.png" alt="" />
                                                <Tooltip title={v.cjdbh}>
                                                        <span className={styles.num}>
                                                            {v.cjdbh}
                                                        </span>
                                                </Tooltip>
                                            </div>
                                            <div className={styles.address}>
                                                <img src="./image/weizhi.png" alt="" />
                                                <Tooltip title={v.afdd}>
                                                    <span className={styles.add}>{v.afdd}</span>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                {/*    <div className={styles.list}>*/}
                {/*        {calledList.map(v => (*/}
                {/*            <div*/}
                {/*                key={v.title}*/}
                {/*                className={`${styles.item} ${*/}
                {/*                    choose == v.jjdzt ? styles.chooseItem : null*/}
                {/*                }`}*/}
                {/*                style={{*/}
                {/*                    backgroundImage:*/}
                {/*                        choose == v.jjdzt*/}
                {/*                            ? "url('./image/jcj_bg_1.png')"*/}
                {/*                            : "url('./image/jcj_bg.png')",*/}
                {/*                }}*/}
                {/*                onClick={v.jjdzt == '02' ? null : () =>*/}
                {/*                    this.checkList(*/}
                {/*                        v.jjdzt,*/}
                {/*                        v.jjdzt == '01'*/}
                {/*                            ? policeAlarmCounts.wqs*/}
                {/*                            : v.jjdzt == '02'*/}
                {/*                            ? policeAlarmCounts.wdc*/}
                {/*                            : v.jjdzt == '03'*/}
                {/*                            ? policeAlarmCounts.wjs*/}
                {/*                            : v.jjdzt == '04'*/}
                {/*                            ? policeAlarmCounts.wfk*/}
                {/*                            : v.jjdzt == '05'*/}
                {/*                            ? policeAlarmCounts.yfk*/}
                {/*                            : v.jjdzt == '06'*/}
                {/*                            ? vehicleState*/}
                {/*                                ? policeAlarmCounts.wdjq*/}
                {/*                                : policeAlarmCounts.total*/}
                {/*                            : '0',*/}
                {/*                    )*/}
                {/*                }*/}
                {/*            >*/}
                {/*                <span className={styles.icons}>*/}
                {/*                    <img src={v.icon} alt="" className={v.class} />*/}
                {/*                </span>*/}
                {/*                <span className={styles.title}>*/}
                {/*                    {!vehicleState ? v.title : v.subtitle}*/}
                {/*                </span>*/}
                {/*                {v.jjdzt == '01' ? (*/}
                {/*                    <span className={styles.count}>*/}
                {/*                        {policeAlarmCounts.wqs ? policeAlarmCounts.wqs : '0'}*/}
                {/*                    </span>*/}
                {/*                ) : null}*/}
                {/*                {v.jjdzt == '02' ? (*/}
                {/*                    <span className={styles.count}>*/}
                {/*                        /!*{policeAlarmCounts.wdc ? policeAlarmCounts.wdc : '0'}*!/*/}
                {/*                       0*/}
                {/*                    </span>*/}
                {/*                ) : null}*/}
                {/*                {v.jjdzt == '03' ? (*/}
                {/*                    <span className={styles.count}>*/}
                {/*                        {policeAlarmCounts.wjs ? policeAlarmCounts.wjs : '0'}*/}
                {/*                    </span>*/}
                {/*                ) : null}*/}
                {/*                {v.jjdzt == '04' ? (*/}
                {/*                    <span className={styles.count}>*/}
                {/*                        {policeAlarmCounts.wfk ? policeAlarmCounts.wfk : '0'}*/}
                {/*                    </span>*/}
                {/*                ) : null}*/}
                {/*                {v.jjdzt == '05' ? (*/}
                {/*                    <span className={styles.count}>*/}
                {/*                        {policeAlarmCounts.yfk ? policeAlarmCounts.yfk : '0'}*/}
                {/*                    </span>*/}
                {/*                ) : null}*/}
                {/*                {v.jjdzt == '06' ? (*/}
                {/*                    <span className={styles.count}>*/}
                {/*                        {policeAlarmCounts.total ? policeAlarmCounts.total : '0'}*/}
                {/*                    </span>*/}
                {/*                ) : null}*/}

                {/*                <span className={styles.unit}>条</span>*/}
                {/*                <img*/}
                {/*                    src={*/}
                {/*                        showDetail && choose == v.jjdzt*/}
                {/*                            ? './image/left_1.png'*/}
                {/*                            : './image/right.png'*/}
                {/*                    }*/}
                {/*                    alt=""*/}
                {/*                    className={styles.btn}*/}
                {/*                />*/}
                {/*            </div>*/}
                {/*        ))}*/}
                {/*    </div>*/}
                {/*    {showDetail ? (*/}
                {/*        <div className={styles.detail}>*/}
                {/*            {this.props.loading ? (*/}
                {/*                <div style={{ textAlign: 'center', marginTop: '130px' }}>*/}
                {/*                    <Spin delay={500} size="large" />*/}
                {/*                </div>*/}
                {/*            ) : (*/}
                {/*                <div className={styles.con}>*/}
                {/*                    {policeAlarmList.map(v => (*/}
                {/*                        <div*/}
                {/*                            className={`${styles.detaillist} ${*/}
                {/*                                toDetail == v.police_alarm_id*/}
                {/*                                    ? styles.chooseDetail*/}
                {/*                                    : null*/}
                {/*                            }`}*/}
                {/*                            key={v.police_alarm_id}*/}
                {/*                            onClick={() => this.chooseDetail(v)}*/}
                {/*                        >*/}
                {/*                            <div className={styles.item}>*/}
                {/*                                <div className={styles.head}>*/}
                {/*                                    <span className={styles.title}>*/}
                {/*                                        {' '}*/}
                {/*                                        <Tooltip title={v.bjlxmc}>*/}
                {/*                                            {v.bjlxmc}*/}
                {/*                                        </Tooltip>*/}
                {/*                                    </span>*/}
                {/*                                    <span className={styles.time}>{v.bjsj}</span>*/}
                {/*                                </div>*/}
                {/*                                <div className={styles.serial}>*/}
                {/*                                    <img src="./image/caidan.png" alt="" />*/}
                {/*                                    <Tooltip title={v.cjdbh}>*/}
                {/*                                        <span className={styles.num}>*/}
                {/*                                            {v.cjdbh}*/}
                {/*                                        </span>*/}
                {/*                                    </Tooltip>*/}
                {/*                                </div>*/}
                {/*                                <div className={styles.address}>*/}
                {/*                                    <img src="./image/weizhi.png" alt="" />*/}
                {/*                                    <Tooltip title={v.afdd}>*/}
                {/*                                        <span className={styles.add}>{v.afdd}</span>*/}
                {/*                                    </Tooltip>*/}
                {/*                                </div>*/}
                {/*                            </div>*/}
                {/*                        </div>*/}
                {/*                    ))}*/}
                {/*                </div>*/}
                {/*            )}*/}
                {/*        </div>*/}
                {/*    ) : null}*/}
                </div>
            </div>
        );
    }
}

export default called;
