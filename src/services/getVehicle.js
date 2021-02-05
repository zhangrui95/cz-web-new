import request from '@/utils/request';

const { configUrl } = window;

export async function getPoliceCarList(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/vehicle/getVehicleList`, {
    method: 'POST',
    data: { ...restParams },
  });
}
