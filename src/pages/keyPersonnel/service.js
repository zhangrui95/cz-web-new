import request from '@/utils/request'

const { configUrl } = window

export async function getPersonListSearch(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/person/getPersonListSearch`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function queryTreeListByPid(params) {
	const { ...restParams } = params
	return request(`${configUrl.pid}/dict/findDictByCode`, {
		method: 'POST',
		data: { ...restParams, appCode: "106305"}
	})
}
export async function getUseDept(params) {
	const { ...restParams } = params
	return request(`${configUrl.securityCenterUrl}/lowcase/getMechanismTreeByUnitcodeAndDepartment`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function updatePersonArchivesStatus(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/person/updatePersonArchivesStatus`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function queryLabelModelList(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/labelModel/queryLabelModelList`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function insertPerson(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/person/insertPerson`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function downloadPersonModal(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/person/downloadPersonModal`, {
		method: 'POST',
		data: { ...restParams }
	})
}
