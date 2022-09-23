import React, { Component } from 'react';
import { View, Text, Keyboard, TouchableOpacity } from 'react-native';
import TextInputCustom from 'components/textInputCustom';
import { localizes } from 'locales/i18n';
import ic_dialpad_grey from 'images/ic_dialpad_grey.png'
import commonStyles from 'styles/commonStyles';
import { Colors } from 'values/colors';
import * as actions from 'actions/userActions';
import * as commonActions from 'actions/commonActions';
import { connect } from 'react-redux';
import { ErrorCode } from "config/errorCode";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import BaseView from 'containers/base/baseView';
import StorageUtil from 'utils/storageUtil';
import Utils from 'utils/utils';
import DateUtil from 'utils/dateUtil';
import BackgroundShadow from 'components/backgroundShadow';
import shadow_black_42 from "images/shadow_black_42.png";
import { Constants } from 'values/constants';
import ic_account_grey from "images/ic_account_grey.png";
import screenType from 'enum/screenType';
import loginTypes from 'enum/loginType';
import genderType from 'enum/genderType';
import statusType from 'enum/statusType';

class TextInputOTP extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            telephoneNumber: '',
            codeOTP: '',
            statusSend: false,
            textButton: localizes('otp.sendOTP'),
            timeCountDown: 0,
        };
        this.auThenTime = 1.5 * 60
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.handleData();
        }
    }

    handleData() {
        const { statusSend, textButton } = this.state;
        let data = this.props.data
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.SEND_OTP)) {
                    console.log("SEND_OTP: ", data)
                    if (!Utils.isNull(data)) {
                        StorageUtil.storeItem(StorageUtil.OTP_KEY, data)
                        this.setState({
                            statusSend: true,
                            textButton: localizes('otp.resendOTP'),
                            timeCountDown: this.auThenTime
                        })
                    } else {
                        console.log('Ma OTP chua duoc gui')
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.CONFIRM_OTP)) {
                    StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then((user) => {
                        console.log('confirm otp', user)
                        if (!Utils.isNull(user)) {
                            user.status = statusType.ACTIVE
                            StorageUtil.storeItem(StorageUtil.USER_PROFILE, user)
                            if (this.props.screenType == screenType.FROM_LOGIN_SOCIAL) {
                                //Save token login
                                StorageUtil.storeItem(StorageUtil.USER_TOKEN, user.token)
                                StorageUtil.storeItem(StorageUtil.FIREBASE_TOKEN, user.firebaseToken)
                                global.token = user.token;
                                global.firebaseToken = user.firebaseToken;
                                this.props.notifyLoginSuccess()
                            }
                        }
                    }).catch((error) => {
                        //this callback is executed when your Promise is rejected
                        this.saveException(error, "handleData")
                    });
                    this.goHomeScreen()
                    // refresh token:
                    this.refreshToken()
                } else {
                    this.handleError(this.props.errorCode, this.props.error);
                    this.state.refreshing = false;
                }
            }
        }
    }

    componentDidMount() {
        this._interval = setInterval(() => {
            if (this.state.timeCountDown > 0) {
                this.setState({
                    timeCountDown: this.state.timeCountDown - 1,
                })
            } else {
                if (this.state.statusSend) {
                    this.setState({
                        statusSend: false,
                        textButton: localizes('otp.resendOTP'),
                        timeCountDown: 0
                    })
                }
            }
        }, 1000);
    }

    render() {
        const { textButton, codeOTP, telephoneNumber, statusSend, timeCountDown } = this.state
        return (
            <View style={{ flex: 1 }}>
                <BackgroundShadow
                    source={shadow_black_42}
                    style={{ marginHorizontal: Constants.MARGIN_X_LARGE }}
                    content={
                        <View style={{
                            paddingHorizontal: Constants.PADDING_X_LARGE,
                            backgroundColor: Colors.COLOR_WHITE,
                            borderRadius: Constants.CORNER_RADIUS
                        }}>
                            {/* Phone number */}
                            <TextInputCustom
                                refInput={ref => this.props.refInputPhone = ref}
                                isInputNormal={true}
                                placeholder={localizes('register.phone')}
                                value={telephoneNumber}
                                onChangeText={
                                    telephoneNumber => {
                                        this.setState({
                                            telephoneNumber: telephoneNumber
                                        })
                                    }
                                }
                                onSubmitEditing={() => {
                                    Keyboard.dismiss()
                                }}
                                keyboardType="numeric"
                                returnKeyType={"done"}
                                contentLeft={ic_account_grey}
                            />
                            <TextInputCustom
                                refInput={ref => this.codeOTP = ref}
                                isInputNormal={true}
                                placeholder={localizes('register.otpNumber')}
                                value={codeOTP}
                                onChangeText={
                                    codeOTP => {
                                        this.setState({
                                            codeOTP: codeOTP
                                        })
                                    }
                                }
                                onSubmitEditing={() => {
                                    Keyboard.dismiss()
                                }}
                                keyboardType="numeric"
                                returnKeyType={"done"}
                                borderBottomWidth={0}
                                contentLeft={ic_dialpad_grey}
                                contentRight={
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={() => !statusSend ? this.validatePhone(false) : null}>
                                        <Text style={[commonStyles.text, {
                                            color: Colors.COLOR_PRIMARY,
                                            margin: 0
                                        }]}>
                                            {timeCountDown != 0 ? DateUtil.parseMillisecondToTime(timeCountDown * 1000) : textButton}
                                        </Text>
                                    </TouchableOpacity>
                                }
                            />
                        </View>
                    } />
                <View style={{
                    marginHorizontal: Constants.MARGIN_X_LARGE,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <View style={{ flex: 1 }} />
                    <View style={{ flex: 1 }}>
                        {/* Register */}
                        {this.renderCommonButton(
                            this.props.screenType == screenType.FROM_LOGIN_SOCIAL ? localizes("forgot_password.btnUpdate") : localizes("register.next"),
                            { color: Colors.COLOR_WHITE },
                            {},
                            () => {
                                this.validatePhone(true)
                            }, false,
                            true
                        )}
                    </View>
                </View>
            </View>
        );
    }

    /**
     * Validate phone
     */
    validatePhone(next) {
        const { telephoneNumber } = this.state
        if (telephoneNumber == "") {
            this.showMessage(localizes("register.vali_fill_phone"))
        } else if (!Utils.validatePhone(telephoneNumber)) {
            this.showMessage(localizes("register.errorPhone"))
        } else {
            if (!next) {
                if (this.props.screenType == screenType.FROM_REGISTER) {
                    let signUpData = {
                        phone: telephoneNumber
                    }
                    this.props.signUp(signUpData)
                } else if (this.props.screenType == screenType.FROM_FORGET_PASSWORD) {
                    let updatePhone = false
                    let id = ""
                    this.props.forgetPass(telephoneNumber, updatePhone, id);
                } else if (this.props.screenType == screenType.FROM_LOGIN_SOCIAL) {
                    const { dataUser } = this.props
                    if (!Utils.isNull(dataUser)) {
                        let updatePhone = true
                        let id = dataUser.id
                        this.props.forgetPass(telephoneNumber, updatePhone, id);
                    }
                }
            } else {
                this.onActionNext()
            }
        }
    }

    onActionNext() {
        const { statusSend, codeOTP, telephoneNumber } = this.state
        StorageUtil.retrieveItem(StorageUtil.OTP_KEY).then((otpKey) => {
            if (!Utils.isNull(otpKey)) {
                if (codeOTP !== "") {
                    if (otpKey.codeOTP !== codeOTP) {
                        this.showMessage(localizes('otp.errOTP'))
                    } else {
                        if (this.props.screenType == screenType.FROM_REGISTER) {
                            this.showMessage(localizes('otp.succesOTP'))
                            this.props.navigation.navigate("Register", {
                                'phone': telephoneNumber,
                                'onBack': this.onBack
                            })
                        } else if (this.props.screenType == screenType.FROM_LOGIN_SOCIAL) {
                            const { dataUser } = this.props
                            const filter = {
                                codeOTP: codeOTP,
                                phone: telephoneNumber,
                                userId: dataUser.id
                            }
                            this.props.confirmOTP(filter); // set status for user = 1
                            this.showMessage(localizes('otp.succesOTP'))
                            StorageUtil.storeItem(StorageUtil.USER_PROFILE, dataUser)
                        } else if (this.props.screenType == screenType.FROM_FORGET_PASSWORD) {
                            this.props.navigation.navigate("ConfirmPassword", {
                                'phone': telephoneNumber,
                                'onBack': this.onBack
                            })
                        }
                        StorageUtil.deleteItem(StorageUtil.OTP_KEY)
                    }
                } else {
                    this.showMessage(localizes('otp.valiCode'))
                }
            } else {
                this.showMessage(localizes('otp.errorSendCode'))
            }
        }).catch((error) => {
            //this callback is executed when your Promise is rejected
            this.saveException(error, "onActionNext")
        });
    }
}

const mapStateToProps = state => ({
    data: state.otp.data,
    action: state.otp.action,
    isLoading: state.otp.isLoading,
    error: state.otp.error,
    errorCode: state.otp.errorCode
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions
};

export default connect(mapStateToProps, mapDispatchToProps)(TextInputOTP);
