import { Component } from 'react';
import { Dimensions, Keyboard, Platform, SafeAreaView, TouchableOpacity, View } from "react-native";
import { Colors } from 'values/colors';
import { Constants } from 'values/constants';

const screen = Dimensions.get("window");

export default class BottomTabCustom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            styleBar: {
                minHeight: 54,
                opacity: 1
            }
        };
        this.route = {
            name: "",
            params: {}
        }
    }

    componentDidMount() {
        if (Platform.OS === 'android') {
            this.keyboardEventListeners = [
                Keyboard.addListener('keyboardDidShow', this.handleStyle({ minHeight: 0, opacity: 0 })),
                Keyboard.addListener('keyboardDidHide', this.handleStyle({ minHeight: 54, opacity: 1 }))
            ];
        }
    }

    componentWillUnmount() {
        this.keyboardEventListeners && this.keyboardEventListeners.forEach((eventListener) => eventListener.remove());
    }

    handleStyle = style => () => this.setState({ styleBar: style });

    render() {
        const { styleBar } = this.state;
        const { style, navigation, activeTintColor, inactiveTintColor, renderIcon, jumpTo } = this.props;
        const {
            index,
            routes
        } = navigation.state;
        return (
            <SafeAreaView
                pointerEvents="box-none"
                style={[Styles.container, styleBar]}
                forceInset={{
                    top: 'never',
                    bottom: 'always',
                }}
            >
                <SafeAreaView
                    style={[Styles.fakeBackground, style, styleBar]}
                    forceInset={{
                        top: 'never',
                        bottom: 'always',
                    }}
                >

                    <View pointerEvents="box-none" style={Styles.content}>
                        {
                            routes.map((route, idx) => {
                                const focused = index === idx;
                                if (!route.params || !route.params.navigationDisabled) {
                                    return (
                                        <View style={{ flex: 1 }} key={idx}>
                                            {this.tabIcon(
                                                route,
                                                renderIcon,
                                                focused,
                                                activeTintColor,
                                                inactiveTintColor,
                                                () => (!route.params || !route.params.navigationDisabled) && jumpTo(route.key)
                                            )}
                                        </View>
                                    );
                                }

                                const Icon = renderIcon({
                                    route,
                                    focused,
                                    tintColor: focused
                                        ? activeTintColor
                                        : inactiveTintColor
                                });

                                return {
                                    ...Icon,
                                    key: 'simple'
                                };
                            })
                        }
                    </View>
                </SafeAreaView>
            </SafeAreaView>
        );
    }

    tabIcon = (route, renderIcon, focused, activeTintColor, inactiveTintColor, onPress) => {
        return (
            <TouchableOpacity
                style={Styles.tabStyle}
                onPress={() => onPress && onPress()}
            >
                {
                    renderIcon({
                        route,
                        focused,
                        tintColor: focused
                            ? activeTintColor
                            : inactiveTintColor
                    })
                }
            </TouchableOpacity>
        )
    }
}

const Styles = {
    container: {
        position: 'relative',
        bottom: 0,
        width: '100%',
        backgroundColor: Colors.COLOR_WHITE,
        justifyContent: 'flex-end'
    },
    fakeBackground: {
        position: 'absolute',
        width: '100%',
        backgroundColor: Colors.COLOR_WHITE,
        elevation: Constants.ELEVATION
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: Constants.ELEVATION
    },
    tabStyle: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
};