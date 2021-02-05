import request from '@/utils/request';

const { configUrl } = window;

export async function queryTreeListByPid(params) {
    const { ...restParams } = params;
    return request(`${configUrl.pid}/dict/findDictByCode`, {
        method: 'POST',
        data: { ...restParams, appCode: '106305' },
    });
}
export async function getEquipmentListByVehicleId(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/homePage/getEquipmentCountByVehicleId`, {
        method: 'POST',
        data: { ...restParams },
    });
}

export async function getScheduleCountByVehicleId(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/homePage/getScheduleCountByVehicleId`, {
        method: 'POST',
        data: { ...restParams },
    });
}
export async function getScheduleListByVehicleId(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/homePage/getScheduleListByVehicleId`, {
        method: 'POST',
        data: { ...restParams },
    });
}
export async function getVehiclePoliceAlarmList(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/homePage/getVehiclePoliceAlarmList`, {
        method: 'POST',
        data: { ...restParams },
    });
}
export async function getDutyPoliceList(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/homePage/getDutyPoliceList`, {
        method: 'POST',
        data: { ...restParams },
    });
}
export async function getPoliceAlarmListSearch(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/policeAlarm/getPoliceAlarmListSearch`, {
        method: 'POST',
        data: { ...restParams },
    });
}
export async function getPoliceDetail(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/policeAlarm/getJqDetail`, {
        method: 'POST',
        data: { ...restParams },
    });
}
export async function getHomeAllSearchList(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/homePage/getHomeAllSearchList`, {
        method: 'POST',
        data: { ...restParams },
    });
}
export async function getBayonetsList(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/bayonet/getBayonetsList`, {
        method: 'POST',
        data: { ...restParams },
    });
}
export async function getOrgGpsLabelList(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/gps/getOrgGpsLabelList`, {
        method: 'POST',
        data: { ...restParams },
    });
}
export async function queryCoordinatedParticipantIsEnd(params) {
    const { ...restParams } = params;
    return request(
        `${configUrl.serverUrl}/coordinatedOperations/queryCoordinatedParticipantIsEnd`,
        {
            method: 'POST',
            data: { ...restParams },
        },
    );
}
export async function endCombined(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/coordinatedOperations/endCombined`, {
        method: 'POST',
        data: { ...restParams },
    });
}
export async function queryCorrdingatedList(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/coordinatedOperations/queryCorrdingatedList`, {
        method: 'POST',
        data: { ...restParams },
    });
}
export async function queryImeiCoordinatedList(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/coordinatedOperations/queryCoordinatedPgListPage`, {
        method: 'POST',
        data: { ...restParams },
    });
}
export async function addPlatformCoordinated(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/coordinatedOperations/addPlatformCoordinated`, {
        method: 'POST',
        data: { ...restParams },
    });
}
export async function ptzControl(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/hik/ptzControl`, {
        method: 'POST',
        data: { ...restParams },
    });
}
export async function getHullByPoint(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/hull/getHullByPoint`, {
        method: 'POST',
        data: { ...restParams },
    });
}
export async function getCallOutServices(params) {
    const { ...restParams } = params;
    return request(`${configUrl.interComUrl}/IntercomCall/`, {
        method: 'POST',
        data: { ...restParams },
    });
}
export async function getCallOutOverServices(params) {
    const { ...restParams } = params;
    return request(`${configUrl.interComUrl}/IntercomEnd/`, {
        method: 'POST',
        data: { ...restParams },
    });
}
export async function getCallOutIngServices(params) {
    const { ...restParams } = params;
    return request(`${configUrl.interComUrl}/DiscourseRight/`, {
        method: 'POST',
        data: { ...restParams },
    });
}
export async function getSearchListServices(params) {
    const { ...restParams } = params;
    return request(`${configUrl.interComUrl}/CallStatus/`, {
        method: 'POST',
        data: { ...restParams },
    });
}
