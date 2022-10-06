import {ActionEvent, getActionSuccess} from 'actions/actionEvent';
import * as commonActions from 'actions/commonActions';
import * as salaryActions from 'actions/salaryAction';
import * as actions from 'actions/userActions';
import FlatListCustom from 'components/flatListCustom';
import {ErrorCode} from 'config/errorCode';
import BaseView from 'containers/base/baseView';
import screenType from 'enum/screenType';
import ic_cancel from 'images/ic_cancel.png';
import ic_search_black from 'images/ic_search_black.png';
import ic_search_white from 'images/ic_search_white.png';
import {localizes} from 'locales/i18n';
import {Container} from 'native-base';
import {Image, RefreshControl, TouchableOpacity, View} from 'react-native';
import {connect} from 'react-redux';
import commonStyles from 'styles/commonStyles';
import DateUtil from 'utils/dateUtil';
import StorageUtil from 'utils/storageUtil';
import Utils from 'utils/utils';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';
import ItemStaff from './itemStaff';
import styles from './styles';

class ListStaffSalaryView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            enableLoadMore: false,
            enableRefresh: true,
            isLoadingMore: false,
            refreshing: true,
            staffSalary: [],
            isAlertDelete: false,
            typing: false,
            typingTimeout: 0,
            isSearch: false,
            txtSearch: null,
        };
        this.filter = {
            companyId: null,
            branchId: null,
            month: DateUtil.convertFromFormatToFormat(
                DateUtil.now(),
                DateUtil.FORMAT_DATE_TIME_ZONE_T,
                DateUtil.FORMAT_DATE_MONTH_OF_YEAR,
            ),
            paging: {
                pageSize: Constants.PAGE_SIZE,
                page: 0,
            },
            stringSearch: null,
        };
        this.user = null;
        this.showNoData = false;
        this.dataDelete = null;
    }

    componentDidMount() {
        this.getSourceUrlPath();
        this.getUserProfile();
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    /**
     * Get information user profile
     */
    getUserProfile = () => {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE)
            .then(user => {
                //this callback is executed when your Promise is resolved
                if (!Utils.isNull(user)) {
                    this.user = user;
                    this.props.getProfileAdmin(user.id);
                    StorageUtil.retrieveItem(StorageUtil.COMPANY_INFO)
                        .then(companyInfo => {
                            this.filter.companyId = companyInfo.company.id;
                            this.filter.branchId = !Utils.isNull(companyInfo.branch) ? companyInfo.branch.id : null;
                            this.handleRequest();
                        })
                        .catch(error => {
                            this.saveException(error, 'componentDidMount');
                        });
                }
            })
            .catch(error => {
                this.saveException(error, 'getUserProfile');
            });
    };

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                this.state.refreshing = false;
                this.state.isLoadingMore = false;
                if (this.props.action == getActionSuccess(ActionEvent.GET_STAFF_SALARY)) {
                    if (!Utils.isNull(data)) {
                        if (data.paging.page == 0) {
                            this.state.staffSalary = [];
                        }
                        this.state.enableLoadMore = !(data.data.length < Constants.PAGE_SIZE);
                        if (data.data.length > 0) {
                            data.data.forEach(item => {
                                this.state.staffSalary.push({...item});
                            });
                        }
                        console.log('GET_STAFF_SALARY', this.state.staffSalary);
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
        this.props.getStaffSalary(this.filter);
    };

    //onRefreshing
    handleRefresh = () => {
        this.state.refreshing = true;
        this.filter.paging.page = 0;
        this.handleRequest();
    };

    //onLoadMore
    onLoadMore = () => {
        if (!this.props.isLoading) {
            this.state.isLoadingMore = true;
            this.filter.paging.page += 1;
            this.handleRequest();
        }
    };

    /**
     * Render mid menu
     */
    renderMidMenu = () => {
        return !this.state.isSearch && <View style={{flex: 1}} />;
    };

    /**
     * On submit editing
     */
    onSubmitEditing = () => {};

    /**
     * Manager text input search
     * @param {*} stringSearch
     */
    onChangeTextInput = stringSearch => {
        const self = this;
        if (self.state.typingTimeout) {
            clearTimeout(self.state.typingTimeout);
        }
        this.setState({
            txtSearch: stringSearch == '' ? null : stringSearch,
            typing: false,
            typingTimeout: setTimeout(() => {
                if (!Utils.isNull(stringSearch)) {
                    this.onSearch(stringSearch);
                } else {
                    this.handleRefresh();
                }
            }, 1000),
        });
    };

    onSearch(text) {
        this.filter.stringSearch = text;
        if (!Utils.isNull(text)) {
            this.handleRefresh();
        }
    }

    render() {
        const {staffSalary, isSearch} = this.state;
        return (
            <Container style={styles.container}>
                <View style={{flex: 1}}>
                    <HStack>
                        {' '}
                        hasTabs style={commonStyles.header}>
                        {this.renderHeaderView({
                            visibleBack: false,
                            title: localizes('salaryStaff.salaryStaffTitle'),
                            visibleSearchBar: isSearch,
                            onPressRightSearch: () => {
                                this.filter.stringSearch = null;
                                this.onToggleSearch();
                                this.handleRefresh();
                            },
                            iconRightSearch: ic_cancel,
                            placeholder: localizes('search'),
                            onRef: ref => {
                                this.txtSearch = ref;
                            },
                            iconLeftSearch: ic_search_black,
                            styleIconLeftSearch: {width: 20, height: 20},
                            autoFocus: true,
                            onSubmitEditing: this.onSubmitEditing,
                            onPressLeftSearch: () => {},
                            renderMidMenu: this.renderMidMenu,
                            onChangeTextInput: this.onChangeTextInput,
                            titleStyle: {textAlign: 'center', color: Colors.COLOR_WHITE},
                            renderRightMenu: this.renderRightMenu,
                        })}
                    </HStack>
                    <FlatListCustom
                        ref={r => {
                            this.listRef = r;
                        }}
                        ListHeaderComponent={this.renderListHeaderComponent}
                        contentContainerStyle={{
                            flexGrow: 1,
                        }}
                        style={{flex: 1}}
                        data={staffSalary}
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
                        textForEmpty={localizes('noData')}
                        styleEmpty={{marginTop: Constants.MARGIN_X_LARGE}}
                    />
                    {this.state.isLoadingMore || this.state.refreshing
                        ? null
                        : this.showLoadingBar(this.props.isLoading)}
                </View>
            </Container>
        );
    }

    /**
     * Render right menu
     */
    renderRightMenu = () => {
        const {isSearch} = this.state;
        return (
            !isSearch && (
                <TouchableOpacity
                    activeOpacity={Constants.ACTIVE_OPACITY}
                    style={{
                        justifyContent: 'center',
                        padding: Constants.PADDING_LARGE,
                    }}
                    onPress={() => this.onToggleSearch()}>
                    <Image source={ic_search_white} />
                </TouchableOpacity>
            )
        );
    };

    /**
     * on toggle search
     */
    onToggleSearch() {
        if (!this.state.isSearch) {
            this.setState(
                {
                    isSearch: !this.state.isSearch,
                },
                () => {
                    this.txtSearch.focus();
                },
            );
        } else {
            this.setState({
                txtSearch: null,
                isSearch: !this.state.isSearch,
            });
        }
    }

    /**
     * Render list header component
     */
    renderListHeaderComponent = () => {
        return null;
    };

    /**
     * Render item
     */
    renderItem = (item, index, parentIndex, indexInParent) => {
        const resourceUrlPathResize = !Utils.isNull(this.resourceUrlPathResize)
            ? this.resourceUrlPathResize.textValue
            : null;
        return (
            <ItemStaff
                key={index.toString()}
                item={item}
                index={index}
                urlPathResize={resourceUrlPathResize}
                onPress={this.onPressItem}
                lengthData={this.state.staffSalary.length}
            />
        );
    };

    /**
     * On press item
     */
    onPressItem = data => {
        this.props.navigation.navigate('SalaryHistory', {
            user: !Utils.isNull(data.userModel) ? data.userModel : null,
            screen: screenType.FROM_STAFF_SALARY,
        });
    };
}

const mapStateToProps = state => ({
    data: state.salaryStaff.data,
    action: state.salaryStaff.action,
    isLoading: state.salaryStaff.isLoading,
    error: state.salaryStaff.error,
    errorCode: state.salaryStaff.errorCode,
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions,
    ...salaryActions,
};

export default connect(mapStateToProps, mapDispatchToProps)(ListStaffSalaryView);
