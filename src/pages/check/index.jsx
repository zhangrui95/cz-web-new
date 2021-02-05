import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Icon,
  Input,
  InputNumber,
  Row,
  Select,
  Table,
  Tag,
  Pagination,
  Message,
  Tooltip,
  TreeSelect,
  Result
} from 'antd';
import React, { Component } from 'react';
import { connect } from 'dva';
import SwitchTag from '@/components/SwitchTag';
import styles from './style.less';
import { tableList } from '@/utils/utils';
const { RangePicker } = DatePicker;
const { TreeNode } = TreeSelect;
const FormItem = Form.Item;
const { Option } = Select;
import { cardNoRule } from '@/utils/validator'
import { authorityIsTrue } from '@/utils/authority'
import moment from "moment";
const TreeSelectProps = {
  showSearch: true,
  allowClear: false,
  autoExpandParent: false,
  treeDefaultExpandAll: true,
  searchPlaceholder: "请输入",
  treeNodeFilterProp: "title",
  dropdownStyle: { maxHeight: 400, overflow: "auto" },
  style: {
    width: 330
  }
};
const list = []
@connect(({ checkList, captureList, getVehicle, loading,device }) => ({
  checkList,
  captureList,
  getVehicle,
  device,
  loading: loading.models.checkList,
}))
class CheckList extends Component {
  state = {
    // 默认人员核查
    expandForm: authorityIsTrue('czht_hcjl_ry') ? '1' : authorityIsTrue('czht_hcjl_cl') ? '2': '',
    formValues: {},
    tagState:0,
    times:[]
  };
  componentDidMount() {
console.log(this)
         var _self = this
      if(this.props.location.state != undefined){
          const states = this.props.location.state
         const pages = JSON.parse(states.pages)
         
          this.setState({
              expandForm: states.types, 
              formValues: pages.pd,
          },() => {
            if(pages.pd.startTime != null){
                _self.props.form.setFieldsValue({
                    ...pages.pd,
                    range_picker: [moment(pages.pd.startTime, 'YYYY-MM-DD HH:mm:ss'), moment(pages.pd.endTime, 'YYYY-MM-DD HH:mm:ss')]
                })
                console.log(pages,[moment(pages.pd.startTime, 'YYYY-MM-DD HH:mm:ss'), moment(pages.pd.endTime, 'YYYY-MM-DD HH:mm:ss')])
                _self.getTableData(pages,{
                  ...pages.pd,
              range_picker: [moment(pages.pd.startTime, 'YYYY-MM-DD HH:mm:ss'), moment(pages.pd.endTime, 'YYYY-MM-DD HH:mm:ss')]
              
                })
            }else{
                _self.props.form.setFieldsValue({
                    ...pages.pd,
                })
                console.log(pages,[moment(pages.pd.startTime, 'YYYY-MM-DD HH:mm:ss'), moment(pages.pd.endTime, 'YYYY-MM-DD HH:mm:ss')])
                _self.getTableData(pages,{
                  ...pages.pd,
              
                })
            }
              
                })
          
      }else{
        // 第一次访问，获取默认选中  人脸抓拍记录
        if(this.state.expandForm != ''){
            this.getTableData();
        }
        
      }
    // 获取查询项中警车选择项，无参数默认查全部
    this.getPoliceCarData();
    this.getUseDept()
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
			type: 'device/getUseDept',
			payload: {
				// department: JSON.parse(sessionStorage.getItem('user')).department,
				groupList: codes,
			},
		});
	}
		
		
	}
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
      choose = () => {

      }
  getTableData = (changePage, pd) => {
    const { dispatch, checkList: { data: { page } } } = this.props;
    console.log('changePage',changePage, 'pd',pd)
    const pages = changePage || {
      currentPage: 1,
      showCount: tableList,
    };

    const pds = pd || {};

    const param = {
      ...pages,
      pd: { ...pds },
    };
    const { expandForm } = this.state;
    console.log(expandForm)
    const url = expandForm == '1' ? 'checkList/fetchPeopleCheckList' : 'checkList/fetchCarCheckList';
    dispatch({
      type: url,
      payload: param,
    });
  }

  toggleForm = (k) => {
    const { expandForm } = this.state;
    
    this.setState(
      {
        expandForm: k,
      },
      () => {
        // 重置搜索条件以及查询
        this.handleFormReset();
      },
    );
  };

  // 查询条件重置
  handleFormReset = () => {
    const { form, checkList: { data: { page } } } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    page.currentPage = 1;
    page.showCount = tableList;
    this.getTableData(page);
     // 获取查询项中警车选择项，无参数默认查全部
    this.getPoliceCarData();
  };

  // 根据组织机构获取警车，code不存在获取全部警车数据
  getPoliceCarData = code => {
    this.props.dispatch({
      type: 'getVehicle/fetchPoliceCarList',
      payload: {
        vehicle_organization_code: code || null,
      },
    });
  }

  onChange = currentPage => {
    const {
      checkList: {
        data: { page },
      },
    } = this.props;
    const { formValues } = this.state;
    page.currentPage = currentPage;
    // 查询改变页数后的数据
    this.getTableData(page, formValues);
  };

  onShowSizeChange = (current, pageSize) => {
    const {
        checkList: {
        data: { page },
      },
    } = this.props;
    const { formValues } = this.state;
    page.currentPage = current;
    page.showCount = pageSize;
    this.getTableData(page, formValues);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      console.log('fieldsValue', fieldsValue);
      const rangeTimeValue = fieldsValue.selectTime;
      const rangeValue = fieldsValue['range_picker'];
      const values = {
        ...fieldsValue,
        startTime: rangeValue ? rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss') : null : null,
        endTime: rangeValue ? rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss') : null : null,
      };

      this.setState({
        formValues: values,
      });

      const {
        checkList: {
          data: { page },
        },
      } = this.props;
      page.currentPage = 1;
      page.showCount = tableList;
      this.getTableData(page, values);
    });
  };
handleSearch = v => {
    const userInfo = JSON.parse(sessionStorage.getItem('user'));
    const { groupList } = userInfo;
    // const { dataSource } = this.props;
    v = v || "";
    const filterWord = v.trim().toLowerCase();
    const showArr = groupList.filter(item =>
      item.label.toLowerCase().includes(filterWord)
    );
    console.log(showArr)
    // this.setState({ page: 1, showArr });
  };
  renderPersonForm() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    // 从安全中心获取管辖机构
    const userInfo = JSON.parse(sessionStorage.getItem('user'));
    const { groupList } = userInfo;
    const { getVehicle: { policeCarList}, checkList:{data: { page }}, device:{ useList }  } = this.props;
    const { expandForm, tagState, times } = this.state;
     this.loopUse(useList)
    const formItemLayout = {
     labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const carType = [
      {
        code: '01',
        name: '大型汽车',
      },
      {
        code: '02',
        name: '小型汽车',
      },
      {
        code: '03',
        name: '使馆汽车',
      },
      {
        code: '04',
        name: '领馆汽车',
      },
      {
        code: '05',
        name: '港澳入出境车',
      },
      {
        code: '06',
        name: '外籍汽车',
      },
      {
        code: '07',
        name: '两、三轮摩托车',
      },
      {
        code: '08',
        name: '轻便摩托车',
      },
      {
        code: '09',
        name: '使馆摩托车',
      },
      {
        code: '10',
        name: '领馆摩托车',
      },
      {
        code: '11',
        name: '境外摩托车',
      },
      {
        code: '12',
        name: '外籍摩托车',
      },
      {
        code: '13',
        name: '农用运输车',
      },
      {
        code: '14',
        name: '拖拉机',
      },
      {
        code: '15',
        name: '挂车',
      },
      {
        code: '16',
        name: '教练汽车',
      },
      {
        code: '17',
        name: '教练摩托车',
      },
      {
        code: '18',
        name: '试验汽车',
      },
      {
        code: '19',
        name: '试验摩托车',
      },
      {
        code: '20',
        name: '临时入境汽车',
      },
      {
        code: '21',
        name: '临时入境摩托车',
      },
      {
        code: '22',
        name: '临时行驶车',
      },
      {
        code: '23',
        name: '警用汽车',
      },
      {
        code: '24',
        name: '警用摩托',
      },
      {
        code: '25',
        name: '原农机号牌',
      },

    ]
    return (
      <Form layout="inline" {...formItemLayout} onSubmit={this.handleSubmit}>
        <Row>
          <Col span={8} className={styles.datePicker} >
            <FormItem label="选择日期">
               {getFieldDecorator('range_picker')(
                <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{width:'330px'}} />,
              )}
            </FormItem>
          </Col>
          
         
          <Col span={8}>
            <FormItem label="警员部门">
                {getFieldDecorator('jybmbh')(
                    <TreeSelect
                    onChange={value => this.getPoliceCarData(value)}
                    treeNodeFilterProp="title"
                    treeDefaultExpandAll
                    placeholder="请选择"
                    //   style={{ width: "230px" }}
                    {...TreeSelectProps}
                    >
                    {this.renderloop(useList)}
                    </TreeSelect>,
                )}
            </FormItem>
        </Col>
          {/* <br/> */}
          <Col span={8}>
            <FormItem label="执勤警车">
              {getFieldDecorator('vehicle_id')(
                <Select
                  
                  placeholder="请选择"
                  style={{width:'330px'}}
                >
                  {
                    policeCarList.length && policeCarList.map((item,k) => <Option value={item.vehicle_id} key={k}>{item.carNo}</Option>)
                  }
                </Select>,
              )}
            </FormItem>
          </Col>
        {/* <br/> */}
          {expandForm == '1' ?
            <Col span={8}>
              <FormItem label="身份证号">
                {getFieldDecorator('sfzh',{
                    
                })(
                  <Input style={{ width: '330px' }} placeholder="请输入身份证号" />,
                )}
              </FormItem>
            </Col> :
            <Col span={8}>
              
                <FormItem label="车牌号码">
                  {getFieldDecorator('hphm')(<Input placeholder="请输入车牌号码" style={{
                        width: '330px',
                      }}/>)}
                </FormItem>
              
            </Col>
          }
          {
              expandForm == '2'
              ?
              <Col span={8} >
                <FormItem label="号牌种类">
                  {getFieldDecorator('hpzl')(
                    <Select
                      placeholder="请选择"
                      style={{
                        width: '330px',
                      }}
                    >
                      {carType.map(item => <Option value={item.code}>{item.name}</Option>)}
                    </Select>,
                  )}
                </FormItem>
              </Col>
              :
              null
          }
          <Col span={8}>
            <FormItem label="状态">
              {getFieldDecorator('comparison_exception')(
                <Select
                  
                  placeholder="请选择"
                  style={{
                        width: '330px',
                      }}
                >
                    <Option value={'0'}>正常</Option>
                    <Option value={'1'}>异常</Option>
                </Select>,
              )}
            </FormItem>
          </Col>
          
           <Col span={8}> {this.renderSearchButton()} </Col>
          {/* {this.renderSearchButton()} */}
        </Row>
      </Form>
    );
  }

  // 渲染查询条件的按钮渲染
  renderSearchButton = () => (
    <Col offset={8} md={8} sm={24}>
      <span className={styles.submitButtons}>
        <Button
          type="primary"
          htmlType="submit"
          className={styles.submitButton}
          style={{ background: '#3470F4', borderColor: '#3470F4' }}
        >
          搜索
          </Button>
        <Button
          className={styles.submitButton}
          onClick={this.handleFormReset}
          style={{ background: '#269CF4', borderColor: '#269CF4' ,color: '#fff'}}
        >
          重置
          </Button>
       
          {
              authorityIsTrue(`${this.state.expandForm == '1' ? 'czht_hcjl_ry_dc' : 'czht_hcjl_cl_dc' }`)
            ?
            <Button
                className={styles.submitButton}
                onClick={this.exportXLSX}
                style={{ background: '#38B248', borderColor: '#38B248', color: '#fff' }}
            >
                导出
            </Button>
            :null
          }
        
      </span>
    </Col>
  );
//导出
	exportXLSX = e => {
		const { form, dispatch } = this.props;
        const { expandForm } = this.state;
		form.validateFields((err, fieldsValue) => {
			if (err) return;
			console.log('fieldsValue', fieldsValue, expandForm)
            const rangeValue = fieldsValue['range_picker'];
            if(rangeValue == undefined || !rangeValue.length){
                Message.destroy()
                Message.error('请选择导出文件的时间范围');
                return false
            }
            const fieldsValues = JSON.stringify({
                ...fieldsValue,
                startTime: rangeValue ? rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss') : null : null,
                endTime: rangeValue ? rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss') : null : null,
                government: JSON.parse(sessionStorage.getItem('groupListCode'))
            })
            console.log(fieldsValues)
            window.open(`${'./dow.html?serverUrl='}${window.configUrl.serverUrl}${'&fieldsValue='}${fieldsValues}${'&currentXLSX='}${this.currentXLSX()}`,'_blank')
			// dispatch({
			// 	type: this.currentXLSX(),
			// 	payload: { 
            //         ...fieldsValue,
            //         startTime: rangeValue ? rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss') : null : null,
            //         endTime: rangeValue ? rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss') : null : null,
            //         },
			// 	success: (e) => {
			// 		if(e.reason != null){
            //             Message.error('导出失败');
            //         }else{
            //             // window.open(`${window.configUrl.serverUrl}${e.path}`,'_blank');
            //             var obj = window.open("about:blank");   
            //             obj.document.write(`${window.configUrl.serverUrl}${e.path}`);   
            //             // window.location.href = `${window.configUrl.serverUrl}${e.path}`
            //             // Message.success('导出成功');
            //         }
			// 	}
			// })
		})
	}

      // 获取当前选中tag返回获取数据的url
  currentXLSX() {
    const { expandForm } = this.state;
    return expandForm == '1'
      ? 'capture/exportPortraitCheckRecord'
      : 'capture/exportVehicleCheckRecord';
  }
  renderForm() {
    // return expandForm ? this.renderPersonForm() : this.renderAdvancedForm();
    return this.renderPersonForm();
  }

  render() {
    const { expandForm } = this.state;
    const { checkList: { data: { list, page } },form } = this.props;
    const titles = [
      { title: '人员核查记录', stett: true, key: '1', permissions: 'czht_hcjl_ry'},
      { title: '车辆核查记录', stett: false, key: '2', permissions: 'czht_hcjl_cl'},
    ];


    //  {
    //       title: '车牌号码',
    //       dataIndex: 'hphm',ellipsis: true,
    //     },
    //     {
    //       title: '号牌种类',
    //       dataIndex: 'cllx',
    //     },
const columns = [
  {
    title: '序号',
    dataIndex: 'xh',
    width: 100
  },
  {
    title: '姓名',
    dataIndex: 'ryxm',
    ellipsis: true,
    // width: 120
  },
  {
    title: '身份证号',
    dataIndex: 'rysfzh',
    ellipsis: true,
    width: 200
  },
  {
    title: '状态',
    dataIndex: 'comparison_exception',
    render: text => ( <span> {text == '0' ? '正常' : text == '1' ? '异常' : ''}</span>),
    },
  {
    title: '标签',
    dataIndex: 'tags',
    // width:200,
    render: text => (
      <span>
        {text && text.length && text.map((tag,k) => {
          const color = tag === '正常' ? '#0cc' : '#ff6666';
          return (
            <Tag color={color} key={k}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </span>
    ),
  },
   {
            title: '执勤警车',
            dataIndex: 'carNo',
            ellipsis: true,
           width:120
        },
         {
            title: '执勤警员',
            dataIndex: 'jyxm',
            ellipsis: true,
           width:120
        },
        {
            title: '核查时间',
            dataIndex: 'comparison_time',
            ellipsis: true,
           width:120
        },
         {
            title: '警员部门',
            dataIndex: 'jybmmc',
            ellipsis: true,
           width:120
        },
//   {
//     title: '执勤警车/执勤警员/核查时间/警员部门',
//     dataIndex: 'hcr',
//     width:290,
//     render: (text, record) => (
//       <div>
//         <div>{`${record.carNo}/${record.jyxm}`}</div>
//         <div>{record.comparison_time}</div>
//         <div>{record.jybmmc}</div>
//       </div>
//     ),
//   },
  {
    title: '核查地点',
    dataIndex: 'gps',
    ellipsis: true,
    width:120
  },
  {
    title: '操作',
     filterType: authorityIsTrue('czht_hcjl_ry_ck'),
    render: (record) => (
        <span>
            <a style={{color: '#fff'}} onClick={() => {
                form.validateFields((err, fieldsValue) => {
                    if (err) return;
                    
                    const rangeValue = fieldsValue['range_picker'];
                    console.log('fieldsValue', fieldsValue,rangeValue)
                    const formdata = {
                        ...page,
                        pd:{
                            ...fieldsValue,
                            startTime: rangeValue ? rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss') : null : null,
                            endTime: rangeValue ? rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss') : null : null,
                        },
                        
                    }
                    // console.log(formdata)
                    
                    this.props.history.push(`./czht_hcjl/detail/${record.comparison_id}/${1}/${JSON.stringify(formdata)}`)
                })
            }}>查看 </a>
        </span>
    ),
  }
]
const columns_sechend = [
        {
          title: '序号',
          dataIndex: 'xh',
        width: 100
        },
        {
          title: '车牌号码',
          dataIndex: 'hphm',
           ellipsis: true,
          width:120
        },
        {
          title: '号牌种类',
          dataIndex: 'cllx',
           ellipsis: true,
          width:120
        },
        {
          title:  '品牌',
          dataIndex:  'clpp',
          ellipsis: true,
        //    width:100
        },
        {
          title: '车身颜色',
          dataIndex: 'csys',
          ellipsis: true,
           width:100
        },
        {
            title: '状态',
          dataIndex: 'comparison_exception',
          render: text => ( <span> {text == '0' ? '正常' : text == '1' ? '异常' : ''}</span>),
        },
        {
          title: '标签',
          dataIndex: 'tags',
        //   width:200,
          render: text => (
            <span>
              {text && text.length && text.map(tag => {
                const color = tag === '正常' ? '#0cc' : '#ff6666';
                return (
                  <Tag color={color} key={tag}>
                    {tag.toUpperCase()}
                  </Tag>
                );
              })}
            </span>
          ),
        },
        {
            title: '执勤警车',
            dataIndex: 'carNo',
            ellipsis: true,
           width:120
        },
         {
            title: '执勤警员',
            dataIndex: 'jyxm',
            ellipsis: true,
           width:120
        },
        {
            title: '核查时间',
            dataIndex: 'comparison_time',
            ellipsis: true,
           width:120
        },
         {
            title: '警员部门',
            dataIndex: 'jybmmc',
            ellipsis: true,
           width:120
        },
        // {
        //   title: '执勤警车/执勤警员/核查时间/警员部门',
        //   dataIndex: 'hcr',
        //   width:290,
        //   render: (text, record) => (
        //     <div>
        //       <div>{`${record.carNo}/${record.jyxm}`}</div>
        //       <div>{record.comparison_time}</div>
        //       <div>{record.jybmmc}</div>
        //     </div>
        //   ),
        // },
        {
            title: '核查地点',
            dataIndex: 'gps',
            ellipsis: true,
           width:120
        },
        {
            title: '操作',
             filterType: authorityIsTrue('czht_hcjl_cl_ck'),
            render: (record) => (
                <span>
                    <a style={{color: '#fff'}} onClick={() => {
                        form.validateFields((err, fieldsValue) => {
                    if (err) return;
                    // console.log('fieldsValue', fieldsValue, expandForm)
                    const rangeValue = fieldsValue['range_picker'];
                    const formdata = {
                        ...page,
                        pd:{
                            ...fieldsValue,
                            startTime: rangeValue ? rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss') : null : null,
                            endTime: rangeValue ? rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss') : null : null,
                        }
                    }
                    // console.log(formdata)
                    
                    this.props.history.push(`./czht_hcjl/detail/${record.comparison_id}/${2}/${JSON.stringify(formdata)}`)
                })
                    }}>查看 </a>
                </span>
            ),
        }
      ]

    

    // const pagination = {
    //   current: page.currentPage,
    //   pageSize: page.showCount,
    //   total: page.totalResult,
    //   showSizeChanger: true,
    //   showQuickJumper: true,
    //   onChange: this.pageChange,
    //   onShowSizeChange: this.onShowSizeChange,
    // };
    return (
      <div>
      {
          expandForm != ''
          ?
          <div>
          {/* <SwitchTag {...expandForm} titles={titles} toggleForm={this.toggleForm} /> */}
        <div className={styles.headerInfo}>
          {
            titles.map((v,k) => 
             authorityIsTrue(v.permissions)
             ?
              <Button
              type="primary"
              key={v.key}
              size="large"
              className={styles.button}
              style={{ backgroundColor: v.key == expandForm ? '' : '#333367' }}
              onClick={() => this.toggleForm( v.key)}
              loading={this.props.loading}
            >
              {v.title}
            </Button>
              :
              null)
          }
          
       
        </div>
        
        <div className={styles.tableListForm}>{this.renderForm()}</div>
        <Card bordered={false} className={styles.tableListCard}>
          {/* <h2 className={styles.h2Color}>核查记录</h2> */}
          
          <Table
            // columns={expandForm == '1' ? columns : columns_sechend}
            columns={expandForm == '1' ? columns.filter(
                            item => item.filterType || item.filterType === undefined
                        ) : columns_sechend.filter(
                            item => item.filterType || item.filterType === undefined
                        )}
            loading={this.props.loading}
            dataSource={list}
            // showSizeChanger
            size="default"
            pagination={false}
            // scroll={{ y: 290 }}
          />
         
            
         
         
          
        </Card>
        {
          page.totalResult ?
            <Row className={styles.pagination}>
              <Pagination
                // showSizeChanger
                showQuickJumper
                // pageSizeOptions={['16', '24', '32']}
                total={page.totalResult}
                current={page.currentPage}
                pageSize={page.showCount}
                onChange={this.onChange}
                onShowSizeChange={this.onShowSizeChange}
                showTotal={(total, range) => `共${total}项`}
              />
            </Row> : null
        }
          </div>
          :
          <div>
           <Result
                status="403"
                title="403"
                subTitle="抱歉，您没有相关权限"
                
            ></Result>
          </div>
      }
        
      </div>
    );
  }
}

export default Form.create()(CheckList);
