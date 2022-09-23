import React, { PureComponent } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity
} from 'react-native';
import { Constants } from 'values/constants';
import commonStyles from 'styles/commonStyles';
import ImageLoader from 'components/imageLoader';
import ic_next_grey from 'images/ic_next_grey.png';
import Hr from 'components/hr';
import Utils from 'utils/utils';

class ItemCompany extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { item, index, lengthData, onPress, urlPathResize, urlPath } = this.props;
        let hasHttp = !Utils.isNull(item.avatarPath) && item.avatarPath.indexOf('http') != -1;
        let image = hasHttp ? item.avatarPath : urlPathResize + "=" + item.idAlias + "/" + item.avatarPath;
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                onPress={() => onPress(item)}>
                <View style={[commonStyles.viewHorizontal, {
                    padding: Constants.PADDING_X_LARGE,
                    alignItems: "center"
                }]}>
                    <ImageLoader
                        style={{
                            width: 56, height: 56,
                            position: 'relative'
                        }}
                        resizeAtt={hasHttp ? null : { type: 'thumbnail', width: 56, height: 56 }}
                        resizeModeType={"cover"}
                        path={image}
                    />
                    <View style={{ flex: 1, paddingHorizontal: Constants.MARGIN_LARGE }}>
                        <Text numberOfLines={1} style={[commonStyles.text]}>
                            {item.name}
                        </Text>
                    </View>
                    {item.branches.length > 0 && <Image source={ic_next_grey} />}
                </View>
                {index != lengthData - 1 && <Hr style={{ marginHorizontal: Constants.MARGIN_X_LARGE }} />}
            </TouchableOpacity>
        );
    }
}

export default ItemCompany;