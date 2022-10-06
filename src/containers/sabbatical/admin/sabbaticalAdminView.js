import {ActionEvent, getActionSuccess} from 'actions/actionEvent';
import * as commonActions from 'actions/commonActions';
import * as sabbaticalActions from 'actions/sabbaticalActions';
import * as actions from 'actions/userActions';
import FlatListCustom from 'components/flatListCustom';
import {ErrorCode} from 'config/errorCode';
import BaseView from 'containers/base/baseView';
import ModalMonth from 'containers/common/modalMonth';
import slidingMenuType from 'enum/slidingMenuType';
import ic_cancel from 'images/ic_cancel.png';
import ic_down_grey from 'images/ic_down_grey.png';
import ic_search_black from 'images/ic_search_black.png';
import ic_search_white from 'images/ic_search_white.png';
import {localizes} from 'locales/i18n';
import {Container} from 'native-base';
import {BackHandler, Image, RefreshControl, Text, TouchableOpacity, View} from 'react-native';
import {connect} from 'react-redux';
import commonStyles from 'styles/commonStyles';
import DateUtil from 'utils/dateUtil';
import StorageUtil from 'utils/storageUtil';
import Utils from 'utils/utils';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';
import styles from '../styles';
import ItemSabbaticalAdmin from './itemSabbaticalAdmin';
import ModalSabbaticalAdmin from './modalSabbaticalAdmin';

class SabbaticalAdminView extends BaseView {
    constructor(props) {
        super(props);
        const {navigation, route} = this.props;
        this.state = {
            enableLoadMore: false,
            enableRefresh: true,
            isLoadingMore: false,
            refreshing: true,
            sabbaticals: [],
            typing: false,
            typingTimeout: 0,
            isSearch: false,
            txtSearch: null,
            isAlertDelete: false,
            visibleMonth: false,
            isApproved: false,
            isDenied: false,
            showMonth: true,
            daySelect: route.params.daySelect
                ? new Date(DateUtil.convertFromFormatToFormat(route.params.daySelect))
                : 'All',
            monthCurrentSQL: DateUtil.convertFromFormatToFormat(
                route.params.daySelect || DateUtil.now(),
                DateUtil.FORMAT_DATE_TIME_ZONE_T,
                DateUtil.FORMAT_MONTH_OF_YEAR,
            ),
        };
        this.filter = {
            companyId: null,
            branchId: null,
            deniedNote: null,
            stringSearch: null,
            month: this.state.monthCurrentSQL,
            day: route.params.daySelect
                ? DateUtil.convertFromFormatToFormat(
                      DateUtil.now(),
                      DateUtil.FORMAT_DATE_TIME_ZONE_T,
                      DateUtil.FORMAT_DAY,
                  )
                : 'All',
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0,
            },
        };
        this.user = null;
        this.showNoData = false;
        this.dataDelete = null;
        this.fromScreen = route.params.screenType;
        this.visible = !Utils.isNull(this.fromScreen) && this.fromScreen == slidingMenuType.SABBATICAL_ADMIN;
    }

    componentDidMount() {
        this.visible && BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        this.getSourceUrlPath();
        this.getUserProfile();
        this.getAllDayInMonth(this.state.monthCurrentSQL);
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
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                this.state.refreshing = false;
                this.state.isLoadingMore = false;
                if (this.props.action == getActionSuccess(ActionEvent.GET_SABBATICALS_ADMIN)) {
                    if (!Utils.isNull(data)) {
                        if (data.paging.page == 0) {
                            this.state.sabbaticals = [];
                        }
                        this.state.enableLoadMore = !(data.data.length < Constants.PAGE_SIZE);
                        if (data.data.length > 0) {
                            data.data.forEach(item => {
                                this.state.sabbaticals.push({...item});
                            });
                        }
                        console.log('GET_SABBATICALS_ADMIN', this.state.sabbaticals);
                    }
                    this.showNoData = true;
                } else if (this.props.action == getActionSuccess(ActionEvent.APPROVED_SABBATICAL)) {
                    if (!Utils.isNull(data)) {
                        if (data) {
                            this.hideModal();
                            this.props.getSabbaticalsAdmin(this.filter);
                            this.showMessage(localizes('sabbatical.approvalSabbaticalSuccess'));
                        }
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.DENIED_SABBATICAL)) {
                    if (!Utils.isNull(data)) {
                        if (data) {
                            this.hideModal();
                            this.props.getSabbaticalsAdmin(this.filter);
                            this.showMessage(localizes('sabbatical.deniedSabbaticalSuccess'));
                        }
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    /**
     * Get information user profile
     */
    getUserProfile = () => {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE)
            .then(user => {
                //this callback is executed when your Promise is resolved
                if (!Utils.isNull(user)) {
                    this.user = user;
                    this.props.getProfileAdmin(user.id);
                    StorageUtil.retrieveItem(StorageUtil.COMPANY_INFO)
                        .then(companyInfo => {
                            this.filter.companyId = companyInfo.company.id;
                            this.filter.branchId = !Utils.isNull(companyInfo.branch) ? companyInfo.branch.id : null;
                            this.handleRequest();
                        })
                        .catch(error => {
                            this.saveException(error, 'componentDidMount');
                        });
                }
            })
            .catch(error => {
                this.saveException(error, 'getUserProfile');
            });
    };

    //onHandleRequest
    handleRequest = () => {
        this.props.getSabbaticalsAdmin(this.filter);
    };

    //onRefreshing
    handleRefresh = () => {
        this.state.refreshing = true;
        this.filter.stringSearch = null;
        this.filter.paging.page = 0;
        this.handleRequest();
    };

    //onLoadMore
    onLoadMore = () => {
        if (!this.props.isLoading) {
            this.state.isLoadingMore = true;
            this.filter.paging.page += 1;
            this.handleRequest();
        }
    };

    componentWillUnmount() {
        this.visible && BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    render() {
        const {visibleMonth, showMonth, daySelect, isSearch} = this.state;
        return (
            <Container style={styles.container}>
                <View style={{flex: 1}}>
                    <HStack hasTabs style={commonStyles.header}>
                        {this.renderHeaderView({
                            visibleBack: this.visible,
                            title: isSearch ? '' : localizes('sabbatical.sabbaticalTitle'),
                            visibleSearchBar: isSearch,
                            onPressRightSearch: () => {
                                this.filter.stringSearch = null;
                                this.onToggleSearch();
                                this.handleRefresh();
                            },
                            iconRightSearch: ic_cancel,
                            placeholder: localizes('search'),
                            onRef: ref => {
                                this.txtSearch = ref;
                            },
                            iconLeftSearch: ic_search_black,
                            styleIconLeftSearch: {width: 20, height: 20},
                            autoFocus: true,
                            onSubmitEditing: this.onSubmitEditing,
                            onPressLeftSearch: () => {},
                            renderMidMenu: this.renderMidMenu,
                            titleStyle: {textAlign: 'center', color: Colors.COLOR_WHITE},
                            onChangeTextInput: this.onChangeTextInput,
                            renderRightMenu: this.renderRightMenu,
                        })}
                    </HStack>
                    <FlatListCustom
                        ref={r => {
                            this.listRef = r;
                        }}
                        ListHeaderComponent={this.renderHeaderFlatList}
                        contentContainerStyle={{
                            flexGrow: 1,
                        }}
                        style={{flex: 1}}
                        data={this.state.sabbaticals}
                        renderItem={this.renderItem}
                        enableRefresh={this.state.enableRefresh}
                        refreshControl={
                            <RefreshControl
                                progressViewOffset={Constants.HEIGHT_HEADER_OFFSET_REFRESH}
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }
                        enableLoadMore={this.state.enableLoadMore}
                        onLoadMore={this.onLoadMore}
                        showsVerticalScrollIndicator={false}
                        isShowEmpty={this.showNoData}
                        isShowImageEmpty={true}
                        textForEmpty={localizes('noData')}
                        styleEmpty={{marginTop: Constants.MARGIN_X_LARGE}}
                    />
                    {this.state.isLoadingMore || this.state.refreshing
                        ? null
                        : this.showLoadingBar(this.props.isLoading)}
                    <ModalSabbaticalAdmin
                        ref={'modalSabbaticalAdmin'}
                        isApproved={this.state.isApproved}
                        approved={this.approvedSabbatical}
                        denied={this.deniedSabbatical}
                    />
                    <ModalMonth
                        isVisible={visibleMonth}
                        onBack={showMonth ? this.toggleMonth : this.toggleDay}
                        onSelectMonth={this.onSelectMonth}
                        onSelectDay={this.onSelectDay}
                        showMonth={showMonth}
                        days={this.days}
                        currentDay={daySelect}
                    />
                </View>
            </Container>
        );
    }

    onSearch(text) {
        this.filter.stringSearch = text;
        if (!Utils.isNull(text)) {
            this.props.getSabbaticalsAdmin(this.filter);
        }
    }

    /**
     * on toggle search
     */
    onToggleSearch() {
        if (!this.state.isSearch) {
            this.setState(
                {
                    isSearch: !this.state.isSearch,
                },
                () => {
                    this.txtSearch.focus();
                },
            );
        } else {
            this.setState({
                txtSearch: null,
                isSearch: !this.state.isSearch,
            });
        }
    }

    /**
     * Manager text input search
     * @param {*} stringSearch
     */
    onChangeTextInput = stringSearch => {
        const self = this;
        if (self.state.typingTimeout) {
            clearTimeout(self.state.typingTimeout);
        }
        this.setState({
            txtSearch: stringSearch == '' ? null : stringSearch,
            typing: false,
            typingTimeout: setTimeout(() => {
                if (!Utils.isNull(stringSearch)) {
                    this.onSearch(stringSearch);
                } else {
                    this.handleRefresh();
                }
            }, 1000),
        });
    };

    /**
     * On submit editing
     */
    onSubmitEditing = () => {};

    /**
     * Open modal Week
     */
    openModal(content) {
        this.refs.modalSabbaticalAdmin.showModal(content);
    }

    /**
     * hide Modal Week
     */
    hideModal() {
        this.refs.modalSabbaticalAdmin.hideModal();
    }

    /**
     * Toggle month
     */
    toggleMonth = () => {
        this.setState({
            visibleMonth: !this.state.visibleMonth,
            showMonth: true,
        });
    };

    /**
     * Toggle day
     */
    toggleDay = () => {
        this.setState({
            visibleMonth: !this.state.visibleMonth,
            showMonth: false,
        });
    };

    /**
     * Render mid menu
     */
    renderMidMenu = () => {
        return !this.state.isSearch && <View style={{flex: 1}} />;
    };

    /**
     * Render right menu
     */
    renderRightMenu = () => {
        return (
            <View style={{}}>
                {this.state.isSearch ? (
                    <View></View>
                ) : (
                    <TouchableOpacity
                        activeOpacity={Constants.ACTIVE_OPACITY}
                        style={{padding: Constants.PADDING_LARGE}}
                        onPress={() => this.onToggleSearch()}>
                        <Image style={{resizeMode: 'contain'}} source={ic_search_white} />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    /**
     * Render header flatList
     */
    renderHeaderFlatList = () => {
        const {monthCurrentSQL, daySelect} = this.state;
        return (
            <View style={styles.date}>
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    onPress={() => this.toggleMonth()}
                    style={[commonStyles.viewHorizontal, {padding: Constants.PADDING_LARGE, alignItems: 'center'}]}>
                    <View>
                        <Text style={[commonStyles.text, {margin: 0}]}>
                            {localizes('timekeepingHistory.month') +
                                DateUtil.convertFromFormatToFormat(
                                    monthCurrentSQL,
                                    DateUtil.FORMAT_MONTH_OF_YEAR,
                                    DateUtil.FORMAT_MONTH,
                                )}
                            {', ' +
                                DateUtil.convertFromFormatToFormat(
                                    monthCurrentSQL,
                                    DateUtil.FORMAT_MONTH_OF_YEAR,
                                    DateUtil.FORMAT_YEAR,
                                )}
                        </Text>
                    </View>
                    <Image source={ic_down_grey} />
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    onPress={() => this.toggleDay()}
                    style={[
                        commonStyles.viewHorizontal,
                        {padding: Constants.PADDING_LARGE, justifyContent: 'flex-end'},
                    ]}>
                    <Text style={[commonStyles.text, {margin: 0}]}>
                        {daySelect === 'All'
                            ? daySelect
                            : DateUtil.convertFromFormatToFormat(
                                  daySelect,
                                  DateUtil.FORMAT_DATE_TIME_ZONE_T,
                                  DateUtil.FORMAT_DAY,
                              )}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    /**
     * Render item
     */
    renderItem = (item, index, parentIndex, indexInParent) => {
        return (
            <ItemSabbaticalAdmin
                key={index.toString()}
                item={item}
                index={index}
                onPress={this.onPressItem}
                onPressApproved={this.onPressApprovedItem}
                onPressDenied={this.onPressDeniedItem}
                lengthData={this.state.sabbaticals.length}
            />
        );
    };

    /**
     * On select month
     */
    onSelectMonth = month => {
        let monthOfYear = DateUtil.convertFromFormatToFormat(month._i, month._f, DateUtil.FORMAT_MONTH_OF_YEAR);
        this.setState({
            monthCurrentSQL: monthOfYear,
            daySelect: 'All',
        });
        this.showNoData = false;
        this.filter.month = monthOfYear;
        this.filter.day = 'All';
        this.getAllDayInMonth(monthOfYear);
        this.handleRequest();
    };

    /**
     * On select day
     */
    onSelectDay = day => {
        let dayOfMonth =
            day === 'All'
                ? day
                : DateUtil.convertFromFormatToFormat(day, DateUtil.FORMAT_DATE_TIME_ZONE_T, DateUtil.FORMAT_DAY);
        this.setState({
            daySelect: day === 'All' ? day : new Date(day),
        });
        this.showNoData = false;
        this.filter.day = dayOfMonth;
        this.handleRequest();
    };

    /**
     * Get all day in month
     */
    getAllDayInMonth(month) {
        this.days = [];
        var date = new Date(month);
        var monthSelect = parseInt(
            DateUtil.convertFromFormatToFormat(month, DateUtil.FORMAT_MONTH_OF_YEAR, DateUtil.FORMAT_MONTH),
        );
        while (date.getMonth() === monthSelect - 1) {
            this.days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
    }

    /**
     * On press item
     */
    onPressItem = data => {
        this.openModal(data);
    };

    /**
     * On press approved item
     */
    onPressApprovedItem = data => {
        this.setState({isApproved: true, isDenied: false});
        this.openModal(data);
    };

    /**
     * On press denied item
     */
    onPressDeniedItem = data => {
        this.setState({isApproved: false, isDenied: true});
        this.openModal(data);
    };

    /**
     * Request approved sabbatical
     */
    approvedSabbatical = data => {
        this.props.approvedSabbatical(data.id, this.user.id);
    };

    /**
     * Request denied sabbatical
     */
    deniedSabbatical = (data, deniedNote) => {
        this.filter.deniedNote = deniedNote;
        let filter = this.filter;
        this.props.deniedSabbatical({filter, sabbaticalId: data.id});
    };
}

const mapStateToProps = state => ({
    data: state.sabbatical.data,
    action: state.sabbatical.action,
    isLoading: state.sabbatical.isLoading,
    error: state.sabbatical.error,
    errorCode: state.sabbatical.errorCode,
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions,
    ...sabbaticalActions,
};

export default connect(mapStateToProps, mapDispatchToProps)(SabbaticalAdminView);
