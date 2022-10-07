import {ActionEvent, getActionSuccess} from 'actions/actionEvent';
import * as actions from 'actions/userActions';
import BackgroundShadow from 'components/backgroundShadow';
import BackgroundTopView from 'components/backgroundTopView';
import FlatListCustom from 'components/flatListCustom';
import Hr from 'components/hr';
import {ErrorCode} from 'config/errorCode';
import BaseView from 'containers/base/baseView';
import partnerType from 'enum/partnerType';
import screenType from 'enum/screenType';
import ic_logo from 'images/ic_logo.png';
import shadow_horizontal from 'images/shadow_horizontal.png';
import {localizes} from 'locales/i18n';
import {Container, Content} from 'native-base';
import {BackHandler, Image, Text, TouchableOpacity, View} from 'react-native';
import {connect} from 'react-redux';
import commonStyles from 'styles/commonStyles';
import Utils from 'utils/utils';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';
import {Fonts} from 'values/fonts';
import ItemPartner from './itemPartner';
import styles from './styles';

class RegisterPartnerView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            enableRefresh: true,
            enableLoadMore: false,
            selected: 0,
            nextText: localizes('registerPartner.confirm'),
            next: false,
            data: null,
        };
        const {callBack, data, partnerCurrent, screen} = this.props.route.params;
        this.listPartner = [];
        this.onItemSelected = this.onItemSelected.bind(this);
        this.confirmAction = this.confirmAction.bind(this);
        this.handleRefresh = this.handleRefresh.bind(this);
        this.callBack = callBack;
        this.screen = screen;
        this.data = data;
        this.partnerCurrent = partnerCurrent;
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        if (this.screen == screenType.FROM_USER_PROFILE) {
            this.setState({nextText: localizes('registerPartner.save')});
        }
        if (Utils.isNull(this.data)) {
            this.props.getListPartner();
        } else {
            this.data.forEach((item, index) => {
                if (!Utils.isNull(this.partnerCurrent)) {
                    if (this.partnerCurrent.type == partnerType.PARTNER) {
                        if (this.partnerCurrent.id == item.id) {
                            this.setState({data: item, selected: index});
                        }
                    }
                } else {
                    if (index == 0) {
                        this.setState({data: item});
                    }
                }
                this.listPartner.push({...item});
            });
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    // Confirm choose partner
    confirmChoosePartner() {
        if (this.screen == screenType.FROM_USER_PROFILE) {
            this.callBack();
            this.props.navigation.navigate('Profile');
        } else {
            this.goHomeScreen();
        }
    }

    /**
     * Handler back button
     */
    handlerBackButton() {
        console.log(this.className, 'back pressed');
        if (this.props.navigation && this.callBack) {
            this.onBack();
        }
        return true;
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.GET_LIST_PARTNER)) {
                    this.listPartner = [];
                    if (data.length > 0) {
                        data.forEach((item, index) => {
                            if (index == 0) {
                                this.setState({data: item});
                            }
                            this.listPartner.push({...item});
                            if (!Utils.isNull(this.partnerCurrent)) {
                                if (this.partnerCurrent.type == partnerType.PARTNER_FIELD) {
                                    if (this.partnerCurrent.id == item.id) {
                                        this.onItemSelected(item, index, false);
                                    }
                                } else if (this.partnerCurrent.type == partnerType.PARTNER) {
                                    if (this.partnerCurrent.parentCategoryId == item.id) {
                                        this.onItemSelected(item, index, false);
                                    }
                                }
                            }
                        });
                    } else {
                        if (this.screen == screenType.FROM_REGISTER) {
                            this.setState({nextText: localizes('registerPartner.skip')});
                        }
                    }
                    console.log('DATA PARTNER', this.listPartner);
                } else if (this.props.action == getActionSuccess(ActionEvent.SAVE_PARTNER)) {
                    if (data) {
                        this.confirmChoosePartner();
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    render() {
        const {nextText} = this.state;
        return (
            <Container style={styles.container}>
                <View style={{flex: 1}}>
                    <BackgroundTopView
                        ratio={this.screen == screenType.FROM_USER_PROFILE ? Constants.RATIO_BACKGROUND_TOP_VIEW : 3}
                    />
                    <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
                        <HStack
                            style={[{backgroundColor: Colors.COLOR_TRANSPARENT, borderBottomWidth: 0, elevation: 0}]}>
                            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                                {this.renderHeaderView({
                                    visibleBack:
                                        this.screen == screenType.FROM_USER_PROFILE
                                            ? true
                                            : this.callBack
                                            ? true
                                            : false,
                                    title: this.screen == screenType.FROM_USER_PROFILE ? 'Đơn vị' : '',
                                    titleStyle: {marginRight: Constants.MARGIN_X_LARGE * 2, color: Colors.COLOR_WHITE},
                                })}
                                {this.screen == screenType.FROM_USER_PROFILE ? null : (
                                    <TouchableOpacity
                                        activeOpacity={Constants.ACTIVE_OPACITY}
                                        onPress={this.confirmAction}>
                                        <Text
                                            style={[
                                                commonStyles.text,
                                                {
                                                    fontSize: Fonts.FONT_SIZE_MEDIUM,
                                                    marginRight: Constants.MARGIN_LARGE,
                                                    color: Colors.COLOR_WHITE,
                                                },
                                            ]}>
                                            {nextText}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </HStack>
                        <Content
                            // refreshControl={
                            //     <RefreshControl
                            //         progressViewOffset={Constants.HEIGHT_HEADER_OFFSET_REFRESH}
                            //         refreshing={this.state.refreshing}
                            //         onRefresh={this.handleRefresh}
                            //     />
                            // }
                            contentContainerStyle={{flexGrow: 1}}
                            style={{flex: 1}}>
                            <View style={{flexGrow: 1}}>
                                {this.screen == screenType.FROM_USER_PROFILE ? null : (
                                    <View style={[commonStyles.viewCenter]}>
                                        <Image source={ic_logo} />
                                    </View>
                                )}
                                {!Utils.isNull(this.listPartner) ? this.renderListPartner() : null}
                            </View>
                        </Content>
                        {this.showLoadingBar(this.props.isLoading)}
                    </View>
                </View>
            </Container>
        );
    }

    // Next or confirm
    confirmAction() {
        const {next, data} = this.state;
        next
            ? this.props.navigation.push('RegisterPartner', {
                  callBack: this.confirmChoosePartner.bind(this),
                  data: data,
                  partnerCurrent: this.partnerCurrent,
                  screen: this.screen,
              })
            : !Utils.isNull(data)
            ? this.props.savePartner({partnerId: data.id})
            : this.confirmChoosePartner();
    }

    /**
     * Render list partner
     */
    renderListPartner() {
        return (
            <View
                style={{
                    marginHorizontal: Constants.MARGIN_X_LARGE,
                    marginTop: this.screen == screenType.FROM_USER_PROFILE ? 0 : Constants.MARGIN_XX_LARGE,
                }}>
                <BackgroundShadow
                    source={shadow_horizontal}
                    content={
                        <View>
                            <FlatListCustom
                                style={{
                                    backgroundColor: Colors.COLOR_WHITE,
                                    borderBottomLeftRadius:
                                        this.screen == screenType.FROM_USER_PROFILE ? 0 : Constants.CORNER_RADIUS,
                                    borderBottomRightRadius:
                                        this.screen == screenType.FROM_USER_PROFILE ? 0 : Constants.CORNER_RADIUS,
                                    borderTopLeftRadius: Constants.CORNER_RADIUS,
                                    borderTopRightRadius: Constants.CORNER_RADIUS,
                                }}
                                horizontal={false}
                                data={this.listPartner}
                                itemPerCol={1}
                                renderItem={this.renderItem.bind(this)}
                                showsHorizontalScrollIndicator={false}
                            />
                            {/* Button save */}
                            {this.screen == screenType.FROM_USER_PROFILE ? (
                                <TouchableOpacity
                                    activeOpacity={Constants.ACTIVE_OPACITY}
                                    onPress={this.confirmAction}
                                    block
                                    style={[
                                        commonStyles.viewCenter,
                                        {
                                            backgroundColor: Colors.COLOR_WHITE,
                                            borderBottomLeftRadius: Constants.CORNER_RADIUS,
                                            borderBottomRightRadius: Constants.CORNER_RADIUS,
                                        },
                                    ]}>
                                    <Text
                                        style={[
                                            commonStyles.text,
                                            {
                                                color: Colors.COLOR_PRIMARY,
                                                paddingVertical: Constants.PADDING_X_LARGE,
                                            },
                                        ]}>
                                        {this.state.nextText}
                                    </Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    }></BackgroundShadow>
            </View>
        );
    }

    //onRefreshing
    handleRefresh() {
        this.setState({
            refreshing: false,
            selected: 0,
            nextText: localizes('registerPartner.confirm'),
            next: false,
            data: null,
        });
        this.props.getListPartner();
    }

    /**
     * Render item
     * @param {*} item
     * @param {*} index
     * @param {*} parentIndex
     * @param {*} indexInParent
     */
    renderItem(item, index, parentIndex, indexInParent) {
        const {selected} = this.state;
        return (
            <View>
                <ItemPartner
                    data={this.listPartner}
                    item={item}
                    index={index}
                    onItemSelected={this.onItemSelected}
                    selected={selected}
                    screen={this.screen}
                />
                {/* HR */}
                {index != this.listPartner.length - 1 ? (
                    <Hr style={{marginHorizontal: Constants.MARGIN_X_LARGE}} color={Colors.COLOR_BACKGROUND} />
                ) : this.screen == screenType.FROM_USER_PROFILE ? (
                    <Hr style={{marginHorizontal: Constants.MARGIN_X_LARGE}} color={Colors.COLOR_BACKGROUND} />
                ) : null}
            </View>
        );
    }

    /**
     * On itemSelected
     */
    onItemSelected(item, index, isNextChild = true) {
        this.setState({selected: index});
        if (!Utils.isNull(item.child)) {
            if (isNextChild) {
                this.props.navigation.push('RegisterPartner', {
                    callBack: this.confirmChoosePartner.bind(this),
                    data: item.child,
                    partnerCurrent: this.partnerCurrent,
                    screen: this.screen,
                });
            }
            this.setState({
                nextText: localizes('registerPartner.next'),
                next: true,
                data: item.child,
            });
        } else {
            this.setState({
                nextText:
                    this.screen == screenType.FROM_USER_PROFILE
                        ? localizes('registerPartner.save')
                        : localizes('registerPartner.confirm'),
                next: false,
                data: item,
            });
        }
    }
}

const mapStateToProps = state => ({
    data: state.partner.data,
    isLoading: state.partner.isLoading,
    error: state.partner.error,
    errorCode: state.partner.errorCode,
    action: state.partner.action,
});

const mapDispatchToProps = {
    ...actions,
};

export default connect(mapStateToProps, mapDispatchToProps)(RegisterPartnerView);
