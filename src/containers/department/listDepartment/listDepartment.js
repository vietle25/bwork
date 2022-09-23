import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    RefreshControl,
    BackHandler
} from 'react-native';
import BaseView from 'containers/base/baseView';
import * as actions from "actions/userActions";
import * as commonActions from "actions/commonActions";
import * as userActions from "actions/userActions";
import { connect } from "react-redux";
import { ErrorCode } from "config/errorCode";
import { ActionEvent, getActionSuccess } from "actions/actionEvent";
import { Constants } from 'values/constants';
import Utils from 'utils/utils';
import { Content, Container, Root, Header } from 'native-base';
import styles from './styles';
import commonStyles from "styles/commonStyles";
import { Colors } from 'values/colors';
import FlatListCustom from 'components/flatListCustom';
import itemDepartment from './itemDepartment';
import { localizes } from 'locales/i18n';
import DialogCustom from 'components/dialogCustom';
import DateUtil from 'utils/dateUtil';
import StorageUtil from 'utils/storageUtil';
import screenType from 'enum/screenType';
import ItemDepartment from './itemDepartment';

class ListDepartmentView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            enableLoadMore: false,
            enableRefresh: true,
            isLoadingMore: false,
            refreshing: true,
            listDepartment: [],
            isAlertDelete: false
        };
        this.filter = {
            companyId: null,
            branchId: null,
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0
            }
        };
        this.showNoData = false;
        this.dataDelete = null;
    }

    componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handlerBackButton);
        this.getSourceUrlPath();
        StorageUtil.retrieveItem(StorageUtil.COMPANY_INFO).then((companyInfo) => {
            this.company = companyInfo.company;
            this.branch = companyInfo.branch;
            this.filter.companyId = companyInfo.company.id;
            this.filter.branch = !Utils.isNull(companyInfo.branch) ? companyInfo.branch.id : null;
            this.handleRequest();
        }).catch((error) => {
            this.saveException(error, 'componentDidMount')
        });
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps
            this.handleData()
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
                this.state.isLoadingMore = false;
                if (this.props.action == getActionSuccess(ActionEvent.GET_LIST_DEPARTMENT)) {
                    if (!Utils.isNull(data)) {
                        if (this.filter.paging.page == 0) {
                            this.state.listDepartment = [];
                        }
                        this.state.enableLoadMore = !(data.length < Constants.PAGE_SIZE);
                        if (data.length > 0) {
                            data.forEach(item => {
                                this.state.listDepartment.push({ ...item });
                            });
                        }
                        console.log("GET_LIST_DEPARTMENT", this.state.listDepartment)
                    }
                    this.showNoData = true;
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    //onHandleRequest
    handleRequest = () => {
        this.props.getListDepartment(this.filter);
    }

    //onRefreshing
    handleRefresh = () => {
        this.state.refreshing = true;
        this.filter.paging.page = 0;
        this.handleRequest();
    }

    //onLoadMore
    onLoadMore = () => {
        if (!this.props.isLoading) {
            this.state.isLoadingMore = true;
            this.filter.paging.page += 1;
            this.handleRequest();
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    render() {
        const { listDepartment } = this.state;
        return (
            <Container style={styles.container}>
                <Root>
                    <Header hasTabs style={commonStyles.header}>
                        {this.renderHeaderView({
                            visibleBack: true,
                            title: localizes("department.departmentTitle"),
                            titleStyle: { textAlign: 'center', color: Colors.COLOR_WHITE },
                            renderRightMenu: this.renderRightMenu
                        })}
                    </Header>
                    <FlatListCustom
                        ref={(r) => { this.listRef = r }}
                        ListHeaderComponent={this.renderListHeaderComponent}
                        contentContainerStyle={{
                            flexGrow: 1,
                            backgroundColor: listDepartment.length > 0 ? Colors.COLOR_WHITE : Colors.COLOR_BACKGROUND
                        }}
                        style={{ flex: 1 }}
                        data={listDepartment}
                        renderItem={this.renderItem}
                        enableRefresh={this.state.enableRefresh}
                        refreshControl={
                            <RefreshControl
                                progressViewOffset={Constants.HEIGHT_HEADER_OFFSET_REFRESH}
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }
                        enableLoadMore={this.state.enableLoadMore}
                        onLoadMore={this.onLoadMore}
                        showsVerticalScrollIndicator={false}
                        isShowEmpty={this.showNoData}
                        isShowImageEmpty={true}
                        textForEmpty={localizes("noData")}
                        styleEmpty={{ marginTop: Constants.MARGIN_X_LARGE }}
                    />
                    {this.state.isLoadingMore || this.state.refreshing ? null : this.showLoadingBar(this.props.isLoading)}
                </Root>
            </Container>
        );
    }

    /**
     * Render right menu
     */
    renderRightMenu = () => {
        return (
            <View></View>
        )
    }

    /**
     * Render list header component
     */
    renderListHeaderComponent = () => {
        return null
    }

    /**
     * Render item
     */
    renderItem = (item, index, parentIndex, indexInParent) => {
        const resourceUrlPathResize = !Utils.isNull(this.resourceUrlPathResize) ? this.resourceUrlPathResize.textValue : null;
        return (
            <ItemDepartment
                key={index.toString()}
                item={item}
                index={index}
                resourcePath={resourceUrlPathResize}
                onPress={this.onPressItem}
                lengthData={this.state.listDepartment.length}
            />
        )
    }

    /**
     * On press item
     */
    onPressItem = (data) => {
        this.props.navigation.navigate("StaffDepartmentList", { departmentId: data.id, nameDepartment: data.name })
    }

}

const mapStateToProps = state => ({
    data: state.department.data,
    isLoading: state.department.isLoading,
    error: state.department.error,
    errorCode: state.department.errorCode,
    action: state.department.action
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions,
    ...userActions
};

export default connect(mapStateToProps, mapDispatchToProps)(ListDepartmentView);