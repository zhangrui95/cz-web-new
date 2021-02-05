import { getVehicleList, delVehicle, getBayonetListSearch, getIndividual,delIndividual, queryTreeListByPid, individualXLSX,bayonetXLSX,delBayonet,
    getUseDept, insertBayonet, updateBayonet, insertIndividual, updateIndividual,getPersonCheckServices,getCarCheckServices } from './service';
import { tableList } from '@/utils/utils';

const Model = {
  namespace: 'device',
  state: {
    data: {
      list: [],
      page: {
        currentPage: 1,
        showCount: tableList,
      },
    },
    returndata: {
      list: [],
      page: {
          currentPage: 1,
          showCount: tableList,
      },
    },
    dictionary: [],
    exportlist: {},
    useList: [],
    returnPersonCheckList: {
      list: [],
      page: {
          currentPage: 1,
          showCount: tableList,
      },
    }, // 人员核查
    returnCarCheckList: {
      list: [],
      page: {
          currentPage: 1,
          showCount: tableList,
      },
    }, // 车辆核查
  },
  effects: {
    *fetchVehicleList({ payload }, { call, put }) {
      const response = yield call(getVehicleList, payload);
      yield put({
        type: 'queryList',
        payload: response,
      });
    },
    *deleteVehicle({ payload, success }, { call, put }) {
      const response = yield call(delVehicle, payload);
      // const { is_success } = yield call(delVehicle, payload);
      if (response && success) success(response);

    },
    *delBayonet({ payload, success }, { call, put }) {
      const response = yield call(delBayonet, payload);
      // const { is_success } = yield call(delVehicle, payload);
      if (response && success) success(response);

    },
    *delIndividual({ payload, success }, { call, put }) {
      const response = yield call(delIndividual, payload);
      // const { is_success } = yield call(delVehicle, payload);
      if (response && success) success(response);

    },
    *fetchBayonetList({ payload }, { call, put }) {
      const response = yield call(getBayonetListSearch, payload);
      yield put({
        type: 'bayonetList',
        payload: response,
      });
    },
    *dictionaryQuery({ payload }, { call, put }) {
      const response = yield call(queryTreeListByPid, payload);
      yield put({
        type: 'dictionaryList',
        payload: response,
      });
    },
    *individualXLSX({ payload, success }, { call, put }) {
      const response = yield call(individualXLSX, payload);
      yield put({
        type: 'exports',
        payload: response,
      });
      if (response && success) success(response)
    },
    *bayonetXLSX({ payload, success }, { call, put }) {
      const response = yield call(bayonetXLSX, payload);
      yield put({
        type: 'exports',
        payload: response,
      });
      if (response && success) success(response)
    },

     *getUseDept({ payload, success }, { call, put }) {
      const response = yield call(getUseDept, payload);
        yield put({
          type: 'useDeptList',
          payload: response,
        });
    },
    *insertBayonet({ payload, success }, { call, put }) {
      const response = yield call(insertBayonet, payload);
      if (response && success) success(response);

    },
    *updateBayonet({ payload, success }, { call, put }) {
      const response = yield call(updateBayonet, payload);
      if (response && success) success(response);

    },
    *insertIndividual({ payload, success }, { call, put }) {
      const response = yield call(insertIndividual, payload);
      if (response && success) success(response);

    },
    *updateIndividual({ payload, success }, { call, put }) {
      const response = yield call(updateIndividual, payload);
      if (response && success) success(response);

    },
    *fetchIndividual({ payload }, { call, put }) {
      const response = yield call(getIndividual, payload);
      yield put({
        type: 'individualList',
        payload: response,
      });
    },
    *getPersonCheckFetch({ payload,callback }, { call, put }) {
      const response = yield call(getPersonCheckServices, payload);
      yield put({
          type: 'queryListModels',
          payload: response,
      });
      if (response && callback) callback(response);
    },
    *getCarCheckFetch({ payload,callback }, { call, put }) {
      const response = yield call(getCarCheckServices, payload);
      yield put({
          type: 'queryListModels',
          payload: response,
      });
      if (response && callback) callback(response);
    },
  },
  reducers: {
    queryList(state, action) {
        let arr = {
                list:[],
                page: {
                    currentPage: 1,
                    currentResult: 0,
                    showCount: 10,
                    totalPage: 1,
                    totalResult: 0}
            }
			if (action.payload&&action.payload.result) {
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
      queryListModels(state, action) {
          let arr = {
              list:[],
              page: {
                  currentPage: 1,
                  currentResult: 0,
                  showCount: 10,
                  totalPage: 1,
                  totalResult: 0}
          }
          if (action.payload&&action.payload.result) {
              if(action.payload.result){
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
          return { ...state, returndata: arr };
      },
    bayonetList(state, action) {
        let arr = {
                list:[],
                page: {
                    currentPage: 1,
                    currentResult: 0,
                    showCount: 10,
                    totalPage: 1,
                    totalResult: 0}
            }
			if (action.payload&&action.payload.result) {
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
    dictionaryList(state, action) {
      return { ...state, dictionary: action.payload.data };
    },
    individualList(state, action) {
        let arr = {
                list:[],
                page: {
                    currentPage: 1,
                    currentResult: 0,
                    showCount: 10,
                    totalPage: 1,
                    totalResult: 0}
            }
			if (action.payload&&action.payload.result) {
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
    exports(state, action) {
      return { ...state, exportlist: action.payload.data };
    },
    useDeptList(state, action) {
      return { ...state, useList: action.payload.data };
    },
    getPersonCheckModels(state, action){
      return {
          ...state,
          returnPersonCheckList: action.payload,
      };
    },
    getCarCheckModels(state, action){
      return {
          ...state,
          returnCarCheckList: action.payload,
      };
    },
  },
};
export default Model;
