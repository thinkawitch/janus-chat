import { mediaChatApiBaseUrl } from './config.js';


const fetchInit = {
    mode: 'cors',
    credentials: 'same-origin',
}

const mediaChatApi = {

    auth: {
        isLoggedOut: async () => {
            const data = await fetch(`${mediaChatApiBaseUrl}is_logged_out`, fetchInit);
            console.log('auth isLoggedOut data', data);
        },
    },

    user: {
        getMe: async () => {
            const data = await fetch(`${mediaChatApiBaseUrl}me`, fetchInit);
            console.log('user getMe data', data);
        },
    },


}

export default mediaChatApi;
