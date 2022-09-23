'use strict';
import React, { Component } from 'react';
import {
    Dimensions, View, TextInput, Image, StyleSheet, Text, PixelRatio, ImageBackground, Platform,
    TouchableHighlight, TouchableOpacity, Keyboard, ToastAndroid, ScrollView, Modal, BackHandler,
    RefreshControl
} from 'react-native';
import {
    Container, Form, Content, Input, Button, Right, Radio,
    center, ListItem, Left, Header, Item, Body, Root
} from 'native-base';
import ButtonComp from 'components/button';
import { capitalizeFirstLetter } from 'utils/stringUtil';
import cover from 'images/bg_launch.png';
import styles from './styles';
import { localizes } from 'locales/i18n';
import BaseView from 'containers/base/baseView';
import commonStyles from 'styles/commonStyles';
import I18n from 'react-native-i18n';
import { Colors } from 'values/colors';
import { Fonts } from 'values/fonts';
import { Constants } from 'values/constants';
import Utils from 'utils/utils';
import { connect } from 'react-redux';
import StorageUtil from 'utils/storageUtil';
import { ErrorCode } from 'config/errorCode';
import { getActionSuccess, ActionEvent } from 'actions/actionEvent';
import * as actions from 'actions/userActions'
import GenderType from 'enum/genderType';
import StringUtil from 'utils/stringUtil';
import ImagePicker from 'react-native-image-crop-picker';
import DateUtil from 'utils/dateUtil';
import TextInputCustom from 'components/textInputCustom';
import ic_logo from "images/ic_logo.png";
import moment from 'moment';
import ic_transparent from "images/ic_transparent.png";
import ic_down_grey from "images/ic_down_grey.png";
import ic_department_black from "images/ic_department_black.png";
import ic_office_black from "images/ic_office_black.png";
import ic_staff_black from "images/ic_staff_black.png";
import screenType from 'enum/screenType';
import Hr from 'components/hr';
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger
} from "react-native-popup-menu";

const window = Dimensions.get("window");

class DepartmentView extends BaseView {

    constructor(props) {
        super(props);
        const { navigation } = this.props;
        this.state = {
            enableRefresh: false,
            refreshing: false,
            enableScrollViewScroll: true,
            branch: {
                id: null,
                name: null
            },
            department: {
                id: null,
                name: null
            },
            staff: {
                id: null,
                name: null
            }
        }
        this.userId = navigation.getParam('userId');
        this.company = navigation.getParam('company');
        this.fromScreen = navigation.getParam('fromScreen');
        this.callback = navigation.getParam('callback');
        this.branches = [{ id: null, name: "Chọn chi nhánh" }];
        this.departments = [{ id: null, name: "Chọn phòng ban" }];
        this.staffs = [{ id: null, name: "Chọn chức vụ" }];
        this.hasBranch = !Utils.isNull(this.company) && !Utils.isNull(this.company.branches);
    };

    componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
        if (!Utils.isNull(this.company)) {
            this.state.refreshing = true;
            this.props.getCompanyDetail(this.company.id);
        }
    }

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                this.state.refreshing = false;
                if (this.props.action == getActionSuccess(ActionEvent.GET_COMPANY_DETAIL)) {
                    if (!Utils.isNull(data) && !Utils.isNull(data.branches)) {
                        this.branches = data.branches;
                    } else {
                        this.branches = [];
                    }
                    if (!Utils.isNull(data) && !Utils.isNull(data.departments)) {
                        this.departments = data.departments;
                    } else {
                        this.departments = [];
                    }
                    if (!Utils.isNull(data) && !Utils.isNull(data.staffs)) {
                        this.staffs = data.staffs;
                    } else {
                        this.staffs = [];
                    }
                    this.branches.unshift({ id: null, name: "Chọn chi nhánh" });
                    this.departments.unshift({ id: null, name: "Chọn phòng ban" });
                    this.staffs.unshift({ id: null, name: "Chọn chức vụ" });
                    this.state.department.id = null;
                    this.state.department.name = null;
                    this.state.staff.id = null;
                    this.state.staff.name = null;
                    this.hasBranch = !Utils.isNull(data.branches);
                } else if (this.props.action == getActionSuccess(ActionEvent.UPDATE_DEPARTMENT)) {
                    if (this.fromScreen == screenType.FROM_SPLASH
                        || this.fromScreen == screenType.FROM_LOGIN) {
                        this.callback();
                    } else {
                        this.goWorkingPolicy();
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    /**
     * Go working policy
     */
    goWorkingPolicy = () => {
        this.props.navigation.pop();
        this.props.navigation.navigate("WorkingPolicy", {
            'screen': screenType.FROM_LOGIN,
            'companyId': this.company.id,
            'branchId': this.state.branch.id
        });
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    /**
     * Handle refresh
     */
    handleRefresh = () => {
        if (!Utils.isNull(this.company)) {
            this.state.refreshing = true;
            this.props.getCompanyDetail(this.company.id);
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener(
            "hardwareBackPress",
            this.handlerBackButton
        );
    }

    /**
     * Handler back button
     */
    handlerBackButton() {
        if (this.props.navigation) {
            if (this.fromScreen == screenType.FROM_REGISTER) {
                // this.goWorkingPolicy();
            } else {
                BackHandler.exitApp();
            }
        } else {
            return false
        }
        return true;
    }

    renderRightMenu = () => {
        return (
            !this.hasBranch
            && <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                onPress={() => {
                    if (this.fromScreen == screenType.FROM_REGISTER) {
                        this.goWorkingPolicy();
                    } else {
                        this.callback();
                    }
                }}>
                <Text style={[commonStyles.text, { color: Colors.COLOR_WHITE }]}>Bỏ qua</Text>
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={commonStyles.header}>
                        {this.renderHeaderView({
                            visibleBack: false,
                            title: "THÔNG TIN CÔNG VIỆC",
                            titleStyle: { color: Colors.COLOR_WHITE },
                            renderRightMenu: this.renderRightMenu
                        })}
                    </Header>
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        style={{ flex: 1 }}
                        keyboardShouldPersistTaps="handled"
                        ref={r => (this._container = r)}
                        scrollEnabled={this.state.enableScrollViewScroll}
                        enableRefresh={this.state.enableRefresh}
                        refreshControl={
                            <RefreshControl
                                progressViewOffset={Constants.HEIGHT_HEADER_OFFSET_REFRESH}
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }
                    >
                        <View style={{ flexGrow: 1 }}>
                            <View style={{ padding: Constants.MARGIN_X_LARGE }}>
                                <Text style={[commonStyles.textBold, { marginHorizontal: 0 }]}>
                                    Công ty: <Text style={[commonStyles.text]}>{this.company.name}</Text>
                                </Text>
                                {/* <Text style={[commonStyles.text, { marginHorizontal: 0 }]}>
                                    Chọn chi nhánh của bạn, phòng ban và chức vụ của bạn.
                                </Text> */}
                            </View>
                            {/* {Input form} */}
                            <Form style={{ flex: 1 }}>
                                <View style={{
                                    paddingHorizontal: Constants.PADDING_X_LARGE,
                                    backgroundColor: Colors.COLOR_WHITE,
                                    borderRadius: Constants.CORNER_RADIUS,
                                    margin: Constants.MARGIN_X_LARGE
                                }}>
                                    {/* Branch */}
                                    {this.branches.length > 1
                                        && <View>
                                            <TextInputCustom
                                                refInput={input => {
                                                    this.branch = input
                                                }}
                                                onPress={() => this.menuOptionBranch.open()}
                                                isInputAction={true}
                                                placeholder={"Chọn chi nhánh"}
                                                value={!Utils.isNull(this.state.branch.id) ? this.state.branch.name : ""}
                                                inputNormalStyle={{
                                                    paddingVertical: Constants.MARGIN_LARGE + Constants.MARGIN
                                                }}
                                                contentLeft={ic_office_black}
                                                contentRight={
                                                    <Image source={ic_down_grey} />
                                                }
                                            />
                                            {this.renderMenuBranch(this.branches)}
                                        </View>
                                    }
                                    {/* Department */}
                                    {this.departments.length > 1
                                        && <View>
                                            <TextInputCustom
                                                refInput={input => {
                                                    this.department = input
                                                }}
                                                onPress={() => this.menuOptionDepartment.open()}
                                                isInputAction={true}
                                                placeholder={"Chọn phòng ban"}
                                                value={!Utils.isNull(this.state.department.id) ? this.state.department.name : ""}
                                                inputNormalStyle={{
                                                    paddingVertical: Constants.MARGIN_LARGE + Constants.MARGIN
                                                }}
                                                contentLeft={ic_department_black}
                                                contentRight={
                                                    <Image source={ic_down_grey} />
                                                }
                                            />
                                            {this.renderMenuDepartment(this.departments)}
                                        </View>
                                    }
                                    {/* Staff */}
                                    <View>
                                        <TextInputCustom
                                            refInput={input => {
                                                this.staff = input
                                            }}
                                            onPress={() => this.menuOptionStaff.open()}
                                            isInputAction={true}
                                            placeholder={"Chọn chức vụ"}
                                            value={!Utils.isNull(this.state.staff.id) ? this.state.staff.name : ""}
                                            inputNormalStyle={{
                                                paddingVertical: Constants.MARGIN_LARGE + Constants.MARGIN
                                            }}
                                            contentLeft={ic_staff_black}
                                            contentRight={
                                                <Image source={ic_down_grey} />
                                            }
                                            borderBottomWidth={0}
                                        />
                                        {this.renderMenuStaff(this.staffs)}
                                    </View>
                                </View>
                            </Form>
                            {/* Register */}
                            {this.renderCommonButton(
                                "CẬP NHẬT",
                                { color: Colors.COLOR_WHITE },
                                { marginHorizontal: Constants.MARGIN_X_LARGE },
                                () => { this.onPressRegister() }
                            )}
                        </View>
                    </ScrollView>
                    {this.state.refreshing ? null : this.showLoadingBar(this.props.isLoading)}
                </Root>
            </Container>
        )
    }

    /**
     * Render menu option
     */
    renderMenuBranch = () => {
        return (
            <Menu
                style={{}}
                ref={ref => (this.menuOptionBranch = ref)}>
                <MenuTrigger text="" />
                <MenuOptions>
                    {this.branches.map((item, index) => {
                        return (
                            <MenuOption
                                key={index.toString()}
                                onSelect={() => {
                                    let state = this.state;
                                    state.branch = item;
                                    this.setState(state);
                                }}>
                                <View
                                    style={[commonStyles.viewHorizontal, {
                                        alignItems: "center",
                                        padding: Constants.MARGIN
                                    }]}>
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
    renderMenuDepartment = () => {
        return (
            <Menu
                style={{}}
                ref={ref => (this.menuOptionDepartment = ref)}>
                <MenuTrigger text="" />
                <MenuOptions>
                    {this.departments.map((item, index) => {
                        return (
                            <MenuOption
                                key={index.toString()}
                                onSelect={() => {
                                    let state = this.state;
                                    state.department = item;
                                    this.setState(state);
                                }}>
                                <View
                                    style={[commonStyles.viewHorizontal, {
                                        alignItems: "center",
                                        padding: Constants.MARGIN
                                    }]}>
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
    renderMenuStaff = () => {
        return (
            <Menu
                style={{}}
                ref={ref => (this.menuOptionStaff = ref)}>
                <MenuTrigger text="" />
                <MenuOptions>
                    {this.staffs.map((item, index) => {
                        return (
                            <MenuOption
                                key={index.toString()}
                                onSelect={() => {
                                    let state = this.state;
                                    state.staff = item;
                                    this.setState(state);
                                }}>
                                <View
                                    style={[commonStyles.viewHorizontal, {
                                        alignItems: "center",
                                        padding: Constants.MARGIN
                                    }]}>
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
     * Register
     */
    onPressRegister() {
        const { department, branch, staff } = this.state;
        if (Utils.isNull(branch.id) && this.hasBranch) {
            this.showMessage("Vui lòng chọn chi nhánh!");
        } else {
            let filter = {
                userId: this.userId,
                branchId: branch.id,
                departmentId: department.id,
                staffId: staff.id
            }
            this.props.updateDepartment(filter);
        }
    }
}

const mapStateToProps = state => ({
    data: state.department.data,
    isLoading: state.department.isLoading,
    error: state.department.error,
    errorCode: state.department.errorCode,
    action: state.department.action
});

export default connect(mapStateToProps, actions)(DepartmentView);