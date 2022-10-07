import React from 'react-native';
import commonStyles from 'styles/commonStyles';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';

const {Dimensions, Platform} = React;
const window = Dimensions.get('window');
const {StyleSheet} = React;

export default {
    container: {
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
        paddingHorizontal: Constants.PADDING_X_LARGE,
    },
};
