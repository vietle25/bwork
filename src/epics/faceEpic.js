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
import * as faceActions from 'actions/faceActions';
import { ServerPath } from 'config/Server';
import { Header, handleErrors, consoleLogEpic, handleConnectErrors } from './commonEpic';
import { ErrorCode } from 'config/errorCode';
import { fetchError } from 'actions/commonActions';
import ApiUtil from 'utils/apiUtil';
import { configConstants } from 'values/configConstants';

export const createGroupFaceRecognizeEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.CREATE_GROUP_FACE_RECOGNIZE),
        switchMap((action) =>
            fetch(ServerPath.FACE_API + `persongroups/${action.payload.name}`, {
                method: 'PUT',
                headers: {
                    Accept: 'application/json',
                    'Ocp-Apim-Subscription-Key': configConstants.KEY_FACE_API,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(action.payload)
            }).then((response) => {
                return response;
            }).then((responseJson) => {
                console.log(responseJson);
                return faceActions.createGroupFaceRecognizeSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("CREATE_GROUP_FACE_RECOGNIZE FACE_EPIC:", ActionEvent.CREATE_GROUP_FACE_RECOGNIZE, error);
                return handleConnectErrors(error)
            })
        )
    );

export const getGroupFaceRecognizeEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.GET_GROUP_FACE_RECOGNIZE),
        switchMap((action) =>
            fetch(ServerPath.FACE_API + `persongroups/${action.payload.personGroupId}`, {
                method: 'GET',
                headers: {
                    'Ocp-Apim-Subscription-Key': configConstants.KEY_FACE_API
                }
            }).then((response) => {
                return response.json();
            }).then((responseJson) => {
                console.log(responseJson);
                return faceActions.getGroupFaceRecognizeSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("GET_GROUP_FACE_RECOGNIZE FACE_EPIC:", ActionEvent.GET_GROUP_FACE_RECOGNIZE, error);
                return handleConnectErrors(error)
            })
        )
    );

export const trainingPersonGroupEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.TRAINING_PERSON_GROUP),
        switchMap((action) =>
            fetch(ServerPath.FACE_API + `persongroups/${action.payload.personGroupId}/train`, {
                method: 'POST',
                headers: {
                    'Ocp-Apim-Subscription-Key': configConstants.KEY_FACE_API
                }
            }).then((response) => {
                return response;
            }).then((responseJson) => {
                console.log(responseJson);
                return faceActions.trainingPersonGroupSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("TRAINING_PERSON_GROUP FACE_EPIC:", ActionEvent.TRAINING_PERSON_GROUP, error);
                return handleConnectErrors(error)
            })
        )
    );

export const deletePersonGroupPersonEpic = action$ =>
    action$.pipe(
        ofType(ActionEvent.DELETE_PERSON_GROUP_PERSON),
        switchMap((action) =>
            fetch(ServerPath.FACE_API + `persongroups/${action.payload.personGroupId}/persons/${action.payload.personId}`, {
                method: 'DELETE',
                headers: {
                    'Ocp-Apim-Subscription-Key': configConstants.KEY_FACE_API
                }
            }).then((response) => {
                return response;
            }).then((responseJson) => {
                console.log(responseJson);
                return faceActions.deletePersonGroupPersonSuccess(responseJson);
            }).catch((error) => {
                consoleLogEpic("DELETE_PERSON_GROUP_PERSON FACE_EPIC:", ActionEvent.DELETE_PERSON_GROUP_PERSON, error);
                return handleConnectErrors(error)
            })
        )
    );