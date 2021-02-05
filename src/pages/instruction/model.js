import { getNoticeList, getUseDept, getVehicleList, uploadImg, delFile, uploadAudio, uploadVideo, insertPoliceNotice,delPoliceNotice } from './service';
import { tableList } from '@/utils/utils';

const Model = {
  namespace: 'instruction',
  state: {
    data: {
      list: [],
      page: {
        currentPage: 1,
        showCount: tableList,
      },
    },
    useList: [],
    vehicleCode: []
  },
  effects: {
    *fetchNoticeList({ payload }, { call, put }) {
      const response = yield call(getNoticeList, payload);
      yield put({
        type: 'queryList',
        payload: response,
      });
    },
    *getUseDept({ payload, success }, { call, put }) {
      const response = yield call(getUseDept, payload);
        yield put({
          type: 'useDeptList',
          payload: response,
        });
    },
    *getVehicleList({ payload, success }, { call, put }) {
      const response = yield call(getVehicleList, payload);
       yield put({
          type: 'vehicleCode',
          payload: response,
        });
         if(response&& success){
        //    if(response.reason == null){
               success(response)
        //    }
       }
    },
    *insertPoliceNotice({ payload, success }, { call, put }) {
      const response = yield call(insertPoliceNotice, payload);
       if(response&& success){
           if(response.result.reason.code == '200'){
               success(response)
           }
       }
    },
    *delPoliceNotice({ payload, success }, { call, put }) {
      const response = yield call(delPoliceNotice, payload);
       if(response&& success){
           if(response.result.reason.code == '200'){
               success(response)
           }
       }
    },
    *uploadImg({ payload, success, filu }, { call, put }) {
      const response = yield call(uploadImg, payload);
      console.log(payload,response)
       if(response&& success){
           if(response.result){
               success(response.result.path)
           }else{
               filu()
           }
       }
    },
    *uploadAudio({ payload, success }, { call, put }) {
      const response = yield call(uploadAudio, payload);
      console.log(payload,response)
       if(response&& success){
           if(response.result.reason.code == '200'){
               success(response.result.path)
           }
       }
    },
    *uploadVideo({ payload, success }, { call, put }) {
      const response = yield call(uploadVideo, payload);
      console.log(payload,response)
       if(response&& success){
           if(response.result.reason.code == '200'){
               success(response.result.path)
           }
       }
    },
    *delFile({ payload, success }, { call, put }) {
      const response = yield call(delFile, payload);
      console.log(payload,response)
       if(response&& success){
               success()
       }
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
    useDeptList(state, action) {
      return { ...state, useList: action.payload.data };
    },
    vehicleCode(state, action) {
        let arr = { }
			if (action.payload.result) {
                if(action.payload.result.reason.code == '200'){
                    arr = action.payload.result.list
                }
			}
      return { ...state, vehicleCode: arr };
    },
  },
};
export default Model;
