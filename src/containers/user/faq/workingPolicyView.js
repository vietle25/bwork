import React, { Component } from 'react';
import { View, Text, RefreshControl, BackHandler, TouchableOpacity, Image, Dimensions } from 'react-native';
import BaseView from 'containers/base/baseView';
import * as actions from "actions/userActions";
import * as commonActions from "actions/commonActions";
import { connect } from "react-redux";
import StorageUtil from "utils/storageUtil";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { ErrorCode } from "config/errorCode";
import { Container, Root, Header, Content, Tabs, Tab, TabHeading } from 'native-base';
import commonStyles from 'styles/commonStyles';
import styles from './styles';
import { localizes } from 'locales/i18n';
import { Colors } from 'values/colors';
import Utils from 'utils/utils';
import { Constants } from 'values/constants';
import ic_check_box_white from 'images/ic_check_box_white.png';
import ic_uncheck_box_white from 'images/ic_uncheck_box_white.png';
import screenType from 'enum/screenType';
import HTML from 'react-native-render-html';

class WorkingPolicyView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            enableRefresh: true,
            refreshing: false,
            workingPolicy: null,
            workingPolicyPrivate: null,
            isConfirm: false
        };
        const { companyId, branchId, screen } = this.props.navigation.state.params;
        this.screen = screen;
        this.companyId = companyId;
        this.branchId = branchId;
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        this.getWorkingPolicy()
    }

    /**
     * Get working policy
     */
    getWorkingPolicy = () => {
        StorageUtil.retrieveItem(StorageUtil.MOBILE_CONFIG).then((faq) => {
            if (!Utils.isNull(faq)) {
                let workingPolicy = faq.find(x => x.name == 'working_policy');
                let workingPolicyPrivate = faq.find(x => x.name == 'working_policy_private');
                this.setState({
                    workingPolicy: !Utils.isNull(workingPolicy) ? workingPolicy.textValue : "",
                    workingPolicyPrivate: !Utils.isNull(workingPolicyPrivate) ? workingPolicyPrivate.textValue : ""
                });
            } else {
                this.handleRefresh();
            }
        }).catch((error) => {
            //this callback is executed when your Promise is rejected
            console.log('Promise is rejected with error: ' + error);
        });
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    /**
	 * Handle data when request
	 */
    handleData() {
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                this.state.refreshing = false;
                if (this.props.action == getActionSuccess(ActionEvent.GET_CONFIG)) {
                    this.configList = data;
                    if (this.screen != screenType.FROM_LOGIN) {
                        StorageUtil.storeItem(StorageUtil.MOBILE_CONFIG, this.configList);
                    }
                    if (!Utils.isNull(data)) {
                        let workingPolicy = data.find(x => x.name == 'working_policy');
                        let workingPolicyPrivate = data.find(x => x.name == 'working_policy_private');
                        this.setState({
                            workingPolicy: !Utils.isNull(workingPolicy) ? workingPolicy.textValue : "",
                            workingPolicyPrivate: !Utils.isNull(workingPolicyPrivate) ? workingPolicyPrivate.textValue : ""
                        });
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    /**
     * Handler back button
     */
    handlerBackButton() {
        console.log(this.className, 'back pressed')
        if (this.props.navigation) {
            if (this.screen != screenType.FROM_LOGIN) {
                this.onBack();
            }
        } else {
            return false
        }
        return true
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    render() {
        const { workingPolicy, workingPolicyPrivate } = this.state;
        return (
            <Container style={styles.container}>
                <Root>
                    <Header style={[commonStyles.header]}>
                        {this.renderHeaderView({
                            title: localizes("workingPolicy.title"),
                            titleStyle: { color: Colors.COLOR_WHITE },
                            renderRightMenu: this.renderRightHeader,
                            visibleBack: this.screen != screenType.FROM_LOGIN
                        })}
                    </Header>
                    <Content contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}
                        enableRefresh={this.state.enableRefresh}
                        refreshControl={
                            <RefreshControl
                                progressViewOffset={Constants.HEIGHT_HEADER_OFFSET_REFRESH}
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }
                    >
                        <View style={{ flex: 1, paddingHorizontal: Constants.PADDING_X_LARGE }}>
                            {!Utils.isNull(workingPolicy)
                                ? <HTML html={workingPolicy} imagesMaxWidth={Dimensions.get('window').width} />
                                : null
                            }
                        </View>
                    </Content>
                    {/* <Tabs
                        scrollWithoutAnimation={true}
                        locked={false}
                        tabBarUnderlineStyle={{ backgroundColor: Colors.COLOR_PRIMARY }}>
                        <Tab heading={
                            <TabHeading style={{ backgroundColor: Colors.COLOR_WHITE }}>
                                <Text style={{ color: Colors.COLOR_PRIMARY }}>Nội quy chung</Text>
                            </TabHeading>
                        }>
                            <Content contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}
                                enableRefresh={this.state.enableRefresh}
                                refreshControl={
                                    <RefreshControl
                                        progressViewOffset={Constants.HEIGHT_HEADER_OFFSET_REFRESH}
                                        refreshing={this.state.refreshing}
                                        onRefresh={this.handleRefresh}
                                    />
                                }
                            >
                                <View style={{ flex: 1, paddingHorizontal: Constants.PADDING_X_LARGE }}>
                                    {!Utils.isNull(workingPolicy)
                                        ? <HTML html={workingPolicy} imagesMaxWidth={Dimensions.get('window').width} />
                                        : null
                                    }
                                </View>
                            </Content>
                        </Tab>
                        <Tab heading={
                            <TabHeading style={{ backgroundColor: Colors.COLOR_WHITE }}>
                                <Text style={{ color: Colors.COLOR_PRIMARY }}>Nội quy riêng</Text>
                            </TabHeading>
                        }>
                            <Content contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}
                                enableRefresh={this.state.enableRefresh}
                                refreshControl={
                                    <RefreshControl
                                        progressViewOffset={Constants.HEIGHT_HEADER_OFFSET_REFRESH}
                                        refreshing={this.state.refreshing}
                                        onRefresh={this.handleRefresh}
                                    />
                                }
                            >
                                <View style={{ flex: 1, paddingHorizontal: Constants.PADDING_X_LARGE }}>
                                    {!Utils.isNull(workingPolicyPrivate)
                                        ? <HTML html={workingPolicyPrivate} imagesMaxWidth={Dimensions.get('window').width} />
                                        : null
                                    }
                                </View>
                            </Content>
                        </Tab>
                    </Tabs> */}
                    {/* Policy */}
                    {this.screen == screenType.FROM_LOGIN
                        ? <View>
                            <View style={{ padding: Constants.PADDING_X_LARGE }}>
                                <TouchableOpacity
                                    activeOpacity={Constants.ACTIVE_OPACITY}
                                    onPress={() => this.checkConfirm()}
                                    underlayColor='transparent'
                                >
                                    <View style={{ flexDirection: 'row', width: '100%' }}>
                                        <Image
                                            resizeMode={'contain'}
                                            source={this.state.isConfirm ? ic_check_box_white : ic_uncheck_box_white}
                                            style={{ marginRight: Constants.MARGIN_LARGE, marginTop: Constants.MARGIN }}
                                        />
                                        <Text style={[commonStyles.text, { flex: 1, margin: 0 }]}>{localizes('exTerms')} </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            {this.renderCommonButton(
                                localizes('yes').toUpperCase(),
                                { color: Colors.COLOR_WHITE },
                                { marginHorizontal: Constants.MARGIN_X_LARGE },
                                () => {
                                    if (this.state.isConfirm) {
                                        this.props.navigation.navigate("Login");
                                        this.showMessage(localizes("register.register_success"));
                                    } else {
                                        this.showMessage(localizes("noCheckTerms"));
                                    }
                                }
                            )}
                        </View>
                        : null
                    }
                    {this.state.refreshing ? null : this.showLoadingBar(this.props.isLoading)}
                </Root>
            </Container>
        );
    }

    //onRefreshing
    handleRefresh = () => {
        if (!Utils.isNull(this.companyId)) {
            this.state.refreshing = true;
            this.props.getConfig({ companyId: this.companyId, branchId: this.branchId });
        }
    }

    /**
     * Check confirm
     */
    checkConfirm = () => {
        this.setState({
            isConfirm: !this.state.isConfirm
        })
    }
}

const mapStateToProps = state => ({
    data: state.workingPolicy.data,
    isLoading: state.workingPolicy.isLoading,
    error: state.workingPolicy.error,
    errorCode: state.workingPolicy.errorCode,
    action: state.workingPolicy.action
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WorkingPolicyView);
