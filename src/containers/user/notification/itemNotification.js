'use strict';
import React, { Component } from 'react';
import {
    ImageBackground, View, StatusBar, TextInput,
    ScrollView, TouchableOpacity, Modal, Image, Dimensions, FlatList, ActivityIndicator, Alert
} from "react-native";
import {
    Root, Form, Textarea, Container, Header, Title, Left, Icon, Right,
    Button, Body, Content, Text, Card, CardItem,
    Fab, Footer, Input, Item, Toast, ActionSheet,
} from "native-base";
import commonStyles from "styles/commonStyles";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import { Fonts } from "values/fonts";
import { localizes } from 'locales/i18n';
import BaseView from 'containers/base/baseView';
import DateUtil from 'utils/dateUtil';
import Utils from 'utils/utils';
import notificationType from 'enum/notificationType';
import ic_notification_bonus from "images/ic_notification_bonus.png";
import ic_notification_fine from "images/ic_notification_fine.png";
import ic_notification_task from "images/ic_notification_task.png";
import ic_logo from "images/ic_logo.png";
import Hr from 'components/hr';
import StringUtil from 'utils/stringUtil';

const imageBonus = ic_notification_bonus;
const imageFine = ic_notification_fine;
const imageTask = ic_notification_task;
const imageGeneral = ic_logo;
const WAITING_BACKGROUND = 'rgb(252,232,225)';

class ItemNotification extends Component {

    constructor(props) {
        super(props)
        this.W_H_SEEN = 8
        this.RADIUS = 4
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props != nextProps) {
            this.props = nextProps
        }
    }


    render() {
        const {
            data,
            item,
            index,
            onPressItem
        } = this.props
        let parseItem = {
            title: item.title,
            content: item.content,
            date: item.createdAt,
            showDate: item.showDate,
            isSeen: item.seen,
            image: item.image,
            type: item.type,
            isTemp: item.isTemp
        }
        const uriImage = this.getUriImage(parseItem.type)
        const numberRow = 3;
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                style={{
                    paddingHorizontal: Constants.PADDING_X_LARGE,
                    backgroundColor: Colors.COLOR_WHITE
                }}
                onPress={() => onPressItem()}>
                <View style={[commonStyles.viewHorizontal, { alignItems: 'flex-start', paddingVertical: Constants.PADDING_X_LARGE }]}>
                    <View style={{
                        position: 'relative',
                        alignItems: 'center',
                        marginRight: Constants.MARGIN_X_LARGE
                    }} >
                        {parseItem.type == notificationType.ORDER_NOTIFICATION
                            ?
                            <View style={[commonStyles.viewCenter, {
                                width: 48, height: 48, backgroundColor: Colors.COLOR_PRIMARY, borderRadius: 48 / 2
                            }]}>
                                <Text style={[commonStyles.textBold, { color: Colors.COLOR_WHITE }]}>H</Text>
                            </View>
                            :
                            <Image
                                source={uriImage}
                                resizeMode={"cover"}
                            />
                        }
                    </View>
                    <View style={{ flex: 1 }} >
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }} >
                            <Text style={[!parseItem.isSeen ? commonStyles.textBold : commonStyles.text, { flex: 1, marginHorizontal: 0, marginTop: 0 }]}>
                                {parseItem.type == notificationType.ORDER_NOTIFICATION || parseItem.type == notificationType.TASK_NOTIFICATION
                                    ? parseItem.title
                                    : StringUtil.formatStringCashNoUnit(parseItem.title)}
                            </Text>
                            {
                                <Text style={[commonStyles.text, {
                                    fontSize: Fonts.FONT_SIZE_X_SMALL + 1,
                                    padding: 0,
                                    margin: 0,
                                    marginTop: Constants.MARGIN,
                                    opacity: 0.5
                                }]}>
                                    {DateUtil.timeAgo(parseItem.date)}
                                </Text>
                            }
                        </View>
                        <Text
                            numberOfLines={numberRow}
                            ellipsizeMode={'tail'}
                            style={[!parseItem.isSeen ? commonStyles.textBold : commonStyles.text, {
                                padding: 0, margin: 0,
                                color: parseItem.isTemp ? Colors.COLOR_GRAY : Colors.COLOR_TEXT,
                                fontSize: parseItem.isTemp ? Fonts.FONT_SIZE_X_SMALL : Fonts.FONT_SIZE_MEDIUM
                            }]}>
                            {parseItem.content}
                        </Text>
                    </View>
                </View>
                {
                    !parseItem.isSeen ?
                        <View style={{
                            position: 'absolute',
                            bottom: Constants.PADDING_LARGE,
                            right: 0,
                            marginHorizontal: Constants.MARGIN_LARGE,
                            backgroundColor: Colors.COLOR_RED_LIGHT,
                            height: this.W_H_SEEN,
                            width: this.W_H_SEEN,
                            borderRadius: this.RADIUS
                        }} />
                        : null
                }
                {index != data.length - 1 && <Hr />}
            </TouchableOpacity>
        )
    }

    /**
     * Get uri image
     * @param {*} type 
     */
    getUriImage(type) {
        if (type == notificationType.BONUS_NOTIFICATION) {
            return imageBonus
        } else if (type == notificationType.FINE_NOTIFICATION) {
            return imageFine
        } else if (type == notificationType.TASK_NOTIFICATION) {
            return imageTask
        }
    }
}
export default ItemNotification;