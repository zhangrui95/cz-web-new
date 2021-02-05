import { getPoliceAlarmListSearch, getPoliceAlarmById, getJqFkList } from './service';
import { cardList } from '@/utils/utils';

const Model = {
  namespace: 'alarming',
  state: {
    data: {
      list: [],
      page: {
        currentPage: 1,
        showCount: cardList,
      },
    },
    feedbackList:{
        list: [],
      page: {
        currentPage: 1,
        showCount: 999,
      },
    },
    details:{}
  },
  effects: {
    *getPoliceAlarmList({ payload }, { call, put }) {
      const response = yield call(getPoliceAlarmListSearch, payload);
      yield put({
        type: 'policeList',
        payload: response,
      });
    },
    *getPoliceAlarmById({ payload, success }, { call, put }) {
      const response = yield call(getPoliceAlarmById, payload);
      yield put({
        type: 'detaillists',
        payload: response,
      });
        if (response && success) success(response);
    },
    *getJqFkList({ payload }, { call, put }) {
      const response = yield call(getJqFkList, payload);
      yield put({
        type: 'feedback',
        payload: response,
      });
    },
  },
  reducers: {
    policeList(state, action) {
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
    detaillists(state, action) {
        let arr = {}
        if (action.payload.result) {
            if(action.payload.result.reason.code == '200'){
                arr = action.payload.result.policeAlarm
            }
        }
      return { ...state, details: arr };
    },
    feedback(state, action) {
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
      return { ...state, feedbackList: arr };
    },
  },
};
export default Model;
