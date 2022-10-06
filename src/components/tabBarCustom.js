import {Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import posed from 'react-native-pose'; // react-native animation library

import commonStyles from 'styles/commonStyles';

import {Colors} from 'values/colors';
import {Constants} from 'values/constants';

const screen = Dimensions.get('screen');
const deviceWidth = screen.width;
const deviceHeight = screen.height;

const HEIGHT_BOTTOM_TAB = 62;
const SIZE_TAB_BUTTON_CENNTER = HEIGHT_BOTTOM_TAB + Constants.MARGIN_X_LARGE + Constants.MARGIN;

const Scaler = posed.View({
    // define click zoom
    active: {scale: 1},
    inactive: {scale: 1},
});

const TabBarCustom = ({state, descriptors, navigation}) => {
    const focusedOptions = descriptors[state.routes[state.index].key].options;

    if (focusedOptions.tabBarVisible === false) {
        return null;
    }

    return (
        <Scaler style={styles.container}>
            {state.routes.map((route, index) => {
                const {options} = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                        ? options.title
                        : route.name;

                const tabBarBadge = options.tabBarBadge !== undefined ? options.tabBarBadge : null;

                const icon = options.icon !== undefined ? options.icon : null;

                const iconActive = options.iconActive !== undefined ? options.iconActive : null;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, options.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                return (
                    <TouchableOpacity
                        key={index.toString()}
                        activeOpacity={Constants.ACTIVE_OPACITY}
                        accessibilityRole="button"
                        accessibilityStates={isFocused ? ['selected'] : []}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={[{flex: 1}]}>
                        {route.name === 'TabPost' ? (
                            // <ViewOverflow style={[styles.tabCennter]}>
                            <Scaler style={[styles.tabButtonCenter]} pose={isFocused ? 'active' : 'inactive'}>
                                <Image resizeMode={'contain'} source={icon} />
                                {/* <Text style={[styles.iconText, { color: Colors.COLOR_WHITE }]}>{label}</Text> */}
                            </Scaler>
                        ) : (
                            // </ViewOverflow>
                            <Scaler style={styles.scalerOnline} pose={isFocused ? 'active' : 'inactive'}>
                                <View style={[styles.tabButton]}>
                                    <Image resizeMode={'contain'} source={isFocused ? iconActive : icon} />
                                    {tabBarBadge > 0 ? (
                                        <View
                                            style={[
                                                styles.badgeContainer,
                                                {
                                                    width: tabBarBadge >= 10 ? 24 : 18,
                                                },
                                            ]}>
                                            <Text style={[commonStyles.textSmall, styles.quantityNumber]}>
                                                {tabBarBadge >= 100 ? '99+' : tabBarBadge}
                                            </Text>
                                        </View>
                                    ) : null}
                                    <Text
                                        style={[
                                            styles.iconText,
                                            {
                                                color: isFocused ? Colors.COLOR_PRIMARY : Colors.COLOR_TEXT,
                                            },
                                        ]}>
                                        {label}
                                    </Text>
                                </View>
                            </Scaler>
                        )}
                    </TouchableOpacity>
                );
            })}
        </Scaler>
    );
};

const styles = StyleSheet.create({
    container: {
        ...commonStyles.shadowOffset,
        flexDirection: 'row',
        minHeight: HEIGHT_BOTTOM_TAB,
        backgroundColor: Colors.COLOR_WHITE,
    },
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabButtonCenter: {
        ...commonStyles.viewCenter,
        // ...commonStyles.shadowOffset,
        // backgroundColor: Colors.COLOR_PRIMARY,
        // width: SIZE_TAB_BUTTON_CENNTER,
        // height: SIZE_TAB_BUTTON_CENNTER,
        // borderRadius: SIZE_TAB_BUTTON_CENNTER * 2,
    },
    scaler: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scalerOnline: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    iconText: {
        ...commonStyles.text,
        margin: 0,
        fontSize: 12,
    },
    tabCennter: {
        flex: 1,
        ...commonStyles.viewCenter,
    },
    badgeContainer: {
        ...commonStyles.viewCenter,
        position: 'absolute',
        top: Platform.OS === 'ios' ? Constants.MARGIN : 0,
        right: 8,
        height: 18,
        borderRadius: 9,
        backgroundColor: Colors.COLOR_RED,
        borderWidth: Constants.BORDER_WIDTH,
        borderColor: Colors.COLOR_WHITE,
    },
    quantityNumber: {
        color: Colors.COLOR_WHITE,
        padding: 0,
        margin: 0,
    },
});

export default TabBarCustom;
