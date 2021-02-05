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
	Divider
} from 'antd'
import React, { Component } from 'react'
import { connect } from 'dva'
import styles from './index.less'

@connect(({ screen, loading }) => ({
	screen,
	loading: loading.models.screen
}))
class leaderDuty extends React.Component {
	state = {
		isCar: false,
		setHeight: 0, //警员信息位置
		upDown: 'up' //警员信息左右切换开关
	}
	componentDidMount() {
        this.getDutyPoliceList()
    }
    getDutyPoliceList = () => {
        console.log(this.props)
        const { dispatch } = this.props
        
        dispatch({
			type: 'screen/getDutyPoliceList',
			payload: {
				jybmbm: JSON.parse(sessionStorage.getItem('user')).department
			}
		})
    }
	render() {
		const { screen:{ dutyPoliceList, scheduleList }, vehicleState } = this.props
		const { isCar, setHeight, upDown } = this.state

		return (
			<div className={styles.leaderDuty}>
				<div className={styles.classificationTitle} style={{ backgroundImage: "url('./image/bt_bj.png')" }}>
					{vehicleState ? '值班警员信息' : '分局值班领导'}
				</div>
                
                {
                    vehicleState && scheduleList && scheduleList.length || !vehicleState && dutyPoliceList && dutyPoliceList.length
                    ?
                    <div className={styles.content}>
                   
                    {
                        vehicleState
                        ?
                        <div
                            className={styles.list}
                            style={{
                                height: `${Math.ceil(scheduleList.length / 2) * 90}${'px'}`,
                                top: `${setHeight}${'px'}`
                            }}
                        >
                            {scheduleList.map((v) => (
                                <div
                                    key={v.duty_police_id}
                                    className={`${styles.item} ${vehicleState ? styles.itemPi : null}`}
                                    style={{ backgroundImage: "url('./image/zbld_bg.png')" }}
                                >
                                    <div className={styles.head}>
                                        <span className={styles.name}>{v.policename}</span>
                                        {
                                            v.schedule_begin_time != ''
                                            ?
                                            <span className={styles.time}>{v.schedule_begin_time}-{v.schedule_end_time}</span>
                                            :
                                            null
                                        }
                                        
                                    </div>
                                    <div className={styles.phone}>
                                        <img src="./image/dh.png" alt="" />
                                        <span>{v.contact}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        :
                        <div
                            className={styles.list}
                        >
                            {dutyPoliceList.map((v) => (
                                <div
                                    key={v.duty_police_id}
                                    className={`${styles.item} ${vehicleState ? styles.itemPi : null}`}
                                    style={{ backgroundImage: "url('./image/zbld_bg.png')" }}
                                >
                                    <div className={styles.head}>
                                        <span className={styles.name}>{v.police_name}</span>
                                        <span className={styles.time}>{v.duty_start_time}-{v.duty_end_time}</span>
                                    </div>
                                    <div className={styles.phone}>
                                        <img src="./image/dh.png" alt="" />
                                        <span>{v.contact}</span>
                                    </div>
                                    {!vehicleState ? <p className={styles.tag}>{v.job}</p> : null}
                                </div>
                            ))}
                        </div>
                    }
                        
                    </div>
                    :
                    <div className={styles.noleaderDuty}>
                        <img src="./image/ryqs.png" alt=""/>
                        <p>{vehicleState ? '暂无值班警员' : '暂无值班领导'}</p>
                    </div>
                }
				{
                    vehicleState && scheduleList && scheduleList.length > 2 || !vehicleState && dutyPoliceList && dutyPoliceList.length > 2
                    ?
                (
					<div className={styles.btn}>
						<img
							src="./image/b_up.png"
							alt=""
							className={`${styles.up} ${upDown == 'up' ? styles.isOpacity : null}`}
                            onClick={() => {
                                const num = setHeight + 90
                                // console.log(setHeight, num * -1, Math.ceil(scheduleList.length / 2) * 90)
                                if (Math.ceil(scheduleList.length / 2) * 90 - 90 >= num * -1 && setHeight * -1 > 0) {
                                    if (num * -1 == 0) {
                                        this.setState({ setHeight: num, upDown: 'up' })
                                    } else {
                                        this.setState({ setHeight: num, upDown: '' })
                                    }
                                } else {
                                    this.setState({ upDown: 'up' })
                                }
                            }}
						/>
						<img 
                            src="./image/b_down.png" 
                            alt="" 
                            className={`${styles.down} ${upDown == 'down' ? styles.isOpacity : null}`} 
                            onClick={() => {
                                const num = setHeight - 90
                                // console.log(setHeight, num * -1, Math.ceil(scheduleList.length / 2) * 90)
                                if (Math.ceil(scheduleList.length / 2) * 90 - 90 > num * -1) {

                                    this.setState({ setHeight: num, upDown: '' })
                                }else if(Math.ceil(scheduleList.length / 2)* 90 - 90 == num * -1){
                                    this.setState({ setHeight: num, upDown: 'down' })
                                } else {
                                    this.setState({ upDown: 'down' })
                                }
                            }}
                        />
					</div>
				) : null}
			</div>
		)
	}
}

export default leaderDuty
