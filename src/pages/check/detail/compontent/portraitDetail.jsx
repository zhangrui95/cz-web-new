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
     console.log(files)
    
    return (
         <Card className={styles.tableListCard}>
         
         {
             files
             &&
                <div>
                    
                    <div>
                        <Row>
                            <Col span={12}>
                            {
                                files.basicInformation
                                ?
                                <div className={styles.basicInfor}>
                                    <div>
                                        <Row>
                                            <Col span={12} style={{paddingLeft: '20px'}}>
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
                                                {
                                                    files.basicInformation.length
                                                    ?
                                                    <div className={styles.basicInforTitle}>{files.basicInformation[basicId].name}</div>
                                                    :
                                                    null
                                                }
                                                
                                            </Col>
                                            <Col span={12}style={{textAlign: 'center'}}>
                                            {
                                                files.basicInformation.length
                                                ?
                                                <div className={styles.basicInforImg}> 
                                                {
                                                    files.basicInformation[basicId].data[0]
                                                    ?
                                                    <img src={files.basicInformation[basicId].data[0].XP} alt="信息图片"/>
 :null
                                                }
                                                   
                                                </div>
                                                :
                                                null
                                            }
                                                
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
                                    :
                                    null
                            }
                                
                                    
                            </Col>
                            <Col span={12}>
                            {
                                files.comparison_exception
                                ?
                                <div className={styles.abnormalInfor}>
                                    <div>
                                        <Row>
                                            <Col span={12} style={{paddingLeft: '20px'}}>
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
            }
            
        </Card>
    )
  }
}


export default portraitDetail;