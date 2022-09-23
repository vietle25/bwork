import React, { Component } from 'react';
import { View, Image, BackHandler } from 'react-native';
import { Container, Header, Content, Badge, Text, Icon } from 'native-base';
import BaseView from 'containers/base/baseView';
import { Colors } from 'values/colors';
import { Fonts } from 'values/fonts';
import { Constants } from 'values/constants';
import commonStyles from 'styles/commonStyles';
//Icon Salary
import ic_metro_coins_gray from "images/ic_metro_coins_gray.png";
import * as actions from 'actions/userActions'
import { connect } from 'react-redux';
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import Utils from 'utils/utils';

const WIDTH = 28
const HEIGHT = 20

class ListStaffSalaryButton extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    /**
     * Handler back button
     */
    handlerBackButton() {
        const { focused, navigation } = this.props;
        console.log(this.className, 'back pressed')
        if (focused && navigation) {
            this.props.navigation.navigate('HomeAdmin')
        } else {
            return false
        }
        return true
    }

    render() {
        const { focused, navigation } = this.props;
        if (focused) {
            console.log("RENDER NOTIFICATION BUTTON", navigation)
            this.className = navigation.state.routeName
        }
        return (
            <View>
                <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Image
                        resizeMode={'contain'}
                        style={{ tintColor: focused ? Colors.COLOR_PRIMARY : Colors.COLOR_TEXT }}
                        source={ic_metro_coins_gray}
                        tintColor={focused ? Colors.COLOR_PRIMARY : Colors.COLOR_TEXT}
                    />
                    <Text style={[{
                        color: focused ? Colors.COLOR_PRIMARY : Colors.COLOR_DRK_GREY,
                        textAlign: 'center',
                        fontSize: Fonts.FONT_SIZE_X_SMALL
                    }]}>Lương</Text>
                </View>
            </View>
        );
    }
}

export default ListStaffSalaryButton;
