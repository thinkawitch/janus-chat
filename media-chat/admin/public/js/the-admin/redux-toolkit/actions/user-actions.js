import { createAction, createAsyncThunk } from '../../imports.js';
import { selectUserByFrom } from '../slices/users-slice.js';
import mediaChatApi from '../../media-chat-api.js';


export const userGetMe = createAsyncThunk(
    'user/getMe',
    async (arg, thunkAPI) => {

        return await mediaChatApi.user.getMe();

        /*const found = selectUserByFrom(thunkAPI.getState(), username);
        if (found) {
            return thunkAPI.rejectWithValue('user_already_here');
        }

        const resolver = null; //getExternalUserResolver();
        if (resolver) {
            return await resolver(username);
        }

        return thunkAPI.rejectWithValue('no_external_user_resolver');*/
    }
)

export const userIsLoggedOut = createAsyncThunk(
    'user/isLoggedOut',
    async (arg, thunkAPI) => {

        return await mediaChatApi.auth.isLoggedOut();

        /*const found = selectUserByFrom(thunkAPI.getState(), username);
        if (found) {
            return thunkAPI.rejectWithValue('user_already_here');
        }

        const resolver = null; //getExternalUserResolver();
        if (resolver) {
            return await resolver(username);
        }

        return thunkAPI.rejectWithValue('no_external_user_resolver');*/
    }
)
