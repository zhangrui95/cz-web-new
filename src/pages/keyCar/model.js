import {
    getCarListSearch,
    getCarById,
    getTrackList,
    getViolationList,
    getPassList,
    getRobberyList,
    getDeckList,
    getCompanionList,
    getOwlList,
    getFootholdList,
    getFirstInListSearch,
    getViolationByNumber,
    getOwlListByNumber,
} from './service';
import { tableList, reportList } from '@/utils/utils';

const Model = {
    namespace: 'keyCar',
    state: {},
    effects: {
        *getCarListSearch({ payload, callback }, { call, put }) {
            const response = yield call(getCarListSearch, payload);
            callback(response);
        },
        *getCarById({ payload, callback }, { call, put }) {
            const response = yield call(getCarById, payload);
            callback(response);
        },
        *getTrackList({ payload, callback }, { call, put }) {
            const response = yield call(getTrackList, payload);
            callback(response);
        },
        *getViolationList({ payload, callback }, { call, put }) {
            const response = yield call(getViolationList, payload);
            callback(response);
        },
        *getPassList({ payload, callback }, { call, put }) {
            const response = yield call(getPassList, payload);
            callback(response);
        },
        *getRobberyList({ payload, callback }, { call, put }) {
            const response = yield call(getRobberyList, payload);
            callback(response);
        },
        *getDeckList({ payload, callback }, { call, put }) {
            const response = yield call(getDeckList, payload);
            callback(response);
        },
        *getCompanionList({ payload, callback }, { call, put }) {
            const response = yield call(getCompanionList, payload);
            callback(response);
        },
        *getOwlList({ payload, callback }, { call, put }) {
            const response = yield call(getOwlList, payload);
            callback(response);
        },
        *getFootholdList({ payload, callback }, { call, put }) {
            const response = yield call(getFootholdList, payload);
            callback(response);
        },
        *getFirstInListSearch({ payload, callback }, { call, put }) {
            const response = yield call(getFirstInListSearch, payload);
            callback(response);
        },
        *getViolationByNumber({ payload, callback }, { call, put }) {
            const response = yield call(getViolationByNumber, payload);
            callback(response);
        },
        *getOwlListByNumber({ payload, callback }, { call, put }) {
            const response = yield call(getOwlListByNumber, payload);
            callback(response);
        },
    },
};
export default Model;
