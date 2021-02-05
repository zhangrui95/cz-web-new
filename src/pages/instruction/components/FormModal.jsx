import React, { Component } from 'react';
import {
    Form,
    Input,
    Modal,
    TreeSelect,
    Select,
    Message,
    DatePicker,
    Row,
    Col,
    Radio,
    Upload,
    Icon,
    Carousel,
    Button,
    Spin,
} from 'antd';
import moment from 'moment';
import { connect } from 'dva';
const FormItem = Form.Item;
const { Option } = Select;
const { TreeNode } = TreeSelect;
const { TextArea } = Input;
import BannerAnim, { Element } from 'rc-banner-anim';
import 'rc-banner-anim/assets/index.css';
import 'moment/locale/zh-cn';
import styles from '../style.less';
import { cardList, tableList } from '@/utils/utils';
const BgElement = Element.BgElement;
const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
    },
};
const formLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
    },
};
const TreeSelectProps = {
    showSearch: true,
    allowClear: false,
    autoExpandParent: false,
    treeDefaultExpandAll: true,
    searchPlaceholder: '请输入',
    treeNodeFilterProp: 'title',
    dropdownStyle: { maxHeight: 400, overflow: 'auto' },
    style: {
        width: 330,
    },
};
const list = [];
let arr = [];

@connect(({ instruction, loading, captureList }) => ({
    instruction,
    captureList,
    loadings:
        loading.effects['instruction/uploadImg'] ||
        loading.effects['instruction/insertPoliceNotice'],
}))
class FormModal extends Component {
    constructor(props) {
        super(props);
        console.log('props==================>', props);
        this.state = {
            expandedKeys: [], //所有菜单信息集合
            searchValue: '',
            previewVisible: false,
            previewImage: '',
            videoVisible: false,
            fileList: props.renderVale || [], //图片附件
            videoList: props.videoVale || [], //视频附件
            images: [],
            videoImage: '',
            confirmLoadings: false,
            showHelp: false,
            previewNum: 0,
            loadSpin: false,
            audioVisible: false,
            audioList: props.audioVale || [], //音频附件
            audioImage: '',
            uploading: false,
            choiceList: [],
            base64img: [],
        };
    }

    componentWillMount() {}
    componentDidMount() {
        //   console.log(this.props.renderVale)
        this.props.dispatch({
            type: 'instruction/getVehicleList',
            payload: { vehicle_organization_code: '', vehicle_flag: '1' },
            success: e => {
                this.props.dispatch({
                    type: 'instruction/getVehicleList',
                    payload: { vehicle_organization_code: '', vehicle_flag: '2' },
                });
            },
        });
        this.props.dispatch({
            type: 'captureList/fetchPortraitCaptureList',
            payload: {
                currentPage: 5,
                showCount: 10,
                pd: {},
            },
            callback: res => {
                console.log('res人员=============>', res.result.list);
                let choiceList = [];
                res.result.list.map(item => {
                    choiceList.push(item.portrait_img);
                });
                this.setState({
                    choiceList,
                });
            },
        });
    }
    componentWillUnmount() {}
    //组织机构树搜索
    onSearch = value => {
        const expandedKeys = dataList
            .map(item => {
                // console.log(item.name.indexOf(value))
                if (item.name.indexOf(value) > -1) {
                    return getParentKey(item.name, this.props.policeUnitData);
                }
                return null;
            })
            .filter((item, i, self) => item && self.indexOf(item) === i);
        this.setState({
            expandedKeys,
            searchValue: value,
        });
    };

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
    //确定按钮
    okHandle = () => {
        const { form, dispatch, handleSubmit, values, loading } = this.props;

        form.validateFields((err, fieldsValue) => {
            if (err) return;
            console.log(fieldsValue);
            this.setState({ loadSpin: true });
            this.okUpload();
        });
    };
    //视频上传
    videoUpload = imgs => {
        const { form, dispatch, handleSubmit, values, loading } = this.props;
        const { fileList, videoList } = this.state;
        let videos = [];
        var _self = this;
        console.log('有视频----', videoList);
        this.setState({ confirmLoadings: true });
        if (videoList.length) {
            console.log('有视频', videoList.length, videos.length);
            for (let index = 0; index < videoList.length; index++) {
                console.log(videoList[index]);
                console.log('===', videoList.length, videos.length);
                //通过url判断是否 调用视频上传接口
                if (!videoList[index].url) {
                    let formData = new FormData();
                    formData.append('file', videoList[index]);

                    const token = sessionStorage.getItem('userToken') || '';
                    fetch(`${configUrl.serverUrl}${'/notice/uploadVideo'}`, {
                        method: 'post',
                        body: formData,
                        headers: {
                            Authorization: token,
                        },
                    })
                        .then(function(res) {
                            return res.json();
                        })
                        .then(function(json) {
                            if (json.reason == null) {
                                videos.push({
                                    path: json.result.video.path,
                                    imgPath: json.result.video.imgPath,
                                });
                                if (videos.length == videoList.length) {
                                    _self.audioUpload(imgs, videos);
                                } else {
                                }
                            } else {
                                Message.error('视频上传失败');
                                _self.setState({ loadSpin: false });
                                return false;
                            }
                        });
                } else {
                    videos.push({
                        path: videoList[index].url,
                        imgPath: videoList[index].imgPath,
                    });
                    if (videos.length == videoList.length) {
                        _self.audioUpload(imgs, videos);
                    } else {
                    }
                }
            }
        } else {
            console.log(videos);
            this.audioUpload(imgs, videos);
        }
    };
    //音频上传
    audioUpload = (imgs, videos) => {
        const { form, dispatch, handleSubmit, values, loading } = this.props;
        const { fileList, audioList } = this.state;
        let audios = [];
        var _self = this;
        this.setState({ confirmLoadings: true });
        if (audioList.length) {
            console.log('有视频', audioList.length, audios.length);
            for (let index = 0; index < audioList.length; index++) {
                //通过url判断是否 调用音频上传接口
                if (!audioList[index].url) {
                    let formData = new FormData();
                    formData.append('file', audioList[index]);
                    const token = sessionStorage.getItem('userToken') || '';
                    fetch(`${configUrl.serverUrl}${'/notice/uploadAudio'}`, {
                        method: 'post',
                        body: formData,
                        headers: {
                            Authorization: token,
                        },
                    })
                        .then(function(res) {
                            return res.json();
                        })
                        .then(function(json) {
                            console.log(json);
                            if (json.reason == null) {
                                audios.push({
                                    path: json.result.audio.path,
                                    playTime: json.result.audio.playTime,
                                });
                                console.log(audios);
                                if (audios.length == audioList.length) {
                                    _self.okHandleForm(imgs, videos, audios);
                                } else {
                                }
                            } else {
                                Message.error('音频上传失败');
                                _self.setState({ loadSpin: false });
                                return false;
                            }
                        });
                } else {
                    audios.push({
                        path: audioList[index].url,
                        playTime: audioList[index].playTime,
                    });
                    if (audios.length == audioList.length) {
                        _self.okHandleForm(imgs, videos, audios);
                        // this.okHandleForm(audios)
                    } else {
                    }
                }
            }
        } else {
            console.log(audios);
            this.okHandleForm(imgs, videos, audios);
        }
    };
    getImg = (img, idx) => {
        let file = this.state.fileList;
        // let choiceList = this.state.choiceList;
        file.push({
            uid: 1,
            name: 'image.png',
            status: 'done',
            url: img,
        });
        let { base64img } = this.state;
        base64img.push(img);
        this.setState({
            fileList: file,
            base64img,
        });
    };
    //图片上传
    okUpload = async () => {
        const { form, dispatch, handleSubmit, values, loading } = this.props;
        const { fileList, videoList } = this.state;
        let base64img = [];
        let imgs = [];
        this.setState({ confirmLoadings: true });
        if (fileList.length) {
            console.log('有图片', fileList.length, imgs.length);
            for (let index = 0; index < fileList.length; index++) {
                console.log(fileList[index]);
                console.log('===', fileList.length, imgs.length);
                //通过url判断是否 调用图片上传接口
                if (!fileList[index].url) {
                    fileList[index].preview = await this.getBase64(fileList[index].originFileObj);
                    base64img.push(fileList[index].preview);
                    this.setState({
                        base64img,
                    });
                    //获取转换图片的url
                    console.log('jinlaile', fileList[index]);
                    dispatch({
                        type: 'instruction/uploadImg',
                        payload: {
                            base64String: fileList[index].preview.split(',')[1],
                        },
                        success: data => {
                            // this.setState({ imgUrl: data });
                            imgs.push(data);

                            if (imgs.length == fileList.length) {
                                // this.okHandleForm(imgs)
                                this.videoUpload(imgs);
                            } else {
                            }
                        },
                        filu: () => {
                            this.setState({ loadSpin: false });
                        },
                    });
                } else {
                    imgs.push(fileList[index].url);
                    if (imgs.length == fileList.length) {
                        // this.okHandleForm(imgs)
                        this.videoUpload(imgs);
                    } else {
                    }
                }
            }
        } else {
            console.log(imgs);
            this.videoUpload(imgs);
        }
    };
    //所有内容提交
    okHandleForm = (imgs, videos, audios) => {
        console.log('okHandleForm');
        const {
            instruction: { vehicleCode },
            form,
            dispatch,
            handleSubmit,
            values,
            isCar,
        } = this.props;
        let arr = [],
            payload = {};
        form.validateFields((err, fieldsValue) => {
            if (err) return;

            console.log('fieldsValue', fieldsValue, imgs, videos, audios);
            const formData = {
                attachment: imgs,
                video_message: videos,
                audio_message: audios,
                bt: fieldsValue.bt,
                fbdwbm: JSON.parse(sessionStorage.getItem('user')).department,
                fbdwmc: fieldsValue.fbdwmc,
                fbrbm: JSON.parse(sessionStorage.getItem('user')).pcard,
                fbrxm: fieldsValue.fbrxm,
                fsdwbm: fieldsValue.fsdwbm,
                fsdwdj: list.find(v => v.code == fieldsValue.fsdwbm).depth.toString(),
                fsdwmc: list.find(v => v.code == fieldsValue.fsdwbm).name,
                fsjcs: fieldsValue.fsjcs,
                fslx: '1',
                nr: fieldsValue.nr,
            };
            if (isCar) {
                if (fieldsValue.fsjcs && fieldsValue.fsjcs.length) {
                    for (let index = 0; index < fieldsValue.fsjcs.length; index++) {
                        const element = fieldsValue.fsjcs[index];
                        const carData = vehicleCode.find(v => v.vehicle_id == element);
                        if (carData) {
                            arr.push({
                                vehicle_id: carData.vehicle_id,
                                pad_cid: carData.pad_cid,
                            });
                        }
                    }
                }
                payload = {
                    ...formData,
                    fsjc_message: arr,
                    base64img: this.state.base64img,
                };
            } else {
                payload = {
                    ...formData,
                    fsjc_message: arr,
                    base64img: this.state.base64img,
                };
            }
            console.log('提交', payload);
            dispatch({
                type: 'instruction/insertPoliceNotice',
                payload: payload,
                success: e => {
                    console.log(e);
                    this.setState({ confirmLoadings: false });

                    if (e.result.reason.code == '200') {
                        handleSubmit(false);
                        Message.success('操作成功');
                        form.resetFields();
                        this.setState({
                            isCar: false,
                            previewImage: '',
                            fileList: [],
                            images: [],
                            base64img:[],
                            showHelp: false,
                            audioList: [],
                            videoList: [],
                            loadSpin: false,
                        });
                    } else {
                        Message.error('操作失败');
                        this.setState({ loadSpin: false });
                        return false;
                    }
                },
            });
        });
    };
    //整理组织机构数数据内容
    loopUse = params => {
        for (var i = 0; i < params.length; i++) {
            list.push({
                name: params[i].name,
                code: params[i].code,
                depth: params[i].depth,
            });
            if (params[i].childrenList) {
                this.loopUse(params[i].childrenList);
            }
        }
    };
    //点击取消按钮
    handleModalVisible = () => {
        const { handleModalVisible } = this.props;
        this.setState({
            isCar: false,
            previewImage: '',
            base64img:[],
            fileList: [],
            images: [],
            audioList: [],
            videoList: [],
            showHelp: false,
        });
        handleModalVisible();
    };
    //发送对象 改变时
    choose = value => {
        const { chooseCode } = this.props;
        chooseCode(value);
        this.setState({ showHelp: true, value });
        this.props.form.setFieldsValue({ fsjcs: [] });
    };
    //文件上传组件方法
    getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
    //图片附件回显弹窗关闭
    previewCancel = () => {
        // console.log(this)
        this.setState({ previewVisible: false });
    };
    //视频附件回显弹窗关闭
    videoCancel = () => {
        // console.log(this)
        this.setState({ videoVisible: false, videoImage: '' });
    };
    //音频附件回显弹窗关闭
    audioCancel = () => {
        // console.log(this)
        this.setState({ audioVisible: false, audioImage: '' });
    };
    //点击文件链接或预览图标时的回调  图片附件
    handlePreview = async file => {
        const { fileList } = this.state;
        let num = 0;
        console.log('----', file, fileList, num);
        if (!file.url && !file.preview) {
            console.log('jinsi');
            //调用文件上传组件方法
            file.preview = await this.getBase64(file.originFileObj);
        }
        for (let index = 0; index < fileList.length; index++) {
            const element = fileList[index];
            const newList = {
                ...element,
                index: index,
            };
            if (file.url) {
                if (file.url == newList.url) {
                    // console.log(newList.index)
                    num = newList.index;
                }
            } else {
                if (file.preview == newList.preview) {
                    // console.log(newList.index)
                    num = newList.index;
                }
            }
        }
        // console.log('----', file, fileList,num)
        this.setState({
            previewImage: file.url || file.preview,
            previewVisible: true,
            previewNum: num,
        });
    };
    //点击文件链接或预览图标时的回调  视频附件
    videoPreview = async file => {
        const { videoList } = this.state;
        let num = 0;
        console.log('----', file, videoList, num);
        /*
         *  静态方法会创建一个 DOMString，其中包含一个表示参数中给出的对象的URL。
         *  这个 URL 的生命周期和创建它的窗口中的 document 绑定。
         *  这个新的URL 对象表示指定的 File 对象或 Blob 对象。
         */
        this.setState(
            {
                videoImage: file.url || window.URL.createObjectURL(file.originFileObj),
                videoVisible: true,
            },
            () => {
                // console.log(this)
                if (this.refs.video) {
                    //去除视频右下角三个点  即画中画
                    this.refs.video.disablePictureInPicture = true;
                }
            },
        );
    };
    //点击文件链接或预览图标时的回调 音频附件
    audioPreview = async file => {
        const { audioList } = this.state;
        let num = 0;
        // console.log('----', file, audioList,num)
        /*
         *  静态方法会创建一个 DOMString，其中包含一个表示参数中给出的对象的URL。
         *  这个 URL 的生命周期和创建它的窗口中的 document 绑定。
         *  这个新的URL 对象表示指定的 File 对象或 Blob 对象。
         */
        this.setState({
            audioImage: file.url || window.URL.createObjectURL(file.originFileObj),
            audioVisible: true,
        });
    };

    render() {
        // console.log(this.props)
        const {
            values,
            modalVisible,
            loadings,
            handleModalVisible,
            form,
            policeUnitData,
            instruction: { vehicleCode },
            isCar,
        } = this.props;
        const {
            previewVisible,
            previewImage,
            fileList,
            showHelp,
            previewNum,
            videoList,
            videoVisible,
            videoImage,
            audioList,
            audioVisible,
            audioImage,
        } = this.state;
        //upload 组件展示文件列表
        const showIcon = {
            showRemoveIcon: true,
            showPreviewIcon: true,
            showDownloadIcon: false,
        };
        const videoIcon = {
            showRemoveIcon: true,
            showPreviewIcon: false,
            showDownloadIcon: false,
        };
        //上传图片 按钮
        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text">上传图片</div>
            </div>
        );
        //上传视频 按钮
        const videoButton = (
            <Button type="primary" style={{ background: '#3470F4', borderColor: '#3470F4' }}>
                <Icon type="plus" />
                上传视频
            </Button>
        );
        //上传音频 按钮
        const audioButton = (
            <Button type="primary" style={{ background: '#3470F4', borderColor: '#3470F4' }}>
                <Icon type="plus" />
                上传音频
            </Button>
        );
        //整理组织机构树 数据结构
        this.loopUse(policeUnitData);
        const { getFieldDecorator } = form;
        const videoProps = {
            onRemove: file => {
                this.setState(state => {
                    console.log(state);
                    const index = state.videoList.indexOf(file);
                    const newFileList = state.videoList.slice();
                    newFileList.splice(index, 1);
                    return {
                        videoList: newFileList,
                    };
                });
            },
            beforeUpload: file => {
                console.log(file);
                if (
                    file.type !== 'video/mp4' &&
                    file.type !== 'video/MP4' &&
                    file.type !== 'video/mov' &&
                    file.type !== 'video/MOV' &&
                    file.type !== 'video/quicktime'
                ) {
                    Message.error('请上传.mp4 .MP4 .mov .MOV的文件!');
                    return false;
                } else if (file.size / 1024 / 1024 > 30) {
                    // 判断图片的大小
                    Message.error('文件上传不能超过30M');
                    return false;
                } else {
                    console.log('zou');
                    this.setState(state => ({
                        videoList: [...state.videoList, file],
                    }));
                    return false;
                }
            },
            fileList: videoList,
            defaultFileList: videoList,
            accept: 'video/*',
            showUploadList: videoIcon,
            onPreview: this.videoPreview,
            // onChange: this.videoChange
        };

        const imageProps = {
            onRemove: file => {
                this.setState(state => {
                    console.log(state);
                    const index = state.fileList.indexOf(file);
                    const newFileList = state.fileList.slice();
                    newFileList.splice(index, 1);
                    return {
                        fileList: newFileList,
                    };
                });
            },
            beforeUpload: file => {
                console.log(file);
                if (
                    file.type !== 'image/png' &&
                    file.type !== 'image/jpg' &&
                    file.type !== 'image/jpeg'
                ) {
                    Message.error('请上传.jpg .png .jpeg的文件!');
                    return false;
                } else if (file.size / 1024 / 1024 > 10) {
                    // 判断图片的大小
                    Message.error('文件上传不能超过10M');
                    return false;
                } else {
                    this.setState(state => ({
                        fileList: [...state.fileList, { ...file, originFileObj: file }],
                    }));
                    return false;
                }
            },
            fileList: fileList,
            accept: 'image/*',
            onPreview: this.handlePreview,
            listType: 'picture-card',
            showUploadList: showIcon,
            // onChange: this.handleChange
        };
        const audioProps = {
            onRemove: file => {
                this.setState(state => {
                    console.log(state);
                    const index = state.audioList.indexOf(file);
                    const newFileList = state.audioList.slice();
                    newFileList.splice(index, 1);
                    return {
                        audioList: newFileList,
                    };
                });
            },
            beforeUpload: file => {
                if (
                    file.type !== 'audio/mp3' &&
                    file.type !== 'audio/MP3' &&
                    file.type !== 'audio/ogg' &&
                    file.type !== 'audio/mpeg'
                ) {
                    Message.error('请上传.mp3 .MP3 .ogg的文件!');
                    return false;
                } else if (file.size / 1024 / 1024 > 10) {
                    // 判断图片的大小
                    Message.error('文件上传不能超过10M');
                    return false;
                } else {
                    this.setState(state => ({
                        audioList: [...state.audioList, file],
                    }));
                    return false;
                }
            },
            fileList: audioList,
            defaultFileList: audioList,
            accept: 'audio/*',
            showUploadList: videoIcon,
            onPreview: this.audioPreview,
            // onChange: this.videoChange
        };
        //图片附件回显内容
        const photoes =
            fileList && fileList.length > 0
                ? fileList.map((item, itemIndex) => (
                      <Element key={itemIndex}>
                          <BgElement
                              key="bg"
                              className="bg"
                              style={{
                                  height: '100%',
                                  width: '100%',
                                  backgroundImage: `url(${item.url ? item.url : item.thumbUrl})`,
                                  backgroundSize: 'contain',
                                  backgroundPosition: 'center',
                                  backgroundRepeat: 'no-repeat',
                              }}
                          />
                      </Element>
                  ))
                : '';
        console.log('arr?????', arr);
        console.log('fileList?????', fileList);
        return (
            <Modal
                destroyOnClose
                title={'指令通知'}
                visible={modalVisible}
                onOk={this.okHandle}
                onCancel={() => this.handleModalVisible()}
                maskClosable={false}
                width={'1200px'}
                confirmLoading={loadings && this.state.loadSpin}
                maskClosable={false}
                centered={true}
            >
                <Spin spinning={this.state.loadSpin} delay={500} className={styles.spinLosds}>
                    <Row>
                        <Col span={12}>
                            <FormItem {...formItemLayout} label="指令通知标题">
                                {getFieldDecorator('bt', {
                                    rules: [
                                        {
                                            required: true,
                                            message: '必需输入指令通知标题',
                                        },
                                    ],
                                    initialValue: values ? values.bt : '',
                                })(
                                    <Input
                                        placeholder="请输入指令通知标题"
                                        style={{ width: '330px' }}
                                        maxLength="50"
                                    />,
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...formItemLayout} label="指令通知内容">
                                {getFieldDecorator('nr', {
                                    rules: [
                                        {
                                            required: true,
                                            message: '必需输入指令通知内容',
                                        },
                                    ],
                                    initialValue: values ? values.nr : '',
                                })(
                                    <Input.TextArea
                                        autoSize={{ minRows: 3, maxRows: 5 }}
                                        placeholder="请输入指令通知内容"
                                        style={{ width: '330px' }}
                                        maxLength="500"
                                    />,
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...formItemLayout} label="发送单位">
                                {getFieldDecorator('fsdwbm', {
                                    initialValue: values
                                        ? values.fsdwbm
                                        : JSON.parse(sessionStorage.getItem('user')).department,
                                    rules: [
                                        {
                                            required: true,
                                            message: `必需选择发送单位`,
                                        },
                                    ],
                                })(
                                    <TreeSelect
                                        onChange={value => this.choose(value)}
                                        treeNodeFilterProp="title"
                                        treeDefaultExpandAll
                                        {...TreeSelectProps}
                                        placeholder="请选择"
                                        // searchPlaceholder
                                    >
                                        {this.renderloop(policeUnitData)}
                                    </TreeSelect>,
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            {isCar && vehicleCode.length ? (
                                <FormItem {...formItemLayout} label="设备类型">
                                    {getFieldDecorator('vehicle_flag', {
                                        initialValue: '2',
                                    })(
                                        <Select
                                            optionFilterProp="children"
                                            optionLabelProp="children"
                                            // {...TreeSelectProps}
                                            placeholder="请选择"
                                            style={{ width: '330px' }}
                                            onChange={e =>
                                                this.props.chooseCode(this.state.value, e)
                                            }
                                        >
                                            <Option value={'1'} key={'1'}>
                                                车辆
                                            </Option>
                                            <Option value={'2'} key={'2'}>
                                                警务通
                                            </Option>
                                        </Select>,
                                    )}
                                </FormItem>
                            ) : null}
                        </Col>
                        <Col span={12}>
                            {isCar && vehicleCode.length ? (
                                <FormItem {...formItemLayout} label="发送设备">
                                    {getFieldDecorator('fsjcs', {
                                        initialValue: values ? values.fsjcs : [],
                                    })(
                                        <Select
                                            mode="multiple"
                                            optionFilterProp="children"
                                            optionLabelProp="children"
                                            // {...TreeSelectProps}
                                            placeholder="请选择"
                                            style={{ width: '330px' }}
                                        >
                                            {vehicleCode &&
                                                vehicleCode.map((v, k) => (
                                                    <Option value={v.vehicle_id} key={v.vehicle_id}>
                                                        {v.carNo}
                                                    </Option>
                                                ))}
                                        </Select>,
                                    )}
                                </FormItem>
                            ) : null}
                        </Col>
                        <Col span={12}>
                            {isCar && vehicleCode.length ? (
                                <FormItem {...formItemLayout} label="">
                                    <div className={styles.sicon}>
                                        <span className={styles.prompts}>
                                            若未选择设备则默认发送所有设备
                                        </span>
                                    </div>
                                </FormItem>
                            ) : null}
                        </Col>
                        <Col span={12}>
                            <FormItem {...formItemLayout} label="发布人">
                                {getFieldDecorator('fbrxm', {
                                    initialValue: values
                                        ? values.fbrxm
                                        : JSON.parse(sessionStorage.getItem('user')).name,
                                })(
                                    <Input
                                        placeholder="请输入发布人"
                                        style={{ width: '330px' }}
                                        maxLength="50"
                                        disabled={true}
                                    />,
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...formItemLayout} label="发布单位">
                                {getFieldDecorator('fbdwmc', {
                                    initialValue: values
                                        ? values.fbdwmc
                                        : JSON.parse(sessionStorage.getItem('user')).group &&
                                          JSON.parse(sessionStorage.getItem('user')).group.name,
                                })(
                                    <Input
                                        placeholder="请输入发布单位"
                                        style={{ width: '330px' }}
                                        maxLength="50"
                                        disabled={true}
                                    />,
                                )}
                            </FormItem>
                        </Col>
                        <Col span={24}>
                            <FormItem {...formLayout} label="图片附件">
                                {getFieldDecorator('fileList', {
                                    initialValue: values ? arr : [],
                                })(
                                    <div className="clearfix">
                                        <span className={styles.prompts}>
                                            上传png、jpg、jpeg格式的文件，最多上传10张，不能超过10M
                                        </span>
                                        <Upload
                                            // accept=""
                                            // accept=".png, .jpg, .jpeg"
                                            // listType="picture-card"
                                            // showUploadList={showIcon}
                                            // fileList={fileList}
                                            // onPreview={this.handlePreview}
                                            // onChange={this.handleChange}
                                            {...imageProps}
                                        >
                                            {fileList.length >= 10 ? null : uploadButton}
                                        </Upload>
                                        <div>
                                            {this.state.choiceList.map((item, index) => {
                                                return (
                                                    <img
                                                        src={item}
                                                        className={styles.choiceImg}
                                                        onClick={() => this.getImg(item, index)}
                                                    />
                                                );
                                            })}
                                        </div>
                                        <Modal
                                            visible={previewVisible}
                                            onCancel={() => this.previewCancel()}
                                            maskClosable={false}
                                            centered={true}
                                            footer={null}
                                        >
                                            <div style={{ padding: '20px 0', height: 400 }}>
                                                {previewVisible ? (
                                                    <BannerAnim
                                                        type="across"
                                                        style={{
                                                            height: '100%',
                                                            width: '100%',
                                                            margin: '0 auto',
                                                        }}
                                                        initShow={previewNum || 0}
                                                    >
                                                        {photoes}
                                                    </BannerAnim>
                                                ) : (
                                                    ''
                                                )}
                                            </div>
                                        </Modal>
                                    </div>,
                                )}
                            </FormItem>
                        </Col>
                    </Row>

                    {/* <FormItem {...formItemLayout} label="发送对象">
					{getFieldDecorator('fslx', {
						rules: [
							{
								required: true,
								message: '必需选择'
							}
						],
						initialValue: values ? values.fslx : ''
					})(
						<Radio.Group>
							<Radio value={'1'}>单位</Radio>
						</Radio.Group>
					)}
				</FormItem> */}

                    {/*<FormItem {...formItemLayout} label="视频附件">*/}
                    {/*    {getFieldDecorator(*/}
                    {/*        'videoList',*/}
                    {/*        {},*/}
                    {/*    )(*/}
                    {/*        <div>*/}
                    {/*            <span className={styles.prompts}>*/}
                    {/*                上传mp4、mov格式的文件，最多上传3个，不能超过30M*/}
                    {/*            </span>*/}

                    {/*            <Upload*/}
                    {/*                // action={`${configUrl.serverUrl}${'/notice/uploadVideo'}`}*/}
                    {/*                // name="file"*/}
                    {/*                // accept=".mp4, .mov, .MP4, .MOV"*/}
                    {/*                // // listType="picture-card"*/}
                    {/*                // fileList={videoList}*/}
                    {/*                // onChange={this.videoChange}*/}
                    {/*                // onPreview={this.videoPreview}*/}
                    {/*                // showUploadList={videoIcon}*/}
                    {/*                // beforeUpload={this.beforeVideoFun}*/}
                    {/*                // onRemove={this.videoRemove}*/}
                    {/*                // customRequest={(file) => {*/}
                    {/*                //     console.log(file)*/}
                    {/*                //     this.setState({file})*/}
                    {/*                // }}*/}
                    {/*                {...videoProps}*/}
                    {/*            >*/}
                    {/*                {videoList.length >= 3 ? null : videoButton}*/}
                    {/*            </Upload>*/}
                    {/*            <Modal*/}
                    {/*                visible={videoVisible}*/}
                    {/*                onCancel={() => this.videoCancel()}*/}
                    {/*                maskClosable={false}*/}
                    {/*                centered={true}*/}
                    {/*                footer={null}*/}
                    {/*                // {...videoProps}*/}
                    {/*            >*/}
                    {/*                <div*/}
                    {/*                    style={{*/}
                    {/*                        padding: '20px 0',*/}
                    {/*                        height: 430,*/}
                    {/*                        textAlign: 'center',*/}
                    {/*                    }}*/}
                    {/*                >*/}
                    {/*                    <video*/}
                    {/*                        height={400}*/}
                    {/*                        width={472}*/}
                    {/*                        ref="video"*/}
                    {/*                        controls="controls"*/}
                    {/*                        src={videoImage}*/}
                    {/*                        preload="auto"*/}
                    {/*                        controlslist="nodownload noremoteplayback"*/}
                    {/*                    />*/}
                    {/*                </div>*/}
                    {/*            </Modal>*/}
                    {/*        </div>,*/}
                    {/*    )}*/}
                    {/*</FormItem>*/}
                    {/*<FormItem {...formItemLayout} label="音频附件">*/}
                    {/*    {getFieldDecorator(*/}
                    {/*        'audioList',*/}
                    {/*        {},*/}
                    {/*    )(*/}
                    {/*        <div>*/}
                    {/*            <span className={styles.prompts}>*/}
                    {/*                上传mp3、ogg格式的文件，最多上传3个，不能超过10M*/}
                    {/*            </span>*/}

                    {/*            <Upload*/}
                    {/*                // name="file"*/}
                    {/*                // accept=".mp3, .ogg, .MP3"*/}
                    {/*                // // listType="picture-card"*/}
                    {/*                // fileList={audioList}*/}
                    {/*                // beforeUpload={this.beforeAudioFun}*/}
                    {/*                // onChange={this.audioChange}*/}
                    {/*                // onPreview={this.audioPreview}*/}
                    {/*                // showUploadList={videoIcon}*/}
                    {/*                {...audioProps}*/}
                    {/*            >*/}
                    {/*                {audioList.length >= 3 ? null : audioButton}*/}
                    {/*            </Upload>*/}
                    {/*            <Modal*/}
                    {/*                visible={audioVisible}*/}
                    {/*                onCancel={() => this.audioCancel()}*/}
                    {/*                maskClosable={false}*/}
                    {/*                centered={true}*/}
                    {/*                footer={null}*/}
                    {/*            >*/}
                    {/*                <div*/}
                    {/*                    style={{*/}
                    {/*                        padding: '20px 0',*/}
                    {/*                        height: 90,*/}
                    {/*                        textAlign: 'center',*/}
                    {/*                    }}*/}
                    {/*                >*/}
                    {/*                    <audio*/}
                    {/*                        ref="audio"*/}
                    {/*                        controls="controls"*/}
                    {/*                        src={audioImage}*/}
                    {/*                        preload="auto"*/}
                    {/*                    />*/}
                    {/*                </div>*/}
                    {/*            </Modal>*/}
                    {/*        </div>,*/}
                    {/*    )}*/}
                    {/*</FormItem>*/}
                </Spin>
            </Modal>
        );
    }
}

export default Form.create()(FormModal);
