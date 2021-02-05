import {
	Button,
	Card,
	Col,
	DatePicker,
	TreeSelect,
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
    Upload
} from 'antd'
import React, { Component } from 'react'
import { connect } from 'dva'
import styles from './../index.less'
const FormItem = Form.Item
const { Option } = Select
const { RangePicker } = DatePicker
const { TreeNode } = TreeSelect
import { tableList } from '@/utils/utils'
import AddCar from './addCar'
import { authorityIsTrue } from '@/utils/authority'
const TreeSelectProps = {
	showSearch: true,
	allowClear: false,
	autoExpandParent: false,
	treeDefaultExpandAll: true,
	searchPlaceholder: '请输入',
	treeNodeFilterProp: 'title',
	dropdownStyle: { maxHeight: 400, overflow: 'auto' },
	style: {
		width: 330
	}
}
const list = []
@connect(({ control, loading }) => ({
	control,
	loading: loading.models.control
}))
class data extends React.Component {
	state = {
		formValues: {},
        showAddCar: false,
		showEditCar: false,
        editCarValue:{},
        importLoading:false
	}
	componentDidMount() {
		this.getTableData()
        console.log('车')
	}

	getTableData = (changePage, pd) => {
		console.log(this.props)
		const { dispatch, control: { data: { page } } } = this.props
		console.log('changePage', changePage, 'pd', pd)
		const pages = changePage || {
			currentPage: 1,
			showCount: tableList
		}

		const pds = pd || {
		}
		const param = {
			...pages,
			pd: { ...pds }
		}
		dispatch({
			type:'control/getTemporaryCtrlCarlistPage',
			payload: param
		})
	}

	onChange = (currentPage) => {
		const { control: { data: { page } } } = this.props
		const { formValues } = this.state
		const rangeValue = formValues['range_picker']
		let values = {}
		if (formValues.type == 'day') {
			values = {
				...formValues,
				beginTime: rangeValue ? (rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss') : null) : null,
				endTime: rangeValue ? (rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss') : null) : null
			}
		} else {
			values = formValues
		}
		page.currentPage = currentPage
		// 查询改变页数后的数据
		this.getTableData(page, values)
	}

	onShowSizeChange = (current, pageSize) => {
		const { control: { data: { page } } } = this.props
		const { formValues } = this.state
		const rangeValue = formValues['range_picker']
		let values = {
				...formValues,
				beginTime: rangeValue ? (rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss') : null) : null,
				endTime: rangeValue ? (rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss') : null) : null
			}
		page.currentPage = current
		page.showCount = pageSize
		this.getTableData(page, formValues)
	}
	titleChange = (files) => {
		this.setState({ muneKey: files }, () => {
			// 重置搜索条件以及查询
			this.handleFormReset()
		})
	}

	handleSubmit = (e) => {
		const { dispatch, form } = this.props
		e.preventDefault()
		form.validateFields((err, fieldsValue) => {
			if (err) return
			const rangeValue = fieldsValue['range_picker']
			const values = {
					...fieldsValue,
					beginTime: rangeValue ? (rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss') : null) : null,
					endTime: rangeValue ? (rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss') : null) : null
				}

			this.setState({
				formValues: values
			})
			console.log(values, 'values')
			const { control: { data: { page } } } = this.props
			page.currentPage = 1
			page.showCount = tableList
			this.getTableData(page, values)
		})
	}



	renderForm = () => {
		const { form, control: {  } ,carType} = this.props
		const { getFieldDecorator } = form

		const formItemLayout = {
			labelCol: { span: 16 },
			wrapperCol: { span: 8 }
		}
		return (
			<Form layout="inline" onSubmit={this.handleSubmit} {...formItemLayout}>
				<Row>
                <Col span={8}>
						<FormItem label="车牌号">
							{getFieldDecorator('license_plate_no')(
								<Input
									placeholder="请输入车牌号"
									style={{
										width: '330px'
									}}
								/>
							)}
						</FormItem>
					</Col>
                    <Col span={8}>
						<FormItem label="布控警员姓名">
							{getFieldDecorator('ctrl_police_name')(
								<Input
									placeholder="请输入布控警员姓名"
									style={{
										width: '330px'
									}}
								/>
							)}
						</FormItem>
					</Col>
					<Col span={8}>
						<FormItem label="号牌种类">
							{getFieldDecorator('license_plate_type', {
							})(
								<Select
									placeholder="请选择"
									style={{
										width: '330px'
									}}
								>
                                {
                                    carType&&carType.map(v => <Option value={v.code} key={v.code}>{v.name}</Option>)
                                }
								</Select>
							)}
						</FormItem>
					</Col>
                    <Col span={8} className={styles.datePicker}>
						<FormItem label="更新时间">
							{getFieldDecorator('range_picker')(
								<RangePicker showTime format="YYYY-MM-DD HH:mm:ss HH:mm:ss" style={{ width: '330px' }} />
							)}
						</FormItem>
					</Col>
					<Col span={8}>
						<FormItem label="布控状态">
							{getFieldDecorator('ctrl_status', {
							})(
								<Select
									placeholder="请选择"
									style={{
										width: '330px'
									}}
								>
									<Option value={'0'}>否</Option>
									<Option value={'1'}>是</Option>
								</Select>
							)}
						</FormItem>
					</Col>
					

					<Col span={8}>{this.renderSearchButton()}</Col>
				</Row>
			</Form>
		)
	}
	// 渲染查询条件的按钮渲染
	renderSearchButton = () => (
		// <Col offset={8} md={8} sm={24}>
		<span className={styles.submitButtons}>
			<Button
				type="primary"
				htmlType="submit"
				className={styles.submitButton}
				style={{ background: '#3470F4', borderColor: '#3470F4', color: '#fff' }}
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
            {
                authorityIsTrue('czht_lkgl_lkcl_dc')
                ?
                <Button
				className={styles.submitButton}
				onClick={this.exportXLSX}
				style={{ background: '#38B248', borderColor: '#38B248', color: '#fff' }}
			>
				导出
			</Button>
                :
                null
            }
             {
                authorityIsTrue('czht_lkgl_lkcl_dr')
                ?
                <Upload
				showUploadList={false}
				customRequest={this.handleImports}
				//   disabled={this.props.loadings.imports}
				accept=".xls,.xlsx"
			>
				<Button type="primary" className={styles.submitButton}>
					导入
				</Button>
			</Upload>
                :
                null
            }
             {
                authorityIsTrue('czht_lkgl_lkcl_dr')
                ?
                <Button
				className={styles.submitButton}
				onClick={this.downloadTemplate}
				style={{ background: '#38B248', borderColor: '#38B248', color: '#fff' }}
			>
				导入模板下载
			</Button>
                :
                null
            }
				
			
			
		</span>
		// </Col>
	)
    //导入
	handleImports = (option) => {
		console.log(option, 'daoru',typeof(sessionStorage.getItem('groupListCode')))
        const { form, control: { data: { page } } } = this.props
        this.setState({importLoading:true})
        var _self = this
		let formData = new FormData()
		formData.append('file', option.file)
        formData.append('government', sessionStorage.getItem('groupListCode'))
        
		const token = sessionStorage.getItem('userToken') || ''
		fetch(`${configUrl.serverUrl}${'/data/importTemporaryCarExcel'}`, {
			method: 'post',
			body: formData,
			headers: {
				Authorization: token
			}
		})
			.then(function(res) {
				return res.json()
			})
			.then(function(json) {
				console.log(json)
				if(json.result.reason.code == '200'){
                    Message.destroy()
                    Message.success(`导入成功${json.result.success}条，导入失败${json.result.fail}条`)
                        if (json.result.fail != 0) {
                            window.location.href = configUrl.serverUrl + json.result.path
                        }
                        form.validateFields((err, fieldsValue) => {
                            if (err) return
                        const rangeValue = fieldsValue['range_picker']
                            const value ={
                                ...fieldsValue,
                                beginTime: rangeValue ? (rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss') : null) : null,
                                endTime: rangeValue ? (rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss') : null) : null,
        
                            }
                            _self.setState({
                                formValues: value,
                                importLoading:false
                            })
                            page.currentPage = 1
                            page.showCount = tableList
                            _self.getTableData(page, value)
                        })
                }else{
                    Message.destroy()
                     Message.error('导入失败')
                        _self.setState({importLoading:false})
                        return false
                }
			})
	}
     //下载模板
    downloadTemplate = (e) => {
		const { form, dispatch } = this.props
			dispatch({
				type: 'control/downloadTemporaryCarModal',
				payload: { },
				success: (e) => {
                    console.log(e)
                    if(e.result.reason.code == '200'){
                        window.location.href = `${window.configUrl.serverUrl}${e.result.path}`
                    }
					
				}
			})
	}
//导出
	exportXLSX = (e) => {
		const { form, dispatch } = this.props
		form.validateFields((err, fieldsValue) => {
			if (err) return
			console.log('fieldsValue', fieldsValue)
			const rangeValue = fieldsValue['range_picker']

			let fieldsValues = JSON.stringify({
					...fieldsValue,
					beginTime: rangeValue ? (rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss') : null) : null,
					endTime: rangeValue ? (rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss') : null) : null,
					government: JSON.parse(sessionStorage.getItem('groupListCode'))
				})

			console.log(fieldsValues)
			window.open(
				`${'./dow.html?serverUrl='}${window.configUrl
					.serverUrl}${'&fieldsValue='}${fieldsValues}${'&currentXLSX='}${'data/exportTemporaryCarExcel'}`,
				'_blank'
			)
		})
	}
	// 查询条件重置
	handleFormReset = () => {
		const { form, control: { data: { page } } } = this.props
		form.resetFields()
		this.setState(
			{
				formValues: {},
			},
			() => {
				page.currentPage = 1
				page.showCount = tableList
				this.getTableData(page)
			}
		)
	}
    //删除
	deleteVehicle = (files) => {
		const { dispatch, form } = this.props
		console.log('000000', files)
		Modal.confirm({
			title: '您确认要删除该临控车辆吗？',
			okText: '确定',
			cancelText: '取消',
			onOk: () => {
				dispatch({
					type: 'control/deleteTemporaryCtrlCar',
					payload: {
						id: files
					},
					success: (e) => {
						if (e.result.reason.code == '200') {
                            Message.destroy()
                           Message.success('删除成功')
								form.validateFields((err, fieldsValue) => {
									if (err) return
									
                                    const rangeValue = fieldsValue['range_picker']
                                    const value ={
                                        ...fieldsValue,
                                        beginTime: rangeValue ? (rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss') : null) : null,
                                        endTime: rangeValue ? (rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss') : null) : null,
                
                                    }
                                    this.setState({
										formValues: value
									})
									const { control: { data: { page } } } = this.props
									page.currentPage = 1
									page.showCount = tableList
									this.getTableData(page, value)
								})
                        } else {
                            Message.destroy()
                            Message.error('删除失败，请稍后重试！')
                            return false
                        }
					}
				})
			}
		})
	}
    hiddenModal = () => {
		this.setState({
			showAddCar: false,
			showEditCar: false
		})
	}
	addCarModal = () => {
		this.setState({
			showAddCar: true
		})
	}
    editVehicleModal = (files) => {
        console.log(files)
		this.setState({
            showEditCar: true,
            editCarValue: files
		})
	}
    handleCreate = flag => {
        console.log("新建");
        const { dispatch, form } = this.props;
        form.validateFields((err, fieldsValue) => {
        if (err) return;
        const rangeValue = fieldsValue['range_picker'];
        const values = {
            ...fieldsValue,
            beginTime: rangeValue ? rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss') : null : null,
            endTime: rangeValue ? rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss') : null : null,
        };

        this.setState({
            formValues: values,
            showAddCar: !!flag,
        });

        const {
            control: {
            data: { page }
            }
        } = this.props;
        page.currentPage = 1;
        page.showCount = tableList;

        this.getTableData(page, values);
        });
  };
  handleUpdate = flag => {
        console.log("编辑");
        const { dispatch, form } = this.props;
        form.validateFields((err, fieldsValue) => {
        if (err) return;
        const rangeValue = fieldsValue['range_picker'];
        const values = {
            ...fieldsValue,
            beginTime: rangeValue ? rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss') : null : null,
            endTime: rangeValue ? rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss') : null : null,
        };

        this.setState({
            formValues: values,
            showEditCar: !!flag,
        });

        const {
            control: {
            data: { page }
            }
        } = this.props;
        page.currentPage = 1;
        page.showCount = tableList;

        this.getTableData(page, values);
        });
  };
	render() {
		const { control: { data: { list, page },vehicleLabel },carType } = this.props
		const { muneKey } = this.state
	const addCarData = {
			modalVisible: this.state.showAddCar,
			handleModalVisible: this.hiddenModal,
            vehicleLabel:vehicleLabel,
            carType:carType,
            handleSubmit: this.handleCreate
		}
		const editCarData = {
			modalVisible: this.state.showEditCar,
			handleModalVisible: this.hiddenModal,
            vehicleLabel:vehicleLabel,
            carType:carType,
             handleSubmit: this.handleUpdate,
             values:this.state.editCarValue
		}
		const columns = [
			{
				title: '序号',
				dataIndex: 'xh',
				width: 100
			},
			{
				title: '车牌号',
				dataIndex: 'license_plate_no',
				ellipsis: true
				// width: 120
			},
			{
				title: '车牌种类',
				dataIndex: 'license_plate_type_text',
				ellipsis: true
				// width: 120
			},
			{
				title: '车辆型号',
				dataIndex: 'car_model',
				ellipsis: true
			},
			{
				title: '布控警员姓名',
				dataIndex: 'ctrl_police_name',
				ellipsis: true
			},
			{
				title: '布控警员电话',
				dataIndex: 'ctrl_police_phone',
				ellipsis: true
			},
			{
				title: '布控状态',
				dataIndex: 'ctrl_status',
                render: (item) => `${item == '0' ? '否' : item == '1' ? '是' : ''}`,
				ellipsis: true
			},
			{
				title: '标签',
				dataIndex: 'custom_tags_text',
				ellipsis: true
			},
			{
				title: '更新时间',
				dataIndex: 'updatetime',
				ellipsis: true
			},
            {
				title: '操作',
				width: 120,
				render: (record) => (
					<span>
                    {
                        authorityIsTrue('czht_lkgl_lkcl_bj')
                        ?
                        <a onClick={() => this.editVehicleModal(record)}>编辑 </a>
                        :
                        null
                    }
                    {
                        authorityIsTrue('czht_lkgl_lkcl_bj') && authorityIsTrue('czht_lkgl_lkcl_sc')
                        ?
                        <Divider type="vertical" />
                        :
                        null
                    }
                    {
                        authorityIsTrue('czht_lkgl_lkcl_sc')
                        ?
                        <a onClick={() => this.deleteVehicle(record.id)}>删除</a>
                        :
                        null
                    }
						
						
						
					</span>
				)
			}
			
		]
		return (
			<div className={styles.snap}>
				<div className={styles.tableListForm}>{this.renderForm()}</div>
				<Card bordered={false} className={styles.tableListCard}>
					<div className={styles.headTitle}>
						<h2 className={styles.h2Color}>临控车辆</h2>
                        {
                            authorityIsTrue('czht_lkgl_lkcl_xj')
                            ?
                            <Button
							type="primary"
							className={styles.addCarBtn}
							onClick={() => this.addCarModal()}
						>
							添加
						</Button>
                            :
                            null
                        }
						
					</div>

					<Table columns={columns} dataSource={list} loading={this.props.loading || this.state.importLoading} pagination={false} />
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
                <AddCar {...addCarData} />
				<AddCar {...editCarData} />
			</div>
		)
	}
}

export default Form.create()(data)
