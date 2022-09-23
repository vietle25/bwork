import React, { Component } from "react";
import { Root, Header, Title, Content, Container, Tabs, Tab, List, Col, TabHeading } from "native-base";
import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    Dimensions,
    RefreshControl,
    processColor,
    Item,
    Input,
    Modal,
    TouchableHighlight,
    ToastAndroid,
    SafeAreaView, DeviceEventEmitter, NativeModules, ImageBackground, Platform
} from "react-native";
import commonStyles from "styles/commonStyles";
import { Constants } from "values/constants"
import { Colors } from "values/colors";
import { localizes } from "locales/i18n";
import BaseView from "containers/base/baseView";
import ic_back_white from "images/ic_back_white.png";
import ic_pen_black from 'images/ic_pen_black.png'
import img_avatar_default from 'images/ic_default_user.png';
import Dialog, { DIALOG_WIDTH } from 'components/dialog'
import FlatListCustom from "components/flatListCustom";
import GenderType from "enum/genderType";
import * as actions from "actions/userActions";
import * as commonActions from "actions/commonActions";
import { connect } from "react-redux";
import { ErrorCode } from "config/errorCode";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import Utils from 'utils/utils';
import StringUtil from 'utils/stringUtil';
import StorageUtil from "utils/storageUtil";
import DateUtil from "utils/dateUtil";
import styles from "./styles";
import moment from 'moment';
import ScreenType from 'enum/screenType'
import { ServerPath } from "config/Server";
import Upload from 'react-native-background-upload'
import ApiUtil from "utils/apiUtil";
import ImageLoader from "components/imageLoader"
import { Fonts } from "values/fonts";
import { CalendarScreen } from 'components/calendarScreen';
import ic_facebook from 'images/ic_facebook.png';
import ic_google from 'images/ic_google.png';
import ic_add_grey_dark from 'images/ic_add_grey_dark.png';
import ic_chat_black from 'images/ic_chat_black.png';
import DialogCustom from "components/dialogCustom";
import { AccessToken, LoginManager, GraphRequest, GraphRequestManager, LoginButton } from 'react-native-fbsdk';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-community/google-signin';
import loginType from "enum/loginType";
import firebase from 'react-native-firebase';
import BackgroundShadow from "components/backgroundShadow";
import screenType from "enum/screenType";
import BackgroundTopView from "components/backgroundTopView";
import shadow_black_42 from "images/shadow_black_42.png";
import shadow_black_44 from "images/shadow_black_44.png";
import ic_send_image from "images/ic_send_image.png";
import ItemSlidingMenu from "./itemSlidingMenu";
import slidingMenuType from "enum/slidingMenuType";
import Hr from "components/hr";
import { configConstants } from "values/configConstants";
import ic_next_grey from "images/ic_next_grey.png";
import ic_menu_vertical from "images/ic_menu_vertical.png";
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger
} from "react-native-popup-menu";
import UserResourceType from 'enum/userResourceType';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const HEIGHT_ADDRESS_ITEM = 180;
const HEADER_HEIGHT = Platform.OS === "ios" ? 64 : 56;
var WIDTH_IMAGES = width / 2 - (Constants.MARGIN_X_LARGE + Constants.MARGIN_LARGE);
var HEIGHT_IMAGES = WIDTH_IMAGES * 3 / 4;

const listSlidingMenu = [
    { "name": localizes("userProfileView.userInfo"), "hasChild": true, "screen": slidingMenuType.USER_INFO },
    { "name": localizes("userProfileView.message"), "hasChild": true, "screen": slidingMenuType.MESSAGE },
    { "name": "Lịch sử Lương", "hasChild": true, "screen": slidingMenuType.SALARY_HISTORY },
    { "name": localizes("userProfileView.partner"), "hasChild": true, "screen": slidingMenuType.PARTNER },
    { "name": localizes("userProfileView.changePassword"), "hasChild": true, "screen": slidingMenuType.CHANGE_PASSWORD },
    { "name": localizes("setting.log_out"), "hasChild": false, "screen": null }
]

class UserProfileView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            source: "",
            txtAccountName: '',
            userFB: null,
            userGG: null,
            enableRefresh: false,
            refreshing: true,
            isAlert: false,
            isAlertSocial: false,
            loginType: null,
            isShow: false,
            isLoadingChat: false,
            lockedTab: false
        }
        this.userInfo = null
        this.dataAccount = {}
        this.dataAddress = []
        this.userIdCurrent = null
        this.filter = {
            "paging": {
                "pageSize": Constants.PAGE_SIZE,
                "page": 0
            },
            "userId": null,
            "requestMyPost": true
        }
        this.isCanRequest = false
        this.partner = null
        this.department = null
        this.branch = null
        this.staff = null
        this.company = null
        this.frontSide = null
        this.backSide = null
    }

    /**
     * toggle modal member
     */
    toggleCard() {
        this.setState({
            isShow: !this.state.isShow
        })
    }

    componentWillMount() {
        super.componentWillMount()
        this.getSourceUrlPath();
        this.getProfile();
    }

    /**
     * Get profile user
     */
    getProfile() {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then(user => {
            //this callback is executed when your Promise is resolved
            console.log("user", user)
            if (!Utils.isNull(user)) {
                this.props.getUserProfile(user.id)
                this.handleGetProfile(user)
            }
        }).catch(error => {
            //this callback is executed when your Promise is rejected
            this.saveException(error, 'getProfile')
        });
    }

    // handle get profile
    handleGetProfile(user) {
        this.userInfo = user;
        this.partner = user.partner;
        this.department = user.department;
        this.branch = user.branch;
        this.staff = user.staff;
        this.company = user.company;
        this.setState({
            txtAccountName: user.name,
            userFB: user.fbId,
            userGG: user.ggId,
        })
        const userResources = user.userResources;
        if (!Utils.isNull(userResources)) {
            userResources.forEach(item => {
                if (item.type == UserResourceType.PERSONAL_ID) {
                    if (item.imageSide == ImageSideType.FRONT_SIDE) {
                        this.frontSide = item.pathToResource
                        console.log("USER RESOURCE : ", this.frontSide);
                    } else if (item.imageSide == ImageSideType.BACK_SIDE) {
                        this.backSide = item.pathToResource
                        console.log("USER RESOURCE : ", this.backSide);
                    }
                }
            })
        }
    }

    //onRefreshing
    handleRefresh = () => {
        this.state.refreshing = true;
        this.props.getUserProfile(this.userInfo.id);
    }

    /**
     * Handle data
     */
    handleData() {
        let data = this.props.data;
        console.log("DATA Profile", data)
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                this.state.refreshing = false;
                if (this.props.action == getActionSuccess(ActionEvent.GET_USER_INFO)) {
                    this.dataAccount = data
                    this.dataAddress = []
                    if (!Utils.isNull(data.userAddresses)) {
                        data.userAddresses.forEach((item) => {
                            this.dataAddress.push(item);
                        })
                    }
                    this.handleGetProfile(this.dataAccount)
                    this.userIdCurrent = this.dataAccount.id
                    if (!Utils.isNull(data)) {
                        this.state.source =
                            !Utils.isNull(data.avatarPath) && data.avatarPath.indexOf('http') != -1
                                ? data.avatarPath : this.resourceUrlPath.textValue + "/" + global.companyIdAlias + "/" + this.dataAccount.avatarPath
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.LOGIN_FB)) {
                    this.dataAccount = data;
                    this.setState({
                        userFB: this.dataAccount.fbId,
                        userGG: this.dataAccount.ggId,
                    })
                } else if (this.props.action == getActionSuccess(ActionEvent.LOGIN_GOOGLE)) {
                    this.dataAccount = data;
                    this.setState({
                        userFB: this.dataAccount.fbId,
                        userGG: this.dataAccount.ggId,
                    })
                } else if (this.props.action == getActionSuccess(ActionEvent.CHECK_CONVERSATION_ACTIVE)) {
                    if (data) {
                        this.props.navigation.navigate('ListChat')
                    } else {
                        this.goToChatWithAdmin()
                    }
                }
            } else if (this.props.errorCode == ErrorCode.USER_EXIST_TRY_LOGIN_FAIL) {
                if (this.state.loginType == loginType.FACEBOOK) {
                    this.showMessage(localizes('userProfileView.existFacebook'))
                    this.signOutFB(this.state.loginType)
                } else {
                    this.showMessage(localizes('userProfileView.existGoogle'))
                    this.signOutGG(this.state.loginType)
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    async componentDidMount() {
        // in this example, there are line, bar, candle, scatter, bubble in this combined chart.
        // according to MpAndroidChart, the default data sequence is line, bar, scatter, candle, bubble.
        // so 4 should be used as dataIndex to highlight bubble data.
        // if there is only bar, bubble in this combined chart.
        // 1 should be used as dataIndex to highlight bubble data.
        this.setState({ ...this.state, highlights: [{ x: 1, y: 150, dataIndex: 1 }, { x: 2, y: 106, dataIndex: 1 }] })
        this.setState({ ...this.state, highlights2: [{ x: 1, y: 150, dataIndex: 1 }, { x: 2, y: 106, dataIndex: 1 }] })
        DeviceEventEmitter.addListener('RNUploaderProgress', (data) => {
            let bytesWritten = data.totalBytesWritten;
            let bytesTotal = data.totalBytesExpectedToWrite;
            let progress = data.progress;

            console.log("upload progress: " + progress + "%");
        });

        //await GoogleSignin.hasPlayServices({ autoResolve: true });
        await GoogleSignin.configure({
            // iosClientId: '114828036014-npe39u3pkrud0pa79dgdo4n9a02ap31a.apps.googleusercontent.com'
            iosClientId: configConstants.IOS_CLIENT_ID_LOGIN
        })
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount()
    }

    /**
     * show dialog logout
     */
    logoutDialog = () => (
        <DialogCustom
            visible={this.state.isAlert}
            isVisibleTitle={true}
            isVisibleContentText={true}
            isVisibleTwoButton={true}
            contentTitle={localizes("confirm")}
            textBtnOne={localizes("cancel")}
            textBtnTwo={localizes("setting.log_out")}
            contentText={localizes('slidingMenu.want_out')}
            onTouchOutside={() => { this.setState({ isAlert: false }) }}
            onPressX={() => { this.setState({ isAlert: false }) }}
            onPressBtnPositive={() => {
                StorageUtil.retrieveItem(StorageUtil.FCM_TOKEN).then((token) => {
                    if (token != undefined) {
                        // const deviceId = DeviceInfo.getDeviceId();
                        let filter = {
                            deviceId: "",
                            deviceToken: token
                        }
                        this.props.deleteUserDeviceInfo(filter) // delete device info
                    } else {
                        console.log('token null')
                    }
                }).catch((error) => {
                    //this callback is executed when your Promise is rejected
                    this.saveException(error, 'logoutDialog')
                });
                StorageUtil.deleteItem(StorageUtil.USER_PROFILE)
                    .then(user => {
                        console.log("user setting", user);
                        if (Utils.isNull(user)) {
                            this.showMessage(localizes('setting.logoutSuccess'))
                            this.setState({ isAlert: false })
                            this.logout()
                            this.goLoginScreen()
                        } else {
                            this.showMessage(localizes('setting.logoutFail'))
                        }
                    })
                    .catch(error => {
                        this.saveException(error, 'logoutDialog')
                    });
                this.signOutFB(this.state.userFB)
                this.signOutGG(this.state.userGG)
            }}
        />
    )

    /**
     * show dialog cancel connect social
     */
    cancelConnectDialog = () => (
        <DialogCustom
            visible={this.state.isAlertSocial}
            isVisibleTitle={true}
            isVisibleContentText={true}
            isVisibleTwoButton={true}
            contentTitle={localizes("userProfileView.cancelConnect")}
            textBtnOne={localizes("no")}
            textBtnTwo={localizes("yes")}
            contentText={this.state.loginType == loginType.FACEBOOK ? localizes("slidingMenu.wantOutFb") : localizes("slidingMenu.wantOutGg")}
            onTouchOutside={() => { this.setState({ isAlertSocial: false }) }}
            onPressX={() => { this.setState({ isAlertSocial: false }) }}
            onPressBtnPositive={() => {
                let data = {
                    email: this.userInfo.email,
                    phone: this.userInfo.phone,
                    avatarPath: this.userInfo.photo,
                    socialId: null,
                    gender: GenderType.MALE,
                    token: "",
                    rememberToken: "",
                    name: this.userInfo.name,
                    birthDate: this.userInfo.birthDate,
                }
                this.state.loginType == loginType.FACEBOOK ?
                    this.props.loginFacebook(data) :
                    this.props.loginGoogle(data);
                this.setState({
                    isAlertSocial: false
                })
                this.signOutFB(this.state.loginType)
                this.signOutGG(this.state.loginType)
            }}
        />
    )

    /**
     * Render View
     */
    render() {
        const { source, lockedTab } = this.state
        let height = (Platform.OS === 'ios') ? Constants.STATUS_BAR_HEIGHT : 0;
        return (
            <Container style={styles.container}>
                <Root>
                    <Header hasTabs style={commonStyles.header}>
                        {this.renderHeaderView({
                            visibleBack: false,
                            title: "",
                            titleStyle: { textAlign: 'center' },
                            visibleAccount: false,
                            // userName: !Utils.isNull(this.userInfo) ? this.userInfo.name : "",
                            source: source
                        })}
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
                    </Header>
                    <Tabs
                        scrollWithoutAnimation={true}
                        locked={lockedTab}
                        tabBarUnderlineStyle={{ backgroundColor: Colors.COLOR_PRIMARY }}>
                        <Tab heading={
                            <TabHeading style={{ backgroundColor: Colors.COLOR_WHITE }}>
                                <Text style={{ color: Colors.COLOR_PRIMARY }}>Thông tin nhân viên</Text>
                            </TabHeading>
                        }>
                            <Content
                                contentContainerStyle={{ flexGrow: 1 }}
                                style={{ flex: 1, backgroundColor: Colors.COLOR_BACKGROUND }}
                                refreshControl={
                                    <RefreshControl
                                        progressViewOffset={Constants.HEIGHT_HEADER_OFFSET_REFRESH}
                                        refreshing={this.state.refreshing}
                                        onRefresh={this.handleRefresh}
                                    />
                                }
                                showsVerticalScrollIndicator={false}>
                                {this.renderUserInfo()}
                                {/* {this.renderPersonalImages()} */}
                            </Content>
                        </Tab>
                        {/* <Tab2 /> */}
                        <Tab heading={
                            <TabHeading style={{ backgroundColor: Colors.COLOR_WHITE }}>
                                <Text style={{ color: Colors.COLOR_PRIMARY }}>Thông tin công việc</Text>
                            </TabHeading>
                        }>
                            <Content
                                contentContainerStyle={{ flexGrow: 1 }}
                                style={{ flex: 1, backgroundColor: Colors.COLOR_BACKGROUND }}
                                refreshControl={
                                    <RefreshControl
                                        progressViewOffset={Constants.HEIGHT_HEADER_OFFSET_REFRESH}
                                        refreshing={this.state.refreshing}
                                        onRefresh={this.handleRefresh}
                                    />
                                }
                                showsVerticalScrollIndicator={false}>
                                {this.renderWorkingInfo()}
                            </Content>
                        </Tab>
                    </Tabs>
                    {this.logoutDialog()}
                    {this.cancelConnectDialog()}
                    {this.state.refreshing ? null : this.showLoadingBar(this.props.isLoading)}
                </Root>
            </Container>
        );
    }

    /**
     * Render menu option
     */
    renderMenuOption = () => {
        return (
            <Menu
                style={{ top: HEADER_HEIGHT }}
                ref={ref => (this.menuOption = ref)}
            >
                <MenuTrigger text="" />
                <MenuOptions>
                    <MenuOption
                        onSelect={() => {
                            this.props.navigation.navigate("UserInfo", {
                                userInfo: this.userInfo,
                                callBack: () => {
                                    setTimeout(() => {
                                        this.getUserProfile()
                                    }, 1000)
                                }
                            });
                        }}
                    >
                        <View
                            style={[
                                commonStyles.viewHorizontal,
                                {
                                    alignItems: "center",
                                    padding: Constants.MARGIN
                                }
                            ]}
                        >
                            <Text style={[commonStyles.text, { flex: 1 }]}>
                                {localizes("userProfileView.editProfile")}
                            </Text>
                            <View style={{ margin: Constants.MARGIN }}>
                                {/* <Image source={ic_calendar_grey} /> */}
                            </View>
                        </View>
                    </MenuOption>
                    <MenuOption
                        onSelect={() =>
                            this.props.navigation.navigate("ChangePassword")
                        }
                    >
                        <View
                            style={[
                                commonStyles.viewHorizontal,
                                {
                                    alignItems: "center",
                                    padding: Constants.MARGIN
                                }
                            ]}
                        >
                            <Text style={[commonStyles.text, { flex: 1 }]}>
                                {localizes("userProfileView.changePassword")}
                            </Text>
                            <View style={{ margin: Constants.MARGIN }}>
                                {/* <Image source={ic_star} /> */}
                            </View>
                        </View>
                    </MenuOption>
                    <MenuOption
                        onSelect={() => {
                            this.setState({ isAlert: true });
                        }}
                    >
                        <View
                            style={[
                                commonStyles.viewHorizontal,
                                {
                                    alignItems: "center",
                                    padding: Constants.MARGIN
                                }
                            ]}
                        >
                            <Text
                                style={[
                                    {
                                        flex: 1,
                                        color: "#ff0000",
                                        fontSize: Fonts.FONT_SIZE_MEDIUM,
                                        margin: Constants.MARGIN
                                    }
                                ]}
                            >
                                {localizes("setting.log_out")}
                            </Text>
                            <View style={{ margin: Constants.MARGIN }}>
                                {/* <Image source={ic_star} /> */}
                            </View>
                        </View>
                    </MenuOption>
                </MenuOptions>
            </Menu>
        );
    };

    /**
     * Render user info
     */
    renderUserInfo() {
        let dayOfBirth = !Utils.isNull(this.userInfo) ? !Utils.isNull(this.userInfo.birthDate)
            ? DateUtil.convertFromFormatToFormat(
                DateUtil.convertFromFormatToFormat(this.userInfo.birthDate, DateUtil.FORMAT_DATE_TIME_ZONE, DateUtil.FORMAT_DATE_TIME_ZONE),
                DateUtil.FORMAT_DATE_TIME_ZONE, DateUtil.FORMAT_DATE)
            : "" : ""
        let gender = !Utils.isNull(this.userInfo) ? !Utils.isNull(this.userInfo.gender)
            ? this.getGender(this.userInfo.gender)
            : "" : ""
        return (
            <View style={styles.userInfo}>
                {/* <Text style={[commonStyles.text, { color: Colors.COLOR_PRIMARY }]}>Thông tin nhân viên</Text> */}
                {this.renderAttribute("Tên đầy đủ", !Utils.isNull(this.userInfo) ? this.userInfo.name : null)}
                {this.renderAttribute("Ngày sinh", dayOfBirth)}
                {this.renderAttribute("Giới tính", gender)}
                {this.renderAttribute("Quê quán", !Utils.isNull(this.userInfo) ? this.userInfo.domicile : null)}
                {this.renderAttribute("Địa chỉ", !Utils.isNull(this.userInfo) ? this.userInfo.address : null)}
                {this.renderAttribute("Số CMND", !Utils.isNull(this.userInfo) ? this.userInfo.personalId : null)}
                {this.renderAttribute("Số điện thoại", !Utils.isNull(this.userInfo) ? this.userInfo.phone : null)}
                {this.renderAttribute("Email", !Utils.isNull(this.userInfo) ? this.userInfo.email : null)}
            </View>
        )
    }

    /**
     * Render working info
     */
    renderWorkingInfo() {
        let startWorkTime = !Utils.isNull(this.userInfo) ? !Utils.isNull(this.userInfo.startWorkTime)
            ? DateUtil.convertFromFormatToFormat(
                DateUtil.convertFromFormatToFormat(this.userInfo.startWorkTime, DateUtil.FORMAT_DATE_TIME_ZONE, DateUtil.FORMAT_DATE_TIME_ZONE),
                DateUtil.FORMAT_DATE_TIME_ZONE, DateUtil.FORMAT_DATE)
            : "" : "";
        return (
            <View style={styles.workingInfo}>
                {/* <Text style={[commonStyles.text, { color: Colors.COLOR_PRIMARY }]}>Thông tin công việc</Text> */}
                {this.renderAttribute("Ngày bắt đầu làm việc", startWorkTime)}
                {!Utils.isNull(this.branch) && this.renderAttribute("Chi nhánh", this.branch.name)}
                {!Utils.isNull(this.department) && this.renderAttribute("Phòng ban", this.department.name)}
                {!Utils.isNull(this.staff) && this.renderAttribute("Chức vụ", this.staff.name)}
                {this.renderAttribute("Lịch sử lương", "Xem lịch sử lương", { routeName: "SalaryHistory", params: {} })}
                {this.renderAttribute("Nội quy", "Xem nội quy",
                    {
                        routeName: "WorkingPolicy", params: {
                            screen: screenType.FROM_USER_PROFILE,
                            companyId: !Utils.isNull(this.company) ? this.company.id : null,
                            branchId: !Utils.isNull(this.branch) ? this.branch.id : null,
                        }
                    })}
                {this.renderAttribute("Cài đặt", "Tuỳ chỉnh Alarm",
                    { routeName: "SettingAlarm", params: {} })}
            </View>
        )
    }

    /**
     * Render attribute
     */
    renderAttribute(title, content, child) {
        return (
            <TouchableOpacity
                disabled={!Utils.isNull(child) ? false : true}
                activeOpacity={Constants.ACTIVE_OPACITY}
                onPress={() => !Utils.isNull(child) ? this.props.navigation.navigate(child.routeName, child.params) : null}
                style={{ marginVertical: Constants.MARGIN_LARGE }}>
                <Text style={[commonStyles.text, { opacity: Constants.OPACITY_50 }]}>{title}</Text>
                <View style={[commonStyles.viewHorizontal, { alignItems: 'center' }]}>
                    <Text style={[commonStyles.text, {
                        flex: 1,
                        fontSize: Fonts.FONT_SIZE_X_MEDIUM,
                        opacity: !Utils.isNull(content) ? 1 : 0.5
                    }]}>{!Utils.isNull(content) ? content : "Chưa có thông tin"}</Text>
                    {!Utils.isNull(child)
                        ? <Image source={ic_next_grey} />
                        : null
                    }
                </View>
            </TouchableOpacity>
        )
    }

    /**
     * Render connect social
     */
    renderConnectSocial() {
        const { txtAccountName, userFB, userGG } = this.state
        return (
            <View style={{ margin: Constants.MARGIN_X_LARGE }}>
                <BackgroundShadow
                    source={shadow_black_42}
                    content={
                        <View style={{
                            backgroundColor: Colors.COLOR_WHITE,
                            padding: Constants.PADDING_X_LARGE + Constants.PADDING_LARGE,
                            borderRadius: Constants.CORNER_RADIUS
                        }}>
                            {/* {Button facebook} */}
                            <TouchableOpacity
                                activeOpacity={Constants.ACTIVE_OPACITY}
                                onPress={
                                    () => {
                                        Utils.isNull(userFB) ? this.loginFacebook() : null
                                    }
                                } style={[
                                    { flexDirection: 'row', marginBottom: Constants.MARGIN, alignItems: 'center' }
                                ]}
                            >
                                <View style={{ marginRight: Constants.MARGIN }} >
                                    <Image resizeMode={'contain'} source={ic_facebook} />
                                </View>
                                <Text style={[commonStyles.text, { color: Colors.COLOR_DRK_GREY }]}>
                                    {!Utils.isNull(userFB) ? "Chào " + txtAccountName.trim().split(" ").pop() + ", " : "Liên kết với Facebook"}
                                    <Text
                                        onPress={() => this.setState({ isAlertSocial: true, loginType: loginType.FACEBOOK })}
                                        style={[commonStyles.text, { color: Colors.COLOR_BLUE_LIGHT }]}>
                                        {!Utils.isNull(userFB) ? "hủy liên kết" : null}
                                    </Text>
                                </Text>
                            </TouchableOpacity>
                            {/* {Button google} */}
                            <TouchableOpacity
                                activeOpacity={Constants.ACTIVE_OPACITY}
                                onPress={
                                    () => {
                                        Utils.isNull(userGG) ? this.loginGoogle() : null
                                    }
                                } block style={[{ flexDirection: 'row', marginTop: Constants.MARGIN, alignItems: 'center' }]} >
                                <View style={{ marginRight: Constants.MARGIN }} >
                                    <Image resizeMode={'contain'} source={ic_google} />
                                </View>
                                <Text style={[commonStyles.text, { color: Colors.COLOR_DRK_GREY }]}>
                                    {!Utils.isNull(userGG) ? "Chào " + txtAccountName.trim().split(" ").pop() + ", " : "Liên kết với Google +"}
                                    <Text
                                        onPress={() => this.setState({ isAlertSocial: true, loginType: loginType.GOOGLE })}
                                        style={[commonStyles.text, { color: Colors.COLOR_BLUE_LIGHT }]}>
                                        {!Utils.isNull(userGG) ? "hủy liên kết" : null}
                                    </Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    } />
            </View>
        )
    }

    /**
     * Render sliding menu
     */
    renderSlidingMenu() {
        return (
            <View style={{ marginHorizontal: Constants.MARGIN_X_LARGE, marginBottom: Constants.MARGIN_X_LARGE }}>
                <BackgroundShadow
                    source={shadow_black_44}
                    content={
                        <View style={{
                            backgroundColor: Colors.COLOR_WHITE,
                            paddingHorizontal: Constants.PADDING_X_LARGE,
                            borderRadius: Constants.CORNER_RADIUS
                        }}>
                            <FlatListCustom
                                style={{
                                    paddingVertical: Constants.PADDING,
                                }}
                                horizontal={false}
                                data={listSlidingMenu}
                                itemPerCol={1}
                                renderItem={this.renderItemSlide.bind(this)}
                                showsHorizontalScrollIndicator={false}
                            />
                        </View>
                    } />
            </View>
        )
    }


    // Get User Profile
    getUserProfile() {
        this.props.getUserProfile(this.userInfo.id)
        !Utils.isNull(this.listAddressRef) ? this.listAddressRef.scrollToOffset({ animated: true, offset: 0 }) : null
    }

    gotoAddAddress = (data) => {
        this.props.navigation.navigate("AddAddress", {
            refreshProfile: this.getUserProfile.bind(this),
            dataAddress: data
        })
    }

    /**
     * Render item
     * @param {*} item 
     * @param {*} index 
     * @param {*} parentIndex 
     * @param {*} indexInParent 
     */
    renderItemSlide(item, index, parentIndex, indexInParent) {
        return (
            <View>
                <ItemSlidingMenu
                    data={listSlidingMenu}
                    item={item}
                    index={index}
                    navigation={this.props.navigation}
                    userInfo={this.userInfo}
                    callBack={() => this.getUserProfile()}
                    resourceUrlPathResize={this.resourceUrlPathResize.textValue}
                    avatar={this.state.source}
                    onLogout={() => this.setState({ isAlert: true })}
                    partner={this.partner}
                />
                {index != listSlidingMenu.length - 1 ? <Hr color={Colors.COLOR_BACKGROUND} /> : null}
            </View>
        );
    }

    /**
     * Login via Facebook
     */
    loginFacebook = async () => {
        console.log("Connect Facebook")
        this.setState({ loginType: loginType.FACEBOOK })
        try {
            LoginManager.logInWithReadPermissions(['public_profile', 'email'])
                .then((result) => {
                    if (result.isCancelled) {
                        return;
                    }
                    AccessToken.getCurrentAccessToken().then((data) => {
                        console.log(data); // output 1:
                        const responseInfoCallback = (error, profile) => {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log("Data facebook: ", profile); // output 2:
                                let data = {
                                    email: profile.email,
                                    phone: this.userInfo.phone,
                                    socialId: profile.id,
                                    gender: GenderType.MALE,
                                }
                                this.props.loginFacebook(data)
                            }
                        };
                        const accessToken = data.accessToken;
                        const infoRequest = new GraphRequest(
                            '/me',
                            {
                                accessToken,
                                parameters: {
                                    fields: {
                                        string: 'name,gender,email',
                                    },
                                },
                            },
                            responseInfoCallback,
                        );
                        new GraphRequestManager().addRequest(infoRequest).start();
                    });
                });
        } catch (error) {
            this.saveException(error, 'loginFacebook')
        }
    }

    /**
     * Login via Google
     */
    loginGoogle = async () => {
        console.log("Connect Google")
        this.setState({ loginType: loginType.GOOGLE })
        try {
            await GoogleSignin.signOut();
            GoogleSignin.signIn().then((dataUser) => {
                console.log('Data google: ', dataUser);
                let data = {
                    email: dataUser.email,
                    phone: this.userInfo.phone,
                    socialId: dataUser.id,
                    gender: GenderType.MALE,
                }
                this.props.loginGoogle(data);
            }).catch((err) => { this.saveException(err, "loginGoogle") })
                .done()
        } catch (error) {
            this.saveException(error, "loginGoogle")
        }
    }

    /**
     * Go to Chat
     */
    gotoChat = async () => {
        this.props.checkConversationActive()
    }

    /**
     * Render item selection
     * @param {*} index
     */
    renderItemSelection(index) {
        let defaultStyle = {
            padding: Constants.PADDING_LARGE,
            paddingBottom: index == 2 ? Constants.PADDING_X_LARGE : null
        };
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                onPress={() => {
                    this.onSelectedType(index);
                }}
                underlayColor={Colors.COLOR_GREY}
            >
                <Text style={[commonStyles.text, defaultStyle]}>
                    {FILE_SELECTOR[index]}
                </Text>
            </TouchableOpacity>
        );
    }

    /**
     * Get gender user
     * @param {*} gender
     */
    getGender(gender) {
        let genderText = localizes("userInfoView.other");
        if (gender === GenderType.MALE)
            genderText = localizes("userInfoView.male");
        else if (gender === GenderType.FEMALE)
            genderText = localizes("userInfoView.female");
        return genderText;
    }

    /**
     * render personal Images
     */

    renderPersonalImages() {
        return (
            <View style={{
                backgroundColor: Colors.COLOR_WHITE,
                paddingVertical: Constants.PADDING_LARGE,
                marginBottom: Constants.MARGIN_X_LARGE
            }}>
                <Text style={[commonStyles.text, {
                    opacity: Constants.OPACITY_50,
                    marginHorizontal: Constants.MARGIN_X_LARGE + Constants.MARGIN
                }]}>{localizes("userInfoView.personalIdentificationImages")}</Text>
                <ScrollView
                    style={{ marginVertical: Constants.MARGIN_LARGE }}
                    showsHorizontalScrollIndicator={false}
                    // onTouchStart={() => this.setState({ lockedTab: true })}
                    // onMomentumScrollEnd={() => this.setState({ lockedTab: false })}
                    // onScrollEndDrag={() => this.setState({ lockedTab: false })}
                    horizontal={true}>
                    <View style={[{
                        width: WIDTH_IMAGES,
                        height: HEIGHT_IMAGES,
                        borderRadius: Constants.CORNER_RADIUS,
                        backgroundColor: Colors.COLOR_WHITE,
                        borderWidth: Constants.BORDER_WIDTH,
                        borderColor: Colors.COLOR_TEXT,
                        marginRight: Constants.MARGIN_LARGE,
                        marginLeft: Constants.MARGIN_X_LARGE
                    }]}>
                        {!Utils.isNull(this.frontSide)
                            ? <ImageLoader
                                style={[{
                                    borderRadius: Constants.CORNER_RADIUS,
                                    width: '100%', height: '100%',
                                }]}
                                resizeModeType={"cover"}
                                path={this.resourceUrlPath.textValue + "/" + global.companyIdAlias + "/" + this.frontSide}
                            />
                            : <View style={[commonStyles.viewHorizontal, commonStyles.viewCenter]} >
                                <Image source={ic_send_image} />
                                <Text style={[commonStyles.text, {
                                    color: Colors.COLOR_PLACEHOLDER_TEXT_DISABLE
                                }]} >Mặt trước</Text>
                            </View>
                        }
                    </View>
                    <View style={[{
                        width: WIDTH_IMAGES,
                        height: HEIGHT_IMAGES,
                        borderRadius: Constants.CORNER_RADIUS,
                        backgroundColor: Colors.COLOR_WHITE,
                        borderWidth: Constants.BORDER_WIDTH,
                        borderColor: Colors.COLOR_TEXT,
                        marginLeft: Constants.MARGIN_LARGE,
                        marginRight: Constants.MARGIN_X_LARGE
                    }]}>
                        {!Utils.isNull(this.backSide)
                            ? <ImageLoader
                                style={[{
                                    borderRadius: Constants.CORNER_RADIUS,
                                    width: '100%', height: '100%',
                                }]}
                                resizeModeType={"cover"}
                                path={this.resourceUrlPath.textValue + "/" + global.companyIdAlias + "/" + this.backSide}
                            />
                            : <View style={[commonStyles.viewHorizontal, commonStyles.viewCenter]} >
                                <Image source={ic_send_image} />
                                <Text style={[commonStyles.text, { color: Colors.COLOR_PLACEHOLDER_TEXT_DISABLE }]} >Mặt sau</Text>
                            </View>
                        }
                    </View>
                </ScrollView>
            </View>
        );
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
    ...commonActions
};

export default connect(mapStateToProps, mapDispatchToProps)(UserProfileView);
