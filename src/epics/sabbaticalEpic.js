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
import * as sabbatical from 'actions/sabbaticalActions';
import ApiUtil from 'utils/apiUtil';

export const getSabbaticalsEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_SABBATICALS),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `sabbatical/list`, {
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
                return sabbatical.getSabbaticalsSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_SABBATICALS EPIC:", ActionEvent.GET_SABBATICALS, error)
                    return handleConnectErrors(error)
                })
        )
    );

export const getSabbaticalsAdminEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_SABBATICALS_ADMIN),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `sabbatical/list/admin`, {
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
                return sabbatical.getSabbaticalsAdminSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_SABBATICALS_ADMIN EPIC:", ActionEvent.GET_SABBATICALS_ADMIN, error)
                    return handleConnectErrors(error)
                })
        )
    );

export const registerSabbaticalEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.REGISTER_SABBATICAL),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `sabbatical/register`, {
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
                return sabbatical.registerSabbaticalSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("REGISTER_SABBATICAL EPIC:", ActionEvent.REGISTER_SABBATICAL, error)
                    return handleConnectErrors(error)
                })
        )
    );

export const updateSabbaticalEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.UPDATE_SABBATICAL),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `sabbatical/${action.payload.sabbaticalId}/update`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload.filter)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return sabbatical.updateSabbaticalSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("UPDATE_SABBATICAL EPIC:", ActionEvent.UPDATE_SABBATICAL, error)
                    return handleConnectErrors(error)
                })
        )
    );

export const deleteSabbaticalEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.DELETE_SABBATICAL),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `sabbatical/${action.payload.sabbaticalId}/delete`, {
                method: 'GET',
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return sabbatical.deleteSabbaticalSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("DELETE_SABBATICAL EPIC:", ActionEvent.DELETE_SABBATICAL, error)
                    return handleConnectErrors(error)
                })
        )
    );

export const approvedSabbaticalEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.APPROVED_SABBATICAL),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `sabbatical/${action.payload.sabbaticalId}/approved`, {
                method: 'GET',
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return sabbatical.approvedSabbaticalSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("APPROVED_SABBATICAL EPIC:", ActionEvent.APPROVED_SABBATICAL, error)
                    return handleConnectErrors(error)
                })
        )
    );

export const deniedSabbaticalEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.DENIED_SABBATICAL),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `sabbatical/${action.payload.sabbaticalId}/denied`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload.filter)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return sabbatical.deniedSabbaticalSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("DENIED_SABBATICAL EPIC:", ActionEvent.DENIED_SABBATICAL, error)
                    return handleConnectErrors(error)
                })
        )
    );