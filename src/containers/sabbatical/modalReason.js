import React, {Component} from 'react';
import {
    ImageBackground,
    View,
    StatusBar,
    Image,
    ScrollView,
    TouchableWithoutFeedback,
    BackHandler,
    Alert,
    Linking,
    RefreshControl,
    StyleSheet,
    TextInput,
    Dimensions,
    FlatList,
    TouchableHighlight,
    TouchableOpacity,
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
import ic_next_white from 'images/ic_next_white.png';
import commonStyles from 'styles/commonStyles';
import BaseView from 'containers/base/baseView';
import TextInputCustom from 'components/textInputCustom';
import ModalDropdown from 'components/dropdown';
import I18n, {localizes} from 'locales/i18n';
import StringUtil from 'utils/stringUtil';
import {Fonts} from 'values/fonts';
import {months} from 'moment';
import FlatListCustom from 'components/flatListCustom';
import Modal from 'react-native-modalbox';
import moment from 'moment';
import DateUtil from 'utils/dateUtil';
import Hr from 'components/hr';
import Utils from 'utils/utils';

const screen = Dimensions.get('window');

export default class ModalReason extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
        };
    }

    componentDidUpdate = (prevProps, prevState) => {};

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
    showModal(data) {
        this.setState({
            data,
        });
        this.refs.modalReason.open();
    }

    /**
     * hide Modal Week
     */
    hideModal() {
        this.refs.modalReason.close();
    }

    componentWillUnmount = () => {};

    render() {
        const {data} = this.state;
        return (
            <Modal
                ref={'modalReason'}
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
                {!Utils.isNull(data) && (
                    <View
                        style={[
                            commonStyles.shadowOffset,
                            {
                                borderRadius: Constants.CORNER_RADIUS,
                                width: screen.width - Constants.MARGIN_X_LARGE * 2,
                                minHeight: screen.height / 2,
                                maxHeight: screen.height / 1.2,
                                backgroundColor: Colors.COLOR_WHITE,
                            },
                        ]}>
                        <Text style={[commonStyles.textBold, {textAlign: 'center', margin: Constants.MARGIN_X_LARGE}]}>
                            Lý do
                        </Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={[commonStyles.text, {flex: 1, marginHorizontal: Constants.MARGIN_X_LARGE}]}>
                                Lý do nghỉ: {data.offReason}
                            </Text>
                            {!Utils.isNull(data.deniedNote) && (
                                <Text
                                    style={[
                                        commonStyles.text,
                                        {flex: 1, color: Colors.COLOR_RED, marginHorizontal: Constants.MARGIN_X_LARGE},
                                    ]}>
                                    Lý do từ chối: {data.deniedNote}
                                </Text>
                            )}
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
                )}
            </Modal>
        );
    }
}
