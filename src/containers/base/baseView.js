import NetInfo from "@react-native-community/netinfo";
import { ErrorCode } from "config/errorCode";
import HeaderView from "containers/common/headerView";
import { localizes } from "locales/i18n";
import { Spinner } from "native-base";
import { Component } from "react";
import { Alert, Dimensions, Keyboard, Linking, NativeModules, PermissionsAndroid, Platform, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import { NavigationActions, StackActions } from 'react-navigation';
import commonStyles from 'styles/commonStyles';
import StorageUtil from "utils/storageUtil";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
// import firebase, { Notification, NotificationOpen, RemoteMessage } from 'react-native-firebase';
import { GoogleSignin } from '@react-native-community/google-signin';
import ReactNativeAN from "containers/common/alarmModule";
import imageRatio from "enum/imageRatio";
import statusType from "enum/statusType";
import DeviceInfo from 'react-native-device-info';
import Toast from 'react-native-root-toast';
import Utils from 'utils/utils';
import { Fonts } from "values/fonts";

import notificationType from "enum/notificationType";
import { configConstants } from "values/configConstants";

const screen = Dimensions.get("window");

const resetAction = (routeName, params = {}) => StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: routeName, params: params })],
});

const resetActionLogin = (routeName) => StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: routeName })],
});

const CHANNEL_ID = 'aaChannelId'
const CHANNEL_NAME = 'Thông báo chung'
const RNAlarm = NativeModules.RNAlarm;
/**
 * Base view class
 */
class BaseView extends Component {

    constructor(props) {
        super(props)
        this.handlerBackButton = this.handlerBackButton.bind(this);
        this.className = this.constructor.name;
        this.onBack = this.onBack.bind(this);
        this.isShowMessageBack = true;
        this.onChangedOrientation = this.onChangedOrientation.bind(this);
        this.resourceUrlPath = {};
        this.resourceUrlPathResize = {};
        this.isShowCardMember = false;
        this.baseView = this;
        this.countNewNotification = this.countNewNotification.bind(this);
        this.memberChatId = 1; // id = 1 is default admin 411
        this.userAdmin = {};
        this.maxFileSizeUpload = {};
        this.minuteBeforeCheckIn1 = {};
        this.minuteBeforeCheckIn2 = {};
        this.minuteAfterCheckOut1 = {};
        this.minuteAfterCheckOut2 = {};
        this.minuteBeforeCheckOut1 = {};
        this.minuteBeforeCheckOut2 = {};
        this.minuteAfterCheckIn1 = {};
        this.minuteAfterCheckIn2 = {};
        this.checkInRule = {}
    }

    render() {
        return (
            <View></View>
        );
    }

    /**
     * Has permission
     */
    hasPermission = async (permissions) => {
        if (Platform.OS === 'ios' ||
            (Platform.OS === 'android' && Platform.Version < 23)) {
            return true;
        }

        const hasPermission = await PermissionsAndroid.check(
            permissions
        );

        if (hasPermission) return true;

        const status = await PermissionsAndroid.request(
            permissions
        );

        if (status === PermissionsAndroid.RESULTS.GRANTED) return true;

        if (status === PermissionsAndroid.RESULTS.DENIED) {
            console.log("Permission denied by user.");
        } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            console.log("Permission revoked by user.");
        }

        return false;
    }

    /**
     * Show toast message
     * @param {*} message 
     * @param {*} duration 
     * @param {*} type 
     */
    showMessage(message, duration = 30000, type = 'warning') {
        try {
            if (Platform.OS === 'ios') {
                if (!global.isShowMessageError) {
                    global.isShowMessageError = true;
                    Toast.show(message, {
                        duration: Toast.durations.LONG,
                        position: Toast.positions.CENTER,
                    });
                }
            } else {
                ToastAndroid.showWithGravity(message, ToastAndroid.LONG, ToastAndroid.CENTER);
            }
            setTimeout(() => {
                global.isShowMessageError = false
            }, 5000);
        } catch (e) {
            global.isShowMessageError = false
            console.log(e);
        }
    }


    /**
     * Go to chat (my user id with admin)
     * @param {*} conversationId // != null if conversation is created
     */
    goToChatWithOthers(conversationId, userIdChat, userNameChat, avatarUserChat) {
        // into Screen Chat with others
        // conversationId, userIdChat, nameChat, avatar: params
        console.log("!@#!@# goToChatWithOthers")
        this.props.navigation.navigate('Chat', {
            "conversation": conversationId,
            "userIdChat": userIdChat,
            "nameChat": userNameChat,
            "avatar": avatarUserChat,
        })
    }

    /**
     * Go to chat (my user id with admin)
     * @param {*} conversationId // != null if conversation is created
     */
    goToChatWithAdmin(conversationId, nameChat, avatar) {
        // into Screen Chat
        // conversationId, userIdChat, nameChat, avatar: params
        console.log("!@#!@# goToChatWithAdmin")
        this.props.navigation.navigate('Chat', {
            "conversation": conversationId,
            "userIdChat": this.userAdmin.numericValue,
            "nameChat": nameChat,
            "avatar": avatar
        })
    }

    /**
     * Get size banner
     * @param {*} ratio 
     */
    sizeBanner(ratio) {
        let ratioNumber = 1
        if (ratio == imageRatio.RATIO_16_9) {
            ratioNumber = 9 / 16
        } else if (ratio == imageRatio.RATIO_4_3) {
            ratioNumber = 3 / 4
        } else if (ratio == imageRatio.RATIO_3_2) {
            ratioNumber = 2 / 3
        } else if (ratio == imageRatio.RATIO_9_16) {
            ratioNumber = 16 / 9
        } else if (ratio == imageRatio.RATIO_3_4) {
            ratioNumber = 4 / 3
        } else if (ratio == imageRatio.RATIO_2_3) {
            ratioNumber = 3 / 2
        }
        return ratioNumber
    }

    //Show login view
    showLoginView(router) {
        this.props.navigation.navigate('Login', {
            router: router
        })
    }

    //Save exception
    saveException(error, func) {
        let filter = {
            className: this.props.navigation ? this.props.navigation.state.routeName : this.className,
            exception: error.message + " in " + func,
            osVersion: DeviceInfo.getSystemVersion(),
            appVersion: DeviceInfo.getVersion()
        }
        this.props.saveException(filter)
    }

    componentWillMount() {
        console.log("I am Base View", this.props)
        Dimensions.addEventListener('change', this.onChangedOrientation)
    }

    componentWillUnmount() {
        Dimensions.removeEventListener('change', this.onChangedOrientation)
        if (this.messageListener != undefined) {
            this.messageListener();
        }
        if (this.notificationListener != undefined) {
            this.notificationListener();
        }
        if (this.notificationOpenedListener != undefined) {
            this.notificationOpenedListener();
        }
        if (this.notificationDisplayedListener != undefined) {
            this.notificationDisplayedListener();
        }
    }

    onChangedOrientation(e) {

    }

    /**
     * Sign out GG
     */
    signOutGG = async (data) => {
        try {
            if (!Utils.isNull(data)) {
                await GoogleSignin.signOut();
            }
        } catch (error) {
            console.error(error);
        }
    };


    handlerBackButton() {
        console.log(this.className, 'back pressed')
        if (this.props.navigation) {
            this.onBack()
        } else {
            return false
        }
        return true
    }

    /**
     * Back pressed
     * True: not able go back
     * False: go back
     */
    onBackPressed() {
        return false
    }

    /**
     * On back
     */
    onBack() {
        if (this.props.navigation) {
            this.props.navigation.goBack()
        }
    }

    /**
     * Go to home screen
     */
    goHomeScreen() {
        if (global.bundleId == configConstants.APP_ADMIN) {
            this.props.navigation.dispatch(resetAction("MainAdmin"))
        } else {
            this.props.navigation.dispatch(resetAction("Main"))
        }
    }

    /**
     * Go to login screen
     */
    goLoginScreen() {
        if (global.bundleId == configConstants.APP_ADMIN) {
            this.props.navigation.dispatch(resetActionLogin("LoginAdmin"))
        } else {
            this.props.navigation.dispatch(resetActionLogin("Login"))
        }
    }

    /**
     * Dispatch screen
     */
    dispatchScreen(routeName, params) {
        this.props.navigation.dispatch(resetAction(routeName, params))
    }

    /**
     * Render header view
     * default: visibleBack = true
     * onBack, stageSize, initialIndex
     *
     * @param {*} props 
     */
    renderHeaderView(props = {}) {
        const defaultProps = {
            visibleBack: true,
            onBack: this.onBack,
            shadowOffset: { height: 6, width: 3 },
            shadowOpacity: 0.25,
            elevation: Constants.SHADOW
        }
        const newProps = { ...defaultProps, ...props }
        return <HeaderView {...newProps} />
    }

    /**
     * Render right header
     */
    renderRightHeader = () => {
        return (
            <View style={{ padding: Constants.PADDING_12 }} />
        )
    }

    renderHeaderWithoutTitleView(props = {}) {
        const defaultProps = {
            visibleBack: true,
            onBack: this.onBack,
            shadowOffset: { height: 6, width: 3 },
            shadowOpacity: 0.25,
            elevation: Constants.SHADOW
        }
        const newProps = { ...defaultProps, ...props }
        return <HeaderWithoutTitleView {...newProps} />
    }

    /**
     * Common button have 100% width with opacity when clicked
     * @param {*} title 
     * @param {*} titleStyle 
     * @param {*} buttonStyle 
     */
    renderCommonButton(title = '', titleStyle = {}, buttonStyle = {}, onPress = null, disableButton) {
        let onPressItem = onPress ? onPress : this.onPressCommonButton.bind(this)
        return (
            <View style={{ marginVertical: Constants.MARGIN_X_LARGE }}>
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    disabled={disableButton}
                    onPress={onPress}
                    style={[commonStyles.buttonStyle, buttonStyle, {
                        elevation: 0,
                        margin: 0
                    }]}>
                    <Text
                        style={[commonStyles.text, titleStyle, { fontSize: Fonts.FONT_SIZE_MEDIUM }]}
                    >
                        {title}
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }

    onPressCommonButton() {
    }

    /**
     * Go next screen
     * @param {*} className 
     * @param {*} params 
     * @param {*} isNavigate 
     */
    goNextScreen(className, params = this.props.navigation.state.params, isNavigate = true) {
        if (isNavigate)
            this.props.navigation.navigate(className, params)
        else
            this.props.navigation.push(className, params)
    }

    /**
     * Go to notification
     * @param {*} className 
     * @param {*} params 
     * @param {*} isNavigate 
     */
    goToScreen(data) {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then((user) => {
            if (!Utils.isNull(user) && user.status == statusType.ACTIVE) {
                if (this.props.navigation) {
                    // handle link screen
                    let type = Number(data.type);
                    if (!Utils.isNull(data.data)) {
                        var obj = JSON.parse(data.data);
                    }
                    switch (type) {
                        case notificationType.TASK_NOTIFICATION:
                            let params = {
                                taskId: obj.taskId,
                                callback: null,
                            }
                            !Utils.isNull(params.taskId) ? this.props.navigation.navigate("TaskDetail", params) : this.props.navigation.navigate("Notification");
                            break;
                        default:
                            this.props.navigation.navigate("Notification");
                            break;
                    }
                }
            }
        }).catch((error) => {
            //this callback is executed when your Promise is rejected
            console.log('Promise is rejected with error roles: ' + error);
        });
    }

    /**
     * get new notification
     */
    countNewNotification() {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then((user) => {
            if (!Utils.isNull(user) && user.status == statusType.ACTIVE) {
                this.props.countNewNotification();
            }
        }).catch((error) => {
            //this callback is executed when your Promise is rejected
            console.log('Promise is rejected with error roles: ' + error);
        });
    }

    /**
     * Logout
     */
    logout() {
        StorageUtil.deleteItem(StorageUtil.USER_PROFILE);
        StorageUtil.storeItem(StorageUtil.USER_PROFILE, null);
        StorageUtil.deleteItem(StorageUtil.USER_TOKEN);
        StorageUtil.storeItem(StorageUtil.USER_TOKEN, null);
        StorageUtil.deleteItem(StorageUtil.FIREBASE_TOKEN);
        StorageUtil.storeItem(StorageUtil.FIREBASE_TOKEN, null);
        StorageUtil.deleteItem(StorageUtil.MOBILE_CONFIG);
        StorageUtil.storeItem(StorageUtil.MOBILE_CONFIG, null);
        StorageUtil.deleteItem(StorageUtil.COMPANY_INFO);
        StorageUtil.storeItem(StorageUtil.COMPANY_INFO, null);
        global.token = "";
        global.firebaseToken = "";
        firebase.notifications().setBadge(0);
        global.badgeCount = 0;
        global.bundleId == configConstants.APP_USER && this.clearAlarm();
    }

    /**
     * Authentication firebase
     */
    signInWithCustomToken(userId) {
        StorageUtil.retrieveItem(StorageUtil.FIREBASE_TOKEN).then((firebaseToken) => {
            //this callback is executed when your Promise is resolved
            console.log("FIREBASE TOKEN: ", firebaseToken)
            if (!Utils.isNull(firebaseToken) & !Utils.isNull(userId)) {
                if (Platform.OS === "android") {
                    firebase.auth().signInWithCustomToken(firebaseToken).catch(function (error) {
                        console.warn("Error auth: " + error.code + " - " + error.message);
                    });
                } else {
                    var view = NativeModules.AppDelegate
                    view.loginAuthenFirebase(firebaseToken)
                }
            }
        }).catch((error) => {
            //this callback is executed when your Promise is rejected
            console.log('Promise is rejected with error: ' + error);
        });
    }

    /**
     * Handle error
     * @param {} errorCode 
     */
    handleError(errorCode, error) {
        switch (errorCode) {
            case ErrorCode.ERROR_COMMON:
                this.showMessage(localizes("error_in_process"))
                break
            case ErrorCode.NO_CONNECTION:
                NetInfo.fetch().then(state => {
                    console.log("Connection type", state.type);
                    console.log("Is connected?", state.isConnected);
                    if (state.isConnected) {
                        this.showMessage(localizes("error_connect_to_server"))
                    } else {
                        this.showMessage(localizes("error_network"))
                    }
                });
                break
            case ErrorCode.UN_AUTHORIZE:
            case ErrorCode.AUTHENTICATE_REQUIRED:
                this.logout();
                if (!global.isShowMessageError) {
                    global.isShowMessageError = true
                    Alert.alert(
                        localizes('notification'),
                        localizes('baseView.authenticateRequired'),
                        [
                            {
                                text: 'Hủy', onPress: () => {
                                    global.isShowMessageError = false
                                }
                            },
                            {
                                text: 'OK', onPress: () => {
                                    global.isShowMessageError = false;
                                    this.goLoginScreen();
                                }
                            }
                        ],
                        { cancelable: false },
                    );
                }
                break
            default:
        }
    }

    /**
     * Open screen call
     * @param {*} phone 
     */
    renderCall(phone) {
        let url = `tel:${phone}`;
        Linking.canOpenURL(url).then(supported => {
            if (!supported) {
                console.log('Can\'t handle url: ' + url);
            } else {
                return Linking.openURL(url);
            }
        }).catch(err => console.error('An error occurred', err));
    }

    /**
     * Show loading bar
     * @param {*} isShow 
     */
    showLoadingBar(isShow) {
        return isShow ?
            <View style={{ ...commonStyles.viewCenter, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
                <Spinner style={{}} color={Colors.COLOR_PRIMARY}>

                </Spinner>
            </View> : null
    }

    /**
     * Get source url path
     */
    getSourceUrlPath = () => {
        StorageUtil.retrieveItem(StorageUtil.MOBILE_CONFIG).then((faq) => {
            if (!Utils.isNull(faq)) {
                console.log('faq', faq)
                this.resourceUrlPath = faq.find(x => x.name == 'resource_url_path') || {}
                this.resourceUrlPathResize = faq.find(x => x.name == 'resource_url_path_resize') || {}
                this.userAdmin = faq.find(x => x.name == 'user_admin_id') || {}
                this.maxFileSizeUpload = faq.find(x => x.name == 'max_file_size_upload') || {}
            }
        }).catch((error) => {
            //this callback is executed when your Promise is rejected
            console.log('Promise is rejected with error: ' + error);
        });
    }

    /**
     * Get check in rule
     */
    getCheckInRule = () => {
        StorageUtil.retrieveItem(StorageUtil.MOBILE_CONFIG).then((faq) => {
            if (!Utils.isNull(faq)) {
                console.log('faq', faq)
                this.checkInRule = faq.find(x => x.name == 'check_in_rule') || {}
            }
        }).catch((error) => {
            //this callback is executed when your Promise is rejected
            console.log('Promise is rejected with error: ' + error);
        });
    }

    /**
     * Get minutes before/after working time able to checkIn/checkOut
     */
    getMinutesAbleTimekeeping = async () => {
        StorageUtil.retrieveItem(StorageUtil.MOBILE_CONFIG).then((minute) => {
            if (!Utils.isNull(minute)) {
                console.log('minute', minute)
                this.minuteBeforeCheckIn1 = minute.find(x => x.name == 'minutes_before_working_time_able_to_check_in_1') || {}
                this.minuteBeforeCheckIn2 = minute.find(x => x.name == 'minutes_before_working_time_able_to_check_in_2') || {}
                this.minuteAfterCheckIn1 = minute.find(x => x.name == 'minutes_after_working_time_able_to_check_in_1') || {}
                this.minuteAfterCheckIn2 = minute.find(x => x.name == 'minutes_after_working_time_able_to_check_in_2') || {}

                this.minuteBeforeCheckOut1 = minute.find(x => x.name == 'minutes_before_working_time_able_to_check_out_1') || {}
                this.minuteBeforeCheckOut2 = minute.find(x => x.name == 'minutes_before_working_time_able_to_check_out_2') || {}
                this.minuteAfterCheckOut1 = minute.find(x => x.name == 'minutes_after_working_time_able_to_check_out_1') || {}
                this.minuteAfterCheckOut2 = minute.find(x => x.name == 'minutes_after_working_time_able_to_check_out_2') || {}
            }
        }).catch((error) => {
            //this callback is executed when your Promise is rejected
            console.log('Promise is rejected with error: ' + error);
        });
    }

    async componentDidMount() {
        this.checkPermission();
        this.createNotificationListeners(); //add this line
    }

    //1
    async checkPermission() {
        const enabled = await firebase.messaging().hasPermission();
        if (enabled) {
            this.getToken();
        } else {
            this.requestPermission();
        }
    }

    //2
    async requestPermission() {
        try {
            await firebase.messaging().requestPermission();
            // User has authorised
            this.getToken();
        } catch (error) {
            // User has rejected permissions
            this.getToken(); //Get token for the first time
            console.log('permission rejected');
        }
    }

    //3
    async getToken() {
        let fcmToken = await StorageUtil.retrieveItem(StorageUtil.FCM_TOKEN);
        if (!Utils.isNull(fcmToken)) {
            let fcmTokenNew = await firebase.messaging().getToken();
            if (!Utils.isNull(fcmTokenNew) && fcmToken !== fcmTokenNew) {
                StorageUtil.storeItem(StorageUtil.FCM_TOKEN, fcmTokenNew);
                this.refreshToken();
            } else if (!global.isSendTokenDevice) {
                this.refreshToken();
            }
        } else {
            fcmToken = await firebase.messaging().getToken();
            if (fcmToken) {
                StorageUtil.storeItem(StorageUtil.FCM_TOKEN, fcmToken);
                this.refreshToken();
            }
        }
        // Get token when referesh
        firebase.messaging().onTokenRefresh((token) => {
            StorageUtil.storeItem(StorageUtil.FCM_TOKEN, token);
            this.refreshToken()
        });
    }

    /**
     * Refresh token
     */
    refreshToken = () => {
        StorageUtil.retrieveItem(StorageUtil.FCM_TOKEN).then((token) => {
            if (this.props.postUserDeviceInfo && !Utils.isNull(token)) {
                StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then((user) => {
                    if (!Utils.isNull(user) && user.status == statusType.ACTIVE) {
                        global.isSendTokenDevice = true;
                        let filter = {
                            deviceId: global.deviceId,
                            deviceToken: token
                        }
                        this.props.postUserDeviceInfo(filter)
                    }
                }).catch((error) => {
                    //this callback is executed when your Promise is rejected
                    console.log('Promise is rejected with error roles: ' + error);
                });
            } else {
                console.log('token null')
            }
        }).catch((error) => {
            //this callback is executed when your Promise is rejected
            console.log('Promise is rejected with error: ' + error);
        });
    }

    /**
     * Create notification listener
     */
    async createNotificationListeners() {
        /*
         * Triggered for data only payload in foreground
         * */
        // this.messageListener = firebase.messaging().onMessage((message) => {
        //     // Process your message as required
        // });

        /*
         * Triggered when a particular notification has been received in foreground
         * */
        // this.notificationListener = firebase.notifications().onNotification(async (notification) => {
        //     console.log("Notification base foreground", notification);
        //     const localNotification = new firebase.notifications.Notification({
        //         sound: 'default',
        //         show_in_foreground: true
        //     })
        //         .setNotificationId(notification.notificationId)
        //         .setTitle(notification.title)
        //         .setSubtitle(notification.subtitle)
        //         .setBody(notification.body)
        //         .setData(notification.data)
        //         .android.setSmallIcon('@mipmap/ic_notification')
        //         .android.setPriority(firebase.notifications.Android.Priority.High);
        //     if (Platform.OS === 'android' && localNotification.android.channelId == null) {
        //         const channel = new firebase.notifications.Android.Channel(
        //             CHANNEL_ID,
        //             CHANNEL_NAME,
        //             firebase.notifications.Android.Importance.Max
        //         ).setDescription('In stock channel');
        //         // Create the channel
        //         firebase.notifications().android.createChannel(channel);
        //         localNotification.android.setChannelId(channel.channelId);
        //     }
        //     try {
        //         await firebase.notifications().displayNotification(localNotification);
        //         notification.android.setAutoCancel(true)
        //         this.countNewNotification() // count nti
        //     } catch (e) {
        //         console.log('catch', e)
        //     }
        // });

        /*
         * Process your notification as required
         * */
        // this.notificationDisplayedListener = firebase.notifications().onNotificationDisplayed((notification) => {
        //     // Process your notification as required
        //     // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
        // });

        /*
         * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
         * */
        // this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
        //     console.log("Notification base background", notificationOpen);
        //     firebase.notifications().removeAllDeliveredNotifications()
        //     this.countNewNotification() // count nti
        //     console.log("11111111111111111111", notificationOpen.notification.data)
        //     this.goToScreen(notificationOpen.notification.data);
        // });

        /*
         * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
         * */
        // const notificationOpen = await firebase.notifications().getInitialNotification();
        // if (notificationOpen) {
        //     console.log("Notification base closed", notificationOpen);
        //     StorageUtil.retrieveItem(StorageUtil.NOTIFICATION_ID).then((id) => {
        //         if (id != notificationOpen.notification.notificationId) {
        //             setTimeout(() => {
        //                 this.goToScreen(notificationOpen.notification.data);
        //             }, 1000)
        //         }
        //     }).catch((error) => {
        //         console.log(error)
        //     })
        //     StorageUtil.storeItem(StorageUtil.NOTIFICATION_ID, notificationOpen.notification.notificationId);
        // }
    }

    /**
     * Register keyboard event
     */
    registerKeyboardEvent() {
        Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this));
        Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this));
    }

    /**
     * Handle show keyboard 
     * @param {*} e 
     */
    keyboardWillShow(e) {
        this.setState({ keyboardHeight: e.endCoordinates.height });
    }

    /**
     * Handle hide keyboard
     * @param {*} e 
     */
    keyboardWillHide(e) {
        this.setState({ keyboardHeight: 0 });
    }

    /**
     * Clear alarm
     */
    clearAlarm() {
        if (Platform.OS == 'android') {
            ReactNativeAN.cancelAllNotifications();
        }
        RNAlarm.clearAlarm();
    }
}

export default BaseView;
