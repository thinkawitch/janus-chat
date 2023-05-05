import { showTime, showJoinLeave, cutLongUsername } from './redux-toolkit/slices/settings-slice.js';

let store = null;
let dispatch = null;

let userResolver = null;

export function startExternalApi(theStore) {
    store = theStore;
    dispatch = theStore.dispatch;

    return {
        setUserResolver: (handler) => {
            userResolver = handler;
        },
        setShowTime: (value) => {
            dispatch(showTime(value));
        },
        getShowTime: () => {
            return store.getState().settings.showTime;
        },
        setShowJoinLeave: (value) => {
            dispatch(showJoinLeave(value));
        },
        getShowJoinLeave: () => {
            return store.getState().settings.showJoinLeave;
        },
        setCutLongUsername: (value) => {
            dispatch(cutLongUsername(value));
        },
        getCutLongUsername: () => {
            return store.getState().settings.cutLongUsername;
        },
    }
}

export function getExternalUserResolver() {
    return userResolver;
}
