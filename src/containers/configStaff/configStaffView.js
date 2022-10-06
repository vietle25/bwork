import {ActionEvent, getActionSuccess} from 'actions/actionEvent';
import * as commonActions from 'actions/commonActions';
import * as salaryAction from 'actions/salaryAction';
import * as timekeepingActions from 'actions/timekeepingActions';
import * as actions from 'actions/userActions';
import {CalendarScreen} from 'components/calendarScreen';
import Hr from 'components/hr';
import TextInputCustom from 'components/textInputCustom';
import {ErrorCode} from 'config/errorCode';
import BaseView from 'containers/base/baseView';
import salaryInputType from 'enum/salaryInputType';
import workingTimeShiftType from 'enum/workingTimeShiftType';
import ic_check from 'images/ic_check.png';
import {Container, Content} from 'native-base';
import {BackHandler, Dimensions, Image, RefreshControl, Text, TouchableOpacity, View} from 'react-native';
import {TextInputMask} from 'react-native-masked-text';
import {connect} from 'react-redux';
import commonStyles from 'styles/commonStyles';
import DateUtil from 'utils/dateUtil';
import StringUtil from 'utils/stringUtil';
import Utils from 'utils/utils';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';
import ModalConfigStaff from './modalConfigStaff';
import styles from './styles';

const screen = Dimensions.get('window');

class ConfigStaffView extends BaseView {
    constructor(props) {
        super(props);
        const {navigation, route} = this.props;
        this.state = {
            enableRefresh: true,
            refreshing: true,
            salaryInput: salaryInputType.MONTH,
            salaryNumber: '',
            numWorkingHour: '',
            numDayOffInMonth: '',
            workingTimeShift: workingTimeShiftType.FULL_WORKING_DAY,
            startWorkingTime1: '',
            startWorkingTime2: '',
            endWorkingTime1: '',
            endWorkingTime2: '',
        };
        this.staffId = route.params.staffId;
        this.callback = route.params.callback;
        this.isApproval = route.params.isApproval;
        this.filter = {};
        this.shiftType = {
            START_1: 1,
            END_1: 2,
            START_2: 3,
            END_2: 4,
        };
        this.shiftTypeSelected = null;
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
     * Get date from hour
     */
    getDateFromHour = hour => {
        let nowSqlString = DateUtil.convertFromFormatToFormat(
            DateUtil.now(),
            DateUtil.FORMAT_DATE_TIME_ZONE_T,
            DateUtil.FORMAT_DATE_SQL,
        );
        return DateUtil.convertFromFormatToFormat(
            nowSqlString + ' ' + hour,
            DateUtil.FORMAT_DATE_TIME_SQL,
            DateUtil.FORMAT_DATE_TIME_ZONE_T,
        );
    };

    /**
     * Handle data when request
     */
    handleData() {
        let data = this.props.data;
        if (this.props.errorCode != ErrorCode.ERROR_INIT) {
            if (this.props.errorCode == ErrorCode.ERROR_SUCCESS) {
                if (this.props.action == getActionSuccess(ActionEvent.GET_WORKING_TIME_CONFIG_BY_USER_ID)) {
                    this.state.refreshing = false;
                    if (!Utils.isNull(data)) {
                        this.state.workingTimeShift = data.shiftType;
                        this.state.numWorkingHour = data.numWorkingHours + '';
                        this.state.numDayOffInMonth = data.numDayOffInMonth + '';
                        this.state.startWorkingTime1 = new Date(this.getDateFromHour(data.startWorkingTime1));
                        this.state.endWorkingTime1 = new Date(this.getDateFromHour(data.endWorkingTime1));
                        this.state.startWorkingTime2 = !Utils.isNull(data.startWorkingTime2)
                            ? new Date(this.getDateFromHour(data.startWorkingTime2))
                            : '';
                        this.state.endWorkingTime2 = !Utils.isNull(data.endWorkingTime2)
                            ? new Date(this.getDateFromHour(data.endWorkingTime2))
                            : '';
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_SALARY_CONFIG)) {
                    if (!Utils.isNull(data)) {
                        this.state.salaryNumber = data.salary + '';
                        this.state.salaryInput = data.inputType;
                    }
                    this.props.getWorkingTimeConfigByUserId(this.staffId);
                } else if (this.props.action == getActionSuccess(ActionEvent.CONFIG_STAFF)) {
                    if (data) {
                        this.showMessage('Cấu hình thành công.');
                        this.callback();
                        this.onBack();
                    }
                }
            } else if (this.props.errorCode == ErrorCode.HAS_SABBATICAL_REGISTERED) {
                this.showMessage('Bạn đã có đơn xin nghỉ vào thời gian này.');
            } else {
                this.handleError(this.props.errorCode, this.props.error);
                this.state.refreshing = false;
            }
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handlerBackButton);
    }

    /**
     * On register
     */
    onRegister = () => {
        const {
            salaryInput,
            salaryNumber,
            numWorkingHour,
            numDayOffInMonth,
            startWorkingTime1,
            startWorkingTime2,
            endWorkingTime1,
            endWorkingTime2,
            workingTimeShift,
        } = this.state;
        let numHourSet =
            (DateUtil.getTimestamp(endWorkingTime1) -
                DateUtil.getTimestamp(startWorkingTime1) +
                (DateUtil.getTimestamp(endWorkingTime2) - DateUtil.getTimestamp(startWorkingTime2))) /
            1000 /
            60 /
            60;
        if (StringUtil.isNullOrEmpty(salaryNumber.trim())) {
            this.showMessage('Vui lòng nhập mức lương!');
        } else if (StringUtil.isNullOrEmpty(numWorkingHour.trim())) {
            this.showMessage('Vui lòng nhập số giờ làm!');
        } else if (StringUtil.isNullOrEmpty(numDayOffInMonth.trim())) {
            this.showMessage('Vui lòng nhập số ngày nghỉ trong tháng!');
        } else if (StringUtil.isNullOrEmpty(startWorkingTime1)) {
            this.showMessage('Vui lòng nhập giờ bắt đầu!');
        } else if (StringUtil.isNullOrEmpty(endWorkingTime1)) {
            this.showMessage('Vui lòng nhập giờ nghỉ giữa trưa!');
        } else if (
            workingTimeShift == workingTimeShiftType.FULL_WORKING_DAY &&
            StringUtil.isNullOrEmpty(startWorkingTime2)
        ) {
            this.showMessage('Vui lòng nhập giờ bắt đầu lại!');
        } else if (
            workingTimeShift == workingTimeShiftType.FULL_WORKING_DAY &&
            StringUtil.isNullOrEmpty(endWorkingTime2)
        ) {
            this.showMessage('Vui lòng nhập giờ kết thúc!');
        } else if (
            Number(numWorkingHour) !== Number(numHourSet) ||
            numWorkingHour <= 0 ||
            DateUtil.convertFromFormatToFormat(
                startWorkingTime1,
                DateUtil.FORMAT_DATE_TIME_ZONE_T,
                DateUtil.FORMAT_TIME_SECOND,
            ) ===
                DateUtil.convertFromFormatToFormat(
                    endWorkingTime1,
                    DateUtil.FORMAT_DATE_TIME_ZONE_T,
                    DateUtil.FORMAT_TIME_SECOND,
                ) ||
            DateUtil.getTimestamp(startWorkingTime1) > DateUtil.getTimestamp(endWorkingTime1) ||
            (workingTimeShift == workingTimeShiftType.FULL_WORKING_DAY &&
                (DateUtil.convertFromFormatToFormat(
                    startWorkingTime2,
                    DateUtil.FORMAT_DATE_TIME_ZONE_T,
                    DateUtil.FORMAT_TIME_SECOND,
                ) ===
                    DateUtil.convertFromFormatToFormat(
                        endWorkingTime2,
                        DateUtil.FORMAT_DATE_TIME_ZONE_T,
                        DateUtil.FORMAT_TIME_SECOND,
                    ) ||
                    DateUtil.getTimestamp(startWorkingTime2) < DateUtil.getTimestamp(endWorkingTime1) ||
                    DateUtil.getTimestamp(startWorkingTime2) > DateUtil.getTimestamp(endWorkingTime2)))
        ) {
            this.showMessage('Bạn đã nhập sai số giờ làm hoặc thời gian làm.');
        } else {
            this.filter = {
                salaryInputType: salaryInput,
                salaryNumber: salaryNumber.trim().split('.').join(''),
                workingTimeShiftType: workingTimeShift,
                numWorkingHour: numWorkingHour.trim(),
                numDayOffInMonth: numDayOffInMonth.trim(),
                startWorkingTime1: DateUtil.convertFromFormatToFormat(
                    startWorkingTime1,
                    DateUtil.FORMAT_DATE_TIME_ZONE_T,
                    DateUtil.FORMAT_TIME_SECOND,
                ),
                startWorkingTime2: !StringUtil.isNullOrEmpty(startWorkingTime2)
                    ? DateUtil.convertFromFormatToFormat(
                          startWorkingTime2,
                          DateUtil.FORMAT_DATE_TIME_ZONE_T,
                          DateUtil.FORMAT_TIME_SECOND,
                      )
                    : null,
                endWorkingTime1: DateUtil.convertFromFormatToFormat(
                    endWorkingTime1,
                    DateUtil.FORMAT_DATE_TIME_ZONE_T,
                    DateUtil.FORMAT_TIME_SECOND,
                ),
                endWorkingTime2: !StringUtil.isNullOrEmpty(endWorkingTime2)
                    ? DateUtil.convertFromFormatToFormat(
                          endWorkingTime2,
                          DateUtil.FORMAT_DATE_TIME_ZONE_T,
                          DateUtil.FORMAT_TIME_SECOND,
                      )
                    : null,
                validFrom: null,
            };
            if (this.isApproval) {
                let now = DateUtil.now();
                let validFrom = DateUtil.convertFromFormatToFormat(
                    new Date(now.getFullYear(), now.getMonth(), 1),
                    DateUtil.FORMAT_DATE_TIME_ZONE_T,
                    DateUtil.FORMAT_DATE_SQL,
                );
                this.filter.validFrom = validFrom;
                this.props.configStaff({filter: this.filter, staffId: this.staffId});
            } else {
                this.openModal();
            }
        }
    };

    /**
     * Handle request
     */
    handleRequest = () => {
        this.props.getSalaryConfig({
            userId: this.staffId,
            firstDayOfMonth: `${DateUtil.convertFromFormatToFormat(
                DateUtil.now(),
                DateUtil.FORMAT_DATE_TIME_ZONE_T,
                DateUtil.FORMAT_MONTH_OF_YEAR,
            )}-01`,
        });
    };

    /**
     * Handle refresh
     */
    handleRefresh = () => {
        this.state.refreshing = true;
        this.handleRequest();
    };

    render() {
        const {
            salaryInput,
            salaryNumber,
            numWorkingHour,
            numDayOffInMonth,
            startWorkingTime1,
            startWorkingTime2,
            endWorkingTime1,
            endWorkingTime2,
            workingTimeShift,
        } = this.state;
        let numHourSet =
            (DateUtil.getTimestamp(endWorkingTime1) -
                DateUtil.getTimestamp(startWorkingTime1) +
                (DateUtil.getTimestamp(endWorkingTime2) - DateUtil.getTimestamp(startWorkingTime2))) /
            1000 /
            60 /
            60;
        return (
            <Container style={styles.container}>
                <View style={{flex: 1}}>
                    <HStack hasTabs style={commonStyles.header}>
                        {this.renderHeaderView({
                            title: 'CẤU HÌNH NHÂN VIÊN',
                            titleStyle: {color: Colors.COLOR_WHITE},
                            renderRightMenu: this.renderRightMenu,
                        })}
                    </HStack>
                    <Content
                        contentContainerStyle={{flexGrow: 1}}
                        style={{flex: 1}}
                        enableRefresh={this.state.enableRefresh}
                        refreshControl={
                            <RefreshControl
                                progressViewOffset={Constants.HEIGHT_HEADER_OFFSET_REFRESH}
                                refreshing={this.state.refreshing}
                                onRefresh={this.handleRefresh}
                            />
                        }
                        showsVerticalScrollIndicator={false}>
                        <View style={{marginVertical: Constants.MARGIN_LARGE}}>
                            {/* Salary config */}
                            <Text
                                style={[
                                    commonStyles.textBold,
                                    {
                                        marginHorizontal: Constants.MARGIN_X_LARGE,
                                        color: Colors.COLOR_PRIMARY,
                                    },
                                ]}>
                                Cấu hình lương
                            </Text>
                            {/* <RadioGroup
                                style={styles.radioGroup}
                                initialValue={salaryInput}
                                onValueChange={(salaryInput) => {
                                    this.setState({ salaryInput })
                                }}> */}
                            {/* <RadioButton
                                    color={Colors.COLOR_PRIMARY}
                                    label={"Lương tháng"}
                                    value={salaryInputType.MONTH}
                                    size={16}
                                    labelStyle={{ marginRight: Constants.MARGIN_X_LARGE }}
                                />
                                <RadioButton
                                    color={Colors.COLOR_PRIMARY}
                                    label={"Lương theo giờ"}
                                    value={salaryInputType.HOUR}
                                    size={16}
                                    labelStyle={{ marginRight: Constants.MARGIN_X_LARGE }}
                                /> */}
                            {/* </RadioGroup> */}
                            {/* Salary */}
                            <View style={{marginHorizontal: Constants.MARGIN_X_LARGE}}>
                                <Text
                                    style={[
                                        commonStyles.text,
                                        {
                                            margin: 0,
                                        },
                                    ]}>
                                    Mức lương
                                </Text>
                                <TextInputMask
                                    style={[
                                        commonStyles.text,
                                        commonStyles.inputText,
                                        {
                                            paddingHorizontal: 0,
                                            flex: 1,
                                            elevation: 0,
                                        },
                                    ]}
                                    ref={input => (this.salaryNumber = input)}
                                    placeholder={'Nhập mức lương'}
                                    type={'money'}
                                    options={{
                                        precision: 0,
                                        separator: '.',
                                        delimiter: '',
                                        unit: '',
                                        suffixUnit: '',
                                    }}
                                    value={salaryNumber}
                                    onChangeText={salaryNumber => {
                                        this.setState({salaryNumber});
                                    }}
                                    keyboardType="numeric"
                                    returnKeyType={'next'}
                                    blurOnSubmit={false} //focus
                                />
                                <Hr />
                            </View>
                        </View>
                        {/* Working time config */}
                        <View style={{marginVertical: Constants.MARGIN_LARGE}}>
                            <Text
                                style={[
                                    commonStyles.textBold,
                                    {
                                        marginHorizontal: Constants.MARGIN_X_LARGE,
                                        color: Colors.COLOR_PRIMARY,
                                    },
                                ]}>
                                Cấu hình ca làm việc
                            </Text>
                            {/* <RadioGroup
                                style={styles.radioGroup}
                                initialValue={workingTimeShift}
                                onValueChange={(workingTimeShift) => {
                                    let state = this.state;
                                    if (workingTimeShift == workingTimeShiftType.PARTLY_WORKING_DAY) {
                                        state.endWorkingTime2 = '';
                                        state.startWorkingTime2 = '';
                                    }
                                    state.workingTimeShift = workingTimeShift;
                                    this.setState(state);
                                }}> */}
                            {/* <RadioButton
                                    color={Colors.COLOR_PRIMARY}
                                    label={"Ca gãy"}
                                    value={workingTimeShiftType.FULL_WORKING_DAY}
                                    size={16}
                                    labelStyle={{ marginRight: Constants.MARGIN_X_LARGE }}
                                />
                                <RadioButton
                                    color={Colors.COLOR_PRIMARY}
                                    label={"Ca nguyên"}
                                    value={workingTimeShiftType.PARTLY_WORKING_DAY}
                                    size={16}
                                    labelStyle={{ marginRight: Constants.MARGIN_X_LARGE }}
                                /> */}
                            {/* </RadioGroup> */}
                            <View style={styles.boxInput}>
                                <View style={{flex: 1, marginHorizontal: Constants.MARGIN_LARGE}}>
                                    <Text
                                        style={[
                                            commonStyles.text,
                                            {
                                                margin: 0,
                                            },
                                        ]}>
                                        Số giờ làm
                                    </Text>
                                    <TextInputCustom
                                        inputNormalStyle={{
                                            paddingHorizontal: 0,
                                        }}
                                        refInput={input => {
                                            this.numWorkingHour = input;
                                        }}
                                        isInputNormal={true}
                                        placeholder={'Nhập số giờ làm'}
                                        value={numWorkingHour}
                                        onChangeText={numWorkingHour => this.setState({numWorkingHour})}
                                        onSubmitEditing={() => {}}
                                        returnKeyType={'done'}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={{flex: 1, marginHorizontal: Constants.MARGIN_LARGE}}>
                                    <Text
                                        style={[
                                            commonStyles.text,
                                            {
                                                margin: 0,
                                            },
                                        ]}>
                                        Số ngày nghỉ trong tháng
                                    </Text>
                                    <TextInputCustom
                                        inputNormalStyle={{
                                            paddingHorizontal: 0,
                                        }}
                                        refInput={input => {
                                            this.numDayOffInMonth = input;
                                        }}
                                        isInputNormal={true}
                                        placeholder={'Nhập số ngày nghỉ'}
                                        value={numDayOffInMonth}
                                        onChangeText={numDayOffInMonth => this.setState({numDayOffInMonth})}
                                        onSubmitEditing={() => {}}
                                        returnKeyType={'done'}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                            <View style={styles.boxInput}>
                                <View style={{flex: 1, marginHorizontal: Constants.MARGIN_LARGE}}>
                                    <Text
                                        style={[
                                            commonStyles.text,
                                            {
                                                margin: 0,
                                            },
                                        ]}>
                                        Giờ bắt đầu
                                    </Text>
                                    <TextInputCustom
                                        inputNormalStyle={{
                                            paddingHorizontal: 0,
                                        }}
                                        ref={input => (this.startWorkingTime1 = input)}
                                        isInputAction={true}
                                        placeholder={'Chọn giờ bắt đầu'}
                                        value={
                                            !StringUtil.isNullOrEmpty(startWorkingTime1.trim)
                                                ? ''
                                                : DateUtil.convertFromFormatToFormat(
                                                      startWorkingTime1,
                                                      DateUtil.FORMAT_DATE_TIME_ZONE_T,
                                                      DateUtil.FORMAT_TIME,
                                                  )
                                        }
                                        onPress={() => this.showCalendarTime(this.shiftType.START_1)}
                                    />
                                </View>
                                <View style={{flex: 1, marginHorizontal: Constants.MARGIN_LARGE}}>
                                    <Text
                                        style={[
                                            commonStyles.text,
                                            {
                                                margin: 0,
                                            },
                                        ]}>
                                        {workingTimeShift == workingTimeShiftType.FULL_WORKING_DAY
                                            ? 'Giờ nghỉ giữa trưa'
                                            : 'Giờ kết thúc'}
                                    </Text>
                                    <TextInputCustom
                                        inputNormalStyle={{
                                            paddingHorizontal: 0,
                                        }}
                                        ref={input => (this.endWorkingTime1 = input)}
                                        isInputAction={true}
                                        placeholder={
                                            workingTimeShift == workingTimeShiftType.FULL_WORKING_DAY
                                                ? 'Chọn giờ nghỉ giữa trưa'
                                                : 'Chọn giờ kết thúc'
                                        }
                                        value={
                                            !StringUtil.isNullOrEmpty(endWorkingTime1.trim)
                                                ? ''
                                                : DateUtil.convertFromFormatToFormat(
                                                      endWorkingTime1,
                                                      DateUtil.FORMAT_DATE_TIME_ZONE_T,
                                                      DateUtil.FORMAT_TIME,
                                                  )
                                        }
                                        onPress={() => this.showCalendarTime(this.shiftType.END_1)}
                                    />
                                </View>
                            </View>
                            {workingTimeShift == workingTimeShiftType.FULL_WORKING_DAY && (
                                <View style={styles.boxInput}>
                                    <View style={{flex: 1, marginHorizontal: Constants.MARGIN_LARGE}}>
                                        <Text
                                            style={[
                                                commonStyles.text,
                                                {
                                                    margin: 0,
                                                },
                                            ]}>
                                            Giờ bắt đầu lại
                                        </Text>
                                        <TextInputCustom
                                            inputNormalStyle={{
                                                paddingHorizontal: 0,
                                            }}
                                            ref={input => (this.startWorkingTime2 = input)}
                                            isInputAction={true}
                                            placeholder={'Nhập giờ bắt đầu lại'}
                                            value={
                                                !StringUtil.isNullOrEmpty(startWorkingTime2.trim)
                                                    ? ''
                                                    : DateUtil.convertFromFormatToFormat(
                                                          startWorkingTime2,
                                                          DateUtil.FORMAT_DATE_TIME_ZONE_T,
                                                          DateUtil.FORMAT_TIME,
                                                      )
                                            }
                                            onPress={() => this.showCalendarTime(this.shiftType.START_2)}
                                        />
                                    </View>
                                    <View style={{flex: 1, marginHorizontal: Constants.MARGIN_LARGE}}>
                                        <Text
                                            style={[
                                                commonStyles.text,
                                                {
                                                    margin: 0,
                                                },
                                            ]}>
                                            Giờ kết thúc
                                        </Text>
                                        <TextInputCustom
                                            inputNormalStyle={{
                                                paddingHorizontal: 0,
                                            }}
                                            ref={input => (this.endWorkingTime2 = input)}
                                            isInputAction={true}
                                            placeholder={'Chọn giờ kết thúc'}
                                            value={
                                                !StringUtil.isNullOrEmpty(endWorkingTime2.trim)
                                                    ? ''
                                                    : DateUtil.convertFromFormatToFormat(
                                                          endWorkingTime2,
                                                          DateUtil.FORMAT_DATE_TIME_ZONE_T,
                                                          DateUtil.FORMAT_TIME,
                                                      )
                                            }
                                            onPress={() => this.showCalendarTime(this.shiftType.END_2)}
                                        />
                                    </View>
                                </View>
                            )}
                            {/* Total num working */}
                            <View style={{marginVertical: Constants.MARGIN_LARGE}}>
                                <Text
                                    style={[
                                        commonStyles.textBold,
                                        {
                                            marginHorizontal: Constants.MARGIN_X_LARGE,
                                            color: Colors.COLOR_PRIMARY,
                                        },
                                    ]}>
                                    Tổng số giờ set ca: {numHourSet}
                                </Text>
                            </View>
                        </View>
                    </Content>
                    <ModalConfigStaff
                        ref={'modalConfigStaff'}
                        onConfirm={validFrom => {
                            this.filter.validFrom = validFrom;
                            this.props.configStaff({filter: this.filter, staffId: this.staffId});
                            this.hideModal();
                        }}
                    />
                    <CalendarScreen
                        minimumDate={new Date(new Date().setDate(DateUtil.now().getDate() + 1))}
                        dateCurrent={DateUtil.now()}
                        chooseDate={this.chooseDate}
                        mode={'time'}
                        ref={ref => (this.showCalendar = ref)}
                    />
                    {this.state.refreshing ? null : this.showLoadingBar(this.props.isLoading)}
                </View>
            </Container>
        );
    }

    /**
     * Date press
     */
    chooseDate = day => {
        switch (this.shiftTypeSelected) {
            case this.shiftType.START_1:
                this.setState({
                    startWorkingTime1: day,
                });
                break;
            case this.shiftType.END_1:
                this.setState({
                    endWorkingTime1: day,
                });
                break;
            case this.shiftType.START_2:
                this.setState({
                    startWorkingTime2: day,
                });
                break;
            case this.shiftType.END_2:
                this.setState({
                    endWorkingTime2: day,
                });
                break;
            default:
                break;
        }
    };

    /**
     * Show calendar time
     */
    showCalendarTime = shiftType => {
        this.shiftTypeSelected = shiftType;
        this.showCalendar.showDateTimePicker();
    };

    /**
     * Open modal
     */
    openModal() {
        this.refs.modalConfigStaff.showModal();
    }

    /**
     * Hide modal
     */
    hideModal() {
        this.refs.modalConfigStaff.hideModal();
    }

    /**
     * Render right menu
     */
    renderRightMenu = () => {
        return (
            <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                style={{
                    justifyContent: 'center',
                    padding: Constants.PADDING_LARGE,
                }}
                onPress={this.onRegister}>
                <Image source={ic_check} />
            </TouchableOpacity>
        );
    };
}

const mapStateToProps = state => ({
    data: state.configStaff.data,
    action: state.configStaff.action,
    isLoading: state.configStaff.isLoading,
    error: state.configStaff.error,
    errorCode: state.configStaff.errorCode,
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions,
    ...timekeepingActions,
    ...salaryAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigStaffView);
