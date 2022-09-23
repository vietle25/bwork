import React, { Component } from "react";
import {
    View, Text, TouchableOpacity, Image,
    BackHandler, RefreshControl, TextInput, Keyboard, Animated
} from "react-native";
import BaseView from "containers/base/baseView";
import { Container, Header, Content, Root, Title } from "native-base";
import FlatListCustom from "components/flatListCustom";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import commonStyles from "styles/commonStyles";
import { Fonts } from "values/fonts";
import ItemListChat from "./itemListChat";
import firebase from "react-native-firebase";
import Utils from "utils/utils";
import StorageUtil from "utils/storageUtil";
import ic_search_black from "images/ic_search_black.png";
import TextInputSetState from "../textInputSetState";
import DialogCustom from "components/dialogCustom";
import StringUtil from "utils/stringUtil";
import * as actions from "actions/userActions";
import * as commonActions from "actions/commonActions";
import { ErrorCode } from "config/errorCode";
import { getActionSuccess, ActionEvent } from "actions/actionEvent";
import { connect } from "react-redux";
import conversationStatus from "enum/conversationStatus";
import styles from "../styles";
import { async } from "rxjs/internal/scheduler/async";
import { localizes } from "locales/i18n";
import ic_chat_green from 'images/ic_chat_green.png';
import screenType from "enum/screenType";

class ListChatView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            isShowLoading: true,
            refreshing: false,
            enableRefresh: true,
            enableLoadMore: false,
            isLoadingMore: false,
            stringSearch: null,
            isAlertDelete: false,
            itemSelected: null,
            isPressDelete: false,
            mainConversation: [],
            showNoData: false,
        };
        const { route, navigation, callback } = this.props;
        this.callback = callback;
        this.conversationIds = [];
        this.conversations = [];
        this.onBackConversation = null;
        this.scrollY = 32;
        this.onceQuery = Constants.PAGE_SIZE;
    }

    componentDidMount() {
        this.getSourceUrlPath();
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then(user => {
            if (!Utils.isNull(user)) {
                this.userId = user.id;
                this.realTime = firebase.database().ref(`chats_by_user/u${user.id}/_all_conversation`);
                this.realTime.on("value", snap => {
                    this.readDataListChat();
                });
            }
        }).catch(error => {
            this.saveException(error, "componentWillMount");
        });

    }

    UNSAFE_componentWillReceiveProps = nextProps => {
        if (nextProps != this.props) {
            this.props = nextProps;
            this.handleData();
        }
    };

    /**
     * read conversations on firebase
     * @param {*} usersKey (~ array contain userKey) is used when search
     */
    readDataListChat = async (usersKey) => {
        try {
            firebase
                .database()
                .ref(`chats_by_user/u${this.userId}/_conversation`)
                .orderByChild("deleted__last_updated_at")
                .startAt(`1_`)
                .limitToLast(this.onceQuery)
                .once("value", conversationSnap => {
                    const conversationValue = conversationSnap.val();
                    console.log("conversationValue: ", conversationValue);

                    if (!Utils.isNull(conversationValue)) {
                        if (this.callback != null) {
                            this.callback();
                        }
                        this.conversationIds = [];
                        conversationSnap.forEach(element => {
                            this.conversationIds.push(parseInt(StringUtil.getNumberInString(element.key)));
                        });
                        this.conversationIds.reverse();
                        this.getInformationMemberChat();

                    } else {
                        this.setState({
                            refreshing: false,
                            isLoadingMore: false,
                            isShowLoading: false,
                            mainConversation: [],
                            showNoData: true
                        });
                    }
                });
        } catch (error) {
            this.saveException(error, "readDataListChat");
        }
    };

    /**
     * Get information member chat (name, avatarPath)
     */
    getInformationMemberChat() {
        if (this.conversationIds.length > 0) {
            this.props.getListConversation({
                conversationIds: this.conversationIds
            });
        }
    }

    /**
     * Get valueLastMessage and valueUnseen
     */
    getInformationConversation = async () => {
        // if (this.conversations.length > 0) {
        //     for (let index = 0, size = this.conversations.length; index < size; index++) {
        //         let conversation = this.conversations[index];
        //         const lastMessageRef = firebase.database().ref(`chats_by_user/u${this.userId}/_conversation/c${conversation.conversationId}`);
        //         const lastMessageSnap = await lastMessageRef.once("value");
        //         const lastMessage = lastMessageSnap.val().last_messages;
        //         const deletedConversationRef = firebase.database().ref(`conversation/c${conversation.conversationId}/deleted`);
        //         const deletedConversationSnap = await deletedConversationRef.once("value");
        //         const deletedConversation = deletedConversationSnap.val();
        //         const unseenRef = firebase.database().ref(`members/c${conversation.conversationId}/u${this.userId}/number_of_unseen_messages`);
        //         const unseenSnap = await unseenRef.once("value");
        //         const valueUnseen = unseenSnap.val();
        //         let newConversation = {
        //             ...conversation,
        //             lastMessage,
        //             unseen: valueUnseen,
        //             deleted: deletedConversation
        //         };
        //         this.conversations[index] = newConversation;
        //     }
        //     // sort arr by updatedAt
        //     this.conversations.sort(function (a, b) {
        //         return parseInt(b.lastMessage.timestamp) - parseInt(a.lastMessage.timestamp);
        //     });
        //     this.saveListChat({ listChat: this.conversations })
        // }  
        this.setState({
            refreshing: false,
            isLoadingMore: false,
            mainConversation: this.conversations,
            isShowLoading: false,
            showNoData: true
        });
        this.conversations = [];
    };

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                // if (this.props.action == getActionSuccess(ActionEvent.GET_MEMBER_OF_CONVERSATION)) {
                //     this.conversations = data;
                //     this.state.mainConversation = this.conversations;
                //     // add information conversation
                //     this.getInformationConversation();
                // } else 
                if (this.props.action == getActionSuccess(ActionEvent.GET_LIST_CONVERSATION)) {
                    this.conversations = data;
                    this.state.mainConversation = this.conversations;
                    // add information conversation
                    this.getInformationConversation();
                } else if (this.props.action == getActionSuccess(ActionEvent.DELETE_CONVERSATION)) {
                    this.showMessage(localizes("listChatView.deleteChatSuccess"));
                } else if (this.props.action == getActionSuccess(ActionEvent.SEARCH_CONVERSATION)) {
                    if (!Utils.isNull(data)) {
                        this.conversations = data;
                        this.getInformationConversation();
                    } else {
                        this.conversations = [];
                        this.getInformationConversation();
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    /**
     * Get more testing
     */
    getMoreTesting = () => {
        if (this.isLoadMore) {
            this.isLoadMore = false;
            global.pageConversation += 10;
            this.readDataListChat();
        }
    };

    componentWillUnmount() {
        this.realTime.off();
    }

    //onRefreshing
    handleRefresh = () => {
        this.setState({
            refreshing: true,
            enableLoadMore: false
        });
        this.readDataListChat();
    };

    // onRequest
    handleRequest = () => {
        this.readDataListChat();
    };

    /**
     * Search user chat
     * @param {*} str
     */
    onSearch(str) {
        this.setState({
            stringSearch: str
        });
        if (!Utils.isNull(str)) {
            this.props.searchConversation({
                paramsSearch: str
            });
        } else {
            this.readDataListChat();
        }
    }

    render() {
        return (
            <Container style={[styles.container]}>
                <Root>
                    <Header style={[commonStyles.header]}>
                        {this.renderHeaderView({
                            visibleBack: false,
                            title: "Tin nhắn",
                            titleStyle: { color: Colors.COLOR_WHITE },
                        })}
                    </Header>
                    <FlatListCustom
                        contentContainerStyle={{}}
                        horizontal={false}
                        data={this.state.mainConversation}
                        itemPerCol={1}
                        renderItem={this.renderItemListChat}
                        showsVerticalScrollIndicator={false}
                        onScroll={Animated.event(
                            [{
                                nativeEvent: { contentOffset: { y: this.scrollY } }
                            }],
                            {
                                listener: (event) => {
                                    if (event.nativeEvent.contentOffset.y > this.scrollY) {
                                        this.setState({ isPressDelete: false })
                                    }
                                }
                            },
                        )}
                        enableRefresh={this.state.enableRefresh}
                        refreshControl={
                            <RefreshControl
                                progressViewOffset={Constants.HEIGHT_HEADER_OFFSET_REFRESH}
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }
                        isShowEmpty={this.state.showNoData}
                        textForEmpty={'Không có tin nhắn'}
                        isShowImageEmpty={true}
                        styleEmpty={{ marginTop: Constants.MARGIN_X_LARGE }}
                    />
                    {this.renderIconNewConversation()}
                    {this.state.isLoadingMore || this.state.refreshing ? null : this.showLoadingBar(this.props.isLoading)}
                    {this.renderDialogDelete()}
                </Root>
            </Container>
        );
    }

    /**
     * Render icon new conversation
     */
    renderIconNewConversation = () => {
        return (
            <View>
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    style={styles.iconNewConversation}
                    onPress={() =>
                        this.props.navigation.navigate("CreateConversationNew")
                    }>
                    <Image source={ic_chat_green} />
                </TouchableOpacity>
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
                textBtnTwo={localizes('delete')}
                contentText={localizes('listChatView.confirmDeleteChat')}
                onPressX={() => {
                    this.setState({ isAlertDelete: false });
                }}
                onPressBtnPositive={() => {
                    firebase
                        .database()
                        .ref()
                        .update({
                            [`members/c${itemSelected.conversationId}/u${this.userId}/deleted_conversation`]: true,
                            [`chats_by_user/u${this.userId}/_conversation/c${itemSelected.conversationId}/deleted`]: true,
                            [`chats_by_user/u${this.userId}/_conversation/c${itemSelected.conversationId}/deleted__last_updated_at`]: "0_0",
                            [`conversation/c${itemSelected.conversationId}/deleted`]: true
                        })
                        .then(() => {
                            this.readDataListChat();
                            // update DB
                            // + set conversation.status = 2 (suspended)
                            // + set conversation_member.deleted_conversation = true (with me id)
                            this.props.deleteConversation(itemSelected.conversationId);
                            this.setState({
                                isAlertDelete: false
                            });
                            this.onBackConversation ? this.onBackConversation() : null;
                        });
                }}
            />
        );
    }

    /**
     * Render item
     * @param {*} item
     * @param {*} index
     * @param {*} parentIndex
     * @param {*} indexInParent
     */
    renderItemListChat = (item, index, parentIndex, indexInParent) => {
        const { isPressDelete, itemSelected } = this.state;
        return (
            <ItemListChat
                key={index.toString()}
                data={this.state.mainConversation}
                item={item}
                index={index}
                // onLongPressItem={this.onLongPressItem}
                onPressItemChat={(avatar) => {
                    this.props.navigation.navigate("Chat", {
                        group: {
                            name: item.name,
                            avatar: avatar
                        },
                        conversationId: item.id,
                    });
                }}
                onPressDeleteItem={this.onDeleteItem}
                isPressDelete={isPressDelete}
                itemSelected={itemSelected}
                resourcePath={this.resourceUrlPathResize.textValue}
                userId={this.userId}
            />
        );
    }

    /**
     * On delete item
     */
    onDeleteItem = (item, index) => {
        this.setState({ isAlertDelete: true, itemSelected: item });
    }

    /**
     * On long press item
     */
    onLongPressItem = (item, index) => {
        this.setState({ isPressDelete: true, itemSelected: item });
    }
}

const mapStateToProps = state => ({
    data: state.listChat.data,
    isLoading: state.listChat.isLoading,
    error: state.listChat.error,
    errorCode: state.listChat.errorCode,
    action: state.listChat.action
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ListChatView);