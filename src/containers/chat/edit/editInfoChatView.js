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
import ServerPath from "config/Server";
import DialogCustom from "components/dialogCustom";
import screenType from "enum/screenType";
import slidingMenuType from "enum/slidingMenuType";
import ImageLoader from 'components/imageLoader';
import TextInputCustom from "components/textInputCustom";
import ImageResizer from 'react-native-image-resizer';
import ImagePicker from "react-native-image-picker";
import StringUtil from "utils/stringUtil";
import Upload from "react-native-background-upload";
import ic_search_black from 'images/ic_search_black.png';
import ic_camera_radio from 'images/ic_camera_radio.png';
import memberType from "enum/memberType";
import messageType from "enum/messageType";

const screen = Dimensions.get("window");
const CANCEL_INDEX = 2;
const FILE_SELECTOR = [
    localizes("camera"),
    localizes("image"),
    localizes("cancel")
];
const optionsCamera = {
    title: "Select avatar",
    storageOptions: {
        skipBackup: true,
        path: "images"
    }
};

class EditInfoChatView extends BaseView {

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
            typing: false,
            typingTimeout: 0,
            isSearch: false,
            txtSearch: null,
            nameGroup: null,
            visibleEdit: true,
            avatarTemp: null,
            isDisableButtonInvite: true,
        };
        const { type, conversationId, avatar, name, callback } = this.props.navigation.state.params;
        this.type = type;
        this.name = name;
        this.callback = callback;
        this.avatar = avatar;
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
            memberType: memberType.MEMBER_INVITE
        };
        this.listFriends = [];
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
        this.props.getFriendsChatView(this.filter);
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
                this.source = !Utils.isNull(this.resourceUrlPathResize) ? this.resourceUrlPathResize.textValue + "=" + global.companyIdAlias + "/" + this.avatar : '';
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
     * format title type
     */
    formatTitleType (type) {
        switch(type) {
            case screenType.FROM_CHAT_EDIT:
                return "Chỉnh sửa";
            case screenType.FROM_CHAT_INVITE:
                return "Thêm thành viên";
            default:
                return "";
        }
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data;
        console.log("get friend data: ", this.listFriends);
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.GET_FRIENDS_CHAT_VIEW)) {
                    if(this.filter.paging.page == 0) {
                        this.listFriends = [];
                    }
                    if (data.data.length > 0) {
                        this.state.enableLoadMore = !(data.data.length < 20);
                        data.data.forEach(item => {
                            if (this.listFriends.indexOf(item) == -1) {
                                this.listFriends.push({ ...item });
                            }
                        })
                    } else {
                        this.showNoData = true
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.EDIT_CHAT_GROUP)) {
                    if (!Utils.isNull(data)) {                      
                        this.type == screenType.FROM_CHAT_EDIT ? this.showMessage("Lưu thành công") 
                        : this.type == screenType.FROM_CHAT_INVITE ? this.showMessage("Thêm thành công") : null ;
                        if(this.type == screenType.FROM_CHAT_EDIT) {
                            this.props.navigation.navigate("Chat", {
                                group: {
                                    name: !Utils.isNull(this.state.nameGroup) ? this.state.nameGroup : this.nameGroup,
                                    avatar: !Utils.isNull(this.state.avatarTemp) ? this.state.avatarTemp : this.avatar,
                                },
                                conversationId: this.conversationId,
                            });
                            if(this.callback != null) {
                                this.callback();
                            }
                        } else {
                            this.props.navigation.goBack();
                        }
                    }
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
        this.filter.paging.page = 0;
        this.filter.stringSearch = null;
        this.handleRequest();
    }

    /**
     * Get more notification
     */
    getMoreFriends = () => {
        this.state.isLoadingMore = true;
        this.filter.paging.page += 1;
        this.props.getFriendsChatView(this.filter);
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
                            title: this.formatTitleType(this.type),
                            titleStyle: { color: Colors.COLOR_WHITE },
                        })}
                    </Header>
                    { this.type == screenType.FROM_CHAT_INVITE ? <FlatListCustom
                        ListHeaderComponent={this.renderHeaderFlatList}
                        contentContainerStyle={{
                            paddingVertical: Constants.PADDING_LARGE
                        }}
                        style={[{
                            backgroundColor: Colors.COLOR_BACKGROUND
                        }]}
                        keyExtractor={item => item.code}
                        data={this.listFriends}
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
                    /> : this.renderHeaderFlatList() }
                    {!Utils.isNull(this.type) ? <View
                        style={{
                            position: 'absolute',
                            alignSelf: 'center',
                            bottom: 0
                        }}>
                            {this.renderCommonButton(
                                this.type == screenType.FROM_CHAT_EDIT ? "Lưu lại" : this.type == screenType.FROM_CHAT_INVITE ? "Thêm thành viên" : "Cập nhật",
                                { color: Colors.COLOR_WHITE },
                                {
                                    backgroundColor: Colors.COLOR_PRIMARY,
                                    width: screen.width - Constants.PADDING_XX_LARGE,
                                },
                                () => this.validate(),
                                this.type == screenType.FROM_CHAT_EDIT ? null : this.state.isDisableButtonInvite ? ['gray', 'gray'] : null,
                                this.type == screenType.FROM_CHAT_EDIT ? false : this.state.isDisableButtonInvite ? true : false,
                            )}
                    </View> : null }
                    {this.renderFileSelectionDialog()}
                    {this.state.isLoadingMore || this.state.refreshing ? null : this.showLoadingBar(this.props.isLoading)}
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
     * validate name group
     */

    validate() {
        if (this.type == screenType.FROM_CHAT_INVITE) {
            let filter = {
                userInvited: this.listInvite,
                typeMessage: messageType.INVITE_STATUS,
                content: this.user.name + " đã mời " + this.listNameInvite[0] + (this.listNameInvite.length >= 2 ? `, ${this.listNameInvite[1]}` : ``) + (this.listNameInvite.length > 2 ? ` và ${this.listNameInvite.length - 2} người khác` : ``) + " tham gia nhóm",
            }
            this.props.editChatGroup({
                filter, conversationId: this.conversationId
            })
        } else {
            if (Utils.isNull(this.state.nameGroup) || this.state.nameGroup.trim().length == 0) {
                this.state.nameGroup = this.name;
                if(Utils.isNull(this.state.avatarTemp)) {
                    this.props.navigation.navigate("Chat", {
                        group: {
                            name: !Utils.isNull(this.state.nameGroup) ? this.state.nameGroup : this.nameGroup,
                            avatar: !Utils.isNull(this.state.avatarTemp) ? this.state.avatarTemp : this.avatar,
                        },
                        conversationId: this.conversationId,
                    });
                    return;
                }
            } 
            const { nameGroup } = this.state;
            if (Utils.isNull(nameGroup) || nameGroup.trim().length == 0) {
                this.showMessage(localizes("chat.vali_fill_fullname"));
            } else if (Utils.isNull(this.name) || StringUtil.validSpecialCharacter(nameGroup)) {
                this.showMessage(localizes("register.vali_fullname"));
            } else if (Utils.isNull(this.name) || nameGroup.length > 60 ) {
                this.showMessage(localizes("register.vali_fullname_length"));
            } else if (this.type == screenType.FROM_CHAT_EDIT) {
                if(!Utils.isNull(this.state.avatarTemp)) {
                    this.uploadImage();
                } else {
                    let filter = {
                        typeMessage: messageType.INVITE_STATUS,
                        content: this.user.name + " đã đặt tên nhóm là " + this.state.nameGroup.trim(),
                        name: !Utils.isNull(this.state.nameGroup) ? this.state.nameGroup.trim() : null,
                    };
                    this.props.editChatGroup({
                        filter, conversationId: this.conversationId
                    });
                }
            }
        }
    }

    /**
     * Render header flat list
     */
    renderHeaderFlatList = () => {
        const { avatarTemp } = this.state;
        return (
            <View>
            { this.type == screenType.FROM_CHAT_EDIT ? <View
            style={[
                commonStyles.viewCenter,
                { paddingVertical: Constants.PADDING_X_LARGE,
                backgroundColor: Colors.COLOR_WHITE }
            ]}>
            <TouchableOpacity
                style={[styles.imageSize, { overflow: "hidden" }]}
                activeOpacity={Constants.ACTIVE_OPACITY}
                onPress={this.state.visibleEdit && this.attachFile}
            >
                {Utils.isNull(avatarTemp) ? <ImageLoader
                    style={[styles.imageSize]}
                    resizeAtt={{
                        type: "thumbnail",
                        width: Constants.AVATAR_WIDTH_HEIGHT / 2,
                        height: Constants.AVATAR_WIDTH_HEIGHT / 2
                    }}
                    resizeModeType={"cover"}
                    path={!Utils.isNull(this.state.avatarTemp) ? 
                    this.state.avatarTemp : !Utils.isNull(this.source) ? this.source : "" }
                /> : 
                <Image
                    source={{ uri: avatarTemp }}
                    style={[styles.imageSize]}
                    resizeMode={'cover'}
                />
                }
                {this.state.visibleEdit ? <View
                    style={[
                        commonStyles.viewCenter,
                        {
                            backgroundColor: Colors.COLOR_BLACK_OPACITY_50,
                            position: "absolute",
                            width: "100%",
                            height: "30%",
                            bottom: 0,
                            left: 0
                        }
                    ]}
                >
                    <Image source={ic_camera_radio} />
                </View> : null}
            </TouchableOpacity>
            </View> : null }
            {/* Group name */}
            { this.type == screenType.FROM_CHAT_EDIT ? <View
                style={{ 
                    alignItems: 'center',
                    marginBottom: Constants.MARGIN_LARGE
                }}>
                {/* Full name */}
                <TextInputCustom
                    refInput={input => (this.nameGroup = input)}
                    isInputNormal={true}
                    placeholder={"Tên nhóm"}
                    placeholderTextColor={Colors.COLOR_RED}
                    value={!Utils.isNull(this.state.nameGroup) ? this.state.nameGroup : this.name}
                    onChangeText={nameGroup => this.setState({ nameGroup })}
                    onSubmitEditing={() => {
                                    
                    }}
                    textAlign={'center'}
                    returnKeyType={"next"}
                    inputNormalStyle={{
                        flex: 0,
                        width: screen.width / 2,
                        paddingVertical: Constants.PADDING_LARGE + Constants.MARGIN,
                    }}
                    borderBottomWidth={Constants.BORDER_WIDTH}
                    borderBottomColor={Colors.COLOR_DRK_GREY}
                />
            </View> : null }
            {/* search bar */}
            {this.type == screenType.FROM_CHAT_INVITE ? <View style={[styles.searchBar]}>
                {/*Left button*/}
                    <TouchableOpacity
                        style={{
                            paddingLeft: Constants.PADDING_X_LARGE
                        }}
                        onPress={() => {
                            this.props.onPressLeftSearch();
                        }}
                    >
                        <Image source={ic_search_black} style={{ width: 20, height: 20 }} />
                    </TouchableOpacity>
                <TextInput
                    style={[commonStyles.inputText, { flex: 1 }]}
                    placeholder={"Tìm kiếm"}
                    placeholderTextColor={Colors.COLOR_TEXT}
                    ref={ref => this.txtSearch = ref}
                    value={this.state.txtSearch}
                    onChangeText={this.onChangeTextInput}
                    onSubmitEditing={() => {
                        this.onSubmitEditing;
                        Keyboard.dismiss();
                    }}
                    keyboardType="default"
                    underlineColorAndroid="transparent"
                    returnKeyType={"search"}
                    blurOnSubmit={false}
                    autoCorrect={false}
                />
            </View> : null }
            {/* text offer */}
            {this.type == screenType.FROM_CHAT_INVITE ? <Text style={[commonStyles.textBold, {margin: Constants.MARGIN_X_LARGE }]} >ĐƯỢC ĐỀ XUẤT</Text> : null }
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
            this.props.getFriendsChatView(this.filter);
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
                type={this.type}
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
        // this.props.navigation.navigate("Chat", {
        //     userMember: {
        //         id: item.friendId,
        //         name: item.friendName,
        //         avatarPath: item.avatar
        //     }
        // });
    }

    /**
     * Attach file
     */
    attachFile = () => {
        this.showDialog();
    };

    /**
     * Show dialog
     */
    showDialog() {
        this.setState({
            visibleDialog: true
        });
    }

    /**
     * hide dialog
     */
    hideDialog() {
        this.setState({
            visibleDialog: false
        });
    }

    /**
     * Called when selected type
     * @param {*} index
     */
    onSelectedType(index) {
        if (index !== CANCEL_INDEX) {
            if (index === 0) {
                this.takePhoto();
            } else if (index === 1) {
                this.showDocumentPicker();
            }
        } else {
            this.hideDialog();
        }
    }

    /**
     * Take a photo
     */
    takePhoto = () => {
        ImagePicker.launchCamera(optionsCamera, response => {
            const { error, uri, originalRotation, didCancel } = response;
            this.hideDialog();
            if (uri && !error) {
                let rotation = Utils.rotateImage(originalRotation);
                ImageResizer.createResizedImage(uri, 800, 600, "JPEG", 80, rotation).
                    then(({ uri }) => {
                        this.setState({avatarTemp: uri})
                    }).catch(err => {
                        console.log(err)
                    })
            } else if (error) {
                console.log("The photo picker errored. Check ImagePicker.launchCamera func")
                console.log(error)
            }
        });
    };

    /**
     * Upload image
     */
    uploadImage() { 
        const { avatarTemp } = this.state;
        let uriReplace = avatarTemp;
        if (Platform.OS == "android") {
            uriReplace = avatarTemp.replace('file://', '');
        };
        let file = {
            fileType: "image/*",
            filePath: uriReplace
        };
        console.log("URI: ", file.filePath);
        const options = {
            url: ServerPath.API_URL + `user/conversation/${this.conversationId}/avatar/upload`,
            path: file.filePath,
            method: "POST",
            field: "file",
            type: "multipart",
            headers: {
                "Content-Type": "application/json", // Customize content-type
                "X-APITOKEN": global.token
            },
        };
        Upload.startUpload(options).then(uploadId => {
            console.log("Upload started", uploadId);
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
                    console.log(
                        "Hello!" + this.resourceUrlPathResize.textValue + "=" + global.companyIdAlias + "/" + result.data
                    );
                    if (!Utils.isNull(result.data)) {
                        this.setState({
                            avatarTemp: this.resourceUrlPathResize.textValue + "=" + global.companyIdAlias + "/" + result.data
                        });
                        // upload data
                        let filter = {
                            avatarGroup: result.data,
                            name: !Utils.isNull(this.state.nameGroup) ? this.state.nameGroup.trim() : null,
                            content: this.user.name + (!Utils.isNull(this.state.nameGroup) ? (" đã đặt tên nhóm là " + this.state.nameGroup.trim()) : " đã thay đổi ảnh nhóm"),
                            typeMessage: messageType.INVITE_STATUS
                        };
                        this.props.editChatGroup({
                            filter, conversationId: this.conversationId
                        });
                    }
                }
            });
        })
        .catch(error => {
            this.saveException(error, "showDocumentPicker");
        });
    }

    /**
     * Show document picker
     */
    showDocumentPicker = fileType => {
        const { params } = this.props.navigation.state;
        ImagePicker.launchImageLibrary(optionsCamera, response => {
            const { error, uri, originalRotation, didCancel } = response;
            this.hideDialog();
            if (uri && !error) {
                let rotation = 0;
                ImageResizer.createResizedImage(uri, 800, 600, "JPEG", 80, rotation).
                    then(({ uri }) => {
                        this.setState({avatarTemp: uri});
                    }).catch(err => {
                        console.log(err)
                    })
            } else if (error) {
                console.log("The photo picker errored. Check ImagePicker.launchCamera func")
                console.log(error)
            }
        });
    };

    /**
     * Render file selection dialog
     */
    renderFileSelectionDialog() {
        return (
            <DialogCustom
                visible={this.state.visibleDialog}
                isVisibleTitle={true}
                isVisibleContentForChooseImg={true}
                contentTitle={localizes("userInfoView.chooseImages")}
                onTouchOutside={() => {
                    this.setState({ visibleDialog: false });
                }}
                onPressX={() => {
                    this.setState({ visibleDialog: false });
                }}
                onPressCamera={() => {
                    this.onSelectedType(0);
                }}
                onPressGallery={() => {
                    this.onSelectedType(1);
                }}
            />
        );
    }

    /**
	 * On click item User
	 */
    onClickItemUser = (item, index) => { 
        let isPush = true;
        for (let i = this.listInvite.length - 1; i >= 0; i--) {
            if (this.listInvite[i] == item.id) {
                isPush = false;
                this.listInvite.splice(i, 1);
                this.listNameInvite.splice(i, 1);
                break;
            }
        }
        if (isPush) {
            this.listInvite.push(item.id);
            this.listNameInvite.push(item.name);
        }  
        if (this.listInvite.length == 0) {
            this.setState({
                isDisableButtonInvite: true
            })
        } else {
            this.setState({
                isDisableButtonInvite: false
            })
        }
    }

}

const mapStateToProps = state => ({
    data: state.editChat.data,
    isLoading: state.editChat.isLoading,
    error: state.editChat.error,
    errorCode: state.editChat.errorCode,
    action: state.editChat.action
})

const mapDispatchToProps = {
    ...actions,
    ...userActions
};

export default connect(mapStateToProps, mapDispatchToProps)(EditInfoChatView)