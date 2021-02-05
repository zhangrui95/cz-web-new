import React from 'react';
import { List, Button, Icon,Message } from 'antd';
import videojs from "video.js/dist/video.js";
import styles from './styles.less';
// import "video.js/dist/video-js.css"
require('!style-loader!css-loader!video.js/dist/video-js.css')
// videojs.options.flash.swf = require('video.js/dist/video-js.swf');
export default class VideoPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: "", // VMS token
      resourceData: [], // 资源数
      videoFileStream: this.props.src || '', // 实时视频流地址
      visible: false,
      showMune: false,
      deviceMessage: this.props.deviceMessage || [],
      showBtn: false,
      videoName: this.props.videoName || '',
    };
  }
  componentDidMount() {
    console.log('进入页面')
    this.reloadPlayer();
  }
  componentWillUnmount() {
    if (this.player) {
      this.player.dispose()
    }
  }
  close = () =>{
        console.log('diaoypmh',this)
        var myVideoDiv = document.getElementById("myVideoDiv")
        console.log(document.getElementById("myVideoDiv"))

        // if (this.player) {
        //     this.player.dispose();

        //     console.log(document.getElementById("myVideoDiv"))
        //     // myVideoDiv.innerHTML = " <div data-vjs-player><video id='myVideo' ref={node => this.videoNode = node} className='video-js vjs-default-skin vjs-big-play-centered'><track kind='captions' /></video></div>"
        // }
    }
  //https://blog.csdn.net/a0405221/article/details/80923090 使用文档可参考此链接
  reloadPlayer = () => {
    const { videoFileStream } = this.state;
    console.log(videoFileStream)
    var _self = this
    const options = {
      width: this.props.width ? this.props.width +'px' : '900px',//获取屏幕可视宽度，因为左侧占据 25%，所以宽度比 25% 再窄一点；
      height: this.props.height ? this.props.height +'px' : "508px",
      muted: false,
      controls: 'controls',
      preload: "auto",
      autoPlay: true,
    };
    //  this.setState({})
    this.player = videojs('myVideo', options, function onPlayerReady() {
      this.play();
        this.on('error', function(){
          this.errorDisplay.close();   //将错误信息不显示
          // 自定义显示方式
          Message.destroy()
          Message.error('视频播放失败')
        })
      _self.setState({showBtn: true})
    //   setTimeout(() => {
    //     this.pause();
    //     this.play();
    //   }, 3000);
    });
    this.player.src({
      src: videoFileStream,
      type: 'application/x-mpegURL',
    });

  }

videoRender = () =>{
    console.log('渲染')
    return (
        <div data-vjs-player style={{  width: this.props.width ? this.props.width +'px' : '900px',
            height: this.props.height ? this.props.height +'px' : "508px"}}>
            <video
            ref={node => this.videoNode = node}
            id="myVideo"
            className="video-js vjs-default-skin vjs-big-play-centered"
            >
                <track kind="captions" />
            </video>
        </div>
    )
}

  render() {
      const {deviceMessage, videoName,videoFileStream} = this.state;
    //   console.log(deviceMessage,videoFileStream,videoName)
    return (
        <div className={styles.videoCon}>
            <div id="myVideoDiv">
                {this.videoRender()}
            </div>
            {/*{*/}
            {/*    this.state.showBtn*/}
            {/*    ?*/}
            {/*    <div>*/}
            {/*    {*/}
            {/*        this.state.showMune*/}
            {/*        ?*/}
            {/*        <transition>*/}
            {/*        {*/}
            {/*            deviceMessage.length*/}
            {/*            ?*/}
            {/*            <div className={styles.muneBtns}>*/}
            {/*            {*/}
            {/*                deviceMessage.map((v,k) =>(*/}
            {/*                        <div type="primary"*/}
            {/*                        className={styles.btns}*/}
            {/*                        key={k}*/}
            {/*                        onClick={() => this.setState({videoFileStream: v.mldz, showMune: false,showBtn: false, videoName: v.device_name},() =>{*/}
            {/*                            this.reloadPlayer()*/}
            {/*                        })}*/}
            {/*                        style={{padding: `${v.length > 5 ? v.length > 10 ? '0 10px' : '10px 10px' : '20px 10px' }`}}>*/}
            {/*                            {v.device_name}*/}
            {/*                        </div>*/}
            {/*                ))*/}
            {/*            }*/}

            {/*                    <div type="primary" className={styles.back}  onClick={() => this.setState({showMune: false})}>*/}
            {/*                        <Icon type="rollback" />*/}
            {/*                        <div>返回</div>*/}
            {/*                    </div>*/}

            {/*            </div>*/}
            {/*            :*/}
            {/*            null*/}
            {/*        }*/}

            {/*        </transition>*/}
            {/*        :*/}
            {/*        <Button*/}
            {/*            type="primary"*/}
            {/*            shape="circle"*/}
            {/*            className={styles.circleBtn}*/}
            {/*            onClick={() => this.setState({showMune: true})}*/}
            {/*        >*/}
            {/*            <Icon type="video-camera" />*/}
            {/*            <div>{videoName}</div>*/}
            {/*        </Button>*/}
            {/*    }*/}
            {/*    </div>*/}
            {/*    :*/}
            {/*    null*/}
            {/*}*/}


        </div>
    )
  }
}
