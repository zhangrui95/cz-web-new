import request from '@/utils/request';

const { configUrl } = window;

export async function getVehicleById(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/vehicle/getVehicleById`, {
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
  export async function queryTreeListByPid(params) {
    const { ...restParams } = params;
    return request(`${configUrl.pid}/dict/findDictByCode`, {
      method: 'POST',
      data: { ...restParams, appCode: "106305" },
    });
  }
  export async function addEquipments(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/device/insertDevice`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
  export async function editEquipments(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/device/updateDevice`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
  
  export async function getDeviceById(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/device/getDeviceById`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
  export async function queryFacility(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/device/getDeviceListByVehicleIdDeviceType`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
  