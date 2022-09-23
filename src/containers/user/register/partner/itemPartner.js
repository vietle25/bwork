import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Constants } from 'values/constants';
import ic_check_blue from "images/ic_check_blue.png";
import { Colors } from 'values/colors';
import screenType from 'enum/screenType';

class ItemPartner extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { data, item, index, onItemSelected, selected, screen } = this.props
        return (
            <TouchableOpacity
                key={index}
                activeOpacity={Constants.ACTIVE_OPACITY}
                onPress={() => onItemSelected(item, index)}>
                <View style={{
                    backgroundColor: index == selected ? Colors.COLOR_PRIMARY_OPACITY_20 : Colors.COLOR_WHITE,
                    borderBottomLeftRadius: index == data.length - 1 ? screen == screenType.FROM_USER_PROFILE ? 0 : Constants.CORNER_RADIUS : 0,
                    borderBottomRightRadius: index == data.length - 1 ? screen == screenType.FROM_USER_PROFILE ? 0 : Constants.CORNER_RADIUS : 0,
                    borderTopLeftRadius: index == 0 ? Constants.CORNER_RADIUS : 0,
                    borderTopRightRadius: index == 0 ? Constants.CORNER_RADIUS : 0,
                    paddingVertical: Constants.PADDING_X_LARGE,
                    paddingHorizontal: Constants.PADDING_X_LARGE,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <Text style={[styles.text, {
                        color: index == selected ? Colors.COLOR_PRIMARY : Colors.COLOR_TEXT
                    }]}>{item.name}</Text>
                    {index == selected ? <Image source={ic_check_blue}/> : null}
                </View>
            </TouchableOpacity>
        );
    }
}

export default ItemPartner;
