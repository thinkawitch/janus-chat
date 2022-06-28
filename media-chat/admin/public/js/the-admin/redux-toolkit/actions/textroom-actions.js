import { createAction, createAsyncThunk } from '../../imports.js';
import mediaChatApi from '../../media-chat-api.js';


export const textRoomGetAll = createAsyncThunk(
    'textRoom/getAll',
    async (arg, thunkAPI) => {
        const signal = arg && arg.signal ? arg.signal : null // allow to abort
        return await mediaChatApi.textroom.getAll(signal);
    }
)
