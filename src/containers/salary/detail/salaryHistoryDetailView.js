import {ActionEvent, getActionSuccess} from 'actions/actionEvent';
import * as commonActions from 'actions/commonActions';
import * as salaryActions from 'actions/salaryAction';
import * as actions from 'actions/userActions';
import FlatListCustom from 'components/flatListCustom';
import {ErrorCode} from 'config/errorCode';
import BaseView from 'containers/base/baseView';
import salaryDetailType from 'enum/salaryDetailType';
import {localizes} from 'locales/i18n';
import {Container} from 'native-base';
import {BackHandler, RefreshControl, Text, View} from 'react-native';
import {connect} from 'react-redux';
import commonStyles from 'styles/commonStyles';
import StringUtil from 'utils/stringUtil';
import Utils from 'utils/utils';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';
import ItemSalary from './itemSalary';
import styles from './styles';

class SalaryHistoryDetailView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            enableRefresh: true,
            refreshing: false,
            enableLoadMore: false,
            isLoadingMore: false,
        };
        const {salaryId, type, period} = this.props.navigation.state.params;
        this.total = 0;
        this.period = period;
        this.salaryId = salaryId;
        this.type = type;
        this.listSalary = [];
        this.isLoadMore = true;
        this.handleRefresh = this.handleRefresh.bind(this);
        this.filter = {
            salaryId: this.salaryId,
            type: this.type,
            paging: {
                pageSize: 10,
                page: 0,
            },
        };
        this.showNoData = false;
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        if (!Utils.isNull(this.salaryId)) {
            this.state.refreshing = true;
            this.props.getDetailTypeSalary(this.filter);
        } else {
            this.showNoData = true;
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.handleData();
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
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
                if (this.props.action == getActionSuccess(ActionEvent.GET_DETAIL_TYPE_SALARY)) {
                    if (!Utils.isNull(data)) {
                        if (data.paging.page == 0) {
                            this.listSalary = [];
                        }
                        this.state.enableLoadMore = !(data.data.length < Constants.PAGE_SIZE);
                        if (data.data.length > 0) {
                            data.data.forEach(item => {
                                this.listSalary.push({...item});
                            });
                        }
                    }
                    this.showNoData = true;
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    render() {
        return (
            <Container style={styles.container}>
                <View style={{flex: 1}}>
                    <HStack style={[commonStyles.header]}>
                        {this.renderHeaderView({
                            title:
                                this.type == salaryDetailType.BONUS
                                    ? `${localizes('salaryHistoryDetail.titleBonus')} ${this.period}`
                                    : `${localizes('salaryHistoryDetail.titleFine')} ${this.period}`,
                            titleStyle: {color: Colors.COLOR_WHITE},
                            renderRightMenu: this.renderRightHeader,
                        })}
                    </HStack>
                    <FlatListCustom
                        contentContainerStyle={{paddingVertical: Constants.PADDING_LARGE}}
                        keyExtractor={item => item.code}
                        data={this.listSalary}
                        renderItem={this.renderItemSalary}
                        enableRefresh={this.state.enableRefresh}
                        refreshControl={
                            <RefreshControl
                                progressViewOffset={Constants.HEIGHT_HEADER_OFFSET_REFRESH}
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }
                        isShowEmpty={this.showNoData}
                        isShowImageEmpty={true}
                        textForEmpty={
                            this.type == salaryDetailType.BONUS
                                ? localizes('salaryHistoryDetail.emptyBonus')
                                : localizes('salaryHistoryDetail.emptyFine')
                        }
                        styleEmpty={{
                            marginTop: Constants.MARGIN_LARGE,
                        }}
                        enableLoadMore={this.state.enableLoadMore}
                        onLoadMore={() => {
                            this.loadMoreSalary();
                        }}
                        showsVerticalScrollIndicator={false}
                    />
                    <View style={{position: 'bottom'[styles.total]}}>
                        <View
                            style={{
                                flexDirection: 'row',
                                borderWidth: Constants.BORDER_WIDTH,
                                borderColor:
                                    this.type == salaryDetailType.BONUS ? Colors.COLOR_PRIMARY : Colors.COLOR_RED,
                            }}>
                            <View style={{flex: (1)[styles.viewLeft]}}>
                                <Text
                                    style={[
                                        this.type == salaryDetailType.BONUS
                                            ? styles.textLeftBonus
                                            : styles.textLeftFine,
                                    ]}>
                                    {localizes('salaryHistoryDetail.total')}{' '}
                                    {this.type == salaryDetailType.BONUS
                                        ? `${localizes('salaryHistoryDetail.bonus')}`
                                        : `${localizes('salaryHistoryDetail.fine')}`}{' '}
                                    :
                                </Text>
                            </View>
                            <View style={{flex: 1}}>
                                <Text style={styles.textRight}>
                                    {this.total < 0
                                        ? this.total != 0
                                            ? '- ' + StringUtil.formatStringCash(this.total * -1)
                                            : '0 VND'
                                        : StringUtil.formatStringCash(this.total)}
                                </Text>
                            </View>
                        </View>
                    </View>
                    {this.state.isLoadingMore || this.state.refreshing
                        ? null
                        : this.showLoadingBar(this.props.isLoading)}
                </View>
            </Container>
        );
    }

    /**
     * Load more
     */
    loadMoreSalary = () => {
        if (!this.props.isLoading) {
            this.state.isLoadingMore = true;
            this.filter.paging.page += 1;
            this.props.getDetailTypeSalary(this.filter);
        }
    };

    //onRefreshing
    handleRefresh = () => {
        if (!Utils.isNull(this.salaryId)) {
            this.state.refreshing = true;
            this.filter.paging.page = 0;
            this.props.getDetailTypeSalary(this.filter);
        }
    };

    /**
     * Render item row
     */
    renderItemSalary = (item, index, parentIndex, indexInParent) => {
        return (
            <ItemSalary
                item={item}
                index={index}
                parentIndex={parentIndex}
                indexInParent={indexInParent}
                // onPressItem={() => this.onPressedItem(item, index)}
            />
        );
    };
}

const mapStateToProps = state => ({
    data: state.salaryDetail.data,
    isLoading: state.salaryDetail.isLoading,
    error: state.salaryDetail.error,
    errorCode: state.salaryDetail.errorCode,
    action: state.salaryDetail.action,
});

const mapDispatchToProps = {
    ...actions,
    ...salaryActions,
    ...commonActions,
};

export default connect(mapStateToProps, mapDispatchToProps)(SalaryHistoryDetailView);
