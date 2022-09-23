import React from "react-native";
import { Constants } from 'values/constants';
import { Colors } from 'values/colors';
import { Fonts } from 'values/fonts'

const { StyleSheet } = React;

export default {
    container: {
        width: null,
        height: null,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: Colors.COLOR_BACKGROUND
    },

    buttonForgotPassword: {
        marginLeft: Constants.MARGIN_LOGIN,
        marginRight: Constants.MARGIN_LOGIN,
        marginBottom: Constants.MARGIN_LARGE,
    },
    inputForgotPassword: {
        height: '100%',
        textAlign: 'center',
        textAlignVertical: 'bottom',
        padding: Constants.PADDING,
        fontSize: Fonts.FONT_SIZE_X_MEDIUM,
    },
    buttonLogin: {
        marginBottom: 10,
        backgroundColor: Colors.COLOR_PRIMARY,
        borderRadius: 40,

    },
    staticComponent: {
        alignSelf: 'center',
        marginBottom: 20,
    },
    styleInput: {
        width: 52,
        textAlign: 'center',
        paddingHorizontal: 0
    },
    shadowOffset: {
        elevation: Constants.SHADOW,
        shadowOffset: {
            width: Constants.SHADOW_OFFSET_WIDTH,
            height: Constants.SHADOW_OFFSET_HEIGHT
        },
        shadowOpacity: Constants.SHADOW_OPACITY,
        shadowColor: Colors.COLOR_GREY,
    },
};
