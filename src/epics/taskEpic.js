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
import * as taskActions from 'actions/taskActions';
import ApiUtil from 'utils/apiUtil';

export const getTaskEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_TASK),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `task/list`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return taskActions.getTaskSuccess(responseJson);
            })
                .catch((error) => {
                    consoleLogEpic("GET_TASK TASK_EPIC:", ActionEvent.GET_TASK, error);
                    return handleConnectErrors(error, action.type)
                })
        )
    );

export const getTaskDetailEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_TASK_DETAIL),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `task/${action.payload.taskId}/detail`, {
                method: 'GET',
                headers: ApiUtil.getHeader(),
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return taskActions.getTaskDetailSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("GET_TASK_DETAIL TASK_EPIC:", ActionEvent.GET_TASK_DETAIL, error);
                return handleConnectErrors(error, action.type)
            })
        )
    );

export const updateTaskEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.UPDATE_TASK),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `task/${action.payload.taskId}/update`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return taskActions.updateTaskSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("UPDATE_TASK TASK_EPIC:", ActionEvent.UPDATE_TASK, error);
                return handleConnectErrors(error, action.type)
            })
        )
    );

export const updateTaskDetailEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.UPDATE_TASK_DETAIL),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `task/${action.payload.taskId}/update`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.payload)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson);
                return taskActions.updateTaskDetailSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("UPDATE_TASK_DETAIL TASK_EPIC:", ActionEvent.UPDATE_TASK_DETAIL, error);
                return handleConnectErrors(error, action.type)
            })
        )
    );

export const getTaskTimeConfigEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_TASK_TIME_CONFIG),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `task/time/config`, {
                method: 'GET',
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return taskActions.getTaskTimeConfigSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_TASK_TIME_CONFIG TASK_EPIC:", ActionEvent.GET_TASK_TIME_CONFIG, error)
                    return handleConnectErrors(error, action.type)
                })
        )
    );
