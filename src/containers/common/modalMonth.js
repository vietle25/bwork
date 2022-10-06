import React, {Component} from 'react';
import {
    ImageBackground,
    View,
    StatusBar,
    Image,
    TouchableOpacity,
    BackHandler,
    Alert,
    Linking,
    RefreshControl,
    StyleSheet,
    TextInput,
    Dimensions,
    FlatList,
    TouchableHighlight,
    Platform,
} from 'react-native';
import {
    Container,
    Header,
    Title,
    Left,
    Icon,
    Right,
    Button,
    Body,
    Content,
    Text,
    Card,
    CardItem,
    Form,
} from 'native-base';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';
import commonStyles from 'styles/commonStyles';
import BaseView from 'containers/base/baseView';
import I18n, {localizes} from 'locales/i18n';
import StringUtil from 'utils/stringUtil';
import {Fonts} from 'values/fonts';
import FlatListCustom from 'components/flatListCustom';
import Modal from 'react-native-modal';
import DateUtil from 'utils/dateUtil';
import Utils from 'utils/utils';
import Hr from 'components/hr';
import ic_cancel_black from 'images/ic_cancel.png';
import MonthSelector from 'components/monthSelector';
import DaySelector from 'components/daySelector';
import moment from 'moment';

const screen = Dimensions.get('screen');

export default class ModalMonth extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            month: moment(),
            day: this.props.currentDay,
        };
    }

    componentDidUpdate = (prevProps, prevState) => {};

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
        }
    }

    /**
     * Handle data when request
     */
    handleData() {}

    componentWillUnmount = () => {};

    render() {
        const {isVisible, onBack, showMonth, days, showSelectAll} = this.props;
        return (
            <Modal
                style={[commonStyles.viewCenter, {margin: 0, paddingHorizontal: Constants.PADDING_X_LARGE}]}
                backdropOpacity={0.5}
                animationIn="zoomInDown"
                animationOut="zoomOutUp"
                animationInTiming={500}
                animationOutTiming={500}
                backdropTransitionInTiming={500}
                backdropTransitionOutTiming={500}
                isVisible={isVisible}
                onBackButtonPress={() => this.props.onBack()}
                deviceHeight={screen.height}>
                <View
                    style={{
                        position: 'absolute',
                        backgroundColor: Colors.COLOR_WHITE,
                        borderRadius: Constants.CORNER_RADIUS,
                        margin: Constants.MARGIN_X_LARGE,
                        paddingVertical: Constants.PADDING_LARGE,
                        width: '100%',
                    }}>
                    <View style={[commonStyles.viewHorizontal, {flex: 0, alignItems: 'center'}]}>
                        <Text
                            style={[
                                commonStyles.text,
                                {
                                    flex: 1,
                                    fontSize: Fonts.FONT_SIZE_X_MEDIUM,
                                    margin: Constants.MARGIN_X_LARGE,
                                },
                            ]}></Text>
                        <TouchableOpacity
                            style={{marginHorizontal: Constants.MARGIN_X_LARGE}}
                            onPress={() => this.props.onBack()}>
                            <Image source={ic_cancel_black} />
                        </TouchableOpacity>
                    </View>
                    {showMonth ? (
                        <MonthSelector
                            selectedDate={this.state.month}
                            initialView={this.state.month}
                            onMonthTapped={month => this.onSelectMonth(month)}
                            nextText="Sau"
                            prevText="Trước"
                        />
                    ) : (
                        <DaySelector
                            days={days}
                            currentDay={this.state.day}
                            onDayTapped={day => this.onSelectDay(day)}
                            showSelectAll={showSelectAll}
                        />
                    )}
                </View>
            </Modal>
        );
    }

    /**
     * On select month
     */
    onSelectMonth(month) {
        const {onSelectMonth, onBack, showSelectAll = true} = this.props;
        this.setState({
            month: month,
            day: showSelectAll ? 'All' : new Date(month),
        });
        onSelectMonth(month);
        onBack();
    }

    /**
     * On select day
     */
    onSelectDay(day) {
        const {onSelectDay, onBack} = this.props;
        this.setState({day: day});
        onSelectDay(day);
        onBack();
    }
}
