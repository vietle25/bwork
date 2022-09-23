import { ActionEvent, getActionSuccess } from 'actions/actionEvent';
import { initialState } from './index'
import { ErrorCode } from 'config/errorCode';


export default function (state = initialState, action) {
    switch (action.type) {
        case ActionEvent.GET_GIF_TRENDING:
        case ActionEvent.SEARCH_GIF:
            return {
                ...state,
                isLoading: true,
                error: null,
                errorCode: ErrorCode.ERROR_INIT,
                data: null,
                action: action.type
            }
        case getActionSuccess(ActionEvent.GET_GIF_TRENDING):
        case getActionSuccess(ActionEvent.SEARCH_GIF):
            return {
                ...state,
                isLoading: false,
                data: action.payload.data !== undefined ? action.payload.data : null,
                errorCode: action.payload.data.code !== undefined ? action.payload.data.code : ErrorCode.ERROR_SUCCESS,
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
