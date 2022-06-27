import { createSlice } from '../../imports.js';
import { userLogin, userLogout, userIsLoggedOut } from '../actions/auth-actions.js';
import { userGetMe } from '../actions/user-actions.js';

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
            console.log('userSlice, userIsLoggedOut.fulfilled', action)
        },
        [userGetMe.fulfilled]: (state, action) => {
            console.log('userSlice, userGetMe.fulfilled', action)
            return { ...action.payload };
        },
        [userGetMe.rejected]: (state, action) => {
            console.log('userSlice, userGetMe.rejected', action)
            return { ...initialState };
        },
        [userLogin.fulfilled]: (state, action) => {
            return { ...action.payload };
        },
        [userLogout.fulfilled]: (state, action) => {
            console.log('userSlice, userLogout.fulfilled', action)
            return { ...initialState };
        },
    }
});

// Action creators are generated for each case reducer function
export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
