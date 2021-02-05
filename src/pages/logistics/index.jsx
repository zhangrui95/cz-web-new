// 物流统计
// author:jhm
// date:220210114
import React, { Component, useState } from 'react';
import moment from 'moment';
import {
    message,
    Row,
    Col,
    Switch,
    Form,
    Divider,
    List,
    Badge,
    Card,
    Menu,
    Dropdown,
    Button,
    Icon,
    Avatar,
    Modal,
    Input,
    Upload,
    Tooltip,
    Select,
    Spin,
    Message,
    Layout,
    Table,
} from 'antd';
import { connect } from 'dva';
import Calendar from 'react-calendar';
import styles from './index.less';
import { authorityIsTrue } from '@/utils/authority';
import LogisticModal from './components/logistic';
import ExpressModal from './components/express';
import CodeChainModal from './components/codeChain';
import ColdStorageModal from './components/coldStorage';
import FarmMarketModal from './components/farmMarket';
import { tableList,getUserInfos } from '@/utils/utils';
const { Option } = Select;
const FormItem = Form.Item;
const { Header, Footer, Sider, Content } = Layout;
@connect(({ logis, captureList, instruction,otherIndex }) => ({
    logis,
    captureList,
    instruction,
    otherIndex,
}))
class logistics extends Component {
    constructor(props) {
        super(props)
        console.log('props',props)
        let record = props.location.state;
        this.state = {
            record,
            labelarea:[], // 当前账号下属的区统计
            labeltolabel:[], // 当前选中的大类下的小类统计
            isShow :'all', // 区统计默认显示全部
            logisListNum:0, // 物流类别的企业数量
            expressListNum:0, // 快递类别的企业数量
            codeChainListNum:0, // 冷链运输类别的企业数量
            coldStorageListNum:0, // 冷库类别的企业数量
            farmMarketListNum:0, // 农贸市场类别的企业数量
            departcode:JSON.parse(sessionStorage.getItem('user')).department, // 当期登录账号的code
            placelist:[], // 场所列表
            placelistpage:{}, // 场所列表页码
            classlabel:record&&record.label?record.label:'logis', // 选中的大类，默认是物流
            jg:getUserInfos().department, // 当前账号所属的机构编码
        };
    }

   

    componentDidMount() {
       console.log('this.state',this.state)
       const {record} = this.state;
       this.getAreaTotal(record); // 获取当前账号下属的区及小类的统计
       this.getLabelNum(3, ['logis','express','codeChain','coldStorage','farmMarket']); // 获取大分类中个类的总数
       this.getList(record,'',{}) // 获取重点场所列表
    }
    // 获取当前账号下属的区及小类的统计
    getAreaTotal = (record,departcode) => {
        // console.log('record',record)
        const {classlabel} = this.state;
        this.props.dispatch({
            type:'logis/areaModelsFetch',
            payload:{
                classify:classlabel,
                wlkdlx:'',
                qhcode:departcode?departcode:'',
                gxjgdm:getUserInfos().department,
            },
            success:(data)=>{
                // console.log('data',data)
                if(data.reason.code=='200'){
                    this.setState({
                        labeltolabel:data.list2,
                        labelarea:data.list,
                    })
                }
                
            }
        })
    }

    // 获取大分类中个类的总数
    getLabelNum = (files, classify) => {
        let _self = this;
        classify.map(item => {
            this.props.dispatch({
                type: 'otherIndex/getBayonetsList',
                payload: {
                    bayonet_type: files,
                    classify:item,
                },
                success: e => {
                    if (e.result.reason.code == '200') {
                        if (files == 3) {
                            if(item === 'logis'){
                                this.setState({ logisListNum: e.result.list.length });
                            }
                            else if(item === 'express'){
                                this.setState({ expressListNum: e.result.list.length });
                            }
                            else if(item === 'codeChain'){
                                this.setState({ codeChainListNum: e.result.list.length });
                            }
                            else if(item === 'coldStorage'){
                                this.setState({ coldStorageListNum: e.result.list.length });
                            }
                            else if(item === 'farmMarket'){
                                this.setState({ farmMarketListNum: e.result.list.length });
                            }
                        }
                    } else {
                        return false;
                    }
                },
            });
        });
    }

    // 获取重点场所列表
    getList = (record,page,formValues,departcode) => {
        const {classlabel} = this.state;
        this.props.dispatch({
            type:'logis/getListFetch',
            payload:{
                showCount:tableList,
                pd:{
                    classify:classlabel,
                    qhcode:departcode?departcode:'',
                    gxjgdm:getUserInfos().department,
                    ...formValues,
                },
                currentPage: page?page.currentPage:1,
            },
            success:(data)=>{
                // console.log('data',data)
                if(data.reason.code=='200'){
                    this.setState({
                        placelist:data.list,
                        placelistpage:data.page
                    })
                }
            }
        })
    }

    // 顶部菜单切换
    choose = (classify) => {
        const {record} = this.state;
        this.setState({
            classlabel:classify,
            isShow:'all',
        },()=>{
            this.getList(record,'',{}) // 获取重点场所列表
            this.getAreaTotal(record) // 获取当前账号下属的区及小类的统计
        })
    }
    // 左侧菜单列表切换
    changearea = (file,num) => {
        const {record} = this.state;
        this.setState({
            isShow:num,
            departcode:file.qhcode,
        },()=>{
            this.getList(record,'',{},this.state.departcode) // 获取重点场所列表
            this.getAreaTotal(record,this.state.departcode) // 获取当前账号下属的区及小类的统计
        })
    }
    
    render() {
        const {labeltolabel,labelarea,isShow,logisListNum,expressListNum,classlabel,jg,
            codeChainListNum,coldStorageListNum,farmMarketListNum,placelist,placelistpage,record} = this.state;
        const columns = [
			{
				title: '名称',
				dataIndex: 'mc',
				ellipsis: true
			},
			{
				title: '联系电话',
				dataIndex: 'lxdh',
				render: (item) => <span>{stateAlert && stateAlert.find((v) => v.code == item).name}</span>,
				ellipsis: true
				// width:150
			},
			{
				title: '联系人',
				dataIndex: 'lxr',
				ellipsis: true
				// width:150
			},
			{
				title: '地址',
				dataIndex: 'dz',
				ellipsis: true,
				// width: 200
			},
			{
				title: '操作',
				width: 120,
				// filterType: authorityIsTrue('czht_cjjl_ck'),
				render: (record) => (
					<span>
						<a style={{ color: '#fff' }} onClick={() => this.toDetail(record.police_alarm_id)}>
							查看地图位置
						</a>
					</span>
				)
			}
        ]
        let labelareali = [], numall = 0;
        if (labelarea.length > 0) {
            for (let i = 0; i < labelarea.length; i++) {
              const item = labelarea[i];
              numall += item.count;
              labelareali.push(
                <li className={isShow == i?styles.chooseLabelarea:''} onClick={(e) =>this.changearea(labelarea[i], i)}>
                  {item.qhmc+'（'+item.count+'）'}
                </li>,
              );
            }
          }
        return (
            <div>
                <div className={styles.BigLabelTitle}>
                    <ul>
                        <li className={classlabel=='logis'?styles.chooseLabel:''} onClick={()=>this.choose('logis')}>物流（{logisListNum}）</li>
                        <li className={classlabel=='express'?styles.chooseLabel:''} onClick={()=>this.choose('express')}>快递（{expressListNum}）</li>
                        <li className={classlabel=='codeChain'?styles.chooseLabel:''} onClick={()=>this.choose('codeChain')}>冷链运输（{codeChainListNum}）</li>
                        <li className={classlabel=='coldStorage'?styles.chooseLabel:''} onClick={()=>this.choose('coldStorage')}>冷库（{coldStorageListNum}）</li>
                        <li className={classlabel=='farmMarket'?styles.chooseLabel:''} onClick={()=>this.choose('farmMarket')}>农贸市场（{farmMarketListNum}）</li>
                    </ul>
                </div>
                <div>
                    {jg&&jg.substring(4)=='00000000'?
                        <div className={styles.content_left}>
                            <div style={{ height: '100%',overflow:'hidden',overflowY:'auto' }}>
                                <ul>
                                    <li className={isShow == 'all'?styles.chooseLabelarea:''} onClick={(e) =>this.changearea('', 'all')}>全部（{numall}）</li>
                                    {/* <li className={isShow == '0'?styles.chooseLabelarea:''} onClick={(e) =>this.changearea({qhcode:'2300011'}, '0')}>测试（{numall}）</li> */}
                                    {labelareali}
                                </ul>
                            </div>
                        </div>
                        :''
                    }
                   
                    {classlabel=='logis'?
                        <LogisticModal
                            labeltolabel={labeltolabel}
                            placelist={placelist}
                            page={placelistpage}
                            record={record}
                            getList={this.getList}
                            isShow={isShow}
                        />
                        :''
                    }
                    {classlabel=='express'?
                        <ExpressModal
                            labeltolabel={labeltolabel}
                            placelist={placelist}
                            page={placelistpage}
                            record={record}
                            getList={this.getList}
                            isShow={isShow}
                        />
                        :''
                    }
                    {classlabel=='codeChain'?
                        <CodeChainModal
                            labeltolabel={labeltolabel}
                            placelist={placelist}
                            page={placelistpage}
                            record={record}
                            getList={this.getList}
                            isShow={isShow}
                        />
                        :''
                    }
                    {classlabel=='coldStorage'?
                        <ColdStorageModal
                            labeltolabel={labeltolabel}
                            placelist={placelist}
                            page={placelistpage}
                            record={record}
                            getList={this.getList}
                            isShow={isShow}
                        />
                        :''
                    }
                     {classlabel=='farmMarket'?
                        <FarmMarketModal
                            labeltolabel={labeltolabel}
                            placelist={placelist}
                            page={placelistpage}
                            record={record}
                            getList={this.getList}
                            isShow={isShow}
                        />
                        :''
                    }
                </div>
            </div>
            
        );
    }
}

export default Form.create()(logistics);
