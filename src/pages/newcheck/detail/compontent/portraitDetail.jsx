// 人员核查详情
import React from 'react';
import { List, Card, Row, Col, Button, Tag  } from 'antd';
import styles from './styles.less';


class portraitDetail extends React.Component {

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
     console.log('files',files&&files.paint_real&&JSON.parse(files.paint_real).photoPath&&JSON.parse(files.paint_real).photoPath)

    return (
        <Card className={styles.tableListCard}>
            <p style={{fontSize: 16, color: 'rgb(255, 255, 255)', padding:'16px 0'}}>人员信息</p>
            <Row style={{marginBottom:16}}>
                <Col span={6}>
                    <Row>
                        <Col span={4} className={styles.right}>照片：</Col>
                        <Col span={20} >
                            <img alt='图片显示失败' src={files&&files.zpurl?files.zpurl:'./im.png'} width={104} height={106} style={{display:'inline-block'}} />
                            {/*<img alt="图片显示失败" src="./image/im.png" width={104} height={106} />*/}
                        </Col>
                    </Row>
                    <Row style={{marginTop:10}}>
                        <Col span={4} className={styles.right}>标签：</Col>
                        <Col span={20}>
                            <Tag color="magenta">{files&&files.tags?files.tags:''}</Tag>
                        </Col>
                    </Row>
                </Col>
                <Col span={18}>
                    <Row style={{marginBottom:10}}>
                        <Col span={8}>
                            <Row>
                                <Col span={4} className={styles.right}>姓名：</Col>
                                <Col span={20}>{files&&files.name?files.name:''}</Col>
                            </Row>
                        </Col>
                        <Col span={8}>
                            <Row>
                                <Col span={4} className={styles.right}>性别：</Col>
                                <Col span={20}>{files&&files.sex?files.sex:''}</Col>
                            </Row>
                        </Col>
                        <Col span={8}>
                            <Row>
                                <Col span={4} className={styles.right}>民族：</Col>
                                <Col span={20}>{files&&files.nation?files.nation:''}</Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row style={{marginBottom:10}}>
                        <Col span={8}>
                            <Row>
                                <Col span={4} className={styles.right}>生日：</Col>
                                <Col span={20}>{files&&files.birth?files.birth:''}</Col>
                            </Row>
                        </Col>
                        <Col span={8}>
                            <Row>
                                <Col span={4} className={styles.right}>住址：</Col>
                                <Col span={20}>{files&&files.address?files.address:''}</Col>
                            </Row>
                        </Col>
                        <Col span={8}>
                            <Row>
                                <Col span={4} className={styles.right}>卡点：</Col>
                                <Col span={20}>{files&&files.location_name?files.location_name:''}</Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row style={{marginBottom:10}}>
                        <Col span={8}>
                            <Row>
                                <Col span={4} className={styles.right}>身份证号：</Col>
                                <Col span={20}>{files&&files.idcard?files.idcard:''}</Col>
                            </Row>
                        </Col>
                        <Col span={8}>
                            <Row>
                                <Col span={4} className={styles.right}>盘查时间：</Col>
                                <Col span={20}>{files&&files.checktime?files.checktime:''}</Col>
                            </Row>
                        </Col>
                        <Col span={8}>
                            <Row>
                                <Col span={4} className={styles.right}>进/出城：</Col>
                                <Col span={20}>{files&&files.inorout?files.inorout:''}</Col>
                            </Row>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <p style={{fontSize: 16, color: 'rgb(255, 255, 255)', padding:'16px 0',borderTop:'1px solid #1E2A55'}}>警员信息</p>
            <Row style={{marginBottom:16}}>
                <Col span={6}>
                    <Row>
                        <Col span={4} className={styles.right}>姓名：</Col>
                        <Col span={20}>{files&&files.police_name?files.police_name:''}</Col>
                    </Row>
                </Col>
                <Col span={6}>
                    <Row>
                        <Col span={4} className={styles.right}>所在单位：</Col>
                        <Col span={20}>{files&&files.police_unit?files.police_unit:''}</Col>
                    </Row>
                </Col>
                <Col span={6}>
                    <Row>
                        <Col span={4} className={styles.right}>管辖区域：</Col>
                        <Col span={20}>{files&&files.police_area?files.police_area:''}</Col>
                    </Row>
                </Col>
                <Col span={6}>
                    <Row>
                        <Col span={4} className={styles.right}>身份证号：</Col>
                        <Col span={20}>{files&&files.police_idcard?files.police_idcard:''}</Col>
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


export default portraitDetail;
