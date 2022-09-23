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
import * as salaryActions from 'actions/salaryAction';
import { ServerPath } from 'config/Server';
import { Header, handleErrors, consoleLogEpic, handleConnectErrors } from './commonEpic';
import { ErrorCode } from 'config/errorCode';
import { fetchError } from 'actions/commonActions';
import ApiUtil from 'utils/apiUtil';

export const getSalaryEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_SALARY),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `salary/history`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.filter)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return salaryActions.getSalarySuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_SALARY:", ActionEvent.GET_SALARY, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getSalaryConfigEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_SALARY_CONFIG),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `salary/config`, {
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
                return salaryActions.getSalaryConfigSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_SALARY_CONFIG:", ActionEvent.GET_SALARY_CONFIG, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getStaffSalaryEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_STAFF_SALARY),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `salary/staff/list`, {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.filter)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return salaryActions.getStaffSalarySuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_STAFF_SALARY:", ActionEvent.GET_STAFF_SALARY, error);
                    return handleConnectErrors(error)
                })
        )
    );

export const getDetailTypeSalaryEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_DETAIL_TYPE_SALARY),
        switchMap((action) =>
            fetch(ServerPath.API_URL + 'salary/detail/type', {
                method: 'POST',
                headers: ApiUtil.getHeader(),
                body: JSON.stringify(action.filter)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return salaryActions.getDetailTypeSalarySuccess(responseJson)
            }).catch((error) => {
                consoleLogEpic("GET_DETAIL_TYPE_SALARY_EPIC:", ActionEvent.GET_DETAIL_TYPE_SALARY, error);
                return handleConnectErrors(error)
            })
        )
    );