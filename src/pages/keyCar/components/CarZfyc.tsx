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
import styles from '../index.less';
@connect(({ keyCar, loading }) => ({
    keyCar,
    loading: loading.effects['keyCar/fetchNoticeList'],
}))
class CarZfyc extends Component {
    state = {
        visible: false,
        list: [],
        record: {},
    };
    detail = record => {
        this.props.dispatch({
            type: 'keyCar/getOwlListByNumber',
            payload: {
                carNumber: record.carNumber,
            },
            callback: res => {
                if (!res.reason) {
                    this.setState({
                        list: res.result && res.result.owls ? res.result.owls : [],
                        record: record,
                        visible: true,
                    });
                }
            },
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
                title: '车牌号码',
                dataIndex: 'carNumber',
                ellipsis: true,
            },
            {
                title: '次数',
                dataIndex: 'cs',
                ellipsis: true,
            },
            {
                title: '操作',
                width: 120,
                render: record => (
                    <span>
                        <a onClick={() => this.detail(record)}>详情</a>
                    </span>
                ),
            },
        ];
        const { zfycList, importLoading } = this.props;
        return (
            <Card bordered={false} className={styles.tableListCard}>
                <Spin spinning={importLoading}>
                    {zfycList && zfycList.length > 0 ? (
                        <Table
                            columns={columns}
                            // loading={this.props.loading || this.state.importLoading}
                            dataSource={zfycList}
                            // showSizeChanger
                            size="default"
                            pagination={false}
                            // scroll={{ y: 370 }}
                        />
                    ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                </Spin>
                <Modal
                    title={
                        <div>
                            <span>车牌号码：{this.state.record.carNumber}</span>
                            <span style={{ marginLeft: 30 }}>次数：{this.state.record.cs}</span>
                        </div>
                    }
                    visible={this.state.visible}
                    footer={null}
                    maskClosable={false}
                    onCancel={this.handleCancel}
                    centered={true}
                >
                    <Timeline>
                        {this.state.list.map(item => {
                            return (
                                <Timeline.Item>
                                    <span>时间：{item.passTime}</span>
                                    <span style={{ marginLeft: 30 }}>地点：{item.kkmc}</span>
                                </Timeline.Item>
                            );
                        })}
                    </Timeline>
                </Modal>
            </Card>
        );
    }
}

export default Form.create()(CarZfyc);
