import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { initialState } from './index'
import { ErrorCode } from 'config/errorCode';

export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.GET_NOTIFICATIONS:
        case ActionEvent.GET_NOTIFICATIONS_VIEW:
        case ActionEvent.COUNT_NEW_NOTIFICATION:
        case ActionEvent.SEARCH_NOTIFICATION:
        case ActionEvent.READ_ALL_NOTIFICATION:
        case ActionEvent.GET_NOTIFICATIONS_BY_TYPE:
            return {
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type
            }
        case getActionSuccess(ActionEvent.GET_NOTIFICATIONS):
        case getActionSuccess(ActionEvent.GET_NOTIFICATIONS_VIEW):
        case getActionSuccess(ActionEvent.COUNT_NEW_NOTIFICATION):
        case getActionSuccess(ActionEvent.SEARCH_NOTIFICATION):
        case getActionSuccess(ActionEvent.READ_ALL_NOTIFICATION):
        case getActionSuccess(ActionEvent.GET_NOTIFICATIONS_BY_TYPE):
            return {
                ...state,
                isLoading: false,
                data: action.payload.data.data !== undefined ? action.payload.data.data : null,
                errorCode: action.payload.data.errorCode,
                action: action.type,
            }
        default:
            return state;
    }
}
