import { mediaChatApiBaseUrl } from './config.js';


const init = {
    mode: 'cors',
    credentials: 'same-origin',
}

const mediaChatApi = {
    isUserLoggedOut: async () => {
        const data = await fetch(`${mediaChatApiBaseUrl}is_logged_out`, init);
        console.log('isUserLoggedOut data', data);
    }
}

export default mediaChatApi;
