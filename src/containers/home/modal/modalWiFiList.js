import React, { Component } from "react";
import {
    ImageBackground, View, StatusBar, Image, TouchableOpacity, BackHandler, Alert, Linking,
    RefreshControl, StyleSheet, TextInput, Dimensions, FlatList, TouchableHighlight, Platform
} from "react-native";
import { Container, Header, Title, Left, Icon, Right, Button, Body, Content, Text, Card, CardItem, Form } from "native-base";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import commonStyles from "styles/commonStyles";
import BaseView from "containers/base/baseView"
import I18n, { localizes } from "locales/i18n";
import StringUtil from "utils/stringUtil";
import { Fonts } from "values/fonts";
import FlatListCustom from "components/flatListCustom";
import Modal from 'react-native-modal';
import DateUtil from "utils/dateUtil";
import Utils from "utils/utils";
import Hr from "components/hr";
import ic_cancel_black from "images/ic_cancel.png";

const screen = Dimensions.get("screen");
const deviceWidth = screen.width;
const deviceHeight = screen.height;
var marginHorizontal = Constants.MARGIN_X_LARGE;

export default class ModalWiFiList extends BaseView {

    constructor(props) {
        super(props)
        this.state = {

        };
    }

    componentDidUpdate = (prevProps, prevState) => {
    }

    componentWillMount = () => {
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
        }
    }

    /**
     * Handle data when request
     */
    handleData() { }

    componentWillUnmount = () => {
    }

    render() {
        const { isVisible, onBack, data } = this.props;
        return (
            <Modal
                style={{
                    backgroundColor: Colors.COLOR_TRANSPARENT,
                    margin: 0,
                    justifyContent: 'center'
                }}
                backdropOpacity={0.5}
                animationIn="zoomInDown"
                animationOut="zoomOutUp"
                animationInTiming={500}
                animationOutTiming={500}
                backdropTransitionInTiming={500}
                backdropTransitionOutTiming={500}
                isVisible={isVisible}
                onBackButtonPress={() => this.props.onBack()}
                useNativeDriver={true}
                coverScreen={true}
                deviceHeight={deviceHeight}
            >
                <View style={styles.container}>
                    <View style={[commonStyles.viewHorizontal, { flex: 0, alignItems: 'center' }]}>
                        <Text style={[commonStyles.text, {
                            flex: 1,
                            fontSize: Fonts.FONT_SIZE_X_MEDIUM,
                            margin: Constants.MARGIN_X_LARGE
                        }]}>Danh sách Wi-Fi được phép Checkin</Text>
                        <TouchableOpacity style={{ marginHorizontal: Constants.MARGIN_X_LARGE }}
                            onPress={() => this.props.onBack()}>
                            <Image source={ic_cancel_black} />
                        </TouchableOpacity>
                    </View>
                    <Hr width={2} style={{ marginHorizontal: Constants.MARGIN_X_LARGE }} color={Colors.COLOR_BACKGROUND} />
                    <FlatListCustom
                        contentContainerStyle={{
                            width: screen.width - Constants.MARGIN_XX_LARGE
                        }}
                        horizontal={false}
                        data={data}
                        itemPerCol={1}
                        renderItem={this.renderItem.bind(this)}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </Modal>
        );
    }

    /**
     * @param {*} item
     * @param {*} index
     * @param {*} indexInData
     * @param {*} parentIndex
     */
    renderItem(item, indexInData, parentIndex, index) {
        return (
            <View style={{ flex: 1, padding: Constants.PADDING_X_LARGE }}>
                <Text style={[commonStyles.text, { margin: 0 }]}>{item.wiFiName}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        ...commonStyles.shadowOffset,
        margin: marginHorizontal,
        borderRadius: Constants.CORNER_RADIUS,
        backgroundColor: Colors.COLOR_WHITE,
        maxHeight: "90%",
        minHeight: "40%"
    }
});