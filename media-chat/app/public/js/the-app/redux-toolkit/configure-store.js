import { configureStore } from '../imports.js';
import janusReducer from './slices/janus-slice.js';
import userReducer from './slices/user-slice.js';
import usersReducer from './slices/users-slice.js';
import textRoomReducer from './slices/text-room-slice.js';
import settingsReducer  from './slices/settings-slice.js';


const customLogMiddleWare = store => next => action => {
    console.log('middleware_:', action);
    next(action);
};

export const store = configureStore({
    reducer: {
        janus: janusReducer,
        user: userReducer,  // me
        users: usersReducer, // all users
        textRoom: textRoomReducer, // textroom plugin
        settings: settingsReducer,
    }
    //middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(customLogMiddleWare),
});

