import { Button, Card, Col, DatePicker, Form, Row, Message, Select, List, Pagination, Input } from 'antd';
import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import styles from './style.less';
import WarningDetails from './compontent/warningDetails';
import VehicleDetail from './compontent/vehicleDetail';
import Patrolwarning from "./compontent/patrolwarning";
import WrittenWarning from "./compontent/writtenWarning";
import Loadings from '@/components/Loading'

@connect(({ warning, loading }) => ({
  warning,
  loading: loading.effects['warning/getAlarmById'],
}))
class Details extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      expandForm: this.props.match.params.types || '',
    };
  }
componentWillMount(){
const { match:{ params: { id,types }} } = this.props;
        
        if(id){
            this.getAlarmById()
        }
        
}
  componentDidMount(types) {
        
      
  }

  getAlarmById = () => {
    const {
      dispatch,
      warning: {
      },
      match:{ params: { id, types }}
    } = this.props;
        dispatch({
            type: 'warning/getAlarmById',
            payload:{
                alarm_id: id
            }
        })
  };

  render() {
    const { expandForm } = this.state;
    console.log(expandForm)
    const {
      warning: {
        details
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
                        
                        this.props.history.replace({pathname:'/czht_yjgl',state:{ pages: page}})
                        // this.props.history.goBack()
                    }}>返回</Button>
                     {
                        expandForm == '0' || expandForm == '5'
                        ?
                        <WarningDetails files={details.alarm_message&&details.alarm_message}/>
                        :
                        null
                    }
                    {
                        expandForm == '1'
                        ?
                        <VehicleDetail files={details.alarm_message&&details.alarm_message}/>
                        :
                        null
                    }
                    {
                        expandForm == '2' || expandForm == '4'
                        ?
                        <WrittenWarning files={details.alarm_message&&details.alarm_message} expandForm={expandForm}/>
                        :
                        null
                    }
                    {
                        expandForm == '7'
                        ?
                        <Patrolwarning files={details.alarm_message&&details.alarm_message}/>
                        :
                        null
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

export default Form.create()(Details);
