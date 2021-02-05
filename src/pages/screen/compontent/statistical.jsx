import { Button, Card, Col, DatePicker, Form, Input, Row, Select, Modal, Message, List, Pagination, Radio, Table, Tag, Divider } from 'antd';
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './index.less';

@connect(({ screen, loading }) => ({
    screen,
    loading: loading.models.screen,
}))
class statistical extends React.Component {
    state = {
        isCar: false
     };
    componentDidMount() { }
    render() {
        const { screen, vehicleStatusList, schedules, vehicleState, vehicleDetailInfor } = this.props;
        const { isCar } = this.state
        const user = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : ''
        return (
            <div className={styles.statistical}>
                <div className={styles.classificationTitle} style={{backgroundImage: "url('./image/bt_bj.png')" }}>{!vehicleState ? `${user != '' ? user.group.name : ''}` : `警车  ${vehicleDetailInfor.carNo}`}</div>
                {
                    !vehicleState ?
                    <div className={styles.attendanceCar}>
                        <div className={styles.item}>
                            <img src="./image/zx_car.png" alt="" className={styles.itemImg}/>
                            <span className={styles.itemTitle}>在线警车</span>
                            <span className={styles.itemCount}>{vehicleStatusList&&vehicleStatusList.length&&vehicleStatusList[0].online ? vehicleStatusList[0].online : '0'}</span>
                        </div>
                        <div className={styles.item}>
                            <img src="./image/lx_car.png" alt="" className={styles.itemImg}/>
                            <span className={styles.itemTitle}>离线警车</span>
                            <span className={styles.itemCount}>{vehicleStatusList&&vehicleStatusList.length&&vehicleStatusList[0].offline ? vehicleStatusList[0].offline : '0'}</span>
                        </div>
                    </div>
                    :
                    <div className={styles.vehicleDetails}>
                        <img src="./image/cth.png" alt=""/>
                        <span className={styles.title}>车台号 :</span>
                        <span className={styles.count}>{vehicleDetailInfor.cth}</span>
                    </div>
                }
                
                
                <div className={styles.line}><img src="./image/dbx.png" alt=""/></div>
                <div className={styles.attendancePersonnel}>
                    <div className={styles.item}>
                    {
                        vehicleState
                        ?
                        <p className={styles.itemCount}>{vehicleDetailInfor.scheduleCounts ? vehicleDetailInfor.scheduleCounts : '0'}</p>
                        :
                        <p className={styles.itemCount}>{schedules.schedule ? schedules.schedule : '0'}</p>
                    }
                        
                        <p className={`${styles.itemTitle} ${styles.should}`}>应出勤人数</p>
                    </div>
                    <div className={styles.item}>
                    {
                        vehicleState
                        ?
                        <p className={styles.itemCount}>{vehicleDetailInfor.attendanceCounts ? vehicleDetailInfor.attendanceCounts : '0'}</p>
                        :
                        <p className={styles.itemCount}>{schedules.attendance ? schedules.attendance : '0'}</p>
                    }
                        
                        <p className={`${styles.itemTitle} ${styles.has}`}>已出勤人数</p>
                    </div>
                    <div className={styles.item}>
                    {
                        vehicleState
                        ?
                        <p className={styles.itemCount}>{vehicleDetailInfor.absenceCounts ? vehicleDetailInfor.absenceCounts : '0'}</p>
                        :
                        <p className={styles.itemCount}>{schedules.absence ? schedules.absence : '0'}</p>
                    }
                        
                        <p className={`${styles.itemTitle} ${styles.lack}`}>缺勤人数</p>
                    </div>
                </div>
            </div>
        );
    }
}


export default statistical;