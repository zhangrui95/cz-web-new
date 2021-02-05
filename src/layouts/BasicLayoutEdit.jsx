/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout from '@ant-design/pro-layout'
import { Layout, Menu, Breadcrumb, Icon } from 'antd'
import React, { useState, useEffect } from 'react'
import Link from 'umi/link'
import { connect } from 'dva'
import { formatMessage } from 'umi-plugin-react/locale'
import Authorized from '@/utils/Authorized'
import RightContent from '@/components/GlobalHeader/RightContent'
import { isAntDesignPro } from '@/utils/utils'
import styles from './BasicLayoutEdit.less'
import logo from '../assets/logo.2bb47e24.png'
import DocumentTitle from 'react-document-title'
import icon1 from '../assets/01.png'
import icon2 from '../assets/02.png'
import icon3 from '../assets/03.png'
import icon4 from '../assets/04.png'
import icon5 from '../assets/05.png'
import icon6 from '../assets/06.png'
import icon7 from '../assets/07.png'
import icon8 from '../assets/08.png'
import icon9 from '../assets/09.png'
import icon10 from '../assets/010.png'

import icon1_1 from '../assets/001.png'
import icon2_1 from '../assets/002.png'
import icon3_1 from '../assets/003.png'
import icon4_1 from '../assets/004.png'
import icon5_1 from '../assets/005.png'
import icon6_1 from '../assets/006.png'
import icon7_1 from '../assets/007.png'
import icon8_1 from '../assets/008.png'
import icon9_1 from '../assets/009.png'
import icon10_1 from '../assets/0010.png'
import screenIcon from '../assets/qh_1.png'
const { SubMenu } = Menu
const { Header, Content, Sider } = Layout

/**
 * use Authorized check all menu item
 */


    const menuDataRender = menuList =>{
        let arr = []
        for (let index = 0; index < menuList.length; index++) {
            const element = menuList[index];
            const localItem = { ...element, children: element.children ? menuDataRender(element.children) : [] }
             if(element.name){
                // console.log(555555555555555)
                const newRoute = Authorized.check(element.authority, localItem, null)
                // console.log(newRoute)
                if(newRoute != null){
                    arr.push(newRoute)
                }
            }
        }
        return arr
    }



const BasicLayout = (props) => {
	const { dispatch, children, settings, login, match,route } = props
    const MenuData = menuDataRender(props.route.routes)
	const [ selected, setSelected ] = useState(props.location.pathname == '/' ? '/loginByToken' : `/${props.location.pathname.split("/")[1]}`)

	const jump = (path, id) => {
        // console.log(setSelected,'setSelected')
		setSelected(path)
		props.history.push(`${path}`)

	}
    const times = () => {
        var date = new Date()
        var myyear = date.getFullYear()
		var mymonth = date.getMonth() + 1
		var myweekday = date.getDate()
        var hour = date.getHours();
        var minute = date.getMinutes();
		if (minute < 10) {
			minute = '0' + minute
		}

			return myyear + '年' + mymonth + '月' + myweekday + '日' + hour + ":" + minute

        // year + "年" + month + "月" + date + "日 " +" " + hour + ":" + minute + ":" + second +" "+strDate; //显示时间
    // return new Date().toLocaleTimeString()
    }
	/**
   * constructor
   */
	useEffect(() => {
		if (dispatch) {
            setInterval(() => {
            dispatch({
                type:'login/setTimes',
                payload: {times: times()}
            })
            }, 1000)
		}
		if(`/${props.location.pathname.split("/")[1]}` == '/home' || `/${props.location.pathname.split("/")[1]}` == '/index'){
			setSelected(`/loginByToken`);
		}else{
			setSelected(`/${props.location.pathname.split("/")[1]}`);
		}
	}, [props.location.pathname])
	/**
   * init variables
   */
const user = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : ''

	return (
		<DocumentTitle title={window.configUrl.name}>

			<Layout style={{ minHeight: '100%' }}>
				<Header className={styles.header} theme="dark">

					<img className={styles.logos} src="./image/logo.png" alt="" />
					<span className={styles.logoTitle}>{window.configUrl.name}</span>
					{/* <img className={styles.logoss} src={logo} /> */}

                    <span className={styles.logoTimes}>{login.times == '' ? times() : login.times}</span>
                    <div className={styles.logoInfo}>
                    {/*{*/}
                    {/*    props.location.pathname == '/loginByToken' || props.location.pathname == '/'  || props.location.pathname == '/czht_xsy'*/}
                    {/*    ?*/}
                    {/*    <div className={styles.screen}><span className={styles.screentile}>投放大屏</span><img className={styles.screenIcon} src={screenIcon} onClick={() => {*/}
                    {/*     console.log(window.location)*/}
                    {/*     window.open(`${window.location.origin}${window.location.pathname}#/screen`, '_blank')*/}
                    {/*     }}/></div>*/}
                    {/*     :*/}
                    {/*     null*/}
                    {/*}*/}

                        <div className={styles.headInfo}>
                            <p className={styles.headInfoName}>{user != '' ? user.name : ''} ，{user != '' ? user.pcard : ''}</p>
                            <p className={styles.headInfoInstitutions}>{user != '' ? user.group.name : ''}</p>
                        </div>
                    </div>

					<div style={{ position: 'absolute', right: '30px' }}>

                    {/* {
                        sessionStorage.getItem('quit') == 'true'
                        ? */}
                        <RightContent currentUser={JSON.parse(sessionStorage.getItem('user'))}/>
                        {/* :
                        null

                    } */}

					</div>
				</Header>
				<Layout style={{ backgroundColor: '#1f274c' }}>
					<Sider width={100} style={{ marginRight: '2px' }}>
						<Menu
							theme="dark"
							style={{
								backgroundColor: '#0d1532',
								overflowY: 'auto',
								height: '98%',
								paddingBottom: '10px'
							}}
							defaultSelectedKeys={[`/${props.location.pathname.split("/")[1]}` ]}
							defaultOpenKeys={[ 'sub1' ]}
							// onClick={(e) => {
                            //     console.log(e,'000---000')
                            //     setSelected(e.key)
                            // }}
						>

							{MenuData.map((menu,index) =>
                            <Menu.Item
									theme="dark"
									key={menu.path}
									style={{ height: '90px', paddingTop: '10px' }}
									className={styles.memuListItem}
								>

                               {
                                   menu != null
                                   ?
                                   <div className={styles.link} onClick={() => {
                                    //    console.log(menu.path, menu.id,'/////')
                                       jump(menu.path, menu.id)
                                   }}>
										<div
											className={styles.selete}
											// style={{
											//   backgroundImage:
											//     selected === menu.id? `linear-gradient(180deg, #fff 25%, ${menu.color} 100%)` : '',
											// }}
										>
                                        {
                                            // console.log(selected,'===',menu.path,'----', menu.id)
                                        }
											<img
												className={styles.itemImage}
												alt=""
												src={
													selected == menu.path || selected == menu.id ? (
														menu.icon_on
													) : (
														menu.icon
													)
												}
											/>
										</div>
										<span>{menu.name}</span>
									</div>
                                   :
                                   null
                               }

								</Menu.Item>
                                )}
						</Menu>
					</Sider>
					<Layout style={{ padding: '74px 50px 50px 150px' }}>
						<Content
							style={{
								background: '#0d1632',
								margin: 0,
								minHeight: 280
							}}
						>
							{children}
						</Content>
					</Layout>
				</Layout>
			</Layout>
		</DocumentTitle>
	)
}

export default connect(({ global, settings, login }) => ({
	collapsed: global.collapsed,
	settings,
	login,
}))(BasicLayout)
