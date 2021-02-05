import request from '@/utils/request'

const { configUrl } = window

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
export async function getPoliceUnitList(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/dutyPoliceUnit/getPoliceUnitListSearch`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function delPoliceUnitList(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/dutyPoliceUnit/delPoliceUnit`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function createPoliceUnitList(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/dutyPoliceUnit/insertPoliceUnit`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function updatePoliceUnitList(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/dutyPoliceUnit/updatePoliceUnit`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//班次
export async function getShiftsList(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/duty/getShiftsListSearch`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function delShifts(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/duty/delShifts`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function updateShifts(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/duty/updateShifts`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function insertShifts(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/duty/insertShifts`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//装备
export async function getEquipmentList(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/duty/getEquipmentListSearch`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function delEquipment(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/duty/delEquipment`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function updateEquipment(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/duty/updateEquipment`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function insertEquipment(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/duty/insertEquipment`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//机构范围查询
export async function getOrgGpsLabelList(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/bayonet/getBayonetListSearch`, {
		method: 'POST',
		data: { ...restParams }
	})
}

export async function insertGpsLabel(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/bayonet/insertBayonet`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function insertnewGpsLabel(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/bayonet/addBayonet`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function updateGpsLabel(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/gps/updateGpsLabel`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function updatenewGpsLabel(params) {
	console.log('3')
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/bayonet/updateBayonetData`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function delGpsLabel(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/bayonet/delBayonet`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function getAllGpsLabelList(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/bayonet/SelectBayonetAll`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//巡逻范围
export async function getpatrolList(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/gps/getPatrolGpsLabelList`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//巡逻范围树
export async function getpatrolListTree(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/gps/getAllGpsByOrgCode`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//勤务报备
export async function getScheduleListSearch(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/duty/getScheduleListSearch`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//装备列表查询（根据所属机构）
export async function getEquipmentByOrgCode(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/duty/getEquipmentByOrgCode`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//根据机构数组查询警员
// export async function findUserByDeptList(params) {
//     const { ...restParams } = params;
//     return request(`${configUrl.securityCenterUrl}/lowcase/findUserByDeptList`, {
//       method: 'POST',
//       data: { ...restParams },
//     });
//   }
//根据机构数组查询警员 含有照片
export async function findUserByDeptList(params) {
	const { ...restParams } = params
	return request(`${configUrl.securityCenterUrl}/lowcase/queryUserList`, {
		method: 'POST',
		data: { ...restParams, isPhoto: 1 }
	})
}

//班次列表查询（根据所属机构）
export async function getShiftsByOrgCode(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/duty/getShiftsByOrgCode`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//警力单元列表查询（根据所属机构）
export async function getPoliceUnitByOrgCode(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/dutyPoliceUnit/getPoliceUnitByOrgCode`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//车辆列表查询（根据所属机构）
export async function getVehicleList(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/vehicle/getVehicleList`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//排班添加
export async function insertSchedule(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/duty/insertSchedule`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//排班详情
export async function getScheduleByDate(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/duty/getScheduleByDate`, {
		method: 'POST',
		data: { ...restParams }
	})
}
export async function updateSchedule(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/duty/updateSchedule`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//巡逻区域查询
export async function getGpsLabelAreaListByCode(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/gps/getGpsLabelAreaListByCode`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//巡逻线路查询
export async function getGpsLabelLineListByCode(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/gps/getGpsLabelLineListById`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//根据巡逻路线id查询警力单元
export async function getDutyPoliceUnitByLabelId(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/dutyPoliceUnit/getDutyPoliceUnitByLabelId`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//获取排班列表
export async function getScheduleListPageSearch(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/duty/getScheduleListPageSearch`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//清除排班
export async function delSchedule(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/duty/delSchedule`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//当日警员排班列表
export async function getPoliceScheduleList(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/duty/getPoliceScheduleList`, {
		method: 'POST',
		data: { ...restParams }
	})
}

//复制日排班
export async function copyDaySchedule(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/duty/copyDaySchedule`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//复制周排班
export async function copyWeekSchedule(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/duty/copyWeekSchedule`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//根据区域id查询巡逻信息
export async function getAllGpsLabelById(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/gps/getAllGpsLabelById`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//巡逻范围时段人流密度列表
export async function getFlowDensitysListByDate(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/flowDensity/getFlowDensitysListByDate`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//巡逻范围时段人流密度统计查询
export async function getFlowDensitysCountByDate(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/flowDensity/getFlowDensitysCountByDate`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//巡逻范围时段警情列表
export async function getPoliceAlarmListByDate(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/policeAlarm/getPoliceAlarmListByDate`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//巡逻范围时段警情统计查询
export async function getPoliceAlarmCountByDate(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/policeAlarm/getPoliceAlarmCountByDate`, {
		method: 'POST',
		data: { ...restParams }
	})
}
//装备盘点统计查询
export async function getEquipmentStatisticsList(params) {
	const { ...restParams } = params
	return request(`${configUrl.serverUrl}/equipment/getEquipmentStatisticsList`, {
		method: 'POST',
		data: { ...restParams }
	})
}

