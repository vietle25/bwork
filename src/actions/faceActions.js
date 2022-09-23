import { ActionEvent, getActionSuccess } from './actionEvent'

export const createGroupFaceRecognize = (filter) => ({
    type: ActionEvent.CREATE_GROUP_FACE_RECOGNIZE,
    payload: { ...filter }
})

export const createGroupFaceRecognizeSuccess = data => ({
    type: getActionSuccess(ActionEvent.CREATE_GROUP_FACE_RECOGNIZE),
    payload: { data }
});

export const getGroupFaceRecognize = (personGroupId) => ({
    type: ActionEvent.GET_GROUP_FACE_RECOGNIZE,
    payload: { personGroupId }
})

export const getGroupFaceRecognizeSuccess = data => ({
    type: getActionSuccess(ActionEvent.GET_GROUP_FACE_RECOGNIZE),
    payload: { data }
});

export const trainingPersonGroup = (personGroupId) => ({
    type: ActionEvent.TRAINING_PERSON_GROUP,
    payload: { personGroupId }
})

export const trainingPersonGroupSuccess = data => ({
    type: getActionSuccess(ActionEvent.TRAINING_PERSON_GROUP),
    payload: { data }
});

export const deletePersonGroupPerson = (filter) => ({
    type: ActionEvent.DELETE_PERSON_GROUP_PERSON,
    payload: { ...filter }
})

export const deletePersonGroupPersonSuccess = data => ({
    type: getActionSuccess(ActionEvent.DELETE_PERSON_GROUP_PERSON),
    payload: { data }
});