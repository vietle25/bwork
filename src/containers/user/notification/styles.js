import React from "react-native";
import { Colors } from "values/colors";
import { Constants } from 'values/constants'
const { Dimensions, Platform } = React;
const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get('window').width;
const { StyleSheet } = React;

export default styles = {
    container: {
        // width: null,
        // height: null,
        flex: 1,
        justifyContent: 'center',
        // alignItems: 'stretch',
        backgroundColor: Colors.COLOR_BACKGROUND
    }
}