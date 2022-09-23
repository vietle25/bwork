import React, { Component } from "react";
import {
    ImageBackground, View, StatusBar, Image, TouchableOpacity,
    Alert, WebView, Linking, StyleSheet, RefreshControl,
    TextInput, Dimensions, ScrollView, Keyboard, Platform, ActivityIndicator,
    FlatList, BackHandler
} from "react-native";
import {
    Container, Header, Title, Left, Icon, Right, Button, Body, Content, Text,
    Card, CardItem, Item, Input, Toast, Root, Col, Form, Spinner
} from "native-base";
import BaseView from "containers/base/baseView";
import commonStyles from "styles/commonStyles";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import Utils from 'utils/utils';
import { connect } from 'react-redux';
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import DateUtil from "utils/dateUtil";
import styles from "../styles";
import I18n, { localizes } from "locales/i18n";
import { Fonts } from "values/fonts";
import FlatListCustom from 'components/flatListCustom';
import StringUtil from "utils/stringUtil";
import { filter } from "rxjs/operators";
import moment from 'moment';
import ic_camera_grey from 'images/ic_camera_grey.png';
import StorageUtil from 'utils/storageUtil';
import { CalendarScreen } from "components/calendarScreen";
import statusType from "enum/statusType";
import ItemChat from "./ItemChat";
import firebase from 'react-native-firebase';
import ImagePicker from 'react-native-image-crop-picker';
import { async } from "rxjs/internal/scheduler/async";
import * as actions from 'actions/userActions';
import * as commonActions from 'actions/commonActions';
import ServerPath from "config/Server";
import Upload from 'react-native-background-upload'
import conversationStatus from "enum/conversationStatus";
import ModalImageViewer from 'containers/common/modalImageViewer';
import DialogCustom from "components/dialogCustom";
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger
} from "react-native-popup-menu";
import ic_close_circle_gray from 'images/ic_close_circle_gray.png';
import ic_menu_chat_green from 'images/ic_menu_chat_green.png';
import ic_menu_vertical from "images/ic_menu_vertical.png";
import screenType from "enum/screenType";
import memberType from 'enum/memberType';
import messageType from 'enum/messageType';
import ic_camera_chat_black from 'images/ic_camera_chat_black.png';
import ic_image_black from 'images/ic_image_black.png';
import ic_gif_black from 'images/ic_gif_black.png';
import ic_emoji_black from 'images/ic_emoji_black.png';
import ImageResizer from 'react-native-image-resizer';
import EmojiSelector from 'react-native-emoji-selector';
import GifPicker from "./giftPicker";

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height
const MAX_IMAGE = 10;

const optionsCamera = {
    multiple: true,
    waitAnimationEnd: false,
    includeExif: true,
    forceJpg: true,
    compressImageQuality: 0.8
};

class ChatView extends BaseView {

    constructor(props) {
        super(props)
        const { route, navigation } = this.props;
        const { callback, userMember, conversationId, group } = this.props.navigation.state.params;
        this.state = {
            messageText: null,
            messages: [],
            images: [],
            isShowLoading: true,
            userId: null,
            listFriendGroup: [],
            onEndReachedCalledDuringMomentum: true,
            keyboardHeight: 0,
            isAlertDelete: false,
            isShowMenuImage: false,
            isLoadImage: false,
            typeMessage: messageType.NORMAL,
            enableLoadMore: false,
            isShowEmoji: false,
            isShowGifPicker: false,
            isShowSticker: false
        }
        this.callback = callback;
        this.group = group;
        this.onceQuery = Constants.PAGE_SIZE;
        this.isScrollEnd = true;
        this.isSending = false;
        this.isLoadingMore = false;
        this.userMember = userMember;
        this.conversationId = conversationId;
        this.userMemberId = !Utils.isNull(this.userMember) ? this.userMember.id : "";
        this.userMemberName = !Utils.isNull(this.userMember) ? this.userMember.name : "";
        this.avatar = !Utils.isNull(this.userMember) ? this.userMember.avatarPath : "";
        this.imagesMessage = [];
        this.indexImagesMessage = 0;
        this.objectImages = '';
        this.actionValue = {
            WAITING_FOR_USER_ACTION: 0,
            ACCEPTED: 1,
            DENIED: 2
        };
        this.filter = {
            stringSearch: null,
            paging: {
                pageSize: 200,
                page: 0
            },
            branchId: null,
            companyId: null,
            conversationId: this.conversationId,
            memberType: memberType.MEMBER_GROUP
        };
        this.onceScrollToEnd = true;
        this.otherUserIdsInConversation = [];
        this.deleted = false;
        this.messageDraft = {
            fromUserId: "",
            message: "",
            timestamp: "",
            isShowDate: "",
            messageType: "",
            receiverResourceAction: 0
        };
        this.firebaseRef = firebase.database();
        this.listSendImages = [];
        this.isDisableBtn = false;
        this.firstMessageType = messageType.NORMAL;
        Platform.OS === 'android' ? null : KeyboardManager.setEnable(false);
    }

    /**
    * Handle unseen
    */
    handleUnseen = () => {
        let countUnseen = 0;
        if (!Utils.isNull(this.conversationId)) {
            this.firebaseRef.ref(`members/c${this.conversationId}/u${this.state.userId}/number_of_unseen_messages`)
                .transaction(function (value) {
                    countUnseen = value;
                    return 0;
                });
            this.firebaseRef.ref(`chats_by_user/u${this.state.userId}/number_of_unseen_messages`)
                .transaction(function (value) {
                    return value - countUnseen;
                });
        }
    }

    /**
     * Follow status deleted conversation
     */
    watchDeletedConversation() {
        if (!Utils.isNull(this.conversationId)) {
            this.deletedConversation = this.firebaseRef.ref(`conversation/c${this.conversationId}/deleted`)
            this.deletedConversation.on('value', (memberSnap) => {
                return this.deleted = memberSnap.val()
            })
        }
        return this.deleted = false;
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    /**
     * handle back button
     */
    handlerBackButton = () => {
        if (this.props.navigation) {
            if (this.state.isShowEmoji || this.state.isShowSticker || this.state.isShowGifPicker) {
                this.setState({
                    isShowEmoji: false,
                    isShowSticker: false,
                    isShowGifPicker: false
                })
            } else {
                this.onBack();
            }
        } else {
            return false
        }
        return true
    }

    componentDidMount = async () => {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this));
        Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this));
        this.getSourceUrlPath();
        global.atMessageScreen = true;
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then(user => {
            //this callback is executed when your Promise is resolved
            console.log("user", user);
            if (!Utils.isNull(user) && user.status == statusType.ACTIVE) {
                this.userInfo = user;
                this.setState({
                    userId: user.id
                })
                this.avatarGroup = !Utils.isNull(this.resourceUrlPath) ? this.resourceUrlPath.textValue + "/" + global.companyIdAlias + "/" + this.group.avatar : "";
                this.filter.companyId = user.company.id;
                this.filter.branchId = !Utils.isNull(user.branch) ? user.branch.id : null;
                this.getOtherUserIdsInConversation();
                if (!Utils.isNull(this.userMemberId)) {
                    this.otherUserIdsInConversation = [this.userMemberId, user.id]
                    // this.props.checkExistConversation({ userMemberChatId: this.userMember.id, conversationId: this.conversationId });
                }
                if (!Utils.isNull(this.conversationId)) {
                    this.props.getMemberOfConversation(this.filter);
                    this.readFirebaseDatabase();
                } else {
                    this.setState({
                        isShowLoading: false
                    })
                }
                // conversation is between user and admin (sold)
                this.watchDeletedConversation();
                this.handleUnseen();
            }
        }).catch(e => {
            this.saveException(e, 'componentDidMount')
        });
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this));
    }

    /**
     * Get all member in this conversation current
     */
    getOtherUserIdsInConversation() {
        this.firebaseRef.ref(`members/c${this.conversationId}`).once('value', (snapshot) => {
            if (!Utils.isNull(snapshot.val())) {
                this.otherUserIdsInConversation = []
                snapshot.forEach(element => {
                    let deleted = element.toJSON().deleted_conversation;
                    if (deleted == false) {
                        this.otherUserIdsInConversation.push(parseInt(StringUtil.getNumberInString(element.key)))
                    }
                });
            }
        })
    }

    /**
     * Handle show keyboard 
     * @param {*} e 
     */
    keyboardWillShow(e) {
        this.setState({ keyboardHeight: e.endCoordinates.height });
    }

    /**
     * Handle hide keyboard
     * @param {*} e 
     */
    keyboardWillHide(e) {
        this.setState({ keyboardHeight: 0 });
    }

    /**
     * Keyboard did show
     */
    keyboardDidShow() {
        this.isScrollEnd = true;
        this.scrollToEnd();
    }

    /**
     * scroll to end flatlist
     */
    scrollToEnd() {
        if (this.isScrollEnd) {
            !Utils.isNull(this.flatListRef) ? this.flatListRef.scrollToOffset({
                offset: 0,
                animated: true
            }) : null;
            this.handleUnseen();
        }
    }

    componentWillUnmount() {
        if (!Utils.isNull(this.realTimeMessages)) {
            this.realTimeMessages.off()
        }
        this.keyboardDidShowListener.remove();
    }

    /**
     * callback edit
     */
    handleCallBackEdit() {

    }

    /**
     * Get all messages
     * @param {*} isLoadMore ~ true: load more is active
     */
    readFirebaseDatabase = async (isLoadMore) => {
        if (isLoadMore) {
            this.isLoadingMore = true
            this.onceQuery += this.onceQuery
            this.isScrollEnd = false
        }
        try {
            this.firebaseRef.ref(`messages_by_conversation/c${this.conversationId}`)
                .limitToLast(this.onceQuery)
                .on('value', (messageSnap) => {
                    let messages = [];
                    console.log("messagesSnap: ", messageSnap.val());
                    if (!Utils.isNull(messageSnap.val())) {
                        let lengthMessage = messageSnap._childKeys.length;
                        // this.state.enableLoadMore = lengthMessage > this.state.messages.length && lengthMessage >= Constants.PAGE_SIZE && lengthMessage % Constants.PAGE_SIZE == 0;
                        this.state.enableLoadMore = !(lengthMessage < this.onceQuery);
                        messageSnap.forEach(itemMessage => {
                            let item = {
                                "conversationId": this.conversationId,
                                "key": itemMessage.key,
                                "fromUserId": itemMessage.toJSON().from_user_id,
                                "message": itemMessage.toJSON().content,
                                "receiverSeen": itemMessage.toJSON().receiver_seen,
                                "timestamp": itemMessage.toJSON().timestamp,
                                "isShowAvatar": true,
                                "isShowDate": true,
                                "avatar": !Utils.isNull(this.getValueByKeyArray(this.state.listFriendGroup, itemMessage.toJSON().from_user_id)) ?
                                    this.getValueByKeyArray(this.state.listFriendGroup, itemMessage.toJSON().from_user_id).avatarPath : "",
                                "messageType": itemMessage.toJSON().message_type,
                                "receiverResourceAction": itemMessage.toJSON().receiver_resource_action
                            }
                            messages.push(item);
                        });
                    }
                    this.nextIndex = 0
                    this.nextElement = null
                    for (let index = 0; index < messages.length; index++) {
                        const element = messages[index]
                        if (index + 1 > messages.length - 1) {
                            break
                        } else {
                            this.nextIndex = index + 1
                        }
                        this.nextElement = messages[this.nextIndex]
                        if (element.fromUserId !== this.state.userId) {
                            if (element.fromUserId === this.nextElement.fromUserId) {
                                !Utils.isNull(element.isShowAvatar) ? element.isShowAvatar = false : null
                            }
                        }
                        if (
                            new Date(Number(element.timestamp)).getMonth() + 1 === new Date(Number(this.nextElement.timestamp)).getMonth() + 1
                            && new Date(Number(element.timestamp)).getDate() === new Date(Number(this.nextElement.timestamp)).getDate()
                        ) {
                            this.nextElement.isShowDate = false
                        }
                    }
                    this.setState({
                        messages: messages.reverse(),
                        isShowLoading: false,
                    }, () => {
                        this.scrollToEnd()
                    });
                });
        } catch (error) {
            this.saveException(error, 'readFirebaseDatabase')
        }
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.CREATE_CONVERSATION)) {
                    if (!Utils.isNull(data)) {
                        if (!Utils.isNull(data.conversationId)) {
                            this.conversationId = data.conversationId;
                            this.otherUserIdsInConversation = [this.state.userId, this.userMemberId];
                            // push message
                            let filter = {
                                conversationId: this.conversationId,
                                content: this.state.messageText,
                                typeMessage: this.state.typeMessage,
                                userMemberChatId: this.state.userId
                            }
                            this.setState({ messageText: null });
                            if (this.firstMessageType == messageType.IMAGE) {
                                this.uploadImageStepByStep();
                            } else {
                                this.props.pushMessageNotification(filter);
                            }
                            this.readFirebaseDatabase();
                        }
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.CHECK_EXIST_CONVERSATION)) {
                    if (data != null) {
                        this.conversationId = data;
                        this.readFirebaseDatabase();
                        this.handleUnseen();
                    } else {
                        this.state.isShowLoading = false
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_MEMBER_OF_CONVERSATION)) {
                    if (data.data.length > 0) {
                        data.data.forEach(item => {
                            if (this.state.listFriendGroup.indexOf(item) == -1) {
                                this.state.listFriendGroup.push({ ...item });
                            }
                        })
                        this.readFirebaseDatabase();
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.DELETE_CONVERSATION)) {
                    this.setState({
                        isAlertDelete: false
                    });
                    this.showMessage(localizes("listChatView.exitGroupSuccess"));
                    this.onBackConversation();
                }
                this.state.isShowLoading = false
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    /**
     * Render item
     * @param {*} item 
     * @param {*} index 
     * @param {*} parentIndex 
     * @param {*} indexInParent 
     */
    renderItemChat(item, index, parentIndex, indexInParent) {
        let resourceUrlPath = !Utils.isNull(this.resourceUrlPathResize) ? this.resourceUrlPathResize.textValue : null
        let resource = !Utils.isNull(this.resourceUrlPath) ? this.resourceUrlPath.textValue : null
        return (
            <ItemChat
                key={index.toString()}
                data={item}
                index={index}
                userId={this.state.userId}
                roomId={this.roomId}
                userAdminId={this.userAdmin.numericValue}
                onPressSendAction={(actionValue, conversationId, keyMessage) => {
                    this.firebaseRef.ref().update({
                        [`messages_by_conversation/c${conversationId}/${keyMessage}/receiver_resource_action`]: this.receiverResourceAction(actionValue)
                    }).then(() => {
                        this.isScrollEnd = false
                        this.readFirebaseDatabase();
                    });
                }}
                resource={resource}
                resourceUrlPath={resourceUrlPath}
                onPressImage={this.onPressImage}
            />
        )
    }

    /**
     * On press image
     */
    onPressImage = (images, index) => {
        this.refs.modalImageViewer.showModal(images, index)
    }

    /**
     * Receiver resource action
     * @param {*} actionValue 
     */
    receiverResourceAction(actionValue) {
        if (actionValue == this.actionValue.DENIED) { // DENIED
            return this.actionValue.DENIED
        } else if (actionValue == this.actionValue.ACCEPTED) {
            return this.actionValue.ACCEPTED
        }
    }

    /**
     * Send message
     * @param {*} contentMessages 
     * @param {*} contentImages // when send image. contentImages = 'path 1, path 2, ...'
     */
    onPressSendMessages = async (contentMessages, contentImages) => {
        let timestamp = DateUtil.getTimestamp();
        let typeMessage = messageType.NORMAL;
        if (!Utils.isNull(contentMessages) || !Utils.isNull(this.state.messageText) || !Utils.isNull(contentImages)) {
            let content = ""
            if (!Utils.isNull(contentMessages)) {
                content = contentMessages
            } else if (!Utils.isNull(this.state.messageText)) {
                content = this.state.messageText.trim();
            } else {
                content = contentImages;
                typeMessage = messageType.IMAGE;
                this.setState({ typeMessage: typeMessage });
            }
            this.messageDraft = {
                conversationId: this.conversationId,
                fromUserId: this.state.userId,
                message: content,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                isShowAvatar: false,
                isShowDate: false,
                messageType: typeMessage,
                receiverResourceAction: 0,
                sending: 0
            }
            var joined = [...this.state.messages, this.messageDraft];
            this.setState({ messages: joined })
            if (!Utils.isNull(this.conversationId)) {
                if (this.deleted) {
                    this.readFirebaseDatabase();
                } else {
                    try {
                        this.otherUserIdsInConversation.forEach(userId => {
                            let updateData = {
                                [`chats_by_user/u${userId}/_conversation/c${this.conversationId}/deleted`]: false,
                                [`chats_by_user/u${userId}/_conversation/c${this.conversationId}/last_updated_at`]: firebase.database.ServerValue.TIMESTAMP,
                                [`chats_by_user/u${userId}/_conversation/c${this.conversationId}/deleted__last_updated_at`]: `1_${timestamp}`,
                                [`chats_by_user/u${userId}/_conversation/c${this.conversationId}/last_messages`]: {
                                    content: content,
                                    timestamp: firebase.database.ServerValue.TIMESTAMP,
                                    message_type: typeMessage
                                },
                                [`chats_by_user/u${userId}/_all_conversation`]: {
                                    conversation_id: this.conversationId,
                                    from_user_id: this.state.userId,
                                    last_updated_at: firebase.database.ServerValue.TIMESTAMP,
                                    last_messages: {
                                        content: content,
                                        timestamp: firebase.database.ServerValue.TIMESTAMP,
                                        message_type: typeMessage
                                    }
                                }
                            };
                            this.firebaseRef.ref().update(updateData);
                        })
                        this.otherUserIdsInConversation.forEach(userId => {
                            if (userId === this.state.userId) {
                                return;
                            }
                            this.firebaseRef.ref(`members/c${this.conversationId}/u${userId}/number_of_unseen_messages`).transaction(function (value) {
                                return value + 1;
                            });
                            this.firebaseRef.ref(`chats_by_user/u${userId}/number_of_unseen_messages`).transaction(function (value) {
                                return value + 1;
                            });
                        });
                        // push new message:
                        let newMessageKey = this.firebaseRef.ref(`messages_by_conversation/c${this.conversationId}`).push().key;
                        this.firebaseRef.ref().update({
                            [`messages_by_conversation/c${this.conversationId}/${newMessageKey}`]: {
                                from_user_id: this.state.userId,
                                content: content.trim(),
                                timestamp: firebase.database.ServerValue.TIMESTAMP,
                                message_type: typeMessage,
                                receiver_seen: true,
                                receiver_resource_action: 0
                            }
                        });
                        let filter = {
                            conversationId: this.conversationId,
                            content: content.trim(),
                            typeMessage: typeMessage,
                            userMemberChatId: this.state.userId
                        };
                        // this.props.pushMessageNotification(filter);
                        this.setState({ messageText: null });
                        this.listSendImages = [];
                        this.isScrollEnd = true;
                    } catch (error) {
                        this.saveException(error, 'onPressSendMessages');
                    }
                }
            } else {
                this.props.createConversation({
                    userMemberChatId: this.group.id,
                    typeMessage: typeMessage,
                    content: content
                })
            }
        }
        this.isDisableBtn = false;
    }

    /**
     * Format bytes
     * @param {*} bytes 
     * @param {*} decimals 
     */
    formatBytes(bytes, decimals) {
        if (bytes == 0) return '0 Bytes';
        var k = 1024,
            dm = decimals <= 0 ? 0 : decimals || 2,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return console.log(parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i])
    }

    /**
     * Handle list image selected
     */
    handleImageSelected = (images) => {
        let count = 0
        let maxSizeUpload = 10240
        this.objectImages = ''
        this.indexImagesMessage = 0
        images.forEach(element => {
            this.formatBytes(element.size);
            if (element.size / this.oneMB > maxSizeUpload) {
                count++
            } else {
                this.listSendImages.push(element.path)
                this.setState({
                    isLoadImage: true
                })
            }
        });
        if (count > 0) {
            this.showMessage("Có " + count + " ảnh lớn hơn " + maxSizeUpload + " MB")
        }
        count = 0
    }

    /**
     * Upload image to server and get return path
     */
    uploadImageStepByStep() {
        this.setState({
            isShowLoading: true
        });
        let filePathUrl = this.listSendImages[this.indexImagesMessage];
        if (Platform.OS == "android") {
            filePathUrl = filePathUrl.replace('file://', '');
        } else {
            filePathUrl = Utils.convertLocalIdentifierIOSToAssetLibrary(filePathUrl, true);
        }
        const options = {
            url: ServerPath.API_URL + `user/conversation/${this.conversationId}/media/upload`,
            path: filePathUrl,
            method: 'POST',
            field: 'file',
            type: 'multipart',
            headers: {
                'Content-Type': 'application/json', // Customize content-type
                'X-APITOKEN': global.token
            }
        }
        this.processUploadImage(options);
    }

    /**
     * Process Upload Image
     */
    processUploadImage(options) {
        Upload.startUpload(options).then((uploadId) => {
            console.log('Upload started')
            Upload.addListener('progress', uploadId, (data) => {
                console.log(`Progress: ${data.progress}%`)
            })
            Upload.addListener('error', uploadId, (data) => {
                console.log(`Error: ${data.error} %`)
                this.showMessage(localizes('uploadImageError'))
                this.setState({
                    isShowLoading: false
                })
            })
            Upload.addListener('cancelled', uploadId, (data) => {
                console.log(`Cancelled!`)
            })
            Upload.addListener('completed', uploadId, (data) => {
                console.log('Completed!: ', this.indexImagesMessage, " - ", data)
                if (!Utils.isNull(data.responseBody)) {
                    let result = JSON.parse(data.responseBody)
                    let pathImage = result.data
                    this.objectImages += pathImage + (this.indexImagesMessage == this.listSendImages.length - 1 ? '' : ',')
                }
                if (this.indexImagesMessage < this.listSendImages.length - 1) {
                    this.indexImagesMessage++
                    const timeOut = setTimeout(() => {
                        this.uploadImageStepByStep()
                    }, 200);
                } else {
                    // upload images done!
                    this.listSendImages = []
                    if (!Utils.isNull(this.state.messageText)) {
                        let messageTemp = this.state.messageText;
                        this.setState({
                            messageText: null,
                        }, () => { this.onPressSendMessages("", this.objectImages) });

                        setTimeout(() => { this.onPressSendMessages(messageTemp); }, 1000);
                    } else {
                        this.onPressSendMessages("", this.objectImages)
                    }
                }
            })
        }).catch((err) => {
            this.saveException(err, 'processUploadImage')
        })
    }

    /**
     * Delete image
     */
    deleteImage = (index) => {
        this.listSendImages.splice(index, 1);
        this.setState({
            isLoadImage: true
        })
    }

    getValueByKeyArray(arr, key) {
        let value = arr.filter(item => {
            if (item.id == key) {
                return item;
            }
        })
        return value[0];
    }

    /**
     * Render item send image
     */
    renderItemSendImages = (item, index, parentIndex, indexInParent) => {
        return (
            <View key={index} style={styles.itemImageContainer}>
                <Image
                    style={{ width: 120, height: 180, borderRadius: Constants.CORNER_RADIUS / 2 }}
                    source={{ uri: item }}
                />
                <TouchableOpacity
                    disabled={this.isDisableBtn}
                    onPress={() => { this.deleteImage(index) }}
                    style={[styles.btnDeleteImage, { backgroundColor: Colors.COLOR_WHITE }]}>
                    <Image source={ic_close_circle_gray} />
                </TouchableOpacity>
            </View>
        );
    }

    /**
     * On back
     */
    onBack() {
        if (this.props.navigation) {
            global.atMessageScreen = false;
            this.props.navigation.goBack();
        }
    }

    render() {
        const { isShowEmoji, isShowGifPicker, isShowSticker } = this.state;
        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={[commonStyles.header]}>
                        {this.renderHeaderView({
                            visibleBack: true,
                            visibleAccount: true,
                            visibleTitle: false,
                            source: this.avatarGroup,
                            userName: this.group.name,
                        })}
                        {this.renderRightMenu()}
                    </Header>
                    <FlatListCustom
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={this.renderShowLoadOldMessages}
                        enableLoadMore={this.state.enableLoadMore}
                        onLoadMore={() => {
                            this.readFirebaseDatabase(true)
                        }}
                        inverted={true}
                        onContentSizeChange={() => {
                            this.scrollToEnd()
                        }}
                        keyExtractor={item => item.id}
                        onRef={(ref) => { this.flatListRef = ref; }}
                        style={{ flexGrow: 1, flex: 1, paddingHorizontal: Constants.PADDING_LARGE, backgroundColor: Colors.COLOR_WHITE }}
                        horizontal={false}
                        data={this.state.messages}
                        renderItem={this.renderItemChat.bind(this)}
                    />
                    {!isShowGifPicker && !isShowSticker
                        && <View style={[styles.dockSendMess, { backgroundColor: Colors.COLOR_WHITE }]}>
                            {this.listSendImages.length != 0 ?
                                <FlatListCustom
                                    style={[styles.flatListSendImages]}
                                    horizontal={true}
                                    keyExtractor={item => item.id}
                                    data={this.listSendImages}
                                    itemPerCol={1}
                                    renderItem={this.renderItemSendImages}
                                    showsVerticalScrollIndicator={true}
                                /> : null}
                            <View style={[commonStyles.viewCenter, commonStyles.viewHorizontal, {
                                backgroundColor: Colors.COLOR_WHITE,
                                flex: 0,
                                paddingHorizontal: Constants.PADDING_LARGE,
                                marginBottom: this.state.keyboardHeight,
                                paddingRight: Constants.PADDING_X_LARGE,
                                borderTopWidth: Constants.DIVIDE_HEIGHT_SMALL,
                                borderTopColor: Colors.COLOR_GREY
                            }]}>
                                <TouchableOpacity
                                    activeOpacity={Constants.ACTIVE_OPACITY}
                                    style={{ marginHorizontal: Constants.MARGIN_LARGE }}
                                    onPress={() => {
                                        this.setState({
                                            isShowMenuImage: !this.state.isShowMenuImage
                                        })
                                    }}>
                                    <Image
                                        source={ic_menu_chat_green}
                                        resizeMode={'cover'}
                                    />
                                </TouchableOpacity>
                                <TextInput
                                    editable={!this.state.isShowLoading}
                                    selectTextOnFocus={!this.state.isShowLoading}
                                    placeholder={"Viết tin nhắn..."}
                                    placeholderTextColor={Colors.COLOR_DRK_GREY}
                                    ref={r => (this.messageInput = r)}
                                    value={this.state.messageText}
                                    onChangeText={(text) => {
                                        this.setState({ messageText: text });
                                        this.scrollToEnd();
                                    }}
                                    onSubmitEditing={() => { }}
                                    style={[commonStyles.text, {
                                        flex: 1,
                                        borderRadius: Constants.BUTTON_RADIUS * 2,
                                        backgroundColor: Colors.COLOR_BACKGROUND,
                                        maxHeight: Constants.PADDING_LARGE_TITLE_ONE_BTN * 2,
                                        margin: Constants.MARGIN_LARGE,
                                        paddingHorizontal: Constants.PADDING_X_LARGE,
                                        paddingVertical: Constants.PADDING_LARGE
                                    }]}
                                    keyboardType="default"
                                    underlineColorAndroid='transparent'
                                    // returnKeyType={"send"}
                                    multiline={true}
                                />
                                <TouchableOpacity
                                    activeOpacity={Constants.ACTIVE_OPACITY}
                                    style={{
                                        backgroundColor: Colors.COLOR_PRIMARY,
                                        paddingHorizontal: Constants.PADDING,
                                        borderRadius: Constants.CORNER_RADIUS
                                    }}
                                    onPress={() => {
                                        if (this.listSendImages.length > 0) {
                                            this.isDisableBtn = true;
                                            if (this.conversationId != null) {
                                                this.uploadImageStepByStep();
                                            } else {
                                                this.firstMessageType = messageType.IMAGE;
                                                this.props.createConversation({
                                                    userMemberChatId: this.userMemberId,
                                                    typeMessage: 2,
                                                    content: null
                                                })
                                            }
                                        } else {
                                            !this.props.isLoading
                                                && !Utils.isNull(this.state.messageText)
                                                && this.state.messageText.trim() !== ""
                                                ? this.onPressSendMessages() : this.setState({ messageText: null })
                                        }
                                    }
                                    } >
                                    <Text style={[commonStyles.text, { color: Colors.COLOR_WHITE, padding: Constants.PADDING }]}>Gửi</Text>
                                </TouchableOpacity>
                            </View>
                            {this.state.isShowMenuImage && !isShowEmoji ? this.renderHeaderBottom() : null}
                        </View>
                    }
                    {
                        isShowEmoji &&
                        <EmojiSelector
                            onEmojiSelected={this.onSelectedEmoji}
                            showSearchBar={false}
                            showHistory={true}
                            showSectionTitles={false}
                            columns={10}
                        />
                    }
                    {
                        isShowGifPicker &&
                        <GifPicker
                            onPressGifItem={this.onSelectGif}
                            onClose={() => { this.setState({ isShowGifPicker: false }) }}
                        />
                    }
                    <ModalImageViewer
                        ref={'modalImageViewer'}
                    />
                    {this.showLoadingBar(this.state.isShowLoading)}
                    {this.renderDialogDelete()}
                </Root>
            </Container>
        );
    }

    /**
     * on selected emoji 
     * @param emoji
     */
    onSelectedEmoji = emoji => {
        this.setState({ messageText: this.state.messageText == null ? emoji : this.state.messageText + emoji });
    }

    /** 
     * on selected gif => save .GIF from ASSETS folder to STORAGE ( ANDROID )
     * handle with IOS in the future
     */
    onSelectGif = gifUrl => {
        this.onPressSendMessages("", gifUrl);
    }

    /**
     * Render menu option
     */
    renderMenuOption = () => {
        return (
            <Menu ref={ref => (this.menuOption = ref)}>
                <MenuTrigger text="" />
                <MenuOptions>
                    <MenuOption
                        onSelect={() => {
                            this.props.navigation.navigate("EditInfoChat", {
                                type: screenType.FROM_CHAT_EDIT, conversationId: this.conversationId
                                , avatar: this.group.avatar, name: this.group.name, callback: this.handleCallBackEdit
                            })
                        }}>
                        <View style={[commonStyles.viewHorizontal, {
                            alignItems: "center",
                            padding: Constants.MARGIN
                        }]}>
                            <Text style={[commonStyles.text, { flex: 1 }]}>
                                Chỉnh sửa
                            </Text>
                        </View>
                    </MenuOption>
                    <MenuOption
                        onSelect={() =>
                            this.props.navigation.navigate("ListMemberChat", { conversationId: this.conversationId })
                        }>
                        <View style={[commonStyles.viewHorizontal, {
                            alignItems: "center",
                            padding: Constants.MARGIN
                        }]}>
                            <Text style={[commonStyles.text, { flex: 1 }]}>
                                Thành viên
                            </Text>
                        </View>
                    </MenuOption>
                    <MenuOption
                        onSelect={() =>
                            this.props.navigation.navigate("EditInfoChat", { type: screenType.FROM_CHAT_INVITE, conversationId: this.conversationId })
                        }>
                        <View style={[commonStyles.viewHorizontal, {
                            alignItems: "center",
                            padding: Constants.MARGIN
                        }]}>
                            <Text style={[commonStyles.text, { flex: 1 }]}>
                                Thêm thành viên
                            </Text>
                        </View>
                    </MenuOption>
                    <MenuOption
                        onSelect={() => {
                            this.setState({
                                isAlertDelete: true
                            });
                        }}>
                        <View style={[commonStyles.viewHorizontal, {
                            alignItems: "center",
                            padding: Constants.MARGIN
                        }]}>
                            <Text style={[commonStyles.text, { flex: 1, color: Colors.COLOR_RED }]}>
                                Rời khỏi nhóm
                            </Text>
                        </View>
                    </MenuOption>
                </MenuOptions>
            </Menu>
        );
    };

    renderHeaderBottom = () => {
        return (
            <View style={{ flexDirection: "row", justifyContent: "center", padding: Constants.MARGIN_XX_LARGE }}>
                <TouchableOpacity
                    style={{ marginHorizontal: Constants.MARGIN_X_LARGE }}
                    onPress={() => {
                        this.onChooseCamera();
                        this.state.isShowMenuImage = false;
                    }}>
                    <Image source={ic_camera_chat_black} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ marginHorizontal: Constants.MARGIN_X_LARGE }}
                    onPress={() => {
                        this.onChooseImage();
                        this.state.isShowMenuImage = false;
                    }}>
                    <Image source={ic_image_black} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ marginHorizontal: Constants.MARGIN_X_LARGE }}
                    onPress={() => {
                        this.onChooseGif();
                    }}>
                    <Image source={ic_gif_black} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ marginHorizontal: Constants.MARGIN_X_LARGE }}
                    onPress={() => {
                        this.onChooseEmoji();
                    }}>
                    <Image source={ic_emoji_black} />
                </TouchableOpacity>
            </View>
        );
    }

    /**
     * on choose emoji
     */
    onChooseEmoji = () => {
        Keyboard.dismiss();
        setTimeout(() => {
            this.setState({
                isShowEmoji: true,
                isShowSticker: false,
                isShowGifPicker: false
            })
        }, 50);
    }

    /**
     * on choose gif
     */
    onChooseGif = () => {
        Keyboard.dismiss();
        setTimeout(() => {
            this.setState({
                isShowSticker: false,
                isShowEmoji: false,
                isShowGifPicker: true
            })
        }, 50);
    }

    /**
     * render right menu
     */
    renderRightMenu = () => {
        return (
            <View style={{ justifyContent: "center" }}>
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    style={{
                        justifyContent: "center",
                        paddingLeft: Constants.PADDING_LARGE,
                        paddingVertical: Constants.PADDING_LARGE
                    }}
                    onPress={() => {
                        this.menuOption.open();
                    }}
                >
                    <Image source={ic_menu_vertical} />
                </TouchableOpacity>
                {this.renderMenuOption()}
            </View>
        )
    }

    /**
     * Render dialog delete conversation
     */
    renderDialogDelete() {
        const { itemSelected } = this.state;
        return (
            <DialogCustom
                visible={this.state.isAlertDelete}
                isVisibleTitle={true}
                isVisibleContentText={true}
                isVisibleTwoButton={true}
                contentTitle={localizes('notification')}
                textBtnOne={localizes('cancel')}
                textBtnTwo={localizes('exitGroup')}
                contentText={localizes('listChatView.confirmExitGroup')}
                onPressX={() => {
                    this.setState({ isAlertDelete: false });
                }}
                onPressBtnPositive={() => {
                    firebase
                        .database()
                        .ref()
                        .update({
                            [`members/c${this.conversationId}/u${this.userId}/deleted_conversation`]: true,
                            [`chats_by_user/u${this.userId}/_conversation/c${this.conversationId}/deleted`]: true,
                            [`chats_by_user/u${this.userId}/_conversation/c${this.conversationId}/deleted__last_updated_at`]: "0_0",
                            // [`conversation/c${this.conversationId}/deleted`]: true
                        })
                        .then(() => {
                            // update DB
                            // + set conversation.status = 2 (suspended)
                            // + set conversation_member.deleted_conversation = true (with me id)
                            this.props.deleteConversation(this.conversationId);
                        });
                }}
            />
        );
    }

    onBackConversation() {
        this.props.navigation.navigate("ListChat");
    }

    /**
     * Choose image 
     */
    onChooseImage = () => {
        ImagePicker.openPicker({ ...optionsCamera, mediaType: 'photo' }).then((images) => {
            if (this.listSendImages.length < MAX_IMAGE) {
                this.handleImageSelected(images);
            } else {
                this.showMessage("Số lượng hình ảnh tối đa 10 hình");
            }
        }).catch(e => this.saveException(e, 'onChooseImage'));
    }

    /**
     * Choose camera 
     */
    onChooseCamera = () => {
        ImagePicker.openCamera(optionsCamera).then((images) => {
            if (this.listSendImages.length < MAX_IMAGE) {
                this.handleImageSelected(images);
            } else {
                this.showMessage("Số lượng hình ảnh tối đa 10 hình");
            }
        }).catch(e => this.saveException(e, 'onChooseImage'));
    }

    /**
     * Upload avatar
     */
    uploadAvatar = (uri) => {
        let uriReplace = uri;
        if (Platform.OS == "android") {
            uriReplace = uri.replace('file://', '');
        };
        let file = {
            fileType: "image/*",
            filePath: uriReplace
        };
        console.log("URI: ", file.filePath);
        const options = {
            url: ServerPath.API_URL + "user/upload/avatar",
            path: file.filePath,
            method: "POST",
            field: "file",
            type: "multipart",
            headers: {
                "Content-Type": "application/json", // Customize content-type
                "X-APITOKEN": global.token
            },
            notification: {
                enabled: true,
                onProgressTitle: "Đang tải ảnh lên...",
                autoClear: true
            }
        };
        Upload.startUpload(options).then(uploadId => {
            console.log("Upload started");
            Upload.addListener("progress", uploadId, data => {
                console.log(`Progress: ${data.progress}%`);
            });
            Upload.addListener("error", uploadId, data => {
                console.log(`Error: ${data.error}%`);
            });
            Upload.addListener("cancelled", uploadId, data => {
                console.log(`Cancelled!`);
            });
            Upload.addListener("completed", uploadId, data => {
                // data includes responseCode: number and responseBody: Object
                console.log("Completed!");
                if (!Utils.isNull(data.responseBody)) {
                    let result = JSON.parse(data.responseBody);
                    if (!Utils.isNull(result.data)) {
                        this.setState({
                            avatarPath: result.data,
                            isLoading: false
                        });
                    }
                }
            });
        }).catch(error => {
            this.saveException(error, "takePhoto");
        });
    }

}

const mapStateToProps = state => ({
    data: state.chat.data,
    isLoading: state.chat.isLoading,
    error: state.chat.error,
    errorCode: state.chat.errorCode,
    action: state.chat.action
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatView);