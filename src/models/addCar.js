import { queryTreeListByPid, creatCar, updateCar, fetchCar, getUseDept, getVehicleByCarNo } from '../services/addCar'
import { cardList } from '@/utils/utils'

const Model = {
	namespace: 'addCar',
	state: {
		detail: {},
		useList: [],
		dictionary: []
	},
	effects: {
		*increase({ payload, success }, { call, put }) {
			const response = yield call(creatCar, payload)
			console.log(response)
			if (response && success) success(response)
		},
		*update({ payload, success }, { call, put }) {
			const response = yield call(updateCar, payload)
			console.log(response)
			if (response && success) success(response)
		},
		*getUseDept({ payload, success }, { call, put }) {
			const response = yield call(getUseDept, payload)
			console.log(response)
			yield put({
				type: 'useDeptList',
				payload: response
			})
		},
		*fetch({ payload }, { call, put }) {
			const response = yield call(fetchCar, payload)
			yield put({
				type: 'detailList',
				payload: response
			})
		},
		*dictionaryQuery({ payload }, { call, put }) {
			const response = yield call(queryTreeListByPid, payload)
			yield put({
				type: 'dictionaryList',
				payload: response
			})
		},
		*getVehicleByCarNo({ payload, success }, { call, put }) {
			const response = yield call(getVehicleByCarNo, payload)
			if (response && success) success(response)
		}
	},
	reducers: {
		detailList(state, action) {
			let arr = {}
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.vehicle
				}
			}
			return { ...state, detail: arr }
		},
		dictionaryList(state, action) {
			return { ...state, dictionary:  action.payload.data }
		},
		useDeptList(state, action) {
			return { ...state, useList:  action.payload.data }
		}
	}
}
export default Model
