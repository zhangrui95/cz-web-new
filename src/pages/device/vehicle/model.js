import { getVehicleById, getDevicesList, deleteDevice, queryTreeListByPid, getBayonetById } from './service'
import { cardList } from '@/utils/utils'

const Model = {
	namespace: 'vehicle',
	state: {
		data: {},
		devicesList: {},
		devicesTyps: [],
		dictionary: [],
		bayonet: {}
	},
	effects: {
		*fetchDetailById({ payload }, { call, put }) {
			const response = yield call(getVehicleById, payload)
			yield put({
				type: 'queryList',
				payload: response
			})
		},
		*fetchBayonetById({ payload }, { call, put }) {
			const response = yield call(getBayonetById, payload)
			yield put({
				type: 'bayonetList',
				payload: response
			})
		},
		*fetchDevicesList({ payload }, { call, put }) {
			const response = yield call(getDevicesList, payload)
			yield put({
				type: 'devicesList',
				payload: response
			})
		},
		*deleteDevice({ payload, success }, { call, put }) {
			const response = yield call(deleteDevice, payload)

			if (response && success) success(response)
		},
		*dictionaryQuery({ payload }, { call, put }) {
			const response = yield call(queryTreeListByPid, payload)
			if (payload.code == window.configUrl.dictionariesVehicle) {
				yield put({
					type: 'dictionary',
					payload: response
				})
			}
			if (payload.code == window.configUrl.dictionariesDevice) {
				yield put({
					type: 'devicesTyps',
					payload: response
				})
			}
		}
	},
	reducers: {
		queryList(state, action) {
			let arr = {}
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.vehicle
				}
			}
			return { ...state, data: arr }
		},
		bayonetList(state, action) {
            let arr = {}
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.bayonet
				}
			}
			return { ...state, bayonet: arr }
		},
		devicesList(state, action) {
            let arr = {}
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result
				}
			}
			return { ...state, devicesList:arr }
		},
		devicesTyps(state, action) {
			return { ...state, devicesTyps: action.payload.data }
		},
		dictionary(state, action) {
			return { ...state, dictionary: action.payload.data }
		}
	}
}
export default Model
