import {
    getScheduleListByVehicleId,
    queryTreeListByPid,
    getScheduleCountByVehicleId,
    getVehiclePoliceAlarmList,
    getEquipmentListByVehicleId,
    getDutyPoliceList,
    getPoliceAlarmListSearch,
    getPoliceDetail,
    ptzControl,
    getHomeAllSearchList,
    getBayonetsList,
    getVehicleTrajectory,
    getOrgGpsLabelList,
    queryCoordinatedParticipantIsEnd,
    queryCorrdingatedList,
    queryImeiCoordinatedList,
    addPlatformCoordinated,
    endCombined,
    getHullByPoint,getCallOutServices,getCallOutOverServices,getCallOutIngServices,getSearchListServices,
} from './service';
import { tableList } from '@/utils/utils';

const Model = {
    namespace: 'otherIndex',
    state: {
        equipmentType: [],
        trajectory: [],
        equipmentList: [],
        scheduleCount: [],
        scheduleList: [],
        alarmList: {},
        dutyPoliceList: [],
        policeAlarmList: [],
        searchList: [],
        swanList: [],
        monitoringList: [],
        keyPlaceList: [],
        policeStationList: [],
        labelList: {},
        operateWithList: {
            list: [],
            page: {
                currentPage: 1,
                showCount: 999,
            },
        },
        corrdingatedList: [],
    },
    effects: {
        *policeQuery({ payload, success }, { call, put }) {
            const response = yield call(queryTreeListByPid, payload);
            if (payload.code == window.configUrl.dictionariesEquipmentType) {
                yield put({
                    type: 'equipmentType',
                    payload: response,
                });
            }

            if (response && success) success(response.data);
        },
        *getEquipmentListByVehicleId({ payload, success }, { call, put }) {
            const response = yield call(getEquipmentListByVehicleId, payload);
            yield put({
                type: 'equipmentList',
                payload: response,
            });
        },
        *getVehicleTrajectory({ payload, success }, { call, put }) {
            const response = yield call(getVehicleTrajectory, payload);
            yield put({
                type: 'trajectory',
                payload: response,
            });
            if (response && success) {
                console.log(response);
                success(response);
            }
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
            if (response && success) success(response);
        },
        *getVehiclePoliceAlarmList({ payload, success }, { call, put }) {
            const response = yield call(getVehiclePoliceAlarmList, payload);
            yield put({
                type: 'alarmList',
                payload: response,
            });
        },
        *getDutyPoliceList({ payload, success }, { call, put }) {
            const response = yield call(getDutyPoliceList, payload);
            yield put({
                type: 'dutyPoliceList',
                payload: response,
            });
        },
        *getPoliceAlarmListSearch({ payload, success }, { call, put }) {
            const response = yield call(getPoliceAlarmListSearch, payload);
            yield put({
                type: 'policeAlarmList',
                payload: response,
            });
        },
        *getPoliceDetail({ payload, success }, { call, put }) {
            const response = yield call(getPoliceDetail, payload);
            if (response && success) success(response);
        },
        *getHomeAllSearchList({ payload, success }, { call, put }) {
            const response = yield call(getHomeAllSearchList, payload);
            yield put({
                type: 'searchList',
                payload: response,
            });
            if (response && success) success(response);
        },
        *getBayonetsList({ payload, success }, { call, put }) {
            // console.log(payload);
            const response = yield call(getBayonetsList, payload);
            if (payload.bayonet_type == 1) {
                yield put({
                    type: 'swanList',
                    payload: response,
                });
            } else if (payload.bayonet_type == 2) {
                yield put({
                    type: 'monitoringList',
                    payload: response,
                });
            } else if (payload.bayonet_type == 3) {
                yield put({
                    type: 'keyPlaceList',
                    payload: response,
                });
            } else if (payload.bayonet_type == 4) {
                yield put({
                    type: 'policeStationList',
                    payload: response,
                });
            }

            if (response && success) success(response);
        },
        *getOrgGpsLabelList({ payload, success }, { call, put }) {
            const response = yield call(getOrgGpsLabelList, payload);
            yield put({
                type: 'labelList',
                payload: response,
            });
            if (response && success) success(response);
        },
        *queryCoordinatedParticipantIsEnd({ payload, success }, { call, put }) {
            const response = yield call(queryCoordinatedParticipantIsEnd, payload);
            if (response && success) success(response);
        },
        *endCombined({ payload, success }, { call, put }) {
            const response = yield call(endCombined, payload);
            if (response && success) success(response);
        },
        *queryCorrdingatedList({ payload, success }, { call, put }) {
            const response = yield call(queryCorrdingatedList, payload);
            yield put({
                type: 'corrdingatedList',
                payload: response,
            });
            if (response && success) success(response);
        },
        *queryImeiCoordinatedList({ payload, success }, { call, put }) {
            const response = yield call(queryImeiCoordinatedList, payload);
            yield put({
                type: 'operateWithList',
                payload: response,
            });
            if (response && success) success(response);
        },
        *addPlatformCoordinated({ payload, success }, { call, put }) {
            const response = yield call(addPlatformCoordinated, payload);
            if (response && success) success(response);
        },
        *ptzControl({ payload, success }, { call, put }) {
            const response = yield call(ptzControl, payload);
            if (response && success) success(response);
        },
        *getHullByPoint({ payload, callback }, { call, put }) {
            const response = yield call(getHullByPoint, payload);
            if (response && callback) callback(response);
        },
        *getCallOutModels({ payload, callback }, { call, put }) {
            const response = yield call(getCallOutServices, payload);
            if (response && callback) callback(response);
        },
        *getCallOutOverModels({ payload, callback }, { call, put }) {
            const response = yield call(getCallOutOverServices, payload);
            if (response && callback) callback(response);
        },
        *getCallOutIngModels({ payload, callback }, { call, put }) {
            const response = yield call(getCallOutIngServices, payload);
            if (response && callback) callback(response);
        },
        *getSearchListModels({ payload, callback }, { call, put }) {
            const response = yield call(getSearchListServices, payload);
            if (response && callback) callback(response);
        },
    },

    reducers: {
        equipmentType(state, action) {
            return { ...state, equipmentType: action.payload.data };
        },
        equipmentList(state, action) {
            let arr = [];
            if (action.payload.result) {
                if (action.payload.result.reason.code == '200') {
                    arr = action.payload.result.list;
                }
            }
            return { ...state, equipmentList: arr };
        },
        corrdingatedList(state, action) {
            let arr = [];
            if (action.payload.result) {
                if (action.payload.result.reason.code == '200') {
                    arr = action.payload.result.list;
                }
            }
            return { ...state, corrdingatedList: arr };
        },
        operateWithList(state, action) {
            let arr = {
                list: [],
            };
            if (action.payload.result) {
                if (action.payload.result.reason.code == '200') {
                    arr = action.payload.result;
                } else {
                    arr = {
                        list: [],
                        page: {
                            currentPage: 1,
                            currentResult: 0,
                            showCount: 10,
                            totalPage: 1,
                            totalResult: 0,
                        },
                    };
                }
            }
            return { ...state, operateWithList: arr };
        },
        scheduleList(state, action) {
            let arr = [];
            if (action.payload.result) {
                if (action.payload.result.reason.code == '200') {
                    arr = action.payload.result.list;
                }
            }
            return { ...state, scheduleList: arr };
        },
        trajectory(state, action) {
            let arr = [];
            if (action.payload.result) {
                if (action.payload.result.reason.code == '200') {
                    arr = action.payload.result.list;
                }
            }
            return { ...state, trajectory: arr };
        },
        scheduleCount(state, action) {
            let arr = [];
            if (action.payload.result) {
                if (action.payload.result.reason.code == '200') {
                    arr = action.payload.result.list;
                }
            }
            return { ...state, scheduleCount: arr };
        },
        alarmList(state, action) {
            let arr = {};
            if (action.payload.result) {
                if (action.payload.result.reason.code == '200') {
                    arr = action.payload.result.policeAlarms;
                }
            }
            return { ...state, alarmList: arr };
        },
        dutyPoliceList(state, action) {
            let arr = [];
            if (action.payload.result) {
                if (action.payload.result.reason.code == '200') {
                    arr = action.payload.result.list;
                }
            }
            return { ...state, dutyPoliceList: arr };
        },
        policeAlarmList(state, action) {
            let arr = [];
            if (action.payload.result) {
                if (action.payload.result.reason.code == '200') {
                    arr = action.payload.result.list;
                }
            }
            return { ...state, policeAlarmList: arr };
        },
        searchList(state, action) {
            let arr = [];
            if (action.payload.result) {
                if (action.payload.result.reason.code == '200') {
                    arr = action.payload.result.list;
                }
            }
            return { ...state, searchList: arr };
        },
        swanList(state, action) {
            let arr = [];
            if (action.payload.result) {
                if (action.payload.result.reason.code == '200') {
                    arr = action.payload.result.list;
                }
            }
            return { ...state, swanList: arr };
        },
        monitoringList(state, action) {
            let arr = [];
            if (action.payload.result) {
                if (action.payload.result.reason.code == '200') {
                    arr = action.payload.result.list;
                }
            }
            return { ...state, monitoringList: arr };
        },
        keyPlaceList(state, action) {
            let arr = [];
            if (action.payload.result) {
                if (action.payload.result.reason.code == '200') {
                    arr = action.payload.result.list;
                }
            }
            return { ...state, keyPlaceList: arr };
        },
        policeStationList(state, action) {
            let arr = [];
            if (action.payload.result) {
                if (action.payload.result.reason.code == '200') {
                    arr = action.payload.result.list;
                }
            }
            return { ...state, policeStationList: arr };
        },
        labelList(state, action) {
            let arr = {};
            if (action.payload.result) {
                if (action.payload.result.reason.code == '200') {
                    arr = action.payload.result.label;
                }
            }
            return { ...state, labelList: arr };
        },
    },
};
export default Model;
