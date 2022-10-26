import { createAction, createAsyncThunk } from '../../imports.js';
import { getExternalUserResolver } from '../../external-api.js';
import { selectUserByFrom } from '../slices/users-slice.js';

//export const askExternalUser = createAction('test/synchronized/askExternalUser');

export const askExternalUser = createAsyncThunk(
    'users/askExternalUserStatus',
    async (username, thunkAPI) => {

        const found = selectUserByFrom(thunkAPI.getState(), username);
        if (found) {
            return thunkAPI.rejectWithValue('user_already_here');
        }

        const resolver = getExternalUserResolver();
        if (!resolver) {
            return thunkAPI.rejectWithValue('no_external_user_resolver');
        }

        return await resolver(username);
    }, {
        condition: (username, thunkAPI) => {
            const { usersRequests } = thunkAPI.getState();
            const fetchStatus = usersRequests[username];
            if (fetchStatus && fetchStatus === 'pending') {
                return false;
            }
        }
    }
)
