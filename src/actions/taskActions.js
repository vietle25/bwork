import { ActionEvent, getActionSuccess } from './actionEvent';
import { filter } from 'rxjs/operators';

export const getTask = filter => ({
    type: ActionEvent.GET_TASK,
    payload: { ...filter }
})

export const getTaskSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_TASK),
    payload: { data }
})

export const getTaskDetail = taskId => ({
    type: ActionEvent.GET_TASK_DETAIL,
    payload: { taskId }
})

export const getTaskDetailSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_TASK_DETAIL),
    payload: { data }
})

export const updateTask = filter => ({
    type: ActionEvent.UPDATE_TASK,
    payload: { ...filter }
})

export const updateTaskSuccess = data => ({
    type: getActionSuccess(ActionEvent.UPDATE_TASK),
    payload: { data }
})

export const updateTaskDetail = filter => ({
    type: ActionEvent.UPDATE_TASK_DETAIL,
    payload: { ...filter }
})

export const updateTaskDetailSuccess = data => ({
    type: getActionSuccess(ActionEvent.UPDATE_TASK_DETAIL),
    payload: { data }
})

export const getTaskTimeConfig = () => ({
    type: ActionEvent.GET_TASK_TIME_CONFIG
})

export const getTaskTimeConfigSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_TASK_TIME_CONFIG),
    payload: { data }
})
