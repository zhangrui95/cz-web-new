import { Button, Card, Col, DatePicker, Form, Row, Message, Select, List, Pagination, Input } from 'antd';
import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import styles from './style.less';
import WarningDetails from './compontent/warningDetails';
import VehicleDetail from './compontent/vehicleDetail'
import Loadings from '@/components/Loading'

@connect(({ captureList, loading }) => ({
  captureList,
  loading: loading.models.captureList,
}))
class CaptureList extends Component {
  state = {
  };
componentWillMount(){
const { match:{ params: { types }} } = this.props;
        
        if(types == '1'){
            this.getRecordById()
        }else{
            this.getVehicleById()
            
        }
}
  componentDidMount() {
        
      
  }

  getVehicleById = () => {
    const {
      dispatch,
      captureList: {
      },
      match:{ params: { id, types }}
    } = this.props;
        dispatch({
            type: 'captureList/getVehicleById',
            payload:{
                comparison_id: id
            }
        })
  };
getRecordById = () => {
    const {
      dispatch,
      captureList: {
      },
      match:{ params: { id, types }}
    } = this.props;
        dispatch({
            type: 'captureList/getRecordById',
            payload:{
                portrait_id: id
            }
        })
  };
 
  render() {
    const { expandForm } = this.state;
    const {
      captureList: {
        recordDetail
      },
      loading,
      match:{ params: { types, page }}
    } = this.props;

   
    return (
        
        <div>
            {
                !loading
                ?
                <div>
                    <div>

                    <Button type='primary' style={{marginBottom: '15px'}} onClick={() => {
                        
                        this.props.history.replace({pathname:'/czht_zpjl',state:{types: types, pages: page}})
                        // this.props.history.goBack()
                    }}>返回</Button>
                     {
                        types == '1'
                        ?
                        <WarningDetails files={recordDetail.portrait_result_show}/>
                        :
                        <VehicleDetail files={recordDetail.comparison_result_show&&recordDetail.comparison_result_show[0]}/>
                    }
                </div>
                </div>
                :
                <Loadings />
            }
       
        {/* <Loadings /> */}
            
            
        </div>
    );
  }
}

export default Form.create()(CaptureList);
