import {ActionEvent, getActionSuccess} from 'actions/actionEvent';
import * as commonActions from 'actions/commonActions';
import * as actions from 'actions/userActions';
import DialogCustom from 'components/dialogCustom';
import FlatListCustom from 'components/flatListCustom';
import ImageLoader from 'components/imageLoader';
import {ErrorCode} from 'config/errorCode';
import BaseView from 'containers/base/baseView';
import {localizes} from 'locales/i18n';
import {Container, Content} from 'native-base';
import {RefreshControl, Text, View} from 'react-native';
import {connect} from 'react-redux';
import commonStyles from 'styles/commonStyles';
import StorageUtil from 'utils/storageUtil';
import Utils from 'utils/utils';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';
import {Fonts} from 'values/fonts';
import ItemSlidingMenuAdmin from './itemSlidingMenuAdmin';
import listSlidingMenu from './listSlidingMenuAdmin';
import styles from './styles';

const IMAGE_SIZE = 112;

class SlidingMenuAdminView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            enableRefresh: true,
            refreshing: true,
            source: '',
            fullName: '',
            isAlert: false,
        };
        this.listSlidingMenu = [];
        this.userInfo = null;
        this.branch = null;
        this.company = null;
    }

    componentDidMount() {
        this.getSourceUrlPath();
        this.listSlidingMenu = listSlidingMenu.ADMIN;
        this.getProfile();
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    /**
     * Handle data
     */
    handleData() {
        let data = this.props.data;
        console.log('DATA Profile', data);
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                this.state.refreshing = false;
                if (this.props.action == getActionSuccess(ActionEvent.GET_PROFILE_ADMIN)) {
                    this.handleGetProfile(data);
                    if (!Utils.isNull(data)) {
                        const resourceUrlPathResize = !Utils.isNull(this.resourceUrlPathResize)
                            ? this.resourceUrlPathResize.textValue
                            : null;
                        this.state.source =
                            !Utils.isNull(data.avatarPath) && data.avatarPath.indexOf('http') != -1
                                ? data.avatarPath
                                : resourceUrlPathResize + '=' + global.companyIdAlias + '/' + data.avatarPath;
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    // handle get profile
    handleGetProfile(user) {
        this.userInfo = user;
        this.setState({
            fullName: user.name,
            source: user.avatarPath,
        });
    }

    //onRefreshing
    handleRefresh = () => {
        this.state.refreshing = true;
        this.handleRequest();
    };

    // Handle request
    handleRequest() {
        this.props.getProfileAdmin(this.userInfo.id);
    }

    /**
     * Get profile user
     */
    getProfile() {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE)
            .then(user => {
                //this callback is executed when your Promise is resolved
                if (!Utils.isNull(user)) {
                    this.userInfo = user;
                    this.state.fullName = this.userInfo.name;
                    this.state.source = this.userInfo.avatarPath;
                    this.handleRequest();
                }
            })
            .catch(error => {
                //this callback is executed when your Promise is rejected
                this.saveException(error, 'getProfile');
            });
        StorageUtil.retrieveItem(StorageUtil.COMPANY_INFO)
            .then(companyInfo => {
                this.company = companyInfo.company;
                this.branch = companyInfo.branch;
            })
            .catch(error => {
                this.saveException(error, 'componentDidMount');
            });
    }

    /**
     * Render View
     */
    render() {
        return (
            <Container style={[styles.container, {backgroundColor: Colors.COLOR_WHITE}]}>
                <View style={{flex: 1}}>
                    <HStack style={[commonStyles.header]}>
                        {this.renderHeaderView({
                            visibleBack: false,
                            title: 'Công ty',
                            titleStyle: {color: Colors.COLOR_WHITE},
                        })}
                    </HStack>
                    <Content
                        showsVerticalScrollIndicator={false}
                        ref={e => {
                            this.fScroll = e;
                        }}
                        contentContainerStyle={{flexGrow: 1}}
                        style={{flex: 1}}
                        enableRefresh={this.state.enableRefresh}
                        refreshControl={
                            <RefreshControl
                                progressViewOffset={Constants.HEIGHT_HEADER_OFFSET_REFRESH}
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }>
                        {/* AVATAR */}
                        {this.renderHeaderUser()}
                        {/* /* SLIDING MENU */}
                        {!Utils.isNull(this.userInfo) && this.renderSlidingMenu()}
                        {this.logoutDialog()}
                    </Content>
                    {this.state.refreshing ? null : this.showLoadingBar(this.props.isLoading)}
                </View>
            </Container>
        );
    }

    /**
     * render menu
     */
    renderSlidingMenu() {
        return (
            <View style={{marginHorizontal: Constants.PADDING_X_LARGE}}>
                <FlatListCustom
                    style={{
                        backgroundColor: Colors.COLOR_WHITE,
                    }}
                    horizontal={false}
                    data={
                        this.userInfo.company.id == 1
                            ? listSlidingMenu.ADMIN
                            : !Utils.isNull(this.userInfo.branch)
                            ? listSlidingMenu.ADMIN_BRANCH
                            : listSlidingMenu.ADMIN_COMPANY
                    }
                    itemPerCol={1}
                    renderItem={this.renderItemSlide}
                    showsHorizontalScrollIndicator={true}
                />
            </View>
        );
    }

    /**
     * renderItem flat list
     */
    renderItemSlide = (item, index, parentIndex, indexInParent) => {
        return (
            <ItemSlidingMenuAdmin
                data={this.listSlidingMenu}
                item={item}
                index={index}
                navigation={this.props.navigation}
                userInfo={this.userInfo}
                company={this.company}
                resourceUrlPathResize={this.resourceUrlPathResize}
                source={this.state.source}
                onLogout={() => this.setState({isAlert: true})}
            />
        );
    };

    /**
     * Render header user
     */
    renderHeaderUser = () => {
        const {source, fullName} = this.state;

        let hasHttp = !Utils.isNull(source) && source.indexOf('http') != -1;
        let avatar = hasHttp
            ? source
            : this.resourceUrlPathResize.textValue + '=' + global.companyIdAlias + '/' + source;
        return (
            <View style={[styles.imageHeader]}>
                <View style={[styles.avatar, {justifyContent: 'center', alignItems: 'center'}]}>
                    {!Utils.isNull(source) ? (
                        <ImageLoader
                            style={[styles.avatar]}
                            resizeAtt={
                                hasHttp
                                    ? null
                                    : {
                                          type: 'thumbnail',
                                          width: IMAGE_SIZE,
                                          height: IMAGE_SIZE,
                                      }
                            }
                            resizeModeType={'cover'}
                            path={avatar}
                        />
                    ) : (
                        <Text
                            style={[
                                commonStyles.textBold,
                                {
                                    color: Colors.COLOR_PRIMARY,
                                    justifyContent: 'center',
                                    fontSize: Fonts.FONT_SIZE_X_LARGE * 2,
                                },
                            ]}>
                            AD
                        </Text>
                    )}
                </View>
                <View
                    style={{flex: 1, marginHorizontal: Constants.MARGIN_LARGE, marginVertical: Constants.MARGIN_LARGE}}>
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                        <Text
                            style={[commonStyles.textBold, {fontSize: Fonts.FONT_SIZE_X_MEDIUM, margin: 0}]}
                            numberOfLines={1}>
                            {!Utils.isNull(fullName) ? fullName : 'ADMIN'}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    /**
     * show dialog logout
     */
    logoutDialog = () => (
        <DialogCustom
            visible={this.state.isAlert}
            isVisibleTitle={true}
            isVisibleContentText={true}
            isVisibleTwoButton={true}
            contentTitle={'Xác nhận'}
            textBtnOne={'Hủy'}
            textBtnTwo={'Đăng xuất'}
            contentText={localizes('slidingMenu.want_out')}
            onTouchOutside={() => {
                this.setState({isAlert: false});
            }}
            onPressX={() => {
                this.setState({isAlert: false});
            }}
            onPressBtnPositive={() => {
                StorageUtil.retrieveItem(StorageUtil.FCM_TOKEN)
                    .then(token => {
                        if (token != undefined) {
                            // const deviceId = DeviceInfo.getDeviceId();
                            let filter = {
                                deviceId: '',
                                deviceToken: token,
                            };
                            this.props.deleteUserDeviceInfo(filter); // delete device info
                        } else {
                            console.log('token null');
                        }
                    })
                    .catch(error => {
                        //this callback is executed when your Promise is rejected
                        this.saveException(error, 'logoutDialog');
                    });
                StorageUtil.deleteItem(StorageUtil.USER_PROFILE)
                    .then(user => {
                        console.log('user setting', user);
                        if (Utils.isNull(user)) {
                            this.showMessage(localizes('setting.logoutSuccess'));
                            this.setState({isAlert: false});
                            this.logout();
                            this.goLoginScreen();
                        } else {
                            this.showMessage(localizes('setting.logoutFail'));
                        }
                    })
                    .catch(error => {
                        this.saveException(error, 'logoutDialog');
                    });
                this.signOutFB(this.state.userFB);
                this.signOutGG(this.state.userGG);
            }}
        />
    );
}

const mapStateToProps = state => ({
    data: state.slidingMenu.data,
    action: state.slidingMenu.action,
    isLoading: state.slidingMenu.isLoading,
    error: state.slidingMenu.error,
    errorCode: state.slidingMenu.errorCode,
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions,
};

export default connect(mapStateToProps, mapDispatchToProps)(SlidingMenuAdminView);
