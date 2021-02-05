import React from 'react';
import { connect } from 'dva';
import { Redirect } from 'umi';

class SecurityLayout extends React.Component {
    state = {
        isManualLogin:false
    };
  componentWillMount() {
    const { dispatch } = this.props;
    if(this.newGetRequest().token){
        this.setState({isManualLogin: true}, () => {
        sessionStorage.setItem('userToken', this.newGetRequest().token);
        this.getUser()
        })
    }else{

        if(sessionStorage.getItem('userToken')){
             this.setState({isManualLogin: true})

        }
    }

  }
getUser = () => {
    const { dispatch } = this.props;
    var sendDate = (new Date()).getTime();
    dispatch({
    type: 'login/loginToken',
     payload: {
                token: this.newGetRequest().token,
                sid:'czht_sys'
            },
            logBack: (e) =>{
             console.log('logBack',e)
              var receiveDate = (new Date()).getTime();
            var responseTimeMs = receiveDate - sendDate;
             let params = {}
             if(e.status == '401'){
                 console.log('登录失败----',window.location.hostname.split('/'))
                 params = {
                    action: '登录失败',
                    details:  '( '+ window.location.hostname.split('/') +' ) 访问:'+ window.configUrl.logUrl + ' 传入:'+ JSON.stringify({token: this.newGetRequest().token, sid: 'czht_sys'}) + '执行:'+ '登录失败' + '用户' + '共用时:' + responseTimeMs +'毫秒',
                    ip: window.configUrl.logUrl,
                    method: '',
                    opt_unit_code: '100000000000',
                    params: JSON.stringify({token: this.newGetRequest().token, sid: 'czht_sys'}),
                    time: responseTimeMs,
                    type: '用户',
                 }
             }else{
                  console.log('登录成功----')
                   params = {
                    action: '登录成功',
                    details: e.data.user.name + '( '+ window.location.hostname.split('/') +' ) 访问:'+ window.configUrl.logUrl + ' 传入:'+ JSON.stringify({token: this.newGetRequest().token, sid: 'czht_sys'}) + '执行:'+ '登录成功' + '用户' + '共用时:' + responseTimeMs +'毫秒',
                    ip: window.configUrl.logUrl,
                    method: '',
                    opt_id: e.data.user.id,
                    opt_idcard: e.data.user.idCard,
                    opt_name: e.data.user.name,
                    opt_unit_code: e.data.user.department,
                    params: JSON.stringify({token: this.newGetRequest().token, sid: 'czht_sys'}),
                    time: responseTimeMs,
                    type: '用户',
                 }
             }
             console.log(params,JSON.stringify(params))
        dispatch({
                type: 'login/queryJurisdictionalArea',
                payload: {idCard: e.data.user.idCard },
                callback: (e)=> {
            console.log('huidiao',e)
            dispatch({
                type: 'login/insertSysLog',
                payload: {
                    ...params
                 },
            })

        },
            })


        }
})
}
 //获取url的参
 newGetRequest() {
    // console.log(location)
    var url = location.hash; //获取url中"?"符后的字串
    var theRequest = new Object();
    // console.log(url,'ul===')
    if (url.indexOf("?") != -1) {
        var str = url.split("?");
        //  console.log(str)
        var strs = str[1].split("&");
        //  console.log(strs)
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}
  render() {
    const { children, loading, currentUser } = this.props;
    const { isManualLogin } = this.state
    // You can replace it to your authentication rule (such as check token exists)
    // 你可以把它替换成你自己的登录认证规则（比如判断 token 是否存在）

    // const isLogin = sessionStorage.getItem('userToken');
    // console.log(isLogin,children)
    // const queryString = stringify({
    //   redirect: window.location.href,
    // });

    if (!isManualLogin) {
      return <Redirect to="/user/login"></Redirect>;
    }

    return children;
  }
}

export default connect(({ user, loading }) => ({
  // currentUser: user.currentUser,
  // loading: loading.models.user,
}))(SecurityLayout);
