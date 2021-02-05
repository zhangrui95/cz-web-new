import {
	queryRuleConfig,
	queryLabelModelList,
	querySysCode,
	delLabelModel,
	updateLabelModel,
	insertLabelModel,
    existsLabel
} from './service'
import { tableList } from '@/utils/utils'

const Model = {
	namespace: 'warningRules',
	state: {
		data: {
			list: [],
			page: {
				currentPage: 1,
				showCount: tableList
			}
		},
		labelsList: []
	},
	effects: {
		*querySysCode({ payload }, { call, put }) {
			const response = yield call(querySysCode, payload)
			yield put({
				type: 'ruleList',
				payload: response
			})
		},
		*queryLabelModelList({ payload }, { call, put }) {
			const response = yield call(queryLabelModelList, payload)
			yield put({
				type: 'labelList',
				payload: response
			})
		},
		*delLabelModel({ payload, success }, { call, put }) {
			const response = yield call(delLabelModel, payload)
			if (response && success) {
				success(response)
			}
		},
		*updateLabelModel({ payload, success }, { call, put }) {
			const response = yield call(updateLabelModel, payload)
			if (response && success) {
				success(response)
			}
		},
		*insertLabelModel({ payload, success }, { call, put }) {
			const response = yield call(insertLabelModel, payload)
			if (response && success) {
				success(response)
			}
		},
        *existsLabel({ payload, success }, { call, put }) {
			const response = yield call(existsLabel, payload)
			if (response && success) {
				success(response)
			}
		},
	},

	reducers: {
		labelList(state, action) {
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
		ruleList(state, action) {
			let arr = []
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.list
				}
			}
			return { ...state, labelsList: arr }
		}
	}
}
export default Model
