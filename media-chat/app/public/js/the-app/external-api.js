
let store = null;
let dispatch = null;

let userResolver = null;

export function startExternalApi(theStore) {
    store = theStore;
    dispatch = theStore.dispatch;


    return {
        setUserResolver,
    }
}

function setUserResolver(handler) {
    userResolver = handler;
}


export function getExternalUserResolver() {
    return userResolver;
}
