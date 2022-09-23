import React, { Component } from "react";
import {
    ImageBackground,
    View,
    Image,
    TouchableOpacity,
    BackHandler,
    Linking,
    NativeEventEmitter,
    DeviceEventEmitter,
    Platform,
    RefreshControl,
    Dimensions,
    NativeModules,
    AppState
} from "react-native";
import {
    Container,
    Header,
    Title,
    Left,
    Icon,
    Right,
    Button,
    Body,
    Content,
    Text,
    Card,
    CardItem,
    Root
} from "native-base";
import styles from "./styles";
import BaseView from "containers/base/baseView";
import commonStyles from "styles/commonStyles";
import { Colors } from "values/colors";
import ic_down_grey from "images/ic_down_grey.png";
import ic_wi_fi_grey from "images/ic_wi_fi_grey.png";
import { Constants } from "values/constants";
import Utils from "utils/utils";
import ic_back_white from "images/ic_back_white.png";
import * as actions from "actions/userActions";
import * as timekeepingActions from "actions/timekeepingActions";
import * as companyActions from "actions/companyActions";
import * as commonActions from "actions/commonActions";
import { connect } from "react-redux";
import StorageUtil from "utils/storageUtil";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import { localizes } from "locales/i18n";
import firebase from "react-native-firebase";
import { Fonts } from "values/fonts";
import statusType from "enum/statusType";
import GeoLocationView from "containers/location/geoLocationView";
import DialogCustom from "components/dialogCustom";
import userType from "enum/userType";
import ic_qr_code from "images/ic_qr_code.png";
import { configConstants } from "values/configConstants";
import FlatListCustom from "components/flatListCustom";
import white_shadow_android from "images/white_blur_shadow.png";
import shadow_black_163 from "images/shadow_black_163.png";
import shadow_black_32 from "images/shadow_black_32.png";
import DateUtil from "utils/dateUtil";
import screenType from "enum/screenType";
import ic_account_white from "images/ic_account_white.png";
import ic_lib_add_white from "images/ic_lib_add_white.png";
import BackgroundTopView from "components/backgroundTopView";
import background_top_view from "images/background_top_view.png";
import ImageLoader from "components/imageLoader";
import DeviceInfo from 'react-native-device-info';
import Hr from "components/hr";
import ModalWiFiList from "./modal/modalWiFiList";
import BackgroundTimer from 'react-native-background-timer';
import ItemTimekeeping from "./timekeeping/itemTimekeeping";
import ModalAddNote from "./modal/modalAddNote";
import submitType from "enum/submitType";
import timekeepingType from "enum/timekeepingType";
import workingTimeType from "enum/workingTimeType";
import moment from 'moment';
import { DeviceErrorCode } from "config/deviceErrorCode";
import workingTimeShiftType from "enum/workingTimeShiftType";
import TimeCurrent from "./timeCurrent";
import notificationType from "enum/notificationType";
import img_calendar from "images/img_calendar.png";
import img_bg_statistical from "images/img_bg_statistical.png";
import ic_sabbatical_gray from "images/ic_sabbatical_gray.png";
import ic_darts_gray from "images/ic_darts_gray.png";
import ic_camera_gray from "images/ic_camera_gray.png";
import ic_equalizer_gray from "images/ic_equalizer_gray.png";
import ic_next_grey from "images/ic_next_grey.png";
import { CalendarScreen } from "components/calendarScreen";
import slidingMenuType from "enum/slidingMenuType";
import dashboardType from "enum/dashboardType";

const screen = Dimensions.get("window");

class HomeView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            company: null,
            branch: null,
            appVersion: null,
            enableRefresh: true,
            refreshing: true,
            isAlertVersion: false,
            totalPersonnel: 0,
            dateCurrent: DateUtil.now()
        };
        this.userInfo = null;
        this.dataVersion = null;

        global.onExitApp = this.onExitApp.bind(this);

        this.attributes = [
            {
                name: "Đã chấm công",
                icon: ic_equalizer_gray,
                quantity: 0,
                ratio: 0,
                screen: slidingMenuType.TIMEKEEPING_ADMIN,
                color: Colors.COLOR_PRIMARY,
                dashboardType: dashboardType.CHECK_IN
            },
            {
                name: "Đi trễ",
                icon: ic_camera_gray,
                quantity: 0,
                ratio: 0,
                screen: slidingMenuType.TIMEKEEPING_ADMIN,
                color: Colors.COLOR_PRIMARY,
                dashboardType: dashboardType.LATE_FOR_WORKING
            },
            {
                name: "Xin phép",
                icon: ic_sabbatical_gray,
                quantity: 0,
                ratio: 0,
                screen: slidingMenuType.SABBATICAL_ADMIN,
                color: Colors.COLOR_PRIMARY,
                dashboardType: null
            },
            {
                name: "Chưa chấm công",
                icon: ic_darts_gray,
                quantity: 0,
                ratio: 0,
                screen: slidingMenuType.TIMEKEEPING_ADMIN,
                color: Colors.COLOR_RED,
                dashboardType: dashboardType.NOT_CHECK_IN
            }
        ];

        this.filter = {
            companyId: null,
            branchId: null,
            day: DateUtil.convertFromFormatToFormat(DateUtil.now(), DateUtil.FORMAT_DATE_TIME_ZONE_T, DateUtil.FORMAT_DATE_SQL)
        }
    }

	/**
	 * Press back exit app
	 */
    onExitApp() {
        this.setState({ isAlertExitApp: true });
    }

	/**
	 * Get profile user
	 */
    getProfile() {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then(user => {
            //this callback is executed when your Promise is resolved
            if (!Utils.isNull(user)) {
                console.log("User Storage - Home", user);
                this.userInfo = user;
                this.signInWithCustomToken(user.id);
            }
        }).catch(error => {
            //this callback is executed when your Promise is rejected
            this.saveException(error, "getProfile");
        });
    }

    componentDidMount() {
        super.componentDidMount();
        this.props.getUpdateVersion();
        this.getProfile();
        StorageUtil.retrieveItem(StorageUtil.VERSION).then((version) => {
            console.log('Version', version)
            this.setState({
                appVersion: version
            })
        }).catch((error) => {
            this.saveException(error, 'componentDidMount')
        });
        StorageUtil.retrieveItem(StorageUtil.COMPANY_INFO).then((companyInfo) => {
            console.log('companyInfo', companyInfo)
            global.companyIdAlias = companyInfo.company.idAlias;
            this.state.company = companyInfo.company;
            this.state.branch = companyInfo.branch;
            this.filter.companyId = companyInfo.company.id;
            this.filter.branchId = !Utils.isNull(companyInfo.branch) ? companyInfo.branch.id : null;
            this.props.getConfig(this.filter);
            this.handleRequest();
        }).catch((error) => {
            this.saveException(error, 'componentDidMount')
        });
    }

    /**
     * Handle request
     */
    handleRequest() {
        let timeout = 1000;
        let timeOutRequestOne = setTimeout(() => {
            this.props.getDashboardStatistical(this.filter);
            clearTimeout(timeOutRequestOne)
        }, timeout)
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

	/**
	 * Handle data when request
	 */
    handleData() {
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.GET_UPDATE_VERSION)) {
                    this.checkUpdateVersion(data, this.state.appVersion);
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_PROFILE_ADMIN)) {
                    StorageUtil.storeItem(StorageUtil.USER_PROFILE, data);
                    if (!Utils.isNull(data)) {
                        if (data.status == statusType.ACTIVE) {
                            this.userInfo = data;
                        }
                        if (data.status == statusType.DELETE
                            || data.status == statusType.SUSPENDED) {
                            this.logout();
                            this.goLoginScreen();
                        }
                    }
                } else if (this.props.action == ActionEvent.NOTIFY_LOGIN_SUCCESS) {
                    this.getProfile();
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_CONFIG)) {
                    this.configList = data;
                    StorageUtil.storeItem(StorageUtil.MOBILE_CONFIG, this.configList);
                    this.props.getProfileAdmin(this.userInfo.id);
                    this.getSourceUrlPath();
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_DASHBOARD_STATISTICAL)) {
                    this.state.refreshing = false;
                    this.state.totalPersonnel = data.totalPersonnel;
                    if (data.totalPersonnel > 0) {
                        this.attributes[0].quantity = data.totalCheckin;
                        this.attributes[0].ratio = Math.floor(data.totalCheckin * 100 / data.totalPersonnel);
                        this.attributes[1].quantity = data.totalLateForWork;
                        this.attributes[1].ratio = Math.floor(data.totalLateForWork * 100 / data.totalPersonnel);
                        this.attributes[2].quantity = data.totalSabbatical;
                        this.attributes[2].ratio = Math.floor(data.totalSabbatical * 100 / data.totalPersonnel);
                        this.attributes[3].quantity = data.totalNotCheckin;
                        this.attributes[3].ratio = Math.floor(data.totalNotCheckin * 100 / data.totalPersonnel);
                    }
                    console.log("GET_DASHBOARD_STATISTICAL", data)
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    render() {
        const { refreshing, company, branch, totalPersonnel, dateCurrent } = this.state;
        console.log("RENDER HOME VIEW");
        let hasHttp = false;
        let avatarCompany = "";
        let branchName = "";
        if (!Utils.isNull(company)) {
            hasHttp = !Utils.isNull(company.avatarPath) && company.avatarPath.indexOf('http') != -1;
            avatarCompany = hasHttp ? company.avatarPath : this.resourceUrlPath.textValue + "/" + global.companyIdAlias + "/" + company.avatarPath;
        }
        if (!Utils.isNull(branch)) {
            branchName = " - " + branch.name;
        }
        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={[commonStyles.header]}>
                        {this.renderHeaderView({
                            visibleBack: false,
                            title: "",
                            visibleAccount: true,
                            userName: !Utils.isNull(company) ? company.name + branchName : '-',
                            source: avatarCompany,
                            gotoLogin: () => {
                                !Utils.isNull(company) && this.props.navigation.navigate("CompanyDetail", {
                                    companyId: company.id
                                });
                            }
                        })}
                    </Header>
                    <Content
                        showsVerticalScrollIndicator={false}
                        enableRefresh={this.state.enableRefresh}
                        refreshControl={
                            <RefreshControl
                                progressViewOffset={Constants.HEIGHT_HEADER_OFFSET_REFRESH}
                                refreshing={refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }
                    >
                        <View style={[commonStyles.viewCenter]}>
                            {/* Calendar */}
                            <ImageBackground source={img_calendar}
                                style={[commonStyles.viewCenter, {
                                    width: screen.width / 2, height: screen.width / 2
                                }]}
                            >
                                <TouchableOpacity
                                    activeOpacity={Constants.ACTIVE_OPACITY}
                                    style={{
                                        paddingHorizontal: Constants.PADDING_XX_LARGE + Constants.MARGIN_LARGE
                                    }}
                                    onPress={this.showCalendarDate}>
                                    <View style={{ flex: 1 }} />
                                    <View style={[commonStyles.viewCenter, { flex: 1 }]}>
                                        <Text style={[commonStyles.textBold, { margin: 0, color: Colors.COLOR_WHITE }]}>
                                            Tháng {DateUtil.convertFromFormatToFormat(dateCurrent, DateUtil.FORMAT_DATE_TIME_ZONE_T, "M")}
                                        </Text>
                                    </View>
                                    <View style={[commonStyles.viewCenter, { flex: 0.75 }]}>
                                        <Text style={[commonStyles.text, { margin: 0 }]}>
                                            {DateUtil.getDateOfWeek(dateCurrent)}
                                        </Text>
                                    </View>
                                    <View style={[commonStyles.viewCenter, { flex: 1 }]}>
                                        <Text style={[commonStyles.textBold, { margin: 0, fontSize: 40 }]}>
                                            {DateUtil.convertFromFormatToFormat(dateCurrent, DateUtil.FORMAT_DATE_TIME_ZONE_T, DateUtil.FORMAT_DAY)}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1.25 }} />
                                </TouchableOpacity>
                            </ImageBackground>
                            {/* Sum staff */}
                            <View style={[commonStyles.viewCenter]}>
                                <Text style={[commonStyles.textBold, { color: Colors.COLOR_BLACK, margin: 0, fontSize: Fonts.FONT_SIZE_X_LARGE }]}>
                                    Tổng nhân sự
                                </Text>
                                <Text style={[commonStyles.textBold, { margin: 0, color: Colors.COLOR_PRIMARY, fontSize: Fonts.FONT_SIZE_X_LARGE }]}>
                                    {totalPersonnel}
                                </Text>
                            </View>
                            {/* Statistical */}
                            <ImageBackground
                                source={img_bg_statistical}
                                style={[commonStyles.viewCenter, {
                                    marginTop: Constants.MARGIN_X_LARGE,
                                    marginBottom: Constants.MARGIN_LARGE,
                                    width: screen.width - Constants.MARGIN_X_LARGE
                                }]}
                            >
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                    {this.attributes.map((item, index) => {
                                        return (
                                            this.renderItem(item, index)
                                        )
                                    })}
                                </View>
                            </ImageBackground>
                        </View>
                    </Content>
                    <CalendarScreen
                        maximumDate={
                            new Date(new Date().setDate(DateUtil.now().getDate()))
                        }
                        dateCurrent={DateUtil.now()}
                        chooseDate={this.chooseDate}
                        ref={ref => (this.showCalendar = ref)}
                    />
                    {this.renderAlertExitApp()}
                    {this.renderAlertVersion()}
                    {this.state.refreshing ? null : this.showLoadingBar(this.props.isLoading)}
                </Root>
            </Container>
        );
    }

    /**
     * Date press
     */
    chooseDate = (day) => {
        this.state.dateCurrent = day;
        this.filter.day = DateUtil.convertFromFormatToFormat(day, DateUtil.FORMAT_DATE_TIME_ZONE_T, DateUtil.FORMAT_DATE_SQL);
        this.props.getDashboardStatistical(this.filter);
    }

    /**
     * Show calendar date
     */
    showCalendarDate = () => {
        this.showCalendar.showDateTimePicker();
    }

    //onRefreshing
    handleRefresh = () => {
        this.setState({ refreshing: true });
        this.getProfile();
        this.handleRequest();
    }

    /**
     * @param {*} item
     * @param {*} index
     */
    renderItem = (item, index) => {
        return (
            <View key={index.toString()}>
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    style={styles.boxStatistical}
                    onPress={() => this.props.navigation.navigate(item.screen, {
                        screenType: item.screen,
                        dashboardType: item.dashboardType,
                        daySelect: this.state.dateCurrent
                    })}>
                    <Image source={item.icon} />
                    <Text style={[commonStyles.text, { margin: 0, opacity: 0.6 }]}>{item.name}</Text>
                    <Text style={[commonStyles.textBold, { margin: 0, color: item.color }]}>{item.quantity}</Text>
                    <Text style={[commonStyles.textSmall, { margin: 0 }]}>{item.ratio}%</Text>
                    <Image source={ic_next_grey} />
                </TouchableOpacity>
            </View>

        );
    }

    /**
     * Render alert Exit App
     */
    renderAlertExitApp() {
        return (
            <DialogCustom
                visible={this.state.isAlertExitApp}
                isVisibleTitle={true}
                isVisibleContentText={true}
                isVisibleTwoButton={true}
                contentTitle={localizes('notification')}
                textBtnOne={localizes('cancelExitApp')}
                textBtnTwo={localizes('exit')}
                contentText={localizes('contentDialogExitApp')}
                onTouchOutside={() => {
                    this.setState({ isAlertExitApp: false });
                }}
                onPressX={() => {
                    this.setState({ isAlertExitApp: false });
                }}
                onPressBtnPositive={() => {
                    BackHandler.exitApp();
                }}
            />
        );
    }

    /**
     * Render alert Version
     */
    renderAlertVersion() {
        if (!Utils.isNull(this.dataVersion)) {
            return (
                <DialogCustom
                    visible={this.state.isAlertVersion}
                    isVisibleTitle={true}
                    isVisibleContentText={true}
                    isVisibleTwoButton={true}
                    contentTitle={localizes("homeView.updateNewVersion")}
                    textBtnOne={this.dataVersion.force === 0 ? localizes("no") : ""}
                    textBtnTwo={localizes("yes")}
                    contentText={this.dataVersion.description}
                    onTouchOutside={() => {
                        this.setState({ isAlertVersion: false });
                    }}
                    onPressX={
                        this.dataVersion.force === 0
                            ? () => {
                                this.setState({ isAlertVersion: false });
                                saveStorage(this.dataVersion);
                            }
                            : null
                    }
                    onPressBtnPositive={() => {
                        renderWebView(this.dataVersion.link);
                        this.setState({ isAlertVersion: false });
                        saveStorage(this.dataVersion);
                    }}
                />
            );
        }
    }

    /**
     * Check update version
     */
    checkUpdateVersion = (data, appVersion) => {
        this.dataVersion = data;
        if (data != null) {
            if (data.version.toString() > DeviceInfo.getVersion()) {
                if (data.force === 0) {
                    if (appVersion != null || appVersion != undefined) {
                        if (appVersion.version !== data.version) {
                            this.setState({ isAlertVersion: true });
                        }
                    } else {
                        this.setState({ isAlertVersion: true });
                    }
                } else {
                    this.setState({ isAlertVersion: true });
                }
            }
        } else {
            StorageUtil.deleteItem(StorageUtil.VERSION);
        }
    };
}

saveStorage = data => {
    StorageUtil.storeItem(StorageUtil.VERSION, data);
};

renderWebView = link => {
    Linking.openURL(link);
};

const mapStateToProps = state => ({
    data: state.home.data,
    isLoading: state.home.isLoading,
    error: state.home.error,
    errorCode: state.home.errorCode,
    action: state.home.action
});

const mapDispatchToProps = {
    ...actions,
    ...timekeepingActions,
    ...companyActions,
    ...commonActions
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(HomeView);
