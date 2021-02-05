import request from '@/utils/request';

const { configUrl } = window;

export async function getPoliceAlarmListSearch(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/policeAlarm/getPoliceAlarmListSearch`, {
    method: 'POST',
    data: { ...restParams },
  });
}
export async function getPoliceAlarmById(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/policeAlarm/getPoliceAlarmById`, {
    method: 'POST',
    data: { ...restParams },
  });
}
export async function getJqFkList(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/policeAlarm/getJqFkList`, {
    method: 'POST',
    data: { ...restParams },
  });
}