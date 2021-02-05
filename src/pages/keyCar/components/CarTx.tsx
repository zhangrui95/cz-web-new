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
class carTx extends Component {
    expandedRowRender = (record, index) => {
        const column = [
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
                title: '同行时间',
                dataIndex: 'time',
                ellipsis: true,
            },
        ];
        const datas = record.txList;
        return <Table columns={column} dataSource={datas} pagination={false} showHeader={false} />;
    };
    render() {
        const columns = [
            {
                title: '车牌号码',
                dataIndex: 'carNumber',
                ellipsis: true,
            },
            {
                title: '卡口名称',
                dataIndex: 'inAddress',
                ellipsis: true,
            },
            {
                title: '同行时间',
                dataIndex: 'inTime',
                ellipsis: true,
            },
        ];
        const { txList, importLoading } = this.props;
        console.log('txList', txList);
        return (
            <Card bordered={false} className={styles.tableListCard}>
                <Spin spinning={importLoading}>
                    {txList && txList.length > 0 ? (
                        <Table
                            columns={columns}
                            dataSource={txList}
                            size="default"
                            pagination={false}
                            expandedRowRender={this.expandedRowRender}
                            defaultExpandedRowKeys={txList.length > 0 ? [0] : []}
                        />
                    ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                </Spin>
            </Card>
        );
    }
}

export default Form.create()(carTx);
