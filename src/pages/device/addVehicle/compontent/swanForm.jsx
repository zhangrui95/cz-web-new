import React, { Component } from 'react'
import { Button, Col, Form, Input, Row } from 'antd'
const FormItem = Form.Item
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
let namebayonet = ''
const renderPersonForm = (props) => {
	const { form, data, loading, dictionaryVehicle } = props
	const { getFieldDecorator } = form
	// console.log(dictionaryVehicle)
	const formItemLayout = {
		labelCol: { span: 18 },
		wrapperCol: { span: 6 }
	}
    
	 if(bayonetList&&bayonetList.length&&data){
            for (let index = 0; index < bayonetList.length; index++) {
                const element = bayonetList[index];
                // console.log(element)
                if(element.type == data.bayonet_type){
                    namebayonet = element.name
                }
            }
        }
		return (
			<Form  {...formItemLayout}>
				<FormItem label="卡口名称">
					{getFieldDecorator('kkmc',
						{
							initialValue: data.kkmc,
						}
					)(<Input placeholder="" disabled />)}
				</FormItem>
				<FormItem label="所属机构名称">
					{getFieldDecorator('gxdwmc',
						{
							initialValue: data.gxdwmc,
						}
					)(<Input placeholder="" disabled />)}
				</FormItem>
				<FormItem label="卡口经度">
					{getFieldDecorator('jd',
						{
							initialValue: data.jd,
						}
					)(<Input placeholder="" disabled />)}
				</FormItem>
				<FormItem label="卡口纬度">
					{getFieldDecorator('wd',
						{
							initialValue: data.wd,
						}
					)(<Input placeholder="" disabled />)}
				</FormItem>
				<FormItem label="卡口ID">
					{getFieldDecorator('kkid',
						{
							initialValue: data.kkid,
						}
					)(<Input placeholder="" disabled />)}
				</FormItem>
				<FormItem label="卡口代码">
					{getFieldDecorator('kkdm',
						{
							initialValue: data.kkdm,
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
	)
}
export default renderPersonForm
