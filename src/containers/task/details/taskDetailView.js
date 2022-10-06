import {ActionEvent, getActionSuccess} from 'actions/actionEvent';
import * as commonActions from 'actions/commonActions';
import * as taskActions from 'actions/taskActions';
import * as actions from 'actions/userActions';
import DialogCustom from 'components/dialogCustom';
import Hr from 'components/hr';
import {ErrorCode} from 'config/errorCode';
import BaseView from 'containers/base/baseView';
import repeatWindowType from 'enum/repeatWindowType';
import taskStatusType from 'enum/taskStatusType';
import moment from 'moment';
import {Container, Content} from 'native-base';
import {BackHandler, RefreshControl, Text, View} from 'react-native';
import {CheckBox} from 'react-native-elements';
import HTML from 'react-native-render-html';
import {connect} from 'react-redux';
import commonStyles from 'styles/commonStyles';
import DateUtil from 'utils/dateUtil';
import Utils from 'utils/utils';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';
import {Fonts} from 'values/fonts';
import styles from './styles';

class TaskDetailView extends BaseView {
    constructor(props) {
        super(props);
        this.state = {
            enableRefresh: true,
            refreshing: false,
            disableButton: false,
            showDialog: false,
            isSelectedCompleted: true,
        };
        const {data, taskId, callback} = this.props.navigation.state.params;
        this.createdAt = !Utils.isNull(data)
            ? data.scheduledDate
            : DateUtil.convertFromFormatToFormat(
                  DateUtil.now(),
                  DateUtil.FORMAT_DATE_TIME_ZONE_T,
                  DateUtil.FORMAT_DATE_SQL,
              );
        this.callback = callback;
        this.taskId = taskId;
        this.task = !Utils.isNull(data) ? data : null;
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handlerBackButton);
        !Utils.isNull(this.taskId) && this.handleRequest();
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
                if (this.props.action == getActionSuccess(ActionEvent.UPDATE_TASK_DETAIL)) {
                    if (!Utils.isNull(data)) {
                        this.showMessage('Cập nhật trạng thái thành công');
                        this.props.getTaskDetail(this.task.id);
                        if (this.callback != null) {
                            this.callback();
                        }
                    }
                } else if (this.props.action == getActionSuccess(ActionEvent.GET_TASK_DETAIL)) {
                    if (!Utils.isNull(data)) {
                        this.task = data;
                        this.createdAt = this.task.scheduledDate;
                    }
                }
            } else {
                this.handleError(this.props.errorCode, this.props.error);
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
                            title: 'Chi tiết công việc',
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
                        {this.renderContent()}
                    </Content>
                    {!this.state.disableButton ? (
                        <View style={{position: 'absolute', bottom: 16, width: '100%'}}>
                            {this.renderCommonButton(
                                'Cập nhật trạng thái',
                                {
                                    color: Colors.COLOR_WHITE,
                                },
                                {marginHorizontal: Constants.MARGIN_X_LARGE},
                                () => {
                                    this.setState({showDialog: true});
                                },
                                this.state.disableButton,
                            )}
                        </View>
                    ) : null}
                    {this.state.refreshing ? null : this.showLoadingBar(this.props.isLoading)}
                    {this.renderDialogUpdateTask()}
                </View>
            </Container>
        );
    }

    /**
     * Render content task detail
     */
    renderContent() {
        const htmlContent = !Utils.isNull(this.task) ? this.task.description : null;
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
                <View style={[commonStyles.viewHorizontal, {flex: 0}]}>
                    <Text
                        style={[
                            commonStyles.textBold,
                            {flex: 1, marginHorizontal: 0, fontSize: Fonts.FONT_SIZE_LARGE},
                        ]}>
                        {!Utils.isNull(this.task) ? this.task.name : '-'}
                    </Text>
                    {!Utils.isNull(this.task) && this.renderTaskStatus(this.task.taskStatus)}
                </View>
                <View style={[commonStyles.viewHorizontal, {flex: 0}, styles.borderLeft]}>
                    <Text style={[commonStyles.text, {flex: 1, marginHorizontal: 0}]}>Bắt đầu</Text>
                    <Text style={[commonStyles.text, {marginHorizontal: 0}]}>
                        {!Utils.isNull(this.task)
                            ? DateUtil.plusHourToString(this.task.scheduledTime, '00:00:00')
                            : '-'}
                    </Text>
                </View>
                <View style={[commonStyles.viewHorizontal, {flex: 0}, styles.borderLeft]}>
                    <Text style={[commonStyles.text, {flex: 1, marginHorizontal: 0}]}>Thời hạn:</Text>
                    <Text style={[commonStyles.text, {marginHorizontal: 0}]}>
                        {!Utils.isNull(this.task)
                            ? DateUtil.plusHourToString(
                                  DateUtil.parseMillisecondToHour(this.task.taskDurationMinute * 60 * 1000),
                                  '00:00:00',
                              )
                            : '-'}
                    </Text>
                </View>
                <Hr width={2} style={{marginTop: Constants.MARGIN_X_LARGE}} color={Colors.COLOR_BACKGROUND} />
                <View style={[commonStyles.viewHorizontal, {flex: 0}]}>
                    <Text style={[commonStyles.text, {flex: 1, marginHorizontal: 0}]}>Loại công việc:</Text>
                    <Text style={[commonStyles.text, {marginHorizontal: 0}]}>
                        {!Utils.isNull(this.task)
                            ? this.convertRepeatWindowType(this.task.repeatType, this.task.windowType)
                            : '-'}
                    </Text>
                </View>
                {!Utils.isNull(this.task) && !Utils.isNull(this.task.nextScheduledDate) ? (
                    <View style={[commonStyles.viewHorizontal, {flex: 0}]}>
                        <Text style={[commonStyles.text, {flex: 1, marginHorizontal: 0}]}>Ngày làm tiếp theo:</Text>
                        <Text style={[commonStyles.text, {marginHorizontal: 0}]}>
                            {DateUtil.convertFromFormatToFormat(
                                this.task.nextScheduledDate,
                                DateUtil.FORMAT_DATE_SQL,
                                DateUtil.FORMAT_DATE,
                            )}
                        </Text>
                    </View>
                ) : null}
                <View>
                    <Text
                        style={[
                            commonStyles.text,
                            {flex: 1, marginHorizontal: 0, marginBottom: Constants.MARGIN_LARGE},
                        ]}>
                        Mô tả công việc:
                    </Text>
                    <View
                        style={{
                            borderWidth: 1,
                            borderColor: Colors.COLOR_DRK_GREY,
                            borderRadius: Constants.CORNER_RADIUS,
                            padding: Constants.PADDING_LARGE,
                            paddingHorizontal: Constants.PADDING_LARGE + Constants.MARGIN,
                        }}>
                        {htmlContent ? <HTML html={htmlContent} /> : null}
                    </View>
                </View>
            </View>
        );
    }

    /**
     * Render task status
     */
    renderTaskStatus = taskStatus => {
        let textTaskStatus = null;
        switch (taskStatus) {
            case taskStatusType.NEW:
                textTaskStatus = (
                    <Text style={[commonStyles.text, {marginHorizontal: 0, color: Colors.COLOR_LEVEL_GOLD}]}>
                        {'Mới giao'}
                    </Text>
                );
                break;
            case taskStatusType.COMPLETE:
                this.state.disableButton = true;
                textTaskStatus = (
                    <Text style={[commonStyles.text, {marginHorizontal: 0, color: Colors.COLOR_PRIMARY}]}>
                        {'Đã hoàn thành'}
                    </Text>
                );
                break;
            case taskStatusType.CANCEL:
                this.state.disableButton = true;
                textTaskStatus = (
                    <Text style={[commonStyles.text, {marginHorizontal: 0, color: Colors.COLOR_RED}]}>{'Đã hủy'}</Text>
                );
                break;
            default:
                break;
        }
        return textTaskStatus;
    };

    /**
     * Render task status
     */
    convertRepeatWindowType = repeat => {
        let textRepeat = 'Không';
        switch (repeat) {
            case repeatWindowType.DAILY:
                textRepeat = 'Hằng ngày';
                break;
            case repeatWindowType.WEEKLY:
                textRepeat = 'Hằng tuần';
                break;
            case repeatWindowType.MONTHLY:
                textRepeat = 'Hằng tháng';
                break;
            default:
                break;
        }
        return textRepeat;
    };

    /**
     * Handle request
     */
    handleRequest = () => {
        this.filter = {
            taskId: !Utils.isNull(this.taskId) ? this.taskId : !Utils.isNull(this.task) ? this.task.id : null,
        };
        this.props.getTaskDetail(this.filter.taskId);
    };

    //onRefreshing
    handleRefresh = () => {
        this.state.refreshing = true;
        this.handleRequest();
    };

    /**
     * render content checkbox
     */
    renderContentCheckBox() {
        return (
            <View>
                <Text style={[commonStyles.text, {margin: 0, marginBottom: Constants.MARGIN_X_LARGE}]}>
                    Cập nhật trạng thái công việc:
                </Text>
                <View style={[{flexDirection: 'row'}]}>
                    <CheckBox
                        title={'Từ chối'}
                        checked={!this.state.isSelectedCompleted}
                        checkedColor={Colors.COLOR_PRIMARY}
                        checkedIcon="dot-circle-o"
                        uncheckedIcon="circle-o"
                        containerStyle={[styles.checkBox]}
                        onPress={this.onPressChecked}
                    />
                    <CheckBox
                        title={'Đã hoàn thành'}
                        checked={this.state.isSelectedCompleted}
                        checkedColor={Colors.COLOR_PRIMARY}
                        checkedIcon="dot-circle-o"
                        uncheckedIcon="circle-o"
                        containerStyle={[styles.checkBox]}
                        onPress={this.onPressChecked}
                    />
                </View>
            </View>
        );
    }

    /**
     * handle onPress checkbox
     */
    onPressChecked = () => {
        this.setState({
            isSelectedCompleted: !this.state.isSelectedCompleted,
        });
    };

    /**
     * Render dialog delete conversation
     */
    renderDialogUpdateTask() {
        const {showDialog, isSelectedCompleted} = this.state;
        return (
            <DialogCustom
                visible={showDialog}
                isVisibleTwoButton={true}
                showContentCustom={true}
                contentCustom={this.renderContentCheckBox()}
                textBtnOne={'Đóng'}
                textBtnTwo={'Lưu'}
                onPressX={() => {
                    this.setState({showDialog: false});
                }}
                onPressBtnPositive={() => {
                    let type = isSelectedCompleted ? taskStatusType.COMPLETE : taskStatusType.CANCEL;
                    this.props.updateTaskDetail({taskId: this.task.id, taskType: type});
                    this.setState({showDialog: false});
                }}
            />
        );
    }
}

const mapStateToProps = state => ({
    data: state.taskDetail.data,
    isLoading: state.taskDetail.isLoading,
    error: state.taskDetail.error,
    errorCode: state.taskDetail.errorCode,
    action: state.taskDetail.action,
});

const mapDispatchToProps = {
    ...actions,
    ...commonActions,
    ...taskActions,
};

export default connect(mapStateToProps, mapDispatchToProps)(TaskDetailView);
