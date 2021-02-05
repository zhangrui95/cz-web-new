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
export async function getStudyJudgesList(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/studyJudge/getStudyJudgeListSearch`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function getPersonByIdCard(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/person/getPersonByIdCard`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function insertStudyJudge(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/studyJudge/insertStudyJudge`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function getPersonArchivesList(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/person/getPersonArchivesList`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function queryCheckPersonList(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/checkInfor/queryCheckPersonList`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function getPersonExpenseCalendarList(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/expenseCalendar/getExpenseCalendarList`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function insertAlarmRecord(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/alarmRecord/insertAlarmRecord`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function updatePersonArchives(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/person/updatePersonArchives`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function getPersonArchivesReadStatus(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/person/getPersonArchivesReadStatus`, {
		method: 'POST',
		data: { ...restParams }
	})
}
