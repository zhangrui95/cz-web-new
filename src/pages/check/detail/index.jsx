import { Button, Card, Col, DatePicker, Form, Row, Message, Select, List, Pagination, Input } from 'antd';
import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import styles from './style.less';
import PortraitDetail from './compontent/portraitDetail'
import VehicleDetail from './compontent/vehicleDetail'
import Loadings from '@/components/Loading'

@connect(({ checkList, loading }) => ({
  checkList,
  loading: loading.models.checkList,
}))
class CaptureList extends Component {
  state = {
  };
componentWillMount(){
const { match:{ params: { types }} } = this.props;
        console.log(typeof(types))
        if(Number(types)){
            this.getRecordById()
        }else{
            
            this.getVehicleById()
        }
}
  componentDidMount() {
        console.log(this.props)
      
  }

  getVehicleById = () => {
    const {
      dispatch,
      checkList: {
      },
      match:{ params: { id, types }}
    } = this.props;
        dispatch({
            type: 'checkList/getVehicleById',
            payload:{
                comparison_id: id
            }
        })
  };
getRecordById = () => {
    const {
      dispatch,
      checkList: {
      },
      match:{ params: { id, types }}
    } = this.props;
        dispatch({
            type: 'checkList/getRecordById',
            payload:{
                comparison_id: id
            }
        })
  };
 
  render() {
    const { expandForm } = this.state;
    const {
      checkList: {
        recordDetail
      },
      loading,
      match:{ params: { types, page}}
    } = this.props;

    console.log(types)
    return (
        <div>
            {
                !loading
                ?
                <div>
                <Button type='primary' style={{marginBottom: '15px'}} onClick={() => this.props.history.replace({pathname:'/czht_hcjl',state:{types: types, pages: page}})}>返回</Button>
                {
                    Number(types)
                    ?
                    <PortraitDetail files={recordDetail.comparison_result_show&&recordDetail.comparison_result_show[0]}/>
                    :
                    <VehicleDetail files={recordDetail.comparison_result_show&&recordDetail.comparison_result_show[0]}/>
                }
                    
                    
                </div>
                :
                <Loadings/>
            }
        </div>
       
    );
  }
}

export default Form.create()(CaptureList);
