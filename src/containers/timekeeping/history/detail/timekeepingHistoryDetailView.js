import {ActionEvent, getActionSuccess} from 'actions/actionEvent';
import * as commonActions from 'actions/commonActions';
import * as timekeepingActions from 'actions/timekeepingActions';
import * as actions from 'actions/userActions';
import FlatListCustom from 'components/flatListCustom';
import Hr from 'components/hr';
import {ErrorCode} from 'config/errorCode';
import BaseView from 'containers/base/baseView';
import ItemTimekeeping from 'containers/home/timekeeping/itemTimekeeping';
import screenType from 'enum/screenType';
import {localizes} from 'locales/i18n';
import moment from 'moment';
import {Container, Content} from 'native-base';
import {BackHandler, RefreshControl, Text, View} from 'react-native';
import {connect} from 'react-redux';
import commonStyles from 'styles/commonStyles';
import DateUtil from 'utils/dateUtil';
import Utils from 'utils/utils';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';
import styles from './styles';

class TimekeepingHistoryDetailView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            enableRefresh: true,
            refreshing: true,
        };
        const {createdAt, userId} = this.props.navigation.state.params;
        this.createdAt = DateUtil.convertFromFormatToFormat(
            createdAt,
            DateUtil.FORMAT_DATE_TIME_ZONE,
            DateUtil.FORMAT_DATE_SQL,
        );
        this.userId = userId;
        this.dataTimekeeping = [];
        this.planWorkingHours = 0;
        this.realWorkingHours = 0;
        this.deficientWorkingHours = 0;
        this.lateWorkingHours = 0;
        this.filter = {
            userId: this.userId,
            createdAt: this.createdAt,
        };
        this.handleRefresh = this.handleRefresh.bind(this);
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        this.handleRequest();
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
                if (this.props.action == getActionSuccess(ActionEvent.GET_TIMEKEEPING_HISTORY_DETAIL)) {
                    if (!Utils.isNull(data)) {
                        if (!Utils.isNull(data.timekeepingRecords)) {
                            this.dataTimekeeping = data.timekeepingRecords;
                        }
                        if (!Utils.isNull(data.timekeepingHistory)) {
                            this.planWorkingHours = data.timekeepingHistory.planWorkingHours;
                            this.realWorkingHours = data.timekeepingHistory.realWorkingHours;
                            this.deficientWorkingHours = data.timekeepingHistory.deficientWorkingHours;
                            this.lateWorkingHours = data.timekeepingHistory.lateWorkingHours;
                        }
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    render() {
        return (
            <Container style={styles.container}>
                <View style={{flex: 1}}>
                    <HStack style={[commonStyles.header]}>
                        {this.renderHeaderView({
                            title: localizes('timekeeping.titleHistory'),
                            titleStyle: {color: Colors.COLOR_WHITE},
                            renderRightMenu: this.renderRightHeader,
                        })}
                    </HStack>
                    <Content
                        showsVerticalScrollIndicator={false}
                        enableRefresh={this.state.enableRefresh}
                        refreshControl={
                            <RefreshControl
                                progressViewOffset={Constants.HEIGHT_HEADER_OFFSET_REFRESH}
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }
                        contentContainerStyle={{flexGrow: 1}}
                        style={{flex: 1}}>
                        {this.renderProcessCheck()}
                    </Content>
                    {this.state.refreshing ? null : this.showLoadingBar(this.props.isLoading)}
                </View>
            </Container>
        );
    }

    /**
     * Render process check
     */
    renderProcessCheck() {
        return (
            <View style={[styles.boxProcess, {justifyContent: 'flex-start'}]}>
                <View style={{flexDirection: 'row'}}>
                    <View style={{height: '100%'}}>
                        <Text style={styles.textDay}>
                            {DateUtil.convertFromFormatToFormat(
                                this.createdAt,
                                DateUtil.FORMAT_DATE_SQL,
                                DateUtil.FORMAT_DAY,
                            )}
                        </Text>
                    </View>
                    <View style={{marginHorizontal: Constants.MARGIN_X_LARGE, height: '100%'}}>
                        <Text style={[commonStyles.text, {margin: 0}]}>{DateUtil.getDateOfWeek(this.createdAt)}</Text>
                        <Text style={[commonStyles.text, {opacity: Constants.OPACITY_50, margin: 0}]}>
                            Tháng {moment(this.createdAt).format('MM YYYY')}
                        </Text>
                    </View>
                </View>
                <Hr width={2} style={{marginVertical: Constants.MARGIN}} color={Colors.COLOR_BACKGROUND} />
                {/* <View style={[commonStyles.viewHorizontal, { flex: 0 }]}>
                    <Text style={[commonStyles.text, { flex: 1, marginHorizontal: 0 }]}>{localizes("timekeepingHistoryDetail.planWorkingHours")}</Text>
                    <Text style={[commonStyles.text, { marginHorizontal: 0 }]}>
                        {DateUtil.parseMillisecondToHour(Math.round(this.planWorkingHours / 1000 / 60) * 1000 * 60)}
                    </Text>
                </View> */}
                <View style={[commonStyles.viewHorizontal, {flex: 0}]}>
                    <Text style={[commonStyles.text, {flex: 1, marginHorizontal: 0}]}>
                        {localizes('timekeepingHistoryDetail.workingHours')}
                    </Text>
                    <Text style={[commonStyles.text, {marginHorizontal: 0}]}>
                        {DateUtil.parseMillisecondToHour(Math.round(this.realWorkingHours / 1000 / 60) * 1000 * 60)}
                    </Text>
                </View>
                <View style={[commonStyles.viewHorizontal, {flex: 0}]}>
                    <Text style={[commonStyles.text, {flex: 1, marginHorizontal: 0}]}>
                        {localizes('timekeepingHistoryDetail.lackTime')}
                    </Text>
                    <Text style={[commonStyles.text, {marginHorizontal: 0}]}>
                        {DateUtil.parseMillisecondToHour(
                            Math.round(this.deficientWorkingHours / 1000 / 60) * 1000 * 60,
                        )}
                    </Text>
                </View>
                <View style={[commonStyles.viewHorizontal, {flex: 0}]}>
                    <Text style={[commonStyles.text, {flex: 1, marginHorizontal: 0}]}>
                        {localizes('timekeepingHistoryDetail.lateWorkingHours')}
                    </Text>
                    <Text style={[commonStyles.text, {marginHorizontal: 0}]}>
                        {DateUtil.parseMillisecondToHour(Math.round(this.lateWorkingHours / 1000 / 60) * 1000 * 60)}
                    </Text>
                </View>
                <View style={[commonStyles.viewHorizontal, {flex: 0}]}>
                    <Text style={[commonStyles.text, {flex: 1, marginHorizontal: 0}]}>
                        {localizes('timekeepingHistoryDetail.detailCheck')}
                    </Text>
                </View>
                <FlatListCustom
                    horizontal={false}
                    data={this.dataTimekeeping}
                    itemPerCol={1}
                    renderItem={this.renderItem.bind(this)}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        );
    }

    /**
     * @param {*} item
     * @param {*} index
     * @param {*} indexInData
     * @param {*} parentIndex
     */
    renderItem(item, indexInData, parentIndex, index) {
        return (
            <ItemTimekeeping
                data={this.dataTimekeeping}
                item={item}
                index={index}
                screen={screenType.FROM_TIMEKEEPING_HISTORY_DETAIL}
            />
        );
    }

    /**
     * Handle request
     */
    handleRequest() {
        this.props.getTimekeepingHistoryDetail(this.filter);
    }

    //onRefreshing
    handleRefresh() {
        this.state.refreshing = true;
        this.handleRequest();
    }
}

const mapStateToProps = state => ({
    data: state.timekeepingHistoryDetail.data,
    isLoading: state.timekeepingHistoryDetail.isLoading,
    error: state.timekeepingHistoryDetail.error,
    errorCode: state.timekeepingHistoryDetail.errorCode,
    action: state.timekeepingHistoryDetail.action,
});

const mapDispatchToProps = {
    ...actions,
    ...timekeepingActions,
    ...commonActions,
};

export default connect(mapStateToProps, mapDispatchToProps)(TimekeepingHistoryDetailView);
