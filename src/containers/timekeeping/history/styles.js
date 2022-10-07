import React from 'react-native';
import commonStyles from 'styles/commonStyles';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';

const {Dimensions, Platform} = React;
const deviceHeight = Dimensions.get('window').height;
const {StyleSheet} = React;

export default {
    container: {
        width: null,
        height: null,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: Colors.COLOR_BACKGROUND,
    },
    date: {
        ...commonStyles.viewHorizontal,
        alignItems: 'center',
        backgroundColor: Colors.COLOR_WHITE,
        height: Constants.HEADER_HEIGHT,
        marginBottom: Constants.MARGIN_LARGE,
        paddingHorizontal: Constants.PADDING_X_LARGE,
    },
    boxItem: {
        backgroundColor: Colors.COLOR_WHITE,
        marginVertical: Constants.MARGIN_LARGE,
        paddingHorizontal: Constants.PADDING_X_LARGE + Constants.PADDING_LARGE,
        paddingVertical: Constants.PADDING_X_LARGE,
    },
    textDay: {
        ...commonStyles.text,
        fontSize: 35,
        margin: 0,
    },
};
