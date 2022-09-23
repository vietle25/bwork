import React, { Component } from 'react';
import PropTypes from "prop-types";
import { View, Text } from 'react-native';
import DateUtil from 'utils/dateUtil';
import commonStyles from 'styles/commonStyles';
import { Colors } from 'values/colors';

class TimeCurrent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            curTime: props.curTime
        };
    }

    render() {
        const { curTime } = this.state;
        return (
            <View>
                <Text style={[commonStyles.text, { color: Colors.COLOR_RED_LIGHT }]}>{curTime}</Text>
            </View>
        );
    }

    async componentDidMount() {
        await setInterval(() => {
            this.setState({
                curTime: DateUtil.convertFromFormatToFormat(DateUtil.now(), DateUtil.FORMAT_DATE_TIME_ZONE_T, DateUtil.FORMAT_TIME_SECOND)
            })
        }, 1000);
    }
}

TimeCurrent.propTypes = {
    curTime: PropTypes.any
};

TimeCurrent.defaultProps = {
    curTime: DateUtil.convertFromFormatToFormat(DateUtil.now(), DateUtil.FORMAT_DATE_TIME_ZONE_T, DateUtil.FORMAT_TIME_SECOND)
};

export default TimeCurrent;
