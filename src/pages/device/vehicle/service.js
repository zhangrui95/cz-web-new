import request from '@/utils/request';

const { configUrl } = window;

export async function getVehicleById(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/vehicle/getVehicleById`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
  export async function getBayonetById(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/bayonet/getBayonetById`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
  export async function getDevicesList(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/device/getDevicesList`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
  
  export async function deleteDevice(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/device/delDevice`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
   export async function queryTreeListByPid(params) {
    const { ...restParams } = params;
    return request(`${configUrl.pid}/dict/findDictByCode`, {
      method: 'POST',
      data: { ...restParams, appCode: "106305" },
    });
  }