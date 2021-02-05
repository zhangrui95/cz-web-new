import { getPeopleCheckList, getCarCheckList, exportVehicleXLSX, getPortraitCaptureRecordById, getVehicleCaptureRecordById, exportPortraitXLSX  } from '../services/checkList';
import { tableList } from '@/utils/utils';

const Model = {
  namespace: 'checkList',
  state: {
    data: {
      list: [],
      page: {
        currentPage: 1,
        showCount: tableList,
      },
    },
    exportlist:{},
     recordDetail:{},
  },
  effects: {
    *fetchPeopleCheckList({ payload }, { call, put }) {
      const response = yield call(getPeopleCheckList, payload);
      yield put({
        type: 'queryList',
        payload: response,
      });
    },

    *fetchCarCheckList({ payload }, { call, put }) {
      const response = yield call(getCarCheckList, payload);
      yield put({
        type: 'queryList',
        payload: response,
      });
    },
    *exportVehicleXLSX({ payload, success }, { call, put }) {
      const response = yield call(exportVehicleXLSX, payload);
      yield put({
        type: 'exports',
        payload: response,
      });
      if (response && success) success(response)
    },
    *exportPortraitXLSX({ payload, success }, { call, put }) {
      const response = yield call(exportPortraitXLSX, payload);
      yield put({
        type: 'exports',
        payload: response,
      });
      if (response && success) success(response)
    },
    *getRecordById({ payload }, { call, put }) {
      const response = yield call(getPortraitCaptureRecordById, payload);
      yield put({
        type: 'recordDetail',
        payload: response,
      });
    },
    *getVehicleById({ payload }, { call, put }) {
      const response = yield call(getVehicleCaptureRecordById, payload);
      yield put({
        type: 'recordDetail',
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
			return { ...state, data: arr }
    },
    exports(state, action) {
      return { ...state, exportlist: action.payload.data };
    },
    recordDetail(state, action) {
        let arr ={}
        if (action.payload.result) {
            if(action.payload.result.reason.code == '200'){
                arr = action.payload.result.data
            }
        }
      return { ...state, recordDetail:arr };
    },
  },
};
export default Model;
