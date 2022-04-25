import { configureStore } from '../imports.js';
import counterReducer from './slices/counter-slice.js';
import janusReducer from './slices/janus-slice.js';
import userReducer from './slices/user-slice.js';
import usersReducer from './slices/users-slice.js';
import textRoomReducer from './slices/text-room-slice.js';

export const store = configureStore({
    reducer: {
        //counter: counterReducer,
        janus: janusReducer,
        user: userReducer,  // me
        users: usersReducer, // all users
        textRoom: textRoomReducer, // textroom plugin
    }
});

