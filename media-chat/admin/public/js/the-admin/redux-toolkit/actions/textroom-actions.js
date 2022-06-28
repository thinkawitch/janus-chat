import { createAction, createAsyncThunk } from '../../imports.js';
import mediaChatApi from '../../media-chat-api.js';


export const textroomGetAll = createAsyncThunk(
    'textroom/getAll',
    async (arg, thunkAPI) => {
        const signal = arg.signal // allow to abort
        return await mediaChatApi.textroom.getAll(signal);
    }
)
