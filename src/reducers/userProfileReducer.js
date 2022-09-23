import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { initialState } from './index'
import { ErrorCode } from 'config/errorCode';


export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.GET_USER_INFO:
        case ActionEvent.EDIT_PROFILE:
        case ActionEvent.LOGIN_FB:
        case ActionEvent.LOGIN_GOOGLE:
        case ActionEvent.CHECK_CONVERSATION_ACTIVE:
        case ActionEvent.GET_CONFIG:
        case ActionEvent.CREATE_GROUP_FACE_RECOGNIZE:
            return {
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type
            }
        case getActionSuccess(ActionEvent.GET_USER_INFO):
        case getActionSuccess(ActionEvent.EDIT_PROFILE):
        case getActionSuccess(ActionEvent.LOGIN_FB):
        case getActionSuccess(ActionEvent.LOGIN_GOOGLE):
        case getActionSuccess(ActionEvent.CHECK_CONVERSATION_ACTIVE):
        case getActionSuccess(ActionEvent.GET_CONFIG):
        case getActionSuccess(ActionEvent.CREATE_GROUP_FACE_RECOGNIZE):
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