import NetInfo from '@react-native-community/netinfo';
import {ActionEvent, getActionSuccess} from 'actions/actionEvent';
import * as commonActions from 'actions/commonActions';
import * as faceActions from 'actions/faceActions';
import * as locationActions from 'actions/locationActions';
import * as timekeepingActions from 'actions/timekeepingActions';
import * as actions from 'actions/userActions';
import DialogCustom from 'components/dialogCustom';
import FlatListCustom from 'components/flatListCustom';
import Hr from 'components/hr';
import {DeviceErrorCode} from 'config/deviceErrorCode';
import {ErrorCode} from 'config/errorCode';
import GeoLocationView from 'containers/location/geoLocationView';
import CompanyType from 'enum/companyType';
import notificationType from 'enum/notificationType';
import screenType from 'enum/screenType';
import statusType from 'enum/statusType';
import submitType from 'enum/submitType';
import timekeepingType from 'enum/timekeepingType';
import workingOnSaturdayType from 'enum/workingOnSaturdayType';
import workingTimeShiftType from 'enum/workingTimeShiftType';
import ic_down_grey from 'images/ic_down_grey.png';
import ic_wi_fi_grey from 'images/ic_wi_fi_grey.png';
import {localizes} from 'locales/i18n';
import moment from 'moment';
import {HStack} from 'native-base';
import {
    AppState,
    BackHandler,
    Dimensions,
    Image,
    Linking,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import DeviceInfo from 'react-native-device-info';
import Geolocation from 'react-native-geolocation-service';
import {NetworkInfo} from 'react-native-network-info';
import {connect} from 'react-redux';
import commonStyles from 'styles/commonStyles';
import DateUtil from 'utils/dateUtil';
import StorageUtil from 'utils/storageUtil';
import Utils from 'utils/utils';
import {Colors} from 'values/colors';
import {configConstants} from 'values/configConstants';
import {Constants} from 'values/constants';
import {Fonts} from 'values/fonts';
import ModalAddNote from './modal/modalAddNote';
import ModalWiFiList from './modal/modalWiFiList';
import styles from './styles';
import TimeCurrent from './timeCurrent';
import ItemTimekeeping from './timekeeping/itemTimekeeping';

const alarmNotificationData = {
    vibrate: true,
    play_sound: true,
    schedule_once: true,
    channel: 'bbChannelId',
    small_icon: 'ic_notification',
    data: {type: notificationType.ALARM_NOTIFICATION},
    auto_cancel: false,
};

const dayOffWeek = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
};

const optionsCamera = {
    title: 'Select avatar',
    storageOptions: {
        skipBackup: true,
        path: 'images',
    },
};

const PERSON_GROUP_ID = configConstants.PERSON_GROUP_ID;

const screen = Dimensions.get('window');

class HomeView extends GeoLocationView {
    constructor(props) {
        super(props);
        this.state = {
            company: null,
            appVersion: null,
            enableRefresh: true,
            refreshing: true,
            tvCheck: localizes('timekeeping.tvCheckIn'),
            checkingIn: false,
            timeCheckIn: 0,
            address: null,
            visibleWiFiList: false,
            wiFiName: '-',
            modemMacAddress: null,
            coordinate: null,
            appState: AppState.currentState,
            isAlertVersion: false,
            alarm: null,
            location: {
                latitude: null,
                longitude: null,
            },
            isAlertFaceDetection: false,
            imgPathTimekeeping: null,
            isAlertExitApp: false,
        };
        this.dataVersion = null;
        this.oldCoordinate = null;
        this.dataTimekeeping = [];
        this.wiFiListAllows = [];
        this.workingTimeConfig = null;
        this.wiFiConfigId = null;
        this.showNoData = false;
        this.timekeepingLast = null;
        this.alarmBeforeCheckIn1 = {};
        this.alarmBeforeCheckIn2 = {};
        this.alarmBeforeCheckOut1 = {};
        this.alarmBeforeCheckOut2 = {};

        this.holidayLeave = {};
        this.holidayTime = {};

        this.todaySQL = DateUtil.convertFromFormatToFormat(
            DateUtil.now(),
            DateUtil.FORMAT_DATE_TIME_ZONE_T,
            DateUtil.FORMAT_DATE_SQL,
        );
        this.todayTimeStamp = DateUtil.getTimestamp(DateUtil.now());

        global.onExitApp = this.onExitApp;
        // global.toggleAlarm = this.toggleAlarm;

        this.filter = null;
    }

    /**
     * Press back exit app
     */
    onExitApp = () => {
        this.setState({isAlertExitApp: true});
    };

    /**
     * Result position
     */
    resultPosition() {
        super.resultPosition();
        this.state.location.latitude = this.state.latitude;
        this.state.location.longitude = this.state.longitude;
    }

    /**
     *
     */
    toggleAlarm(alarm) {
        this.setState(
            {
                alarm: alarm,
            },
            () => {
                this.todayTimeStamp = DateUtil.getTimestamp(DateUtil.now());
                this.handleAlarm();
            },
        );
    }

    /**
     * Get profile user
     */
    getProfile() {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE)
            .then(user => {
                //this callback is executed when your Promise is resolved
                if (!Utils.isNull(user)) {
                    console.log('User Storage - Home', user);
                    // this.signInWithCustomToken(user.id);
                    this.state.user = user;
                    let companyId = !Utils.isNull(user.company) ? user.company.id : null;
                    let branchId = !Utils.isNull(user.branch) ? user.branch.id : null;
                    this.props.getConfig({companyId, branchId});
                    this.handleRequest();
                }
            })
            .catch(error => {
                //this callback is executed when your Promise is rejected
                this.saveException(error, 'getProfile');
            });
    }

    // handle get profile
    handleGetProfile(user) {
        this.setState({
            user: user,
            company: user.company,
        });
        global.companyIdAlias = !Utils.isNull(user.company) ? user.company.idAlias : '';
    }

    /**
     * Handle appState change
     */
    handleAppStateChange = nextAppState => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            this.getNetWorkInfo();
        }
        this.setState({appState: nextAppState});
    };

    async componentDidMount() {
        super.componentDidMount();
        const self = this;
        this.props.getUpdateVersion();
        AppState.addEventListener('change', this.handleAppStateChange);
        // Subscribe
        this.unsubscribeNetInfo = NetInfo.addEventListener(state => {
            if (state.isConnected) {
                this.handleRefresh();
            }
        });
        await BackgroundTimer.setInterval(() => {
            if (this.state.checkingIn) {
                this.setState({timeCheckIn: this.state.timeCheckIn + 1});
            }
        }, 1000);
        StorageUtil.retrieveItem(StorageUtil.VERSION)
            .then(version => {
                this.setState({
                    appVersion: version,
                });
            })
            .catch(error => {
                this.saveException(error, 'componentDidMount');
            });
        StorageUtil.retrieveItem(StorageUtil.ALARM)
            .then(alarm => {
                if (!Utils.isNull(alarm)) {
                    this.setState({
                        alarm: alarm,
                    });
                } else {
                    let alarmDefault = {
                        isOn: true,
                    };
                    this.setState({
                        alarm: alarmDefault,
                    });
                }
            })
            .catch(error => {
                this.saveException(error, 'componentDidMount');
            });
        // DeviceEventEmitter.addListener('OnNotificationDismissed', async function (e) {
        //     const obj = JSON.parse(e);
        //     console.log(obj);
        // });

        // DeviceEventEmitter.addListener('OnNotificationOpened', async function (e) {
        //     const obj = JSON.parse(e);
        //     if (obj.data.type == notificationType.ALARM_NOTIFICATION) {
        //     } else {
        //         self.countNewNotification();
        //         self.goToScreen(obj.data);
        //     }
        // });
        if (Platform.OS == 'android') {
            // LocationServicesDialogBox.checkLocationServicesIsEnabled({
            //     message: '<h4>Sử dụng GPS?</h4>Vui lòng bật GPS để truy cập thông tin Wi-Fi!',
            //     ok: 'ĐỒNG Ý',
            //     cancel: 'TỪ CHỐI',
            //     enableHighAccuracy: false, // true => GPS AND NETWORK PROVIDER, false => GPS OR NETWORK PROVIDER
            //     showDialog: true, // false => Opens the Location access page directly
            //     openLocationServices: true, // false => Directly catch method is called if location services are turned off
            //     preventOutSideTouch: true, // true => To prevent the location services window from closing when it is clicked outside
            //     preventBackClick: true, // true => To prevent the location services popup from closing when it is clicked back button
            //     providerListener: true, // true ==> Trigger locationProviderStatusChange listener when the location state changes
            // })
            //     .then(function (success) {
            //         // console.log(success); // success => {alreadyEnabled: false, enabled: true, status: "enabled"}
            //         self.getLocation();
            //     })
            //     .catch(error => {
            //         console.log(error.message); // error.message => "disabled"
            //     });
            // DeviceEventEmitter.addListener('locationProviderStatusChange', function (status) {
            //     // only trigger when "providerListener" is enabled
            //     // console.log("locationProviderStatusChange", status); //  status => {enabled: false, status: "disabled"} or {enabled: true, status: "enabled"}
            //     self.getLocation();
            //     self.getNetWorkInfo();
            // });
        }
        // this.props.trainingPersonGroup(PERSON_GROUP_ID);
    }

    /**
     * Handle request
     */
    handleRequest() {
        let timeout = 1000;
        let timeOutRequestOne = setTimeout(() => {
            this.props.getWiFiConfig();
            clearTimeout(timeOutRequestOne);
        }, timeout);
        let timeOutRequestTwo = setTimeout(() => {
            this.props.getTimekeeping();
            clearTimeout(timeOutRequestTwo);
        }, (timeout += timeout));
    }

    /**
     * Get net work info
     */
    async getNetWorkInfo() {
        if (Platform.OS == 'ios') {
            Geolocation.requestAuthorization();
        }
        const wiFiName = await NetworkInfo.getSSID();
        let modemMacAddress = await NetworkInfo.getBSSID();
        let res = modemMacAddress.split(':');
        for (let i = 0; i < res.length; i++) {
            let element = res[i];
            if (element.length === 1) {
                res[i] = '0' + element;
            }
        }
        modemMacAddress = res.join(':');
        this.setState({wiFiName, modemMacAddress});
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        // AppState.removeEventListener('change', this.handleAppStateChange);
        // DeviceEventEmitter.removeListener('OnNotificationDismissed');
        // DeviceEventEmitter.removeListener('OnNotificationOpened');
        // used only when "providerListener" is enabled
        if (Platform.OS == 'android') {
            // LocationServicesDialogBox.stopListener();
        } // Stop the "locationProviderStatusChange" listener
        this.unsubscribeNetInfo();
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.userInfo;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.GET_UPDATE_VERSION)) {
                    this.checkUpdateVersion(data, this.state.appVersion);
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_USER_INFO)) {
                    StorageUtil.storeItem(StorageUtil.USER_PROFILE, data);
                    if (!Utils.isNull(data)) {
                        if (data.status == statusType.ACTIVE) {
                            this.handleGetProfile(data);
                        }
                        if (
                            data.status == statusType.DELETE ||
                            data.status == statusType.SUSPENDED ||
                            Utils.isNull(data.userLoginLog)
                        ) {
                            console.log('GET_USER_INFO', data);
                            this.logout();
                            this.goLoginScreen();
                        }
                    }
                } else if (this.props.action == ActionEvent.NOTIFY_LOGIN_SUCCESS) {
                    this.getProfile();
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_CONFIG)) {
                    this.configList = data;
                    StorageUtil.storeItem(StorageUtil.MOBILE_CONFIG, this.configList);
                    this.getSourceUrlPath();
                    this.getCheckInRule();
                    this.getMinutesAbleTimekeeping();
                    this.getMinutesRemindTimekeeping();
                    this.getHoliday();
                    this.props.getUserProfile(this.state.user.id);
                    this.props.getWorkingTimeConfig();
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_MY_LOCATION)) {
                    if (!Utils.isNull(data)) {
                        if (data.status == 'OK' && !Utils.isNull(data.results)) {
                            this.setState({
                                address: data.results[0].formatted_address,
                            });
                            this.setCoordinate(data.results[0].geometry);
                        }
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_TIMEKEEPING)) {
                    this.state.imgPathTimekeeping = null;
                    this.state.refreshing = false;
                    if (!Utils.isNull(data)) {
                        if (!Utils.isNull(data.today)) {
                            this.todaySQL = DateUtil.convertFromFormatToFormat(
                                data.today,
                                DateUtil.FORMAT_DATE_TIME_ZONE,
                                DateUtil.FORMAT_DATE_SQL,
                            );
                            this.todayTimeStamp = DateUtil.getTimestamp(
                                DateUtil.convertFromFormatToFormat(
                                    data.today,
                                    DateUtil.FORMAT_DATE_TIME_ZONE,
                                    DateUtil.FORMAT_DATE_TIME_ZONE_T,
                                ),
                            );
                        }
                        if (!Utils.isNull(data.timekeepingRecord)) {
                            this.timekeepingLast = data.timekeepingRecord[data.timekeepingRecord.length - 1];
                            this.dataTimekeeping = data.timekeepingRecord;
                            data.timekeepingRecord.forEach((item, index) => {
                                if (Utils.isNull(item.checkOutTime)) {
                                    let timeCheckIn = DateUtil.getTimestamp(
                                        DateUtil.convertFromFormatToFormat(
                                            this.todaySQL + ' ' + item.checkInTime,
                                            DateUtil.FORMAT_DATE_TIMES,
                                            DateUtil.FORMAT_DATE_TIME_ZONE_T,
                                        ),
                                    );
                                    this.handleStateCheckOut((this.todayTimeStamp - timeCheckIn) / 1000);
                                } else {
                                    this.handleStateCheckIn(0);
                                }
                            });
                        } else {
                            this.timekeepingLast = null;
                            this.dataTimekeeping = [];
                            this.handleStateCheckIn(0);
                        }
                    }
                    this.showNoData = true;
                } else if (this.props.action == getActionSuccess(ActionEvent.TIMEKEEPING)) {
                    this.timekeepingLast = data;
                    if (!Utils.isNull(data)) {
                        if (!this.state.checkingIn) {
                            // Check in
                            this.dataTimekeeping.forEach((item, index) => {
                                if (item.checkInTime == data.checkInTime) {
                                    this.dataTimekeeping.splice(index, 1);
                                }
                            });
                            this.dataTimekeeping.push({...data});
                            this.handleStateCheckOut(0);
                        } else {
                            this.dataTimekeeping.forEach((item, index) => {
                                if (item.id == data.id) {
                                    // Check out
                                    if (data.status == statusType.ACTIVE) {
                                        this.dataTimekeeping.splice(index, 1, data);
                                    } else {
                                        this.dataTimekeeping.splice(index, 1);
                                    }
                                    this.handleStateCheckIn(0);
                                }
                            });
                        }
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_WI_FI_CONFIG)) {
                    this.wiFiListAllows = data;
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_WORKING_TIME_CONFIG)) {
                    if (!Utils.isNull(data)) {
                        this.workingTimeConfig = data;
                        this.todayTimeStamp = DateUtil.getTimestamp(DateUtil.now());
                        this.handleAlarm();
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_TIME_TODAY)) {
                    if (!Utils.isNull(data) && this.props.screen == screenType.FROM_HOME_VIEW) {
                        this.todayTimeStamp = DateUtil.getTimestamp(
                            DateUtil.convertFromFormatToFormat(
                                data,
                                DateUtil.FORMAT_DATE_TIME_ZONE,
                                DateUtil.FORMAT_DATE_TIME_ZONE_T,
                            ),
                        );
                        let todayClient = DateUtil.getTimestamp(DateUtil.now());
                        if (Math.abs(todayClient - this.todayTimeStamp) < 120000) {
                            this.filter = {
                                checkNote: null,
                                timekeepingType: timekeepingType.NORMAL,
                            };
                            this.timekeeping();
                        } else {
                            this.showMessage(localizes('homeView.notWrongTime'));
                        }
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.TRAINING_PERSON_GROUP)) {
                    if (data.status == 202) {
                        // console.log("training thành công");
                    } else {
                        // console.log("training thất bại");
                    }
                }
            } else if (this.props.errorCode == ErrorCode.BUS_USER_ALREADY_CHECK_IN) {
                this.showMessage('Bạn đã được Checkout hộ rồi!');
                this.props.getTimekeeping();
            } else if (this.props.errorCode == ErrorCode.BUS_USER_ALREADY_CHECK_OUT) {
                this.showMessage('Bạn đã được Checkin hộ rồi!');
                this.props.getTimekeeping();
            } else if (this.props.errorCode == ErrorCode.BUS_USER_HAS_ALREADY_BEEN_REMOVED_FROM_THE_DEVICE) {
                this.logout();
                this.goLoginScreen();
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    setAlarm = alarmData => {
        // const details = {...alarmData, ...alarmNotificationData};
        // ReactNativeAN.scheduleAlarm(details);
    };

    getAlarms = () => {
        // if (Platform.OS == 'android') {
        //     ReactNativeAN.getScheduledAlarms().then(alarms => {});
        // }
    };

    dateDiff(first, second) {
        // Take the difference between the dates and divide by milliseconds per day.
        // Round to nearest whole number to deal with DST.
        return Math.round((second - first) / (1000 * 60 * 60 * 24));
    }

    /**
     * Handle alarm
     */
    handleAlarm() {
        const {alarm} = this.state;
        const {nextDay} = this.workingTimeConfig;

        let minuteAlarmCheckIn1 = !Utils.isNull(this.alarmBeforeCheckIn1.numericValue)
            ? this.alarmBeforeCheckIn1.numericValue
            : 0;
        let minuteAlarmCheckOut1 = !Utils.isNull(this.alarmBeforeCheckOut1.numericValue)
            ? this.alarmBeforeCheckOut1.numericValue
            : 0;
        let minuteAlarmCheckIn2 = !Utils.isNull(this.alarmBeforeCheckIn2.numericValue)
            ? this.alarmBeforeCheckIn2.numericValue
            : 0;
        let minuteAlarmCheckOut2 = !Utils.isNull(this.alarmBeforeCheckOut2.numericValue)
            ? this.alarmBeforeCheckOut2.numericValue
            : 0;

        let days = [];
        let dayOffs = [];
        let hasWorkingOnSaturday = false;

        let holidayLeave = !Utils.isNull(this.holidayLeave.textValue) ? JSON.parse(this.holidayLeave.textValue) : [];
        let holidayTime = !Utils.isNull(this.holidayTime.textValue) ? JSON.parse(this.holidayTime.textValue) : {};

        let year = DateUtil.convertFromFormatToFormat(this.todaySQL, DateUtil.FORMAT_DATE_SQL, DateUtil.FORMAT_YEAR);
        let month = DateUtil.convertFromFormatToFormat(this.todaySQL, DateUtil.FORMAT_DATE_SQL, DateUtil.FORMAT_MONTH);
        let today = DateUtil.convertFromFormatToFormat(this.todaySQL, DateUtil.FORMAT_DATE_SQL, DateUtil.FORMAT_DAY);

        // Handle working time
        if (holidayTime.firstDayOfWeek > dayOffWeek.SUNDAY) {
            for (let index = 0; index < holidayTime.firstDayOfWeek; index++) {
                dayOffs.push(...DateUtil.getAllDayByDayOfWeek(year, month, today, index));
            }
        }
        if (holidayTime.lastDayOfWeek < dayOffWeek.SATURDAY) {
            for (let index = 0; index < dayOffWeek.SATURDAY - holidayTime.lastDayOfWeek; index++) {
                dayOffs.push(
                    ...DateUtil.getAllDayByDayOfWeek(year, month, today, index + holidayTime.lastDayOfWeek + 1),
                );
            }
        } else {
            hasWorkingOnSaturday = true;
        }

        // Handle holiday leave
        holidayLeave.forEach(item => {
            let fromDate = DateUtil.convertFromFormatToFormat(
                item.fromDate + '/' + year,
                DateUtil.FORMAT_DATE,
                DateUtil.FORMAT_DATE_TIME_ZONE_T,
            );
            let toDate = DateUtil.convertFromFormatToFormat(
                item.toDate + '/' + year,
                DateUtil.FORMAT_DATE,
                DateUtil.FORMAT_DATE_TIME_ZONE_T,
            );
            let numFromDateToDate = this.dateDiff(new Date(fromDate), new Date(toDate));
            if (numFromDateToDate > 0) {
                for (let index = 0; index <= numFromDateToDate; index++) {
                    let date = new Date(new Date(fromDate).setDate(new Date(fromDate).getDate() + index));
                    dayOffs.push(
                        DateUtil.convertFromFormatToFormat(date, DateUtil.FORMAT_DATE_TIME_ZONE_T, 'DD-MM-YYYY'),
                    );
                }
            } else {
                dayOffs.push(
                    DateUtil.convertFromFormatToFormat(fromDate, DateUtil.FORMAT_DATE_TIME_ZONE_T, 'DD-MM-YYYY'),
                );
            }
        });

        // On/Off alarm 7 day
        if (!Utils.isNull(alarm)) {
            if (alarm.isOn) {
                let alarmTime = this.workingTimeConfig;
                let fromDate = DateUtil.convertFromFormatToFormat(
                    alarmTime.day,
                    DateUtil.FORMAT_DATE_SQL,
                    DateUtil.FORMAT_DATE_TIME_ZONE_T,
                );
                for (let index = 0; index <= dayOffWeek.SATURDAY; index++) {
                    let date = new Date(new Date(fromDate).setDate(new Date(fromDate).getDate() + index));
                    let dateSql = DateUtil.convertFromFormatToFormat(
                        date,
                        DateUtil.FORMAT_DATE_TIME_ZONE_T,
                        DateUtil.FORMAT_DATE_SQL,
                    );
                    if (!Utils.isNull(nextDay) && dateSql === nextDay.validFrom) {
                        alarmTime = nextDay;
                    }
                    days.push({...alarmTime, day: dateSql});
                }
                days = Platform.OS == 'android' ? days : [this.workingTimeConfig];
            }
        }

        // Clear before save new alarm
        // this.clearAlarm();

        // Handle save alarm
        days.forEach(item => {
            const {day, startWorkingTime1, endWorkingTime1, startWorkingTime2, endWorkingTime2} = item;

            let formatDay = DateUtil.convertFromFormatToFormat(day, DateUtil.FORMAT_DATE_SQL, 'DD-MM-YYYY');
            let toDayId = DateUtil.convertFromFormatToFormat(day, DateUtil.FORMAT_DATE_SQL, 'DDMMYYYY');
            let dayTimeT = DateUtil.convertFromFormatToFormat(
                day,
                DateUtil.FORMAT_DATE_SQL,
                DateUtil.FORMAT_DATE_TIME_ZONE_T,
            );

            if (hasWorkingOnSaturday && new Date(dayTimeT).getDay() == dayOffWeek.SATURDAY) {
                let workingOnSaturday = holidayTime.workingOnSaturday || {};
                if (workingOnSaturday.workingType == workingOnSaturdayType.RESTART_EACH_MONTH) {
                    // Alternate saturday off restart each month
                    let firstWorkingOnSaturdayWeekInMonth = workingOnSaturday.firstWorkingOnSaturdayWeekInMonth;
                    if (firstWorkingOnSaturdayWeekInMonth != DateUtil.getISOWeekInMonth(new Date(dayTimeT)).week) {
                        let saturdayOffs = [];
                        saturdayOffs.push(...DateUtil.getAllDayByDayOfWeek(year, month, today, dayOffWeek.SATURDAY));
                        saturdayOffs = saturdayOffs.filter(item => {
                            return (
                                DateUtil.getISOWeekInMonth(
                                    new Date(
                                        DateUtil.convertFromFormatToFormat(
                                            item,
                                            'DD-MM-YYYY',
                                            DateUtil.FORMAT_DATE_TIME_ZONE_T,
                                        ),
                                    ),
                                ).week != firstWorkingOnSaturdayWeekInMonth
                            );
                        });
                        dayOffs.push(...saturdayOffs);
                    }
                } else if (workingOnSaturday.workingType == workingOnSaturdayType.STARTING_FROM_A_DATE) {
                    // Alternate saturday off starting from a date "firstSaturdayOn"
                    let firstSaturdayOn = workingOnSaturday.firstSaturdayOn;
                    let numOfSaturday = DateUtil.convertFromFormatToFormat(
                        firstSaturdayOn,
                        DateUtil.FORMAT_DATE_SQL,
                        DateUtil.FORMAT_DAY,
                    );
                    let saturdayOffs = [];
                    saturdayOffs.push(
                        ...DateUtil.getAllDayByDayOfWeek(year, month, numOfSaturday, dayOffWeek.SATURDAY),
                    );
                    saturdayOffs = saturdayOffs.filter((item, index) => {
                        return index % 2 != 0;
                    });
                    dayOffs.push(...saturdayOffs);
                } else if (workingOnSaturday.workingType == workingOnSaturdayType.FOR_WEEKS) {
                    // For weeks
                    let forWeeks = workingOnSaturday.forWeeks;
                    let saturdayOffs = [];
                    saturdayOffs.push(...DateUtil.getAllDayByDayOfWeek(year, month, today, dayOffWeek.SATURDAY));
                    forWeeks.forEach(numWeek => {
                        if (numWeek != DateUtil.getISOWeekInMonth(new Date(dayTimeT)).week) {
                            saturdayOffs = saturdayOffs.filter(item => {
                                return (
                                    DateUtil.getISOWeekInMonth(
                                        new Date(
                                            DateUtil.convertFromFormatToFormat(
                                                item,
                                                'DD-MM-YYYY',
                                                DateUtil.FORMAT_DATE_TIME_ZONE_T,
                                            ),
                                        ),
                                    ).week != numWeek
                                );
                            });
                        }
                    });
                    dayOffs.push(...saturdayOffs);
                }
                if (workingOnSaturday.shiftType == workingTimeShiftType.PARTLY_WORKING_DAY) {
                    if (workingOnSaturday.shift == 1) {
                        minuteAlarmCheckIn2 = 0;
                        minuteAlarmCheckOut2 = 0;
                    } else if (workingOnSaturday.shift == 2) {
                        minuteAlarmCheckIn1 = 0;
                        minuteAlarmCheckOut1 = 0;
                    }
                }
            }

            if (!dayOffs.includes(formatDay)) {
                if (!Utils.isNull(startWorkingTime1) && minuteAlarmCheckIn1 > 0) {
                    let alarmCheckIn1 =
                        this.formatWorkingTime(startWorkingTime1, day) - minuteAlarmCheckIn1 * 1000 * 60;
                    if (alarmCheckIn1 > this.todayTimeStamp) {
                        let message = 'Còn ' + minuteAlarmCheckIn1 + ' phút nữa tới giờ checkin';
                        if (Platform.OS == 'android' && Platform.Version >= 26) {
                            let alarmData = {
                                id: alarmCheckIn1.toString(),
                                title: 'Check in',
                                message: message,
                                fire_date: formatDay + ' ' + DateUtil.convertTimestampToDate(alarmCheckIn1),
                            };
                            // this.setAlarm(alarmData);
                        } else {
                            // RNAlarm.setAlarm(
                            //     alarmCheckIn1.toString(),
                            //     message,
                            //     'YES',
                            //     '',
                            //     () => {
                            //         console.log('Event triggered');
                            //     },
                            //     () => {
                            //         console.log('Event trigger Failed');
                            //     },
                            // );
                        }
                    }
                }
                if (!Utils.isNull(endWorkingTime1) && minuteAlarmCheckOut1 > 0) {
                    let alarmCheckOut1 =
                        this.formatWorkingTime(endWorkingTime1, day) - minuteAlarmCheckOut1 * 1000 * 60;
                    if (alarmCheckOut1 > this.todayTimeStamp) {
                        let message = 'Còn ' + minuteAlarmCheckOut1 + ' phút nữa tới giờ checkout';
                        if (Platform.OS == 'android' && Platform.Version >= 26) {
                            let alarmData = {
                                id: alarmCheckOut1.toString(),
                                title: 'Check out',
                                message: message,
                                fire_date: formatDay + ' ' + DateUtil.convertTimestampToDate(alarmCheckOut1),
                            };
                            // this.setAlarm(alarmData);
                        } else {
                            // RNAlarm.setAlarm(
                            //     alarmCheckOut1.toString(),
                            //     message,
                            //     'YES',
                            //     '',
                            //     () => {
                            //         console.log('Event triggered');
                            //     },
                            //     () => {
                            //         console.log('Event trigger Failed');
                            //     },
                            // );
                        }
                    }
                }
                if (!Utils.isNull(startWorkingTime2) && minuteAlarmCheckIn2 > 0) {
                    let alarmCheckIn2 =
                        this.formatWorkingTime(startWorkingTime2, day) - minuteAlarmCheckIn2 * 1000 * 60;
                    if (alarmCheckIn2 > this.todayTimeStamp) {
                        let message = 'Còn ' + minuteAlarmCheckIn2 + ' phút nữa tới giờ checkin';
                        if (Platform.OS == 'android' && Platform.Version >= 26) {
                            let alarmData = {
                                id: alarmCheckIn2.toString(),
                                title: 'Check in',
                                message: message,
                                fire_date: formatDay + ' ' + DateUtil.convertTimestampToDate(alarmCheckIn2),
                            };
                            // this.setAlarm(alarmData);
                        } else {
                            // RNAlarm.setAlarm(
                            //     alarmCheckIn2.toString(),
                            //     message,
                            //     'YES',
                            //     '',
                            //     () => {
                            //         console.log('Event triggered');
                            //     },
                            //     () => {
                            //         console.log('Event trigger Failed');
                            //     },
                            // );
                        }
                    }
                }
                if (!Utils.isNull(endWorkingTime2) && minuteAlarmCheckOut2 > 0) {
                    let alarmCheckOut2 =
                        this.formatWorkingTime(endWorkingTime2, day) - minuteAlarmCheckOut2 * 1000 * 60;
                    if (alarmCheckOut2 > this.todayTimeStamp) {
                        let message = 'Còn ' + minuteAlarmCheckOut2 + ' phút nữa tới giờ checkout';
                        if (Platform.OS == 'android' && Platform.Version >= 26) {
                            let alarmData = {
                                id: alarmCheckOut2.toString(),
                                title: 'Check out',
                                message: message,
                                fire_date: formatDay + ' ' + DateUtil.convertTimestampToDate(alarmCheckOut2),
                            };
                            // this.setAlarm(alarmData);
                        } else {
                            // RNAlarm.setAlarm(
                            //     alarmCheckOut2.toString(),
                            //     message,
                            //     'YES',
                            //     '',
                            //     () => {
                            //         console.log('Event triggered');
                            //     },
                            //     () => {
                            //         console.log('Event trigger Failed');
                            //     },
                            // );
                        }
                    }
                }
            }
        });
        this.getAlarms();
    }

    /**
     * Handle state check in
     */
    handleStateCheckIn(time) {
        this.setState({
            tvCheck: localizes('timekeeping.tvCheckIn'),
            timeCheckIn: time,
            checkingIn: false,
        });
    }

    /**
     * Handle state check out
     */
    handleStateCheckOut(time) {
        this.setState({
            tvCheck: localizes('timekeeping.tvCheckOut'),
            timeCheckIn: time,
            checkingIn: true,
        });
    }

    /**
     * Get Coordinate in map
     */
    setCoordinate(geometry) {
        if (!Utils.isNull(geometry)) {
            if (this.oldCoordinate != geometry.location.lat) {
                this.oldCoordinate = geometry.location.lat;
                let coordinate = {
                    latitude: geometry.location.lat,
                    longitude: geometry.location.lng,
                };
                this.setState({coordinate});
            }
        }
    }

    /**
     * Toggle wiFi list
     */
    toggleWiFiList = () => {
        this.setState({visibleWiFiList: !this.state.visibleWiFiList});
    };

    /**
     * Is wi-fi allows
     */
    isWiFiAllows() {
        const {modemMacAddress} = this.state;
        if (
            this.wiFiListAllows.some(item => {
                if (item.modemMacAddress.slice(0, -1) == modemMacAddress.slice(0, -1)) {
                    this.wiFiConfigId = item.id;
                }
                return item.modemMacAddress.slice(0, -1) == modemMacAddress.slice(0, -1);
            })
        ) {
            return true;
        }
        return false;
    }

    /**
     * Requite location
     */
    requiteLocation() {
        const {checkingIn, location} = this.state;
        let checkInRule = !Utils.isNull(this.checkInRule.textValue) ? JSON.parse(this.checkInRule.textValue) : {};
        let requireGpsOnCheck = null;
        if (checkingIn) {
            requireGpsOnCheck = checkInRule.requireGpsOnCheckout;
        } else {
            requireGpsOnCheck = checkInRule.requireGpsOnCheckin;
        }
        if (!Utils.isNull(requireGpsOnCheck)) {
            if (requireGpsOnCheck === 0) {
                return false;
            } else {
                if (!Utils.isNull(location.longitude) && !Utils.isNull(location.latitude)) {
                    return false;
                } else {
                    return true;
                }
            }
        } else {
            return false;
        }
    }

    /**
     * Face recognize enable
     */
    faceRecognizeEnable(faceRecognize) {
        const {company} = this.state;
        return faceRecognize.enable === 1 && company.type === CompanyType.ADVANCED;
    }

    /**
     * Is in working time
     */
    isInWorkingTime(checkInTimeLastTimestamp) {
        let _59s = 59000;
        let _60s = 60000;
        let minuteBeforeCheckIn1 = !Utils.isNull(this.minuteBeforeCheckIn1.numericValue)
            ? this.minuteBeforeCheckIn1.numericValue * 1000 * 60
            : 0;
        let minuteBeforeCheckIn2 = !Utils.isNull(this.minuteBeforeCheckIn2.numericValue)
            ? this.minuteBeforeCheckIn2.numericValue * 1000 * 60
            : 0;
        let minuteAfterCheckOut1 = !Utils.isNull(this.minuteAfterCheckOut1.numericValue)
            ? this.minuteAfterCheckOut1.numericValue * 1000 * 60
            : 0;
        let minuteAfterCheckOut2 = !Utils.isNull(this.minuteAfterCheckOut2.numericValue)
            ? this.minuteAfterCheckOut2.numericValue * 1000 * 60
            : 0;

        const {startWorkingTime1, endWorkingTime1, startWorkingTime2, endWorkingTime2} = this.workingTimeConfig;
        let start1 = this.formatWorkingTime(startWorkingTime1);
        let end1 = this.formatWorkingTime(endWorkingTime1);
        let start2 = this.formatWorkingTime(!Utils.isNull(startWorkingTime2) ? startWorkingTime2 : startWorkingTime1);
        let end2 = this.formatWorkingTime(!Utils.isNull(endWorkingTime2) ? endWorkingTime2 : endWorkingTime1);
        if (!Utils.isNull(checkInTimeLastTimestamp)) {
            end1 = end1 + minuteAfterCheckOut1;
            end2 = end2 + minuteAfterCheckOut2;
            start2 = start2 - minuteBeforeCheckIn2;
            if (
                (checkInTimeLastTimestamp < end1 && this.todayTimeStamp <= end1 + _59s) ||
                (checkInTimeLastTimestamp < end2 &&
                    checkInTimeLastTimestamp >= start2 &&
                    this.todayTimeStamp <= end2 + _59s)
            ) {
                return true;
            } else {
                return false;
            }
        } else {
            start1 = start1 - minuteBeforeCheckIn1;
            if (start2 - minuteBeforeCheckIn2 <= end1) {
                start2 = end1 + _60s;
            } else {
                start2 = start2 - minuteBeforeCheckIn2;
            }
            if (
                (start1 <= this.todayTimeStamp && this.todayTimeStamp < end1) ||
                (start2 <= this.todayTimeStamp && this.todayTimeStamp < end2)
            ) {
                return true;
            } else {
                return false;
            }
        }
    }

    /**
     * Is timekeeping
     */
    isTimekeeping() {
        let checkOutTimeLastTimestamp = null;
        if (!Utils.isNull(this.timekeepingLast)) {
            if (!Utils.isNull(this.timekeepingLast.checkOutTime)) {
                checkOutTimeLastTimestamp = this.formatWorkingTime(this.timekeepingLast.checkOutTime);
            }
        }
        if (!Utils.isNull(checkOutTimeLastTimestamp)) {
            if (this.todayTimeStamp > checkOutTimeLastTimestamp) {
                return false;
            } else {
                let error = {
                    message:
                        'todayTimeStamp: ' +
                        this.todayTimeStamp +
                        ', checkOutTimeLastTimestamp: ' +
                        checkOutTimeLastTimestamp +
                        ', todaySQL ' +
                        this.todaySQL,
                };
                this.saveException(error, 'isTimekeeping');
                return true;
            }
        } else {
            return false;
        }
    }

    /**
     * Format working time
     * @param {*} workingTime
     */
    formatWorkingTime(workingTime, day) {
        let dayWorking = !Utils.isNull(day) ? day : this.todaySQL;
        if (!Utils.isNull(workingTime)) {
            return DateUtil.getTimestamp(
                DateUtil.convertFromFormatToFormat(
                    dayWorking + ' ' + workingTime,
                    DateUtil.FORMAT_DATE_TIMES,
                    DateUtil.FORMAT_DATE_TIME_ZONE_T,
                ),
            );
        } else {
            return 0;
        }
    }

    /**
     * Timekeeping
     */
    timekeeping() {
        const {checkingIn, tvCheck, modemMacAddress} = this.state;
        let _59s = 59000;
        let checkInTimeLastTimestamp = null;
        if (!Utils.isNull(this.timekeepingLast)) {
            if (Utils.isNull(this.timekeepingLast.checkOutTime)) {
                checkInTimeLastTimestamp = this.formatWorkingTime(this.timekeepingLast.checkInTime);
            }
        }
        if (Utils.isNull(this.wiFiListAllows)) {
            this.showMessage(localizes('homeView.notWiFi'));
        } else if (Utils.isNull(this.workingTimeConfig)) {
            this.showMessage(localizes('homeView.notShift'));
        } else {
            let checkInRule = !Utils.isNull(this.checkInRule.textValue) ? JSON.parse(this.checkInRule.textValue) : {};
            let faceRecognize = checkInRule.faceRecognize || {};
            let isWiFiAllows = !Utils.isNull(modemMacAddress) ? this.isWiFiAllows() : false;
            if (this.isTimekeeping()) {
                this.showMessage(localizes('homeView.isTimekeeping'));
            }
            // else if (checkInTimeLastTimestamp + _59s > this.todayTimeStamp) {
            //     this.showMessage(localizes("homeView.noComeToWorkTime"))
            // }
            else if (this.requiteLocation()) {
                this.showMessage('Chưa lấy được vị trí của bạn, vui lòng kiểm tra lại GPS!');
            } else if (
                !this.isInWorkingTime(checkInTimeLastTimestamp) &&
                this.filter.timekeepingType == timekeepingType.NORMAL
            ) {
                if (checkingIn) {
                    this.refs.modalAddNote.showModal(
                        localizes('homeView.reasonCheckOutWorkTime') + tvCheck + '!',
                        timekeepingType.OUT_OFF_WORKING_TIME,
                    );
                } else {
                    this.showMessage(localizes('homeView.noComeToWorkTime'));
                }
            } else if (!isWiFiAllows && this.filter.timekeepingType == timekeepingType.NORMAL) {
                this.refs.modalAddNote.showModal(
                    localizes('homeView.wiFiOutList') + tvCheck + '!',
                    timekeepingType.CONNECTED_TO_INCORRECT_WI_FI,
                );
            }
            // else if (this.faceRecognizeEnable(faceRecognize)) {
            //     this.showFaceDetection(faceRecognize);
            // }
            else {
                this.check();
            }
        }
    }

    /**
     * Show face detection
     */
    showFaceDetection = faceRecognize => {
        const {tvCheck, user} = this.state;
        this.props.navigation.navigate('FaceDetection', {
            type: 0,
            group: PERSON_GROUP_ID,
            confidenceThreshold: faceRecognize.threshold,
            callback: (countScanFace, confidence) => {
                if (countScanFace < 3) {
                    this.check(confidence);
                } else {
                    this.setState({isAlertFaceDetection: true});
                }
            },
            personIdOfUser: user.personId,
        });
    };

    /**
     * Check
     */
    check = (personalIdAccuracy = 0) => {
        const {checkingIn, wiFiName, modemMacAddress, imgPathTimekeeping} = this.state;
        DeviceInfo.getMacAddress().then(mac => {
            this.props.timekeeping({
                wiFiConfigId: this.wiFiConfigId,
                deviceInfo: {
                    appVersion: DeviceInfo.getVersion(),
                    osVersion: DeviceInfo.getSystemVersion(),
                    model: DeviceInfo.getModel(),
                    macAddress: mac.toLowerCase(),
                    serial: null,
                    imei1: null,
                    imei2: null,
                },
                submitType: this.getSubmitType(this.filter.timekeepingType),
                type: this.filter.timekeepingType,
                note: this.filter.checkNote,
                gpsLatitude: this.state.location.latitude,
                gpsLongitude: this.state.location.longitude,
                timekeepingMeta: {
                    deviceErrorCode: DeviceErrorCode.NO_ERROR,
                    wiFiName: wiFiName,
                    modemMacAddress: modemMacAddress,
                    personalIdAccuracy: personalIdAccuracy,
                },
                checkingIn: checkingIn,
                imgPath: imgPathTimekeeping,
            });
        });
    };

    /**
     * Get submit type
     */
    getSubmitType(type) {
        if (type != timekeepingType.NORMAL) {
            return submitType.WEB_ADMIN;
        } else {
            return submitType.AUTO_BY_DEVICE;
        }
    }

    render() {
        const {tvCheck, timeCheckIn, address, wiFiName, visibleWiFiList, refreshing, checkingIn, company} = this.state;
        let hasHttp = false;
        let avatarCompany = '';
        if (!Utils.isNull(company)) {
            hasHttp = !Utils.isNull(company.avatarPath) && company.avatarPath.indexOf('http') != -1;
            avatarCompany = hasHttp
                ? company.avatarPath
                : this.resourceUrlPathResize.textValue + '=' + global.companyIdAlias + '/' + company.avatarPath;
        }
        console.log('Home view');
        return (
            <SafeAreaView style={styles.container}>
                <View style={{flex: 1}}>
                    <HStack style={[commonStyles.header]}>
                        {this.renderHeaderView({
                            visibleBack: false,
                            title: localizes('timekeeping.title'),
                            titleStyle: {color: Colors.COLOR_WHITE},
                            visibleNotification: true,
                            gotoNotification: this.gotoNotification,
                        })}
                    </HStack>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        enableRefresh={this.state.enableRefresh}
                        refreshControl={
                            <RefreshControl
                                progressViewOffset={Constants.HEIGHT_HEADER_OFFSET_REFRESH}
                                refreshing={refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }>
                        <TouchableOpacity
                            activeOpacity={Constants.ACTIVE_OPACITY}
                            onPress={() => {
                                if (!Utils.isNull(company))
                                    this.props.navigation.navigate('CompanyDetail', {
                                        companyId: company.id,
                                    });
                            }}
                            style={styles.company}>
                            {/* <ImageLoader
                                style={[styles.imageSize]}
                                resizeAtt={hasHttp ? null : {
                                    type: "thumbnail",
                                    width: Constants.HEADER_HEIGHT - Constants.MARGIN_LARGE,
                                    height: Constants.HEADER_HEIGHT - Constants.MARGIN_LARGE
                                }}
                                resizeModeType={"cover"}
                                path={avatarCompany}
                            /> */}
                            <Text
                                numberOfLines={1}
                                style={[commonStyles.text, {flex: 1, fontSize: Fonts.FONT_SIZE_X_MEDIUM}]}>
                                {!Utils.isNull(company) ? company.name : '-'}
                            </Text>
                        </TouchableOpacity>
                        {/* Check in, check out */}
                        <View style={styles.boxCheck}>
                            <TouchableOpacity
                                activeOpacity={Constants.ACTIVE_OPACITY}
                                onPress={() => this.toggleWiFiList()}
                                style={[commonStyles.viewHorizontal, {alignItems: 'center'}]}>
                                <Image source={ic_wi_fi_grey} />
                                <View style={{flex: 1, marginHorizontal: Constants.MARGIN_X_LARGE}}>
                                    <Text
                                        style={[
                                            commonStyles.text,
                                            {fontSize: Fonts.FONT_SIZE_SMALL, margin: 0, marginBottom: -2},
                                        ]}>
                                        {localizes('homeView.wifi')}
                                    </Text>
                                    <Text style={[commonStyles.text, {margin: 0, marginTop: -1}]}>
                                        {!Utils.isNull(wiFiName) ? wiFiName : '-'}
                                    </Text>
                                </View>
                                <Image source={ic_down_grey} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={Constants.ACTIVE_OPACITY}
                                onPress={() =>
                                    !this.props.isLoading && !refreshing ? this.handleRequestTimekeeping() : null
                                }
                                style={styles.buttonCheck}>
                                <Text style={styles.textInCheck}>{checkingIn ? 'TAN CA' : 'VÀO LÀM'}</Text>
                                <Text
                                    style={[
                                        styles.textInCheck,
                                        {
                                            opacity: Constants.OPACITY_50,
                                        },
                                    ]}>
                                    {timeCheckIn > 0 ? DateUtil.parseMillisecondToTime(timeCheckIn * 1000) : '00:00'}
                                </Text>
                            </TouchableOpacity>
                            {/* <Text style={styles.textAddress}>{address}</Text> */}
                            {!Utils.isNull(this.workingTimeConfig) ? (
                                <View style={{width: '100%'}}>
                                    <Text style={[commonStyles.textBold]}>
                                        Ca làm việc:{' '}
                                        <Text style={[commonStyles.text]}>
                                            {this.workingTimeConfig.shiftType == workingTimeShiftType.FULL_WORKING_DAY
                                                ? 'Ca gãy'
                                                : 'Ca nguyên'}
                                        </Text>
                                    </Text>
                                    {this.workingTimeConfig.shiftType == workingTimeShiftType.FULL_WORKING_DAY ? (
                                        <View style={{width: '100%'}}>
                                            <View style={{flexDirection: 'row', width: '100%'}}>
                                                <View style={{flexDirection: 'row', flex: 1}}>
                                                    {this.renderTextWorkingTime(
                                                        'Giờ bắt đầu:',
                                                        this.workingTimeConfig.startWorkingTime1,
                                                    )}
                                                </View>
                                                <View style={{flexDirection: 'row', flex: 1}}>
                                                    {this.renderTextWorkingTime(
                                                        'Giờ nghỉ giữa ca:',
                                                        this.workingTimeConfig.endWorkingTime1,
                                                    )}
                                                </View>
                                            </View>
                                            <View style={{flexDirection: 'row', width: '100%'}}>
                                                <View style={{flexDirection: 'row', flex: 1}}>
                                                    {this.renderTextWorkingTime(
                                                        'Giờ bắt đầu lại:',
                                                        this.workingTimeConfig.startWorkingTime2,
                                                    )}
                                                </View>
                                                <View style={{flexDirection: 'row', flex: 1}}>
                                                    {this.renderTextWorkingTime(
                                                        'Giờ kết thúc:',
                                                        this.workingTimeConfig.endWorkingTime2,
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    ) : (
                                        <View style={{flexDirection: 'row', width: '100%'}}>
                                            <View style={{flexDirection: 'row', flex: 1}}>
                                                {this.renderTextWorkingTime(
                                                    'Giờ bắt đầu:',
                                                    this.workingTimeConfig.startWorkingTime1,
                                                )}
                                            </View>
                                            <View style={{flexDirection: 'row', flex: 1}}>
                                                {this.renderTextWorkingTime(
                                                    'Giờ kết thúc:',
                                                    this.workingTimeConfig.endWorkingTime1,
                                                )}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            ) : null}
                        </View>
                        <View
                            style={{
                                marginTop: Constants.MARGIN_LARGE,
                                backgroundColor: Colors.COLOR_WHITE,
                                paddingVertical: Constants.PADDING_LARGE,
                            }}>
                            <View style={[styles.boxDate]}>
                                <View style={{height: '100%'}}>
                                    <Text style={styles.textDay}>
                                        {DateUtil.convertFromFormatToFormat(
                                            this.todaySQL,
                                            DateUtil.FORMAT_DATE_SQL,
                                            DateUtil.FORMAT_DAY,
                                        )}
                                    </Text>
                                </View>
                                <View style={{marginHorizontal: Constants.MARGIN_X_LARGE, height: '100%'}}>
                                    <Text style={[commonStyles.text, {margin: 0}]}>
                                        {DateUtil.getDateOfWeek(this.todaySQL)}
                                    </Text>
                                    <Text style={[commonStyles.text, {opacity: Constants.OPACITY_50, margin: 0}]}>
                                        {localizes('homeView.month')} {moment(this.todaySQL).format('MM YYYY')}
                                    </Text>
                                </View>
                                <View style={{flex: 1, alignItems: 'flex-end'}}>
                                    <TimeCurrent />
                                </View>
                            </View>
                            <Hr
                                width={2}
                                style={{marginHorizontal: Constants.MARGIN_X_LARGE + Constants.MARGIN_LARGE}}
                                color={Colors.COLOR_BACKGROUND}
                            />
                        </View>
                        {/* process check in, out */}
                        {this.renderProcessCheck()}
                    </ScrollView>
                    <ModalWiFiList
                        isVisible={visibleWiFiList}
                        onBack={this.toggleWiFiList}
                        data={this.wiFiListAllows}
                    />
                    <ModalAddNote
                        ref={'modalAddNote'}
                        onTimekeeping={filter => {
                            this.filter = filter;
                            this.timekeeping();
                        }}
                        tvCheck={tvCheck}
                    />
                    {this.renderAlertExitApp()}
                    {this.renderAlertVersion()}
                    {this.state.refreshing ? null : this.showLoadingBar(this.props.isLoading)}
                </View>
            </SafeAreaView>
        );
    }

    /**
     * Render text working time
     */
    renderTextWorkingTime(title, time) {
        return (
            <View style={{flexDirection: 'row', width: '100%'}}>
                <Text style={[commonStyles.text]}>{title}</Text>
                <Text style={[commonStyles.text, {opacity: Constants.OPACITY_50}]}>
                    {!Utils.isNull(time)
                        ? DateUtil.convertFromFormatToFormat(time, DateUtil.FORMAT_TIME_SECONDS, DateUtil.FORMAT_TIME)
                        : ''}
                </Text>
            </View>
        );
    }

    /**
     * goto notification
     */
    gotoNotification = () => {
        this.props.navigation.navigate('Notification');
    };

    /**
     * Render process check
     */
    renderProcessCheck() {
        return (
            <FlatListCustom
                onRef={ref => {
                    this.flatListRef = ref;
                }}
                style={{
                    backgroundColor: Colors.COLOR_WHITE,
                    marginBottom: Constants.MARGIN_X_LARGE,
                    paddingBottom: Constants.PADDING_LARGE,
                }}
                horizontal={false}
                data={this.dataTimekeeping}
                itemPerCol={1}
                renderItem={this.renderItem.bind(this)}
                // stickyHeaderIndices={[0]}
                isShowEmpty={this.showNoData}
                isShowImageEmpty={false}
                textForEmpty={localizes('homeView.emptyListCheckIn')}
                styleEmpty={{
                    alignItems: 'flex-start',
                    paddingLeft: Constants.PADDING_X_LARGE + Constants.PADDING,
                }}
            />
        );
    }

    // Handle request timekeeping
    handleRequestTimekeeping() {
        this.props.getTimeToday(screenType.FROM_HOME_VIEW);
    }

    //onRefreshing
    handleRefresh = () => {
        this.setState({refreshing: true});
        this.getNetWorkInfo();
        this.getProfile();
    };

    /**
     * @param {*} item
     * @param {*} index
     * @param {*} indexInData
     * @param {*} parentIndex
     */
    renderItem(item, indexInData, parentIndex, index) {
        return (
            <ItemTimekeeping data={this.dataTimekeeping} item={item} index={index} screen={screenType.FROM_HOME_VIEW} />
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
                    this.setState({isAlertExitApp: false});
                }}
                onPressX={() => {
                    this.setState({isAlertExitApp: false});
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
                    contentTitle={localizes('homeView.updateNewVersion')}
                    textBtnOne={this.dataVersion.force === 0 ? localizes('no') : ''}
                    textBtnTwo={localizes('yes')}
                    contentText={this.dataVersion.description}
                    onTouchOutside={() => {
                        this.setState({isAlertVersion: false});
                    }}
                    onPressX={
                        this.dataVersion.force === 0
                            ? () => {
                                  this.setState({isAlertVersion: false});
                                  this.saveStorage(this.dataVersion);
                              }
                            : null
                    }
                    onPressBtnPositive={() => {
                        this.renderWebView(this.dataVersion.link);
                        this.setState({isAlertVersion: this.dataVersion.force !== 0});
                        this.saveStorage(this.dataVersion);
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
                            this.setState({isAlertVersion: true});
                        }
                    } else {
                        this.setState({isAlertVersion: true});
                    }
                } else {
                    this.setState({isAlertVersion: true});
                }
            }
        } else {
            StorageUtil.deleteItem(StorageUtil.VERSION);
        }
    };

    /**
     * Get minutes before/after working time remind to checkIn/checkOut
     */
    getMinutesRemindTimekeeping = () => {
        StorageUtil.retrieveItem(StorageUtil.MOBILE_CONFIG)
            .then(alarm => {
                if (!Utils.isNull(alarm)) {
                    // console.log('alarm', alarm)
                    this.alarmBeforeCheckIn1 =
                        alarm.find(x => x.name == 'minutes_before_working_time_to_remind_check_in_1') || {};
                    this.alarmBeforeCheckIn2 =
                        alarm.find(x => x.name == 'minutes_before_working_time_to_remind_check_in_2') || {};
                    this.alarmBeforeCheckOut1 =
                        alarm.find(x => x.name == 'minutes_before_working_time_to_remind_check_out_1') || {};
                    this.alarmBeforeCheckOut2 =
                        alarm.find(x => x.name == 'minutes_before_working_time_to_remind_check_out_2') || {};
                }
            })
            .catch(error => {
                //this callback is executed when your Promise is rejected
                console.log('Promise is rejected with error: ' + error);
            });
    };

    /**
     * Get holiday working
     */
    getHoliday = () => {
        StorageUtil.retrieveItem(StorageUtil.MOBILE_CONFIG)
            .then(holiday => {
                if (!Utils.isNull(holiday)) {
                    // console.log('holiday', holiday)
                    this.holidayLeave = holiday.find(x => x.name == 'working_policy.holiday.leave') || {};
                    this.holidayTime = holiday.find(x => x.name == 'working_policy.time') || {};
                }
            })
            .catch(error => {
                //this callback is executed when your Promise is rejected
                console.log('Promise is rejected with error: ' + error);
            });
    };

    saveStorage = data => {
        StorageUtil.storeItem(StorageUtil.VERSION, data);
    };

    renderWebView = link => {
        Linking.openURL(link);
    };
}
const mapStateToProps = state => ({
    userInfo: state.home.data,
    isLoading: state.home.isLoading,
    error: state.home.error,
    errorCode: state.home.errorCode,
    action: state.home.action,
    screen: state.home.screen,
});

const mapDispatchToProps = {
    ...actions,
    ...timekeepingActions,
    ...locationActions,
    ...commonActions,
    ...faceActions,
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeView);
