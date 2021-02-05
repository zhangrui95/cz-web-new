import request from '@/utils/request';

const { configUrl } = window;

export async function getEquipmentCheckList(params) {
  const { ...restParams } = params;
  return request(`${configUrl.serverUrl}/equipment/getEquipmentCheckList`, {
    method: 'POST',
    data: { ...restParams },
  });
}
