import React, { Component } from "react";
// import { ImageBackground, View, StatusBar, Container, Button, H3, Text } from "react-native";
import {
    ImageBackground, View, StatusBar, Image, TouchableOpacity,
    BackHandler, Alert, Linking, StyleSheet, RefreshControl,
    TextInput, Dimensions, ScrollView, Keyboard, Platform, ActivityIndicator,
    FlatList, KeyboardAvoidingView
} from "react-native";
import {
    Container, Header, Title, Left, Icon, Right, Button, Body, Content, Text,
    Card, CardItem, Item, Input, Toast, Root, Col, Form
} from "native-base";
import BaseView from "containers/base/baseView";
import commonStyles from "styles/commonStyles";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import Utils from 'utils/utils'
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import DateUtil from "utils/dateUtil";
import styles from "./styles";
import ModalDropdown from 'components/dropdown';
import I18n, { localizes } from "locales/i18n";
import { Fonts } from "values/fonts";
import FlatListCustom from 'components/flatListCustom'
import StringUtil from "utils/stringUtil";
import { filter } from "rxjs/operators";
import moment from 'moment';
import GridView from 'components/gridView';
import StorageUtil from 'utils/storageUtil';
import { CalendarScreen } from "components/calendarScreen";
import statusType from "enum/statusType";
import screenType from "enum/screenType";
import ItemChat from "./chat/ItemChat";
const width = Dimensions.get('window').width
const height = Dimensions.get('window').height
import firebase from 'react-native-firebase';
import ImagePicker from 'react-native-image-crop-picker'
import { async } from "rxjs/internal/scheduler/async";


class TextInputSetState extends BaseView {

    constructor(props) {
        super(props)
        this.state = {
            stringSearch: null
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
        }
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        
    }

    render() {
        return (
            <TextInput
                style={[commonStyles.text, { margin: 0, padding: 0, borderRadius: 0, color: Colors.COLOR_WHITE }]}
                placeholder={"Tìm kiếm"}
                placeholderTextColor={Colors.COLOR_WHITE}
                ref={r => (this.stringSearch = r)}
                value={this.state.stringSearch}
                onChangeText={(text) => {
                    this.setState({
                        stringSearch: text
                    })
                    this.props.onChangeValue(text)
                }}
                keyboardType="default"
                underlineColorAndroid='transparent'
            />
        );
    }
}

export default (TextInputSetState);