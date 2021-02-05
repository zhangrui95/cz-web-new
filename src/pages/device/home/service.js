import request from '@/utils/request';

const { configUrl } = window;

export async function getVehicleList(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/vehicle/getVehicleListSearch`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
  export async function delVehicle(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/vehicle/delVehicle`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
   export async function delBayonet(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/bayonet/delBayonet`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
    export async function delIndividual(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/individualEquipment/delIndividualEquipment`, {
      method: 'POST',
      data: { ...restParams },
    });
  }

  export async function getBayonetListSearch(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/bayonet/getBayonetListSearch`, {
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
  export async function bayonetXLSX(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/bayonet/downloadBayonetModal`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
    export async function individualXLSX(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/individualEquipment/downloadIndividualEquipmentModal`, {
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
  export async function insertBayonet(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/bayonet/insertBayonet`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
 export async function updateBayonet(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/bayonet/updateBayonet`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
 export async function getIndividual(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/individualEquipment/getIndividualEquipmentListSearch`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
    export async function insertIndividual(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/individualEquipment/insertIndividualEquipment`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
 export async function updateIndividual(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/individualEquipment/updateIndividualEquipment`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
export async function getPersonCheckServices(params) {
    const { ...restParams } = params;
    return request(`${configUrl.personcarserverUrl}/data/getPersonList`, {
        method: 'POST',
        data: { ...restParams },
    });
}
export async function getCarCheckServices(params) {
    const { ...restParams } = params;
    return request(`${configUrl.personcarserverUrl}/data/getCarList`, {
        method: 'POST',
        data: { ...restParams },
    });
}
