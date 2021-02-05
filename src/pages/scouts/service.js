import request from '@/utils/request';

const { configUrl } = window;

export async function getDataStatisticsSearch(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/statistics/getDataStatisticsSearch`, {
    method: 'POST',
    data: { ...restParams },
  });
}
export async function getOrgZPStatisticsList(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/statistics/getOrgZPStatisticsList`, {
    method: 'POST',
    data: { ...restParams },
  });
}

export async function getDateZPStatisticsList(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/statistics/getDateZPStatisticsList`, {
    method: 'POST',
    data: { ...restParams },
  });
}
export async function getUseDept(params) {
    const { ...restParams } = params;
    return request(`${configUrl.securityCenterUrl}/lowcase/getMechanismTreeByUnitcodeAndDepartment`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
export async function getOrgHCStatisticsList(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/statistics/getOrgHCStatisticsList`, {
    method: 'POST',
    data: { ...restParams },
  });
}

export async function getDateHCStatisticsList(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/statistics/getDateHCStatisticsList`, {
    method: 'POST',
    data: { ...restParams },
  });
}
export async function getOrgPoliceAlarmStatisticsList(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/statistics/getOrgPoliceAlarmStatisticsList`, {
    method: 'POST',
    data: { ...restParams },
  });
}
export async function getOrgPatrolStatisticsList(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/statistics/getOrgPatrolStatisticsList`, {
    method: 'POST',
    data: { ...restParams },
  });
}