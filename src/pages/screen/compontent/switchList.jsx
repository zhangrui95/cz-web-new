import {
	Button,
	Card,
	Col,
	DatePicker,
	Form,
	Divider,
	Input,
	Row,
	Select,
	Modal,
	Message,
	List,
	Pagination,
	Radio,
	Table,
	Tag
} from 'antd'
import React, { Component } from 'react'
import { connect } from 'dva'
import styles from './index.less'

@connect(({ screen, loading }) => ({
	screen,
	loading: loading.models.screen
}))
class switchList extends React.Component {
	state = {
		showHeat: false,
        showJurisdiction: false,
        showLayer: false,
        dropDown: false,
        showVehicle: true,
        showMonitoring: false,
        showAlert: false,
        showStation: false,
        showIntercom: false,
        showSwan: false,
        showPlace: false,
        showIndividual: false,
	}
	componentDidMount() {


    }
    choose = files => {
        // console.log(files)
        const { showHeat, showJurisdiction, showLayer, dropDown, showVehicle,showMonitoring,showAlert,showStation,showIntercom,showSwan,showPlace,showIndividual } = this.state
        this.props.getData(files)
        switch (files) {
            case 'showHeat':
                this.setState({showHeat: !showHeat})
                // this.getHeatMap()
                break;
            case 'showJurisdiction':
                this.setState({showJurisdiction: !showJurisdiction})
                break;
            case 'showLayer':
                this.setState({showLayer: !showLayer, dropDown: !showLayer})
                break;
            case 'showVehicle':
                this.setState({showVehicle: !showVehicle})
                break;
            case 'showMonitoring':
                this.setState({showMonitoring: !showMonitoring})
                break;
            case 'showAlert':
                this.setState({showAlert: !showAlert})
                break;
            case 'showStation':
                this.setState({showStation: !showStation})
                break;
            case 'showIntercom':
                this.setState({showIntercom: !showIntercom})
                break;
            case 'showSwan':
                this.setState({showSwan: !showSwan})
                break;
            case 'showPlace':
                this.setState({showPlace: !showPlace})
                break;
            case 'showIndividual':
                this.setState({showIndividual: !showIndividual})
                break;
            default:
                break;
        }

    }

	render() {
		const { screen, getData,  } = this.props
        const { showHeat, showJurisdiction, showLayer, dropDown,showVehicle,showMonitoring,showAlert,showStation,showIntercom,showSwan,showPlace,showIndividual } = this.state
		const muneList = [
			{
				title: '热力图',
				icon: './image/rlt_2.png',
				onicon: './image/rlt_1.png',
				type: 'showHeat',
				isDivider: true,
                class:styles.head
			},
			{
				title: '查看辖区',
				icon: './image/ckxq.png',
				onicon: './image/ckxq_1.png',
				type: 'showJurisdiction',
				isDivider: true,
                class:styles.jurisdiction
			},
			{
				title: '数据图层',
				icon: './image/sjtc.png',
				onicon: './image/sjtc_1.png',
				type: 'showLayer',
				isDivider: false,
                class:styles.layer
			}
		]
        const dropDownList = [
			{
				title: '警车',
				icon: './image/jingche.png',
				type: 'showVehicle',
                class:styles.car
			},
			{
				title: '视频监控',
				icon: './image/jk.png',
				type: 'showMonitoring',
                class:styles.monitoring
			},
			{
				title: '警情',
				icon: './image/jq.png',
				type: 'showAlert',
                class:styles.alert
			},
            {
				title: '警务站',
				icon: './image/jwz_2.png',
				type: 'showStation',
                class:styles.station
			},
            {
				title: '对讲机',
				icon: './image/djj.png',
				type: 'showIntercom',
                class:styles.intercom
			},
            {
				title: '卡口',
				icon: './image/kk.png',
				type: 'showSwan',
                class:styles.swan
			},
            {
				title: '重点场所',
				icon: './image/zdcs_2.png',
				type: 'showPlace',
                class:styles.place
			},
            {
				title: '移动单兵设备',
				icon: './image/dbsb.png',
				type: 'showIndividual',
                class:styles.individual
			},
		]
        // console.log(this.state)
		return (
			<div className={styles.switchList}>
            <div className={styles.con}>
				<div className={styles.conten}>
					{muneList.map((v) => (
						<div className={styles.item} key={v.type} onClick={() => this.choose(v.type)}>
							<div className={styles.list}>
                                <img src={this.state[v.type] ? v.onicon : v.icon } alt="" className={`${styles.icons} ${v.class}`} />
								<span className={`${styles.text} ${this.state[v.type] ? styles.onative : null}`}>{v.title}</span>
							</div>
							{v.isDivider ? (
								<div className={styles.line}>
									<Divider type="vertical" className={styles.lineDivider} />
								</div>
							) : null}
						</div>
					))}
				</div>
                {
                    dropDown
                    ?
                    <div className={styles.dropDownMenu}>
                    {
                        dropDownList.map(v =>  <div className={`${styles.item} ${this.state[v.type] ? styles.ative : null}`} key={v.type}  onClick={() => this.choose(v.type)}>

                            <img src={v.icon} alt="" className={`${styles.icons} ${v.class}`} />

                            <span className={styles.text}>{v.title}</span>
                            {
                                this.state[v.type]
                                ?
                                <img src={'./image/xz.png'} alt="" className={styles.selected}/>
                                :
                                null
                            }

                        </div>)
                    }

                    </div>
                    :
                    null

                }
                </div>
			</div>
		)
	}
}

export default switchList
