import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { initialState } from './index'
import { ErrorCode } from 'config/errorCode';


export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.CREATE_CONVERSATION:
        case ActionEvent.GET_PROFILE_USER_CHAT:
        case ActionEvent.GET_MEMBER_OF_CONVERSATION:
        case ActionEvent.DELETE_CONVERSATION:
        case ActionEvent.CHECK_EXIST_CONVERSATION:
            return {
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type
            }
        case getActionSuccess(ActionEvent.CREATE_CONVERSATION):
        case getActionSuccess(ActionEvent.GET_PROFILE_USER_CHAT):
        case getActionSuccess(ActionEvent.DELETE_CONVERSATION):
        case getActionSuccess(ActionEvent.GET_MEMBER_OF_CONVERSATION):
        case getActionSuccess(ActionEvent.CHECK_EXIST_CONVERSATION):
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
                error: action.error,
                errorCode: action.errorCode,
                action: action.type
            }
        default:
            return state;
    }
}