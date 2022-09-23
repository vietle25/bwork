import React, { Component } from "react";
import { Dimensions, StyleSheet, Text, View, Image, Animated, Platform, TouchableOpacity } from 'react-native';
import { Colors } from "values/colors";
import GestureRecognizer from './gestureRecognizer'
import resolveAssetSource from 'resolveAssetSource';
import { Fonts } from "values/fonts";
import commonStyles from "styles/commonStyles";
import { Constants } from "values/constants";
import PropTypes from 'prop-types';
import swipeType from "enum/swipeType";
import BackgroundShadow from "./backgroundShadow";
import white_shadow_android from "images/white_blur_shadow.png"

const screen = Dimensions.get("window");

export default class BottomPanel extends Component {
    /**
     * If troubling in height of Panel, just finf '100' and change it to your desired 
     * height
     */

    constructor(props) {
        super(props);
        this.icons = {
            'up': require('images/ic_up_grey.png'),
            'down': require('images/ic_down_grey.png')
        };
        this.state = {
            title: props.title,
            render: props.render,
            // expanded: true,
            animation: new Animated.Value(),
            maxHeight: 0,
            minHeight: 0,
            height: 0,
        };
        this.expanded = false

    }
    static propTypes = {
        renderFabControl: PropTypes.func
    }
    static defaultProps = {
        renderFabControl: null
    }

    toggle() {
        // let initialValue    = this.state.expanded? this.state.maxHeight + this.state.minHeight : this.state.minHeight,
        //     finalValue      = this.state.expanded? this.state.minHeight : this.state.maxHeight + this.state.minHeight;
        // this.setState({
        //     expanded : !this.state.expanded
        // });
        // this.state.animation.setValue(initialValue);
        // Animated.spring(
        //     this.state.animation,
        //     {
        //         toValue: finalValue
        //     }
        // ).start();
        if (this.expanded) {
            this.onSwipeDown()
        }
        else {
            this.onSwipeUp()
        }

    }

    setMaxHeight(event) {
        if (this.state.maxHeight == 0) {
            console.log('bottomPanel -set max height', event.nativeEvent.layout.height)
            this.setState({
                maxHeight: event.nativeEvent.layout.height
            });
        }
    }

    setMinHeight(event) {
        if (this.state.minHeight == 0) {
            console.log('bottomPanel -set min height', event.nativeEvent.layout.height)
            this.setState({
                minHeight: event.nativeEvent.layout.height
            });
        }
    }

    /**
     * Swipe up
     */
    onSwipeUp() {
        if (!this.expanded) {
            let initialValue = this.state.minHeight,
                finalValue = this.state.maxHeight + this.state.minHeight;
            // this.setState({
            //     expanded: !this.state.expanded
            // });
            // this.state.animation.setValue(initialValue);
            // Animated.spring(
            //     this.state.animation,
            //     {
            //         toValue: finalValue,
            //         friction: 10,
            //         tension: 100
            //     }
            // ).start();
            this.root.setNativeProps({
                position: 'relative',
                top: 0,
            })
            this.image.setNativeProps({
                ...Platform.OS === 'ios' ? { source: [resolveAssetSource(this.icons.down)] } :
                    { src: [resolveAssetSource(this.icons.down)] }
            })
            this.expanded = !this.expanded
            // this.setState({expanded: !this.state.expanded})
            this.props.onSwipe(swipeType.UP)
            console.log('bottomPanel', 'swipe up')
        }
    }

    /**
     * Swipe down 
     */
    onSwipeDown() {
        if (this.expanded) {
            let initialValue = this.state.maxHeight + this.state.minHeight
            finalValue = this.state.minHeight
            // this.setState({
            //     expanded: !this.state.expanded
            // });
            // this.state.animation.setValue(initialValue);
            // Animated.spring(
            //     this.state.animation,
            //     {
            //         toValue: finalValue,
            //         friction: 10,
            //         tension: 100
            //     }
            // ).start();
            this.root.setNativeProps({
                position: 'absolute',
                top: '100%'
            })
            this.image.setNativeProps({
                ...Platform.OS === 'ios' ? { source: [resolveAssetSource(this.icons.up)] } :
                    { src: [resolveAssetSource(this.icons.up)] }
            })
            this.expanded = !this.expanded
            // this.setState({expanded: !this.state.expanded})
            this.props.onSwipe(swipeType.DOWN)
            console.log('bottomPanel', 'swipe down')
        }
    }


    render() {
        let icon = this.icons['up'];
        if (this.state.expanded) {
            icon = this.icons['down'];
        }
        return (
            <View style={[styles.container]}>
                {this.props.renderFabControl ? this.props.renderFabControl() : null}
                <GestureRecognizer style={{ flex: 1 }}
                    onSwipeUp={() => this.onSwipeUp()}
                    onSwipeDown={() => this.onSwipeDown()}
                >
                    <View style={{ marginHorizontal: -Constants.MARGIN_12, marginBottom: -Constants.MARGIN_12 }}>
                        <BackgroundShadow
                            source={white_shadow_android}
                            content={
                                <View style={[styles.titleContainer, {
                                    paddingBottom: this.props.paddingBottom
                                }]}
                                    onLayout={this.setMinHeight.bind(this)}>
                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={this.toggle.bind(this)}>
                                        {/* <View
                                ref={ref => this.image = ref}
                                style={styles.buttonImage}>
                            </View> */}
                                        <Image source={icon}
                                            style={styles.buttonImage}
                                            ref={ref => this.image = ref}
                                        />
                                    </TouchableOpacity>
                                </View>
                            }>
                        </BackgroundShadow>
                    </View>
                    <View style={styles.body}
                        ref={ref => this.root = ref}
                        onLayout={this.setMaxHeight.bind(this)}>
                        {this.props.children}
                    </View>
                </GestureRecognizer>
            </View>
        );

    }
}

var styles = StyleSheet.create({
    container: {
        width: '100%',
        position: 'absolute',
        backgroundColor: 'transparent',
        bottom: 0,
        right: 0,
        overflow: 'hidden',
    },
    titleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.COLOR_WHITE,
        borderTopLeftRadius: Constants.CORNER_RADIUS,
        borderTopRightRadius: Constants.CORNER_RADIUS
    },
    button: {
        // padding: Constants.PADDING_LARGE,
        // paddingLeft: 0,
        // marginRight: Constants.MARGIN_LARGE,
    },
    buttonImage: {
        opacity: 0.1
        // width: screen.width / 7,
        // height: 5,
        // backgroundColor: Colors.COLOR_GREY,
        // borderRadius: Constants.CORNER_RADIUS,
        // marginLeft: Constants.MARGIN_LARGE
    },
    body: {
        padding: 0,
        backgroundColor: Colors.COLOR_WHITE
    }
});
