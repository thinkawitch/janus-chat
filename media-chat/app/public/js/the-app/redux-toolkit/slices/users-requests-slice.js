import { createSlice } from '../../imports.js';
import { askExternalUser } from '../actions/users-actions.js';

const initialState = {
    // username as a key
};

export const usersRequestsSlice = createSlice({
    name: 'usersRequests',
    initialState,
    reducers: {
        //
    },
    extraReducers: {
        [askExternalUser.pending]: (state, action) => {
            //console.log('askExternalUser.pending action', action)
            const username = action.meta.arg;
            state[username] = 'pending';
        },
        [askExternalUser.fulfilled]: (state, action) => {
            const username = action.meta.arg;
            delete state[username]; // all done, delete
        },
        [askExternalUser.rejected]: (state, action) => {
            const username = action.meta.arg;
            if (action.payload === 'user_already_here') {
                delete state[username];
            } else {
                state[username] = 'rejected';
            }
        }
    }
});

// Action creators are generated for each case reducer function
//export const {  } = usersSlice.actions;

export default usersRequestsSlice.reducer;

// Export a reusable selector here
