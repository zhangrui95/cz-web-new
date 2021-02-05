import React, { Component } from 'react';
import { Redirect } from 'umi';
class Home extends React.Component {
    render() {
        return (
            <Redirect
                to={
                    (!window.configUrl.mapType || window.configUrl.mapType === 'openlayers')
                        ? '/home'
                        : '/index'
                }
            />
        );
    }
}

export default Home;
