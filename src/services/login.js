import request from '@/utils/request';

const { configUrl } = window;

export async function fakeAccountLogin(params) {
  return request(`${configUrl.securityCenterUrl}/api/login`, {
    method: 'POST',
    data: params,
  });
}
export async function queryJurisdictionalArea(params) {
    return request(`${configUrl.securityCenterUrl}/external/queryJurisdictionalArea`, {
      method: 'POST',
      data: params,
    });
  }
export async function getFakeCaptcha(mobile) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}

export async function insertSysLog(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/sysLog/insertSysLog`, {
    method: 'POST',
    data: { ...restParams },
  });
}
export async function loginToken(params) {
  return request(`${configUrl.securityCenterUrl}/api/loginToken`, {
    method: 'POST',
    data: params,
  });
}