import React from "react-native";
import { Constants } from 'values/constants';
import { Colors } from 'values/colors';
import { Fonts } from 'values/fonts';
import commonStyles from "styles/commonStyles";

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
    buttonLogin: {
        marginBottom: 15,
        backgroundColor: Colors.COLOR_PRIMARY,
        borderRadius: Constants.CORNER_RADIUS,
        paddingTop: Constants.PADDING_LARGE,
        paddingBottom: Constants.PADDING_LARGE,
    },
    images: {
        marginLeft: 8, marginRight: 8, marginTop: 8, marginBottom: 2,
        alignItems: 'flex-end',
        justifyContent: 'flex-end', alignSelf: 'flex-end'
    }
};
