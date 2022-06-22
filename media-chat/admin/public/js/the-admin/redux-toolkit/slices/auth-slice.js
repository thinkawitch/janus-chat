import { createSlice } from '../../imports.js';
import { userGetMe } from '../actions/user-actions.js';
import { userLogin } from '../actions/auth-actions.js';


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
        isLoggedOut: (state) => {

        }
    },
    extraReducers: {
        [userGetMe.fulfilled]: (state, action) => {
            console.log('authSlice, userGetMe.fulfilled', action)
            return { ...initialState, fulfilled: true };
        },
        [userGetMe.rejected]: (state, action) => {
            console.log('authSlice, userGetMe.rejected', action)
            return { ...initialState };
        },
        [userLogin.pending]: (state, action) => {
            return { ...state, pending: true };
        },
        [userLogin.fulfilled]: (state, action) => {
            return { ...initialState, fulfilled: true };
        },
        [userLogin.rejected]: (state, action) => {
            console.log('authSlice, userLogin.rejected', action)
            return { ...initialState, rejected: true, error: action.error.message };
        },
    }
});

// Action creators are generated for each case reducer function
export const { setUser, clearUser } = authSlice.actions;

export default authSlice.reducer;
