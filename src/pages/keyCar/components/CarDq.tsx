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
class carDq extends Component {
    render() {
        const columns = [
            {
                title: '车牌号码',
                dataIndex: 'carNumber',
                ellipsis: true,
            },
            {
                title: '盗抢地点',
                dataIndex: 'address',
                ellipsis: true,
            },
            {
                title: '盗抢时间',
                dataIndex: 'robberyTime',
                ellipsis: true,
            },
            {
                title: '相关案件',
                dataIndex: 'caseName',
                ellipsis: true,
            },
            {
                title: '作案人',
                dataIndex: 'person',
                ellipsis: true,
            },
            {
                title: '案件状态',
                dataIndex: 'caseStatus',
                ellipsis: true,
            },
        ];
        const { dqList, importLoading } = this.props;
        return (
            <Card bordered={false} className={styles.tableListCard}>
                <Spin spinning={importLoading}>
                    {dqList && dqList.length > 0 ? (
                        <Table
                            columns={columns}
                            dataSource={dqList}
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

export default Form.create()(carDq);
