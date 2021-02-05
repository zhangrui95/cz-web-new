import request from '@/utils/request';

const { configUrl } = window;

export async function queryPortraitCaptureList(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/capture/portraitCaptureRecord`, {
    method: 'POST',
    data: { ...restParams },
  });
}
export async function macCheckRecord(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/capture/macCheckRecord`, {
    method: 'POST',
    data: { ...restParams },
  });
}
export async function queryVehicleCaptureList(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/capture/vehicleCaptureRecord`, {
    method: 'POST',
    data: { ...restParams },
  });
}

export async function getPoliceCarList(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/vehicle/getVehicleList`, {
    method: 'POST',
    data: { ...restParams },
  });
}
  export async function exportPortraitXLSX(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/capture/exportPortraitCaptureRecord`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
  export async function exportVehicleXLSX(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/capture/exportVehicleCaptureRecord`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
   export async function exportMacXLSX(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/capture/exportMacCheckRecord`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
export async function getPortraitCaptureRecordById(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/capture/getPortraitCaptureRecordById`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
  export async function getVehicleCaptureRecordById(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/capture/getVehicleCaptureRecordById`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
export async function getWifiDevicePgListPage(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/wifiDevice/getWifiDevicePgListPage`, {
        method: 'POST',
        data: { ...restParams },
    });
}
