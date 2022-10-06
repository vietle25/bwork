import React from 'react-native';
import commonStyles from 'styles/commonStyles';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';

const {Dimensions, Platform} = React;
const window = Dimensions.get('window');
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
    company: {
        ...commonStyles.viewHorizontal,
        alignItems: 'center',
        backgroundColor: Colors.COLOR_WHITE,
        height: Constants.HEADER_HEIGHT,
        marginBottom: Constants.MARGIN_LARGE,
        paddingHorizontal: Constants.PADDING_LARGE,
    },
    boxCheck: {
        ...commonStyles.viewCenter,
        backgroundColor: Colors.COLOR_WHITE,
        marginVertical: Constants.MARGIN_LARGE,
        padding: Constants.PADDING_X_LARGE,
    },
    boxDate: {
        flexDirection: 'row',
        paddingHorizontal: Constants.PADDING_X_LARGE + Constants.PADDING_LARGE,
        paddingVertical: Constants.PADDING,
    },
    boxProcess: {
        flex: 1,
        backgroundColor: Colors.COLOR_WHITE,
        marginBottom: Constants.MARGIN_LARGE,
        paddingHorizontal: Constants.PADDING_X_LARGE + Constants.PADDING_LARGE,
        paddingVertical: Constants.PADDING_X_LARGE,
    },
    buttonCheck: {
        ...commonStyles.viewCenter,
        width: 112,
        height: 112,
        borderRadius: 56,
        backgroundColor: Colors.COLOR_PRIMARY,
        marginVertical: Constants.MARGIN_X_LARGE,
    },
    textInCheck: {
        ...commonStyles.text,
        color: Colors.COLOR_WHITE,
    },
    textAddress: {
        ...commonStyles.text,
        textAlign: 'center',
        marginTop: Constants.MARGIN_X_LARGE,
    },
    textDay: {
        ...commonStyles.text,
        fontSize: 35,
        margin: 0,
    },
    imageSize: {
        width: Constants.HEADER_HEIGHT - Constants.MARGIN_LARGE,
        height: Constants.HEADER_HEIGHT - Constants.MARGIN_LARGE,
        marginHorizontal: Constants.MARGIN_LARGE,
        position: 'relative',
    },
    boxStatistical: {
        ...commonStyles.shadowOffset,
        ...commonStyles.viewCenter,
        margin: Constants.MARGIN_LARGE,
        width: window.width / 2 - (Constants.MARGIN_X_LARGE + Constants.MARGIN_LARGE),
        height: ((window.width / 2 - (Constants.MARGIN_X_LARGE + Constants.MARGIN_LARGE)) * 3) / 4,
        backgroundColor: Colors.COLOR_WHITE,
        borderRadius: Constants.CORNER_RADIUS * 2,
    },
};
