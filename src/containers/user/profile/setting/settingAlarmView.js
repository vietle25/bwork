import BaseView from 'containers/base/baseView';
import {Container, Switch} from 'native-base';
import {BackHandler, Text, View} from 'react-native';
import commonStyles from 'styles/commonStyles';
import StorageUtil from 'utils/storageUtil';
import Utils from 'utils/utils';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';
import styles from './styles';

class SettingAlarmView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            isOn: true,
        };
        this.workingTimeConfig = ['1', '2', '3', '4'];
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        StorageUtil.retrieveItem(StorageUtil.ALARM)
            .then(alarm => {
                if (!Utils.isNull(alarm)) {
                    this.setState({
                        isOn: alarm.isOn,
                    });
                }
            })
            .catch(error => {});
    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    render() {
        const {isOn} = this.state;
        return (
            <Container style={styles.container}>
                <View style={{flex: 1}}>
                    <HStack style={[commonStyles.header]}>
                        {this.renderHeaderView({
                            title: `Cài đặt Alarm`,
                            titleStyle: {color: Colors.COLOR_WHITE},
                            renderRightMenu: this.renderRightHeader,
                        })}
                    </HStack>
                    <View
                        style={{
                            backgroundColor: Colors.COLOR_WHITE,
                            height: Constants.HEADER_HEIGHT,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingHorizontal: Constants.PADDING_X_LARGE,
                        }}>
                        <View>
                            <Text style={commonStyles.textBold}>{isOn ? 'Bật' : 'Tắt'}</Text>
                        </View>
                        <Switch value={isOn} onValueChange={this.onValueChange} />
                    </View>
                </View>
            </Container>
        );
    }

    /**
     * On change value
     */
    onValueChange = () => {
        const {isOn} = this.state;
        this.setState({
            isOn: !isOn,
        });
        let alarm = {
            isOn: !isOn,
        };
        global.toggleAlarm(alarm);
        StorageUtil.storeItem(StorageUtil.ALARM, alarm);
    };
}

export default SettingAlarmView;
