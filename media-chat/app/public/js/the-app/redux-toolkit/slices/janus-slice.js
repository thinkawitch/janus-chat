import { createSlice } from '../../imports.js';

function getInitialState() {
    return {
        connecting: true,
        connected: false,
        isReconnect: false,
        textRoomJoining: false,
        textRoomJoined: false,
        errors: [],
        reconnectLimitReached: false,
    }
}

export const janusSlice = createSlice({
    name: 'janus',
    initialState: getInitialState(),
    reducers: {
        tryConnect: () => {
            return getInitialState();
        },
        connected: (state) => {
            state.connecting = false;
            state.connected = true;
        },
        tryTextRoomJoin: (state) => {
            state.textRoomJoining = true;
        },
        textRoomJoined: (state) => {
            state.textRoomJoining = false;
            state.textRoomJoined = true;
        },
        tryReconnect: () => {
            return {...getInitialState(), isReconnect: true};
        },
        addJanusError: (state, action) => {
            state.errors.push(action.payload);
        },
        reconnectLimitReached: (state) => {
            state.reconnectLimitReached = true;
        },
    },
});

export const {
    tryConnect,
    connected,
    tryTextRoomJoin,
    textRoomJoined,
    tryReconnect,
    addJanusError,
    reconnectLimitReached,
} = janusSlice.actions;

export default janusSlice.reducer;
