import React from 'react';
import { List, Card, Row, Col, Button, Tag, Icon  } from 'antd';
import styles from './styles.less';

class Warningplace extends React.Component {
  
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
  dataValueRender = (files) =>{
    Object.values(files)
  }
  render() {
   
    const { files, closes,code } = this.props;
    const { itemId, basicId, abnormalId } = this.state;
     console.log(files)
    
    return (
         <div className={styles.tableListCard}>
         {
             files
             &&
             <div>
             <div className={styles.close} onClick={() => closes(code)}><Icon type="close" /></div>    
                <div>
                    <div className={styles.headers}>
                        {
                            files.comparison_img_qriginal
                            ?
                            <div className={styles.globalPicture}>
                                <img src={files.comparison_img_qriginal} alt="信息图片"/>
                            </div>
                            :
                            null
                        }
                        {
                            files.comparison_img
                            ?
                            <div className={styles.headersnapPicture}>
                                <div className={styles.snapPicture}>
                                    <img src={files.comparison_img} alt="抓拍图片"/>
                                </div>
                                <div className={styles.snapTime}><span>{files.comparison_time}</span></div>
                            </div>
                            :
                            null

                        }  
                        
                        <div className={styles.contrastBody}>
                            <div>{files.verificationPd.hphm}</div>
                            <div>{files.verificationPd.clpp}</div>
                            <div>{files.verificationPd.cllx}</div>
                        </div> 
                    </div> 
                    <div>
                        <Row>
                            <Col span={12}>
                                <div className={styles.basicInfor}>
                                    <div>
                                        <div className={styles.groupButton}>
                                            <Button.Group >
                                                {
                                                    files.basicInformation.length
                                                    ?
                                                    files.basicInformation.map((v, k) => (
                                                        <Button 
                                                            key={k} 
                                                            className={ basicId != k ? styles.basicUnSelect: styles.basicSelect}
                                                            onClick={() => this.setState({basicId: k})} 
                                                        >
                                                            {v.tag}
                                                        </Button>
                                                    ))
                                                    :
                                                    null
                                                }
                                                </Button.Group>
                                        </div>
                                                
                                        <Row>
                                            <Col span={12}>
                                                {
                                                    files.basicInformation.length
                                                    ?
                                                    <div className={styles.basicInforTitle}>{files.basicInformation[basicId].name}</div>
                                                    :
                                                    null
                                                }
                                                
                                            </Col>
                                            <Col span={12}style={{textAlign: 'center'}}>
                                            {/* {
                                                files.basicInformation.length
                                                ?
                                                <div className={styles.basicInforImg}> 
                                                    <img src={files.basicInformation[basicId].data[0].XP} alt="信息图片"/>
                                                </div>
                                                :
                                                null
                                            } */}
                                                
                                            </Col>
                                        </Row>
                                    </div>
                                    <div className={styles.basicInforColumn}>
                                        <ul>
                                        {
                                            this.dataKeyRender(files.basicInformation.length&&files.basicInformation[basicId].data[0]).map((v,k) =>(
                                                <li key={k}>
                                                    <span className={styles.titleColumn}>{v.name}</span>
                                                    <span className={styles.textColumn}>{v.value}</span>
                                                </li>
                                            ))
                                        }
                                        </ul> 
                                    </div>
                                </div>
                            </Col>
                            <Col span={12}>
                            {
                                files.basicInformation.length&&files.comparison_exception
                                ?
                                <div className={styles.abnormalInfor}>
                                    <div>
                                         <div className={styles.groupButton}>
                                                <Button.Group >
                                                {
                                                    files.tagesInfoList&&files.tagesInfoList.map((v,k) => (
                                                        <Button 
                                                            key={k} 
                                                            className={ abnormalId != k ? styles.abnormalUnSelect: styles.abnormalSelect}
                                                            onClick={() => this.setState({abnormalId: k})} 
                                                        >
                                                            {v.tag}
                                                        </Button>
                                                    ))
                                                }
                                                </Button.Group>
                                                </div>
                                        <Row>
                                            <Col span={12}>
                                                <div className={styles.abnormalInforTitle}>{files.tagesInfoList&&files.tagesInfoList[abnormalId].name}</div>
                                            </Col>
                                            <Col span={12}style={{textAlign: 'center'}}>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div className={styles.basicInforColumn}>
                                        <ul>
                                        {
                                            this.dataKeyRender(files.tagesInfoList&&files.tagesInfoList[abnormalId].data[0]).map((v,k) =>(
                                                <li key={k}>
                                                    <span className={`${styles.titleColumn} ${styles.abnormalTitle}`}>{v.name}</span>
                                                    <span className={`${styles.textColumn} ${styles.abnormalText}`}>{v.value}</span>
                                                </li>
                                            ))
                                        }
                                            
                                        </ul> 
                                    </div>
                                </div>
                                :
                                null
                            }
                                
                            </Col>
                        </Row>
                    </div>
                </div>
            
             </div>
         }
         
            
        </div>
    )
  }
}


export default Warningplace;