import request from '@/utils/request';

const { configUrl } = window;


  export async function queryTreeListByPid(params) {
    const { ...restParams } = params;
    return request(`${configUrl.pid}/dict/findDictByCode`, {
      method: 'POST',
      data: { ...restParams, appCode: "106305" },
    });
  }
  export async function creatCar(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/vehicle/insertVehicle`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
  export async function updateCar(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/vehicle/updateVehicle`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
  export async function fetchCar(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/vehicle/getVehicleById`, {
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
   export async function getVehicleByCarNo(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/vehicle/getVehicleByCarNo`, {
      method: 'POST',
      data: { ...restParams },
    });
  }