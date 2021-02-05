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
	Divider,
	Result
} from 'antd'

import React, { Component } from 'react'
import { connect } from 'dva'
import styles from './index.less'
import Personnel from './compontent/personnel'
import Vehicle from './compontent/vehicle'



import { authorityIsTrue } from '@/utils/authority'
const carType = [
	{
		code: '01',
		name: '大型汽车'
	},
	{
		code: '02',
		name: '小型汽车'
	},
	{
		code: '03',
		name: '使馆汽车'
	},
	{
		code: '04',
		name: '领馆汽车'
	},
	{
		code: '05',
		name: '港澳入出境车'
	},
	{
		code: '06',
		name: '外籍汽车'
	},
	{
		code: '07',
		name: '两、三轮摩托车'
	},
	{
		code: '08',
		name: '轻便摩托车'
	},
	{
		code: '09',
		name: '使馆摩托车'
	},
	{
		code: '10',
		name: '领馆摩托车'
	},
	{
		code: '11',
		name: '境外摩托车'
	},
	{
		code: '12',
		name: '外籍摩托车'
	},
	{
		code: '13',
		name: '农用运输车'
	},
	{
		code: '14',
		name: '拖拉机'
	},
	{
		code: '15',
		name: '挂车'
	},
	{
		code: '16',
		name: '教练汽车'
	},
	{
		code: '17',
		name: '教练摩托车'
	},
	{
		code: '18',
		name: '试验汽车'
	},
	{
		code: '19',
		name: '试验摩托车'
	},
	{
		code: '20',
		name: '临时入境汽车'
	},
	{
		code: '21',
		name: '临时入境摩托车'
	},
	{
		code: '22',
		name: '临时行驶车'
	},
	{
		code: '23',
		name: '警用汽车'
	},
	{
		code: '24',
		name: '警用摩托'
	},
	{
		code: '25',
		name: '原农机号牌'
	}
]
@connect(({ control, loading }) => ({
	control,
	loading: loading.models.control
}))
class control extends React.Component {
	state = {
		current: authorityIsTrue('czht_lkgl_lkry')
		? '0'
		: authorityIsTrue('czht_lkgl_lkcl')
			? '1'
			:  '',
		// current: '0',
		
		
	}

	componentWillMount() {
		this.queryDictionary(window.configUrl.dictionariesControlPeople)
		this.queryDictionary(window.configUrl.dictionariesControlVehicle)
	}
	queryDictionary = (files) => {
		this.props.dispatch({
			type: 'control/queryDictionary',
			payload: {
				currentPage: 1,
				showCount: 999,
				pd: { pid: files }
			}
		})
	}
	handleMune = (e) => {
		console.log('click ', e)

		this.setState({
			current: e
		})
	}

	
	render() {
		const { control: { data, personnelLabel, vehicleLabel } } = this.props
		const menuList = [
			{ name: '临控人员', key: '0', permissions: 'czht_lkgl_lkry' },
			{ name: '临控车辆', key: '1', permissions: 'czht_lkgl_lkcl' }
		]
		
		
		return (
			<div className={styles.control}>
				<div className={styles.headerInfo}>
					{menuList.map(
						(item) =>
							authorityIsTrue(item.permissions) ? (
								<Button
									type="primary"
									key={item.key}
									size="large"
									className={styles.button}
									style={{ backgroundColor: this.state.current == item.key ? '' : '#333367' }}
									onClick={() => this.handleMune(item.key)}
									// loading={loading}
								>
									{item.name}
								</Button>
							) : null
					)}
				</div>

				{this.state.current != '' ? (
					<div>
						{this.state.current == '0' ? (
							<Personnel carType={carType} 
                            handleCreateModalVisible={() => this.addPeopleModal()} />
						) : null}
						{this.state.current == '1' ? (
							<Vehicle carType={carType} 
                            handleCreateModalVisible={() => this.addCarModal()} />
						) : null}
					</div>
				) : (
					<div>
						<Result status="403" title="403" subTitle="抱歉，您没有相关权限" />
					</div>
				)}
				
                
			</div>
		)
	}
}

export default control
