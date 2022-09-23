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
import Hr from 'components/hr';
import salaryDetailType from 'enum/salaryDetailType';
import StringUtil from 'utils/stringUtil';

const imageBonus = ic_notification_bonus
const imageFine = ic_notification_fine
const WAITING_BACKGROUND = 'rgb(252,232,225)'

class ItemSalary extends Component {

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
            item,
            index
        } = this.props
        let parseItem = {
            amount: item.amount,
            reason: item.reason,
            title: item.title,
            content: item.content,
            date: item.createAt,
            type: item.type
        }
        const uriImage = this.getUriImage(parseItem.type)

        const numberRow = 3;
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                style={{
                    marginVertical: Constants.MARGIN_LARGE,
                    padding: Constants.PADDING_X_LARGE,
                    backgroundColor: Colors.COLOR_WHITE
                }}
            >
                <View style={[commonStyles.viewHorizontal, { alignItems: 'center' }]}>
                    <View style={{
                        position: 'relative',
                        alignItems: 'center',
                        marginRight: Constants.MARGIN_X_LARGE
                    }} >
                        <Image
                            source={uriImage}
                            resizeMode={"cover"}
                        />
                    </View>

                    <View style={{ flex: 1 }} >
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }} >
                            <Text style={[!parseItem.isSeen ? commonStyles.text : commonStyles.textBold, { flex: 1, marginHorizontal: 0 }]}>
                                {parseItem.amount < 0 ? (parseItem.amount != 0 ? '- ' + StringUtil.formatStringCash(parseItem.amount * (-1)) : '0 VND') : StringUtil.formatStringCash(parseItem.amount)}
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
                            style={[!parseItem.isSeen ? commonStyles.text : commonStyles.textBold, {
                                padding: 0, margin: 0,
                                color: parseItem.isTemp ? Colors.COLOR_GRAY : Colors.COLOR_TEXT,
                                fontSize: parseItem.isTemp ? Fonts.FONT_SIZE_X_SMALL : Fonts.FONT_SIZE_MEDIUM
                            }]}>
                            {parseItem.reason}
                        </Text>

                    </View>

                </View>
            </TouchableOpacity>
        )
    }

    /**
     * Get uri image
     * @param {*} type 
     */
    getUriImage(type) {
        if (type == salaryDetailType.BONUS) {
            return imageBonus
        } else if (type == salaryDetailType.FINE) {
            return imageFine
        }
    }
}
export default ItemSalary