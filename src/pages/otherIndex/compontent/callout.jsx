// 对讲机呼叫
import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    Row,
    Select,
    Modal,
    Message,
    List,
    Pagination,
    Radio,
    Table,
    Tag,
    Divider,
    Tooltip,
    Spin,message,
} from 'antd'
import React, { Component } from 'react'
import { connect } from 'dva'
import styles from './callout.less'
import titleimg from '@/assets/titlecall.png'
import noconnectbackgreen from '@/assets/noconnectback.png'
import noconnectgreen from '@/assets/noconnect.png'
import noconnectbackred from '@/assets/connectback.png'
import noconnectred from '@/assets/connect.png'
import connectblue from '@/assets/connectblue.png'
import icon1 from '@/assets/1.png'

let searchIsNoconnect;
@connect(({ otherIndex, loading }) => ({
    otherIndex,
    loading: loading.effects['otherIndex/getPoliceAlarmListSearch']
}))
class callout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            InterComMachine:props.InterComMachine, // 选中的对讲机信息
            callStartSuccess: 0, // 呼叫状态；0：未接通；1：申请接通中；2：接通成功; 3.通话完毕后断开连接
            // callStartIng: false, // 呼叫中
            mouseDown: false, // 接通后按住说话true:按住说话；false:说完话放开
        }
    }

    componentDidMount() {
        // this.getPoliceAlarmListSearch()
        clearInterval(searchIsNoconnect)
    }

    componentWillReceiveProps(nextProps) {

    }
    // 对讲机呼叫
    callOutStart = () => {
        console.log('呼叫')
        const {InterComMachine} = this.state;
        console.log('InterComMachine',InterComMachine)
        this.setState({
            callStartSuccess: 1,
        },()=>{
            this.props.dispatch({
                type: 'otherIndex/getCallOutModels',
                payload:{
                    callNumber:InterComMachine.imei, //呼叫号码
                    numberType:0,   //0-个呼 1-组呼
                    systemId:InterComMachine.gps_id,  //系统ID
                    sap:"5",         //sap类型
                    duplex:false,    //是否全双工
                    encryption:false,  //是否加密
                },
                callback:(data)=>{
                    console.log('data',data);
                    if(data&&data.result){
                        this.setState({
                            callStartSuccess:2,
                            // callStartIng:false,
                        },()=>{
                            searchIsNoconnect = setInterval(()=>{
                                this.getSearchList();
                            },2000)
                        })
                    }
                    else {
                        this.setState({
                            callStartSuccess:0,
                            // callStartIng:false,
                        },()=>{
                            message.error(data.errmsg)
                        })
                    }
                },
            })
        })
    };
    // 呼叫结束
    callOutEnd = () => {
        console.log('呼叫结束')
        const {callStartSuccess} = this.state;
        // this.setState({
        //     callStartSuccess:callStartSuccess==2?3:'',
        // },()=>{
            this.props.dispatch({
                type: 'otherIndex/getCallOutOverModels',
                payload: {},
                callback:(data)=>{
                    console.log('data',data);
                        // message.success('呼叫结束')
                    if(data&&data.result){
                        this.setState({
                            callStartSuccess: 0,
                            // callStartIng:false,
                        },()=>{
                            clearInterval(searchIsNoconnect)
                        })
                    }

                },
            })
        // })

    };
    // 对讲中
    callOutIng = (obj) => {
            console.log('鼠标按住')
            this.setState({
                mouseDown:!!obj
            })

        this.props.dispatch({
            type: 'otherIndex/getCallOutIngModels',
            payload: {
                discourse: obj,
            },
            callback:(data)=>{
                console.log('data',data);
                if(data&&data.result){
                    message.success('通话成功')
                    // this.setState({
                    //     mouseDown:!!obj
                    // })
                }
                else{
                    message.error(data.errmsg)
                }
            },
        })
    }
    // 关闭模态框
    closehandleInterComCancel = () => {
        this.setState({
            callStartSuccess:0,
            mouseDown:false
        })
        this.callOutEnd();
        this.props.handleInterComCancel()
        clearInterval(searchIsNoconnect)
    };
    // 对讲机接通后判断是否进行过对话 回值如果是true,表示没挂断，false表示挂断了
    getSearchList = () => {
        const {InterComMachine} = this.state;
        this.props.dispatch({
            type: 'otherIndex/getSearchListModels',
            payload: {
                // callNumber: InterComMachine.imei,
            },
            callback:(data)=>{
                if(data&&!data.result){
                    this.setState({
                        callStartSuccess:0,
                    },()=>{
                        clearInterval(searchIsNoconnect)
                    })
                }
            },
        })
    };


    render() {
        const { callStartSuccess,mouseDown,InterComMachine } = this.state;
        return (
            <div className={styles.called}>
                <Modal
                    className={styles.ModalStyle}
                    visible={this.props.visible}
                    onCancel={this.closehandleInterComCancel}
                    footer={null}
                    width={402}
                >
                    {callStartSuccess === 0 ?
                        <div className={styles.AllStyle}>
                            <img src={titleimg} height={8} width={99} className={styles.callImg} />
                            <div className={styles.callIng}>
                                <p>指挥中心</p>
                                <p>--</p>
                            </div>
                            <div className={styles.FooterStyle}>
                                <img src={noconnectbackgreen} width={131} height={33} className={styles.connectbackStyle} />
                                <div className={styles.callImgStyle} onClick={this.callOutStart}>
                                    <img src={noconnectgreen} width={36} height={36} className={styles.connectStyle} />
                                </div>
                            </div>
                        </div>
                        :
                        callStartSuccess === 1 ?
                        <div className={styles.AllStyle}>
                            <img src={titleimg} height={8} width={99} className={styles.callImg} />
                            <div className={styles.callIng} style={{background:'#273A7B'}}>
                                <p>指挥中心</p>
                                <p>连接中...</p>
                            </div>
                            <div className={styles.FooterStyle}>
                                <img src={noconnectbackred} width={131} height={33} className={styles.connectbackStyle} />
                                <div className={styles.callImgStyle} onClick={this.callOutEnd} style={{background:'#F65150',border:'2px solid #B00000'}}>
                                    <img src={noconnectred} width={36} height={36} className={styles.connectStyle} />
                                </div>
                            </div>
                        </div>
                            :
                            callStartSuccess === 2 ?
                                <div className={styles.AllStyle}>
                                    <img src={titleimg} height={8} width={99} className={styles.callImg} />
                                    <div className={styles.callIng} style={{background:mouseDown?'#273A7B':''}}>
                                        <p>指挥中心</p>
                                        {mouseDown?
                                            <p>正在说话</p>
                                            :
                                            <p>空闲中</p>
                                        }

                                    </div>
                                    <div className={styles.FooterStyle}>
                                        <div className={styles.connectblueAllStyle1} onMouseDown={() => this.callOutIng(true)} onMouseUp={() => this.callOutIng(false)} style={{background:mouseDown?'transparent':''}}>
                                            <img src={connectblue} width={36} height={36} className={styles.connectStyle} />
                                        </div>
                                        <div className={styles.connectblueAllStyle2} onClick={this.callOutEnd}>
                                            <img src={noconnectred} width={36} height={36} className={styles.connectStyle} />
                                        </div>
                                    </div>
                                </div>
                                :
                                <div className={styles.AllStyle}>
                                    <img src={titleimg} height={8} width={99} className={styles.callImg} />
                                    <div className={styles.callIng} style={{background:mouseDown?'#273A7B':''}}>
                                        <p>指挥中心</p>
                                        <p>连接已断开</p>
                                    </div>
                                    <div className={styles.FooterStyle}>
                                        <div className={styles.connectblueAllStyle1} onMouseDown={() => this.callOutIng(true)} onMouseUp={() => this.callOutIng(false)} style={{background:mouseDown?'transparent':''}}>
                                            <img src={connectblue} width={36} height={36} className={styles.connectStyle} />
                                        </div>
                                        <div className={styles.connectblueAllStyle2} onClick={this.callOutEnd} style={{background:'transparent'}}>
                                            <img src={noconnectred} width={36} height={36} className={styles.connectStyle} />
                                        </div>
                                    </div>
                                </div>
                    }







                    {/*{!callStartSuccess?*/}
                        {/*<Button onClick={this.callOutStart}>呼叫</Button>*/}
                        {/*:*/}
                        {/*<div>*/}
                            {/*<Button onMouseDown={() => this.callOutIng(true)} onMouseUp={() => this.callOutIng(false)}>对讲</Button>*/}
                            {/*<Button onClick={this.callOutEnd}>挂断</Button>*/}
                        {/*</div>*/}
                    {/*}*/}


                </Modal>
            </div>
        )
    }
}

export default callout
