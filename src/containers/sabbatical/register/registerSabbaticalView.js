import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    BackHandler,
    RefreshControl,
    Dimensions
} from 'react-native';
import {
    Content,
    Container,
    Root,
    Header
} from 'native-base';
import BaseView from 'containers/base/baseView';
import * as actions from "actions/userActions";
import * as commonActions from "actions/commonActions";
import * as sabbaticalActions from "actions/sabbaticalActions";
import * as timekeepingActions from "actions/timekeepingActions";
import { connect } from "react-redux";
import { ErrorCode } from "config/errorCode";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { Constants } from 'values/constants';
import Utils from 'utils/utils';
import styles from './styles';
import commonStyles from "styles/commonStyles";
import { Colors } from 'values/colors';
import { localizes } from 'locales/i18n';
import ic_add_black from "images/ic_add_black.png";
import ic_send_white from "images/ic_send_white.png";
import TextInputCustom from 'components/textInputCustom';
import ic_calendar_grey from "images/ic_calendar_grey.png";
import Hr from 'components/hr';
import { TextInputMask } from 'react-native-masked-text';
import { CalendarScreen } from 'components/calendarScreen';
import DateUtil from 'utils/dateUtil';
import workingTimeShiftType from 'enum/workingTimeShiftType';
import ic_down_grey from 'images/ic_down_grey.png';
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger
} from "react-native-popup-menu";
import StringUtil from 'utils/stringUtil';
import sabbaticalOffType from 'enum/sabbaticalOffType';

const screen = Dimensions.get("window");

class RegisterSabbaticalView extends BaseView {
    constructor(props) {
        super(props);
        const { navigation } = this.props;
        this.state = {
            enableRefresh: true,
            refreshing: true,
            reason: "",
            offFromDate: null,
            offToDate: null,
            workingTime: {
                id: null,
                name: null
            },
            dateFocused: null
        };
        this.data = navigation.getParam("data");
        this.callback = navigation.getParam("callback");
        this.dateFocus = {
            FROM: 1,
            TO: 2
        };
        this.workingTimes = [];
        this.workingTimeConfig = null;
        this.toDayTimeStamp = 0;
        this.offFromDateTimeStamp = 0;
        this.offToDateTimeStamp = 0;
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        if (!Utils.isNull(this.data)) {
            let state = this.state;
            state.reason = this.data.offReason;
            state.offFromDate = DateUtil.convertFromFormatToFormat(this.data.offFromDate, DateUtil.FORMAT_DATE_SQL, DateUtil.FORMAT_DATE);
            state.offToDate = DateUtil.convertFromFormatToFormat(this.data.offToDate, DateUtil.FORMAT_DATE_SQL, DateUtil.FORMAT_DATE);
            state.workingTime.id = this.data.offType;
            if (this.data.offType == sabbaticalOffType.FULL_WORKING_DAY_1) {
                state.workingTime.name = "Ca sáng";
            } else if (this.data.offType == sabbaticalOffType.FULL_WORKING_DAY_2) {
                state.workingTime.name = "Ca chiều";
            } else if (this.data.offType == sabbaticalOffType.PARTLY_WORKING_DAY) {
                state.workingTime.name = "Cả ngày";
            }
            this.setState(state);
        }
        this.props.getWorkingTimeConfig();
    }

    /**
     * Get working time
     */
    getWorkingTime = () => {

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
                this.state.refreshing = false;
                if (this.props.action == getActionSuccess(ActionEvent.GET_WORKING_TIME_CONFIG)) {
                    this.workingTimeConfig = data;
                    if (!Utils.isNull(data)) {
                        if (data.shiftType == workingTimeShiftType.FULL_WORKING_DAY) {
                            this.workingTimes = [
                                {
                                    id: sabbaticalOffType.PARTLY_WORKING_DAY,
                                    name: "Cả ngày",
                                },
                                {
                                    id: sabbaticalOffType.FULL_WORKING_DAY_1,
                                    name: this.formatTime(data.startWorkingTime1) + " đến " + this.formatTime(data.endWorkingTime1),
                                },
                                {
                                    id: sabbaticalOffType.FULL_WORKING_DAY_2,
                                    name: this.formatTime(data.startWorkingTime2) + " đến " + this.formatTime(data.endWorkingTime2),
                                }
                            ]
                        } else if (data.shiftType == workingTimeShiftType.PARTLY_WORKING_DAY) {
                            this.workingTimes = [
                                {
                                    id: sabbaticalOffType.PARTLY_WORKING_DAY,
                                    name: "Cả ngày",
                                }
                            ]
                        }
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.REGISTER_SABBATICAL)
                    || this.props.action == getActionSuccess(ActionEvent.UPDATE_SABBATICAL)) {
                    if (!Utils.isNull(data)) {
                        this.onBack();
                        this.callback(data);
                    }
                }
            } else if (this.props.errorCode == ErrorCode.HAS_SABBATICAL_REGISTERED) {
                this.showMessage("Bạn đã có đơn xin nghỉ vào thời gian này.");
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    formatTime = (time) => {
        return DateUtil.convertFromFormatToFormat(time, DateUtil.FORMAT_TIME_SECOND, DateUtil.FORMAT_TIME);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    /**
     * On register
     */
    onRegister = () => {
        const { reason, offFromDate, offToDate, workingTime } = this.state;
        if (StringUtil.isNullOrEmpty(reason.trim())) {
            this.showMessage("Vui lòng nhập lý do!");
        } else if (Utils.isNull(offFromDate)) {
            this.showMessage("Vui lòng chọn thời gian nghỉ!");
        } else if (!Utils.validateDate(offFromDate) || this.offFromDateTimeStamp < this.toDayTimeStamp) {
            this.showMessage("Thời gian nghỉ phép không hợp lệ.");
        } else if (!Utils.isNull(offToDate) && !Utils.validateDate(offToDate)) {
            this.showMessage("Thời gian nghỉ phép không hợp lệ.");
        } else if (!Utils.isNull(offToDate) && this.offToDateTimeStamp < this.offFromDateTimeStamp) {
            this.showMessage("Thời gian nghỉ phép không hợp lệ.");
        } else if (Utils.isNull(workingTime.id)) {
            this.showMessage("Vui lòng chọn ca nghỉ!");
        } else {
            let filter = {
                offReason: reason.trim(),
                offFromDate: offFromDate,
                offToDate: offFromDate === offToDate || Utils.isNull(offToDate) ? offFromDate : offToDate,
                offType: workingTime.id
            }
            if (!Utils.isNull(this.data)) {
                this.props.updateSabbatical({ filter, sabbaticalId: this.data.id });
            } else {
                this.props.registerSabbatical(filter);
            }
        }
    }

    /**
     * Handle request
     */
    handleRequest = () => {
        this.props.getWorkingTimeConfig();
    }

    /**
     * Handle refresh
     */
    handleRefresh = () => {
        this.state.refreshing = true;
        this.handleRequest();
    }

    render() {
        const { offFromDate, offToDate, reason } = this.state;
        let toDay = DateUtil.convertFromFormatToFormat(
            DateUtil.convertFromFormatToFormat(
                DateUtil.now(), DateUtil.FORMAT_DATE_TIME_ZONE_T, DateUtil.FORMAT_DATE,
            ),
            DateUtil.FORMAT_DATE,
            DateUtil.FORMAT_DATE_TIME_ZONE_T);
        let offFromDateInput = Utils.validateDate(offFromDate)
            ? DateUtil.convertFromFormatToFormat(
                offFromDate,
                DateUtil.FORMAT_DATE,
                DateUtil.FORMAT_DATE_TIME_ZONE_T
            ) : null;
        let offToDateInput = Utils.validateDate(offToDate)
            ? DateUtil.convertFromFormatToFormat(
                offToDate,
                DateUtil.FORMAT_DATE,
                DateUtil.FORMAT_DATE_TIME_ZONE_T
            ) : null;
        this.toDayTimeStamp = DateUtil.getTimestamp(toDay);
        this.offFromDateTimeStamp = !Utils.isNull(offFromDateInput) && offFromDateInput != 'Invalid date' ? DateUtil.getTimestamp(offFromDateInput) : 0;
        this.offToDateTimeStamp = !Utils.isNull(offToDateInput) && offToDateInput != 'Invalid date' ? DateUtil.getTimestamp(offToDateInput) : 0;
        return (
            <Container style={styles.container}>
                <Root>
                    <Header hasTabs style={commonStyles.header}>
                        {this.renderHeaderView({
                            title: "ĐƠN XIN PHÉP MỚI",
                            titleStyle: { color: Colors.COLOR_WHITE },
                            renderRightMenu: this.renderRightMenu
                        })}
                    </Header>
                    <Content
                        contentContainerStyle={{ flexGrow: 1 }}
                        style={{ flex: 1 }}
                        enableRefresh={this.state.enableRefresh}
                        refreshControl={
                            <RefreshControl
                                progressViewOffset={Constants.HEIGHT_HEADER_OFFSET_REFRESH}
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }
                        showsVerticalScrollIndicator={false}>
                        <View style={{ marginVertical: Constants.MARGIN_X_LARGE }}>
                            {/* Reason */}
                            <View style={{ marginHorizontal: Constants.MARGIN_X_LARGE }}>
                                <Text style={[commonStyles.text, { margin: 0 }]}>Lý do</Text>
                                <TextInputCustom
                                    inputNormalStyle={{
                                        paddingHorizontal: 0,
                                        paddingVertical: Constants.MARGIN_LARGE + Constants.MARGIN
                                    }}
                                    refInput={input => (this.reason = input)}
                                    isMultiLines={true}
                                    placeholder={"Nhập lý do nghỉ..."}
                                    value={reason}
                                    onChangeText={reason => this.setState({ reason })}
                                    onSubmitEditing={() => {

                                    }}
                                    returnKeyType={"done"}
                                />
                            </View>
                            <Text style={[commonStyles.textBold, {
                                margin: Constants.MARGIN_X_LARGE,
                                color: Colors.COLOR_PRIMARY
                            }]}>Thời gian nghỉ phép</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ flex: 1, marginHorizontal: Constants.MARGIN_X_LARGE }}>
                                    <View style={commonStyles.viewSpaceBetween}>
                                        <TextInputMask
                                            style={[commonStyles.text, commonStyles.inputText, {
                                                paddingHorizontal: 0,
                                                flex: 1,
                                                elevation: 0
                                            }]}
                                            ref={input => (this.offFromDate = input)}
                                            placeholder={"--/--/----"}
                                            type={'datetime'}
                                            options={{
                                                format: 'DD/MM/YYYY'
                                            }}
                                            value={offFromDate}
                                            onChangeText={offFromDate => {
                                                if (StringUtil.isNullOrEmpty(offFromDate)) {
                                                    this.state.offToDate = "";
                                                }
                                                this.setState({ offFromDate });
                                            }}
                                            keyboardType="numeric"
                                            returnKeyType={"next"}
                                            blurOnSubmit={false} //focus 
                                        />
                                        <TouchableOpacity
                                            activeOpacity={Constants.ACTIVE_OPACITY}
                                            style={{}}
                                            onPress={() => {
                                                this.showCalendarDate(this.dateFocus.FROM);
                                            }}
                                        >
                                            <Image source={ic_calendar_grey} />
                                        </TouchableOpacity>
                                    </View>
                                    <Hr />
                                </View>
                                <View style={{ flex: 1, marginHorizontal: Constants.MARGIN_X_LARGE }}>
                                    <View style={commonStyles.viewSpaceBetween}>
                                        <TextInputMask
                                            style={[commonStyles.text, commonStyles.inputText, {
                                                paddingHorizontal: 0,
                                                flex: 1,
                                                elevation: 0
                                            }]}
                                            ref={input => (this.offToDate = input)}
                                            placeholder={"--/--/---- (Tùy chọn)"}
                                            type={'datetime'}
                                            options={{
                                                format: 'DD/MM/YYYY'
                                            }}
                                            value={offToDate}
                                            onChangeText={offToDate => this.setState({ offToDate })}
                                            keyboardType="numeric"
                                            returnKeyType={"next"}
                                            blurOnSubmit={false} //focus
                                            editable={!Utils.isNull(this.state.offFromDate)
                                                && Utils.validateDate(this.state.offFromDate)}
                                        />
                                        <TouchableOpacity
                                            activeOpacity={Constants.ACTIVE_OPACITY}
                                            style={{}}
                                            onPress={() => {
                                                !Utils.isNull(this.state.offFromDate)
                                                    && this.offFromDateTimeStamp >= this.toDayTimeStamp
                                                    && this.showCalendarDate(this.dateFocus.TO);
                                            }}
                                        >
                                            <Image source={ic_calendar_grey} />
                                        </TouchableOpacity>
                                    </View>
                                    <Hr />
                                </View>
                            </View>
                            {/* Shift */}
                            <View style={{ margin: Constants.MARGIN_X_LARGE }}>
                                <Text style={[commonStyles.text, {
                                    margin: 0
                                }]}>Ca nghỉ</Text>
                                <View>
                                    <TextInputCustom
                                        refInput={input => {
                                            this.workingTime = input
                                        }}
                                        onPress={() => this.menuOptionWorkingTime.open()}
                                        isInputAction={true}
                                        placeholder={"Chọn ca nghỉ"}
                                        value={this.state.workingTime.name}
                                        inputNormalStyle={{
                                            paddingHorizontal: 0,
                                            paddingVertical: Constants.MARGIN_LARGE + Constants.MARGIN
                                        }}
                                        contentRight={
                                            <Image source={ic_down_grey} />
                                        }
                                    />
                                    {this.renderMenuWorkingTime(this.workingTimes)}
                                </View>
                            </View>
                        </View>
                    </Content>
                    <CalendarScreen
                        minimumDate={this.getMinimumDate()}
                        dateCurrent={DateUtil.convertFromFormatToFormat(
                            DateUtil.now(),
                            DateUtil.FORMAT_DATE_TIME_ZONE,
                            DateUtil.FORMAT_DATE_TIME_ZONE_T
                        )}
                        chooseDate={this.chooseDate.bind(this)}
                        ref={ref => (this.showCalendar = ref)}
                    />
                    {this.state.refreshing ? null : this.showLoadingBar(this.props.isLoading)}
                </Root>
            </Container>
        );
    }

    /**
     * Get minimum date
     */
    getMinimumDate = () => {
        const { offFromDate, dateFocused } = this.state;
        if (!Utils.isNull(offFromDate) && dateFocused == this.dateFocus.TO) {
            let date = DateUtil.convertFromFormatToFormat(
                offFromDate,
                DateUtil.FORMAT_DATE,
                DateUtil.FORMAT_DATE_TIME_ZONE_T
            )
            let dateMax = DateUtil.convertFromFormatToFormat(
                "31/12/2100",
                DateUtil.FORMAT_DATE,
                DateUtil.FORMAT_DATE_TIME_ZONE_T
            )
            let dateTimeStamp = DateUtil.getTimestamp(date);
            let dateMaxTimeStamp = DateUtil.getTimestamp(dateMax);
            return dateTimeStamp > dateMaxTimeStamp ? new Date(dateMax) : new Date(date)
        } else {
            return new Date(new Date().setDate(DateUtil.now().getDate()))
        }
    }

    /**
     * Render right menu
     */
    renderRightMenu = () => {
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                style={{
                    justifyContent: "center",
                    padding: Constants.PADDING_LARGE
                }}
                onPress={this.onRegister}
            >
                <Image source={ic_send_white} />
            </TouchableOpacity>
        )
    }

    /**
     * Render menu option
     */
    renderMenuWorkingTime = () => {
        return (
            <Menu
                style={{}}
                ref={ref => (this.menuOptionWorkingTime = ref)}>
                <MenuTrigger text="" />
                <MenuOptions>
                    {this.workingTimes.map((item, index) => {
                        return (
                            <MenuOption
                                key={index.toString()}
                                onSelect={() => {
                                    let state = this.state;
                                    if (!Utils.isNull(item.id)) {
                                        state.workingTime = item;
                                    }
                                    this.setState(state);
                                }}>
                                <View
                                    style={[commonStyles.viewHorizontal, {
                                        alignItems: "center",
                                        padding: Constants.MARGIN
                                    }]}>
                                    <Text numberOfLines={1} style={[commonStyles.text]}>{item.name}</Text>
                                </View>
                            </MenuOption>
                        )
                    })}
                </MenuOptions>
            </Menu>
        );
    };

    /**
     * Date press
     */
    chooseDate = (day) => {
        let state = this.state;
        let date = DateUtil.convertFromFormatToFormat(
            day,
            DateUtil.FORMAT_DATE_TIME_ZONE_T,
            DateUtil.FORMAT_DATE
        );
        if (state.dateFocused == this.dateFocus.FROM) {
            state.offFromDate = date
        } else if (state.dateFocused == this.dateFocus.TO) {
            state.offToDate = date
        }
        this.setState(state);
    }

    /**
     * Show calendar date
     */
    showCalendarDate(dateFocus) {
        this.setState({ dateFocused: dateFocus });
        this.showCalendar.showDateTimePicker();
    }
}

const mapStateToProps = state => ({
    data: state.registerSabbatical.data,
    action: state.registerSabbatical.action,
    isLoading: state.registerSabbatical.isLoading,
    error: state.registerSabbatical.error,
    errorCode: state.registerSabbatical.errorCode

});

const mapDispatchToProps = {
    ...actions,
    ...commonActions,
    ...timekeepingActions,
    ...sabbaticalActions
};

export default connect(mapStateToProps, mapDispatchToProps)(RegisterSabbaticalView);