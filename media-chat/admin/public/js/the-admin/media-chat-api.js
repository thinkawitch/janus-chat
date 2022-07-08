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
        throw rejectWithValue('check_rwvError', { rwvError: {status, title, detail} })
    }

    const data = await response.json();

    if (response.status === 404) {
        throw rejectWithValue('check_rwvError', { rwvError: data })
    }
    if (response.status === 500) {
        // symfony error as json
        throw rejectWithValue('check_rwvError', { rwvError: data })
    }

    return data;
}


const mediaChatApi = {

    auth: {
        login: async (username, password) => {
            const response = await fetch(`${mediaChatApiBaseUrl}login`, { ...fetchInit,
                method: 'POST',
                headers: {
                    ...fetchHeaderAccept,
                    ...fetchHeaderContentType,
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
            return await processResponse(response);
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
        create: async (signal, data) => {
            const localInit = {
                ...addSignalToFetchInit(fetchInit, signal),
                method: 'POST',
                headers: {
                    ...fetchHeaderAccept,
                    ...fetchHeaderContentType,
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
