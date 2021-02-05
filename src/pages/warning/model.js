import { getAlarmListSearch, getAlarmById } from './service';
import { cardList } from '@/utils/utils';

const Model = {
  namespace: 'warning',
  state: {
    data: {
      list: [],
      page: {
        currentPage: 1,
        showCount: cardList,
      },
    },
    details:{}
  },
  effects: {
    *getAlarmList({ payload }, { call, put }) {
      const response = yield call(getAlarmListSearch, payload);
      yield put({
        type: 'alarmList',
        payload: response,
      });
    },
    *getAlarmById({ payload }, { call, put }) {
      const response = yield call(getAlarmById, payload);
      yield put({
        type: 'details',
        payload: response,
      });
    },
  },
  reducers: {
    alarmList(state, action) {
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
      return { ...state, data: arr };
    },
    details(state, action) {
         let arr = { }
			if (action.payload.result) {
                if(action.payload.result.reason.code == '200'){
                    arr = action.payload.result.alarm
                }
			}
      return { ...state, details: arr };
    },
  },
};
export default Model;
