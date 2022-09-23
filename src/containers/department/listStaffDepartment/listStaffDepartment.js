import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    RefreshControl,
    BackHandler
} from 'react-native';
import BaseView from 'containers/base/baseView';
import * as actions from "actions/userActions";
import * as commonActions from "actions/commonActions";
import * as companyActions from "actions/companyActions";
import * as userActions from "actions/userActions";
import * as faceActions from "actions/faceActions";
import { connect } from "react-redux";
import { ErrorCode } from "config/errorCode";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { Constants } from 'values/constants';
import Utils from 'utils/utils';
import { Content, Container, Root, Header } from 'native-base';
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger
} from "react-native-popup-menu";
import styles from './styles';
import commonStyles from "styles/commonStyles";
import { Colors } from 'values/colors';
import FlatListCustom from 'components/flatListCustom';
import ItemStaffDepartment from './itemStaffDepartment';
import { localizes } from 'locales/i18n';
import DialogCustom from 'components/dialogCustom';
import ModalDeleteStaff from './modalDeleteStaff';
import DateUtil from 'utils/dateUtil';
import StorageUtil from 'utils/storageUtil';
import screenType from 'enum/screenType';
import ic_cancel from 'images/ic_cancel.png';
import ic_search_black from 'images/ic_search_black.png';
import ic_search_white from "images/ic_search_white.png";
import ic_menu_gray from "images/ic_menu_gray.png";
import ic_filter_gray from "images/ic_filter_gray.png";
import statusType from 'enum/statusType';
import { configConstants } from 'values/configConstants';

const PERSON_GROUP_ID = configConstants.PERSON_GROUP_ID;

class ListStaffDepartmentView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            enableLoadMore: false,
            enableRefresh: true,
            isLoadingMore: false,
            refreshing: true,
            listStaffDepartment: [],
            isShowMenu: false,
            textDepartmentName: "Phòng ban",
            statusName: "Trạng thái",
            isAlertDelete: false,
            typing: false,
            typingTimeout: 0,
            isSearch: false,
            txtSearch: null,
            contentText: '',
            userActionStatus: null
        };
        const { departmentId, nameDepartment } = this.props.navigation.state.params;
        this.departmentId = !Utils.isNull(departmentId) ? departmentId : null;
        this.nameDepartment = !Utils.isNull(nameDepartment) ? nameDepartment : null;
        this.filter = {
            companyId: null,
            branchId: null,
            departmentId: this.departmentId,
            stringSearch: null,
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            },
            status: null
        };
        this.filterDepartment = {
            companyId: null,
            branchId: null,
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            },
        }
        this.listDepartment = [];
        this.listStatus = [
            {
                id: null,
                name: "Trạng thái"
            },
            {
                id: statusType.ACTIVE,
                name: "Kích hoạt"
            },
            {
                id: statusType.DRAFT,
                name: "Chờ duyệt"
            },
            {
                id: statusType.SUSPENDED,
                name: "Xóa tạm thời"
            }
        ];
        this.showNoData = false;
        this.dataDelete = null;
    }

    componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
        this.getSourceUrlPath();
        StorageUtil.retrieveItem(StorageUtil.COMPANY_INFO).then((companyInfo) => {
            this.filter.companyId = companyInfo.company.id;
            this.filter.branchId = !Utils.isNull(companyInfo.branch) ? companyInfo.branch.id : null;
            this.filterDepartment.companyId = companyInfo.company.id;
            this.filterDepartment.branchId = !Utils.isNull(companyInfo.branch) ? companyInfo.branch.id : null;
            this.handleRequest();
        }).catch((error) => {
            this.saveException(error, 'componentDidMount')
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
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                this.state.isLoadingMore = false;
                if (this.props.action == getActionSuccess(ActionEvent.GET_LIST_STAFF_DEPARTMENT)) {
                    this.state.refreshing = false;
                    if (!Utils.isNull(data)) {
                        if (data.paging.page == 0) {
                            this.state.listStaffDepartment = [];
                        }
                        this.state.enableLoadMore = !(data.data.length < Constants.PAGE_SIZE);
                        if (data.data.length > 0) {
                            data.data.forEach(item => {
                                this.state.listStaffDepartment.push({ ...item });
                            });
                        }
                        console.log("GET_LIST_STAFF_DEPARTMENT", this.state.listStaffDepartment)
                    }
                    this.showNoData = true;
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_LIST_DEPARTMENT)) {
                    if (!Utils.isNull(data)) {
                        this.listDepartment = [];
                        if (data.length > 0) {
                            let itemAll = {
                                id: null,
                                name: "Tất cả"
                            };
                            this.listDepartment.push(itemAll);
                            data.forEach(item => {
                                this.listDepartment.push({ ...item });
                            });
                        }
                    }
                    this.props.getListStaffDepartment(this.filter);
                } else if (this.props.action == getActionSuccess(ActionEvent.DENIED_STAFF)) {
                    if (!Utils.isNull(data)) {
                        if (data) {
                            this.hideModal();
                            this.props.getListStaffDepartment(this.filter);
                            if (this.state.userActionStatus === statusType.ACTIVE) {
                                this.showMessage(localizes("department.restoreStaffSuccess"));
                            } else if (this.state.userActionStatus === statusType.DELETE) {
                                if (!Utils.isNull(this.personId)) {
                                    this.props.deletePersonGroupPerson({
                                        personGroupId: PERSON_GROUP_ID,
                                        personId: this.personId
                                    });
                                    this.showMessage(localizes("department.deleteStaffSuccess"));
                                }
                            } else if (this.state.userActionStatus === statusType.SUSPENDED) {
                                this.showMessage(localizes("department.suspendedStaffSuccess"));
                            }
                        }
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    //onHandleRequest
    handleRequest = () => {
        this.props.getListDepartment(this.filterDepartment);
    }

    //onRefreshing
    handleRefresh = () => {
        this.state.refreshing = true;
        this.filter.stringSearch = null;
        this.filter.paging.page = 0;
        this.handleRequest();
    }

    //onLoadMore
    onLoadMore = () => {
        if (!this.props.isLoading) {
            this.state.isLoadingMore = true;
            this.filter.paging.page += 1;
            this.handleRequest();
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    render() {
        const { isSearch, listStaffDepartment } = this.state;
        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={commonStyles.header}>
                        {this.renderHeaderView({
                            visibleBack: true,
                            title: isSearch ? "" : "Danh sách nhân viên",
                            visibleSearchBar: isSearch,
                            onPressRightSearch: () => {
                                this.filter.stringSearch = null;
                                this.onToggleSearch();
                                this.handleRefresh();
                            },
                            iconRightSearch: ic_cancel,
                            placeholder: localizes("search"),
                            onRef: ref => {
                                this.txtSearch = ref
                            },
                            iconLeftSearch: ic_search_black,
                            styleIconLeftSearch: { width: 20, height: 20 },
                            autoFocus: true,
                            onSubmitEditing: this.onSubmitEditing,
                            onPressLeftSearch: this.onChangeTextInput,
                            renderMidMenu: this.renderMidMenu,
                            titleStyle: { textAlign: 'center', color: Colors.COLOR_WHITE },
                            onChangeTextInput: this.onChangeTextInput,
                            renderRightMenu: this.renderRightMenu,
                        })}
                    </Header>
                    <FlatListCustom
                        ref={(r) => { this.listRef = r }}
                        ListHeaderComponent={this.renderListHeaderComponent}
                        contentContainerStyle={{
                            flexGrow: 1,
                            backgroundColor: listStaffDepartment.length > 0 ? Colors.COLOR_WHITE : Colors.COLOR_BACKGROUND
                        }}
                        style={{ flex: 1 }}
                        data={listStaffDepartment}
                        renderItem={this.renderItem}
                        enableRefresh={this.state.enableRefresh}
                        refreshControl={
                            <RefreshControl
                                progressViewOffset={Constants.HEIGHT_HEADER_OFFSET_REFRESH}
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }
                        enableLoadMore={this.state.enableLoadMore}
                        onLoadMore={this.onLoadMore}
                        showsVerticalScrollIndicator={false}
                        isShowEmpty={this.showNoData}
                        isShowImageEmpty={true}
                        textForEmpty={localizes("noData")}
                        styleEmpty={{ marginTop: Constants.MARGIN_X_LARGE }}
                    />
                    <ModalDeleteStaff
                        ref={'modalDeleteStaff'}
                        onConfirm={this.onConfirm}
                    />
                    {this.state.isLoadingMore || this.state.refreshing ? null : this.showLoadingBar(this.props.isLoading)}
                    {this.renderAlertDelete()}
                </Root>
            </Container>
        );
    }

    /**
     * Render list header component
     */
    renderListHeaderComponent = () => {
        return (
            <View style={[styles.filter]} >
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    onPress={() => this.menuOption.open()}
                    style={[commonStyles.viewHorizontal, { padding: Constants.PADDING_LARGE, alignItems: 'center' }]}
                >
                    <View>
                        <Image source={ic_menu_gray} />
                        {this.renderMenuOption()}
                    </View>
                    <Text style={[commonStyles.text, { margin: 0, marginLeft: Constants.MARGIN_LARGE }]}>
                        {this.state.textDepartmentName}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    onPress={() => this.menuOptionStatus.open()}
                    style={[commonStyles.viewHorizontal, {
                        padding: Constants.PADDING_LARGE,
                        alignItems: 'center',
                        justifyContent: "flex-end",
                    }]}>
                    <Text style={[commonStyles.text, { margin: 0, marginRight: Constants.MARGIN_LARGE }]}>
                        {this.state.statusName}
                    </Text>
                    <View>
                        <Image source={ic_filter_gray} />
                        {this.renderMenuOptionStatus()}
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    /**
     * Open modal Week
     */
    openModal() {
        this.refs.modalDeleteStaff.showModal();
    }

    /**
     * hide Modal Week
     */
    hideModal() {
        this.refs.modalDeleteStaff.hideModal();
    }

    /**
     * Render menu option
     */
    renderMenuOption = () => {
        return (
            <Menu
                style={{
                    top: Constants.MARGIN
                }}
                ref={ref => (this.menuOption = ref)}
            >
                <MenuTrigger text="" />
                <MenuOptions>
                    {this.listDepartment.map((item, index) => {
                        return (
                            <MenuOption
                                key={index.toString()}
                                onSelect={() => {
                                    this.filter.departmentId = item.id;
                                    this.filter.paging.page = 0;
                                    this.state.textDepartmentName = item.name;
                                    this.props.getListStaffDepartment(this.filter);
                                }}
                            >
                                <View
                                    style={[
                                        commonStyles.viewHorizontal,
                                        {
                                            alignItems: "center",
                                            padding: Constants.MARGIN
                                        }
                                    ]}
                                >
                                    <Text numberOfLines={1} style={[commonStyles.text]}>{item.name}</Text>
                                </View>
                            </MenuOption>
                        )
                    })}
                </MenuOptions>
            </Menu>
        );
    };

    /**
     * Render menu option
     */
    renderMenuOptionStatus = () => {
        return (
            <Menu
                style={{
                    top: Constants.MARGIN
                }}
                ref={ref => (this.menuOptionStatus = ref)}
            >
                <MenuTrigger text="" />
                <MenuOptions>
                    {this.listStatus.map((item, index) => {
                        return (
                            <MenuOption
                                key={index.toString()}
                                onSelect={() => {
                                    this.filter.status = item.id;
                                    this.filter.paging.page = 0;
                                    this.state.statusName = item.name;
                                    this.props.getListStaffDepartment(this.filter);
                                }}
                            >
                                <View
                                    style={[
                                        commonStyles.viewHorizontal,
                                        {
                                            alignItems: "center",
                                            padding: Constants.MARGIN
                                        }
                                    ]}
                                >
                                    <Text numberOfLines={1} style={[commonStyles.text]}>{item.name}</Text>
                                </View>
                            </MenuOption>
                        )
                    })}
                </MenuOptions>
            </Menu>
        );
    };

    onSearch(text) {
        this.filter.stringSearch = text;
        if (!Utils.isNull(text)) {
            this.props.getListStaffDepartment(this.filter);
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
            }, 1000)
        });
    }

    /**
     * On submit editing
     */
    onSubmitEditing = () => {

    }

    /**
     * Render mid menu
     */
    renderMidMenu = () => {
        return !this.state.isSearch && <View style={{ flex: 1 }} />
    }

    /**
     * Render right menu
     */
    renderRightMenu = () => {
        return (
            <View style={{}}>
                {this.state.isSearch ?
                    <View></View> :
                    <TouchableOpacity
                        activeOpacity={Constants.ACTIVE_OPACITY}
                        style={{ padding: Constants.PADDING_LARGE }}
                        onPress={() => this.onToggleSearch()}>
                        <Image
                            style={{ resizeMode: 'contain' }}
                            source={ic_search_white} />
                    </TouchableOpacity>
                }
            </View>
        )
    }


    /**
     * Render item
     */
    renderItem = (item, index, parentIndex, indexInParent) => {
        const resourceUrlPathResize = !Utils.isNull(this.resourceUrlPathResize) ? this.resourceUrlPathResize.textValue : null;
        return (
            <ItemStaffDepartment
                key={index.toString()}
                item={item}
                index={index}
                urlPathResize={resourceUrlPathResize}
                onPress={this.onPressItem}
                onPressApproved={this.onPressApprovedItem}
                onPressDenied={this.onPressDeniedItem}
                lengthData={this.state.listStaffDepartment.length}
            />
        )
    }

    /**
     * On confirm delete item
     */
    onConfirm = (data) => {
        this.state.userActionStatus = data;
        let filter = {
            userType: data
        }
        this.props.deniedStaff({ filter, userId: this.userItemId });
    }

    /**
     * On press approved item
     */
    onPressApprovedItem = (data) => {
        this.props.navigation.navigate("ConfigStaff", {
            staffId: data.id,
            isApproval: data.status == statusType.DRAFT,
            callback: this.handleRefresh
        });
    }

    /**
     * On press denied item
     */
    onPressDeniedItem = (data, status) => {
        this.userItemId = data.id;
        this.personId = data.personId;
        if (Utils.isNull(status)) {
            this.openModal();
        } else if (status == statusType.ACTIVE) {
            this.setState({
                isAlertDelete: true,
                contentText: "Bạn có muốn khôi phục tài khoản này không?",
                userActionStatus: statusType.ACTIVE
            });
        } else {
            this.setState({
                isAlertDelete: true,
                contentText: "Bạn có muốn xóa tài khoản này không?",
                userActionStatus: statusType.DELETE
            });
        }
    }

    /**
     * On press item
     */
    onPressItem = (data) => {
        this.props.navigation.navigate("UserInfo", {
            userInfo: !Utils.isNull(data) ? data : null,
            screen: screenType.FROM_STAFF_DEPARTMENT,
            callBack: this.handleRefresh
        })
    }

    /**
     * Render alert delete
     */
    renderAlertDelete() {
        return (
            <DialogCustom
                visible={this.state.isAlertDelete}
                isVisibleTitle={true}
                isVisibleContentText={true}
                isVisibleTwoButton={true}
                contentTitle={localizes('notification')}
                textBtnOne={"Không"}
                textBtnTwo={"Có"}
                contentText={this.state.contentText}
                onTouchOutside={() => { this.setState({ isAlertDelete: false }) }}
                onPressX={() => {
                    this.setState({ isAlertDelete: false });
                }}
                onPressBtnPositive={() => {
                    this.setState({ isAlertDelete: false });
                    let filter = {
                        userType: this.state.userActionStatus,
                    }
                    this.props.deniedStaff({ filter, userId: this.userItemId });
                }}
            />
        )
    }

}

const mapStateToProps = state => ({
    data: state.company.data,
    action: state.company.action,
    isLoading: state.company.isLoading,
    error: state.company.error,
    errorCode: state.company.errorCode

});

const mapDispatchToProps = {
    ...actions,
    ...commonActions,
    ...companyActions,
    ...userActions,
    ...faceActions
};

export default connect(mapStateToProps, mapDispatchToProps)(ListStaffDepartmentView);