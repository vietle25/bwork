import Navigation from 'actions/navigation'

const navReducer = (state, action) => {
    const newState = Navigation.router.getStateForAction(action, state)
    return newState || state
}

const rootReducer = combineReducers({
    nav: navReducer
})