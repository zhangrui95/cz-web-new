import { getVehicleById,  getDevicesList, queryTreeListByPid, addEquipments, getDeviceById, editEquipments, queryFacility } from './service';
import { cardList } from '@/utils/utils';

const Model = {
  namespace: 'addVehicle',
  state: {
    data: {
    },
    devicesList:{},
    dictionary:[],//设备类型
    streamingFormat:[],//码流格式
    configuration: [],//主机配置模块
    snapType: [],//抓拍类型
    snapFirm: [],//抓拍设备厂商
    deviceDetail: {},
    dictionaryVehicle:[],//车辆状态
  },
  effects: {
    *fetchDetailById({ payload }, { call, put }) {
      const response = yield call(getVehicleById, payload);
      yield put({
        type: 'queryList',
        payload: response,
      });
    },
    *fetchDevicesById({ payload, success }, { call, put }) {
      const response = yield call(getDeviceById, payload);
      yield put({
        type: 'deviceDetail',
        payload: response,
      });
      if (response && success) success(response)
    },
    *fetchDevicesList({ payload }, { call, put }) {
      const response = yield call(getDevicesList, payload);
      yield put({
        type: 'devicesSol',
        payload: response,
      });
    },

    *dictionaryQuery({ payload, success }, { call, put }) {
      const response = yield call(queryTreeListByPid, payload);
      console.log(999999,payload.code)
      if(payload.code == window.configUrl.dictionariesStreaming){
        yield put({
          type: 'streamingFormat',
          payload: response,
        });
      }
      if(payload.code == window.configUrl.dictionariesVehicle){
        yield put({
          type: 'dictionaryVehicle',
          payload: response,
        });
      }
      
      if(payload.code == window.configUrl.dictionariesDevice){
        yield put({
          type: 'dictionaryList',
          payload: response,
        });
      }
      if(payload.code == window.configUrl.dictionariesConfiguration){
        yield put({
          type: 'configuration',
          payload: response,
        });
      }
      if(payload.code == window.configUrl.dictionariesSnap){
        yield put({
          type: 'snapType',
          payload: response,
        });
      }
      if(payload.code ==  window.configUrl.dictionariesCapture){
        yield put({
          type: 'snapFirm',
          payload: response,
        });
      }
      if (response && success) success(response.data)
    },
    *createEquipments({ payload, success }, { call, put }) {
      const response = yield call(addEquipments, payload);
       if (response && success) success(response)
    },
    *updateEquipments({ payload, success }, { call, put }) {
     
      const response = yield call(editEquipments, payload);
       if (response && success) success(response)
    },
    *queryFacility({ payload, success }, { call, put }) {
      console.log(1111)
      const response = yield call(queryFacility, payload);
       if (response && success) success(response)
    },
  },
  reducers: {
    queryList(state, action) {
        let arr = { }
			if (action.payload.result) {
                if(action.payload.result.reason.code == '200'){
                    arr = action.payload.result.vehicle
                }
			}
      return { ...state, data: arr };
    },
    deviceDetail(state, action) {
         let arr = { }
			if (action.payload.result) {
                if(action.payload.result.reason.code == '200'){
                    arr = action.payload.result.device
                }
			}
      return { ...state, deviceDetail: arr };
    },
    devicesSol(state, action) {
         let arr = { }
			if (action.payload.result) {
                if(action.payload.result.reason.code == '200'){
                    arr = action.payload.result
                }
			}
      return { ...state, devicesList: arr };
    },
    dictionaryList(state, action) {
      return { ...state, dictionary: action.payload.data };
    },
    dictionaryVehicle(state, action) {
        return { ...state, dictionaryVehicle: action.payload.data };
      },
    streamingFormat(state, action) {
      return { ...state, streamingFormat: action.payload.data };
    },
    configuration(state, action) {
      return { ...state, configuration: action.payload.data };
    },
    snapType(state, action) {
      return { ...state, snapType: action.payload.data };
    },
    snapFirm(state, action) {
      return { ...state, snapFirm: action.payload.data };
    },
  },
};
export default Model;
