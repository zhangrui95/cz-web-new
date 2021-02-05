import request from '@/utils/request';

const { configUrl } = window;

export async function getPeopleCheckList(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/capture/portraitCheckRecord`, {
    method: 'POST',
    data: { ...restParams },
  });
}

export async function getCarCheckList(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/capture/vehicleCheckRecord`, {
    method: 'POST',
    data: { ...restParams },
  });
}
 export async function exportPortraitXLSX(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/capture/exportPortraitCheckRecord`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
  export async function exportVehicleXLSX(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/capture/exportVehicleCheckRecord`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
  export async function getPortraitCaptureRecordById(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/capture/getPortraitCheckRecordById`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
  export async function getVehicleCaptureRecordById(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/capture/getVehicleCheckRecordById`, {
      method: 'POST',
      data: { ...restParams },
    });
  }