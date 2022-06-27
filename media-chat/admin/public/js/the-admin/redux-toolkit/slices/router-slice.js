import { createSlice } from '../../imports.js';

const initialState = {
    url: null,
    previous: null,
}

export const routerSlice = createSlice({
    name: 'router',
    initialState,
    reducers: {
        setCurrentRoute: (state, action) => {
            return { url: action.payload.url, previous: action.payload.previous };
        }
    }
});

// Action creators are generated for each case reducer function
export const { setCurrentRoute } = routerSlice.actions;

export default routerSlice.reducer;
