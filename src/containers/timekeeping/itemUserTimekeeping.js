import React, { Component } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    Image,
    Dimensions
} from 'react-native';
import FlatListCustom from 'components/flatListCustom';
import { Colors } from 'values/colors';
import { Constants } from 'values/constants';
import ItemTimekeeping from 'containers/home/timekeeping/itemTimekeeping';
import { localizes } from 'locales/i18n';
import screenType from 'enum/screenType';
import commonStyles from 'styles/commonStyles';
import Hr from 'components/hr';
import ic_check_box_green from "images/ic_check_box_green.png";
import ic_close_red from "images/ic_close_red.png";
import ic_add_green from "images/ic_add_green.png";
import ic_delete_red from "images/ic_delete_red.png";
import ic_pencil_green from "images/ic_pencil_green.png";
import approvalStatusType from 'enum/approvalStatusType';

const screen = Dimensions.get("screen");
const deviceWidth = screen.width;
const deviceHeight = screen.height;

class ItemUserTimekeeping extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.dataTimekeeping = this.props.item.timekeepingRecord;
        this.user = this.props.item.user;
        this.workingTimeConfig = this.props.item.workingTimeConfig;
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.dataTimekeeping = this.props.item.timekeepingRecord;
            this.user = this.props.item.user;
            this.workingTimeConfig = this.props.item.workingTimeConfig;
        }
    }

    render() {
        const { item, index, lengthData, onPress } = this.props;
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                onPress={() => onPress(item)}
                style={{ backgroundColor: Colors.COLOR_WHITE, marginTop: index === 0 ? 1 : 0 }}>
                <FlatListCustom
                    onRef={(ref) => { this.flatListRef = ref }}
                    ListHeaderComponent={this.renderHeaderFlatList}
                    style={{
                        backgroundColor: Colors.COLOR_WHITE
                    }}
                    horizontal={false}
                    data={this.dataTimekeeping}
                    itemPerCol={1}
                    renderItem={this.renderItem}
                    isShowImageEmpty={false}
                    textForEmpty={localizes("homeView.emptyListCheckIn")}
                    styleEmpty={{
                        alignItems: 'flex-start',
                        paddingLeft: Constants.PADDING_X_LARGE + Constants.PADDING
                    }}
                />
                {index != lengthData - 1 && <Hr style={{ marginHorizontal: Constants.MARGIN_X_LARGE }} />}
            </TouchableOpacity>
        );
    }

    /**
     * Render button aproval
     */
    renderButtonAproval = (data, typeCheck) => {
        const { onPressAprovalAction, item } = this.props;
        return (
            <View style={[{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginBottom: Constants.MARGIN / 2,
                marginRight: -Constants.MARGIN_LARGE
            }]}>
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    onPress={() => onPressAprovalAction(approvalStatusType.APPROVED, data, item.user, typeCheck)}
                    style={{
                        marginHorizontal: Constants.MARGIN_LARGE
                    }}>
                    <Image source={ic_check_box_green} />
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    onPress={() => onPressAprovalAction(approvalStatusType.DENIED, data, item.user, typeCheck)}
                    style={{
                        marginLeft: Constants.MARGIN_LARGE
                    }}>
                    <Image source={ic_close_red} />
                </TouchableOpacity>
            </View>
        )
    }

    /**
     * Render button edit
     */
    renderButtonEdit = (data) => {
        const { onPressAddAction, onPressDeleteAction } = this.props;
        return (
            <View style={[{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginBottom: Constants.MARGIN / 2,
                marginRight: -Constants.MARGIN_LARGE
            }]}>
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    onPress={() => onPressAddAction(data, this.user, this.workingTimeConfig)}
                    style={{
                        marginHorizontal: Constants.MARGIN_LARGE
                    }}>
                    <Image source={ic_pencil_green} />
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    onPress={() => onPressDeleteAction(data.id)}
                    style={{
                        marginLeft: Constants.MARGIN_LARGE
                    }}>
                    <Image source={ic_delete_red} />
                </TouchableOpacity>
            </View>
        )
    }

    /**
     * Render button add
     */
    renderButtonAdd = () => {
        const { onPressAddAction } = this.props;
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                onPress={() => { onPressAddAction(null, this.user, this.workingTimeConfig) }}
                style={{
                    padding: Constants.PADDING_LARGE
                }}>
                <Image source={ic_add_green} />
            </TouchableOpacity>
        )
    }

    /**
     * Render header flatList
     */
    renderHeaderFlatList = () => {
        return (
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                marginHorizontal: Constants.MARGIN_X_LARGE
            }}>
                <View style={{ maxWidth: deviceWidth - Constants.MARGIN_XX_LARGE * 2 }}>
                    <Text style={[commonStyles.textBold]}>
                        {this.user.name}
                    </Text>
                </View>
                {this.renderButtonAdd()}
                <View style={{ flex: 1 }} />
            </View>
        )
    }

    /**
     * @param {*} item
     * @param {*} index
     * @param {*} indexInData
     * @param {*} parentIndex
     */
    renderItem = (item, indexInData, parentIndex, index) => {
        return (
            <ItemTimekeeping
                key={index.toString()}
                data={this.dataTimekeeping}
                item={item}
                index={index}
                screen={screenType.FROM_HOME_VIEW}
                dashboardType={this.props.dashboardType}
                renderButtonAproval={this.renderButtonAproval}
                renderButtonEdit={this.renderButtonEdit}
            />
        );
    }
}

export default ItemUserTimekeeping;