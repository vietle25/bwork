import { ActionEvent, getActionSuccess } from './actionEvent'

export const getGifTrending = filter => ({
    type: ActionEvent.GET_GIF_TRENDING,
    payload: { ...filter }
})

export const getGifTrendingSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_GIF_TRENDING),
    payload: { data }
});

export const searchGif = filter => ({
    type: ActionEvent.SEARCH_GIF,
    payload: { ...filter }
})

export const searchGifSuccess = data => ({
    type: getActionSuccess(ActionEvent.SEARCH_GIF),
    payload: { data }
});