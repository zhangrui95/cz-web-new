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
    Empty,
    Spin,
} from 'antd';
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from '../index.less'; //importLoading
@connect(({ personnelDetails, loading, keyPersonnel, warningRules }) => ({
    personnelDetails,
    keyPersonnel,
    warningRules,
    loading: loading.effects['personnelDetails/fetchNoticeList'],
}))
class PersonMsg extends Component {
    componentDidMount() {
        this.getBasis();
    }
    getBasis = () => {
        this.props.dispatch({
            type: 'personnelDetails/getPersonArchivesList',
            payload: {
                data: {
                    archives_type_codes: [
                        window.configUrl.edzxx, //二代证信息
                        window.configUrl.jszxx, //驾驶证信息
                        window.configUrl.czrkxx, //常驻人口信息
                        window.configUrl.zzrkxx, //暂住人口信息
                    ],
                    person_id:
                        this.props.location &&
                        this.props.location.query &&
                        this.props.location.query.id
                            ? this.props.location.query.id
                            : '',
                },
                type: '1',
                lable: '1',
            },
        });
    };
    dataKeyRender = files => {
        let arr = [];
        for (var index in files) {
            // console.log(index ,":", files[index]);
            arr.push({
                value: files[index],
                name: `${index}：`,
            });
        }
        return arr;
    };
    renderBasis = () => {
        const {
            tabs,
            form,
            personnelDetails: { information },
        } = this.props;
        return (
            <div className={styles.item}>
                <div className={styles.content}>
                    <ul className={styles.itemUl}>
                        {this.dataKeyRender(
                            information &&
                                information.length &&
                                information[0].archives_info &&
                                information[0].archives_info.length &&
                                information[0].archives_info[0],
                        ).map((v, k) =>
                            v.name != '相片' ? (
                                <li key={k}>
                                    <span className={styles.titleColumn}>{v.name}</span>
                                    <span className={styles.textColumn}>{v.value}</span>
                                </li>
                            ) : (
                                ''
                            ),
                        )}
                    </ul>
                    {information &&
                    information.length &&
                    information[0].archives_info &&
                    information[0].archives_info.length &&
                    information[0].archives_info[0].相片 ? (
                        <img src={information[0].archives_info[0].相片} alt="" />
                    ) : null}
                </div>
            </div>
        );
    };
    render() {
        let { hideXp } = this.props;
        let detail = {};
        let importLoading = false;
        return (
            <Card className={styles.tableListCard}>
                <Spin spinning={importLoading}>
                    {detail ? (
                        <div className={styles.infors}>
                            <Row className={styles.box}>
                                {hideXp ? (
                                    ''
                                ) : (
                                    <Col span={8}>
                                        <img src={'./image/nophoto.png'} height={210} />
                                    </Col>
                                )}
                                {this.renderBasis()}
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

export default Form.create()(PersonMsg);
