import { createSlice } from '../../imports.js';
import { askExternalUser } from '../actions/users-actions.js';

// all app users, full objects from outside world
const initialState = []

export const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        addUser: (state, action) => {
            //state.push(action.payload);
            addOrUpdateUser(state, action.payload);
        },
        removeUser: (state, action) => {
            return state.filter(u => u.id !== action.payload);
        },
        updateUser: (state, action) => {

        },
        cleanUsers: (state) => {
            state = [];
        }
    },
    extraReducers: {
        [askExternalUser.fulfilled]: (state, action) => {
            //state.push(action.payload);
            addOrUpdateUser(state, action.payload);
        }
    }
});

// Action creators are generated for each case reducer function
export const { addUser, updateUser, removeUser, cleanUsers } = usersSlice.actions;

export default usersSlice.reducer;


// Export a reusable selector here
export const selectUserByFrom = (state, from) => {
    let user = null;
    state.users.some(u => {
        if (u.username === from) {
            user = u;
            return true;
        }
    });
    return user;
}


function addOrUpdateUser(state, user) {
    const updated = state.some((u, idx) => {
        if (u.id === user.id) {
            state[idx] = {...u, ...user};
            return true;
        }
    });
    if (!updated) {
        state.push(user);
    }
}
