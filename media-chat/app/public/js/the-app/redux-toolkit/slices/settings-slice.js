import { createSlice } from '../../imports.js';

// app settings
const initialState = {
    showTime: true,
    showJoinLeave: true,
    cutLongUsername: true,
}

export const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        showTime: (state, action) => {
            state.showTime = action.payload;
        },
        showJoinLeave: (state, action) => {
            state.showJoinLeave = action.payload;
        },
        cutLongUsername: (state, action) => {
            state.cutLongUsername = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const { showTime, showJoinLeave, cutLongUsername } = settingsSlice.actions;

export default settingsSlice.reducer;

// selectors
export const selectSettings = state => state.settings;
