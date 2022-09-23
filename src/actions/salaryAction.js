import { ActionEvent, getActionSuccess } from './actionEvent'

export const getSalary = (filter) => ({
    type: ActionEvent.GET_SALARY, filter
})

export const getSalarySuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_SALARY),
    payload: { data }
})

export const getSalaryConfig = (filter) => ({
    type: ActionEvent.GET_SALARY_CONFIG,
    payload: { ...filter }
})

export const getSalaryConfigSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_SALARY_CONFIG),
    payload: { data }
})

export const getStaffSalary = (filter) => ({
    type: ActionEvent.GET_STAFF_SALARY, filter
})

export const getStaffSalarySuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_STAFF_SALARY),
    payload: { data }
})

export const getDetailTypeSalary = (filter) => ({
    type: ActionEvent.GET_DETAIL_TYPE_SALARY,
    filter
})

export const getDetailTypeSalarySuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_DETAIL_TYPE_SALARY),
    payload: { data }
})