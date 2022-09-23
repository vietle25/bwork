import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { initialState } from './index'
import { ErrorCode } from 'config/errorCode';


export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.GET_TIMEKEEPING_LIST:
        case ActionEvent.APPROVAL_TIMEKEEPING:
        case ActionEvent.TIMEKEEPING_UPDATE:
        case ActionEvent.TIMEKEEPING_ADMIN:
        case ActionEvent.GET_WI_FI_CONFIG_ADMIN:
        case ActionEvent.TIMEKEEPING_DELETE:
            return {
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type
            }
        case getActionSuccess(ActionEvent.GET_TIMEKEEPING_LIST):
        case getActionSuccess(ActionEvent.APPROVAL_TIMEKEEPING):
        case getActionSuccess(ActionEvent.TIMEKEEPING_ADMIN):
        case getActionSuccess(ActionEvent.TIMEKEEPING_UPDATE):
        case getActionSuccess(ActionEvent.GET_WI_FI_CONFIG_ADMIN):
        case getActionSuccess(ActionEvent.TIMEKEEPING_DELETE):
            return {
                ...state,
                isLoading: false,
                data: action.payload.data.data !== undefined ? action.payload.data.data : null,
                errorCode: action.payload.data.errorCode,
                action: action.type,
                screen: action.payload.screen
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
