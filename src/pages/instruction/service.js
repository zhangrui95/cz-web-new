import request from '@/utils/request';

const { configUrl } = window;

export async function getNoticeList(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/notice/getPoliceNoticeListPageSearch`, {
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
  //车辆列表查询（根据所属机构）
export async function getVehicleList(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/vehicle/getVehicleList`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
//上传图片
  export async function uploadImg(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/notice/uploadImg`, {
      method: 'POST',
      data: { ...restParams },
    });
  }
//上传视频
  export async function uploadVideo(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/notice/uploadVideo`, {
      method: 'POST',
      data: { ...restParams },
    });
  }

//上传音频
  export async function uploadAudio(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/notice/uploadAudio`, {
      method: 'POST',
      data: { ...restParams },
    });
  }


export async function insertPoliceNotice(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/notice/insertPoliceNotice`, {
    method: 'POST',
    data: { ...restParams },
  });
}
export async function delPoliceNotice(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/notice/delPoliceNotice`, {
    method: 'POST',
    data: { ...restParams },
  });
}
export async function delFile(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/notice/delFile`, {
    method: 'POST',
    data: { ...restParams },
  });
}