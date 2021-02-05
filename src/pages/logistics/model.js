import {
    areaModelsService,ListService
} from './service';
import { tableList } from '@/utils/utils';

const Model = {
    namespace: 'logis',
    state: {
        returnareaModelsData:[],
        returnListData:[],
    },
    effects: {
        // 获取当前账号下属的区的统计
        *areaModelsFetch({ payload, success }, { call, put }) {
            const response = yield call(areaModelsService, payload);
            yield put({
                type: 'areaModelsType',
                payload: response,
            });
            if (response && success) success(response.result);
        },
        // 获取重点场所列表
        *getListFetch({ payload, success }, { call, put }) {
            const response = yield call(ListService, payload);
            yield put({
                type: 'ListType',
                payload: response,
            });
            if (response && success) success(response.result);
        },




        
    },

    reducers: {
        areaModelsType(state,action){
            return {
                ...state,
                returnareaModelsData: action.payload,
              };
        },
        ListType(state,action){
            return {
                ...state,
                returnListData: action.payload,
              };
        },





    },
};
export default Model;
