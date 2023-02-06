import { createSlice } from '../../imports.js';

function getInitialState() {
    return {
        // server
        connectTryNumber: 0,
        connecting: false,
        connected: false,
        disconnected: false, // when first connected but then lost

        // when disconnected, then connected but session lost and need new clean connect
        // flag to call connect/reconnect janus-api
        newCleanConnect: false,

        // only when full connected but need the server and plugin reconnect
        // has some specific difference with newCleanConnect
        restoringConnect: false,

        connectFailed: false, // all tries failed, final stop
        // textRoom
        textRoomJoining: false, // attach -> setup -> join
        textRoomJoined: false, // all the steps are done
        textRoomFailed: false, // all tries failed
        textRoomDestroyed: false, // destroyed on server
        textRoomPinRequired: undefined,
        textRoomPinValue: undefined,
        textRoomJoiningWithPin: undefined,
        textRoomPinIncorrect: undefined,
        // videoRoom
        // common
        errors: [],
    }
}

export const janusSlice = createSlice({
    name: 'janus',
    initialState: getInitialState(),
    reducers: {
        tryConnect: (state, action) => {
            state.connecting = true;
            state.connectTryNumber = action.payload.connectTryNumber;
            if ('newCleanConnect' in action.payload) {
                state.newCleanConnect = action.payload.newCleanConnect;
            }
            if (state.disconnected) {
                state.restoringConnect = true;
            }
        },
        connected: (state) => {
            state.connecting = false;
            state.connected = true;
            state.disconnected = false;
        },
        disconnected: (state) => {
            state.connected = false;
            state.disconnected = true;
            state.textRoomJoining = false;
            state.textRoomJoined = false;
        },
        connectFailed: (state) => {
            state.connecting = false;
            state.connected = false;
            state.connectFailed = true;
        },
        tryTextRoomJoin: (state) => {
            state.textRoomFailed = false;
            state.textRoomJoined = false;
            state.textRoomJoining = true;
        },
        textRoomJoined: (state) => {
            state.textRoomJoining = false;
            state.textRoomJoiningWithPin = false;
            state.textRoomJoined = true;
            if (state.textRoomPinRequired) state.textRoomPinIncorrect = false;
            state.newCleanConnect = false; // new clean connect try finished here
            state.restoringConnect = false; // the restoration is finished
            state.errors = [];
        },
        textRoomFailed: (state) => {
            state.textRoomJoining = false;
            state.textRoomJoined = false;
            //state.textRoomJoiningWithPin = undefined;
            state.textRoomFailed = true;
        },
        textRoomDestroyed: (state) => {
            state.textRoomDestroyed = true;
        },
        addJanusError: (state, action) => {
            state.errors.push(action.payload);
        },

        setTextRoomPinRequired: (state, action) => {
            state.textRoomPinRequired = action.payload;
        },
        setTextRoomPinIncorrect: (state, action) => {
            state.textRoomPinIncorrect = action.payload;
        },
        setTextRoomPinValue: (state, action) => {
            state.textRoomPinValue = action.payload;
        },
        setTextRoomJoiningWithPin: (state, action) => {
            state.textRoomJoiningWithPin = action.payload;
        }
    },
});

export const {
    // server
    tryConnect,
    connected,
    disconnected,
    connectFailed,
    addJanusError,
    // textRoom plugin
    tryTextRoomJoin,
    textRoomJoined,
    textRoomFailed,
    textRoomDestroyed,
    setTextRoomPinRequired,
    setTextRoomPinValue,
    setTextRoomPinIncorrect,
    setTextRoomJoiningWithPin,
} = janusSlice.actions;

export default janusSlice.reducer;

// selectors
export const selectJanus = store => store.janus;

