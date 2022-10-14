import { createAction, createAsyncThunk } from '../../imports.js';
import mediaChatApi from '../../media-chat-api.js';


export const userGetMe = createAsyncThunk(
    'user/getMe',
    async (arg, thunkAPI) => {
        // try {
            const data = await mediaChatApi.user.getMe();
            console.log('userGetMe_data', data);
            return data;
        // } catch (error) {
        //     let errorText = 'user_get_me_unknown_error';
        //     return thunkAPI.rejectWithValue(error);
        // }
    }
);

export const userUpdatePassword = createAsyncThunk(
    'user/updatePassword',
    async (arg, thunkAPI) => {
        return await mediaChatApi.user.updatePassword(arg.fields, thunkAPI);
    }
);
