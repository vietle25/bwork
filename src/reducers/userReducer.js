import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import {initialState} from './index'
import { ErrorCode } from 'config/errorCode';

export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.LOGIN:
        case ActionEvent.GET_USER_INFO:
        case getActionSuccess(ActionEvent.RELOAD_LOGIN_SUCCESS):
            return {
                ...state,
                loading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null
            }
            break;
        case getActionSuccess(ActionEvent.LOGIN):
        case getActionSuccess(ActionEvent.GET_USER_INFO):
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
                action: action.type
            }
            break;
        default:
            return state;
    }
}