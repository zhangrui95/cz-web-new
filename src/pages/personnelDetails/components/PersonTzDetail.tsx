import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Icon,
    Input,
    InputNumber,
    Row,
    Select,
    Table,
    Tag,
    Pagination,
    Message,
    Divider,
    Modal,
    Upload,
    TreeSelect,
    Badge,
    Tooltip,
    Spin,
    Empty,
    Timeline,
} from 'antd';
import React, { Component } from 'react';
import { connect } from 'dva';
import nophoto from '@/assets/nophoto.png';
import styles from '../index.less';
@connect(({ keyCar, loading }) => ({
    keyCar,
    loading: loading.effects['keyCar/fetchNoticeList'],
}))
class PersonTzDetail extends Component {
    state = {
        visible: false,
        list: [],
        record: {},
        hotel:{}
    };
    componentDidMount() {
        this.getTzDetail();
    }
    componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any) {
        if(prevProps.tzList !== this.props.tzList){
            this.props.handleCancel();
        }
    }

    getTzDetail = () => {
        this.props.dispatch({
            type: 'personnelDetails/getPersonHotelDetail',
            payload: {
                hotelId: this.props.record.hotelId,
                personId: this.props.record.personId,
            },
            callback: res => {
                console.log('detail', res);
                if(!res.reason){
                    this.setState({
                        hotel:res.result&&res.result.hotel ? res.result.hotel : {},
                        importLoading:false,
                    })
                }
            },
        });
    };
    getNumberList = () => {
        let list = [];
        for (var i = 101; i <= 120; i++) {
            list.push(
                <div
                    className={
                        i == this.state.hotel.roomNumber
                            ? styles.itemNumber + ' ' + styles.itemNumberChoice
                            : styles.itemNumber
                    }
                >
                    {i}
                </div>,
            );
        }
        return list;
    };
    render() {
        const columns = [
            {
                title: '姓名',
                dataIndex: 'personName',
                ellipsis: true,
            },
            {
                title: '身份证号',
                dataIndex: 'idcard',
                ellipsis: true,
            },
            {
                title: '入住时间',
                dataIndex: 'inTime',
                ellipsis: true,
            },
            {
                title: '退房时间',
                dataIndex: 'outTime',
                ellipsis: true,
            },
            {
                title: '入住房间号',
                dataIndex: 'roomNumber',
                ellipsis: true,
            },
        ];
        const {hotel} = this.state;
        return (
            <div className={styles.tzDetail}>
                <Button type="primary" onClick={this.props.handleCancel} className={styles.back}>
                    返回人员入住列表
                </Button>
                <div className={styles.leftBox}>
                    <div className={styles.leftTitle}>住所房间分布</div>
                    <div className={styles.leftMsg}>
                        <div>姓名：{hotel.personName}</div>
                        <div>身份证号：{hotel.cardId}</div>
                        <div>住宿名称：{hotel.hotelName}</div>
                        <div>入住房间：{hotel.roomNumber}</div>
                        <div>入住时间：{hotel.inTime}</div>
                        <div>退房时间：{hotel.outTime}</div>
                    </div>
                    <div className={styles.ldNumber}>{this.getNumberList()}</div>
                </div>
                <div className={styles.rightBox}>
                    <div className={styles.rightBoxTop}>
                        {
                            hotel&&hotel.tfjList&&hotel.tfjList.map((item)=>{
                                return   <div className={styles.personRoom}>
                                    <img src={item.xp ? item.xp : nophoto} />
                                    <div>
                                        {item.personName} <span style={{ marginLeft: 10 }}>入住房间：{item.roomNumber}</span>
                                    </div>
                                    <div>{item.idcard}</div>
                                </div>
                            })
                        }
                    </div>
                    <div className={styles.rightBoxBottom}>
                        <Table
                            columns={columns}
                            dataSource={this.state.hotel && this.state.hotel.tjdList ? this.state.hotel.tjdList : []}
                            size="default"
                            pagination={false}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default Form.create()(PersonTzDetail);
