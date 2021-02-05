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
class carMsg extends Component {
    render() {
        let { detail, importLoading } = this.props;
        return (
            <Card className={styles.tableListCard}>
                <Spin spinning={importLoading}>
                    {detail ? (
                        <Row className={styles.box}>
                            <Col span={8}>
                                <img src={detail.carPhoto} width={300} />
                            </Col>
                            <Col span={8}>发证机关：{detail.issuingAuthority}</Col>
                            <Col span={8}>车牌号码：{detail.carNumber}</Col>
                            <Col span={8}>车辆类型：{detail.carTypeName}</Col>
                            <Col span={8}>中文品牌：{detail.carBrand}</Col>
                            {/*<Col span={8}>车辆型号：{detail.carNumber}1{detail.carNumber}</Col>*/}
                            <Col span={8}>车辆颜色：{detail.carColor}</Col>
                            <Col span={8}>国产进口：{detail.carImport}</Col>
                            <Col span={8}>制造国：{detail.carCountry}</Col>
                            <Col span={8}>使用性质：{detail.carNature}</Col>
                            <Col span={8}>机号：{detail.carDeviceNumber}</Col>
                            <Col span={8}>代号：{detail.carName}</Col>
                            <Col span={8}>发动机号：{detail.carEngineImei}</Col>
                            <Col span={8}>发动机型号：{detail.carEngineType}</Col>
                            <Col span={8}>燃料种类：{detail.carFuelType}</Col>
                            <Col span={8}>排量：{detail.carDisplacement}</Col>
                            <Col span={8}>功率：{detail.carPower}</Col>
                            <Col span={8}>转向形式：{detail.carTurn}</Col>
                            <Col span={8}>车外廓长：{detail.carLong}</Col>
                            <Col span={8}>车外阔高：{detail.carHigh}</Col>
                            <Col span={8}>前轮距：{detail.carFrontWidth}</Col>
                            <Col span={8}>后轮距：{detail.carBackWidth}</Col>
                            <Col span={8}>总质量：{detail.carTotalMass}</Col>
                            <Col span={8}>核定载质量：{detail.carLoadMass}</Col>
                            <Col span={8}>核定载客：{detail.carLoadNum}</Col>
                            <Col span={8}>所有权：{detail.carOwnership}</Col>
                            <Col span={8}>机动车所有人：{detail.carOwner}</Col>
                            <Col span={8}>身份证名称：{detail.cardType}</Col>
                            <Col span={8}>身份证号：{detail.cardNumber}</Col>
                            <Col span={8}>初次登记日期：{detail.initRegiste}</Col>
                            <Col span={8}>最近定检日期：{detail.lasterRegiste}</Col>
                            <Col span={8}>检验有效期止：{detail.registeEnd}</Col>
                            <Col span={8}>强制报废日期止：{detail.scrapEnd}</Col>
                            <Col span={8}>制造厂名称：{detail.manufacturer}</Col>
                            <Col span={8}>机动车状态：{detail.carStatus}</Col>
                            <Col span={8}>是否抵押：{detail.mortgage}</Col>
                            <Col span={8}>纳税证明：{detail.tax}</Col>
                            <Col span={8}>出厂日期：{detail.productionDate}</Col>
                            <Col span={8}>获取方式：{detail.getType}</Col>
                            <Col span={8}>住所行政区：{detail.district}</Col>
                            <Col span={8}>详细地址：{detail.address}</Col>
                            <Col span={8}>住所邮政编码：{detail.postalCode}</Col>
                        </Row>
                    ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                </Spin>
            </Card>
        );
    }
}

export default Form.create()(carMsg);
