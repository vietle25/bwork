import {ActionEvent, getActionSuccess} from 'actions/actionEvent';
import * as commonActions from 'actions/commonActions';
import * as sabbaticalActions from 'actions/sabbaticalActions';
import * as actions from 'actions/userActions';
import DialogCustom from 'components/dialogCustom';
import FlatListCustom from 'components/flatListCustom';
import {ErrorCode} from 'config/errorCode';
import BaseView from 'containers/base/baseView';
import ModalMonth from 'containers/common/modalMonth';
import CompanyType from 'enum/companyType';
import ic_down_grey from 'images/ic_down_grey.png';
import ic_lib_add_white from 'images/ic_lib_add_white.png';
import {localizes} from 'locales/i18n';
import {HStack} from 'native-base';
import {Image, RefreshControl, Text, TouchableOpacity, View} from 'react-native';
import {connect} from 'react-redux';
import commonStyles from 'styles/commonStyles';
import DateUtil from 'utils/dateUtil';
import StorageUtil from 'utils/storageUtil';
import Utils from 'utils/utils';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';
import ItemSabbatical from './itemSabbatical';
import ModalReason from './modalReason';
import styles from './styles';

class SabbaticalView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            enableLoadMore: false,
            enableRefresh: true,
            isLoadingMore: false,
            refreshing: true,
            sabbaticals: [],
            isAlertDelete: false,
            visibleMonth: false,
            showMonth: true,
            daySelect: 'All',
            monthCurrentSQL: DateUtil.convertFromFormatToFormat(
                DateUtil.now(),
                DateUtil.FORMAT_DATE_TIME_ZONE_T,
                DateUtil.FORMAT_MONTH_OF_YEAR,
            ),
        };
        this.filter = {
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0,
            },
            month: this.state.monthCurrentSQL,
            day: this.state.daySelect,
        };
        this.showNoData = false;
        this.dataDelete = null;
        this.company = null;
        this.days = [];
    }

    componentDidMount() {
        this.getSourceUrlPath();
        this.getUserProfile();
        this.getAllDayInMonth(this.state.monthCurrentSQL);
    }

    /**
     * Get information user profile
     */
    getUserProfile = () => {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE)
            .then(user => {
                //this callback is executed when your Promise is resolved
                if (!Utils.isNull(user)) {
                    this.company = user.company;
                    this.props.getUserProfile(user.id);
                    this.handleRequest();
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
                this.state.refreshing = false;
                this.state.isLoadingMore = false;
                if (this.props.action == getActionSuccess(ActionEvent.GET_SABBATICALS)) {
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
                        console.log('GET_SABBATICALS', this.state.sabbaticals);
                    }
                    this.showNoData = true;
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    //onHandleRequest
    handleRequest = () => {
        if (!Utils.isNull(this.company) && this.company.type === CompanyType.ADVANCED) {
            this.props.getSabbaticals(this.filter);
        } else {
            this.showNoData = true;
            this.setState({refreshing: false});
        }
    };

    //onRefreshing
    handleRefresh = () => {
        this.state.refreshing = true;
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

    render() {
        const {visibleMonth, showMonth, daySelect} = this.state;
        return (
            <View style={styles.container}>
                <View style={{flex: 1}}>
                    <HStack hasTabs style={commonStyles.header}>
                        {this.renderHeaderView({
                            visibleBack: false,
                            title: 'XIN PHÉP',
                            titleStyle: {textAlign: 'center', color: Colors.COLOR_WHITE},
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
                    {this.renderAlertDelete()}
                    {this.state.isLoadingMore || this.state.refreshing
                        ? null
                        : this.showLoadingBar(this.props.isLoading)}
                    <ModalReason ref={'modalReason'} />
                    <ModalMonth
                        isVisible={visibleMonth}
                        onBack={showMonth ? this.toggleMonth : this.toggleDay}
                        onSelectMonth={this.onSelectMonth}
                        onSelectDay={this.onSelectDay}
                        showMonth={showMonth}
                        days={this.days}
                    />
                </View>
            </View>
        );
    }

    /**
     * Open modal Week
     */
    openModal(data) {
        this.refs.modalReason.showModal(data);
    }

    /**
     * Render right menu
     */
    renderRightMenu = () => {
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                style={{
                    justifyContent: 'center',
                    padding: Constants.PADDING_LARGE,
                }}
                onPress={() => {
                    if (this.company.type === CompanyType.ADVANCED) {
                        this.props.navigation.navigate('RegisterSabbatical', {
                            callback: sabbatical => {
                                let state = this.state;
                                state.sabbaticals.unshift(sabbatical);
                                this.setState(state);
                            },
                        });
                    } else {
                        this.showMessage('Hiện tại công ty của bạn không thể sử dụng tính năng này.');
                    }
                }}>
                <Image source={ic_lib_add_white} />
            </TouchableOpacity>
        );
    };

    /**
     * Render header flatList
     */
    renderHeaderFlatList = () => {
        const {monthCurrentSQL, daySelect} = this.state;
        return (
            <View style={[styles.date, {paddingHorizontal: Constants.PADDING_X_LARGE}]}>
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
     * Render item
     */
    renderItem = (item, index, parentIndex, indexInParent) => {
        return (
            <ItemSabbatical
                key={index.toString()}
                item={item}
                index={index}
                lengthData={this.state.sabbaticals.length}
                urlPathResize={this.resourceUrlPathResize.textValue}
                urlPath={this.resourceUrlPath.textValue}
                onPress={this.onPressItem}
                onEdit={this.onEdit}
                onDelete={this.onDelete}
            />
        );
    };

    /**
     * On press item
     */
    onPressItem = data => {
        this.openModal(data);
    };

    /**
     * On edit
     */
    onEdit = data => {
        this.props.navigation.navigate('RegisterSabbatical', {
            data: data,
            callback: sabbatical => {
                let state = this.state;
                let index = state.sabbaticals.findIndex(item => {
                    return sabbatical.id === item.id;
                });
                state.sabbaticals.splice(index, 1, sabbatical);
                this.setState(state);
            },
        });
    };

    /**
     * On delete
     */
    onDelete = data => {
        this.dataDelete = data;
        this.setState({isAlertDelete: true});
    };

    /**
     * Render alert delete
     */
    renderAlertDelete() {
        return (
            <DialogCustom
                visible={this.state.isAlertDelete}
                isVisibleTitle={true}
                isVisibleContentText={true}
                isVisibleTwoButton={true}
                contentTitle={localizes('notification')}
                textBtnOne={localizes('no')}
                textBtnTwo={localizes('yes')}
                contentText={'Bạn chắc chắn muốn xóa xin phép?'}
                onTouchOutside={() => {
                    this.setState({isAlertDelete: false});
                }}
                onPressX={() => {
                    this.setState({isAlertDelete: false});
                }}
                onPressBtnPositive={() => {
                    let state = this.state;
                    state.sabbaticals = state.sabbaticals.filter(item => {
                        return this.dataDelete.id != item.id;
                    });
                    state.isAlertDelete = false;
                    this.setState(state);
                    this.props.deleteSabbatical(this.dataDelete.id);
                }}
            />
        );
    }

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

export default connect(mapStateToProps, mapDispatchToProps)(SabbaticalView);
