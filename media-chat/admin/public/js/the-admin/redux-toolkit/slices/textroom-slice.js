import { createSlice } from '../../imports.js';
//import { askExternalUser } from '../actions/users-actions.js';
import { textRoomGetAll } from '../actions/textroom-actions.js';
import { userLogout } from '../actions/auth-actions.js';

// all text room, full objects from outside world
const initialState = {
    rooms: [],
    loading: false,
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
        }
    },
    extraReducers: {
        [userLogout.fulfilled]: (state, action) => {
            // reset slice on user leave
            return { ...initialState, notInitialized: true };
        },
        [textRoomGetAll.pending]: (state, action) => {
            console.log('textRoomSlice textRoomGetAll.pending')
            return { ...state, loading: true }
        },
        [textRoomGetAll.fulfilled]: (state, action) => {
            console.log('textRoomSlice textRoomGetAll.fulfilled')
            return { ...initialState, loading: false, rooms: action.payload.rooms }
        },
        [textRoomGetAll.rejected]: (state, action) => {
            console.log('textRoomSlice textRoomGetAll.rejected')
            return { ...state, loading: false }
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
