import React, { PureComponent } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Constants } from "values/constants";
import Utils from "utils/utils";
import slidingMenuType from "enum/slidingMenuType";
import screenType from "enum/screenType";
import ic_next_grey from "images/ic_next_grey.png";
import { Colors } from "values/colors";
import commonStyles from "styles/commonStyles";

class ItemSlidingMenuAdmin extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const { data, item, index, navigation, userInfo, company, callBack, resourceUrlPathResize, source, onLogout } = this.props;
        return (

            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                onPress={() => {
                    if (!Utils.isNull(item.screen)) {
                        switch (item.screen) {
                            case slidingMenuType.WORKING_POLICY:
                            case slidingMenuType.COMPANY_DETAIL:
                                navigation.navigate(item.screen, {
                                    companyId: company.id
                                });
                                break;
                            case slidingMenuType.BRANCH_LIST:
                                navigation.navigate(item.screen, {
                                    company: company
                                });
                                break;
                            default:
                                navigation.navigate(item.screen, {
                                    screenType: screenType.FROM_SLIDING_MENU
                                });
                                break;
                        }
                    } else {
                        onLogout();
                    }
                }} block>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: Constants.PADDING_X_LARGE,
                    borderBottomWidth: !Utils.isNull(item.screen) ? Constants.BORDER_WIDTH : null,
                    borderColor: Colors.COLOR_BACKGROUND
                }}>
                    <Image source={Utils.isNull(item.icon) ? null : item.icon} />
                    <Text
                        style={[
                            commonStyles.textBold,
                            {
                                flex: 1,
                                margin: 0, marginLeft: Constants.PADDING_X_LARGE,
                                color: item.color
                            }
                        ]}
                    >
                        {item.name}
                    </Text>
                    <View
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                        activeOpacity={Constants.ACTIVE_OPACITY}
                        onPress={() => this.props.gotoMenuView()}>
                        {!Utils.isNull(item.screen) ? <Image source={ic_next_grey} style={{}} /> : null}
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}

export default ItemSlidingMenuAdmin;
