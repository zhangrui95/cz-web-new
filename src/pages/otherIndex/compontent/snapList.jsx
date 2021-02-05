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

@connect(({ otherIndex, captureList,loading }) => ({
	otherIndex,
    captureList,
	loading: loading.models.otherIndex
}))
class snapList extends React.Component {
	state = {}
	componentDidMount() {}
    toDetail = (files,types) => {
        console.log(files)
        const { dispatch, showDetail } = this.props
        let formData = {}
        if(types == '1'){
             formData = {
                  comparison_id: files
             }
        }else {
             formData = {
                  portrait_id: files
             }
        }
		dispatch({
			type: types == '1' ?  'captureList/getVehicleById' : 'captureList/getRecordById',
			payload: { ...formData },
            success: (e) => {
                console.log(e)
                if (e.result.reason.code == '200') {
                    showDetail(types)
					} else {
                        Message.destroy()
						Message.error('获取详情失败')
						return false
					}
            }
		})
    }
	render() {
		const { otherIndex: { snapList },captureData,toSnap } = this.props
		// console.log(this.props)
		return (
			<div className={styles.snapList}>
				<div
					className={styles.classificationTitle}
					style={{ backgroundImage: "url('./image/bt_bj.png')", cursor: 'pointer' }}
					// onClick={() => toSnap()}
				>
					异常抓拍
				</div>
				{captureData && captureData.length ? (
					<div className={styles.content}>
						{captureData.map((v,k) => (
							<div className={styles.item} key={k} onClick={() => this.toDetail(v.portrait_id,v.type)}>
								<div className={styles.con} style={v.type == '0' ? {backgroundImage: `url(./image/Shape.png)`, backgroundColor: '#3a78b4'} : {}}>
									<img
										className={styles.imgs}
										src={v.portrait_img ? v.portrait_img : './image/Shape.png'}
										alt=""
										style={{
											height: v.type == '1' ? '43px' : 'auto',
											marginTop: v.type == '1' ? '14px' : '0'
										}}
									/>
									{v.type == '1' ? <p className={styles.carno}>{v.hphm}</p> : null}
									<p className={styles.name}>{v.portrait_time}</p>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className={styles.nosnapList}>
						<img src="./image/zpqs.png" alt="" />
						<p>暂无抓拍</p>
					</div>
				)}
			</div>
		)
	}
}

export default snapList
