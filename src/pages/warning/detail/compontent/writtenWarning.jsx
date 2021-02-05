import React from 'react'
import { List, Card, Row, Col, Button, Tag, Modal } from 'antd'
import styles from './styles.less'

class WrittenWarning extends React.Component {
	constructor(props) {
		super(props)
		this.state = {}
	}

	render() {
		const { files, expandForm } = this.props

		return (
			<div>
				{files && (
					<Card className={styles.tableListCard}>
						{expandForm == '2' ? (
							<div className={styles.let}>
								<div className={styles.titles}>
									<span>{'未签收'}</span>   {files.jqbh}
								</div>
								<Row gutter={[ 16, 0 ]}>
									<Col span={12}>
										<div className={styles.text}>
											<p className={styles.text_title}>接警单编号 ：</p>
											<p className={styles.text_sub}>{files.cjdbh}</p>
										</div>
									</Col>
									<Col span={12}>
										<div className={styles.text}>
											<p className={styles.text_title}>报警时间 ：</p>
											<p className={styles.text_sub}>{files.bjsj}</p>
										</div>
									</Col>
									<Col span={12}>
										<div className={styles.text}>
											<p className={styles.text_title}>报警人姓名 ：</p>
											<p className={styles.text_sub}>{files.bjrxm}</p>
										</div>
									</Col>
									<Col span={12}>
										<div className={styles.text}>
											<p className={styles.text_title}>警情地点 ：</p>
											<p className={styles.text_sub}>{files.afdd}</p>
										</div>
									</Col>
									<Col span={12}>
										<div className={styles.text}>
											<p className={styles.text_title}>报警电话 ：</p>
											<p className={styles.text_sub}>{files.lxdh}</p>
										</div>
									</Col>
									<Col span={12}>
										<div className={styles.text}>
											<p className={styles.text_title}>警情类别 ：</p>
											<p className={styles.text_sub}>
												{files.bjlbmc} {files.bjlxmc == null ? '' : '-'}{' '}
												{files.bjlxmc == null ? '' : files.bjlxmc}{' '}
												{files.bjxlmc == null ? '' : '-'}{' '}
												{files.bjxlmc == null ? '' : files.bjxlmc}
											</p>
										</div>
									</Col>
									<Col span={12}>
										<div className={styles.text}>
											<p className={styles.text_title}>出警单位 ：</p>
											<p className={styles.text_sub}>{files.cjdwmc}</p>
										</div>
									</Col>
									
                                    <Col span={12}>
										<div className={styles.text}>
											<p className={styles.text_title}>报警人性别 ：</p>
											<p className={styles.text_sub}>{files.bjrxb == 0 ? '男' : '女'}</p>
										</div>
									</Col>
                                    <Col span={12}>
										<div className={styles.text}>
											<p className={styles.text_title}>案发时间 ：</p>
											<p className={styles.text_sub}>{files.afsj}</p>
										</div>
									</Col>
                                    <Col span={12}>
										<div className={styles.text}>
											<p className={styles.text_title}>经度 ：</p>
											<p className={styles.text_sub}>{files.lng}</p>
										</div>
									</Col>
                                    <Col span={12}>
										<div className={styles.text}>
											<p className={styles.text_title}>纬度 ：</p>
											<p className={styles.text_sub}>{files.lat}</p>
										</div>
									</Col>
                                    <Col span={12}>
										<div className={styles.text}>
											<p className={styles.text_title}>报警人 ：</p>
											<p className={styles.text_sub}>{files.bjr}</p>
										</div>
									</Col>
                                    <Col span={12}>
										<div className={styles.text}>
											<p className={styles.text_title}>报警人联系地址 ：</p>
											<p className={styles.text_sub}>{files.bjrlxdz}</p>
										</div>
									</Col>
                                    <Col span={12}>
										<div className={styles.text}>
											<p className={styles.text_title}>案由 ：</p>
											<p className={styles.text_sub}>{files.ay}</p>
										</div>
									</Col>
                                    <Col span={12}>
										<div className={styles.text}>
											<p className={styles.text_title}>报警方式 ：</p>
											<p className={styles.text_sub}>{files.bjfs}</p>
										</div>
									</Col>
                        
                                    <Col span={12}>
										<div className={styles.text}>
											<p className={styles.text_title}>管辖单位名称 ：</p>
											<p className={styles.text_sub}>{files.gxdwmc}</p>
										</div>
									</Col>
                                    <Col span={12}>
										<div className={styles.text}>
											<p className={styles.text_title}>创建时间 ：</p>
											<p className={styles.text_sub}>{files.createtime}</p>
										</div>
									</Col>
                                    <Col span={12}>
										<div className={styles.text}>
											<p className={styles.text_title}>警情级别 ：</p>
											<p className={styles.text_sub}>{files.jqjb}</p>
										</div>
									</Col>
                                    <Col span={12}>
										<div className={styles.text}>
											<p className={styles.text_title}>报警类别名称 ：</p>
											<p className={styles.text_sub}>{files.bjlbmc}</p>
										</div>
									</Col>
                                    <Col span={12}>
										<div className={styles.text}>
											<p className={styles.text_title}>逻辑删除标识 ：</p>
											<p className={styles.text_sub}>{files.visibale == 1 ? '显示' : '删除'}</p>
										</div>
									</Col>
                                    <Col span={12}>
										<div className={styles.text}>
											<p className={styles.text_title}>报警内容 ：</p>
											<p className={styles.text_sub}>{files.bjnr}</p>
										</div>
									</Col>
                                   
                                </Row>
							</div>
						) : 
                        <div className={styles.let}>
                            <div className={styles.titles}> 人流密度监测 </div>
                            {
                                files.bayonet
                                &&
                                <Row gutter={[ 16, 0 ]}>
                                    <Col span={12}>
                                        <div className={styles.text}>
											<p className={styles.text_title}>名称 ：</p>
											<p className={styles.text_sub}>{files.bayonet.kkmc}</p>
										</div>
                                    </Col>
									<Col span={12}>
                                        <div className={styles.text}>
											<p className={styles.text_title}>人流量 ：</p>
											<p className={styles.text_sub}>{files.flow_density}人</p>
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
                                    <Col span={12}>
                                        <div className={styles.text}>
											<p className={styles.text_title}>所属单位 ：</p>
											<p className={styles.text_sub}>{files.bayonet.gxdwmc}</p>
										</div>
                                    </Col>
                                </Row>
                            }
                                
                        
                        </div> }
					</Card>
				)}
			</div>
		)
	}
}

export default WrittenWarning
