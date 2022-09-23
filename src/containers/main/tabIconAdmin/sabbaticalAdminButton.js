import React, { Component } from "react";
import { View, Text, Image, BackHandler } from "react-native";
import BaseView from "containers/base/baseView";
import { Colors } from "values/colors";
import { Fonts } from "values/fonts";
import { Constants } from "values/constants";
import commonStyles from "styles/commonStyles";
import ic_listbox_gray from "images/ic_listbox_gray.png";

const WIDTH_HEIGHT = 14;

class SabbaticalAdminButton extends BaseView {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handlerBackButton);
    }

    /**
     * Handler back button
     */
    handlerBackButton() {
        const { focused, navigation } = this.props;
        console.log(this.className, "back pressed");
        if (focused && navigation) {
            this.props.navigation.navigate("HomeAdmin");
        } else {
            return false;
        }
        return true;
    }

    render() {
        const { focused, navigation } = this.props;
        return (
            <View style={{ width: '100%', height: '100%' }}>
                <View style={[commonStyles.viewCenter, { flex: 1, padding: Constants.PADDING_LARGE }]}>
                    <Image style={{ tintColor: focused ? Colors.COLOR_PRIMARY : Colors.COLOR_TEXT }}
                        resizeMode={"contain"}
                        source={ic_listbox_gray}
                        tintColor={focused ? Colors.COLOR_PRIMARY : Colors.COLOR_TEXT}
                    />
                    <Text style={[{
                        color: focused ? Colors.COLOR_PRIMARY : Colors.COLOR_DRK_GREY,
                        textAlign: 'center',
                        fontSize: Fonts.FONT_SIZE_X_SMALL
                    }]}>Xin phép</Text>
                </View>
            </View>
        );
    }
}

export default SabbaticalAdminButton;
