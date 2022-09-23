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
import Modal from 'react-native-modalbox';
import moment from 'moment';
import DateUtil from "utils/dateUtil";
import Hr from "components/hr";
import approvalStatusType from 'enum/approvalStatusType';
import Utils from 'utils/utils';
import sabbaticalOffType from 'enum/sabbaticalOffType';

const screen = Dimensions.get("window");

export default class ModalSabbaticalAdmin extends BaseView {

    constructor(props) {
        super(props)
        this.state = {
            contentValue: [],
            textReason: "",
            isAlert: null,
            showMessage: "",
        };
    }

    componentDidUpdate = (prevProps, prevState) => {
    }

    componentWillMount = () => {
    }

    /**
     * Show Modal Week
     */
    showModal(contentValue) {
        this.setState({
            contentValue
        })
        this.refs.modalSabbaticalAdmin.open();
    }

    /**
     * hide Modal Week
     */
    hideModal() {
        this.refs.modalSabbaticalAdmin.close();
        this.setState({ isAlert: false });
    }

    componentWillUnmount = () => {
    }

    render() {
        const { contentValue, textReason } = this.state;
        let parseItem = {
            name: !Utils.isNull(contentValue.userDTO) ? contentValue.userDTO.name : "-",
            phone: !Utils.isNull(contentValue.userDTO) ? contentValue.userDTO.phone : "-",
            nameDepartment: !Utils.isNull(contentValue.nameDepartment) ? contentValue.nameDepartment : "-",
            deniedNote: !Utils.isNull(contentValue.deniedNote) ? contentValue.deniedNote : "",
            offTypeString: this.getOffTypeString(contentValue.offType, contentValue.workingTimeConfig),
            offFromDate: DateUtil.convertFromFormatToFormat(contentValue.offFromDate, DateUtil.FORMAT_DATE_SQL, DateUtil.FORMAT_DATE),
            offToDate: !Utils.isNull(contentValue.offToDate) ? DateUtil.convertFromFormatToFormat(contentValue.offToDate, DateUtil.FORMAT_DATE_SQL, DateUtil.FORMAT_DATE) : null,
            offReason: contentValue.offReason,
            createdAt: contentValue.createdAt,
            approvalStatus: contentValue.approvalStatus
        }
        return (
            <Modal
                ref={"modalSabbaticalAdmin"}
                style={{
                    backgroundColor: "#00000000",
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
                backdrop={true}
                onClosed={() => {
                    this.hideModal()
                }}
                backButtonClose={true}
                swipeToClose={false}
                coverScreen={true}
            >
                <View style={[commonStyles.shadowOffset, {
                    maxHeight: "90%",
                    width: screen.width - Constants.MARGIN_X_LARGE * 2,
                    borderRadius: Constants.CORNER_RADIUS,
                    backgroundColor: Colors.COLOR_WHITE,
                }]}>
                    <View style={{ height: Constants.HEADER_HEIGHT, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Text style={[commonStyles.textBold, { flex: 1, color: Colors.COLOR_PRIMARY, margin: Constants.MARGIN_X_LARGE }]}>
                            {parseItem.approvalStatus != 0 ? localizes("sabbatical.contentSabbatical") : this.props.isApproved ? localizes("sabbatical.approvalSabbatical") : localizes("sabbatical.deniedSabbatical")}
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
                        <Text style={[commonStyles.textBold, { margin: 0, marginVertical: Constants.MARGIN_LARGE, fontSize: Fonts.FONT_SIZE_MEDIUM }]}>
                            Nhân viên: {parseItem.name}
                        </Text>
                        <Text style={{ marginVertical: Constants.MARGIN_LARGE, fontSize: Fonts.FONT_SIZE_MEDIUM }}>
                            Phòng ban: {parseItem.nameDepartment}
                        </Text>
                        <Text style={{ marginVertical: Constants.MARGIN_LARGE, fontSize: Fonts.FONT_SIZE_MEDIUM }}>
                            Số điện thoại: {parseItem.phone}
                        </Text>
                        <Text style={{ marginVertical: Constants.MARGIN_LARGE, fontSize: Fonts.FONT_SIZE_MEDIUM }}>
                            Lý do: {parseItem.offReason}
                        </Text>
                        <Text style={{ marginVertical: Constants.MARGIN_LARGE, fontSize: Fonts.FONT_SIZE_MEDIUM }}>
                            Ngày nghỉ phép: {this.renderDate(parseItem.offFromDate, parseItem.offToDate)}
                        </Text>
                        <Text style={{ marginVertical: Constants.MARGIN_LARGE, fontSize: Fonts.FONT_SIZE_MEDIUM }}>
                            Ca nghỉ: {parseItem.offTypeString}
                        </Text>
                        {(parseItem.approvalStatus == approvalStatusType.WAITING_FOR_APPROVAL || parseItem.approvalStatus == approvalStatusType.DENIED) && !this.props.isApproved ?
                            <View>
                                <Text style={{ marginVertical: Constants.MARGIN_LARGE, fontSize: Fonts.FONT_SIZE_MEDIUM }}>
                                    Lý do từ chối:
                        </Text>
                                {!Utils.isNull(this.state.isAlert) && this.state.isAlert ?
                                    <Text style={{ color: Colors.COLOR_RED, marginBottom: Constants.MARGIN_LARGE, fontSize: Fonts.FONT_SIZE_MEDIUM - 1 }}>
                                        * {this.state.showMessage}
                                    </Text>
                                    : null}
                                <TextInputCustom
                                    refInput={r => (this.textReason = r)}
                                    isBorderMultiLines={true}
                                    value={parseItem.approvalStatus != approvalStatusType.DENIED ? this.textReason : parseItem.deniedNote}
                                    onChangeText={(text) => {
                                        this.onChangeTextReason(text);
                                    }}
                                    inputNormalStyle={{ maxHeight: Constants.MARGIN_LARGE_TITLE_ONE_BTN * 2, borderColor: !Utils.isNull(this.state.isAlert) && this.state.isAlert ? Colors.COLOR_RED : Colors.COLOR_GRAY }}
                                    editable={parseItem.approvalStatus != approvalStatusType.DENIED}

                                />
                            </View> : null}
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
                                backgroundColor: parseItem.approvalStatus != approvalStatusType.WAITING_FOR_APPROVAL ? Colors.COLOR_PRIMARY : Colors.COLOR_WHITE,
                                borderWidth: Constants.BORDER_WIDTH,
                                borderColor: parseItem.approvalStatus != approvalStatusType.WAITING_FOR_APPROVAL ? Colors.COLOR_PRIMARY : Colors.COLOR_GRAY
                            }]}
                            onPress={
                                () => { this.hideModal() }}>
                            <Text style={[commonStyles.text, { marginVertical: 0, color: parseItem.approvalStatus != approvalStatusType.WAITING_FOR_APPROVAL ? Colors.COLOR_WHITE : Colors.COLOR_TEXT}]} > {parseItem.approvalStatus != approvalStatusType.WAITING_FOR_APPROVAL ? localizes("sabbatical.close") : localizes("sabbatical.cancel")}</Text>
                        </TouchableOpacity>
                        {parseItem.approvalStatus == approvalStatusType.WAITING_FOR_APPROVAL ? <TouchableOpacity block
                            activeOpacity={Constants.ACTIVE_OPACITY}
                            style={[commonStyles.buttonStyle]}
                            onPress={
                                () => {
                                    this.onEditData(contentValue);
                                }}>
                            <Text
                                style={[commonStyles.text, { marginVertical: 0, color: Colors.COLOR_WHITE }]} > {parseItem.approvalStatus == approvalStatusType.WAITING_FOR_APPROVAL && this.props.isApproved ? localizes("sabbatical.approval") : localizes("sabbatical.denied")}</Text>
                        </TouchableOpacity> : null}
                    </View>
                </View>
            </Modal>
        );
    }

    /**
     * Render date
     */
    renderDate = (offFromDate, offToDate) => {
        if (!Utils.isNull(offFromDate) && !Utils.isNull(offToDate)) {
            return (
                <Text style={[styles.text], { fontSize: Fonts.FONT_SIZE_MEDIUM }}>{"Từ " + offFromDate + " - " + offToDate}</Text>
            )
        } else if (!Utils.isNull(offFromDate) && Utils.isNull(offToDate)) {
            return (
                <Text style={[styles.text], { fontSize: Fonts.FONT_SIZE_MEDIUM }}>{"Ngày " + offFromDate}</Text>
            )
        }
    }

    /**
     * Get off type
     */
    getOffTypeString = (offType, workingTimeConfig) => {
        let string = "-";
        switch (offType) {
            case sabbaticalOffType.FULL_WORKING_DAY_1:
                string = "Ca sáng";
                break;
            case sabbaticalOffType.FULL_WORKING_DAY_2:
                string = "Ca chiều";
                break;
            case sabbaticalOffType.PARTLY_WORKING_DAY:
                string = "Cả ngày"
                break;
            default:
                break;
        }
        return string;
    }

    onChangeTextReason = (text) => {
        if (!Utils.isNull(text) || text.trim() != " " || this.state.textReason.length < 250) {
            this.setState({ textReason: text.trim(), isAlert: false });
        } else {
            this.setState({ isAlert: true });
        }
    }

    onEditData(contentValue) {
        if (contentValue.approvalStatus == approvalStatusType.WAITING_FOR_APPROVAL && this.props.isApproved) {
            this.props.approved(contentValue);
        } else if (Utils.isNull(this.state.textReason) || this.state.textReason.trim() == " ") {
            this.setState({ isAlert: true, showMessage: localizes("sabbatical.fillReasonDenied"), textReason: null });
        } else if (this.state.textReason.length > 250) {
            this.setState({ isAlert: true, showMessage: localizes("sabbatical.vali_reasonDenied") });
        } else if (!Utils.isNull(this.state.isAlert) && !this.state.isAlert) {
            this.props.denied(contentValue, this.state.textReason);
        }
    }

}