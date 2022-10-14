import { configureStore/*, setupListeners*/ } from '../imports.js';
import authReducer from './slices/auth-slice.js';
import userReducer from './slices/user-slice.js';
import usersReducer from './slices/users-slice.js';
import textRoomReducer from './slices/textroom-slice.js';
//import { mediaChatApi } from './services/media-chat-api.js';

export const store = configureStore({
    reducer: {
        auth: authReducer,  // for login/logout process
        user: userReducer,  // me
        textRoom: textRoomReducer, // all text rooms
        users: usersReducer, // all users
    },
    //middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(mediaChatApi.middleware),
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
//setupListeners(store.dispatch);
