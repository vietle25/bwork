import React, { Component } from "react";
import {
    ImageBackground,
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform,
    ScrollView,
    StatusBar
} from "react-native";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import { Fonts } from "values/fonts";
import commonStyles from "styles/commonStyles";
import Modal from "react-native-modal";
import Utils from "utils/utils";
import { localizes } from "locales/i18n";
import DateUtil from "utils/dateUtil";
import ic_close_black from 'images/ic_close_black.png';
import StringUtil from "utils/stringUtil";
import TextInputCustom from "components/textInputCustom";
import ic_down_grey from 'images/ic_down_grey.png';
import ic_delete_red from 'images/ic_delete_red.png';
import checkInType from 'enum/checkInType';
import { CalendarScreen } from "components/calendarScreen";
import BaseView from "containers/base/baseView";
import ModalDropdown from 'components/dropdown';
import Hr from "components/hr";
import workingTimeShiftType from "enum/workingTimeShiftType";
import { TextInputMask } from 'react-native-masked-text';
import ic_calendar_grey from "images/ic_calendar_grey.png";
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { RootSiblingParent } from 'react-native-root-siblings';

const screen = Dimensions.get("screen");
const deviceWidth = screen.width;
const deviceHeight = screen.height;
var marginHorizontal = Constants.MARGIN_X_LARGE;

const wifiDefault = {
    defaultId: null,
    defaultValue: "Chọn wifi",
    defaultIndex: -1
};

const type = {
    ADD: 1,
    UPDATE: 2
}

class ModalAddTimekeeping extends BaseView {

    constructor(props) {
        super(props)
        this.state = {
            isVisible: false,
            timekeepingId: null,
            checkinTime: null,
            checkinWifiId: null,
            checkinNote: null,
            checkoutTime: null,
            checkoutWifiId: null,
            checkoutNote: null,
            userId: null,
            checkinWifiDefault: wifiDefault,
            checkoutWifiDefault: wifiDefault,
            workingTimeConfig: null,
            timekeepingRecord: null
        };
        this.checkInType = null;
        this.type = null;
        this.todaySQL = DateUtil.convertFromFormatToFormat(DateUtil.now(), DateUtil.FORMAT_DATE_TIME_ZONE_T, DateUtil.FORMAT_DATE_SQL);
    }

    async componentDidMount() {
        await this.getMinutesAbleTimekeeping();
    }

    /**
     * Show modal
     */
    showModal = (data, user, workingTimeConfig, timekeepingRecord) => {
        this.type = !Utils.isNull(data) ? type.UPDATE : type.ADD;
        let checkinWifiId = !Utils.isNull(data)
            ? !Utils.isNull(data.checkInWiFiConfig) ? data.checkInWiFiConfig.id : null
            : null;
        let checkoutWifiId = !Utils.isNull(data)
            ? !Utils.isNull(data.checkOutWiFiConfig) ? data.checkOutWiFiConfig.id : null
            : null;
        this.setState({
            isVisible: true,
            userId: user.id,
            timekeepingId: !Utils.isNull(data) ? data.id : null,
            checkinTime: this.getCheckinTime(data, timekeepingRecord, workingTimeConfig),
            checkinWifiId: this.getWifiDefault(checkinWifiId).defaultId,
            checkinNote: !Utils.isNull(data) ? data.checkInNote : null,
            checkoutTime: this.getCheckoutTime(data, timekeepingRecord, workingTimeConfig),
            checkoutWifiId: this.getWifiDefault(checkoutWifiId).defaultId,
            checkoutNote: !Utils.isNull(data) ? data.checkOutNote : null,
            checkinWifiDefault: this.getWifiDefault(checkinWifiId),
            checkoutWifiDefault: this.getWifiDefault(checkoutWifiId),
            workingTimeConfig,
            timekeepingRecord
        });
    }

    /**
     * Get checkin time
     */
    getCheckinTime = (timekeeping, timekeepingRecord, workingTimeConfig) => {
        let checkInTime = null;
        if (!Utils.isNull(timekeeping)) {
            checkInTime = timekeeping.checkInTime;
        } else {
            if (timekeepingRecord.length > 0) {
                if (!this.isDuplicateTimekeeping(workingTimeConfig.startWorkingTime1, workingTimeConfig.endWorkingTime1, timekeepingRecord)) {
                    checkInTime = DateUtil.convertFromFormatToFormat(workingTimeConfig.startWorkingTime1, DateUtil.FORMAT_TIME_SECONDS, DateUtil.FORMAT_TIME);
                } else {
                    if (!this.isDuplicateTimekeeping(workingTimeConfig.startWorkingTime2, workingTimeConfig.endWorkingTime2, timekeepingRecord)) {
                        checkInTime = DateUtil.convertFromFormatToFormat(workingTimeConfig.startWorkingTime2, DateUtil.FORMAT_TIME_SECONDS, DateUtil.FORMAT_TIME);
                    }
                }
            } else {
                checkInTime = DateUtil.convertFromFormatToFormat(workingTimeConfig.startWorkingTime1, DateUtil.FORMAT_TIME_SECONDS, DateUtil.FORMAT_TIME);
            }
        }
        return checkInTime;
    }

    /**
     * Get checkout time
     */
    getCheckoutTime = (timekeeping, timekeepingRecord, workingTimeConfig) => {
        let checkOutTime = null;
        if (!Utils.isNull(timekeeping)) {
            return timekeeping.checkOutTime;
        } else {
            if (timekeepingRecord.length > 0) {
                if (!this.isDuplicateTimekeeping(workingTimeConfig.startWorkingTime1, workingTimeConfig.endWorkingTime1, timekeepingRecord)) {
                    checkOutTime = DateUtil.convertFromFormatToFormat(workingTimeConfig.endWorkingTime1, DateUtil.FORMAT_TIME_SECONDS, DateUtil.FORMAT_TIME);
                } else {
                    if (!this.isDuplicateTimekeeping(workingTimeConfig.startWorkingTime2, workingTimeConfig.endWorkingTime2, timekeepingRecord)) {
                        checkOutTime = DateUtil.convertFromFormatToFormat(workingTimeConfig.endWorkingTime2, DateUtil.FORMAT_TIME_SECONDS, DateUtil.FORMAT_TIME);
                    }
                }
            } else {
                checkOutTime = DateUtil.convertFromFormatToFormat(workingTimeConfig.endWorkingTime1, DateUtil.FORMAT_TIME_SECONDS, DateUtil.FORMAT_TIME);
            }
        }
        return checkOutTime;
    }

    /**
     * Get wifi default
     */
    getWifiDefault = (wifiId) => {
        const { wiFiListAllows = [] } = this.props;
        let wiFiDefault = wifiDefault;
        wiFiListAllows.forEach((item, index) => {
            if (wifiId == item.id) {
                wiFiDefault = {
                    defaultId: item.id,
                    defaultValue: item.wiFiName,
                    defaultIndex: index
                }
            }
        });
        return wiFiDefault;
    }

    /**
     * Hide modal
     */
    hideModal = () => {
        this.setState({
            isVisible: false
        });
    }

    render() {
        const {
            isVisible,
            checkinTime,
            checkinNote,
            checkinWifiDefault,
            checkoutNote,
            checkoutTime,
            checkoutWifiDefault,
            workingTimeConfig
        } = this.state;
        return (
            <Modal
                ref={"modalAddTimekeeping"}
                style={{
                    backgroundColor: Colors.COLOR_TRANSPARENT,
                    margin: 0,
                    justifyContent: 'center'
                }}
                isVisible={isVisible}
                backdropOpacity={0.5}
                coverScreen={true}
                deviceHeight={deviceHeight}
                onBackButtonPress={() => {
                    this.hideModal();
                }}
                onBackdropPress={() => {
                    this.hideModal();
                }}
            >
                <RootSiblingParent>

                    <View style={styles.container}>
                        <View style={{ height: Constants.HEADER_HEIGHT, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Text style={[commonStyles.textBold, { flex: 1, color: Colors.COLOR_PRIMARY, margin: Constants.MARGIN_X_LARGE }]}>
                                {"THÊM CHẤM CÔNG"}
                            </Text>
                            <TouchableOpacity
                                style={{ marginHorizontal: Constants.MARGIN_X_LARGE }}
                                onPress={() => this.hideModal()} >
                                <Image source={ic_close_black} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps='always'>
                            {!Utils.isNull(workingTimeConfig)
                                ? <View style={{ margin: Constants.MARGIN_X_LARGE, marginTop: 0 }}>
                                    {workingTimeConfig.shiftType == workingTimeShiftType.FULL_WORKING_DAY
                                        ? <View style={{ width: "100%" }}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <View style={{ flexDirection: 'row', flex: 1, marginRight: Constants.MARGIN_LARGE }}>
                                                    {this.renderTextWorkingTime("Giờ bắt đầu:", workingTimeConfig.startWorkingTime1)}
                                                </View>
                                                <View style={{ flexDirection: 'row', flex: 1, marginLeft: Constants.MARGIN_LARGE }}>
                                                    {this.renderTextWorkingTime("Giờ nghỉ giữa ca:", workingTimeConfig.endWorkingTime1)}
                                                </View>
                                            </View>
                                            <View style={{ flexDirection: 'row' }}>
                                                <View style={{ flexDirection: 'row', flex: 1, marginRight: Constants.MARGIN_LARGE }}>
                                                    {this.renderTextWorkingTime("Giờ bắt đầu lại:", workingTimeConfig.startWorkingTime2)}
                                                </View>
                                                <View style={{ flexDirection: 'row', flex: 1, marginLeft: Constants.MARGIN_LARGE }}>
                                                    {this.renderTextWorkingTime("Giờ kết thúc:", workingTimeConfig.endWorkingTime2)}
                                                </View>
                                            </View>
                                        </View>
                                        :
                                        <View style={{ flexDirection: 'row' }}>
                                            <View style={{ flexDirection: 'row', flex: 1, marginRight: Constants.MARGIN_LARGE }}>
                                                {this.renderTextWorkingTime("Giờ bắt đầu:", workingTimeConfig.startWorkingTime1)}
                                            </View>
                                            <View style={{ flexDirection: 'row', flex: 1, marginLeft: Constants.MARGIN_LARGE }}>
                                                {this.renderTextWorkingTime("Giờ kết thúc:", workingTimeConfig.endWorkingTime1)}
                                            </View>
                                        </View>
                                    }
                                    <Hr style={{ marginTop: Constants.MARGIN_LARGE }} color={Colors.COLOR_PRIMARY} />
                                </View>
                                : null
                            }
                            {/* Checkin */}
                            <View style={{ marginHorizontal: Constants.MARGIN_X_LARGE }}>
                                <View style={{ flexDirection: "row" }}>
                                    {/* Time checkin */}
                                    <View style={{ flex: 1, marginRight: Constants.MARGIN_LARGE }}>
                                        <Text style={[styles.text]}>Thời gian checkin</Text>
                                        <View style={{ flex: 1 }}>
                                            <View style={commonStyles.viewSpaceBetween}>
                                                <TextInputMask
                                                    style={[commonStyles.text, commonStyles.inputText, {
                                                        paddingHorizontal: 0,
                                                        flex: 1,
                                                        elevation: 0
                                                    }]}
                                                    ref={input => (this.checkinTime = input)}
                                                    placeholder={"--:--"}
                                                    type={'datetime'}
                                                    options={{
                                                        format: DateUtil.FORMAT_TIME
                                                    }}
                                                    value={checkinTime}
                                                    onChangeText={checkinTime => {
                                                        this.setState({ checkinTime });
                                                    }}
                                                    keyboardType="numeric"
                                                    returnKeyType={"next"}
                                                    blurOnSubmit={false} //focus 
                                                />
                                                <TouchableOpacity
                                                    activeOpacity={Constants.ACTIVE_OPACITY}
                                                    style={{}}
                                                    onPress={() => {
                                                        this.showCalendarTime(checkInType.CHECK_IN);
                                                    }}
                                                >
                                                    <Image source={ic_calendar_grey} />
                                                </TouchableOpacity>
                                            </View>
                                            <Hr />
                                        </View>
                                    </View>
                                    {/* Wifi checkin */}
                                    <View style={{ flex: 1, marginLeft: Constants.MARGIN_LARGE }}>
                                        <Text style={[styles.text]}>
                                            Wifi checkin
                                </Text>
                                        {this.renderDropdownWifi(
                                            "modalDropdownCheckin",
                                            checkinWifiDefault,
                                            { color: !Utils.isNull(this.state.checkinWifiId) ? Colors.COLOR_TEXT : Colors.COLOR_DRK_GREY }
                                        )}
                                    </View>
                                </View>
                                <View style={{ paddingVertical: Constants.MARGIN_LARGE + Constants.MARGIN }}>
                                    <Text style={[styles.text]}>
                                        Lý do checkin
                            </Text>
                                    <TextInputCustom
                                        inputNormalStyle={{
                                            paddingHorizontal: 0
                                        }}
                                        refInput={input => (this.checkinNote = input)}
                                        isMultiLines={true}
                                        placeholder={"Nhập lý do checkin..."}
                                        value={checkinNote}
                                        onChangeText={checkinNote => this.setState({ checkinNote })}
                                    />
                                </View>
                            </View>
                            {/* Checkout */}
                            <View style={{ marginHorizontal: Constants.MARGIN_X_LARGE }}>
                                <View style={{ flexDirection: "row" }}>
                                    {/* Time checkout */}
                                    <View style={{ flex: 1, marginRight: Constants.MARGIN_LARGE }}>
                                        <Text style={[styles.text]}>Thời gian checkout</Text>
                                        <View style={{ flex: 1 }}>
                                            <View style={commonStyles.viewSpaceBetween}>
                                                <TextInputMask
                                                    style={[commonStyles.text, commonStyles.inputText, {
                                                        paddingHorizontal: 0,
                                                        flex: 1,
                                                        elevation: 0
                                                    }]}
                                                    ref={input => (this.checkoutTime = input)}
                                                    placeholder={"--:--"}
                                                    type={'datetime'}
                                                    options={{
                                                        format: DateUtil.FORMAT_TIME
                                                    }}
                                                    value={checkoutTime}
                                                    onChangeText={checkoutTime => {
                                                        this.setState({ checkoutTime });
                                                    }}
                                                    keyboardType="numeric"
                                                    returnKeyType={"next"}
                                                    blurOnSubmit={false} //focus 
                                                />
                                                <TouchableOpacity
                                                    activeOpacity={Constants.ACTIVE_OPACITY}
                                                    style={{}}
                                                    onPress={() => {
                                                        this.showCalendarTime(checkInType.CHECK_OUT);
                                                    }}
                                                >
                                                    <Image source={ic_calendar_grey} />
                                                </TouchableOpacity>
                                            </View>
                                            <Hr />
                                        </View>
                                    </View>
                                    {/* Wifi checkout */}
                                    <View style={{ flex: 1, marginLeft: Constants.MARGIN_LARGE }}>
                                        <Text style={[styles.text]}>
                                            Wifi checkout
                                </Text>
                                        {this.renderDropdownWifi(
                                            "modalDropdownCheckout",
                                            checkoutWifiDefault,
                                            { color: !Utils.isNull(this.state.checkoutWifiId) ? Colors.COLOR_TEXT : Colors.COLOR_DRK_GREY }
                                        )}
                                    </View>
                                </View>
                                <View style={{ paddingTop: Constants.MARGIN_LARGE + Constants.MARGIN }}>
                                    <Text style={[styles.text]}>
                                        Lý do checkout
                            </Text>
                                    <TextInputCustom
                                        inputNormalStyle={{
                                            paddingHorizontal: 0
                                        }}
                                        refInput={input => (this.checkoutNote = input)}
                                        isMultiLines={true}
                                        placeholder={"Nhập lý do checkout..."}
                                        value={checkoutNote}
                                        onChangeText={checkoutNote => this.setState({ checkoutNote })}
                                    />
                                </View>
                            </View>
                            {/* Button */}
                            <View style={[{
                                flexDirection: 'row',
                                justifyContent: 'flex-end',
                                margin: Constants.MARGIN_X_LARGE
                            }]}>
                                <TouchableOpacity
                                    activeOpacity={Constants.ACTIVE_OPACITY}
                                    block style={[commonStyles.buttonStyle, {
                                        marginRight: Constants.MARGIN_X_LARGE,
                                        backgroundColor: Colors.COLOR_WHITE,
                                        borderWidth: Constants.BORDER_WIDTH,
                                        borderColor: Colors.COLOR_TEXT
                                    }]}
                                    onPress={
                                        () => this.hideModal()}>
                                    <Text style={[commonStyles.text, { marginVertical: 0 }]}>
                                        {localizes("cancel")}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    block
                                    activeOpacity={Constants.ACTIVE_OPACITY}
                                    style={[commonStyles.buttonStyle]}
                                    onPress={() => this.onClickAddTimekeeping()}>
                                    <Text style={[commonStyles.text, { marginVertical: 0, color: Colors.COLOR_WHITE }]} >
                                        Lưu lại
                            </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                    <CalendarScreen
                        minimumDate={new Date(new Date().setDate(DateUtil.now().getDate() + 1))}
                        dateCurrent={DateUtil.now()}
                        chooseDate={this.chooseDate}
                        mode={"time"}
                        ref={ref => this.showCalendar = ref} />
                </RootSiblingParent>
            </Modal>
        );
    }

    /**
     * Render dropdown wifi
     * @param {*} ref 
     */
    renderDropdownWifi = (ref, wifiDefault, textStyle) => {
        const { wiFiListAllows = [] } = this.props;
        return (
            <ModalDropdown ref={ref}
                style={{
                    borderBottomWidth: Constants.BORDER_WIDTH,
                    borderBottomColor: Colors.COLOR_BACKGROUND,
                    paddingVertical: Constants.PADDING_LARGE + Constants.PADDING
                }}
                textStyle={[commonStyles.text, { margin: 0 }, textStyle]}
                dropdownStyle={{
                    ...commonStyles.shadowOffset,
                    width: (deviceWidth / 2) - (Constants.MARGIN_XX_LARGE + Constants.MARGIN_LARGE),
                    marginTop: Constants.MARGIN_X_LARGE - Constants.MARGIN
                }}
                options={wiFiListAllows}
                renderButtonText={(rowData) => {
                    const { wiFiName } = rowData;
                    return `${wiFiName}`;
                }}
                renderRow={this.dropdownRenderRow.bind(this, ref)}
                renderSeparator={this.dropdownRenderSeparator}
                defaultValue={wifiDefault.defaultValue}
                defaultIndex={wifiDefault.defaultIndex}
            />
        )
    }

    /**
     * Render row dropdown wifi
     * @param {*} rowData 
     * @param {*} rowID 
     * @param {*} highlighted 
     */
    dropdownRenderRow = (ref, rowData, rowID, highlighted) => {
        return (
            <TouchableOpacity
                onPress={() => {
                    if (ref == "modalDropdownCheckin") {
                        this.setState({ checkinWifiId: rowData.id != -1 ? rowData.id : null });
                        this.refs.modalDropdownCheckin.select(rowID);
                        this.refs.modalDropdownCheckin.hide();
                    } else {
                        this.setState({ checkoutWifiId: rowData.id != -1 ? rowData.id : null });
                        this.refs.modalDropdownCheckout.select(rowID);
                        this.refs.modalDropdownCheckout.hide();
                    }
                }}>
                <Text style={[commonStyles.text, highlighted && { color: Colors.COLOR_PRIMARY }]}>
                    {`${rowData.wiFiName}`}
                </Text>
            </TouchableOpacity>
        );
    }

    /**
     * Render separator dropdown wifi
     * @param {*} sectionID 
     * @param {*} rowID 
     * @param {*} adjacentRowHighlighted 
     */
    dropdownRenderSeparator = (sectionID, rowID, adjacentRowHighlighted) => {
        const { wiFiListAllows = [] } = this.props;
        if (rowID == wiFiListAllows.length - 1) return;
        let key = `spr_${rowID}`;
        return (
            <View
                style={{
                    height: 1,
                    backgroundColor: Colors.COLOR_BACKGROUND
                }}
                key={key}
            />
        );
    }

    /**
     * Show calendar time
     */
    showCalendarTime = (checkInType) => {
        this.checkInType = checkInType;
        this.showCalendar.showDateTimePicker();
    }

    /**
     * On click add timekeeping
     */
    onClickAddTimekeeping = () => {
        const { addTimekeeping, updateTimekeeping } = this.props;
        const {
            checkinWifiId,
            checkinNote,
            checkoutWifiId,
            checkoutNote,
            userId,
            timekeepingId,
            workingTimeConfig,
            timekeepingRecord
        } = this.state;
        const { startWorkingTime1, endWorkingTime1, startWorkingTime2, endWorkingTime2 } = workingTimeConfig;
        let minuteBeforeCheckIn1 = !Utils.isNull(this.minuteBeforeCheckIn1.numericValue) ? this.minuteBeforeCheckIn1.numericValue * 1000 * 60 : 0;
        let minuteBeforeCheckIn2 = !Utils.isNull(this.minuteBeforeCheckIn2.numericValue) ? this.minuteBeforeCheckIn2.numericValue * 1000 * 60 : 0;
        let minuteAfterCheckOut1 = !Utils.isNull(this.minuteAfterCheckOut1.numericValue) ? this.minuteAfterCheckOut1.numericValue * 1000 * 60 : 0;
        let minuteAfterCheckOut2 = !Utils.isNull(this.minuteAfterCheckOut2.numericValue) ? this.minuteAfterCheckOut2.numericValue * 1000 * 60 : 0;

        let start1 = this.formatWorkingTime(startWorkingTime1);
        let end1 = this.formatWorkingTime(endWorkingTime1);
        let start2 = this.formatWorkingTime(!Utils.isNull(startWorkingTime2) ? startWorkingTime2 : startWorkingTime1);
        let end2 = this.formatWorkingTime(!Utils.isNull(endWorkingTime2) ? endWorkingTime2 : endWorkingTime1);

        let checkinTime = !Utils.isNull(this.state.checkinTime)
            ? DateUtil.convertFromFormatToFormat(this.state.checkinTime, DateUtil.FORMAT_TIME, DateUtil.FORMAT_TIME_SECOND)
            : null;
        let checkoutTime = !Utils.isNull(this.state.checkoutTime)
            ? DateUtil.convertFromFormatToFormat(this.state.checkoutTime, DateUtil.FORMAT_TIME, DateUtil.FORMAT_TIME_SECOND)
            : null;

        let checkinTimestamp = this.formatWorkingTime(checkinTime);
        let checkoutTimestamp = this.formatWorkingTime(checkoutTime);

        if (Utils.isNull(checkinTime)) {
            this.showMessage("Vui lòng nhập thời gian checkin!")
        } else if (!Utils.validHour(this.state.checkinTime)) {
            this.showMessage("Vui lòng nhập thời gian checkin đúng định dạng!")
        } else if (!Utils.isNull(checkoutWifiId) && Utils.isNull(checkoutTime)) {
            this.showMessage("Vui lòng nhập thời gian checkout!")
        } else if (!Utils.isNull(checkoutTime) && !Utils.validHour(this.state.checkoutTime)) {
            this.showMessage("Vui lòng nhập thời gian checkout đúng định dạng!")
        } else if (!Utils.isNull(checkoutTime) && checkinTime >= checkoutTime) {
            this.showMessage("Vui lòng nhập thời gian checkout lớn hơn thời gian checkin!")
        } else if (checkinTimestamp < (start1 - minuteBeforeCheckIn1) || checkinTimestamp >= (end1 + minuteAfterCheckOut1)
            && checkinTimestamp < (start2 - minuteBeforeCheckIn2) || checkinTimestamp > end2) {
            this.showMessage("Vui lòng nhập thời gian checkin hợp lệ!")
        }
        // else if (checkoutTimestamp < (start2 - minuteBeforeCheckIn2) && checkoutTimestamp > (end1 + minuteAfterCheckOut1) || checkoutTimestamp > (end2 + minuteAfterCheckOut2)) {
        //     this.showMessage("Vui lòng chọn thời gian checkout hợp lệ!")
        // } else if (checkinTimestamp < (end1 + minuteAfterCheckOut1) && checkoutTimestamp > (start2 - minuteBeforeCheckIn2)) {
        //     this.showMessage("Vui lòng chọn thời gian checkout hợp lệ!")
        // }
        else if (this.isDuplicateTimekeeping(checkinTime, checkoutTime, timekeepingRecord)) {
            this.showMessage("Đã chấm công trong khung giờ này, vui lòng chấm công lại!")
        } else {
            let filter = {
                userId,
                checkinTime,
                checkinWifiId,
                checkinNote,
                checkoutTime,
                checkoutWifiId,
                checkoutNote
            }
            if (this.type == type.ADD) {
                addTimekeeping(filter);
            } else {
                updateTimekeeping({ ...filter, timekeepingId });
            }
        }
    }

    /**
     * is duplicate timekeeping
     * @param {*} timekeepingRecord 
     */
    isDuplicateTimekeeping = (checkinTime, checkoutTime, timekeepingRecord) => {
        let isDuplicate = false;
        for (let index = 0; index < timekeepingRecord.length; index++) {
            const item = timekeepingRecord[index];
            if ((checkinTime >= item.checkInTime && checkinTime <= item.checkOutTime)
                || (checkoutTime >= item.checkInTime && checkoutTime <= item.checkOutTime)) {
                isDuplicate = true;
                break;
            }
        }
        return isDuplicate;
    }

    /**
     * Date press
     */
    chooseDate = (day) => {
        let time = DateUtil.convertFromFormatToFormat(day, DateUtil.FORMAT_DATE_TIME_ZONE_T, DateUtil.FORMAT_TIME);
        switch (this.checkInType) {
            case checkInType.CHECK_IN:
                this.setState({
                    checkinTime: time
                })
                break;
            case checkInType.CHECK_OUT:
                this.setState({
                    checkoutTime: time
                })
                break;
            default:
                break;
        }
    }

    /**
     * Render text working time
     */
    renderTextWorkingTime(title, time) {
        return (
            <View style={{ flexDirection: 'row', width: "100%" }}>
                <Text style={[commonStyles.text, { marginHorizontal: 0 }]}>{title}</Text>
                <Text style={[commonStyles.text, { opacity: Constants.OPACITY_50 }]}>
                    {!Utils.isNull(time) ? DateUtil.convertFromFormatToFormat(time, DateUtil.FORMAT_TIME_SECONDS, DateUtil.FORMAT_TIME) : ""}
                </Text>
            </View>
        )
    }

    /**
     * Format working time
     * @param {*} workingTime 
     */
    formatWorkingTime(workingTime, day) {
        let dayWorking = !Utils.isNull(day) ? day : this.todaySQL;
        if (!Utils.isNull(workingTime)) {
            return DateUtil.getTimestamp(DateUtil.convertFromFormatToFormat(
                dayWorking + " " + workingTime, DateUtil.FORMAT_DATE_TIMES, DateUtil.FORMAT_DATE_TIME_ZONE_T));
        } else {
            return 0
        }
    }
}

const styles = StyleSheet.create({
    container: {
        ...commonStyles.shadowOffset,
        margin: marginHorizontal,
        borderRadius: Constants.CORNER_RADIUS,
        backgroundColor: Colors.COLOR_WHITE,
        maxHeight: "90%"
    },
    text: {
        ...commonStyles.text,
        margin: 0
    }
});

export default ModalAddTimekeeping;