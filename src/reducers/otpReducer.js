import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { initialState } from './index'
import { ErrorCode } from 'config/errorCode';


export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.SEND_OTP:
        case ActionEvent.CONFIRM_OTP:
        case ActionEvent.SIGN_UP:
        case ActionEvent.FORGET_PASS:
        case ActionEvent.LOGIN_FB:
        case ActionEvent.LOGIN_GOOGLE:
            return {
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type
            }
        case getActionSuccess(ActionEvent.SEND_OTP):
        case getActionSuccess(ActionEvent.CONFIRM_OTP):
        case getActionSuccess(ActionEvent.SIGN_UP):
        case getActionSuccess(ActionEvent.FORGET_PASS):
        case getActionSuccess(ActionEvent.LOGIN_FB):
        case getActionSuccess(ActionEvent.LOGIN_GOOGLE):
            return {
                ...state,
                isLoading: false,
                data: action.payload.data.data !== undefined ? action.payload.data.data : null,
                errorCode: action.payload.data.errorCode,
                action: action.type,
            }
        case ActionEvent.REQUEST_FAIL:
            return {
                ...state,
                isLoading: false,
                error: action.payload.error,
                errorCode: action.payload.errorCode,
                action: action.type
            }
        default:
            return state;
    }
}