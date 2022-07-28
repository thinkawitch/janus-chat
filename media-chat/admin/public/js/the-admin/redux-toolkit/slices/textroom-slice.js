import { createSlice, createSelector, createDraftSafeSelector } from '../../imports.js';
//import { askExternalUser } from '../actions/users-actions.js';
import {
    textRoomGetAll, textRoomGet, textRoomCreate, textRoomUpdate, textRoomDelete, textRoomInfo
} from '../actions/textroom-actions.js';
import { userLogout } from '../actions/auth-actions.js';

// all text room, full objects from outside world
const initialFilter = {description: ''};
const initialState = {
    rooms: [],
    loading: false, // loading all
    loadingError: null,
    getting: false, // loading one
    gettingError: null,  // { status, title, detail }
    creating: false,
    creatingError: null,
    updating: false,
    updatingError: null,
    deleting: false,
    notInitialized: false,
    filter: {...initialFilter},
    filteredRooms: [],
    info: {
        loading: false,
        totalRooms: 0,
        activeRooms: 0,
        deletedRooms: 0,
    },
}

export const textRoomSlice = createSlice({
    name: 'textRoom',
    initialState: { ...initialState, notInitialized: true },
    reducers: {
        cleanTextRoom: (state) => {
            return { ...initialState };
        },
        cleanCreatingError: (state) => {
            state.creatingError = null;
        },
        cleanUpdatingError: (state) => {
            state.updatingError = null;
        },
        setFilter: (state, action) => {
            state.filter = action.payload;
            state.filteredRooms = filterRooms(state.rooms, state.filter);
        },
        cleanFilter: (state, action) => {
            state.filter = {...initialFilter};
            state.filteredRooms = filterRooms(state.rooms, state.filter);
        },
    },
    extraReducers: {
        [userLogout.fulfilled]: (state, action) => {
            // reset slice on user leave
            return { ...initialState, notInitialized: true };
        },
        [textRoomGetAll.pending]: (state, action) => {
            //console.log('textRoomSlice textRoomGetAll.pending')
            state.loadingError = null;
            state.loading = true;
        },
        [textRoomGetAll.fulfilled]: (state, action) => {
            console.log('textRoomSlice textRoomGetAll.fulfilled')
            //return { ...state, loading: false, loadingError: null, rooms: action.payload.rooms, notInitialized: false }
            state.loading = false;
            state.loadingError = null;
            state.rooms = action.payload.rooms;
            state.filteredRooms = filterRooms(state.rooms, state.filter);
            state.notInitialized = false;
        },
        [textRoomGetAll.rejected]: (state, action) => {
            console.log('textRoomSlice textRoomGetAll.rejected')
            state.loadingError = action.error;
            state.loading = false;
        },
        [textRoomGet.pending]: (state) => {
            state.gettingError = null;
            state.getting = true;
        },
        [textRoomGet.fulfilled]: (state, action) => {
            const room = action.payload.room;
            const roomIdx = state.rooms.findIndex(r => {
                if (r.id == room.id) return true;
            })
            if (roomIdx > -1) {
                // update
                state.rooms = state.rooms.map((el,idx) => idx === roomIdx ? room : el)
            } else {
                // add
                state.rooms.push(action.payload.room)
            }
            state.filteredRooms = filterRooms(state.rooms, state.filter);
            state.getting = false;
        },
        [textRoomGet.rejected]: (state, action) => {
            //console.log('textRoomSlice textRoomGet.rejected', action.error);
            if (action.payload === 'check_rwvError') {
                state.gettingError = action.meta.rwvError;
            }
            state.getting = false;
        },
        [textRoomCreate.pending]: (state, action) => {
            state.creatingError = null;
            state.creating = true;
        },
        [textRoomCreate.fulfilled]: (state, action) => {
            console.log('textRoomSlice textRoomCreate.fulfilled')
            state.creating = false;
        },
        [textRoomCreate.rejected]: (state, action) => {
            console.log('textRoomSlice textRoomCreate.rejected')
            if (action.payload === 'check_rwvError') {
                state.creatingError = action.meta.rwvError;
            }
            state.creating = false;
        },
        [textRoomUpdate.pending]: (state, action) => {
            state.updatingError = null;
            state.updating = true;
        },
        [textRoomUpdate.fulfilled]: (state, action) => {
            console.log('textRoomSlice textRoomUpdate.fulfilled')
            //const roomId = action.payload.room;
            state.updating = false;
        },
        [textRoomUpdate.rejected]: (state, action) => {
            console.log('textRoomSlice textRoomUpdate.rejected')
            if (action.payload === 'check_rwvError') {
                state.updatingError = action.meta.rwvError;
            }
            state.updating = false;
        },
        [textRoomDelete.pending]: (state, action) => {
            state.deleting = true;
        },
        [textRoomDelete.fulfilled]: (state, action) => {
            const roomId = parseInt(action.meta.arg.roomId);
            state.rooms = state.rooms.filter(r => r.id !== roomId);
            state.filteredRooms = filterRooms(state.rooms, state.filter);
            state.deleting = false;
        },
        [textRoomDelete.rejected]: (state, action) => {
            state.deleting = false;
        },
        [textRoomInfo.pending]: (state, action) => {
            state.info.loading = true;
        },
        [textRoomInfo.fulfilled]: (state, action) => {
            state.info.loading = false;
            state.info.activeRooms = action.payload.active_rooms;
            state.info.totalRooms = action.payload.total_rooms;
            state.info.deletedRooms = action.payload.deleted_rooms;
        },
        [textRoomInfo.rejected]: (state, action) => {
            state.info.loading = false;
        },
    }
});

// Action creators are generated for each case reducer function
export const { cleanCreatingError, cleanUpdatingError, setFilter, cleanFilter } = textRoomSlice.actions;

export default textRoomSlice.reducer;


// Export a reusable selectors

export const selectRooms = (state) => {
    return state.textRoom.rooms;
}

export const selectTextRoom = (state) => state.textRoom;

export const selectRoomsLoading = createSelector(selectTextRoom, textRoom => {
    console.log('[selector] selectRoomsLoading', textRoom.loading)
    return textRoom.loading
});

export const selectTextRoomInfo = (state) => state.textRoom.info;


export const selectRoomById = createSelector(
    [
        state => state.textRoom.rooms,
        (_, roomId) => roomId,
    ],
    (rooms, roomId) => {
        let found = null;
        rooms.some(r => {
            //console.log('roomId', roomId, 'r', r)
            if (r.id == roomId) {
                found = r;
                return true;
            }
        })
        return found;
    }
);


function filterRooms(rooms, filter) {
    const { description } = filter;
    if (description.length < 1) return rooms.slice();
    const ld = description.toLowerCase();

    return rooms.filter(r => {
        return r.description?.toLowerCase().includes(ld);
    })
}
