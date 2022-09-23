import React, { Component } from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';
import { Constants } from 'values/constants';
import Utils from 'utils/utils';

class BackgroundShadow extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { source, style, styleBackground, content, resizeMode } = this.props
        return (
            <View
                style={style}>
                <ImageBackground
                    resizeMode={resizeMode ? resizeMode : "stretch"}
                    style={[styles.container, styleBackground]}
                    source={source}>
                    {content}
                </ImageBackground>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        paddingTop: Constants.PADDING,
        paddingHorizontal: Constants.PADDING_LARGE,
        paddingBottom: Constants.PADDING_X_LARGE - Constants.PADDING,
        marginTop: -Constants.PADDING,
        marginHorizontal: -Constants.PADDING_LARGE,
        marginBottom: -(Constants.PADDING_X_LARGE - Constants.PADDING)
    },
})

export default BackgroundShadow