import React from 'react';
import { List, Card, Row, Col, Button, Tag, Modal } from 'antd';
import styles from './styles.less';

class vehicleDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            basicId: '0',
            abnormalId: '0',
            itemId: '0',
            srcImg: '',
            visible: false,
        };
    }
    dataKeyRender = files => {
        let arr = [];
        for (var index in files) {
            // console.log(index ,":", files[index]);
            arr.push({
                value: files[index],
                name: index,
            });
        }
        return arr;
    };
    dataValueRender = files => {
        Object.values(files);
    };
    showAmplification = files => {
        console.log(files);
        //   this.setState({visible: true, srcImg: files})
        window.open(`${'./showImgs.html?srcImg='}${files}`, '_blank');
        //     Modal.confirm({
        //     // title: 'This is a notification message',
        //     width:'730px',
        //     maskClosable: false,
        //     okText:'关闭',
        //     content: (
        //       <div style={{width: '600px'}}>
        //         <img src={files} alt="信息图片" style={{width:'100%'}}/>
        //       </div>
        //     ),
        //     // onOk() {},
        //   });
    };

    render() {
        const { files } = this.props;
        const { itemId, basicId, abnormalId } = this.state;

        return (
            <Card className={styles.tableListCard}>
                {files && (
                    <div>
                        <div style={{ paddingTop: '12px' }}>
                            <Row>
                                <Col span={18} push={6}>
                                    <Row gutter={16}>
                                        <Col className="gutter-row" span={2}>
                                            <div className="gutter-box"></div>
                                        </Col>
                                        <Col className="gutter-row" span={7}>
                                            <div
                                                className={`${'gutter-box'} ${styles.snapPicture}`}
                                            >
                                                <img src={files.comparison_img} alt="抓拍图片" />
                                            </div>
                                            <div className={styles.snapTime}>
                                                <span>{files.verificationPd.hphm}</span>
                                            </div>
                                        </Col>
                                        <Col className="gutter-row" span={2}>
                                            <div className="gutter-box"></div>
                                        </Col>
                                        <Col className="gutter-row" span={6}>
                                            <div className="gutter-box">
                                                <div className={styles.licensePlate}>
                                                    <div>{files.verificationPd.hphm}</div>
                                                    <div>{files.verificationPd.clpp}</div>
                                                    <div>{files.verificationPd.cllx}</div>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Col>
                                {/*<Col span={6} pull={18}  style={{borderRight: '1px solid #1f274c', paddingBottom: '20px'}}>*/}
                                {/*{*/}
                                {/*    files.comparison_img_qriginal*/}
                                {/*    ?*/}
                                {/*    <div className={styles.globalPicture}>*/}
                                {/*        <img src={files.comparison_img_qriginal} alt="信息图片" onClick={() => this.showAmplification(files.comparison_img_qriginal)}/>*/}
                                {/*    </div>*/}
                                {/*    :*/}
                                {/*    null*/}
                                {/*}*/}

                                {/*</Col>*/}
                            </Row>
                        </div>
                        <div style={{ borderTop: '1px solid #1f274c' }}>
                            <Row>
                                <Col span={12}>
                                    <div className={styles.basicInfor}>
                                        <div>
                                            <Row>
                                                <Col span={12} style={{ paddingLeft: '20px' }}>
                                                    <Button.Group>
                                                        {files.basicInformation.length
                                                            ? files.basicInformation.map((v, k) => (
                                                                  <Button
                                                                      key={k}
                                                                      className={
                                                                          basicId != k
                                                                              ? styles.basicUnSelect
                                                                              : styles.basicSelect
                                                                      }
                                                                      onClick={() =>
                                                                          this.setState({
                                                                              basicId: k,
                                                                          })
                                                                      }
                                                                  >
                                                                      {v.tag ? v.tag : '异常人员'}
                                                                  </Button>
                                                              ))
                                                            : null}
                                                    </Button.Group>
                                                    {/*{*/}
                                                    {/*    files.basicInformation.length*/}
                                                    {/*    ?*/}
                                                    <div className={styles.basicInforTitle}>
                                                        {files.basicInformation.length &&
                                                        files.basicInformation[basicId].name
                                                            ? files.basicInformation[basicId].name
                                                            : '异常人员'}
                                                    </div>
                                                    {/*    :*/}
                                                    {/*    null*/}
                                                    {/*}*/}
                                                </Col>
                                            </Row>
                                        </div>
                                        <div className={styles.basicInforColumn}>
                                            <ul>
                                                {this.dataKeyRender(
                                                    files.basicInformation.length &&
                                                        files.basicInformation[basicId].data[0],
                                                ).map((v, k) => (
                                                    <li key={k}>
                                                        <span className={styles.titleColumn}>
                                                            {v.name}
                                                        </span>
                                                        <span className={styles.textColumn}>
                                                            {v.value}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </Col>
                                {/*<Col span={12}>*/}
                                {/*{*/}
                                {/*    files.comparison_exception*/}
                                {/*    ?*/}
                                {/*    <div className={styles.abnormalInfor}>*/}
                                {/*        <div>*/}
                                {/*            <Row>*/}
                                {/*                <Col span={12} style={{paddingLeft: '20px'}}>*/}
                                {/*                    <Button.Group >*/}
                                {/*                    {*/}
                                {/*                        files.tagesInfoList&&files.tagesInfoList.map((v,k) => (*/}
                                {/*                            <Button*/}
                                {/*                                key={k}*/}
                                {/*                                className={ abnormalId != k ? styles.abnormalUnSelect: styles.abnormalSelect}*/}
                                {/*                                onClick={() => this.setState({abnormalId: k})}*/}
                                {/*                            >*/}
                                {/*                                {v.tag}*/}
                                {/*                            </Button>*/}
                                {/*                        ))*/}
                                {/*                    }*/}
                                {/*                    </Button.Group>*/}
                                {/*                    <div className={styles.abnormalInforTitle}>{files.tagesInfoList&&files.tagesInfoList[abnormalId].name}</div>*/}
                                {/*                </Col>*/}
                                {/*                <Col span={12}style={{textAlign: 'center'}}>*/}
                                {/*                </Col>*/}
                                {/*            </Row>*/}
                                {/*        </div>*/}
                                {/*        <div className={styles.basicInforColumn}>*/}
                                {/*            <ul>*/}
                                {/*            {*/}
                                {/*                this.dataKeyRender(files.tagesInfoList&&files.tagesInfoList[abnormalId].data[0]).map((v,k) =>(*/}
                                {/*                    <li key={k}>*/}
                                {/*                        <span className={`${styles.titleColumn} ${styles.abnormalTitle}`}>{v.name}</span>*/}
                                {/*                        <span className={`${styles.textColumn} ${styles.abnormalText}`}>{v.value}</span>*/}
                                {/*                    </li>*/}
                                {/*                ))*/}
                                {/*            }*/}

                                {/*            </ul>*/}
                                {/*        </div>*/}
                                {/*    </div>*/}
                                {/*    :*/}
                                {/*    null*/}
                                {/*}*/}

                                {/*</Col>*/}
                            </Row>
                        </div>
                    </div>
                )}
                {/* <Modal
        //   title="Modal"
          visible={this.state.visible}
          onCancel={() => this.setState({visible: false,srcImg:''})}
          destroyOnClose={true}
          width='800px'
          footer={null}
          maskClosable={false}
           centered={true}
        >
           <img src={this.state.srcImg} alt="信息图片" style={{width:'100%'}}/>
        </Modal> */}
            </Card>
        );
    }
}

export default vehicleDetail;
