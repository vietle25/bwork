import React, { Component } from 'react';
import { View, Image, BackHandler } from 'react-native';
import { Container, Header, Content, Badge, Text, Icon } from 'native-base';
import BaseView from 'containers/base/baseView';
import { Colors } from 'values/colors';
import { Fonts } from 'values/fonts';
import { Constants } from 'values/constants';
import commonStyles from 'styles/commonStyles';
import ic_chat_group_black from "images/ic_chat_group_black.png";
import * as actions from 'actions/userActions'
import { connect } from 'react-redux';
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import Utils from 'utils/utils';

const WIDTH = 28
const HEIGHT = 20

class ChatButton extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentWillMount() {
        this.props.countNewNotification()
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
            this.props.navigation.navigate('Home')
        } else {
            return false
        }
        return true
    }

    render() {
        const WIDTH = Utils.getLength(parseInt(global.badgeCount)) < 2 ? 20 : 28
        const HEIGHT = 20
        const RIGHT = 0
        const TOP = 0
        const { focused, navigation } = this.props;
        if (focused) {
            console.log("RENDER CHAT BUTTON", navigation)
            this.className = navigation.state.routeName
        }
        return (
            <View>
                <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Image
                        resizeMode={'contain'}
                        style={{ tintColor: focused ? Colors.COLOR_PRIMARY : Colors.COLOR_TEXT }}
                        source={ic_chat_group_black}
                        tintColor={focused ? Colors.COLOR_PRIMARY : Colors.COLOR_TEXT}
                    />
                    <Text style={[{
                        color: focused ? Colors.COLOR_PRIMARY : Colors.COLOR_DRK_GREY,
                        textAlign: 'center',
                        fontSize: Fonts.FONT_SIZE_X_SMALL
                    }]}>Tin nhắn</Text>
                </View>
                {
                    global.badgeCount > 0 && (
                        <View style={{
                            position: 'absolute',
                            right: RIGHT,
                            top: TOP,
                            height: HEIGHT,
                            width: WIDTH,
                            backgroundColor: Colors.COLOR_RED,
                            borderRadius: 10,
                            padding: Constants.PADDING,
                            borderColor: Colors.COLOR_WHITE,
                            borderWidth: 1,
                            ...commonStyles.viewCenter
                        }}>
                            <Text style={{
                                textAlign: 'center',
                                color: 'white',
                                fontSize: Fonts.FONT_SIZE_X_SMALL,
                            }}>{global.badgeCount}</Text>
                        </View>
                    )
                }
            </View>
        );
    }
}

const mapStateToProps = state => ({
    data: state.notifications.data,
    isLoading: state.notifications.isLoading,
    errorCode: state.notifications.errorCode,
    action: state.notifications.action
})

export default connect(mapStateToProps, actions)(ChatButton)
