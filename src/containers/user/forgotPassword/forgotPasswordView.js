'use strict';
import {ActionEvent, getActionSuccess} from 'actions/actionEvent';
import * as actions from 'actions/userActions';
import DialogCustom from 'components/dialogCustom';
import TextInputCustom from 'components/textInputCustom';
import {ErrorCode} from 'config/errorCode';
import BaseView from 'containers/base/baseView';
import ic_email_grey from 'images/ic_email_grey.png';
import {localizes} from 'locales/i18n';
import {Container, Content, Form} from 'native-base';
import {BackHandler, Keyboard, View} from 'react-native';
import {connect} from 'react-redux';
import commonStyles from 'styles/commonStyles';
import Utils from 'utils/utils';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';
import styles from './styles';

class ForgotPasswordView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            isAlertSuccess: false,
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
    }

    // Forget password
    onForgotPass = () => {
        var {email} = this.state;
        if (email.trim() == '') {
            this.showMessage(localizes('forgot_password.input_email'));
        } else if (!Utils.validateEmail(email.trim())) {
            this.showMessage(localizes('forgot_password.invalidEmail'));
        } else {
            this.props.forgetPass(email.trim());
        }
    };

    handleData() {
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.FORGET_PASS)) {
                    if (data == true) {
                        this.setState({isAlertSuccess: true});
                    }
                }
            } else if (this.props.errorCode == ErrorCode.INVALID_ACCOUNT) {
                if (this.props.action == getActionSuccess(ActionEvent.FORGET_PASS)) {
                    this.showMessage(localizes('forgot_password.accountNotExist'));
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    render() {
        return (
            <Container style={styles.container}>
                <View style={{flex: 1}}>
                    <HStack style={commonStyles.header}>
                        {this.renderHeaderView({
                            title: localizes('forgot_password.titleForgotPassword'),
                            titleStyle: {color: Colors.COLOR_WHITE},
                            renderRightMenu: this.renderRightHeader,
                        })}
                    </HStack>
                    <Content contentContainerStyle={{flexGrow: 1}} style={{flex: 1}}>
                        <View style={{flexGrow: 1}}>
                            {/* <View style={[commonStyles.viewCenter, { flex: 1 }]}>
                                <Image source={ic_logo} />
                            </View> */}
                            {/* {Input form} */}
                            <Form style={{flex: 1}}>
                                <View
                                    style={{
                                        paddingHorizontal: Constants.PADDING_X_LARGE,
                                        backgroundColor: Colors.COLOR_WHITE,
                                        borderRadius: Constants.CORNER_RADIUS,
                                        margin: Constants.MARGIN_X_LARGE,
                                    }}>
                                    <TextInputCustom
                                        refInput={ref => (this.emailRef = ref)}
                                        isInputNormal={true}
                                        placeholder={localizes('forgot_password.email')}
                                        onChangeText={email => {
                                            this.setState({email: email});
                                        }}
                                        keyboardType="email-address"
                                        value={this.state.email}
                                        returnKeyType={'done'}
                                        onSubmitEditing={() => {
                                            Keyboard.dismiss();
                                        }}
                                        autoCapitalize="none"
                                        autoFocus={true}
                                        borderBottomWidth={0}
                                        contentLeft={ic_email_grey}
                                        inputNormalStyle={{
                                            paddingVertical: Constants.MARGIN_LARGE + Constants.MARGIN,
                                        }}
                                    />
                                </View>
                                <View style={{flex: 1, justifyContent: 'flex-end'}}>
                                    {this.renderCommonButton(
                                        localizes('forgot_password.btnSendPassword'),
                                        {color: Colors.COLOR_WHITE},
                                        {marginHorizontal: Constants.MARGIN_X_LARGE},
                                        () => {
                                            this.onForgotPass();
                                        },
                                        false, // isBtnLogOut
                                        true, // isBtnRegister
                                    )}
                                </View>
                            </Form>
                        </View>
                    </Content>
                    {this.renderAlertSuccess()}
                    {this.showLoadingBar(this.props.isLoading)}
                </View>
            </Container>
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
                contentTitle={'Thông báo'}
                textBtn={'Ok'}
                contentText={'Mật khẩu mới đã được gửi vào email của bạn, vui lòng kiểm tra và đăng nhập lại!'}
                onPressBtn={() => {
                    this.setState({isAlertSuccess: false});
                    this.onBack();
                }}
            />
        );
    }
}

const mapStateToProps = state => ({
    data: state.forgetPass.data,
    action: state.forgetPass.action,
    isLoading: state.forgetPass.isLoading,
    error: state.forgetPass.error,
    errorCode: state.forgetPass.errorCode,
});
export default connect(mapStateToProps, actions)(ForgotPasswordView);
