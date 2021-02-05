
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
  Divider,
  Modal,
  TreeSelect
} from 'antd';
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './style.less';
import { tableList } from '@/utils/utils';
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
import { cardNoRule } from '@/utils/validator'

import { authorityIsTrue } from '@/utils/authority'
const equipmentState = [{
    code: '0',
    name: '丢失'
},{
    code: '1',
    name: '成功'
}]
@connect(({ inventory, loading,service }) => ({
  inventory,
  service,
  loading: loading.models.inventory,
}))
class inventory extends Component {
  state = {
    formValues: {},
    tagState:0,
    createModalVisible: false,
    updateModalVisible: false,
    updateValues: {},
    isCar:false
  };

    componentDidMount() {
        const { match: { params: { files, page } } } = this.props
        this.getTableData();
        this.equipmentType();
    }
    equipmentType = (changePage, pd) => {
    const {
      dispatch
    } = this.props;
    
    dispatch({
      type: "service/policeQuery",
      payload:  {code: window.configUrl.dictionariesEquipmentType},
    });
  };
  
    getTableData = (changePage, pd) => {
        const { dispatch, inventory: { data: { page } },match: { params: { files, pages } } } = this.props;
        const newpages = changePage || {
            currentPage: 1,
            showCount: tableList,
        };

        const pds = pd || {};

        const param = {
            ...newpages,
            pd: { ...pds, imei: files },
        };
        console.log(param)
        dispatch({
            type: 'inventory/fetchList',
            payload: param,
        });
    }


    // 查询条件重置
    handleFormReset = () => {
        const { form, inventory: { data: { page } } } = this.props;
        form.resetFields();
        this.setState({
        formValues: {},
        });
        page.currentPage = 1;
        page.showCount = tableList;
        this.getTableData(page);
    };

    

  onChange = currentPage => {
    const {
      inventory: {
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
      inventory: {
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
            starttime: rangeValue ? rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss') : null : null,
            endtime: rangeValue ? rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss') : null : null,
        };

        this.setState({
            formValues: values,
        });

        const {
            inventory: {
            data: { page },
            },
            service: {  equipmentType }
        } = this.props;
        page.currentPage = 1;
        page.showCount = tableList;
        this.getTableData(page, values);
        });
  };

  renderPersonForm() {
    const { form, service: {  equipmentType } } = this.props;
    const { getFieldDecorator } = form;
   const formItemLayout = {
			labelCol: {
				xs: { span: 24 },
				sm: { span: 8 }
			},
			wrapperCol: {
				xs: { span: 24 },
				sm: { span: 16 }
			}
		}
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
                
                <Col span={8} >
                    <FormItem label="装备名称">
                    {getFieldDecorator('equipment_name')(
                        <Input placeholder="请输入装备名称"  style={{width:'330px'}}/>,
                    )}
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem label="装备类型">
                    {getFieldDecorator("equipment_type")(
                        <Select	 placeholder="请选择"  style={{ width: "330px" }} >
                        {
                        equipmentType&&equipmentType.map( v => (<Option value={v.code} key={v.code}>{v.name}</Option>))
                        }
                    </Select>
                    )}
                    </FormItem>
                </Col>
                <Col span={8}>
                    <FormItem label="装备状态">
                    {getFieldDecorator("equipment_status")(
                        <Select	 placeholder="请选择"  style={{ width: "330px" }} >
                        {
                        equipmentState&&equipmentState.map( v => (<Option value={v.code} key={v.code}>{v.name}</Option>))
                        }
                    </Select>
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
                <Button
                    className={styles.submitButton}
                    onClick={() => this.props.history.replace({pathname:`/${this.props.match.params.type}`,state:{expandForm: this.props.match.params.type == 'czht_sbgl' ? '1' : '5', pages: this.props.match.params.pages}})}
                    style={{ background: '#38B248', borderColor: '#38B248', color: '#fff'}}
				
                >
                    返回
                </Button>
                
            </span>
        </Col>
    );


    renderForm() {
        return this.renderPersonForm();
    }

    render() {
        const { inventory: { data: { list, page },  },  form, service: {  equipmentType } } = this.props;
        const columns = [
        {
            title: '序号',
            dataIndex: 'xh',
            ellipsis: true,
        },
        {
            title: '盘点车辆号牌',
            dataIndex: 'carNo',
            ellipsis: true,
            // width:150
        },
        {
            title: '装备名称',
            dataIndex: 'equipment_name',
            ellipsis: true,
            // width:150
        },
        {
            title: '所属机构',
            dataIndex: 'equipment_organization_name',
            ellipsis: true,
            // width:100
        },
        {
                title: "装备状态",
                dataIndex: 'equipment_status',
                // fixed: 'left',
                ellipsis: true,
                render: item => <span>
                    { 
                        equipmentState.map(v => {
                            if( v.code == item){
                                return v.name
                            }
                        })
                    }
                </span>
            },
        {
            title: '装备类型',
            dataIndex: 'equipment_type_name',
            ellipsis: true,
            // width:100
        },
        {
            title: '盘点时间',
            dataIndex: 'check_time',
            ellipsis: true,
            // width:150
        },
         {
            title: '装备id',
            dataIndex: 'equipment_id',
            ellipsis: true,
            // width:150
        },
        {
            title: '盘点类型',
            dataIndex: 'inventory_type',
            ellipsis: true,
            render: (item) => <span>{item == 1 ? '手动' : '自动'}</span>,
            // width:150
        },

    ]


    return (
      <div>
        <div className={styles.tableListForm}>{this.renderForm()}</div>
        <Card bordered={false} className={styles.tableListCard}>
            
          <Table
            columns={columns}
            loading={this.props.loading}
            dataSource={list}
            // showSizeChanger
            size="default"
            pagination={false}
            // scroll={{ y: 370 }}
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
    );
  }
}

export default Form.create()(inventory);

