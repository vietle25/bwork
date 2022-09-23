import { ActionEvent } from 'actions/actionEvent'
import { Observable } from 'rxjs';
import {
    map,
    filter,
    catchError,
    mergeMap
} from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { delay, mapTo, switchMap } from 'rxjs/operators';
import { dispatch } from 'rxjs/internal/observable/range';
import { Header, handleErrors, consoleLogEpic, handleConnectErrors } from './commonEpic';
import { ErrorCode } from 'config/errorCode';
import { fetchError } from 'actions/commonActions';
import { ServerPath } from 'config/Server';
import * as timekeeping from 'actions/timekeepingActions';
import ApiUtil from 'utils/apiUtil';

export const getWiFiConfigEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_WI_FI_CONFIG),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `timekeeping/wi-fi/config`, {
                method: 'GET',
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return timekeeping.getWiFiConfigSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_WI_FI_CONFIG EPIC:", ActionEvent.GET_WI_FI_CONFIG, error)
                    return handleConnectErrors(error)
                })
        )
    );

export const getWiFiConfigAdminEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_WI_FI_CONFIG_ADMIN),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `timekeeping/wi-fi/config/admin`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return timekeeping.getWiFiConfigAdminSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_WI_FI_CONFIG_ADMIN EPIC:", ActionEvent.GET_WI_FI_CONFIG_ADMIN, error)
                    return handleConnectErrors(error)
                })
        )
    );

export const getWorkingTimeConfigEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_WORKING_TIME_CONFIG),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `timekeeping/working-time/config`, {
                method: 'GET',
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return timekeeping.getWorkingTimeConfigSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_WORKING_TIME_CONFIG EPIC:", ActionEvent.GET_WORKING_TIME_CONFIG, error)
                    return handleConnectErrors(error)
                })
        )
    );

export const getWorkingTimeConfigByUserIdEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_WORKING_TIME_CONFIG_BY_USER_ID),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `timekeeping/working-time/config/${action.payload.userId}`, {
                method: 'GET',
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return timekeeping.getWorkingTimeConfigByUserIdSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_WORKING_TIME_CONFIG_BY_USER_ID EPIC:", ActionEvent.GET_WORKING_TIME_CONFIG_BY_USER_ID, error)
                    return handleConnectErrors(error)
                })
        )
    );

export const timekeepingEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.TIMEKEEPING),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `timekeeping/check`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return timekeeping.timekeepingSuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("TIMEKEEPING EPIC:", ActionEvent.TIMEKEEPING, error);
                return handleConnectErrors(error)
            })
        )
    );

export const getTimekeepingEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_TIMEKEEPING),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `timekeeping/today`, {
                method: 'GET',
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return timekeeping.getTimekeepingSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_TIMEKEEPING EPIC:", ActionEvent.GET_TIMEKEEPING, error)
                    return handleConnectErrors(error)
                })
        )
    );


export const getTimekeepingHistoryEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_TIMEKEEPING_HISTORY),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `timekeeping/history`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return timekeeping.getTimekeepingHistorySuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("GET_TIMEKEEPING_HISTORY EPIC:", ActionEvent.GET_TIMEKEEPING_HISTORY, error);
                return handleConnectErrors(error)
            })
        )
    );

export const getTimekeepingHistoryDetailEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_TIMEKEEPING_HISTORY_DETAIL),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `timekeeping/history/detail`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return timekeeping.getTimekeepingHistoryDetailSuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("GET_TIMEKEEPING_HISTORY_DETAIL EPIC:", ActionEvent.GET_TIMEKEEPING_HISTORY_DETAIL, error);
                return handleConnectErrors(error)
            })
        )
    );

export const getTimekeepingListEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_TIMEKEEPING_LIST),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `timekeeping/list`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return timekeeping.getTimekeepingListSuccess(responseJson, action.payload.screen)
            }).catch((error) => {
                consoleLogEpic("GET_TIMEKEEPING_LIST EPIC:", ActionEvent.GET_TIMEKEEPING_LIST, error);
                return handleConnectErrors(error)
            })
        )
    );

export const approvalTimekeepingEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.APPROVAL_TIMEKEEPING),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `timekeeping/${action.payload.timekeepingId}/approval`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return timekeeping.approvalTimekeepingSuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("APPROVAL_TIMEKEEPING EPIC:", ActionEvent.APPROVAL_TIMEKEEPING, error);
                return handleConnectErrors(error)
            })
        )
    );

export const timekeepingAdminEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.TIMEKEEPING_ADMIN),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `timekeeping/admin/check`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return timekeeping.timekeepingAdminSuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("TIMEKEEPING_ADMIN EPIC:", ActionEvent.TIMEKEEPING_ADMIN, error);
                return handleConnectErrors(error)
            })
        )
    );

export const timekeepingUpdateEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.TIMEKEEPING_UPDATE),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `timekeeping/${action.payload.timekeepingId}/update`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return timekeeping.timekeepingUpdateSuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("TIMEKEEPING_UPDATE EPIC:", ActionEvent.TIMEKEEPING_UPDATE, error);
                return handleConnectErrors(error)
            })
        )
    );

export const timekeepingDeleteEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.TIMEKEEPING_DELETE),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `timekeeping/${action.payload.timekeepingId}/delete`, {
                method: 'GET',
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return timekeeping.timekeepingDeleteSuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("TIMEKEEPING_DELETE EPIC:", ActionEvent.TIMEKEEPING_DELETE, error);
                return handleConnectErrors(error)
            })
        )
    );