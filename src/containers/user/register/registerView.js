'use strict';
import {ActionEvent, getActionSuccess} from 'actions/actionEvent';
import * as actions from 'actions/userActions';
import TextInputCustom from 'components/textInputCustom';
import {ErrorCode} from 'config/errorCode';
import BaseView from 'containers/base/baseView';
import screenType from 'enum/screenType';
import statusType from 'enum/statusType';
import ic_account_grey from 'images/ic_account_grey.png';
import ic_email_grey from 'images/ic_email_grey.png';
import ic_key_grey from 'images/ic_key_grey.png';
import ic_lock_grey from 'images/ic_lock_grey.png';
import ic_phone_grey from 'images/ic_phone_grey.png';
import ic_transparent from 'images/ic_transparent.png';
import ic_unlock_grey from 'images/ic_unlock_grey.png';
import {localizes} from 'locales/i18n';
import {Container, Form} from 'native-base';
import {
    BackHandler,
    Dimensions,
    Image,
    Keyboard,
    PixelRatio,
    ScrollView,
    StyleSheet,
    TouchableHighlight,
    View,
} from 'react-native';
import {connect} from 'react-redux';
import commonStyles from 'styles/commonStyles';
import DateUtil from 'utils/dateUtil';
import StorageUtil from 'utils/storageUtil';
import StringUtil, {capitalizeFirstLetter} from 'utils/stringUtil';
import Utils from 'utils/utils';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';
import styles from './styles';

const deviceHeight = Dimensions.get('window').height;
const MARGIN_BETWEEN_ITEM = 0;

class RegisterView extends BaseView {
    constructor(props) {
        super(props);
        const {emailOrPhone} = this.props.route.params;
        this.state = {
            telephoneNumber: !Utils.validateEmail(emailOrPhone) ? emailOrPhone : '',
            registerCode: '',
            fullName: '',
            email: Utils.validateEmail(emailOrPhone) ? emailOrPhone : '',
            password: '',
            repeatPassword: '',
            images: null,
            image: null,
            path: '',
            hidePassword: true,
            hidePasswordConfirm: true,
            enableScrollViewScroll: true,
        };
        this.today = DateUtil.now();
        this.selectedType = null;
        this.isFirstTime = true;
        this.hidePassword = true;
        this.hidePasswordConfirm = true;
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
    }

    /**
     * Login
     */
    login() {
        console.log(capitalizeFirstLetter('login'));
        // Actions.homeView();
        // this.props.navigation.navigate('drawerStack')
        this.props.navigation.navigate('Login');
    }

    /**
     * Register
     */
    register() {
        console.log(localizes('login.login_button'));
        this.props.navigation.navigate('Register');
    }

    managePasswordVisibility = () => {
        // function used to change password visibility
        let last = this.state.password;
        this.setState({hidePassword: !this.state.hidePassword, password: ''});
        setTimeout(() => {
            this.setState({password: last});
        }, 0);
    };

    managePasswordConfirmVisibility = () => {
        // function used to change password visibility
        let last = this.state.repeatPassword;
        this.setState({hidePasswordConfirm: !this.state.hidePasswordConfirm, repeatPassword: ''});
        setTimeout(() => {
            this.setState({repeatPassword: last});
        }, 0);
    };

    /**
     * validate
     */
    validate(user) {
        const {name, email, phone, birthDate, personalId, domicile, address, avatarPath} = user;
        if (
            !Utils.isNull(name) &&
            !Utils.isNull(email) &&
            !Utils.isNull(phone) &&
            !Utils.isNull(birthDate) &&
            !Utils.isNull(personalId) &&
            !Utils.isNull(domicile) &&
            !Utils.isNull(address) &&
            !Utils.isNull(avatarPath)
        ) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Goto user info
     * @param {*} data
     */
    gotoUserInfo = data => {
        this.props.navigation.navigate('UserInfo', {
            userInfo: data,
            callBack: null,
            screen: screenType.FROM_LOGIN,
        });
    };

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.SIGN_UP)) {
                    this.props.navigation.pop();
                    if (data.status === statusType.ACTIVE) {
                        StorageUtil.storeItem(StorageUtil.USER_PROFILE, data);
                        //Save token login
                        StorageUtil.storeItem(StorageUtil.USER_TOKEN, data.token);
                        StorageUtil.storeItem(StorageUtil.FIREBASE_TOKEN, data.firebaseToken);
                        global.token = data.token;
                        global.firebaseToken = data.firebaseToken;
                        this.props.notifyLoginSuccess();
                        if (Utils.isNull(data.branch) && !Utils.isNull(data.company.branches)) {
                            this.props.navigation.navigate('Department', {
                                userId: data.id,
                                company: data.company,
                                fromScreen: screenType.FROM_LOGIN,
                                callback: () => {
                                    if (this.validate(data)) {
                                        this.goHomeScreen();
                                    } else {
                                        this.gotoUserInfo(data);
                                    }
                                },
                            });
                        } else if (this.validate(data)) {
                            this.goHomeScreen();
                        } else {
                            this.gotoUserInfo(data);
                        }
                    } else {
                        this.props.navigation.navigate('Department', {
                            userId: data.id,
                            company: data.company,
                            fromScreen: screenType.FROM_REGISTER,
                        });
                    }
                }
            } else if (this.props.errorCode == ErrorCode.USER_EXIST_TRY_LOGIN_FAIL) {
                this.showMessage(localizes('userProfileView.existMobile'));
            } else if (this.props.errorCode == ErrorCode.EMAIL_EXIST_TRY_LOGIN_FAIL) {
                this.showMessage(localizes('userProfileView.existEmail'));
            } else if (this.props.errorCode == ErrorCode.COMPANY_NOT_EXIST) {
                this.showMessage(localizes('userProfileView.notExistCompany'));
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

    /**
     * Validate and sign up
     */
    validateAndSignUp() {
        const {fullName, password, telephoneNumber, repeatPassword, email, registerCode} = this.state;
        let type = [];
        let certificatePath = [];
        if (this.state.images != null) {
            for (let i = 0; i < this.state.images.length; i++) {
                certificatePath.push(this.state.images[i].uri);
            }
        }
        type.push(this.selectedType);
        const res = telephoneNumber.trim().charAt(0);
        if (Utils.isNull(fullName.trim()) || fullName.trim().length == 0) {
            this.showMessage(localizes('register.vali_fill_fullname'));
            this.fullName.focus();
        } else if (StringUtil.validSpecialCharacter(fullName.trim()) || StringUtil.validEmojiIcon(fullName.trim())) {
            this.showMessage(localizes('register.vali_fullname'));
            this.fullName.focus();
        } else if (fullName.trim().length > 60) {
            this.showMessage(localizes('register.vali_fullname_length'));
            this.fullName.focus();
        } else if (Utils.isNull(telephoneNumber.trim())) {
            this.showMessage(localizes('register.vali_fill_phone'));
            this.telephoneNumber.focus();
        } else if (telephoneNumber.trim().length != 10 || res != '0') {
            this.showMessage(localizes('register.errorPhone'));
            this.telephoneNumber.focus();
        } else if (!Utils.validatePhone(telephoneNumber.trim())) {
            this.showMessage(localizes('register.vali_phone'));
            this.telephoneNumber.focus();
        } else if (Utils.isNull(email.trim())) {
            this.showMessage(localizes('register.vali_fill_email'));
            this.email.focus();
        } else if (!Utils.validateEmail(email.trim())) {
            this.showMessage(localizes('register.vali_email'));
            this.email.focus();
        } else if (Utils.isNull(registerCode.trim())) {
            this.showMessage(localizes('register.vali_fill_registerCode'));
            this.registerCode.focus();
        } else if (Utils.isNull(password)) {
            this.showMessage(localizes('register.vali_fill_password'));
            this.password.focus();
        } else if (password.trim().length < 6 || password.trim().length > 20) {
            this.showMessage(localizes('register.vali_character_password'));
            this.password.focus();
        } else if (!Utils.validateContainUpperPassword(password)) {
            this.showMessage(localizes('register.vali_character_password'));
            this.password.focus();
        } else if (Utils.isNull(repeatPassword)) {
            this.showMessage(localizes('register.vali_fill_repeat_password'));
            this.confirmPassword.focus();
        } else if (password != repeatPassword) {
            this.showMessage(localizes('register.vali_confirm_password'));
            this.confirmPassword.focus();
        } else {
            let signUpData = {
                name: this.state.fullName.trim(),
                phone: this.state.telephoneNumber.trim(),
                email: this.state.email.trim(),
                password: this.state.password.trim(),
                registerCode: this.state.registerCode.trim(),
            };
            this.props.signUp(signUpData);
        }
        this._container.scrollTo({x: 0, y: 0, animated: true});
    }

    focusInput(text) {
        if (this.isFirstTime) return true;
        return text !== '';
    }

    render() {
        return (
            <Container style={styles.container}>
                <View style={{flex: 1}}>
                    <HStack style={commonStyles.header}>
                        {this.renderHeaderView({
                            title: localizes('register.register_title'),
                            titleStyle: {color: Colors.COLOR_WHITE},
                            renderRightMenu: this.renderRightHeader,
                        })}
                    </HStack>
                    <ScrollView
                        contentContainerStyle={{flexGrow: 1}}
                        style={{flex: 1}}
                        keyboardShouldPersistTaps="handled"
                        ref={r => (this._container = r)}
                        scrollEnabled={this.state.enableScrollViewScroll}>
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
                                    {/* Full name */}
                                    <TextInputCustom
                                        refInput={input => (this.fullName = input)}
                                        isInputNormal={true}
                                        placeholder={localizes('register.contactName')}
                                        value={this.state.fullName}
                                        onChangeText={fullName => this.setState({fullName})}
                                        onSubmitEditing={() => {
                                            this.telephoneNumber.focus();
                                            this._container.scrollTo({x: 0, y: 50, animated: true});
                                        }}
                                        returnKeyType={'next'}
                                        autoCapitalize="words"
                                        {...(this.focusInput(this.state.fullName) ? {autoFocus: true} : null)}
                                        contentLeft={ic_account_grey}
                                        inputNormalStyle={{
                                            paddingVertical: Constants.MARGIN_LARGE + Constants.MARGIN,
                                        }}
                                    />
                                    {/* Phone number */}
                                    <TextInputCustom
                                        refInput={input => (this.telephoneNumber = input)}
                                        isInputNormal={true}
                                        placeholder={localizes('register.phone')}
                                        value={this.state.telephoneNumber}
                                        onChangeText={telephoneNumber => this.setState({telephoneNumber})}
                                        onSubmitEditing={() => {
                                            this.email.focus();
                                            this._container.scrollTo({x: 0, y: 100, animated: true});
                                        }}
                                        returnKeyType={'next'}
                                        keyboardType="phone-pad"
                                        contentLeft={ic_phone_grey}
                                        inputNormalStyle={{
                                            paddingVertical: Constants.MARGIN_LARGE + Constants.MARGIN,
                                        }}
                                    />
                                    {/* Email */}
                                    <TextInputCustom
                                        refInput={input => (this.email = input)}
                                        isInputNormal={true}
                                        placeholder={localizes('register.email')}
                                        value={this.state.email}
                                        onChangeText={email => this.setState({email})}
                                        onSubmitEditing={() => {
                                            this.password.focus();
                                            this._container.scrollTo({x: 0, y: 150, animated: true});
                                        }}
                                        returnKeyType={'next'}
                                        keyboardType="email-address"
                                        blurOnSubmit={false}
                                        autoCapitalize="none"
                                        contentLeft={ic_email_grey}
                                        inputNormalStyle={{
                                            paddingVertical: Constants.MARGIN_LARGE + Constants.MARGIN,
                                        }}
                                    />
                                    {/* Register code */}
                                    <TextInputCustom
                                        refInput={input => {
                                            this.registerCode = input;
                                        }}
                                        isInputNormal={true}
                                        placeholder={localizes('register.registerCode')}
                                        value={this.state.registerCode}
                                        onChangeText={this.onChangeTextCode}
                                        onSubmitEditing={Keyboard.dismiss}
                                        returnKeyType={'done'}
                                        blurOnSubmit={false}
                                        numberOfLines={1}
                                        contentLeft={ic_key_grey}
                                        inputNormalStyle={{
                                            paddingVertical: Constants.MARGIN_LARGE + Constants.MARGIN,
                                            paddingRight: Constants.PADDING_XX_LARGE,
                                        }}
                                    />
                                    {/*Password*/}
                                    <TextInputCustom
                                        refInput={input => {
                                            this.password = input;
                                        }}
                                        isInputNormal={true}
                                        placeholder={localizes('register.password')}
                                        value={this.state.password}
                                        onChangeText={password => this.setState({password})}
                                        onSubmitEditing={() => {
                                            this.confirmPassword.focus();
                                            this._container.scrollTo({x: 0, y: 200, animated: true});
                                        }}
                                        returnKeyType={'next'}
                                        blurOnSubmit={false}
                                        numberOfLines={1}
                                        secureTextEntry={this.state.hidePassword}
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
                                        inputNormalStyle={{
                                            paddingVertical: Constants.MARGIN_LARGE + Constants.MARGIN,
                                            paddingRight: Constants.PADDING_XX_LARGE,
                                        }}
                                    />
                                    {/* Confirm password */}
                                    <TextInputCustom
                                        refInput={input => {
                                            this.confirmPassword = input;
                                        }}
                                        isInputNormal={true}
                                        placeholder={localizes('register.confirmPass')}
                                        value={this.state.repeatPassword}
                                        onChangeText={repeatPassword => this.setState({repeatPassword})}
                                        onSubmitEditing={Keyboard.dismiss}
                                        returnKeyType={'done'}
                                        blurOnSubmit={false}
                                        numberOfLines={1}
                                        secureTextEntry={this.state.hidePasswordConfirm}
                                        borderBottomWidth={0}
                                        contentLeft={ic_transparent}
                                        contentRight={
                                            <TouchableHighlight
                                                onPress={this.manageConfirmPasswordVisibility}
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
                                                    source={
                                                        this.state.hidePasswordConfirm ? ic_unlock_grey : ic_lock_grey
                                                    }
                                                />
                                            </TouchableHighlight>
                                        }
                                        inputNormalStyle={{
                                            paddingVertical: Constants.MARGIN_LARGE + Constants.MARGIN,
                                            paddingRight: Constants.PADDING_XX_LARGE,
                                        }}
                                    />
                                </View>
                            </Form>
                            {/* Register */}
                            {this.renderCommonButton(
                                localizes('register.register_button'),
                                {color: Colors.COLOR_WHITE},
                                {marginHorizontal: Constants.MARGIN_X_LARGE},
                                () => {
                                    this.onPressRegister();
                                },
                            )}
                        </View>
                    </ScrollView>
                    {this.showLoadingBar(this.props.isLoading)}
                </View>
            </Container>
        );
    }

    /**
     * On change text code
     */
    onChangeTextCode = registerCode => {
        this.setState({registerCode});
    };

    /**
     * Manage Password Visibility
     */
    managePasswordVisibility = () => {
        // function used to change password visibility
        let last = this.state.password;
        this.setState({hidePassword: !this.state.hidePassword, password: ''});
        setTimeout(() => {
            this.setState({password: last});
        }, 0);
    };

    /**
     * Manage Confirm Password Visibility
     */
    manageConfirmPasswordVisibility = () => {
        // function used to change password visibility
        let last = this.state.confirmPassword;
        this.setState({hidePasswordConfirm: !this.state.hidePasswordConfirm, confirmPassword: ''});
        setTimeout(() => {
            this.setState({confirmPassword: last});
        }, 0);
    };

    /**
     * Register
     */
    onPressRegister() {
        this.validateAndSignUp();
    }
}

const styless = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        fontSize: 12,
        textAlign: 'center',
        color: '#888',
        marginTop: 5,
        backgroundColor: 'transparent',
    },
    data: {
        padding: 15,
        marginTop: 10,
        backgroundColor: '#000',
        borderColor: '#888',
        borderWidth: 1 / PixelRatio.get(),
        color: '#777',
    },
});

const mapStateToProps = state => ({
    data: state.signUp.data,
    isLoading: state.signUp.isLoading,
    error: state.signUp.error,
    errorCode: state.signUp.errorCode,
    action: state.signUp.action,
});

export default connect(mapStateToProps, actions)(RegisterView);
