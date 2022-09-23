import React from "react-native";
import { Constants } from 'values/constants';
import { Colors } from 'values/colors';
import { Fonts } from 'values/fonts'
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
    icon:{
        marginRight: Constants.MARGIN_X_LARGE,
        paddingBottom:4,
        resizeMode: 'contain'
        // backgroundColor:Colors.COLOR_DRK_GREY,
    },

    text: {
        ...commonStyles.text,
        flex:1,
        margin:0,
        fontSize:Fonts.FONT_SIZE_MEDIUM,
        textAlign:'left'
    },

    buttonSetting: {
        marginLeft: Constants.MARGIN_LOGIN,
        marginRight: Constants.MARGIN_LOGIN,
        marginBottom: Constants.MARGIN_LARGE,
    },
    inputSetting: {
        marginLeft: Constants.MARGIN_LOGIN,
        marginRight: Constants.MARGIN_LOGIN,
        marginBottom: Constants.MARGIN_LARGE
    },

    btnImage:
        {
            resizeMode: 'contain',
            height: '100%',
            width: '100%'
        },
    submit: {
        backgroundColor: '#fff',
        borderBottomColor: '#eeeeee',
        paddingTop: Constants.PADDING_X_LARGE,
        paddingBottom: Constants.PADDING_X_LARGE
    },
    child_submit:{
        flex: 1, alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: '#fff', 
        borderBottomColor: '#eeeeee',
        borderBottomWidth: 1, 
        justifyContent: 'flex-start',
        padding:16
    },
    btnChange:{
        flexDirection:'row',
        justifyContent:'flex-end',
        marginRight:Constants.MARGIN_X_LARGE
    },
    back: {
        backgroundColor: '#a1ff00',
        padding: 8,
        borderBottomColor: '#eeeeee', 
        borderRightColor:'#a1ff00'

    },

    textBold: {
        color: Colors.COLOR_TEXT,
        fontFamily: Fonts.FONT_BOLD,
        fontSize: Fonts.FONT_SIZE_MEDIUM,
        marginLeft: Constants.MARGIN,
        marginBottom: 4,
        fontWeight: 'bold'
    },

    title: {
        color: Colors.COLOR_TEXT,
        // fontFamily: Fonts.FONT_NORMAL,
        fontSize: Fonts.FONT_SIZE_LARGE,
    },

    imageIconStyle: {
        
        resizeMode: 'cover',
    },
    viewVi:{
        flexDirection:'row',paddingLeft:8,paddingRight:8,paddingTop:8,paddingBottom:8
    },
    textVi:{
        flex:1, justifyContent:'flex-start',alignItems:'flex-start'
    },
    radioCheck:{
        flex:1,justifyContent:'flex-end',alignItems:'flex-end'
    },
    inputText: {
        margin:0, marginBottom: 16,
        textAlignVertical: 'center',
        fontSize: Fonts.FONT_SIZE_XX_SMALL, 
        height: Constants.DIVIDE_HEIGHT_LARGE * 9,
        paddingLeft: Constants.PADDING_X_LARGE,
        borderWidth:1, 
        borderColor:'#ccc', 
        borderRadius:Constants.CORNER_RADIUS
    },
};
