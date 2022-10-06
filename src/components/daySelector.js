import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Constants} from 'values/constants';
import {Colors} from 'values/colors';
import FlatListCustom from './flatListCustom';
import Hr from './hr';
import commonStyles from 'styles/commonStyles';
import DateUtil from 'utils/dateUtil';

class DaySelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentDay: props.currentDay,
        };
    }

    render() {
        const {showSelectAll, days} = this.props;
        return (
            <View>
                <Hr
                    width={2}
                    color={Colors.COLOR_BACKGROUND}
                    style={{marginVertical: Constants.MARGIN_LARGE, marginHorizontal: Constants.MARGIN_X_LARGE}}
                />
                <FlatListCustom
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{}}
                    horizontal={false}
                    data={showSelectAll ? ['All', ...days] : days}
                    itemPerRow={this.props.itemPerRow}
                    renderItem={this.renderItem.bind(this)}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        );
    }

    /**
     * @param {*} item
     * @param {*} index
     * @param {*} indexInData
     * @param {*} parentIndex
     */
    renderItem(item, indexInData, parentIndex, index) {
        const {currentDay} = this.state;
        let daySelect = DateUtil.convertFromFormatToFormat(
            currentDay,
            DateUtil.FORMAT_DATE_TIME_ZONE_T,
            DateUtil.FORMAT_DAY,
        );
        let day = DateUtil.convertFromFormatToFormat(item, DateUtil.FORMAT_DATE_TIME_ZONE_T, DateUtil.FORMAT_DAY);
        return (
            <TouchableOpacity
                key={index}
                style={{
                    ...commonStyles.viewCenter,
                    paddingVertical: Constants.PADDING_LARGE,
                }}
                onPress={() => this.handleDayTaps(item)}>
                <View style={[styles.dayStyle, {backgroundColor: daySelect === day ? '#000' : Colors.COLOR_WHITE}]}>
                    <Text
                        style={[
                            commonStyles.text,
                            {margin: 0, color: daySelect === day ? Colors.COLOR_WHITE : Colors.COLOR_TEXT},
                        ]}>
                        {item == 'All'
                            ? item
                            : DateUtil.convertFromFormatToFormat(
                                  item,
                                  DateUtil.FORMAT_DATE_TIME_ZONE_T,
                                  DateUtil.FORMAT_DAY,
                              )}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    /**
     * Handle day tap
     */
    handleDayTaps = day => {
        this.props.onDayTapped(day);
        this.setState({
            currentDay: day,
        });
    };
}

DaySelector.propTypes = {
    days: PropTypes.array.isRequired,
    itemPerRow: PropTypes.number,
    onDayTapped: PropTypes.func,
    currentDay: PropTypes.any,
    showSelectAll: PropTypes.bool,
};

DaySelector.defaultProps = {
    itemPerRow: 7,
    onDayTapped: day => {},
    currentDay: 'All',
    showSelectAll: true,
};

export default DaySelector;

const styles = StyleSheet.create({
    dayStyle: {
        height: 32,
        width: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
