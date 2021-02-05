
import { Button, Card, Col, DatePicker, Form, Input, Row, Select, Modal, Message, List, Pagination, Radio, Table, Tag, Divider } from 'antd';
import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import SwitchTag from '@/components/SwitchTag';
import styles from './style.less';
import { cardList } from '@/utils/utils';
import { authorityIsTrue } from '@/utils/authority'
const FormItem = Form.Item;
const { Option } = Select;
const bayonetList = [{
    type:1,
    name:'卡口'
},
{
    type:2,
    name:'视频卡口'
},
{
    type:3,
    name:'重点场所'
},
{
    type:4,
    name:'警务站'
}]
let namedictionary = '',
namebayonet = ''
@connect(({
	vehicle, loading
}) => ({
	vehicle,
	loading: loading.models.vehicle,
}))
class vehicle extends Component {
	state = {
		formValues: {},
		value: 1,
		loading: false,
		data: [],
		pagination: {},
	};

	componentDidMount() {
        const { match: {
				params: { expandForm }
			} } = this.props
            if(expandForm == '1'){
                this.getDetailById()
            }else{
                this.getBayonetById()
            }
		this.getDevicesList()
        this.queryDictionary()
        this.queryDictionaryVehicle()
	}
    
    getBayonetById = () => {
		const {
			dispatch,
			match: {
				params: { files }
			}
		} = this.props;
		dispatch({
			type: 'vehicle/fetchBayonetById',
			payload: { bayonet_id: files },
		});
	};
queryDictionary = () => {
		const {
			dispatch,

		} = this.props;
		dispatch({
			type: 'vehicle/dictionaryQuery',
			payload: { code: window.configUrl.dictionariesDevice },
		});
    }
    queryDictionaryVehicle = () => {
		const {
			dispatch,
			match: {
				params: { files }
			}
		} = this.props;
		dispatch({
			type: 'vehicle/dictionaryQuery',
			payload: {code: window.configUrl.dictionariesVehicle},
			
		});
	}
	getDetailById = () => {
		const {
			dispatch,
			match: {
				params: { files }
			}
		} = this.props;
		dispatch({
			type: 'vehicle/fetchDetailById',
			payload: { vehicle_id: files },
		});
	};
	getDevicesList = () => {
		const {
			dispatch,
			match: {
				params: { files }
			}
		} = this.props;
		dispatch({
			type: 'vehicle/fetchDevicesList',
			payload: { vehicle_id: files },
		});
	};
	renderPersonForm = () => {
		const { form,
			vehicle: {
                data,
                dictionary
			},
			loading, } = this.props;

		const { getFieldDecorator } = form;
		// const { deviceManager: { policeCarList, data: { page } } } = this.props;
		const { tagState } = this.state;

		const formItemLayout = {
			labelCol: { span: 18 },
			wrapperCol: { span: 6 },
        }
        console.log(dictionary)
        if(dictionary&&dictionary.length&&data){
            for (let index = 0; index < dictionary.length; index++) {
                const element = dictionary[index];
                console.log(element)
                if(element.code == data.vehicle_status){
                    namedictionary = element.name
                }
            }
        }
        
		return (
			<Form  {...formItemLayout}>
				<FormItem label="车牌号码">
					{getFieldDecorator('vehicle_license_plate',
						{
							initialValue: data&&data.vehicle_license_plate,
						}
					)(<Input placeholder="" disabled />)}
				</FormItem>
				<FormItem label="所属机构名称">
					{getFieldDecorator('vehicle_organization_name',
						{
							initialValue: data&&data.vehicle_organization_name,
						}
					)(<Input placeholder="" disabled />)}
				</FormItem>
				<FormItem label="管理人联系方式">
					{getFieldDecorator('glrylxfs',
						{
							initialValue: data&&data.glrylxfs,
						}
					)(<Input placeholder="" disabled />)}
				</FormItem>
				<FormItem label="车辆描述">
					{getFieldDecorator('clms',
						{
							initialValue: data&&data.clms,
						}
					)(<Input placeholder="" disabled />)}
				</FormItem>
				<FormItem label="车辆品牌">
					{getFieldDecorator('clpp',
						{
							initialValue: data&&data.clpp,
						}
					)(<Input placeholder="" disabled />)}
				</FormItem>
				<FormItem label="车辆型号">
					{getFieldDecorator('vehicle_volume_type',
						{
							initialValue: data&&data.vehicle_volume_type,
						}
					)(<Input placeholder="" disabled />)}
				</FormItem>
				<FormItem label="管理人警号">
					{getFieldDecorator('glryCode',
						{
							initialValue: data&&data.glryCode,
						}
					)(<Input placeholder="" disabled />)}
				</FormItem>
				<FormItem label="管理人姓名">
					{getFieldDecorator('glryxm',
						{
							initialValue: data&&data.glryxm,
						}
					)(<Input placeholder="" disabled />)}
				</FormItem>
				<FormItem label="管理人身份证号">
					{getFieldDecorator('glrysfzh',
						{
							initialValue: data&&data.glrysfzh,
						}
					)(<Input placeholder="" disabled />)}
				</FormItem>
                {
                    console.log(dictionary&&dictionary.length > 0 ? dictionary.find(v => v.code == data.vehicle_status): '')
                }
                    <FormItem label="车辆状态">
                        {getFieldDecorator('vehicle_status',
                            {
                                initialValue: namedictionary,
                            }
                        )(<Input placeholder="" disabled />)}
                    </FormItem>
                
				
			</Form>
		);
	}
    renderSwanForm = () => {
		const { form,
			vehicle: {
                data,
                dictionary,
                bayonet
			},
			loading, } = this.props;

		const { getFieldDecorator } = form;
		// const { deviceManager: { policeCarList, data: { page } } } = this.props;
		const { tagState } = this.state;

		const formItemLayout = {
			labelCol: { span: 18 },
			wrapperCol: { span: 6 },
        }
        if(bayonetList&&bayonetList.length&&bayonet){
            for (let index = 0; index < bayonetList.length; index++) {
                const element = bayonetList[index];
                console.log(element)
                if(element.type == bayonet.bayonet_type){
                    namebayonet = element.name
                }
            }
        }
		return (
			<Form  {...formItemLayout}>
				<FormItem label="卡口名称">
					{getFieldDecorator('kkmc',
						{
							initialValue: bayonet.kkmc,
						}
					)(<Input placeholder="" disabled />)}
				</FormItem>
				<FormItem label="所属机构名称">
					{getFieldDecorator('gxdwmc',
						{
							initialValue: bayonet.gxdwmc,
						}
					)(<Input placeholder="" disabled />)}
				</FormItem>
				<FormItem label="卡口经度">
					{getFieldDecorator('jd',
						{
							initialValue: bayonet.jd,
						}
					)(<Input placeholder="" disabled />)}
				</FormItem>
				<FormItem label="卡口纬度">
					{getFieldDecorator('wd',
						{
							initialValue: bayonet.wd,
						}
					)(<Input placeholder="" disabled />)}
				</FormItem>
				<FormItem label="卡口ID">
					{getFieldDecorator('kkid',
						{
							initialValue: bayonet.kkid,
						}
					)(<Input placeholder="" disabled />)}
				</FormItem>
				<FormItem label="卡口代码">
					{getFieldDecorator('kkdm',
						{
							initialValue: bayonet.kkdm,
						}
					)(<Input placeholder="" disabled />)}
				</FormItem>
				<FormItem label="卡口类型">
					{getFieldDecorator('bayonet_source',
						{
							initialValue: namebayonet,
						}
					)(<Input placeholder="" disabled />)}
				</FormItem>
				
			</Form>
		);
	}
	renderTable = () => {
		const {
			vehicle: {
				devicesList: {
					list,
				},
                devicesTyps
			},
			match: {
				params: { files, expandForm }
			},
			loading,
		} = this.props;
		const columns = [
			{
				title: '设备名称',
				dataIndex: 'device_name',
				key: 'device_name'
			},
			{
				title: '厂商',
				render: (record) => record.device_message.sbcs_name  || record.device_message.sbcs,
				key: 'sbcs'
			},
			// ß
            {
				title: '设备类型',
				render: (record) => <div>{
                    devicesTyps.map(v => {
                        if( record.device_type == v.code){
                            console.log(record.device_type,v.name)
                        return v.name
                        }
                    })
                }</div>,
				key: 'device_type'
			},
			{
				title: '状态',
				render: (record) => record.device_state == 0 ? '禁用' : record.device_state == 1 ? '启用' : '',
				key: 'device_state'
			},
			{
				title: '操作',
				dataIndex: '',
				key: 'x',
				render: (record) => <span>
                {
                    authorityIsTrue('czht_sbgl_clgl_sbbj')
                    ?
                    <a onClick={() => this.props.history.push(`../../../addVehicle/${files}/${'edit'}/${record.device_id}/${expandForm}`)}>编辑</a>
                    :
                    null
                }
                {
                    authorityIsTrue('czht_sbgl_clgl_sbbj')
                    ?
                    <Divider type="vertical" />
                    :
                    null
                }
                {
                    authorityIsTrue('czht_sbgl_clgl_sbsc')
                    ?
                    <a onClick={() => this.deleteDevice(record.device_id)}>删除</a>
                    :
                    null
                }
				</span>
			},
		];


		return (
			<Table
				columns={columns}
				expandedRowRender={record => <div className={styles.concealForm} >{this.dquipmentDetails(record)}</div>}
				dataSource={list}
				pagination={false}
				loading={loading}
                scroll={{ y: 510 }}
			/>
		)
	}
	deleteDevice = (files) => {
		const { dispatch } = this.props;
		Modal.confirm({
			title: '您确认删除该设备吗？',
			// content: '您确认删除该吗？',
			okText: '确定',
			cancelText: '取消',
			onOk: () => {
				dispatch({
					type: 'vehicle/deleteDevice',
					payload: { device_id: files },
					success: (e) => {
                        
                        if (e.result.reason.code == '200') {
							 Message.success('删除成功');
                                this.getDetailById()
                                this.getDevicesList()
						} else {
							Message.error('删除失败，请稍后重试！')
							return false
						}
					}
				})
			},
		});


	}
	dquipmentDetails = record => {
		const { getFieldDecorator } = this.props.form;
		const children = [];
		let list = [];
		console.log(record)
		switch (record.device_type) {
			case '5011701':
				list = [
					{ name: '型号', type: 'sbxh' },
					{ name: '用户名', type: 'username' },
					{ name: '密码', type: 'password' },
					{ name: 'ip', type: 'ip' },
					{ name: '端口', type: 'port' },
					{ name: '码流地址', type: 'mldz' },
					{ name: '播放码流地址', type: 'bfmldz' },
					{ name: 'sim卡信息', type: 'sim' },
					{ name: '通道号', type: 'tdh' },
					{ name: '第三方注册编码', type: 'sbdsfbm' },
					{ name: '码流格式', type: 'mlgs_name' },
                    { name: '播放码流格式', type: 'bfmlgs_name' },
                    { name: '相机描述', type: 'sbms' },
				]
				break;
			case '5011702':
				list = [
					{ name: '型号', type: 'sbxh' },
					{ name: '用户名', type: 'username' },
					{ name: '密码', type: 'password' },
					{ name: 'ip', type: 'ip' },
					{ name: '端口', type: 'port' },
					{ name: 'sim卡信息', type: 'sim' },
                    { name: '第三方注册编码', type: 'sbdsfbm' },
                    { name: '视频主机描述', type: 'sbms' },
				]
				break;
			case '5011703':
				list = [
					{ name: '型号', type: 'sbxh' },
					{ name: '用户名', type: 'username' },
					{ name: '密码', type: 'password' },
					{ name: 'ip', type: 'ip' },
					{ name: '端口', type: 'port' },
					{ name: '码流地址', type: 'mldz' },
					{ name: 'sim卡信息', type: 'sim' },
					{ name: 'nvr描述', type: 'sbms' },
					{ name: '码流格式', type: 'mlgs_name' },
				]
				break;
			case '5011704':
				list = [
					{ name: '型号', type: 'sbxh' },
					{ name: '车台号', type: 'cth' },
					{ name: '车台描述', type: 'sbms' },
				]
				break;
			case '5011705':
				list = [
					{ name: '主机IMEI', type: 'imei' },
					{ name: '主机型号', type: 'sbxh' },
					{ name: '主机描述', type: 'sbms' },
					{ name: '主机配置模块', type: 'pzmk_name' },
				]
				break;
			case '5011706':
				list = [
					{ name: '型号', type: 'sbxh' },
					{ name: 'ip', type: 'ip' },
					{ name: '抓拍设备描述', type: 'sbms' },
					{ name: '抓拍类型', type: 'zplx_name' },
				]
				break;
			case '5011707':
				list = [
					{ name: '警灯类型', type: 'jdlx' },
					{ name: '警灯描述', type: 'sbms' },
				]
				break;
			case '5011708':
				list = [
					{ name: '平板型号', type: 'sbxh' },
					{ name: '平板描述', type: 'sbms' },
				]
				break;
			default:
				break;
		}
		return (
			<Form className="ant-advanced-search-form">
				<Row gutter={24}>
					{
						list.map((v, k) => (
							<Col span={8} key={k}>
								<Form.Item label={v.name}>
									{getFieldDecorator(`${v.type}`, {
										initialValue: record.device_message[v.type]

									})(<Input placeholder="" disabled />)}
								</Form.Item>
							</Col>
						))
					}

				</Row>

			</Form>
		)
	}
	renderForm = () => {
        const { match: {
				params: { expandForm }
			} } = this.props
            if(expandForm == '1'){
                return this.renderPersonForm();
            }else{
                return this.renderSwanForm();
            }
		
	}
	render() {
		const {
			vehicle: {
				data,
				devicesList: {
					list
				},
			},
			match: {
				params: { files, expandForm, page }
			},
			loading,
		} = this.props;

		return (
			<div>
				<Row gutter={[8, 16]}>
					<Col span={7} >
						<Card bordered={false} className={styles.tableListCard}>

							<div className={styles.headTitle}>
								<h2 className={styles.h2Color}>{expandForm == '1'? '车辆信息' : '卡口信息'}</h2>
								<Button type="primary" className={styles.addCarBtn} onClick={() => this.props.history.replace({pathname:'/czht_sbgl',state:{expandForm: expandForm, pages: page}})}>返回</Button>

							</div>
							<div className={styles.tableListForm}>{this.renderForm()}</div>


						</Card>
					</Col>
					<Col span={17} >
						<Card bordered={false} className={styles.tableListCard}>

							<div className={styles.headTitle}>
								<h2 className={styles.h2Color}>设备信息</h2>
                                {
                                    authorityIsTrue('czht_sbgl_clgl_sbxz')
                                    ?
                                    <Button type="primary" className={styles.addCarBtn} onClick={() => this.props.history.push(`../../../addVehicle/${files}/${'new'}/${'1'}/${expandForm}`)}>添加设备</Button>
                                    :
                                    null
                                }
								
							</div>

							<div className={styles.tableListForm}>{this.renderTable()}</div>
							
						</Card>
					</Col>
				</Row>



			</div>
		);
	}
}

export default Form.create()(vehicle);
// export default () => <div>hecha</div>;
