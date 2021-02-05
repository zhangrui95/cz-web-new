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
import moment from 'moment';
@connect(({ keyCar, loading }) => ({
    keyCar,
    loading: loading.effects['keyCar/fetchNoticeList'],
}))
class CarLxwg extends Component {
    state = {
        visible: false,
        list: [],
        record: {},
    };
    detail = record => {
        this.props.dispatch({
            type: 'keyCar/getViolationByNumber',
            payload: {
                carNumber: record.carNumber,
            },
            callback: res => {
                if (!res.reason) {
                    this.setState({
                        list: res.result && res.result.violations ? res.result.violations : [],
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
        const { wgList, importLoading } = this.props;
        const columns = [
            {
                title: '车牌号码',
                dataIndex: 'carNumber',
                ellipsis: true,
            },
            {
                title: '经过频率',
                dataIndex: 'fwcs',
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
        return (
            <Card bordered={false} className={styles.tableListCard}>
                <Spin spinning={importLoading}>
                    {wgList && wgList.length > 0 ? (
                        <Table
                            columns={columns}
                            // loading={this.props.loading || this.state.importLoading}
                            dataSource={wgList}
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
                            <span style={{ marginLeft: 30 }}>次数：{this.state.record.fwcs}</span>
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
                                    <span>时间：{item.violationTime}</span>
                                    <span style={{ marginLeft: 30 }}>地点：{item.address}</span>
                                </Timeline.Item>
                            );
                        })}
                    </Timeline>
                </Modal>
            </Card>
        );
    }
}

export default Form.create()(CarLxwg);
