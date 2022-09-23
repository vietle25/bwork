import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import commonStyles from 'styles/commonStyles';
import DateUtil from 'utils/dateUtil';
import { Constants } from 'values/constants';
import ImageLoader from 'components/imageLoader';
import Utils from 'utils/utils';
import { Colors } from 'values/colors';
import screenType from 'enum/screenType';
import { Fonts } from 'values/fonts';
import BaseView from 'containers/base/baseView';
import ic_check_circle_green from 'images/ic_check_circle_green.png';
import ic_circle_black from 'images/ic_circle_black.png';

const screen = Dimensions.get("window");
const WIDTH_IMAGE = 48;
const HEIGHT_IMAGE = WIDTH_IMAGE * (12 / 8);

export default class ItemFriend extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            selected: false
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            if (!Utils.isNull(this.props.item.requesting)) {
                this.state.requesting = this.props.item.requesting;
            }
        }
    }

    render() {
        const { data, item, index, resourceUrlPathResize, onClickItem, type, userId } = this.props;
        let image = !Utils.isNull(item.avatarPath) ? item.avatarPath.indexOf('http') != -1 ?
            item.avatarPath : resourceUrlPathResize.textValue + "=" + global.companyIdAlias + "/" + item.avatarPath : '';
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                onPress={() => { this.onSelected() }}
                style={[styles.container]}>
                <ImageLoader
                    resizeModeType={'cover'}
                    resizeAtt={!Utils.isNull(item.avatarPath) ? item.avatarPath.indexOf('http') != -1
                        ? null
                        : { type: 'resize', width: WIDTH_IMAGE } : null}
                    path={image}
                    style={[styles.image, {
                        width: WIDTH_IMAGE,
                        height: WIDTH_IMAGE,
                        borderRadius: WIDTH_IMAGE / 2
                    }]}
                />
                <View style={{
                    flex: 1,
                    flexDirection: 'column', justifyContent: 'center',
                    marginHorizontal: Constants.MARGIN_X_LARGE
                }}>
                    <Text numberOfLines={1} style={[commonStyles.textBold, {
                        margin: 0, padding: 0
                    }]}>{item.name}</Text>
                </View>
                {this.renderButton(type)}
            </TouchableOpacity>
        );
    }

    /**
     * render button check
     */
    renderButton = (type) => {
        const { item, index, resourceUrlPathResize, onPress } = this.props;
        switch (type) {
            case screenType.FROM_CHAT_INVITE:
            case screenType.FROM_CREATE_CHAT_GROUP:
                return (
                    <View style={{ paddingVertical: Constants.PADDING_LARGE, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                        <TouchableOpacity onPress={() => { this.onSelected() }} style={{ paddingHorizontal: Constants.PADDING, alignItems: 'center', marginRight: Constants.MARGIN_LARGE }}>
                            <Image source={!this.state.selected ? ic_circle_black : ic_check_circle_green} style={{ marginHorizontal: Constants.MARGIN, }} />
                        </TouchableOpacity>
                    </View>
                )
            default:
                return null;
        }
    }

    /** 
     * handle press selected
     */
    onSelected = () => {
        this.props.onClickItem(this.props.item, this.props.index);
        if (this.state.selected) {
            this.setState({
                selected: false,
            })
        } else {
            this.setState({
                selected: true,
            })
        }
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: Constants.PADDING_X_LARGE,
        paddingVertical: Constants.PADDING_LARGE,
        justifyContent: 'space-between',
        flexDirection: 'row',
    },

    image: {
        borderRadius: Constants.BORDER_RADIUS
    }
});
