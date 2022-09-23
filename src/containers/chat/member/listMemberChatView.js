import React, { Component } from "react";
import {
    View, Image, RefreshControl, Dimensions,
    TouchableOpacity, BackHandler,
    TextInput, Keyboard, Platform,
} from "react-native";
import {
    Container, Header, Content, Text, Body, Root
} from "native-base";
import { localizes } from 'locales/i18n';
import FlatListCustom from "components/flatListCustom";
import I18n from 'react-native-i18n';
import { Colors } from "values/colors";
import commonStyles from "styles/commonStyles";
import styles from "../styles";
import { Constants } from "values/constants";
import BaseView from "containers/base/baseView";
import { Fonts } from "values/fonts";
import { connect } from 'react-redux';
import * as actions from 'actions/userActions';
import * as userActions from 'actions/userActions';
import { ErrorCode } from "config/errorCode";
import Utils from "utils/utils";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import ItemFriend from "../createGroup/itemFriend";
import StorageUtil from "utils/storageUtil";
import statusType from "enum/statusType";
import firebase from 'react-native-firebase';
import notificationType from "enum/notificationType";
import DialogCustom from "components/dialogCustom";
import screenType from "enum/screenType";
import slidingMenuType from "enum/slidingMenuType";
import ImageLoader from 'components/imageLoader';
import TextInputCustom from "components/textInputCustom";
import ImageResizer from 'react-native-image-resizer';
import ImagePicker from "react-native-image-picker";
import StringUtil from "utils/stringUtil";
import Upload from "react-native-background-upload";
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger
} from "react-native-popup-menu";
import ic_search_black from 'images/ic_search_black.png';
import ic_camera_radio from 'images/ic_camera_radio.png';
import ic_menu_vertical from "images/ic_menu_vertical.png";
import memberType from "enum/memberType";

const screen = Dimensions.get("window");

class ListMemberChatView extends BaseView {

    constructor(props) {
        super(props);
        const { navigation } = this.props;
        this.state = {
            userId: null,
            refreshing: false,
            enableRefresh: true,
            enableLoadMore: false,
            isAlertConfirm: false,
            isLoadingMore: false,
            visibleDialog: false,
            isAlertDelete: false,
            typing: false,
            typingTimeout: 0,
            isSearch: false,
            txtSearch: null,
            nameGroup: null,
            visibleEdit: true,
            avatarTemp: null,
            isDisableButtonInvite: true,
        };
        const { conversationId } = this.props.navigation.state.params;
        this.conversationId = conversationId;
        this.filter = {
            stringSearch: null,
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            },
            branchId: null,
            companyId: null,
            conversationId: this.conversationId,
            memberType: memberType.MEMBER_GROUP
        };
        this.listFriendGroup = [];
        this.listNameInvite = [];
        this.listInvite = [];
        this.showNoData = false;
    }

    componentDidMount() {
        super.componentDidMount();
        this.getSourceUrlPath();
        this.handleRequest();
        this.getUserProfile();
    }

    handleRequest() {
        this.props.getMemberGroupChatView(this.filter);
    }

    /**
     * Get information user profile
     */
    getUserProfile = () => {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE).then((user) => {
            //this callback is executed when your Promise is resolved
            if (!Utils.isNull(user)) {
                this.user = user;
                this.filter.companyId = user.company.id;
                this.filter.branchId = !Utils.isNull(user.branch) ? user.branch.id : null;
                this.handleRequest();
            }
        }).catch((error) => {
            this.saveException(error, "getUserProfile");
        });
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.handleData()
        }
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data;
        console.log("get friend data: ", this.listFriendGroup);
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.GET_MEMBER_GROUP_CHAT_VIEW)) {
                    if(this.filter.paging.page == 0) {
                        this.listFriendGroup = [];
                    }
                    if (data.data.length > 0) {
                        this.state.enableLoadMore = !(data.data.length < 20);
                        data.data.forEach(item => {
                            if (this.listFriendGroup.indexOf(item) == -1) {
                                this.listFriendGroup.push({ ...item });
                            }
                        })
                    } else {
                        this.showNoData = true
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.DELETE_CONVERSATION)) {
                    this.setState({
                        isAlertDelete: false
                    });
                    this.showMessage(localizes("listChatView.exitGroupSuccess"));
                    this.onBackConversation();
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
                this.showNoData = true
            }
            this.state.refreshing = false;
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    //onRefreshing
    handleRefresh = () => {
        // this.state.refreshing = true;
        // this.state.enableLoadMore = false;
        // this.state.nameGroup = null;
        this.filter.paging.page = 0;
        this.filter.stringSearch = null;
        // this.listFriends = [];
        this.handleRequest();
    }

    /**
     * Get more notification
     */
    getMoreFriends = () => {
        this.state.isLoadingMore = true;
        this.filter.paging.page += 1;
        this.props.getMemberGroupChatView(this.filter);
    }

    render() {
        var { data } = this.props;
        const { isSearch } = this.state;
        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={[commonStyles.header]}>
                        {this.renderHeaderView({
                            visibleBack: true,
                            title: "Thành viên nhóm",
                            titleStyle: { color: Colors.COLOR_WHITE },
                            renderRightMenu: this.renderRightMenu
                        })}
                    </Header>
                    <FlatListCustom
                        ListHeaderComponent={this.renderHeaderFlatList}
                        contentContainerStyle={{
                            paddingVertical: Constants.PADDING_LARGE
                        }}
                        style={[{
                            backgroundColor: Colors.COLOR_BACKGROUND
                        }]}
                        keyExtractor={item => item.code}
                        data={this.listFriendGroup}
                        renderItem={this.renderItemRow}
                        enableRefresh={this.state.enableRefresh}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }
                        enableLoadMore={this.state.enableLoadMore}
                        onLoadMore={() => {
                            this.getMoreFriends()
                        }}
                        showsVerticalScrollIndicator={false}
                        isShowEmpty={this.showNoData}
                        textForEmpty={isSearch ? 'Không có kết quả tìm kiếm phù hợp' : 'Không có dữ liệu'}
                    />
                    {this.state.isLoadingMore || this.state.refreshing ? null : this.showLoadingBar(this.props.isLoading)}
                    {this.renderDialogDelete()}
                </Root>
            </Container>
        );
    }

    /**
     * On submit editing
     */
    onSubmitEditing = () => {

    }

    /**
     * Render header flat list
     */
    renderHeaderFlatList = () => {
        const { avatarTemp } = this.state;
        return (
            <View>
                {/* <Text style={[commonStyles.textBold, {margin: Constants.MARGIN_X_LARGE }]} >THÀNH VIÊN NHÓM</Text> */}
            </View>
        )
    }

    onSearch(text) {
        this.filter = {
            stringSearch: text,
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            }
        };
        if (!Utils.isNull(text)) {
            // this.listFriends = []
            this.props.getMemberGroupChatView(this.filter);
        } else {
            this.handleRefresh()
        }
    }

    /**
     * on toggle search
     */
    onToggleSearch() {
        if (!this.state.isSearch) {
            this.setState({
                isSearch: !this.state.isSearch
            }, () => { this.txtSearch.focus() });
        } else {
            this.setState({
                txtSearch: null,
                isSearch: !this.state.isSearch
            })
        }
    }

    /**
     * Manager text input search 
     * @param {*} stringSearch 
     */
    onChangeTextInput = (stringSearch) => {
        const self = this;
        if (self.state.typingTimeout) {
            clearTimeout(self.state.typingTimeout)
        }
        this.setState({
            txtSearch: stringSearch == "" ? null : stringSearch,
            typing: false,
            typingTimeout: setTimeout(() => {
                if (!Utils.isNull(stringSearch)) {
                    this.onSearch(stringSearch)
                } else {
                    this.handleRefresh()
                }
            }, 700)
        });
    }


    /**
     * Render item
     */
    renderItemRow = (item, index, parentIndex, indexInParent) => {
        return (
            <ItemFriend
                key={index}
                item={item}
                type={screenType.FROM_CHAT_VIEW}
                index={index}
                onClickItem={this.onClickItemUser}
                resourceUrlPathResize={!Utils.isNull(this.resourceUrlPathResize) ? this.resourceUrlPathResize : ""}
                onPress={() => this.onPressedItem(item, index)}
            />
        )
    }

    /**
     * set title and content for model item 
     * @param {*} title
     * @param {*} content
     */
    onPressedItem(item, index) {

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
     * render right menu
     */
    renderRightMenu = () => {
        return (
            <View style={{}}>
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

}

const mapStateToProps = state => ({
    data: state.memberChat.data,
    isLoading: state.memberChat.isLoading,
    error: state.memberChat.error,
    errorCode: state.memberChat.errorCode,
    action: state.memberChat.action
})

const mapDispatchToProps = {
    ...actions,
    ...userActions
};

export default connect(mapStateToProps, mapDispatchToProps)(ListMemberChatView)