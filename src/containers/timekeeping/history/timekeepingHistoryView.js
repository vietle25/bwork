import {ActionEvent, getActionSuccess} from 'actions/actionEvent';
import * as commonActions from 'actions/commonActions';
import * as timekeepingActions from 'actions/timekeepingActions';
import * as actions from 'actions/userActions';
import FlatListCustom from 'components/flatListCustom';
import {ErrorCode} from 'config/errorCode';
import BaseView from 'containers/base/baseView';
import ModalMonth from 'containers/common/modalMonth';
import ic_down_grey from 'images/ic_down_grey.png';
import {localizes} from 'locales/i18n';
import {HStack} from 'native-base';
import {BackHandler, Image, RefreshControl, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import {connect} from 'react-redux';
import commonStyles from 'styles/commonStyles';
import DateUtil from 'utils/dateUtil';
import StorageUtil from 'utils/storageUtil';
import Utils from 'utils/utils';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';
import ItemTimekeepingHistory from './itemTimekeepingHistory';
import styles from './styles';

class TimekeepingHistoryView extends BaseView {
    constructor(props) {
        super(props);
        const {route} = this.props;
        this.state = {
            enableRefresh: true,
            refreshing: true,
            month: null,
            visibleMonth: false,
            showMonth: true,
            daySelect: 'All',
            monthCurrentSQL: DateUtil.convertFromFormatToFormat(
                DateUtil.now(),
                DateUtil.FORMAT_DATE_TIME_ZONE_T,
                DateUtil.FORMAT_MONTH_OF_YEAR,
            ),
        };
        this.userInfo = null;
        this.userId = global.userId || null;
        this.filter = {
            userId: this.userId,
            month: this.state.monthCurrentSQL,
            day: this.state.daySelect,
        };
        this.histories = [];
        this.dataHistories = [];
        this.showNoData = false;
        this.days = [];
        this.handleRefresh = this.handleRefresh.bind(this);
    }

    /**
     * Get information user profile
     */
    getUserProfile = () => {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE)
            .then(user => {
                //this callback is executed when your Promise is resolved
                if (!Utils.isNull(user)) {
                    this.userInfo = user;
                    this.props.getUserProfile(user.id);
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
                if (this.props.action == getActionSuccess(ActionEvent.GET_TIMEKEEPING_HISTORY)) {
                    if (!Utils.isNull(data)) {
                        this.dataHistories = data;
                    } else {
                        this.dataHistories = [];
                    }
                    this.showNoData = true;
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    componentDidMount() {
        !Utils.isNull(this.userId) && BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        this.getMinutesAbleTimekeeping();
        this.getUserProfile();
        this.getAllDayInMonth(this.state.monthCurrentSQL);
        this.handleRequest();
    }

    componentWillUnmount() {
        !Utils.isNull(this.userId) && BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
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

    render() {
        const {visibleMonth, showMonth, daySelect} = this.state;
        return (
            <SafeAreaView style={styles.container}>
                <View style={{flex: 1}}>
                    <HStack style={[commonStyles.header]}>
                        {this.renderHeaderView({
                            visibleBack: !Utils.isNull(this.userId),
                            title: localizes('timekeeping.titleHistory'),
                            titleStyle: {color: Colors.COLOR_WHITE},
                        })}
                    </HStack>
                    <FlatListCustom
                        ListHeaderComponent={this.renderHeaderFlatList}
                        contentContainerStyle={{paddingBottom: Constants.PADDING_LARGE}}
                        horizontal={false}
                        data={this.dataHistories}
                        itemPerCol={1}
                        renderItem={this.renderItem.bind(this)}
                        showsVerticalScrollIndicator={false}
                        enableRefresh={this.state.enableRefresh}
                        refreshControl={
                            <RefreshControl
                                progressViewOffset={Constants.HEIGHT_HEADER_OFFSET_REFRESH}
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }
                        isShowEmpty={this.showNoData}
                        isShowImageEmpty={true}
                        textForEmpty={
                            daySelect == 'All'
                                ? localizes('timekeepingHistory.emptyTimekeepingHistory')
                                : localizes('timekeepingHistory.emptyTimekeepingHistoryDay')
                        }
                        styleEmpty={{
                            marginTop: Constants.MARGIN_LARGE,
                        }}
                    />
                    <ModalMonth
                        isVisible={visibleMonth}
                        onBack={showMonth ? this.toggleMonth : this.toggleDay}
                        onSelectMonth={this.onSelectMonth}
                        onSelectDay={this.onSelectDay}
                        showMonth={showMonth}
                        days={this.days}
                    />
                    {this.state.refreshing ? null : this.showLoadingBar(this.props.isLoading)}
                </View>
            </SafeAreaView>
        );
    }

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
                    <Text style={[commonStyles.text, {margin: 0}]}>{daySelect}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    /**
     * @param {*} item
     * @param {*} index
     * @param {*} indexInData
     * @param {*} parentIndex
     */
    renderItem(item, indexInData, parentIndex, index) {
        return (
            <ItemTimekeepingHistory
                data={this.dataHistories}
                item={item}
                index={index}
                onPressItem={() => this.onPressItem(item)}
            />
        );
    }

    /**
     * On press item
     */
    onPressItem = item => {
        this.props.navigation.navigate('TimekeepingHistoryDetail', {
            userId: this.userId,
            createdAt: item.createdAt,
        });
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
            daySelect: dayOfMonth,
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

    //onRefreshing
    handleRefresh() {
        this.state.refreshing = true;
        if (!Utils.isNull(this.userInfo)) {
            this.props.getUserProfile(this.userInfo.id);
        }
        this.handleRequest();
    }

    /**
     * Handle request
     */
    handleRequest() {
        this.props.getTimekeepingHistory(this.filter);
    }
}

const mapStateToProps = state => ({
    data: state.timekeepingHistory.data,
    isLoading: state.timekeepingHistory.isLoading,
    error: state.timekeepingHistory.error,
    errorCode: state.timekeepingHistory.errorCode,
    action: state.timekeepingHistory.action,
});

const mapDispatchToProps = {
    ...actions,
    ...timekeepingActions,
    ...commonActions,
};

export default connect(mapStateToProps, mapDispatchToProps)(TimekeepingHistoryView);
