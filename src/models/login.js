import { routerRedux } from 'dva/router';
import { stringify } from 'querystring';
import { message } from 'antd';
import { fakeAccountLogin, getFakeCaptcha, queryJurisdictionalArea, insertSysLog, loginToken } from '@/services/login';
import { setAuthority } from '@/utils/authority';
import { reloadAuthorized } from '@/utils/Authorized';
import { getPageQuery } from '@/utils/utils';
const Model = {
  namespace: 'login',
  state: {
    status: undefined,
    MenuData: {},
    times:''
  },
  effects: {
      
      *setTimes({ payload }, { call, put }) {
      yield put({
            type: 'times',
            payload: payload,
            });
    },
    *login({ payload, callback, logBack }, { call, put }) {
      const response = yield call(fakeAccountLogin, payload);
      // yield put({
      //   type: 'changeLoginStatus',
      //   payload: response,
      // }); // Login successfully
        
      if (response && response.data && response.data.token) {
          console.log(response.data.menu)
        const authoMenuList = response.data.menu;
        // const haveAutho = true;
        let haveAutho = false;
        // 判断当前人是否有此系统权限
        for (let i = 0; i < authoMenuList.length; i++) {
          const menu = authoMenuList[i];
          console.log(menu)
          if (menu.resourceCode === 'czht_welcome') {
            haveAutho = true;
            break;
          }
        }
        if (haveAutho) {
        //     // debugger;;
          sessionStorage.setItem('userToken', response.data.token);
          sessionStorage.setItem('quit', true);
        // //   debugger;;
          sessionStorage.setItem('user', JSON.stringify(response.data.user));
        // //   debugger;;
          sessionStorage.setItem('authoMenuList', JSON.stringify(response.data.menu));
         reloadAuthorized();//获取一遍权限
        
        } else {
          message.warning('当前登陆人无权限访问系统，请联系管理员');
          return false
        }
        if (callback) {
          callback(response);
        }
        if(logBack){
            logBack(response)
        }
      } else {
        return false;
      }
    },
*loginToken({ payload, callback, logBack }, { call, put }) {
      const response = yield call(loginToken, payload);
      if (response && response.data && response.data.token) {
          console.log(response.data.menu)
        const authoMenuList = response.data.menu;
        // const haveAutho = true;
        let haveAutho = false;
        // 判断当前人是否有此系统权限
        for (let i = 0; i < authoMenuList.length; i++) {
          const menu = authoMenuList[i];
          console.log(menu)
          if (menu.resourceCode === 'czht_welcome') {
            haveAutho = true;
            break;
          }
        }
        if (haveAutho) {
        //     // debugger;;
          sessionStorage.setItem('userToken', response.data.token);
          sessionStorage.setItem('quit', false);
        // //   debugger;;
          sessionStorage.setItem('user', JSON.stringify(response.data.user));
        // //   debugger;;
          sessionStorage.setItem('authoMenuList', JSON.stringify(response.data.menu));
         reloadAuthorized();//获取一遍权限
        
        } else {
          message.warning('当前登陆人无权限访问系统，请联系管理员');
          return false
        }
        if (callback) {
          callback(response);
        }
        if(logBack){
            logBack(response)
        }
      } else {
        return false;
      }
    },
    *getCaptcha({ payload }, { call }) {
      yield call(getFakeCaptcha, payload);
    },
    *queryJurisdictionalArea({ payload, callback }, { call, put }) {
        const response = yield call(queryJurisdictionalArea, payload);
        console.log('res', response)
        const user = JSON.parse(sessionStorage.getItem('user'));
        user.groupList = response.data
        console.log(user)
        sessionStorage.setItem('user', JSON.stringify(user));
        let codes = []
		for (var i = 0; i < response.data.length; i++) {
        codes.push(response.data[i].code);
    }
        sessionStorage.setItem('groupListCode', JSON.stringify(codes));
         yield put(routerRedux.push('/'));
        if (response&&callback) {
          callback(response);
        }
      },
      *insertSysLog({ payload, callback }, { call, put }) {
        const response = yield call(insertSysLog, payload);
         if (response&&callback) {
          callback(response);
        }

      },
    *logout(_, { put }) {
      const { redirect } = getPageQuery(); // redirect
      sessionStorage.clear();
      if (window.location.pathname !== '/user/login' && !redirect) {
        yield put(
          routerRedux.replace({
            pathname: '/user/login',
            search: stringify({
              redirect: window.location.href,
            }),
          }),
        );
      }
    },
  },
  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority('admin');
      return { ...state, status: 'ok', type: payload.type, MenuData: payload.data.menu };
    },
    times(state, action) {
      return { ...state, times: action.payload.times };
    },
  },
};
export default Model;
