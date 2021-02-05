// use localStorage to store the authority info, which might be sent from server in actual project.
//权限菜单
export function getAuthority(str) {
//   console.log('str---->', str);
  let roleList = sessionStorage.getItem('authoMenuList') ? JSON.parse(sessionStorage.getItem('authoMenuList')) : [];
  let list = [];
  roleList.map((event) => {
    list.push(event.resourceCode)
  });
  const authorityString = list;
  let authority;
  try {
    if (authorityString) {
      authority = authorityString;
    }
  } catch (e) {
    authority = authorityString;
  }
  if (typeof authority === 'string') {
    return [authority];
  }
//   console.log('authority----->', authority);
  return authority;
}
export function setAuthority(authority) {
  const proAuthority = typeof authority === 'string' ? [authority] : authority;
  return localStorage.setItem('antd-pro-authority', JSON.stringify(proAuthority));
}

// 通过权限编码查询权限列表获取是否有此权限，返回true或false
export function authorityIsTrue(code) {
  let isTrue = false;
//   console.log(code,'========')
  const authoMenuList = sessionStorage.getItem('authoMenuList') && sessionStorage.getItem('authoMenuList') === 'undefined'
    ? [] : JSON.parse(sessionStorage.getItem('authoMenuList')); // 权限列表

  if (authoMenuList && authoMenuList.length > 0) {
    for (let i = 0; i < authoMenuList.length; i++) {
      const menu = authoMenuList[i];

      if (menu.resourceCode === code) {
        isTrue = true;
      }
    }
  }
//  console.log(isTrue,'-------')
  return isTrue;
}
