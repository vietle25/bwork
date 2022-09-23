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
import * as companyActions from 'actions/companyActions';
import ApiUtil from 'utils/apiUtil';

export const getDashboardStatisticalEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_DASHBOARD_STATISTICAL),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `company/statistical/get`, {
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
                return companyActions.getDashboardStatisticalSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_DASHBOARD_STATISTICAL EPIC:", ActionEvent.GET_DASHBOARD_STATISTICAL, error)
                    return handleConnectErrors(error)
                })
        )
    );

export const getListStaffDepartmentEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_LIST_STAFF_DEPARTMENT),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `department/staff/list`, {
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
                return companyActions.getListStaffDepartmentSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_LIST_STAFF_DEPARTMENT COMPANY EPIC:", ActionEvent.GET_LIST_STAFF_DEPARTMENT, error)
                    return handleConnectErrors(error)
                })
        )
    );