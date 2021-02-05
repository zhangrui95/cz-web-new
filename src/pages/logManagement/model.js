import { getSysLogListSearch } from './service';
import { tableList } from '@/utils/utils';

const Model = {
  namespace: 'logManagement',
  state: {
    data: {
      list: [],
      page: {
        currentPage: 1,
        showCount: tableList,
      },
    },
  },
  effects: {
    *fetchLogList({ payload }, { call, put }) {
      const response = yield call(getSysLogListSearch, payload);
      yield put({
        type: 'queryList',
        payload: response,
      });
    },
    

  },

  reducers: {
    queryList(state, action) {
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
    
  },
};
export default Model;
