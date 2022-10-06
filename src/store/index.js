import { applyMiddleware, createStore } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import combineEpic from '../epics/combineEpic';
import reducers from '../reducers';

const epicMiddleware = createEpicMiddleware(combineEpic);

export const store = createStore(
    reducers,
    {},
    applyMiddleware(epicMiddleware)
);
export default store;