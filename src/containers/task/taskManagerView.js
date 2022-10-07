import {ActionEvent, getActionSuccess} from 'actions/actionEvent';
import * as commonActions from 'actions/commonActions';
import * as taskActions from 'actions/taskActions';
import * as actions from 'actions/userActions';
import FlatListCustom from 'components/flatListCustom';
import {ErrorCode} from 'config/errorCode';
import BaseView from 'containers/base/baseView';
import ModalMonth from 'containers/common/modalMonth';
import CompanyType from 'enum/companyType';
import ic_down_grey from 'images/ic_down_grey.png';
import {localizes} from 'locales/i18n';
import {HStack} from 'native-base';
import {Image, RefreshControl, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import {connect} from 'react-redux';
import commonStyles from 'styles/commonStyles';
import DateUtil from 'utils/dateUtil';
import StorageUtil from 'utils/storageUtil';
import Utils from 'utils/utils';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';
import ItemTask from './itemTask';
import styles from './styles';

class TaskManagerView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            enableLoadMore: false,
            enableRefresh: true,
            isLoadingMore: false,
            refreshing: true,
            tasks: [],
            isAlertDelete: false,
            month: null,
            visibleMonth: false,
            showMonth: true,
            daySelect: DateUtil.convertFromFormatToFormat(
                DateUtil.now(),
                DateUtil.FORMAT_DATE_TIME_ZONE_T,
                DateUtil.FORMAT_DAY,
            ),
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
        this.days = [];
        this.company = null;
    }

    componentDidMount() {
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
                if (this.props.action == getActionSuccess(ActionEvent.GET_TASK)) {
                    if (!Utils.isNull(data)) {
                        if (data.paging.page == 0) {
                            this.state.tasks = [];
                        }
                        this.state.enableLoadMore = !(data.data.length < Constants.PAGE_SIZE);
                        if (data.data.length > 0) {
                            data.data.forEach(item => {
                                this.state.tasks.push({...item});
                            });
                        }
                        console.log('GET_TASK', this.state.tasks);
                        this.showNoData = true;
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.UPDATE_TASK)) {
                    if (!Utils.isNull(data)) {
                        this.showMessage('Cập nhật trạng thái công việc thành công');
                        this.props.getTask(this.filter);
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
            }
        }
    }

    //onHandleRequest
    handleRequest = () => {
        if (!Utils.isNull(this.company) && this.company.type === CompanyType.ADVANCED) {
            this.props.getTask(this.filter);
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
            <SafeAreaView style={styles.container}>
                <View style={{flex: 1}}>
                    <HStack hasTabs style={commonStyles.header}>
                        {this.renderHeaderView({
                            visibleBack: false,
                            title: 'Danh sách công việc',
                            titleStyle: {textAlign: 'center', color: Colors.COLOR_WHITE},
                        })}
                    </HStack>
                    <FlatListCustom
                        ref={r => {
                            this.listRef = r;
                        }}
                        ListHeaderComponent={this.renderListHeaderComponent}
                        contentContainerStyle={{
                            flexGrow: 1,
                        }}
                        style={{flex: 1}}
                        data={this.state.tasks}
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
                        textForEmpty={localizes('task.noData')}
                        styleEmpty={{marginTop: Constants.MARGIN_X_LARGE}}
                    />
                    <ModalMonth
                        isVisible={visibleMonth}
                        onBack={showMonth ? this.toggleMonth : this.toggleDay}
                        onSelectMonth={this.onSelectMonth}
                        onSelectDay={this.onSelectDay}
                        showMonth={showMonth}
                        days={this.days}
                        currentDay={DateUtil.now()}
                    />
                    {this.state.isLoadingMore || this.state.refreshing
                        ? null
                        : this.showLoadingBar(this.props.isLoading)}
                </View>
            </SafeAreaView>
        );
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

    /**
     * Render header flatList
     */
    renderListHeaderComponent = () => {
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
     * Render item
     */
    renderItem = (item, index, parentIndex, indexInParent) => {
        return (
            <ItemTask
                key={index.toString()}
                item={item}
                index={index}
                lengthData={this.state.tasks.length}
                urlPathResize={this.resourceUrlPathResize.textValue}
                urlPath={this.resourceUrlPath.textValue}
                onPress={this.onPressItem}
                onEdit={this.onEdit}
            />
        );
    };

    /**
     * On press item
     */
    onPressItem = item => {
        this.props.navigation.navigate('TaskDetail', {data: item, callback: this.handleRefresh});
    };

    /**
     * On edit
     */
    onEdit = (data, type) => {
        this.props.updateTask({taskId: data.id, taskType: type});
    };
}

const mapStateToProps = state => ({
    data: state.task.data,
    action: state.task.action,
    isLoading: state.task.isLoading,
    error: state.task.error,
    errorCode: state.task.errorCode,
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions,
    ...taskActions,
};

export default connect(mapStateToProps, mapDispatchToProps)(TaskManagerView);
