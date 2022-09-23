import React from "react-native";
import { Colors } from "values/colors";
import { Constants } from 'values/constants';
import { Fonts } from "values/fonts";
import { CheckBox } from "native-base";
import commonStyles from "styles/commonStyles";
const { Dimensions, Platform } = React;
const { StyleSheet } = React;
const window = Dimensions.get('window');

const SIZE_ICON = 40;

export default {
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: Colors.COLOR_BACKGROUND
    },
    header: {
        justifyContent: 'flex-start', alignItems: 'center', backgroundColor: Colors.COLOR_PRIMARY, paddingLeft: Constants.PADDING_X_LARGE, borderBottomWidth: 0  
    }, title: {
        color: 'white'
    },
    input: {
        height: '100%',
        textAlignVertical: 'bottom',
        marginHorizontal: -5
    },
    item: {
        alignItems: 'center',
        marginVertical: Constants.PADDING_X_LARGE,
        paddingHorizontal: Constants.PADDING_LARGE,
    },
    name: {
        fontSize: Fonts.FONT_SIZE_X_MEDIUM,
        margin: 0
    },
    price: {
        fontSize: Fonts.FONT_SIZE_X_LARGE,
        color: Colors.COLOR_PRIMARY,
        margin: 0
    },
    checkBox: {
        backgroundColor: Colors.COLOR_WHITE,
        borderWidth: 0,
        padding: 0,
    },
    listPriceContainer: {
        flex: 1,
        paddingHorizontal: Constants.PADDING_X_LARGE,
        backgroundColor: Colors.COLOR_WHITE,
        padding: Constants.PADDING_X_LARGE * 2
    },
    iconNewConversation: {
        ...commonStyles.viewCenter,
        position: "absolute",
        bottom: Constants.MARGIN_X_LARGE,
        right: Constants.MARGIN_X_LARGE,
    },
    btnDeleteImage: {
        position: 'absolute',     
        borderRadius: Constants.CORNER_RADIUS * 2,
        top: - Constants.MARGIN * 2,
        right: - Constants.MARGIN * 2,
    },
    itemImageContainer: { 
        position: 'relative',  
        marginVertical: Constants.PADDING_X_LARGE,
        marginHorizontal: Constants.MARGIN_LARGE,
        borderWidth: 1, 
        borderColor: Colors.COLOR_GREY_LIGHT, 
        borderRadius: Constants.CORNER_RADIUS / 2 
    },
    dockSendMess: {
        justifyContent: 'center',
        borderTopLeftRadius: Constants.CORNER_RADIUS,
        borderTopRightRadius: Constants.CORNER_RADIUS,
        backgroundColor: Colors.COLOR_GREY,
    },
    flatListSendImages: {
        height: 180 + Constants.MARGIN_XX_LARGE,
        borderTopLeftRadius: Constants.CORNER_RADIUS,
        borderTopRightRadius: Constants.CORNER_RADIUS,
        backgroundColor: Colors.COLOR_GREY
    },
    imageSize: {
        width: 112, height: 112,
        borderRadius: 56,
        position: 'relative'
    },
    searchBar: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.COLOR_GREY_LIGHT,
        margin: Constants.MARGIN_LARGE,
        borderRadius: Constants.CORNER_RADIUS * 6
    },
};