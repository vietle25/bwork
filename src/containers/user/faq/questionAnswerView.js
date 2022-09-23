import React, { Component } from "react";
import { ImageBackground, View, StatusBar, Image, TouchableOpacity, BackHandler, ScrollView, ActivityIndicator } from "react-native";
import { Container, Header, Title, Left, Icon, Right, Button, Body, Content, Text, Card, CardItem } from "native-base";
import { WebView } from 'react-native-webview';
import BaseView from "containers/base/baseView";
import { Colors } from 'values/colors';
import * as actions from 'actions/userActions';
import { Constants } from "values/constants";
import { connect } from 'react-redux';
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import StorageUtil from 'utils/storageUtil';
import { localizes } from "locales/i18n";
import Utils from "utils/utils";
import commonStyles from "styles/commonStyles";

class QuestionAnswerView extends BaseView {
    constructor(props) {
        super(props)
        this.state = {
            visible: true,
            urlFaq: {},
            canGoBack: false
        }
        this.configList = []
        const { actionTarget } = this.props.navigation.state.params;
        if (!Utils.isNull(actionTarget)) {
            this.state.urlFaq = actionTarget;
        }
        this.titleScreen = "";
    }

    componentWillMount() {
        super.componentWillMount();
    }

    /**
     * Hide spinner
     */
    hideSpinner() {
        this.setState({ visible: false });
    }

    componentDidMount() {
        super.componentDidMount();
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    handlerBackButton() {
        if (this.state.canGoBack) {
            this.refs.webView.goBack();
            return true;
        } else {
            this.props.navigation.pop(1);
            return true;
        }
    }

    render() {
        console.log('faq', this.state.urlFaq)
        return (
            <Container style={{ backgroundColor: Colors.COLOR_WHITE }}>
                <Header noShadow style={commonStyles.header}>
                    {this.renderHeaderView({
                        title: `${this.titleScreen}`,
                        onBack: this.onBackWeb.bind(this),
                        visibleStage: false,
                        titleStyle: { marginRight: Constants.MARGIN_X_LARGE * 2 }
                    })}
                </Header>
                <Content showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                    {!Utils.isNull(this.state.urlFaq)
                        ? <WebView
                            ref={"webView"}
                            source={{ uri: this.state.urlFaq.url }}
                            originWhitelist={['*']}
                            onLoad={() => (this.hideSpinner())}
                            style={{}}
                            onNavigationStateChange={this.onNavigationStateChange.bind(this)}
                        >
                        </WebView>
                        : null
                    }
                    {this.showLoadingBar(this.state.visible)}
                </Content>
            </Container>
        )
    }

    /**
     * On back web
     */
    onBackWeb() {
        if (this.state.canGoBack) {
            this.refs.webView.goBack();
        } else {
            this.onBack()
        }
    }

    onNavigationStateChange(navState) {
        this.setState({
            canGoBack: navState.canGoBack
        });
    }
}

export default QuestionAnswerView;