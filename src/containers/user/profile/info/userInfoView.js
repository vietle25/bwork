import React, { Component } from "react";
import {
    View,
    Text,
    BackHandler,
    Keyboard,
    Dimensions,
    TouchableOpacity,
    Image,
    Icon,
    Platform,
    RefreshControl,
    Alert
} from "react-native";
import BackgroundTopView from "components/backgroundTopView";
import {
    Container,
    Root,
    Header,
    Content,
    Form,
    Item
} from "native-base";
import BaseView from "containers/base/baseView";
import shadow_black_44 from "images/shadow_black_44.png";
import { Constants } from "values/constants";
import TextInputCustom from "components/textInputCustom";
import { localizes } from "locales/i18n";
import { CalendarScreen } from "components/calendarScreen";
import ic_calendar_grey from "images/ic_calendar_grey.png";
import ic_account_grey from "images/ic_account_grey.png";
import ic_payment_grey from "images/ic_payment_grey.png";
import ic_place_grey from "images/ic_place_grey.png";
import ic_camera_radio from "images/ic_camera_radio.png";
import ic_phone_number_grey from "images/ic_phone_number_grey.png";
import ic_gender_grey from "images/ic_gender_grey.png";
import ic_gmail_grey from "images/ic_gmail_grey.png";
import DateUtil from "utils/dateUtil";
import { Colors } from "values/colors";
import styles from "./styles";
import commonStyles from "styles/commonStyles";
import * as actions from "actions/userActions";
import * as faceActions from "actions/faceActions";
import * as commonActions from "actions/commonActions";
import { connect } from "react-redux";
import { ErrorCode } from "config/errorCode";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import Utils from "utils/utils";
import StringUtil from "utils/stringUtil";
import moment, { locales } from "moment";
import ImageLoader from "components/imageLoader";
import DialogCustom from "components/dialogCustom";
import ImagePicker from "react-native-image-picker";
import ServerPath from "config/Server";
import Upload from "react-native-background-upload";
import FlatListCustom from "components/flatListCustom";
import UploadPersonalImages from "./uploadPersonalImages";
import { getTimekeepingHistorySuccess } from "actions/timekeepingActions";
import screenType from "enum/screenType";
import ImageResizer from 'react-native-image-resizer';
import { TextInputMask } from 'react-native-masked-text';
import StorageUtil from "utils/storageUtil";
import ic_down_grey from 'images/ic_down_grey.png';
import genderType from "enum/genderType";
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger
} from "react-native-popup-menu";
import { configConstants } from "values/configConstants";
import ic_menu_vertical from "images/ic_menu_vertical.png";
import statusType from "enum/statusType";
import firebase from 'react-native-firebase';
import CompanyType from "enum/companyType";

const FILE_SELECTOR = [
    localizes("camera"),
    localizes("image"),
    localizes("cancel")
];

const optionsCamera = {
    title: "Select avatar",
    storageOptions: {
        skipBackup: true,
        path: "images"
    }
};

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;
const HEIGHT_IMAGES = width * 0.4;

const PERSON_GROUP_ID = configConstants.PERSON_GROUP_ID;

class UserInfoView extends BaseView {
    constructor(props) {
        super(props);
        const { userInfo, callBack, screen } = this.props.navigation.state.params;
        this.state = {
            enableRefresh: false,
            refreshing: true,
            isAlertSuccess: false,
            visibleDialog: false,
            isInvalidEmail: false,
            isEditPhoneNumber: false,
            isInvalidName: false,
            phone: userInfo.phone,
            fullName: userInfo.name,
            dayOfBirth: "",
            address: userInfo.address,
            email: userInfo.email,
            gender: {
                id: null,
                name: null
            },
            personalId: userInfo.personalId,
            avatarPath: userInfo.avatarPath,
            personalImages: [],
            domicile: userInfo.domicile,
            visibleEdit: screen == screenType.FROM_STAFF_DEPARTMENT ? false : true,
            isLoading: false
        };
        this.today = DateUtil.now();
        this.callBack = callBack;
        this.userInfo = userInfo;
        this.callbackPersonalImages = this.callbackPersonalImages.bind(this);
        this.indexImage = 0;
        this.userResources = userInfo.userResources;
        this.screen = screen;
        this.validate = this.validate.bind(this);
        this.genders = [
            {
                id: genderType.MALE,
                name: "Nam",
            },
            {
                id: genderType.FEMALE,
                name: "Nữ",
            },
            {
                id: genderType.ORDER,
                name: "Khác",
            }
        ];
        this.hasPersonGroup = false;
    }

    /**
     * Handler back exit app
     */
    handlerBackButton() {
        console.log(this.className, 'back pressed');
        if (this.props.navigation) {
            if (this.screen == screenType.FROM_SPLASH || this.screen == screenType.FROM_LOGIN) {
                BackHandler.exitApp();
            } else {
                this.onBack();
            }
        } else {
            return false
        }
        return true
    }

    getNameGender = (genderId) => {
        if (genderId == genderType.MALE) {
            return "Nam"
        } else if (genderId == genderType.FEMALE) {
            return "Nữ"
        } else {
            return "Khác"
        }
    }

    /**
     * Show calendar date
     */
    showCalendarDate() {
        this.showCalendar.showDateTimePicker();
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    async componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
        this.getGender(this.userInfo.gender);
        this.getBirthDay(this.userInfo.birthDate);
        this.getSourceUrlPath();
        StorageUtil.retrieveItem(StorageUtil.MOBILE_CONFIG).then((faq) => {
            if (!Utils.isNull(faq)) {
                this.getCheckInRule();
                this.props.getUserProfile(this.userInfo.id);
            } else {
                this.handleRefresh();
            }
        }).catch((error) => {
            //this callback is executed when your Promise is rejected
            console.log('Promise is rejected with error: ' + error);
        });
        this.userInfo.company.type === CompanyType.ADVANCED && this.createGroupFaceRecognize();
    }

    /**
     * Get gender
     */
    getBirthDay = (birthDate) => {
        this.state.dayOfBirth = !Utils.isNull(birthDate)
            ? DateUtil.convertFromFormatToFormat(
                DateUtil.convertFromFormatToFormat(
                    birthDate,
                    DateUtil.FORMAT_DATE_TIME_ZONE,
                    DateUtil.FORMAT_DATE_TIME_ZONE
                ),
                DateUtil.FORMAT_DATE_TIME_ZONE,
                DateUtil.FORMAT_DATE
            )
            : ""
    }

    /**
     * Get gender
     */
    getGender = (gender) => {
        if (!Utils.isNull(gender)) {
            this.state.gender.id = gender;
            this.state.gender.name = this.getNameGender(gender);
        } else {
            this.state.gender.id = genderType.ORDER;
            this.state.gender.name = "Khác";
        }
    }

    /**
     * Handle data
     */
    handleData() {
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.EDIT_PROFILE)) {
                    if (this.state.personalImages.length > 0) {
                        if (!Utils.isNull(this.state.personalImages[0]) || !Utils.isNull(this.state.personalImages[1])) {
                            this.uploadPersonalIdImages();
                        } else {
                            this.setState({
                                isAlertSuccess: true,
                                isLoading: false
                            });
                        }
                    } else {
                        this.setState({
                            isAlertSuccess: true,
                            isLoading: false
                        });
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_USER_INFO)) {
                    let state = this.state;
                    state.refreshing = false;
                    this.userInfo = data;
                    global.companyIdAlias = !Utils.isNull(this.userInfo.company) ? this.userInfo.company.idAlias : "";
                    if (global.bundleId == configConstants.APP_USER) {
                        StorageUtil.storeItem(StorageUtil.USER_PROFILE, data);
                    }
                    if (!Utils.isNull(data)) {
                        state.fullName = data.name;
                        state.phone = data.phone;
                        state.email = data.email;
                        state.address = data.address;
                        this.getBirthDay(data.birthDate);
                        this.getGender(data.gender);
                        state.domicile = data.domicile;
                        state.personalId = data.personalId;
                        this.userResources = data.userResources;
                        state.avatarPath = this.getUserAvatarPath(data.avatarPath);
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_CONFIG)) {
                    this.configList = data;
                    StorageUtil.storeItem(StorageUtil.MOBILE_CONFIG, this.configList);
                    this.getSourceUrlPath();
                    this.getCheckInRule();
                    this.props.getUserProfile(this.userInfo.id);
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener(
            "hardwareBackPress",
            this.handlerBackButton
        );
    }

    //onRefreshing
    handleRefresh = () => {
        this.state.refreshing = true;
        this.handleRequest();
    }

    // Handle request
    handleRequest() {
        let companyId = !Utils.isNull(this.userInfo.company) ? this.userInfo.company.id : null;
        let branchId = !Utils.isNull(this.userInfo.branch) ? this.userInfo.branch.id : null;
        this.props.getConfig({ companyId, branchId });
    }

    renderRightMenu = () => {
        return (
            global.bundleId == configConstants.APP_ADMIN
            && !Utils.isNull(this.userInfo)
            && this.userInfo.status !== statusType.SUSPENDED
            && <View style={{}}>
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    style={{
                        justifyContent: "center",
                        paddingLeft: Constants.PADDING_LARGE,
                        paddingVertical: Constants.PADDING_LARGE
                    }}
                    onPress={() => {
                        this.menuOption.open();
                    }}
                >
                    <Image source={ic_menu_vertical} />
                </TouchableOpacity>
                {this.renderMenuOption()}
            </View>
        )
    }

    /**
     * Render menu option
     */
    renderMenuOption = () => {
        const { visibleEdit } = this.state;
        return (
            <Menu ref={ref => (this.menuOption = ref)}>
                <MenuTrigger text="" />
                <MenuOptions>
                    <MenuOption
                        onSelect={() => {
                            let state = this.state;
                            state.visibleEdit = !visibleEdit;
                            if (visibleEdit) {
                                this.handleRefresh();
                                state.personalImages = [];
                            };
                            this.setState(state);
                        }}>
                        <View style={[commonStyles.viewHorizontal, {
                            alignItems: "center",
                            padding: Constants.MARGIN
                        }]}>
                            <Text style={[commonStyles.text, { flex: 1 }]}>
                                {visibleEdit ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
                            </Text>
                        </View>
                    </MenuOption>
                    <MenuOption
                        onSelect={() =>
                            !Utils.isNull(this.userInfo)
                            && this.props.navigation.navigate("ConfigStaff", {
                                staffId: this.userInfo.id,
                                isApproval: this.userInfo.status == statusType.DRAFT,
                                callback: () => {
                                    this.callBack && this.callBack()
                                }
                            })
                        }>
                        <View style={[commonStyles.viewHorizontal, {
                            alignItems: "center",
                            padding: Constants.MARGIN
                        }]}>
                            <Text style={[commonStyles.text, { flex: 1 }]}>
                                Cấu hình
                            </Text>
                        </View>
                    </MenuOption>
                </MenuOptions>
            </Menu>
        );
    };

    render() {
        const { avatarPath, isLoading } = this.state;
        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={[commonStyles.header]}>
                        {this.renderHeaderView({
                            title: localizes("userInfoView.title"),
                            visibleBack: this.screen == screenType.FROM_SPLASH || this.screen == screenType.FROM_LOGIN ? false : true,
                            titleStyle: { color: Colors.COLOR_WHITE },
                            renderRightMenu: this.screen == screenType.FROM_SPLASH || this.screen == screenType.FROM_LOGIN ? null : this.renderRightMenu
                        })}
                    </Header>
                    <Content
                        contentContainerStyle={{ flexGrow: 1 }}
                        style={{ flex: 1 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                progressViewOffset={Constants.HEIGHT_HEADER_OFFSET_REFRESH}
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }>
                        <View style={{
                            paddingHorizontal: Constants.PADDING_X_LARGE,
                            backgroundColor: Colors.COLOR_WHITE
                        }}>
                            {/* Avatar */}
                            <View style={[
                                commonStyles.viewCenter,
                                { paddingVertical: Constants.PADDING_X_LARGE }
                            ]}>
                                <TouchableOpacity
                                    style={[styles.imageSize, { overflow: "hidden" }]}
                                    activeOpacity={Constants.ACTIVE_OPACITY}
                                    onPress={this.state.visibleEdit ? this.attachFile : () => { }}>
                                    <ImageLoader
                                        style={[styles.imageSize]}
                                        resizeModeType={"cover"}
                                        path={avatarPath}
                                    />
                                    {this.state.visibleEdit
                                        ? <View
                                            style={[
                                                commonStyles.viewCenter,
                                                {
                                                    backgroundColor: Colors.COLOR_BLACK_OPACITY_50,
                                                    position: "absolute",
                                                    width: "100%",
                                                    height: "30%",
                                                    bottom: 0,
                                                    left: 0
                                                }
                                            ]}>
                                            <Image source={ic_camera_radio} />
                                        </View> : null}
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{
                            paddingHorizontal: Constants.PADDING_X_LARGE,
                            backgroundColor: Colors.COLOR_WHITE,
                            marginTop: Constants.MARGIN_X_LARGE
                        }}>
                            {/* Full name */}
                            <TextInputCustom
                                refInput={input => (this.fullName = input)}
                                isInputNormal={true}
                                placeholder={localizes("register.contactName")}
                                value={this.state.fullName}
                                onChangeText={fullName => this.setState({ fullName })}
                                onSubmitEditing={() => {
                                    this.email.focus();
                                }}
                                returnKeyType={"next"}
                                contentLeft={ic_account_grey}
                                inputNormalStyle={{
                                    paddingVertical: Constants.PADDING_LARGE + Constants.MARGIN
                                }}
                                editable={this.state.visibleEdit}
                            />
                            {/*PhoneNumber*/}
                            <TextInputCustom
                                refInput={input => {
                                    this.phone = input;
                                }}
                                isInputNormal={true}
                                placeholder={localizes("register.phone")}
                                value={this.state.phone}
                                onChangeText={phone =>
                                    this.setState({
                                        phone: phone
                                    })
                                }
                                onSubmitEditing={() => {
                                    this.email.focus();
                                }}
                                keyboardType="phone-pad"
                                returnKeyType={"next"}
                                blurOnSubmit={false}
                                numberOfLines={1}
                                contentLeft={ic_phone_number_grey}
                                editable={false}
                                inputNormalStyle={{
                                    paddingVertical: Constants.PADDING_LARGE + Constants.MARGIN
                                }}
                            />
                            {/* Email */}
                            <TextInputCustom
                                refInput={input => {
                                    this.email = input;
                                }}
                                isInputNormal={true}
                                placeholder={localizes("forgot_password.email")}
                                value={this.state.email}
                                onChangeText={email => this.setState({ email })}
                                onSubmitEditing={() => {
                                    if (Utils.validateEmail(this.state.email)) {
                                        this.address.focus();
                                    }
                                }}
                                keyboardType="email-address"
                                returnKeyType={"next"}
                                blurOnSubmit={false}
                                numberOfLines={1}
                                contentLeft={ic_gmail_grey}
                                editable={false}
                                inputNormalStyle={{
                                    paddingVertical: Constants.PADDING_LARGE + Constants.MARGIN
                                }}
                            />
                            {/*Address*/}
                            <TextInputCustom
                                refInput={input => {
                                    this.address = input;
                                }}
                                isInputNormal={true}
                                placeholder={localizes("register.address")}
                                value={this.state.address}
                                onChangeText={address => this.setState({ address })}
                                returnKeyType={"next"}
                                blurOnSubmit={false}
                                numberOfLines={1}
                                contentLeft={ic_place_grey}
                                inputNormalStyle={{
                                    paddingVertical: Constants.PADDING_LARGE + Constants.MARGIN
                                }}
                                editable={this.state.visibleEdit}
                            />
                            {/* Day Of Birth */}
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderBottomWidth: Constants.BORDER_WIDTH,
                                borderColor: Colors.COLOR_BACKGROUND
                            }}>
                                <Image source={ic_calendar_grey} />
                                <TextInputMask
                                    style={{
                                        color: Colors.COLOR_TEXT,
                                        width: "96%",
                                        marginHorizontal: Constants.MARGIN_LARGE + Constants.MARGIN,
                                        paddingVertical: Constants.PADDING_LARGE + Constants.PADDING
                                    }}
                                    ref={input => (this.dayOfBirth = input)}
                                    placeholder={localizes("userInfoView.dayOfBirth")}
                                    type={'datetime'}
                                    options={{
                                        format: 'DD/MM/YYYY'
                                    }}
                                    value={this.state.dayOfBirth}
                                    onChangeText={dayOfBirth => this.setState({ dayOfBirth })}
                                    keyboardType="numeric"
                                    returnKeyType={"next"}
                                    blurOnSubmit={false} //focus text input
                                    onFocus={() => this.showCalendarDate()}
                                    editable={this.state.visibleEdit}
                                />
                            </View>
                            {/* Gender */}
                            <View>
                                <TextInputCustom
                                    refInput={input => {
                                        this.gender = input
                                    }}
                                    onPress={() => { this.state.visibleEdit ? this.menuOptionGender.open() : null }}
                                    isInputAction={true}
                                    placeholder={"Chọn giới tính của bạn"}
                                    value={this.state.gender.name}
                                    inputNormalStyle={{
                                        paddingVertical: Constants.MARGIN_LARGE + Constants.MARGIN
                                    }}
                                    contentLeft={ic_gender_grey}
                                    contentRight={
                                        this.state.visibleEdit ? <Image source={ic_down_grey} /> : null
                                    }
                                    editable={this.state.visibleEdit}
                                />
                                {this.renderMenuGender()}
                            </View>
                            {/* Country */}
                            <TextInputCustom
                                refInput={input => {
                                    this.domicile = input;
                                }}
                                isInputNormal={true}
                                placeholder={localizes("userInfoView.country")}
                                value={this.state.domicile}
                                onChangeText={domicile => this.setState({ domicile: domicile })}
                                onSubmitEditing={() => {
                                    this.personalId.focus();
                                }}
                                returnKeyType={"done"}
                                blurOnSubmit={false}
                                numberOfLines={1}
                                contentLeft={ic_place_grey}
                                inputNormalStyle={{
                                    paddingVertical: Constants.PADDING_LARGE + Constants.MARGIN
                                }}
                                editable={this.state.visibleEdit}
                            />
                            {/* Personal ID */}
                            <TextInputCustom
                                refInput={input => {
                                    this.personalId = input;
                                }}
                                isInputNormal={true}
                                placeholder={localizes("userInfoView.personalId")}
                                value={this.state.personalId}
                                onChangeText={personalId =>
                                    this.setState({ personalId: personalId })
                                }
                                keyboardType="number-pad"
                                returnKeyType={"done"}
                                blurOnSubmit={false}
                                numberOfLines={1}
                                borderBottomWidth={0}
                                contentLeft={ic_payment_grey}
                                inputNormalStyle={{
                                    paddingVertical: Constants.PADDING_LARGE + Constants.MARGIN
                                }}
                                editable={this.state.visibleEdit}
                            />
                        </View>
                        <UploadPersonalImages
                            visibleEdit={this.state.visibleEdit}
                            getPersonalImage={this.state.visibleEdit && this.callbackPersonalImages}
                            userResources={this.userResources}
                            resourceUrlPath={this.resourceUrlPath.textValue}
                            maxFileSizeUpload={this.maxFileSizeUpload.numericValue}
                        />
                        {this.state.visibleEdit ? <View
                            style={{
                                backgroundColor: Colors.COLOR_WHITE,
                                marginVertical: Constants.MARGIN_X_LARGE
                            }}
                        >
                            {this.renderCommonButton(
                                "Lưu lại",
                                { color: Colors.COLOR_WHITE },
                                {
                                    backgroundColor: Colors.COLOR_PRIMARY,
                                    marginHorizontal: Constants.MARGIN_X_LARGE
                                },
                                () => {
                                    this.validate()
                                }
                            )}
                        </View> : null}
                    </Content>
                    {this.renderFileSelectionDialog()}
                    {this.renderAlertSuccess()}
                    {this.renderInvalidEmail()}
                    {this.renderPhoneChange()}
                    <CalendarScreen
                        maximumDate={
                            new Date(new Date().setDate(DateUtil.now().getDate() - 1))
                        }
                        dateCurrent={DateUtil.convertFromFormatToFormat(
                            this.userInfo.birthDate,
                            DateUtil.FORMAT_DATE_TIME_ZONE,
                            DateUtil.FORMAT_DATE_TIME_ZONE_T
                        )}
                        chooseDate={this.chooseDate.bind(this)}
                        ref={ref => (this.showCalendar = ref)}
                    />
                    {this.state.refreshing ? null : this.showLoadingBar(this.props.isLoading || isLoading)}
                </Root>
            </Container>
        );
    }

    /**
     * Attach file
     */
    attachFile = () => {
        this.showDialog();
    };

    /**
     * Show dialog
     */
    showDialog() {
        this.setState({
            visibleDialog: true
        });
    }

    /**
     * hide dialog
     */
    hideDialog() {
        this.setState({
            visibleDialog: false
        });
    }

    /**
     * Called when selected type
     * @param {*} index
     */
    onSelectedType(index) {
        if (index === 0) {
            this.takePhoto();
        } else if (index === 1) {
            this.showDocumentPicker();
        }
        if (Platform.OS == "android") this.hideDialog();
    }

    /**
     * Take a photo
     */
    takePhoto = () => {
        ImagePicker.launchCamera(optionsCamera, response => {
            const { error, uri, originalRotation, didCancel } = response;
            this.hideDialog();
            if (uri && !error) {
                let rotation = Utils.rotateImage(originalRotation);
                this.setState({ isLoading: true });
                ImageResizer.createResizedImage(uri, 800, 600, "JPEG", 80, rotation).then(({ uri }) => {
                    this.uploadAvatar(uri);
                }).catch(err => {
                    console.log(err)
                })
            } else if (error) {
                console.log("The photo picker errored. Check ImagePicker.launchCamera func")
                console.log(error)
            }
        });
    };

    /**
     * Show document picker
     */
    showDocumentPicker = fileType => {
        const { params } = this.props.navigation.state;
        ImagePicker.launchImageLibrary(optionsCamera, response => {
            const { error, uri, originalRotation, didCancel } = response;
            this.hideDialog();
            if (uri && !error) {
                let rotation = 0;
                this.setState({ isLoading: true });
                ImageResizer.createResizedImage(uri, 800, 600, "JPEG", 80, rotation).then(({ uri }) => {
                    this.uploadAvatar(uri);
                }).catch(err => {
                    console.log(err)
                })
            } else if (error) {
                console.log("The photo picker errored. Check ImagePicker.launchCamera func")
                console.log(error)
            }
        });
    };

    /**
     * Upload avatar
     */
    uploadAvatar = (uri) => {
        let uriReplace = uri;
        if (Platform.OS == "android") {
            uriReplace = uri.replace('file://', '');
        };
        let file = {
            fileType: "image/*",
            filePath: uriReplace
        };
        const options = {
            url: ServerPath.API_URL + "user/upload/avatar",
            path: file.filePath,
            method: "POST",
            field: "file",
            type: "multipart",
            headers: {
                "Content-Type": "application/json", // Customize content-type
                "X-APITOKEN": global.token
            },
            parameters: {
                userId: this.screen === screenType.FROM_STAFF_DEPARTMENT ? this.userInfo.id + "" : ""
            },
            notification: {
                enabled: true,
                onProgressTitle: "Đang tải ảnh lên...",
                autoClear: true
            }
        };
        Upload.startUpload(options).then(uploadId => {
            console.log("Upload started");
            Upload.addListener("progress", uploadId, data => {
                console.log(`Progress: ${data.progress}%`);
            });
            Upload.addListener("error", uploadId, data => {
                console.log(`Error: ${data.error}%`);
            });
            Upload.addListener("cancelled", uploadId, data => {
                console.log(`Cancelled!`);
            });
            Upload.addListener("completed", uploadId, data => {
                // data includes responseCode: number and responseBody: Object
                console.log("Completed!");
                if (!Utils.isNull(data.responseBody)) {
                    let result = JSON.parse(data.responseBody);
                    if (!Utils.isNull(result.data)) {
                        this.setState({
                            avatarPath: this.getUserAvatarPath(result.data),
                            isLoading: false
                        });
                    }
                }
            });
        }).catch(error => {
            this.saveException(error, "uploadAvatar");
        });
    }

    /**
     * Get avatar user path
     * @param {*} avatarPath 
     */
    getUserAvatarPath = (avatarPath) => {
        return !Utils.isNull(avatarPath) && avatarPath.indexOf('http') != -1
            ? avatarPath : this.resourceUrlPath.textValue + "/" + global.companyIdAlias + "/" + avatarPath;
    }

    /**
     * Date press
     */
    chooseDate(day) {
        this.setState({
            dayOfBirth: DateUtil.convertFromFormatToFormat(
                day,
                DateUtil.FORMAT_DATE_TIME_ZONE_T,
                DateUtil.FORMAT_DATE
            )
        });
    }

    /**
     * edit data & validation
     */
    onEditData = () => {
        const {
            phone,
            fullName,
            dayOfBirth,
            address,
            email,
            gender,
            personalId,
            domicile,
            avatarPath
        } = this.state;
        let editData = {
            id: this.screen == screenType.FROM_STAFF_DEPARTMENT ? this.userInfo.id : null,
            name: fullName.trim(),
            phone: phone,
            birthDate: DateUtil.convertFromFormatToFormat(
                moment(dayOfBirth, "DD-MM-YYYY").add(1, "days"),
                DateUtil.FORMAT_DATE,
                DateUtil.FORMAT_DATE_TIME_ZONE
            ),
            address: address.trim(),
            gender: gender.id,
            personalId: personalId.trim(),
            email: email,
            domicile: domicile.trim(),
            personId: this.userInfo.personId,
            avatarPath: avatarPath
        };
        this.props.editProfile(editData);
    };

    /**
     * call back personal id images from choose personal id image components
     */
    callbackPersonalImages(personalImages) {
        this.setState({
            personalImages: personalImages
        });
        console.log("user compo Personal:", this.state.personalImages);
    }
    /**
     * upload personal id images
     */
    uploadPersonalIdImages() {
        console.log("INDEX PERSONAL: ", this.indexImage);
        console.log("this.state.personalImages: ", this.state.personalImages);
        if (Utils.isNull(this.state.personalImages[0])) {
            this.indexImage += 1;
        }
        if (!Utils.isNull(this.state.personalImages[this.indexImage])) {
            let filePathUrl = this.state.personalImages[this.indexImage].image;
            if (Platform.OS == "android") {
                filePathUrl = this.state.personalImages[this.indexImage].image.replace('file://', '');
            };
            console.log("Image path: ", filePathUrl);
            const options = {
                url: ServerPath.API_URL +
                    `user/personal/${this.state.personalImages[this.indexImage].imageSide
                    }/upload`,
                path: filePathUrl,
                method: "POST",
                field: "file",
                type: "multipart",
                headers: {
                    "Content-Type": "application/json", // Customize content-type
                    "X-APITOKEN": global.token
                },
                parameters: {
                    userId: this.screen === screenType.FROM_STAFF_DEPARTMENT ? this.userInfo.id + "" : ""
                },
                notification: {
                    enabled: true,
                    onProgressTitle: "Đang tải ảnh lên...",
                    autoClear: false
                }
            };
            this.processUploadPersonalIdImages(options);
        } else {
            this.setState({
                isLoading: false,
                isAlertSuccess: true
            });
        }
    }

    /**
     * Process upload cavet image
     * @param {*} options
     */
    processUploadPersonalIdImages(options) {
        Upload.startUpload(options).then(uploadId => {
            console.log("Upload started");
            Upload.addListener("progress", uploadId, data => {
                console.log(`Progress: ${data.progress}%`);
                this.setState({
                    progress: data.progress / 100
                });
            });
            Upload.addListener("error", uploadId, data => {
                console.log(`Error: ${data.error}%`);
                this.showMessage(localizes("uploadImageError"));
            });
            Upload.addListener("cancelled", uploadId, data => {
                console.log(`Cancelled!`);
            });
            Upload.addListener("completed", uploadId, data => {
                console.log("Completed!", data);
                if (this.indexImage < this.state.personalImages.length - 1) {
                    this.indexImage += 1;
                    const timeOut = setTimeout(() => {
                        this.uploadPersonalIdImages();
                    }, 200);
                } else {
                    this.setState({
                        isAlertSuccess: true,
                        isLoading: false
                    });
                }
            });
        }).catch(err => {
            console.log("Upload failed");
            this.saveException(err, "processUploadPersonalIdImages");
            this.setState({
                isDisableButton: false
            });
        });
    }

    /**
     * Render file selection dialog
     */
    renderFileSelectionDialog() {
        return (
            <DialogCustom
                visible={this.state.visibleDialog}
                isVisibleTitle={true}
                isVisibleContentForChooseImg={true}
                contentTitle={localizes("userInfoView.chooseImages")}
                onTouchOutside={() => {
                    this.setState({ visibleDialog: false });
                }}
                onPressX={() => {
                    this.setState({ visibleDialog: false });
                }}
                onPressCamera={() => {
                    this.onSelectedType(0);
                }}
                onPressGallery={() => {
                    this.onSelectedType(1);
                }}
            />
        );
    }

    /**
     * Render alert add address success
     */
    renderAlertSuccess() {
        return (
            <DialogCustom
                visible={this.state.isAlertSuccess}
                isVisibleTitle={true}
                isVisibleOneButton={true}
                isVisibleContentText={true}
                contentTitle={localizes("notification")}
                textBtn={localizes("yes")}
                contentText={localizes("userInfoView.saveSucsess")}
                onPressBtn={() => {
                    this.setState({ isAlertSuccess: false });
                    if (this.screen == screenType.FROM_SPLASH || this.screen == screenType.FROM_LOGIN) {
                        this.goHomeScreen();
                    } else {
                        this.onBack();
                        this.callBack();
                    }
                }}
            />
        );
    }

    /**
     * render dialog when user type incorect email fomart
     */
    renderInvalidEmail() {
        return (
            <DialogCustom
                visible={this.state.isInvalidEmail}
                isVisibleTitle={true}
                isVisibleOneButton={true}
                isVisibleContentText={true}
                contentTitle={localizes("notification")}
                textBtn={localizes("yes")}
                contentText={localizes("forgot_password.invalidEmail")}
                onPressBtn={() => {
                    this.setState({ isInvalidEmail: false });
                }}
            />
        );
    }

    /**NOTE: Phone can not change
     * render dialog when user try to change phone number
     */
    renderPhoneChange() {
        return (
            <DialogCustom
                visible={this.state.isEditPhoneNumber}
                isVisibleTitle={true}
                isVisibleOneButton={true}
                isVisibleContentText={true}
                contentTitle={localizes("notification")}
                textBtn={localizes("yes")}
                contentText={localizes("userInfoView.phoneChange")}
                onPressBtn={() => {
                    this.setState({ isEditPhoneNumber: false });
                }}
            />
        );
    }

    /**
     * Face recognize enable
     */
    faceRecognizeEnable(faceRecognize) {
        const { company } = this.userInfo;
        return faceRecognize.enable === 1 && company.type === CompanyType.ADVANCED;
    }

    /**
     * validate
     */
    validate() {
        const { avatarPath, fullName, email, phone, personalId, domicile, address, personalImages, dayOfBirth } = this.state;
        let checkInRule = !Utils.isNull(this.checkInRule.textValue) ? JSON.parse(this.checkInRule.textValue) : {};
        let faceRecognize = checkInRule.faceRecognize || {};
        const res = !Utils.isNull(phone) ? phone.charAt(0) : "";
        if (Utils.isNull(avatarPath)) {
            this.showMessage("Vui lòng chọn ảnh đại diện!");
        } else if (Utils.isNull(fullName) || fullName.trim().length == 0) {
            this.showMessage(localizes("register.vali_fill_fullname"));
        } else if (StringUtil.validSpecialCharacter(fullName.trim()) || StringUtil.validEmojiIcon(fullName.trim())) {
            this.showMessage(localizes("register.vali_fullname"));
        } else if (fullName.length > 60) {
            this.showMessage(localizes("register.vali_fullname_length"));
        } else if (!Utils.isNull(email) && !Utils.validateEmail(email)) {
            this.showMessage(localizes("register.vali_email"));
        } else if (Utils.isNull(phone)) {
            this.showMessage(localizes("register.vali_fill_phone"));
        } else if (phone.length != 10 || res != "0") {
            this.showMessage(localizes("register.errorPhone"));
        } else if (!Utils.validatePhone(phone)) {
            this.showMessage(localizes("register.vali_phone"));
        } else if (Utils.isNull(email)) {
            this.showMessage(localizes("register.vali_fill_email"))
        } else if (!Utils.validateEmail(email)) {
            this.showMessage(localizes("register.vali_email"))
        } else if (Utils.isNull(address)) {
            this.showMessage(localizes("userInfoView.fillAddress"));
        } else if (Utils.isNull(dayOfBirth)) {
            this.showMessage(localizes("register.vali_fill_dayOfBirth"));
        } else if (!Utils.validateDate(dayOfBirth)) {
            this.showMessage(localizes("register.vali_dayOfBirth"));
        } else if (Utils.isNull(domicile)) {
            this.showMessage(localizes("userInfoView.fillDomicile"));
        } else if (Utils.isNull(personalId)) {
            this.showMessage(localizes("userInfoView.fillPersonalId"));
        } else if (personalId.length != 9 && personalId.length != 12) {
            this.showMessage(localizes("userInfoView.invalidPersonalId"));
        } else if (Utils.isNull(this.userResources)
            && ((!Utils.isNull(this.state.personalImages[0]) && Utils.isNull(this.state.personalImages[1]))
                || (Utils.isNull(this.state.personalImages[0]) && !Utils.isNull(this.state.personalImages[1])))) {
            this.showMessage(localizes("userInfoView.invalidPersonalImages"));
        } else {
            this.setState({ isLoading: true });
            if (this.faceRecognizeEnable(faceRecognize)) {
                if (this.hasPersonGroup) {
                    this.detectFace(1);
                } else {
                    this.addPersonToAPI();
                }
            } else {
                this.onEditData();
            }
        }
    }

    /**
     * Render menu option gender
     */
    renderMenuGender = () => {
        return (
            <Menu
                style={{}}
                ref={ref => (this.menuOptionGender = ref)}>
                <MenuTrigger text="" />
                <MenuOptions>
                    {this.genders.map((item, index) => {
                        return (
                            <MenuOption
                                key={index.toString()}
                                onSelect={() => {
                                    let state = this.state;
                                    if (!Utils.isNull(item.id)) {
                                        state.gender = item;
                                    }
                                    this.setState(state);
                                }}>
                                <View
                                    style={[commonStyles.viewHorizontal, {
                                        alignItems: "center",
                                        padding: Constants.MARGIN
                                    }]}>
                                    <Text numberOfLines={1} style={[commonStyles.text]}>{item.name}</Text>
                                </View>
                            </MenuOption>
                        )
                    })}
                </MenuOptions>
            </Menu>
        );
    };

    /**
     * Training group face recognize
     */
    training = () => {
        fetch(ServerPath.FACE_API + `persongroups/${PERSON_GROUP_ID}/train`, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': configConstants.KEY_FACE_API
            },
        }).then((response) => {
            console.log("Response after training zzzzz : ", response);
            if (response.status == 202) {
                console.log("training thành công");
            } else {
                console.log("training thất bại");
            }
        }).catch((error) => {
            console.error(error);
        });
    }

    /**
     * Create group face recognize
     */
    createGroupFaceRecognize = () => {
        let body = {
            "name": PERSON_GROUP_ID,
            "userData": "Công ty TNHH Công nghệ BOOT",
            "recognitionModel": "recognition_02"
        }
        fetch(ServerPath.FACE_API + `persongroups/${PERSON_GROUP_ID}`, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Ocp-Apim-Subscription-Key': configConstants.KEY_FACE_API,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }).then((response) => {
            console.log("Response after create persongroup: ", response);
            if (response.status == 200) {
                // Tạo thành công
                this.training();
            } else if (response.status == 409) {
                // Đã tồn tại
                this.getPerson();
            } else {
                this.showError();
            }
        }).catch((error) => {
            console.error(error);
        });
    }

    /**
     * Get person group face
     */
    getPerson = () => {
        const { personId } = this.userInfo;
        fetch(ServerPath.FACE_API + `persongroups/${PERSON_GROUP_ID}/persons/${personId}`, {
            method: 'GET',
            headers: {
                'Ocp-Apim-Subscription-Key': configConstants.KEY_FACE_API
            }
        }).then((response) => response.json()).then((responseJson) => {
            console.log("Response after get person: ", responseJson);
            if (!Utils.isNull(responseJson.personId)) {
                this.userInfo.personId = responseJson.personId;
                this.hasPersonGroup = true;
            } else {
                this.hasPersonGroup = false;
            }
            this.training();
        }).catch((error) => {
            console.error(error);
        });
    };

    /**
     * Add person to api
     */
    addPersonToAPI = () => {
        let body = {
            "name": this.state.fullName.trim(),
            "userData": this.state.fullName.trim() + "_" + this.state.phone
        }
        fetch(ServerPath.FACE_API + `persongroups/${PERSON_GROUP_ID}/persons`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Ocp-Apim-Subscription-Key': configConstants.KEY_FACE_API,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }).then((response) => response.json()).then((responseJson) => {
            console.log("Response after add person: ", responseJson);
            if (responseJson.personId != null) {
                this.userInfo.personId = responseJson.personId;
                this.detectFace(2);
            }
        }).catch((error) => {
            console.error(error);
        });
    };

    /**
     * Add face to person
     */
    addFaceToPerson = (personId) => {
        const { fullName, avatarPath } = this.state;
        let avatar = !Utils.isNull(avatarPath) && avatarPath.indexOf('http') != -1
            ? avatarPath : this.resourceUrlPath.textValue + "/" + global.companyIdAlias + "/" + avatarPath;
        let body = {
            "url": avatar
        }
        fetch(ServerPath.FACE_API + `persongroups/${PERSON_GROUP_ID}/persons/${personId}/persistedFaces?userData=${fullName}&detectionModel=detection_02`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Ocp-Apim-Subscription-Key': configConstants.KEY_FACE_API,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }).then((response) => response.json()).then((responseJson) => {
            console.log("Response after add face zzzzz : ", responseJson);
            if (Object.keys(responseJson)[0] === "error") {
                this.setState({
                    isLoading: false
                });
                this.showMessage("Vui lòng chọn ảnh có 1 khuôn mặt và đúng là bạn!")
                console.log("Đăng kí khuôn mặt cho perso thât bại zzzzz", responseJson);
            } else {
                console.log("Đăng kí khuôn mặt cho person thành công zzzzz", responseJson);
                this.onEditData();
            }
        }).catch((error) => {
            console.error(error);
        });
    }

    /**
     * Detect face
     */
    detectFace = (type) => {
        const { avatarPath } = this.state;
        let avatar = !Utils.isNull(avatarPath) && avatarPath.indexOf('http') != -1
            ? avatarPath : this.resourceUrlPath.textValue + "/" + global.companyIdAlias + "/" + avatarPath;
        let body = {
            "url": avatar
        }
        fetch(ServerPath.FACE_API + `detect?returnFaceId=true&recognitionModel=recognition_02&returnRecognitionModel=true&detectionModel=detection_02`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Ocp-Apim-Subscription-Key': configConstants.KEY_FACE_API,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }).then((response) => response.json()).then((responseJson) => {
            console.log("Response after detectFace face zzzzz : ", responseJson);
            if (responseJson.length > 0 && responseJson[0].faceId != null) {
                if (responseJson[0].faceRectangle.width > 100 && responseJson[0].faceRectangle.height > 100) {
                    this.faceId = responseJson[0].faceId;
                    this.recognizeFace(this.faceId, type);
                } else {
                    this.showMessage("Vui lòng chọn ảnh chân dung thấy rõ khuôn mặt của bạn!");
                    this.setState({ isLoading: false });
                }
            } else {
                this.showMessage("Không xác định được khuôn mặt trong ảnh, vui lòng thử lại!");
                this.setState({ isLoading: false });
            }
        }).catch((error) => {
            console.error(error);
        });
    }

    /**
     * Recognize face
     */
    recognizeFace = (faceId, type) => {
        // type 1 : Check ảnh phải của mình ko
        // type 2 : Check ảnh phải của người khác không
        let body = {
            "personGroupId": PERSON_GROUP_ID,
            "faceIds": [
                faceId
            ],
            "maxNumOfCandidatesReturned": 1,
            "confidenceThreshold": 0.7
        }
        fetch(ServerPath.FACE_API + `identify`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Ocp-Apim-Subscription-Key': configConstants.KEY_FACE_API,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }).then((response) => response.json()).then((responseJson) => {
            console.log("Response after identify face : ", responseJson);
            if (responseJson.error != null) {
                this.addFaceToPerson(this.userInfo.personId);
            } else {
                if (responseJson[0].candidates.length > 0) {
                    console.log("Response after identify face : ", responseJson[0].candidates[0]);
                    if (responseJson[0].candidates[0].confidence >= 0.7
                        && responseJson[0].candidates[0].personId === this.userInfo.personId) {
                        this.addFaceToPerson(responseJson[0].candidates[0].personId);
                    } else {
                        if (type == 1) {
                            this.showMessage("Ảnh đại diện này không phải là bạn, vui lòng chọn ảnh khác!");
                        } else {
                            this.showMessage("Ảnh đại diện này là của người khác, vui lòng chọn lại!");
                        }
                        this.setState({ isLoading: false });
                    }
                } else {
                    if (type == 1) {
                        this.showMessage("Ảnh đại diện này không phải là bạn, vui lòng chọn ảnh khác!");
                        this.setState({ isLoading: false });
                    } else {
                        this.addFaceToPerson(this.userInfo.personId);
                    }
                }
            }

        }).catch((error) => {
            console.error(error);
        });
    }

    showError = () => {
        this.setState({
            loading: false
        }, () => {
            this.showMessage(localizes("error_in_process"));
        });
    }
}

const mapStateToProps = state => ({
    data: state.userProfile.data,
    action: state.userProfile.action,
    isLoading: state.userProfile.isLoading,
    error: state.userProfile.error,
    errorCode: state.userProfile.errorCode
});

const mapDispatchToProps = {
    ...actions,
    ...faceActions,
    ...commonActions
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UserInfoView);
