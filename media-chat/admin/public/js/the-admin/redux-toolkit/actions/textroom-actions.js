import { createAction, createAsyncThunk } from '../../imports.js';
import mediaChatApi from '../../media-chat-api.js';


export const textRoomGetAll = createAsyncThunk(
    'textRoom/getAll',
    async (arg, thunkAPI) => {
        return await mediaChatApi.textroom.getAll(thunkAPI);
    }, {
        condition: (arg, { getState, extra }) => {
            const { textRoom: { loading } } = getState();
            if (loading) console.log('textRoomGetAll will not start, already loading!')
            return !loading;
        }
    }
)

export const textRoomGet = createAsyncThunk(
    'textRoom/get',
    async (arg, thunkAPI) => {
        return await mediaChatApi.textroom.get(arg.roomId, thunkAPI);
    }
)

export const textRoomCreate = createAsyncThunk(
    'textRoom/create',
    async (args, thunkAPI) => {
        const { data, signal } = args;
        return await mediaChatApi.textroom.create(data, thunkAPI, signal);
    }
)

export const textRoomUpdate = createAsyncThunk(
    'textRoom/update',
    async (args, thunkAPI) => {
        const { roomId, data, signal } = args;
        return await mediaChatApi.textroom.update(roomId, data, thunkAPI, signal);
    }
)

export const textRoomDelete = createAsyncThunk(
    'textRoom/delete',
    async (arg, thunkAPI) => {
        return await mediaChatApi.textroom.delete(arg.roomId, thunkAPI);
    }
)


export const textRoomInfo = createAsyncThunk(
    'textRoom/info',
    async (arg, thunkAPI) => {
        return await mediaChatApi.textroom.info(thunkAPI);
    }
)

export const textRoomTestLongRequest = createAsyncThunk(
    'textRoom/testLongRequest',
    async (arg, thunkAPI) => {
        const signal = arg && arg.signal ? arg.signal : null // allow to abort
        const data = arg.data;

        return await mediaChatApi.test.get(signal);

        return await new Promise((resolve, reject) => {
            setTimeout(() => {
                reject({ });
                resolve({ });
            }, 5000)
        })
    }
)
