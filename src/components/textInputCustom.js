import {Component} from 'react';
import {Dimensions, Image, TextInput, TouchableOpacity, View} from 'react-native';
import commonStyles from 'styles/commonStyles';
import Utils from 'utils/utils';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';

/**
 * This is text input custom without using state to change value
 * You can use this component instead of TextInput
 */

const heightDevice = Dimensions.get('window').height;

export default class TextInputCustom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value ? props.value : '',
            isFocus: props.isFocus,
        };
    }

    render() {
        const {isMultiLines, isInputAction, isInputNormal, isBorderMultiLines} = this.props;
        return (
            <View>
                {isMultiLines ? this.renderInputMultiLines() : null}
                {isInputAction ? this.renderInputAction() : null}
                {isInputNormal ? this.renderInputOneLine() : null}
                {isBorderMultiLines ? this.renderInputBorderMultiLines() : null}
            </View>
        );
    }

    renderInputOneLine() {
        const {
            refInput,
            inputNormalStyle,
            placeholderTextColor = Colors.COLOR_PLACEHOLDER_TEXT_DISABLE,
            autoCapitalize,
            returnKeyType,
            placeholder,
            editable,
            onSubmitEditing,
            keyboardType,
            secureTextEntry,
            borderBottomWidth,
            borderBottomColor,
            styleInputGroup,
            onPressContentLeft,
            onSelectionChange,
            textAlign,
            blurOnSubmit,
            onFocus,
            numberOfLines,
            contentLeft = null,
            contentRight = null,
        } = this.props;
        return (
            <View
                style={[
                    {
                        paddingRight: 0,
                        paddingLeft: 0,
                        borderBottomWidth: !Utils.isNull(borderBottomWidth)
                            ? borderBottomWidth
                            : Constants.BORDER_WIDTH,
                        borderBottomColor: !Utils.isNull(borderBottomColor)
                            ? borderBottomColor
                            : Colors.COLOR_BACKGROUND,
                        height: 52,
                        flexDirection: 'row',
                        alignItems: 'center',
                    },
                    styleInputGroup,
                ]}>
                {!Utils.isNull(contentLeft) ? (
                    <TouchableOpacity onPress={onPressContentLeft} activeOpacity={Constants.ACTIVE_OPACITY}>
                        <Image source={contentLeft} style={{marginRight: Constants.MARGIN_LARGE}} />
                    </TouchableOpacity>
                ) : null}
                <TextInput
                    {...this.props}
                    ref={refInput}
                    secureTextEntry={secureTextEntry}
                    placeholder={placeholder}
                    placeholderTextColor={placeholderTextColor}
                    returnKeyType={returnKeyType}
                    autoCapitalize={autoCapitalize}
                    style={[
                        commonStyles.text,
                        commonStyles.inputText,
                        {
                            flex: 1,
                            elevation: 0,
                        },
                        inputNormalStyle,
                    ]}
                    textAlign={textAlign}
                    value={this.state.value}
                    onChangeText={this.changeText.bind(this)}
                    underlineColorAndroid="transparent"
                    onSubmitEditing={onSubmitEditing}
                    keyboardType={keyboardType}
                    onSelectionChange={onSelectionChange}
                    blurOnSubmit={blurOnSubmit}
                    onFocus={onFocus}
                    numberOfLines={numberOfLines}
                    editable={editable}
                />
                {!Utils.isNull(contentRight) ? contentRight : null}
            </View>
        );
    }

    renderInputAction() {
        const {
            refInput,
            onPress,
            touchSpecialStyle,
            inputNormalStyle,
            imageSpecialStyle,
            placeholder,
            disabled,
            autoCapitalize,
            contentRight,
            borderBottomWidth,
            contentLeft,
        } = this.props;
        return (
            <TouchableOpacity
                disabled={disabled}
                onPress={onPress}
                activeOpacity={1}
                style={[
                    {
                        ...commonStyles.viewHorizontal,
                        alignItems: 'center',
                        borderBottomWidth: !Utils.isNull(borderBottomWidth)
                            ? borderBottomWidth
                            : Constants.BORDER_WIDTH,
                        borderBottomColor: Colors.COLOR_BACKGROUND,
                    },
                    touchSpecialStyle,
                ]}>
                {!Utils.isNull(contentLeft) ? (
                    <Image source={contentLeft} style={{marginRight: Constants.MARGIN_LARGE}} />
                ) : null}
                <TextInput
                    {...this.props}
                    autoCapitalize={autoCapitalize}
                    ref={refInput}
                    style={[
                        commonStyles.text,
                        commonStyles.inputText,
                        {
                            flex: 1,
                            elevation: 0,
                        },
                        inputNormalStyle,
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.COLOR_DRK_GREY}
                    value={this.state.value}
                    onChangeText={this.changeText.bind(this)}
                    underlineColorAndroid="transparent"
                    blurOnSubmit={false}
                    autoCorrect={false}
                    editable={false}
                    selectTextOnFocus={false}
                />
                {!Utils.isNull(contentRight) ? contentRight : null}
            </TouchableOpacity>
        );
    }

    renderInputMultiLines() {
        const {inputNormalStyle, refInput, borderBottomWidth, styleInputGroup, contentLeft, editable} = this.props;
        return (
            <View
                style={[
                    {
                        paddingRight: 0,
                        paddingLeft: 0,
                        borderBottomWidth: !Utils.isNull(borderBottomWidth)
                            ? borderBottomWidth
                            : Constants.BORDER_WIDTH,
                        borderBottomColor: Colors.COLOR_BACKGROUND,
                    },
                    styleInputGroup,
                ]}>
                {!Utils.isNull(contentLeft) ? (
                    <Image source={contentLeft} style={{marginRight: Constants.MARGIN_LARGE}} />
                ) : null}
                <TextInput
                    {...this.props}
                    ref={refInput}
                    style={[
                        commonStyles.text,
                        commonStyles.inputText,
                        {
                            flex: 1,
                            elevation: 0,
                        },
                        inputNormalStyle,
                    ]}
                    placeholderTextColor={Colors.COLOR_DRK_GREY}
                    onChangeText={this.changeText.bind(this)}
                    underlineColorAndroid="transparent"
                    blurOnSubmit={false}
                    multiline={true}
                    editable={editable}
                />
            </View>
        );
    }

    renderInputBorderMultiLines() {
        const {inputNormalStyle, refInput, styleInputGroup, contentLeft, editable} = this.props;
        return (
            <View
                style={[
                    {
                        paddingRight: 0,
                        paddingLeft: 0,
                    },
                    styleInputGroup,
                ]}>
                {!Utils.isNull(contentLeft) ? (
                    <Image source={contentLeft} style={{marginRight: Constants.MARGIN_LARGE}} />
                ) : null}
                <TextInput
                    {...this.props}
                    ref={refInput}
                    style={[
                        commonStyles.text,
                        {
                            flex: 1,
                            elevation: 0,
                            margin: 0,
                            paddingHorizontal: Constants.MARGIN_LARGE,
                            borderRadius: Constants.CORNER_RADIUS / 2,
                            borderWidth: Constants.BORDER_WIDTH,
                            borderColor: Colors.COLOR_GRAY,
                        },
                        inputNormalStyle,
                    ]}
                    placeholderTextColor={Colors.COLOR_DRK_GREY}
                    onChangeText={this.changeText.bind(this)}
                    underlineColorAndroid="transparent"
                    blurOnSubmit={false}
                    multiline={true}
                    editable={editable}
                />
            </View>
        );
    }

    changeText(text) {
        this.setState({
            value: text,
        });
        if (this.props.onChangeText) this.props.onChangeText(text);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        // if (nextProps.value !== this.props.value){
        this.setState({
            value: nextProps.value,
        });
        // }
    }
}
