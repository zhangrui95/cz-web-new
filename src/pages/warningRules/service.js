import request from '@/utils/request';

const { configUrl } = window;

export async function queryLabelModelList(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/labelModel/queryLabelModelList`, {
    method: 'POST',
    data: { ...restParams },
  });
}

export async function queryRuleConfig(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/ruleConfig/queryRuleConfig`, {
    method: 'POST',
    data: { ...restParams },
  });
}
export async function querySysCode(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/localData/querySysCode`, {
    method: 'POST',
    data: { ...restParams },
  });
}
export async function updateLabelModel(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/labelModel/updateLabelModel`, {
    method: 'POST',
    data: { ...restParams },
  });
}

export async function delLabelModel(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/labelModel/delLabelModel`, {
    method: 'POST',
    data: { ...restParams },
  });
}

export async function insertLabelModel(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/labelModel/insertLabelModel`, {
    method: 'POST',
    data: { ...restParams },
  });
}
export async function existsLabel(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/labelModel/existsLabel`, {
    method: 'POST',
    data: { ...restParams },
  });
}
