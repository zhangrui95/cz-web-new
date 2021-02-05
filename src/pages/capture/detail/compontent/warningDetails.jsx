import React from 'react';
import { List, Card, Row, Col, Button, Tag, Modal } from 'antd';
import styles from './style.less';

class warningDetails extends React.Component {
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
        // this.setState({visible: true, srcImg: files})
        window.open(`${'./showImgs.html?srcImg='}${files}`, '_blank');

        //     Modal.info({
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

    //   handleOk = () => {
    //       this.setState({visible: false,imgs: ''})
    //   }
    render() {
        const { files } = this.props;
        const { itemId, basicId, abnormalId } = this.state;
        console.log(files);

        return (
            <Card className={styles.tableListCard}>
                {files && (
                    <div>
                        {files.verificationPortraitDataList && (
                            <div>
                                <div style={{ paddingTop: '12px',float:'left',width:'12%' }}>
                                    <Row>
                                        <Col span={18}>
                                            <Row gutter={16}>
                                                <Col className="gutter-row" span={5}>
                                                    <div className="gutter-box"></div>
                                                </Col>
                                                <Col className="gutter-row" span={4}>
                                                    <div
                                                        className={`${'gutter-box'} ${
                                                            styles.snapPicture
                                                        }`}
                                                    >
                                                        <img
                                                            src={files.portrait_img}
                                                            alt="抓拍图片"
                                                        />
                                                    </div>
                                                    <div className={styles.snapTime}>
                                                        <span>{files.portrait_time}</span>
                                                    </div>
                                                </Col>
                                                {/*{*/}
                                                {/*    files.verificationPortraitDataList.length*/}
                                                {/*    ?*/}
                                                {/*    <Col className="gutter-row" span={2}>*/}
                                                {/*        <div className="gutter-box">*/}
                                                {/*            <img src="./image/qieh.png" alt="左右箭头" style={{position: 'relative',top: '60px'}}/>*/}
                                                {/*        </div>*/}
                                                {/*    </Col>*/}
                                                {/*    :*/}
                                                {/*    null*/}
                                                {/*}*/}

                                                {/*<Col className="gutter-row" span={16}>*/}
                                                {/*    <div className="gutter-box">*/}
                                                {/*        <Row gutter={16}>*/}
                                                {/*        {*/}
                                                {/*            files.verificationPortraitDataList.length*/}
                                                {/*            ?*/}
                                                {/*            files.verificationPortraitDataList.map((v,k) => (*/}
                                                {/*                <Col*/}
                                                {/*                className="gutter-row"*/}
                                                {/*                span={24/files.verificationPortraitDataList.length}*/}
                                                {/*                key={k}*/}
                                                {/*                onClick={() =>this.setState({itemId: k})}*/}

                                                {/*                >*/}
                                                {/*                    <div className={`${'gutter-box'} ${styles.snapPicture}`}>*/}
                                                {/*                        <img src={v.path} alt="抓拍图片"/>*/}
                                                {/*                        <div className={styles.tags}>*/}
                                                {/*                        {*/}
                                                {/*                            v.comparisonData.Tags.map((item, index) => (*/}
                                                {/*                                <div key={index} className={styles.tagItem}><Tag color={item == '正常' ? '#38b248' : ''}>{item}</Tag></div>*/}
                                                {/*                            ))*/}
                                                {/*                        }*/}
                                                {/*                        </div>*/}
                                                {/*                    </div>*/}
                                                {/*                    <div className={styles.contrast}><span className={itemId == k ? styles.contrastCol : ''}>{v.score}%</span></div>*/}

                                                {/*                </Col>*/}
                                                {/*            ))*/}
                                                {/*            :*/}
                                                {/*            null*/}
                                                {/*        }*/}
                                                {/*        </Row>*/}
                                                {/*    </div>*/}
                                                {/*</Col>*/}
                                            </Row>
                                        </Col>
                                        {/*<Col span={6} pull={18}  style={{borderRight: '1px solid #1f274c', paddingBottom: '20px'}}>*/}
                                        {/*{*/}
                                        {/*    files.portrait_img_qriginal*/}
                                        {/*    ?*/}
                                        {/*    <div className={styles.globalPicture}>*/}
                                        {/*        <img src={files.portrait_img_qriginal} alt="信息图片" onClick={() => this.showAmplification(files.portrait_img_qriginal)}/>*/}
                                        {/*    </div>*/}
                                        {/*    :*/}
                                        {/*    null*/}
                                        {/*}*/}

                                        {/*</Col>*/}
                                    </Row>
                                </div>
                                <div style={{float:'left',width:'85%' }}>
                                    <Row>
                                        <Col span={12}>
                                            <div className={styles.basicInfor}>
                                                <div>
                                                    <Row>
                                                        <Col
                                                            span={12}
                                                            style={{ paddingLeft: '20px' }}
                                                        >
                                                            <Button.Group>
                                                                {files.verificationPortraitDataList
                                                                    .length
                                                                    ? files.verificationPortraitDataList[
                                                                          itemId
                                                                      ].comparisonData.basicInformation.map(
                                                                          (v, k) => (
                                                                              <Button
                                                                                  key={k}
                                                                                  className={
                                                                                      basicId != k
                                                                                          ? styles.basicUnSelect
                                                                                          : styles.basicSelect
                                                                                  }
                                                                                  onClick={() =>
                                                                                      this.setState(
                                                                                          {
                                                                                              basicId: k,
                                                                                          },
                                                                                      )
                                                                                  }
                                                                              >
                                                                                  {v.tag}
                                                                              </Button>
                                                                          ),
                                                                      )
                                                                    : null}
                                                            </Button.Group>
                                                            {files.verificationPortraitDataList
                                                                .length ? (
                                                                <div
                                                                    className={
                                                                        styles.basicInforTitle
                                                                    }
                                                                >
                                                                    {
                                                                        files
                                                                            .verificationPortraitDataList[
                                                                            itemId
                                                                        ].comparisonData
                                                                            .basicInformation[
                                                                            basicId
                                                                        ].name
                                                                    }
                                                                </div>
                                                            ) : null}
                                                        </Col>
                                                        <Col
                                                            span={12}
                                                            style={{ textAlign: 'center' }}
                                                        >
                                                            {files.verificationPortraitDataList
                                                                .length &&
                                                            files.verificationPortraitDataList[
                                                                itemId
                                                            ].comparisonData.basicInformation[
                                                                basicId
                                                            ].data[0] &&
                                                            files.verificationPortraitDataList[
                                                                itemId
                                                            ].comparisonData.basicInformation[
                                                                basicId
                                                            ].data[0].XP ? (
                                                                <div
                                                                    className={styles.basicInforImg}
                                                                >
                                                                    <img
                                                                        src={
                                                                            files
                                                                                .verificationPortraitDataList[
                                                                                itemId
                                                                            ].comparisonData
                                                                                .basicInformation[
                                                                                basicId
                                                                            ].data[0].XP
                                                                        }
                                                                        alt="信息图片"
                                                                    />
                                                                </div>
                                                            ) : null}
                                                        </Col>
                                                    </Row>
                                                </div>
                                                <div className={styles.basicInforColumn}>
                                                    <ul>
                                                        {this.dataKeyRender(
                                                            files.verificationPortraitDataList
                                                                .length &&
                                                                files.verificationPortraitDataList[
                                                                    itemId
                                                                ].comparisonData.basicInformation[
                                                                    basicId
                                                                ].data[0],
                                                        ).map((v, k) => (
                                                            <li key={k}>
                                                                <span
                                                                    className={styles.titleColumn}
                                                                >
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
                                        {/*    files.verificationPortraitDataList.length&&files.verificationPortraitDataList[itemId].comparisonData.comparison_exception*/}
                                        {/*    ?*/}
                                        {/*    <div className={styles.abnormalInfor}>*/}
                                        {/*        <div>*/}
                                        {/*            <Row>*/}
                                        {/*                <Col span={12} style={{paddingLeft: '20px'}}>*/}
                                        {/*                    <Button.Group >*/}
                                        {/*                    {*/}
                                        {/*                        files.verificationPortraitDataList&&files.verificationPortraitDataList[itemId].comparisonData.tagesInfoList.map((v,k) => (*/}
                                        {/*                            <Button*/}
                                        {/*                                key={k}*/}
                                        {/*                                className={ abnormalId != k ? styles.abnormalUnSelect: styles.abnormalSelect}*/}
                                        {/*                                onClick={() => this.setState({abnormalId: k})}*/}
                                        {/*                            >*/}
                                        {/*                                {v.tag ? v.tag : '异常人员'}*/}
                                        {/*                            </Button>*/}
                                        {/*                        ))*/}
                                        {/*                    }*/}
                                        {/*                    </Button.Group>*/}
                                        {/*                    <div className={styles.abnormalInforTitle}>{files.verificationPortraitDataList&&files.verificationPortraitDataList[itemId].comparisonData.tagesInfoList[abnormalId].name ? files.verificationPortraitDataList[itemId].comparisonData.tagesInfoList[abnormalId].name : '异常人员'}</div>*/}
                                        {/*                </Col>*/}
                                        {/*                <Col span={12}style={{textAlign: 'center'}}>*/}
                                        {/*                </Col>*/}
                                        {/*            </Row>*/}
                                        {/*        </div>*/}
                                        {/*        <div className={styles.basicInforColumn}>*/}
                                        {/*            <ul>*/}
                                        {/*            {*/}
                                        {/*                this.dataKeyRender(files.verificationPortraitDataList&&files.verificationPortraitDataList[itemId].comparisonData.tagesInfoList[abnormalId].data[0]).map((v,k) =>(*/}
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

export default warningDetails;
