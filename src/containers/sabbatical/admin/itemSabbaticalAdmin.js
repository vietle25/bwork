import React, { PureComponent } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image
} from 'react-native';
import { Colors } from 'values/colors';
import { Constants } from 'values/constants';
import commonStyles from 'styles/commonStyles';
import approvalStatusType from 'enum/approvalStatusType';
import Utils from 'utils/utils';
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger
} from "react-native-popup-menu";
import ic_menu_vertical_black from "images/ic_menu_vertical_black.png";
import ic_edit_black from "images/ic_edit_black.png";
import ic_remove_black from "images/ic_remove_black.png";
import ic_check_green from "images/ic_check_green.png";
import ic_check_red from "images/ic_check_red.png";
import sabbaticalOffType from 'enum/sabbaticalOffType';
import DateUtil from 'utils/dateUtil';
import { localizes } from 'locales/i18n';
import { Fonts } from "values/fonts";
import Hr from 'components/hr';
import ic_check_box_green from "images/ic_check_box_green.png";
import ic_close_red from "images/ic_close_red.png";

class ItemSabbaticalAdmin extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { item, index, onPress, onPressApproved, onPressDenied, lengthData } = this.props;
        let parseItem = {
            name: !Utils.isNull(item.userDTO) ? item.userDTO.name : "-",
            offTypeString: this.getOffTypeString(item.offType, item.workingTimeConfig),
            offFromDate: DateUtil.convertFromFormatToFormat(item.offFromDate, DateUtil.FORMAT_DATE_SQL, DateUtil.FORMAT_DATE),
            offToDate: item.offToDate === item.offFromDate ? null : DateUtil.convertFromFormatToFormat(item.offToDate, DateUtil.FORMAT_DATE_SQL, DateUtil.FORMAT_DATE),
            offReason: item.offReason,
            createdAt: item.createdAt,
            approvalStatus: item.approvalStatus
        }
        return (
            <View style={{ backgroundColor: Colors.COLOR_WHITE, marginTop: index === 0 ? 1 : 0 }}>
                <View style={[{
                    flexDirection: 'row',
                    marginHorizontal: Constants.MARGIN_X_LARGE
                }]}>
                    <TouchableOpacity
                        activeOpacity={Constants.ACTIVE_OPACITY}
                        style={[styles.boxView, { flex: 1 }]}
                        onPress={() => parseItem.approvalStatus != approvalStatusType.WAITING_FOR_APPROVAL ? onPress(item) : null}>
                        <View style={{ marginVertical: Constants.MARGIN }}>
                            <Text style={[commonStyles.textBold, { marginVertical: 0 }]}>{parseItem.name}</Text>
                        </View>
                        <View style={[commonStyles.viewSpaceBetween]}>
                            {this.renderDate(parseItem.offFromDate, parseItem.offToDate)}
                        </View>
                        <View>
                            <Text style={[styles.text]}>{localizes("sabbatical.shiftOffWork") + ": " + parseItem.offTypeString}</Text>
                        </View>
                        <View style={[commonStyles.viewSpaceBetween, { alignItems: "flex-end" }]}>
                            <Text numberOfLines={2} style={[styles.text, { flex: 1, marginRight: Constants.MARGIN_LARGE }]}>
                                {localizes("sabbatical.reason") + ": " + parseItem.offReason}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <View style={[{ width: '30%', alignItems: 'flex-end', justifyContent: 'center', backgroundColor: Colors.COLOR_WHITE }]}>
                        {this.renderApprovalStatus(parseItem.approvalStatus)}
                    </View>
                </View>
                {index != lengthData - 1 && <Hr style={{ marginHorizontal: Constants.MARGIN_X_LARGE }} />}
            </View>
        );
    }

    /**
     * Render date
     */
    renderDate = (offFromDate, offToDate) => {
        if (!Utils.isNull(offFromDate) && !Utils.isNull(offToDate)) {
            return (
                <Text style={[styles.text]}>{localizes("day.fromDay") + offFromDate + localizes("day.toDay") + offToDate}</Text>
            )
        } else if (!Utils.isNull(offFromDate) && Utils.isNull(offToDate)) {
            return (
                <Text style={[styles.text]}>{localizes("day.day") + offFromDate}</Text>
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
                string = localizes("sabbatical.morningWorkShift");
                break;
            case sabbaticalOffType.FULL_WORKING_DAY_2:
                string = localizes("sabbatical.afternoonWorkShift");
                break;
            case sabbaticalOffType.PARTLY_WORKING_DAY:
                string = localizes("sabbatical.allDay");
                break;
            default:
                break;
        }
        return string;
    }

    /**
     * Render approval status
     */
    renderApprovalStatus = (approvalStatus) => {
        const { item, onPressApproved, onPressDenied } = this.props;
        let textApprovalStatus = null;
        switch (approvalStatus) {
            case approvalStatusType.WAITING_FOR_APPROVAL:
                textApprovalStatus =
                    <View>
                        {/* Button approved */}
                        <View style={{ marginVertical: Constants.MARGIN_LARGE }}>
                            <TouchableOpacity
                                activeOpacity={Constants.ACTIVE_OPACITY}
                                onPress={() => { onPressApproved(item) }}
                                style={{
                                    // ...commonStyles.buttonStyle,
                                    // marginHorizontal: Constants.MARGIN_LARGE,
                                    // width: "100%"
                                }}>
                                {/* <Text
                                    style={[commonStyles.text, { marginVertical: 0, color: Colors.COLOR_WHITE }]}
                                >
                                    {localizes("sabbatical.approval")}
                                </Text> */}
                                <Image source={ic_check_box_green} />
                            </TouchableOpacity>
                        </View>
                        {/* Button denied */}
                        <View style={{ marginVertical: Constants.MARGIN_LARGE }}>
                            <TouchableOpacity
                                activeOpacity={Constants.ACTIVE_OPACITY}
                                onPress={() => { onPressDenied(item) }}
                                style={{
                                    // ...commonStyles.buttonStyle,
                                    // backgroundColor: Colors.COLOR_WHITE,
                                    // borderColor: Colors.COLOR_TEXT,
                                    // borderWidth: Constants.BORDER_WIDTH,
                                    // marginLeft: Constants.MARGIN_LARGE,
                                    // width: "100%"
                                }}>
                                {/* <Text style={[commonStyles.text, { marginVertical: 0 }]}>
                                    {localizes("sabbatical.denied")}
                                </Text> */}
                                <Image source={ic_close_red} />
                            </TouchableOpacity>
                        </View>
                    </View>
                break;
            case approvalStatusType.APPROVED:
                textApprovalStatus =
                    <View style={{ width: '30%', flexDirection: 'column', marginVertical: Constants.MARGIN_LARGE }}>
                        <Image source={ic_check_green} />
                    </View>
                break;
            case approvalStatusType.DENIED:
                textApprovalStatus =
                    <View style={{ width: '30%', flexDirection: 'column', marginVertical: Constants.MARGIN_LARGE }}>
                        <Image source={ic_check_red} />
                    </View>
                break;
            default:
                break;
        }
        return textApprovalStatus;
    }

}

const styles = StyleSheet.create({
    boxView: {
        paddingVertical: Constants.PADDING_LARGE,
        backgroundColor: Colors.COLOR_WHITE,
    },
    boxData: {
        ...commonStyles.viewCenter,
        flex: 1,
        paddingHorizontal: Constants.MARGIN_X_LARGE,
        marginBottom: Constants.MARGIN_LARGE * 3
    },
    text: {
        ...commonStyles.text
    }
});

export default ItemSabbaticalAdmin;
