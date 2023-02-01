import { createAction, createAsyncThunk } from '../../imports.js';
import mediaChatApi from '../../media-chat-api.js';


export const getRooms = createAsyncThunk(
    'rooms/get-rooms',
    async (arg, thunkAPI) => {
        return await mediaChatApi.rooms.getAll(thunkAPI);
    }, {
        condition: (arg, { getState, extra }) => {
            const { rooms: { loading } } = getState();
            if (loading) console.log('roomsGetAll will not start, already loading!')
            return !loading;
        }
    }
)

export const getRoom = createAsyncThunk(
    'rooms/get-room',
    async (arg, thunkAPI) => {
        return await mediaChatApi.rooms.get(arg.roomId, thunkAPI);
    }
)

export const createRoom = createAsyncThunk(
    'rooms/create-room',
    async (args, thunkAPI) => {
        const { data, signal } = args;
        return await mediaChatApi.rooms.create(data, thunkAPI, signal);
    }
)

export const updateRoom = createAsyncThunk(
    'rooms/update-room',
    async (args, thunkAPI) => {
        const { roomId, data, signal } = args;
        return await mediaChatApi.rooms.update(roomId, data, thunkAPI, signal);
    }
)

export const deleteRoom = createAsyncThunk(
    'rooms/delete-room',
    async (arg, thunkAPI) => {
        return await mediaChatApi.rooms.delete(arg.roomId, thunkAPI);
    }
)

export const startRoom = createAsyncThunk(
    'rooms/start-room',
    async (args, thunkAPI) => {
        const { roomId, data, signal } = args;
        return await mediaChatApi.rooms.start(roomId, data, thunkAPI, signal);
    }
)

export const stopRoom = createAsyncThunk(
    'rooms/stop-room',
    async (args, thunkAPI) => {
        const { roomId, data, signal } = args;
        return await mediaChatApi.rooms.stop(roomId, data, thunkAPI, signal);
    }
)


export const getRoomsStats = createAsyncThunk(
    'rooms/get-stats',
    async (arg, thunkAPI) => {
        return await mediaChatApi.rooms.stats(thunkAPI);
    }
)

export const roomsTestLongRequest = createAsyncThunk(
    'rooms/test-long-request',
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
