import React from "react-native";
import { Constants } from 'values/constants';
import { Colors } from 'values/colors';
import { Fonts } from 'values/fonts';
import commonStyles from "styles/commonStyles";

const { StyleSheet } = React;

const IMAGE_SIZE = 112; 

export default {
    container: {
        width: null,
        height: null,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: Colors.COLOR_BACKGROUND
    },
    imageHeader: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: Constants.MARGIN_XX_LARGE
    },
    avatar: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        borderRadius: IMAGE_SIZE / 2,
        borderWidth: Constants.BORDER_WIDTH,
        borderColor: Colors.COLOR_PRIMARY
    }
};
