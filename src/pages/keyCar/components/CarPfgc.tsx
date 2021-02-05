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
class CarPfgc extends Component {
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
                title: '经过频率',
                dataIndex: 'jgpl',
                ellipsis: true,
            },
        ];
        const { pfgcList, importLoading } = this.props;
        return (
            <Card bordered={false} className={styles.tableListCard}>
                <Spin spinning={importLoading}>
                    {pfgcList && pfgcList.length > 0 ? (
                        <Table
                            columns={columns}
                            // loading={this.props.loading || this.state.importLoading}
                            dataSource={pfgcList}
                            // showSizeChanger
                            size="default"
                            pagination={false}
                            // scroll={{ y: 370 }}
                        />
                    ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                </Spin>
            </Card>
        );
    }
}

export default Form.create()(CarPfgc);
