import {
	getTemporaryCtrlCarlistPage,
	getTemporaryCtrlPersonlistPage,
	queryDictionary,
	deleteTemporaryCtrlCar,
	deleteTemporaryCtrlPerson,
	updateTemporaryCtrlPerson,
	updateTemporaryCtrlCar,
	saveTemporaryCtrlPerson,
	saveTemporaryCtrlCar,
	downloadTemporaryPersonModal,
	downloadTemporaryCarModal
} from './service'
import { tableList } from '@/utils/utils'
const Model = {
	namespace: 'control',
	state: {
		data: {
			list: [],
			page: {
				currentPage: 1,
				showCount: tableList
			}
		},
		personnelLabel: [],
		vehicleLabel: []
	},
	effects: {
		*getTemporaryCtrlPersonlistPage({ payload }, { call, put }) {
			const response = yield call(getTemporaryCtrlPersonlistPage, payload)
			yield put({
				type: 'list',
				payload: response
			})
		},
		*getTemporaryCtrlCarlistPage({ payload }, { call, put }) {
			const response = yield call(getTemporaryCtrlCarlistPage, payload)
			yield put({
				type: 'list',
				payload: response
			})
		},
		*queryDictionary({ payload }, { call, put }) {
			const response = yield call(queryDictionary, payload)
			if (payload.pd.pid == window.configUrl.dictionariesControlPeople) {
				yield put({
					type: 'personnelLabel',
					payload: response
				})
			}
			if (payload.pd.pid == window.configUrl.dictionariesControlVehicle) {
				yield put({
					type: 'vehicleLabel',
					payload: response
				})
			}
		},
		*deleteTemporaryCtrlCar({ payload, success }, { call, put }) {
			const response = yield call(deleteTemporaryCtrlCar, payload)
			if (response && success) success(response)
		},
		*deleteTemporaryCtrlPerson({ payload, success }, { call, put }) {
			const response = yield call(deleteTemporaryCtrlPerson, payload)
			if (response && success) success(response)
		},
		*updateTemporaryCtrlPerson({ payload, success }, { call, put }) {
			const response = yield call(updateTemporaryCtrlPerson, payload)
			if (response && success) success(response)
		},
		*updateTemporaryCtrlCar({ payload, success }, { call, put }) {
			const response = yield call(updateTemporaryCtrlCar, payload)
			if (response && success) success(response)
		},
		*saveTemporaryCtrlPerson({ payload, success }, { call, put }) {
			const response = yield call(saveTemporaryCtrlPerson, payload)
			if (response && success) success(response)
		},
		*saveTemporaryCtrlCar({ payload, success }, { call, put }) {
			const response = yield call(saveTemporaryCtrlCar, payload)
			if (response && success) success(response)
		},
		*downloadTemporaryPersonModal({ payload, success }, { call, put }) {
			const response = yield call(downloadTemporaryPersonModal, payload)
			if (response && success) success(response)
		},
		*downloadTemporaryCarModal({ payload, success }, { call, put }) {
			const response = yield call(downloadTemporaryCarModal, payload)
			if (response && success) success(response)
		}
	},

	reducers: {
		list(state, action) {
			let arr = {
                list:[]
            }
			if (action.payload.result) {
                if(action.payload.result.reason.code == '200'){
                    arr = action.payload.result
                }else{
                    arr = {
                        list:[],
                        page: {
                        currentPage: 1,
                        currentResult: 0,
                        showCount: 10,
                        totalPage: 1,
                        totalResult: 0}
                    }
                }
				
			}
			return { ...state, data: arr }
		},
		personnelLabel(state, action) {
			let arr = []
            console.log(action.payload.result)
			if (action.payload.result) {
                if(action.payload.result.reason.code == '200'){
                    const list = action.payload.result.list
					for (let index = 0; index < list.length; index++) {
						const element = list[index]
						arr.push({
							...element,
							custom_tags_id: element.key.toString()
						})
					}
                }
					
			}

			return { ...state, personnelLabel: arr }
		},
		vehicleLabel(state, action) {
			let arr = []
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					const list = action.payload.result.list
					for (let index = 0; index < list.length; index++) {
						const element = list[index]
						arr.push({
							...element,
							custom_tags_id: element.key.toString()
						})
					}
				}
			}

			return { ...state, vehicleLabel: arr }
		}
	}
}
export default Model
