import {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import {Colors} from 'values/colors';

export class DateTimePickerCustom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: null,
            isDateTimePickerVisible: false,
        };
        this.chooseDate = props.chooseDate;
        this.show = false;
    }

    showDateTimePicker = () => this.setState({isDateTimePickerVisible: true});

    hideDateTimePicker = () => this.setState({isDateTimePickerVisible: false});

    handleDatePicked = datetime => {
        console.log('A date has been picked: ', datetime);
        this.setState(
            {
                selected: datetime,
            },
            () => this.onSaveChange(),
        );
        this.hideDateTimePicker();
    };

    render() {
        return (
            <View>
                <DateTimePicker
                    ref={'timePicker'}
                    isVisible={this.state.isDateTimePickerVisible}
                    onConfirm={this.handleDatePicked}
                    onCancel={this.hideDateTimePicker}
                    mode={'datetime'}
                    is24Hour={true}
                />
            </View>
        );
    }

    /**
     * Select day
     */
    onDaySelect(date) {
        this.setState({
            selected: date,
        });
    }

    /**
     * Save date choose dialog
     */
    onSaveChange() {
        this.chooseDate(this.state.selected ? this.state.selected : this.props.dateCurrent);
    }
}

const styles = StyleSheet.create({
    calendar: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#eee',
        height: 350,
    },
    text: {
        textAlign: 'center',
        padding: 10,
        fontWeight: 'bold',
        color: Colors.COLOR_WHITE,
    },
    barView: {
        backgroundColor: Colors.COLOR_ORANGE,
    },
    daySelectedText: {
        fontWeight: 'bold',
        backgroundColor: Colors.COLOR_ORANGE,
        color: Colors.COLOR_WHITE,
        borderRadius: 15,
        borderColor: 'transparent',
        overflow: 'hidden',
    },
});
