import approvalStatusType from 'enum/approvalStatusType';
import checkInType from 'enum/checkInType';
import dashboardTimekeeppingType from 'enum/dashboardType';
import screenType from 'enum/screenType';
import timekeepingType from 'enum/timekeepingType';
import ic_map from 'images/ic_map.png';
import {localizes} from 'locales/i18n';
import {PureComponent} from 'react';
import {Dimensions, Image, Pressable, Text, View} from 'react-native';
import commonStyles from 'styles/commonStyles';
import DateUtil from 'utils/dateUtil';
import Utils from 'utils/utils';
import {Colors} from 'values/colors';
import {Constants} from 'values/constants';
import styles from './styles';

const screen = Dimensions.get('window');

export default class ItemTimekeeping extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {};
        this.data = this.props.item;
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.props = nextProps;
            this.data = this.props.item;
        }
    }

    render() {
        const {data, index, screen, dashboardType, renderButtonAproval, renderButtonEdit, showMap, gotoMap} =
            this.props;
        const CheckIn = ({textCheck, time, isNote, styleNote, type}) => (
            <View style={{position: 'relative'}}>
                {!Utils.isNull(this.data.checkOutTime) ? (
                    <View
                        style={[
                            styles.borderCheck,
                            {
                                position: 'absolute',
                                left: 0,
                                height: isNote && type == checkInType.CHECK_IN ? '100%' : 0,
                            },
                        ]}
                    />
                ) : null}
                <View style={{position: 'relative', flexDirection: 'row', alignItems: 'center'}}>
                    <View
                        style={[
                            styles.circleCheck,
                            {borderColor: isNote ? Colors.COLOR_TRANSPARENT : Colors.COLOR_PRIMARY},
                        ]}
                    />
                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                        <Text
                            style={[
                                commonStyles.text,
                                {
                                    color: isNote ? Colors.COLOR_TRANSPARENT : Colors.COLOR_PRIMARY,
                                    marginVertical: 0,
                                    marginHorizontal: Constants.MARGIN_X_LARGE,
                                },
                            ]}>
                            {time}
                        </Text>
                        <Text style={[commonStyles.text, {flex: 1, margin: 0}, isNote ? styleNote : null]}>
                            {textCheck}
                            {isNote
                                ? type == checkInType.CHECK_IN
                                    ? this.getTextApproval(this.data.checkInApprovalStatus, this.data.checkInType)
                                    : this.getTextApproval(this.data.checkOutApprovalStatus, this.data.checkOutType)
                                : null}
                        </Text>
                    </View>
                    {showMap && (
                        <View>
                            <Pressable
                                onPress={() => {
                                    gotoMap(this.data);
                                }}>
                                <Image source={ic_map} />
                            </Pressable>
                        </View>
                    )}
                    {isNote &&
                        ((type == checkInType.CHECK_IN &&
                            this.data.checkInApprovalStatus == approvalStatusType.WAITING_FOR_APPROVAL) ||
                            (type == checkInType.CHECK_OUT &&
                                this.data.checkOutApprovalStatus == approvalStatusType.WAITING_FOR_APPROVAL)) &&
                        renderButtonAproval &&
                        renderButtonAproval(this.data, type)}
                </View>
            </View>
        );

        const CheckOut = ({textCheck}) => (
            <View>
                <View style={[styles.borderCheck]} />
                <CheckIn
                    textCheck={textCheck}
                    time={DateUtil.convertFromFormatToFormat(
                        this.data.checkOutTime,
                        DateUtil.FORMAT_TIME_SECOND,
                        DateUtil.FORMAT_TIME,
                    )}
                />
                {this.data.checkOutType != timekeepingType.NORMAL && !Utils.isNull(this.data.checkOutNote) ? (
                    <CheckIn
                        textCheck={localizes('timekeeping.reason') + this.data.checkOutNote}
                        time={'00:00'}
                        isNote={true}
                        styleNote={{opacity: Constants.OPACITY_50}}
                        type={checkInType.CHECK_OUT}
                    />
                ) : null}
            </View>
        );

        return (
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: Colors.COLOR_WHITE,
                    paddingVertical: Constants.MARGIN_LARGE + Constants.MARGIN,
                    paddingHorizontal:
                        screen == screenType.FROM_HOME_VIEW ? Constants.PADDING_X_LARGE + Constants.PADDING_LARGE : 0,
                }}>
                <View style={{flex: 1}}>
                    <CheckIn
                        textCheck={!Utils.isNull(this.data.id) ? localizes('timekeeping.checkedIn') : 'Chưa checkin'}
                        time={DateUtil.convertFromFormatToFormat(
                            this.data.checkInTime,
                            DateUtil.FORMAT_TIME_SECOND,
                            DateUtil.FORMAT_TIME,
                        )}
                    />
                    {this.data.checkInType != timekeepingType.NORMAL && !Utils.isNull(this.data.checkInNote) ? (
                        <CheckIn
                            textCheck={localizes('timekeeping.reason') + this.data.checkInNote}
                            time={'00:00'}
                            isNote={true}
                            styleNote={{opacity: Constants.OPACITY_50}}
                            type={checkInType.CHECK_IN}
                        />
                    ) : null}
                    {!Utils.isNull(this.data.checkOutTime) ? (
                        <CheckOut
                            textCheck={
                                !Utils.isNull(this.data.id) ? localizes('timekeeping.checkedOut') : 'Chưa checkout'
                            }
                        />
                    ) : null}
                </View>
                {this.data.checkInApprovalStatus !== approvalStatusType.WAITING_FOR_APPROVAL &&
                    this.data.checkOutApprovalStatus !== approvalStatusType.WAITING_FOR_APPROVAL &&
                    dashboardType != dashboardTimekeeppingType.NOT_CHECK_IN &&
                    renderButtonEdit &&
                    renderButtonEdit(this.data)}
            </View>
        );
    }

    /**
     * Get text approval
     */
    getTextApproval(approvalStatus, type) {
        if (approvalStatus == approvalStatusType.WAITING_FOR_APPROVAL) {
            return (
                <Text style={[commonStyles.text, {lineHeight: 24, color: Colors.COLOR_RED}]}>
                    {localizes('timekeeping.waitingApproval')}
                </Text>
            );
        } else if (approvalStatus == approvalStatusType.DENIED) {
            return (
                <Text style={[commonStyles.text, {lineHeight: 24, color: Colors.COLOR_RED}]}>
                    {localizes('timekeeping.denied')}
                </Text>
            );
        } else if (approvalStatus == approvalStatusType.APPROVED) {
            return this.getTextType(type);
        }
    }

    /**
     * Get text type
     * @param {*} type
     */
    getTextType(type) {
        if (type != timekeepingType.NORMAL) {
            return (
                <Text style={[commonStyles.text, {lineHeight: 24, color: Colors.COLOR_PRIMARY}]}>
                    {localizes('timekeeping.approved')}
                </Text>
            );
        } else {
            return null;
        }
    }
}
