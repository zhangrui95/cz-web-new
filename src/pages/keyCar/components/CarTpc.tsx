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
class carTpc extends Component {
    render() {
        const columns = [
            {
                title: '车牌号码',
                dataIndex: 'carNumber',
                ellipsis: true,
            },
            {
                title: '车辆颜色',
                dataIndex: 'cardColor',
                ellipsis: true,
            },
            {
                title: '车辆品牌',
                dataIndex: 'cardPinpai',
                ellipsis: true,
            },
            {
                title: '过车时间',
                dataIndex: 'deckTime',
                ellipsis: true,
            },
            {
                title: '车速（Km/h）',
                dataIndex: 'cardSpeed',
                ellipsis: true,
            },
        ];
        const { tpList, importLoading } = this.props;
        return (
            <Card bordered={false} className={styles.tableListCard}>
                <Spin spinning={importLoading}>
                    {tpList && tpList.length > 0 ? (
                        <Table
                            columns={columns}
                            dataSource={tpList}
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

export default Form.create()(carTpc);
