import React, { Component } from "react";
import PropTypes from 'prop-types';
import { ImageBackground, Dimensions, View, StatusBar, TextInput, ScrollView, TouchableOpacity, Image, Keyboard } from "react-native";
import { Form, Textarea, Container, Header, Title, Left, Icon, Right, Button, Body, Content, Text, Card, CardItem, Fab, Footer, Input, Item } from "native-base";
import { Constants } from 'values/constants'
import { Colors } from "values/colors";
import BaseView from "containers/base/baseView";
import TimerCountDown from 'components/timerCountDown';
import commonStyles from "styles/commonStyles";
import ic_back_white from 'images/ic_back_white.png';
import ic_notification_white from 'images/ic_notification_white.png';
import { Fonts } from "values/fonts";
import ic_default_user from 'images/ic_default_user.png';
import shadow_avatar from 'images/shadow_avatar.png';
import ic_chat_black from 'images/ic_chat_black.png';
import Utils from "utils/utils";
import ImageLoader from "components/imageLoader";

const deviceHeight = Dimensions.get("window").height;

class HeaderView extends Component {

    static propTypes = {
        //Title
        title: PropTypes.string.isRequired,
        //IELTS Skill
        ieltsSkill: PropTypes.number,
        //Unit: Seconds
        timeLimit: PropTypes.number,
        //Handle to be called:
        //when user pressed back button
        onBack: PropTypes.func,
        //Called when countdown time has been finished
        onFinishCountDown: PropTypes.func,
        //Called when extra time has been finished
        onTick: PropTypes.func,
        titleStyle: PropTypes.object,
        isReady: PropTypes.bool,
        visibleBack: PropTypes.bool,
        visibleTitle: PropTypes.bool,
        visibleNotification: PropTypes.bool,
        visibleChat: PropTypes.bool,
        visibleMap: PropTypes.bool,
        visibleAccount: PropTypes.bool,
        visibleTimerCountdown: PropTypes.bool,
        stageSize: PropTypes.number,
        initialIndex: PropTypes.number
    }

    static defaultProps = {
        onFinishCountDown: null,
        onFinishExtraTime: null,
        isReady: true,
        onTick: null,
        visibleBack: false,
        visibleNotification: false,
        visibleChat: false,
        visibleMap: false,
        visibleTitle: true,
        visibleAccount: false,
        visibleTimerCountdown: false,
        onBack: null,
        stageSize: 4,
        initialIndex: 0,
        titleStyle: null
    }

    constructor(props) {
        super(props)
        this.state = {
            countDownTime: this.props.timeLimit,
            ieltsSkill: this.props.ieltsSkill,
        };
        this.timeTick = this.state.countDownTime
    }

    render() {
        const { title, onBack, onRefresh, onGrid, renderRightMenu, renderLeftMenu, renderMidMenu } = this.props
        return (
            <View style={styles.headerBody}>
                {/* Title */}
                {this.props.visibleTitle ? <View style={[commonStyles.viewCenter, { position: "absolute", top: 0, right: 0, left: 0, bottom: 0 }]}>
                    <Text numberOfLines={1} style={
                        [commonStyles.title,
                        { textAlign: 'center', margin: 0, paddingHorizontal: Constants.PADDING_X_LARGE * 3 },
                        this.props.titleStyle
                        ]}
                    >
                        {title.toUpperCase()}
                    </Text>
                </View> : null}
                {/*Back button*/}
                {this.props.visibleBack ? this.renderBack() : null}
                {renderLeftMenu && renderLeftMenu()}
                {/* Render account */}
                {this.props.visibleAccount ? this.renderAccount() : null}
                {/* Render search bar */}
                {this.props.visibleSearchBar ? this.renderSearchBar() : null}
                {/* Render mid menu */}
                {renderMidMenu ? renderMidMenu() : this.renderMidMenu()}
                {/* Notification button */}
                {this.props.visibleNotification ? this.renderNotification() : null}
                {/* Render chat */}
                {this.props.visibleChat ? this.renderChat() : null}
                {/* Render list */}
                {this.props.visibleMap ? this.renderMap() : null}
                {/* {Render timer countdown} */}
                {this.props.visibleTimerCountdown ? this.renderTimerCountDown() : null}
                {renderRightMenu && renderRightMenu()}
                <StatusBar barStyle="light-content" backgroundColor={Colors.COLOR_PRIMARY} />
            </View>
        );
    }

    /**
     * Render mif menu
     */
    renderMidMenu = () => {
        return (
            <View style={{ flex: 1 }} />
        )
    }

    onTimeElapsed = () => {
        if (this.props.onFinishCountDown)
            this.props.onFinishCountDown()
    }

    /** 
     * Render back button
     */
    renderBack() {
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                style={{
                    padding: Constants.PADDING_LARGE
                }}
                onPress={() => {
                    if (this.props.onBack)
                        this.props.onBack()
                }}>
                <Image source={ic_back_white} />
            </TouchableOpacity>
        );
    }

    /**
     * Render search bar
     */
    renderSearchBar() {
        return (
            <View style={[styles.searchBar, this.props.styleSearch]}>
                {/*Left button*/}
                {!Utils.isNull(this.props.iconLeftSearch) ? (
                    <TouchableOpacity
                        style={[this.props.styleLeftSearch, {
                            paddingHorizontal: Constants.PADDING_LARGE
                        }]}
                        onPress={() => {
                            this.props.onPressLeftSearch();
                        }}
                    >
                        <Image source={this.props.iconLeftSearch} style={this.props.styleIconLeftSearch} />
                    </TouchableOpacity>
                ) : null}
                <TextInput
                    style={[commonStyles.inputText, { flex: 1 }]}
                    placeholder={this.props.placeholder}
                    placeholderTextColor={Colors.COLOR_TEXT}
                    ref={ref => {
                        if (this.props.onRef) this.props.onRef(ref);
                    }}
                    value={this.props.inputSearch}
                    onChangeText={this.props.onChangeTextInput}
                    onSubmitEditing={() => {
                        this.props.onSubmitEditing();
                        Keyboard.dismiss();
                    }}
                    underlineColorAndroid="transparent"
                    returnKeyType={"search"}
                    blurOnSubmit={false}
                    autoCorrect={false}
                    autoFocus={this.props.autoFocus}
                    editable={this.props.editable}
                />
                {/*Right button*/}
                {!Utils.isNull(this.props.iconRightSearch) ? (
                    <TouchableOpacity
                        activeOpacity={Constants.ACTIVE_OPACITY}
                        style={{
                            paddingHorizontal: Constants.PADDING_LARGE
                        }}
                        onPress={() => {
                            this.props.onPressRightSearch();
                        }}
                    >
                        <Image source={this.props.iconRightSearch} />
                    </TouchableOpacity>
                ) : null}
            </View>
        );
    }

    renderChat() {
        return (
            <TouchableOpacity
                // activeOpacity={1}
                style={{
                    position: 'absolute',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flex: 1,
                    flexDirection: 'row',
                    right: 0,
                    marginRight: Constants.PADDING_12,
                }}
                onPress={this.props.gotoChat}>
                <View>
                    <Image
                        source={ic_chat_black}
                        style={{ height: Constants.DIVIDE_HEIGHT_LARGE * 6, width: Constants.DIVIDE_HEIGHT_LARGE * 6 }}
                        resizeMode={'contain'} />
                </View>
            </TouchableOpacity>
        )
    }

    renderMap() {
        return (
            <TouchableOpacity
                activeOpacity={1}
                style={{
                    position: 'absolute',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flex: 1,
                    flexDirection: 'row',
                    right: 0,
                    marginRight: Constants.PADDING_LARGE,
                }}
                onPress={this.props.openMenu}>
                <View>
                    <Image
                        source={this.props.icon}
                        style={{ height: Constants.DIVIDE_HEIGHT_LARGE * 6, width: Constants.DIVIDE_HEIGHT_LARGE * 6 }}
                        resizeMode={'contain'} />
                </View>
            </TouchableOpacity>
        )
    }

    renderAccount() {
        const { userName, gotoLogin, source } = this.props;
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                onPress={this.props.gotoLogin}
                style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    padding: Constants.PADDING_12
                }}>
                <ImageLoader
                    style={{
                        width: 40, height: 40,
                        borderRadius: 20,
                        position: 'relative',
                        backgroundColor: Colors.COLOR_WHITE
                    }}
                    resizeModeType={"cover"}
                    path={!Utils.isNull(this.props.source) ? this.props.source
                        : null}
                />
                {!Utils.isNull(userName)
                    ? <View style={{ flex: 1 }}>
                        <Text numberOfLines={2} style={[commonStyles.text, { marginLeft: Constants.MARGIN_X_LARGE, color: Colors.COLOR_WHITE }]}>
                            {userName.toUpperCase()}
                        </Text>
                    </View>
                    : null
                }
            </TouchableOpacity>
        )
    }

    /**
     * Render notification button
     */
    renderNotification() {
        const WIDTH = Utils.getLength(parseInt(global.badgeCount)) < 2 ? 20 : 28
        const HEIGHT = 20
        const RIGHT = 0
        const TOP = 0
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                style={{
                    padding: Constants.PADDING_LARGE
                }}
                onPress={this.props.gotoNotification}>
                <Image source={ic_notification_white} />
                {
                    global.badgeCount > 0 && (
                        <View style={{
                            position: 'absolute',
                            right: RIGHT,
                            top: TOP,
                            height: HEIGHT,
                            width: WIDTH,
                            backgroundColor: Colors.COLOR_RED,
                            borderRadius: 10,
                            padding: Constants.PADDING,
                            borderColor: Colors.COLOR_WHITE,
                            borderWidth: 1,
                            ...commonStyles.viewCenter
                        }}>
                            <Text style={{
                                textAlign: 'center',
                                color: 'white',
                                fontSize: Fonts.FONT_SIZE_X_SMALL,
                            }}>{global.badgeCount}</Text>
                        </View>
                    )
                }
            </TouchableOpacity>
        )
    }

    /**
     * Render timer count down
     */
    renderTimerCountDown() {
        return (
            <TimerCountDown
                isEnable={this.props.isReady}
                seconds={this.timeTick}
                onTimeElapsed={() => { this.onTimeElapsed() }}
                onTick={(seconds) => {
                    if (this.props.onTick) {
                        //If extra time != -1 is main time
                        //Otherwise, extra time
                        this.props.onTick(seconds / 1000)
                    }
                    this.timeTick = seconds / 1000
                }}
                style={{ textAlign: 'right', color: Colors.COLOR_WHITE, fontSize: 13, marginRight: Constants.MARGIN_LARGE }}
            />
        );
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.timeLimit <= 0)
            this.timeTick = newProps.timeLimit
        this.setState({
            countDownTime: newProps.timeLimit
        })
    }

    /**
     * Get remain time is countdown
     */
    getTime() {
        return this.timeTick
    }
}

const styles = {
    headerBody: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center'
    },

    whiteIcon: {
        color: Colors.COLOR_WHITE,
    },

    dotStage: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.COLOR_WHITE,
        justifyContent: 'center',
        alignItems: 'center'
    },
    searchBar: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.COLOR_WHITE,
        margin: Constants.MARGIN_LARGE,
        borderRadius: Constants.CORNER_RADIUS * 6,
        paddingHorizontal: Constants.PADDING_LARGE
    },
    barStage: {
        width: 10,
        height: 5,
        backgroundColor: Colors.COLOR_WHITE,
    }
}
export default HeaderView