import { getCheckListByDate, getVehicleGps, getVehicleTrajectory, getCodeStream, closeCodeStream, queryTreeListByPid, getEquipmentListByVehicleId,
getScheduleListByVehicleId, getScheduleCountByVehicleId, getVehiclePoliceAlarmList, getPlayUrl } from '../services/home';

const Model = {
  namespace: 'home',
  state: {
    checkList: [{
      // 人像核查次数
      portraitCount: 0,
      // 车牌核查次数
      comparisonCount: 0,
    }],
    vehicleGps: [],
    trajectory:[],
    equipmentType: [],
    equipmentList: [],
    scheduleCount: [],
    scheduleList: [],
    alarmList:{},
    code:""
  },
  effects: {
    *fetchCheckListByDate({ payload }, { call, put }) {
      const response = yield call(getCheckListByDate, payload);
      yield put({
        type: 'checkList',
        payload: response,
      });
    },
    // 警车实时gps查询
    *fetchVehicleGps({ payload, callback }, { call, put }) {
      const response = yield call(getVehicleGps, payload);
      yield put({
        type: 'vehicleGps',
        payload: response,
      });
      if (callback) {
        callback();
      }
    },
    *getCodeStream({ payload, callback }, { call, put }) {
      const response = yield call(getCodeStream, payload);
      yield put({
        type: 'sodeStream',
        payload: response,
      });
      if (callback) {
        callback(response.data);
      }
    },
    *closeCodeStream({ payload, callback }, { call, put }) {
      const response = yield call(closeCodeStream, payload);
      
      if (callback) {
        callback();
      }
    },

    *getVehicleTrajectory({ payload, success }, { call, put }) {
      const response = yield call(getVehicleTrajectory, payload);
      yield put({
        type: 'trajectory',
        payload: response,
      });
      if (response&&success) {
          console.log(response)
        success(response);
      }
    },
    *policeQuery({ payload, success }, { call, put }) {
      const response = yield call(queryTreeListByPid, payload);
      if(payload.code == window.configUrl.dictionariesEquipmentType){
        yield put({
          type: 'equipmentType',
          payload: response,
        });
      }
      
      if (response && success) success(response.data)
    },
    *getEquipmentListByVehicleId({ payload, success }, { call, put }) {
      const response = yield call(getEquipmentListByVehicleId, payload);
      yield put({
        type: 'equipmentList',
        payload: response,
      });
    },
    *getScheduleListByVehicleId({ payload, success }, { call, put }) {
      const response = yield call(getScheduleListByVehicleId, payload);
      yield put({
        type: 'scheduleList',
        payload: response,
      });
    },
    *getScheduleCountByVehicleId({ payload, success }, { call, put }) {
      const response = yield call(getScheduleCountByVehicleId, payload);
      yield put({
        type: 'scheduleCount',
        payload: response,
      });
    },
    *getVehiclePoliceAlarmList({ payload, success }, { call, put }) {
        const response = yield call(getVehiclePoliceAlarmList, payload);
        yield put({
          type: 'alarmList',
          payload: response,
        });
      },
      *getPlayUrl({ payload, success }, { call, put }) {
        const response = yield call(getPlayUrl, payload);
        // yield put({
        //   type: 'alarmList',
        //   payload: response,
        // });
        if (response && success) success(response)
      },
  },
  reducers: {
    checkList(state, action) {
        let arr = []
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.list
				}
			}
      return { ...state, checkList: arr };
    },
    vehicleGps(state, action) {
        let arr = []
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.list
				}
			}
      return { ...state, vehicleGps: arr };
    },
    trajectory(state, action) {
      // console.log(action.payload)
      let arr = []
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.list
				}
			}
      return { ...state, trajectory: arr };
    },
    sodeStream(state, action) {
      return { ...state, code: action.payload.data };
    },
    equipmentType(state, action) {
      return { ...state, equipmentType: action.payload.data };
    },
    equipmentList(state, action) {
      // console.log(action.payload)
      let arr = []
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.list
				}
			}
      return { ...state, equipmentList: arr };
    },
    scheduleList(state, action) {
      // console.log(action.payload)
      let arr = []
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.list
				}
			}
      return { ...state, scheduleList: arr };
    },
    scheduleCount(state, action) {
      // console.log(action.payload)
      let arr = []
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.list
				}
			}
      return { ...state, scheduleCount: arr };
    },
    alarmList(state, action) {
        // console.log(action.payload)
        let arr = []
			if (action.payload.result) {
				if (action.payload.result.reason.code == '200') {
					arr = action.payload.result.policeAlarms
				}
			}
        return { ...state, alarmList: arr };
      },
  },
};
export default Model;
