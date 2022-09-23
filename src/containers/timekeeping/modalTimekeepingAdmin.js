import React, { Component } from "react";
import {
    ImageBackground, View, StatusBar, Image, ScrollView,
    TouchableWithoutFeedback, BackHandler, Alert,
    Linking, RefreshControl, StyleSheet, TextInput,
    Dimensions, FlatList, TouchableHighlight, TouchableOpacity
} from "react-native";
import { Container, Header, Title, Left, Icon, Right, Button, Body, Content, Text, Card, CardItem, Form } from "native-base";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import ic_close_black from 'images/ic_close_black.png';
import commonStyles from "styles/commonStyles";
import BaseView from "containers/base/baseView"
import TextInputCustom from "components/textInputCustom";
import ModalDropdown from 'components/dropdown';
import I18n, { localizes } from "locales/i18n";
import StringUtil from "utils/stringUtil";
import { Fonts } from "values/fonts";
import { months } from "moment";
import FlatListCustom from "components/flatListCustom";
import Modal from "react-native-modal";
import moment from 'moment';
import DateUtil from "utils/dateUtil";
import Hr from "components/hr";
import approvalStatusType from 'enum/approvalStatusType';
import Utils from 'utils/utils';
import sabbaticalOffType from 'enum/sabbaticalOffType';
import checkInType from "enum/checkInType";

const screen = Dimensions.get("screen");
const deviceWidth = screen.width;
const deviceHeight = screen.height;
var marginHorizontal = Constants.MARGIN_X_LARGE;

export default class ModalTimekeepingAdmin extends BaseView {

    constructor(props) {
        super(props)
        this.state = {
            isVisible: false,
            approvalStatus: null,
            timekeeping: null,
            user: null,
            typeCheck: null
        };
    }

    /**
     * Show Modal Week
     */
    showModal(approvalStatus, timekeeping, user, typeCheck) {
        this.setState({
            isVisible: true,
            approvalStatus,
            timekeeping,
            user,
            typeCheck
        });
    }

    /**
     * hide Modal Week
     */
    hideModal() {
        this.setState({
            isVisible: false
        });
    }

    render() {
        const { approvalStatus, timekeeping, user, typeCheck, isVisible } = this.state;
        let parseItem = {
            name: !Utils.isNull(user) ? user.name : "-",
            phone: !Utils.isNull(user) ? user.phone : "-",
            nameDepartment: !Utils.isNull(user) && !Utils.isNull(user.department) ? user.department.name : null,
            deniedNote: "",
            reason: this.getReason(),
            createdAt: this.getTimeCheck(),
            approvalStatus: 1
        }
        return (
            <Modal
                ref={"modalTimekeepingAdmin"}
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
                <View style={styles.container}>
                    <View style={{ height: Constants.HEADER_HEIGHT, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Text style={[commonStyles.textBold, { flex: 1, color: Colors.COLOR_PRIMARY, margin: Constants.MARGIN_X_LARGE }]}>
                            {this.getTitle()}
                        </Text>
                        <TouchableOpacity
                            style={{ marginHorizontal: Constants.MARGIN_X_LARGE }}
                            onPress={() => this.hideModal()} >
                            <Image source={ic_close_black} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        style={{ marginHorizontal: Constants.MARGIN_X_LARGE }}
                        keyboardShouldPersistTaps='always'
                        showsVerticalScrollIndicator={false}>
                        <Text style={[commonStyles.textBold, { margin: 0, marginVertical: Constants.MARGIN_LARGE }]}>
                            Nhân viên: {parseItem.name}
                        </Text>
                        {!Utils.isNull(parseItem.nameDepartment)
                            && <Text style={[commonStyles.text, { margin: 0, marginVertical: Constants.MARGIN_LARGE }]}>
                                Phòng ban: {parseItem.nameDepartment}
                            </Text>
                        }
                        <Text style={[commonStyles.text, { margin: 0, marginVertical: Constants.MARGIN_LARGE }]}>
                            Số điện thoại: {parseItem.phone}
                        </Text>
                        <Text style={[commonStyles.text, { margin: 0, marginVertical: Constants.MARGIN_LARGE }]}>
                            Lý do: {parseItem.reason}
                        </Text>
                        <Text style={[commonStyles.text, { margin: 0, marginVertical: Constants.MARGIN_LARGE }]}>
                            Lúc: {parseItem.createdAt}
                        </Text>
                    </ScrollView>
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
                            onPress={() => this.onClickAction()}>
                            <Text style={[commonStyles.text, { marginVertical: 0, color: Colors.COLOR_WHITE }]} >
                                {approvalStatus == approvalStatusType.APPROVED && localizes("sabbatical.approval")}
                                {approvalStatus == approvalStatusType.DENIED && localizes("sabbatical.denied")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }

    onClickAction() {
        const { approvalStatus, timekeeping, typeCheck, user } = this.state;
        let filter = {
            timekeepingId: timekeeping.id,
            approvalStatus,
            checkInType: typeCheck
        }
        this.props.approvalTimekeeping(filter, user);
    }

    /**
     * Get title
     */
    getTitle = () => {
        const { approvalStatus } = this.state;
        if (approvalStatus == approvalStatusType.APPROVED) {
            return "DUYỆT CHẤM CÔNG"
        } else if (approvalStatus == approvalStatusType.DENIED) {
            return "TỪ CHỐI CHẤM CÔNG"
        }
    }

    /**
     * Get reason
     */
    getReason = () => {
        const { typeCheck, timekeeping } = this.state;
        if (typeCheck == checkInType.CHECK_IN) {
            return timekeeping.checkInNote
        } else if (typeCheck == checkInType.CHECK_OUT) {
            return timekeeping.checkOutNote
        }
    }

    /**
     * Get time check
     */
    getTimeCheck = () => {
        const { typeCheck, timekeeping } = this.state;
        if (typeCheck == checkInType.CHECK_IN) {
            return DateUtil.convertFromFormatToFormat(timekeeping.checkInTime, DateUtil.FORMAT_TIME_SECOND, DateUtil.FORMAT_TIME)
        } else if (typeCheck == checkInType.CHECK_OUT) {
            return DateUtil.convertFromFormatToFormat(timekeeping.checkOutTime, DateUtil.FORMAT_TIME_SECOND, DateUtil.FORMAT_TIME)
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
    }
});