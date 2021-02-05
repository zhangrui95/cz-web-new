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
} from 'antd';
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './index.less';
import { tableList } from '@/utils/utils';
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
import { cardNoRule } from '@/utils/validator';

@connect(({ logManagement, loading }) => ({
  logManagement,
  loading: loading.models.logManagement,
}))
class logManagement extends Component {
  state = {
    formValues: {},
  };

  componentDidMount() {
    this.getTableData();
  }

  getTableData = (changePage, pd) => {
    const {
      dispatch,
      logManagement: {
        data: { page },
      },
    } = this.props;
    const pages = changePage || {
      currentPage: 1,
      showCount: tableList,
    };

    const pds = pd || {};

    const param = {
      ...pages,
      pd: { ...pds },
    };
    console.log(param);
    dispatch({
      type: 'logManagement/fetchLogList',
      payload: param,
    });
  };

  // 查询条件重置
  handleFormReset = () => {
    const {
      form,
      logManagement: {
        data: { page },
      },
    } = this.props;
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
      logManagement: {
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
      logManagement: {
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
        startTime: rangeValue
          ? rangeValue[0]
            ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss')
            : null
          : null,
        endTime: rangeValue
          ? rangeValue[1]
            ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss')
            : null
          : null,
      };

      this.setState({
        formValues: values,
      });

      const {
        logManagement: {
          data: { page },
        },
      } = this.props;
      page.currentPage = 1;
      page.showCount = tableList;
      this.getTableData(page, values);
    });
  };

  renderPersonForm() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
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

    return (
      <Form layout="inline" {...formItemLayout} onSubmit={this.handleSubmit}>
        <Row>
          <Col span={8}>
            <FormItem label="操作名称">
              {getFieldDecorator('action')(
                <Input placeholder="请输入操作名称" style={{ width: '330px' }} />,
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="操作人身份证">
              {getFieldDecorator('opt_idcard')(
                <Input placeholder="请输入操作人身份证" style={{ width: '330px' }} />,
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label="操作人姓名">
              {getFieldDecorator('opt_name')(
                <Input placeholder="请输入操作人姓名" style={{ width: '330px' }} />,
              )}
            </FormItem>
          </Col>
          <Col span={8} className={styles.datePicker}>
            <FormItem label="选择日期">
              {getFieldDecorator('range_picker')(
                <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '330px' }} />,
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
          style={{ background: '#269CF4', borderColor: '#269CF4', color: '#fff' }}
        >
          重置
        </Button>
      </span>
    </Col>
  );

  renderForm() {
    return this.renderPersonForm();
  }
  handleUpdateModalVisible = (flag, record) => {
    this.setState({
      updateModalVisible: !!flag,
      updateValues: record || {},
    });
    if (flag) {
      this.chooseCode(record.fsdwbm);
    }
  };

  render() {
    const {
      logManagement: {
        data: { list, page },
        useList,
      },
      form,
    } = this.props;
    const columns = [
      {
        title: '序号',
        dataIndex: 'xh',
        width: 100
      },
      {
        title: '操作名称',
        dataIndex: 'action',
        ellipsis: true,
        width: 120,
      },
      {
        title: '对象类型',
        dataIndex: 'type',
        ellipsis: true,
        width: 120,
      },
    //   {
    //     title: '操作详情',
    //     dataIndex: 'details',
    //     ellipsis: true,
    //     width: 120,
    //   },
      {
        title: '请求方IP地址',
        dataIndex: 'ip',
        ellipsis: true,
        width: 120,
      },
    //   {
    //     title: '请求方法',
    //     dataIndex: 'method',
    //     ellipsis: true,
    //     width: 120,
    //   },
      {
        title: '操作人身份证号',
        dataIndex: 'opt_idcard',
        ellipsis: true,
        width: 120,
      },
      {
        title: '操作人姓名',
        dataIndex: 'opt_name',
        ellipsis: true,
        width: 120,
      },
      {
        title: '操作时间',
        dataIndex: 'opt_time',
        ellipsis: true,
        width: 150,
      },
    //   {
    //     title: '请求参数',
    //     dataIndex: 'params',
    //     ellipsis: true,
    //     width: 120,
    //   },
      {
        title: '执行时长(ms)',
        dataIndex: 'time',
        ellipsis: true,
        width: 120,
      },
      
    ];

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
            {page.totalResult ? (
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
                </Row>
            ) : null}
      </div>
    );
  }
}

export default Form.create()(logManagement);
