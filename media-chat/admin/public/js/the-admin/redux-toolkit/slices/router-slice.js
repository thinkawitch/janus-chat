import { createSlice } from '../../imports.js';

// not in use, changing the redux state inside Router:onChange leads to extra render

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
