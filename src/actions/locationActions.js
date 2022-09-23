import { ActionEvent, getActionSuccess } from './actionEvent';

export const getBranch = () => ({
    type: ActionEvent.GET_BRANCH
})

export const getBranchSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_BRANCH),
    payload: { data }
})

export const searchBranch = data => ({
    type: ActionEvent.SEARCH_BRANCH,
    payload: data
})

export const searchBranchSuccess = data => ({
    type: getActionSuccess(ActionEvent.SEARCH_BRANCH),
    payload: { data }
})

export const getMyLocation = (location, key) => ({
    type: ActionEvent.GET_MY_LOCATION,
    payload: { ...location, key }
})

export const getMyLocationSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_MY_LOCATION),
    payload: { data }
})