import { configureStore } from '../imports.js';
import userReducer from './slices/user-slice.js';
import usersReducer from './slices/users-slice.js';

export const store = configureStore({
    reducer: {
        user: userReducer,  // me
        users: usersReducer, // all users
    }
});

