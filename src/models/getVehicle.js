import { getPoliceCarList } from '../services/getVehicle'
import { tableList } from '@/utils/utils'

const Model = {
	namespace: 'getVehicle',
	state: {
		policeCarList: []
	},
	effects: {
		*fetchPoliceCarList({ payload }, { call, put }) {
			const response = yield call(getPoliceCarList, payload)
			yield put({
				type: 'policeCarList',
				payload: response
			})
		},
	},

	reducers: {
		policeCarList(state, action) {
			let arr = []
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.list
				}
			}
			return { ...state, policeCarList: arr }
		}
	}
}
export default Model
