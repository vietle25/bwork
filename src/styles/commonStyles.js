import React from "react-native";
import { Constants } from "values/constants";
import { Fonts } from "values/fonts";
import { Colors } from "values/colors";
const { StyleSheet } = React;
import { Platform } from "react-native";

export default {
    text: {
        color: Colors.COLOR_TEXT,
        fontSize: Fonts.FONT_SIZE_MEDIUM,
        margin: Constants.MARGIN,
        fontWeight: "normal"
    },
    textBold: {
        color: Colors.COLOR_TEXT,
        // fontFamily: Fonts.FONT_BOLD,
        fontSize: Fonts.FONT_SIZE_MEDIUM,
        margin: Constants.MARGIN,
        fontWeight: "bold"
    },
    textItalic: {
        color: Colors.COLOR_TEXT,
        // fontFamily: Fonts.FONT_ITALIC,
        fontSize: Fonts.FONT_SIZE_X_MEDIUM,
        margin: Constants.MARGIN,
        fontStyle: "italic"
    },
    textBoldItalic: {
        color: Colors.COLOR_TEXT,
        // fontFamily: Fonts.FONT_BOLD_ITALIC,
        fontSize: Fonts.FONT_SIZE_X_MEDIUM,
        margin: Constants.MARGIN,
        fontStyle: "italic"
    },
    title: {
        color: Colors.COLOR_TEXT,
        fontSize: Fonts.FONT_SIZE_X_MEDIUM,
        margin: Constants.MARGIN
    },
    titleTop: {
        color: Colors.COLOR_PRIMARY,
        fontSize: Fonts.FONT_SIZE_X_MEDIUM,
        marginVertical: Constants.MARGIN_X_LARGE
    },
    marginLeftRight: {
        marginLeft: Constants.MARGIN_X_LARGE,
        marginRight: Constants.MARGIN_X_LARGE
    },
    textSmall: {
        color: Colors.COLOR_TEXT,
        fontSize: Fonts.FONT_SIZE_X_SMALL,
        margin: Constants.MARGIN
    },
    textSmallBold: {
        color: Colors.COLOR_TEXT,
        fontSize: Fonts.FONT_SIZE_X_SMALL,
        margin: Constants.MARGIN,
        fontWeight: "bold"
    },
    textSmallItalic: {
        color: Colors.COLOR_TEXT,
        // fontFamily: Fonts.FONT_ITALIC,
        fontSize: Fonts.FONT_SIZE_X_SMALL,
        margin: Constants.MARGIN
    },
    fabBigSize: {
        width: Constants.BIG_CIRCLE,
        height: Constants.BIG_CIRCLE,
        borderRadius: Constants.BIG_CIRCLE,
        backgroundColor: Colors.COLOR_PRIMARY,
        margin: 0
    },
    viewCenter: {
        justifyContent: "center",
        alignItems: 'center'
    },
    viewHorizontal: {
        flex: 1,
        flexDirection: "row"
    },
    viewSpaceBetween: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    textOrange: {
        color: Colors.COLOR_PRIMARY,
        fontSize: Fonts.FONT_SIZE_MEDIUM,
        margin: Constants.MARGIN
    },
    textOrangeBold: {
        color: Colors.COLOR_PRIMARY,
        // fontFamily: Fonts.FONT_BOLD,
        fontSize: Fonts.FONT_SIZE_MEDIUM,
        margin: Constants.MARGIN,
        fontWeight: "bold"
    },
    textOrangeSmall: {
        color: Colors.COLOR_PRIMARY,
        fontSize: Fonts.FONT_SIZE_X_SMALL,
        margin: Constants.MARGIN
    },
    textOrangeSmallBold: {
        color: Colors.COLOR_PRIMARY,
        fontFamily: Fonts.FONT_BOLD,
        fontSize: Fonts.FONT_SIZE_X_SMALL,
        margin: Constants.MARGIN,
        fontWeight: "bold"
    },
    buttonStyle: {
        justifyContent: "center",
        alignItems: "center",
        borderRadius: Constants.CORNER_RADIUS,
        backgroundColor: Colors.COLOR_PRIMARY,
        padding: Constants.PADDING_LARGE + 2
    },

    buttonImage: {
        marginBottom: Constants.MARGIN_X_LARGE,
        backgroundColor: Colors.COLOR_PRIMARY,
        borderRadius: Constants.CORNER_RADIUS
    },

    header: {
        backgroundColor: Colors.COLOR_PRIMARY,
        borderBottomWidth: 0,
        elevation: 0
    },

    position0: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },

    pickerStyle: {
        flex: 1,
        alignContent: "center",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: "10%"
    },
    shadowOffset: {
        elevation: Constants.ELEVATION,
        shadowOffset: {
            width: Constants.SHADOW_OFFSET_WIDTH,
            height: Constants.SHADOW_OFFSET_HEIGHT
        },
        shadowOpacity: Constants.SHADOW_OPACITY,
        shadowColor: Colors.COLOR_GREY_LIGHT
    },
    viewCenter: {
        justifyContent: "center",
        alignItems: "center"
    },
    inputText: {
        paddingVertical: Constants.PADDING_LARGE,
        paddingHorizontal: Constants.PADDING_LARGE,
        margin: 0
    },
    touchInputSpecial: {
        flex: 1,
        flexDirection: "row",
        marginVertical: Constants.MARGIN_LARGE,
        marginHorizontal: Constants.MARGIN_X_LARGE,
        shadowOffset: {
            width: Constants.SHADOW_OFFSET_WIDTH,
            height: Constants.SHADOW_OFFSET_HEIGHT
        },
        shadowOpacity: Constants.SHADOW_OPACITY,
        shadowColor: Colors.COLOR_GREY_LIGHT,
        borderRadius: Constants.CORNER_RADIUS
    },
    textLarge: {
        color: Colors.COLOR_TEXT,
        fontSize: Fonts.FONT_SIZE_LARGE,
        margin: Constants.MARGIN
    },
    textLargeBold: {
        color: Colors.COLOR_TEXT,
        // fontFamily: Fonts.FONT_BOLD,
        fontSize: Fonts.FONT_SIZE_LARGE,
        margin: Constants.MARGIN,
        fontWeight: "bold"
    },
    textLargeItalic: {
        color: Colors.COLOR_TEXT,
        // fontFamily: Fonts.FONT_ITALIC,
        fontSize: Fonts.FONT_SIZE_LARGE,
        margin: Constants.MARGIN,
        fontStyle: "italic"
    },
    textLargeBoldItalic: {
        color: Colors.COLOR_TEXT,
        // fontFamily: Fonts.FONT_BOLD_ITALIC,
        fontSize: Fonts.FONT_SIZE_LARGE,
        margin: Constants.MARGIN,
        fontStyle: "italic"
    }
};
