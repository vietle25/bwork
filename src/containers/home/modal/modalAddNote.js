import React, { Component } from "react";
import { ImageBackground, Text, View, Image, TouchableOpacity, StyleSheet, Dimensions, Platform, ScrollView, TextInput } from "react-native";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import commonStyles from "styles/commonStyles";
import Modal from "react-native-modalbox";
import Utils from "utils/utils";
import ic_cancel_black from "images/ic_cancel.png";
import StringUtil from "utils/stringUtil";
import userType from "enum/userType";
import FlatListCustom from "components/flatListCustom";
import BaseView from "containers/base/baseView";
import { Fonts } from "values/fonts";
import ImageLoader from "components/imageLoader";
import TextInputCustom from "components/textInputCustom";
import { filter } from "rxjs/operators";
import { Spinner } from "native-base";

const screen = Dimensions.get("window");
const deviceWidth = screen.width;
const deviceHeight = screen.height

export default class ModalAddNote extends BaseView {

    constructor(props) {
        super(props)
        this.state = {
            titleNote: '',
            timekeepingType: null,
            txtNote: '',
            isLoading: false
        }
        this.onChangeTxtNote = this.onChangeTxtNote.bind(this)
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            // handle
        }
    }

    /**
     * Show Model 
     */
    showModal(titleNote, timekeepingType) {
        this.setState({ titleNote, timekeepingType });
        this.refs.modalAddNote.open();
    }

    /**
     * hide Modal 
     */
    hideModal() {
        setTimeout(() => {
            this.setState({ isLoading: false });
            this.refs.modalAddNote.close();
        }, 1000);
    }

    render() {
        const { titleNote, isLoading } = this.state;
        const { tvCheck } = this.props;
        return (
            <Modal
                ref={"modalAddNote"}
                animationType={'fade'}
                transparent={true}
                style={{
                    backgroundColor: "#00000000",
                    flex: 1,
                    justifyContent: 'flex-end'
                }}
                backdrop={true}
                swipeToClose={Platform.OS === 'android' ? false : true}
                backdropPressToClose={false}
                onClosed={() => {
                    this.hideModal()
                }}
                backButtonClose={true}
                position={'bottom'}
                coverScreen={true}
                useNativeDriver={true}
            >
                <View style={{
                    flex: 0,
                    backgroundColor: Colors.COLOR_BACKGROUND,
                    borderTopLeftRadius: Constants.CORNER_RADIUS,
                    borderTopRightRadius: Constants.CORNER_RADIUS
                }}>
                    <View style={[commonStyles.viewHorizontal, {
                        flex: 0, alignItems: 'flex-start',
                        margin: Constants.MARGIN_X_LARGE
                    }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[commonStyles.text, { margin: 0 }]}>{titleNote}</Text>
                        </View>
                        <TouchableOpacity style={{ marginLeft: Constants.MARGIN_X_LARGE }}
                            onPress={() => this.hideModal()}>
                            <Image source={ic_cancel_black} />
                        </TouchableOpacity>
                    </View>
                    <View style={{
                        paddingHorizontal: Constants.PADDING_X_LARGE,
                        backgroundColor: Colors.COLOR_WHITE,
                        borderRadius: Constants.CORNER_RADIUS,
                        marginHorizontal: Constants.MARGIN_X_LARGE,
                    }}>
                        {/* Text input note */}
                        <TextInputCustom
                            inputNormalStyle={{ height: 66 }}
                            refInput={r => (this.txtNote = r)}
                            isInputNormal={true}
                            // isMultiLines={true}
                            placeholder="Nhập lý do"
                            value={this.state.txtNote}
                            onChangeText={this.onChangeTxtNote}
                            // onSubmitEditing={() => { }}
                            returnKeyType={null}
                            borderBottomWidth={0}
                        />
                    </View>
                    <TouchableOpacity
                        onPress={() => { isLoading ? null : this.onTimekeeping() }}
                        activeOpacity={Constants.ACTIVE_OPACITY}
                        style={[commonStyles.viewCenter, {
                            paddingVertical: Constants.PADDING_LARGE,
                            borderRadius: Constants.CORNER_RADIUS,
                            backgroundColor: Colors.COLOR_PRIMARY,
                            margin: Constants.MARGIN_X_LARGE
                        }]}>
                        {isLoading
                            ? <Spinner style={{ height: 28 }} color={Colors.COLOR_WHITE} size={"small"} />
                            : <Text style={[commonStyles.text, { color: Colors.COLOR_WHITE }]}>{tvCheck}</Text>
                        }
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }

    /**
     * On change txtNote
     * @param {*} txtNote 
     */
    onChangeTxtNote(txtNote) {
        this.setState({
            txtNote
        })
    }

    /**
     * On timekeeping
     */
    onTimekeeping = () => {
        const { txtNote, timekeepingType } = this.state;
        const { tvCheck } = this.props;
        const { onTimekeeping } = this.props;
        if (txtNote.trim().length == 0) {
            this.showMessage("Vui lòng nhập lý do muốn " + tvCheck + "!")
        } else if (txtNote.trim().length > 255) {
            this.showMessage("Vui lòng nhập lý do tối đa 255 ký tự!")
        } else {
            this.hideModal();
            let filter = {
                checkNote: txtNote.trim(),
                timekeepingType: timekeepingType
            };
            this.setState({ isLoading: true });
            setTimeout(() => {
                onTimekeeping(filter);
                this.state.txtNote = '';
            }, 1000);
        }
    }
}