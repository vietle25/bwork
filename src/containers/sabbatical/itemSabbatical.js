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
import ic_pencil_green from "images/ic_pencil_green.png";
import ic_delete_red from "images/ic_delete_red.png";
import ic_calendar_sabbatical_green from "images/ic_calendar_sabbatical_green.png";
import sabbaticalOffType from 'enum/sabbaticalOffType';
import DateUtil from 'utils/dateUtil';
import Hr from 'components/hr';

class ItemSabbatical extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.menuOptions = [
            {
                name: "Chỉnh sửa",
                icon: ic_pencil_green,
                onPress: this.props.onEdit
            },
            {
                name: "Xóa",
                icon: ic_delete_red,
                onPress: this.props.onDelete
            }
        ]
    }

    render() {
        const { item, index, lengthData, urlPathResize, urlPath, onPress } = this.props;
        let parseItem = {
            offTypeString: this.getOffTypeString(item.offType, item.workingTimeConfig),
            offFromDate: DateUtil.convertFromFormatToFormat(item.offFromDate, DateUtil.FORMAT_DATE_SQL, DateUtil.FORMAT_DATE),
            offToDate: item.offToDate === item.offFromDate ? null : DateUtil.convertFromFormatToFormat(item.offToDate, DateUtil.FORMAT_DATE_SQL, DateUtil.FORMAT_DATE),
            offReason: item.offReason,
            deniedNote: item.deniedNote,
            createdAt: item.createdAt,
            approvalStatus: item.approvalStatus
        }
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                onPress={() => onPress(item)}
                style={[styles.boxView, { marginTop: index === 0 ? Constants.MARGIN_X_LARGE : 0 }]}>
                <View style={{ flexDirection: "row", marginBottom: Constants.MARGIN_LARGE, marginTop: Constants.MARGIN }}>
                    <Image source={ic_calendar_sabbatical_green} style={{ marginTop: Constants.MARGIN_LARGE + Constants.MARGIN, marginRight: Constants.MARGIN }} />
                    <View style={{ flex: 1 }}>
                        <View style={[commonStyles.viewSpaceBetween]}>
                            <View style={{ flex: 1 }}>
                                {this.renderDate(parseItem.offFromDate, parseItem.offToDate)}
                            </View>
                            <TouchableOpacity
                                activeOpacity={Constants.ACTIVE_OPACITY}
                                style={{
                                    padding: Constants.PADDING_LARGE,
                                    marginRight: -Constants.MARGIN_X_LARGE,
                                    opacity: item.approvalStatus != approvalStatusType.WAITING_FOR_APPROVAL ? 0 : 1
                                }}
                                onPress={() => this.menuOption.open()}
                                disabled={item.approvalStatus != approvalStatusType.WAITING_FOR_APPROVAL}>
                                <Image source={ic_menu_vertical_black} />
                                {this.renderMenuOption(item)}
                            </TouchableOpacity>
                        </View>
                        <View style={styles.borderLeft}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.text, { marginTop: 0 }]}>{"Ca nghỉ: " + parseItem.offTypeString}</Text>
                            </View>
                        </View>
                        <View style={[styles.borderLeft]}>
                            <View style={{ flex: 1 }}>
                                <Text numberOfLines={2} style={[styles.text, { flex: 1, marginRight: Constants.MARGIN_LARGE }]}>
                                    {"Lý do: " + parseItem.offReason}
                                </Text>
                            </View>
                        </View>
                        <View style={{ marginTop: Constants.MARGIN_LARGE }}>
                            {this.renderApprovalStatus(parseItem.approvalStatus, parseItem.deniedNote)}
                        </View>
                    </View>
                </View>
                <Hr />
            </TouchableOpacity>
        );
    }

    /**
     * Render date
     */
    renderDate = (offFromDate, offToDate) => {
        if (!Utils.isNull(offFromDate) && !Utils.isNull(offToDate)) {
            return (
                <Text style={[styles.text, commonStyles.textBold]}>{"Từ " + offFromDate + " đến " + offToDate}</Text>
            )
        } else if (!Utils.isNull(offFromDate) && Utils.isNull(offToDate)) {
            return (
                <Text style={[styles.text, commonStyles.textBold]}>{"Ngày " + offFromDate}</Text>
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

    /**
     * Render approval status
     */
    renderApprovalStatus = (approvalStatus, deniedNote) => {
        let textApprovalStatus = null;
        switch (approvalStatus) {
            case approvalStatusType.WAITING_FOR_APPROVAL:
                textApprovalStatus = <Text style={[styles.text, { color: Colors.COLOR_DRK_GREY }]}>{"Đang chờ duyệt"}</Text>
                break;
            case approvalStatusType.APPROVED:
                textApprovalStatus = <Text style={[styles.text, { color: Colors.COLOR_PRIMARY }]}>{"Đã được duyệt"}</Text>
                break;
            case approvalStatusType.DENIED:
                textApprovalStatus = <Text style={[styles.text, { color: Colors.COLOR_RED }]}>{"Bị từ chối: " + deniedNote}</Text>
                break;
            default:
                break;
        }
        return textApprovalStatus;
    }

    /**
     * Render menu option
     */
    renderMenuOption = (data) => {
        return (
            <Menu
                style={{}}
                ref={ref => (this.menuOption = ref)}>
                <MenuTrigger text="" />
                <MenuOptions>
                    {this.menuOptions.map((item, index) => {
                        return (
                            <MenuOption
                                key={index.toString()}
                                onSelect={() => item.onPress(data)}>
                                <View
                                    style={[commonStyles.viewHorizontal, {
                                        alignItems: "center",
                                        padding: Constants.MARGIN
                                    }]}>
                                    <Image source={item.icon} style={{ marginHorizontal: Constants.MARGIN }} />
                                    <Text numberOfLines={1} style={[commonStyles.text, { marginLeft: Constants.MARGIN_LARGE }]}>{item.name}</Text>
                                </View>
                            </MenuOption>
                        )
                    })}
                </MenuOptions>
            </Menu>
        );
    };
}

const styles = StyleSheet.create({
    boxView: {
        paddingHorizontal: Constants.PADDING_X_LARGE,
        backgroundColor: Colors.COLOR_WHITE
    },
    boxData: {
        ...commonStyles.viewCenter,
        flex: 1,
        paddingHorizontal: Constants.MARGIN_X_LARGE,
        marginBottom: Constants.MARGIN_LARGE * 3
    },
    text: {
        ...commonStyles.text,
        marginHorizontal: 0
    },
    borderLeft: {
        borderLeftWidth: Constants.BORDER_WIDTH + 0.5,
        paddingLeft: Constants.MARGIN_LARGE,
        borderColor: Colors.COLOR_PRIMARY
    }
});

export default ItemSabbatical;
