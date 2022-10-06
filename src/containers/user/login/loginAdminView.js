'use strict';
import {ActionEvent, getActionSuccess} from 'actions/actionEvent';
import * as commonActions from 'actions/commonActions';
import * as actions from 'actions/userActions';
import TextInputCustom from 'components/textInputCustom';
import {ErrorCode} from 'config/errorCode';
import BaseView from 'containers/base/baseView';
import screenType from 'enum/screenType';
import statusType from 'enum/statusType';
import ic_account_grey from 'images/ic_account_grey.png';
import ic_key_grey from 'images/ic_key_grey.png';
import ic_lock_grey from 'images/ic_lock_grey.png';
import ic_logo_admin_green from 'images/ic_logo_admin_green.png';
import ic_unlock_grey from 'images/ic_unlock_grey.png';
import {localizes} from 'locales/i18n';
import {Container, Content, Form} from 'native-base';
import {BackHandler, Image, Keyboard, Text, TouchableHighlight, View} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {connect} from 'react-redux';
import commonStyles from 'styles/commonStyles';
import StorageUtil from 'utils/storageUtil';
import StringUtil from 'utils/stringUtil';
import Utils from 'utils/utils';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';
import {Fonts} from 'values/fonts';
import styles from './styles';

console.disableYellowBox = true;
class LoginAdminView extends BaseView {
    constructor() {
        super();
        this.state = {
            hidePassword: true,
            password: '',
            emailOrPhone: '',
            user: null,
            errorSignIn: null,
        };
        this.hidePassword = true;
        this.onChangeEmailOrPhone = this.onChangeEmailOrPhone.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    /**
     * Handler back button
     */
    handlerBackButton() {
        console.log(this.className, 'back pressed');
        BackHandler.exitApp();
    }

    managePasswordVisibility = () => {
        // function used to change password visibility
        let last = this.state.password;
        this.setState({hidePassword: !this.state.hidePassword, password: ''});
        setTimeout(() => {
            this.setState({password: last});
        }, 0);
    };

    /**
     * Validate data
     */
    validateData() {
        const {emailOrPhone, password} = this.state;
        if (StringUtil.isNullOrEmpty(emailOrPhone)) {
            this.showMessage(localizes('login.vali_email_or_phone'));
            this.emailOrPhone.focus();
            return false;
        } else if (StringUtil.isNullOrEmpty(password)) {
            this.showMessage(localizes('login.vali_fill_password'));
            this.password.focus();
            return false;
        }
        return true;
    }

    /**
     * Login
     */
    login() {
        if (this.validateData()) {
            let data = {
                email: Utils.validateEmail(this.state.emailOrPhone) ? this.state.emailOrPhone : '',
                phone: this.state.emailOrPhone,
                password: this.state.password,
                deviceInfo: {
                    deviceId: global.deviceId,
                    appVersion: DeviceInfo.getVersion(),
                    osVersion: DeviceInfo.getSystemVersion(),
                    model: DeviceInfo.getModel(),
                    serial: null,
                    imei1: null,
                    imei2: null,
                },
            };
            this.props.login(data);
        }
    }

    async componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    /**
     * Handle data when request
     */
    handleData() {
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (
                    this.props.action == getActionSuccess(ActionEvent.LOGIN) ||
                    this.props.action == getActionSuccess(ActionEvent.LOGIN_GOOGLE) ||
                    this.props.action == getActionSuccess(ActionEvent.LOGIN_FB)
                ) {
                    let data = this.props.data;
                    console.log('DATA USER: ', data);
                    if (!Utils.isNull(data)) {
                        if (data.status == statusType.ACTIVE) {
                            console.log('A000');
                            StorageUtil.storeItem(StorageUtil.USER_PROFILE, data);
                            //Save token login
                            StorageUtil.storeItem(StorageUtil.USER_TOKEN, data.token);
                            StorageUtil.storeItem(StorageUtil.FIREBASE_TOKEN, data.firebaseToken);
                            global.token = data.token;
                            global.firebaseToken = data.firebaseToken;
                            this.props.notifyLoginSuccess();
                            this.props.getNotificationsRequest({
                                userId: data.id,
                                paging: {
                                    pageSize: Constants.PAGE_SIZE,
                                    page: 0,
                                },
                            });
                        }
                        if ((!Utils.isNull(data.fbId) || !Utils.isNull(data.ggId)) && data.status == statusType.DRAFT) {
                            console.log('A111');
                            this.props.navigation.navigate('OTP', {
                                screenType: screenType.FROM_LOGIN_SOCIAL,
                                dataUser: data,
                            });
                            this.signOutFB('Facebook');
                            this.signOutGG('Google');
                        } else {
                            console.log('A222');
                            if (!Utils.isNull(data.company)) {
                                if (data.company.id != 1) {
                                    if (!Utils.isNull(data.branch) || data.company.branches.length == 0) {
                                        let companyInfo = {
                                            company: data.company,
                                            branch: data.branch,
                                        };
                                        StorageUtil.storeItem(StorageUtil.COMPANY_INFO, companyInfo);
                                        this.goHomeScreen();
                                    } else {
                                        let companyInfo = {
                                            company: data.company,
                                            branch: null,
                                        };
                                        StorageUtil.storeItem(StorageUtil.COMPANY_INFO, companyInfo);
                                        this.props.navigation.navigate('BranchList', {
                                            company: data.company,
                                            fromScreen: screenType.FROM_LOGIN,
                                        });
                                    }
                                } else {
                                    this.props.navigation.navigate('CompanyList');
                                }
                                this.refreshToken();
                            }
                        }
                    }
                }
            } else if (this.props.errorCode == ErrorCode.LOGIN_FAIL_USERNAME_PASSWORD_MISMATCH) {
                this.showMessage(localizes('login.accountNotExist'));
                this.password.focus();
            } else if (this.props.errorCode == ErrorCode.INVALID_ACCOUNT) {
                this.showMessage(localizes('login.accountNotExist'));
                this.emailOrPhone.focus();
            } else if (this.props.errorCode == ErrorCode.USER_HAS_BEEN_DELETED) {
                this.showMessage(localizes('login.userHasBeenDeleted'));
                this.emailOrPhone.focus();
            } else if (this.props.errorCode == ErrorCode.USER_WAITING_FOR_APPROVAL) {
                this.showMessage(localizes('login.waitingForApproval'));
                this.emailOrPhone.focus();
            } else if (this.props.errorCode == ErrorCode.USER_LOGGED_IN_ANOTHER_DEVICE) {
                this.showMessage('Xin lỗi, tài khoản này đã được đăng nhập ở thiết bị khác!');
            } else if (this.props.errorCode == ErrorCode.DEVICE_HAS_ALREADY_LOGGED_IN) {
                this.showMessage('Xin lỗi, thiết bị này đã có người đăng nhập, vui lòng liên hệ admin!');
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    render() {
        const {user, signInError, emailOrPhone} = this.state;
        return (
            <Container style={styles.container}>
                <View style={{flex: 1}}>
                    {/* <HStack style={[commonStyles.header]}>
                        {this.renderHeaderView({
                            visibleBack: false,
                            title: localizes("login.login_title"),
                            titleStyle: { color: Colors.COLOR_WHITE }
                        })}
                    </HStack> */}
                    <Content contentContainerStyle={{flexGrow: 1}} style={{flex: 1}}>
                        <View style={{flexGrow: 1}}>
                            <View
                                style={[commonStyles.viewCenter, {flex: 1, marginVertical: Constants.MARGIN_X_LARGE}]}>
                                <Text
                                    style={[
                                        commonStyles.text,
                                        {
                                            color: Colors.COLOR_PRIMARY,
                                            margin: 0,
                                            marginVertical: Constants.MARGIN_XX_LARGE,
                                            fontSize: Fonts.FONT_SIZE_X_LARGE * 2,
                                        },
                                    ]}>
                                    ADMIN
                                </Text>
                                <Image source={ic_logo_admin_green} />
                            </View>
                            {/* {Input form} */}
                            <Form style={{flex: 1}}>
                                <View
                                    style={{
                                        paddingHorizontal: Constants.PADDING_X_LARGE,
                                        backgroundColor: Colors.COLOR_WHITE,
                                        borderRadius: Constants.CORNER_RADIUS,
                                        marginHorizontal: Constants.MARGIN_X_LARGE,
                                    }}>
                                    {/* Email phone number */}
                                    <TextInputCustom
                                        refInput={r => (this.emailOrPhone = r)}
                                        isInputNormal={true}
                                        placeholder={localizes('login.input_email_or_phone')}
                                        value={this.state.emailOrPhone}
                                        onChangeText={this.onChangeEmailOrPhone}
                                        onSubmitEditing={() => {
                                            this.password.focus();
                                        }}
                                        returnKeyType={'next'}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        contentLeft={ic_account_grey}
                                        inputNormalStyle={{
                                            paddingVertical: Constants.MARGIN_LARGE + Constants.MARGIN,
                                        }}
                                    />
                                    {/* Password */}
                                    <TextInputCustom
                                        refInput={ref => (this.password = ref)}
                                        isInputNormal={true}
                                        placeholder={localizes('login.password')}
                                        value={this.state.password}
                                        secureTextEntry={this.state.hidePassword}
                                        onChangeText={this.onChangePassword}
                                        onSelectionChange={({nativeEvent: {selection}}) => {}}
                                        onSubmitEditing={() => {
                                            Keyboard.dismiss();
                                        }}
                                        returnKeyType={'done'}
                                        borderBottomWidth={0}
                                        inputNormalStyle={{
                                            paddingVertical: Constants.MARGIN_LARGE + Constants.MARGIN,
                                            paddingRight: Constants.PADDING_XX_LARGE,
                                        }}
                                        contentLeft={ic_key_grey}
                                        contentRight={
                                            <TouchableHighlight
                                                onPress={this.managePasswordVisibility}
                                                style={[
                                                    {
                                                        position: 'absolute',
                                                        right: 0,
                                                        padding: Constants.PADDING_LARGE,
                                                        marginRight: -Constants.MARGIN_LARGE,
                                                    },
                                                ]}
                                                underlayColor="transparent">
                                                <Image
                                                    style={{resizeMode: 'contain', opacity: 0.5}}
                                                    source={this.state.hidePassword ? ic_unlock_grey : ic_lock_grey}
                                                />
                                            </TouchableHighlight>
                                        }
                                    />
                                </View>
                                <View
                                    style={{
                                        marginHorizontal: Constants.MARGIN_X_LARGE,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                    {/* Forgot password  */}
                                    {/* <TouchableOpacity
                                        activeOpacity={Constants.ACTIVE_OPACITY}
                                        onPress={() => {
                                            // this.props.navigation.navigate('ForgotPassword', {
                                            //     screenType: screenType.FROM_FORGET_PASSWORD,
                                            //     dataUser: null
                                            // })
                                            this.props.navigation.navigate('ForgotPassword')
                                        }}
                                        style={{ flex: 1 }} transparent>
                                        <Text style={[commonStyles.text, { color: Colors.COLOR_DRK_GREY, textAlign: 'center' }]}>
                                            {localizes('forgot_password.forgot_password')}
                                        </Text>
                                    </TouchableOpacity> */}
                                    {/* {Button login} */}
                                    <View style={{flex: 1}}>
                                        {this.renderCommonButton(
                                            localizes('login.login_button'),
                                            {
                                                color: Colors.COLOR_WHITE,
                                            },
                                            {},
                                            () => {
                                                this.login();
                                            },
                                            false,
                                            true,
                                        )}
                                    </View>
                                </View>
                                {/* Bottom view */}
                                {/* <View style={{
                                    flex: 1,
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    paddingBottom: Constants.PADDING_X_LARGE * 2
                                }}> */}
                                {/* Register */}
                                {/* <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                                        <Text style={{ flex: 1 }}></Text>
                                        <TouchableOpacity
                                            activeOpacity={Constants.ACTIVE_OPACITY}
                                            style={[commonStyles.viewCenter]}
                                            onPress={() => {
                                                // this.props.navigation.navigate('OTP', {
                                                //     screenType: screenType.FROM_REGISTER,
                                                //     dataUser: null
                                                // })
                                                this.props.navigation.navigate("Register", {
                                                    'emailOrPhone': emailOrPhone
                                                })
                                                // this.props.navigation.navigate("WorkingPolicy", {
                                                //     'emailOrPhone': emailOrPhone,
                                                //     'screen': screenType.FROM_LOGIN
                                                // })
                                            }}
                                        >
                                            <Text style={[commonStyles.text, {
                                                textAlign: 'right',
                                                fontSize: Fonts.FONT_SIZE_MEDIUM,
                                                margin: 0
                                            }]}>{localizes('login.notAccountYet')}</Text>
                                        </TouchableOpacity>
                                        <Text style={{ flex: 1 }}></Text>
                                    </View> */}
                                {/* Hr */}
                                {/* <Hr style={{ margin: Constants.MARGIN_XX_LARGE }}
                                        color={Colors.COLOR_DRK_GREY} width={1}>
                                        <Text style={[commonStyles.text, {
                                            color: Colors.COLOR_DRK_GREY,
                                            paddingHorizontal: Constants.MARGIN_LARGE
                                        }]}>{localizes('login.or_text')}</Text>
                                    </Hr>
                                    <Text style={[commonStyles.text, { color: Colors.COLOR_DRK_GREY }]}>{localizes('login.login_or')}</Text>
                                    <View style={{ flexDirection: 'row' }}> */}
                                {/* Login facebook */}
                                {/* <TouchableOpacity
                                            activeOpacity={Constants.ACTIVE_OPACITY}
                                            onPress={
                                                () => {
                                                    this.loginFacebook()
                                                }
                                            } style={[{
                                                margin: Constants.MARGIN_LARGE
                                            }]}
                                        >
                                            <Image resizeMode={'contain'} source={ic_facebook} />
                                        </TouchableOpacity> */}
                                {/* Login google */}
                                {/* <TouchableOpacity
                                            activeOpacity={Constants.ACTIVE_OPACITY}
                                            onPress={
                                                () => {
                                                    this.loginGoogle()
                                                }
                                            } block style={[{
                                                margin: Constants.MARGIN_LARGE
                                            }]} >
                                            <Image resizeMode={'contain'} source={ic_google} />
                                        </TouchableOpacity>
                                    </View> */}
                                {/* </View> */}
                            </Form>
                        </View>
                    </Content>
                    {this.showLoadingBar(this.props.isLoading)}
                </View>
            </Container>
        );
    }

    onChangePassword(password) {
        this.setState({
            password,
        });
    }

    onChangeEmailOrPhone(emailOrPhone) {
        this.setState({
            emailOrPhone,
        });
    }
}

const mapStateToProps = state => ({
    data: state.login.data,
    isLoading: state.login.isLoading,
    error: state.login.error,
    errorCode: state.login.errorCode,
    action: state.login.action,
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions,
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginAdminView);
