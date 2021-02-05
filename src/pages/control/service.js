import request from '@/utils/request';

const { configUrl } = window;
//分页列表
export async function getTemporaryCtrlPersonlistPage(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/data/getTemporaryCtrlPersonlistPage`, {
    method: 'POST',
    data: { ...restParams },
  });
}
export async function getTemporaryCtrlCarlistPage(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/data/getTemporaryCtrlCarlistPage`, {
    method: 'POST',
    data: { ...restParams },
  });
}
//字典
export async function queryDictionary(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/data/getSysCodeList`, {
		method: 'POST',
		data: { ...restParams}
	})
}
//新建
export async function saveTemporaryCtrlPerson(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/data/saveTemporaryCtrlPerson`, {
		method: 'POST',
		data: { ...restParams}
	})
}
export async function saveTemporaryCtrlCar(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/data/saveTemporaryCtrlCar`, {
		method: 'POST',
		data: { ...restParams}
	})
}
//修改
export async function updateTemporaryCtrlPerson(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/data/updateTemporaryCtrlPerson`, {
		method: 'POST',
		data: { ...restParams}
	})
}
export async function updateTemporaryCtrlCar(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/data/updateTemporaryCtrlCar`, {
		method: 'POST',
		data: { ...restParams}
	})
}
//删除
export async function deleteTemporaryCtrlPerson(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/data/deleteTemporaryCtrlPerson`, {
		method: 'POST',
		data: { ...restParams}
	})
}
export async function deleteTemporaryCtrlCar(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/data/deleteTemporaryCtrlCar`, {
		method: 'POST',
		data: { ...restParams}
	})
}
//导入模板
export async function downloadTemporaryPersonModal(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/data/downloadTemporaryPersonModal`, {
		method: 'POST',
		data: { ...restParams}
	})
}
export async function downloadTemporaryCarModal(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/data/downloadTemporaryCarModal`, {
		method: 'POST',
		data: { ...restParams}
	})
}
