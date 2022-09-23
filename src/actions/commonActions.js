import { ActionEvent, getActionSuccess } from "./actionEvent";

export const fetchError = (errorCode, error) => ({
    type: ActionEvent.REQUEST_FAIL,
    payload: { errorCode, error }
})

export const getArea = (filter) => ({
    type: ActionEvent.GET_AREA,
    payload: { ...filter }
})

export const getAreaSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_AREA),
    payload: { data }
})

export const saveException = (filter) => ({
    type: ActionEvent.SAVE_EXCEPTION,
    payload: { ...filter }
})

export const saveExceptionSuccess = data => ({
    type: getActionSuccess(ActionEvent.SAVE_EXCEPTION),
    payload: { data }
})

export const resetAction = () => ({
    type: ActionEvent.RESET_ACTION
})

export const getProvinceHCM = () => ({
    type: ActionEvent.GET_PROVINCE_HCM,
})

export const getProvinceHCMSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_PROVINCE_HCM),
    payload: { data }
})

export const getTimeToday = (screen) => ({
    type: ActionEvent.GET_TIME_TODAY,
    screen: screen
})

export const getTimeTodaySuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_TIME_TODAY),
    payload: { data }
})

