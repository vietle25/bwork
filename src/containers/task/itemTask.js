import React, { PureComponent } from 'react';
import moment from 'moment';
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
import taskStatusType from 'enum/taskStatusType';
import Utils from 'utils/utils';
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger
} from "react-native-popup-menu";
import ic_calendar_sabbatical_green from "images/ic_calendar_sabbatical_green.png";
import ic_down_grey from "images/ic_down_grey.png";
import ic_check_green from "images/ic_check_green.png";
import ic_check_red from "images/ic_check_red.png";
import DateUtil from 'utils/dateUtil';
import Hr from 'components/hr';
import { Fonts } from 'values/fonts';
import { takeWhile } from 'rxjs/operators';

class ItemTask extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };

        this.menuOptions = [
            {
                name: "Đã hoàn thành",
                icon: ic_check_green,
                type: taskStatusType.COMPLETE,
                onPress: this.props.onEdit
            },
            {
                name: "Từ chối",
                icon: ic_check_red,
                type: taskStatusType.CANCEL,
                onPress: this.props.onEdit
            }
        ]
    }

    render() {
        const { item, index, lengthData, urlPathResize, urlPath, onPress, onEdit } = this.props;
        let parseItem = {
            name: item.name,
            fromDate: DateUtil.convertFromFormatToFormat(item.scheduledDate, DateUtil.FORMAT_DATE_SQL, DateUtil.FORMAT_DATE),
            nextToDate: Utils.isNull(item.nextScheduledDate) ? null : DateUtil.convertFromFormatToFormat(item.nextScheduledDate, DateUtil.FORMAT_DATE_SQL, DateUtil.FORMAT_DATE),
            scheduledTime: DateUtil.plusHourToString(item.scheduledTime, '00:00:00'),
            scheduledTimeEnd: !Utils.isNull(item.taskDurationMinute) ? item.taskDurationMinute + "p" : 'Không',
            createdAt: item.createdAt,
            taskStatus: item.taskStatus,
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
                                {this.renderDate(parseItem.fromDate)}
                            </View>
                            <TouchableOpacity
                                activeOpacity={Constants.ACTIVE_OPACITY}
                                onPress={() => parseItem.taskStatus == taskStatusType.NEW ? this.menuOption.open() : null}
                                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6.4 }}>
                                {this.renderTaskStatus(parseItem.taskStatus)}
                                <Image source={ic_down_grey} />
                                {this.renderMenuOption(item)}
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.borderLeft]}>
                            <View style={{ flex: 1 }}>
                                <Text numberOfLines={2} style={[styles.text, { marginTop: 0, flex: 1, marginRight: Constants.MARGIN_LARGE }]}>
                                    {"Bắt đầu: " + parseItem.scheduledTime}
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.borderLeft]}>
                            <View style={{ flex: 1 }}>
                                <Text numberOfLines={2} style={[styles.text, { flex: 1, marginRight: Constants.MARGIN_LARGE }]}>
                                    {"Thời hạn: " + parseItem.scheduledTimeEnd}
                                </Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Constants.MARGIN_LARGE, marginBottom: Constants.MARGIN }}>
                            <Text style={[styles.text, { margin: 0, fontSize: Fonts.FONT_SIZE_X_MEDIUM }]}>Công việc: </Text>
                            <Text numberOfLines={2} style={[commonStyles.textBold, { flex: 1, margin: 0 }]}>{parseItem.name}</Text>
                        </View>
                    </View>
                </View>
                <Hr color={Colors.COLOR_BACKGROUND} />
            </TouchableOpacity>
        );
    }

    /**
     * Render date
     */
    renderDate = (offFromDate) => {
        return (
            <Text style={[styles.text, commonStyles.textBold]}>{"Ngày " + offFromDate}</Text>
        )
    }

    /**
     * Render task status
     */
    renderTaskStatus = (taskStatus) => {
        let textTaskStatus = null;
        switch (taskStatus) {
            case taskStatusType.NEW:
                textTaskStatus = <Text style={[styles.text, { color: Colors.COLOR_LEVEL_GOLD }]}>{"Mới giao"}</Text>
                break;
            case taskStatusType.COMPLETE:
                textTaskStatus = <Text style={[styles.text, { color: Colors.COLOR_PRIMARY }]}>{"Đã hoàn thành"}</Text>
                break;
            case taskStatusType.CANCEL:
                textTaskStatus = <Text style={[styles.text, { color: Colors.COLOR_RED }]}>{"Đã hủy"}</Text>
                break;
            default:
                break;
        }
        return textTaskStatus;
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
                                onSelect={() => item.onPress(data, item.type)}>
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

export default ItemTask;
