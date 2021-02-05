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
import styles from '@/pages/keyPersonnel/index.less';
import PersonTzDetail from './PersonTzDetail';
@connect(({ keyCar, loading }) => ({
    keyCar,
    loading: loading.effects['keyCar/fetchNoticeList'],
}))
class PersonTzList extends Component {
    state = {
        visible: false,
        list: [],
        record: {},
        tldList: [],
    };
    detail = record => {
        this.setState({
            record: record,
            visible: true,
        });
    };
    handleCancel = () => {
        this.setState({
            visible: false,
        });
    };

    render() {
        const columns = [
            {
                title: '姓名',
                dataIndex: 'personName',
                ellipsis: true,
            },
            {
                title: '住宿名称',
                dataIndex: 'hotelName',
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
            {
                title: '操作',
                width: 120,
                render: record => (
                    <span>
                        <a onClick={() => this.detail(record)}>同住详情</a>
                    </span>
                ),
            },
        ];
        const { tzList, importLoading } = this.props;
        const { visible } = this.state;
        return (
            <Card bordered={false} className={styles.tableListCard} style={{ padding: 0 }}>
                {visible ? (
                    <PersonTzDetail
                        {...this.props}
                        {...this.state}
                        handleCancel={this.handleCancel}
                    />
                ) : (
                    <Spin spinning={importLoading}>
                        <Table
                            columns={columns}
                            dataSource={tzList ? tzList : []}
                            size="default"
                            pagination={false}
                        />
                    </Spin>
                )}
            </Card>
        );
    }
}

export default Form.create()(PersonTzList);
