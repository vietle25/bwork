import React, { Component } from 'react';
import background_top_view from "images/background_top_view.png";
import PropTypes from 'prop-types';
import {
    ListView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    View,
    ViewPropTypes as RNViewPropTypes,
    FlatList,
    Dimensions,
    ImageBackground
} from 'react-native';
import { Colors } from 'values/colors';
import Utils from 'utils/utils';
import { Constants } from 'values/constants';

const window = Dimensions.get('window');

class BackgroundTopView extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        let ratio = !Utils.isNull(this.props.ratio) ? this.props.ratio : 3
        return (
            <ImageBackground
                resizeMode='cover'
                style={{ width: window.width, height: window.height / ratio + Constants.POSITION_TOP_VIEW, backgroundColor: Colors.COLOR_PRIMARY }}
                source={background_top_view} />
        );
    }
}

export default BackgroundTopView;