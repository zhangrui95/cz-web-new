import request from '@/utils/request';

const { configUrl } = window;


export async function queryTreeListByPid(params) {
    const { ...restParams } = params;
    return request(`${configUrl.pid}/dict/findDictByCode`, {
      method: 'POST',
      data: { ...restParams,appCode: "106305" },
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