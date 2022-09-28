import ImageLoader from 'components/imageLoader';
import BaseView from 'containers/base/baseView';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import commonStyles from 'styles/commonStyles';
import StringUtil from 'utils/stringUtil';
import Utils from 'utils/utils';
import { Colors } from 'values/colors';
import { Constants } from 'values/constants';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const PADDING_BUTTON = Constants.PADDING_X_LARGE - 4;
const WIDTH_HEIGHT_AVATAR = 48;

const screen = Dimensions.get("window");
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

class ItemStaff extends BaseView {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { item, index, urlPathResize, onPress, lengthData } = this.props;
        let model = !Utils.isNull(item.userModel);
        let parseItem = {
            name: model && !Utils.isNull(item.userModel.name) ? item.userModel.name : "-",
            avatar: model && !Utils.isNull(item.userModel.avatarPath) ? item.userModel.avatarPath : "",
            email: model && !Utils.isNull(item.userModel.email) ? item.userModel.email : "-",
            amount: !Utils.isNull(item.amount) ? item.amount : "0",
        };
        let hasHttp = !Utils.isNull(parseItem.avatar) && item.userModel.avatarPath.indexOf('http') != -1;
        let avatar = hasHttp ? item.userModel.avatarPath
            : urlPathResize + "=" + global.companyIdAlias + "/" + item.userModel.avatarPath;
        return (
            <ScrollView
                ref={ref => this.scrollView = ref}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[{
                    justifyContent: "center",
                    alignItems: "center",
                }]}
                horizontal={true}
                style={{ flex: 1, flexDirection: 'row', backgroundColor: Colors.COLOR_WHITE }}>
                <TouchableOpacity
                    style={{ flex: 1, width: width }}
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    onPress={() => {
                        onPress(item);
                    }}
                >
                    <View style={[commonStyles.viewHorizontal, {
                        marginHorizontal: Constants.MARGIN_X_LARGE,
                        paddingVertical: Constants.MARGIN_X_LARGE,
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
                            <View style={{ flexDirection: 'row', flex: 1 }}>
                                <View style={{ flex: 1, justifyContent: 'flex-start', marginLeft: Constants.MARGIN_X_LARGE }}>
                                    <View style={commonStyles.viewSpaceBetween}>
                                        <Text numberOfLines={1} style={[commonStyles.textBold, {
                                            marginVertical: Constants.MARGIN,
                                            margin: 0, width: width * 1 / 2,
                                        }]}>{parseItem.name}</Text>
                                        <Text style={[commonStyles.textBold, {
                                            alignSelf: 'flex-start',
                                            flexDirection: 'column',
                                            margin: 0,
                                            color: Colors.COLOR_PRIMARY,
                                        }]}>
                                            {StringUtil.formatStringCashNoUnit(parseItem.amount)}
                                        </Text>
                                    </View>
                                    <View style={commonStyles.viewSpaceBetween}>
                                        <Text numberOfLines={2} style={[commonStyles.text, {
                                            flex: 1,
                                            color: Colors.COLOR_GRAY,
                                            margin: 0,
                                        }]}>{parseItem.email}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
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

export default ItemStaff;