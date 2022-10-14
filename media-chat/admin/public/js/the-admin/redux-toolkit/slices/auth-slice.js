import { createSlice } from '../../imports.js';
import { userGetMe } from '../actions/user-actions.js';
import { userLogin, userLogout, authRequired } from '../actions/auth-actions.js';


const initialState = {
    notInitialized: false, // notInitialized: true, // for the first time, when app loading
    pending: false,
    fulfilled: false,
    rejected: false,
    error: null, // error text
}

export const authSlice = createSlice({
    name: 'auth',
    initialState: { ...initialState, notInitialized: true },
    reducers: {
        setUser: (state, action) => {
            return { ...state, ...action.payload };
        },
        clearUser: () => {
            return { ...initialState };
        },
    },
    extraReducers: {
        [userGetMe.fulfilled]: (state, action) => {
            //console.log('authSlice, userGetMe.fulfilled', action)
            return { ...initialState, fulfilled: true };
        },
        // no need, replaces with authRequired
        /*[userGetMe.rejected]: (state, action) => {
            //console.log('authSlice, userGetMe.rejected', action)
            return { ...initialState };
        },*/
        [userLogin.pending]: (state, action) => {
            return { ...state, pending: true };
        },
        [userLogin.fulfilled]: (state, action) => {
            return { ...initialState, fulfilled: true };
        },
        [userLogin.rejected]: (state, action) => {
            //console.log('authSlice, userLogin.rejected', action)
            return { ...initialState, rejected: true, error: action.error.message };
        },
        [userLogout.fulfilled]: (state, action) => {
            //console.log('authSlice, userLogout.fulfilled', action)
            return { ...initialState, error: 'You are signed out' };
        },
        [authRequired]: (state, action) => {
            //console.log('authSlice, authRequired', action);
            return { ...initialState, /*error: 'Please sign in'*/ };
        }
    }
});

// Action creators are generated for each case reducer function
export const { setUser, clearUser } = authSlice.actions;

export default authSlice.reducer;
