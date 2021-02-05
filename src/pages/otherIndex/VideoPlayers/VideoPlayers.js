import React from 'react';
import { List, Button, Icon, Message } from 'antd';
import videojs from 'video.js/dist/video.js';
import styles from './styles.less';
// import "video.js/dist/video-js.css"
require('!style-loader!css-loader!video.js/dist/video-js.css');
// videojs.options.flash.swf = require('video.js/dist/video-js.swf');
export default class VideoPlayers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            token: '', // VMS token
            resourceData: [], // 资源数
            videoFileStream: props.src || '', // 实时视频流地址
            visible: false,
            showMune: false,
            deviceMessage: this.props.deviceMessage || [],
            showBtn: false,
            videoName: this.props.videoName || '',
            autoPlays: this.props.autoPlays || false,
        };
        if (this.player) {
            this.player.dispose();
        }
    }
    componentWillUpdate(prevProps){
        if(this.props.src !== prevProps.src){
            this.setState({
                videoFileStream:prevProps.src,
            },()=>{
                this.reloadPlayer();
            });
        }
    }
    componentDidMount() {
        this.reloadPlayer();
    }
    componentWillUnmount() {
        if (this.player) {
            this.player.dispose();
        }
    }
    close = () => {
        console.log('diaoypmh', this);
        var myVideoDiv = document.getElementById('myVideoDiv');
        console.log(document.getElementById('myVideoDiv'));

        // if (this.player) {
        //     this.player.dispose();

        //     console.log(document.getElementById("myVideoDiv"))
        //     // myVideoDiv.innerHTML = " <div data-vjs-player><video id='myVideo' ref={node => this.videoNode = node} className='video-js vjs-default-skin vjs-big-play-centered'><track kind='captions' /></video></div>"
        // }
    };
    //https://blog.csdn.net/a0405221/article/details/80923090 使用文档可参考此链接
    reloadPlayer = () => {
        const { videoFileStream, autoPlays } = this.state;
        var _self = this;
        const options = {
            width: this.props.width ? this.props.width + 'px' : '300px', //获取屏幕可视宽度，因为左侧占据 25%，所以宽度比 25% 再窄一点；
            height: this.props.height ? this.props.height + 'px' : '220px',
            muted: false,
            controls: 'controls',
            preload: 'auto',
            autoPlay: autoPlays,
        };
        //  this.setState({})
        this.player = videojs(this.props.id, options, function onPlayerReady() {
            if (autoPlays) {
                this.play();
            }

            this.on('error', function() {
                this.errorDisplay.close(); //将错误信息不显示
                // 自定义显示方式
                Message.destroy();
                Message.error('视频播放失败');
            });
            //   _self.setState({showBtn: true})
            //   setTimeout(() => {
            //     this.pause();
            //     this.play();
            //   }, 3000);
        });
        this.player.src({
            src: videoFileStream,
            type: 'application/x-mpegURL',
        });
    };

    videoRender = () => {
        return (
            <div
                data-vjs-player
                style={{
                    width: this.props.width ? this.props.width + 'px' : '300px',
                    height: this.props.height ? this.props.height + 'px' : '220px',
                }}
            >
                <video
                    ref={node => (this.videoNode = node)}
                    id={this.props.id}
                    className="video-js vjs-default-skin vjs-big-play-centered"
                >
                    <track kind="captions" />
                </video>
            </div>
        );
    };

    render() {
        // const { deviceMessage, videoName, videoFileStream } = this.state;
        //   console.log(deviceMessage,videoFileStream,videoName)
        return (
            <div className={styles.videoCon}>
                <div id="myVideoDiv">{this.videoRender()}</div>
            </div>
        );
    }
}
