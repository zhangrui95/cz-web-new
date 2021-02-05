import request from '@/utils/request';

const { configUrl } = window;

export async function getAlarmListSearch(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/alarm/getAlarmListSearch`, {
    method: 'POST',
    data: { ...restParams },
  });
}
export async function getAlarmById(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/alarm/getAlarmById`, {
    method: 'POST',
    data: { ...restParams },
  });
}
