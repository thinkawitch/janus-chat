import { mediaChatApiBaseUrl } from './config.js';

const fetchHeaderAccept = {
    'Accept': 'application/json'
}
const fetchHeaderContentType = { 'Content-Type': 'application/json;charset=utf-8' }
const fetchInit = {
    mode: 'cors',
    credentials: 'include', //'same-origin',
    headers: {
        ...fetchHeaderAccept
    },
}

let authRequiredHandler = null; // call when api says auth required, auth expired, etc
let displayErrorHandler = null; // display toast with error

async function processResponse(response, rejectWithValue) {
    console.log('processResponse status', response.status);
    if (response.status === 401) {
        authRequiredHandler && authRequiredHandler();
        throw new Error('auth_required');
    }
    if (response.headers.get('Content-Type') !== 'application/json') {
        // symfony error as html
        const text = await response.text();
        const status = response.status;
        let title = 'unknown_html_error_title'
        let detail = 'unknown_html_error_detail';
        try {
            // case of dev.env format: long detail message (short title)
            detail = text.match(/<title[^>]*>([^<]+)<\/title>/i)[1];
            const lastBracket1 = detail.lastIndexOf('(');
            const lastBracket2 = detail.lastIndexOf(')');
            title = detail.substring(lastBracket1 + 1, lastBracket2);
        } catch (e) {}
        //throw new Error(JSON.stringify({status, title, detail}));
        displayErrorHandler && displayErrorHandler(detail);
        throw rejectWithValue('check_rwvError', { rwvError: {status, title, detail} })
    }

    const data = await response.json();

    if ([400, 403, 404, 405, 500].includes(response.status)) {
        // symfony error as json
        // api errors with symfony-like format
        displayErrorHandler && displayErrorHandler(data.detail);
        throw rejectWithValue('check_rwvError', { rwvError: data })
    }

    return data;
}


const mediaChatApi = {

    auth: {
        login: async (username, password) => {
            const localInit = {
                ...fetchInit,
                method: 'POST',
                headers: {
                    ...fetchHeaderAccept,
                    ...fetchHeaderContentType,
                },
                body: JSON.stringify({ username, password })
            };
            const response = await fetch(`${mediaChatApiBaseUrl}auth/login`, localInit);
            const data = await response.json();
            console.log('mediaChatApi auth.login data', data);
            if (data) {
                if ('id' in data) return data;
                if ('error' in data) return Promise.reject(data.error);
            };
            return Promise.reject('login_unknown_error');
        },
        logout: async () => {
            const response = await fetch(`${mediaChatApiBaseUrl}auth/logout`, fetchInit);
            const data = await response.json();
            //console.log('auth logout data', data);
            return data;
        },
        /*isLoggedOut: async () => {
            const response = await fetch(`${mediaChatApiBaseUrl}auth/is_logged_out`, fetchInit);
            const data = await response.json();
            console.log('auth isLoggedOut data', data);
        },*/
    },

    user: {
        getMe: async () => {
            const response = await fetch(`${mediaChatApiBaseUrl}me`, fetchInit);
            //console.log('mediaChatApi user.getMe response.status', response.status);
            return await processResponse(response);
        },
        updatePassword: async (data, thunkAPI, customSignal) => {
            const signal = customSignal ?? thunkAPI.signal;
            const localInit = {
                ...addSignalToFetchInit(fetchInit, signal),
                method: 'PUT',
                headers: {
                    ...fetchHeaderAccept,
                    ...fetchHeaderContentType,
                },
                body: JSON.stringify(data)
            };
            const response = await fetch(`${mediaChatApiBaseUrl}me/password`, localInit);
            return await processResponse(response, thunkAPI.rejectWithValue);
        },
    },

    textroom: {
        getAll: async (thunkAPI) => {
            const localInit = addSignalToFetchInit(fetchInit, thunkAPI.signal);
            const response = await fetch(`${mediaChatApiBaseUrl}textroom`, localInit);
            return await processResponse(response, thunkAPI.rejectWithValue);
        },
        get: async (roomId, thunkAPI) => {
            const localInit = addSignalToFetchInit(fetchInit, thunkAPI.signal);
            const response = await fetch(`${mediaChatApiBaseUrl}textroom/${roomId}`, localInit);
            return await processResponse(response, thunkAPI.rejectWithValue);
        },
        create: async (data, thunkAPI, customSignal) => {
            const signal = customSignal ?? thunkAPI.signal;
            const localInit = {
                ...addSignalToFetchInit(fetchInit, signal),
                method: 'POST',
                headers: {
                    ...fetchHeaderAccept,
                    ...fetchHeaderContentType,
                },
                body: JSON.stringify(data)
            };
            const response = await fetch(`${mediaChatApiBaseUrl}textroom`, localInit);
            return await processResponse(response, thunkAPI.rejectWithValue);
        },
        update: async (roomId, data, thunkAPI, customSignal) => {
            const signal = customSignal ?? thunkAPI.signal;
            const localInit = {
                ...addSignalToFetchInit(fetchInit, signal),
                method: 'PUT',
                headers: {
                    ...fetchHeaderAccept,
                    ...fetchHeaderContentType,
                },
                body: JSON.stringify(data)
            };
            const response = await fetch(`${mediaChatApiBaseUrl}textroom/${roomId}`, localInit);
            return await processResponse(response, thunkAPI.rejectWithValue);
        },
        delete: async (roomId, thunkAPI) => {
            const localInit = {
                ...addSignalToFetchInit(fetchInit, thunkAPI.signal),
                method: 'DELETE',
                headers: {
                    ...fetchHeaderAccept,
                }
            };
            const response = await fetch(`${mediaChatApiBaseUrl}textroom/${roomId}`, localInit);
            return await processResponse(response, thunkAPI.rejectWithValue);
        },
        info: async (thunkAPI) => {
            const localInit = addSignalToFetchInit(fetchInit, thunkAPI.signal);
            const response = await fetch(`${mediaChatApiBaseUrl}textroom/info`, localInit);
            return await processResponse(response, thunkAPI.rejectWithValue);
        },
    },

    test: {
        get: async (thunkAPI) => {
            const localInit = addSignalToFetchInit(fetchInit, thunkAPI.signal);
            const response = await fetch(`${mediaChatApiBaseUrl}me?sleep=5`, localInit);
            return await processResponse(response, thunkAPI.rejectWithValue);
        }
    },

    setAuthRequiredHandler: handler => {
        authRequiredHandler = handler;
    },

    setDisplayErrorHandler: handler => {
        displayErrorHandler = handler;
    }
}

export default mediaChatApi;


function addSignalToFetchInit(init, signal) {
    const localInit = { ...init };
    if (signal) localInit.signal = signal;
    return localInit;
}
