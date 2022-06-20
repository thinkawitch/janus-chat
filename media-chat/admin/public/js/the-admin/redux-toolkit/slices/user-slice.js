import { createSlice } from '../../imports.js';
import { userIsLoggedOut } from '../actions/user-actions.js';

const initialState = {
    id: null,
    username: null,
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            return { ...state, ...action.payload };
        },
        clearUser: () => {
            return { ...initialState };
        },
        isLoggedOut: (state) => {

        }
    },
    extraReducers: {
        [userIsLoggedOut.fulfilled]: (state, action) => {
            console.log('extraReducers, userIsLoggedOut.fulfilled', action)
        }
    }
});

// Action creators are generated for each case reducer function
export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
