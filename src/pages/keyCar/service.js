import request from '@/utils/request';

const { configUrl } = window;

export async function getCarListSearch(params) {
    return request(`${configUrl.serverUrl}/car/getCarListSearch`, {
        method: 'POST',
        data: { ...params },
    });
}
export async function getCarById(params) {
    return request(`${configUrl.serverUrl}/car/getCarById`, {
        method: 'POST',
        data: { ...params },
    });
}
export async function getTrackList(params) {
    return request(`${configUrl.serverUrl}/car/getTrackList`, {
        method: 'POST',
        data: { ...params },
    });
}
export async function getViolationList(params) {
    return request(`${configUrl.serverUrl}/car/getViolationList`, {
        method: 'POST',
        data: { ...params },
    });
}
export async function getPassList(params) {
    return request(`${configUrl.serverUrl}/car/getPassList`, {
        method: 'POST',
        data: { ...params },
    });
}
export async function getRobberyList(params) {
    return request(`${configUrl.serverUrl}/car/getRobberyList`, {
        method: 'POST',
        data: { ...params },
    });
}
export async function getDeckList(params) {
    return request(`${configUrl.serverUrl}/car/getDeckList`, {
        method: 'POST',
        data: { ...params },
    });
}
export async function getCompanionList(params) {
    return request(`${configUrl.serverUrl}/car/getCompanionList`, {
        method: 'POST',
        data: { ...params },
    });
}
export async function getOwlList(params) {
    return request(`${configUrl.serverUrl}/car/getOwlList`, {
        method: 'POST',
        data: { ...params },
    });
}
export async function getFootholdList(params) {
    return request(`${configUrl.serverUrl}/car/getFootholdList`, {
        method: 'POST',
        data: { ...params },
    });
}
export async function getFirstInListSearch(params) {
    return request(`${configUrl.serverUrl}/car/getFirstInListSearch`, {
        method: 'POST',
        data: { ...params },
    });
}
export async function getViolationByNumber(params) {
    return request(`${configUrl.serverUrl}/car/getViolationByNumber`, {
        method: 'POST',
        data: { ...params },
    });
}
export async function getOwlListByNumber(params) {
    return request(`${configUrl.serverUrl}/car/getOwlListByNumber`, {
        method: 'POST',
        data: { ...params },
    });
}
