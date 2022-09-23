import { ActionEvent, getActionSuccess } from './actionEvent';

export const getBanner = () => ({
    type: ActionEvent.GET_BANNER
})

export const getBannerSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_BANNER),
    payload: { data }
})