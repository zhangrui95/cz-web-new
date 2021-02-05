import request from '@/utils/request';

const { configUrl } = window;

export async function areaModelsService(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/bayonet/getLxCount`, {
        method: 'POST',
        data: { ...restParams },
    });
}

export async function ListService(params) {
    const { ...restParams } = params;
    return request(`${configUrl.serverUrl}/bayonet/getLxList`, {
        method: 'POST',
        data: { ...restParams },
    });
}


