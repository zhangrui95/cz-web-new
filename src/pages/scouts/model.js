import {
	getDataStatisticsSearch,
	getDateZPStatisticsList,
	getOrgZPStatisticsList,
	getOrgPoliceAlarmStatisticsList,
	getDateHCStatisticsList,
	getOrgHCStatisticsList,
    getOrgPatrolStatisticsList,
	getUseDept
} from './service'
import { tableList } from '@/utils/utils'
const Model = {
	namespace: 'scouts',
	state: {
		snap: {
			list: [],
			page: {
				currentPage: 1,
				showCount: tableList
			}
		},
		verification: {
			list: [],
			page: {
				currentPage: 1,
				showCount: tableList
			}
		},
        industry: {
			list: [],
			page: {
				currentPage: 1,
				showCount: tableList
			}
		},
        patrol: {
			list: [],
			page: {
				currentPage: 1,
				showCount: tableList
			}
		},
		data: {},
		useList: []
	},
	effects: {
		*fetchStatistics({ payload }, { call, put }) {
			const response = yield call(getDataStatisticsSearch, payload)
			yield put({
				type: 'queryList',
				payload: response
			})
		},
		*getOrgZPStatisticsList({ payload }, { call, put }) {
			const response = yield call(getOrgZPStatisticsList, payload)
			yield put({
				type: 'snapList',
				payload: response
			})
		},
		*getDateZPStatisticsList({ payload }, { call, put }) {
			const response = yield call(getDateZPStatisticsList, payload)
			yield put({
				type: 'snapList',
				payload: response
			})
		},
		*getOrgHCStatisticsList({ payload }, { call, put }) {
			const response = yield call(getOrgHCStatisticsList, payload)
			yield put({
				type: 'verificationList',
				payload: response
			})
		},
		*getDateHCStatisticsList({ payload }, { call, put }) {
			const response = yield call(getDateHCStatisticsList, payload)
			yield put({
				type: 'verificationList',
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
        *getOrgPoliceAlarmStatisticsList({ payload }, { call, put }) {
			const response = yield call(getOrgPoliceAlarmStatisticsList, payload)
			yield put({
				type: 'industryList',
				payload: response
			})
		},
        *getOrgPatrolStatisticsList({ payload }, { call, put }) {
			const response = yield call(getOrgPatrolStatisticsList, payload)
			yield put({
				type: 'patrolList',
				payload: response
			})
		},
	},

	reducers: {
		queryList(state, action) {
            let arr = { }
			if (action.payload.result) {
                if(action.payload.result.reason.code == '200'){
                    arr = action.payload.result
                }
			}
			return { ...state, data: arr }
		},
		snapList(state, action) {
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
			return { ...state, snap: arr }
		},
		verificationList(state, action) {
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
			return { ...state, verification: arr }
		},
        industryList(state, action) {
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
			return { ...state, industry: arr }
		},
        patrolList(state, action) {
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
			return { ...state, patrol: arr }
		},
		useDeptList(state, action) {
			return { ...state, useList: action.payload.data }
		}
	}
}
export default Model
