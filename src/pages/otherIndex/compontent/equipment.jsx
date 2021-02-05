import {
	Button,
	Card,
	Col,
	DatePicker,
	Form,
	Input,
	Row,
	Select,
	Modal,
	Message,
	List,
	Pagination,
	Radio,
	Table,
	Tag,
    Tooltip,
	Divider
} from 'antd'
import React, { Component } from 'react'
import { connect } from 'dva'
import styles from './index.less'

@connect(({ otherIndex, loading }) => ({
	otherIndex,
	loading: loading.models.otherIndex
}))
class equipment extends React.Component {
	state = {}
	componentDidMount() {}
	render() {
		const { otherIndex: { equipmentType, equipmentList } } = this.props
		
		return (
			<div className={styles.equipment}>
				<div className={styles.classificationTitle} style={{ backgroundImage: "url('./image/bt_bj.png')" }}>
					警车装备信息
				</div>
                {
                    equipmentList && equipmentList.length
                    ?
                    <div className={styles.content}>
					{equipmentList.map((v) => (
						<div className={styles.item} key={v.equipment_type} style={{ backgroundImage: v.checkCount < v.total || v.checkCount > v.total ? "url('./image/zbqs_bg.png')" : "url('./image/zb_bg.png')" }}>
							<div className={styles.con}>
								<p className={`${styles.title} ${v.checkCount < v.total || v.checkCount > v.total ? styles.avt : null}`}>
                                	<Tooltip title={equipmentType&&equipmentType.length ? (
                                    equipmentType.find(
                                        (x) => x.code == v.equipment_type
                                    ).name
                                ) : (
                                    ''
                                )}>
                                {equipmentType&&equipmentType.length ? (
                                    equipmentType.find(
                                        (x) => x.code == v.equipment_type
                                    ).name
                                ) : (
                                    ''
                                )}
                                </Tooltip>
                                </p>
								<p className={styles.count}>
									<span className={styles.num}>{v.checkCount}/{v.total}</span>
									<span className={styles.unit}>件</span>
								</p>
							</div>
							<div className={styles.icon}>
								{
                                    v.equipment_type == '5011908'
                                    ?
                                    <img src={v.checkCount < v.total || v.checkCount > v.total ? "./image/jsq_1.png" : "./image/jsq.png"} alt="" />
                                    :
                                    null
                                }
                                {
                                    v.equipment_type == '5011907'
                                    ?
                                    <img src={v.checkCount < v.total || v.checkCount > v.total ? "./image/jsy_1.png" : "./image/jsy.png"} alt="" />
                                    :
                                    null
                                }
                                {
                                    v.equipment_type == '5011911'
                                    ?
                                    <img src={v.checkCount < v.total || v.checkCount > v.total ? "./image/zcq_1.png" : "./image/zcq.png"} alt="" />
                                    :
                                    null
                                }
                                {
                                    v.equipment_type == '5011901'
                                    ?
                                    <img src={v.checkCount < v.total || v.checkCount > v.total ? "./image/fcf_1.png" : "./image/fcf.png"} alt="" />
                                    :
                                    null
                                }
                                {
                                    v.equipment_type == '5011912'
                                    ?
                                    <img src={v.checkCount < v.total || v.checkCount > v.total ? "./image/jjx_1.png" : "./image/jjx.png"} alt="" />
                                    :
                                    null
                                }
                                {
                                    v.equipment_type == '5011906'
                                    ?
                                    <img src={v.checkCount < v.total || v.checkCount > v.total ? "./image/jss_1.png" : "./image/jss.png"} alt="" />
                                    :
                                    null
                                }
                                {
                                    v.equipment_type == '5011903'
                                    ?
                                    <img src={v.checkCount < v.total || v.checkCount > v.total ? "./image/zhb_1.png" : "./image/zhb.png"} alt="" />
                                    :
                                    null
                                }
                                {
                                    v.equipment_type == '5011910'
                                    ?
                                    <img src={v.checkCount < v.total || v.checkCount > v.total ? "./image/qgssd_1.png" : "./image/qgssd.png"} alt="" />
                                    :
                                    null
                                }
                                {
                                    v.equipment_type == '5011905'
                                    ?
                                    <img src={v.checkCount < v.total || v.checkCount > v.total ? "./image/jjd_1.png" : "./image/jjd.png"} alt="" />
                                    :
                                    null
                                }
                                {
                                    v.equipment_type == '5011904'
                                    ?
                                    <img src={v.checkCount < v.total || v.checkCount > v.total ? "./image/tjp_1.png" : "./image/tjp.png"} alt="" />
                                    :
                                    null
                                }
                                {
                                    v.equipment_type == '5011902'
                                    ?
                                    <img src={v.checkCount < v.total || v.checkCount > v.total ? "./image/fhst_1.png" : "./image/fhst.png"} alt="" />
                                    :
                                    null
                                }
                                {
                                    v.equipment_type == '5011909'
                                    ?
                                    <img src={v.checkCount < v.total || v.checkCount > v.total ? "./image/fgbx_1.png" : "./image/fgbx.png"} alt="" />
                                    :
                                    null
                                }
							</div>
						</div>
					))}
				</div>
                :
                <div className={styles.noequipment}>
                    <img src="./image/sbqs.png" alt=""/>
                    <p>暂无装备</p>
                </div>
                }
				
			</div>
		)
	}
}

export default equipment
