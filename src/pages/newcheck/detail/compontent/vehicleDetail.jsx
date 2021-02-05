// 车辆核查详情
import React from 'react';
import { List, Card, Row, Col, Button, Tag  } from 'antd';
import styles from './styles.less';

class vehicleDetail extends React.Component {

constructor(props) {
    super(props);
    this.state = {
      basicId: '0',
      abnormalId: '0',
      itemId: '0'
    };
  }
  dataKeyRender = (files) =>{
    let arr = []
    for(var index in files) {
        // console.log(index ,":", files[index]);
        arr.push({
            value: files[index],
            name: index
        })
    }
    console.log(arr)
    return arr
  }

  render() {

    const { files } = this.props;
    const { itemId, basicId, abnormalId } = this.state;
     console.log(files)

    return (
        <Card className={styles.tableListCard}>
            <p style={{fontSize: 16, color: 'rgb(255, 255, 255)', padding:'16px 0'}}>车辆信息</p>
            <Row style={{marginBottom:16}}>
                <Col span={6}>
                    <Row>
                        <Col span={5} className={styles.right}>车辆牌号：</Col>
                        <Col span={19}>{files&&files.license_plate_no?files.license_plate_no:''}</Col>
                    </Row>
                </Col>
                <Col span={6}>
                    <Row>
                        <Col span={5} className={styles.right}>盘查时间：</Col>
                        <Col span={19}>{files&&files.checktime?files.checktime:''}</Col>
                    </Row>
                </Col>
                <Col span={6}>
                    <Row>
                        <Col span={5} className={styles.right}>车辆品牌：</Col>
                        <Col span={19}>{files&&files.car_brand?files.car_brand:''}</Col>
                    </Row>
                </Col>
                <Col span={6}>
                    <Row>
                        <Col span={5} className={styles.right}>所有人姓名：</Col>
                        <Col span={19}>{files&&files.car_owner?files.car_owner:''}</Col>
                    </Row>
                </Col>
            </Row>
            <Row style={{marginBottom:16}}>
                <Col span={6}>
                    <Row>
                        <Col span={5} className={styles.right}>车辆型号：</Col>
                        <Col span={19}>{files&&files.car_model?files.car_model:''}</Col>
                    </Row>
                </Col>
                <Col span={6}>
                    <Row>
                        <Col span={5} className={styles.right}>所有人电话：</Col>
                        <Col span={19}>{files&&files.car_owner_tel?files.car_owner_tel:''}</Col>
                    </Row>
                </Col>
                <Col span={6}>
                    <Row>
                        <Col span={5} className={styles.right}>车身颜色：</Col>
                        <Col span={19}>{files&&files.car_color?files.car_color:''}</Col>
                    </Row>
                </Col>
                <Col span={6}>
                    <Row>
                        <Col span={5} className={styles.right}>VIN码：</Col>
                        <Col span={19}>{files&&files.vin_number?files.vin_number:''}</Col>
                    </Row>
                </Col>
            </Row>
            <Row style={{marginBottom:16}}>
                <Col span={6}>
                    <Row>
                        <Col span={5} className={styles.right}>卡点：</Col>
                        <Col span={19}>{files&&files.location_name?files.location_name:''}</Col>
                    </Row>
                </Col>
                <Col span={6}>
                    <Row>
                        <Col span={5} className={styles.right}>标签：</Col>
                        <Col span={19}>{files&&files.tags?files.tags:''}</Col>
                    </Row>
                </Col>
            </Row>
            <p style={{fontSize: 16, color: 'rgb(255, 255, 255)', padding:'16px 0',borderTop:'1px solid #1E2A55'}}>警员信息</p>
            <Row style={{marginBottom:16}}>
                <Col span={6}>
                    <Row>
                        <Col span={5} className={styles.right}>姓名：</Col>
                        <Col span={19}>{files&&files.police_name?files.police_name:''}</Col>
                    </Row>
                </Col>
                <Col span={6}>
                    <Row>
                        <Col span={5} className={styles.right}>所在单位：</Col>
                        <Col span={19}>{files&&files.police_unit?files.police_unit:''}</Col>
                    </Row>
                </Col>
                <Col span={6}>
                    <Row>
                        <Col span={5} className={styles.right}>管辖区域：</Col>
                        <Col span={19}>{files&&files.police_area?files.police_area:''}</Col>
                    </Row>
                </Col>
                <Col span={6}>
                    <Row>
                        <Col span={5} className={styles.right}>身份证号：</Col>
                        <Col span={19}>{files&&files.police_idcard?files.police_idcard:''}</Col>
                    </Row>
                </Col>
            </Row>
            <p style={{ fontSize: 16, color: 'rgb(255, 255, 255)',padding:'16px 0',borderTop:'1px solid #1E2A55' }}>写实详情</p>
            <Row style={{marginBottom:16}}>
                <Col>
                    {files&&files.paint_real&&JSON.parse(files.paint_real).photoPath&&JSON.parse(files.paint_real).photoPath.length>0?
                        JSON.parse(files.paint_real).photoPath.map((item)=>{
                            return <img alt="图片显示失败" src={item} width={104} height={106} style={{display:'inline-block',marginRight:16}} />
                        })
                        :<div className={styles.bannermodal} style={{maxWidth: '99%', position: 'relative', overflowX: 'auto'}}>
                            <div style={{display: 'flex', flexWrap: 'nowrap'}}>
                                <div style={{fontSize: '16px', color: 'rgb(255, 255, 255)', width: '100%', textAlign: 'center'}}>暂无写实照片</div>
                            </div>
                        </div>
                    }
                </Col>
            </Row>
            <Row>
                <Col span={1} className={styles.right}>
                    详情：
                </Col>
                <Col span={23}>
                    {files&&files.paint_real&&JSON.parse(files.paint_real).text?JSON.parse(files.paint_real).text:''}
                </Col>
            </Row>
        </Card>
    )
  }
}


export default vehicleDetail;
