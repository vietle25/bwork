import React, { Component } from 'react';
import { View, Text, Image, BackHandler } from 'react-native';
import BaseView from 'containers/base/baseView';
import { Colors } from 'values/colors';
import { Fonts } from 'values/fonts';
import { Constants } from 'values/constants';
import commonStyles from 'styles/commonStyles';
//Icon Profile
import ic_user_black from "images/ic_user_black.png";
import Utils from 'utils/utils';

const WIDTH_HEIGHT = 14

class ProfileButton extends BaseView {
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
            this.props.navigation.navigate('Home')
        } else {
            return false
        }
        return true
    }

    render() {
        const { focused, navigation } = this.props;
        if (focused) {
            console.log("RENDER PROFILE BUTTON", navigation)
        }
        return (
            <View style={{ width: '100%', height: '100%' }}>
                <View style={[commonStyles.viewCenter, { flex: 1, padding: Constants.PADDING }]}>
                    <Image
                        style={{ tintColor: focused ? Colors.COLOR_PRIMARY : Colors.COLOR_TEXT }}
                        resizeMode={'contain'}
                        source={ic_user_black}
                        tintColor={focused ? Colors.COLOR_PRIMARY : Colors.COLOR_TEXT}
                    />
                    <Text style={[{
                        color: focused ? Colors.COLOR_PRIMARY : Colors.COLOR_DRK_GREY,
                        textAlign: 'center',
                        fontSize: Fonts.FONT_SIZE_X_SMALL
                    }]}>Tài khoản</Text>
                </View>
            </View>
        );
    }
}


export default ProfileButton
