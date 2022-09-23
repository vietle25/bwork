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
import * as tenorActions from 'actions/tenorActions';
import { ServerPath } from 'config/Server';
import { Header, handleErrors, consoleLogEpic, handleConnectErrors } from './commonEpic';
import { ErrorCode } from 'config/errorCode';
import { fetchError } from 'actions/commonActions';
import ApiUtil from 'utils/apiUtil';
import { configConstants } from 'values/configConstants';

export const getGifTrendingEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_GIF_TRENDING),
        switchMap((action) =>
            fetch(ServerPath.TENOR_API_URL + `trending?key=${configConstants.KEY_TENOR_API}&limit=${action.payload.paging.pageSize * action.payload.paging.page}`, {
                method: 'GET',
                headers: ApiUtil.getHeaderTenor()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response);
            }).then((responseJson) => {
                console.log(responseJson);
                return tenorActions.getGifTrendingSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("GET_GIF_TRENDING:", ActionEvent.GET_GIF_TRENDING, error);
                return handleConnectErrors(error);
            })
        )
    );

export const searchGifEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.SEARCH_GIF),
        switchMap((action) =>
            fetch(ServerPath.TENOR_API_URL + `search?q=${action.payload.searchString}&key=${configConstants.KEY_TENOR_API}&limit=${action.payload.paging.pageSize * action.payload.paging.page}`, {
                method: 'GET',
                headers: ApiUtil.getHeaderTenor()
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                return handleErrors(response);
            }).then((responseJson) => {
                console.log(responseJson);
                return tenorActions.searchGifSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("SEARCH_GIF:", ActionEvent.SEARCH_GIF, error);
                return handleConnectErrors(error);
            })
        )
    );