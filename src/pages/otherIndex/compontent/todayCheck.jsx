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
} from 'antd';
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './index.less';
import moment from 'moment';

@connect(({ otherIndex, loading }) => ({
    otherIndex,
    loading: loading.models.otherIndex,
}))
class todayCheck extends React.Component {
    state = {
        isCar: false,
        carNum:
            // localStorage.getItem('carNum')
            // ? localStorage.getItem('carNum'):
                this.props.comparisonList &&
              this.props.comparisonList.length &&
              this.props.comparisonList[0].comparisonCount
            ? parseInt(this.props.comparisonList[0].comparisonCount)
            : 0,
        personNum:
            // localStorage.getItem('personNum')
            // ? localStorage.getItem('personNum') :
            this.props.comparisonList &&
              this.props.comparisonList.length &&
              this.props.comparisonList[0].portraitCount
            ? parseInt(this.props.comparisonList[0].portraitCount)
            : 0,
    };
    componentDidMount() {
        // setInterval(() => {
        //     let { carNum, personNum } = this.state;
        //     let time = ' 07:00:00';
        //     let newTime = moment().format('YYYY-MM-DD');
        //     let newTimeValue = moment().valueOf();
        //     let timeValue = moment(newTime + time).valueOf();
        //     let oldTimeValue = moment(localStorage.getItem('lastTime')).valueOf();
        //     if ((oldTimeValue <= timeValue && newTimeValue >= timeValue) || (moment().diff(moment(newTime + time), 'seconds') > 0 && moment().diff(moment(newTime + time), 'seconds') <= 10)) {
        //         localStorage.setItem('carNum', 0);
        //         localStorage.setItem('personNum', 0);
        //         localStorage.setItem('lastTime', moment().format('YYYY-MM-DD HH:mm:ss'));
        //         this.setState({ personNum: 0, carNum: 0 });
        //     } else {
        //         carNum = Number(carNum) + Math.floor(Math.random() * (10 - 30) + 30);
        //         personNum = Number(personNum) + Math.floor(Math.random() * (10 - 20) + 20);
        //         localStorage.setItem('carNum', carNum);
        //         localStorage.setItem('personNum', personNum);
        //         localStorage.setItem('lastTime', moment().format('YYYY-MM-DD HH:mm:ss'));
        //         this.setState({ personNum, carNum });
        //     }
        // }, 10000);
    }

    render() {
        const { otherIndex, comparisonList } = this.props;
        const { carNum, personNum } = this.state;
        return (
            <div className={styles.todayCheck}>
                <div
                    className={styles.classificationTitle}
                    style={{ backgroundImage: "url('./image/bt_bj.png')" }}
                >
                    {this.state.isCar ? '警车今日异常核查' : '今日异常核查'}
                </div>
                <div className={styles.content}>
                    {/*<div*/}
                    {/*    className={`${styles.item} ${styles.checkPeople}`}*/}
                    {/*    style={{*/}
                    {/*        flexGrow:*/}
                    {/*            Number(*/}
                    {/*                comparisonList &&*/}
                    {/*                    comparisonList.length &&*/}
                    {/*                    comparisonList[0].portraitCount*/}
                    {/*                    ? comparisonList[0].portraitCount*/}
                    {/*                    : '',*/}
                    {/*            ) + 1,*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    <p className={styles.count}>{personNum}</p>*/}
                    {/*    <p className={styles.title}>核查人次</p>*/}
                    {/*</div>*/}
                    {/*<div*/}
                    {/*    className={`${styles.item} ${styles.checkCar}`}*/}
                    {/*    style={{*/}
                    {/*        flexGrow:*/}
                    {/*            Number(*/}
                    {/*                comparisonList &&*/}
                    {/*                    comparisonList.length &&*/}
                    {/*                    comparisonList[0].comparisonCount*/}
                    {/*                    ? comparisonList[0].comparisonCount*/}
                    {/*                    : '0',*/}
                    {/*            ) + 1,*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    <p className={styles.count}>{carNum}</p>*/}
                    {/*    <p className={styles.title}>核查车次</p>*/}
                    {/*</div>*/}
                    <div
                        className={`${styles.item} ${styles.abnormalPeople}`}
                        style={{
                            flexGrow:
                                Number(
                                    comparisonList &&
                                        comparisonList.length &&
                                        comparisonList[0].portraitExceptionCount
                                        ? comparisonList[0].portraitExceptionCount
                                        : '0',
                                ) + 1,
                        }}
                    >
                        <p className={styles.count}>
                            {comparisonList &&
                            comparisonList.length &&
                            comparisonList[0].portraitExceptionCount
                                ? comparisonList[0].portraitExceptionCount
                                : '0'}
                        </p>
                        <p className={styles.title}>异常人次</p>
                    </div>
                    <div
                        className={`${styles.item} ${styles.abnormalCar}`}
                        style={{
                            flexGrow:
                                Number(
                                    comparisonList &&
                                        comparisonList.length &&
                                        comparisonList[0].comparisonExceptionCount
                                        ? comparisonList[0].comparisonExceptionCount
                                        : '0',
                                ) + 1,
                        }}
                    >
                        <p className={styles.count}>
                            {comparisonList &&
                            comparisonList.length &&
                            comparisonList[0].comparisonExceptionCount
                                ? comparisonList[0].comparisonExceptionCount
                                : '0'}
                        </p>
                        <p className={styles.title}>异常车次</p>
                    </div>
                </div>
                <div
                    className={styles.foot}
                    style={{ backgroundImage: "url('./image/jrkc_bg.png')" }}
                >
                    {/*<div*/}
                    {/*    className={styles.checkPeople}*/}
                    {/*    style={{ flexGrow: Number(personNum) + 1 }}*/}
                    {/*/>*/}
                    {/*<div className={styles.checkCar} style={{ flexGrow: Number(carNum) + 1 }} />*/}
                    <div
                        className={styles.abnormalPeople}
                        style={{
                            minWidth: 5,
                            flexGrow:
                                Number(
                                    comparisonList &&
                                        comparisonList.length &&
                                        comparisonList[0].portraitExceptionCount
                                        ? comparisonList[0].portraitExceptionCount
                                        : '0',
                                ) + 1,
                        }}
                    />
                    <div
                        className={styles.abnormalCar}
                        style={{
                            minWidth: 5,
                            flexGrow:
                                Number(
                                    comparisonList &&
                                        comparisonList.length &&
                                        comparisonList[0].comparisonExceptionCount
                                        ? comparisonList[0].comparisonExceptionCount
                                        : '0',
                                ) + 1,
                        }}
                    />
                </div>
            </div>
        );
    }
}

export default todayCheck;
