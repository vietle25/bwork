import { createStore, applyMiddleware } from 'redux';
import reducers from '../reducers';
import { createEpicMiddleware } from 'redux-observable';
import combineEpic from '../epics/combineEpic';

const epicMiddleware = createEpicMiddleware(combineEpic);

export const store = createStore(
    reducers,
    {},
    applyMiddleware(epicMiddleware)
);
export default store;