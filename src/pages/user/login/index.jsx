import { Alert } from 'antd';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import React, { Component } from 'react';
import { connect } from 'dva';
import md5 from 'blueimp-md5';
import LoginComponents from './components/Login';
import styles from './style.less';
import loginTitle from '@/assets/loginTitle.png';
import loginTitleAn from '@/assets/loginTitle_1.png';
import loginUser from '@/assets/loginUser.png';
import loginPwd from '@/assets/loginPwd.png';
import loginButton from '@/assets/loginButton.png';

const { UserName, Password, Submit } = LoginComponents;

@connect(({ login, loading }) => ({
  userLogin: login,
  submitting: loading.effects['login/login'],
}))
class Login extends Component {
  loginForm = undefined;

  state = {
    type: 'account',
    autoLogin: true,
  };

  changeAutoLogin = e => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };
Format = (fmt) => { // author: meizz
    var o = {
        "M+": this.getMonth() + 1, // 月份
        "d+": this.getDate(), // 日
        "h+": this.getHours(), // 小时
        "m+": this.getMinutes(), // 分
        "s+": this.getSeconds(), // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        "S": this.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt
}
  handleSubmit = (err, values) => {
    const value = values;
    value.password = md5(values.password);
    var sendDate = (new Date()).getTime();

    if (!err) {
      const { dispatch } = this.props;
      dispatch({
        type: 'login/login',
        payload: { ...value, sid: 'czht_sys' },

        logBack: (e) =>{
             console.log('logBack',e)
              var receiveDate = (new Date()).getTime();
            var responseTimeMs = receiveDate - sendDate;
             let params = {}
             if(e.status == '401'){
                 console.log('登录失败----',window.location.hostname.split('/'))
                 params = {
                    action: '登录失败',
                    details:  '( '+ window.location.hostname.split('/') +' ) 访问:'+ window.configUrl.logUrl + ' 传入:'+ JSON.stringify({...value, sid: 'czht_sys'}) + '执行:'+ '登录失败' + '用户' + '共用时:' + responseTimeMs +'毫秒',
                    ip: window.configUrl.logUrl,
                    method: '',
                    opt_unit_code: '100000000000',
                    params: JSON.stringify({...value, sid: 'czht_sys'}),
                    time: responseTimeMs,
                    type: '用户',
                 }
             }else{
                  console.log('登录成功----')
                   params = {
                    action: '登录成功',
                    details: e.data.user.name + '( '+ window.location.hostname.split('/') +' ) 访问:'+ window.configUrl.logUrl + ' 传入:'+ JSON.stringify({...value, sid: 'czht_sys'}) + '执行:'+ '登录成功' + '用户' + '共用时:' + responseTimeMs +'毫秒',
                    ip: window.configUrl.logUrl,
                    method: '',
                    opt_id: e.data.user.id,
                    opt_idcard: e.data.user.idCard,
                    opt_name: e.data.user.name,
                    opt_unit_code: e.data.user.department,
                    params: JSON.stringify({...value, sid: 'czht_sys'}),
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

      });
    }
  };

  onTabChange = type => {
    this.setState({
      type,
    });
  };

  onGetCaptcha = () =>
    new Promise((resolve, reject) => {
      if (!this.loginForm) {
        return;
      }

      this.loginForm.validateFields(['mobile'], {}, async (err, values) => {
        if (err) {
          reject(err);
        } else {
          const { dispatch } = this.props;

          try {
            const success = await dispatch({
              type: 'login/getCaptcha',
              payload: values.mobile,
            });
            resolve(!!success);
          } catch (error) {
            reject(error);
          }
        }
      });
    });

  renderMessage = content => (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );

  render() {
    const { submitting } = this.props;
    const { type } = this.state;
    // const buttonStyle = {
    //   background: `url(${loginButton}) no-repeat center`,
    //   border: 'none',
    // };
    return (
      <div className={styles.main}>

        <LoginComponents
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
          onCreate={form => {
            this.loginForm = form;
          }}
        >
          <div className={styles.title}>
            {/*<img src={window.configUrl.iStreet ? loginTitleAn : loginTitle} alt="" className={styles.loginTitle} />*/}
            <div className={styles.loginTitle}>{window.configUrl.name}</div>
            {/* loginTitleAn */}
          </div>
          <UserName
            name="username"
            prefix={<img src={loginUser} alt="" className={styles.prefixImg} />}
            placeholder={formatMessage({
              id: 'user-login.userName.required',
            })}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'user-login.userName.required',
                }),
              },
            ]}
          />
          <Password
            name="password"
            prefix={<img src={loginPwd} alt="" className={styles.prefixImg} />}
            placeholder={formatMessage({
              id: 'user-login.password.required',
            })}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'user-login.password.required',
                }),
              },
            ]}
            // onPressEnter={e => {
            //   e.preventDefault();

            //   if (this.loginForm) {
            //     this.loginForm.validateFields(this.handleSubmit);
            //   }
            // }}
          />

          <Submit loading={submitting} className={styles.buttonStyle}>
            <FormattedMessage id="user-login.login.login" />
          </Submit>
        </LoginComponents>
      </div>
    );
  }
}

export default Login;
