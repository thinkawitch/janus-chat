import { createAction, createAsyncThunk } from '../../imports.js';
import mediaChatApi from '../../media-chat-api.js';


export const textRoomGetAll = createAsyncThunk(
    'textRoom/getAll',
    async (arg, thunkAPI) => {
        return await mediaChatApi.textroom.getAll(thunkAPI.signal);
        //return await mediaChatApi.textroom.getAll();

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({ rooms: [] });
            }, 5000)
        })
    },
    /*{
        condition: (arg, { getState, extra }) => {
            const { textRoom: { loading } } = getState();
            if (loading) console.log('textRoomGetAll will not start, already loading!')
            return !loading;
        }
    }*/
)

export const textRoomCreate = createAsyncThunk(
    'textRoom/create',
    async (arg, thunkAPI) => {
        const signal = arg && arg.signal ? arg.signal : null // allow to abort
        const data = arg.data;

        return await mediaChatApi.test.get(signal);
        //return await mediaChatApi.textroom.getAll(signal);
        //return await mediaChatApi.textroom.create(signal, data);

        return await new Promise((resolve, reject) => {
            setTimeout(() => {
                reject({ });
                resolve({ });
            }, 5000)
        })
        //return await mediaChatApi.textroom.create(signal, data);
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

export const textRoomActionOn = createAction('textRoom/actionOn');
export const textRoomActionOff = createAction('textRoom/actionOff');
