import BaseView from 'containers/base/baseView';
import {localizes} from 'locales/i18n';
import moment from 'moment';
import {Text} from 'native-base';
import {Dimensions, TouchableOpacity, View} from 'react-native';
import Modal from 'react-native-modalbox';
import commonStyles from 'styles/commonStyles';
import DateUtil from 'utils/dateUtil';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';

const screen = Dimensions.get('window');

export default class ModalConfigStaff extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            selected: 1,
        };
    }

    componentDidUpdate = (prevProps, prevState) => {};

    /**
     * Show Modal
     */
    showModal() {
        this.refs.modalConfigStaff.open();
    }

    /**
     * hide Modal
     */
    hideModal() {
        this.refs.modalConfigStaff.close();
    }

    componentWillUnmount = () => {};

    render() {
        const {selected} = this.state;
        let now = DateUtil.now();
        let validFrom = '';
        if (selected == 1) {
            validFrom = DateUtil.convertFromFormatToFormat(
                moment(now, 'DD-MM-YYYY').add(1, 'days'),
                DateUtil.FORMAT_DATE_TIME_ZONE_T,
                DateUtil.FORMAT_DATE_SQL,
            );
        } else {
            if (now.getMonth() == 11) {
                validFrom = DateUtil.convertFromFormatToFormat(
                    new Date(now.getFullYear() + 1, 0, 1),
                    DateUtil.FORMAT_DATE_TIME_ZONE_T,
                    DateUtil.FORMAT_DATE_SQL,
                );
            } else {
                validFrom = DateUtil.convertFromFormatToFormat(
                    new Date(now.getFullYear(), now.getMonth() + 1, 1),
                    DateUtil.FORMAT_DATE_TIME_ZONE_T,
                    DateUtil.FORMAT_DATE_SQL,
                );
            }
        }
        return (
            <Modal
                ref={'modalConfigStaff'}
                style={{
                    backgroundColor: '#00000000',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                backdrop={true}
                onClosed={() => {
                    this.hideModal();
                }}
                backButtonClose={true}
                swipeToClose={false}
                coverScreen={true}>
                <View
                    style={[
                        commonStyles.shadowOffset,
                        {
                            maxHeight: '90%',
                            width: screen.width - Constants.MARGIN_X_LARGE * 2,
                            borderRadius: Constants.CORNER_RADIUS,
                            backgroundColor: Colors.COLOR_WHITE,
                            padding: Constants.PADDING_LARGE,
                        },
                    ]}>
                    <Text style={[commonStyles.text, {margin: Constants.MARGIN_LARGE}]}>
                        {'Bạn muốn áp dụng thay đổi lương từ tháng này hay từ tháng sau?'.toUpperCase()}
                    </Text>
                    {/* <RadioGroup
                        style={{ flexDirection: "row", margin: Constants.MARGIN_X_LARGE }}
                        initialValue={1}
                        onValueChange={(selected) => {
                            this.setState({ selected })
                        }}> */}
                    {/* <RadioButton
                            color={Colors.COLOR_PRIMARY}
                            label={"Từ tháng này"}
                            value={1}
                            size={16}
                            labelStyle={{ marginRight: Constants.MARGIN_X_LARGE }}
                        />
                        <RadioButton
                            color={Colors.COLOR_PRIMARY}
                            label={"Từ tháng sau"}
                            value={2}
                            size={16}
                            labelStyle={{ marginRight: Constants.MARGIN_X_LARGE }}
                        /> */}
                    {/* </RadioGroup> */}
                    <Text style={[commonStyles.text, {margin: Constants.MARGIN_LARGE}]}>
                        Chú ý: Các cấu hình sẽ được áp dụng từ ngày: {validFrom}
                    </Text>
                    <View
                        style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: Constants.MARGIN_X_LARGE}}>
                        {/* Button skip */}
                        <View style={{marginVertical: Constants.MARGIN_LARGE}}>
                            <TouchableOpacity
                                activeOpacity={Constants.ACTIVE_OPACITY}
                                onPress={() => this.hideModal()}
                                style={{
                                    ...commonStyles.buttonStyle,
                                    backgroundColor: Colors.COLOR_WHITE,
                                    borderColor: Colors.COLOR_TEXT,
                                    borderWidth: Constants.BORDER_WIDTH,
                                    marginLeft: Constants.MARGIN_LARGE,
                                }}>
                                <Text style={[commonStyles.text, {marginVertical: -1}]}>{localizes('cancel')}</Text>
                            </TouchableOpacity>
                        </View>
                        {/* Button confirm */}
                        <View style={{marginVertical: Constants.MARGIN_LARGE}}>
                            <TouchableOpacity
                                activeOpacity={Constants.ACTIVE_OPACITY}
                                onPress={() => this.props.onConfirm(validFrom)}
                                style={{
                                    ...commonStyles.buttonStyle,
                                    marginHorizontal: Constants.MARGIN_LARGE,
                                }}>
                                <Text style={[commonStyles.text, {marginVertical: 0, color: Colors.COLOR_WHITE}]}>
                                    {localizes('confirm')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }
}
