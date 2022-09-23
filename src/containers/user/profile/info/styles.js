import React from "react-native";
import { Colors } from "values/colors";
import { Constants } from 'values/constants'
const { Dimensions, Platform } = React;
const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get('window').width;
const { StyleSheet } = React;

export default styles = {
    header_container: {
        justifyContent: 'flex-start', alignItems: 'center',
        backgroundColor: Colors.COLOR_PRIMARY
    },
    text_white: {
        color: 'white'
    },
    imageSize: {
        width: 112, height: 112,
        borderRadius: 56,
        position: 'relative'
    },

    tabs_container: {
        flexDirection: 'row'
    },
    tabs_child_active: {
        flex: 1, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: Colors.COLOR_PRIMARY,
        backgroundColor: Colors.COLOR_WHITE
    },
    tabs_child: {
        flex: 1, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: Colors.COLOR_TEXT,
        backgroundColor: Colors.COLOR_WHITE, paddingTop: Constants.MARGIN,
    },

    user_infomation_container: {

    },
    user_infomation: {
        paddingVertical: Constants.PADDING,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    title_iELTS_container: {
        padding: Constants.PADDING, alignItems: 'center', paddingBottom: 0
    },
    title_iELTS_text: {
        fontWeight: 'bold', color: Colors.COLOR_ORANGE
    },

    text_header_history: {
        paddingBottom: Constants.PADDING, alignItems: 'flex-end', paddingHorizontal: Constants.PADDING
    },
    text_history_container: {
        padding: Constants.PADDING_X_LARGE, flexDirection: 'row', flexWrap: 'wrap',
        justifyContent: 'space-between', backgroundColor: Colors.COLOR_GREY
    },
    text_center: {
        justifyContent: 'center'
    },
    text_bold_italic: {
        fontWeight: 'bold', fontStyle: 'italic'
    },

    //style from screen account infomation
    ai_container: {
        paddingVertical: Constants.PADDING_X_LARGE,
        paddingHorizontal: Constants.PADDING,
        flex: 1
    },
    container: {
        width: null,
        height: null,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: Colors.COLOR_BACKGROUND
    },
    ai_view_child: {
        flexDirection: 'row', paddingVertical: Constants.PADDING, justifyContent: 'space-between',
        alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.COLOR_GREY
    },
    ai_view_middle: {
        paddingVertical: Constants.PADDING,
        borderBottomWidth: 1, borderBottomColor: Colors.COLOR_GREY,
    },
    ai_view_last_child: {
        paddingVertical: Constants.PADDING, justifyContent: 'space-between', alignItems: 'center',
        flexDirection: 'row', paddingVertical: Constants.PADDING, justifyContent: 'space-between',
        borderBottomWidth: 1, borderBottomColor: Colors.COLOR_GREY
    },
    ai_image: {
        width: 20, height: 20, marginRight: Constants.MARGIN_X_LARGE, marginLeft: Constants.MARGIN_X_LARGE
    },
    ai_margin_zero: {
        marginLeft: 16, marginRight: 16
    },
    no_space: {
        margin: 0, marginRight: Constants.MARGIN_X_LARGE, padding: 0, paddingTop: Constants.PADDING, paddingBottom: Constants.PADDING,
        flex: 1, textAlign: 'right'
    },
    text_infor: {
        paddingTop: Constants.PADDING, paddingBottom: Constants.PADDING,
        marginLeft: 16
    },
    pieChartContainer: {
        flex: 0.6, paddingVertical: Constants.PADDING_LARGE, height: deviceWidth - 140, paddingHorizontal: Constants.PADDING_X_LARGE
    },
    txtInfo: {
        color: Colors.COLOR_PRIMARY,
        marginHorizontal: Constants.MARGIN_X_LARGE,
        borderBottomWidth: 0.8,
        borderColor: Colors.COLOR_GREY_LIGHT,
        marginBottom: Constants.MARGIN_X_LARGE,
        paddingBottom: Constants.PADDING_X_LARGE + Constants.PADDING,
    },
    btnChange: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginRight: Constants.MARGIN_X_LARGE
    },
    userInfo: {
		backgroundColor: Colors.COLOR_WHITE,
		marginBottom: Constants.MARGIN_X_LARGE,
        paddingHorizontal: Constants.PADDING_X_LARGE,
        paddingVertical: Constants.PADDING_LARGE
    },
    workingInfo: {
        backgroundColor: Colors.COLOR_WHITE,
		marginBottom: Constants.MARGIN_X_LARGE,
        paddingHorizontal: Constants.PADDING_X_LARGE,
        paddingVertical: Constants.PADDING_LARGE
	},
}