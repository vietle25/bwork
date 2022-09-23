import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { initialState } from './index'
import { ErrorCode } from 'config/errorCode';


export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.NOTIFY_LOGIN_SUCCESS:
            return {
                ...state,
                isLoading: false,
                error: null,
                errorCode: ErrorCode.ERROR_SUCCESS,
                data: null,
                action: action.type,
            }
        case ActionEvent.GET_USER_INFO:
        case ActionEvent.GET_PROFILE_ADMIN:
        case ActionEvent.GET_CONFIG:
        case ActionEvent.GET_UPDATE_VERSION:
        case ActionEvent.USER_DEVICE_INFO:
        case ActionEvent.GET_BANNER:
        case ActionEvent.CHECK_EXIST_CONVERSATION_IN_HOME:
        case ActionEvent.CHECK_CONVERSATION_ACTIVE:
        case ActionEvent.GET_FIREBASE_TOKEN:
        case ActionEvent.GET_WI_FI_CONFIG:
        case ActionEvent.GET_WORKING_TIME_CONFIG:
        case ActionEvent.TIMEKEEPING:
        case ActionEvent.GET_TIMEKEEPING:
        case ActionEvent.GET_TIME_TODAY:
        case ActionEvent.GET_DASHBOARD_STATISTICAL:
        case ActionEvent.COUNT_NEW_NOTIFICATION:
            return {
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type,
                screen: action.screen
            }
        case ActionEvent.GET_MY_LOCATION:
        case ActionEvent.TRAINING_PERSON_GROUP:
            return {
                ...state,
                isLoading: false,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type
            }
        case getActionSuccess(ActionEvent.GET_USER_INFO):
        case getActionSuccess(ActionEvent.GET_PROFILE_ADMIN):
        case getActionSuccess(ActionEvent.GET_CONFIG):
        case getActionSuccess(ActionEvent.GET_UPDATE_VERSION):
        case getActionSuccess(ActionEvent.USER_DEVICE_INFO):
        case getActionSuccess(ActionEvent.GET_BANNER):
        case getActionSuccess(ActionEvent.CHECK_EXIST_CONVERSATION_IN_HOME):
        case getActionSuccess(ActionEvent.CHECK_CONVERSATION_ACTIVE):
        case getActionSuccess(ActionEvent.GET_FIREBASE_TOKEN):
        case getActionSuccess(ActionEvent.GET_WI_FI_CONFIG):
        case getActionSuccess(ActionEvent.GET_WORKING_TIME_CONFIG):
        case getActionSuccess(ActionEvent.TIMEKEEPING):
        case getActionSuccess(ActionEvent.GET_TIMEKEEPING):
        case getActionSuccess(ActionEvent.GET_TIME_TODAY):
        case getActionSuccess(ActionEvent.GET_DASHBOARD_STATISTICAL):
        case getActionSuccess(ActionEvent.COUNT_NEW_NOTIFICATION):
            return {
                ...state,
                isLoading: false,
                data: action.payload.data.data !== undefined ? action.payload.data.data : null,
                errorCode: action.payload.data.errorCode,
                action: action.type,
            }
        case getActionSuccess(ActionEvent.GET_MY_LOCATION):
        case getActionSuccess(ActionEvent.TRAINING_PERSON_GROUP):
            return {
                ...state,
                isLoading: false,
                data: action.payload.data !== undefined ? action.payload.data : null,
                errorCode: ErrorCode.ERROR_SUCCESS,
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
