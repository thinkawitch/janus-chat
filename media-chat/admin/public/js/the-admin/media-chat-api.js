import { mediaChatApiBaseUrl } from './config.js';


const fetchInit = {
    mode: 'cors',
    credentials: 'include', //'same-origin',
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
            console.log('data', data);
            if (data) {
                if ('id' in data) return data;
                if ('error' in data) return Promise.reject(data.error);
            }
            return Promise.reject('login_unknown_error');
        },
        logout: async () => {
            const response = await fetch(`${mediaChatApiBaseUrl}logout`, fetchInit);
            const data = await response.json();
            console.log('auth logout data', data);
        },
        isLoggedOut: async () => {
            const response = await fetch(`${mediaChatApiBaseUrl}is_logged_out`, fetchInit);
            const data = await response.json();
            console.log('auth isLoggedOut data', data);
        },
    },

    user: {
        getMe: async () => {
            const response = await fetch(`${mediaChatApiBaseUrl}me`, fetchInit);
            const data = await response.json();
            if (!data || 'is_logged_out' in data) {
                //throw new Error('is_logged_out');
                return Promise.reject('is_logged_out');
            }
            return data;
        },
    },


}

export default mediaChatApi;
