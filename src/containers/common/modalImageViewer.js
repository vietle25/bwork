import React, { Component } from "react";
import {
    ImageBackground, Text, View, Image, TouchableOpacity,
    StyleSheet, Dimensions, Platform, ScrollView, SafeAreaView,
    Modal, PermissionsAndroid
} from "react-native";
import { Colors } from "values/colors";
import { Constants } from "values/constants";
import commonStyles from "styles/commonStyles";
import Utils from "utils/utils";
import { localizes } from "locales/i18n";
import ImageViewer from 'react-native-image-zoom-viewer';
import BaseView from "containers/base/baseView";
import { Header } from "native-base";
import ic_cancel_white from 'images/ic_cancel_white.png';

const screen = Dimensions.get("window");

export default class ModalImageViewer extends BaseView {

    constructor(props) {
        super(props)
        this.state = {
            isVisible: false,
            indexZoom: 0,
            images: []
        };
    }

    componentDidMount() {
        this.getSourceUrlPath();
    }

    /**
     * Show modal
     */
    showModal(images, indexZoom) {
        this.setState({
            isVisible: true,
            images,
            indexZoom: indexZoom
        })
    }

    /**
     * Hide modal
     */
    hideModal() {
        this.setState({
            isVisible: false
        })
    }

    render() {
        const { images, indexZoom, isVisible } = this.state;
        if (!Utils.isNull(images)) {
            this.imageUrls = [];
            images.forEach(item => {
                let image = !Utils.isNull(item.path) && (item.path.indexOf('file') && item.path.indexOf('http')) != -1
                    ? item.path : this.resourceUrlPath.textValue + "/" + item.path;
                this.imageUrls.push({ url: image });
            })
        }
        return (
            <SafeAreaView>
                <Modal
                    ref={"modalImageViewer"}
                    onRequestClose={() => this.setState({ isVisible: false })}
                    visible={isVisible}
                    transparent={true}
                    useNativeDriver={true}
                >
                    <ImageViewer
                        enableSwipeDown={true}
                        onCancel={() => this.hideModal()}
                        imageUrls={this.imageUrls}
                        index={indexZoom}
                        onChange={(indexZoom) => this.setState({ indexZoom })}
                    />
                    <View style={{
                        position: 'absolute',
                        top: 0, right: 0, left: 0
                    }}>
                        <TouchableOpacity
                            style={{
                                alignSelf: "flex-end",
                                padding: Constants.PADDING_X_LARGE
                            }}
                            onPress={() => this.hideModal()}
                        >
                            <Image source={ic_cancel_white} />
                        </TouchableOpacity>
                    </View>
                </Modal>
            </SafeAreaView>
        );
    }
}