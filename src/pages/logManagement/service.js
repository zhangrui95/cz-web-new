import request from '@/utils/request';

const { configUrl } = window;

export async function getSysLogListSearch(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/sysLog/getSysLogListSearch`, {
    method: 'POST',
    data: { ...restParams },
  });
}
