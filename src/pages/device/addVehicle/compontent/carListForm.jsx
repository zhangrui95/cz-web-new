import React, { Component } from 'react'
import { Button, Col, Form, Input, Row } from 'antd'
const FormItem = Form.Item
let namedictionary = ''
const renderPersonForm = (props) => {
	const { form, data, loading, dictionaryVehicle } = props
	const { getFieldDecorator } = form
	// console.log(dictionaryVehicle)
	const formItemLayout = {
		labelCol: { span: 18 },
		wrapperCol: { span: 6 }
	}
	if (dictionaryVehicle && dictionaryVehicle.length && data) {
		for (let index = 0; index < dictionaryVehicle.length; index++) {
			const element = dictionaryVehicle[index]
			// console.log(element)
			if (element.code == data.vehicle_status) {
				namedictionary = element.name
			}
		}
	}
	return (
		<Form {...formItemLayout}>
			<FormItem label="车牌号码">
				{getFieldDecorator('vehicle_license_plate', {
					initialValue: data.vehicle_license_plate
				})(<Input placeholder="" disabled />)}
			</FormItem>
			<FormItem label="所属机构名称">
				{getFieldDecorator('vehicle_organization_name', {
					initialValue: data.vehicle_organization_name
				})(<Input placeholder="" disabled />)}
			</FormItem>
			<FormItem label="管理人联系方式">
				{getFieldDecorator('glrylxfs', {
					initialValue: data.glrylxfs
				})(<Input placeholder="" disabled />)}
			</FormItem>
			<FormItem label="车辆描述">
				{getFieldDecorator('clms', {
					initialValue: data.clms
				})(<Input placeholder="" disabled />)}
			</FormItem>
			<FormItem label="车辆品牌">
				{getFieldDecorator('clpp', {
					initialValue: data.clpp
				})(<Input placeholder="" disabled />)}
			</FormItem>
			<FormItem label="车辆型号">
				{getFieldDecorator('vehicle_volume_type', {
					initialValue: data.vehicle_volume_type
				})(<Input placeholder="" disabled />)}
			</FormItem>
			<FormItem label="管理人警号">
				{getFieldDecorator('glryCode', {
					initialValue: data.glryCode
				})(<Input placeholder="" disabled />)}
			</FormItem>
			<FormItem label="管理人姓名">
				{getFieldDecorator('glryxm', {
					initialValue: data.glryxm
				})(<Input placeholder="" disabled />)}
			</FormItem>

			<FormItem label="管理人身份证号">
				{getFieldDecorator('glrysfzh', {
					initialValue: data.glrysfzh
				})(<Input placeholder="" disabled />)}
			</FormItem>

			<FormItem label="车辆状态">
				{getFieldDecorator('vehicle_status', {
					initialValue: namedictionary
				})(<Input placeholder="" disabled />)}
			</FormItem>
		</Form>
	)
}
export default renderPersonForm
