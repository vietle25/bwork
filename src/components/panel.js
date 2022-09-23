import React, { Component } from "react";
import { Alert, StyleSheet, Text, View, Image, TouchableOpacity, Animated, TouchableHighlight } from 'react-native';
import { Constants } from "values/constants";
import { Colors } from "values/colors";
import commonStyles from "styles/commonStyles";

export default class Panel extends Component {

    constructor(props) {
        super(props);

        this.icons = {
            'up': require('images/ic_up_grey.png'),
            'down': require('images/ic_down_grey.png')
        };

        this.state = {
            title: props.title,
            ic: props.icon,
            expanded: true,
            render: props.render,
            animation: new Animated.Value(0.1),
            maxHeight: 0,
            minHeight: 0,
        };
        this.state.animation.addListener(({ value }) => this.heightButton = value);
    }

    toggle() {
        let initialValue = this.state.expanded ? this.state.maxHeight + this.state.minHeight : this.state.minHeight,
            finalValue = this.state.expanded ? this.state.minHeight : this.state.maxHeight + this.state.minHeight;
        this.state.animation.setValue(finalValue);
        this.setState({
            expanded: !this.state.expanded
        });

        Animated.timing(this.state.animation, {
            toValue: initialValue,
            duration: 1000
        }).start()
    }

    _setMaxHeight(event) {
        if (this.state.maxHeight == 0) {
            this.setState({
                maxHeight: event.nativeEvent.layout.height
            });
        }
    }

    _setMinHeight(event) {
        if (this.state.minHeight == 0)
            this.setState({
                minHeight: event.nativeEvent.layout.height
            });
    }

    render() {
        let icon = this.icons['down'];

        if (this.state.expanded) {
            icon = this.icons['up'];
        }

        return (
            <Animated.View
                style={[styles.container, { flex: this.state.animation, height: this.heightButton }]}>
                <TouchableOpacity onPress={this.toggle.bind(this)} underlayColor="#f1f1f1">
                    <View style={styles.titleContainer} onLayout={this._setMinHeight.bind(this)}>
                        <Image
                            style={{ marginRight: Constants.MARGIN_X_LARGE, resizeMode: 'contain' }}
                            source={this.state.ic}
                        />
                        <Text style={styles.title}>{this.state.title}</Text>
                        <TouchableHighlight
                            style={styles.button}
                            onPress={this.toggle.bind(this)}
                            underlayColor="#f1f1f1">
                            <Image
                                style={[styles.buttonImage, { resizeMode: 'contain' }]}
                                source={icon}
                            />
                        </TouchableHighlight>
                    </View>
                </TouchableOpacity>
                <View style={styles.body} onLayout={this._setMaxHeight.bind(this)}>
                    {this.props.children}
                    {this.state.render()}
                </View>
            </Animated.View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        overflow: 'hidden'
    },
    titleContainer: {
        flex: 1,
        flexDirection: 'row',
        paddingLeft: Constants.PADDING_X_LARGE,
        paddingRight: Constants.PADDING_X_LARGE,
        paddingBottom: Constants.PADDING_LARGE,
        paddingTop: Constants.PADDING_LARGE,
    },
    title: {
        ...commonStyles.text,
        flex: 1
    },
    button: {
        alignSelf: 'flex-end',
        marginBottom: 4
    },
    buttonImage: {
        // alignSelf: 'flex-end',
        // alignItems:'flex-end',
        // justifyContent:'flex-end',
    },
    body: {
        paddingLeft: 12,
        paddingRight: 12,
    }
});
