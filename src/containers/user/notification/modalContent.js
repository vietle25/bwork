import Hr from 'components/hr';
import BaseView from 'containers/base/baseView';
import notificationType from 'enum/notificationType';
import {localizes} from 'locales/i18n';
import {Text} from 'native-base';
import {Dimensions, ScrollView, TouchableOpacity, View} from 'react-native';
import Modal from 'react-native-modalbox';
import commonStyles from 'styles/commonStyles';
import StringUtil from 'utils/stringUtil';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';
const screen = Dimensions.get('window');

export default class ModalContent extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            type: null,
            contentValue: null,
            titleValue: null,
        };
    }

    componentDidUpdate = (prevProps, prevState) => {};

    componentDidMount = () => {};

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    /**
     * Handle data when request
     */
    handleData() {}

    /**
     * Show Modal Week
     */
    showModal(contentValue, titleValue, type) {
        this.setState({
            type,
            contentValue,
            titleValue,
        });
        this.refs.modalContent.open();
    }

    /**
     * hide Modal Week
     */
    hideModal() {
        this.refs.modalContent.close();
    }

    componentWillUnmount = () => {};

    render() {
        return (
            <Modal
                ref={'modalContent'}
                style={{
                    backgroundColor: '#00000000',
                    width: screen.width,
                    height: screen.height,
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
                            borderRadius: Constants.CORNER_RADIUS,
                            width: screen.width - Constants.MARGIN_X_LARGE * 2,
                            minHeight: screen.height / 2,
                            maxHeight: screen.height / 1.2,
                            backgroundColor: Colors.COLOR_WHITE,
                            alignItems: 'center',
                        },
                    ]}>
                    <Text style={[commonStyles.textBold, {margin: Constants.MARGIN_X_LARGE}]}>
                        {this.state.type == notificationType.ORDER_NOTIFICATION
                            ? this.state.titleValue
                            : StringUtil.formatStringCashNoUnit(this.state.titleValue)}
                    </Text>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={[commonStyles.text, {flex: 1, marginHorizontal: Constants.MARGIN_X_LARGE}]}>
                            {this.state.contentValue}
                        </Text>
                    </ScrollView>
                    <View
                        style={{
                            width: '100%',
                            backgroundColor: Colors.COLOR_WHITE,
                            borderRadius: Constants.CORNER_RADIUS,
                        }}>
                        <Hr style={{marginHorizontal: Constants.MARGIN_X_LARGE}} color={Colors.COLOR_BACKGROUND} />
                        <TouchableOpacity onPress={() => this.hideModal()}>
                            <Text
                                style={[
                                    commonStyles.text,
                                    {
                                        marginVertical: Constants.MARGIN_X_LARGE,
                                        textAlign: 'center',
                                        color: Colors.COLOR_PRIMARY,
                                    },
                                ]}>
                                {localizes('close')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }
}
