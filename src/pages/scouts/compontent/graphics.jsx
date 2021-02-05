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
import { G2, Chart, Geom, Axis, Tooltip, Coord, Label, Legend, View, Guide, Shape, Facet, Util } from 'bizcharts'
import React, { Component } from 'react'
import { connect } from 'dva'
import styles from './../index.less'
import ReactEcharts from 'echarts-for-react'
import echarts from 'echarts'

let arr = [ '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月' ]

const mytextStyle = {
	color: '#333', //文字颜色
	fontStyle: 'normal', //italic斜体  oblique倾斜
	fontWeight: 'normal', //文字粗细bold   bolder   lighter  100 | 200 | 300 | 400...
	// fontFamily:"sans-serif",   //字体系列
	fontSize: 12 //字体大小
}
@connect(({ scouts, loading }) => ({
	scouts,
	loading: loading.models.scouts
}))
class graphics extends React.Component {
	state = {
		muneKey: 'year'
	}
	componentDidMount() {
		this.getDataList()
	}
	getDataList = (file) => {
		const { dispatch } = this.props
		const { muneKey } = this.state

		dispatch({
			type: 'scouts/fetchStatistics',
			payload: {
				// department: JSON.parse(sessionStorage.getItem('user')).department,
				type: file ? file : muneKey
			}
		})

		const mycharts = document.getElementById('echart')
		console.log(mycharts)
	}
	getOption = () => {
		const { scouts: { data } } = this.props
		//  if(data.checkTotal){
		const option = {
			title: {
				text: '核查/抓拍人员次数',
				left: 'center',
				textStyle: {
					color: '#fff'
				}
			},
			tooltip: {
				trigger: 'item',
				formatter: '{b} <br/>{a} : {c} 次 ({d}%)',
				textStyle: {
					color: '#fff'
				}
			},
			legend: {
				type: 'scroll',
				orient: 'vertical',
				right: 10,
				top: 20,
				bottom: 20,
				// data: data.legendData,
				// selected: data.selected,
				textStyle: {
					color: '#fff'
				}
			},
			series: [
				{
					name: '次数',
					type: 'pie',
					radius: '55%',
					center: [ '40%', '50%' ],
					data: [
						{ value: data.checkTotal.ryhccs, name: '核查人员' },
						{ value: data.checkTotal.ryhcyccs, name: '核查人员异常' },
						{ value: data.checkTotal.ryzpcs, name: '抓拍人员' },
						{ value: data.checkTotal.ryzpyccs, name: '抓拍人员异常' }
					],
					color: [ '#FF9F7F', '#32C5E9', '#9FE6B8', '#FFDB5C' ],
					emphasis: {
						itemStyle: {
							shadowBlur: 10,
							shadowOffsetX: 0,
							shadowColor: 'rgba(0, 0, 0, 0.5)'
						}
					}
				}
			]
		}
		return option
		//  }
	}
	getOptionCar = () => {
		const { scouts: { data } } = this.props
		// if(data.checkTotal){
		const option = {
			title: {
				text: ' 核查/抓拍车辆次数',
				left: 'center',
				textStyle: {
					color: '#fff'
				}
			},
			tooltip: {
				trigger: 'item',
				formatter: '{b} <br/>{a} : {c}  次 ({d}%)',
				textStyle: {
					color: '#fff'
				}
			},
			legend: {
				type: 'scroll',
				orient: 'vertical',
				right: 10,
				top: 20,
				bottom: 20,
				// data: data.legendData,
				// selected: data.selected,
				textStyle: {
					color: '#fff'
				}
			},
			series: [
				{
					name: '次数',
					type: 'pie',
					radius: '55%',
					center: [ '40%', '50%' ],
					data: [
						{ value: data.checkTotal.clhcyccs, name: '核查异常车辆' },
						{ value: data.checkTotal.clzpyccs, name: '抓拍异常车辆' },
						{ value: data.checkTotal.clzpcs, name: '抓拍车辆' },
						{ value: data.checkTotal.clhccs, name: '核查车辆' }
					],
					color: [ '#A962F9', '#E95C5C', '#49D78F', '#F6C02D' ],
					emphasis: {
						itemStyle: {
							shadowBlur: 10,
							shadowOffsetX: 0,
							shadowColor: 'rgba(0, 0, 0, 0.5)'
						}
					}
				}
			]
		}
		return option
		//  }
	}
	getCylindricalCar = () => {
		const { scouts: { data } } = this.props
		const { muneKey } = this.state
		let ryzpyc_list = [],
			ryhcyc_list = [],
			clhcyc_list = [],
			clzpyc_list = [],
			months = []
		for (let index = 0; index < data.checkList.length; index++) {
			const element = data.checkList[index]
			if (muneKey == 'year') {
				months.push(element.month)
			} else if (muneKey == 'month') {
				console.log(element.sjrq)
				months.push(element.sjrq)
			} else {
				months.push(element.sjrq)
			}
			ryzpyc_list.push(element.ryzpyccs)
			ryhcyc_list.push(element.ryhcyccs)
			clhcyc_list.push(element.clhcyccs)
			clzpyc_list.push(element.clzpyccs)
		}

		return {
			//  title:{
			//     text:'异常人数/车辆',
			//     left: 'left',
			//     textStyle:{
			//         color:'#fff'
			//     },
			// },
			color: [ '#32C5E9', '#A962F9', '#FFDB5C', '#E95C5C' ],
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow'
				}
			},
			legend: {
				data: [ '核查人员异常次数', '核查车辆异常次数', '抓拍人员异常次数', '抓拍车辆异常次数' ],
				textStyle: {
					color: '#fff'
				}
			},
			toolbox: {
				show: true,
				orient: 'vertical',
				left: 'right',
				top: 'center',
				feature: {
					// mark: {show: true},
					// dataView: {show: true, readOnly: false},
					// magicType: {show: true, type: ['line', 'bar', 'stack', 'tiled']},
					// restore: {show: true},
					// saveAsImage: {show: true}
				}
			},
			xAxis: [
				{
					type: 'category',
					axisTick: { show: false },
					data: months,
					axisLabel: {
						// x轴线 标签修改
						textStyle: {
							color: '#fff', //坐标值得具体的颜色
							fontSize: 12
						}
					},
					axisLine: {
						show: true, // X轴 网格线 颜色类型的修改
						lineStyle: {
							color: '#fff'
						}
					}
				}
			],
			yAxis: [
				{
					type: 'value',
					axisLabel: {
						// x轴线 标签修改
						textStyle: {
							color: '#fff' //坐标值得具体的颜色
						}
					},
					axisLine: {
						show: true, // X轴 网格线 颜色类型的修改
						lineStyle: {
							color: '#fff'
						}
					}
				}
			],
			series: [
				{
					name: '核查人员异常次数',
					type: 'bar',
					barGap: 0,
					// label: labelOption,
					data: ryhcyc_list
				},
				{
					name: '核查车辆异常次数',
					type: 'bar',
					// label: labelOption,
					data: clhcyc_list
				},
				{
					name: '抓拍人员异常次数',
					type: 'bar',
					// label: labelOption,
					data: ryzpyc_list
				},
				{
					name: '抓拍车辆异常次数',
					type: 'bar',
					// label: labelOption,
					data: clzpyc_list
				}
			]
		}
	}
	getLineCar = () => {
		const { scouts: { data } } = this.props
		const { muneKey } = this.state
		let alarm_List = [],
			months = []
		for (let index = 0; index < data.alarmList.length; index++) {
			const element = data.alarmList[index]
			if (muneKey == 'year') {
				months.push(element.month)
			} else if (muneKey == 'month') {
				console.log(element.sjrq)
				months.push(element.sjrq)
			} else {
				months.push(element.sjrq)
			}
			alarm_List.push(element.alarmCount)
		}

		return {
			title: {
				text: '警情统计',
				left: 'center',
				textStyle: {
					color: '#fff'
				}
			},
			// tooltip: {
			//         trigger: 'item',
			//         formatter: '{b} <br/>{a} : {c} 次 ({d}%)',
			//         textStyle:{
			//             color:'#fff'
			//         },
			//     },
			tooltip: {
				trigger: 'axis',
				formatter: '{b} ： {c} 条',
				axisPointer: {
					type: 'shadow'
				}
			},
			xAxis: {
				type: 'category',
				data: months,
				axisLabel: {
					// x轴线 标签修改
					textStyle: {
						color: '#fff' //坐标值得具体的颜色
					}
				},
				axisLine: {
					show: true, // X轴 网格线 颜色类型的修改
					lineStyle: {
						color: '#fff'
					}
				}
			},
			yAxis: {
				type: 'value',
				axisLabel: {
					// x轴线 标签修改
					textStyle: {
						color: '#fff' //坐标值得具体的颜色
					}
				},
				axisLine: {
					show: true, // X轴 网格线 颜色类型的修改
					lineStyle: {
						color: '#fff'
					}
				}
			},
			series: [
				{
					data: alarm_List,
					type: 'line'
				}
			]
		}
	}
	titleChange = (files) => {
		this.setState({ muneKey: files })
		this.getDataList(files)
	}
	render() {
		const { scouts: { data } } = this.props
		const { muneKey } = this.state

		const munes = [
			{
				key: 'year',
				name: '年'
			},
			{
				key: 'month',
				name: '月'
			},
			{
				key: 'week',
				name: '周'
			}
		]

		return (
			<div className={styles.graphics}>
				<div className={styles.btns}>
					<Button.Group>
						{munes.map((v) => (
							<Button
								key={v.key}
								type="primary"
								className={muneKey == v.key ? null : styles.avtion}
								onClick={() => this.titleChange(v.key)}
							>
								{v.name}
							</Button>
						))}
					</Button.Group>
				</div>
				<div className={styles.content}>
					{data.checkTotal ? (
						<div>
							<div className={styles.item}>
								<div className={styles.itemContext}>
									<ReactEcharts
										option={this.getOption()}
										style={{ height: '300px' }}
										className="react_for_echarts"
									/>
								</div>
							</div>
							<div className={styles.item}>
								<div className={styles.itemContext}>
									<ReactEcharts
										option={this.getOptionCar()}
										style={{ height: '300px' }}
										className="react_for_echarts"
									/>
								</div>
							</div>
						</div>
					) : null}
				</div>
				{data.checkList ? (
					<div className={styles.cylindrical}>
						<div className={styles.cylindricalTitle}>异常人次/车次</div>
						<div className={styles.cylindricalContent}>
							<ReactEcharts
								option={this.getCylindricalCar()}
								style={{ height: '300px' }}
								className="react_for_echarts"
							/>
						</div>
					</div>
				) : null}
				<div>
					{data.alarmList ? (
						<div className={styles.brokenLine}>
							<div className={styles.brokenContent}>
								<ReactEcharts
									option={this.getLineCar()}
									style={{ height: '300px' }}
									className="react_for_echarts"
								/>
							</div>
						</div>
					) : null}
				</div>
			</div>
		)
	}
}

export default graphics
