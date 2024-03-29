import { createAction, createAsyncThunk } from '../../imports.js';
import { getExternalUserResolver } from '../../external-api.js';
import { selectUserByFrom } from '../slices/users-slice.js';

export const askExternalUser = createAsyncThunk(
    'users/askExternalUserStatus',
    async (username, thunkAPI) => {

        const found = selectUserByFrom(thunkAPI.getState(), username);
        if (found) {
            return thunkAPI.rejectWithValue('user_already_here');
        }

        const resolver = getExternalUserResolver();
        if (resolver) {
            return await resolver(username);
        }

        return thunkAPI.rejectWithValue('no_external_user_resolver');
        //const response = await userAPI.fetchById(userId)
        //return response.data
    }
)
