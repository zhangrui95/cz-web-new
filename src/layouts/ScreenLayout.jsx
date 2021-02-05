import { getMenuData, getPageTitle } from '@ant-design/pro-layout';
import DocumentTitle from 'react-document-title';
import React from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import styles from './ScreenLayout.less';
import title from '../assets/btwz.png'
import title_bg from '../assets/bttp.png'
import down from '../assets/qh.png'
import up from '../assets/qh_1.png'
// const fullscreen = false
const dec = document
const ele = document.documentElement;
// const enterfullscreen = () => { //进入全屏
//     console.log("退出全屏");

//    var de = document;
//     if (de.exitFullscreen) {
//       de.exitFullscreen();
//     } else if (de.mozCancelFullScreen) {
//       de.mozCancelFullScreen();
//     } else if (de.webkitCancelFullScreen) {
//       de.webkitCancelFullScreen();
//     }
// }

// const exitfullscreen = () => { //退出全屏
//     console.log("打开全屏");

//     var de = document.documentElement;
//     if (de.requestFullscreen) {
//       de.requestFullscreen();
//     } else if (de.mozRequestFullScreen) {
//       de.mozRequestFullScreen();
//     } else if (de.webkitRequestFullScreen) {
//       de.webkitRequestFullScreen();
//     }

// }








class ScreenLayout extends React.Component {
state = {
    choose: false
 };
    componentDidMount() {
       document.onkeydown = (event) => {//监听f11按键
       console.log('444')
        if (event.keyCode === 122) {
          return false
        }
      }
     }

handleFullScreen  = () =>  { // 全屏
console.log('1111111')
var ele = document.documentElement;
var de = document
console.log(this.checkFull())
      if (this.checkFull()) {
        this.exitFull()
      } else {
          this.setState({choose: true})
        if (ele.requestFullscreen) {
          ele.requestFullscreen()
        } else if (ele.webkitRequestFullScreen) {
          ele.webkitRequestFullScreen()
        } else if (ele.mozRequestFullScreen) {
          ele.mozRequestFullScreen()
        } else if (ele.msRequestFullscreen) {
          ele.msRequestFullscreen()
        }
      }
    //   fullscreen = !fullscreen
      window.onresize = () => {
          console.log('33333')
        if (!this.checkFull()) {
             console.log('5555')
          this.setState({choose: false}) //恢复图标
        }
      }
      de.onkeydown = (event) => {//监听f11按键
       console.log('444')
        if (event.keyCode === 122) {
            return false
        //   this.exitFull()
        //   this.setState({choose: false})
        }
      }
    }
    exitFull = () => { //退出全屏
    console.log('2222')
    var de = document
      if (de.exitFullscreen) {
        de.exitFullscreen()
      } else if (de.webkitCancelFullScreen) {
        de.webkitCancelFullScreen()
      } else if (de.mozCancelFullScreen) {
        de.mozCancelFullScreen()
      } else if (de.msExitFullscreen) {
        de.msExitFullscreen()
      }

      this.setState({choose: false})
      console.log(this.checkFull())
    }
    checkFull = () =>  {
        console.log('6666',document.fullscreenEnabled, window.fullScreen, document.webkitIsFullScreen, document.msFullscreenEnabled)
      var isFull = document.fullscreenEnabled && document.webkitIsFullScreen
      console.log('7777',isFull)
      if (isFull === undefined) isFull = false
      return isFull
    }
  render() {

        const {
    route = {
      routes: [],
    },
  } = this.props;
  const { routes = [] } = route;
  const {
    children,
    location = {
      pathname: '',
    },
  } = this.props;
  const { breadcrumb } = getMenuData(routes);
  const {choose} = this.state
  return (
    <DocumentTitle
    title={window.configUrl.name}
    >
      <div className={`${styles.container}  `} >
        <div className={styles.header} style={{backgroundImage: `url(./image/bttp.png)`}}>
            <p>智慧车载一体化平台</p>
            <div className={styles.headerbtn}>
                <span>{!choose ? '打开全屏' :  '退出全屏'}</span>
                <img src={choose ? down :  up} alt="" onClick={() => {
                    // this.setState({choose: !choose},() =>{
                        // if()
                        this.handleFullScreen()
                    // })

                }}/>
            </div>
        </div>
        <div className={styles.content} >{children}</div>
      </div>
    </DocumentTitle>
  );
  }
};

export default connect(({ settings }) => ({ ...settings }))(ScreenLayout);
