import { getVehicleTrajectory } from './service';
import { tableList } from '@/utils/utils';

const Model = {
  namespace: 'trajectory',
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
    *fetchList({ payload,success }, { call, put }) {
      const response = yield call(getVehicleTrajectory, payload);
      yield put({
        type: 'queryList',
        payload: response,
      });
      if(success&&response) success(response)
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
