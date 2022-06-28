import { createSlice } from '../../imports.js';
//import { askExternalUser } from '../actions/users-actions.js';

// all text room, full objects from outside world
const initialState = []

export const textRoomSlice = createSlice({
    name: 'textRoom',
    initialState,
    reducers: {
        addTextRoom: (state, action) => {
            //state.push(action.payload);
            addOrUpdateUser(state, action.payload);
        },
        removeTextRoom: (state, action) => {
            return state.filter(u => u.id !== action.payload);
        },
        updateTextRoom: (state, action) => {

        },
        cleanTextRoom: (state) => {
            return [];
        }
    },
    /*extraReducers: {
        [askExternalUser.fulfilled]: (state, action) => {
            //state.push(action.payload);
            addOrUpdateUser(state, action.payload);
        }
    }*/
});

// Action creators are generated for each case reducer function
export const { addTextRoom, removeTextRoom, updateTextRoom, cleanTextRoom } = textRoomSlice.actions;

export default textRoomSlice.reducer;
