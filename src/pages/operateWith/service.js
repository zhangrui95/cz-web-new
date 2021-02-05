import request from '@/utils/request';

const { configUrl } = window;

export async function queryCoordinatedPgListPage(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/coordinatedOperations/queryCoordinatedPgListPage`, {
    method: 'POST',
    data: { ...restParams },
  });
}

export async function queryCorrdingatedList(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/coordinatedOperations/queryCorrdingatedList`, {
    method: 'POST',
    data: { ...restParams },
  });
}
