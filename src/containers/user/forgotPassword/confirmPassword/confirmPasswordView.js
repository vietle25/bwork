'use strict';
import React, { Component } from 'react';
import { View, TextInput, Image, StyleSheet, Text, ImageBackground, TouchableOpacity, TouchableHighlight, Keyboard, ScrollView } from 'react-native';
import { Container, Form, Content, Item, Input, Button, Right, Icon, Header, Root, Left, Body, Title, Toast } from 'native-base';
import ButtonComp from 'components/button';
import StringUtil from 'utils/stringUtil';
import cover from 'images/bg_launch.png';
import styles from './styles';
import { localizes } from 'locales/i18n';
import BaseView from 'containers/base/baseView';
import * as actions from 'actions/userActions';
import { connect } from 'react-redux';
import commonStyles from 'styles/commonStyles';
import { Fonts } from 'values/fonts';
import ic_facebook_blue from 'images/ic_facebook_blue.png'
import ic_google_red from 'images/ic_google_red.png'
import ic_unlock_grey from 'images/ic_unlock_grey.png'
import ic_lock_grey from 'images/ic_lock_grey.png'
import { Constants } from 'values/constants';
import { Colors } from 'values/colors';
import ic_avatar_small_red from 'images/ic_avatar_small_red.png'
import ic_back_white from 'images/ic_back_white.png'
import { ErrorCode } from 'config/errorCode';
import Utils from 'utils/utils';
import StorageUtil from 'utils/storageUtil';
import { dispatch } from 'rxjs/internal/observable/pairs';
import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import GenderType from 'enum/genderType';
import ic_facebook from 'images/ic_facebook.png'
import ic_google_plus from 'images/ic_google_plus.png'
import statusType from 'enum/statusType';
import screenType from 'enum/screenType';
import TextInputCustom from 'components/textInputCustom';
import ic_logo from "images/ic_logo.png";
import shadow_black_42 from "images/shadow_black_42.png";
import ic_key_grey from "images/ic_key_grey.png";
import ic_transparent from "images/ic_transparent.png";
import BackgroundTopView from 'components/backgroundTopView';

class ConfirmPasswordView extends BaseView {

    constructor() {
        super();
        this.state = {
            hideNewPassword: true,
            hideRetypePassword: true,
            newPass: "",
            retypePass: "",
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.handleData()
        }
    }

    /**
      * Handle data when request
      */
    handleData() {
        let data = this.props.data
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS && data == true) {
                if (this.props.action == getActionSuccess(ActionEvent.CHANGE_PASS)) {
                    if (data) {
                        this.showMessage(localizes("setting.change_pass_success"));
                        this.props.navigation.goBack()
                        this.props.navigation.navigate('Login')
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    // On press change password
    onPressUpdatePass = () => {
        let {
            newPass,
            retypePass
        } = this.state;
        const { phone } = this.props.navigation.state.params
        if (newPass == "") {
            this.showMessage(localizes('confirmPassword.enterNewPass'))
            this.newPass.focus()
            return false
        } else if (newPass.length < 6 || newPass.length > 20) {
            this.showMessage(localizes('confirmPassword.vali_character_password'))
            this.newPass.focus()
            return false
        } else if (!Utils.validateContainUpperPassword(newPass)) {
            this.showMessage(localizes('setting.vali_character_password'))
            this.newPass.focus()
            return false
        } else if (retypePass == "") {
            this.showMessage(localizes('confirmPassword.vali_fill_repeat_password'))
            this.retypePass.focus()
            return false
        } else if (newPass !== retypePass) {
            this.showMessage(localizes('confirmPassword.vali_confirm_password'))
            this.retypePass.focus()
            return false
        } else {
            this.props.changePass("", newPass, phone, screenType.FROM_FORGET_PASSWORD);
            return true
        }
    }

    render() {
        return (
            <Container style={styles.container}>
                <Root>
                    <BackgroundTopView />
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                        <Header style={commonStyles.header}>
                            {this.renderHeaderView({
                                title: "Đặt lại mật khẩu",
                                titleStyle: { marginRight: Constants.MARGIN_X_LARGE * 2, color: Colors.COLOR_WHITE },
                                onBack: () => this.props.navigation.state.params.onBack()
                            })}
                        </Header>
                        <Content contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}>
                            <View style={{ flexGrow: 1 }}>
                                <View style={[commonStyles.viewCenter]}>
                                    <Image source={ic_logo} />
                                    {/* <Text style={commonStyles.titleTop}>{localizes("title_app")}</Text> */}
                                </View>
                                {/* {Input form} */}
                                <Form style={{ flex: 1, marginTop: Constants.MARGIN_XX_LARGE + Constants.MARGIN }}>
                                    <BackgroundShadow
                                        source={shadow_black_42}
                                        style={{ marginHorizontal: Constants.MARGIN_X_LARGE }}
                                        content={
                                            <View style={{
                                                paddingHorizontal: Constants.PADDING_X_LARGE,
                                                backgroundColor: Colors.COLOR_WHITE,
                                                borderRadius: Constants.CORNER_RADIUS
                                            }}>
                                                {/* Password */}
                                                <View style={{ justifyContent: 'center', position: 'relative' }}>
                                                    <TextInputCustom
                                                        refInput={ref => this.newPass = ref}
                                                        isInputNormal={true}
                                                        placeholder={localizes('forgot_password.input_newPass')}
                                                        value={this.state.newPass}
                                                        secureTextEntry={this.state.hideNewPassword}
                                                        onChangeText={(newPass) => {
                                                            this.setState({
                                                                newPass
                                                            })
                                                        }}
                                                        onSelectionChange={({ nativeEvent: { selection } }) => {
                                                            console.log(this.className, selection)
                                                        }}
                                                        returnKeyType={"next"}
                                                        inputNormalStyle={{ paddingRight: Constants.PADDING_XX_LARGE + Constants.PADDING_X_LARGE }}
                                                        onSubmitEditing={() => {
                                                            this.retypePass.focus()
                                                        }}
                                                        contentLeft={ic_key_grey}
                                                    />
                                                    <TouchableHighlight
                                                        onPress={() => {
                                                            this.setState({ hideNewPassword: !this.state.hideNewPassword })
                                                        }}
                                                        style={[commonStyles.shadowOffset, {
                                                            position: 'absolute', padding: Constants.PADDING_LARGE,
                                                            right: Constants.PADDING_LARGE
                                                        }]}
                                                        underlayColor='transparent'
                                                    >
                                                        <Image style={{ resizeMode: 'contain', opacity: 0.5 }}
                                                            source={(this.state.hideNewPassword) ? ic_unlock_grey : ic_lock_grey} />
                                                    </TouchableHighlight>
                                                </View>
                                                {/* Confirm password */}
                                                <View style={{ justifyContent: 'center', position: 'relative' }}>
                                                    <TextInputCustom
                                                        refInput={ref => this.retypePass = ref}
                                                        isInputNormal={true}
                                                        placeholder={localizes('forgot_password.input_confirm_newPass')}
                                                        value={this.state.retypePass}
                                                        secureTextEntry={this.state.hideRetypePassword}
                                                        onChangeText={(retypePass) => {
                                                            this.setState({
                                                                retypePass
                                                            })
                                                        }}
                                                        onSelectionChange={({ nativeEvent: { selection } }) => {
                                                            console.log(this.className, selection)
                                                        }}
                                                        returnKeyType={"done"}
                                                        inputNormalStyle={{ paddingRight: Constants.PADDING_XX_LARGE + Constants.PADDING_X_LARGE }}
                                                        onSubmitEditing={() => {
                                                            Keyboard.dismiss()
                                                        }}
                                                        borderBottomWidth={0}
                                                        contentLeft={ic_transparent}
                                                    />
                                                    <TouchableHighlight
                                                        onPress={() => {
                                                            this.setState({ hideRetypePassword: !this.state.hideRetypePassword })
                                                        }}
                                                        style={[commonStyles.shadowOffset, {
                                                            position: 'absolute', padding: Constants.PADDING_LARGE,
                                                            right: Constants.PADDING_LARGE
                                                        }]}
                                                        underlayColor='transparent'
                                                    >
                                                        <Image style={{ resizeMode: 'contain', opacity: 0.5 }}
                                                            source={(this.state.hideRetypePassword) ? ic_unlock_grey : ic_lock_grey} />
                                                    </TouchableHighlight>
                                                </View>
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
                                                localizes('forgot_password.btnChangePass'),
                                                {
                                                    color: Colors.COLOR_WHITE
                                                }, {}, () => {
                                                    this.onPressUpdatePass()
                                                }, false,
                                                true
                                            )}
                                        </View>
                                    </View>
                                </Form>
                            </View>
                        </Content>
                        {this.showLoadingBar(this.props.isLoading)}
                    </View>
                </Root >
            </Container >
        )
    }
}

const mapStateToProps = state => ({
    data: state.changePass.data,
    action: state.changePass.action,
    isLoading: state.changePass.isLoading,
    error: state.changePass.error,
    errorCode: state.changePass.errorCode
});

export default connect(mapStateToProps, actions)(ConfirmPasswordView);
