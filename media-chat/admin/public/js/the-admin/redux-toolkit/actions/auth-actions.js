import { createAction, createAsyncThunk } from '../../imports.js';
import mediaChatApi from '../../media-chat-api.js';


export const userLogin = createAsyncThunk(
    'user/login',
    async (arg, thunkAPI) => {
        const { username, password } = arg;
        return await mediaChatApi.auth.login(username, password);
    }
)

export const userLogout = createAsyncThunk(
    'user/logout',
    async (arg, thunkAPI) => {
        return await mediaChatApi.auth.logout();
    }
)

// when auth lost, should re-login
export const authRequired = createAction('user/authRequired');
