import React, { PureComponent } from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet,
    Dimensions, Modal, BackHandler
} from 'react-native';
import { Constants } from 'values/constants';
import commonStyles from 'styles/commonStyles';
import { Fonts } from 'values/fonts';
import { Colors } from 'values/colors';
import StringUtil from 'utils/stringUtil';
import I18n from 'locales/i18n';
import StorageUtil from 'utils/storageUtil';
import Utils from 'utils/utils';
import statusType from 'enum/statusType';
import FlatListCustom from 'components/flatListCustom';
import ImageViewer from 'react-native-image-zoom-viewer';
import DateUtil from 'utils/dateUtil';
import moment from 'moment';
import firebase from 'react-native-firebase';
import ImageLoader from 'components/imageLoader';
import BackgroundShadow from 'components/backgroundShadow';
import messageType from 'enum/messageType';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const PADDING_BUTTON = Constants.PADDING_X_LARGE - 4;

class ItemChat extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
        };
        this.imageUrls = [];
        this.W_H_SPECIAL = 36;
        this.actionValue = {
            WAITING_FOR_USER_ACTION: 0,
            ACCEPTED: 1,
            DENIED: 2
        };
        this.maxImage = 4;
    }

    UNSAFE_componentWillReceiveProps = (nextProps) => {
        if (this.props != nextProps) {
            this.props = nextProps
        }
    }

    /**
     * Open modal display images
     */
    toggleModal() {
        this.setState({
            isModalOpened: !this.state.isModalOpened,
        })
    }

    render() {
        const { data, index, userAdminId, onPressSendAction, resourceUrlPath, resource } = this.props;
        let parseItem = {
            conversationId: data.conversationId,
            key: data.key,
            from: data.fromUserId,
            content: data.message,
            createdAt: data.timestamp,
            isShowAvatar: data.isShowAvatar,
            isShowDate: data.isShowDate,
            avatar: !Utils.isNull(data.avatar) ? data.avatar : "",
            messageType: data.messageType,
            receiverResourceAction: data.receiverResourceAction,
            tokenImage: data.tokenImage,
            sending: data.sending
        }
        const date = new Date(parseInt(parseItem.createdAt))
        this.hours = date.getHours()
        this.minutes = date.getMinutes()
        this.year = date.getFullYear()
        this.month = date.getMonth() + 1
        this.day = date.getDate()
        this.time = this.year + "/" + this.month + "/" + this.day;
        this.imageUrls = []
        if (parseItem.messageType == messageType.IMAGE) {
            String(parseItem.content).split(',').forEach(pathImage => {
                let hasHttp = !Utils.isNull(pathImage) && pathImage.indexOf('http') != -1;
                let image = hasHttp ? pathImage : resourceUrlPath + "=" + global.companyIdAlias + "/" + pathImage + '&token=' + parseItem.tokenImage + "&op=resize&w=" + Math.ceil(width * 1.5);
                this.imageUrls.push({ path: image })
            });
        }
        return (
            <View style={{ flex: 1 }}>
                {
                    parseItem.isShowDate ?
                        <View style={{ alignItems: 'center', marginVertical: Constants.MARGIN_LARGE }} >
                            <Text style={[commonStyles.textSmall]} >
                                {DateUtil.timeAgoMessage(DateUtil.convertFromFormatToFormat(
                                    this.time, DateUtil.FORMAT_DATE_TIME_SQL,
                                    DateUtil.FORMAT_DATE_TIME_ZONE_T
                                ))}
                            </Text>
                        </View>
                        : null
                }
                {
                    parseItem.messageType == messageType.INVITE_STATUS ?
                        <View style={{ alignItems: 'center', marginVertical: Constants.MARGIN_LARGE }} >
                            <Text style={[commonStyles.textSmall, { fontWeight: "bold", textAlign: 'center' }]} >
                                {parseItem.content}
                            </Text>
                        </View>
                        : null
                }
                {parseItem.messageType == messageType.NORMAL && this.renderItemChat(parseItem)}
                {parseItem.messageType == messageType.IMAGE && this.renderListImage(parseItem)}
            </View>
        );
    }

    /**
     * Render list image
     */
    renderListImage = (parseItem) => {
        return (
            <View style={[{
                flex: 1,
                marginBottom: Constants.MARGIN_LARGE
            }]}>
                <View style={[commonStyles.viewHorizontal, {
                    justifyContent: parseItem.from !== this.props.userId ? 'flex-start' : 'flex-end',
                    alignItems: "flex-end",
                }]}>
                    {this.renderAvatar(parseItem)}
                    <FlatListCustom
                        contentContainerStyle={{ flex: 1 }}
                        style={{ width: (width / 4) * 2 }}
                        horizontal={false}
                        data={this.imageUrls}
                        itemPerRow={2}
                        renderItem={this.renderItemImage}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
                {/* {parseItem.from == userAdminId && this.renderAcceptImage(parseItem)} */}
            </View>
        )
    }

    /**
     * Render accept image 
     */
    renderAcceptImage = (parseItem) => {
        return (
            <View style={[commonStyles.viewHorizontal, {
                flex: 0,
                borderRadius: Constants.CORNER_RADIUS,
                backgroundColor: Colors.COLOR_WHITE,
            }]}>
                {/* {
                    Utils.isNull(parseItem.receiverResourceAction) || parseItem.receiverResourceAction == this.actionValue.WAITING_FOR_USER_ACTION ?
                        <View style={[commonStyles.viewHorizontal, { flex: 0 }]} >
                            <TouchableOpacity
                                onPress={() => {
                                    onPressSendAction(this.actionValue.DENIED, parseItem.conversationId, parseItem.key)
                                }}
                                style={[styles.buttonSpecial, {
                                    borderBottomRightRadius: 0,
                                    borderTopRightRadius: 0
                                }]}>
                                <Text style={commonStyles.text} >TỪ CHỐI</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    onPressSendAction(this.actionValue.ACCEPTED, parseItem.conversationId, parseItem.key)
                                }}
                                style={[styles.buttonSpecial, {
                                    borderBottomLeftRadius: 0,
                                    borderTopLeftRadius: 0
                                }]}>
                                <Text style={commonStyles.text} >ÐỒNG Ý</Text>
                            </TouchableOpacity>
                        </View>
                        : <View>
                            {
                                parseItem.receiverResourceAction === this.actionValue.DENIED ?
                                    <Text style={[commonStyles.textSmall, { marginVertical: Constants.MARGIN_LARGE }]} >BẠN ÐÃ TỪ CHỐI</Text>
                                    : <Text style={[commonStyles.textSmall, { marginVertical: Constants.MARGIN_LARGE }]} >BẠN ÐÃ ÐỒNG Ý</Text>
                            }
                        </View>
                } */}
            </View>
        )
    }

    /**
     * Render item chat
     */
    renderItemChat = (parseItem) => {
        return (
            <View style={[commonStyles.viewHorizontal, {
                flex: 0,
                marginBottom: Constants.MARGIN_LARGE,
                justifyContent: parseItem.from !== this.props.userId ? 'flex-start' : 'flex-end',
                alignItems: 'center',
            }]} >
                {
                    parseItem.sending == 0
                        ? <Text style={[commonStyles.textSmall, { color: Colors.COLOR_DRK_GREY }]} >Đang gửi...</Text>
                        : null
                }
                <View style={[commonStyles.viewHorizontal, { flex: 0, alignItems: "flex-end" }]} >
                    {this.renderAvatar(parseItem)}
                    <View style={[parseItem.from !== this.props.userId ? styles.member : styles.user]} >
                        <Text style={[commonStyles.textSmall, { maxWidth: width * 0.65, color: parseItem.from !== this.props.userId ? Colors.COLOR_TEXT : Colors.COLOR_WHITE }]}>
                            {Utils.parseEmojis(parseItem.content)}
                        </Text>
                        <Text style={[commonStyles.textSmall, { color: parseItem.from !== this.props.userId ? Colors.COLOR_PLACEHOLDER_TEXT_DISABLE : Colors.COLOR_WHITE, fontSize: Fonts.FONT_SIZE_X_SMALL }]}>
                            {this.hours < 10 ? `0${this.hours}` : this.hours}:{this.minutes < 10 ? `0${this.minutes}` : this.minutes}
                        </Text>
                    </View>
                </View>
            </View>
        )
    }

    /**
     * Render avatar
     */
    renderAvatar = (parseItem) => {
        const { resourceUrlPath } = this.props;
        let hasHttp = !Utils.isNull(parseItem.avatar) && parseItem.avatar.indexOf('http') != -1;
        let image = hasHttp ? parseItem.avatar : resourceUrlPath + "=" + global.companyIdAlias + "/" + parseItem.avatar;
        return (
            <View>
                {
                    parseItem.from !== this.props.userId && parseItem.isShowAvatar ?
                        <View style={{
                            width: this.W_H_SPECIAL,
                            height: this.W_H_SPECIAL,
                            borderRadius: this.W_H_SPECIAL / 2,
                            overflow: 'hidden',
                            marginRight: Constants.MARGIN_LARGE
                        }} >
                            <ImageLoader
                                style={{
                                    width: this.W_H_SPECIAL,
                                    height: this.W_H_SPECIAL,
                                    borderRadius: this.W_H_SPECIAL / 2
                                }}
                                resizeAtt={hasHttp ? null : {
                                    type: 'thumbnail', width: width * 0.18, height: height * 0.18
                                }}
                                resizeModeType={"cover"}
                                path={image}
                            />
                        </View> : null
                }
                {
                    !parseItem.isShowAvatar ?
                        <View style={{
                            width: this.W_H_SPECIAL,
                            height: this.W_H_SPECIAL,
                            marginRight: Constants.MARGIN_LARGE
                        }} >
                            <Text style={{ color: 'transparent' }} >a</Text>
                        </View> : null
                }
            </View>
        )
    }

    /**
     * Render item flat list
     */
    renderItemImage = (item, index, parentIndex, indexInParent) => {
        const { onPressImage } = this.props;
        let numMoreImage = this.imageUrls.length - this.maxImage;
        return (
            index < this.maxImage
            && <View style={{ position: "relative" }}>
                <TouchableOpacity
                    onPress={() => onPressImage(this.imageUrls, index)}
                    style={[styles.image, { flexDirection: 'row', alignItems: 'center', ...this.getStyleImage(index) }]}>
                    <ImageLoader
                        style={[styles.imageChat, styles.image, this.getStyleImage(index)]}
                        resizeModeType={'cover'}
                        path={item.path}
                    />
                    {
                        numMoreImage > 0
                        && index == this.maxImage - 1
                        && <View style={styles.moreImage}>
                            <Text style={styles.numMore}>+{numMoreImage}</Text>
                        </View>
                    }
                </TouchableOpacity>
            </View>
        );
    }

    /**
     * Get style image
     */
    getStyleImage = (index) => {
        let length = this.imageUrls.length;
        if (length == 1) {
            return styles.imageChatOdd
        } else if (length == 2 || length >= 4) {
            return styles.imageChat
        } else if (length == 3) {
            if (index == 2) {
                return styles.imageChatOdd
            } else {
                return styles.imageChat
            }
        }
    }
}

const styles = StyleSheet.create({
    user: {
        margin: 0,
        padding: Constants.PADDING_LARGE,
        backgroundColor: Colors.COLOR_PRIMARY,
        borderBottomLeftRadius: Constants.CORNER_RADIUS * 4,
        borderTopLeftRadius: Constants.CORNER_RADIUS * 4,
        borderTopRightRadius: Constants.CORNER_RADIUS * 4
    },
    member: {
        margin: 0,
        padding: Constants.PADDING_LARGE,
        backgroundColor: "#E9E9E9",
        borderBottomRightRadius: Constants.CORNER_RADIUS * 4,
        borderTopLeftRadius: Constants.CORNER_RADIUS * 4,
        borderTopRightRadius: Constants.CORNER_RADIUS * 4
    },
    image: {
        borderRadius: Constants.CORNER_RADIUS,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0
    },
    buttonSpecial: {
        paddingHorizontal: Constants.PADDING_X_LARGE,
        paddingVertical: Constants.PADDING_LARGE
    },
    imageChat: {
        width: width / 4,
        height: (width / 4) * 2 / 3,
        borderWidth: Constants.BORDER_WIDTH,
        borderColor: Colors.COLOR_WHITE
    },
    imageChatOdd: {
        width: width / 2,
        height: (width / 2) * 2 / 3,
        borderWidth: Constants.BORDER_WIDTH,
        borderColor: Colors.COLOR_WHITE,
        margin: 1,
    },
    moreImage: {
        ...commonStyles.viewCenter,
        backgroundColor: Colors.COLOR_PLACEHOLDER_TEXT_DISABLE,
        borderRadius: Constants.CORNER_RADIUS * 4,
        position: "absolute",
        top: 0, right: 0, left: 0, bottom: 0
    },
    numMore: {
        ...commonStyles.text,
        color: Colors.COLOR_WHITE,
    },
});

export default ItemChat;