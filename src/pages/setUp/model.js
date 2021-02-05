import {
	queryTreeListByPid,
	getUseDept,
	getPoliceUnitList,
	delPoliceUnitList,
	createPoliceUnitList,
	updatePoliceUnitList,
	getShiftsList,
	delShifts,
	updateShifts,
	insertShifts,
	getEquipmentList,
	delEquipment,
	updateEquipment,
	insertEquipment,
	getOrgGpsLabelList,
	insertGpsLabel,
	updateGpsLabel,
	delGpsLabel,
	getpatrolList,
	getpatrolListTree,
	getScheduleListSearch,
	getEquipmentByOrgCode,
	findUserByDeptList,
	getShiftsByOrgCode,
	getPoliceUnitByOrgCode,
	getVehicleList,
	insertSchedule,
	getScheduleByDate,
	updateSchedule,
	getScheduleListPageSearch,
	getGpsLabelAreaListByCode,
	getDutyPoliceUnitByLabelId,
	getGpsLabelLineListByCode,
	copyDaySchedule,
	copyWeekSchedule,
	getAllGpsLabelById,
	getFlowDensitysListByDate,
	getFlowDensitysCountByDate,
	getPoliceAlarmListByDate,
	getPoliceAlarmCountByDate,
	delSchedule,
	getPoliceScheduleList,
	getEquipmentStatisticsList,getAllGpsLabelList,insertnewGpsLabel,updatenewGpsLabel,
} from './service'
import { tableList, reportList } from '@/utils/utils'

const Model = {
	namespace: 'createService',
	state: {
		data: {
			list: [],
			page: {
				currentPage: 1,
				showCount: tableList
			}
		},
		schedulingList: {
			list: [],
			page: {
				currentPage: 1,
				showCount: reportList
			}
		},
		equipmentStatistics: {
			list: [],
			page: {
				currentPage: 1,
				showCount: tableList
			}
		},
		statisticsHead: [],
		policeList: [],
		useList: [],
		exportlist: {},
		equipmentState: [],
		equipmentType: [],
		gpsList: {},
		gpsParentList: {},
		patrol: {},
		scheduleList: [],
		equipmentList: [],
		userPliceList: [],
		patroloher: {},
		classesCode: [],
		policeUnitCode: [],
		vehicleCode: [],
		scheduleDetail: [],
		patrolTree: {},
		patroloherTree: {},
		labelArea: [],
		labelLine: [],
		policeSchedule: [],
		unitIdGpsList: [],
		tatisticsList: [],
		thermalList: []
	},
	effects: {
		*policeQuery({ payload, success }, { call, put }) {
			const response = yield call(queryTreeListByPid, payload)
			if (payload.code == window.configUrl.dictionariesPolice) {
				yield put({
					type: 'police',
					payload: response
				})
			}
			if (payload.code == window.configUrl.dictionariesEquipmentType) {
				yield put({
					type: 'equipmentType',
					payload: response
				})
				yield put({
					type: 'statisticsHead',
					payload: response
				})
			}
			if (payload.code == window.configUrl.dictionariesEquipmentState) {
				yield put({
					type: 'equipmentState',
					payload: response
				})
			}
			if (response && success) success(response.data)
		},
		*getUseDept({ payload, success }, { call, put }) {
			const response = yield call(getUseDept, payload)
			yield put({
				type: 'useDeptList',
				payload: response
			})
		},
		*getPoliceUnitList({ payload, success }, { call, put }) {
			const response = yield call(getPoliceUnitList, payload)
			yield put({
				type: 'policeUnitList',
				payload: response
			})
		},
		*delPoliceUnitList({ payload, success }, { call, put }) {
			const response = yield call(delPoliceUnitList, payload)
			if (response && success) {
				success(response)
			}
		},
		*createPoliceUnitList({ payload, success }, { call, put }) {
			const response = yield call(createPoliceUnitList, payload)
			if (response && success) {
				success(response)
			}
		},
		*updatePoliceUnitList({ payload, success }, { call, put }) {
			const response = yield call(updatePoliceUnitList, payload)
			if (response && success) {
				success(response)
			}
		},

		*getShiftsList({ payload, success }, { call, put }) {
			const response = yield call(getShiftsList, payload)
			yield put({
				type: 'policeUnitList',
				payload: response
			})
		},
		*delShifts({ payload, success }, { call, put }) {
			const response = yield call(delShifts, payload)
			if (response && success) {
				success(response)
			}
		},
		*updateShifts({ payload, success }, { call, put }) {
			const response = yield call(updateShifts, payload)
			if (response && success) {
				success(response)
			}
		},
		*createShifts({ payload, success }, { call, put }) {
			const response = yield call(insertShifts, payload)
			if (response && success) {
				success(response)
			}
		},
		*getEquipmentList({ payload, success }, { call, put }) {
			const response = yield call(getEquipmentList, payload)
			yield put({
				type: 'policeUnitList',
				payload: response
			})
		},
		*delEquipment({ payload, success }, { call, put }) {
			const response = yield call(delEquipment, payload)
			if (response && success) {
				success(response)
			}
		},
		*updateEquipment({ payload, success }, { call, put }) {
			const response = yield call(updateEquipment, payload)
			console.log(response)

			if (response && success) {
				success(response)
			}
		},
		*createEquipment({ payload, success }, { call, put }) {
			const response = yield call(insertEquipment, payload)
			if (response && success) {
				success(response)
			}
		},
		*getGpsList({ payload, success }, { call, put }) {
			const response = yield call(getOrgGpsLabelList, payload)
			console.log(response)
			yield put({
				type: 'gpsList',
				payload: response
			})

			if (response && success) {
				success(response)
			}
		},
		*createGpsLabel({ payload, success }, { call, put }) {
			const response = yield call(insertGpsLabel, payload)
			if (response && success) {
				success(response)
			}
		},
		*createNewGpsLabel({ payload, success }, { call, put }) {
			const response = yield call(insertnewGpsLabel, payload)
			if (response && success) {
				success(response)
			}
		},
		*updateGpsLabel({ payload, success }, { call, put }) {
			const response = yield call(updateGpsLabel, payload)
			if (response && success) {
				success(response)
			}
		},
		*updatenewGpsLabel({ payload, success }, { call, put }) {
			console.log('2')
			const response = yield call(updatenewGpsLabel, payload)
			console.log('response',response);
			if (response && success) {
				success(response)
			}
		},
		*delGpsLabel({ payload, success }, { call, put }) {
			const response = yield call(delGpsLabel, payload)
			if (response && success) {
				success(response)
			}
		},
		*getpatrolList({ payload, success, status }, { call, put }) {
			const response = yield call(getpatrolList, payload)
			if (status) {
				yield put({
					type: 'patrolList',
					payload: response
				})
			} else {
				yield put({
					type: 'patrolListoher',
					payload: response
				})
			}

			if (response && success) {
				success(response)
			}
		},
		*getpatrolListTree({ payload, success, status }, { call, put }) {
			const response = yield call(getpatrolListTree, payload)
			if (status) {
				yield put({
					type: 'patrolListTree',
					payload: response
				})
			} else {
				yield put({
					type: 'patrolListoherTree',
					payload: response
				})
			}

			if (response && success) {
				success(response)
			}
		},
		*getScheduleListSearch({ payload, success }, { call, put }) {
			const response = yield call(getScheduleListSearch, payload)
			yield put({
				type: 'scheduleList',
				payload: response
			})
		},
		*getEquipmentByOrgCode({ payload, success }, { call, put }) {
			const response = yield call(getEquipmentByOrgCode, payload)
			yield put({
				type: 'equipmentList',
				payload: response
			})
		},
		*findUserByDeptList({ payload, success }, { call, put }) {
			const response = yield call(findUserByDeptList, payload)
			yield put({
				type: 'userPliceList',
				payload: response
			})
			if (response && success) {
				success(response)
			}
		},
		*getShiftsByOrgCode({ payload, success }, { call, put }) {
			const response = yield call(getShiftsByOrgCode, payload)
			yield put({
				type: 'classesCode',
				payload: response
			})
		},
		*getPoliceUnitByOrgCode({ payload, success }, { call, put }) {
			const response = yield call(getPoliceUnitByOrgCode, payload)
			yield put({
				type: 'policeUnitCode',
				payload: response
			})
		},
		*getVehicleList({ payload, success }, { call, put }) {
			const response = yield call(getVehicleList, payload)
			yield put({
				type: 'vehicleCode',
				payload: response
			})
		},
		*insertSchedule({ payload, success }, { call, put }) {
			const response = yield call(insertSchedule, payload)

			if (response && success) {
				success(response)
			}
		},
		*getScheduleByDate({ payload, callback }, { call, put }) {
			const response = yield call(getScheduleByDate, payload)
			yield put({
				type: 'scheduleDetail',
				payload: response
			})
			if (response && callback) {
				callback(response)
			}
		},
		*updateSchedule({ payload, success }, { call, put }) {
			const response = yield call(updateSchedule, payload)

			if (response && success) {
				success(response)
			}
		},
		*getGpsLabelAreaListByCode({ payload, success }, { call, put }) {
			const response = yield call(getGpsLabelAreaListByCode, payload)
			yield put({
				type: 'labelArea',
				payload: response
			})
			if (response && success) {
				success(response)
			}
		},
		*getGpsLabelLineListByCode({ payload, success }, { call, put }) {
			const response = yield call(getGpsLabelLineListByCode, payload)
			yield put({
				type: 'labelLine',
				payload: response
			})
			if (response && success) {
				success(response)
			}
		},
		*getSchedulingList({ payload, success }, { call, put }) {
			const response = yield call(getScheduleListPageSearch, payload)
			yield put({
				type: 'schedulingList',
				payload: response
			})
			if (response && success) {
				success(response)
			}
		},
		*getDutyPoliceUnitByLabelId({ payload, success }, { call, put }) {
			const response = yield call(getDutyPoliceUnitByLabelId, payload)
			//    yield put({
			//       type: 'labelLine',
			//       payload: response,
			//     });
			if (response && success) {
				success(response)
			}
		},
		*delSchedule({ payload, success }, { call, put }) {
			const response = yield call(delSchedule, payload)

			if (response && success) {
				success(response)
			}
		},
		*copyDaySchedule({ payload, success }, { call, put }) {
			const response = yield call(copyDaySchedule, payload)

			if (response && success) {
				success(response)
			}
		},
		*copyWeekSchedule({ payload, success }, { call, put }) {
			const response = yield call(copyWeekSchedule, payload)

			if (response && success) {
				success(response)
			}
		},
		*getPoliceScheduleList({ payload, success }, { call, put }) {
			const response = yield call(getPoliceScheduleList, payload)
			yield put({
				type: 'policeSchedule',
				payload: response
			})
			if (response && success) {
				success(response)
			}
		},
		*getAllGpsLabelById({ payload, success }, { call, put }) {
			const response = yield call(getAllGpsLabelById, payload)
			yield put({
				type: 'unitIdGpsList',
				payload: response
			})
			if (response && success) {
				success(response)
			}
		},
		*getFlowDensitysListByDate({ payload, success }, { call, put }) {
			const response = yield call(getFlowDensitysListByDate, payload)
			yield put({
				type: 'thermalList',
				payload: response
			})
			if (response && success) {
				success(response)
			}
		},
		*getFlowDensitysCountByDate({ payload, success }, { call, put }) {
			const response = yield call(getFlowDensitysCountByDate, payload)
			yield put({
				type: 'tatisticsList',
				payload: response
			})
			if (response && success) {
				success(response)
			}
		},
		*getPoliceAlarmListByDate({ payload, success }, { call, put }) {
			const response = yield call(getPoliceAlarmListByDate, payload)
			yield put({
				type: 'thermalList',
				payload: response
			})
			if (response && success) {
				success(response)
			}
		},
		*getPoliceAlarmCountByDate({ payload, success }, { call, put }) {
			const response = yield call(getPoliceAlarmCountByDate, payload)
			yield put({
				type: 'tatisticsList',
				payload: response
			})
			if (response && success) {
				success(response)
			}
		},
		*getEquipmentStatisticsList({ payload, success }, { call, put }) {
			const response = yield call(getEquipmentStatisticsList, payload)
			yield put({
				type: 'equipmentStatistics',
				payload: response
			})
		},
        *getEquipmentStatisticsList({ payload, success }, { call, put }) {
            const response = yield call(getEquipmentStatisticsList, payload)
            yield put({
                type: 'equipmentStatistics',
                payload: response
            })
		},
		*getAllGpsList({ payload, success }, { call, put }) {
			const response = yield call(getAllGpsLabelList, payload)
			console.log(response)
			yield put({
				type: 'gpsallList',
				payload: response
			})

			if (response && success) {
				success(response)
			}
		},
	},
	reducers: {
		thermalList(state, action) {
			let arr = []
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.list
				}
			}
			return { ...state, thermalList: arr }
		},
		tatisticsList(state, action) {
			let arr = []
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.list
				}
			}
			return { ...state, tatisticsList: arr }
		},
		unitIdGpsList(state, action) {
			let arr = []
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.list
				}
			}
			return { ...state, unitIdGpsList: arr }
		},
		policeUnitList(state, action) {
			let arr = {
				list: []
			}
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result
				} else {
					arr = {
						list: [],
						page: {
							currentPage: 1,
							currentResult: 0,
							showCount: 10,
							totalPage: 1,
							totalResult: 0
						}
					}
				}
			}
			return { ...state, data: arr }
		},
		police(state, action) {
			return { ...state, policeList: action.payload.data }
		},
		equipmentState(state, action) {
			return { ...state, equipmentState: action.payload.data }
		},
		equipmentType(state, action) {
			return { ...state, equipmentType: action.payload.data }
		},
		useDeptList(state, action) {
			return { ...state, useList: action.payload.data }
		},
		gpsList(state, action) {
		    console.log('action.payload',action.payload)
			let arr = {}
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.list
				}
			}
            console.log(arr)
			return { ...state, gpsList: arr }
		},
		gpsParentList(state, action) {
			let arr = {}
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.label
				}
			}
			return { ...state, gpsParentList: arr }
		},
		patrolList(state, action) {
			let arr = {}
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.label
				}
			}
			return { ...state, patrol: arr }
		},
		patrolListoher(state, action) {
			let arr = {}
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.label
				}
			}
			return { ...state, patroloher: arr }
		},
		patrolListTree(state, action) {
			let arr = {}
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result
				}
			}
			return { ...state, patrolTree: arr }
		},
		patrolListoherTree(state, action) {
			let arr = {}
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result
				}
			}
			return { ...state, patroloherTree: arr }
		},
		scheduleList(state, action) {
			let arr = []
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.list
				}
			}
			return { ...state, scheduleList: arr }
		},
		equipmentList(state, action) {
			let arr = []
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.list
				}
			}
			return { ...state, equipmentList: arr }
		},
		userPliceList(state, action) {
			// let arr = []
			// if (action.payload.result) {
			// 	if (action.payload.result.reason.code == '200') {
			// 		arr = action.payload.result.list
			// 	}
			// }
			return { ...state, userPliceList: action.payload.data.list }
		},
		classesCode(state, action) {
			let arr = []
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.list
				}
			}
			return { ...state, classesCode: arr }
		},
		policeUnitCode(state, action) {
			let arr = []
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.list
				}
			}
			return { ...state, policeUnitCode: arr }
		},
		vehicleCode(state, action) {
			let arr = []
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.list
				}
			}
			return { ...state, vehicleCode: arr }
		},
		scheduleDetail(state, action) {
			let arr = []
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.list
				}
			}
			return { ...state, scheduleDetail: arr }
		},
		labelArea(state, action) {
			let arr = []
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.list
				}
			}
			return { ...state, labelArea: arr }
		},
		labelLine(state, action) {
			let arr = []
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.list
				}
			}
			return { ...state, labelLine: arr }
		},
		schedulingList(state, action) {
			let arr = {
				list: []
			}
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result
				} else {
					arr = {
						list: [],
						page: {
							currentPage: 1,
							currentResult: 0,
							showCount: 10,
							totalPage: 1,
							totalResult: 0
						}
					}
				}
			}
			return { ...state, schedulingList: arr }
		},
		policeSchedule(state, action) {
			let arr = []
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.list
				}
			}
			return { ...state, policeSchedule: arr }
		},
		equipmentStatistics(state, action) {
			let arr = {
				list: []
			}
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result
				} else {
					arr = {
						list: [],
						page: {
							currentPage: 1,
							currentResult: 0,
							showCount: 10,
							totalPage: 1,
							totalResult: 0
						}
					}
				}
			}
			return { ...state, equipmentStatistics: arr }
		},
		statisticsHead(state, action) {
			// console.log(action.payload.data,'111')
			let arr = [
				{
					title: '序号',
					dataIndex: 'xh',
					key: 0,
					ellipsis: true,
					width: 100
				},
				{
					title: '所属车辆',
					dataIndex: 'carNo',
					key: 1,
					ellipsis: true,
					width: 120
				},
				{
					title: '盘点时间',
					dataIndex: 'check_time',
					key: 2,
					ellipsis: true,
					width: 120
				}
			]
			const data = action.payload.data
			for (let index = 0; index < data.length; index++) {
				const element = data[index]
				arr.push({
					title: element.name,
					dataIndex: element.code,
					key: element.code,
					ellipsis: true,
					width: 150
				})
			}
			return { ...state, statisticsHead: arr }
		}
	}
}
export default Model
