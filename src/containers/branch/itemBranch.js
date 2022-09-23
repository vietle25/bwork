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

class ItemCompany extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { item, index, lengthData, onPress } = this.props;
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                onPress={() => onPress(item)}>
                <View style={[commonStyles.viewHorizontal, {
                    padding: Constants.PADDING_X_LARGE,
                    alignItems: "center"
                }]}>
                    {/* <ImageLoader
                        style={{
                            width: 56, height: 56,
                            position: 'relative'
                        }}
                        resizeAtt={{ type: 'thumbnail', width: 56, height: 56 }}
                        resizeModeType={"cover"}
                        path={null}
                    /> */}
                    <View style={{ flex: 1, paddingRight: Constants.MARGIN_LARGE }}>
                        <Text numberOfLines={1} style={[commonStyles.text]}>
                            {item.name}
                        </Text>
                    </View>
                    {/* <Image source={ic_next_grey} /> */}
                </View>
                {/* {index != lengthData - 1 && */}
                    <Hr style={{ marginHorizontal: Constants.MARGIN_X_LARGE }} />
                {/* } */}
            </TouchableOpacity>
        );
    }
}

export default ItemCompany;