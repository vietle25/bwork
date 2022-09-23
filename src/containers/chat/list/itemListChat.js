import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, Modal, BackHandler, ScrollView } from 'react-native';
import { Constants } from 'values/constants';
import commonStyles from 'styles/commonStyles';
import { Fonts } from 'values/fonts';
import { Colors } from 'values/colors';
import StringUtil from 'utils/stringUtil';
import I18n from 'locales/i18n';
import BaseView from 'containers/base/baseView';
import StorageUtil from 'utils/storageUtil';
import Utils from 'utils/utils';
import statusType from 'enum/statusType';
import FlatListCustom from 'components/flatListCustom';
import GridView from 'components/gridView';
import ImageViewer from 'react-native-image-zoom-viewer';
import DateUtil from 'utils/dateUtil';
import moment from 'moment';
import firebase from 'react-native-firebase';
import * as actions from 'actions/userActions';
import { ErrorCode } from 'config/errorCode';
import { getActionSuccess, ActionEvent } from 'actions/actionEvent';
import ImageLoader from 'components/imageLoader';
import ic_delete_black from 'images/ic_delete_red.png';
import BackgroundShadow from 'components/backgroundShadow';
import messageType from 'enum/messageType';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const PADDING_BUTTON = Constants.PADDING_X_LARGE - 4;
const WIDTH_HEIGHT_AVATAR = 48;

const screen = Dimensions.get("window");
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

class ItemListChat extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            unseen: 0,
            lastMessage: {},
            deleted: false
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            if (nextProps.isPressDelete) {
                this.scrollView.scrollTo({ x: 80 });
            } else {
                this.scrollView.scrollTo({ x: 0 });
            }
            this.getUnseen();
            this.getLastMessage();
            this.getDeleted();
        }
    }

    /**
     * Get unseen
     */
    getUnseen = () => {
        const { item, userId } = this.props;
        firebase
            .database()
            .ref(`members/c${item.id}/u${userId}/number_of_unseen_messages`)
            .on('value', (unseen) => {
                if (Utils.isNull(unseen.val())) {
                    this.setState({
                        unseen: 0
                    })
                } else {
                    this.setState({
                        unseen: unseen.val()
                    })
                }
            });
    }

    /**
     * Get last message
     */
    getLastMessage = () => {
        const { item, userId } = this.props;
        firebase
            .database()
            .ref(`chats_by_user/u${userId}/_conversation/c${item.id}`)
            .on('value', (lastMessage) => {
                if (Utils.isNull(lastMessage.val())) {
                    this.setState({
                        lastMessage: {}
                    })
                } else {
                    this.setState({
                        lastMessage: lastMessage.val().last_messages
                    })
                }
            });
    }

    /**
     * Get deleted
     */
    getDeleted = () => {
        const { item, userId } = this.props;
        firebase
            .database()
            .ref(`conversation/c${item.id}/deleted`)
            .on('value', (deleted) => {
                if (Utils.isNull(deleted.val())) {
                    this.setState({
                        deleted: false
                    })
                } else {
                    this.setState({
                        deleted: deleted.val()
                    })
                }
            });
    }

    componentDidMount() {
        this.getUnseen();
        this.getLastMessage();
        this.getDeleted();
    }

    render() {
        const { data, item, index, onPressItemChat, onPressDeleteItem, resourcePath, onLongPressItem, itemSelected } = this.props;
        let parseItem = {
            lastMessage: !Utils.isNull(this.state.lastMessage)
                ? this.state.lastMessage.message_type == messageType.NORMAL
                    || this.state.lastMessage.message_type == messageType.INVITE_STATUS
                    ? this.state.lastMessage.content
                    : !Utils.isNull(this.state.lastMessage.message_type) ? "[Hình ảnh]" : '' : "",
            updatedAt: !Utils.isNull(this.state.lastMessage) ? this.state.lastMessage.timestamp : DateUtil.getTimestamp(),
            nameUserChat: !Utils.isNull(item) ? item.name : "",
            avatar: !Utils.isNull(item) && !Utils.isNull(item.avatarPath) ? item.avatarPath : "",
            unseen: this.state.unseen
        };
        const HEIGHT_NOT_SEEN = 20;
        const WIDTH__NOT_SEEN = Utils.getLength(parseInt(parseItem.unseen)) < 2 ? 20 : 28;
        this.avatarMemberChat = !Utils.isNull(parseItem.avatar) && parseItem.avatar.indexOf('http') != -1 ? parseItem.avatar : resourcePath + "=" + global.companyIdAlias + "/" + parseItem.avatar;
        const date = new Date(parseInt(parseItem.updatedAt));
        this.hours = date.getHours();
        this.minutes = date.getMinutes();
        this.seconds = date.getSeconds();
        this.year = date.getFullYear();
        this.month = date.getMonth() + 1;
        this.day = date.getDate();
        this.time = this.year + "/" + this.month + "/" + this.day + " " + this.hours + ":" + this.minutes + ":" + this.seconds;
        let marginBottom = Constants.MARGIN_LARGE;
        if (index == data.length - 1) {
            marginBottom = Constants.MARGIN_X_LARGE;
        };
        const styleText = parseItem.unseen == 0 ? commonStyles.text : commonStyles.textBold;

        let hasHttp = !Utils.isNull(parseItem.avatar) && item.avatarPath.indexOf('http') != -1;

        return (
            <ScrollView
                onScroll={event => {
                    global.positionX = event.nativeEvent.contentOffset.x
                }}
                ref={ref => this.scrollView = ref}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[{
                    marginVertical: !Utils.isNull(parseItem.lastMessage) ? Constants.MARGIN_X_LARGE : 0,
                    justifyContent: "center",
                    alignItems: "center",
                }]}
                horizontal={true}
                style={{ flex: 1, flexDirection: 'row' }}>

                <TouchableOpacity
                    style={{ flex: 1, width: width, }}
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    onPress={() => {
                        onPressItemChat(parseItem.avatar)
                    }}
                // onLongPress={() => {
                //     onLongPressItem(item, index);
                // }}
                // delayLongPress={500}
                >
                    <View style={[commonStyles.viewHorizontal, {
                        marginHorizontal: Constants.MARGIN_X_LARGE,
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                    }]}>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                            <View>
                                <ImageLoader
                                    style={{
                                        width: WIDTH_HEIGHT_AVATAR,
                                        height: WIDTH_HEIGHT_AVATAR,
                                        borderRadius: WIDTH_HEIGHT_AVATAR / 2
                                    }}
                                    resizeAtt={hasHttp ? null : {
                                        type: 'thumbnail', width: deviceWidth * 0.18, height: deviceWidth * 0.18
                                    }}
                                    resizeModeType={"cover"}
                                    path={this.avatarMemberChat}
                                />
                            </View>
                            <View style={{ flexDirection: 'row', flex: 1 }}>
                                <View style={{ flex: 1, justifyContent: 'flex-start', marginLeft: Constants.MARGIN_X_LARGE }}>
                                    <View style={commonStyles.viewSpaceBetween}>
                                        <Text numberOfLines={1} style={[commonStyles.textBold, {
                                            margin: 0, flex: 1,
                                            marginRight: Constants.MARGIN_X_LARGE
                                        }]}>{parseItem.nameUserChat}</Text>
                                        <Text style={[commonStyles.text, {
                                            alignSelf: 'flex-start',
                                            flexDirection: 'column',
                                            margin: 0,
                                            fontSize: Fonts.FONT_SIZE_X_MEDIUM - 2,
                                            color: Colors.COLOR_PLACEHOLDER_TEXT_DISABLE,
                                            opacity: Constants.ACTIVE_OPACITY,
                                        }]}>
                                            {DateUtil.timeAgoChat(DateUtil.convertFromFormatToFormat(
                                                this.time, DateUtil.FORMAT_DATE_TIME_SQL,
                                                DateUtil.FORMAT_DATE_TIME_ZONE
                                            ))}
                                        </Text>
                                    </View>
                                    <View style={commonStyles.viewSpaceBetween}>
                                        <Text numberOfLines={1} style={[styleText, {
                                            flex: 1,
                                            color: parseInt(parseItem.unseen) > 0 ? Colors.COLOR_TEXT : Colors.COLOR_PLACEHOLDER_TEXT_DISABLE,
                                            margin: 0,
                                            marginRight: Constants.MARGIN_XX_LARGE * 2
                                        }]}>{Utils.parseEmojis(parseItem.lastMessage)}</Text>
                                        {
                                            parseItem.unseen > 0 ?
                                                <View style={{
                                                    height: HEIGHT_NOT_SEEN,
                                                    width: WIDTH__NOT_SEEN,
                                                    backgroundColor: Colors.COLOR_RED,
                                                    borderRadius: WIDTH__NOT_SEEN / 2,
                                                    ...commonStyles.viewCenter
                                                }}>
                                                    <Text style={{
                                                        ...commonStyles.textSmall,
                                                        color: 'white',
                                                        margin: 0
                                                    }}>
                                                        {parseItem.unseen}
                                                    </Text>
                                                </View> : null
                                        }
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
                {/* <TouchableOpacity
                    style={{ marginRight : Constants.MARGIN_XX_LARGE, marginLeft: Constants.MARGIN_LARGE }}
                    onPress={() => { onPressDeleteItem(item, index) }}
                    activeOpacity={Constants.ACTIVE_OPACITY}>
                    <Image source={ic_delete_black} />
                </TouchableOpacity> */}
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    name: {
        borderRadius: Constants.CORNER_RADIUS,
        margin: 0,
        padding: Constants.PADDING_LARGE,
        backgroundColor: Colors.COLOR_WHITE
    },
    image: {
        backgroundColor: Colors.COLOR_WHITE,
        borderRadius: Constants.CORNER_RADIUS,
        borderBottomLeftRadius: 0,
        borderTopLeftRadius: 0,
        justifyContent: 'center',
        alignItems: 'center',
        paddingRight: Constants.PADDING_X_LARGE
    },
    buttonSpecial: {
        paddingHorizontal: Constants.PADDING_X_LARGE,
        paddingVertical: Constants.PADDING_LARGE,
    }
});

export default ItemListChat;