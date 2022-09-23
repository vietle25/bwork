import { ActionEvent, getActionSuccess } from './actionEvent';

export const getSabbaticals = (filter) => ({
    type: ActionEvent.GET_SABBATICALS,
    payload: { ...filter }
})

export const getSabbaticalsSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_SABBATICALS),
    payload: { data }
})

export const getSabbaticalsAdmin = (filter) => ({
    type: ActionEvent.GET_SABBATICALS_ADMIN,
    payload: { ...filter }
})

export const getSabbaticalsAdminSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_SABBATICALS_ADMIN),
    payload: { data }
})

export const registerSabbatical = (filter) => ({
    type: ActionEvent.REGISTER_SABBATICAL,
    payload: { ...filter }
})

export const registerSabbaticalSuccess = data => ({
    type: getActionSuccess(ActionEvent.REGISTER_SABBATICAL),
    payload: { data }
})

export const updateSabbatical = (filter) => ({
    type: ActionEvent.UPDATE_SABBATICAL,
    payload: { ...filter }
})

export const updateSabbaticalSuccess = data => ({
    type: getActionSuccess(ActionEvent.UPDATE_SABBATICAL),
    payload: { data }
})

export const deleteSabbatical = (sabbaticalId) => ({
    type: ActionEvent.DELETE_SABBATICAL,
    payload: { sabbaticalId }
})

export const deleteSabbaticalSuccess = data => ({
    type: getActionSuccess(ActionEvent.DELETE_SABBATICAL),
    payload: { data }
})

export const approvedSabbatical = (sabbaticalId) => ({
    type: ActionEvent.APPROVED_SABBATICAL,
    payload: { sabbaticalId }
})

export const approvedSabbaticalSuccess = data => ({
    type: getActionSuccess(ActionEvent.APPROVED_SABBATICAL),
    payload: { data }
})

export const deniedSabbatical = (filter) => ({
    type: ActionEvent.DENIED_SABBATICAL,
    payload: { ...filter }
})

export const deniedSabbaticalSuccess = data => ({
    type: getActionSuccess(ActionEvent.DENIED_SABBATICAL),
    payload: { data }
})