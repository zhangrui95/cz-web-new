import {
    queryVehicleCaptureList,
    macCheckRecord,
    exportMacXLSX,
    queryPortraitCaptureList,
    getPoliceCarList,
    getWifiDevicePgListPage,
    getPortraitCaptureRecordById,
    getVehicleCaptureRecordById,
    exportVehicleXLSX,
    exportPortraitXLSX,
} from './service';
import { cardList } from '@/utils/utils';

const Model = {
    namespace: 'captureList',
    state: {
        data: {
            list: [],
            page: {
                currentPage: 1,
                showCount: cardList,
            },
        },
        policeCarList: [],
        exportlist: {},
        recordDetail: {},
    },
    effects: {
        *getWifiDevicePgListPage({ payload, callback }, { call, put }) {
            const response = yield call(getWifiDevicePgListPage, payload);
            if (callback && response) {
                callback(response);
            }
            yield put({
                type: 'queryList',
                payload: response,
            });
        },
        *fetchPortraitCaptureList({ payload, callback }, { call, put }) {
            const response = yield call(queryPortraitCaptureList, payload);
            yield put({
                type: 'queryList',
                payload: response,
            });
            if (callback && response) {
                callback(response);
            }
        },
        *fetchMacCheckRecord({ payload }, { call, put }) {
            const response = yield call(macCheckRecord, payload);
            yield put({
                type: 'queryList',
                payload: response,
            });
        },
        *fetchVehicleCaptureList({ payload }, { call, put }) {
            const response = yield call(queryVehicleCaptureList, payload);
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
            if (response && success) success(response);
        },
        *exportPortraitXLSX({ payload, success }, { call, put }) {
            const response = yield call(exportPortraitXLSX, payload);
            yield put({
                type: 'exports',
                payload: response,
            });
            if (response && success) success(response);
        },
        *exportMacXLSX({ payload, success }, { call, put }) {
            const response = yield call(exportMacXLSX, payload);
            yield put({
                type: 'exports',
                payload: response,
            });
            if (response && success) success(response);
        },
        *getRecordById({ payload, success }, { call, put }) {
            const response = yield call(getPortraitCaptureRecordById, payload);
            yield put({
                type: 'recordDetail',
                payload: response,
            });
            if (response && success) success(response);
        },
        *getVehicleById({ payload, success }, { call, put }) {
            const response = yield call(getVehicleCaptureRecordById, payload);
            yield put({
                type: 'recordDetail',
                payload: response,
            });
            if (response && success) success(response);
        },
    },
    reducers: {
        queryList(state, action) {
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
                            showCount: 16,
                            totalPage: 1,
                            totalResult: 0,
                        },
                    };
                }
            }
            return { ...state, data: arr };
        },
        exports(state, action) {
            return { ...state, exportlist: action.payload.data };
        },
        recordDetail(state, action) {
            let arr = {};
            if (action.payload.result) {
                if (action.payload.result.reason.code == '200') {
                    arr = action.payload.result.data;
                }
            }
            return { ...state, recordDetail: arr };
        },
    },
};
export default Model;
