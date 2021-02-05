import React from 'react'
import { List, Card, Row, Col, Button, Tag, Modal, Icon } from 'antd'
import styles from './styles.less'

class WrittenWarning extends React.Component {
	constructor(props) {
		super(props)
		this.state = {}
	}

	render() {
		const { files, expandForm, closes } = this.props

		return (
			<div>
				{files && (
					<Card className={`${styles.tableListCard} ${styles.densityTraffic}`}>
						<div className={styles.close} onClick={() => closes()}><Icon type="close" /></div> 
                        <div className={styles.let}>
                            <div className={styles.titles}> 人流密度监测 </div>
                            {
                                files.bayonet
                                &&
                                <Row gutter={[ 16, 0 ]}>
                                <Col span={24}>
                                        <div className={styles.was}>
											<p className={styles.text_title}>人流量 ：</p>
											<p className={styles.text_sub}><span>{files.flow_density}</span>人</p>
										</div>
                                    </Col>
                                    <Col span={12}>
                                        <div className={styles.text}>
											<p className={styles.text_title}>名称 ：</p>
											<p className={styles.text_sub}>{files.bayonet.kkmc}</p>
										</div>
                                    </Col>
									
                                    <Col span={12}>
                                        <div className={styles.text}>
											<p className={styles.text_title}>创建时间 ：</p>
											<p className={styles.text_sub}>{files.bayonet.createtime}</p>
										</div>
                                    </Col>
                                    
                                    <Col span={12}>
                                        <div className={styles.text}>
											<p className={styles.text_title}>信息 ：</p>
											<p className={styles.text_sub}>{files.bayonet.bayonet_message&&files.bayonet.bayonet_message.aa}</p>
										</div>
                                    </Col>
                                    <Col span={12}>
                                        <div className={styles.text}>
                                            <p className={styles.text_title}>逻辑删除标识 ：</p>
											<p className={styles.text_sub}>{files.bayonet.visibale == 1 ? '显示' : '删除'}</p>
										</div>
                                    </Col>
                                    <Col span={12}>
                                        <div className={styles.text}>
											<p className={styles.text_title}>GPS ：</p>
											<p className={styles.text_sub}>{files.bayonet.gps[0]} ，{files.bayonet.gps[1]}</p>
										</div>
                                    </Col>
                                    <Col span={12}>
                                        <div className={styles.text}>
											<p className={styles.text_title}>创建人 ：</p>
											<p className={styles.text_sub}>{files.bayonet.createuser}</p>
										</div>
                                    </Col>
                                    <Col span={12}>
                                        <div className={styles.text}>
											<p className={styles.text_title}>纬度 ：</p>
											<p className={styles.text_sub}>{files.bayonet.wd}</p>
										</div>
                                    </Col>
                                    <Col span={12}>
                                        <div className={styles.text}>
											<p className={styles.text_title}>经度 ：</p>
											<p className={styles.text_sub}>{files.bayonet.jd}</p>
										</div>
                                    </Col>
                                    <Col span={12}>
                                        <div className={styles.text}>
											<p className={styles.text_title}>类型 ：</p>
											<p className={styles.text_sub}>{files.bayonet.bayonet_type == 1 ? '卡口' : files.bayonet.bayonet_type == 2 ? '视频卡口' : files.bayonet.bayonet_type == 3 ? '重点场所' :files.bayonet.bayonet_type == 4 ? '警务站' :''}</p>
										</div>
                                    </Col>
                                    <Col span={12}>
                                        <div className={styles.text}>
											<p className={styles.text_title}>来源 ：</p>
											<p className={styles.text_sub}>{files.bayonet.bayonet_source == 1 ? '系统' : '局方'}</p>
										</div>
                                    </Col>
                                    <Col span={24}>
                                        <div className={styles.text}>
											<p className={styles.text_title}>所属单位 ：</p>
											<p className={styles.text_sub}>{files.bayonet.gxdwmc}</p>
										</div>
                                    </Col>
                                </Row>
                            }
                                
                        
                        </div> 
					</Card>
				)}
			</div>
		)
	}
}

export default WrittenWarning
