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
} from 'antd';
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from '../index.less';
class carCcrc extends Component {
    render() {
        const columns = [
            {
                title: '车牌号码',
                dataIndex: 'carNumber',
                ellipsis: true,
            },
            {
                title: '卡口名称',
                dataIndex: 'address',
                ellipsis: true,
            },
            {
                title: '过车时间',
                dataIndex: 'passTime',
                ellipsis: true,
            },
            {
                title: '汽车品牌',
                dataIndex: 'pinpai',
                ellipsis: true,
            },
            {
                title: '车辆颜色',
                dataIndex: 'color',
                ellipsis: true,
            },
            {
                title: '车速（Km/h）',
                dataIndex: 'speed',
                ellipsis: true,
            },
        ];
        const { ccrcList, importLoading } = this.props;
        return (
            <Card bordered={false} className={styles.tableListCard}>
                <Spin spinning={importLoading}>
                    {ccrcList && ccrcList.length > 0 ? (
                        <Table
                            columns={columns}
                            dataSource={ccrcList}
                            size="default"
                            pagination={false}
                        />
                    ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                </Spin>
            </Card>
        );
    }
}

export default Form.create()(carCcrc);
