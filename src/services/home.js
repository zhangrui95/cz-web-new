import request from '@/utils/request';

const { configUrl } = window;

export async function getCheckListByDate(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/homePage/getVerificationComparisonStatistics`, {
    method: 'POST',
    data: { ...restParams },
  });
}

export async function getVehicleGps(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/homePage/getVehicleGps`, {
    method: 'POST',
    data: { ...restParams },
  });
}

export async function getVehicleTrajectory(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/vehicle/getVehicleTrajectory`, {
    method: 'POST',
    data: { ...restParams },
  });
}
export async function getCodeStream(params) {
  const { ...restParams } = params;
  return request(`${configUrl.codeStream}/video/rtspToRtmp`, {
    method: 'POST',
    data: { ...restParams },
  });
}
export async function closeCodeStream(params) {
  const { ...restParams } = params;
  return request(`${configUrl.codeStream}/video/stopRtspToRtmp`, {
    method: 'POST',
    data: { ...restParams },
  });
}

export async function queryTreeListByPid(params) {
    const { ...restParams } = params;
    return request(`${configUrl.pid}/dict/findDictByCode`, {
      method: 'POST',
      data: { ...restParams,appCode: "106305" },
    });
  }
export async function getEquipmentListByVehicleId(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/homePage/getEquipmentCountByVehicleId`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
export async function getScheduleCountByVehicleId(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/homePage/getScheduleCountByVehicleId`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
export async function getScheduleListByVehicleId(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/homePage/getScheduleListByVehicleId`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
  export async function getVehiclePoliceAlarmList(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/homePage/getVehiclePoliceAlarmList`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
    export async function getPlayUrl(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/hik/getPlayUrl`, {
      method: 'POST',
      data: { ...restParams },
    });
  }