import { createSlice, createSelector, createDraftSafeSelector } from '../../imports.js';
//import { askExternalUser } from '../actions/users-actions.js';
import { textRoomGetAll, textRoomCreate, textRoomActionOn, textRoomActionOff } from '../actions/textroom-actions.js';
import { userLogout } from '../actions/auth-actions.js';

// all text room, full objects from outside world
const initialState = {
    rooms: [],
    loading: false,
    creating: false,
    updating: false,
    deleting: false,
    notInitialized: false,
    action1:false,
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
            return { ...state, loading: true } // this makes hang-up
            //state.loading = true;
        },
        [textRoomGetAll.fulfilled]: (state, action) => {
            console.log('textRoomSlice textRoomGetAll.fulfilled')
            return { ...state, loading: false, rooms: action.payload.rooms, notInitialized: false }
            // state.loading = false;
            // state.rooms = action.payload.rooms;
            // state.notInitialized = false;
        },
        [textRoomGetAll.rejected]: (state, action) => {
            console.log('textRoomSlice textRoomGetAll.rejected')
            return { ...state, loading: false }
            //state.loading = false;
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
        [textRoomActionOn]: (state) => {
            console.log('slice textRoomActionOn')
            state.action1 = true;
        },
        [textRoomActionOff]: (state) => {
            console.log('slice textRoomActionOff')
            state.action1 = false;
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

const selectSelf = (state) => state.textRoom

export const selectRoomsLoading = createDraftSafeSelector(selectSelf, textRoom => {
    console.log('[selector] selectRoomsLoading', textRoom.loading)
    return textRoom.loading
});

