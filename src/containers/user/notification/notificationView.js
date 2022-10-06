import {ActionEvent, getActionSuccess} from 'actions/actionEvent';
import * as commonActions from 'actions/commonActions';
import * as actions from 'actions/userActions';
import FlatListCustom from 'components/flatListCustom';
import {ErrorCode} from 'config/errorCode';
import BaseView from 'containers/base/baseView';
import notificationType from 'enum/notificationType';
import ic_close from 'images/ic_close.png';
import ic_playlist_add_check_grey from 'images/ic_playlist_add_check_grey.png';
import ic_search_white from 'images/ic_search_white.png';
import {localizes} from 'locales/i18n';
import {Box, HStack} from 'native-base';
import {BackHandler, Image, Keyboard, RefreshControl, TextInput, TouchableOpacity, View} from 'react-native';
import I18n from 'react-native-i18n';
import {connect} from 'react-redux';
import commonStyles from 'styles/commonStyles';
import StorageUtil from 'utils/storageUtil';
import Utils from 'utils/utils';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';
import {Fonts} from 'values/fonts';
import ItemNotification from './itemNotification';
import ModalContent from './modalContent';
import styles from './styles';

class NotificationView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            userId: null,
            refreshing: true,
            enableRefresh: true,
            enableLoadMore: false,
            isLoadingMore: false,
            content: null,
            title: null,
            stringSearch: null,
            typing: false,
            typingTimeout: 0,
            txtNotNotify: localizes('notificationView.notData'),
        };
        this.typeIsSeen = {
            ONE_ITEM: 1,
            ALL_ITEM: 0,
        };
        this.filter = {
            userId: null,
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0,
            },
        };
        this.listNotifications = [];
        this.itemWatching = null;
        this.showNoData = false;
        this.onChangeTextInput = this.onChangeTextInput.bind(this);
    }

    /**
     * Open modal Week
     */
    openModal(content, title, type) {
        this.refs.modalContent.showModal(content, title, type);
    }

    /**
     * Get information user profile
     */
    getUserProfile = () => {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE)
            .then(user => {
                //this callback is executed when your Promise is resolved
                if (!Utils.isNull(user)) {
                    this.setState({
                        userId: user.id,
                    });
                    this.filter = {
                        userId: user.id,
                        paging: {
                            pageSize: Constants.PAGE_SIZE,
                            page: 0,
                        },
                    };
                    this.props.getUserProfile(user.id);
                    this.requestNotification();
                }
            })
            .catch(error => {
                this.saveException(error, 'getUserProfile');
            });
    };

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
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                this.state.isLoadingMore = false;
                if (this.props.action == getActionSuccess(ActionEvent.GET_NOTIFICATIONS)) {
                    console.log('GET NOTIFICATION DATA: ', data);
                    if (!Utils.isNull(data)) {
                        if (data.paging.page == 0) {
                            this.listNotifications = [];
                        }
                        if (data.data.length > 0) {
                            this.state.enableLoadMore = !(data.data.length < Constants.PAGE_SIZE);
                            data.data.forEach(item => {
                                this.listNotifications.push({...item});
                            });
                        }
                    }
                    this.showNoData = true;
                } else if (this.props.action == getActionSuccess(ActionEvent.COUNT_NEW_NOTIFICATION)) {
                    this.state.refreshing = false;
                    // firebase.notifications().setBadge(data);
                    global.badgeCount = data;
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_NOTIFICATIONS_VIEW)) {
                    let index2 = -1;
                    for (let index = 0, size = this.listNotifications.length; index < size; index++) {
                        const element = this.listNotifications[index];
                        if (element.id == this.itemWatching.id) {
                            index2 = index;
                            this.itemWatching.seen = true;
                            break;
                        }
                    }
                    this.listNotifications.splice(index2, 1, this.itemWatching);
                    this.countNewNotification();
                } else if (this.props.action == getActionSuccess(ActionEvent.READ_ALL_NOTIFICATION)) {
                    if (data) {
                        for (let index = 0, size = this.listNotifications.length; index < size; index++) {
                            const element = this.listNotifications[index];
                            element.seen = true;
                        }
                        this.countNewNotification();
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    componentDidMount() {
        super.componentDidMount();
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        this.languageDevice = I18n.locale;
        this.getUserProfile();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    //onRefreshing
    handleRefresh = () => {
        this.state.refreshing = true;
        this.state.enableLoadMore = false;
        this.filter.paging.page = 0;
        this.props.getUserProfile(this.state.userId);
        this.requestNotification();
    };

    /**
     * get notification and update count
     */
    requestNotification() {
        let timeout = 1000;
        this.props.getNotificationsRequest(this.filter);
        let timeOutRequestOne = setTimeout(() => {
            this.countNewNotification();
            clearTimeout(timeOutRequestOne);
        }, timeout);
    }

    /**
     * Get more notification
     */
    getMoreNotifications = () => {
        if (!this.props.isLoading) {
            this.state.isLoadingMore = true;
            this.filter.paging.page += 1;
            this.props.getNotificationsRequest(this.filter);
        }
    };

    /**
     * Update number notification seen
     * @param {*} type
     * @param {*} itemNotificationId  // id of item notification when on click item notification
     */
    updateNumberIsSeen(type, itemNotificationId) {
        if (!Utils.isNull(this.state.userId)) {
            this.filterNotificationIsSeen = {
                notificationIds: [],
            };
            if (type == this.typeIsSeen.ALL_ITEM) {
                if (this.listNotifications.length > 0) {
                    this.props.readAllNotification();
                }
            } else if (type == this.typeIsSeen.ONE_ITEM) {
                this.filterNotificationIsSeen.notificationIds.push(itemNotificationId);
                this.props.postNotificationsView(this.filterNotificationIsSeen);
            }
        }
    }

    /**
     * on toggle search
     */
    onToggleSearch() {
        if (!Utils.isNull(this.state.stringSearch)) {
            this.setState({
                stringSearch: '',
            });
        }
        this.setState({
            isSearch: !this.state.isSearch,
        });
    }

    /**
     * Manager text input search
     * @param {*} stringSearch
     */
    onChangeTextInput(stringSearch) {
        const self = this;
        if (self.state.typingTimeout) {
            clearTimeout(self.state.typingTimeout);
        }
        self.setState({
            stringSearch: stringSearch,
            typing: false,
            typingTimeout: setTimeout(() => {
                this.onSearch(stringSearch);
            }, 1000),
        });
    }

    /**
     * search notification
     */
    onSearch(text) {
        if (!Utils.isNull(this.state.userId)) {
            this.filterSearch = {
                stringSearch: text,
                userId: this.state.userId,
            };
            if (!Utils.isNull(text)) {
                this.props.searchNotification(this.filterSearch);
            } else {
                this.handleRefresh();
            }
        }
    }

    /**Render view */
    render() {
        var {data} = this.props;
        return (
            <Box style={styles.container}>
                <View style={{flex: 1}}>
                    {/* <View style={{ backgroundColor: Colors.COLOR_PRIMARY }}>
                        {this.renderSearchBar()}
                    </View> */}
                    <HStack style={[commonStyles.header]}>
                        {this.renderHeaderView({
                            visibleBack: true,
                            title: localizes('notificationView.title'),
                            titleStyle: {color: Colors.COLOR_WHITE},
                        })}
                    </HStack>
                    <FlatListCustom
                        contentContainerStyle={{}}
                        keyExtractor={item => item.code}
                        data={this.listNotifications}
                        renderItem={this.renderItemNotification}
                        enableRefresh={this.state.enableRefresh}
                        refreshControl={
                            <RefreshControl
                                progressViewOffset={Constants.HEIGHT_HEADER_OFFSET_REFRESH}
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }
                        enableLoadMore={this.state.enableLoadMore}
                        onLoadMore={() => {
                            this.getMoreNotifications();
                        }}
                        showsVerticalScrollIndicator={false}
                        isShowEmpty={this.showNoData}
                        isShowImageEmpty={true}
                        textForEmpty={localizes('notificationView.notNotification')}
                        styleEmpty={{
                            marginTop: Constants.MARGIN_X_LARGE,
                        }}
                    />
                    <ModalContent ref={'modalContent'} />
                    {this.state.isLoadingMore || this.state.refreshing
                        ? null
                        : this.showLoadingBar(this.props.isLoading)}
                </View>
            </Box>
        );
    }

    /**
     * Render search bar
     */
    renderSearchBar = () => {
        const {stringSearch} = this.state;
        return (
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: Constants.PADDING_LARGE,
                    height: Constants.HEADER_HEIGHT,
                }}>
                <TouchableOpacity
                    style={{
                        paddingLeft: Constants.PADDING_LARGE,
                        paddingVertical: Constants.PADDING_X_LARGE,
                    }}
                    onPress={() => {
                        this.onToggleSearch();
                        this.handleRefresh();
                    }}>
                    <Image source={!Utils.isNull(stringSearch) ? ic_close : ic_search_white} />
                </TouchableOpacity>
                <View
                    style={[
                        commonStyles.viewHorizontal,
                        commonStyles.viewCenter,
                        {
                            paddingHorizontal: Constants.PADDING_LARGE,
                        },
                    ]}>
                    <TextInput
                        style={[
                            commonStyles.text,
                            {
                                color: Colors.COLOR_WHITE,
                                margin: 0,
                                borderRadius: 0,
                                flex: 1,
                                fontSize: Fonts.FONT_SIZE_XX_SMALL,
                            },
                        ]}
                        placeholder={localizes('search')}
                        placeholderTextColor={Colors.COLOR_WHITE}
                        ref={r => (this.stringSearch = r)}
                        value={stringSearch}
                        onChangeText={this.onChangeTextInput}
                        onSubmitEditing={() => {
                            Keyboard.dismiss();
                            this.onSearch(stringSearch);
                        }}
                        keyboardType="default"
                        underlineColorAndroid="transparent"
                        returnKeyType={'search'}
                        blurOnSubmit={false}
                        autoCorrect={false}
                    />
                </View>
                <TouchableOpacity
                    style={{
                        paddingRight: Constants.PADDING_LARGE,
                        paddingVertical: Constants.PADDING_X_LARGE,
                    }}
                    onPress={() => {
                        this.updateNumberIsSeen(this.typeIsSeen.ALL_ITEM);
                    }}>
                    <Image source={ic_playlist_add_check_grey} />
                </TouchableOpacity>
            </View>
        );
    };

    /**
     * Render item row
     */
    renderItemNotification = (item, index, parentIndex, indexInParent) => {
        return (
            <ItemNotification
                data={this.listNotifications}
                item={item}
                index={index}
                parentIndex={parentIndex}
                indexInParent={indexInParent}
                onPressItem={() => this.onPressedItem(item, index)}
            />
        );
    };

    /**
     * set title and content for model item
     * @param {*} title
     * @param {*} content
     */
    onPressedItem(item, index) {
        this.itemWatching = item;
        let data = JSON.parse(item.meta);
        switch (item.type) {
            case notificationType.TASK_NOTIFICATION:
                let params = {
                    taskId: data.taskId,
                    callback: null,
                };
                !Utils.isNull(params.taskId) && this.props.navigation.navigate('TaskDetail', params);
                break;
            default:
                this.openModal(item.content, item.title, item.type);
                break;
        }
        if (!item.seen) {
            this.updateNumberIsSeen(this.typeIsSeen.ONE_ITEM, item.id);
        }
    }
}

const mapStateToProps = state => ({
    data: state.notifications.data,
    isLoading: state.notifications.isLoading,
    errorCode: state.notifications.errorCode,
    action: state.notifications.action,
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions,
};

export default connect(mapStateToProps, mapDispatchToProps)(NotificationView);
