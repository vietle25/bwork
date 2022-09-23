import React, { PureComponent } from 'react'
import { Text, View, TouchableOpacity } from 'react-native'
import DateUtil from 'utils/dateUtil';
import styles from './styles';
import { Constants } from 'values/constants';
import { Colors } from 'values/colors';
import commonStyles from 'styles/commonStyles';

import moment from "moment";
import Hr from 'components/hr';
import Utils from 'utils/utils';
import { localizes } from 'locales/i18n';

export default class ItemTimekeepingHistory extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { data, item, index, onPressItem, screen } = this.props;
        let createdAt = DateUtil.convertFromFormatToFormat(item.createdAt, DateUtil.FORMAT_DATE_TIME_ZONE, DateUtil.FORMAT_DATE_SQL)
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                onPress={onPressItem}
            >
                <View style={[styles.boxItem, { justifyContent: 'flex-start', marginBottom: Constants.MARGIN_LARGE }]}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ height: "100%" }}>
                            <Text style={styles.textDay}>
                                {DateUtil.convertFromFormatToFormat(createdAt, DateUtil.FORMAT_DATE_SQL, DateUtil.FORMAT_DAY)}
                            </Text>
                        </View>
                        <View style={{ marginHorizontal: Constants.MARGIN_X_LARGE, height: "100%" }}>
                            <Text style={[commonStyles.text, { margin: 0 }]}>
                                {DateUtil.getDateOfWeek(createdAt)}
                            </Text>
                            <Text style={[commonStyles.text, { opacity: Constants.OPACITY_50, margin: 0 }]}>
                                Tháng {moment(createdAt).format("MM YYYY")}
                            </Text>
                        </View>
                    </View>
                    <Hr width={2} style={{ marginVertical: Constants.MARGIN }} color={Colors.COLOR_BACKGROUND} />
                    {/* <View style={[commonStyles.viewHorizontal]}>
                        <Text style={[commonStyles.text, { flex: 1, marginHorizontal: 0 }]}>{localizes("timekeepingHistory.planWorkingHours")}</Text>
                        <Text style={[commonStyles.text, { marginHorizontal: 0 }]}>
                            {DateUtil.parseMillisecondToHour(Math.round(item.planWorkingHours / 1000 / 60) * 1000 * 60)}
                        </Text>
                    </View> */}
                    <View style={[commonStyles.viewHorizontal]}>
                        <Text style={[commonStyles.text, { flex: 1, marginHorizontal: 0 }]}>{localizes("timekeepingHistory.workingHours")}</Text>
                        <Text style={[commonStyles.text, { marginHorizontal: 0 }]}>
                            {DateUtil.parseMillisecondToHour(Math.round(item.realWorkingHours / 1000 / 60) * 1000 * 60)}
                        </Text>
                    </View>
                    <View style={[commonStyles.viewHorizontal]}>
                        <Text style={[commonStyles.text, { flex: 1, marginHorizontal: 0 }]}>{localizes("timekeepingHistory.lackTime")}</Text>
                        <Text style={[commonStyles.text, { marginHorizontal: 0 }]}>
                            {DateUtil.parseMillisecondToHour(Math.round(item.deficientWorkingHours / 1000 / 60) * 1000 * 60)}
                        </Text>
                    </View>
                    <View style={[commonStyles.viewHorizontal]}>
                        <Text style={[commonStyles.text, { flex: 1, marginHorizontal: 0 }]}>{localizes("timekeepingHistory.lateWorkingHours")}</Text>
                        <Text style={[commonStyles.text, { marginHorizontal: 0 }]}>
                            {DateUtil.parseMillisecondToHour(Math.round(item.lateWorkingHours / 1000 / 60) * 1000 * 60)}
                        </Text>
                    </View>
                    <View style={[commonStyles.viewHorizontal]}>
                        <Text style={[commonStyles.text, { flex: 1, marginHorizontal: 0 }]}>{localizes("timekeepingHistory.checkIn")}</Text>
                        <Text style={[commonStyles.text, { marginHorizontal: 0 }]}>
                            {DateUtil.convertFromFormatToFormat(item.checkInTime, DateUtil.FORMAT_TIME_SECONDS, DateUtil.FORMAT_TIME)}
                        </Text>
                    </View>
                    <View style={[commonStyles.viewHorizontal]}>
                        <Text style={[commonStyles.text, { flex: 1, marginHorizontal: 0 }]}>{localizes("timekeepingHistory.checkOut")}</Text>
                        <Text style={[commonStyles.text, { marginHorizontal: 0 }]}>
                            {!Utils.isNull(item.checkOutTime)
                                ? DateUtil.convertFromFormatToFormat(item.checkOutTime, DateUtil.FORMAT_TIME_SECONDS, DateUtil.FORMAT_TIME)
                                : "Đang chờ"}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
}
