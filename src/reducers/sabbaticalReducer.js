import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { initialState } from './index'
import { ErrorCode } from 'config/errorCode';


export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.GET_SABBATICALS:
        case ActionEvent.GET_SABBATICALS_ADMIN:
        case ActionEvent.APPROVED_SABBATICAL:
        case ActionEvent.DENIED_SABBATICAL:
        case ActionEvent.DELETE_SABBATICAL:
            return {
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type
            }
        case getActionSuccess(ActionEvent.GET_SABBATICALS):
        case getActionSuccess(ActionEvent.GET_SABBATICALS_ADMIN):
        case getActionSuccess(ActionEvent.APPROVED_SABBATICAL):
        case getActionSuccess(ActionEvent.DENIED_SABBATICAL):
        case getActionSuccess(ActionEvent.DELETE_SABBATICAL):
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