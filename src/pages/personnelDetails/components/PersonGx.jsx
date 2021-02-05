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
    Empty,
    Modal,
    Upload,
    TreeSelect,
    Tooltip,
    Badge,
} from 'antd';
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from '../index.less';
import ReactEcharts from 'echarts-for-react';
import zyry from './../../../../public/image/zyry.png';
import glr from '@/assets/glr.png';
import userPerson from '@/assets/userPerson.png';
import echarts from 'echarts';

@connect(({ personnelDetails, loading }) => ({
    personnelDetails,
    loading: loading.models.personnelDetails,
}))
class PersonGx extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    getOption = () => {
        let { gtgxList } = this.props;
        console.log('gtgxList', gtgxList);
        let data = [
            {
                name: gtgxList.name ? gtgxList.name : '',
                draggable: true,
                symbol: 'image://' + userPerson,
                symbolSize: 55,
            },
        ];
        let link = [];
        gtgxList &&
            gtgxList.list &&
            gtgxList.list.length > 0 &&
            gtgxList.list.map((item, index) => {
                data.push({
                    name: item.name,
                    category: 1,
                    draggable: true,
                    symbol: 'image://' + glr,
                    symbolSize: 40,
                });
                link.push({
                    source: 0,
                    target: index + 1,
                    category: 0,
                    value: item.relation,
                });
            });
        const option = {
            title: {
                text: '',
            },
            tooltip: {
                show: false,
            },
            animationDurationUpdate: 1500,
            animationEasingUpdate: 'quinticInOut',
            label: {
                position: 'bottom',
                formatter: '{b}',
                color: '#fff',
                normal: {
                    show: true,
                    textStyle: {
                        fontSize: 12,
                    },
                },
            },
            legend: {
                x: 'center',
                show: false,
                data: ['夫妻', '战友', '亲戚'],
            },
            series: [
                {
                    type: 'graph',
                    layout: 'force',
                    symbolSize: 55,
                    focusNodeAdjacency: true,
                    roam: true,
                    categories: [
                        {
                            name: '夫妻',
                            itemStyle: {
                                normal: {
                                    color: '#009800',
                                },
                            },
                        },
                        {
                            name: '战友',
                            itemStyle: {
                                normal: {
                                    color: '#4592FF',
                                },
                            },
                        },
                        {
                            name: '亲戚',
                            itemStyle: {
                                normal: {
                                    color: '#3592F',
                                },
                            },
                        },
                    ],
                    label: {
                        normal: {
                            show: true,
                            textStyle: {
                                fontSize: 14,
                            },
                        },
                    },
                    force: {
                        repulsion: 2500,
                    },
                    edgeSymbolSize: [4, 50],
                    edgeLabel: {
                        normal: {
                            show: true,
                            textStyle: {
                                fontSize: 14,
                            },
                            formatter: '{c}',
                        },
                    },
                    data: data,
                    links: link,
                    lineStyle: {
                        normal: {
                            opacity: 0.9,
                            width: 2,
                            curveness: 0.3,
                        },
                    },
                },
            ],
        };
        return option;
    };
    render() {
        let { gtgxList } = this.props;
        return (
            <Card className={styles.tableListCard}>
                {gtgxList && gtgxList.list && gtgxList.list.length > 0 ? (
                    <ReactEcharts
                        option={this.getOption()}
                        style={{ height: '600px' }}
                        className="react_for_echarts"
                    />
                ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
            </Card>
        );
    }
}

export default Form.create()(PersonGx);
