import React, { Component } from 'react';
import { View, Text, BackHandler, Keyboard, Dimensions, TouchableOpacity, Image, Icon, ScrollView } from 'react-native';
import BackgroundTopView from 'components/backgroundTopView';
import { Container, Root, Header, Content, Form, Item } from 'native-base';
import BaseView from 'containers/base/baseView';
import { Constants } from 'values/constants';
import TextInputCustom from 'components/textInputCustom';
import { localizes } from 'locales/i18n';
import { CalendarScreen } from 'components/calendarScreen';
import ic_calendar_grey from "images/ic_calendar_grey.png";
import ic_account_grey from "images/ic_account_grey.png";
import ic_payment_grey from "images/ic_payment_grey.png";
import ic_place_grey from "images/ic_place_grey.png";
import ic_camera_radio from "images/ic_camera_radio.png";
import ic_send_image from "images/ic_send_image.png";
import DateUtil from 'utils/dateUtil';
import { Colors } from 'values/colors';
import styles from './styles';
import commonStyles from 'styles/commonStyles';
import * as actions from "actions/userActions";
import * as commonActions from "actions/commonActions";
import { connect } from "react-redux";
import { ErrorCode } from "config/errorCode";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import Utils from 'utils/utils';
import StringUtil from 'utils/stringUtil';
import moment, { locales } from 'moment';
import ImageLoader from 'components/imageLoader';
import DialogCustom from 'components/dialogCustom';
import ServerPath from 'config/Server';
import Upload from 'react-native-background-upload';
import FlatListCustom from 'components/flatListCustom';
import ImagePicker from 'react-native-image-crop-picker';
import imageSideType from 'enum/imageSideType';
import userResourceType from 'enum/userResourceType';
import { configConstants } from 'values/configConstants';

const CANCEL_INDEX = 2;
const FILE_SELECTOR = [localizes('camera'), localizes("image"), localizes("cancel")];
const optionsCamera = {
    title: 'Select avatar',
    storageOptions: {
        skipBackup: true,
        path: 'images',
    },
};

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
var WIDTH_IMAGES = width / 2 - (Constants.MARGIN_X_LARGE + Constants.MARGIN_LARGE);
var HEIGHT_IMAGES = WIDTH_IMAGES * 3 / 4;
const FRONT = 0
const BACK = 1

export default class UploadPersonalImages extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            personalImages: ["", ""],
            itemImageBackside: null,
            itemImageFrontside: null,
            enableRefresh: true,
        }
        this.userInfo = null;
        this.indexVehicleImage = 0;
        this.indexVehicleCavetImage = 0;
        this.oneMB = 1048576;
        this.frontSide = null;
        this.backSide = null;
        this.isUpdateImage = true;
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            if (global.bundleId == configConstants.APP_ADMIN) {
                this.isUpdateImage = !this.props.visibleEdit
            }
            if (!Utils.isNull(this.props.userResources) && this.isUpdateImage) {
                this.props.userResources.forEach(item => {
                    if (item.type == userResourceType.PERSONAL_ID) {
                        if (item.imageSide == imageSideType.FRONT_SIDE) {
                            this.frontSide = item.pathToResource
                        } else if (item.imageSide == imageSideType.BACK_SIDE) {
                            this.backSide = item.pathToResource
                        }
                    }
                })
            } else {
                if (!this.props.visibleEdit) {
                    this.state.personalImages = ["", ""];
                    this.frontSide = null;
                    this.backSide = null;
                }
            }
        }
    }

    render() {
        return (
            <View style={{ marginTop: Constants.MARGIN_X_LARGE, backgroundColor: Colors.COLOR_WHITE, paddingBottom: Constants.PADDING_X_LARGE }}>
                <Text style={[commonStyles.text, {
                    marginLeft: Constants.MARGIN_24,
                    marginVertical: Constants.MARGIN_LARGE,
                    color: this.props.visibleEdit ? null : Colors.COLOR_PRIMARY,
                }]}>{this.props.visibleEdit ? localizes("userInfoView.personalIdentificationImages") : localizes("userInfoView.personalIdentificationName")}
                </Text>
                <ScrollView
                    showsHorizontalScrollIndicator={false}
                    horizontal={true}>
                    <TouchableOpacity
                        style={{
                            marginLeft: Constants.MARGIN_X_LARGE,
                            marginRight: Constants.MARGIN_LARGE
                        }}
                        activeOpacity={Constants.ACTIVE_OPACITY}
                        onPress={() => { this.props.visibleEdit && this.onChoosePersonalIdImages(0) }} >
                        <View style={[{
                            width: WIDTH_IMAGES,
                            height: HEIGHT_IMAGES,
                            borderRadius: Constants.CORNER_RADIUS,
                            backgroundColor: Colors.COLOR_WHITE,
                            borderWidth: Constants.BORDER_WIDTH,
                            borderColor: Colors.COLOR_TEXT
                        }]}>
                            {!Utils.isNull(this.frontSide)
                                ? <ImageLoader
                                    style={[{
                                        borderRadius: Constants.CORNER_RADIUS,
                                        width: '100%', height: '100%',
                                    }]}
                                    resizeModeType={"cover"}
                                    path={this.props.resourceUrlPath + "/" + global.companyIdAlias + "/" + this.frontSide}
                                />
                                : !Utils.isNull(this.state.personalImages[0])
                                    ? <Image source={{ uri: this.state.personalImages[0].image }}
                                        style={[{
                                            borderRadius: Constants.CORNER_RADIUS,
                                            width: '100%', height: '100%',
                                        }]}
                                        resizeMode={"cover"} />
                                    :
                                    <View style={[commonStyles.viewHorizontal, commonStyles.viewCenter]} >
                                        <Image source={ic_send_image} />
                                        <Text style={[commonStyles.text, {
                                            color: Colors.COLOR_PLACEHOLDER_TEXT_DISABLE
                                        }]} >Mặt trước</Text>
                                    </View>
                            }
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            marginLeft: Constants.MARGIN_LARGE,
                            marginRight: Constants.MARGIN_X_LARGE
                        }}
                        activeOpacity={Constants.ACTIVE_OPACITY}
                        onPress={() => { this.props.visibleEdit && this.onChoosePersonalIdImages(1) }} >
                        <View style={[{
                            width: WIDTH_IMAGES,
                            height: HEIGHT_IMAGES,
                            borderRadius: Constants.CORNER_RADIUS,
                            backgroundColor: Colors.COLOR_WHITE,
                            borderWidth: Constants.BORDER_WIDTH,
                            borderColor: Colors.COLOR_TEXT
                        }]}>
                            {!Utils.isNull(this.backSide)
                                ? <ImageLoader
                                    style={[{
                                        borderRadius: Constants.CORNER_RADIUS,
                                        width: '100%', height: '100%',
                                    }]}
                                    resizeModeType={"cover"}
                                    path={this.props.resourceUrlPath + "/" + global.companyIdAlias + "/" + this.backSide}
                                />
                                : !Utils.isNull(this.state.personalImages[1])
                                    ? <Image source={{ uri: this.state.personalImages[1].image }}
                                        style={[{
                                            borderRadius: Constants.CORNER_RADIUS,
                                            width: '100%', height: '100%',
                                        }]}
                                        resizeMode={"cover"} />
                                    : <View style={[commonStyles.viewHorizontal, commonStyles.viewCenter]} >
                                        <Image source={ic_send_image} />
                                        <Text style={[commonStyles.text, { color: Colors.COLOR_PLACEHOLDER_TEXT_DISABLE }]} >Mặt sau</Text>
                                    </View>
                            }
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }

    /**
     * handler personal ID images
     */
    handlerPersonalImage(personalImages) {
        this.props.getPersonalImage(personalImages)
    }

    /**
     * Choose personal id image
     * @param {*} typeImage 
     * @param {*} index 
     */
    onChoosePersonalIdImages = (index) => {
        ImagePicker.openPicker({
            width: WIDTH_IMAGES,
            height: 600,
            multiple: false,
            waitAnimationEnd: false,
            includeExif: true,
            compressImageQuality: 0.8
        }).then((images) => {
            console.log("images: ", images)
            let count = 0
            let maxSizeUpload = this.props.maxFileSizeUpload
            let state = this.state;
            if (index == 0) {
                if (images.size / this.oneMB > maxSizeUpload) {
                    count++
                } else {
                    state.personalImages[0] = { image: images.path, imageSide: imageSideType.FRONT_SIDE };
                    this.frontSide = null;
                    this.isUpdateImage = false;
                    this.props.getPersonalImage(state.personalImages);
                }
            } else {
                if (images.size / this.oneMB > maxSizeUpload) {
                    count++
                } else {
                    state.personalImages[1] = { image: images.path, imageSide: imageSideType.BACK_SIDE };
                    this.backSide = null;
                    this.isUpdateImage = false;
                    this.props.getPersonalImage(state.personalImages);
                }
            }
            this.setState(state);
            if (count > 0) {
                this.showMessage("Có " + count + " ảnh lớn hơn " + maxSizeUpload + " MB")
            }
            count = 0
        }).catch(e => console.log(e));
    }
}
