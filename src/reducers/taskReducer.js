import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import {initialState} from './index'
import { ErrorCode } from 'config/errorCode';

export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.GET_TASK:
        case ActionEvent.GET_TASK_TIME_CONFIG:
        case ActionEvent.UPDATE_TASK:
            return {
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type
            }
            break;
        case getActionSuccess(ActionEvent.UPDATE_TASK):
        case getActionSuccess(ActionEvent.GET_TASK_TIME_CONFIG):
        case getActionSuccess(ActionEvent.GET_TASK):
            return {
                ...state,
                isLoading: false,
                data: action.payload.data.data !== undefined ? action.payload.data.data : null,
                errorCode: action.payload.data.errorCode,
                action: action.type,
            }
            break;
        case ActionEvent.REQUEST_FAIL:
            return {
                ...state,
                isLoading: false,
                error: action.payload.error,
                errorCode: action.payload.errorCode,
                action: action.payload.action
            }
            break;
        default:
            return state;
    }
}