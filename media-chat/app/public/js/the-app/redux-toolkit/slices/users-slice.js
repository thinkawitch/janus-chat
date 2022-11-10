import { createSlice } from '../../imports.js';
import { askExternalUser } from '../actions/users-actions.js';
import { USER_STATUS_ONLINE, USER_STATUS_OFFLINE } from '../../constants.js';

// all app users, full objects from outside world
// {id, username, displayName, status:{online,offline}}
const initialState = [
    { username: 'User100', displayName: 'User 100', status: 'offline' },
    { username: 'User10_0', displayName: 'User 10 0', status: 'offline' },
    { username: 'User200', displayName: 'User 200', status: 'offline' },
    { username: 'User300', displayName: 'User 300', status: 'offline' },
    { username: 'User400', displayName: 'User 400', status: 'offline' },
    { username: 'User500', displayName: 'User 500', status: 'offline' },
    { username: 'User600', displayName: 'User 600', status: 'offline' },
    { username: 'User700', displayName: 'User 700', status: 'offline' },
];

export const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        addUser: (state, action) => {
            //state.push(action.payload);
            addOrUpdateUser(state, action.payload);
        },
        updateUser: (state, action) => {

        },
        setUserOnline: (state, action) => {
            const user = action.payload;
            state.some((u, idx) => {
                if (u.id === user.id) {
                    state[idx].status = USER_STATUS_ONLINE;
                    return true;
                }
            })
        },
        setUserOffline: (state, action) => {
            const user = action.payload;
            state.some((u, idx) => {
                if (u.id === user.id) {
                    state[idx].status = USER_STATUS_OFFLINE;
                    return true;
                }
            })
        },
        removeUser: (state, action) => {
            return state.filter(u => u.id !== action.payload);
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
export const { addUser, updateUser, setUserOnline, setUserOffline, removeUser, cleanUsers } = usersSlice.actions;

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

export const selectUsers = (state) => state.users;
export const selectUsersForMentionList = state => {
    const list =  [];
    const sortedUsers = sortUsers(state.users);
    sortedUsers.forEach(u => {
        list.push({ id: u.username, name: u.displayName });
    })
    return list;
}

function addOrUpdateUser(state, user) {
    const updated = state.some((u, idx) => {
        if (u.id === user.id) {
            state[idx] = { ...u, ...user };
            return true;
        }
    });
    if (!updated) {
        state.push({ ...user, status: USER_STATUS_OFFLINE });
    }
}

function sortBy (key) {
    return (a, b) => (a[key] > b[key]) ? 1 : ((b[key] > a[key]) ? -1 : 0);
}

export function sortUsers(users) {
    return users.concat().sort(sortBy('displayName'));
}
