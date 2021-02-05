import { queryCoordinatedPgListPage, queryCorrdingatedList } from './service';
import { cardList } from '@/utils/utils';

const Model = {
  namespace: 'operateWith',
  state: {
    data: {
      list: [],
      page: {
        currentPage: 1,
        showCount: cardList,
      },
    },
    corrdingatedList:[]
  },
  effects: {
    *queryCoordinatedPgListPage({ payload }, { call, put }) {
      const response = yield call(queryCoordinatedPgListPage, payload);
      yield put({
        type: 'operateWithList',
        payload: response,
      });
    },
    *queryCorrdingatedList({ payload }, { call, put }) {
      const response = yield call(queryCorrdingatedList, payload);
      yield put({
        type: 'corrdingatedList',
        payload: response,
      });
    },
  },
  reducers: {
    operateWithList(state, action) {
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
   corrdingatedList(state, action) {
         let arr = []
			if (action.payload.result) {
                if(action.payload.result.reason.code == '200'){
                    arr = action.payload.result.list
                }else{
                    arr = []
                }
				
			}
      return { ...state, corrdingatedList: arr };
    },
  },
};
export default Model;
