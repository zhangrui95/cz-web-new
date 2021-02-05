import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Icon,
    Steps,
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
    Empty,
    Spin,
    Tooltip,
} from 'antd';
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from '../index.less';
import moment from 'moment';
const Step = Steps.Step;
class CarGj extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: 0, // 需要展示几行时间轴
            y: 0, // 需要展示几个竖
            arryData: [], // 将数据按照每行分组
        };
    }

    componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any) {
        if (prevProps.arryData !== this.props.arryData) {
            const videoTrack = this.props.arryData;
            console.log('videoTrack----->', videoTrack);
            const data = videoTrack;
            const list = 6; // 获取到配置中默认每行展示数
            // data.length = 8;
            const xcount = data && data.length > 0 ? Math.ceil(data.length / list) : 0; // 向上取整的获取总行数
            this.setState({
                x: xcount,
                y: xcount - 1,
            });
            let arryData = [];
            if (xcount > 0) {
                if (xcount === 1) {
                    arryData.push(data);
                } else if (xcount > 1) {
                    for (let i = 0; i < xcount; i++) {
                        if (i === xcount - 1) {
                            // 最后一行可能不满每行展示数个需要单独处理
                            const rever = data.slice(list * i, data.length);
                            arryData.push(rever);
                        } else {
                            const rever = data.slice(list * i, list * i + list);
                            arryData.push(rever);
                        }
                    }
                }
            }
            this.setState({
                arryData,
            });
        }
    }

    timeline = arryData => {
        console.log('arryData----?', arryData);
        const customDot = dot => <span> {dot} </span>;
        return arryData.map((item, index) => {
            return (
                // everyDiv
                <div
                    style={{ position: 'relative' }}
                    key={`timeline${index}`}
                    className={index % 2 === 0 ? 'single' : 'double'}
                >
                    <Steps current={null} progressDot={customDot}>
                        {this.showX(item)}
                    </Steps>
                    <div
                        className={
                            index == arryData.length - 1
                                ? ''
                                : index % 2 === 0
                                ? styles.verticalRight
                                : styles.verticalLeft
                        }
                    />
                </div>
            );
        });
    };

    showX = data => {
        // 展示每行时间轴
        console.log('data', data);
        return data.map((item, index) => {
            return (
                <Step
                    title={
                        <Tooltip
                            title={
                                item.carPhoto ? <img src={item.carPhoto} width={200} /> : '暂无图片'
                            }
                        >
                            <div>{item.address}</div>
                        </Tooltip>
                    }
                    key={index}
                    description={
                        <div>
                            <div>{moment(item.trackTime).format('YYYY-MM-DD')}</div>
                            <div>{moment(item.trackTime).format('HH:mm:ss')}</div>
                        </div>
                    }
                />
            );
        });
    };
    render() {
        let { arryData } = this.state;
        let { importLoading } = this.props;
        return (
            <Card className={styles.tableListCard}>
                <Spin spinning={importLoading}>
                    {arryData && arryData.length > 0 ? (
                        <div style={{ width: '100%', marginTop: '8px' }} className="trajectory">
                            <Row>
                                <Col span={24}>
                                    <div className={styles.track}>{this.timeline(arryData)}</div>
                                </Col>
                            </Row>
                        </div>
                    ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                </Spin>
            </Card>
        );
    }
}

export default Form.create()(CarGj);
