import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { initialState } from './index'
import { ErrorCode } from 'config/errorCode';


export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.GET_LIST_STAFF_DEPARTMENT:
        case ActionEvent.GET_COMPANIES:
        case ActionEvent.GET_LIST_DEPARTMENT:
        case ActionEvent.DENIED_STAFF:
        case ActionEvent.GET_CONFIG:
            return {
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type
            }
        case getActionSuccess(ActionEvent.GET_LIST_STAFF_DEPARTMENT):
        case getActionSuccess(ActionEvent.GET_COMPANIES):
        case getActionSuccess(ActionEvent.GET_LIST_DEPARTMENT):
        case getActionSuccess(ActionEvent.DENIED_STAFF):
        case getActionSuccess(ActionEvent.GET_CONFIG):
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