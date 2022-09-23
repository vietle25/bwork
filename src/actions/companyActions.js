import { ActionEvent, getActionSuccess } from './actionEvent';

export const getDashboardStatistical = (filter) => ({
    type: ActionEvent.GET_DASHBOARD_STATISTICAL,
    payload: { ...filter }
})

export const getDashboardStatisticalSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_DASHBOARD_STATISTICAL),
    payload: { data }
})

export const getListStaffDepartment = (filter) => ({
    type: ActionEvent.GET_LIST_STAFF_DEPARTMENT,
    payload: { ...filter }
})

export const getListStaffDepartmentSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_LIST_STAFF_DEPARTMENT),
    payload: { data }
})