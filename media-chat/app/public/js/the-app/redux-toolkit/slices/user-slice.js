import { createSlice } from '../../imports.js';

// full user, not janus textroom user
const initialState = {
    id: null,
    username: null,
    displayName: null,
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            return { ...state, ...action.payload };
        },
    },
});

// Action creators are generated for each case reducer function
export const { setUser } = userSlice.actions;

export default userSlice.reducer;

// selectors
export const selectUser = state => state.user;
