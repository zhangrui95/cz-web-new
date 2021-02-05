import {
	getPersonListSearch,
    queryTreeListByPid,
    getUseDept,
    updatePersonArchivesStatus,
    insertPerson,
    queryLabelModelList,
    downloadPersonModal
} from './service'
import { tableList, reportList } from '@/utils/utils'

const Model = {
	namespace: 'keyPersonnel',
	state: {
		data: {
			list: [],
			page: {
				currentPage: 1,
				showCount: tableList
			}
		},
        useList: [],
		riskList:[],
       labelList:[],
	},
	effects: {
		*getPersonListSearch({ payload, success }, { call, put }) {
			const response = yield call(getPersonListSearch, payload)
			yield put({
				type: 'personnelList',
				payload: response
			})
		},
		 *policeQuery({ payload, success }, { call, put }) {
			const response = yield call(queryTreeListByPid, payload)
				yield put({
					type: 'riskList',
					payload: response
				})
		},
        *getUseDept({ payload, success }, { call, put }) {
			const response = yield call(getUseDept, payload)
			yield put({
				type: 'useDeptList',
				payload: response
			})
		},
        *queryLabelModelList({ payload, success }, { call, put }) {
			const response = yield call(queryLabelModelList, payload)
			yield put({
				type: 'labelList',
				payload: response
			})
		},
        *updatePersonArchivesStatus({ payload, success }, { call, put }) {
			const response = yield call(updatePersonArchivesStatus, payload)
			if (response && success) {
				success(response)
			}
		},
        *insertPerson({ payload, success }, { call, put }) {
			const response = yield call(insertPerson, payload)
			if (response && success) {
				success(response)
			}
		},
        *downloadPersonModal({ payload, success }, { call, put }) {
			const response = yield call(downloadPersonModal, payload)
			if (response && success) {
				success(response)
			}
		},
       
	},
	reducers: {
		
		personnelList(state, action) {
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
        labelList(state, action) {
			let arr = []
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.list
				} 
			}
			return { ...state, labelList: arr }
		},
		riskList(state, action) {
			return { ...state, riskList: action.payload.data }
		},
        useDeptList(state, action) {
			return { ...state, useList: action.payload.data }
		},
        
	}
}
export default Model
