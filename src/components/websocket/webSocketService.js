
const clientState = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
}
export default class webSocketClient {

        options = null //配置信息
        heartbeatTimer = null //心跳计时器
        wsObject = null //websocket对像
        pingLog = [] //ping方法缓存,用于保存返回时查证数据

        /**
         * @param {Object} options url, globalParams, openCallback, messageCallback, errorCallback, closeCallback, autoReset, heartbeatInterval = 10
         */
        constructor(options) {
            const {
                url,
                globalParams,
                openCallback,
                messageCallback,
                errorCallback,
                closeCallback,
                autoReset,
                heartbeatInterval = 10
            } = options

            this.options = {
                url,
                globalParams,
                openCallback,
                messageCallback,
                errorCallback,
                closeCallback,
                autoReset,
                heartbeatInterval
            }
            this.init()
        }

        init() {

            //拿取配置参数
            const {
                url,
                globalParams,
                openCallback,
                messageCallback,
                errorCallback,
                closeCallback,
                autoReset,
                heartbeatInterval = 10
            } = this.options


            // 创建 websocket对像
            this.wsObject = new window.WebSocket(url);
            // 挂载回调事件
            this.wsObject.onopen = e => {
                //开启心跳
                this.closeHeartbeat()
                this.openHeartbeat()
                //调用回调
                if (!!this.options.openCallback) {
                    openCallback(e, this);
                }
            }
            // 当收到消息
            this.wsObject.onmessage = e => {
                this.onMessage(e)
            }
            // 当连接错误
            this.wsObject.onerror = e => {

                this._error(e);

            }
            //当链接关闭时
            this.wsObject.onclose = e => {
                if (!!this.options.closeCallback) {
                    this.options.closeCallback(e);
                }
            }



        }

        //启动心跳
        openHeartbeat() {
            this.heartbeatTimer = window.setInterval(() => {
                this.heartbeat()
            }, this.options.heartbeatInterval * 1000) //心跳间隔为秒数
        }

        //关闭心跳
        closeHeartbeat() {
            // 去除心跳计时器
            if (this.heartbeatTimer != null) {
                window.clearInterval(this.heartbeatTimer);
                this.heartbeatTimer = null;
            }
        }


        //用来对外报错
        _error(err) {
            if (!!this.options.errorCallback) {
                this.options.errorCallback(err)
            } else {
                throw err;
            }
        }

        //发送信息的方法
        send(message) {
            // console.log(this.wsObject,'wsObject====')
            // debugger;;
            if(this.wsObject != null){
            if (this.wsObject.readyState === clientState.OPEN) {
                let p = {...this.options.globalParams}
                //填入全局参数
                this.wsObject.send(JSON.stringify(p));
            } else {
                // 启动reset动作
                // this.init()
            }
}
        }
        // 心跳方法
        heartbeat() {
    //   console.log('心跳',this.options.globalParams,'====',this.wsObject.readyState,'----')

            if (this.wsObject.readyState === clientState.OPEN) {
                //  console.log(this.options.globalParams,'====',)
                let p = { ...this.options.globalParams}
                this.wsObject.send(JSON.stringify(p))
            } else {
                if (this.wsObject.readyState != clientState.CONNECTING) {
                    this.init()
                }
            }
        }

        // 当收到消息时
        onMessage(e) {

            if (e.data) {
                let msg = JSON.parse(e.data);
                //  console.log(msg)
                // console.log(msg)
                if (msg.homePage) {
                    if (msg.homePage && this.options.messageCallback) {
                        this.options.messageCallback(msg.homePage);
                    } else {
                        this._error(new Error('websocketClient必需指定消息回调'))
                    }
                }
            }

        }

        //关闭组件
        close() {
            this.closeHeartbeat()
            if (this.wsObject) {
                this.wsObject.close()
                this.wsObject = null
            }
        }

    }

