import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Icon,
    Input,
    InputNumber,
    Row,
    Select,
    Table,
    Tag,
    Pagination,
    Message,
    Divider,
    Empty,
    Modal,
    Upload,
    TreeSelect,
    Tooltip,
    Badge,
} from 'antd';
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from '../index.less';
import ReactEcharts from 'echarts-for-react';
import zyry from './../../../../public/image/zyry.png';
import echarts from 'echarts';

@connect(({ personnelDetails, loading }) => ({
    personnelDetails,
    loading: loading.models.personnelDetails,
}))
class social extends Component {
    constructor(props) {
        super(props);
        this.state = {
            personList: this.getList(props.gxList),
        };
    }
    componentDidMount() {
        const { tabs } = this.props;
        console.log('-----------------this.props.gxList-------------------', this.props.gxList);
        this.setState({
            personList: this.getList(this.props.gxList),
        });
    }
    getOutY = x => {
        return Math.sqrt((1 - Math.pow(x / 50, 2)) * Math.pow(42, 2));
    };

    getX = (r, d, x) => {
        return x + r * Math.cos((d * Math.PI) / 180); // r：半径，d：弧度，x:原点x坐标
    };
    getY = (r, d, y) => {
        return y + r * Math.sin((d * Math.PI) / 180); // r：半径，d：弧度，y:原点y坐标
    };
    getDeg = index => {
        let child =
            this.state.personList && this.state.personList[0] && this.state.personList[0].child
                ? this.state.personList[0].child
                : [];
        return child && child.length > 4 ? (70 / 7) * index : (180 / 7) * index;
    };
    getOutX = (index, x, y) => {
        let child =
            this.state.personList && this.state.personList[0] && this.state.personList[0].child
                ? this.state.personList[0].child
                : [];
        return this.getX(child && child.length > 4 ? 12 : 18, this.getDeg(index, x, y), x);
    };
    // getOutY = (index, x, y) => {
    //     let child = this.state.personList[0].child;
    //     return this.getY(child && child.length > 4 ? 12 : 18, this.getDeg(index, x, y), y);
    // };
    getSecondX = (index, x, y, idx) => {
        let child =
            this.state.personList && this.state.personList[0] && this.state.personList[0].child
                ? this.state.personList[0].child
                : [];
        return this.getX(child && child.length > 4 ? 18 : 20, 8 * (index + 1), x);
    };
    getSecondY = (index, x, y, idx) => {
        let child =
            this.state.personList && this.state.personList[0] && this.state.personList[0].child
                ? this.state.personList[0].child
                : [];
        return this.getY(child && child.length > 4 ? 28 : 38, 8 * (index + 1), y);
    };
    getOutXRoute = (x, y, x1, y1) => {
        if (x > 0 && y < 0) {
            return this.getRountX(x, y, x1, y1, 300);
        } else if (x < 0 && y < 0) {
            return this.getRountX(x, y, x1, y1, 60);
        } else if (x < 0 && y > 0) {
            return this.getRountX(x, y, x1, y1, 360);
        } else {
            return x1;
        }
    };
    getOutYRoute = (x, y, x1, y1) => {
        if (x > 0 && y < 0) {
            return this.getRountY(x, y, x1, y1, 300);
        } else if (x < 0 && y < 0) {
            return this.getRountY(x, y, x1, y1, 60);
        } else if (x < 0 && y > 0) {
            return this.getRountY(x, y, x1, y1, 360);
        } else {
            return y1;
        }
    };
    getRountX = (x, y, x1, y1, d) => {
        //X坐标绕某点旋转
        return (x1 - x) * Math.cos(d) - (y1 - y) * Math.sin(d) + x;
    };
    getRountY = (x, y, x1, y1, d) => {
        //Y坐标绕某点旋转
        return (x1 - x) * Math.sin(d) + (y1 - y) * Math.cos(d) + y;
    };
    getOutX1 = index => {
        let childLen =
            this.state.personList &&
            this.state.personList[0] &&
            this.state.personList[0].child &&
            this.state.personList[0].child.length
                ? this.state.personList[0].child.length
                : 1;
        let deg = 360 / childLen / 7;
        return this.getX(60, deg * (index + 1), 0);
    };
    getOutY1 = index => {
        let childLen =
            this.state.personList &&
            this.state.personList[0] &&
            this.state.personList[0].child &&
            this.state.personList[0].child.length
                ? this.state.personList[0].child.length
                : 1;
        let deg = 360 / childLen / 7;
        return this.getY(60, deg * (index + 1), 0);
    };
    getOutX2 = (index, num) => {
        let childLen =
            this.state.personList &&
            this.state.personList[0] &&
            this.state.personList[0].child &&
            this.state.personList[0].child.length
                ? this.state.personList[0].child.length
                : 1;
        let deg = 360 / childLen / num;
        return this.getX(90, deg * (index + 1), 0);
    };
    getOutY2 = (index, num) => {
        let childLen =
            this.state.personList &&
            this.state.personList[0] &&
            this.state.personList[0].child &&
            this.state.personList[0].child.length
                ? this.state.personList[0].child.length
                : 1;
        let deg = 360 / childLen / num;
        return this.getY(90, deg * (index + 1), 0);
    };
    getList = list => {
        console.log('list===>', list);
        let dataList = list ? list : {};
        let arr = [],
            items = [];
        let datas = {};
        if (dataList && dataList.result) {
            if (dataList.result.reason.code == '200') {
                if (dataList.result.list && dataList.result.list.length) {
                    if (
                        dataList.result.list[0].archives_info &&
                        dataList.result.list[0].archives_info.length
                    ) {
                        datas = dataList.result.list[0].archives_info[0];
                        if (datas.tagx && datas.tagx.length) {
                            let child = [];

                            for (let index = 0; index < datas.tagx.length; index++) {
                                const element = datas.tagx[index];
                                child.push({
                                    name: element.name,
                                    belong: '同案关系',
                                    imgs:
                                        'data:image/png;base64,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',
                                });
                            }
                            items.push({
                                name: '同案关系',
                                child: child,
                                imgs:
                                    'data:image/png;base64,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',
                            });
                        }
                        if (datas.txgx && datas.txgx.length) {
                            let child = [];

                            for (let index = 0; index < datas.txgx.length; index++) {
                                const element = datas.txgx[index];
                                child.push({
                                    name: element.name,
                                    belong: '同行关系',
                                    imgs:
                                        'data:image/png;base64,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',
                                });
                            }
                            items.push({
                                name: '同行关系',
                                child: child,
                                imgs:
                                    'data:image/png;base64,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',
                            });
                        }
                        if (datas.tjgx && datas.tjgx.length) {
                            let child = [];

                            for (let index = 0; index < datas.tjgx.length; index++) {
                                const element = datas.tjgx[index];
                                child.push({
                                    name: element.name,
                                    belong: '同监关系',
                                    imgs:
                                        'data:image/png;base64,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',
                                });
                            }
                            items.push({
                                name: '同监关系',
                                child: child,
                                imgs:
                                    'data:image/png;base64,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',
                            });
                        }
                        if (datas.tzgx && datas.tzgx.length) {
                            let child = [];

                            for (let index = 0; index < datas.tzgx.length; index++) {
                                const element = datas.tzgx[index];
                                child.push({
                                    name: element.name,
                                    belong: '同住关系',
                                    imgs:
                                        'data:image/png;base64,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',
                                });
                            }
                            items.push({
                                name: '同住关系',
                                child: child,
                                imgs:
                                    'data:image/png;base64,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',
                            });
                        }
                        if (datas.tswgx && datas.tswgx.length) {
                            let child = [];

                            for (let index = 0; index < datas.tswgx.length; index++) {
                                const element = datas.tswgx[index];
                                child.push({
                                    name: element.name,
                                    belong: '同上网关系',
                                    imgs:
                                        'data:image/png;base64,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',
                                });
                            }
                            items.push({
                                name: '同上网关系',
                                child: child,
                                imgs:
                                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFYAAABVCAYAAADTwhNZAAAUh0lEQVR42u1deXBW1RXHttrNGZ1x2s7U6Yw602o7nXY6bf+wU2SRJYmgwxayJ+JSUXBBtmyQlR0SIluoSIBASCAsUTYFBUGCEtlEQFEBERFcEZRF4Pac+96979zlvW/JF0i0d+YM5Pveu+++33feuWd/7dq1osEY+yXQP4CSgUYAlQMtAFoK1AD0PFA90EKgCqBcoHSgO4FubPf/IYH8LVAW0BygfUCXWPTjMtD7QNVAjwDd9kMD8zagbKAdLhgtOfYDlQD9+fsK5o+B+gFtCOLKixcvsY8On2CNm/ayhsWvsrnTXmAVpXVsfO4CVjqiipUMn8vG5cxn5cW1bE5FA1u+cCN77eU97NDBY+zChe9Cgfw60ACgn34fAL0O6FGgD2x3imDsaXqPLZi5mmU/OpP1vzuX9W4/gvW+C2kk6xOCenMawc/p1ymHDXvwGTZnagPbvmUfO3f2vB/AnwDlAF3fFgG9xt1UDtu4smnrflZWtJildh/lAglAdRjJ+nbIZn07IuWwfkidBOVq5H4Ox/TllM3P7YOEYMOc+CONBe7esmE3u3Deys0ngR4HuratgPpXoEb9Lk59dYbVVa1nD/Qq5TeOAAggHRBzWWJnh/p3zgNgPEqykPwejhXnCdA52ATkzHsK2bwZq9inJ770k8OdWjOg1wKV4hNOV/3Vl6dZFcjKpK55Lme6YAIAiRxMAV4+S+qSz5I5jWLJXT1K0ShZpy7OuTgHBVuAjNfEa/eD604ft5SdOP6FTaOY3erEAyzo90Dbdfm5rPoV53F3uRM5M9HlTA6mAFKA1m00p1Sk7gVhkzgvRQNagoycTLg4sXMOmw9y/ZszZ3WADwL9s7WAeh8+6XR1+3YdYoNTJxmA4k0iV0kwBZAuQGlIcYWc0pHikYp8yDkmTRIB251XguxyMudiF2Bc24Mglra9ulcH9xzQQ1cb1KFUfUIurZr+grNr42ZkAVRwJgXSAdEBLCOBUnEIIscSwDnQlJtdThZcLDiYiwiQwVNLam3ci1bfj67Grj9V2WI/+YINB3VHcinKUOAQCSh5xCmYFMTMewSVsCxBPXzI/T6Tk3MeBZuCrHMx52D4sXGzE+Lh0aQJ7PB7H+vgoil93ZUE9VllW91zmGX2LHJ2esGlwBmCQxVA4WYz4nUwdeBKOd3fM5jEcfRcAbQE2QawKyKoeMAnLLlrPtu2yRANq6+IUQEXmUmvunXjHq4z4sK4LBVcSh95DVATTB20MZwG3BtM4jgTbDvIFGDJvV0E9+ZIPXjVktd0cBtaVN+FyYvp1V5Z+6aji7qPPpelhEtRzokNyARUBTMUiOESBVqCTAGWHOxxrweuIxpQ7i6d/7IOblVLgZpFnSab1++S1lI/+ujLjUmXo8VhcGp0QPuLCj/OdQjXKLmXbGwC3BXgi9BGQaxBRR+p3DZ3vfEugJkdCKp8/CWn+snTkpCyNFKybXb6BsfB5dpDMLjrVm6jwKIGdG+sQL0R6JCY+cj7x1kKKP19xONvgFogdVBzk1LJd8ePEenX89MapFhw5S7ekxALaK3taTqoGJNAt8QC2Box45nT37LHkidyAS9kKlWlcIFCcZeyVVCCSjagW4IMfZeAqhgZFo1BbGiZPYp0M3gzukKbA2pvOtvE/IUOqB3JRkVATZOAUioyPsuggF8BMtfkiSrBsVRbkODihoaqGNxz9iPTwTN3kcIxJFpQbwA6JmZ5eXUTlznoQOEqldj9qQWlLdxbtDjGRpZjm0X+86V2H+2zjkJyjKqK4b2ibo6GT+1zL1Fgz0QlEpBBxQxffP41S08o4I+FVP6JSiXtewLqoOTJbNakFax61lpwZK9hNf99ERa2nlMd0MLKtfw7P1oQAQXNg9epc6+LtHjOS3w91bPW8PU9ljxJBVczhVEnF5sZigbcY8hYEk1cSrrgpxTWKCJAyFU/Tn16QAX78ovTrC0MXOfT91cQTlatNG8zc0RCzsAZ7PLly9Td+O9IgJ0rzjzw1hFp/0sRoFlUKrAFbNfr77K2NHbCelO7m2JEcK4nEhwV7NWXdip2Urig3gokYxm5g2Z5WgAVAZpXigL79alv2hSwuF4qbz0PmcO5VAVDcTiw/3j23XfKRtYhHGArxNEY6OMblsatjqmquvkEuLhBUBfcWzveZ/NnrHYInMsYOFwA8g2p2v1X0kznGDx2HtL0VZyqOL1AaJX8bp7P3Mb8ZG4kXJcYuF6+sVk3YGI8gBjkGxlg8tLzbyi+hFCgXo8/oDi68Ok5JrdKA4D6TJ3/i52XArti0SbXIeMQfu9pEgXKhoHf4THoZUoi3if0+ONnWfcW8X/xbyUK0TU/7Lmd+UfxdZnAqr4NbvbGeVybRLgWHfmXL12mFtmtQcA+KI48eugT+GVG+nIrV/IThBLuAYukAAv5ARTUtADZrKo6edxrhjewZnkjO370U/7I4r/4N36O3+NxqietwKqzpmng4rrswJInUfgUCNdSWdu09QDl2pIgYOXV5j7zvBuAM2UrBVVQOvEamcCO9hYeV2haYtTj1N0DFh/dsz75Afg5fi+ApRxnnT/Omx/XowObJn8Ui5UWp8taR0MYmz2fLglD/dfYQL1ZhFkw9n//vcVSb0VdTnCE41jxHCrCc+QHLGa0KDetuQ8901PcgAMsys9wxrPlKyWw6XGq00f1bKk/XoMObBwFtljeoxQJuobA9dpsdurLM3Q5d9qAfUR8u3v7QcXKknqry226l0pfuArsZumXFTfNPVo9PE8UziXPh2OfyChj3124GBawmPEyKGWydg3iNetRaq4RjsV16cAK+ar4G9w9hMtafRODLJwXG16nyxlnA3YF5QK/TYsuPGxg49SbFqAKX6qYQ9z087VbIlKX8HgBrPzhyPx4PeXHi/MHlj5ROrcbqhdgVDK8ii5llw7qj9AIEd9yDxYVAwJY9zFRY1PBwK6s3axwOr1p9cYd7z6e//bODyIC9u1dH/DzxDVwPt0RLtfp7vS4riBgdSe5IQ5cMxc1EpKQh2rCTRTYv0i/wGen7LorWTj1/osFBAFriAEtQiCBdTULzDiMZODxfH0JYQDrrjNSYIU4sGkHGEwloycFdoAXHHyLy46+xC+gaAP8oqa3vlnA9vQeVTwfDZNIBh7vAWufPzpgtT1A1w5crxfViVH9p8CWiU8Xzl5nqllkY3Bi/WYoJJbAohcqkoHuvFgCS0NGIhiJItCUs47aVVa8mC5nOQV2jfgUdTNn48rlloZNvtpiTM0FVs4BXPFY0iRf/VUfGNUYmDhBbqxB80cNbA8BrCtniTsR96IhWeV0SQcosNKEeDKzzNBfhbVFgWkJYIVmgHrmrEnLwgJ22pgljg5r0QhiA6y28Vn0WUz8I+NbaSi43nA+8CCbGZtxRYF1HreK0iWcI/04FdPoqahqCWD1c8UGRoHtBRuY5tH7FYL6M5nUBpnPvawagQlMSwOL9jyaqwMTx3Mr6d19H7KPP/qM/4t/4+f4veODaGlgS0NqBseOnKTA/lGUBPHx+aenzLhWFMDS/P9QwNoUeOov4N4tnhqfLSlRJNwRP4GfARIOsLheHVg9bcnbXD0LLJG4ETEgQMa/hGObjxPHPvc3ZS2qlrHxuMBeungpImDVR02ERPJ5/gI62mueXcc2rNrOK2TwX/wbP8fv8TgRJQ73GjqwuN7IgR2lmLZ73lRUxE4iG5uPjz886QKb0yxgL4YBrE1+CSdM5j1FrLpyDX+CggZ+j8fh8boTJvA6GrAXIwUW9wAN2J1vKOGorgrHHj/2WVQcq9vhIYEVcxgioIA9lVnOfcGRDDx+yP1TFX2bigSbIyYIWKELR8SxTSbH3iz++uzkV1HJ2EiA1R04QvHG80Y8PI19FWV09zTsyqMfn00AKvbJm40VsKqM1cxaLmN/If46f/5CVFpBtMBSufpEelnIRz/UwAqdJzPKDXkbDbDhawUOsJp/409Cj5XKYkq3/JAOmKiA1XJkdY/YETNNPaqBCRV2F6Ca4R0ZsKH1WKxjI+PXAlgpeZ9In9Jsyys0sMWe/xWOnzF+GYvlwPkEUGqCXHjABlpecablhZoJSeI4Ry2vF8WnWAzcXF/BpUuXrP5YCizdsLDIOJYD50vtXmDk5wpgdX8srjeUr0DxyWq+giczyujl37XmEmAsvrneLd1AoEnINMCHxw4d8Az9tWMycD6cV4gwNThYaABrMxCCvFspmndrckGNPccAC8bEp1jUq/hj9ehshP5YGpqhKZwiDINJay0xcF4ZB9PSOcMJzUTij8UKTGsYHP74m/gUC3l7xTCC4ERpLek7brR0/QvbWwRYnFdEh83rFlijtJFFEPKkn2DvzvfppXvpjRpkBswj4OCwh77VmJfNokEu8csrkFkqJHliR+M7LQIszqskiSgZMfa8gmhiXsi5589doDGv3+gBRRnIr5y8PPoorQbsyhovE0YWE3fzUokqwe+qJZg1e+B8OK9IPdKvi4TrCgJWjdLa5KtT21Y4ZI4S17SFvweLb99sPEAssLzI8goMYDfxG5Ql8iR/ysnRyuNm7NABUyGvthxM03LukX8qq8yjTB9yv8fj8Tw8H+fB+bjnSxZD02s618V12YANmVfQdZRMoUf5unrZVgrsJBuwt4g6LvzFM6B5QpA40LNZfGUscEZWjyKPeiIVy7+xSUNGQiHPGE+Lxx8PrhM3ijvcUzjle9QtX/0bCI/jBOfh+enxBXw+nDdTuWaRso6GGnsmjK5rB2XCIONhtnvIdE7aGWP2lOVeFjfJ3dLTeFQrqsgAFlUfVMBbG1EVT9+8MrRkP78gYtHQ5yiox3yrxTFXgyrZQbmx/OIJxYbCjws8c/psm0o8xvVSGasnxfllG2oFzRNDFcvJ4E3e4MrATcw0UZ1F7Nt9uE0Bu2/3If9MQ7JpoUiUWd2gORGHPrL/7aGSjyvF0dhtyOpG1HJkaWMGXEjJsCqqgrTqgevE9erpn+mW3FjP/woV4vXKprUunFT520U6J8oh9JHyknlbDUK82gmDigQ0KbHcZ9ZEpOUGlRUuZpNGLXJpIS/Om5BXzQkbmOFnjZCVE2osgjDNtLFL2TRoojN9XD13wMyYsIzNdMl2bYdW8PUNhQofuwgo9M3mfqj3GL3lVLdwCzxkagfGcmyyNlUrmc+wyFs9l18W0lkUdpkif7fXgYiqRH5j+EPP8OCil93t6a66UWIr4AgCNc2nakazFhsjKUe6g1bOYNs7a52XklpebIBry9q2AU5rqrzagxzdBreOYQ9WuM0n8pRaBL8S1Ix4Dzyz/4xXd8ArZix1XkMfqABv2GU1vhVhEd002u8lRSRydBI3oYmEeDN9Xlgt5mf+3CGMhsGpk/WQsnXUQ8MG1GGdJ8k/Zd68vl7IbOnCoVUm9gWReHD/UXr5VdGUfN6EPhnZGGVZo3Uj06toHHBLQpbNG15992YeT5sCxRvbgnoTGuMYFHxMzF/kk5JfbJTZ28ru9SoZVQQ4GxZ2m9PaSP0h2kLldKroFw+baxUJurwV4Nq8YNKPq0VOB6dO4bVTYXTVDFSb8gdVGo4Uk0otcbAi9cmhvWLgntFk1taW19x+BQ00WPdwn7GqlqCoYKZVFqpFyZCsCramvpF9++25mKhPKP82r9/NRv5npvzxbM14rI14SDkUrUREUfPRh0oKUVOzm+9gghfmcsgedSBj+oMM9Gtb4sm20MBiXsKYEfPZjHHLoCdsHSsvqoMunbVcFZtS4BB65yePRlpEqMb5HAiPwePLCmvh/Fo+z7Sx9aC2LWIP3DfGp6WUpZpGA1XIVWSiN7a8rZfT3xGr9iV30WaQqF8GNdrxZG6x4RgP6t+i2+fpWqk7Ja98qNBXpqrX0AKDpKORUrin9YRZqWZrozqQEuuGO4MVU2Pl61K/tTbcifNvC2UL1tk2EwVkH7XJtuvbNko/merbaAfk6sLZRthoSku1iKpQdA0w6/qQlntG3y1N7eE3LR3IJWF1G/Lv9WIaJhRECqQyp953i4Aq+25BzA8L+LQgZ32L9Tp0y5aq6dUw+w9VsD60n2EXn05xFIgEs2WUB0SJ4Uj364Kkg2fvdRhepzjx+NfNNWogsLvZz1u6Bd9PgOqU+NK2d/jOKVQxUZkdurehX/uoEkv4RyXzM9Xj72eEUC5N0nobomm8YXWTDip6xK9Mw143+KiU5B09cgKU+8mkGydpbyq41+jMocnJBDUkErL9E/Gs6YAGduN0uZTL045OP0PsJWux9NZhbtvVaHVaQtvynQVddPr4eqcHN23IK/sKqM1403SQ4+29Y+29tLSeWvGWJmU2QBUudR790hHzuI6ujbnsajZGh4unUec4155f288eAkNC6XgsGjdoHY9p22jpOInT+3b5dDxWuh6bHY9TtLbSsm+323UzHeJiG1Y16ZsUmlfDW1Mn+f1KTc4353i7kP6dcz3NgXRA9uvRbevPndbd5m60AEnbRwf06EZ5OmPCUlunpY9Ya+sw7+bZTmfamzmwdR12cue+TNlV3mvP39/WVd7WUZ5wYUrYXeVz1db9QOhEP/zBcZs1vEQpMG6FbfvbAxltg9H1iF07MDytvgchh7Tud9v3d9bfgZCvkfoeBPkuBP09CB0cMJPhVQEo+48eshY/f4itBtvKSyZQJcO3Ypy0NW7YuHYHf28MgiBA7uM2+JVv7eiovrUjsZMAjry9oyN5ewd9c8ddIzio+Y9XsrUrttkamzM3pWr0Fd/1YwQwdkXKsQEsqgu3vrKHzZxYzxOee7tv2jDeM9NBI/19M+2d981gA3OsVty4bkdQLQPm40/g1YNtfaDV4qaKvhnk8sMN7529R9h6Xsv1Ig8Qjsmex0Y9MZu/5AcpHwo4MDm6AmposRQJW4fshcYRp78O2UQNs++eBrqh3fdxuCmj45nPG5NiPI67Iab27X5IA6tLgJ5yHRzHYwDk527W5Eigv1vbNf0QB+aWAnVhzjvAxgHNY857EtErstmlDS54+C7Fie4mGQ/0u9Z0L/8DyDh2xqW2L68AAAAASUVORK5CYII=',
                            });
                        }
                    }
                }
                arr.push({
                    name: datas.name,
                    child: items,
                    imgs:
                        'data:image/png;base64,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',
                });
            }
        }
        return arr;
    };
    getOption = () => {
        // const { personnelDetails: { socialsList } } = this.props
        let socialsList = this.getList(this.props.gxList);
        console.log('socialsList=====>', socialsList);
        let items = [];
        if (socialsList && socialsList.length > 0) {
            const element = socialsList[0];
            if (element.child && element.child.length > 0) {
                items.push({
                    symbol: element.imgs,
                    name: element.name,
                    value: [0, 0],
                    pointType: 'center',
                });
                let deg = 360 / element.child.length;
                for (let i = 0; i < element.child.length; i++) {
                    const caseData = element.child[i];
                    let parentNum = element.child.length;
                    let x = this.getX(35, deg * (i + 1), 0);
                    let y = this.getY(35, deg * (i + 1), 0);
                    if (caseData.child && caseData.child.length > 0) {
                        items.push({
                            symbol: caseData.imgs,
                            name: caseData.name,
                            value: [x, y],
                            pointType: 'cloud',
                        });
                        let degNew = 360 / element.child.length / caseData.child.length;
                        let itselfNum = caseData.child.length;
                        for (let j = 0; j < caseData.child.length; j++) {
                            const underlying = caseData.child[j];
                            let x1 = this.getOutXRoute(
                                x,
                                y,
                                this.getOutX(j + 1, x, y),
                                this.getOutY(j + 1, x, y),
                            );
                            let y1 = this.getOutYRoute(
                                x,
                                y,
                                this.getOutX(j + 1, x, y),
                                this.getOutY(j + 1, x, y),
                            );
                            let indexNum = itselfNum - 0;
                            // let xNew = this.getX(40, degNew * (j + 1), 0)
                            // let yNew = this.getY(40, degNew * (j + 1), 0)
                            let xNew =
                                x > 0
                                    ? j <= itselfNum / 2
                                        ? x - (j + 1) * 4
                                        : x + (j - itselfNum / 2 + 1) * 4
                                    : j <= itselfNum / 2
                                    ? x + (j - itselfNum / 2 + 1) * 4
                                    : x - (j + 1) * 4;
                            let yNew = y > 0 ? this.getOutY(xNew) : -this.getOutY(xNew);

                            items.push({
                                symbol: underlying.imgs,
                                name: underlying.name,
                                // value: element.child.length > 2 ? [this.getOutX1((caseData.child.length - j) + i * 7), this.getOutY1((caseData.child.length - j) + i * 7)] : [x1, y1],
                                value: [xNew, yNew],
                                pointType: 'point',
                                belong: underlying.belong,
                            });
                        }
                    }
                }
            }
        }
        // console.log(items, '--------', JSON.stringify(items))

        items.forEach((el, index) => {
            if (el.pointType == 'center') {
                (el.symbol = `image://${el.symbol}`), (el.symbolSize = [40, 40]);
                el.label = {
                    normal: {
                        show: true,
                        position: 'bottom',
                        borderWidth: 1,
                        borderRadius: 12,
                        padding: [4, 8, 4, 8],
                        distance: 10,
                        color: 'rgb(255,255,255)',
                        // borderColor: "rgb(89,197,238)"
                    },
                };
            } else if (el.pointType == 'cloud') {
                (el.symbol = `image://${el.symbol}`), (el.symbolSize = [35, 35]);
                el.label = {
                    normal: {
                        show: true,
                        position: 'bottom',
                        borderWidth: 1,
                        borderRadius: 12,
                        padding: [4, 8, 4, 8],
                        distance: 10,
                        color: 'rgb(255,255,255)',
                        // borderColor: 'rgb(89,197,238)'
                    },
                };
            } else if (el.pointType == 'point') {
                el.symbolSize = [10, 10];
                el.itemStyle = {
                    color: ['#0fffff'],
                };
                if (!el.label) {
                    el.label = {
                        show: true,
                    };
                }
                el.label.width = 200;
                el.label.color = {
                    lineColor: {
                        color: '#fff',
                    },
                };
                if ((el.value[0] > 0 || el.value[0] == 0) && el.value[1] > 0) {
                    el.label.rotate = 40;
                    el.label.align = 'left';
                    if (!el.label.offset) {
                        el.label.offset = [22, 6];
                    }
                    el.label.position = 'top';
                } else if (el.value[0] < 0 && (el.value[1] > 0 || el.value[1] == 0)) {
                    el.label.rotate = -40;
                    el.label.align = 'right';
                    if (!el.label.offset) {
                        el.label.offset = [-16, 0];
                    }
                    el.label.position = 'top';
                } else if ((el.value[0] < 0 || el.value[0] == 0) && el.value[1] < 0) {
                    el.label.rotate = 40;
                    el.label.align = 'right';
                    if (!el.label.offset) {
                        el.label.offset = [-16, 0];
                    }
                    el.label.position = 'bottom';
                } else {
                    el.label.rotate = -40;
                    el.label.align = 'left';
                    if (!el.label.offset) {
                        el.label.offset = [16, 0];
                    }
                    el.label.position = 'bottom';
                }
            } else if (el.pointType == 'pointOut') {
                el.symbolSize = [8, 8];
                el.itemStyle = {
                    fontSize: 12,
                    color: ['#0fffff'],
                };
                if (!el.label) {
                    el.label = {
                        show: true,
                    };
                }
                el.label.width = 200;
                el.label.color = {
                    lineColor: {
                        color: '#fff',
                    },
                };
                if ((el.value[0] > 0 || el.value[0] == 0) && el.value[1] > 0) {
                    el.label.rotate = 40;
                    el.label.align = 'left';
                    if (!el.label.offset) {
                        el.label.offset = [22, 6];
                    }
                    el.label.position = 'top';
                } else if (el.value[0] < 0 && (el.value[1] > 0 || el.value[1] == 0)) {
                    el.label.rotate = -40;
                    el.label.align = 'right';
                    if (!el.label.offset) {
                        el.label.offset = [-16, 0];
                    }
                    el.label.position = 'top';
                } else if ((el.value[0] < 0 || el.value[0] == 0) && el.value[1] < 0) {
                    el.label.rotate = 40;
                    el.label.align = 'right';
                    if (!el.label.offset) {
                        el.label.offset = [-16, 0];
                    }
                    el.label.position = 'bottom';
                } else {
                    el.label.rotate = -40;
                    el.label.align = 'left';
                    if (!el.label.offset) {
                        el.label.offset = [16, 0];
                    }
                    el.label.position = 'bottom';
                }
            }
        });
        const dataArr = [];
        const targetCoord = [0, 0];
        items.forEach(el => {
            if (el.belong) {
                items.forEach(element => {
                    if (el.belong == element.name) {
                        dataArr.push([
                            {
                                coord: element.value,
                            },
                            {
                                coord: el.value,
                            },
                        ]);
                    }
                });
            } else if (el.pointType != 'none') {
                dataArr.push([
                    {
                        coord: targetCoord,
                    },
                    {
                        coord: el.value,
                    },
                ]);
            }
        });
        const option = {
            // backgroundColor: '#111',
            color: ['#fff'],
            legend: [],
            xAxis: {
                show: false,
                type: 'value',
                max: 50,
                min: -51,
            },
            yAxis: {
                show: false,
                type: 'value',
                max: 50,
                min: -50,
            },
            series: [
                {
                    type: 'graph',
                    layout: 'none',
                    coordinateSystem: 'cartesian2d',
                    symbolSize: [15, 15],
                    z: 3,
                    circular: {
                        rotateLabel: true,
                    },

                    itemStyle: {
                        normal: {
                            shadowColor: 'none',
                        },
                    },
                    data: items,
                },
                {
                    name: '',
                    type: 'lines',
                    coordinateSystem: 'cartesian2d',
                    z: 1,
                    effect: {
                        show: true,
                        smooth: false,
                        trailLength: 0,
                        symbol:
                            'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAhCAYAAADtR0oPAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAAB2ElEQVQ4T32USU7DQBBFbcKMAAFigcSSg3ADtmzZc0juwQ6JMA9hCBAG81/Rv9W2HEp6cae7fk1tuW6appLVCWwmPTEOw0H2ww8CHHEaiLmERTh9ic/0bBBwiNOiWE7MCwynsXgVH2KCYFYLnNfFhtgSiMj8Lu4TIzFGQLQ1sS12xZFA8CZuxYk4FVdiRDmwIBDtiH1xIA7FsdgTZF4SA5xJTcNE3RSeio1gq4I+a08DAaWtiBhfMpqmP0T0mgXlaL/ZSMY4icx+3JMFRKUUnozPNhHs+TzuwBtEJiJztzEpAlBaXBwCR0bAIZdkQ2xBBC4FbJLhWdhehAUEzBn4A9SMkw0xe87QKolNDh+FjTUZyEzAXJKzcMA7Y0PgDFNLehC2O9HbQ5mBHnDAeEvLKYUA448z8EozTvZ4W8sessAZEHBZ3AWi8h6ikq6ASGSgrCfRvbj8LiFgk0MEzJ9psfaU8Gm9fGVJRKdhMljQyoCx6ZIYLSN1hmhYtEpik5LIgPNNWpdNt0pik2hEZZyXad1bkpt2D0S/EGUPvSW5Bz4pQ0E5UzN4Sjhdi3Pxb9NEcQbqPxNuGEGYv94Iux9ll1ESH2M9wywyWDj9LWOdM9hKZxsOyamqfgG1ZQ8JFbfSTwAAAABJRU5ErkJggg==',
                        symbolSize: [10, 30],
                        period: 4,
                        delay: 2,
                    },

                    lineStyle: {
                        width: 2,
                        color: 'rgb(255,255,255)',
                        curveness: 0,
                    },
                    data: dataArr,
                },
            ],
        };
        return option;
        // 	}
        // }
    };
    render() {
        const { gxList } = this.props;
        return (
            <Card className={styles.tableListCard}>
                {gxList && gxList.result && gxList.result.list && gxList.result.list.length > 0 ? (
                    <ReactEcharts
                        option={this.getOption()}
                        style={{ height: '600px' }}
                        className="react_for_echarts"
                    />
                ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
            </Card>
        );
    }
}

export default Form.create()(social);
