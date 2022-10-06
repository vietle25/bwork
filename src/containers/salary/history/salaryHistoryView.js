import {ActionEvent, getActionSuccess} from 'actions/actionEvent';
import * as commonActions from 'actions/commonActions';
import * as salaryActions from 'actions/salaryAction';
import * as actions from 'actions/userActions';
import {ErrorCode} from 'config/errorCode';
import BaseView from 'containers/base/baseView';
import ModalMonth from 'containers/common/modalMonth';
import salaryDetailType from 'enum/salaryDetailType';
import salaryInputType from 'enum/salaryInputType';
import screenType from 'enum/screenType';
import ic_down_grey from 'images/ic_down_grey.png';
import {localizes} from 'locales/i18n';
import {Container, Content, Text} from 'native-base';
import {BackHandler, Dimensions, Image, RefreshControl, TouchableOpacity, View} from 'react-native';
import {connect} from 'react-redux';
import commonStyles from 'styles/commonStyles';
import DateUtil from 'utils/dateUtil';
import StorageUtil from 'utils/storageUtil';
import StringUtil from 'utils/stringUtil';
import Utils from 'utils/utils';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';
import styles from './styles';

const screen = Dimensions.get('window');

class SalaryHistoryView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            enableRefresh: true,
            refreshing: true,
            month: null,
            visibleMonth: false,
            monthCurrentSQL: DateUtil.convertFromFormatToFormat(
                DateUtil.now(),
                DateUtil.FORMAT_DATE_TIME_ZONE_T,
                DateUtil.FORMAT_MONTH_OF_YEAR,
            ),
        };
        const {user, screen} = this.props.navigation.state.params;
        this.screenType = screen;
        this.firstDay = '01';
        this.dataSalary = null;
        this.user =
            !Utils.isNull(user) && !Utils.isNull(this.screenType) && this.screenType == screenType.FROM_STAFF_SALARY
                ? user
                : null;
        this.handleRefresh = this.handleRefresh.bind(this);
        this.filter = {
            userId: !Utils.isNull(this.user) ? this.user.id : null,
            month: DateUtil.convertFromFormatToFormat(
                DateUtil.now(),
                DateUtil.FORMAT_DATE_TIME_ZONE_T,
                DateUtil.FORMAT_DATE_MONTH_OF_YEAR,
            ),
            firstDayOfMonth: null,
        };
        this.numWorkingHours = null;
        this.dayOfToDay = null;
    }

    componentDidMount() {
        this.props.getTimeToday(screenType.FROM_SALARY_HISTORY);
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        this.getProfile();
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
                if (this.props.action == getActionSuccess(ActionEvent.GET_SALARY)) {
                    this.state.refreshing = false;
                    this.dataSalary = data;
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_TIME_TODAY)) {
                    if (
                        !Utils.isNull(data) &&
                        (this.props.screen == screenType.FROM_SALARY_HISTORY ||
                            this.screenType == screenType.FROM_STAFF_SALARY)
                    ) {
                        this.dayOfToDay = data;
                        this.filter.firstDayOfMonth = `${DateUtil.convertFromFormatToFormat(
                            data,
                            DateUtil.FORMAT_DATE_TIME_ZONE,
                            DateUtil.FORMAT_MONTH_OF_YEAR,
                        )}-01`;
                        this.props.getSalary(this.filter);
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    //onRefreshing
    handleRefresh() {
        this.state.refreshing = true;
        this.props.getSalary(this.filter);
    }

    /**
     * Get profile user
     */
    getProfile() {
        StorageUtil.retrieveItem(StorageUtil.USER_PROFILE)
            .then(user => {
                //this callback is executed when your Promise is resolved
                if (!Utils.isNull(user) && Utils.isNull(this.user) && Utils.isNull(this.screenType)) {
                    this.user = user;
                    this.filter.userId = this.user.id;
                }
            })
            .catch(error => {
                //this callback is executed when your Promise is rejected
                this.saveException(error, 'getProfile');
            });
    }

    /**
     * On select month
     */
    onSelectMonth = date => {
        let month = DateUtil.convertFromFormatToFormat(date._i, date._f, DateUtil.FORMAT_MONTH_OF_YEAR);
        this.setState({
            monthCurrentSQL: month,
        });
        this.filter.month = DateUtil.convertFromFormatToFormat(date._i, date._f, DateUtil.FORMAT_DATE_MONTH_OF_YEAR);
        this.filter.firstDayOfMonth = DateUtil.convertFromFormatToFormat(date._i, date._f, DateUtil.FORMAT_DATE_SQL);
        this.props.getSalary(this.filter);
    };

    /**
     * Toggle month
     */
    toggleMonth = () => {
        this.setState({visibleMonth: !this.state.visibleMonth});
    };

    /**
     * Get salary input type
     * @param {*} inputType
     */
    getSalaryInputType(inputType) {
        if (inputType == salaryInputType.DAY) {
            return '/ngày';
        } else if (inputType == salaryInputType.HOUR) {
            return '/giờ';
        } else if (inputType == salaryInputType.MONTH) {
            return '/tháng';
        } else {
            return '';
        }
    }

    render() {
        const {monthCurrentSQL} = this.state;
        console.log('RENDER HOME VIEW');
        const {visibleMonth} = this.state;
        let salary = {
            iD: Utils.isNull(this.dataSalary) ? '' : this.dataSalary.id,
            netAmount: Utils.isNull(this.dataSalary) ? '' : this.dataSalary.netAmount,
            payAmount: Utils.isNull(this.dataSalary) ? '' : this.dataSalary.payAmount,
            period: this.filter.month,
            totalBonusAmount: Utils.isNull(this.dataSalary) ? 0 : this.dataSalary.totalBonusAmount,
            totalFineAmount: Utils.isNull(this.dataSalary) ? 0 : this.dataSalary.totalFineAmount,
            totalTemporaryAmount: Utils.isNull(this.dataSalary) ? 0 : this.dataSalary.totalTemporaryAmount,
            totalWorkdays: Utils.isNull(this.dataSalary) ? 0 : this.dataSalary.totalWorkdays,
            totalPlanWorkingHours: Utils.isNull(this.dataSalary) ? 0 : this.dataSalary.totalPlanWorkingHours,
            totalWorkingHours: Utils.isNull(this.dataSalary) ? 0 : this.dataSalary.totalWorkingHours,
            totalLackTime: Utils.isNull(this.dataSalary) ? 0 : this.dataSalary.totalLackTime,
            salary: Utils.isNull(this.dataSalary) ? 0 : this.dataSalary.salary,
            inputType: Utils.isNull(this.dataSalary) ? '' : this.getSalaryInputType(this.dataSalary.inputType),
            numDayOffInMonth: Utils.isNull(this.dataSalary) ? 0 : this.dataSalary.numDayOffInMonth,
            numDaySabbatical: Utils.isNull(this.dataSalary) ? 0 : this.dataSalary.numDaySabbatical,
            numLateForWork: Utils.isNull(this.dataSalary) ? 0 : this.dataSalary.numLateForWork,
        };

        const today = new Date();
        today.setDate(today.getDate() - 1);
        return (
            // <MyApp />
            <Container style={styles.container}>
                <View style={{flex: 1}}>
                    <HStack style={[commonStyles.header]}>
                        {this.renderHeaderView({
                            title: `${localizes('salaryHistory.title')} ${this.filter.month}`,
                            titleStyle: {color: Colors.COLOR_WHITE},
                            renderRightMenu: this.renderRightHeader,
                        })}
                    </HStack>
                    <Content
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingBottom: Constants.PADDING_LARGE,
                        }}
                        style={{flex: 1}}
                        refreshControl={
                            <RefreshControl
                                progressViewOffset={Constants.HEIGHT_HEADER_OFFSET_REFRESH}
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }>
                        {/* Period */}

                        <View style={styles.month}>
                            <TouchableOpacity
                                activeOpacity={Constants.ACTIVE_OPACITY}
                                onPress={() => this.toggleMonth()}
                                style={[commonStyles.viewHorizontal, {alignItems: 'center'}]}>
                                <View style={{flex: 1}}>
                                    <Text style={styles.textPeriod}>
                                        {`${localizes('salaryHistory.month')} ` +
                                            DateUtil.convertFromFormatToFormat(
                                                monthCurrentSQL,
                                                DateUtil.FORMAT_MONTH_OF_YEAR,
                                                DateUtil.FORMAT_MONTH,
                                            )}
                                        {', ' +
                                            DateUtil.convertFromFormatToFormat(
                                                monthCurrentSQL,
                                                DateUtil.FORMAT_MONTH_OF_YEAR,
                                                DateUtil.FORMAT_YEAR,
                                            )}
                                    </Text>
                                </View>
                                <Image source={ic_down_grey} style={{marginRight: Constants.MARGIN_X_LARGE}} />
                            </TouchableOpacity>
                        </View>

                        {/* Detail Salary */}
                        <View style={styles.detailSalary}>
                            <Text style={styles.textName}>{Utils.isNull(this.user) ? '' : this.user.name}</Text>
                            <View style={styles.hr} />
                            {/* Salary */}
                            <View style={{flexDirection: 'row', marginTop: Constants.MARGIN_12}}>
                                <View style={[styles.viewLeft, {flex: 1}]}>
                                    <Text style={styles.textLeft}>{localizes('salaryHistory.amount')}</Text>
                                </View>
                                <View style={{flex: 0}}>
                                    <Text style={styles.textRightGreen}>
                                        {salary.salary > 0
                                            ? StringUtil.formatStringCash(salary.salary) + salary.inputType
                                            : '-'}
                                    </Text>
                                </View>
                            </View>
                            {/* numDayOffInMonth */}
                            <View style={{flexDirection: 'row'}}>
                                <View style={[styles.viewLeft, {flex: 1}]}>
                                    <Text style={styles.textLeft}>{localizes('salaryHistory.numDayOffInMonth')}</Text>
                                </View>
                                <View style={{flex: 0}}>
                                    <Text style={styles.textRight}>
                                        {!Utils.isNull(salary.numDayOffInMonth) ? salary.numDayOffInMonth : 0}
                                    </Text>
                                </View>
                            </View>
                            {/* numDayOffSabbatical */}
                            <View style={{flexDirection: 'row'}}>
                                <View style={[styles.viewLeft, {flex: 1}]}>
                                    <Text style={styles.textLeft}>
                                        {localizes('salaryHistory.numDayOffSabbatical')}
                                    </Text>
                                </View>
                                <View style={{flex: 0}}>
                                    <Text style={styles.textRight}>
                                        {!Utils.isNull(salary.numDaySabbatical) ? salary.numDaySabbatical : 0}
                                    </Text>
                                </View>
                            </View>
                            {/* numLateForWork */}
                            <View style={{flexDirection: 'row'}}>
                                <View style={[styles.viewLeft, {flex: 1}]}>
                                    <Text style={styles.textLeft}>{localizes('salaryHistory.numLateForWork')}</Text>
                                </View>
                                <View style={{flex: 0}}>
                                    <Text style={styles.textRight}>
                                        {!Utils.isNull(salary.numLateForWork) ? salary.numLateForWork : 0}
                                    </Text>
                                </View>
                            </View>
                            {/* workingDays */}
                            <View style={{flexDirection: 'row'}}>
                                <View style={[styles.viewLeft, {flex: 1}]}>
                                    <Text style={styles.textLeft}>{localizes('salaryHistory.workingDays')}</Text>
                                </View>
                                <View style={{flex: 0}}>
                                    <Text style={styles.textRight}>
                                        {!Utils.isNull(salary.totalWorkdays) ? salary.totalWorkdays : 0}
                                    </Text>
                                </View>
                            </View>
                            {/* planWorkingHours */}
                            <View style={{flexDirection: 'row'}}>
                                <View style={[styles.viewLeft, {flex: 1}]}>
                                    <Text style={styles.textLeft}>{localizes('salaryHistory.planWorkingHours')}</Text>
                                </View>
                                <View style={{flex: 0}}>
                                    <Text style={styles.textRight}>
                                        {DateUtil.parseMillisecondToHour(
                                            Math.round(salary.totalPlanWorkingHours * 60) * 1000 * 60,
                                        )}
                                    </Text>
                                </View>
                            </View>
                            {/* workingHours */}
                            <View style={{flexDirection: 'row'}}>
                                <View style={[styles.viewLeft, {flex: 1}]}>
                                    <Text style={styles.textLeft}>{localizes('salaryHistory.workingHours')}</Text>
                                </View>
                                <View style={{flex: 0}}>
                                    <Text style={styles.textRight}>
                                        {DateUtil.parseMillisecondToHour(
                                            Math.round(salary.totalWorkingHours * 60) * 1000 * 60,
                                        )}
                                    </Text>
                                </View>
                            </View>
                            {/* lackTime */}
                            <View style={{flexDirection: 'row'}}>
                                <View style={[styles.viewLeft, {flex: 1}]}>
                                    <Text style={styles.textLeft}>{localizes('salaryHistory.lackTime')}</Text>
                                </View>
                                <View style={{flex: 0}}>
                                    <Text style={styles.textRight}>
                                        {DateUtil.parseMillisecondToHour(
                                            Math.round(salary.totalLackTime * 60) * 1000 * 60,
                                        )}
                                    </Text>
                                </View>
                            </View>
                            {/* temporaryAmount */}
                            <View style={{flexDirection: 'row'}}>
                                <View style={[styles.viewLeft, {flex: 1}]}>
                                    <Text style={styles.textLeft}>
                                        {localizes('salaryHistory.temporaryAmount')}
                                        {DateUtil.convertFromFormatToFormat(
                                            this.dayOfToDay,
                                            DateUtil.FORMAT_DATE_TIME_ZONE,
                                            DateUtil.FORMAT_DAY,
                                        ) == this.firstDay ||
                                        this.filter.month !=
                                            DateUtil.convertFromFormatToFormat(
                                                DateUtil.now(),
                                                DateUtil.FORMAT_DATE_TIME_ZONE,
                                                DateUtil.FORMAT_DATE_MONTH_OF_YEAR,
                                            )
                                            ? null
                                            : `${localizes('salaryHistory.to')} ${DateUtil.convertFromFormatToFormat(
                                                  today,
                                                  DateUtil.FORMAT_DATE_TIME_ZONE,
                                                  DateUtil.FORMAT_DATE,
                                              )}`}
                                    </Text>
                                </View>
                                <View style={{flex: 0}}>
                                    <Text style={styles.textRightGreen}>
                                        {salary.totalTemporaryAmount >= 0
                                            ? StringUtil.formatStringCash(Math.ceil(salary.totalTemporaryAmount))
                                            : '- ' +
                                              StringUtil.formatStringCash(
                                                  Math.ceil(Math.abs(salary.totalTemporaryAmount)),
                                              )}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Total Salary */}
                        <View style={styles.totalSalary}>
                            {/* Total Bonus */}
                            <View style={{flexDirection: 'row', marginTop: Constants.MARGIN_12}}>
                                <View style={{flex: 1}[styles.viewLeft]}>
                                    <TouchableOpacity
                                        activeOpacity={Constants.ACTIVE_OPACITY}
                                        onPress={() =>
                                            this.props.navigation.navigate('SalaryHistoryDetail', {
                                                period: salary.period,
                                                salaryId: salary.iD,
                                                type: salaryDetailType.BONUS,
                                            })
                                        }>
                                        <Text style={styles.textLeftGreen}>{localizes('salaryHistory.bonus')}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{flex: 1}}>
                                    <TouchableOpacity
                                        activeOpacity={Constants.ACTIVE_OPACITY}
                                        onPress={() =>
                                            this.props.navigation.navigate('SalaryHistoryDetail', {
                                                period: salary.period,
                                                salaryId: salary.iD,
                                                type: salaryDetailType.BONUS,
                                            })
                                        }>
                                        <Text style={styles.textRightGreen}>
                                            {StringUtil.formatStringCash(Math.ceil(salary.totalBonusAmount))}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {/* Total Fine */}

                            <View style={{flexDirection: 'row'}}>
                                <View style={{flex: 1}[styles.viewLeft]}>
                                    <TouchableOpacity
                                        activeOpacity={Constants.ACTIVE_OPACITY}
                                        onPress={() =>
                                            this.props.navigation.navigate('SalaryHistoryDetail', {
                                                period: salary.period,
                                                salaryId: salary.iD,
                                                type: salaryDetailType.FINE,
                                            })
                                        }>
                                        <Text style={styles.textLeftGreen}>{localizes('salaryHistory.fine')}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{flex: 1}}>
                                    <TouchableOpacity
                                        activeOpacity={Constants.ACTIVE_OPACITY}
                                        onPress={() =>
                                            this.props.navigation.navigate('SalaryHistoryDetail', {
                                                period: salary.period,
                                                salaryId: salary.iD,
                                                type: salaryDetailType.FINE,
                                            })
                                        }>
                                        <Text style={styles.textRightGreen}>
                                            {salary.totalFineAmount != 0
                                                ? '- ' +
                                                  StringUtil.formatStringCash(Math.ceil(salary.totalFineAmount * -1))
                                                : '0 VND'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View>
                                {/* NetAmount */}
                                <View style={{flexDirection: 'row'}}>
                                    <View style={{flex: 1}[styles.viewLeft]}>
                                        <Text style={styles.textLeft}>{localizes('salaryHistory.netAmount')}</Text>
                                    </View>
                                    <View style={{flex: 1}}>
                                        <Text style={styles.textRightGreen}>
                                            {!Utils.isNull(salary.netAmount) &&
                                            this.filter.month !=
                                                DateUtil.convertFromFormatToFormat(
                                                    DateUtil.now(),
                                                    DateUtil.FORMAT_DATE_TIME_ZONE,
                                                    DateUtil.FORMAT_DATE_MONTH_OF_YEAR,
                                                )
                                                ? StringUtil.formatStringCash(Math.ceil(salary.netAmount))
                                                : ' - '}
                                        </Text>
                                    </View>
                                </View>
                                {/* PayAmount */}
                                <View style={{flexDirection: 'row'}}>
                                    <View style={{flex: 1}[styles.viewLeft]}>
                                        <Text style={styles.textLeft}>{localizes('salaryHistory.payAmount')}</Text>
                                    </View>
                                    <View style={{flex: 1}}>
                                        <Text style={styles.textRightGreen}>
                                            {!Utils.isNull(salary.payAmount) &&
                                            this.filter.month !=
                                                DateUtil.convertFromFormatToFormat(
                                                    DateUtil.now(),
                                                    DateUtil.FORMAT_DATE_TIME_ZONE,
                                                    DateUtil.FORMAT_DATE_MONTH_OF_YEAR,
                                                )
                                                ? StringUtil.formatStringCash(Math.ceil(salary.payAmount))
                                                : ' - '}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Content>
                    <ModalMonth
                        isVisible={visibleMonth}
                        onBack={this.toggleMonth}
                        onSelectMonth={this.onSelectMonth}
                        showMonth={true}
                    />
                    {this.state.refreshing ? null : this.showLoadingBar(this.props.isLoading)}
                </View>
            </Container>
        );
    }
}

const mapStateToProps = state => ({
    data: state.salaryHistory.data,
    isLoading: state.salaryHistory.isLoading,
    error: state.salaryHistory.error,
    errorCode: state.salaryHistory.errorCode,
    action: state.salaryHistory.action,
    screen: state.salaryHistory.screen,
});

const mapDispatchToProps = {
    ...actions,
    ...salaryActions,
    ...commonActions,
};

export default connect(mapStateToProps, mapDispatchToProps)(SalaryHistoryView);
