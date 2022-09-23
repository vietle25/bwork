import { fetchError } from "actions/commonActions"
import { ErrorCode } from "config/errorCode";
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
import * as userActions from 'actions/userActions';
import * as commonActions from 'actions/commonActions';
import { ServerPath } from 'config/Server';
import StorageUtil from "utils/storageUtil";
import ApiUtil from 'utils/apiUtil';
import Utils from "utils/utils";

/**
 * Handle errors
 * @param {*} response 
 */
export function handleErrors(response) {
    if (!response.ok) {
        if (response.status == ErrorCode.UN_AUTHORIZE) {
            return { data: [], errorCode: ErrorCode.UN_AUTHORIZE, error: "" }
        }
        return { data: [], errorCode: ErrorCode.ERROR_COMMON, error: "" }
    }
    return response;
}

/**
 * Handle connect errors
 * @param {*} error 
 */
export function handleConnectErrors(error) {
    if (error.message == "Network request failed") {
        return fetchError(ErrorCode.NO_CONNECTION, error)
    }
    return fetchError(ErrorCode.ERROR_COMMON, error)
}

/**
 * 
 * Console.log Error Epic
 * @param {} catchEpic 
 * @param {*} action 
 * @param {*} typeError 
 */
export function consoleLogEpic(catchEpic, action, typeError) {
    return console.log("ERROR CATCH", catchEpic, "ACTION", action, typeError, "   ", ServerPath.API_URL);
}

export function saveException(className, error) {
    fetch(ServerPath.API_URL + 'common/save/exception', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            className: className,
            error: error,
        }),
    });
}

export const Header = new Headers({
    "Accept": "application/json",
    'Content-Type': 'application/json',
    'X-APITOKEN': global.token
})

export const getUpdateVersionEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_UPDATE_VERSION),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'common/version', {
                method: 'GET',
                headers: ApiUtil.getHeader(),
            }).then(handleErrors)
                .then((response) => response.json())
                .then((responseJson) => {
                    console.log(responseJson);
                    return userActions.getUpdateVersionSuccess(responseJson);
                })
                .catch((error) => {
                    console.log(error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getAreaEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_AREA),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'common/area', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log("JSON", responseJson);
                return commonActions.getAreaSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("GET_AREA COMMON_EPIC:", ActionEvent.GET_AREA, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const saveExceptionEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.SAVE_EXCEPTION),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'common/save/exception', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log("saveException", responseJson);
                return commonActions.saveExceptionSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("SAVE_EXCEPTION_EPIC:", ActionEvent.SAVE_EXCEPTION, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getProvinceHCMEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_PROVINCE_HCM),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'common/area/province/HCM', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log("getProvinceHCM", responseJson);
                return commonActions.getProvinceHCMSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("GET_PROVINCE_HCM_EPIC:", ActionEvent.GET_PROVINCE_HCM, error);
                return handleConnectErrors(error)
            })
        )
    );

export const getTimeTodayEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_TIME_TODAY),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `common/time/today`, {
                method: 'GET',
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return commonActions.getTimeTodaySuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_TIME_TODAY EPIC:", ActionEvent.GET_TIME_TODAY, error)
                    return handleConnectErrors(error)
                })
        )
    );