
import { Button, Card, Col, DatePicker, Form, TreeSelect, Input, Row, Select, List, Pagination, Radio, Message, Table, Tag, Divider } from 'antd';
import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import SwitchTag from '@/components/SwitchTag';
import styles from './style.less';
import { cardList } from '@/utils/utils';
const FormItem = Form.Item;
const { Option } = Select;
const { TreeNode } = TreeSelect;
const { TextArea } = Input
import { phoneRule, plateNumRule, cardNoRule, onlyNumber } from '@/utils/validator'
const TreeSelectProps = {
  showSearch: true,
  allowClear: false,
  autoExpandParent: false,
  treeDefaultExpandAll: true,
  searchPlaceholder: "请输入",
  treeNodeFilterProp: "title",
  dropdownStyle: { maxHeight: 400, overflow: "auto" },
  style: {
    // width: 392
  }
};
const list = []
@connect(({
	addCar, loading
}) => ({
	addCar,
	loading: loading.effects['addCar/update'] || loading.effects['addCar/increase']
}))
class addCar extends Component {
	state = {
        expandedKeys: [], //所有菜单信息集合
	};
	componentWillMount(){
		const {
			match: {
				params: { files, type }
			}
		} = this.props;
		this.queryDictionary()
		if(type == 'edit'){
			console.log(1111)
			this.getDetail()
		}
	}
	componentDidMount() {
		this.getUseDept()

	}
	queryDictionary = () => {
		const {
			dispatch,
			
		} = this.props;
		dispatch({
			type: 'addCar/dictionaryQuery',
			payload: {code: window.configUrl.dictionariesVehicle},
		});
	}
    getUseDept = () => {
		const { dispatch } = this.props;
		let codes = []
		const groupList = JSON.parse(sessionStorage.getItem('user')).groupList;
		for (var i = 0; i < groupList.length; i++) {
        codes.push(groupList[i].code);
    }
	if(codes.length == groupList.length){
		dispatch({
			type: 'addCar/getUseDept',
			payload: {
				// department: JSON.parse(sessionStorage.getItem('user')).department,
				groupList: codes,
			},
		});
	}
		
		
	}
	getDetail = () => {
		console.log(1111)
		const {
			dispatch,
			match: {
				params: { files, type }
			},
		} = this.props;
		dispatch({
			type: 'addCar/fetch',
			payload: {vehicle_id: files},
		});
	}

	handleSubmit = e =>{
		const { form,
			dispatch,
			addCar:{
				dictionary,
				detail
			},
			match: {
				params: { files, type }
			},
			loading
		} = this.props;

		const { getFieldDecorator } = form;
		e.preventDefault();
		let payload = {}
		form.validateFields((err, fieldsValue) => {
			if (err) return;
            console.log(fieldsValue)
			payload = {
				vehicle_message:{
					clms: fieldsValue.clms,
					clpp: fieldsValue.clpp,
					glryCode: fieldsValue.glryCode,
					glrylxfs: fieldsValue.glrylxfs,
					glrysfzh: fieldsValue.glrysfzh,
					glryxm: fieldsValue.glryxm,
				},
				vehicle_license_plate: fieldsValue.vehicle_license_plate,
				vehicle_organization_code: fieldsValue.vehicle_organization_code,
				vehicle_organization_name: list.find( v => fieldsValue.vehicle_organization_code == v.code).name,
				vehicle_status: fieldsValue.vehicle_status,
				vehicle_volume_type: fieldsValue.vehicle_volume_type,
			}
			if(type == 'edit'){
				payload = {
					...payload,
					vehicle_id: files
				}
			}else{
				payload = payload
			}
			console.log(payload,list)

			dispatch({
				type: this.requestAddress(),
				payload:payload,
				success: (e) => {
                    console.log(e)
                   
                    if (e.result.reason.code == '200') {
						Message.success(type  == 'edit' ? '编辑成功' : '添加成功')
						form.setFieldsValue()
						window.g_app._history.goBack()
					} else {
						Message.error(type  == 'edit' ? '编辑失败' : '添加失败')
						return false
					}
				}
			});
		})
	}
	requestAddress = () => {
		const {
			match: {
				params: { type }
			}
		} = this.props;
		return type  == 'edit'
			? 'addCar/update'
			: 'addCar/increase';
	}
    choose = value => {
       this.props.form.setFieldsValue({'vehicle_organization_code':[]})
    // this.props.form.setFieldsValue({'police_unit_organization_name': value})
    console.log(value);
  };
    // 渲染机构树
  renderloop = data =>
    data.map(item => {
      if (item.childrenList && item.childrenList.length) {
        return (
          <TreeNode value={item.code} key={item.code} title={item.name}>
            {this.renderloop(item.childrenList)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.code} value={item.code} title={item.name} />;
    });
     loopUse = (params) => {
           for(var i = 0; i < params.length; i++){
        //   console.log(params[i],code)
        //   if(code == params[i].code){
             list.push({
                 name: params[i].name,
                 code: params[i].code,
             })
            //   console.log(params[i].name)
            //    return params[i].name
        //   }else{
              if(params[i].childrenList){
                  this.loopUse(params[i].childrenList)
              }
          }
    //   }}
      }
      validatorCar = (rule, value, callback) => {
          console.log(rule, value, callback)
          const { form: {getFieldValue}, dispatch, addCar:{ detail}, } = this.props;
          console.log(detail)
          if(detail.vehicle_license_plate == getFieldValue('vehicle_license_plate')){
              callback()
          }else{
            if(getFieldValue('vehicle_license_plate') != ''){
                dispatch({
                  type: 'addCar/getVehicleByCarNo',
                  payload:{
                      vehicle_license_plate: getFieldValue('vehicle_license_plate')
                  },
                  success: (e) => {
                      if (e.result.reason.code == '200') {
						if(e.result.vehicle == null){
                          callback()
                          }else{
                              callback('车牌号码已存在')
                          }
					}
					
                      
                  }
              });
            }else{
              callback() 
            }
          }
          
           
      }
	renderForm = () => {
		const { form,
			addCar:{
				dictionary,
				detail,
                useList
			},
			match: {
				params: { files, type }
			},
			loading
		} = this.props;
        this.loopUse(useList)
		const { getFieldDecorator } = form;
		return (
		<List loading={loading}>
			<Form className="ant-advanced-search-form" onSubmit={this.handleSubmit}>
				<Row gutter={[16, 24]}>
					<Col span={12} >
						<Form.Item label='车牌'>
							{getFieldDecorator('vehicle_license_plate',
							 {
                                validate: [
                                    // 在onBlur时，触发两个对象中的规则
                                    {
                                        trigger: "onBlur",
                                        rules:[
                                            plateNumRule,
                                            {
                                                validator: this.validatorCar
                                            },
                                            {
                                                required:true,
                                                message: '请填写车牌号码',
                                            }
                                            
                                        ],
                                    },
                                ],
								initialValue : type == 'edit' ? detail.vehicle_license_plate : ''
							})(
								<Input placeholder="" maxLength="10"/>
							)}
						</Form.Item>
					</Col>
					<Col span={12} >
						<Form.Item label='车辆型号'>
							{getFieldDecorator('vehicle_volume_type', {
								initialValue : type == 'edit' ? detail.vehicle_volume_type : ''
							})(
								<Input placeholder="" maxLength="50"/>
							)}
						</Form.Item>
					</Col>
					<Col span={12} >
						<Form.Item label='车辆品牌'>
							{getFieldDecorator('clpp', {
								initialValue : type == 'edit' ? detail.clpp : ''
							})(
								<Input placeholder="" maxLength="50"/>
							)}
						</Form.Item>
					</Col>
					
					<Col span={12} >
						<Form.Item label='管理人姓名'>
							{getFieldDecorator('glryxm', {
								initialValue : type == 'edit' ? detail.glryxm : ''
							})(
								<Input placeholder="" maxLength="50"/>
							)}
						</Form.Item>
					</Col>
					<Col span={12} >
						<Form.Item label='管理人联系方式'>
							{getFieldDecorator('glrylxfs', {
								initialValue : type == 'edit' ? detail.glrylxfs : '',
								// rules:[
								// 	phoneRule
								// ],
							})(
								<Input placeholder="" maxLength="11"/>
							)}
						</Form.Item>
					</Col>
					<Col span={12} >
						<Form.Item label='管理人警号'>
							{getFieldDecorator('glryCode', {
								rules:[
									onlyNumber
								],
								initialValue : type == 'edit' ? detail.glryCode : ''
							})(
								<Input placeholder="" maxLength="20"/>
							)}
						</Form.Item>
					</Col>
					<Col span={12} >
						<Form.Item label='管理人身份证号'>
							{getFieldDecorator('glrysfzh', {
								rules:[
									cardNoRule
								],
								initialValue : type == 'edit' ? detail.glrysfzh : ''
							})(
								<Input placeholder="" maxLength="18"/>
							)}
						</Form.Item>
					</Col>
					<Col span={12} >
						<Form.Item label='车辆描述'>
							{getFieldDecorator('clms', {
								initialValue : type == 'edit' ? detail.clms : ''
							})(
								<Input.TextArea autoSize={{ minRows: 3, maxRows: 5 }} placeholder="" maxLength="250"/>
							)}
						</Form.Item>
					</Col>
					<Col span={12} >
					<FormItem label="车辆状态">
							{getFieldDecorator('vehicle_status',{
								rules:[
									{
										required:true,
										message: '请选择车辆状态',
									  },
								],
								initialValue : type == 'edit' ? detail.vehicle_status : ''
							})(
								<Radio.Group  >
									{
										dictionary&&dictionary.map(v => <Radio key={v.code} value={v.code}>{v.name}</Radio>)
									}
									
								</Radio.Group>,
							)}
						</FormItem>
						</Col>
                        {/* <Col span={12} >
						<Form.Item label='所属机构代码'>
							{getFieldDecorator('vehicle_organization_code', {
									rules:[
									
										{
											required:true,
											message: '请填写所属机构代码',
										  },
									],
								initialValue : type == 'edit' ? detail.vehicle_organization_code : ''
							})(
								<Input placeholder="" />
							)}
						</Form.Item>
					</Col> */}
					<Col span={12} >
                        <FormItem label="所属单位">
                            {getFieldDecorator("vehicle_organization_code", {
                                initialValue: type == 'edit' ? detail.vehicle_organization_code : "",
                                rules: [
                                {
                                    required: true,
                                    message: `必需选择所属单位`
                                }
                                ]
                            })(
                                <TreeSelect
                                onChange={value => this.choose(value)}
                                treeNodeFilterProp="title"
                                treeDefaultExpandAll
                                {...TreeSelectProps}
                                placeholder="请选择"
                                >
                                {this.renderloop(useList)}
                                </TreeSelect>
                            )}
                        </FormItem>
						{/* <Form.Item label='所属机构名称'>
							{getFieldDecorator('vehicle_organization_name', {
									rules:[
									
										{
											required: true,
											message: '请填写所属机构名称',
										  },
									],
								initialValue : type == 'edit' ? detail.vehicle_organization_name : ''
							})(
								<Input placeholder="" />
							)}
						</Form.Item> */}
					</Col>
					<Col span={24}>
						<span className={styles.submitButtons}>
							<Button
								type="primary"
								htmlType="submit"
								className={styles.submitButton}
							>
								确认
							</Button>
							<Button
								className={styles.submitButton}
								onClick={() => window.g_app._history.goBack()}
								style={{ background: '#999999', borderColor: '#999999' ,color: '#fff'}}
							>
								取消
							</Button>

						</span>
					</Col>
				</Row>
			</Form>

		</List>)
	}

	handleSelectChange = value => {
		console.log(value);
		this.setState({
			deviceType: value
		})

	};

	render() {

		return (
			<div>

				<Card bordered={false} className={styles.tableListCard}>

					<div className={styles.headTitle}>
						<h2 className={styles.h2Color}>车辆信息</h2>
					</div>
					<div className={styles.tableListForm}>
						{this.renderForm()}
					</div>


				</Card>


			</div>
		);
	}
}

export default Form.create()(addCar);
// export default () => <div>hecha</div>;
