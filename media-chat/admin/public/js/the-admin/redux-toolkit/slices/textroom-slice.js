import { createSlice, createSelector, createDraftSafeSelector } from '../../imports.js';
//import { askExternalUser } from '../actions/users-actions.js';
import { textRoomGetAll, textRoomGet, textRoomCreate } from '../actions/textroom-actions.js';
import { userLogout } from '../actions/auth-actions.js';

// all text room, full objects from outside world
const initialState = {
    rooms: [],
    loading: false, // loading all
    loadingError: null,
    getting: false, // loading one
    gettingError: null,  // { status, title, detail }
    creating: false,
    updating: false,
    deleting: false,
    notInitialized: false,
}

export const textRoomSlice = createSlice({
    name: 'textRoom',
    initialState: { ...initialState, notInitialized: true },
    reducers: {
        addTextRoom: (state, action) => {
            //state.push(action.payload);
            //addOrUpdateUser(state, action.payload);
        },
        removeTextRoom: (state, action) => {
            return state.filter(u => u.id !== action.payload);
        },
        updateTextRoom: (state, action) => {

        },
        cleanTextRoom: (state) => {
            return { ...initialState };
        },
    },
    extraReducers: {
        [userLogout.fulfilled]: (state, action) => {
            // reset slice on user leave
            return { ...initialState, notInitialized: true };
        },
        [textRoomGetAll.pending]: (state, action) => {
            console.log('textRoomSlice textRoomGetAll.pending')
            //return { ...state, loading: true } // this makes hang-up
            state.loadingError = null;
            state.loading = true;
        },
        [textRoomGetAll.fulfilled]: (state, action) => {
            console.log('textRoomSlice textRoomGetAll.fulfilled')
            return { ...state, loading: false, loadingError: null, rooms: action.payload.rooms, notInitialized: false }
            // state.loading = false;
            // state.rooms = action.payload.rooms;
            // state.notInitialized = false;
        },
        [textRoomGetAll.rejected]: (state, action) => {
            console.log('textRoomSlice textRoomGetAll.rejected')
            state.loadingError = action.error;
            state.loading = false;
        },
        [textRoomGet.pending]: (state) => {
            state.gettingError = null;
            state.getting = true;
        },
        [textRoomGet.fulfilled]: (state, action) => {
            const room = action.payload.room;
            const roomIdx = state.rooms.findIndex(r => {
                if (r.id == room.id) return true;
            })
            if (roomIdx > -1) {
                // update
                state.rooms = state.rooms.map((el,idx) => idx === roomIdx ? room : el)
            } else {
                // add
                state.rooms.push(action.payload.room)
            }
            state.getting = false;
        },
        [textRoomGet.rejected]: (state, action) => {
            //console.log('textRoomSlice textRoomGet.rejected', action.error);
            if (action.payload === 'check_rwvError') {
                state.gettingError = action.meta.rwvError;
            }
            state.getting = false;
        },
        [textRoomCreate.pending]: (state, action) => {
            console.log('textRoomSlice textRoomCreate.pending')
            return { ...state, creating: true }
            //state.creating = true;
        },
        [textRoomCreate.fulfilled]: (state, action) => {
            console.log('textRoomSlice textRoomCreate.fulfilled')
            return { ...state, creating: false }
        },
        [textRoomCreate.rejected]: (state, action) => {
            console.log('textRoomSlice textRoomCreate.rejected')
            return { ...state, creating: false }
            //state.creating = false;
        },
    }
});

// Action creators are generated for each case reducer function
export const { addTextRoom, removeTextRoom, updateTextRoom, cleanTextRoom } = textRoomSlice.actions;

export default textRoomSlice.reducer;


// Export a reusable selectors

export const selectRooms = (state) => {
    return state.textRoom.rooms;
}

export const selectTextRoom = (state) => state.textRoom;

export const selectRoomsLoading = createSelector(selectTextRoom, textRoom => {
    console.log('[selector] selectRoomsLoading', textRoom.loading)
    return textRoom.loading
});


export const selectRoomById = createSelector(
    [
        state => state.textRoom.rooms,
        (_, roomId) => roomId,
    ],
    (rooms, roomId) => {
        let found = null;
        rooms.some(r => {
            //console.log('roomId', roomId, 'r', r)
            if (r.id == roomId) {
                found = r;
                return true;
            }
        })
        return found;
    }
);
