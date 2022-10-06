import BaseView from 'containers/base/baseView';
import statusType from 'enum/statusType';
import {localizes} from 'locales/i18n';
import {Text} from 'native-base';
import {Dimensions, TouchableOpacity, View} from 'react-native';
import Modal from 'react-native-modalbox';
import commonStyles from 'styles/commonStyles';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';

const screen = Dimensions.get('window');

export default class ModalConfigStaff extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            selected: statusType.SUSPENDED,
        };
    }

    componentDidUpdate = (prevProps, prevState) => {};

    /**
     * Show Modal
     */
    showModal() {
        this.refs.modalDeleteStaff.open();
    }

    /**
     * hide Modal
     */
    hideModal() {
        this.refs.modalDeleteStaff.close();
    }

    componentWillUnmount = () => {};

    render() {
        const {selected} = this.state;
        return (
            <Modal
                ref={'modalDeleteStaff'}
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
                        {'Bạn muốn xóa nhân viên tạm thời hay xóa vĩnh viễn?'.toUpperCase()}
                    </Text>
                    {/* <RadioGroup
                        style={{ flexDirection: "row", margin: Constants.MARGIN_X_LARGE }}
                        initialValue={selected}
                        onValueChange={(selected) => {
                            this.setState({ selected })
                        }}>
                        <RadioButton
                            color={Colors.COLOR_PRIMARY}
                            label={"Xóa tạm thời"}
                            value={statusType.SUSPENDED}
                            size={16}
                            labelStyle={{ marginRight: Constants.MARGIN_X_LARGE }}
                        />
                        <RadioButton
                            color={Colors.COLOR_PRIMARY}
                            label={"Xóa vĩnh viễn"}
                            value={statusType.DELETE}
                            size={16}
                            labelStyle={{ marginRight: Constants.MARGIN_X_LARGE }}
                        />
                    </RadioGroup> */}
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
                                onPress={() => this.props.onConfirm(selected)}
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
