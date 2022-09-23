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
import * as banner from 'actions/bannerActions';
import ApiUtil from 'utils/apiUtil';

export const getBannerEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_BANNER),
        switchMap((action) =>
            fetch(ServerPath.API_URL + `banner/home`, {
                method: 'GET',
                headers: ApiUtil.getHeader()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response)
            }).then((responseJson) => {
                console.log(responseJson)
                return banner.getBannerSuccess(responseJson)
            })
                .catch((error) => {
                    consoleLogEpic("GET_BANNER GET_BANNER_EPIC:", ActionEvent.GET_BANNER, error)
                    return handleConnectErrors(error)
                })
        )
    );