
import { Button, Card, Col, DatePicker, Form, Input, Row, Select, Modal, Message, List, Pagination, Radio, Table, Tag, Divider,Result } from 'antd';

import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './index.less';
import Graphics from './compontent/graphics'
import Snap from './compontent/snap'
import Verification from './compontent/verification'
import Industry from './compontent/industry'
import Patrol from './compontent/patrol'
import { authorityIsTrue } from '@/utils/authority'

@connect(({ scouts, loading }) => ({
    scouts,
    loading: loading.models.scouts,
}))
class scouts extends React.Component {
    state = {
        	current: authorityIsTrue('czht_xfzgtj_txtj')
			? '0'
			: authorityIsTrue('czht_xfzgtj_zptj')
				? '1'
				: authorityIsTrue('czht_xfzgtj_hctj')
					? '2'
					: authorityIsTrue('czht_xfzgtj_cjtj')
						? '3'
						: authorityIsTrue('czht_xfzgtj_xltj')
							? '4' : '',
            // current:'1'
    };
    componentDidMount() {
    }
    handleMune = (e) => {
		console.log('click ', e)
	
			this.setState({
				current: e
			})
		
	}
	renderCard = () => {
		switch (this.state.current) {
			case '0':
				return <Graphics />
				break
			case '1':
				return <Snap />
				break
			case '2':
				return <Verification />
				break
			case '3':
				return <Industry />
				break
			case '4':
				return <Patrol />
				break
			default:
				break
		}
	}
    render() {

        const { scouts: { data } } = this.props;
        const menuList = [
			{ name: '图形统计', key: '0', permissions: 'czht_xfzgtj_txtj' },
			{ name: '抓拍统计', key: '1', permissions: 'czht_xfzgtj_zptj' },
			{ name: '核查统计', key: '2', permissions: 'czht_xfzgtj_hctj' },
			{ name: '处警统计', key: '3', permissions: 'czht_xfzgtj_cjtj' },
			{ name: '巡逻统计', key: '4', permissions: 'czht_xfzgtj_xltj' },
		]

        
        return (
            <div>
				<div className={styles.headerInfo}>
					{menuList.map(
						(item) =>
							authorityIsTrue(item.permissions) ? (
								<Button
									type="primary"
									key={item.key}
									size="large"
									className={styles.button}
									style={{ backgroundColor: this.state.current == item.key ? '' : '#333367' }}
									onClick={() => this.handleMune(item.key)}
									// loading={loading}
								>
									{item.name}
								</Button>
							) : null
					)}
				</div>

				{this.state.current != '' ? (
					this.renderCard()
				) : (
					<div>
						<Result status="403" title="403" subTitle="抱歉，您没有相关权限" />
					</div>
				)}
                {/* <Graphics /> */}
			</div>
        );
    }
}


export default scouts;
