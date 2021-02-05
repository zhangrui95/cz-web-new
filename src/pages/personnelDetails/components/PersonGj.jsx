import { Card, Empty, Form } from 'antd';
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from '../index.less';

@connect(({ personnelDetails, loading }) => ({
    personnelDetails,
    loading: loading.models.personnelDetails,
}))
class PersonGj extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    dataKeyRender = files => {
        let arr = [];
        for (var index in files) {
            // console.log(index ,":", files[index]);
            arr.push({
                value: files[index],
                name: `${index}：`,
            });
        }
        return arr;
    };
    renderTrajectory = () => {
        const {
            tabs,
            form,
            personnelDetails: { information },
        } = this.props;
        console.log('information', information);
        return (
            <div className={styles.item}>
                {information.map(x => (
                    <div key={x.id}>
                        <div className={styles.itemTitle}>{x.archives_type_name}</div>
                        <div className={styles.trajectory}>
                            <ul>
                                {x.archives_info &&
                                    x.archives_info.length &&
                                    x.archives_info.map((g, l) => (
                                        <li key={l}>
                                            <div className={styles.icons}>
                                                <img
                                                    src={
                                                        x.archives_type_code ==
                                                        window.configUrl.zsxx
                                                            ? './image/zs.png'
                                                            : x.archives_type_code ==
                                                              window.configUrl.tlxx
                                                            ? './image/tl.png'
                                                            : ''
                                                    }
                                                    alt=""
                                                />
                                            </div>
                                            <div className={styles.text}>
                                                {this.dataKeyRender(g).map((v, k) => (
                                                    <div key={k} className={styles.con}>
                                                        <span className={styles.titleColumn}>
                                                            {v.name}
                                                        </span>
                                                        <span className={styles.textColumn}>
                                                            {v.value}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        );
    };
    render() {
        const {
            personnelDetails: { information },
        } = this.props;
        return (
            <Card className={styles.tableListCard}>
                <div className={styles.infors}>
                    {information && information.length > 0 ? (
                        <div>{this.renderTrajectory()}</div>
                    ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                </div>
            </Card>
        );
    }
}

export default Form.create()(PersonGj);
