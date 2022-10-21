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
        showTime: (value) => {
            dispatch(showTime(value));
        },
        showJoinLeave: (value) => {
            dispatch(showJoinLeave(value));
        },
        cutLongUsername: (value) => {
            dispatch(cutLongUsername(value));
        },
    }
}

export function getExternalUserResolver() {
    return userResolver;
}
