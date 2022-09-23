import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    RefreshControl,
    BackHandler,
    Animated
} from 'react-native';
import BaseView from 'containers/base/baseView';
import * as actions from "actions/userActions";
import * as commonActions from "actions/commonActions";
import * as timekeepingActions from "actions/timekeepingActions";
import { connect } from "react-redux";
import { ErrorCode } from "config/errorCode";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { Constants } from 'values/constants';
import Utils from 'utils/utils';
import { Content, Container, Root, Header } from 'native-base';
import styles from './styles';
import commonStyles from "styles/commonStyles";
import { Colors } from 'values/colors';
import ic_search_white from "images/ic_search_white.png";
import FlatListCustom from 'components/flatListCustom';
import { localizes } from 'locales/i18n';
import DateUtil from 'utils/dateUtil';
import ModalMonth from 'containers/common/modalMonth';
import ic_down_grey from "images/ic_down_grey.png";
import ItemUserTimekeeping from './itemUserTimekeeping';
import StorageUtil from 'utils/storageUtil';
import ModalTimekeepingAdmin from './modalTimekeepingAdmin';
import ModalAddTimekeeping from './modalAddTimekeeping';
import ic_cancel from 'images/ic_cancel.png';
import ic_search_black from 'images/ic_search_black.png';
import dashboardType from "enum/dashboardType";
import DialogCustom from 'components/dialogCustom';

const NAVBAR_HEIGHT = 56;

class TimekeepingAdminView extends BaseView {
    scroll = new Animated.Value(0);
    headerY;

    constructor(props) {
        super(props);
        const { navigation } = this.props;
        this.state = {
            enableLoadMore: false,
            enableRefresh: true,
            isLoadingMore: false,
            refreshing: true,
            month: null,
            visibleMonth: false,
            showMonth: true,
            timekeepingList: [],
            daySelect: new Date(DateUtil.convertFromFormatToFormat(
                navigation.getParam("daySelect") || DateUtil.now(), DateUtil.FORMAT_DATE_TIME_ZONE_T, DateUtil.FORMAT_DATE_SQL)
            ),
            monthCurrentSQL: DateUtil.convertFromFormatToFormat(DateUtil.now(), DateUtil.FORMAT_DATE_TIME_ZONE_T, DateUtil.FORMAT_MONTH_OF_YEAR),
            typing: false,
            typingTimeout: 0,
            isSearch: false,
            txtSearch: null,
            timekkeepingIdDelete: null
        };
        this.showNoData = false;
        this.fromScreen = navigation.getParam("screenType");
        this.daySelect = navigation.getParam("daySelect");
        this.dashboardType = navigation.getParam("dashboardType") || dashboardType.CHECK_IN;
        this.filter = {
            companyId: null,
            branchId: null,
            day: DateUtil.convertFromFormatToFormat(navigation.getParam("daySelect") || DateUtil.now(), DateUtil.FORMAT_DATE_TIME_ZONE_T, DateUtil.FORMAT_DATE_SQL),
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            },
            stringSearch: null,
            dashboardType: this.dashboardType,
            minuteAfterCheckIn1: 0,
            minuteAfterCheckIn2: 0
        };
        this.filterWifi = {
            companyId: null,
            branchId: null
        };
        this.headerY = Animated.multiply(Animated.diffClamp(this.scroll, 0, NAVBAR_HEIGHT), -1);
        this.wiFiListAllows = [];
    }

    componentDidMount() {
        !Utils.isNull(this.fromScreen) && BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton)
        this.getSourceUrlPath();
        this.getMinutesAbleTimekeeping();
        this.getAllDayInMonth(this.state.monthCurrentSQL);
        StorageUtil.retrieveItem(StorageUtil.COMPANY_INFO).then((companyInfo) => {
            this.filter.companyId = companyInfo.company.id;
            this.filter.branchId = !Utils.isNull(companyInfo.branch) ? companyInfo.branch.id : null;
            this.filter.minuteAfterCheckIn1 = this.minuteAfterCheckIn1.numericValue || 0;
            this.filter.minuteAfterCheckIn2 = this.minuteAfterCheckIn2.numericValue || 0;
            this.filterWifi.companyId = companyInfo.company.id;
            this.filterWifi.branchId = !Utils.isNull(companyInfo.branch) ? companyInfo.branch.id : null;
            this.props.getWiFiConfigAdmin(this.filterWifi);
            this.handleRequest();
        }).catch((error) => {
            this.saveException(error, 'componentDidMount')
        });
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
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                this.state.isLoadingMore = false;
                if (this.props.action == getActionSuccess(ActionEvent.GET_TIMEKEEPING_LIST)) {
                    this.state.refreshing = false;
                    if (!Utils.isNull(data) && this.props.screen == this.fromScreen) {
                        if (data.paging.page == 0) {
                            this.state.timekeepingList = [];
                        }
                        this.state.enableLoadMore = !(data.data.length < Constants.PAGE_SIZE);
                        if (data.data.length > 0) {
                            data.data.forEach(item => {
                                this.state.timekeepingList.push({ ...item });
                            });
                        }
                        console.log("GET_TIMEKEEPING_LIST", this.state.timekeepingList)
                    }
                    this.showNoData = true;
                } else if (this.props.action == getActionSuccess(ActionEvent.APPROVAL_TIMEKEEPING)) {
                    if (!Utils.isNull(data)) {
                        let state = this.state;
                        state.timekeepingList.forEach((item, i) => {
                            if (item.user.id == data.userId) {
                                item.timekeepingRecord.forEach((timekeeping, index) => {
                                    if (timekeeping.id == data.id) {
                                        state.timekeepingList[i].timekeepingRecord[index] = data;
                                    }
                                });
                            }
                        });
                    }
                    this.handleRequest();
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_WI_FI_CONFIG_ADMIN)) {
                    this.wiFiListAllows = [{ id: -1, wiFiName: "Chọn wifi" }];
                    if (!Utils.isNull(data)) {
                        data.forEach(item => {
                            this.wiFiListAllows.push(item);
                        });
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.TIMEKEEPING_ADMIN)) {
                    if (!Utils.isNull(data)) {
                        let state = this.state;
                        state.timekeepingList.forEach((item, i) => {
                            if (item.user.id == data.userId) {
                                if (this.dashboardType != dashboardType.NOT_CHECK_IN) {
                                    state.timekeepingList[i].timekeepingRecord.push(data);
                                } else {
                                    state.timekeepingList.splice(i, 1);
                                }
                            }
                        });
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.TIMEKEEPING_UPDATE)) {
                    if (!Utils.isNull(data)) {
                        let state = this.state;
                        state.timekeepingList.forEach((item, i) => {
                            if (item.user.id == data.userId) {
                                item.timekeepingRecord.forEach((timekeeping, index) => {
                                    if (timekeeping.id == data.id) {
                                        state.timekeepingList[i].timekeepingRecord[index] = data;
                                    }
                                });
                            }
                        });
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.TIMEKEEPING_DELETE)) {
                    if (!Utils.isNull(data)) {
                        let state = this.state;
                        state.timekeepingList.forEach((item, i) => {
                            if (item.user.id == data.userId) {
                                item.timekeepingRecord = item.timekeepingRecord.filter((timekeeping, index) => {
                                    return timekeeping.id != data.id;
                                });
                                if (Utils.isNull(item.timekeepingRecord)) {
                                    state.timekeepingList.splice(i, 1);
                                } else {
                                    state.timekeepingList.splice(i, 0);
                                }
                            }
                        });
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    //onHandleRequest
    handleRequest = () => {
        this.props.getTimekeepingList(this.filter, this.fromScreen);
    }

    //onRefreshing
    handleRefresh = () => {
        this.state.refreshing = true;
        this.filter.paging.page = 0;
        this.handleRequest();
    }

    //onLoadMore
    onLoadMore = () => {
        if (!this.props.isLoading) {
            this.state.isLoadingMore = true;
            this.filter.paging.page += 1;
            this.handleRequest();
        }
    }

    /**
     * Manager text input search 
     * @param {*} stringSearch 
     */
    onChangeTextInput = (stringSearch) => {
        const self = this;
        if (self.state.typingTimeout) {
            clearTimeout(self.state.typingTimeout)
        }
        this.setState({
            txtSearch: stringSearch == "" ? null : stringSearch,
            typing: false,
            typingTimeout: setTimeout(() => {
                if (!Utils.isNull(stringSearch)) {
                    this.onSearch(stringSearch)
                } else {
                    this.handleRefresh()
                }
            }, 1000)
        });
    }

    onSearch(text) {
        this.filter.stringSearch = text;
        if (!Utils.isNull(text)) {
            this.handleRefresh();
        }
    }

    /**
     * on toggle search
     */
    onToggleSearch() {
        if (!this.state.isSearch) {
            this.setState({
                isSearch: !this.state.isSearch
            }, () => { this.txtSearch.focus() });
        } else {
            this.setState({
                txtSearch: null,
                isSearch: !this.state.isSearch
            })
        }
    }

    /**
     * On submit editing
     */
    onSubmitEditing = () => {

    }

    /**
     * Render mid menu
     */
    renderMidMenu = () => {
        return !this.state.isSearch && <View style={{ flex: 1 }} />
    }

    componentWillUnmount() {
        !Utils.isNull(this.fromScreen) && BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    render() {
        const { visibleMonth, showMonth, isSearch, daySelect, timekeepingList } = this.state;
        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={[commonStyles.header]}>
                        {this.renderHeaderView({
                            visibleBack: !Utils.isNull(this.fromScreen),
                            title: "CHẤM CÔNG",
                            visibleSearchBar: isSearch,
                            onPressRightSearch: () => {
                                this.filter.stringSearch = null;
                                this.onToggleSearch();
                                this.handleRefresh();
                            },
                            iconRightSearch: ic_cancel,
                            placeholder: localizes("search"),
                            onRef: ref => {
                                this.txtSearch = ref
                            },
                            iconLeftSearch: ic_search_black,
                            styleIconLeftSearch: { width: 20, height: 20 },
                            autoFocus: true,
                            onSubmitEditing: this.onSubmitEditing,
                            onPressLeftSearch: () => { },
                            renderMidMenu: this.renderMidMenu,
                            onChangeTextInput: this.onChangeTextInput,
                            titleStyle: { textAlign: 'center', color: Colors.COLOR_WHITE },
                            renderRightMenu: this.renderRightMenu
                        })}
                    </Header>
                    <FlatListCustom
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { y: this.scroll } } }],
                            { useNativeDriver: true },
                        )}
                        ref={(r) => { this.listRef = r }}
                        ListHeaderComponent={this.renderHeaderFlatList}
                        // stickyHeaderIndices={[0]}
                        contentContainerStyle={{
                            flexGrow: 1
                        }}
                        style={{ flex: 1 }}
                        data={this.state.timekeepingList}
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
                        textForEmpty={localizes("noData")}
                        styleEmpty={{ marginTop: Constants.MARGIN_X_LARGE }}
                    />
                    <ModalMonth
                        isVisible={visibleMonth}
                        onBack={showMonth ? this.toggleMonth : this.toggleDay}
                        onSelectMonth={this.onSelectMonth}
                        onSelectDay={this.onSelectDay}
                        showMonth={showMonth}
                        days={this.days}
                        currentDay={daySelect}
                        showSelectAll={false}
                    />
                    <ModalTimekeepingAdmin
                        ref={'modalTimekeepingAdmin'}
                        approvalTimekeeping={this.approvalTimekeeping}
                    />
                    <ModalAddTimekeeping
                        ref={"modalAddTimekeeping"}
                        addTimekeeping={this.addTimekeeping}
                        updateTimekeeping={this.updateTimekeeping}
                        wiFiListAllows={this.wiFiListAllows}
                    />
                    {this.renderAlertDelete()}
                    {this.state.isLoadingMore || this.state.refreshing ? null : this.showLoadingBar(this.props.isLoading)}
                </Root>
            </Container>
        );
    }

    /**
     * Approval timekeeping
     */
    approvalTimekeeping = (filter) => {
        this.props.approvalTimekeeping(filter);
        this.refs.modalTimekeepingAdmin.hideModal();
    }

    /**
     * Add timekeeping
     */
    addTimekeeping = (filter) => {
        this.props.timekeepingAdmin({
            ...filter,
            day: DateUtil.convertFromFormatToFormat(this.filter.day + " " + filter.checkinTime, DateUtil.FORMAT_DATE_TIME_SQL, DateUtil.FORMAT_DATE_TIME_ZONE)
        });
        this.refs.modalAddTimekeeping.hideModal();
    }

    /**
     * Update timekeeping
     */
    updateTimekeeping = (filter) => {
        this.props.timekeepingUpdate(filter);
        this.refs.modalAddTimekeeping.hideModal();
    }

    /**
     * Render right menu
     */
    renderRightMenu = () => {
        const { isSearch } = this.state;
        return (
            !isSearch
            && <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                style={{
                    justifyContent: "center",
                    padding: Constants.PADDING_LARGE
                }}
                onPress={() => this.onToggleSearch()}
            >
                <Image source={ic_search_white} />
            </TouchableOpacity>
        )
    }

    /**
     * Toggle month
     */
    toggleMonth = () => {
        this.setState({
            visibleMonth: !this.state.visibleMonth,
            showMonth: true
        });
    };

    /**
     * Toggle day
     */
    toggleDay = () => {
        this.setState({
            visibleMonth: !this.state.visibleMonth,
            showMonth: false
        });
    };

    /**
     * Get all day in month
     */
    getAllDayInMonth(month) {
        this.days = [];
        var date = new Date(month);
        var monthSelect = parseInt(DateUtil.convertFromFormatToFormat(month, DateUtil.FORMAT_MONTH_OF_YEAR, DateUtil.FORMAT_MONTH));
        while (date.getMonth() === (monthSelect - 1)) {
            this.days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
    }

    /**
     * Render header flatList
     */
    renderHeaderFlatList = () => {
        const { monthCurrentSQL, daySelect } = this.state;
        return (
            <Animated.View style={[styles.date, {
                // transform: [{ translateY: this.headerY }]
            }]}>
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    onPress={() => this.toggleMonth()}
                    style={[commonStyles.viewHorizontal, { padding: Constants.PADDING_LARGE, alignItems: 'center' }]}
                >
                    <View>
                        <Text style={[commonStyles.text, { margin: 0 }]}>
                            {localizes("timekeepingHistory.month") + DateUtil.convertFromFormatToFormat(monthCurrentSQL, DateUtil.FORMAT_MONTH_OF_YEAR, DateUtil.FORMAT_MONTH)}
                            {", " + DateUtil.convertFromFormatToFormat(monthCurrentSQL, DateUtil.FORMAT_MONTH_OF_YEAR, DateUtil.FORMAT_YEAR)}
                        </Text>
                    </View>
                    <Image source={ic_down_grey} />
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    onPress={() => this.toggleDay()}
                    style={[commonStyles.viewHorizontal, { padding: Constants.PADDING_LARGE, justifyContent: 'flex-end', }]}
                >
                    <Text style={[commonStyles.text, { margin: 0 }]}>
                        {DateUtil.convertFromFormatToFormat(daySelect, DateUtil.FORMAT_DATE_TIME_ZONE_T, DateUtil.FORMAT_DAY)}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        )
    }

    /**
     * On select month
     */
    onSelectMonth = (month) => {
        let monthOfYear = DateUtil.convertFromFormatToFormat(month._i, month._f, DateUtil.FORMAT_MONTH_OF_YEAR);
        this.setState({
            monthCurrentSQL: monthOfYear,
            daySelect: new Date(month)
        });
        this.showNoData = false;
        this.filter.month = monthOfYear;
        this.filter.day = DateUtil.convertFromFormatToFormat(new Date(month), DateUtil.FORMAT_DATE_TIME_ZONE_T, DateUtil.FORMAT_DATE_SQL);
        this.getAllDayInMonth(monthOfYear);
        this.handleRequest()
    }

    /**
     * On select day
     */
    onSelectDay = (day) => {
        let dayOfMonth = DateUtil.convertFromFormatToFormat(day, DateUtil.FORMAT_DATE_TIME_ZONE_T, DateUtil.FORMAT_DAY);
        this.setState({
            daySelect: new Date(day)
        });
        this.showNoData = false;
        this.filter.day = this.state.monthCurrentSQL + "-" + dayOfMonth;
        this.handleRequest();
    }

    /**
     * Render item
     */
    renderItem = (item, index, parentIndex, indexInParent) => {
        return (
            <ItemUserTimekeeping
                key={index.toString()}
                item={item}
                index={index}
                lengthData={this.state.timekeepingList.length}
                onPress={this.onPressItem}
                onPressAprovalAction={this.onPressAprovalAction}
                onPressAddAction={this.onPressAddAction}
                onPressDeleteAction={this.onPressDeleteAction}
                dashboardType={this.dashboardType}
            />
        )
    }

    /**
     * On press item
     */
    onPressItem = (data) => {
        this.props.navigation.navigate("TimekeepingHistory", {
            userId: data.user.id
        })
    }

    /**
     * On press aproval action
     */
    onPressAprovalAction = (approvalStatus, timekeeping, user, typeCheck) => {
        this.refs.modalTimekeepingAdmin.showModal(approvalStatus, timekeeping, user, typeCheck);
    }


    /**
     * On press add action
     */
    onPressAddAction = (data, user, workingTimeConfig) => {
        let state = this.state;
        let timekeepingRecord = [];
        if (this.dashboardType != dashboardType.NOT_CHECK_IN) {
            state.timekeepingList.forEach((item, i) => {
                if (item.user.id == user.id) {
                    if (Utils.isNull(data)) {
                        timekeepingRecord = item.timekeepingRecord;
                    } else {
                        timekeepingRecord = item.timekeepingRecord.filter(item => { return item.id !== data.id });
                    }
                }
            });
        }
        this.refs.modalAddTimekeeping.showModal(data, user, workingTimeConfig, timekeepingRecord);
    }


    /**
     * On press delete action
     */
    onPressDeleteAction = (timekkeepingIdDelete) => {
        this.setState({ timekkeepingIdDelete })
    }

    /**
     * Render alert delete
     */
    renderAlertDelete() {
        const { timekkeepingIdDelete } = this.state;
        return (
            <DialogCustom
                visible={!Utils.isNull(timekkeepingIdDelete)}
                isVisibleTitle={true}
                isVisibleContentText={true}
                isVisibleTwoButton={true}
                contentTitle={localizes("notification")}
                textBtnOne={localizes("cancel")}
                textBtnTwo={localizes("delete")}
                contentText={"Bạn có muốn xóa chấm công này?"}
                onPressX={() => {
                    this.setState({ timekkeepingIdDelete: null });
                }}
                onPressBtnOne={() => {
                    this.setState({ timekkeepingIdDelete: null });
                }}
                onPressBtnPositive={() => {
                    this.props.timekeepingDelete(timekkeepingIdDelete);
                    this.setState({ timekkeepingIdDelete: null });
                }}
            />
        );
    }
}

const mapStateToProps = state => ({
    data: state.timekeeping.data,
    action: state.timekeeping.action,
    isLoading: state.timekeeping.isLoading,
    error: state.timekeeping.error,
    errorCode: state.timekeeping.errorCode,
    screen: state.timekeeping.screen
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions,
    ...timekeepingActions
};

export default connect(mapStateToProps, mapDispatchToProps)(TimekeepingAdminView);