import { mediaChatApiBaseUrl } from './config.js';


const fetchInit = {
    mode: 'cors',
    credentials: 'include', //'same-origin',
}

let authRequiredHandler = null; // call when api says auth required, auth expired, etc


class MCError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}


function checkResponse(response) {
    console.log('checkResponse status', response.status, response);
    if (response.status === 401) {
        authRequiredHandler && authRequiredHandler();
        throw new Error('auth_required');
    }
    if (response.status >= 500) {
        try {
            throw new MCError('server_error33333333', 300);
        } catch (e) {
            console.log('e22222222222', e.status);
            throw e;
        }
    }
    if (response.headers.get('Content-Type') !== 'application/json') {
        throw new Error('json_required');
    }
}

function checkErrorData(data) {
    if (data.error) {
        throw new Error(data.message);
    }
}

const mediaChatApi = {

    auth: {
        login: async (username, password) => {
            const response = await fetch(`${mediaChatApiBaseUrl}login`, { ...fetchInit,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            console.log('mediaChatApi auth.login data', data);
            if (data) {
                if ('id' in data) return data;
                if ('error' in data) return Promise.reject(data.error);
            }
            return Promise.reject('login_unknown_error');
        },
        logout: async () => {
            const response = await fetch(`${mediaChatApiBaseUrl}logout`, fetchInit);
            const data = await response.json();
            //console.log('auth logout data', data);
            return data;
        },
        /*isLoggedOut: async () => {
            const response = await fetch(`${mediaChatApiBaseUrl}is_logged_out`, fetchInit);
            const data = await response.json();
            console.log('auth isLoggedOut data', data);
        },*/
    },

    user: {
        getMe: async () => {
            const response = await fetch(`${mediaChatApiBaseUrl}me`, fetchInit);
            //console.log('mediaChatApi user.getMe response.status', response.status);
            checkResponse(response);
            return await response.json();
        },
    },

    textroom: {
        getAll: async (signal) => {
            const localInit = addSignalToFetchInit(fetchInit, signal);
            const response = await fetch(`${mediaChatApiBaseUrl}textroom`, localInit);
            checkResponse(response);
            const data = await response.json();
            checkErrorData(data);
            return data;
        },
        get: async (signal, roomId) => {
            const localInit = addSignalToFetchInit(fetchInit, signal);
            const response = await fetch(`${mediaChatApiBaseUrl}textroom/${roomId}`, localInit);
            checkResponse(response);
            const data = await response.json();
            checkErrorData(data);
            return data;
        },
        create: async (signal, data) => {
            const localInit = {
                ...addSignalToFetchInit(fetchInit, signal),
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(data)
            };
            //console.log('create localInit', localInit);
            const response = await fetch(`${mediaChatApiBaseUrl}textroom`, localInit);
            checkResponse(response);
            return await response.json();
        },
    },

    test: {
        get: async (signal) => {
            const localInit = addSignalToFetchInit(fetchInit, signal);
            const response = await fetch(`${mediaChatApiBaseUrl}me?sleep=5`, localInit);
            checkResponse(response);
            return await response.json();
        }
    },

    setAuthRequiredHandler: (handler) => {
        authRequiredHandler = handler;
    }
}

export default mediaChatApi;


function addSignalToFetchInit(init, signal) {
    const localInit = { ...init };
    if (signal) localInit.signal = signal;
    return localInit;
}
