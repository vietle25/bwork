import { ActionEvent, getActionSuccess } from './actionEvent';
import { filter } from 'rxjs/operators';

export const getWiFiConfig = () => ({
    type: ActionEvent.GET_WI_FI_CONFIG
})

export const getWiFiConfigSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_WI_FI_CONFIG),
    payload: { data }
})

export const getWiFiConfigAdmin = filter => ({
    type: ActionEvent.GET_WI_FI_CONFIG_ADMIN,
    payload: { ...filter }
})

export const getWiFiConfigAdminSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_WI_FI_CONFIG_ADMIN),
    payload: { data }
})

export const getWorkingTimeConfig = () => ({
    type: ActionEvent.GET_WORKING_TIME_CONFIG
})

export const getWorkingTimeConfigSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_WORKING_TIME_CONFIG),
    payload: { data }
})

export const getWorkingTimeConfigByUserId = (userId) => ({
    type: ActionEvent.GET_WORKING_TIME_CONFIG_BY_USER_ID,
    payload: { userId }
})

export const getWorkingTimeConfigByUserIdSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_WORKING_TIME_CONFIG_BY_USER_ID),
    payload: { data }
})

export const timekeeping = filter => ({
    type: ActionEvent.TIMEKEEPING,
    payload: { ...filter }
})

export const timekeepingSuccess = data => ({
    type: getActionSuccess(ActionEvent.TIMEKEEPING),
    payload: { data }
})

export const getTimekeeping = () => ({
    type: ActionEvent.GET_TIMEKEEPING
})

export const getTimekeepingSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_TIMEKEEPING),
    payload: { data }
})

export const getTimekeepingHistory = filter => ({
    type: ActionEvent.GET_TIMEKEEPING_HISTORY,
    payload: { ...filter }
})

export const getTimekeepingHistorySuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_TIMEKEEPING_HISTORY),
    payload: { data }
})

export const getTimekeepingHistoryDetail = filter => ({
    type: ActionEvent.GET_TIMEKEEPING_HISTORY_DETAIL,
    payload: { ...filter }
})

export const getTimekeepingHistoryDetailSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_TIMEKEEPING_HISTORY_DETAIL),
    payload: { data }
})

export const getTimekeepingList = (filter, screen) => ({
    type: ActionEvent.GET_TIMEKEEPING_LIST,
    payload: { ...filter, screen }
})

export const getTimekeepingListSuccess = (data, screen) => ({
    type: getActionSuccess(ActionEvent.GET_TIMEKEEPING_LIST),
    payload: { data, screen }
})

export const approvalTimekeeping = filter => ({
    type: ActionEvent.APPROVAL_TIMEKEEPING,
    payload: { ...filter }
})

export const approvalTimekeepingSuccess = data => ({
    type: getActionSuccess(ActionEvent.APPROVAL_TIMEKEEPING),
    payload: { data }
})

export const timekeepingAdmin = filter => ({
    type: ActionEvent.TIMEKEEPING_ADMIN,
    payload: { ...filter }
})

export const timekeepingAdminSuccess = data => ({
    type: getActionSuccess(ActionEvent.TIMEKEEPING_ADMIN),
    payload: { data }
})

export const timekeepingUpdate = filter => ({
    type: ActionEvent.TIMEKEEPING_UPDATE,
    payload: { ...filter }
})

export const timekeepingUpdateSuccess = data => ({
    type: getActionSuccess(ActionEvent.TIMEKEEPING_UPDATE),
    payload: { data }
})

export const timekeepingDelete = timekeepingId => ({
    type: ActionEvent.TIMEKEEPING_DELETE,
    payload: { timekeepingId }
})

export const timekeepingDeleteSuccess = data => ({
    type: getActionSuccess(ActionEvent.TIMEKEEPING_DELETE),
    payload: { data }
})