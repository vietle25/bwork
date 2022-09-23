import React, { Component } from 'react';
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
import { connect } from 'react-redux';
import ImageLoader from 'components/imageLoader';
import ic_check_box_green from 'images/ic_check_box_green.png';
import ic_close_red from 'images/ic_close_red.png';
import ic_restore_red from 'images/ic_restore_red.png';
import ic_delete_red from 'images/ic_delete_red.png';
import ic_pencil_green from 'images/ic_pencil_green.png';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const PADDING_BUTTON = Constants.PADDING_X_LARGE - 4;
const WIDTH_HEIGHT_AVATAR = 48;

const screen = Dimensions.get("window");
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

class ItemStaffDepartment extends BaseView {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { item, index, urlPathResize, onPress, lengthData } = this.props;
        let parseItem = {
            name: !Utils.isNull(item.name) ? item.name : "-",
            avatar: !Utils.isNull(item.avatarPath) ? item.avatarPath : "",
            email: !Utils.isNull(item.email) ? item.email : "-",
            departmentName: !Utils.isNull(item.department) ? item.department.name : "Chưa có phòng ban",
            status: item.status
        };
        let hasHttp = !Utils.isNull(parseItem.avatar) && item.avatarPath.indexOf('http') != -1;
        let avatar = hasHttp ? item.avatarPath
            : urlPathResize + "=" + global.companyIdAlias + "/" + item.avatarPath;
        return (
            <ScrollView
                ref={ref => this.scrollView = ref}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[{
                    justifyContent: "center",
                    alignItems: "center",
                }]}
                horizontal={true}
                style={{ flex: 1, flexDirection: 'row' }}>
                <TouchableOpacity
                    style={{ flex: 1, width: width }}
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    onPress={() => {
                        onPress(item);
                    }}
                >
                    <View style={[commonStyles.viewHorizontal, {
                        marginLeft: Constants.MARGIN_X_LARGE,
                        marginRight: Constants.MARGIN_LARGE,
                        paddingVertical: Constants.MARGIN_LARGE,
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        borderBottomWidth: lengthData - 1 != index ? Constants.BORDER_WIDTH : 0,
                        borderColor: Colors.COLOR_BACKGROUND
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
                                    path={avatar}
                                />
                            </View>
                            <View style={[commonStyles.viewHorizontal, { alignItems: "center" }]}>
                                <View style={{ flex: 1, justifyContent: 'flex-start', marginLeft: Constants.MARGIN_X_LARGE }}>
                                    <View style={commonStyles.viewSpaceBetween}>
                                        <Text numberOfLines={1} style={[commonStyles.textBold, {
                                            marginVertical: Constants.MARGIN,
                                            margin: 0,
                                        }]}>{parseItem.name}</Text>
                                    </View>
                                    <View style={commonStyles.viewSpaceBetween}>
                                        <Text numberOfLines={2} style={[commonStyles.text, {
                                            flex: 1,
                                            color: Colors.COLOR_GRAY,
                                            margin: 0,
                                        }]}>{parseItem.email}</Text>
                                    </View>
                                    <View style={commonStyles.viewSpaceBetween}>
                                        <Text numberOfLines={2} style={[commonStyles.text, {
                                            flex: 1,
                                            color: Colors.COLOR_GRAY,
                                            margin: 0,
                                        }]}>{parseItem.departmentName}</Text>
                                    </View>
                                </View>
                                {this.renderApprovalStatus(parseItem.status)}

                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        );
    }

    /**
     * Render icon approved
     */
    renderApprovalStatus = (approvalStatus) => {
        const { item, onPressApproved, onPressDenied } = this.props;
        switch (approvalStatus) {
            case statusType.DRAFT:
                return (
                    <View style={{ flexDirection: 'row' }}>
                        {/* Button approved */}
                        <TouchableOpacity
                            activeOpacity={Constants.ACTIVE_OPACITY}
                            onPress={() => { onPressApproved(item) }}
                            style={{ alignItems: 'center', padding: Constants.PADDING }}>
                            <Image source={ic_check_box_green} />
                            <Text style={[commonStyles.text, { marginVertical: 0, color: Colors.COLOR_GRAY }]}>
                                Duyệt
                            </Text>
                        </TouchableOpacity>
                        {/* Button denied */}
                        <TouchableOpacity
                            activeOpacity={Constants.ACTIVE_OPACITY}
                            onPress={() => { onPressDenied(item, statusType.DELETE) }}
                            style={{ alignItems: 'center', padding: Constants.PADDING }}>
                            <Image source={ic_delete_red} />
                            <Text style={[commonStyles.text, { marginVertical: 0, color: Colors.COLOR_GRAY }]}>
                                Xóa
                            </Text>
                        </TouchableOpacity>
                    </View>
                );
            case statusType.ACTIVE:
                return (
                    <View style={{ flexDirection: 'row' }}>
                        {/* Button config */}
                        <TouchableOpacity
                            activeOpacity={Constants.ACTIVE_OPACITY}
                            onPress={() => { onPressApproved(item) }}
                            style={{ alignItems: 'center', padding: Constants.PADDING }}>
                            <Image source={ic_pencil_green} />
                            <Text style={[commonStyles.text, { marginVertical: 0, color: Colors.COLOR_GRAY }]}>
                                Cấu hình
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={Constants.ACTIVE_OPACITY}
                            onPress={() => { onPressDenied(item, null) }}
                            style={{ alignItems: 'center', padding: Constants.PADDING }}>
                            <Image source={ic_delete_red} />
                            <Text style={[commonStyles.text, { marginVertical: 0, color: Colors.COLOR_GRAY }]}>
                                Xóa
                            </Text>
                        </TouchableOpacity>
                    </View>
                );
            case statusType.SUSPENDED:
                return (
                    <View style={{ flexDirection: 'row' }}>
                        {/* Button delete */}
                        <TouchableOpacity
                            activeOpacity={Constants.ACTIVE_OPACITY}
                            onPress={() => { onPressDenied(item, statusType.DELETE) }}
                            style={{ alignItems: 'center', padding: Constants.PADDING }}>
                            <Image source={ic_delete_red} />
                            <Text style={[commonStyles.text, { marginVertical: 0, color: Colors.COLOR_GRAY }]}>
                                Xóa
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={Constants.ACTIVE_OPACITY}
                            onPress={() => { onPressDenied(item, statusType.ACTIVE) }}
                            style={{ alignItems: 'center', padding: Constants.PADDING }}>
                            <Image source={ic_restore_red} />
                            <Text style={[commonStyles.text, { marginVertical: 0, color: Colors.COLOR_GRAY }]}>
                                Khôi phục
                            </Text>
                        </TouchableOpacity>
                    </View>
                );
            default:
                return null;
        }
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

export default ItemStaffDepartment;