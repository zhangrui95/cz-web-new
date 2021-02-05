import {
	Button,
	Card,
	Col,
	DatePicker,
	Form,
	Row,
	Message,
	Tag,
	Select,
	List,
	Pagination,
	Input,
	Table,
	Tooltip,
    TreeSelect,
    Result
} from 'antd'
import React, { Component } from 'react'
import moment from 'moment'
import { connect } from 'dva'
import SwitchTag from '@/components/SwitchTag'
import styles from './style.less'
import { cardList, tableList } from '@/utils/utils'
const { RangePicker } = DatePicker
import { cardNoRule } from '@/utils/validator'
import Loadings from '@/components/Loading'
import { authorityIsTrue } from '@/utils/authority'
const FormItem = Form.Item
const { TreeNode } = TreeSelect;
const { Option } = Select
const gridStyle = {
	width: '12.5%',
	textAlign: 'center'
}
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
@connect(({ captureList, getVehicle, loading, device }) => ({
	captureList,
    device,
	getVehicle,
	loading: loading.models.captureList
}))
class CaptureList extends Component {
	state = {
		expandForm: authorityIsTrue('czht_zpjl_ry') ? '1' : authorityIsTrue('czht_zpjl_cl') ? '2' : authorityIsTrue('czht_zpjl_mac') ? '3': authorityIsTrue('czht_zpjl_mac_jm') ? '4': '',
		formValues: {},
        macList:[],
	}

	componentDidMount() {
		console.log(this)
		var _self = this
		if (this.props.location.state != undefined) {
			const states = this.props.location.state
			const pages = JSON.parse(states.pages)
			console.log(pages)
			this.setState(
				{
					expandForm: states.types,
					formValues: pages.pd
				},
				() => {
					if (pages.pd.startTime != null) {
						_self.props.form.setFieldsValue({
							...pages.pd,
							range_picker: [
								moment(pages.pd.startTime, 'YYYY-MM-DD HH:mm:ss'),
								moment(pages.pd.endTime, 'YYYY-MM-DD HH:mm:ss')
							]
						})
						_self.getCardData(pages, {
							...pages.pd,
							range_picker: [
								moment(pages.pd.startTime, 'YYYY-MM-DD HH:mm:ss'),
								moment(pages.pd.endTime, 'YYYY-MM-DD HH:mm:ss')
							]
						})
					} else {
						_self.props.form.setFieldsValue({
							...pages.pd
						})
						_self.getCardData(pages, {
							...pages.pd
						})
					}
				}
			)
		} else {
			// 第一次访问，获取默认选中  人脸抓拍记录
            if(this.state.expandForm != ''){
                this.getCardData()
            }

		}

		// 获取查询项中警车选择项，无参数默认查全部
		this.getPoliceCarData()
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
	getCardData = (changePage, pd) => {
        const { dispatch, captureList: { data: { page } } } = this.props
        if(this.state.expandForm != '4'){
            const pages = changePage || {
                currentPage: 1,
                showCount: this.state.expandForm == '3' ? tableList : cardList
            }
            const pds = pd || {}
            const param = {
                ...pages,
                pd: { ...pds }
            }
            console.log(param)
            dispatch({
                type: this.currentQueryList(),
                payload: param
            })
        }else{
            console.log('pd',pd,changePage.currentPage);
            let pds = {
                "kssj": pd.startTime || '',
                "jzsj":pd.endTime || '',
                "mac": pd.mac
            }
            this.getMac(pds,changePage.currentPage);
        }

	}

	// 点击SwitchTag 切换选中状态
	toggleForm = (k) => {
		const { expandForm } = this.state
		console.log(k)
		// debugger;;
		this.setState(
			{
				expandForm: k
			},
			() => {
				// 重置搜索条件以及查询
				this.handleFormReset()
			}
		)
	}

	// 查询条件重置
	handleFormReset = () => {
		//   debugger;;
		const { form, captureList: { data: { page } } } = this.props

		form.resetFields()
		this.setState({
			formValues: {}
		})
        if(page){
            page.currentPage = 1
            if(this.state.expandForm == '3'){
                page.showCount = tableList
            }else if(this.state.expandForm == '1' || this.state.expandForm == '2'){
                page.showCount = cardList
            }
        }
        if(this.state.expandForm != '4'){
            this.getCardData(page)
            // 获取查询项中警车选择项，无参数默认查全部
            this.getPoliceCarData()
        }else{
            this.getMac();
        }
	}
    getMac = (pd,changePage) =>{
        this.props.dispatch({
            type: 'captureList/getWifiDevicePgListPage',
            payload: {
                currentPage: changePage ? changePage : 1,
                showCount: 10,
                pd: pd ? pd : {}
            },
            callback:(res)=>{
                console.log('res',res);
                if(!res.reason){
                    this.setState({
                        macList:res.result && res.result.list ? res.result.list : [],
                    })
                }
            }
        })
    }
	handleSubmit = (e) => {
		e.preventDefault()
		const { form } = this.props
		console.log('dain')
		form.validateFields((err, fieldsValue) => {
			if (err) return
			console.log('fieldsValue', fieldsValue)
			const rangeTimeValue = fieldsValue.selectTime
			console.log(fieldsValue['range_picker'])
			const rangeValue = fieldsValue['range_picker']
			//   [rangeValue[0].format('YYYY-MM-DD'), rangeValue[1].format('YYYY-MM-DD')]

			const values = {
				...fieldsValue,
				startTime: rangeValue ? (rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss') : null) : null,
				endTime: rangeValue ? (rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss') : null) : null
			}

			this.setState({
				formValues: values
			})

			const { captureList: { data: { page } } } = this.props
            if(page){
                page.currentPage = 1
                if(this.state.expandForm == '3'){
                    page.showCount = tableList
                }else{
                    page.showCount = cardList
                }
            }
			this.getCardData(page, values)
		})
	}

	onShowSizeChange = (current, pageSize) => {
		const { captureList: { data: { page } } } = this.props
		const { formValues } = this.state
		page.currentPage = current
		page.showCount = pageSize
		this.getCardData(page, formValues)
	}

	onChange = (currentPage) => {
		const { captureList: { data: { page } } } = this.props
		const { formValues } = this.state
		page.currentPage = currentPage
		// 查询改变页数后的数据
		this.getCardData(page, formValues)
	}

	// 根据组织机构获取警车，code不存在获取全部警车数据
	getPoliceCarData = (e) => {
		const { form, dispatch } = this.props
		//   form.validateFields((err, fieldsValue) => {
		//   if (err) return;
		//     console.log('fieldsValue', fieldsValue,  fieldsValue.jybmbh || null);
		dispatch({
			type: 'getVehicle/fetchPoliceCarList',
			payload: {
				vehicle_organization_code: e || null
			}
		})
		//   })
	}

	// 获取当前选中tag返回获取数据的url
	currentQueryList() {
		const { expandForm } = this.state
		return expandForm == '1'
			? 'captureList/fetchPortraitCaptureList'
			: expandForm == '2' ? 'captureList/fetchVehicleCaptureList' : expandForm == '3' ? 'captureList/fetchMacCheckRecord' : ''
	}
onSearchGroup(val) {
  console.log('search:', val);
}
	// 渲染Form头部搜索条件
	renderSearchForm() {
		const { form } = this.props
		const { expandForm } = this.state
		const { getFieldDecorator } = form
		// 从安全中心获取管辖机构
		const userInfo = JSON.parse(sessionStorage.getItem('user'))
		const { groupList } = userInfo
		const { captureList: { data: { page } }, getVehicle: { policeCarList }, device:{ useList } } = this.props
         this.loopUse(useList)
		const formItemLayout = {
			labelCol: {
				xs: { span: 24 },
				sm: { span: 8 }
			},
			wrapperCol: {
				xs: { span: 24 },
				sm: { span: 8 }
			}
		}
		return (
			<Form onSubmit={this.handleSubmit} layout="inline" {...formItemLayout}>
				<Row>
                    {expandForm != '4' ? (<Col span={8}>
						<FormItem label="警员身份证号">
							{getFieldDecorator('jysfzh', {})(
								<Input placeholder="请输入警员身份证号" style={{ width: '330px' }} />
							)}
						</FormItem>
					</Col>):''}
                    {expandForm != '4' ? (<Col span={8}>
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
                    </Col>):''}

                    {expandForm != '4' ? (<Col span={8}>
						<FormItem label="执勤警车">
							{getFieldDecorator('vehicle_id')(
								<Select

									placeholder="请选择"
									style={{ width: '330px' }}
									// onFocus={() => this.getPoliceCarData()}
								>
									{policeCarList.length &&
										policeCarList.map((item) => (
											<Option value={item.vehicle_id}>{item.carNo}</Option>
										))}
								</Select>
							)}
						</FormItem>
					</Col>):''}
                    {expandForm != '4' ? (<Col span={8}>
						<FormItem label="状态">
							{getFieldDecorator('comparison_exception')(
								<Select  placeholder="请选择" style={{ width: '330px' }}>
									<Option value={'0'}>正常</Option>
									<Option value={'1'}>异常</Option>
								</Select>
							)}
						</FormItem>
					</Col>):''}
					{expandForm == '3' || expandForm == '4' ? (
						<Col span={8}>
							<FormItem label="MAC地址">
								{getFieldDecorator('mac', {})(
									<Input placeholder="请输入MAC地址" style={{ width: '330px' }} />
								)}
							</FormItem>
						</Col>
					) : null}

					<Col span={8} className={styles.datePicker}>
						<FormItem label="选择日期" {...formItemLayout}>
							{getFieldDecorator('range_picker')(
								<RangePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '330px' }} />
							)}
						</FormItem>
					</Col>
					<Col span={8} style={{ textAlign: 'left' }}>
						{this.renderSearchButton()}
					</Col>
				</Row>
			</Form>
		)
	}

	// 渲染查询条件的按钮渲染
	renderSearchButton = () => (
		<Row>
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

                    {
                        this.state.expandForm != '4' && authorityIsTrue(`${this.state.expandForm == '1' ? 'czht_zpjl_ry_dc' : this.state.expandForm == '2' ? 'czht_zpjl_cl_dc' : 'czht_zpjl_mac_dc' }`)
                         ?
                         <Button
						className={styles.submitButton}
						style={{ background: '#38B248', borderColor: '#38B248', color: '#fff' }}
						onClick={this.exportXLSX}
					>
						导出
					</Button>
                    :null
                    }

				</span>
			</Col>
		</Row>
	)
	//导出
	exportXLSX = (e) => {
		const { form, dispatch } = this.props
		const { expandForm } = this.state
		form.validateFields((err, fieldsValue) => {
			if (err) return
			console.log('fieldsValue', fieldsValue, expandForm)
			const rangeValue = fieldsValue['range_picker']
			if (rangeValue == undefined || !rangeValue.length) {
                Message.destroy()
				Message.error('请选择导出文件的时间范围')
				return false
			}
			const fieldsValues = JSON.stringify({
				...fieldsValue,
				startTime: rangeValue ? (rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss') : null) : null,
				endTime: rangeValue ? (rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss') : null) : null,
                  government: JSON.parse(sessionStorage.getItem('groupListCode'))
			})
			console.log(fieldsValues)
			window.open(
				`${'./dow.html?serverUrl='}${window.configUrl
					.serverUrl}${'&fieldsValue='}${fieldsValues}${'&currentXLSX='}${this.currentXLSX()}`,
				'_blank'
			)
			// dispatch({
			// 	type: this.currentXLSX(),
			// 	payload: {
			//         ...fieldsValue,
			//         startTime: rangeValue ? rangeValue[0] ? rangeValue[0].format('YYYY-MM-DD HH:mm:ss') : null : null,
			//         endTime: rangeValue ? rangeValue[1] ? rangeValue[1].format('YYYY-MM-DD HH:mm:ss') : null : null,
			//         },
			// 	success: (e) => {
			//         if(e.reason != null){
			//             Message.error('导出失败');
			//         }else{
			//             window.open(`${window.configUrl.serverUrl}${e.path}`);
			//             // window.location.href = `${window.configUrl.serverUrl}${e.path}`
			//             // Message.success('导出成功');
			//         }

			// 	}
			// })
		})
	}

	// 获取当前选中tag返回获取数据的url
	currentXLSX() {
		const { expandForm } = this.state
		return expandForm == '1'
			? 'capture/exportPortraitCaptureRecord'
			: expandForm == '2' ? 'capture/exportVehicleCaptureRecord' : 'capture/exportMacCheckRecord'
	}
	// 根据选中的tag渲染不同的查询条件
	renderForm() {
		// const { expandForm } = this.state;
		// expandForm   true:获取人脸抓拍记录 false：获取车牌抓拍记录
		// return expandForm ? this.renderPersonForm() : this.renderAdvancedForm();
		return this.renderSearchForm()
	}
	macRedenr = () => {
		const { captureList: { data: { list, page } }, loading, form } = this.props
		const columns_sechend = [
			{
				title: '序号',
				dataIndex: 'xh',
				width: 100
			},
			{
				title: 'MAC地址',
				dataIndex: 'mac',
				ellipsis: true,
				width: 120
			},

			{
				title: '标签',
				dataIndex: 'tags',
				render: (text) => (
					<span>
						{text &&
							text.length &&
							text.map((tag) => {
								const color = tag === '正常' ? '#0cc' : '#ff6666'
								return (
									<Tag color={color} key={tag}>
										{tag.toUpperCase()}
									</Tag>
								)
							})}
					</span>
				)
			},
            {
				title: '状态',
				 dataIndex: 'comparison_exception',
                render: text => ( <span> {text == '0' ? '正常' : text == '1' ? '异常' : ''}</span>),
			},
			{
				title: '执勤警车',
				dataIndex: 'carNo'
			},
			{
				title: '执勤警员',
				dataIndex: 'jyxm'
			},
			{
				title: '执勤警员身份证号',
				dataIndex: 'jysfzh',
				ellipsis: true,
				width: 180
			},
			{
				title: '执勤警员警号',
				dataIndex: 'jyCode',
				ellipsis: true,
				width: 120
			},
			{
				title: '核查时间',
				dataIndex: 'comparison_time',
				ellipsis: true,
				width: 180
			},
			{
				title: '警员部门',
				dataIndex: 'jybmmc',
				ellipsis: true,
				width: 180
			},
			{
				title: '核查地点',
				dataIndex: 'gps',
				render: (text, record) => <span>{record.gps}</span>
			}
		]

		return (
			<Table
				columns={columns_sechend}
				loading={this.props.loading}
				dataSource={list}
				// showSizeChanger
				size="default"
				pagination={false}
				// scroll={{ y: 250 }}
			/>
		)
	}
    macRedenrJm = () => {
        let {macList} = this.state;
        const columns_sechend = [
            {
                title: 'MAC地址',
                dataIndex: 'mac',
                ellipsis: true,
                width: '12%'
            },
            {
                title: '区域名称',
                dataIndex: 'qymc',
                ellipsis: true,
                width: '10%'
            },
            {
                title: '设备编码',
                dataIndex: 'deviceid'
            },
            {
                title: '开始时间',
                dataIndex: 'kssj',
            },
            {
                title: '结束时间',
                dataIndex: 'jzsj',
            },
            {
                title: '手机号码',
                dataIndex: 'sjhm',
                ellipsis: true,
                width: 120
            },
            {
                title: '经度',
                dataIndex: 'jd',
                render: (text,record) => record.gps && record.gps.length >0 ? record.gps[0] : ''
            },
            {
                title: '纬度',
                dataIndex: 'wd',
                render: (text,record) => record.gps && record.gps.length > 0 ? record.gps[1] : ''
            },
            // {
            //     title: '设备识别码',
            //     dataIndex: 'imsi',
            //     ellipsis: true,
            //     width: 120
            // },
            // {
            //     title: '手机MAC地址',
            //     dataIndex: 'phonemac',
            // }
        ]

        return (
            <Table
                columns={columns_sechend}
                loading={this.props.loading}
                dataSource={macList}
                size="default"
                pagination={false}
            />
        )
    }
	render() {
		const { expandForm } = this.state
		const { captureList: { data: { list, page } }, loading, form } = this.props

		const titles = [
			{ title: '人像抓拍记录', clicked: '1', id: 1, permissions: 'czht_zpjl_ry' },
			{ title: '车牌抓拍记录', clicked: '2', id: 2, permissions: 'czht_zpjl_cl' },
			{ title: 'MAC采集记录', clicked: '3', id: 3, permissions: 'czht_zpjl_mac' },
			{ title: 'MAC采集记录', clicked: '4', id: 4, permissions: 'czht_zpjl_mac_jm' },
		]


		return (
			<div>
            {
                expandForm != ''
                ?
            <div>
            {/* <SwitchTag {...expandForm} titles={titles} toggleForm={this.toggleForm} /> */}
				<div className={styles.headerInfo}>
                {/* {
                    console.log(authorityIsTrue(item.permissions))
                } */}
					{titles.map((item) =>
                        authorityIsTrue(item.permissions)
                        ?
                        <Button
							type="primary"
							key={item.id}
							size="large"
							className={styles.button}
							style={{ backgroundColor: item.clicked == expandForm ? '' : '#333367' }}
							onClick={() => this.toggleForm(item.clicked)}
							loading={loading}
						>
							{item.title}
						</Button>
                        : null


					)}
				</div>
				<div className={styles.tableListForm}>{this.renderForm()}</div>
				{expandForm == '1' || expandForm == '2' ? (
					<Card bordered={false} className={styles.tableListCard}>
						<List
							rowKey="portrait_id"
							loading={loading}
							grid={{
								gutter: 24,
								lg: 8,
								md: 4,
								sm: 1,
								xs: 1
							}}
							dataSource={list}
							renderItem={(item) => (
								<List.Item
									key={item.hphm}
									style={{ position: 'relative' }}
									// className={item.comparison_exception == '1' ? styles.yichang : ''}
									onClick={() => {
										form.validateFields((err, fieldsValue) => {
											if (err) return
											// console.log('fieldsValue', fieldsValue, expandForm)
											const rangeValue = fieldsValue['range_picker']
											const formdata = {
												...page,
												pd: {
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
														: null
												}
											}
											console.log(item)
                                            if(expandForm == '1' && authorityIsTrue('czht_zpjl_ry_xq') || expandForm == '2' && authorityIsTrue('czht_zpjl_cl_xq')){
                                                this.props.history.push(
                                                    `./czht_zpjl/detail/${expandForm == '1'
                                                        ? item.portrait_id
                                                        : expandForm == '2'
                                                            ? item.comparison_id
                                                            : ''}/${expandForm}/${JSON.stringify(formdata)}`
                                                )
                                            }

										})
									}}
								>
									{item.comparison_exception == '1' ? <Tag className={styles.yichang}>异常</Tag> : null}

									<Card hoverable={false} className={gridStyle} style={{minHeight: '212px'}}>
										{expandForm == '1' ? (
											<div className={styles.portrait}>
												<div className={styles.portraitImgs}>
													<img
														src={item.portrait_img}
														className={styles.portraitImg}
														alt=""
													/>
												</div>
												<Row className={styles.carTime}>
													{moment(item.portrait_time).format('YYYY-MM-DD HH:mm:ss')}
												</Row>
												<Row className={styles.carPer}>{item.carNo}</Row>
											</div>
										) : expandForm == '2' ? (
											<div className={styles.comparison}>
												<div className={styles.comparisonImgs}>
													<img
														src={item.comparison_img}
														className={styles.comparisonImg}
														alt=""
													/>
												</div>
												<Row className={styles.carPai}>{item.hphm}</Row>
												<Row className={styles.carTime}>
													{moment(item.comparison_time).format('YYYY-MM-DD HH:mm:ss')}
												</Row>
												<Row className={styles.carPer}>{item.carNo}</Row>
											</div>
										) : (
											''
										)}
									</Card>
								</List.Item>
							)}
						/>
					</Card>
				) : (
                    expandForm == '3' ? <Card bordered={false} className={styles.tableListCard}>
						{this.macRedenr()}
                    </Card> : <Card bordered={false} className={styles.tableListCard}>
                        {this.macRedenrJm()}
                    </Card>
				)}

				{page&&page.totalResult ? (
					<Row className={styles.pagination}>
						<Pagination
							// showSizeChanger
							showQuickJumper
							// pageSizeOptions={[ '16', '24', '32' ]}
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
		)
	}
}

export default Form.create()(CaptureList)
