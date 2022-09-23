import React, { Component } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, findNodeHandle, ImageBackground, Button } from 'react-native';
import * as actions from './../actions';
import { connect } from 'react-redux';
import ic_arow_primary from 'images/ic_arow_primary.png';
import ic_arow_gray from 'images/ic_arow_gray.png';
import { Constants } from 'values/constants';
import FlatListCustom from 'components/flatListCustom';
import GridView from 'components/gridView';
import Dialog, { DIALOG_WIDTH } from 'components/dialog'
import commonStyles from 'styles/commonStyles';
import { Colors } from 'values/colors';
import { localizes } from 'locales/i18n';
import ic_cancel from "images/ic_cancel.png";
import Utils from 'utils/utils';

class DialogCustom extends Component {

    constructor(props) {
        super(props)
        this.state = {
            visible: props.visible
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.setState({
            visible: nextProps.visible
        })
    }

    /**
     * text: ex: "do you want to logout?"
     */
    renderContentText() {
        const { contentText, styleContentText, styleContainerText } = this.props;
        return (
            <View style={styleContainerText} >
                <Text style={[commonStyles.text, { margin: 0, marginBottom: Constants.MARGIN_XX_LARGE }, styleContentText]} >
                    {contentText}
                </Text>
            </View>
        )
    }

    /**
     * for choose images from camera and gallery
     */
    renderContentForChooseImg() {
        const { styleItemRow, styleContainerFroImg, onPressCamera, onPressGallery } = this.props;
        return (
            <View style={styleContainerFroImg} >
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    block info
                    onPress={() => onPressCamera()}>
                    <Text style={[commonStyles.text, { marginLeft: 0, marginVertical: Constants.MARGIN_LARGE }, styleItemRow]} >Chụp ảnh</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    block info
                    onPress={() => onPressGallery()}>
                    <Text style={[commonStyles.text, { marginLeft: 0, marginBottom: Constants.MARGIN }, styleItemRow]} >Thư viện</Text>
                </TouchableOpacity>
            </View>
        )
    }

    /**
     * render title for dialog
     */
    renderTitle() {
        const { contentTitle, styleItemBtn, onPressX, styleTextTitle } = this.props;
        return (
            <View style={[commonStyles.viewHorizontal, commonStyles.viewCenter, {
                flex: 0, marginBottom: Constants.MARGIN_LARGE
            }]} >
                <Text style={[commonStyles.text, {
                    margin: 0, flex: 1
                }, styleTextTitle]} >{contentTitle.toUpperCase()}</Text>
                {onPressX ?
                    <TouchableOpacity
                        activeOpacity={Constants.ACTIVE_OPACITY}
                        block style={[styleItemBtn]} info
                        onPress={() => onPressX()}>
                        <Image source={ic_cancel} />
                    </TouchableOpacity> : null
                }
            </View>
        )
    }

    /**
     * Render one button
     */
    renderOneButton() {
        const { textBtn, styleContainerBtn, styleTextBtn, onPressBtn, styleItemBtn } = this.props;
        return (
            <View style={[{ backgroundColor: Colors.COLOR_WHITE }]}>
                <View style={[{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                }, styleContainerBtn]} >
                    <TouchableOpacity block
                        activeOpacity={Constants.ACTIVE_OPACITY}
                        style={[{ marginTop: Constants.MARGIN_LARGE }, styleItemBtn]} info
                        onPress={
                            () => { onPressBtn() }}>
                        <Text
                            style={[commonStyles.text, { color: Colors.COLOR_PRIMARY }, styleTextBtn]} >{textBtn.toUpperCase()}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    /**
     * render btn Cancel and ...
     */
    renderTwoButton() {
        const { textBtnOne, textBtnTwo, styleContainerBtn, styleItemBtn,
            styleTextBtnTwo, styleTextBtnOne, onPressX, onPressBtnOne, onPressBtnPositive } = this.props;
        return (
            <View style={[{ backgroundColor: Colors.COLOR_WHITE }]}>
                <View style={[{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                }, styleContainerBtn]} >
                    {!Utils.isNull(textBtnOne) ?
                        <TouchableOpacity
                            activeOpacity={Constants.ACTIVE_OPACITY}
                            block style={[{ marginTop: Constants.MARGIN_LARGE, marginRight: Constants.MARGIN_X_LARGE }, styleItemBtn]} info
                            onPress={
                                () => { onPressBtnOne ? onPressBtnOne() : onPressX() }}>
                            <Text style={[commonStyles.text, { color: Colors.COLOR_TEXT }, styleTextBtnOne]} >{textBtnOne.toUpperCase()}</Text>
                        </TouchableOpacity> : null
                    }
                    <TouchableOpacity block
                        activeOpacity={Constants.ACTIVE_OPACITY}
                        style={[{ marginTop: Constants.MARGIN_LARGE }, styleItemBtn]} info
                        onPress={
                            () => { onPressBtnPositive() }}>
                        <Text
                            style={[commonStyles.text, { color: Colors.COLOR_PRIMARY }, styleTextBtnTwo]} >{textBtnTwo.toUpperCase()}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    _renderOutsideTouchable(onTouch) {
        const view = <View style={{ flex: 1, width: '100%' }} />

        // if (!onTouch) return view;

        return (
            <TouchableWithoutFeedback onPress={() => {
                this.showDialog(false)
                onTouch && onTouch()
            }} style={{ flex: 1, width: '100%' }}>
                {view}
            </TouchableWithoutFeedback>
        )
    }

    render() {
        return (
            <Dialog
                visible={this.state.visible}
                dialogStyle={[commonStyles.shadowOffset, {
                    borderRadius: Constants.CORNER_RADIUS,
                    borderColor: 'red',
                    backgroundColor: Colors.COLOR_WHITE,
                }]}
                onTouchOutside={() => { this.setState({ isAlert: false }) }}
                renderContent={
                    () => {
                        return (
                            <View style={{ margin: Constants.MARGIN_X_LARGE }} >
                                {this.props.isVisibleTitle ? this.renderTitle() : null}
                                {this.props.isVisibleContentText ? this.renderContentText() : null}
                                {this.props.isVisibleContentForChooseImg ? this.renderContentForChooseImg() : null}
                                {this.props.isVisibleTwoButton ? this.renderTwoButton() : null}
                                {this.props.isVisibleOneButton ? this.renderOneButton() : null}
                            </View>
                        )
                    }
                } />
        )
    }
}

export default DialogCustom;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF'
    },
    card: {
        flex: 1,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#E8E8E8',
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    text: {
        textAlign: 'center',
        fontSize: 50,
        backgroundColor: 'transparent'
    },
    done: {
        textAlign: 'center',
        fontSize: 30,
        color: 'white',
        backgroundColor: 'transparent'
    }
})