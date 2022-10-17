import React from 'react-native';
import {Colors} from 'values/colors';

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
};
