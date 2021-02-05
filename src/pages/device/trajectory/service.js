import request from '@/utils/request';

const { configUrl } = window;

export async function getVehicleTrajectory(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/vehicle/getVehicleTrajectory`, {
    method: 'POST',
    data: { ...restParams },
  });
}
