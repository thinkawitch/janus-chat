import { createSlice } from '../../imports.js';
import { userLogin, userLogout, authRequired } from '../actions/auth-actions.js';
import { userGetMe, userUpdatePassword } from '../actions/user-actions.js';

const initialState = {
    id: null,
    username: null,
    updatingPassword: false,
    updatingPasswordError: null,
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        /*setUser: (state, action) => {
            return { ...state, ...action.payload };
        },
        clearUser: () => {
            return { ...initialState };
        },*/
        cleanUpdatingPasswordError: (state) => {
            state.updatingPasswordError = null;
        },
    },
    extraReducers: {
        [userGetMe.fulfilled]: (state, action) => {
            //console.log('userSlice, userGetMe.fulfilled', action)
            return { ...state, ...action.payload };
        },
        // replaced with authRequired
        /*[userGetMe.rejected]: (state, action) => {
            //console.log('userSlice, userGetMe.rejected', action)
            return { ...initialState };
        },*/
        [userLogin.fulfilled]: (state, action) => {
            return { ...state, ...action.payload };
        },
        [userLogout.fulfilled]: (state, action) => {
            //console.log('userSlice, userLogout.fulfilled', action)
            return { ...initialState };
        },
        [authRequired]: (state, action) => {
            //console.log('userSlice, authRequired', action)
            return { ...initialState };
        },
        [userUpdatePassword.pending]: (state, action) => {
            state.updatingPasswordError = null;
            state.updatingPassword = true;
        },
        [userUpdatePassword.fulfilled]: (state, action) => {
            state.updatingPassword = false;
        },
        [userUpdatePassword.rejected]: (state, action) => {
            if (action.payload === 'check_rwvError') {
                state.updatingPasswordError = action.meta.rwvError;
            }
            state.updatingPassword = false;
        },
    }
});

// Action creators are generated for each case reducer function
export const { cleanUpdatingPasswordError } = userSlice.actions;

export default userSlice.reducer;

export const selectUser = (state) => state.user;
